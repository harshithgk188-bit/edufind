from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..database import get_db
from ..models import College, District, Course, User, Rating, CollegeCourse, Search
from ..schemas.college import CollegeCreateUpdate
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
    verified_colleges = db.query(College).filter(College.verified == True).count()

    # 1. Colleges by District
    colleges_by_district = []
    districts = db.query(District).all()
    for d in districts:
        count = len(d.colleges)
        if count > 0:
            colleges_by_district.append({"name": d.district_name, "count": count})

    # 2. Colleges by Type
    type_counts = db.query(College.college_type, func.count(College.id)).group_by(College.college_type).all()
    colleges_by_type = [{"name": t[0], "count": t[1]} for t in type_counts]

    # 3. Courses Popularity (count of colleges offering the course)
    course_counts = db.query(Course.short_code, func.count(CollegeCourse.id))\
        .join(CollegeCourse, Course.id == CollegeCourse.course_id, isouter=True)\
        .group_by(Course.short_code).all()
    courses_popularity = [{"name": c[0], "count": c[1]} for c in course_counts]

    # 4. Searches trend / popular searches
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
            "verified_colleges": verified_colleges
        },
        "charts": {
            "colleges_by_district": colleges_by_district,
            "colleges_by_type": colleges_by_type,
            "courses_popularity": courses_popularity,
            "most_searched_courses": most_searched_courses
        }
    }

@router.put("/colleges/{college_id}/verify")
def toggle_college_verification(college_id: int, verified: bool, db: Session = Depends(get_db), current_user = Depends(require_super_admin)):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    college.verified = verified
    college.last_updated = datetime.utcnow()
    db.commit()
    return {"status": "success", "message": f"College verification set to {verified}", "last_updated": college.last_updated}

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

@router.post("/colleges")
def create_college(college_data: CollegeCreateUpdate, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    # Generate unique slug
    base_slug = college_data.name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace(",", "")
    slug = base_slug
    counter = 1
    while db.query(College).filter(College.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    new_college = College(
        district_id=college_data.district_id,
        name=college_data.name,
        slug=slug,
        description=college_data.description,
        address=college_data.address,
        college_type=college_data.college_type,
        established_year=college_data.established_year,
        affiliation=college_data.affiliation,
        accreditation=college_data.accreditation,
        website=college_data.website,
        phone=college_data.phone,
        email=college_data.email,
        latitude=college_data.latitude,
        longitude=college_data.longitude,
        image_url=college_data.image_url or "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
        verified=college_data.verified or False
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
    college.district_id = data.district_id
    college.description = data.description
    college.address = data.address
    college.college_type = data.college_type
    college.established_year = data.established_year
    college.affiliation = data.affiliation
    college.accreditation = data.accreditation
    college.website = data.website
    college.phone = data.phone
    college.email = data.email
    if data.latitude is not None:
        college.latitude = data.latitude
    if data.longitude is not None:
        college.longitude = data.longitude
    if data.image_url:
        college.image_url = data.image_url
    college.last_updated = datetime.utcnow()

    db.commit()
    return {"status": "success", "message": "College updated successfully"}
