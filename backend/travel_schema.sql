CREATE DATABASE IF NOT EXISTS travel_agency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_agency;

CREATE TABLE IF NOT EXISTS travel_destinations (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    category       VARCHAR(24) NOT NULL,
    description    VARCHAR(255) NOT NULL,
    price_label    VARCHAR(80) NOT NULL,
    gradient_start CHAR(7) NOT NULL DEFAULT '#0f7c8a',
    gradient_end   CHAR(7) NOT NULL DEFAULT '#7fd1c7',
    is_active      TINYINT(1) NOT NULL DEFAULT 1,
    sort_order     INT NOT NULL DEFAULT 0,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_travel_destination_name (name)
);

CREATE TABLE IF NOT EXISTS travel_enquiries (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    destination_id   INT DEFAULT NULL,
    destination_name VARCHAR(100) NOT NULL,
    full_name        VARCHAR(120) NOT NULL,
    email            VARCHAR(190) NOT NULL,
    travellers       TINYINT UNSIGNED NOT NULL,
    notes            TEXT DEFAULT NULL,
    status           ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_travel_enquiry_destination
        FOREIGN KEY (destination_id) REFERENCES travel_destinations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS travel_settings (
    setting_key   VARCHAR(60) PRIMARY KEY,
    setting_value TEXT NOT NULL
);

INSERT IGNORE INTO travel_destinations
    (name, category, description, price_label, gradient_start, gradient_end, sort_order)
VALUES
    ('Maldives', 'beach', '6 nights · overwater villa', '₹1,45,000', '#0f7c8a', '#7fd1c7', 1),
    ('Goa', 'beach', '4 nights · beachfront stay', '₹32,000', '#1d6f8c', '#f0b36a', 2),
    ('Ladakh', 'mountain', '7 nights · Leh, Nubra, Pangong', '₹58,000', '#37507a', '#c9b79c', 3),
    ('Switzerland', 'mountain', '7 nights · Lucerne to Zermatt', '₹2,10,000', '#2b5c8a', '#b9d3e6', 4),
    ('Rajasthan', 'culture', '8 nights · Jaipur, Jodhpur, Udaipur', '₹64,000', '#8a3d2b', '#e9b44c', 5),
    ('Kyoto', 'culture', '6 nights · temples and tea houses', '₹1,60,000', '#5b3a5e', '#e6a3a8', 6),
    ('Singapore', 'city', '4 nights · food and gardens', '₹85,000', '#16405a', '#5fb3a1', 7),
    ('Lisbon', 'city', '5 nights · trams and tiles', '₹1,25,000', '#8a6a1f', '#6fa4c4', 8);

INSERT IGNORE INTO travel_settings (setting_key, setting_value) VALUES
    ('hero_title', 'Trips planned by people who’ve actually been there.'),
    ('hero_intro', 'Tell us what kind of trip you want. We build the route, book everything and stay on call while you travel.'),
    ('destinations_title', 'Where our travellers are heading'),
    ('destinations_intro', 'Every package is a starting point. We adjust dates, hotels and pace to fit you.'),
    ('why_title', 'What you get when you book with us'),
    ('why_intro', 'A small team, one point of contact, and no surprise charges.'),
    ('benefit_one_title', 'One planner, start to finish'),
    ('benefit_one_copy', 'You talk to the same person from first call to touchdown back home.'),
    ('benefit_two_title', 'Clear pricing'),
    ('benefit_two_copy', 'Flights, stays, transfers and activities listed line by line before you pay.'),
    ('benefit_three_title', 'Help on the ground'),
    ('benefit_three_copy', 'A real person answers our 24-hour travel line if plans change.'),
    ('plan_title', 'Plan your trip'),
    ('plan_intro', 'Share a few details and a planner will reply within one working day.'),
    ('contact_email', '20shreyas@gmail.com'),
    ('contact_phone', '+91 80 5550 0142');
