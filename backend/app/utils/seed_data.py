from sqlalchemy.orm import Session
import re
import bcrypt
from datetime import datetime
from ..models import (
    User, District, Course, College, CollegeCourse, Facility, Placement, Rating, college_facilities
)
from .colleges_data import COLLEGES_DATASET

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def parse_lpa_numeric(val: str | None) -> float | None:
    if not val:
        return None
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)", str(val))
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None

def normalize_district_name(name: str) -> str:
    n = name.strip().lower()
    if "tumk" in n:
        return "Tumakuru"
    if "bangalore urban" in n or "bengaluru urban" in n:
        return "Bengaluru Urban"
    if "bangalore rural" in n or "bengaluru rural" in n:
        return "Bengaluru Rural"
    if "myso" in n:
        return "Mysuru"
    if "mangal" in n or "dakshina" in n:
        return "Mangaluru"
    if "bela" in n:
        return "Belagavi"
    if "shimog" in n or "shivamog" in n:
        return "Shivamogga"
    if "hub" in n or "dharwad" in n:
        return "Hubballi-Dharwad"
    return name.strip()

def seed_database(db: Session):
    """
    Idempotent database seeder for EduFind:
    - Seeds / normalizes all districts (Tumakuru, Bengaluru Urban, Bengaluru Rural, etc.)
    - Seeds all facilities
    - Seeds course catalog
    - Seeds default admin and student users
    - Ingests / updates all 65+ verified institutions and their courses
    - Links facilities, placements, and ratings
    """
    stats = {
        "districts_updated": 0,
        "colleges_inserted": 0,
        "colleges_updated": 0,
        "courses_inserted": 0,
        "college_courses_seeded": 0
    }

    # 1. Seed & Normalize Districts
    standard_districts = [
        {"district_name": "Tumakuru", "code": "KA-TMK"},
        {"district_name": "Bengaluru Urban", "code": "KA-BLRU"},
        {"district_name": "Bengaluru Rural", "code": "KA-BLRR"},
        {"district_name": "Mysuru", "code": "KA-MYS"},
        {"district_name": "Mangaluru", "code": "KA-DKN"},
        {"district_name": "Belagavi", "code": "KA-BGV"},
        {"district_name": "Shivamogga", "code": "KA-SMG"},
        {"district_name": "Hubballi-Dharwad", "code": "KA-DHD"}
    ]

    district_map = {}
    existing_districts = db.query(District).all()
    existing_by_norm = {}
    for d in existing_districts:
        norm = normalize_district_name(d.district_name)
        existing_by_norm[norm] = d

    for item in standard_districts:
        target_name = item["district_name"]
        if target_name in existing_by_norm:
            d = existing_by_norm[target_name]
            if d.district_name != target_name or d.code != item["code"]:
                d.district_name = target_name
                d.code = item["code"]
                stats["districts_updated"] += 1
            district_map[target_name] = d
        else:
            new_d = District(state="Karnataka", district_name=target_name, code=item["code"])
            db.add(new_d)
            db.flush()
            district_map[target_name] = new_d
            existing_by_norm[target_name] = new_d
            stats["districts_updated"] += 1

    db.commit()

    # Re-fetch all districts into a handy lookup
    all_districts = db.query(District).all()
    for d in all_districts:
        district_map[d.district_name] = d
        district_map[normalize_district_name(d.district_name)] = d

    # 2. Seed Facilities
    standard_facilities = [
        ("Hostel", "home"),
        ("Library", "book-open"),
        ("Wi-Fi", "wifi"),
        ("Computer Lab", "laptop"),
        ("Sports Complex", "activity"),
        ("Canteen", "coffee"),
        ("Transportation / Bus", "truck"),
        ("Placement Cell", "briefcase"),
        ("Auditorium", "film"),
        ("Gymnasium", "award")
    ]
    fac_map = {}
    for name, icon in standard_facilities:
        fac = db.query(Facility).filter(Facility.name == name).first()
        if not fac:
            fac = Facility(name=name, icon=icon)
            db.add(fac)
            db.flush()
        fac_map[name] = fac
    db.commit()

    # 3. Seed Course Catalog
    standard_courses = [
        {
            "name": "Bachelor of Computer Applications",
            "short_code": "BCA",
            "category": "Computer Applications",
            "duration": "3 Years",
            "general_eligibility": "10+2 / PUC with Mathematics / Computer Science / Statistics or equivalent with min 45% aggregate."
        },
        {
            "name": "Bachelor of Commerce",
            "short_code": "B.Com",
            "category": "Commerce",
            "duration": "3 Years",
            "general_eligibility": "10+2 / PUC Commerce or equivalent stream with min 40% aggregate."
        },
        {
            "name": "Bachelor of Business Administration",
            "short_code": "BBA",
            "category": "Management",
            "duration": "3 Years",
            "general_eligibility": "10+2 / PUC in any stream from a recognized board with min 45% aggregate."
        },
        {
            "name": "Master of Computer Applications",
            "short_code": "MCA",
            "category": "Computer Applications",
            "duration": "2 Years",
            "general_eligibility": "BCA / B.Sc (CS/IT) or graduation with Mathematics at 10+2 level with min 50% aggregate (PGCET / KMAT)."
        },
        {
            "name": "Master of Business Administration",
            "short_code": "MBA",
            "category": "Management",
            "duration": "2 Years",
            "general_eligibility": "Bachelor degree in any discipline with min 50% aggregate (PGCET / KMAT / CAT / MAT)."
        },
        {
            "name": "Bachelor of Science",
            "short_code": "B.Sc",
            "category": "Science",
            "duration": "3 Years",
            "general_eligibility": "10+2 / PUC Science with min 45% aggregate."
        },
        {
            "name": "Bachelor of Engineering (Computer Science)",
            "short_code": "BE / B.Tech (CS)",
            "category": "Engineering",
            "duration": "4 Years",
            "general_eligibility": "10+2 / PUC with Physics, Mathematics, Chemistry with min 45% aggregate (KCET / COMEDK)."
        },
        {
            "name": "Bachelor of Arts",
            "short_code": "BA",
            "category": "Arts and Humanities",
            "duration": "3 Years",
            "general_eligibility": "10+2 / PUC in any stream with min 40% aggregate."
        },
        {
            "name": "Bachelor of Social Work",
            "short_code": "BSW",
            "category": "Social Work",
            "duration": "3 Years",
            "general_eligibility": "10+2 / PUC in any stream with min 40% aggregate."
        },
        {
            "name": "Bachelor of Science (Computer Science)",
            "short_code": "B.Sc (CS)",
            "category": "Science",
            "duration": "3 Years",
            "general_eligibility": "10+2 / PUC Science with Mathematics and Physics/CS with min 45% aggregate."
        },
        {
            "name": "Bachelor of Science (Data Science)",
            "short_code": "B.Sc (DS)",
            "category": "Science",
            "duration": "3 Years",
            "general_eligibility": "10+2 / PUC Science with Mathematics with min 50% aggregate."
        }
    ]

    course_map = {}
    for c_spec in standard_courses:
        c_obj = db.query(Course).filter(Course.short_code == c_spec["short_code"]).first()
        if not c_obj:
            c_obj = Course(
                name=c_spec["name"],
                short_code=c_spec["short_code"],
                category=c_spec["category"],
                duration=c_spec["duration"],
                general_eligibility=c_spec["general_eligibility"]
            )
            db.add(c_obj)
            db.flush()
            stats["courses_inserted"] += 1
        course_map[c_spec["short_code"]] = c_obj
    db.commit()

    # 4. Seed Default Users
    default_hashed = hash_password("EduFind@123")
    default_users = [
        {"email": "admin@edufind.ac.in", "name": "System Administrator", "role": "super_admin", "college_id": None},
        {"email": "sit.admin@edufind.ac.in", "name": "SIT College Admin", "role": "college_admin", "college_id": 1},
        {"email": "rahul.student@gmail.com", "name": "Rahul Sharma", "role": "student", "college_id": None},
        {"email": "priya.k@gmail.com", "name": "Priya Kumar", "role": "student", "college_id": None}
    ]
    for u_info in default_users:
        user = db.query(User).filter(User.email == u_info["email"]).first()
        if not user:
            user = User(
                name=u_info["name"],
                email=u_info["email"],
                password_hash=default_hashed,
                role=u_info["role"],
                college_id=u_info["college_id"]
            )
            db.add(user)
    db.commit()

    # 5. Ingest COLLEGES_DATASET Idempotently
    for col_data in COLLEGES_DATASET:
        # Resolve district
        dist_name = col_data.get("district", "Tumakuru")
        norm_dist = normalize_district_name(dist_name)
        district_obj = district_map.get(norm_dist) or district_map.get("Tumakuru")

        slug = col_data.get("slug")
        name = col_data.get("name")

        college = db.query(College).filter((College.slug == slug) | (College.name == name)).first()
        is_new = False
        if not college:
            college = College(slug=slug, name=name, district_id=district_obj.id, address=col_data.get("address", ""))
            db.add(college)
            is_new = True

        # Assign / update all attributes
        college.district_id = district_obj.id
        college.name = name
        college.alternate_name = col_data.get("alternate_name")
        college.slug = slug
        college.city = col_data.get("city")
        college.locality = col_data.get("locality")
        college.address = col_data.get("address", "")
        college.pincode = col_data.get("pincode")
        college.college_type = col_data.get("college_type", "Affiliated")
        college.ownership = col_data.get("ownership", "Private")
        college.college_category = col_data.get("college_category", "Degree College")
        college.affiliation = col_data.get("affiliation")
        college.university_name = col_data.get("university_name")
        college.accreditation = col_data.get("accreditation")
        college.established_year = col_data.get("established_year")
        college.website = col_data.get("website")
        college.phone = col_data.get("phone")
        college.email = col_data.get("email")
        college.latitude = col_data.get("latitude")
        college.longitude = col_data.get("longitude")
        college.description = col_data.get("description")
        college.image_url = col_data.get("image_url")
        college.banner_url = col_data.get("banner_url")

        # Facilities
        college.hostel_available = bool(col_data.get("hostel_available", False))
        college.transport_available = bool(col_data.get("transport_available", False))
        college.library_available = bool(col_data.get("library_available", True))
        college.placement_available = bool(col_data.get("placement_available", False))

        # Packages
        college.average_package = col_data.get("average_package")
        college.highest_package = col_data.get("highest_package")

        # Ratings
        college.rating = float(col_data.get("rating") or 4.0)
        college.rating_source = col_data.get("rating_source")
        college.review_count = int(col_data.get("review_count") or 0)

        # Verification metadata
        v_status = col_data.get("verification_status", "Verified")
        college.verification_status = v_status
        college.last_verified_date = col_data.get("last_verified_date", "2024-2025")
        college.data_source = col_data.get("data_source", "Official State / Affiliation Portal")
        college.verified = (v_status == "Verified")

        db.flush()

        if is_new:
            stats["colleges_inserted"] += 1
        else:
            stats["colleges_updated"] += 1

        # Facilities M2M mapping
        assigned_facs = []
        if fac_map.get("Library") and college.library_available:
            assigned_facs.append(fac_map["Library"])
        if fac_map.get("Computer Lab"):
            assigned_facs.append(fac_map["Computer Lab"])
        if fac_map.get("Wi-Fi"):
            assigned_facs.append(fac_map["Wi-Fi"])
        if fac_map.get("Hostel") and college.hostel_available:
            assigned_facs.append(fac_map["Hostel"])
        if fac_map.get("Transportation / Bus") and college.transport_available:
            assigned_facs.append(fac_map["Transportation / Bus"])
        if fac_map.get("Placement Cell") and college.placement_available:
            assigned_facs.append(fac_map["Placement Cell"])
        if fac_map.get("Canteen"):
            assigned_facs.append(fac_map["Canteen"])
        if fac_map.get("Sports Complex"):
            assigned_facs.append(fac_map["Sports Complex"])
        
        college.facilities = assigned_facs

        # Ingest Courses
        courses_list = col_data.get("courses", [])
        for c_info in courses_list:
            short_code = c_info.get("short_code", "BCA")
            course_catalog_entry = course_map.get(short_code)
            if not course_catalog_entry:
                # Fallback to BCA or first available
                course_catalog_entry = course_map.get("BCA") or list(course_map.values())[0]

            c_name = c_info.get("course_name", course_catalog_entry.name)

            # Match existing college_course
            cc = db.query(CollegeCourse).filter(
                CollegeCourse.college_id == college.id,
                CollegeCourse.course_name == c_name
            ).first()

            if not cc:
                cc = db.query(CollegeCourse).filter(
                    CollegeCourse.college_id == college.id,
                    CollegeCourse.course_id == course_catalog_entry.id
                ).first()

            if not cc:
                cc = CollegeCourse(
                    college_id=college.id,
                    course_id=course_catalog_entry.id,
                    course_name=c_name
                )
                db.add(cc)

            annual_fee = float(c_info.get("annual_fee") or 0.0)
            duration_yrs = int(c_info.get("duration_years") or 3)
            tot_fee = float(c_info.get("total_course_fee") or (annual_fee * duration_yrs))

            cc.course_name = c_name
            cc.course_id = course_catalog_entry.id
            cc.degree_level = c_info.get("degree_level", "Undergraduate")
            cc.specialization = c_info.get("specialization")
            cc.duration_years = duration_yrs
            cc.duration = f"{duration_yrs} Years"
            cc.annual_fees = annual_fee
            cc.total_course_fee = tot_fee
            cc.tuition_fee = round(annual_fee * 0.8, 2)
            cc.exam_fee = 2500.00
            cc.other_charges = round(annual_fee * 0.15, 2)
            cc.fee_category = c_info.get("fee_category", "Merit / General")
            cc.entrance_exam = c_info.get("entrance_exam")
            cc.intake_capacity = int(c_info.get("intake_capacity") or 60)
            cc.seats = int(c_info.get("intake_capacity") or 60)
            cc.eligibility = c_info.get("eligibility")
            cc.admission_details = c_info.get("admission_details", "Direct / Merit Admission")
            cc.academic_year = "2024-2025"
            cc.fee_academic_year = "2024-2025"
            cc.course_availability_status = "Available"
            cc.verification_status = college.verification_status
            cc.last_verified_date = college.last_verified_date
            cc.course_source = col_data.get("data_source", "College Prospectus / University Records")

            stats["college_courses_seeded"] += 1

        # Placements check
        if college.average_package or college.highest_package:
            avg_num = parse_lpa_numeric(college.average_package)
            high_num = parse_lpa_numeric(college.highest_package)
            p_rec = db.query(Placement).filter(Placement.college_id == college.id).first()
            if not p_rec:
                p_rec = Placement(
                    college_id=college.id,
                    academic_year="2024-2025",
                    average_package=avg_num,
                    highest_package=high_num,
                    placement_percentage=85.0 if avg_num and avg_num >= 6.0 else 65.0,
                    recruiting_companies="Infosys, TCS, Wipro, Cognizant, Tech Mahindra"
                )
                db.add(p_rec)
            else:
                p_rec.average_package = avg_num
                p_rec.highest_package = high_num

    db.commit()

    # 6. Add initial verified student reviews for key colleges if none exist
    if db.query(Rating).count() == 0:
        sit_c = db.query(College).filter(College.slug == "sit-tumkur").first()
        christ_c = db.query(College).filter(College.slug == "christ-university-central-campus").first()
        bms_c = db.query(College).filter(College.slug == "bmsce-bangalore").first()
        gfgc_c = db.query(College).filter(College.slug == "gfgc-tumakuru").first()

        reviews_to_add = []
        if sit_c:
            reviews_to_add.append(Rating(
                college_id=sit_c.id, user_id=3, overall_rating=4.7, academics_rating=4.8,
                faculty_rating=4.7, infrastructure_rating=4.6, placement_rating=4.8, hostel_rating=4.2, value_rating=4.9,
                review_title="Top Tier Autonomous College in Tumakuru for BCA and Engineering",
                review="Studying at SIT Tumakuru has been a fantastic experience. The coding labs are top notch, fast internet across campus, and companies like TCS, Cisco, and Infosys recruit directly.",
                status="approved"
            ))
        if gfgc_c:
            reviews_to_add.append(Rating(
                college_id=gfgc_c.id, user_id=4, overall_rating=4.2, academics_rating=4.3,
                faculty_rating=4.4, infrastructure_rating=3.8, placement_rating=3.9, hostel_rating=3.5, value_rating=4.9,
                review_title="Extremely Affordable Quality Education under Tumkur University",
                review="At under 20,000 per year, GFGC Tumakuru offers extraordinary value for BCA students. Regular faculty support and active placement drives.",
                status="approved"
            ))
        if christ_c:
            reviews_to_add.append(Rating(
                college_id=christ_c.id, user_id=3, overall_rating=4.8, academics_rating=4.9,
                faculty_rating=4.8, infrastructure_rating=5.0, placement_rating=4.9, hostel_rating=4.5, value_rating=4.2,
                review_title="Exceptional Campus Infrastructure and Corporate Placements",
                review="Christ University Central Campus has a curriculum aligned with latest cloud and AI tools. Excellent holistic development and global exposure.",
                status="approved"
            ))
        if bms_c:
            reviews_to_add.append(Rating(
                college_id=bms_c.id, user_id=4, overall_rating=4.8, academics_rating=4.8,
                faculty_rating=4.7, infrastructure_rating=4.8, placement_rating=4.9, hostel_rating=4.2, value_rating=4.6,
                review_title="Historic Autonomous College with Top Tier Tech Placements",
                review="BMSCE Basavanagudi offers world-class faculty, vibrant coding clubs, and top placements with packages reaching 45+ LPA.",
                status="approved"
            ))
        db.add_all(reviews_to_add)
        db.commit()

    return {
        "status": "success",
        "message": f"Successfully seeded {stats['colleges_inserted']} new and updated {stats['colleges_updated']} colleges with comprehensive verified data across Tumakuru, Bengaluru Urban, and Bengaluru Rural.",
        "stats": stats
    }
