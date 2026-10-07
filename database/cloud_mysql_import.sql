-- =====================================================================
-- EduFind - Cloud MySQL Direct Import Script
-- Works on Aiven, TiDB Cloud, Railway, PlanetScale, phpMyAdmin, etc.
-- (Contains all 11 normalized tables + initial seed dataset)
-- NOTE: Run this directly inside your cloud database (e.g. defaultdb)
-- =====================================================================

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
    category VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
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
    average_package DECIMAL(6, 2) NULL,
    highest_package DECIMAL(6, 2) NULL,
    placement_percentage DECIMAL(5, 2) NULL,
    recruiting_companies TEXT,
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

-- 11. Searches Tracking Table
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

-- =====================================================================
-- SEED DATA INSERTION
-- =====================================================================

-- Districts
INSERT INTO districts (id, state, district_name, code) VALUES
(1, 'Karnataka', 'Tumkur', 'KA-TMK'),
(2, 'Karnataka', 'Bangalore Urban', 'KA-BLR'),
(3, 'Karnataka', 'Mysore', 'KA-MYS'),
(4, 'Karnataka', 'Mangalore (Dakshina Kannada)', 'KA-DKN'),
(5, 'Karnataka', 'Belagavi', 'KA-BGV'),
(6, 'Karnataka', 'Shimoga', 'KA-SMG'),
(7, 'Karnataka', 'Hubli-Dharwad', 'KA-DHD')
ON DUPLICATE KEY UPDATE district_name=VALUES(district_name);

-- Facilities
INSERT INTO facilities (id, name, icon) VALUES
(1, 'Hostel', 'home'),
(2, 'Library', 'book-open'),
(3, 'Wi-Fi', 'wifi'),
(4, 'Computer Lab', 'laptop'),
(5, 'Sports Complex', 'activity'),
(6, 'Canteen', 'coffee'),
(7, 'Transportation / Bus', 'truck'),
(8, 'Placement Cell', 'briefcase'),
(9, 'Auditorium', 'film'),
(10, 'Gymnasium', 'award')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Courses
INSERT INTO courses (id, name, short_code, category, duration, general_eligibility) VALUES
(1, 'Bachelor of Computer Applications', 'BCA', 'Computer Applications', '3 Years', '10+2 / PUC with Mathematics / Computer Science / Statistics or equivalent with min 45% aggregate.'),
(2, 'Bachelor of Commerce', 'B.Com', 'Commerce', '3 Years', '10+2 / PUC Commerce or equivalent stream with min 40% aggregate.'),
(3, 'Bachelor of Business Administration', 'BBA', 'Management', '3 Years', '10+2 / PUC in any stream from a recognized board with min 45% aggregate.'),
(4, 'Master of Computer Applications', 'MCA', 'Computer Applications', '2 Years', 'BCA / B.Sc (CS/IT) or graduation with Mathematics at 10+2 level with min 50% aggregate (PGCET / KMAT).'),
(5, 'Master of Business Administration', 'MBA', 'Management', '2 Years', 'Bachelor degree in any discipline with min 50% aggregate (PGCET / KMAT / CAT / MAT).'),
(6, 'Bachelor of Science (Computer Science)', 'B.Sc (CS)', 'Science', '3 Years', '10+2 / PUC Science with Mathematics and Physics/CS with min 45% aggregate.'),
(7, 'Bachelor of Engineering (Computer Science)', 'BE / B.Tech (CS)', 'Engineering', '4 Years', '10+2 / PUC with Physics, Mathematics, Chemistry with min 45% aggregate (KCET / COMEDK).'),
(8, 'Bachelor of Science (Data Science)', 'B.Sc (DS)', 'Science', '3 Years', '10+2 / PUC Science with Mathematics with min 50% aggregate.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Default Demo Users (Password: EduFind@123)
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
(1, 'System Administrator', 'admin@edufind.ac.in', '$2b$12$Q.YIIh9K8lX00wlR9UnHNeL3Cr.ip4GwvFhduz4eIhY2UEtrxS9oq', 'super_admin', NOW()),
(2, 'Siddaganga Institute Admin', 'sit.admin@edufind.ac.in', '$2b$12$Q.YIIh9K8lX00wlR9UnHNeL3Cr.ip4GwvFhduz4eIhY2UEtrxS9oq', 'college_admin', NOW()),
(3, 'Rahul Sharma (Student)', 'rahul.student@gmail.com', '$2b$12$Q.YIIh9K8lX00wlR9UnHNeL3Cr.ip4GwvFhduz4eIhY2UEtrxS9oq', 'student', NOW()),
(4, 'Priya K (Student)', 'priya.k@gmail.com', '$2b$12$Q.YIIh9K8lX00wlR9UnHNeL3Cr.ip4GwvFhduz4eIhY2UEtrxS9oq', 'student', NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Colleges
INSERT INTO colleges (id, district_id, name, slug, description, address, college_type, established_year, affiliation, accreditation, website, phone, email, latitude, longitude, image_url, banner_url, verified, last_updated) VALUES
(1, 1, 'Siddaganga Institute of Technology (SIT)', 'sit-tumkur', 
 'Siddaganga Institute of Technology is an autonomous engineering and computer applications institute in Tumkur established in 1963. Run by Sri Siddaganga Education Society, it offers top-tier BCA, MCA, and Engineering programs with stellar placement records.', 
 'B.H. Road, Gandhi Nagar, Tumkur, Karnataka 572103', 'Autonomous', 1963, 'Visvesvaraya Technological University (VTU)', 'NAAC A++', 
 'http://www.sit.ac.in', '+91 816 2282696', 'principal@sit.ac.in', 13.32890000, 77.12650000, 
 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80', 
 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80', TRUE, NOW()),

(2, 1, 'Sri Siddhartha Institute of Management Studies (SSIMS)', 'ssims-tumkur', 
 'SSIMS Tumkur is a premier private management institute part of Sri Siddhartha Academy of Higher Education (Deemed University). Providing exceptional MBA and BBA training with an active industry connection and smart digital labs.', 
 'Maralur, Kunigal Road, Tumkur, Karnataka 572105', 'Private', 1997, 'Sri Siddhartha Academy of Higher Education', 'NAAC A', 
 'http://www.ssims.edu.in', '+91 816 2201073', 'info@ssims.edu.in', 13.31500000, 77.09800000, 
 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', 
 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', TRUE, NOW()),

(3, 1, 'Government First Grade College (GFGC), Tumkur', 'gfgc-tumkur', 
 'GFGC Tumkur is a leading government institution providing affordable, quality education in BCA, B.Com, and B.Sc under Tumkur University. Known for experienced faculty, public scholarship aid, and accessible city campus.', 
 'Dr. B.R. Ambedkar Circle, Tumkur, Karnataka 572101', 'Government', 1982, 'Tumkur University', 'NAAC B++', 
 'http://gfgc.kar.nic.in/tumkur', '+91 816 2278450', 'gfgctumkur@gmail.com', 13.34010000, 77.10250000, 
 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80', 
 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', TRUE, NOW()),

(4, 1, 'Tumkur University - University College of Science & Arts', 'tumkur-university', 
 'Tumkur University was established in 2004 to address the higher education needs of Tumkur district. The university constituent colleges provide advanced BCA, MCA, and Science programs with central library facilities and research opportunities.', 
 'B.H. Road, Tumkur, Karnataka 572103', 'University', 2004, 'State University', 'NAAC B', 
 'http://www.tumkuruniversity.ac.in', '+91 816 2254546', 'registrar@tumkuruniversity.ac.in', 13.33200000, 77.11800000, 
 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80', 
 'https://images.unsplash.com/photo-1568792923760-d70635a89fa9?auto=format&fit=crop&w=1200&q=80', TRUE, NOW()),

(5, 1, 'Vidya Vahini First Grade College', 'vidya-vahini-tumkur', 
 'Vidya Vahini First Grade College in Tumkur offers dedicated undergraduate courses in BCA and B.Com with modern computer laboratories, language labs, and specialized placement training seminars.', 
 'Anandanagar, B.H. Road, Tumkur, Karnataka 572102', 'Private', 2000, 'Tumkur University', 'NAAC B+', 
 'http://www.vidyavahini.org', '+91 816 2280590', 'vvfgc@gmail.com', 13.35200000, 77.10800000, 
 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', 
 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80', TRUE, NOW()),

(6, 2, 'Christ (Deemed to be University), Bangalore', 'christ-university-bangalore', 
 'A renowned multidisciplinary university in Bangalore offering nationally ranked BCA, BBA, B.Com, and MCA programs. Known for academic discipline, world-class infrastructure, and top campus placements.', 
 'Hosur Road, Bhavani Nagar, S.G. Palya, Bengaluru, Karnataka 560029', 'University', 1969, 'Deemed University (UGC)', 'NAAC A+', 
 'https://www.christuniversity.in', '+91 80 40129100', 'mail@christuniversity.in', 12.93440000, 77.60590000, 
 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', 
 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80', TRUE, NOW()),

(7, 2, 'BMS College of Engineering', 'bmsce-bangalore', 
 'One of the oldest and most prestigious autonomous engineering and computer institutions in India, established in 1946 in Basavanagudi, Bangalore.', 
 'Bull Temple Road, Basavanagudi, Bengaluru, Karnataka 560019', 'Autonomous', 1946, 'VTU Belagavi', 'NAAC A++', 
 'https://www.bmsce.ac.in', '+91 80 26622130', 'principal@bmsce.ac.in', 12.94160000, 77.56580000, 
 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', 
 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80', TRUE, NOW()),

(8, 3, 'Maharajas College, University of Mysore', 'maharajas-college-mysore', 
 'Historic constituent college of Mysore University established in 1889. Known for affordable tuition fees, experienced faculty, and rich heritage.', 
 'J.L.B. Road, Chamrajpura, Mysuru, Karnataka 570005', 'Government', 1889, 'University of Mysore', 'NAAC A', 
 'http://maharajas.uni-mysore.ac.in', '+91 821 2419244', 'principal@maharajas.ac.in', 12.30390000, 76.64330000, 
 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 
 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', TRUE, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- College Courses & Fees
INSERT INTO college_courses (college_id, course_id, annual_fees, tuition_fee, exam_fee, other_charges, seats, duration, eligibility, admission_details, academic_year) VALUES
(1, 1, 65000.00, 50000.00, 3000.00, 12000.00, 60, '3 Years', 'PUC/10+2 with min 50% in Maths/Statistics', 'Merit based admission through SIT Entrance / Karnataka PUC Marks', '2025-2026'),
(1, 4, 85000.00, 65000.00, 4000.00, 16000.00, 60, '2 Years', 'BCA/B.Sc CS with 50% aggregate + PGCET rank', 'KEA PGCET Counselling and Institutional quota', '2025-2026'),
(1, 7, 110000.00, 85000.00, 5000.00, 20000.00, 180, '4 Years', 'PUC with Physics, Maths, Chem with min 45%', 'KCET / COMEDK Counselling', '2025-2026'),
(2, 3, 50000.00, 40000.00, 2500.00, 7500.00, 60, '3 Years', 'PUC / 10+2 in any stream min 45%', 'Direct application followed by personal interview', '2025-2026'),
(2, 5, 90000.00, 70000.00, 4000.00, 16000.00, 120, '2 Years', 'Graduate in any stream min 50% + KMAT/PGCET', 'Karnataka KMAT / PGCET and SSAHE quota', '2025-2026'),
(3, 1, 18500.00, 12000.00, 1500.00, 5000.00, 90, '3 Years', 'PUC / 10+2 with min 45% aggregate', 'State Government Merit Central Admission Portal (DCE Karnataka)', '2025-2026'),
(3, 2, 8500.00, 5000.00, 1500.00, 2000.00, 180, '3 Years', 'PUC Commerce min 40% aggregate', 'Merit list generated on DCE Karnataka portal', '2025-2026'),
(3, 6, 12000.00, 8000.00, 1500.00, 2500.00, 60, '3 Years', 'PUC Science min 45% aggregate', 'State Government Online Merit Application', '2025-2026'),
(4, 1, 45000.00, 35000.00, 2000.00, 8000.00, 60, '3 Years', 'PUC / 10+2 with min 45% in CS or Maths', 'University direct entrance / merit list', '2025-2026'),
(4, 4, 60000.00, 45000.00, 3000.00, 12000.00, 40, '2 Years', 'BCA/B.Sc degree min 50%', 'PGCET Counselling / University quota', '2025-2026'),
(4, 6, 25000.00, 18000.00, 2000.00, 5000.00, 50, '3 Years', 'PUC Science min 45%', 'Merit rank based seat allocation', '2025-2026'),
(5, 1, 38000.00, 30000.00, 2000.00, 6000.00, 60, '3 Years', 'PUC / 10+2 any stream min 45%', 'Walk-in interview and registration with original marks cards', '2025-2026'),
(5, 2, 22000.00, 16000.00, 2000.00, 4000.00, 80, '3 Years', 'PUC Commerce / Arts min 40%', 'Direct admission on first-come-first-served merit basis', '2025-2026'),
(6, 1, 145000.00, 120000.00, 5000.00, 20000.00, 120, '3 Years', 'PUC / +2 with min 55% in Mathematics', 'Christ University Entrance Test (CUET) + Micro Presentation + PI', '2025-2026'),
(6, 3, 165000.00, 135000.00, 5000.00, 25000.00, 240, '3 Years', 'PUC / +2 with min 60% in any stream', 'CUET + Skill Assessment + Personal Interview', '2025-2026'),
(7, 7, 125000.00, 95000.00, 5000.00, 25000.00, 240, '4 Years', '10+2 / PUC with Physics and Maths min 50%', 'KEA KCET rank / COMEDK UGET counseling', '2025-2026'),
(8, 2, 9500.00, 6000.00, 1500.00, 2000.00, 120, '3 Years', 'PUC / +2 min 45%', 'Mysore University centralized admission portal', '2025-2026')
ON DUPLICATE KEY UPDATE annual_fees=VALUES(annual_fees);

-- Facilities Mapping
INSERT INTO college_facilities (college_id, facility_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 6), (2, 8), (2, 9),
(3, 2), (3, 4), (3, 5), (3, 6), (3, 8),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 8), (4, 9),
(5, 2), (5, 3), (5, 4), (5, 6), (5, 7), (5, 8),
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 7), (6, 8), (6, 9), (6, 10),
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7), (7, 8), (7, 9), (7, 10),
(8, 1), (8, 2), (8, 4), (8, 5), (8, 6), (8, 8)
ON DUPLICATE KEY UPDATE college_id=VALUES(college_id);

-- Placements
INSERT INTO placements (college_id, academic_year, average_package, highest_package, placement_percentage, recruiting_companies) VALUES
(1, '2024-2025', 6.80, 28.50, 88.50, 'TCS, Infosys, Wipro, Cisco, Amazon, Mindtree, Cognizant, Robert Bosch, SLK Software'),
(2, '2024-2025', 4.50, 9.80, 72.00, 'HDFC Bank, ICICI Securities, Muthoot Finance, Reliance Retail, Byjus'),
(3, '2024-2025', 2.80, 4.50, 58.00, 'Infosys BPM, Wipro WILP, Concentrix, Local IT Solutions Tumkur'),
(4, '2024-2025', 4.20, 8.00, 68.50, 'TCS Ignite, Tech Mahindra, Capgemini, SLK Software'),
(5, '2024-2025', 3.20, 5.50, 62.00, 'Wipro, TCS, Karvy Stock Broking, Star Health'),
(6, '2024-2025', 7.50, 22.00, 92.00, 'Deloitte, EY, Goldman Sachs, Microsoft, Infosys, Morgan Stanley'),
(7, '2024-2025', 8.20, 36.00, 91.50, 'Google, Microsoft, Amazon, Cisco, Intel, Texas Instruments, Oracle'),
(8, '2024-2025', 3.50, 6.00, 55.00, 'State Bank of India, Infosys, TVS Motors, Canara Bank');

-- Reviews
INSERT INTO ratings (college_id, user_id, overall_rating, academics_rating, faculty_rating, infrastructure_rating, placement_rating, hostel_rating, value_rating, review_title, review, status, created_at) VALUES
(1, 3, 4.7, 4.8, 4.7, 4.6, 4.8, 4.2, 4.9, 'Top Tier College in Tumkur for BCA and Computer Sciences', 
 'Studying BCA at SIT Tumkur has been a fantastic experience. The coding labs are state of the art, high speed internet is available across campus, and companies like TCS, Cisco, and Infosys recruit directly. Faculty members are friendly and have immense research knowledge.', 'approved', NOW()),

(1, 4, 4.5, 4.5, 4.4, 4.6, 4.5, 4.0, 4.7, 'Great Placement Cell & Campus Life', 
 'The placement training starts from the 4th semester with aptitude and coding rounds. Hostel food is decent and library has more than 1 lakh books with digital IEEE access. Highly recommended for students wanting good career growth.', 'approved', NOW()),

(3, 3, 4.1, 4.2, 4.3, 3.8, 3.7, 3.5, 4.9, 'Extremely Affordable with Good Faculty Guidance', 
 'At under 20,000 per year, GFGC Tumkur offers extraordinary value for BCA students. Teachers take classes regularly and guide for government exams as well as IT recruitment drives.', 'approved', NOW()),

(6, 4, 4.8, 4.9, 4.8, 5.0, 4.9, 4.5, 4.2, 'Exceptional Professional Exposure and Projects', 
 'Christ University BCA syllabus is continuously updated to match cloud computing, AI, and full-stack development trends. Great extracurricular exposure and corporate placements.', 'approved', NOW());
