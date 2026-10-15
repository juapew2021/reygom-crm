import { useEffect, useState } from 'react';
import catalogUrl from '../data/locations.json?url';
import { countries, resolveLocation, locationSelection } from '../services/locationCatalog';

export default function CountryRegionFields({value,onChange,disabled=false,required=false}) {
  const [catalog,setCatalog]=useState(null);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    fetch(catalogUrl,{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error();return response.json();}).then(data=>{setCatalog(data);setError('');}).catch(error=>{if(error.name!=='AbortError')setError('No se pudo cargar el catálogo de ubicaciones.');});
    return()=>controller.abort();
  },[attempt]);
  const {country,region,city}=resolveLocation(catalog,value);
  const inputClass='mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 disabled:bg-slate-100';
  return <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-3">
    <legend className="mb-2 text-sm font-bold text-slate-600">Ubicación del inmueble</legend>
    {error&&<p role="alert" className="text-red-700 sm:col-span-3">{error} <button type="button" className="underline" onClick={()=>setAttempt(attempt+1)}>Reintentar</button></p>}
    <label className="text-sm text-slate-700">País<select name="country_code" required={required} className={inputClass} value={value.country_code} disabled={!catalog} onChange={event=>onChange(locationSelection(catalog,event.target.value))}>{countries.map(country=><option key={country.code} value={country.code}>{country.name}</option>)}</select></label>
    <label className="text-sm text-slate-700">{country?.regionLabel || (value.country_code==='CO'?'Departamento o distrito':'Provincia')}<select name="region_code" required={required} disabled={!catalog} className={inputClass} value={region?.code||''} onChange={event=>onChange(locationSelection(catalog,value.country_code,event.target.value))}><option value="">{catalog?'Selecciona una opción':'Cargando ubicaciones…'}</option>{country?.regions.map(region=><option key={region.code} value={region.code}>{region.name}</option>)}</select></label>
    <label className="text-sm text-slate-700">Municipio<select name="city_code" required={required} disabled={!region} className={inputClass} value={city?.code||''} onChange={event=>onChange(locationSelection(catalog,value.country_code,region.code,event.target.value))}><option value="">{region?'Selecciona un municipio':'Selecciona primero la región'}</option>{region?.cities.map(city=><option key={city.code} value={city.code}>{city.name}{city.type&&city.type!=='Municipio'?` (${city.type})`:''}</option>)}</select></label>
    <input type="hidden" name="country" value={country?.name||''}/><input type="hidden" name="province" value={region?.name||''}/><input type="hidden" name="city" value={city?.name||''}/>
  </fieldset>;
}
