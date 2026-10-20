import { useEffect, useState } from 'react';
import api from '../../services/api';

const duration = value => `${Math.floor(Number(value || 0) / 60)} min ${Number(value || 0) % 60} s`;

export default function PropertyAnalytics({ propertyId }) {
  const [allowed, setAllowed] = useState(false);
  const [days, setDays] = useState(30);
  const [resource, setResource] = useState({ key: null, data: null, error: '' });
  const [refresh, setRefresh] = useState(0);
  const requestKey = `${propertyId}:${days}:${refresh}`;
  const loading = resource.key !== requestKey;
  const data = loading ? null : resource.data;
  const error = loading ? '' : resource.error;
  useEffect(() => {
    let active = true;
    api.get('/me').then(({ data: me }) => { if (active) setAllowed(['admin', 'superadmin'].includes(me.user?.role)); }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!allowed || !propertyId) return;
    const controller = new AbortController();
    api.get(`/properties/${propertyId}/analytics`, { params: { days }, signal: controller.signal }).then(response => {
      if (!controller.signal.aborted) setResource({ key: requestKey, data: response.data, error: '' });
    }).catch(() => { if (!controller.signal.aborted) setResource({ key: requestKey, data: null, error: 'No se han podido cargar las estadísticas. Vuelve a intentarlo más tarde.' }); });
    return () => controller.abort();
  }, [allowed, propertyId, days, requestKey]);
  if (!allowed || !propertyId) return null;
  return <section className="mt-8 rounded-3xl bg-white p-6 text-slate-800 shadow-sm" aria-labelledby="property-analytics-title">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 id="property-analytics-title" className="text-xl font-bold">Visitas del inmueble</h2>
      <label>Periodo <select className="ml-2 rounded-xl border p-2" value={days} onChange={e => setDays(Number(e.target.value))}>
        {[7, 30, 90].map(value => <option key={value} value={value}>Últimos {value} días</option>)}
      </select></label>
      <button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)} className="rounded-xl border px-4 py-2 font-semibold disabled:opacity-50">Actualizar</button>
    </div>
    <p className="mt-2 text-sm text-slate-500">Visitas de la web con estadísticas aceptadas. Cada apertura cuenta como una visita; no equivale a personas únicas. El tiempo es aproximado y se pausa en segundo plano o tras un minuto sin actividad.</p>
    {loading && <p role="status" className="mt-4">Cargando estadísticas…</p>}
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {data && <>
      <div className="my-6 grid gap-4 sm:grid-cols-3">
        {[[String(data.summary.visits), 'Visitas'], [duration(data.summary.average_seconds), 'Tiempo medio activo'], [duration(data.summary.active_seconds), 'Tiempo activo total']].map(([value, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="text-2xl font-bold">{value}</p><p className="text-sm text-slate-600">{label}</p></div>)}
      </div>
      {!data.summary.visits && <p className="mb-4">Todavía no hay visitas registradas en este periodo. Las estadísticas empiezan al activar esta función en la web.</p>}
      <div className="grid gap-6 lg:grid-cols-2">{[['Origen del enlace', data.sources], ['Ubicación aproximada', data.locations]].map(([title, rows]) => <div key={title}>
        <h3 className="mb-3 font-bold">{title}</h3>
        <table className="w-full text-left text-sm"><thead><tr><th scope="col">{title === 'Origen del enlace' ? 'Origen' : 'Lugar'}</th><th scope="col">Visitas</th><th scope="col">Tiempo medio</th></tr></thead><tbody>{rows.map(row => <tr key={row.label} className="border-t"><td className="py-2">{row.label}</td><td>{row.visits}</td><td>{duration(row.average_seconds)}</td></tr>)}</tbody></table>
      </div>)}</div>
      <details className="mt-6"><summary className="cursor-pointer font-semibold">Ver visitas por día (UTC)</summary><ul className="mt-3 space-y-1">{data.daily.map(row => <li key={row.day}>{row.day}: {row.visits} visitas</li>)}</ul></details>
      {!!data.recent?.length && <div className="mt-6 overflow-x-auto"><h3 className="mb-3 font-bold">Últimas 50 visitas del periodo</h3><table className="w-full min-w-[520px] text-left text-sm"><thead><tr><th scope="col">Fecha y hora</th><th scope="col">Lugar aproximado</th><th scope="col">Origen</th><th scope="col">Tiempo activo</th></tr></thead><tbody>{data.recent.map((row, index) => <tr key={index} className="border-t"><td className="py-2">{new Date(row.started_at).toLocaleString('es-ES')}</td><td>{[row.city, row.region, row.country].filter(Boolean).join(' · ') || 'No disponible'}</td><td>{row.source}</td><td>{duration(row.active_seconds)}</td></tr>)}</tbody></table></div>}
      <p className="mt-4 text-xs text-slate-500">La ubicación puede corresponder al proveedor de internet o a una VPN. No identifica el domicilio del visitante. Datos conservados 90 días. <a className="underline" href="https://db-ip.com" target="_blank" rel="noreferrer">Geolocalización por DB-IP</a>.</p>
    </>}
  </section>;
}
