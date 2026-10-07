from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Favorite, College, User
from ..schemas.college import CollegeCardSchema
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("", response_model=List[CollegeCardSchema])
def get_user_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    results = []
    for f in favs:
        c = f.college
        approved_ratings = [float(r.overall_rating) for r in c.ratings if r.status == "approved"]
        avg_rating = round(sum(approved_ratings) / len(approved_ratings), 1) if approved_ratings else 4.2
        fees_list = [float(cc.annual_fees) for cc in c.courses]
        min_fee = min(fees_list) if fees_list else 0.0

        results.append(
            CollegeCardSchema(
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
                review_count=len(approved_ratings),
                min_fees=min_fee if min_fee > 0 else None,
                courses_offered=[cc.course.short_code for cc in c.courses]
            )
        )
    return results

@router.post("/{college_id}")
def add_favorite(college_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    existing = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.college_id == college_id).first()
    if existing:
        return {"status": "exists", "message": "College is already in your favorites."}

    new_fav = Favorite(user_id=current_user.id, college_id=college_id)
    db.add(new_fav)
    db.commit()
    return {"status": "success", "message": "Added to favorites."}

@router.delete("/{college_id}")
def remove_favorite(college_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fav = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.college_id == college_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(fav)
    db.commit()
    return {"status": "success", "message": "Removed from favorites."}
