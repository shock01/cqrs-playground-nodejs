#!/usr/bin/env bash
echo -n "connecting to db..."
until timeout 1000 bash -c "</dev/tcp/$DB_HOST/3306"; do :; done
echo "connected";

echo -n "connecting to rabbitmq..."
until timeout 1000 bash -c "</dev/tcp/$RABBITMQ_HOST/5672"; do :; done
echo "connected";

echo "\n***** starting client *****"
echo -n "running db migration..."
mysql --user=$DB_USER \
      --password=$DB_PASSWORD \
      --host=$DB_HOST $DB_NAME \
      --database=$DB_NAME \
      < infrastructure/mariadb/migrations/V1_0__create_events_table.sql

echo "done!"
echo "starting application"


# node index.js
exec supervisor index.js
