FROM node:16.13-alpine AS build_stage

RUN apk add --update python3 build-base

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --development

COPY . .

RUN yarn build

FROM node:16.13-alpine AS runtime_stage

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY . .
COPY --from=build_stage /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
