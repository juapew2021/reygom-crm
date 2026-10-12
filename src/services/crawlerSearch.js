export function planCrawlerBatches(payload) {
  const cities = [...new Set((payload.cities?.length ? payload.cities : [payload.city || "Barcelona"]).map(city => city.trim()).filter(Boolean))];
  const sources = [...new Set(payload.sources || [])];
  if (!sources.length) throw new Error("Selecciona al menos un portal para consultar.");
  return cities.flatMap(city => {
    const batches = [];
    for (let offset = 0; offset < sources.length; offset += 2) batches.push({ ...payload, city, cities: [city], sources: sources.slice(offset, offset + 2) });
    return batches;
  });
}
function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const onAbort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
export function describeCrawlerError(error) {
  const text = String(error);
  if (/403|405/.test(text)) return "El portal ha rechazado el acceso automático. No se ha podido consultar.";
  if (/404/.test(text)) return "No se ha encontrado la página de búsqueda de esta ciudad.";
  if (/todavía no está configurada/.test(text)) return text;
  if (/No se encontraron anuncios/.test(text)) return "El portal no ha devuelto anuncios con estos criterios.";
  return "No se ha podido consultar este portal. Los resultados de otros portales se conservan.";
}
export async function searchCrawlerInBatches(payload, { endpoint, signal, onProgress = () => {}, fetchImpl = fetch, wait = pause }) {
  const batches = planCrawlerBatches(payload);
  const total = batches.reduce((sum, batch) => sum + batch.sources.length, 0);
  const listings = new Map();
  const errors = {};
  let completed = 0;
  const snapshot = () => ({ completed, total, listings: [...listings.values()], errors: { ...errors } });
  onProgress(snapshot());
  for (const batch of batches) {
    signal?.throwIfAborted();
    let response;
    for (let attempt = 0; attempt < 13; attempt += 1) {
      signal?.throwIfAborted();
      response = await fetchImpl(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(batch), signal });
      if (response.status !== 429 || attempt === 12) break;
      const seconds = Math.max(1, Math.min(30, Number(response.headers?.get("Retry-After")) || 10));
      await wait(seconds * 1000, signal);
    }
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    for (const listing of Array.isArray(data.listings) ? data.listings : []) if (typeof listing.url === "string" && /^https?:\/\//.test(listing.url)) listings.set(listing.url, listing);
    for (const [source, message] of Object.entries(data.errors || {})) errors[source + " (" + batch.city + ")"] = describeCrawlerError(message);
    if (data.partial) { onProgress(snapshot()); throw new Error("Un lote no se ha podido completar. Se conservan los resultados obtenidos."); }
    completed += batch.sources.length;
    onProgress(snapshot());
  }
  return snapshot();
}
