-- =====================================================================
-- EduFind - Smart College & Course Discovery and Recommendation System
-- Database Schema (MySQL 8.0+ / MariaDB / SQLite compatible ANSI SQL)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS edufind_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edufind_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'college_admin', 'super_admin') NOT NULL DEFAULT 'student',
    college_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    district_name VARCHAR(120) NOT NULL,
    code VARCHAR(10) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_state_district (state, district_name),
    INDEX idx_district_name (district_name)
) ENGINE=InnoDB;

-- 3. Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    address VARCHAR(300) NOT NULL,
    college_type ENUM('Government', 'Private', 'Autonomous', 'University') NOT NULL DEFAULT 'Private',
    established_year INT,
    affiliation VARCHAR(200),
    accreditation VARCHAR(100) DEFAULT 'NAAC B',
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(150),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url VARCHAR(500),
    banner_url VARCHAR(500),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_colleges_district FOREIGN KEY (district_id) REFERENCES districts (id) ON DELETE CASCADE,
    INDEX idx_colleges_type (college_type),
    INDEX idx_colleges_verified (verified),
    INDEX idx_colleges_name (name)
) ENGINE=InnoDB;

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    short_code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL, -- e.g. Computer Applications, Commerce, Management, Science, Engineering
    duration VARCHAR(50) NOT NULL, -- e.g. '3 Years', '2 Years', '4 Years'
    general_eligibility TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_courses_category (category),
    INDEX idx_courses_code (short_code)
) ENGINE=InnoDB;

-- 5. College Courses (Mapping & Fees)
CREATE TABLE IF NOT EXISTS college_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    college_id INT NOT NULL,
    course_id INT NOT NULL,
    annual_fees DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tuition_fee DECIMAL(12, 2) DEFAULT 0.00,
    exam_fee DECIMAL(12, 2) DEFAULT 0.00,
    other_charges DECIMAL(12, 2) DEFAULT 0.00,
    seats INT DEFAULT 60,
    duration VARCHAR(50),
    eligibility TEXT,
    admission_details TEXT,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cc_college FOREIGN KEY (college_id) REFERENCES colleges (id) ON DELETE CASCADE,
    CONSTRAINT fk_cc_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    UNIQUE KEY uq_college_course_year (college_id, course_id, academic_year),
    INDEX idx_cc_fees (annual_fees)
) ENGINE=InnoDB;

-- 6. Facilities Table
CREATE TABLE IF NOT EXISTS facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'check-circle'
) ENGINE=InnoDB;

-- 7. College Facilities Mapping
CREATE TABLE IF NOT EXISTS college_facilities (
    college_id INT NOT NULL,
    facility_id INT NOT NULL,
    PRIMARY KEY (college_id, facility_id),
    CONSTRAINT fk_cf_college FOREIGN KEY (college_id) REFERENCES colleges (id) ON DELETE CASCADE,
    CONSTRAINT fk_cf_facility FOREIGN KEY (facility_id) REFERENCES facilities (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Ratings & Reviews Table
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    college_id INT NOT NULL,
    user_id INT NOT NULL,
    overall_rating DECIMAL(2, 1) NOT NULL,
    academics_rating DECIMAL(2, 1) DEFAULT 4.0,
    faculty_rating DECIMAL(2, 1) DEFAULT 4.0,
    infrastructure_rating DECIMAL(2, 1) DEFAULT 4.0,
    placement_rating DECIMAL(2, 1) DEFAULT 4.0,
    hostel_rating DECIMAL(2, 1) DEFAULT 4.0,
    value_rating DECIMAL(2, 1) DEFAULT 4.0,
    review_title VARCHAR(200),
    review TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ratings_college FOREIGN KEY (college_id) REFERENCES colleges (id) ON DELETE CASCADE,
    CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_college_review (user_id, college_id),
    INDEX idx_ratings_status (status),
    INDEX idx_ratings_score (overall_rating)
) ENGINE=InnoDB;

-- 9. Placements Table
CREATE TABLE IF NOT EXISTS placements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    college_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
    average_package DECIMAL(6, 2) NULL, -- in LPA (Lakhs per annum), e.g. 4.50
    highest_package DECIMAL(6, 2) NULL, -- in LPA, e.g. 12.00
    placement_percentage DECIMAL(5, 2) NULL, -- e.g. 85.50
    recruiting_companies TEXT, -- comma-separated e.g. "TCS, Infosys, Wipro, Cognizant, Tech Mahindra"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_placements_college FOREIGN KEY (college_id) REFERENCES colleges (id) ON DELETE CASCADE,
    INDEX idx_placements_college (college_id)
) ENGINE=InnoDB;

-- 10. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    college_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_college FOREIGN KEY (college_id) REFERENCES colleges (id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_fav (user_id, college_id)
) ENGINE=InnoDB;

-- 11. Searches Tracking Table (For Analytics)
CREATE TABLE IF NOT EXISTS searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    district_id INT NULL,
    course_id INT NULL,
    search_keyword VARCHAR(255) NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_searches_district (district_id),
    INDEX idx_searches_course (course_id),
    INDEX idx_searches_time (searched_at)
) ENGINE=InnoDB;
