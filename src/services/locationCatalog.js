export const countries = [{code:'ES',name:'España'},{code:'CO',name:'Colombia'}];
export function normalizeLocation(value) {
  return String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
}
export function countryCatalog(catalog, code) { return catalog?.countries.find(country => country.code === code); }
export function resolveLocation(catalog, value) {
  const country=countryCatalog(catalog,value.country_code);
  const region=country?.regions.find(region => region.code === (value.region_code || value.state_code)) || country?.regions.find(region => normalizeLocation(region.name) === normalizeLocation(value.province));
  const city=region?.cities.find(city => city.code === value.city_code || normalizeLocation(city.name) === normalizeLocation(value.city));
  return {country,region,city};
}
export function locationSelection(catalog,countryCode,regionCode='',cityCode='') {
  const country=countryCatalog(catalog,countryCode);
  const region=country?.regions.find(region=>region.code===regionCode);
  const city=region?.cities.find(city=>city.code===cityCode);
  return {country_code:countryCode,country:country?.name||'',region_code:region?.code||'',province:region?.name||'',city_code:city?.code||'',city:city?.name||''};
}
