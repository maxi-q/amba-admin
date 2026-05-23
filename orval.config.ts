import { defineConfig } from 'orval';

export default defineConfig({
  ambassadorApi: {
    input: {
      target: './.openapi/ambassador.openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/ambassador.ts',
      schemas: './src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: {
          path: './src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
