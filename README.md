# Praxis

Praxis is an open source social networking site. Motions are the main focus and come with a wide variety of voting features, with consensus as the default. Create a group and set it to no-admin, allowing group members to create motions and democratically decide on settings, name, theme, or planning of real world events.

While model of consensus will be the default, group members will also be able to use regular majority vote, and have the ability to create and elect new roles with various permissions. All of this can be tailored in group settings to meet the specific needs of your community, either by the groups admin, or via motions as the group potentially evolves over time.

The long term vision for Praxis includes multiple, federated instances, each run autonomously and independently of the rest.

The tech stack includes the following:

- Apollo GraphQL
- TypeScript
- Next.js
- Prisma

Praxis is free and open source software, as specified by the GNU General Public License.

## Setting up Praxis for development

1. Install Node version 15.12.0 using NVM or Homebrew
2. Install Yarn: `npm install -g yarn`
3. Download the package or clone the repo.
4. Install Node modules: `cd praxis && yarn install`
5. Create a `.env` file and include your database URL as `DATABASE_URL`
6. Generate the Prisma client: `yarn prisma generate`
7. Run the database migrations: `yarn prisma migrate dev --preview-feature`
8. Start development server: `yarn dev`

The default database is PostgreSQL.

## Tools to get Involved and Collaborate

- Discord: https://discord.gg/hJUHv4ckfK or message me at **forrest#2807**
- Notion: https://www.notion.so/praxis-74cb6558cc6f4470a967d95fad039303

## Contributions

Praxis is open to contributions, but we recommend creating an issue or replying in a comment to let us know what you are working on first that way we don't overwrite each other.

Please read [CONTRIBUTING.md](https://github.com/forrestwilkins/praxis/blob/main/CONTRIBUTING.md) for details on this project.
