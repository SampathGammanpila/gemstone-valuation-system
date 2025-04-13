#!/bin/bash

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-vikum5723}
DB_NAME=${DB_NAME:-gemstone_valuation}

# Create database if it doesn't exist
echo "Creating database $DB_NAME if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

# Apply migrations
echo "Applying migrations..."
for migration in ../migrations/*.sql; do
    echo "Applying migration: $migration"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migration
done

echo "Database setup complete!"
