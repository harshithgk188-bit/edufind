from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from decimal import Decimal
from ..database import get_db
from ..models import College, Course, District, Facility, CollegeCourse, Rating, Placement, Search
from ..schemas.college import CollegeCardSchema, CollegeDetailResponse, CourseDetailSchema
from ..services.auth_service import get_optional_current_user

router = APIRouter(prefix="/colleges", tags=["Colleges"])

@router.get("/search", response_model=List[CollegeCardSchema])
def search_colleges(
    district_id: Optional[int] = None,
    state: Optional[str] = None,
    course: Optional[str] = None,
    q: Optional[str] = None,
    college_type: Optional[str] = None,
    min_rating: Optional[float] = None,
    fee_range: Optional[str] = None, # under_25k, 25k_50k, 50k_100k, above_100k
    facilities: Optional[List[str]] = Query(None),
    sort_by: Optional[str] = "rating", # rating, fees_asc, fees_desc, name
    db: Session = Depends(get_db),
    user = Depends(get_optional_current_user)
):
    # Log search query into analytics
    try:
        user_id = user.id if user else None
        target_course_id = None
        if course:
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

    if district_id:
        query = query.filter(College.district_id == district_id)

    if college_type and college_type != "All":
        query = query.filter(College.college_type == college_type)

    if q:
        search_filter = or_(
            College.name.ilike(f"%{q}%"),
            College.description.ilike(f"%{q}%"),
            College.address.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)

    colleges = query.all()
    filtered_results = []

    for c in colleges:
        # Check course requirement
        courses_offered = [cc.course.short_code for cc in c.courses]
        if course and course != "All":
            if not any(course.lower() == c_code.lower() for c_code in courses_offered):
                continue

        # Calculate fees
        fees_list = [float(cc.annual_fees) for cc in c.courses]
        min_fee = min(fees_list) if fees_list else 0.0

        # Filter fee range
        if fee_range and fee_range != "all":
            if fee_range == "under_25k" and min_fee >= 25000:
                continue
            elif fee_range == "25k_50k" and not (25000 <= min_fee <= 50000):
                continue
            elif fee_range == "50k_100k" and not (50000 <= min_fee <= 100000):
                continue
            elif fee_range == "above_100k" and min_fee < 100000:
                continue

        # Calculate ratings
        approved_ratings = [float(r.overall_rating) for r in c.ratings if r.status == "approved"]
        avg_rating = round(sum(approved_ratings) / len(approved_ratings), 1) if approved_ratings else 4.2
        review_count = len(approved_ratings)

        if min_rating and avg_rating < min_rating:
            continue

        # Check facilities
        if facilities:
            college_fac_names = [f.name.lower() for f in c.facilities]
            # Must have all required facilities
            match_all_facs = all(any(req_fac.lower() in fn for fn in college_fac_names) for req_fac in facilities)
            if not match_all_facs:
                continue

        card = CollegeCardSchema(
            id=c.id,
            name=c.name,
            slug=c.slug,
            district_id=c.district_id,
            district_name=c.district.district_name,
            address=c.address,
            college_type=c.college_type,
            accreditation=c.accreditation,
            image_url=c.image_url,
            verified=c.verified,
            last_updated=c.last_updated,
            overall_rating=avg_rating,
            review_count=review_count,
            min_fees=Decimal(str(min_fee)) if min_fee > 0 else None,
            courses_offered=courses_offered
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
    avg_rating = round(sum(approved_ratings) / len(approved_ratings), 1) if approved_ratings else 4.2

    # Map courses
    courses_details = []
    for cc in college.courses:
        courses_details.append(
            CourseDetailSchema(
                id=cc.id,
                course_id=cc.course_id,
                name=cc.course.name,
                short_code=cc.course.short_code,
                category=cc.course.category,
                annual_fees=cc.annual_fees,
                tuition_fee=cc.tuition_fee or Decimal("0.00"),
                exam_fee=cc.exam_fee or Decimal("0.00"),
                other_charges=cc.other_charges or Decimal("0.00"),
                seats=cc.seats or 60,
                duration=cc.duration or cc.course.duration,
                eligibility=cc.eligibility or cc.course.general_eligibility,
                admission_details=cc.admission_details or "Merit-based entrance / University quota",
                academic_year=cc.academic_year
            )
        )

    return CollegeDetailResponse(
        id=college.id,
        district_id=college.district_id,
        district_name=college.district.district_name,
        state=college.district.state,
        name=college.name,
        slug=college.slug,
        description=college.description,
        address=college.address,
        college_type=college.college_type,
        established_year=college.established_year,
        affiliation=college.affiliation,
        accreditation=college.accreditation,
        website=college.website,
        phone=college.phone,
        email=college.email,
        latitude=float(college.latitude) if college.latitude else 13.332,
        longitude=float(college.longitude) if college.longitude else 77.118,
        image_url=college.image_url,
        banner_url=college.banner_url,
        verified=college.verified,
        last_updated=college.last_updated,
        overall_rating=avg_rating,
        review_count=len(approved_ratings),
        facilities=college.facilities,
        courses=courses_details,
        placements=college.placements
    )
