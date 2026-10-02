import { mkdir, writeFile } from 'node:fs/promises';

const SOURCE_URL = 'https://api-ambassador.senler.ru/api/docs-json';
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

  // Nest emits JSON Schema `examples`; OpenAPI 3.0 uses a single `example`.
  if (schema.type && Array.isArray(schema.examples)) {
    schema.example ??= schema.examples[0];
    delete schema.examples;
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

// Verified against backend 26e41d1: these values are returned by the services,
// but the Swagger PickType/nullable annotations have not caught up yet.
const schemas = openApiSchema.components.schemas;
for (const name of ['LeaderboardEntryDto', 'EventResultEntryDto']) {
  schemas[name].properties.rank.nullable = true;
}
for (const field of ['type', 'status', 'isDraft', 'reviewStartedAt', 'resultsFixedAt', 'completedAt', 'promoCodeUsagesCount']) {
  schemas.GetMyEventsResponseItemDto.properties[field] = structuredClone(schemas.BaseEventDto.properties[field]);
  ensureRequiredField(schemas.GetMyEventsResponseItemDto, field);
}

await mkdir(new URL('.', TARGET_PATH), { recursive: true });
await writeFile(TARGET_PATH, `${JSON.stringify(openApiSchema, null, 2)}\n`);

console.log(`OpenAPI schema prepared from ${SOURCE_URL}`);
