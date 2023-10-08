import { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';

dotenv.config();

const DO_NOT_EDIT_PLUGIN = {
  add: {
    content: `
      // THIS FILE IS GENERATED, DO NOT EDIT
      /* eslint-disable */
    `,
  },
};

const config: CodegenConfig = {
  schema: `${process.env.API_URL}/graphql`,
  documents: ['src/apollo/**/*.graphql'],
  ignoreNoDocuments: true,

  generates: {
    'src/apollo/gen.ts': {
      plugins: [DO_NOT_EDIT_PLUGIN, 'typescript'],
    },

    'src/apollo/': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: 'gen.ts',
        folder: '../generated',
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

export default config;
