"""
EduFind - Cloud MySQL Migration & Seeding Utility
Run this script to test your cloud database connection and automatically
create all tables and seed data into Aiven / Cloud MySQL.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

def main():
    print("=" * 65)
    print("   EduFind - Cloud MySQL Table Creation & Seeding Tool")
    print("=" * 65)
    print()

    # Check if DATABASE_URL is set in environment or prompt
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Enter your Aiven MySQL Password to connect to:")
        print("edufind-mysql-harshithgk18-8acd.d.aivencloud.com:11432/defaultdb")
        password = input("Password: ").strip()
        if not password:
            print("Password cannot be empty!")
            sys.exit(1)
        
        db_url = f"mysql+pymysql://avnadmin:{password}@edufind-mysql-harshithgk18-8acd.d.aivencloud.com:11432/defaultdb"
        os.environ["DATABASE_URL"] = db_url

    print()
    print("Connecting to Cloud MySQL database...")
    try:
        from app.database import engine, Base, SessionLocal
        from app.models import District, College, Course, Rating
        from app.utils.seed_data import seed_database

        print("1/2 Creating all 11 relational tables on Cloud MySQL...")
        Base.metadata.create_all(bind=engine)
        print("    Tables created successfully!")

        print("2/2 Populating verified seed data (Districts, Colleges, Fees, Reviews)...")
        db = SessionLocal()
        result = seed_database(db)
        print("    ", result["message"])

        # Verification stats
        districts_count = db.query(District).count()
        colleges_count = db.query(College).count()
        courses_count = db.query(Course).count()
        ratings_count = db.query(Rating).count()
        db.close()

        print()
        print("=" * 65)
        print("   SUCCESS! Cloud MySQL Database is completely initialized!")
        print("=" * 65)
        print(f"Districts: {districts_count} | Colleges: {colleges_count} | Courses: {courses_count} | Reviews: {ratings_count}")
        print()
        print("Your Cloud Database is ready for Render backend deployment!")

    except Exception as e:
        print()
        print("[ERROR] Failed to connect or migrate to Cloud MySQL:")
        print(str(e))
        print()
        print("Please check that your password is correct and Aiven service status is Running.")
        sys.exit(1)

if __name__ == "__main__":
    main()
