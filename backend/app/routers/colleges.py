from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional, Union, Dict, Any
from decimal import Decimal
from ..database import get_db
from ..models import College, Course, District, Facility, CollegeCourse, Rating, Placement, Search
from ..schemas.college import (
    CollegeCardSchema,
    CollegeDetailResponse,
    CourseDetailSchema,
    FacilitySchema,
    PlacementSchema,
    PaginatedCollegesResponse
)
from ..services.auth_service import get_optional_current_user

router = APIRouter(prefix="/colleges", tags=["Colleges"])

@router.get("/meta")
def get_colleges_metadata(db: Session = Depends(get_db)):
    """Return dynamic metadata for search filters (cities, categories, ownerships, districts)."""
    districts = db.query(District).all()
    categories = [r[0] for r in db.query(College.college_category).distinct().filter(College.college_category.isnot(None)).all()]
    ownerships = [r[0] for r in db.query(College.ownership).distinct().filter(College.ownership.isnot(None)).all()]
    college_types = [r[0] for r in db.query(College.college_type).distinct().filter(College.college_type.isnot(None)).all()]
    
    # Group cities by district
    cities_by_district: Dict[str, List[str]] = {}
    for d in districts:
        cities = [
            r[0] for r in db.query(College.city)
            .filter(College.district_id == d.id, College.city.isnot(None))
            .distinct().all()
        ]
        cities_by_district[d.district_name] = sorted([c for c in cities if c])

    return {
        "categories": sorted(categories),
        "ownerships": sorted(ownerships),
        "college_types": sorted(college_types),
        "cities_by_district": cities_by_district
    }

@router.get("/search", response_model=Union[List[CollegeCardSchema], PaginatedCollegesResponse])
def search_colleges(
    response: Response,
    district_id: Optional[int] = None,
    district: Optional[str] = None,
    city: Optional[str] = None,
    locality: Optional[str] = None,
    college_category: Optional[str] = None,
    ownership: Optional[str] = None,
    college_type: Optional[str] = None,
    course: Optional[str] = None,
    q: Optional[str] = None,
    min_rating: Optional[float] = None,
    fee_type: Optional[str] = "annual", # annual or total
    fee_range: Optional[str] = None, # under_25k, 25k_50k, 50k_100k, above_100k
    hostel: Optional[bool] = None,
    transport: Optional[bool] = None,
    library: Optional[bool] = None,
    placement: Optional[bool] = None,
    verification_status: Optional[str] = None, # Verified, Pending verification, all
    facilities: Optional[List[str]] = Query(None),
    sort_by: Optional[str] = "rating", # rating, fees_asc, fees_desc, name
    page: Optional[int] = None,
    page_size: Optional[int] = None,
    db: Session = Depends(get_db),
    user = Depends(get_optional_current_user)
):
    # Log search query into analytics
    try:
        user_id = user.id if user else None
        target_course_id = None
        if course and course != "All":
            c_obj = db.query(Course).filter(or_(Course.short_code.ilike(course), Course.name.ilike(course))).first()
            if c_obj:
                target_course_id = c_obj.id

        search_record = Search(
            user_id=user_id,
            district_id=district_id,
            course_id=target_course_id,
            search_keyword=q or course
        )
        db.add(search_record)
        db.commit()
    except Exception:
        db.rollback()

    query = db.query(College)

    # 1. District filter
    if district_id:
        query = query.filter(College.district_id == district_id)
    elif district and district != "All":
        query = query.join(College.district).filter(District.district_name.ilike(f"%{district}%"))

    # 2. City / Taluk filter
    if city and city != "All":
        query = query.filter(College.city.ilike(f"%{city}%"))

    # 3. Locality filter
    if locality and locality != "All":
        query = query.filter(College.locality.ilike(f"%{locality}%"))

    # 4. Category filter
    if college_category and college_category != "All":
        query = query.filter(College.college_category.ilike(f"%{college_category}%"))

    # 5. Ownership filter (Government, Government-aided, Private, University)
    if ownership and ownership != "All":
        query = query.filter(College.ownership.ilike(f"%{ownership}%"))

    # 6. College Type filter (Autonomous, Affiliated, etc.)
    if college_type and college_type != "All":
        query = query.filter(College.college_type.ilike(f"%{college_type}%"))

    # 7. Verification Status filter
    if verification_status and verification_status != "all":
        query = query.filter(College.verification_status == verification_status)

    # 8. Facility flags
    if hostel is True:
        query = query.filter(College.hostel_available == True)
    if transport is True:
        query = query.filter(College.transport_available == True)
    if library is True:
        query = query.filter(College.library_available == True)
    if placement is True:
        query = query.filter(College.placement_available == True)

    # 9. Free-text Search Query
    if q and q.strip():
        search_kw = f"%{q.strip()}%"
        search_filter = or_(
            College.name.ilike(search_kw),
            College.alternate_name.ilike(search_kw),
            College.city.ilike(search_kw),
            College.locality.ilike(search_kw),
            College.address.ilike(search_kw),
            College.affiliation.ilike(search_kw),
            College.university_name.ilike(search_kw),
            College.description.ilike(search_kw)
        )
        query = query.filter(search_filter)

    colleges = query.all()
    filtered_results: List[CollegeCardSchema] = []

    for c in colleges:
        # Check course requirement
        courses_offered_codes = [cc.course.short_code for cc in c.courses if cc.course]
        courses_offered_names = [cc.course_name or (cc.course.name if cc.course else "") for cc in c.courses]

        if course and course != "All":
            course_lower = course.lower().strip()
            matched_course = False
            for cc in c.courses:
                c_code = (cc.course.short_code if cc.course else "").lower()
                c_name = (cc.course_name or (cc.course.name if cc.course else "")).lower()
                c_spec = (cc.specialization or "").lower()
                if (course_lower == c_code or 
                    course_lower in c_code or 
                    course_lower in c_name or 
                    course_lower in c_spec):
                    matched_course = True
                    break
            if not matched_course:
                continue

        # Calculate annual & total fees
        annual_fees_list = [float(cc.annual_fees) for cc in c.courses if cc.annual_fees is not None]
        total_fees_list = [
            float(cc.total_course_fee) for cc in c.courses 
            if cc.total_course_fee is not None and cc.total_course_fee > 0
        ]
        
        min_annual_fee = min(annual_fees_list) if annual_fees_list else 0.0
        min_total_fee = min(total_fees_list) if total_fees_list else (min_annual_fee * 3.0)

        # Apply fee range filtering based on selected fee_type
        eval_fee = min_total_fee if fee_type == "total" else min_annual_fee

        if fee_range and fee_range != "all":
            if fee_range == "under_25k" and eval_fee >= 25000:
                continue
            elif fee_range == "25k_50k" and not (25000 <= eval_fee <= 50000):
                continue
            elif fee_range == "50k_100k" and not (50000 <= eval_fee <= 100000):
                continue
            elif fee_range == "above_100k" and eval_fee < 100000:
                continue

        # Rating evaluation
        approved_ratings = [float(r.overall_rating) for r in c.ratings if r.status == "approved"]
        if approved_ratings:
            avg_rating = round(sum(approved_ratings) / len(approved_ratings), 1)
            review_count = len(approved_ratings)
            rating_source = "Student Reviews"
        else:
            avg_rating = float(c.rating) if c.rating else 4.0
            review_count = c.review_count or 0
            rating_source = c.rating_source or "NAAC / State Assessment"

        if min_rating and avg_rating < min_rating:
            continue

        # Specific facilities filter (Hostel, Wi-Fi, Library, Labs, etc.)
        if facilities:
            college_fac_names = [f.name.lower() for f in c.facilities]
            match_all_facs = all(any(req_fac.lower() in fn for fn in college_fac_names) for req_fac in facilities)
            if not match_all_facs:
                continue

        card = CollegeCardSchema(
            id=c.id,
            college_id=c.id,
            name=c.name,
            alternate_name=c.alternate_name,
            slug=c.slug,
            district_id=c.district_id,
            district_name=c.district.district_name if c.district else "Karnataka",
            city=c.city or "Tumakuru",
            locality=c.locality,
            address=c.address,
            pincode=c.pincode,
            college_type=c.college_type,
            ownership=c.ownership or "Private",
            college_category=c.college_category or "Degree College",
            university_name=c.university_name or c.affiliation,
            accreditation=c.accreditation or "NAAC B",
            image_url=c.image_url,
            verified=c.verified,
            verification_status=c.verification_status or "Verified",
            last_updated=c.last_updated,
            last_verified_date=c.last_verified_date,
            overall_rating=avg_rating,
            rating_source=rating_source,
            review_count=review_count,
            min_fees=Decimal(str(min_annual_fee)) if min_annual_fee > 0 else None,
            min_total_fee=Decimal(str(min_total_fee)) if min_total_fee > 0 else None,
            courses_offered=list(dict.fromkeys(courses_offered_codes)),
            hostel_available=c.hostel_available,
            transport_available=c.transport_available,
            library_available=c.library_available,
            placement_available=c.placement_available,
            average_package=c.average_package,
            highest_package=c.highest_package
        )
        filtered_results.append(card)

    # Sorting
    if sort_by == "rating":
        filtered_results.sort(key=lambda x: x.overall_rating, reverse=True)
    elif sort_by == "fees_asc":
        filtered_results.sort(key=lambda x: float(x.min_fees or 999999))
    elif sort_by == "fees_desc":
        filtered_results.sort(key=lambda x: float(x.min_fees or 0), reverse=True)
    elif sort_by == "name":
        filtered_results.sort(key=lambda x: x.name)

    total_count = len(filtered_results)
    response.headers["X-Total-Count"] = str(total_count)

    # If pagination parameters requested
    if page is not None and page_size is not None and page_size > 0:
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_items = filtered_results[start_idx:end_idx]
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
        return PaginatedCollegesResponse(
            items=paginated_items,
            total=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    return filtered_results

@router.get("/{id_or_slug}", response_model=CollegeDetailResponse)
def get_college_details(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        college = db.query(College).filter(College.id == int(id_or_slug)).first()
    else:
        college = db.query(College).filter(College.slug == id_or_slug).first()

    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    approved_ratings = [float(r.overall_rating) for r in college.ratings if r.status == "approved"]
    if approved_ratings:
        avg_rating = round(sum(approved_ratings) / len(approved_ratings), 1)
        rev_count = len(approved_ratings)
        r_source = "Student Reviews"
    else:
        avg_rating = float(college.rating) if college.rating else 4.0
        rev_count = college.review_count or 0
        r_source = college.rating_source or "NAAC / State Assessment"

    # Map courses
    courses_details = []
    for cc in college.courses:
        # Calculate total fee if missing
        calc_total = cc.total_course_fee
        if not calc_total and cc.annual_fees:
            duration_yrs = cc.duration_years or 3
            calc_total = Decimal(str(float(cc.annual_fees) * duration_yrs))

        courses_details.append(
            CourseDetailSchema(
                id=cc.id,
                course_id=cc.course_id,
                name=cc.course_name or (cc.course.name if cc.course else "Degree Course"),
                short_code=cc.course.short_code if cc.course else "UG",
                category=cc.course.category if cc.course else "General",
                degree_level=cc.degree_level or "Undergraduate",
                specialization=cc.specialization,
                duration_years=cc.duration_years or 3,
                annual_fees=cc.annual_fees,
                total_course_fee=calc_total,
                tuition_fee=cc.tuition_fee or Decimal("0.00"),
                exam_fee=cc.exam_fee or Decimal("0.00"),
                other_charges=cc.other_charges or Decimal("0.00"),
                fee_category=cc.fee_category or "Government / Merit",
                seats=cc.seats or 60,
                duration=cc.duration or f"{cc.duration_years or 3} Years",
                eligibility=cc.eligibility or (cc.course.general_eligibility if cc.course else "10+2 / PUC equivalent"),
                admission_details=cc.admission_details or "Merit-based admission / University counselling",
                admission_process=cc.admission_process or cc.admission_details or "Online application followed by verification",
                entrance_exam=cc.entrance_exam or "Merit / Direct",
                intake_capacity=cc.intake_capacity or cc.seats or 60,
                course_availability_status=cc.course_availability_status or "Available",
                fee_academic_year=cc.fee_academic_year or cc.academic_year,
                academic_year=cc.academic_year,
                course_source=cc.course_source or "Official College Prospectus",
                verification_status=cc.verification_status or "Verified",
                last_verified_date=cc.last_verified_date or "2024-2025"
            )
        )

    return CollegeDetailResponse(
        id=college.id,
        college_id=college.id,
        district_id=college.district_id,
        district_name=college.district.district_name if college.district else "Karnataka",
        state=college.district.state if college.district else "Karnataka",
        name=college.name,
        alternate_name=college.alternate_name,
        slug=college.slug,
        city=college.city or "Tumakuru",
        locality=college.locality,
        description=college.description,
        address=college.address,
        pincode=college.pincode,
        college_type=college.college_type,
        ownership=college.ownership or "Private",
        college_category=college.college_category or "Degree College",
        established_year=college.established_year,
        affiliation=college.affiliation,
        university_name=college.university_name or college.affiliation,
        accreditation=college.accreditation or "NAAC B",
        website=college.website,
        phone=college.phone,
        email=college.email,
        latitude=float(college.latitude) if college.latitude else 13.332,
        longitude=float(college.longitude) if college.longitude else 77.118,
        image_url=college.image_url,
        banner_url=college.banner_url,
        hostel_available=college.hostel_available,
        transport_available=college.transport_available,
        library_available=college.library_available,
        placement_available=college.placement_available,
        average_package=college.average_package,
        highest_package=college.highest_package,
        overall_rating=avg_rating,
        rating_source=r_source,
        review_count=rev_count,
        data_source=college.data_source or "Official Portal / Affiliation Directory",
        verification_status=college.verification_status or "Verified",
        last_verified_date=college.last_verified_date or "2024-2025",
        verified=college.verified,
        last_updated=college.last_updated,
        facilities=college.facilities,
        courses=courses_details,
        placements=college.placements
    )
