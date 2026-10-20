import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {CalendarDays,Plus,ArrowRight} from 'lucide-react';
import api from '../services/api';
import {coversDay,dayKey,dayLabel,shiftDay,eventTime,KINDS} from '../services/agendaDates';
import '../styles/agenda.css';

export default function AgendaDashboard(){
 const [resource,setResource]=useState({meta:null,events:[],error:'',loading:true});const [selected,setSelected]=useState(null);
 useEffect(()=>{const c=new AbortController();api.get('/agenda/context',{signal:c.signal}).then(async({data:meta})=>{
  const today=dayKey(new Date(),meta.timezone);const {data}=await api.get('/agenda',{signal:c.signal,params:{from:shiftDay(today,-1)+'T00:00:00Z',to:shiftDay(today,9)+'T00:00:00Z'}});
  if(!c.signal.aborted)setResource({meta,events:data.events,error:'',loading:false});
 }).catch(()=>{if(!c.signal.aborted)setResource({meta:null,events:[],error:'No se pudo cargar la agenda. Ábrela para volver a intentarlo.',loading:false});});return()=>c.abort();},[]);
 const {meta,events,error,loading}=resource;const today=meta?dayKey(new Date(),meta.timezone):null;const active=selected||today;
 const scheduled=events.filter(e=>e.status==='scheduled');const rows=meta?scheduled.filter(e=>coversDay(e,active,meta.timezone)):[];
 return <section className="agenda-widget" aria-label="Agenda del dashboard"><div className="agenda-heading"><div><p className="agenda-eyebrow">TU ORGANIZACIÓN DIARIA</p><h2>{meta?.can_view_team?'Agenda de tu oficina':'Tu agenda'}</h2><p>{meta?`Horarios en ${meta.timezone}. ${meta.can_view_team?'Consulta las visitas y tareas del equipo.':'Organiza tus visitas, reuniones y tareas.'}`:'Preparando la agenda…'}</p></div><div className="agenda-actions"><Link to="/agenda?new=1" className="agenda-primary"><Plus size={16}/>Programar</Link><Link to="/agenda">Abrir calendario<ArrowRight size={16}/></Link></div></div>
  {loading&&<p role="status">Cargando tu programación…</p>}{error&&<p role="alert">{error}</p>}
  {meta&&<><div className="agenda-week" aria-label="Próximos siete días">{Array.from({length:7},(_,i)=>shiftDay(today,i)).map(day=><button type="button" key={day} aria-pressed={day===active} aria-label={`${dayLabel(day)}, ${scheduled.filter(e=>coversDay(e,day,meta.timezone)).length} citas`} onClick={()=>setSelected(day)}><span>{day===today?'Hoy':dayLabel(day).split(',')[0].slice(0,3)}</span><strong>{Number(day.slice(-2))}</strong><small>{scheduled.filter(e=>coversDay(e,day,meta.timezone)).length} citas</small></button>)}</div><h3 className="agenda-day-title">{dayLabel(active)}</h3>
  {!rows.length?<div className="agenda-empty"><CalendarDays size={28}/><p>No hay citas programadas para este día.</p><Link to="/agenda?new=1">Añadir una cita</Link></div>:<ul className="agenda-upcoming">{rows.slice(0,5).map(e=><li key={e.id}><span className={`agenda-kind agenda-kind-${e.kind}`}>{KINDS[e.kind]}</span><div><Link to={`/agenda?day=${active}`}><strong>{e.title}</strong></Link><p>{eventTime(e,meta.timezone)}</p>{meta.can_view_team&&<small>{e.owner_name}</small>}</div></li>)}</ul>}{rows.length>5&&<Link to={`/agenda?day=${active}`}>Ver las {rows.length} citas de este día</Link>}</>}
 </section>;
}
