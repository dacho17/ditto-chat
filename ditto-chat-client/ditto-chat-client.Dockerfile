FROM node:24-alpine

ARG WORKING_DIRECTORY

WORKDIR ${WORKING_DIRECTORY}

COPY public ./public
COPY src ./src
COPY index.html .
COPY package.json .

COPY tsconfig.app.json .
COPY tsconfig.json .
COPY tsconfig.node.json .
COPY vite.config.ts .

COPY .env.development .

RUN npm install

EXPOSE 5173
