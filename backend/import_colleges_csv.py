"""
EduFind - College CSV Importer CLI Utility
Usage:
    python import_colleges_csv.py --file ../database/sample_colleges.csv
    python import_colleges_csv.py --file my_colleges.csv --dry-run
"""

import argparse
import csv
import sys
import os
import re
from datetime import datetime

# Add app to Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import College, District, Course, CollegeCourse, Facility

def parse_args():
    parser = argparse.ArgumentParser(description="Import college directory from CSV into EduFind database")
    parser.add_argument("--file", "-f", required=True, help="Path to CSV file to import")
    parser.add_argument("--dry-run", action="store_true", help="Validate and report changes without committing to database")
    return parser.parse_args()

def normalize_name(s: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', s.lower())

def run_import(file_path: str, dry_run: bool = False):
    if not os.path.exists(file_path):
        print(f"[ERROR] File not found: {file_path}")
        sys.exit(1)

    db = SessionLocal()
    summary = {
        "total_rows": 0,
        "inserted": 0,
        "updated": 0,
        "skipped": 0,
        "failed": 0,
        "errors": [],
        "dry_run": dry_run
    }

    print(f"\n=======================================================")
    print(f"EduFind CSV Importer - {'[DRY RUN - PREVIEW ONLY]' if dry_run else '[LIVE COMMIT]'}")
    print(f"Target File: {file_path}")
    print(f"=======================================================\n")

    # Load existing districts
    districts = {d.district_name.lower(): d for d in db.query(District).all()}
    
    with open(file_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        row_num = 1
        for row in reader:
            row_num += 1
            summary["total_rows"] += 1
            
            raw_name = row.get("college_name") or row.get("name")
            if not raw_name or not raw_name.strip():
                summary["failed"] += 1
                summary["errors"].append(f"Row {row_num}: Missing 'college_name'")
                continue

            name = raw_name.strip()
            district_name = (row.get("district") or row.get("district_name") or "Tumakuru").strip()
            
            # Lookup or create district
            dist_obj = districts.get(district_name.lower())
            if not dist_obj and not dry_run:
                dist_obj = District(state="Karnataka", district_name=district_name, code="KA-GEN")
                db.add(dist_obj)
                db.flush()
                districts[district_name.lower()] = dist_obj
            elif not dist_obj and dry_run:
                print(f"[NOTICE] Row {row_num}: New district '{district_name}' will be created.")

            city = row.get("city") or district_name
            address = row.get("address") or row.get("full_address") or f"{name}, {district_name}"
            ownership = row.get("ownership") or "Private"
            college_category = row.get("college_category") or "Degree College"
            college_type = row.get("college_type") or "Affiliated"
            v_status = row.get("verification_status") or "Verified"

            # Check duplicate / existing
            existing = db.query(College).filter(College.name.ilike(name)).first()
            if not existing:
                base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')
                existing = db.query(College).filter(College.slug == base_slug).first()

            if existing:
                # Update record
                if not dry_run:
                    existing.address = address
                    existing.city = city
                    existing.ownership = ownership
                    existing.college_category = college_category
                    existing.college_type = college_type
                    if row.get("website"): existing.website = row.get("website")
                    if row.get("phone"): existing.phone = row.get("phone")
                    if row.get("email"): existing.email = row.get("email")
                    if row.get("verification_status"):
                        existing.verification_status = v_status
                        existing.verified = (v_status == "Verified")
                    existing.last_updated = datetime.utcnow()
                summary["updated"] += 1
                print(f"[UPDATE] Row {row_num}: '{name}' in {city} (Status: {v_status})")
            else:
                # Insert record
                if not dry_run:
                    base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')
                    slug = base_slug
                    counter = 1
                    while db.query(College).filter(College.slug == slug).first():
                        slug = f"{base_slug}-{counter}"
                        counter += 1

                    new_college = College(
                        district_id=dist_obj.id if dist_obj else 1,
                        name=name,
                        alternate_name=row.get("alternate_name"),
                        slug=slug,
                        city=city,
                        locality=row.get("locality"),
                        address=address,
                        pincode=row.get("pincode"),
                        college_type=college_type,
                        ownership=ownership,
                        college_category=college_category,
                        affiliation=row.get("affiliation"),
                        university_name=row.get("university_name"),
                        accreditation=row.get("accreditation") or "NAAC B",
                        established_year=int(row.get("established_year")) if row.get("established_year") and row.get("established_year").isdigit() else None,
                        website=row.get("website"),
                        phone=row.get("phone"),
                        email=row.get("email"),
                        average_package=row.get("average_package"),
                        highest_package=row.get("highest_package"),
                        rating=float(row.get("rating")) if row.get("rating") else 4.0,
                        rating_source=row.get("rating_source") or "Imported Record",
                        verification_status=v_status,
                        verified=(v_status == "Verified")
                    )
                    db.add(new_college)
                summary["inserted"] += 1
                print(f"[INSERT] Row {row_num}: '{name}' in {city} (Status: {v_status})")

    if not dry_run:
        try:
            db.commit()
            print("\n[SUCCESS] All valid records committed successfully to the database.")
        except Exception as e:
            db.rollback()
            print(f"\n[FATAL] Database commit failed: {e}")
            summary["errors"].append(str(e))
    else:
        print("\n[SUCCESS] Dry-run completed. No changes made.")

    db.close()

    print("\n----------------- IMPORT SUMMARY -----------------")
    print(f"Total Rows Processed : {summary['total_rows']}")
    print(f"Colleges Inserted    : {summary['inserted']}")
    print(f"Colleges Updated     : {summary['updated']}")
    print(f"Colleges Failed      : {summary['failed']}")
    if summary["errors"]:
        print(f"Errors Encountered   : {len(summary['errors'])}")
        for err in summary["errors"][:5]:
            print(f"  - {err}")
    print("--------------------------------------------------\n")

if __name__ == "__main__":
    args = parse_args()
    run_import(args.file, args.dry_run)
