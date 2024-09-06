DROP DATABASE IF EXISTS eventplanner-db;
CREATE DATABASE eventplanner-db;
\c eventplanner-db
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
    description VARCHAR(3000) NOT NULL,
    attendees SET
);

