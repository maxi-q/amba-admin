import { mkdir, writeFile } from 'node:fs/promises';

const SOURCE_URL = 'https://api.ambassador.sen.collabox.dev/api/docs-json';
const TARGET_PATH = new URL('../.openapi/ambassador.openapi.json', import.meta.url);

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const ensureRequiredField = (schema, fieldName) => {
  const currentRequired = Array.isArray(schema.required) ? schema.required : [];

  if (!currentRequired.includes(fieldName)) {
    schema.required = [...currentRequired, fieldName];
  }
};

const normalizeSchema = (schema) => {
  if (!isObject(schema)) {
    return;
  }

  if (schema.properties && isObject(schema.properties)) {
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      if (isObject(fieldSchema) && typeof fieldSchema.required === 'boolean') {
        if (fieldSchema.required) {
          ensureRequiredField(schema, fieldName);
        }

        delete fieldSchema.required;
      }
    }
  }

  if (schema.type === 'array') {
    if (
      isObject(schema.items) &&
      schema.items.type === 'array' &&
      typeof schema.items.format === 'string' &&
      !schema.items.items
    ) {
      schema.items = {
        type: 'string',
        format: schema.items.format,
      };
    }

    if (!schema.items) {
      schema.items = schema.format
        ? { type: 'string', format: schema.format }
        : {};
    }

    delete schema.format;
  }

  for (const value of Object.values(schema)) {
    if (Array.isArray(value)) {
      value.forEach(normalizeSchema);
    } else {
      normalizeSchema(value);
    }
  }
};

const response = await fetch(SOURCE_URL);

if (!response.ok) {
  throw new Error(`Failed to load OpenAPI schema: ${response.status} ${response.statusText}`);
}

const openApiSchema = await response.json();
normalizeSchema(openApiSchema);

await mkdir(new URL('.', TARGET_PATH), { recursive: true });
await writeFile(TARGET_PATH, `${JSON.stringify(openApiSchema, null, 2)}\n`);

console.log(`OpenAPI schema prepared from ${SOURCE_URL}`);
