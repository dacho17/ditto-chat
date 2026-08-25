FROM amazoncorretto:25-alpine-jdk

ARG WORKING_DIRECTORY
ARG PACKAGE_SERVICE_INTO_JAR

# Setup Maven
RUN apk update && apk upgrade --no-cache
RUN apk add curl
RUN apk add tar
RUN apk add gzip

WORKDIR /usr

# Maven Installation Documentation at: https://maven.apache.org/install.html, Link to Archive was taken from: https://archive.apache.org/dist/maven/maven-3/3.9.15/binaries/
ENV MAVEN_VERSION="3.9.15"
ENV MAVEN_ARCHIVE="apache-maven-${MAVEN_VERSION}-bin.tar.gz"
RUN curl -fsSL -o "./${MAVEN_ARCHIVE}" "https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/${MAVEN_ARCHIVE}"
RUN tar -xzf "./${MAVEN_ARCHIVE}"
RUN rm "./${MAVEN_ARCHIVE}"
ENV MAVEN_HOME="/usr/apache-maven-${MAVEN_VERSION}"
ENV PATH="${PATH}:${MAVEN_HOME}/bin"

RUN apk del curl
RUN apk del tar
RUN apk del gzip

WORKDIR ${WORKING_DIRECTORY}

COPY src ./src
COPY pom.xml .

COPY ditto-chat-server-entrypoint.sh .
RUN chmod +x ./ditto-chat-server-entrypoint.sh

CMD if [[ "$PACKAGE_SERVICE_INTO_JAR" == "true" ]]; then \
    mvn clean package -Dmaven.test.skip=true && java -jar ./target/*.jar ; \
fi

EXPOSE 8080

# Additionally Port 5005 is Published locally to enable attaching Debugger to Ditto Chat Server Process
EXPOSE 5005
