import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';

const labels={'office.branding_updated':'Marca de la inmobiliaria actualizada','user.photo_updated':'Foto de perfil actualizada','access.device_revoked':'Dispositivo revocado','access.requested':'Acceso solicitado','access.approved':'Acceso autorizado','access.rejected':'Acceso rechazado','access.revoked':'Acceso revocado','access.policy_updated':'Límites de acceso modificados',
 'session.login':'Inicio de sesión','session.login_failed':'Intento de acceso rechazado','session.logout':'Cierre de sesión',
 'office.created':'Oficina creada','office.updated':'Oficina actualizada','office.deleted':'Oficina eliminada',
 'user.created':'Usuario creado','user.updated':'Usuario actualizado','user.deleted':'Usuario eliminado',
 'property.created':'Inmueble creado','property.updated':'Inmueble actualizado','property.deleted':'Inmueble eliminado',
 'lead.created':'Contacto creado','lead.updated':'Contacto actualizado','lead.deleted':'Contacto eliminado',
 'image.created':'Fotografía añadida','image.updated':'Fotografía actualizada','image.deleted':'Fotografía retirada',
 'submission.created':'Anuncio recibido','submission.updated':'Anuncio actualizado','submission.deleted':'Anuncio retirado',
 'audit.enabled':'Inicio del registro ampliado',
};
const fields={title:'Título',description:'Descripción',price:'Precio',status:'Estado',role:'Perfil',is_active:'Acceso activo',auth_version:'Sesiones',password:'Contraseña',username:'Usuario',organization_id:'Oficina',reference_id:'Referencia',agent_id:'Agente',assigned_to:'Responsable',contact_info:'Datos de contacto',full_name:'Nombre del contacto',property_interest_id:'Inmueble de interés',city:'Municipio',province:'Región',state:'Región',state_code:'Código de región',country:'País',country_code:'País',postal_code:'Código postal',bedrooms:'Habitaciones',bathrooms:'Baños',built_area:'Superficie',features:'Características',operation_type:'Operación',property_type:'Tipo de inmueble',image_url:'Imagen',cover_image:'Portada',position:'Orden de fotos',is_cover:'Foto de portada',name:'Nombre de oficina',slug:'Identificador de oficina',payload:'Datos del anuncio',email:'Correo',verification_hash:'Verificación de correo',verification_expires_at:'Caducidad de verificación',verified_at:'Correo verificado',reviewed_by:'Revisor',review_note:'Nota de revisión',reviewed_at:'Fecha de revisión',property_id:'Inmueble',images:'Fotografías',pipeline_stage:'Estado comercial',id:'Identificador'};
const values={admin:'Administrador de oficina',agent:'Agente',agente:'Agente',superadmin:'Super admin',active:'Activa',inactive:'Inactiva',pending_review:'Pendiente de revisión',approved:'Aprobado',rejected:'Rechazado',awaiting_email:'Pendiente de verificar correo',ES:'España',CO:'Colombia'};
const formatValue=v=>typeof v==='boolean'?(v?'Sí':'No'):v===null?'Sin valor':values[v]||String(v);
const date=v=>new Date(v).toLocaleString('es-ES');
const input='mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-900';

export default function HistoryPage(){
 const [params,setParams]=useSearchParams();
 const [options,setOptions]=useState({users:[],offices:[],actions:[],coverage_since:null});
 const [data,setData]=useState({rows:[],total:0,page:1,page_size:50});
 const [error,setError]=useState(''),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0);
 const query=params.toString();
 useEffect(()=>{let active=true;api.get('/audit/options').then(({data})=>{if(active)setOptions(data);}).catch(e=>{if(active)setError(e.response?.data?.message||'No se pudo cargar el historial.');});return()=>{active=false;};},[refresh]);
 useEffect(()=>{
  let active=true;
  const filters=new URLSearchParams(query);
  for(const key of ['from','to']){
   const value=filters.get(key);if(!value)continue;
   const parsed=new Date(value+'T00:00:00');if(key==='to')parsed.setDate(parsed.getDate()+1);
   if(Number.isNaN(parsed.getTime())){filters.delete(key);continue;}
   filters.set(key,parsed.toISOString());
  }
  api.get('/audit?'+filters.toString()).then(({data})=>{if(active){setData(data);setError('');}}).catch(e=>{if(active){setData({rows:[],total:0,page:1,page_size:50});setError(e.response?.data?.message||'No se pudo consultar el historial.');}}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[query,refresh]);
 function filter(key,value){setLoading(true);setRefresh(n=>n+1);setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set(key,value);else next.delete(key);next.delete('page');return next;});}
 function page(value){setLoading(true);setParams(previous=>{const next=new URLSearchParams(previous);next.set('page',String(value));return next;});}
 return <MainLayout><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Historial de usuarios</h1><button type="button" className="rounded-xl bg-brand-red px-4 py-2 font-bold" onClick={()=>{setLoading(true);setRefresh(n=>n+1);}}>Actualizar historial</button></div>
 <p className="mt-2 text-slate-300">Actividad de todas las oficinas, disponible únicamente para el Super admin.</p>
 <p className="mt-2 text-sm text-slate-300">Accesos y cambios en usuarios, oficinas, inmuebles, contactos, fotografías y anuncios. Las consultas de fichas no se registran como cambios.</p>
 <p className="mt-2 text-sm text-slate-300">{options.coverage_since?`Registro ampliado desde ${date(options.coverage_since)}. `:''}Los eventos antiguos solo aparecen si ya estaban registrados. Los intentos de acceso rechazados no prueban quién intentó entrar.</p>
 <section className="my-6 grid gap-4 rounded-2xl bg-white p-5 text-slate-900 md:grid-cols-3 lg:grid-cols-5">
 <label>Usuario<select className={input} value={params.get('user')||''} onChange={e=>filter('user',e.target.value)}><option value="">Todos los usuarios</option>{options.users.map(u=><option key={u.id} value={u.id}>{u.username}{u.is_active?'':' (inactivo)'}</option>)}</select></label>
 <label>Oficina<select className={input} value={params.get('office')||''} onChange={e=>filter('office',e.target.value)}><option value="">Todas las oficinas</option>{options.offices.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
 <label>Acción<select className={input} value={params.get('action')||''} onChange={e=>filter('action',e.target.value)}><option value="">Todas las acciones</option>{options.actions.map(a=><option key={a} value={a}>{labels[a]||a}</option>)}</select></label>
 <label>Desde<input type="date" className={input} value={params.get('from')||''} onChange={e=>filter('from',e.target.value)}/></label>
 <label>Hasta<input type="date" className={input} value={params.get('to')||''} onChange={e=>filter('to',e.target.value)}/></label>
 <button type="button" className="text-left text-brand-red underline" onClick={()=>{setLoading(true);setRefresh(n=>n+1);setParams({});}}>Limpiar filtros</button></section>
 {error&&<p role="alert" className="my-4 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
 {loading&&<p role="status">Cargando historial…</p>}
 {!loading&&!error&&<section className="rounded-2xl bg-white p-5 text-slate-900"><p className="mb-4 font-bold">{data.total} eventos · Página {data.page} de {Math.max(1,Math.ceil(data.total/data.page_size))}</p>
 {data.rows.length===0?<p>No hay actividad registrada con estos filtros.</p>:<div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="pb-3">Fecha y hora</th><th>Usuario que actúa</th><th>Oficina</th><th>Acción</th><th>Detalle</th></tr></thead><tbody>{data.rows.map(row=><tr key={row.id} className="border-t align-top"><td className="py-3 pr-4 whitespace-nowrap">{date(row.created_at)}</td><td className="py-3 pr-4">{row.actor_name}</td><td className="py-3 pr-4">{row.office_name}</td><td className="py-3 pr-4">{labels[row.action]||row.action}</td><td className="py-3"><p>{row.subject_ref||row.subject_id||row.metadata?.note||'—'}</p>{row.action.startsWith('access.')&&<p className="text-sm">{row.metadata?.ip&&`IP: ${row.metadata.ip} · `}{row.metadata?.device_id&&`Navegador: ${row.metadata.device_id.slice(0,8)} · `}{row.action==='access.approved'&&Object.hasOwn(row.metadata||{},'expires_at')&&`Vigencia: ${row.metadata.expires_at?new Date(row.metadata.expires_at).toLocaleString('es-ES'):'Hasta revocación'}`}{row.metadata?.max_devices&&`Dispositivos: ${row.metadata.max_devices} · IP por dispositivo: ${row.metadata.max_ips}`}</p>}{row.metadata?.changed_fields?.length>0&&<details className="mt-1"><summary className="cursor-pointer text-brand-red">Ver cambios</summary><p className="mt-1 text-sm">{row.metadata.changed_fields.map(k=>fields[k]||'Otro campo').join(', ')}</p>{Object.entries(row.metadata.changes||{}).map(([key,value])=><p className="text-sm" key={key}>{fields[key]||key}: {formatValue(value.before)} → {formatValue(value.after)}</p>)}</details>}{row.source==='legacy'&&<small>Registro anterior</small>}</td></tr>)}</tbody></table></div>}
 <div className="mt-5 flex gap-4"><button type="button" disabled={data.page<=1} className="rounded-xl border px-4 py-2 disabled:opacity-40" onClick={()=>page(data.page-1)}>Anterior</button><button type="button" disabled={data.page*data.page_size>=data.total} className="rounded-xl border px-4 py-2 disabled:opacity-40" onClick={()=>page(data.page+1)}>Siguiente</button></div>
 </section>}
 </MainLayout>;
}
