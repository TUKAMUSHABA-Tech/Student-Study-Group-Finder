-- =====================================================================
-- UGANDA CHRISTIAN UNIVERSITY (UCU)
-- Faculty of Science and Technology
-- Department of Computing and Technology
-- Course Unit: Web and Mobile Application Development
-- Project: Student Study Group Finder
-- Database Initialization & Schema Script
-- =====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `student_study_group_finder` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `student_study_group_finder`;

-- Disable foreign key checks for clean recreation if script is re-run
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `study_sessions`;
DROP TABLE IF EXISTS `memberships`;
DROP TABLE IF EXISTS `study_groups`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Table 1: users
-- Stores all registered university students, group leaders, and admins
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `programme` VARCHAR(120) NOT NULL,
  `year_of_study` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `role` ENUM('student', 'leader', 'admin') NOT NULL DEFAULT 'student',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 2: study_groups
-- Stores academic study pods created by students/leaders
-- ---------------------------------------------------------------------
CREATE TABLE `study_groups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `course_code` VARCHAR(50) NOT NULL,
  `faculty` VARCHAR(120) NOT NULL,
  `description` TEXT NOT NULL,
  `meeting_location` VARCHAR(150) NOT NULL,
  `leader_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_groups_faculty` (`faculty`),
  KEY `idx_groups_course` (`course_code`),
  CONSTRAINT `fk_groups_leader` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 3: memberships
-- Tracks which students have joined which study groups
-- ---------------------------------------------------------------------
CREATE TABLE `memberships` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `group_id` INT UNSIGNED NOT NULL,
  `role` ENUM('member', 'leader') NOT NULL DEFAULT 'member',
  `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_group` (`user_id`, `group_id`),
  KEY `idx_memberships_user` (`user_id`),
  KEY `idx_memberships_group` (`group_id`),
  CONSTRAINT `fk_mem_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mem_group` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 4: study_sessions
-- Structured revision meetings, seminars, and peer-learning schedules
-- ---------------------------------------------------------------------
CREATE TABLE `study_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `session_date` DATE NOT NULL,
  `session_time` TIME NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_group` (`group_id`),
  KEY `idx_sessions_date` (`session_date`),
  CONSTRAINT `fk_sessions_group` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sessions_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 5: posts
-- Group communication: questions, discussions, announcements
-- ---------------------------------------------------------------------
CREATE TABLE `posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `content` TEXT NOT NULL,
  `post_type` ENUM('discussion', 'announcement', 'question') NOT NULL DEFAULT 'discussion',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_posts_group` (`group_id`),
  KEY `idx_posts_user` (`user_id`),
  CONSTRAINT `fk_posts_group` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 6: comments
-- Peer replies and answers to specific study group posts
-- ---------------------------------------------------------------------
CREATE TABLE `comments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_post` (`post_id`),
  KEY `idx_comments_user` (`user_id`),
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA FOR TESTING AND ACADEMIC EVALUATION
-- Default password for all seed accounts is: Password123!
-- Bcrypt hash generated with 10 salt rounds:
-- $2a$10$7vW1t2mF2M4wB7E7Gq0s5.5z1e4v3d6F0i1u2y3t4r5e6w7q8a9s0 -> standard test hash
-- We will insert well-known test accounts:
-- 1. admin@ucu.ac.ug (Administrator)
-- 2. baker@ucu.ac.ug (Group Leader / Year 1 BSIT)
-- 3. grace@ucu.ac.ug (Student / Year 1 BSIT)
-- 4. emmanuel@ucu.ac.ug (Student / Year 2 BBA)
-- =====================================================================

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `programme`, `year_of_study`, `role`) VALUES
(1, 'Administrator System', 'admin@ucu.ac.ug', '$2b$10$vY3Bsm1N8YfA9b06y2/jkeGzF.Z/9uE4u8QGfEeVZ0X9qQvCsh0pW', 'Administration', 1, 'admin'),
(2, 'Baker Mugisa', 'baker@ucu.ac.ug', '$2b$10$vY3Bsm1N8YfA9b06y2/jkeGzF.Z/9uE4u8QGfEeVZ0X9qQvCsh0pW', 'Bachelor of Science in Information Technology', 1, 'leader'),
(3, 'Grace Atuhaire', 'grace@ucu.ac.ug', '$2b$10$vY3Bsm1N8YfA9b06y2/jkeGzF.Z/9uE4u8QGfEeVZ0X9qQvCsh0pW', 'Bachelor of Science in Information Technology', 1, 'student'),
(4, 'Emmanuel Kigozi', 'emmanuel@ucu.ac.ug', '$2b$10$vY3Bsm1N8YfA9b06y2/jkeGzF.Z/9uE4u8QGfEeVZ0X9qQvCsh0pW', 'Bachelor of Business Administration', 2, 'student'),
(5, 'Sarah Nambatya', 'sarah@ucu.ac.ug', '$2b$10$vY3Bsm1N8YfA9b06y2/jkeGzF.Z/9uE4u8QGfEeVZ0X9qQvCsh0pW', 'Bachelor of Laws', 1, 'student');

-- Seed Study Groups
INSERT INTO `study_groups` (`id`, `name`, `course_code`, `faculty`, `description`, `meeting_location`, `leader_id`) VALUES
(1, 'Web Development Mastery Group', 'BIT 1101', 'Faculty of Science and Technology', 'Dedicated group for Year One IT students mastering HTML5, CSS3, JavaScript, React.js and Express backend concepts.', 'Main Library Discussion Room 3 & Zoom', 2),
(2, 'Structured C++ Programming Hub', 'BIT 1102', 'Faculty of Science and Technology', 'Collaborative peer code reviews, debugging pointers, arrays, functions, and exam prep for C++.', 'Tech Lab 2 (Nkoyoyo Hall)', 2),
(3, 'Business Accounting & Finance Study Pod', 'BBA 1104', 'Faculty of Business and Administration', 'Weekly practice group balancing ledgers, financial statements, cashflow modeling, and mid-semester revision.', 'Ham Mukasa Library Ground Floor', 4),
(4, 'Constitutional Law Forum', 'LAW 1100', 'Faculty of Law', 'Analysis of landmark Ugandan constitutional cases, moot court preparations, and essay writing discussions.', 'Bishop Tucker Hall Room 12', 5);

-- Seed Memberships
INSERT INTO `memberships` (`user_id`, `group_id`, `role`) VALUES
(2, 1, 'leader'),
(3, 1, 'member'),
(4, 1, 'member'),
(2, 2, 'leader'),
(3, 2, 'member'),
(4, 3, 'leader'),
(5, 4, 'leader');

-- Seed Study Sessions
INSERT INTO `study_sessions` (`id`, `group_id`, `title`, `session_date`, `session_time`, `location`, `description`, `created_by`) VALUES
(1, 1, 'React State Management & Props Review', CURDATE() + INTERVAL 2 DAY, '15:00:00', 'Library Discussion Room 3', 'Hands-on session covering useState, useEffect, and passing data between components.', 2),
(2, 1, 'Express.js & MySQL Integration Lab', CURDATE() + INTERVAL 5 DAY, '16:30:00', 'Online via Zoom (link in group chat)', 'Connecting backend controllers to MySQL using mysql2 pool with parameterized queries.', 2),
(3, 2, 'C++ Pointers and Dynamic Memory Workshop', CURDATE() + INTERVAL 3 DAY, '14:00:00', 'Tech Lab 2', 'Tackling past exam questions on memory allocation, structs, and linked lists.', 2),
(4, 3, 'Cash Flow Statement Practice Session', CURDATE() + INTERVAL 4 DAY, '10:00:00', 'Ham Mukasa Library Pod 4', 'Solving Chapter 5 practice exercises before the test.', 4);

-- Seed Posts
INSERT INTO `posts` (`id`, `group_id`, `user_id`, `title`, `content`, `post_type`) VALUES
(1, 1, 2, 'Welcome to the Web & Mobile App Study Pod!', 'Hello everyone! Let us use this group to share code snippets, organize revision meetings, and help each other debug our assignments.', 'announcement'),
(2, 1, 3, 'Question about React useEffect dependency array', 'Could someone explain why omitting dependencies in useEffect causes infinite re-renders? Looking forward to our next meeting!', 'question'),
(3, 1, 2, 'Upcoming Mid-Semester Test Preparation', 'Please review the official course outline on Moodle. We will cover JWT tokens and MySQL foreign keys during our Wednesday session.', 'discussion'),
(4, 2, 2, 'Reminder: Bring your laptops with GCC / Dev-C++ installed', 'For Thursday session, please make sure you have your compiler setup ready to test pointer programs.', 'announcement');

-- Seed Comments
INSERT INTO `comments` (`id`, `post_id`, `user_id`, `content`) VALUES
(1, 2, 2, 'Great question Grace! If you omit the dependency array completely, the effect runs after every single render. If that effect updates state, it triggers a new render, creating an infinite loop!'),
(2, 2, 4, 'Thanks Baker for clarifying! That helped me fix my dashboard component as well.'),
(3, 3, 3, 'Noted! I will prepare some sample SQL queries with foreign keys for us to test.');
