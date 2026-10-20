export const referenceCode=property=>property?.public_reference||property?.reference_id||'';
export const referenceLabel=property=>referenceCode(property)?`REF: ${referenceCode(property)}`:'Referencia pendiente';
export function normalizeReferenceQuery(value){return String(value??'').trim().replace(/^REF\s*[:.]\s*/i,'').trim().toUpperCase();}
export function matchesPropertyReference(property,value){const q=normalizeReferenceQuery(value);return [property?.public_reference,property?.reference_id].some(ref=>typeof ref==='string'&&ref.toUpperCase().includes(q));}
