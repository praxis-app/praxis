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
  schema: process.env.SCHEMA_URL,
  documents: ['view/{pages,components}/**/*.graphql'],
  ignoreNoDocuments: true,

  generates: {
    'view/apollo/gen.ts': {
      plugins: [DO_NOT_EDIT_PLUGIN, 'typescript'],
    },

    'view/': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: 'apollo/gen.ts',
        folder: './__generated__',
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
