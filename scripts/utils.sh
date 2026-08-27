#!/bin/sh

NEWLINE_PLACEHOLDER="__NEWLINE__"
BACKSLASH_PLACEHOLDER="__BACKSLASH__"

# Function used to check whether correct number of Arguments was Received by the Function which Called this one
did_receive_expected_number_of_arguments() {
    DID_RECEIVE_EXPECTED_NUMBER_OF_ARGUMENTS_NR_OF_ARGS=3
    if [ $# -ne $DID_RECEIVE_EXPECTED_NUMBER_OF_ARGUMENTS_NR_OF_ARGS ]; then
		echo "Function did_receive_expected_number_of_arguments received $# Arguments while the Expected number of Arguments is ${DID_RECEIVE_EXPECTED_NUMBER_OF_ARGUMENTS_NR_OF_ARGS}" >&2
		exit 1
	fi

    FUNCTION_NAME=$1
    EXPECTED_NUMBER_OF_ARGUMENTS=$2
    RECEIVED_NUMBER_OF_ARGUMENTS=$3
    
    if [ $RECEIVED_NUMBER_OF_ARGUMENTS -ne $EXPECTED_NUMBER_OF_ARGUMENTS ]; then
		echo "Function ${FUNCTION_NAME} received ${RECEIVED_NUMBER_OF_ARGUMENTS} Arguments while the Expected number of Arguments is ${EXPECTED_NUMBER_OF_ARGUMENTS}" >&2
		exit 1
	fi

    return 0
}
# Function used to check Exit Code of the Previously Called Command, and Exit if the Exit Code is not Successful
check_exit_code_and_exit_if_error() {
    CHECK_EXIT_CODE_AND_EXIT_IF_ERROR_NR_OF_ARGS=2
    if [ $# -ne $CHECK_EXIT_CODE_AND_EXIT_IF_ERROR_NR_OF_ARGS ]; then
		echo "Function check_exit_code_and_exit_if_error received $# Arguments while the Expected number of Arguments is ${CHECK_EXIT_CODE_AND_EXIT_IF_ERROR_NR_OF_ARGS}" >&2
		exit 1
	fi

    FUNCTION_NAME=$1
    RETURNED_EXIT_CODE=$2

    if [ $RETURNED_EXIT_CODE -ne 0 ]; then
		echo "Function ${FUNCTION_NAME} Returned an Error Exit Code: ${RETURNED_EXIT_CODE}" >&2
        echo "Script is Exiting with Exit Code 1" >&2
		exit 1
	fi

    return 0
}

# Function used to Read an Environment Variable from .env File
read_environment_variable() {
    did_receive_expected_number_of_arguments read_environment_variable 2 $#
    ENV_VAR_NAME=$1
    ENV_VAR_FILE_PATH=$2
    
    ENV_VAR_VALUE=$(grep -E "^$ENV_VAR_NAME=" $ENV_VAR_FILE_PATH | grep -E -o '=.+' | cut -c 2-)
    echo "$ENV_VAR_VALUE" | grep -E '[ ]+' >/dev/null # If Whitespace is Found, Exit Code from Command equals 0
    DOES_CONTAIN_WHITESPACE=$?
    # If Whitespace is Found, do not remove Quotes around Variable
    if [ $DOES_CONTAIN_WHITESPACE -eq 0 ]; then
        echo $ENV_VAR_VALUE
        return 0
    else
        ENV_VAR_VALUE=$(remove_quote_characters $ENV_VAR_VALUE)
        
        echo $ENV_VAR_VALUE
        return 0
    fi
}
# Function used to Remove Leading and Trailing Quote Symbol
remove_quote_characters() {
    did_receive_expected_number_of_arguments remove_quote_characters 1 $#
    CANDIDATE_VALUE=$1
    
    FIRST_CHARACTER_OF_CANDIDATE="$(echo $CANDIDATE_VALUE | cut -c 1)"
    if [ "${FIRST_CHARACTER_OF_CANDIDATE}" = "\"" ]; then
        echo "$CANDIDATE_VALUE" | sed "s|^.||" | sed "s|.$||"
        return 0
    fi

    echo $CANDIDATE_VALUE
    return 0
}
# Function used to insert Value into Template File instead of Placeholder Name
insert_value_into_template_file() {
    did_receive_expected_number_of_arguments insert_value_into_template_file 3 $#
    VALUE_TO_INSERT=$1
    TEMPLATE_PLACEHOLDER_NAME=$2
    TEMPLATE_FILE_PATH=$3

    # This Section checks if the Value to Insert is a multiline Value. If yes, it is handled specifically
        # Multiline Values will contain either \n or a Pre-Inserted __NEWLINE__ Placeholder
            # __NEWLINE__ is Inserted when read_booking_repository_private_ssh_github_deploy_key is Called to Read SSH Key from a Locally Stored File
        # If \n are Found, change them for the custom __NEWLINE__ Placeholder, and Insert the Values in the Template. Then swap __NEWLINE__ for \n within the Template
    echo "$VALUE_TO_INSERT" | grep -E "[\]{1}n" >/dev/null # If Newline is Found, Exit Code from Command equals 0
    DOES_CONTAIN_NEWLINE=$?
    echo "$VALUE_TO_INSERT" | grep -E "$NEWLINE_PLACEHOLDER" >/dev/null
    DOES_CONTAIN_PRIORLY_INSERTED_NEWLINE_PLACEHOLDER=$?
    if [ $DOES_CONTAIN_NEWLINE -eq 0 ] || [ $DOES_CONTAIN_PRIORLY_INSERTED_NEWLINE_PLACEHOLDER -eq 0 ]; then
        LEADING_SPACES=$(grep $TEMPLATE_PLACEHOLDER_NAME $TEMPLATE_FILE_PATH | grep -E -o '[ ]+')
        VALUE_TO_INSERT_WITH_NEWLINE_PLACEHOLDERS=$(echo "$VALUE_TO_INSERT" | sed "s|\\\n|$NEWLINE_PLACEHOLDER|g" | sed "s|$NEWLINE_PLACEHOLDER|$NEWLINE_PLACEHOLDER$LEADING_SPACES|g") 
        sed -i "s|$TEMPLATE_PLACEHOLDER_NAME|$VALUE_TO_INSERT_WITH_NEWLINE_PLACEHOLDERS|g" $TEMPLATE_FILE_PATH
        sed -i "s|$NEWLINE_PLACEHOLDER|\n|g" $TEMPLATE_FILE_PATH

        return 0
    fi

    # If Value to Insert is wrapped in Quotes, Remove the Quotes in the Template
    FIRST_CHARACTER_OF_VALUE_TO_INSERT="$(echo $VALUE_TO_INSERT | cut -c 1)"
    if [ "${FIRST_CHARACTER_OF_VALUE_TO_INSERT}" = "\"" ]; then
        sed -i "s|\"${TEMPLATE_PLACEHOLDER_NAME}\"|${VALUE_TO_INSERT}|g" $TEMPLATE_FILE_PATH
    else
        sed -i "s|${TEMPLATE_PLACEHOLDER_NAME}|${VALUE_TO_INSERT}|g" $TEMPLATE_FILE_PATH
    fi

    return 0
}
# Function used to insert Multiline Value into Template File, so that the Value is singleline and containing \n Characters.
# IMPORTANT: The Value Passed as VALUE_TO_INSERT Argument already contains NEWLINE_PLACEHOLDERS within itself!
insert_multiline_value_into_template_file_with_newline_chars() {
    did_receive_expected_number_of_arguments insert_multiline_value_into_template_file_with_newline_chars 3 $#
    VALUE_TO_INSERT=$1
    TEMPLATE_PLACEHOLDER_NAME=$2
    TEMPLATE_FILE_PATH=$3
    
    sed -i "s|__${TEMPLATE_PLACEHOLDER_NAME}__|${VALUE_TO_INSERT}|g" $TEMPLATE_FILE_PATH
    sed -i "s|$NEWLINE_PLACEHOLDER|\\\n|g" $TEMPLATE_FILE_PATH
    sed -i "s|$BACKSLASH_PLACEHOLDER|\\\\|g" $TEMPLATE_FILE_PATH

    return 0
}

# Function used to Read Github Public SSH Key
fetch_github_public_ssh_key() {
    OPTIONAL_FLAGS=$1

    # OPTIONAL_FLAGS is Intended to contain Flag -q, which is used when Running Script Remotely, but not when Running Script Locally
    GITHUB_PUBLIC_SSH_KEY="$(ssh-keyscan $OPTIONAL_FLAGS -t ed25519 github.com)"
    check_exit_code_and_exit_if_error ssh-keyscan $?

    echo "$GITHUB_PUBLIC_SSH_KEY"
    return 0
}
# Function used to insert Github Public SSH Key into the Template File
insert_github_public_key_into_template_file() {
    did_receive_expected_number_of_arguments insert_github_public_key_into_template_file 1 $#
    TEMPLATE_FILE_PATH=$1

    # using : Character as the Delimiter since Keys contain | Character used in other places as a Delimiter
    sed -i "s:__GITHUB_HOST_SSH_KEY__:$(fetch_github_public_ssh_key):g" $TEMPLATE_FILE_PATH

    return 0
}

# Function used to Read Private SSH Key used as a Github Deploy Key, and insert __NEWLINE__ String to indicate Newlines within the Value
# Used Only Locally!
read_booking_repository_private_ssh_github_deploy_key() {
    did_receive_expected_number_of_arguments read_booking_repository_private_ssh_github_deploy_key 1 $#
    SSH_KEY_FILE_ENV_VARIABLE=$1

    BOOKING_REPOSITORY_PRIVATE_SSH_KEY_FILE_PATH="$(read_environment_variable BOOKING_SSH_KEY_DIRECTORY $ENV_LOCAL_FILE_PATH)/$(read_environment_variable $SSH_KEY_FILE_ENV_VARIABLE $ENV_LOCAL_FILE_PATH)"

    SSH_KEY=$(sudo cat ./${BOOKING_REPOSITORY_PRIVATE_SSH_KEY_FILE_PATH} | sed -r "s/$/$NEWLINE_PLACEHOLDER/g" | sed -r "$,$ s/$NEWLINE_PLACEHOLDER//g" | tr -d "\n")

    echo "$SSH_KEY"
    return 0
}

read_full_docker_image_name() {
    did_receive_expected_number_of_arguments read_full_docker_image_name 2 $#
    BOOKING_SERVICE_DOCKER_IMAGE_NAME_ENVIRONMENT_VAR_NAME=$1
    BOOKING_SERVICE_DOCKER_IMAGE_TAG_ENVIRONMENT_VAR_NAME=$2

    BOOKING_SERVICE_DOCKER_IMAGE_NAME=$(read_environment_variable $BOOKING_SERVICE_DOCKER_IMAGE_NAME_ENVIRONMENT_VAR_NAME $ENV_FILE_PATH)
    BOOKING_SERVICE_DOCKER_IMAGE_TAG=$(read_environment_variable $BOOKING_SERVICE_DOCKER_IMAGE_TAG_ENVIRONMENT_VAR_NAME $ENV_FILE_PATH)

    echo "$BOOKING_SERVICE_DOCKER_IMAGE_NAME:$BOOKING_SERVICE_DOCKER_IMAGE_TAG"
    return 0
}

read_json_file() {
    did_receive_expected_number_of_arguments read_json_file 1 $#
    JSON_FILE_PATH=$1

    JSON_FILE_CONTENT=$(sudo cat ./${JSON_FILE_PATH} | sed -r "s/$/$NEWLINE_PLACEHOLDER/g" | sed -r "$,$ s/$NEWLINE_PLACEHOLDER//g" \
        | sed "s/\"/$BACKSLASH_PLACEHOLDER\"/g" | tr -d "\n")

    echo "$JSON_FILE_CONTENT"
    return 0
}
