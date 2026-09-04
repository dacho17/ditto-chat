<!-- File was written following the Documentation at: https://www.markdownguide.org/basic-syntax/ -->

Ditto Chat
========================
This repository contains Client React and Server SpringBoot Application which together constitute Ditto Chat Application.<br>
The repository also contains MySQL Database and Redis Configurations defined within Docker Compose .yaml Files and ran together with the forementioned applicatons.<br>

The Project was Initialized by Running local: `sh initialize-project.sh` Script

Time invested in the project:
  - Ditto Chat Client: 174h between 17.07. and 30.08.
  - Ditto Chat Server: 63h between 18.08. and 30.08.


Running and Testing Ditto Chat Locally
------------------------
Ditto Chat and Related Services can be locally using Docker Compose.
1. Docker Compose Network is interacted with through <b>local-ditto-chat.sh</b> Script .<br>
    Script must be Ran from the Root Directory of the Project, and can be interacted with in the following ways:
    - `sh ./scripts/local-ditto-chat.sh run`<br>
        Builds Docker Images and starts Docker Compose Network with React client application, SpringBoot server application, Redis and MySQL Databases
    - `sh ./scripts/local-ditto-chat.sh start`<br>
        Starts stopped Containers Running within Booking Docker Compose Network
    - `sh ./scripts/local-ditto-chat.sh stop`<br>
        Stops all Containers Running within Docker Compose Network
    - `sh ./scripts/local-ditto-chat.sh delete`<br>
        Deletes all Containers Running within Docker Compose Network, including all disposable Volumes<br>
    - `sh ./scripts/local-ditto-chat.sh test`<br>
        Runs Test Docker Compose Network with Ditto Server, Redis and MySQL Database Containers, and Runs Unit and Integration Tests against the Server
    - `sh ./scripts/local-ditto-chat.sh migrate`<br>
        Runs Flyway Migrations on the Ditto Chat MySQL Database
    - `sh ./scripts/local-ditto-chat.sh repair-migration`<br>
        Runs Repair of failed Flyway Migrations on the Ditto Chat MySQL Database
        
Additionally, Ditto Server exposes a port to which a Debugger can be attached when the Ditto Chat Server container is running within the Docker Compose Network.<br>
Booking REST API is Listening for Debugging Clients on the Port Published from its Container, which allows attaching Debugging Processes to this Port.<br>


Future improvements and TODOs
------------------------
1. Web Browser Back and Forward Button Click Implementation (TODO-navigation)
2. Resolve (TODO-aws) when AWS File Referencing is known and Server Side is Implemented
    - IMPORTANT: "S3 object can be referenced from internet using URL in format: bucketUrl/objectKey"
    - Harmonize the Client with Server Implementation for File Uploads:
      - Revisit: Forms, URLs, Response Dtos
      - When sending a message, Client sends s3ObjectKey after receiving upload confirmation from AWS 
        - IMPORTANT: Server may not register the upload before this request is made. May need to introduce retries...
      - When changing account image, client must send HTTP Request to create AccountImge
      - IMPORTANT: Server may not register the upload before this request is made. May need to introduce retries...
3. Uncomment Polling (TODO-polling)
4. Resolve Production TODOs (TODO-prod)
5. /reset-password Integration Test is failing. Needs to be investigated...
6. Test the Client against the Dummy Service (not a priority)
