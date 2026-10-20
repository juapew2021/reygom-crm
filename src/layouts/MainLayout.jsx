import {canSearchRentals} from '../services/rentalAccess';
import {useEffect,useRef,useState} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import {CalendarDays,LayoutDashboard,Building2,Users,Search,Mail,UserRound,Palette,UsersRound,Inbox,ShieldCheck,History,Menu,X,LogOut,ChevronRight} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';
import {themeStyle} from '../utils/brandTheme';
import '../styles/officeTheme.css';
import '../styles/workspace.css';
const roleName=role=>role==='superadmin'?'Super admin':role==='admin'?'Administrador de oficina':'Agente';
const navigation=[
 {title:'Tu actividad',items:[['/dashboard','Resumen',LayoutDashboard],['/agenda','Agenda',CalendarDays],['/properties','Inmuebles',Building2],['/leads','Leads y contactos',Users],['/alquileres','Búsqueda de alquileres',Search]]},
 {title:'Comunicación',items:[['/mail','Correo',Mail],['/notifications','Notificaciones',null]]},
 {title:'Tu oficina',manager:true,items:[['/administration','Mi equipo',UsersRound],['/submissions','Anuncios recibidos',Inbox],['/personalization','Marca de la oficina',Palette]]},
 {title:'Administración global',super:true,items:[['/access','Accesos autorizados',ShieldCheck],['/history','Historial de usuarios',History]]},
];
export default function MainLayout({children}){
 const [identity,setIdentity]=useState(null),[offices,setOffices]=useState([]),[accessError,setAccessError]=useState(''),[branding,setBranding]=useState(null),[profile,setProfile]=useState(null);
 const dialog=useRef(null),menuButton=useRef(null);
 const navigate=useNavigate(),location=useLocation();
 useEffect(()=>{let active=true;api.get('/me').then(async({data})=>{if(!active)return;setIdentity(data.user);if(data.user.role==='superadmin'){const r=await api.get('/offices');if(active)setOffices(r.data);}}).catch(e=>{if(active)setAccessError(e.response?.data?.message||'No se pudo comprobar el acceso.');});return()=>{active=false;};},[]);
 useEffect(()=>{let live=true,revision=0;const load=()=>{const current=++revision;Promise.all([api.get('/office-branding'),api.get('/profile')]).then(([b,p])=>{if(live&&current===revision){setBranding(b.data);setProfile(p.data);}}).catch(()=>{});};load();window.addEventListener('reygom-personalization-updated',load);return()=>{live=false;window.removeEventListener('reygom-personalization-updated',load);};},[]);
 const logout=async()=>{try{await api.post('/logout');}catch{/* Local logout remains available offline. */}finally{localStorage.clear();navigate('/');}};
 const closeMenu=()=>{dialog.current?.close();};
 const selected=path=>location.pathname===path||location.pathname.startsWith(path+'/');
 const linkClass=path=>'workspace-nav-link office-nav-link'+(selected(path)?' office-nav-active workspace-nav-active':'');
 const current=navigation.flatMap(g=>g.items).find(([path])=>selected(path))?.[1]||(selected('/profile')?'Mi perfil':'ReyGom CRM');
 const manager=identity&&['admin','superadmin'].includes(identity.role);
 const brandName=branding?.display_name||branding?.office_name||identity?.office_name||'ReyGom CRM';
 const sidebar=<>
  <div className="workspace-brand">{branding?.logo?<img src={branding.logo} alt={`Logo de ${brandName}`}/>:<span className="workspace-brand-mark" aria-hidden="true"><Building2 size={23}/></span>}<div><span className="workspace-brand-name">{brandName}</span><span className="workspace-brand-caption">Tu espacio inmobiliario</span></div></div>
  {identity?.role==='superadmin'&&<label className="workspace-office-select">Oficina activa<select aria-label="Oficina activa" value={identity.organization_id} onChange={e=>{localStorage.setItem('officeId',e.target.value);window.location.assign('/dashboard');}}>{offices.map(o=><option key={o.id} value={o.id}>{o.name}{o.status==='inactive'?' (inactiva)':''}</option>)}</select></label>}
  <nav className="workspace-navigation" aria-label="Navegación principal" onClick={e=>{if(e.target.closest('a'))closeMenu();}}>
   {navigation.filter(g=>(!g.manager||manager)&&(!g.super||identity?.role==='superadmin')).map(g=><div className="workspace-nav-group" key={g.title}><p className="workspace-nav-heading">{g.title}</p>{g.items.filter(([path])=>path!=='/alquileres'||canSearchRentals(identity)).map(([path,label,Icon])=>path==='/notifications'?<NotificationBell key={path} className={linkClass(path)}/>:<Link key={path} to={path} className={linkClass(path)} aria-current={selected(path)?'page':undefined}><Icon size={18} aria-hidden="true"/><span>{path==='/administration'&&identity?.role==='superadmin'?'Oficinas y equipo':label}</span></Link>)}</div>)}
  </nav>
  <div className="workspace-account">{identity&&<Link className="workspace-profile" to="/profile" onClick={closeMenu}>{profile?.photo?<img src={profile.photo} alt=""/>:<span className="workspace-avatar" aria-hidden="true">{identity.username.slice(0,2).toUpperCase()}</span>}<span><strong>{identity.username}</strong><small>{roleName(identity.role)}</small></span><UserRound size={17} aria-hidden="true"/></Link>}<button onClick={logout} className="workspace-logout"><LogOut size={16} aria-hidden="true"/>Cerrar sesión</button><p className="workspace-version">CRM {import.meta.env.VITE_APP_ENV||'DEV'} · v{import.meta.env.VITE_APP_VERSION||'0.5.0-dev'}</p></div>
 </>;
 return <div className="office-theme workspace-shell" style={themeStyle(branding||{})}>
  <a href="#workspace-content" className="workspace-skip">Saltar al contenido</a>
  <aside className="office-sidebar workspace-sidebar">{sidebar}</aside>
  <dialog ref={dialog} id="workspace-mobile-menu" aria-label="Menú principal" className="workspace-mobile-dialog office-sidebar" onClick={e=>{if(e.target===e.currentTarget)closeMenu();}} onClose={()=>menuButton.current?.focus()}><button className="workspace-close" onClick={closeMenu} aria-label="Cerrar menú"><X size={22}/></button>{sidebar}</dialog>
  <div className="workspace-main"><header className="workspace-topbar"><div><button ref={menuButton} className="workspace-menu-toggle" aria-label="Abrir menú principal" aria-haspopup="dialog" aria-controls="workspace-mobile-menu" onClick={()=>dialog.current?.showModal()}><Menu size={23}/></button><span className="workspace-breadcrumb">Tu oficina <ChevronRight size={13} aria-hidden="true"/><strong>{current}</strong></span></div><span className="workspace-env"><span aria-hidden="true"/> {import.meta.env.VITE_APP_ENV||'DEV'}</span></header>
  <main id="workspace-content" tabIndex={-1} className="workspace-content">{accessError&&<p role="alert" className="workspace-access-error">{accessError}</p>}{children}</main></div>
 </div>;
}
