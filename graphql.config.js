require('dotenv').config();

module.exports = {
  projects: {
    app: {
      schema: process.env.SCHEMA_URL,
      documents: './view/graphql/**/*.graphql',
    },
  },
};
