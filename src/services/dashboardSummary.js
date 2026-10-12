// Match the property visibility and ordering already applied by GET /properties.
export function mergeVisibleProperties(summary, properties) {
  if (!Array.isArray(properties)) {
    throw new TypeError("La respuesta de inmuebles no es válida.");
  }
  return {
    ...summary,
    properties_count: properties.length,
    latest_properties: properties.slice(0, 5),
  };
}
