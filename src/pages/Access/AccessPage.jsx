import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';

const date = value => value ? new Date(value).toLocaleString('es-ES') : 'Sin caducidad';
const field = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900';
export default function AccessPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [duration, setDuration] = useState('8h');
  const [until, setUntil] = useState('');
  const [userId, setUserId] = useState('');
  const [devices, setDevices] = useState(1);
  const [ips, setIps] = useState(1);
  const [view, setView] = useState('pending');
  const load = async () => { const {data: result} = await api.get('/access'); setData(result); };
  useEffect(() => {
    let alive = true;
    api.get('/access').then(result => { if (alive) setData(result.data); }).catch(e => { if (alive) setError(e.response?.data?.message || 'No se han podido cargar los accesos.'); });
    return () => { alive = false; };
  }, []);
  const act = async (url, body = {}, method = 'post') => {
    setBusy(true); setError(''); setNotice('');
    try { const result = await api[method](url, body); await load(); setNotice(result.data.message); }
    catch(e) { setError(e.response?.data?.message || 'No se ha podido completar la acción.'); }
    finally { setBusy(false); }
  };
  const choose = id => { setUserId(id); const user = data.users.find(u => u.id === id); setDevices(Number(user?.max_devices || 1)); setIps(Number(user?.max_ips || 1)); };
  const approve = id => {
    if (duration === 'custom' && (!until || Number.isNaN(new Date(until).getTime()))) { setError('Selecciona una fecha futura.'); return; }
    act(`/access/requests/${id}/approve`, {duration, ...(duration === 'custom' ? {expires_at:new Date(until).toISOString()} : {})});
  };
  return <MainLayout>
    <h1 className="mb-3 text-3xl font-bold">Accesos autorizados</h1>
    <p className="mb-5 text-slate-300">Los administradores y agentes necesitan autorización por navegador e IP. El Super admin conserva su acceso habitual.</p>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-100 p-4 text-green-800">{notice}</p>}
    {!data && !error && <p>Cargando accesos…</p>}
    {data && <>
      <section className="mb-6 rounded-2xl bg-white p-5 text-slate-900">
        <h2 className="mb-3 text-xl font-bold">Límites por usuario</h2>
        <p className="mb-4 text-sm">Cada dispositivo e IP requiere aprobación. Un navegador diferente o borrar las cookies requiere una nueva solicitud.</p>
        <div className="flex flex-wrap items-end gap-4">
          <label>Usuario<select className={field+' block'} value={userId} onChange={e=>choose(e.target.value)}><option value="">Selecciona un usuario</option>{data.users.map(u=><option key={u.id} value={u.id}>{u.username} · {u.office_name}</option>)}</select></label>
          <label>Máximo de dispositivos<input className={field+' block w-28'} type="number" min="1" max="20" value={devices} onChange={e=>setDevices(Number(e.target.value))}/></label>
          <label>IP por dispositivo<input className={field+' block w-28'} type="number" min="1" max="20" value={ips} onChange={e=>setIps(Number(e.target.value))}/></label>
          <button disabled={!userId||busy} className="rounded-xl bg-brand-red px-4 py-2 text-white disabled:opacity-40" onClick={()=>act(`/access/policies/${userId}`,{max_devices:devices,max_ips:ips},'put')}>Guardar límites</button>
        </div>
      </section>
      <section className="mb-6 rounded-2xl bg-white p-5 text-slate-900">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <h2 className="mr-auto text-xl font-bold">Solicitudes ({data.requests.filter(r=>r.status==='pending').length} pendientes)</h2>
          <label>Mostrar<select className={field+' block'} value={view} onChange={e=>setView(e.target.value)}><option value="pending">Pendientes</option><option value="all">Todas</option></select></label>
          <label>Vigencia al aprobar<select className={field+' block'} value={duration} onChange={e=>setDuration(e.target.value)}><option value="1h">1 hora</option><option value="8h">8 horas</option><option value="24h">24 horas</option><option value="7d">7 días</option><option value="30d">30 días</option><option value="permanent">Hasta revocación</option><option value="custom">Fecha concreta</option></select></label>
          {duration==='custom'&&<label>Caduca el<input className={field+' block'} type="datetime-local" value={until} onChange={e=>setUntil(e.target.value)}/></label>}
          <button disabled={busy} className="underline text-brand-red" onClick={()=>{setBusy(true);load().catch(()=>setError('No se han podido actualizar los accesos.')).finally(()=>setBusy(false));}}>Actualizar</button>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Usuario / oficina</th><th>Dispositivo</th><th>IP / solicitud</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
          {data.requests.filter(r=>view==='all'||r.status==='pending').map(r=><tr key={r.id} className="border-t align-top"><td className="py-4 pr-4">{r.username}<small className="block">{r.office_name}</small></td><td className="max-w-xs py-4 pr-4 break-words"><details><summary className="cursor-pointer">Navegador · {r.device_id.slice(0,8)}</summary><p className="text-sm">{r.label}</p></details></td><td className="py-4 pr-4">{r.ip}<small className="block">{date(r.requested_at)}</small></td><td className="py-4 pr-4">{{pending:'Pendiente',approved:'Aprobada',rejected:'Rechazada'}[r.status]}</td><td className="py-4"><button disabled={busy} className="mr-3 text-brand-red underline disabled:opacity-40" onClick={()=>approve(r.id)}>Autorizar</button><button disabled={busy||r.status==='rejected'} className="underline disabled:opacity-40" onClick={()=>act(`/access/requests/${r.id}/reject`)}>Rechazar</button></td></tr>)}
        </tbody></table></div>
        {data.requests.filter(r=>view==='all'||r.status==='pending').length===0&&<p className="mt-4">No hay solicitudes {view==='pending'?'pendientes':''}.</p>}
        <p className="mt-4 text-sm text-slate-500">Se muestran hasta 500 solicitudes, dando prioridad a las pendientes. Las decisiones también figuran en el historial.</p>
      </section>
      <section className="rounded-2xl bg-white p-5 text-slate-900"><h2 className="mb-4 text-xl font-bold">Autorizaciones recientes</h2>
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Usuario / oficina</th><th>Dispositivo / IP</th><th>Vigencia</th><th>Acción</th></tr></thead><tbody>{data.grants.map(g=><tr key={g.id} className="border-t"><td className="py-3 pr-4">{g.username}<small className="block">{g.office_name}</small></td><td className="py-3 pr-4">{g.device_id.slice(0,8)}<small className="block">{g.ip}</small></td><td className="py-3 pr-4">{g.revoked_at?'Revocada':g.active?date(g.expires_at):'Caducada'}</td><td><button disabled={busy||!g.active} className="text-brand-red underline disabled:opacity-40" onClick={()=>act(`/access/grants/${g.id}/revoke`)}>Revocar IP</button><button disabled={busy||!g.active} className="ml-3 text-brand-red underline disabled:opacity-40" onClick={()=>act(`/access/devices/${g.device_id}/revoke`)}>Revocar dispositivo</button></td></tr>)}</tbody></table></div>
        {!data.grants.length&&<p>No hay autorizaciones registradas.</p>}
      </section>
    </>}
  </MainLayout>;
}
