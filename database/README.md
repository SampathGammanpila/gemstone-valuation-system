# Gemstone Database

This directory contains the database schema, migrations, and seed data for the gemstone valuation and management system.

## Directory Structure

- `migrations/`: Database migration files to progressively update the schema
- `scripts/`: Utility scripts for database maintenance
- `schema/`: Complete database schema definitions
  - `tables/`: Table definitions
  - `views/`: View definitions
  - `functions/`: Stored procedures and functions
  - `indexes/`: Index definitions
- `seed/`: Initial data for database population

## Setup Instructions

1. Create a new PostgreSQL database
2. Run the migration files in numerical order
3. Run the seed-data.sh script to populate reference data

## Backup and Restore

Use the provided backup.sh and restore.sh scripts for database maintenance.
