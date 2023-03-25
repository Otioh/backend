-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 25, 2023 at 10:05 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `microskool`
--

-- --------------------------------------------------------

--
-- Table structure for table `allcourse`
--

CREATE TABLE `allcourse` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `title` text NOT NULL,
  `campus` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `level` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `allcourse`
--

INSERT INTO `allcourse` (`id`, `code`, `title`, `campus`, `department`, `level`, `user`) VALUES
(1, 'GSS101', 'Use of English', 'unical', 'General Studies', '100', 'bryonerim@yahoo.com'),
(2, 'GSS222', 'English', 'unical', 'General Studies', '200', 'bryonerim@yahoo.com'),
(3, 'GSS212', 'Computer Applicattions', 'unical', 'General Studies', '200', 'bryonerim@yahoo.com'),
(4, '', '', 'unical', '', '', 'bryonerim@yahoo.com'),
(5, 'CSC101', 'Introduction to Computer Science', 'unical', '', '', 'bryonerim@yahoo.com'),
(6, 'CSC181', 'Computer Lab 1A', 'unical', '', '', 'bryonerim@yahoo.com'),
(7, 'CSC281', 'Computer Lab 1A', 'unical', '', '', 'bryonerim@yahoo.com'),
(8, 'CSC201', 'Computer Programming', 'unical', '', '200', 'bryonerim@yahoo.com'),
(9, 'undefined', 'undefined', 'unical', 'undefined', 'undefined', 'bryonerim@yahoo.com'),
(10, 'FBS111', 'Firsta Business', 'unical', 'Computer Science', '100', 'bryonerim@yahoo.com'),
(11, 'FBS101', 'Firsta Business', 'unical', 'Computer Science', '100', 'bryonerim@yahoo.com'),
(12, 'th', 'jh', 'unical', 'General Studies', '100', 'bryonerim@yahoo.com'),
(13, 'EBS111', 'd', 'unical', 'Computer Science', '100', 'bryonerim@gmail.com'),
(14, 'BIO111', 'Biology ', 'unical', 'Computer Science', '200', 'bryonerim@yahoo.com'),
(15, 'GSS121', 'Citizenship Education', 'unical', 'Computer Science', '300', 'bryonerim@gmail.com'),
(16, 'gdjsdh66736', 'rennjm n jvjv v jnjtet', 'unical', '', '200', 'bryonerim@yahoo.com'),
(17, 'MMM101', 'Money', 'unical', 'Computer Science', '100', 'bryonerim@yahoo.com'),
(18, 'CFM', 'Confirm', 'unical', 'Computer Science', '100', 'bryonerim@yahoo.com'),
(19, 'LRL', 'Last ', 'unical', 'Computer Science', '100', 'bryonerim@yahoo.com');

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `course` varchar(255) NOT NULL,
  `questions` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL,
  `deadline` varchar(255) NOT NULL,
  `lecturer` text NOT NULL,
  `user` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `campus` varchar(255) NOT NULL,
  `wrong` int(11) NOT NULL,
  `correct` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campuses`
--

CREATE TABLE `campuses` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `acro` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campuses`
--

INSERT INTO `campuses` (`id`, `name`, `acro`, `user`) VALUES
(1, 'University of Calabar, Calabar', 'unical', 'bryonerim@yahoo.com');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `user`) VALUES
(1, 'Computer Science', 'bryonerim@yahoo.com'),
(2, 'General Studies', 'bryonerim@yahoo.com');

-- --------------------------------------------------------

--
-- Table structure for table `lectures`
--

CREATE TABLE `lectures` (
  `id` int(11) NOT NULL,
  `course` varchar(255) NOT NULL,
  `topic` text NOT NULL,
  `lecturer` text NOT NULL,
  `date` varchar(255) NOT NULL,
  `video` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `campus` varchar(255) NOT NULL,
  `wrong` int(11) NOT NULL,
  `correct` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mycourses`
--

CREATE TABLE `mycourses` (
  `id` int(11) NOT NULL,
  `course` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mycourses`
--

INSERT INTO `mycourses` (`id`, `course`, `user`) VALUES
(139, 'CSC201', 'bryonerim@yahoo.com'),
(165, 'GSS121', 'bryonerim@gmail.com'),
(170, 'GSS121', 'bryonerim@yahoo.com'),
(171, 'FBS111', 'bryonerim@yahoo.com'),
(172, 'GSS101', 'bryonerim@yahoo.com'),
(173, 'GSS222', 'bryonerim@gmail.com'),
(174, 'CSC101', 'bryonerim@gmail.com'),
(175, 'GSS101', 'bryonerim@gmail.com'),
(176, 'CSC181', 'bryonerim@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `schedule`
--

CREATE TABLE `schedule` (
  `id` int(11) NOT NULL,
  `course` varchar(255) NOT NULL,
  `time_in` varchar(255) NOT NULL,
  `time_out` varchar(255) NOT NULL,
  `venue` varchar(255) NOT NULL,
  `day` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `wrong` int(11) NOT NULL,
  `correct` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `item` varchar(255) NOT NULL,
  `description_sender` text NOT NULL,
  `description_receiver` text NOT NULL,
  `sender` varchar(255) NOT NULL,
  `receiver` varchar(255) NOT NULL,
  `amount` float NOT NULL,
  `date` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `transaction_id`, `item`, `description_sender`, `description_receiver`, `sender`, `receiver`, `amount`, `date`, `status`) VALUES
(1, 'T142737788033086', 'Wallet Funded', 'Payment to fund Microskool eNaira wallet', 'Payment to fund Microskool eNaira wallet', 'bryonerim@gmail.com', 'Microskool', 120, 'Fri Mar 24 2023 23:32:48 GMT+0100 (West Africa Standard Time)', 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` text NOT NULL,
  `surname` text NOT NULL,
  `matric` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `institution` text NOT NULL,
  `campus` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `level` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` varchar(255) NOT NULL,
  `verified` varchar(255) NOT NULL,
  `verify_code` varchar(255) NOT NULL,
  `courses` varchar(255) NOT NULL,
  `coins` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `surname`, `matric`, `email`, `password`, `institution`, `campus`, `department`, `level`, `phone`, `image`, `created_at`, `verified`, `verify_code`, `courses`, `coins`) VALUES
(1, 'Emmanuel', 'Erim', '17/04598768', 'bryonerim@yahoo.com', 'bryon3662', 'University of Calabar, Calabar', 'unical', 'Computer Science', '100', '09060966606', 'http://192.168.43.31:5000/assets/bryonerim--0.36334324203079915.jpeg', 'Sat Dec 10 2022 19:20:29 GMT+0100 (West Africa Standard Time)', 'true', '374996', 'undefined', 0),
(2, 'Emmanuel', 'Erim', 'Microskool', 'admin@microskool.com', 'bryon3662', 'University of Calabar, Calabar', 'unical', 'Computer Science', '300', '09060966606', 'http://192.168.43.31:3000/static/media/micro.6086cefcce030d4fb596.png', 'Fri Dec 16 2022 23:17:14 GMT+0100 (West Africa Standard Time)', 'true', '423535', 'CSC306, MTH301', 0),
(4, 'Emmanuel', 'Otioh Erim', '19/0428288266', 'bryonerim@gmail.com', 'bryon3662', 'University of Calabar, Calabar', 'unical', 'Computer Science', '300', '09060966606', 'http://192.168.43.31:5000/assets/bryonerim--0.8886958040761552.jpeg', 'Fri Jan 06 2023 18:00:24 GMT+0100 (West Africa Standard Time)', 'true', '725231', '', 120),
(5, 'Emmanuel', 'Erim', '17/095244017', 'bryonerim@gmail.co', 'bryon3662', 'University of Calabar, Calabar', 'unical', 'Computer Science', '200', '09060966606', '', 'Wed Jan 18 2023 10:48:40 GMT+0100 (West Africa Standard Time)', 'true', '77094', '', 0),
(6, 'Emmanuel', 'Onyo', 'mat', 'emmamos2019@gmail.com', 'bryon362', '', '', '', '', '09083477877', '', 'Thu Mar 16 2023 20:00:08 GMT+0100 (West Africa Standard Time)', 'false', '74719', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `votes`
--

CREATE TABLE `votes` (
  `id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `subject_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `allcourse`
--
ALTER TABLE `allcourse`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `campuses`
--
ALTER TABLE `campuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lectures`
--
ALTER TABLE `lectures`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mycourses`
--
ALTER TABLE `mycourses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `schedule`
--
ALTER TABLE `schedule`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `allcourse`
--
ALTER TABLE `allcourse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campuses`
--
ALTER TABLE `campuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lectures`
--
ALTER TABLE `lectures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mycourses`
--
ALTER TABLE `mycourses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=177;

--
-- AUTO_INCREMENT for table `schedule`
--
ALTER TABLE `schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `votes`
--
ALTER TABLE `votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
