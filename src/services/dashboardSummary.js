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

export function mergeVisibleLeads(summary, leads) {
  if (!Array.isArray(leads)) {
    throw new TypeError("La respuesta de leads no es válida.");
  }
  const stages = new Map();
  for (const lead of leads) {
    const stage = lead.pipeline_stage || "Nuevo";
    stages.set(stage, (stages.get(stage) || 0) + 1);
  }
  return {
    ...summary,
    leads_count: leads.length,
    latest_leads: leads.slice(0, 5),
    pipeline: Object.fromEntries(stages),
  };
}
