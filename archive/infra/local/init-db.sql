-- Create database
CREATE DATABASE IF NOT EXISTS stakevue;
USE stakevue;

-- The tables will be auto-created by TypeORM synchronize
-- This file is just to ensure the database exists

-- Grant permissions
GRANT ALL PRIVILEGES ON stakevue.* TO 'root'@'%';
FLUSH PRIVILEGES;
