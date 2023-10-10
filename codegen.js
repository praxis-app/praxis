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
  documents: ['view/**/*.graphql'],
  ignoreNoDocuments: true,

  generates: {
    'view/apollo/gen.ts': {
      plugins: [DO_NOT_EDIT_PLUGIN, 'typescript'],
    },

    'view/': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: 'apollo/gen.ts',
        folder: './generated',
        extension: '.ts',
      },
      plugins: [
        DO_NOT_EDIT_PLUGIN,
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: { withHooks: true },
    },

    'schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

module.exports = config;
