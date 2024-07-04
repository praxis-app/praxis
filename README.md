## Praxis

Praxis is an open source social network designed for collaborative decision making. Proposals take center stage, offering a diverse range of voting models, with consensus as the default.

With Praxis, you can create groups that empower members to collectively shape crucial aspects such as group name, settings, roles, or the planning of real world events. This flexibility allows for the creation of diverse and dynamic social structures tailored to meet the specific needs of your community as it evolves over time.

Praxis is free and open source software, as specified by the GNU General Public License.

## Work in Progress

You are entering a construction yard. Things are going to change and break regularly as the project is still getting off the ground. Please bear in mind that Praxis is not yet intended for serious use outside of testing or research purposes. Your feedback is highly welcome.

Core features currently in development:

- Change group roles, permissions, and settings all via proposals
- Plan real world events via proposals and voting
- Federation with ActivityPub

## Installation

Ensure that you're using Node v18.17.1 before proceeding.

```bash
# Install project dependencies
$ npm install

# Add .env file and edit as needed
$ cp .env.example .env
```

## Running the app

```bash
# Start server for development
$ npm run start:dev

# Start client for development
$ npm run start:client

# Start app for production
$ npm run start:prod
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view and interact with the UI.

## Docker

Ensure that you have [Docker](https://docs.docker.com/engine/install) installed to use the following commands.

```bash
# Start app in a container
$ docker compose up -d

# Build and restart app after making changes
$ docker compose up -d --build
```

## ESLint and Prettier

```bash
# Enable pre-commit hook with Husky
$ npx husky install && npx husky add .husky/pre-commit "npx lint-staged"
```

## GraphQL Code Generator

Praxis takes advantage of code generation based on the current GraphQL schema. The generator should be run after any changes to GraphQL documents, as well as after any changes to the schema.

```bash
# Keep generated types and hooks in sync with the current schema
$ npn run gen
```

Read more about [GraphQL Code Generator](https://www.the-guild.dev/graphql/codegen/docs/getting-started).

## Accessibility

Install the following Chrome extension provided by Deque Systems: [axe DevTools - Web Accessibility Testing](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd?hl=en-US)

Once the extension is installed, open up Chrome DevTools, and navigate to the "axe DevTools" tab. Here you can click the "Scan ALL of my page" button to check for any accessibility issues.

## Contributions

Praxis is open to contributions. Please read [CONTRIBUTING.md](https://github.com/praxis-app/praxis/blob/main/CONTRIBUTING.md) for more details.

To get more involved or learn more about the project, join us on Discord: https://discord.gg/s5MxNBehxS
