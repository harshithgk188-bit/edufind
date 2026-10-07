from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import College, CollegeCourse, Course, Rating, Placement, Facility
from ..schemas.recommendation import RecommendationRequest, RecommendedCollege, RecommendationResponse

def calculate_college_recommendations(req: RecommendationRequest, db: Session) -> RecommendationResponse:
    """
    Multi-criteria recommendation algorithm:
    Computes a normalized weighted score (0-100%) based on:
    1. Course match & availability (Mandatory / high weight: 30 pts)
    2. Budget / Fee affinity (20 pts)
    3. Academic & student ratings (20 pts)
    4. Facility match (e.g., Hostel requirement: 15 pts)
    5. Placement track record (10 pts)
    6. College Type & District alignment (5 pts)
    """
    query = db.query(College)
    
    # Filter by district if explicitly selected
    if req.district_id:
        query = query.filter(College.district_id == req.district_id)
        
    if req.college_type and req.college_type != "Any":
        query = query.filter(College.college_type == req.college_type)

    colleges = query.all()
    results: List[RecommendedCollege] = []

    for college in colleges:
        # Check course offering
        matching_course = None
        for cc in college.courses:
            if req.course_code:
                if cc.course.short_code.lower() == req.course_code.lower():
                    matching_course = cc
                    break
            else:
                matching_course = cc
                break

        # If user specified a course and college doesn't offer it, skip or penalize
        if req.course_code and not matching_course:
            continue

        course_title = matching_course.course.name if matching_course else "General Programs"
        annual_fee = float(matching_course.annual_fees) if matching_course else 0.0

        # Calculate ratings
        approved_ratings = [r.overall_rating for r in college.ratings if r.status == "approved"]
        avg_rating = float(sum(approved_ratings) / len(approved_ratings)) if approved_ratings else 4.0

        # Filter by minimum rating
        if req.min_rating and avg_rating < req.min_rating:
            continue

        # Facility check
        facility_names = [f.name.lower() for f in college.facilities]
        has_hostel = any("hostel" in fn for fn in facility_names)
        if req.hostel_required and not has_hostel:
            continue

        # Placement stats
        avg_pkg = None
        if college.placements:
            latest_placement = college.placements[0]
            if latest_placement.average_package:
                avg_pkg = float(latest_placement.average_package)

        # SCORING ALGORITHM
        score = 0
        reasons = []

        # 1. Course Match (30 pts)
        if matching_course:
            score += 30
            reasons.append(f"offers accredited {matching_course.course.short_code}")

        # 2. Budget Score (20 pts)
        if req.max_budget and req.max_budget > 0:
            if annual_fee <= req.max_budget:
                score += 20
                reasons.append(f"fits well within your budget of ₹{int(req.max_budget):,}/year (Annual Fee: ₹{int(annual_fee):,})")
            elif annual_fee <= req.max_budget * 1.2:
                score += 10
                reasons.append(f"slightly exceeds budget (Annual Fee: ₹{int(annual_fee):,})")
            else:
                score += 3
        else:
            score += 18
            reasons.append(f"competitive annual fee of ₹{int(annual_fee):,}")

        # 3. Rating Score (20 pts)
        # 5.0 -> 20 pts, 4.0 -> 16 pts, 3.0 -> 12 pts
        rating_score = min(20, int((avg_rating / 5.0) * 20))
        score += rating_score
        reasons.append(f"has strong student rating of {avg_rating:.1f}/5")

        # 4. Facilities & Hostel (15 pts)
        if has_hostel:
            score += 10
            reasons.append("provides dedicated campus hostel facilities")
        if any("lab" in fn for fn in facility_names) or any("library" in fn for fn in facility_names):
            score += 5

        # 5. Placement Weight (10 pts)
        placement_weight = 10 if req.placement_importance == "High" else (7 if req.placement_importance == "Medium" else 4)
        if avg_pkg:
            score += placement_weight
            reasons.append(f"reports {avg_pkg} LPA average placement package")
        else:
            score += 5

        # 6. Verification and college type bonus (5 pts)
        if college.verified:
            score += 5

        # Bound score between 60% and 98%
        match_score = min(98, max(55, score))

        # Build natural language reasoning summary
        reasoning_text = f"{college.name} is recommended because it " + ", ".join(reasons) + "."

        results.append(
            RecommendedCollege(
                college_id=college.id,
                name=college.name,
                slug=college.slug,
                district_name=college.district.district_name,
                college_type=college.college_type,
                image_url=college.image_url,
                overall_rating=round(avg_rating, 1),
                course_name=course_title,
                annual_fees=annual_fee,
                match_score=match_score,
                has_hostel=has_hostel,
                placement_package=avg_pkg,
                reasoning=reasoning_text
            )
        )

    # Sort descending by match score
    results.sort(key=lambda x: x.match_score, reverse=True)

    return RecommendationResponse(
        total_matches=len(results),
        recommendations=results
    )
