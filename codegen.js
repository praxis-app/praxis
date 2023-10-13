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
  documents: ['view/apollo/**/*.graphql'],
  ignoreNoDocuments: true,

  generates: {
    'view/apollo/gen.ts': {
      plugins: [DO_NOT_EDIT_PLUGIN, 'typescript'],
    },

    'view/apollo/': {
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
  },
};

module.exports = config;
