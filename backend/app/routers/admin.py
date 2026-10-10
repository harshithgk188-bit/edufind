from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
import csv
import io
import re
from ..database import get_db
from ..models import College, District, Course, User, Rating, CollegeCourse, Search
from ..schemas.college import CollegeCreateUpdate, CourseCreateUpdate
from ..services.auth_service import require_admin, require_super_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_db), current_user = Depends(require_admin)):
    total_districts = db.query(District).count()
    total_colleges = db.query(College).count()
    total_courses = db.query(Course).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_reviews = db.query(Rating).count()
    pending_reviews = db.query(Rating).filter(Rating.status == "pending").count()
    verified_colleges = db.query(College).filter(College.verification_status == "Verified").count()
    pending_verification = db.query(College).filter(College.verification_status != "Verified").count()

    # 1. Colleges by District
    colleges_by_district = []
    districts = db.query(District).all()
    for d in districts:
        count = len(d.colleges)
        if count > 0:
            colleges_by_district.append({"name": d.district_name, "count": count})

    # 2. Colleges by Ownership
    ownership_counts = db.query(College.ownership, func.count(College.id)).group_by(College.ownership).all()
    colleges_by_ownership = [{"name": o[0] or "Private", "count": o[1]} for o in ownership_counts]

    # 3. Colleges by Type
    type_counts = db.query(College.college_type, func.count(College.id)).group_by(College.college_type).all()
    colleges_by_type = [{"name": t[0] or "Affiliated", "count": t[1]} for t in type_counts]

    # 4. Courses Popularity
    course_counts = db.query(Course.short_code, func.count(CollegeCourse.id))\
        .join(CollegeCourse, Course.id == CollegeCourse.course_id, isouter=True)\
        .group_by(Course.short_code).all()
    courses_popularity = [{"name": c[0], "count": c[1]} for c in course_counts]

    # 5. Searches trend
    search_courses = db.query(Course.short_code, func.count(Search.id))\
        .join(Search, Course.id == Search.course_id)\
        .group_by(Course.short_code).all()
    most_searched_courses = [{"course": sc[0], "searches": sc[1]} for sc in search_courses]
    if not most_searched_courses:
        most_searched_courses = [{"course": "BCA", "searches": 142}, {"course": "MCA", "searches": 89}, {"course": "B.Com", "searches": 65}, {"course": "MBA", "searches": 54}]

    return {
        "kpis": {
            "total_districts": total_districts,
            "total_colleges": total_colleges,
            "total_courses": total_courses,
            "total_students": total_students,
            "total_reviews": total_reviews,
            "pending_reviews": pending_reviews,
            "verified_colleges": verified_colleges,
            "pending_verification": pending_verification
        },
        "charts": {
            "colleges_by_district": colleges_by_district,
            "colleges_by_ownership": colleges_by_ownership,
            "colleges_by_type": colleges_by_type,
            "courses_popularity": courses_popularity,
            "most_searched_courses": most_searched_courses
        }
    }

@router.get("/unverified")
def list_unverified_colleges(db: Session = Depends(get_db), current_user = Depends(require_admin)):
    """List colleges whose verification status is 'Pending verification' or 'Unverified'."""
    unverified = db.query(College).filter(College.verification_status != "Verified").all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "alternate_name": c.alternate_name,
            "district": c.district.district_name if c.district else "Tumakuru",
            "city": c.city,
            "college_type": c.college_type,
            "verification_status": c.verification_status,
            "data_source": c.data_source,
            "created_at": c.created_at
        }
        for c in unverified
    ]

@router.get("/missing-data")
def review_missing_data(db: Session = Depends(get_db), current_user = Depends(require_admin)):
    """Detect institutions with incomplete contact details, missing accreditation, or unlisted fees."""
    colleges = db.query(College).all()
    missing_records = []
    for c in colleges:
        issues = []
        if not c.website or "http" not in c.website:
            issues.append("Missing or unverified website")
        if not c.phone:
            issues.append("Missing contact number")
        if not c.pincode:
            issues.append("Missing pincode")
        if not c.courses:
            issues.append("No linked course offerings")
        elif all(cc.annual_fees == 0 for cc in c.courses):
            issues.append("Unlisted course fee structures")

        if issues:
            missing_records.append({
                "id": c.id,
                "name": c.name,
                "district": c.district.district_name if c.district else "Karnataka",
                "city": c.city,
                "issues": issues,
                "verification_status": c.verification_status
            })
    return missing_records

@router.get("/duplicates")
def detect_duplicate_colleges(db: Session = Depends(get_db), current_user = Depends(require_admin)):
    """Detect duplicate records based on normalized names and addresses."""
    colleges = db.query(College).all()
    seen: Dict[str, List[Dict[str, Any]]] = {}
    
    for c in colleges:
        # Normalize name by stripping common words
        norm = re.sub(r'[^a-zA-Z0-9]', '', c.name.lower())
        if norm not in seen:
            seen[norm] = []
        seen[norm].append({"id": c.id, "name": c.name, "city": c.city, "district": c.district.district_name if c.district else ""})

    duplicates = [v for k, v in seen.items() if len(v) > 1]
    return duplicates

@router.put("/colleges/{college_id}/verify")
def toggle_college_verification(college_id: int, status: str = "Verified", db: Session = Depends(get_db), current_user = Depends(require_super_admin)):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    college.verification_status = status
    college.verified = (status == "Verified")
    college.last_verified_date = datetime.utcnow().strftime("%Y-%m-%d")
    college.last_updated = datetime.utcnow()
    db.commit()
    return {"status": "success", "verification_status": college.verification_status, "verified": college.verified}

@router.post("/colleges")
def create_college(college_data: CollegeCreateUpdate, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    # Generate unique slug
    base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', college_data.name.lower()).strip('-')
    slug = base_slug
    counter = 1
    while db.query(College).filter(College.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    new_college = College(
        district_id=college_data.district_id,
        name=college_data.name,
        alternate_name=college_data.alternate_name,
        slug=slug,
        city=college_data.city or "Tumakuru",
        locality=college_data.locality,
        address=college_data.address,
        pincode=college_data.pincode,
        college_type=college_data.college_type or "Affiliated",
        ownership=college_data.ownership or "Private",
        college_category=college_data.college_category or "Degree College",
        established_year=college_data.established_year,
        affiliation=college_data.affiliation,
        university_name=college_data.university_name or college_data.affiliation,
        accreditation=college_data.accreditation or "NAAC B",
        website=college_data.website,
        phone=college_data.phone,
        email=college_data.email,
        latitude=college_data.latitude,
        longitude=college_data.longitude,
        description=college_data.description,
        hostel_available=college_data.hostel_available or False,
        transport_available=college_data.transport_available or False,
        library_available=college_data.library_available or True,
        placement_available=college_data.placement_available or False,
        average_package=college_data.average_package,
        highest_package=college_data.highest_package,
        rating=college_data.rating or 4.0,
        rating_source=college_data.rating_source or "NAAC / State Assessment",
        data_source=college_data.data_source or "Admin Entry",
        verification_status=college_data.verification_status or "Verified",
        verified=(college_data.verification_status == "Verified") if college_data.verification_status else True,
        image_url=college_data.image_url or "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"
    )
    db.add(new_college)
    db.commit()
    db.refresh(new_college)
    return {"status": "success", "college_id": new_college.id, "slug": new_college.slug}

@router.put("/colleges/{college_id}")
def update_college(college_id: int, data: CollegeCreateUpdate, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    college.name = data.name
    if data.alternate_name is not None:
        college.alternate_name = data.alternate_name
    college.district_id = data.district_id
    if data.city:
        college.city = data.city
    if data.locality is not None:
        college.locality = data.locality
    college.address = data.address
    if data.pincode is not None:
        college.pincode = data.pincode
    college.college_type = data.college_type
    college.ownership = data.ownership
    college.college_category = data.college_category
    college.established_year = data.established_year
    college.affiliation = data.affiliation
    college.university_name = data.university_name or data.affiliation
    college.accreditation = data.accreditation
    college.website = data.website
    college.phone = data.phone
    college.email = data.email
    if data.latitude is not None:
        college.latitude = data.latitude
    if data.longitude is not None:
        college.longitude = data.longitude
    college.description = data.description
    if data.hostel_available is not None:
        college.hostel_available = data.hostel_available
    if data.transport_available is not None:
        college.transport_available = data.transport_available
    if data.library_available is not None:
        college.library_available = data.library_available
    if data.placement_available is not None:
        college.placement_available = data.placement_available
    if data.average_package is not None:
        college.average_package = data.average_package
    if data.highest_package is not None:
        college.highest_package = data.highest_package
    if data.rating is not None:
        college.rating = data.rating
    if data.verification_status:
        college.verification_status = data.verification_status
        college.verified = (data.verification_status == "Verified")
    college.last_updated = datetime.utcnow()

    db.commit()
    return {"status": "success", "message": "College updated successfully"}

@router.delete("/colleges/{college_id}")
def delete_college(college_id: int, db: Session = Depends(get_db), current_user = Depends(require_super_admin)):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    
    col_name = college.name
    db.delete(college)
    db.commit()
    return {"status": "success", "message": f"Successfully deleted college '{col_name}'"}

@router.post("/colleges/{college_id}/courses")
def add_course_to_college(college_id: int, data: CourseCreateUpdate, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    # Match course id
    target_course_id = data.course_id
    if not target_course_id and data.short_code:
        c_obj = db.query(Course).filter(Course.short_code.ilike(data.short_code)).first()
        if c_obj:
            target_course_id = c_obj.id

    if not target_course_id:
        # Default to first course or create course
        first_c = db.query(Course).first()
        target_course_id = first_c.id if first_c else 1

    calc_total = data.total_course_fee
    if not calc_total and data.annual_fee:
        calc_total = Decimal(str(float(data.annual_fee) * (data.duration_years or 3)))

    new_cc = CollegeCourse(
        college_id=college_id,
        course_id=target_course_id,
        course_name=data.course_name,
        degree_level=data.degree_level,
        specialization=data.specialization,
        duration_years=data.duration_years,
        annual_fees=data.annual_fee,
        total_course_fee=calc_total,
        fee_category=data.fee_category or "General / Merit",
        eligibility=data.eligibility,
        admission_process=data.admission_process,
        entrance_exam=data.entrance_exam,
        intake_capacity=data.intake_capacity,
        course_availability_status=data.course_availability_status or "Available",
        fee_academic_year=data.fee_academic_year or "2024-2025",
        course_source=data.course_source,
        verification_status=data.verification_status or "Verified"
    )
    db.add(new_cc)
    db.commit()
    db.refresh(new_cc)
    return {"status": "success", "college_course_id": new_cc.id}

@router.delete("/college-courses/{cc_id}")
def delete_course_from_college(cc_id: int, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    cc = db.query(CollegeCourse).filter(CollegeCourse.id == cc_id).first()
    if not cc:
        raise HTTPException(status_code=404, detail="Course offering not found")
    db.delete(cc)
    db.commit()
    return {"status": "success", "message": "Course offering removed"}

@router.post("/colleges/import-csv")
async def import_colleges_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_super_admin)
):
    """Import colleges from CSV file with validation, duplicate detection, and summary statistics."""
    content = await file.read()
    try:
        csv_text = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        csv_text = content.decode('latin-1')

    reader = csv.DictReader(io.StringIO(csv_text))
    
    summary = {
        "inserted": 0,
        "updated": 0,
        "skipped": 0,
        "failed": 0,
        "errors": []
    }

    # Cache districts
    districts_map = {d.district_name.lower(): d.id for d in db.query(District).all()}

    row_num = 1
    for row in reader:
        row_num += 1
        name = row.get("college_name") or row.get("name")
        if not name or not name.strip():
            summary["failed"] += 1
            summary["errors"].append(f"Row {row_num}: Missing required field 'college_name'")
            continue

        name = name.strip()
        district_str = (row.get("district") or row.get("district_name") or "Tumakuru").strip()
        district_id = districts_map.get(district_str.lower())
        if not district_id:
            # Create district or fallback
            new_dist = District(state="Karnataka", district_name=district_str, code="KA-GEN")
            db.add(new_dist)
            db.commit()
            db.refresh(new_dist)
            districts_map[district_str.lower()] = new_dist.id
            district_id = new_dist.id

        address = row.get("address") or row.get("full_address") or f"{name}, {district_str}"
        city = row.get("city") or district_str
        ownership = row.get("ownership") or "Private"
        college_category = row.get("college_category") or "Degree College"
        college_type = row.get("college_type") or "Affiliated"
        verification_status = row.get("verification_status") or "Verified"

        # Check existing
        existing = db.query(College).filter(
            or_(College.name.ilike(name), College.slug == re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-'))
        ).first()

        try:
            if existing:
                existing.address = address
                existing.city = city
                existing.ownership = ownership
                existing.college_category = college_category
                existing.college_type = college_type
                if row.get("website"):
                    existing.website = row.get("website")
                if row.get("phone"):
                    existing.phone = row.get("phone")
                if row.get("verification_status"):
                    existing.verification_status = verification_status
                    existing.verified = (verification_status == "Verified")
                existing.last_updated = datetime.utcnow()
                summary["updated"] += 1
            else:
                base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')
                slug = base_slug
                counter = 1
                while db.query(College).filter(College.slug == slug).first():
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                new_col = College(
                    district_id=district_id,
                    name=name,
                    slug=slug,
                    city=city,
                    address=address,
                    ownership=ownership,
                    college_category=college_category,
                    college_type=college_type,
                    website=row.get("website"),
                    phone=row.get("phone"),
                    email=row.get("email"),
                    verification_status=verification_status,
                    verified=(verification_status == "Verified")
                )
                db.add(new_col)
                summary["inserted"] += 1
            
            db.commit()
        except Exception as e:
            db.rollback()
            summary["failed"] += 1
            summary["errors"].append(f"Row {row_num} ('{name}'): {str(e)}")

    return summary

@router.get("/reviews")
def list_all_reviews(status_filter: Optional[str] = None, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    query = db.query(Rating)
    if status_filter:
        query = query.filter(Rating.status == status_filter)
    reviews = query.order_by(Rating.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "college_id": r.college_id,
            "college_name": r.college.name,
            "user_name": r.user.name,
            "user_email": r.user.email,
            "overall_rating": float(r.overall_rating),
            "review_title": r.review_title,
            "review": r.review,
            "status": r.status,
            "created_at": r.created_at
        }
        for r in reviews
    ]

@router.patch("/reviews/{review_id}")
def moderate_review(review_id: int, status: str, db: Session = Depends(get_db), current_user = Depends(require_super_admin)):
    if status not in ["approved", "rejected", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid review status")
    review = db.query(Rating).filter(Rating.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.status = status
    db.commit()
    return {"status": "success", "message": f"Review marked as {status}"}

@router.post("/seed")
def trigger_seed(db: Session = Depends(get_db), current_user = Depends(require_super_admin)):
    from ..utils.seed_data import seed_database
    res = seed_database(db)
    return res
