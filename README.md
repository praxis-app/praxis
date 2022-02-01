# Praxis

Praxis is an open source social networking site. Motions are the main focus and come with a wide variety of voting features, with consensus as the default. Create a group and set it to no-admin, allowing group members to create motions and democratically decide on name, settings, roles, or planning of real world events.

While model of consensus is the default, group members will also be able to use regular majority vote, and have the ability to create and assign new roles with various permissions. All of this can be tailored in group settings to meet the specific needs of your community, either by a groups admin, or by motions as a group evolves over time.

The tech stack includes the following:

- Apollo GraphQL
- TypeScript
- Next.js
- Prisma

Praxis is free and open source software, as specified by the GNU General Public License.

## Setting up Praxis for development with docker-compose

1. Install [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/).
2. Clone this repository
3. Create a file named `.env` in the project root directory to set the database URL. It should look like this:

```
DATABASE_URL=postgresql://praxis_pg_user:praxis_pg_password@db/praxis_pg_db
```
4. Run `docker-compose up -d`
5. Access the Praxis application at [http://localhost:3000](http://localhost:3000)
6. Access adminer (for db management) at [http://localhost:8080](http://localhost:8080). Default credentials can be found under 'db > environment' of `docker-compose.yml`.


## Setting up Praxis for development

1. Install Node version 15.12.0 using NVM or Homebrew
2. Install Yarn: `npm install -g yarn`
3. Download the package or clone the repo.
4. Install Node modules: `cd praxis && yarn install`
5. Create a `.env` file and include your database URL as `DATABASE_URL`
6. Generate the Prisma client: `yarn prisma generate`
7. Run the database migrations: `yarn prisma migrate dev --preview-feature`
8. Run `mkdir public/uploads` to enable image uploads
9. Start development server: `yarn dev`
10. To create first user, navigate to http://localhost:3000/users/signup
11. To test out roles and permissions features, navigate to http://localhost:3000/roles
12. Enable pre-commit hook with Husky: `npx husky install && npx husky add .husky/pre-commit "yarn lint-staged"`

The default database is PostgreSQL.

## Tools to get Involved and Collaborate

- Discord: https://discord.gg/CAHb3AhQat, or message me at **forrest#2807**
- Notion: https://www.notion.so/praxis-74cb6558cc6f4470a967d95fad039303

## Contributions

Praxis is open to contributions. Please read [CONTRIBUTING.md](https://github.com/forrestwilkins/praxis/blob/main/CONTRIBUTING.md) for more details.
