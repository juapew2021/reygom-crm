import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {countries,countryCatalog,locationSelection,resolveLocation} from '../src/services/locationCatalog.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../src/data/locations.json',import.meta.url),'utf8'));
test('country catalogs keep regions separated',()=>{
  assert.equal(countries.length,2);
  assert.equal(countryCatalog(catalog,'ES').regions.length,52);
  assert.equal(countryCatalog(catalog,'CO').regions.length,33);
  assert.equal(locationSelection(catalog,'CO','08','08298').city,'');
});
test('Spain Barcelona Vic resolves without losing its official identifier',()=>{
  const value=locationSelection(catalog,'ES','08','08298');
  assert.equal(value.city,'Vic');assert.equal(value.province,'Barcelona');assert.equal(value.country,'España');
  assert.equal(resolveLocation(catalog,{country_code:'ES',region_code:'08',city:'Vic'}).city.code,'08298');
});
test('Colombia Antioquia Medellin resolves and changing parent clears child selections',()=>{
  assert.match(locationSelection(catalog,'CO','05','05001').city,/Medellín/i);
  assert.equal(locationSelection(catalog,'ES').region_code,'');
  assert.equal(locationSelection(catalog,'CO','11').city_code,'');
  assert.equal(locationSelection(catalog,'CO','11','05001').city,'');
});
test('official catalogs contain unique city codes in their own region',()=>{
  for(const country of catalog.countries){const codes=new Set();for(const region of country.regions)for(const city of region.cities){assert.equal(city.code.slice(0,2),region.code);assert.ok(!codes.has(city.code));codes.add(city.code);}}
});
test('legacy property names resolve without rewriting saved locations',()=>{
  const value=resolveLocation(catalog,{country_code:'ES',province:'Barcelona',city:'Vic'});
  assert.equal(value.region.code,'08');assert.equal(value.city.code,'08298');
});
