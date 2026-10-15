import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';

const field='w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900';
const button='rounded-xl bg-brand-red px-4 py-2 font-bold text-white disabled:opacity-50';
const roles={superadmin:'Super admin',admin:'Administrador de oficina',agent:'Agente',agente:'Agente'};

export default function OfficeAdministrationPage(){
 const [me,setMe]=useState(null),[offices,setOffices]=useState([]),[users,setUsers]=useState([]);
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [office,setOffice]=useState({name:'',slug:'',country_code:'ES',status:'active'});
 const [person,setPerson]=useState({username:'',password:'',role:'agent'});
 const [officeEdit,setOfficeEdit]=useState(null);
 async function load(){
  const identity=(await api.get('/me')).data.user;setMe(identity);
  if(['admin','superadmin'].includes(identity.role))setUsers((await api.get('/office-users')).data);
  if(identity.role==='superadmin')setOffices((await api.get('/offices')).data);
 }
 useEffect(()=>{let active=true;api.get('/me').then(async ({data})=>{if(!active)return;const identity=data.user;setMe(identity);if(['admin','superadmin'].includes(identity.role)){const response=await api.get('/office-users');if(active)setUsers(response.data);}if(identity.role==='superadmin'){const response=await api.get('/offices');if(active)setOffices(response.data);}}).catch(e=>{if(active)setError(e.response?.data?.message||'No se pudo cargar la administración.');});return()=>{active=false;};},[]);
 async function save(action,message){setBusy(true);setError('');setNotice('');try{await action();await load();setNotice(message);}catch(e){setError(e.response?.data?.message||'No se pudo guardar.');}finally{setBusy(false);}}
 const superadmin=me?.role==='superadmin';
 return <MainLayout><h1 className="text-3xl font-bold">Oficinas y equipo</h1>
 <p className="mt-2 text-slate-300">{me?.office_name||'Cargando oficina…'} · {roles[me?.role]||''}</p>
 <p className="mt-2 text-slate-300">Los agentes comparten la cartera de su oficina. Cada inmobiliaria tiene sus propios datos y usuarios.</p>
 {error&&<p role="alert" className="my-4 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
 {notice&&<p role="status" className="my-4 rounded-xl bg-green-100 p-4 text-green-800">{notice}</p>}
 {me&&!['admin','superadmin'].includes(me.role)&&<p className="mt-5">La gestión de usuarios corresponde al administrador de tu oficina.</p>}
 {superadmin&&<section className="mt-6 rounded-2xl bg-white p-6 text-slate-900"><h2 className="text-xl font-bold">Inmobiliarias</h2>
 <p className="my-2">Selecciona la oficina en el menú lateral para administrar su equipo.</p>
 <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Oficina</th><th>País</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{offices.map(o=><tr key={o.id} className="border-t"><td className="py-3">{o.name}<small className="block">{o.slug}</small></td><td>{o.country_code==='CO'?'Colombia':'España'}</td><td>{o.status==='active'?'Activa':'Inactiva'}</td><td><button type="button" className="underline" onClick={()=>{setOfficeEdit(o.id);setOffice({name:o.name,slug:o.slug,country_code:o.country_code,status:o.status});}}>Editar oficina</button></td></tr>)}</tbody></table></div>
 <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={e=>{e.preventDefault();save(async()=>{const {data}=await api[officeEdit?'put':'post'](officeEdit?`/offices/${officeEdit}`:'/offices',office);localStorage.setItem('officeId',data.id);window.location.assign('/administration');},officeEdit?'Oficina actualizada.':'Oficina creada. Selecciónala para añadir su administrador.');}}>
 <h3 className="font-bold md:col-span-2">{officeEdit?'Editar oficina':'Crear oficina'}</h3>
 <label>Nombre de la inmobiliaria<input className={field} required maxLength={150} value={office.name} onChange={e=>setOffice({...office,name:e.target.value})}/></label>
 <label>Identificador de oficina<input className={field} required disabled={!!officeEdit} pattern="[a-z0-9][a-z0-9-]{0,63}" maxLength={64} placeholder="inmobiliaria-bogota" value={office.slug} onChange={e=>setOffice({...office,slug:e.target.value})}/></label>
 <label>País de la oficina<select className={field} value={office.country_code} onChange={e=>setOffice({...office,country_code:e.target.value})}><option value="ES">España</option><option value="CO">Colombia</option></select></label>
 <label>Estado de la oficina<select className={field} value={office.status} onChange={e=>setOffice({...office,status:e.target.value})}><option value="active">Activa</option><option value="inactive">Inactiva</option></select></label>
 <div><button disabled={busy} className={button}>{officeEdit?'Guardar oficina':'Crear oficina'}</button>{officeEdit&&<button type="button" className="ml-4 underline" onClick={()=>{setOfficeEdit(null);setOffice({name:'',slug:'',country_code:'ES',status:'active'});}}>Cancelar</button>}</div>
 </form></section>}
 {me&&['admin','superadmin'].includes(me.role)&&<section className="mt-6 rounded-2xl bg-white p-6 text-slate-900"><h2 className="text-xl font-bold">Equipo de {me.office_name}</h2>
 <div className="mt-3 overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Usuario</th><th>Perfil</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{users.map(u=><tr key={u.id} className="border-t"><td className="py-3">{u.username}</td><td>{roles[u.role]||u.role}</td><td>{u.is_active?'Activo':'Inactivo'}</td><td>{u.id!==me.id&&u.role!=='superadmin'&&(superadmin||['agent','agente'].includes(u.role))&&<div className="flex flex-wrap gap-3"><button disabled={busy} className="underline" onClick={()=>save(()=>api.put(`/office-users/${u.id}`,{role:u.role,is_active:!u.is_active}),u.is_active?'Usuario desactivado.':'Usuario activado.')}>{u.is_active?'Desactivar':'Activar'}</button>{superadmin&&<button disabled={busy} className="underline" onClick={()=>save(()=>api.put(`/office-users/${u.id}`,{role:u.role==='admin'?'agent':'admin',is_active:u.is_active}),'Perfil actualizado.')}>{u.role==='admin'?'Cambiar a agente':'Hacer administrador'}</button>}</div>}</td></tr>)}</tbody></table></div>
 <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={e=>{e.preventDefault();save(async()=>{await api.post('/office-users',person);setPerson({username:'',password:'',role:'agent'});},'Usuario creado en esta oficina.');}}>
 <h3 className="font-bold md:col-span-2">Añadir usuario</h3>
 <label>Nombre de usuario<input className={field} required minLength={3} maxLength={50} autoComplete="off" value={person.username} onChange={e=>setPerson({...person,username:e.target.value})}/></label>
 <label>Contraseña inicial<input className={field} type="password" required minLength={12} maxLength={200} autoComplete="new-password" value={person.password} onChange={e=>setPerson({...person,password:e.target.value})}/></label>
 <label>Perfil<select className={field} value={person.role} onChange={e=>setPerson({...person,role:e.target.value})}><option value="agent">Agente</option>{superadmin&&<option value="admin">Administrador de oficina</option>}</select></label>
 <p className="text-sm">El acceso queda limitado a la oficina seleccionada. Al desactivar al usuario se cerrará su acceso al CRM.</p>
 <div><button disabled={busy} className={button}>Crear usuario</button></div>
 </form></section>}
 </MainLayout>;
}
