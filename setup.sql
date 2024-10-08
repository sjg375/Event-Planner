DROP DATABASE IF EXISTS eventplanner;
CREATE DATABASE eventplanner;
\c eventplanner
DROP TABLE IF EXISTS users;
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);
DROP TABLE IF EXISTS events;
CREATE TABLE events(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(200) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    description VARCHAR(3000) NOT NULL
);
DROP TABLE IF EXISTS attendees;
CREATE TABLE attendees(
    id SERIAL PRIMARY KEY
    user_id int,
    event_id int,
)

