from sqlalchemy.orm import Session
import bcrypt
from ..models import User, District, Course, College, CollegeCourse, Facility, Placement, Rating, college_facilities

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def seed_database(db: Session):
    """Seed database with default Karnataka colleges, courses, districts, users and reviews if empty"""
    
    # Check if districts exist
    if db.query(District).count() > 0:
        return {"status": "already_seeded", "message": "Database already contains seed data."}

    # 1. Seed Districts
    districts_data = [
        District(id=1, state="Karnataka", district_name="Tumkur", code="KA-TMK"),
        District(id=2, state="Karnataka", district_name="Bangalore Urban", code="KA-BLR"),
        District(id=3, state="Karnataka", district_name="Mysore", code="KA-MYS"),
        District(id=4, state="Karnataka", district_name="Mangalore (Dakshina Kannada)", code="KA-DKN"),
        District(id=5, state="Karnataka", district_name="Belagavi", code="KA-BGV"),
        District(id=6, state="Karnataka", district_name="Shimoga", code="KA-SMG"),
        District(id=7, state="Karnataka", district_name="Hubli-Dharwad", code="KA-DHD")
    ]
    db.add_all(districts_data)
    db.commit()

    # 2. Seed Facilities
    facilities_data = [
        Facility(id=1, name="Hostel", icon="home"),
        Facility(id=2, name="Library", icon="book-open"),
        Facility(id=3, name="Wi-Fi", icon="wifi"),
        Facility(id=4, name="Computer Lab", icon="laptop"),
        Facility(id=5, name="Sports Complex", icon="activity"),
        Facility(id=6, name="Canteen", icon="coffee"),
        Facility(id=7, name="Transportation / Bus", icon="truck"),
        Facility(id=8, name="Placement Cell", icon="briefcase"),
        Facility(id=9, name="Auditorium", icon="film"),
        Facility(id=10, name="Gymnasium", icon="award")
    ]
    db.add_all(facilities_data)
    db.commit()

    # 3. Seed Courses
    courses_data = [
        Course(
            id=1, name="Bachelor of Computer Applications", short_code="BCA",
            category="Computer Applications", duration="3 Years",
            general_eligibility="10+2 / PUC with Mathematics / Computer Science / Statistics or equivalent with min 45% aggregate."
        ),
        Course(
            id=2, name="Bachelor of Commerce", short_code="B.Com",
            category="Commerce", duration="3 Years",
            general_eligibility="10+2 / PUC Commerce or equivalent stream with min 40% aggregate."
        ),
        Course(
            id=3, name="Bachelor of Business Administration", short_code="BBA",
            category="Management", duration="3 Years",
            general_eligibility="10+2 / PUC in any stream from a recognized board with min 45% aggregate."
        ),
        Course(
            id=4, name="Master of Computer Applications", short_code="MCA",
            category="Computer Applications", duration="2 Years",
            general_eligibility="BCA / B.Sc (CS/IT) or graduation with Mathematics at 10+2 level with min 50% aggregate (PGCET / KMAT)."
        ),
        Course(
            id=5, name="Master of Business Administration", short_code="MBA",
            category="Management", duration="2 Years",
            general_eligibility="Bachelor degree in any discipline with min 50% aggregate (PGCET / KMAT / CAT / MAT)."
        ),
        Course(
            id=6, name="Bachelor of Science (Computer Science)", short_code="B.Sc (CS)",
            category="Science", duration="3 Years",
            general_eligibility="10+2 / PUC Science with Mathematics and Physics/CS with min 45% aggregate."
        ),
        Course(
            id=7, name="Bachelor of Engineering (Computer Science)", short_code="BE / B.Tech (CS)",
            category="Engineering", duration="4 Years",
            general_eligibility="10+2 / PUC with Physics, Mathematics, Chemistry with min 45% aggregate (KCET / COMEDK)."
        ),
        Course(
            id=8, name="Bachelor of Science (Data Science)", short_code="B.Sc (DS)",
            category="Science", duration="3 Years",
            general_eligibility="10+2 / PUC Science with Mathematics with min 50% aggregate."
        )
    ]
    db.add_all(courses_data)
    db.commit()

    # 4. Seed Users
    # Default password for all seed accounts: "EduFind@123"
    default_hashed = hash_password("EduFind@123")
    users_data = [
        User(
            id=1, name="System Administrator", email="admin@edufind.ac.in",
            password_hash=default_hashed, role="super_admin"
        ),
        User(
            id=2, name="SIT College Admin", email="sit.admin@edufind.ac.in",
            password_hash=default_hashed, role="college_admin", college_id=1
        ),
        User(
            id=3, name="Rahul Sharma", email="rahul.student@gmail.com",
            password_hash=default_hashed, role="student"
        ),
        User(
            id=4, name="Priya Kumar", email="priya.k@gmail.com",
            password_hash=default_hashed, role="student"
        )
    ]
    db.add_all(users_data)
    db.commit()

    # 5. Seed Colleges
    colleges_data = [
        College(
            id=1, district_id=1, name="Siddaganga Institute of Technology (SIT)", slug="sit-tumkur",
            description="Siddaganga Institute of Technology is an autonomous engineering and computer applications institute in Tumkur established in 1963. Run by Sri Siddaganga Education Society, it offers top-tier BCA, MCA, and Engineering programs with stellar placement records.",
            address="B.H. Road, Gandhi Nagar, Tumkur, Karnataka 572103",
            college_type="Autonomous", established_year=1963,
            affiliation="Visvesvaraya Technological University (VTU)", accreditation="NAAC A++",
            website="http://www.sit.ac.in", phone="+91 816 2282696", email="principal@sit.ac.in",
            latitude=13.32890000, longitude=77.12650000,
            image_url="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
            verified=True
        ),
        College(
            id=2, district_id=1, name="Sri Siddhartha Institute of Management Studies (SSIMS)", slug="ssims-tumkur",
            description="SSIMS Tumkur is a premier private management institute part of Sri Siddhartha Academy of Higher Education (Deemed University). Providing exceptional MBA and BBA training with an active industry connection and smart digital labs.",
            address="Maralur, Kunigal Road, Tumkur, Karnataka 572105",
            college_type="Private", established_year=1997,
            affiliation="Sri Siddhartha Academy of Higher Education", accreditation="NAAC A",
            website="http://www.ssims.edu.in", phone="+91 816 2201073", email="info@ssims.edu.in",
            latitude=13.31500000, longitude=77.09800000,
            image_url="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
            verified=True
        ),
        College(
            id=3, district_id=1, name="Government First Grade College (GFGC), Tumkur", slug="gfgc-tumkur",
            description="GFGC Tumkur is a leading government institution providing affordable, quality education in BCA, B.Com, and B.Sc under Tumkur University. Known for experienced faculty, public scholarship aid, and accessible city campus.",
            address="Dr. B.R. Ambedkar Circle, Tumkur, Karnataka 572101",
            college_type="Government", established_year=1982,
            affiliation="Tumkur University", accreditation="NAAC B++",
            website="http://gfgc.kar.nic.in/tumkur", phone="+91 816 2278450", email="gfgctumkur@gmail.com",
            latitude=13.34010000, longitude=77.10250000,
            image_url="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
            verified=True
        ),
        College(
            id=4, district_id=1, name="Tumkur University - University College of Science & Arts", slug="tumkur-university",
            description="Tumkur University was established in 2004 to address higher education needs in Tumkur district. The university constituent colleges provide advanced BCA, MCA, and Science programs with central library facilities and research opportunities.",
            address="B.H. Road, Tumkur, Karnataka 572103",
            college_type="University", established_year=2004,
            affiliation="State University", accreditation="NAAC B",
            website="http://www.tumkuruniversity.ac.in", phone="+91 816 2254546", email="registrar@tumkuruniversity.ac.in",
            latitude=13.33200000, longitude=77.11800000,
            image_url="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1568792923760-d70635a89fa9?auto=format&fit=crop&w=1200&q=80",
            verified=True
        ),
        College(
            id=5, district_id=1, name="Vidya Vahini First Grade College", slug="vidya-vahini-tumkur",
            description="Vidya Vahini First Grade College in Tumkur offers dedicated undergraduate courses in BCA and B.Com with modern computer laboratories, language labs, and specialized placement training seminars.",
            address="Anandanagar, B.H. Road, Tumkur, Karnataka 572102",
            college_type="Private", established_year=2000,
            affiliation="Tumkur University", accreditation="NAAC B+",
            website="http://www.vidyavahini.org", phone="+91 816 2280590", email="vvfgc@gmail.com",
            latitude=13.35200000, longitude=77.10800000,
            image_url="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
            verified=True
        ),
        College(
            id=6, district_id=2, name="Christ (Deemed to be University), Bangalore", slug="christ-university-bangalore",
            description="A renowned multidisciplinary university in Bangalore offering nationally ranked BCA, BBA, B.Com, and MCA programs. Known for academic discipline, world-class infrastructure, and top campus placements.",
            address="Hosur Road, Bhavani Nagar, S.G. Palya, Bengaluru, Karnataka 560029",
            college_type="University", established_year=1969,
            affiliation="Deemed University (UGC)", accreditation="NAAC A+",
            website="https://www.christuniversity.in", phone="+91 80 40129100", email="mail@christuniversity.in",
            latitude=12.93440000, longitude=77.60590000,
            image_url="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
            verified=True
        ),
        College(
            id=7, district_id=2, name="BMS College of Engineering", slug="bmsce-bangalore",
            description="One of the oldest and most prestigious autonomous engineering and computer institutions in India, established in 1946 in Basavanagudi, Bangalore.",
            address="Bull Temple Road, Basavanagudi, Bengaluru, Karnataka 560019",
            college_type="Autonomous", established_year=1946,
            affiliation="VTU Belagavi", accreditation="NAAC A++",
            website="https://www.bmsce.ac.in", phone="+91 80 26622130", email="principal@bmsce.ac.in",
            latitude=12.94160000, longitude=77.56580000,
            image_url="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
            verified=True
        ),
        College(
            id=8, district_id=3, name="Maharajas College, University of Mysore", slug="maharajas-college-mysore",
            description="Historic constituent college of Mysore University established in 1889. Known for affordable tuition fees, experienced faculty, and rich heritage.",
            address="J.L.B. Road, Chamrajpura, Mysuru, Karnataka 570005",
            college_type="Government", established_year=1889,
            affiliation="University of Mysore", accreditation="NAAC A",
            website="http://maharajas.uni-mysore.ac.in", phone="+91 821 2419244", email="principal@maharajas.ac.in",
            latitude=12.30390000, longitude=76.64330000,
            image_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
            verified=True
        )
    ]
    db.add_all(colleges_data)
    db.commit()

    # 6. Seed College Courses with Detailed Fees
    college_courses_data = [
        # SIT Tumkur
        CollegeCourse(college_id=1, course_id=1, annual_fees=65000.00, tuition_fee=50000.00, exam_fee=3000.00, other_charges=12000.00, seats=60, duration="3 Years", eligibility="PUC/10+2 with min 50% in Maths/Statistics", admission_details="Merit based admission through SIT Entrance / Karnataka PUC Marks", academic_year="2025-2026"),
        CollegeCourse(college_id=1, course_id=4, annual_fees=85000.00, tuition_fee=65000.00, exam_fee=4000.00, other_charges=16000.00, seats=60, duration="2 Years", eligibility="BCA/B.Sc CS with 50% aggregate + PGCET rank", admission_details="KEA PGCET Counselling and Institutional quota", academic_year="2025-2026"),
        CollegeCourse(college_id=1, course_id=7, annual_fees=110000.00, tuition_fee=85000.00, exam_fee=5000.00, other_charges=20000.00, seats=180, duration="4 Years", eligibility="PUC with Physics, Maths, Chem with min 45%", admission_details="KCET / COMEDK Counselling", academic_year="2025-2026"),
        # SSIMS Tumkur
        CollegeCourse(college_id=2, course_id=3, annual_fees=50000.00, tuition_fee=40000.00, exam_fee=2500.00, other_charges=7500.00, seats=60, duration="3 Years", eligibility="PUC / 10+2 in any stream min 45%", admission_details="Direct application followed by personal interview", academic_year="2025-2026"),
        CollegeCourse(college_id=2, course_id=5, annual_fees=90000.00, tuition_fee=70000.00, exam_fee=4000.00, other_charges=16000.00, seats=120, duration="2 Years", eligibility="Graduate in any stream min 50% + KMAT/PGCET", admission_details="Karnataka KMAT / PGCET and SSAHE quota", academic_year="2025-2026"),
        # GFGC Tumkur
        CollegeCourse(college_id=3, course_id=1, annual_fees=18500.00, tuition_fee=12000.00, exam_fee=1500.00, other_charges=5000.00, seats=90, duration="3 Years", eligibility="PUC / 10+2 with min 45% aggregate", admission_details="State Government Merit Central Admission Portal (DCE Karnataka)", academic_year="2025-2026"),
        CollegeCourse(college_id=3, course_id=2, annual_fees=8500.00, tuition_fee=5000.00, exam_fee=1500.00, other_charges=2000.00, seats=180, duration="3 Years", eligibility="PUC Commerce min 40% aggregate", admission_details="Merit list generated on DCE Karnataka portal", academic_year="2025-2026"),
        CollegeCourse(college_id=3, course_id=6, annual_fees=12000.00, tuition_fee=8000.00, exam_fee=1500.00, other_charges=2500.00, seats=60, duration="3 Years", eligibility="PUC Science min 45% aggregate", admission_details="State Government Online Merit Application", academic_year="2025-2026"),
        # Tumkur University
        CollegeCourse(college_id=4, course_id=1, annual_fees=45000.00, tuition_fee=35000.00, exam_fee=2000.00, other_charges=8000.00, seats=60, duration="3 Years", eligibility="PUC / 10+2 with min 45% in CS or Maths", admission_details="University direct entrance / merit list", academic_year="2025-2026"),
        CollegeCourse(college_id=4, course_id=4, annual_fees=60000.00, tuition_fee=45000.00, exam_fee=3000.00, other_charges=12000.00, seats=40, duration="2 Years", eligibility="BCA/B.Sc degree min 50%", admission_details="PGCET Counselling / University quota", academic_year="2025-2026"),
        CollegeCourse(college_id=4, course_id=6, annual_fees=25000.00, tuition_fee=18000.00, exam_fee=2000.00, other_charges=5000.00, seats=50, duration="3 Years", eligibility="PUC Science min 45%", admission_details="Merit rank based seat allocation", academic_year="2025-2026"),
        # Vidya Vahini Tumkur
        CollegeCourse(college_id=5, course_id=1, annual_fees=38000.00, tuition_fee=30000.00, exam_fee=2000.00, other_charges=6000.00, seats=60, duration="3 Years", eligibility="PUC / 10+2 any stream min 45%", admission_details="Walk-in interview and registration with original marks cards", academic_year="2025-2026"),
        CollegeCourse(college_id=5, course_id=2, annual_fees=22000.00, tuition_fee=16000.00, exam_fee=2000.00, other_charges=4000.00, seats=80, duration="3 Years", eligibility="PUC Commerce / Arts min 40%", admission_details="Direct admission on first-come-first-served merit basis", academic_year="2025-2026"),
        # Christ Bangalore
        CollegeCourse(college_id=6, course_id=1, annual_fees=145000.00, tuition_fee=120000.00, exam_fee=5000.00, other_charges=20000.00, seats=120, duration="3 Years", eligibility="PUC / +2 with min 55% in Mathematics", admission_details="Christ University Entrance Test (CUET) + Micro Presentation + PI", academic_year="2025-2026"),
        CollegeCourse(college_id=6, course_id=3, annual_fees=165000.00, tuition_fee=135000.00, exam_fee=5000.00, other_charges=25000.00, seats=240, duration="3 Years", eligibility="PUC / +2 with min 60% in any stream", admission_details="CUET + Skill Assessment + Personal Interview", academic_year="2025-2026"),
        # BMSCE
        CollegeCourse(college_id=7, course_id=7, annual_fees=125000.00, tuition_fee=95000.00, exam_fee=5000.00, other_charges=25000.00, seats=240, duration="4 Years", eligibility="10+2 / PUC with Physics and Maths min 50%", admission_details="KEA KCET rank / COMEDK UGET counseling", academic_year="2025-2026"),
        # Maharajas College Mysore
        CollegeCourse(college_id=8, course_id=2, annual_fees=9500.00, tuition_fee=6000.00, exam_fee=1500.00, other_charges=2000.00, seats=120, duration="3 Years", eligibility="PUC / +2 min 45%", admission_details="Mysore University centralized admission portal", academic_year="2025-2026")
    ]
    db.add_all(college_courses_data)
    db.commit()

    # 7. Map Facilities to Colleges
    sit = db.query(College).filter(College.id == 1).first()
    gfgc = db.query(College).filter(College.id == 3).first()
    ssims = db.query(College).filter(College.id == 2).first()
    tu = db.query(College).filter(College.id == 4).first()
    vv = db.query(College).filter(College.id == 5).first()
    christ = db.query(College).filter(College.id == 6).first()
    bmsce = db.query(College).filter(College.id == 7).first()
    mysore = db.query(College).filter(College.id == 8).first()

    all_facs = db.query(Facility).all()
    sit.facilities = all_facs
    christ.facilities = all_facs
    bmsce.facilities = all_facs
    
    # SSIMS (Hostel, Lib, WiFi, Lab, Canteen, Placement, Aud)
    ssims.facilities = [f for f in all_facs if f.id in [1, 2, 3, 4, 6, 8, 9]]
    # GFGC (Library, Lab, Sports, Canteen, Placement)
    gfgc.facilities = [f for f in all_facs if f.id in [2, 4, 5, 6, 8]]
    # Tumkur University (Hostel, Lib, WiFi, Lab, Sports, Canteen, Placement, Aud)
    tu.facilities = [f for f in all_facs if f.id in [1, 2, 3, 4, 5, 6, 8, 9]]
    # Vidya Vahini (Lib, WiFi, Lab, Canteen, Bus, Placement)
    vv.facilities = [f for f in all_facs if f.id in [2, 3, 4, 6, 7, 8]]
    # Mysore Maharajas (Hostel, Lib, Lab, Sports, Canteen, Placement)
    mysore.facilities = [f for f in all_facs if f.id in [1, 2, 4, 5, 6, 8]]
    db.commit()

    # 8. Seed Placements
    placements_data = [
        Placement(college_id=1, academic_year="2024-2025", average_package=6.80, highest_package=28.50, placement_percentage=88.50, recruiting_companies="TCS, Infosys, Wipro, Cisco, Amazon, Mindtree, Cognizant, Robert Bosch, SLK Software"),
        Placement(college_id=2, academic_year="2024-2025", average_package=4.50, highest_package=9.80, placement_percentage=72.00, recruiting_companies="HDFC Bank, ICICI Securities, Muthoot Finance, Reliance Retail, Byjus"),
        Placement(college_id=3, academic_year="2024-2025", average_package=2.80, highest_package=4.50, placement_percentage=58.00, recruiting_companies="Infosys BPM, Wipro WILP, Concentrix, Local IT Solutions Tumkur"),
        Placement(college_id=4, academic_year="2024-2025", average_package=4.20, highest_package=8.00, placement_percentage=68.50, recruiting_companies="TCS Ignite, Tech Mahindra, Capgemini, SLK Software"),
        Placement(college_id=5, academic_year="2024-2025", average_package=3.20, highest_package=5.50, placement_percentage=62.00, recruiting_companies="Wipro, TCS, Karvy Stock Broking, Star Health"),
        Placement(college_id=6, academic_year="2024-2025", average_package=7.50, highest_package=22.00, placement_percentage=92.00, recruiting_companies="Deloitte, EY, Goldman Sachs, Microsoft, Infosys, Morgan Stanley"),
        Placement(college_id=7, academic_year="2024-2025", average_package=8.20, highest_package=36.00, placement_percentage=91.50, recruiting_companies="Google, Microsoft, Amazon, Cisco, Intel, Texas Instruments, Oracle"),
        Placement(college_id=8, academic_year="2024-2025", average_package=3.50, highest_package=6.00, placement_percentage=55.00, recruiting_companies="State Bank of India, Infosys, TVS Motors, Canara Bank")
    ]
    db.add_all(placements_data)
    db.commit()

    # 9. Seed Ratings
    ratings_data = [
        Rating(
            college_id=1, user_id=3, overall_rating=4.7, academics_rating=4.8,
            faculty_rating=4.7, infrastructure_rating=4.6, placement_rating=4.8,
            hostel_rating=4.2, value_rating=4.9,
            review_title="Top Tier College in Tumkur for BCA and Computer Sciences",
            review="Studying BCA at SIT Tumkur has been a fantastic experience. The coding labs are state of the art, high speed internet is available across campus, and companies like TCS, Cisco, and Infosys recruit directly.",
            status="approved"
        ),
        Rating(
            college_id=1, user_id=4, overall_rating=4.5, academics_rating=4.5,
            faculty_rating=4.4, infrastructure_rating=4.6, placement_rating=4.5,
            hostel_rating=4.0, value_rating=4.7,
            review_title="Great Placement Cell & Campus Life",
            review="The placement training starts from the 4th semester with aptitude and coding rounds. Hostel food is decent and library has more than 1 lakh books with digital IEEE access.",
            status="approved"
        ),
        Rating(
            college_id=3, user_id=3, overall_rating=4.1, academics_rating=4.2,
            faculty_rating=4.3, infrastructure_rating=3.8, placement_rating=3.7,
            hostel_rating=3.5, value_rating=4.9,
            review_title="Extremely Affordable with Good Faculty Guidance",
            review="At under 20,000 per year, GFGC Tumkur offers extraordinary value for BCA students. Teachers take classes regularly and guide for government exams as well as IT recruitment drives.",
            status="approved"
        ),
        Rating(
            college_id=6, user_id=4, overall_rating=4.8, academics_rating=4.9,
            faculty_rating=4.8, infrastructure_rating=5.0, placement_rating=4.9,
            hostel_rating=4.5, value_rating=4.2,
            review_title="Exceptional Professional Exposure and Projects",
            review="Christ University BCA syllabus is continuously updated to match cloud computing, AI, and full-stack development trends. Great extracurricular exposure and corporate placements.",
            status="approved"
        )
    ]
    db.add_all(ratings_data)
    db.commit()

    return {"status": "success", "message": "Database successfully seeded with realistic colleges, courses, and reviews!"}
