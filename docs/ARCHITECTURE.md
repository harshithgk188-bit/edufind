# EduFind – System Architecture & Technical Specification

## 1. Executive Summary
**EduFind** is an AI-enhanced, responsive full-stack web platform designed to solve information asymmetry in higher education discovery. Students can browse by geographical districts (e.g., Tumkur, Bangalore, Mysore), search targeted courses (e.g., BCA, MCA, B.Com, MBA, B.Sc, Engineering), inspect verified fees and facilities, compare multiple colleges side-by-side, receive multi-criteria recommendation scores, and interact with a ground-truth RAG/database-backed AI assistant.

---

## 2. High-Level 3-Tier Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (Single Page Application)"]
        UI["React 18 + Tailwind CSS + Lucide Icons"]
        Router["React Router v6"]
        State["Context API (AuthContext, CompareContext, FavContext)"]
        MapComponent["Leaflet / OpenStreetMap Integration"]
        AnalyticsUI["Recharts Analytics Dashboard"]
    end

    subgraph APILayer["Backend API Gateway (FastAPI)"]
        CORS["CORS Middleware & Security Headers"]
        AuthMiddleware["JWT Authentication & Bcrypt Password Hashing"]
        RouterHub["API Routers Hub (/api/v1)"]
        RecEngine["Weighted Multi-Criteria Recommendation Engine"]
        AIAssistant["EduFind Context-Injected AI Assistant"]
    end

    subgraph DataLayer["Persistence & Storage Layer"]
        ORM["SQLAlchemy 2.0 ORM"]
        RDBMS[("MySQL 8.0+ / SQLite Engine")]
        Tables["11 Normalized Relational Tables"]
    end

    UI --> Router
    Router --> State
    State --> |Axios REST calls with Bearer JWT| CORS
    CORS --> AuthMiddleware
    AuthMiddleware --> RouterHub
    RouterHub --> RecEngine
    RouterHub --> AIAssistant
    RouterHub --> ORM
    RecEngine --> ORM
    AIAssistant --> ORM
    ORM --> RDBMS
    RDBMS --> Tables
```

---

## 3. Database ER Design & Relationships

The database is fully normalized (3NF) to eliminate data redundancy and preserve integrity.

```mermaid
erDiagram
    DISTRICTS ||--o{ COLLEGES : contains
    COLLEGES ||--o{ COLLEGE_COURSES : offers
    COURSES ||--o{ COLLEGE_COURSES : taught_in
    COLLEGES ||--o{ COLLEGE_FACILITIES : provides
    FACILITIES ||--o{ COLLEGE_FACILITIES : available_at
    COLLEGES ||--o{ RATINGS : receives
    USERS ||--o{ RATINGS : writes
    COLLEGES ||--o{ PLACEMENTS : records
    USERS ||--o{ FAVORITES : bookmarks
    COLLEGES ||--o{ FAVORITES : saved_as
    USERS ||--o{ SEARCHES : tracks
    DISTRICTS ||--o{ SEARCHES : filtered_by
    COURSES ||--o{ SEARCHES : searched_for
    USERS ||--o{ COLLEGES : manages

    DISTRICTS {
        int id PK
        string state
        string district_name
        string code
    }

    COLLEGES {
        int id PK
        int district_id FK
        string name
        string slug UK
        text description
        string address
        string college_type
        int established_year
        string affiliation
        string accreditation
        string website
        string phone
        string email
        decimal latitude
        decimal longitude
        string image_url
        boolean verified
        datetime last_updated
    }

    COURSES {
        int id PK
        string name
        string short_code UK
        string category
        string duration
        text general_eligibility
    }

    COLLEGE_COURSES {
        int id PK
        int college_id FK
        int course_id FK
        decimal annual_fees
        decimal tuition_fee
        decimal exam_fee
        decimal other_charges
        int seats
        string duration
        text eligibility
        text admission_details
        string academic_year
    }

    FACILITIES {
        int id PK
        string name UK
        string icon
    }

    COLLEGE_FACILITIES {
        int college_id PK,FK
        int facility_id PK,FK
    }

    RATINGS {
        int id PK
        int college_id FK
        int user_id FK
        decimal overall_rating
        decimal academics_rating
        decimal faculty_rating
        decimal infrastructure_rating
        decimal placement_rating
        decimal hostel_rating
        decimal value_rating
        string review_title
        text review
        string status
        datetime created_at
    }

    PLACEMENTS {
        int id PK
        int college_id FK
        string academic_year
        decimal average_package
        decimal highest_package
        decimal placement_percentage
        text recruiting_companies
    }

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role
        int college_id FK
        datetime created_at
    }

    FAVORITES {
        int id PK
        int user_id FK
        int college_id FK
        datetime created_at
    }

    SEARCHES {
        int id PK
        int user_id FK
        int district_id FK
        int course_id FK
        string search_keyword
        datetime searched_at
    }
```

---

## 4. REST API Endpoint Design

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student or college admin | Public |
| `POST` | `/api/auth/login` | Authenticate user, return JWT bearer token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `GET` | `/api/districts` | List all districts with college count | Public |
| `GET` | `/api/districts/{id}/colleges` | List all colleges in a district with stats | Public |
| `GET` | `/api/courses` | List all standard courses (BCA, MCA, B.Com, etc.) | Public |
| `GET` | `/api/colleges/search` | Search colleges by district, course, fees, rating, type | Public |
| `GET` | `/api/colleges/{id}` | Full college profile (fees, facilities, placements, map) | Public |
| `GET` | `/api/colleges/{id}/courses` | Courses offered with exact fee breakdown | Public |
| `GET` | `/api/colleges/{id}/ratings` | Approved reviews & rating distribution breakdown | Public |
| `POST` | `/api/colleges/{id}/ratings` | Submit student review & category ratings | Student |
| `GET` | `/api/favorites` | Get list of user saved colleges | Student |
| `POST` | `/api/favorites` | Add college to favorites | Student |
| `DELETE` | `/api/favorites/{college_id}` | Remove college from favorites | Student |
| `POST` | `/api/recommendations` | Multi-criteria recommendation engine scoring | Public / Student |
| `POST` | `/api/ai/chat` | EduFind AI Assistant (ground-truth college queries) | Public |
| `GET` | `/api/admin/analytics` | Super Admin KPI metrics & chart analytics | Super Admin |
| `PUT` | `/api/admin/colleges/{id}/verify` | Verify college information & update timestamp | Super Admin |
| `PATCH` | `/api/admin/reviews/{id}` | Moderate review status (approve/reject) | Super Admin |
| `POST` | `/api/admin/colleges` | Create new college | Admin |
| `PUT` | `/api/admin/colleges/{id}` | Update college profile & admissions | Admin |
