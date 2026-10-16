import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight,ArrowRight,Plus,RefreshCw,Building2,Users,Inbox,UsersRound,Palette,ChevronRight,CheckCircle2,FileText} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import {dashboardOverview,nextDashboardAction} from '../services/dashboardOverview';
import '../styles/dashboard.css';
const count=value=>value===null?'—':new Intl.NumberFormat('es-ES').format(value);
function Metric({title,value,note,to,icon:Icon}){
 const content=<><div className="overview-metric-top"><span>{title}</span><Icon size={19} aria-hidden="true"/></div><strong>{count(value)}</strong><div className="overview-metric-bottom"><small>{value===null?'Datos no disponibles':note}</small>{to&&<ArrowUpRight size={16} aria-hidden="true"/>}</div></>;
 return to?<Link to={to} className="overview-metric" aria-label={`${title}: ${count(value)}. Ver detalle`}>{content}</Link>:<article className="overview-metric">{content}</article>;
}
function Empty({icon:Icon,title,body,to,label}){return <div className="overview-empty"><span><Icon size={23} aria-hidden="true"/></span><h3>{title}</h3><p>{body}</p>{to&&<Link to={to}>{label}<ArrowRight size={14} aria-hidden="true"/></Link>}</div>;}
function money(p,country){const value=Number(p.price);if(p.price===null||p.price===''||!Number.isFinite(value))return 'Precio pendiente';const currency=p.currency||((p.country_code||country)==='CO'?'COP':'EUR');try{return new Intl.NumberFormat(currency==='COP'?'es-CO':'es-ES',{style:'currency',currency,maximumFractionDigits:0}).format(value);}catch{return new Intl.NumberFormat('es-ES').format(value);}}
export default function Dashboard(){
 const [state,setState]=useState({dashboard:null,identity:null,pending:null,team:null,warning:'',error:'',updated:null}),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 useEffect(()=>{const c=new AbortController();const get=path=>api.get(path,{signal:c.signal});
 Promise.allSettled([get('/dashboard'),get('/properties'),get('/leads'),get('/me')]).then(async results=>{
  if(c.signal.aborted)return;
  const data=index=>results[index].status==='fulfilled'?results[index].value.data:null;
  const summary=data(0),properties=Array.isArray(data(1))?data(1):null,leads=Array.isArray(data(2))?data(2):null,identity=data(3)?.user||null;
  let pending=null,team=null;
  if(['admin','superadmin'].includes(identity?.role)){
   const more=await Promise.allSettled([get('/submissions'),get('/office-users')]);
   if(c.signal.aborted)return;
   if(more[0].status==='fulfilled'&&Array.isArray(more[0].value.data))pending=more[0].value.data.filter(a=>a.status==='pending_review').length;
   if(more[1].status==='fulfilled'&&Array.isArray(more[1].value.data))team=more[1].value.data.filter(u=>u.is_active&&['agent','agente'].includes(u.role)&&u.organization_id===identity.organization_id).length;
  }
  const unavailable=!summary&&properties===null&&leads===null;
  setState({dashboard:unavailable?null:dashboardOverview(summary,properties,leads),identity,pending,team,updated:new Date(),error:unavailable?'No hemos podido cargar el resumen de tu oficina. Comprueba la conexión y vuelve a intentarlo.':'',warning:!unavailable&&(!summary||properties===null||leads===null)?'Algunos datos no se han podido cargar. Las cifras no disponibles se muestran con un guion.':''});setLoading(false);
 });return()=>c.abort();},[revision]);
 const {dashboard:d,identity,pending,team,warning,error,updated}=state;
 const manager=['admin','superadmin'].includes(identity?.role);
 const refresh=()=>{setLoading(true);setRevision(n=>n+1);};
 const next=d?nextDashboardAction({pending,properties:d.properties_count,leads:d.leads_count,manager}):null;
 const date=new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(updated||new Date());
 const pipeline=Object.entries(d?.pipeline||{}),pipelineTotal=pipeline.reduce((sum,[,n])=>sum+n,0);
 return <MainLayout><div className="overview">
  <div className="overview-heading"><div><p className="overview-eyebrow">{date}</p><h1>{identity?`Hola, ${identity.username}`:'Resumen de tu oficina'}</h1><p>Tu cartera, tu equipo y el próximo paso. Todo a mano.</p></div><div className="overview-heading-actions"><button onClick={refresh} disabled={loading} className="overview-refresh" aria-label="Actualizar resumen"><RefreshCw size={17} className={loading?'overview-spinning':''} aria-hidden="true"/><span>{loading?'Actualizando…':'Actualizar'}</span></button><Link to="/properties/new" className="overview-primary bg-brand-red"><Plus size={18} aria-hidden="true"/>Añadir inmueble</Link></div></div>
  {error&&<div className="overview-error" role="alert"><p>{error}</p><button onClick={refresh} disabled={loading}>Volver a intentar</button></div>}{warning&&<p role="status" className="overview-warning">{warning}</p>}
  {!d&&loading&&<div className="overview-loading" role="status">Preparando el resumen de tu oficina…</div>}
  {d&&<><div className={`overview-metrics${manager?'':' overview-metrics-agent'}`} aria-label="Cifras de tu oficina" aria-busy={loading}>
   <Metric title="Inmuebles" value={d.properties_count} note="En tu cartera" to="/properties" icon={Building2}/><Metric title="Contactos" value={d.leads_count} note="Oportunidades registradas" to="/leads" icon={Users}/>{manager&&<><Metric title="Anuncios por revisar" value={pending} note="Pendientes de aprobación" to="/submissions" icon={Inbox}/><Metric title="Agentes activos" value={team} note="En esta oficina" to="/administration" icon={UsersRound}/></>}
  </div>
  <div className="overview-focus-grid"><section className="overview-next"><div className="overview-next-content"><p className="overview-eyebrow">{next.eyebrow}</p><h2>{next.title}</h2><p>{next.body}</p><Link to={next.to} className="overview-primary bg-brand-red">{next.label}<ArrowRight size={17} aria-hidden="true"/></Link></div><div className="overview-next-art" aria-hidden="true"><Building2 size={70} strokeWidth={1}/><span><CheckCircle2 size={22}/></span></div></section>
  <section className="overview-shortcuts"><h2>{manager?'Gestiona tu oficina':'Accesos rápidos'}</h2><p>Accede directamente a lo que necesitas.</p>{(manager?[
   {to:'/submissions',icon:Inbox,label:'Anuncios recibidos',detail:pending===null?'Consultar bandeja':pending?`${pending} pendientes de revisión`:'Sin anuncios pendientes'},
   {to:'/administration',icon:UsersRound,label:identity?.role==='superadmin'?'Oficinas y equipo':'Mi equipo',detail:team===null?'Gestionar usuarios':`${team} ${team===1?'agente activo':'agentes activos'} en esta oficina`},
   {to:'/personalization',icon:Palette,label:'Marca de tu inmobiliaria',detail:'Logo, nombre y colores'},
  ]:[{to:'/leads',icon:Users,label:'Contactos de la oficina',detail:'Organizar el seguimiento'},{to:'/alquileres',icon:Building2,label:'Buscar alquileres',detail:'Pisos y habitaciones'},{to:'/profile',icon:UsersRound,label:'Mi perfil',detail:'Actualizar mi foto'}]).map(({to,icon:Icon,label,detail})=><Link to={to} key={to}><span className="overview-shortcut-icon"><Icon size={18} aria-hidden="true"/></span><span><strong>{label}</strong><small>{detail}</small></span><ChevronRight size={16} aria-hidden="true"/></Link>)}</section></div>
  <div className="overview-detail-grid"><section className="overview-panel"><div className="overview-panel-heading"><div><h2>Tu cartera reciente</h2><p>Los últimos inmuebles incorporados.</p></div><Link to="/properties">Ver cartera<ArrowUpRight size={14} aria-hidden="true"/></Link></div>
  {d.latest_properties===null?<p className="overview-data-error">No se pudo cargar la cartera. Puedes volver a intentarlo con Actualizar.</p>:d.latest_properties.length===0?<Empty icon={Building2} title="Dale vida a tu cartera" body="Los inmuebles que añadas aparecerán aquí para que puedas acceder a ellos rápidamente." to="/properties/new" label="Añadir un inmueble"/>:<div className="overview-properties">{d.latest_properties.map(p=><Link to={`/properties/${p.id}`} className="overview-property" key={p.id}><span className="overview-property-icon"><Building2 size={21} aria-hidden="true"/></span><span className="overview-property-info"><small>{p.reference_id}</small><strong>{p.title||'Inmueble sin título'}</strong><span>{p.city||p.province||'Ubicación pendiente'}</span></span><span className="overview-property-price"><strong>{money(p,identity?.country_code)}</strong><small>{p.status}</small></span><ChevronRight size={15} aria-hidden="true"/></Link>)}</div>}
  </section><section className="overview-panel"><div className="overview-panel-heading"><div><h2>Oportunidades comerciales</h2><p>Contactos agrupados por estado.</p></div><Link to="/leads">Ver contactos<ArrowUpRight size={14} aria-hidden="true"/></Link></div>
  {d.pipeline===null?<p className="overview-data-error">No se pudieron cargar los contactos. Puedes volver a intentarlo con Actualizar.</p>:pipelineTotal===0?<Empty icon={Users} title="Cada contacto es una oportunidad" body="Añade tus contactos y podrás ver en qué punto se encuentra cada conversación." to="/leads" label="Registrar un contacto"/>:<><div className="overview-pipeline">{pipeline.map(([stage,total])=><div key={stage}><div><span>{stage}</span><strong>{total}</strong></div><div className="overview-bar"><span style={{width:`${total/pipelineTotal*100}%`}}/></div></div>)}</div><div className="overview-recent-leads"><h3>Últimos contactos</h3>{d.latest_leads.map(l=><Link to="/leads" key={l.id}><span className="overview-lead-avatar" aria-hidden="true">{(l.full_name||'?').slice(0,1).toUpperCase()}</span><strong>{l.full_name||'Contacto sin nombre'}</strong><small>{l.pipeline_stage||'Nuevo'}</small></Link>)}</div></>}
  </section></div>
  {manager&&<div className="overview-publish"><FileText size={22} aria-hidden="true"/><div><strong>Recibe inmuebles de nuevos propietarios</strong><p>Comparte el formulario público. El equipo revisa los anuncios antes de incorporarlos a la cartera.</p></div><Link to="/publicar" target="_blank" rel="noreferrer">Abrir formulario<ArrowUpRight size={16} aria-hidden="true"/></Link></div>}
  <p className="overview-updated" role="status">{loading?'Actualizando los datos…':`Última consulta: ${updated?.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}. Datos de la oficina activa.`}</p>
  </>}
 </div></MainLayout>;
}
