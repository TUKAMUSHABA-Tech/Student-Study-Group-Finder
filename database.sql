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
-- MASTER ADMINISTRATOR ACCOUNT
-- Admin: TUKAMUSHABA BAKER
-- Email: bakertukamushaba905@gmail.com  |  Password: Baker@123
-- =====================================================================

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `programme`, `year_of_study`, `role`) VALUES
(1, 'TUKAMUSHABA BAKER', 'bakertukamushaba905@gmail.com', '$2a$10$6C.GdoC5bQyAC4oeusn3i.SYjdbMyGEAbMdup2Msh6LNgP4O35Gnm', 'Administration', 1, 'admin');

