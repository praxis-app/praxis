FROM node:18.17.1-alpine AS build_stage

RUN apk add --update python3 build-base

COPY src /app/src
COPY view /app/view
COPY content /app/content

COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY tsconfig.build.json /app
COPY nest-cli.json /app

WORKDIR /app

RUN npm ci
RUN npm run build
RUN npm run build:client

# Include image assets in dist folder
RUN npm run copy:assets

# Prep for runtime image
RUN rm -rf node_modules
RUN rm -rf test
RUN npm ci --only=production
RUN rm -rf src
RUN rm -rf view

FROM node:18.17.1-alpine AS runtime_stage

COPY --from=build_stage /app /app

CMD [ "node", "/app/dist/main.js" ]
