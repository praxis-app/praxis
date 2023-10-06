## Praxis

Praxis is an open source social network with features for collaborative decision making. Proposals are the main focus and come with a wide variety of voting models, with consensus as the default. Create a group and set it to no-admin, allowing group members to create proposals and democratically decide on name, settings, roles, or planning of real world events.

While model of consensus is the default, group members will also be able to use regular majority vote, and have the ability to create and assign new roles with various permissions. All of this can be tailored in group settings to meet the specific needs of your community, either by a groups admin, or by proposals as a group evolves over time.

Praxis is free and open source software, as specified by the GNU General Public License.

## Experimental Architecture

This version of Praxis uses a monolithic architecture, enabling easier development and deployment. This is an experimental version of Praxis, and is not yet ready for production use.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## ESLint and Prettier

```bash
# Enable pre-commit hook with Husky
$ npx husky install && npx husky add .husky/pre-commit "npx lint-staged"
```

## Accessibility

Install the following Chrome extension provided by Deque Systems: [axe DevTools - Web Accessibility Testing](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd?hl=en-US)

Once the extension is installed, open up Chrome DevTools, and navigate to the "axe DevTools" tab. Here you can click the "Scan ALL of my page" button to check for any accessibility issues.

## Contributions

Praxis is open to contributions. Please read [CONTRIBUTING.md](https://github.com/praxis-project/praxis-ui/blob/main/CONTRIBUTING.md) for more details.
