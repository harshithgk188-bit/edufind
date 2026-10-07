from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import District, College, Rating, CollegeCourse, Course
from ..schemas.course import DistrictSchema

router = APIRouter(prefix="/districts", tags=["Districts"])

@router.get("", response_model=List[DistrictSchema])
def list_districts(db: Session = Depends(get_db)):
    districts = db.query(District).all()
    results = []
    for d in districts:
        college_count = len(d.colleges)
        all_ratings = []
        for c in d.colleges:
            for r in c.ratings:
                if r.status == "approved":
                    all_ratings.append(float(r.overall_rating))
        avg_rating = round(sum(all_ratings) / len(all_ratings), 1) if all_ratings else 0.0

        results.append(
            DistrictSchema(
                id=d.id,
                state=d.state,
                district_name=d.district_name,
                code=d.code,
                college_count=college_count,
                average_rating=avg_rating
            )
        )
    return results

@router.get("/{district_id}/stats")
def get_district_stats(district_id: int, db: Session = Depends(get_db)):
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")

    colleges = district.colleges
    total_colleges = len(colleges)

    # Collect distinct courses offered in this district
    course_ids = set()
    for c in colleges:
        for cc in c.courses:
            course_ids.add(cc.course_id)
    total_courses = len(course_ids)

    # Average rating across district
    all_ratings = []
    top_colleges = []
    for c in colleges:
        c_ratings = [float(r.overall_rating) for r in c.ratings if r.status == "approved"]
        c_avg = round(sum(c_ratings) / len(c_ratings), 1) if c_ratings else 4.0
        all_ratings.extend(c_ratings)
        top_colleges.append({
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "college_type": c.college_type,
            "rating": c_avg,
            "image_url": c.image_url,
            "verified": c.verified
        })

    district_avg_rating = round(sum(all_ratings) / len(all_ratings), 1) if all_ratings else 4.2
    top_colleges.sort(key=lambda x: x["rating"], reverse=True)

    return {
        "district_id": district.id,
        "district_name": district.district_name,
        "state": district.state,
        "total_colleges": total_colleges,
        "total_courses": total_courses,
        "average_rating": district_avg_rating,
        "top_rated_colleges": top_colleges[:5]
    }
