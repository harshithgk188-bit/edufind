from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from ..database import get_db
from ..models import Rating, College, User
from ..schemas.rating import RatingCreate, RatingResponse, RatingSummaryResponse
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/colleges", tags=["Ratings & Reviews"])

@router.get("/{college_id}/ratings", response_model=List[RatingResponse])
def get_college_reviews(college_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Rating).filter(Rating.college_id == college_id, Rating.status == "approved").order_by(Rating.created_at.desc()).all()
    results = []
    for r in reviews:
        results.append(
            RatingResponse(
                id=r.id,
                college_id=r.college_id,
                user_id=r.user_id,
                user_name=r.user.name,
                overall_rating=float(r.overall_rating),
                academics_rating=float(r.academics_rating or 4.0),
                faculty_rating=float(r.faculty_rating or 4.0),
                infrastructure_rating=float(r.infrastructure_rating or 4.0),
                placement_rating=float(r.placement_rating or 4.0),
                hostel_rating=float(r.hostel_rating or 4.0),
                value_rating=float(r.value_rating or 4.0),
                review_title=r.review_title,
                review=r.review,
                status=r.status,
                created_at=r.created_at
            )
        )
    return results

@router.get("/{college_id}/ratings/summary", response_model=RatingSummaryResponse)
def get_college_rating_summary(college_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Rating).filter(Rating.college_id == college_id, Rating.status == "approved").all()
    total = len(reviews)
    if total == 0:
        return RatingSummaryResponse(
            average_overall=4.0,
            total_reviews=0,
            distribution={5: 0, 4: 0, 3: 0, 2: 0, 1: 0},
            distribution_percentage={5: 0.0, 4: 0.0, 3: 0.0, 2: 0.0, 1: 0.0},
            categories={"academics": 4.0, "faculty": 4.0, "infrastructure": 4.0, "placements": 4.0, "hostel": 4.0, "value": 4.0}
        )

    dist = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    cat_totals = {"academics": 0.0, "faculty": 0.0, "infrastructure": 0.0, "placements": 0.0, "hostel": 0.0, "value": 0.0}
    sum_overall = 0.0

    for r in reviews:
        ov = float(r.overall_rating)
        sum_overall += ov
        star = max(1, min(5, round(ov)))
        dist[star] += 1
        cat_totals["academics"] += float(r.academics_rating or 4.0)
        cat_totals["faculty"] += float(r.faculty_rating or 4.0)
        cat_totals["infrastructure"] += float(r.infrastructure_rating or 4.0)
        cat_totals["placements"] += float(r.placement_rating or 4.0)
        cat_totals["hostel"] += float(r.hostel_rating or 4.0)
        cat_totals["value"] += float(r.value_rating or 4.0)

    avg_overall = round(sum_overall / total, 1)
    dist_pct = {star: round((count / total) * 100, 1) for star, count in dist.items()}
    cat_avgs = {k: round(v / total, 1) for k, v in cat_totals.items()}

    return RatingSummaryResponse(
        average_overall=avg_overall,
        total_reviews=total,
        distribution=dist,
        distribution_percentage=dist_pct,
        categories=cat_avgs
    )

@router.post("/{college_id}/ratings", response_model=RatingResponse)
def submit_review(
    college_id: int,
    review_in: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    # Prevent duplicate reviews by the same user for the same college
    existing = db.query(Rating).filter(Rating.college_id == college_id, Rating.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this college."
        )

    new_rating = Rating(
        college_id=college_id,
        user_id=current_user.id,
        overall_rating=review_in.overall_rating,
        academics_rating=review_in.academics_rating,
        faculty_rating=review_in.faculty_rating,
        infrastructure_rating=review_in.infrastructure_rating,
        placement_rating=review_in.placement_rating,
        hostel_rating=review_in.hostel_rating,
        value_rating=review_in.value_rating,
        review_title=review_in.review_title,
        review=review_in.review,
        status="approved" # Automatically approve or flag for moderation
    )
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)

    return RatingResponse(
        id=new_rating.id,
        college_id=new_rating.college_id,
        user_id=new_rating.user_id,
        user_name=current_user.name,
        overall_rating=float(new_rating.overall_rating),
        academics_rating=float(new_rating.academics_rating),
        faculty_rating=float(new_rating.faculty_rating),
        infrastructure_rating=float(new_rating.infrastructure_rating),
        placement_rating=float(new_rating.placement_rating),
        hostel_rating=float(new_rating.hostel_rating),
        value_rating=float(new_rating.value_rating),
        review_title=new_rating.review_title,
        review=new_rating.review,
        status=new_rating.status,
        created_at=new_rating.created_at
    )
