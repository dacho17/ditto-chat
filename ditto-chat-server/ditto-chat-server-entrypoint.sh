#!/bin/sh

entrypoint() {
    echo "About to Run Database Migrations...Delaying it for 10 seconds, to allow Database to Restart after Initial Setup"
    sleep 10

    mvn clean compile
    echo "Running Database Migrations..."
    mvn flyway:migrate

    echo "Running Ditto Chat Server..."
    mvn spring-boot:run -Dspring-boot.run.jvmArguments='-agentlib:jdwp=transport=dt_socket,suspend=n,server=y,address=*:5005,allow=*'
}

# Call your shell function
entrypoint
