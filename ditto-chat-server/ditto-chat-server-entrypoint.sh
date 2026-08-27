#!/bin/sh

entrypoint() {
    ENTYPOINT_CALL_MODE=$1
    if [ $ENTYPOINT_CALL_MODE = "serve" ]; then
        run_migrations

        echo "Running Ditto Chat Server..." >&1
        mvn spring-boot:run -Dspring-boot.run.jvmArguments='-agentlib:jdwp=transport=dt_socket,suspend=n,server=y,address=*:5005,allow=*'
    elif [ $ENTYPOINT_CALL_MODE = "test" ]; then
        run_migrations

        echo "Running Ditto Chat Server Tests..." >&1
        mvn test
    else
        echo "An unknown Entrypoint Argument has been received!" >&2
        exit 1
    fi

    return 0
}

run_migrations() {
    echo "About to Run Database Migrations...Delaying it for 10 seconds, to allow Database to Restart after Initial Setup" >&1
    sleep 10

    mvn compile
    echo "Running Database Migrations..." >&1
    mvn flyway:migrate

    echo "Database Migrations Ran!" >&1
    return 0
}


ENTRYPOINT_NR_OF_ARGS=1
if [ $# -ne $ENTRYPOINT_NR_OF_ARGS ]; then
    echo "Expected number of Entrypoint Arguments is ${ENTRYPOINT_NR_OF_ARGS}" >&2
    exit 1
fi

entrypoint $1
