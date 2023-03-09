## Praxis

Praxis is an open source social networking site. Proposals are the main focus and come with a wide variety of voting features, with consensus as the default. Create a group and set it to no-admin, allowing group members to create proposals and democratically decide on name, settings, roles, or planning of real world events.

While model of consensus is the default, group members will also be able to use regular majority vote, and have the ability to create and assign new roles with various permissions. All of this can be tailored in group settings to meet the specific needs of your community, either by a groups admin, or by proposals as a group evolves over time.

The tech stack includes the following:

- NestJS
- GraphQL
- TypeORM

Praxis UI: https://github.com/praxis-project/praxis-ui

## WIP

You are entering a construction yard. Things are going to change and break regularly as the project is still getting off the ground.

Your feedback is highly welcome!

## Installation

```bash
# Install Yarn globally
$ npm install -g yarn

# Install project dependencies
$ cd praxis-api && yarn

# Add .env file and edit as needed
$ cp .env.example .env
```

## Running the app

```bash
# Development
$ yarn start

# Watch mode
$ yarn start:dev

# Production mode
$ yarn start:prod
```

Open [http://localhost:3100/api](http://localhost:3100/api) with your browser to view and interact with the API.

## Docker

```bash
# Build and start containers
$ docker-compose up
```

## Test

```bash
# Unit tests
$ yarn test

# E2E tests
$ yarn test:e2e

# Test coverage
$ yarn test:cov
```

## Prettier and ESLint

```bash
# Enable pre-commit hook with Husky
$ npx husky install && npx husky add .husky/pre-commit "yarn lint-staged"
```

## Contributions

Praxis is open to contributions. Please read [CONTRIBUTING.md](https://github.com/praxis-project/praxis-api/blob/main/CONTRIBUTING.md) for more details.
