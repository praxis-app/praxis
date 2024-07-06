require('dotenv').config();

const DO_NOT_EDIT_PLUGIN = {
  add: {
    content: `
      // THIS FILE IS GENERATED, DO NOT EDIT
      /* eslint-disable */
    `,
  },
};

const config = {
  schema: process.env.SCHEMA_URL,
  documents: ['view/graphql/**/*.graphql'],
  ignoreNoDocuments: true,

  generates: {
    'view/graphql/gen.ts': {
      plugins: [DO_NOT_EDIT_PLUGIN, 'typescript'],
      config: {
        enumsAsTypes: true,
      },
    },

    'view/graphql/': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: 'gen.ts',
        extension: '.gen.ts',
        folder: './gen',
      },
      plugins: [
        DO_NOT_EDIT_PLUGIN,
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: { withHooks: true },
    },

    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        commentDescriptions: true,
        includeDirectives: true,
        sort: true,
      },
    },
  },
};

module.exports = config;
