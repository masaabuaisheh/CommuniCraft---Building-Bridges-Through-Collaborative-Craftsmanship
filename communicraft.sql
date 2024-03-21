-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 21, 2024 at 01:14 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `communicraft`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`comment_id`, `project_id`, `user_id`, `comment_text`, `created_at`) VALUES
(1, 1, 9, 'This is an insightful project!', '2024-03-18 22:48:34');

-- --------------------------------------------------------

--
-- Table structure for table `craftskill`
--

CREATE TABLE `craftskill` (
  `skill_id` int(11) NOT NULL,
  `skill_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `craftskill`
--

INSERT INTO `craftskill` (`skill_id`, `skill_name`) VALUES
(1, 'JavaScript'),
(2, 'HTML'),
(3, 'CSS'),
(4, 'Python');

-- --------------------------------------------------------

--
-- Table structure for table `loginauthentication`
--

CREATE TABLE `loginauthentication` (
  `username` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loginauthentication`
--

INSERT INTO `loginauthentication` (`username`, `password`) VALUES
('Admin', '$2a$10$u/2co98kXW5O0NQW1.i2MOamBof5OS7nYzEyHIrRdtUcuTNKEo6zi'),
('jodi456', '$2a$10$u/2co98kXW5O0NQW1.i2MOamBof5OS7nYzEyHIrRdtUcuTNKEo6zi'),
('lana123', '$2a$10$u/2co98kXW5O0NQW1.i2MOamBof5OS7nYzEyHIrRdtUcuTNKEo6zi'),
('masaabu', '$2a$10$u/2co98kXW5O0NQW1.i2MOamBof5OS7nYzEyHIrRdtUcuTNKEo6zi'),
('nancy', '$2a$10$u/2co98kXW5O0NQW1.i2MOamBof5OS7nYzEyHIrRdtUcuTNKEo6zi'),
('test123', '$2a$10$u/2co98kXW5O0NQW1.i2MOamBof5OS7nYzEyHIrRdtUcuTNKEo6zi'),
('testtt', '$2a$10$EflE0Y8UcM9lZM0OTqLdVO2DlWSA8cc3GZ.qiUf4NS22qGh6S.1qm');

-- --------------------------------------------------------

--
-- Table structure for table `login_user`
--

CREATE TABLE `login_user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_user`
--

INSERT INTO `login_user` (`user_id`, `username`) VALUES
(9, 'Admin'),
(10, 'lana123'),
(11, 'jodi456'),
(12, 'masaabu'),
(31, 'nancy'),
(38, 'test123'),
(39, 'testtt');

-- --------------------------------------------------------

--
-- Table structure for table `material`
--

CREATE TABLE `material` (
  `nameofmaterial` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `date_added` date DEFAULT NULL,
  `project_title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `material`
--

INSERT INTO `material` (`nameofmaterial`, `quantity`, `user_id`, `date_added`, `project_title`) VALUES
('Maerial Name', 1, 38, '2024-03-17', 'Projecttle'),
('testm', 1, 12, '2024-03-17', 'E-commerce Website Redesign'),
('testn', 1, 31, '2024-03-17', 'E-commerce Website Redesign');

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `project_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `group_size` int(11) DEFAULT NULL,
  `showcased` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`project_id`, `title`, `description`, `group_size`, `showcased`) VALUES
(1, 'E-commerce Website Redesign', 'Redesigning the frontend of our e-commerce website to enhance user experience and increase conversions.', 8, 1),
(2, 'Inventory Management System Backend', 'Developing a backend system for managing inventory, orders, and user accounts for our e-commerce platform.', 6, 0),
(3, 'Mobile App Development', 'Creating a mobile application for both iOS and Android platforms to provide users with a seamless experience accessing our services on-the-go.', 10, 0),
(4, 'Data Analytics Dashboard', 'Building a data analytics dashboard to visualize key metrics and trends, empowering stakeholders to make informed decisions based on real-time data insights.', 4, 0);

-- --------------------------------------------------------

--
-- Table structure for table `projectskill`
--

CREATE TABLE `projectskill` (
  `project_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projectskill`
--

INSERT INTO `projectskill` (`project_id`, `skill_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 1),
(2, 4);

-- --------------------------------------------------------

--
-- Table structure for table `project_tasks`
--

CREATE TABLE `project_tasks` (
  `task_id` int(50) NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `project_id` int(50) NOT NULL,
  `assigned_to` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_tasks`
--

INSERT INTO `project_tasks` (`task_id`, `task_name`, `project_id`, `assigned_to`) VALUES
(1, ' proje!', 1, 5),
(2, ' project2!', 1, 5);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `phonenumber` varchar(20) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `messages` text DEFAULT NULL,
  `loggedout` varchar(50) NOT NULL DEFAULT 'Undefined',
  `material` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `bio`, `role`, `token`, `location`, `created_at`, `updated_at`, `phonenumber`, `skills`, `messages`, `loggedout`, `material`) VALUES
(9, 'Admin', 'aeman1868@gmail.com', 'Project admin: driving success, managing resources, fostering collaboration.', 'Admin', NULL, 'Nablus', '2024-03-09 13:02:56', '2024-03-20 14:31:43', '0595948598', 'managing resources', NULL, 'false', NULL),
(10, 'Lana', 'lanajaraa@gmail.com', 'Project Owner: Leading the vision, guiding progress, and ensuring project success.', 'Owner', NULL, 'Nablus', '2024-03-09 13:08:18', '2024-03-20 14:31:43', '0595485320', 'guiding progress', NULL, 'true', NULL),
(11, 'Jodi', 'jodikamal@gmail.com', 'Project Owner: Leading the vision, guiding progress, and ensuring project success.', 'Owner', NULL, 'Nablus', '2024-03-09 13:08:32', '2024-03-20 14:31:43', '0596301204', 'guiding progress', NULL, 'false', NULL),
(12, 'Masa', 'masaabuaisheh@gmail.com', 'Frontend Developer: Crafting seamless user experiences with code, bringing designs to life, and optimizing performance for web applications.', 'User', NULL, 'Nablus', '2024-03-09 13:09:53', '2024-03-20 14:31:43', '0595948598', '[HTML, CSS, JavaScript]', NULL, 'false', NULL),
(31, 'masa-abu', 'masa003@gmail.com', 'Frontend Developer: Crafting seamless user experiences with code, bringing designs to life, and optimizing performance for web applications.', 'User', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozMSwicm9sZSI6IlVzZXIiLCJpYXQiOjE3MTA5ODY2MzMsImV4cCI6MTcxMDk5MDIzM30.iwyvKo01jza30xxfQGiy2iWYIkkm09PvyaZhfPEXp5s', 'Nablus', '2024-03-11 22:20:46', '2024-03-21 02:03:53', '0595948598', '[HTML, CSS, JavaScript]', 'verified successfully', 'false', 't5, '),
(38, 'TestUser', 'test123@gmail.com', 'Frontend Developer: Crafting seamless user experiences with code, bringing designs to life, and optimizing performance for web applications.', 'User', NULL, 'Nablus', '2024-03-15 19:37:01', '2024-03-20 14:31:43', '0595848598', '[HTML, CSS]', 'verified successfully', 'false', NULL),
(39, 'TestUser', 'test123@gmail.com', 'Frontend Developer: Crafting seamless user experiences with code, bringing designs to life, and optimizing performance for web applications.', 'User', 'FaF0O6GiZbn2gxP8SRIgUmed8lzBJvVB', 'Nablus', '2024-03-21 00:57:17', '2024-03-21 00:57:17', '0595848598', '[HTML, CSS]', NULL, 'False', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_project`
--

CREATE TABLE `user_project` (
  `collaboration_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `left_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_project`
--

INSERT INTO `user_project` (`collaboration_id`, `project_id`, `user_id`, `status`, `joined_at`, `left_at`) VALUES
(1, 1, 12, 'Active', '2024-03-07 07:00:00', NULL),
(4, 1, 38, 'Active', '2024-03-15 22:28:13', NULL),
(6, 2, 31, 'Active', '2024-03-15 22:30:05', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `craftskill`
--
ALTER TABLE `craftskill`
  ADD PRIMARY KEY (`skill_id`);

--
-- Indexes for table `loginauthentication`
--
ALTER TABLE `loginauthentication`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `login_user`
--
ALTER TABLE `login_user`
  ADD PRIMARY KEY (`user_id`,`username`),
  ADD KEY `username` (`username`);

--
-- Indexes for table `material`
--
ALTER TABLE `material`
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`project_id`);

--
-- Indexes for table `projectskill`
--
ALTER TABLE `projectskill`
  ADD PRIMARY KEY (`project_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD PRIMARY KEY (`task_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_project`
--
ALTER TABLE `user_project`
  ADD PRIMARY KEY (`collaboration_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `craftskill`
--
ALTER TABLE `craftskill`
  MODIFY `skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `project_tasks`
--
ALTER TABLE `project_tasks`
  MODIFY `task_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `user_project`
--
ALTER TABLE `user_project`
  MODIFY `collaboration_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `login_user`
--
ALTER TABLE `login_user`
  ADD CONSTRAINT `login_user_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `login_user_ibfk_2` FOREIGN KEY (`username`) REFERENCES `loginauthentication` (`username`);

--
-- Constraints for table `material`
--
ALTER TABLE `material`
  ADD CONSTRAINT `material_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `projectskill`
--
ALTER TABLE `projectskill`
  ADD CONSTRAINT `projectskill_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`),
  ADD CONSTRAINT `projectskill_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `craftskill` (`skill_id`);

--
-- Constraints for table `user_project`
--
ALTER TABLE `user_project`
  ADD CONSTRAINT `user_project_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`),
  ADD CONSTRAINT `user_project_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
