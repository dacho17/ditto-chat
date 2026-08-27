#!/bin/sh

DITTO_CHAT_DOCKER_COMPOSE_PATH="./ditto-chat-docker-compose.yaml"
TEST_DITTO_CHAT_DOCKER_COMPOSE_PATH="./test-ditto-chat-docker-compose.yaml"
DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME="ditto-chat-docker-compose"
TEST_DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME="test-ditto-chat-docker-compose"
DITTO_CHAT_DOCKER_COMPOSE_PROJECT_DIRECTORY="$(pwd)"

. ./scripts/utils.sh || exit 1

# Function which Returns Flag Indicating whether Docker Compose is Running
is_ditto_chat_already_running() {
    # Lists Running Docker Containers within Docker Compose Network, and returns number of those Containers
    RUNNING_CONTAINERS=$(docker compose \
        --project-name $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME \
        --file $DITTO_CHAT_DOCKER_COMPOSE_PATH \
        stats --format json --no-stream)
    check_exit_code_and_exit_if_error docker-compose-stats $?

    if [ -n $RUNNING_CONTAINERS ]; then
        return 0
    fi

    RUNNING_CONTAINERS_COUNTER=$(echo "$RUNNING_CONTAINERS" | wc --lines)
    if [ $RUNNING_CONTAINERS_COUNTER -gt 0 ]; then
        return 1
    fi

    return 0
}

# Function used to Run Docker Compose Network
run_ditto_chat_docker_compose() {
    echo "Running Ditto Chat Docker Compose..." >&1
    docker compose \
        --project-name $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME \
        --project-directory $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_DIRECTORY \
        --file $DITTO_CHAT_DOCKER_COMPOSE_PATH up \
        --build \
        --detach \
        --wait
    check_exit_code_and_exit_if_error docker-compose-up $?

    return 0
}

# Function used to Start Docker Compose Services
start_ditto_chat_docker_compose() {
    echo "Starting Ditto Chat Docker Compose Services..." >&1
    docker compose \
        --project-name $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME \
        --file $DITTO_CHAT_DOCKER_COMPOSE_PATH \
        start
    check_exit_code_and_exit_if_error docker-compose-start $?

    return 0
}

# Function used to Stop Docker Compose
stop_ditto_chat_docker_compose() {
    echo "Stopping Ditto Chat Docker Compose..." >&1

    docker compose \
        --project-name $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME \
        --file $DITTO_CHAT_DOCKER_COMPOSE_PATH \
        stop
    check_exit_code_and_exit_if_error docker-compose-stop $?

    return 0
}

# Function used to Delete Docker Compose Resources, including Db and Redis Docker Volumes
delete_ditto_chat_docker_compose() {
    echo "Deleting Ditto Chat Docker Compose Containers and Db and Redis Volumes..." >&1
    docker compose \
        --project-name $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME \
        --project-directory $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_DIRECTORY \
        --file $DITTO_CHAT_DOCKER_COMPOSE_PATH \
        down
    check_exit_code_and_exit_if_error docker-compose-down $?

    docker volume remove ditto-chat-db-volume
    check_exit_code_and_exit_if_error docker-volume-remove-db-volume $?

    docker volume remove ditto-chat-redis-volume
    check_exit_code_and_exit_if_error docker-volume-remove-redis-volume $?

    return 0
}

# Function used to Run Ditto Chat Unit and Integration Tests against Test Database within Docker Compose Network
run_ditto_chat_tests() {
    echo "Running Test Ditto Chat Docker Compose..." >&1
    docker compose \
        --project-name $TEST_DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME \
        --project-directory $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_DIRECTORY \
        --file $TEST_DITTO_CHAT_DOCKER_COMPOSE_PATH up \
        --build \
        --exit-code-from test-ditto-chat-server

    TEST_CONTAINER_EXIT_CODE=$?
    if [ $TEST_CONTAINER_EXIT_CODE -ne 0 ]; then
        echo "**********************************************************" >&2
        echo " Ditto Chat Tests Returned Failure Exit Code $TEST_CONTAINER_EXIT_CODE " >&2
        echo "**********************************************************" >&2
    else
        echo "**********************************************************" >&1
        echo "        Ditto Chat Tests Returned Success Exit Code       " >&1
        echo "**********************************************************" >&1
    fi

    echo "Deleting Test Containers..." >&1
    docker compose \
        --project-name $TEST_DITTO_CHAT_DOCKER_COMPOSE_PROJECT_NAME \
        --project-directory $DITTO_CHAT_DOCKER_COMPOSE_PROJECT_DIRECTORY \
        --file $TEST_DITTO_CHAT_DOCKER_COMPOSE_PATH \
        down
    check_exit_code_and_exit_if_error docker-compose-down $?

    echo "Test Containers have been deleted..." >&1

    docker volume prune --force    # removes mysql anonymous volume
    check_exit_code_and_exit_if_error docker-volume-prune $?

    echo "Annonymous Docker Volume used by MYSQL Database during Tests has been Deleted!" >&1

    echo "Docker Compose Resources used to Run Ditto Chat Tests have been Deleted!" >&1
    return 0
}

migrate_ditto_chat_database() {
    echo "Migrating Ditto Chat Database..." >&1

    # flyway_schema_history Table is created if it does not exist when flyway:migrate is Ran
    docker exec ditto-chat-server \
        mvn flyway:migrate
    check_exit_code_and_exit_if_error docker-exec-flyway-migrate $?

    return 0
}

repair_failed_ditto_chat_database_migration() {
    echo "Repairing failed Ditto Chat Database Migration..." >&1

    # flyway_schema_history Table is created if it does not exist when flyway:migrate is Ran
    docker exec ditto-chat-server \
        mvn flyway:repair
    check_exit_code_and_exit_if_error docker-exec-flyway-repair $?

    return 0
}

# Main Function
MAIN_NR_OF_ARGS=1
if [ $# -ne $MAIN_NR_OF_ARGS ]; then
    echo "Expected number of Arguments for the Script is ${MAIN_NR_OF_ARGS}" >&2
    exit 1
fi

FUNCTION_TO_CALL=$1
if [ $FUNCTION_TO_CALL = "run" ]; then
    is_ditto_chat_already_running
    IS_DOCKER_COMPOSE_ALREADY_RUNNING=$?

    if [ $IS_DOCKER_COMPOSE_ALREADY_RUNNING -eq 1 ]; then
        echo "**********************************************************" >&1
        echo "      Ditto Chat Docker Compose is already running        " >&1
        echo "**********************************************************" >&1
        exit 1
    fi

    run_ditto_chat_docker_compose
    exit 0
elif [ $FUNCTION_TO_CALL = "start" ]; then
    is_ditto_chat_already_running
    IS_DOCKER_COMPOSE_ALREADY_RUNNING=$?

    if [ $IS_DOCKER_COMPOSE_ALREADY_RUNNING -eq 1 ]; then
        echo "**********************************************************" >&1
        echo "      Ditto Chat Docker Compose is already running        " >&1
        echo "**********************************************************" >&1
        exit 1
    fi

    start_ditto_chat_docker_compose
    exit 0
elif [ $FUNCTION_TO_CALL = "stop" ]; then
    stop_ditto_chat_docker_compose
    exit 0
elif [ $FUNCTION_TO_CALL = "delete" ]; then
    delete_ditto_chat_docker_compose
    exit 0
elif [ $FUNCTION_TO_CALL = "test" ]; then
    run_ditto_chat_tests
    exit 0
elif [ $FUNCTION_TO_CALL = "migrate" ]; then
    migrate_ditto_chat_database
    exit 0
elif [ $FUNCTION_TO_CALL = "repair-migration" ]; then
    repair_failed_ditto_chat_database_migration
    exit 0
else
    echo "An unknown Argument has been received!" >&2
    exit 1
fi
