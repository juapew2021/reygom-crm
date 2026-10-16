import {themeStyle} from "../utils/brandTheme";
import "../styles/officeTheme.css";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useLocation, useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const [identity, setIdentity] = useState(null);
  const [offices, setOffices] = useState([]);
  const [accessError, setAccessError] = useState('');
  useEffect(() => {
    let active=true;
    api.get('/me').then(async ({data}) => {
      if(!active)return; setIdentity(data.user);
      if(data.user.role==='superadmin') { const result=await api.get('/offices');if(active)setOffices(result.data); }
    }).catch(e=>{if(active)setAccessError(e.response?.data?.message||'No se pudo comprobar el acceso.');});
    return ()=>{active=false;};
  }, []);
  const [branding,setBranding]=useState(null);
  const [profile,setProfile]=useState(null);
  useEffect(()=>{
    let live=true,revision=0;
    const load=()=>{
      const current=++revision;
      Promise.all([api.get('/office-branding'),api.get('/profile')]).then(([b,p])=>{
        if(live&&current===revision){setBranding(b.data);setProfile(p.data);}
      }).catch(()=>{ /* Existing navigation stays usable if personalization is unavailable. */ });
    };
    load();window.addEventListener('reygom-personalization-updated',load);
    return()=>{live=false;window.removeEventListener('reygom-personalization-updated',load);};
  },[]);
  const navigate = useNavigate();
  const location = useLocation();

  const appVersion =
    import.meta.env.VITE_APP_VERSION || "0.5.0-dev";

  const appEnvironment =
    import.meta.env.VITE_APP_ENV || "DEV";

  const logout = async () => {
    try { await api.post('/logout'); }
    catch { /* El cierre local también funciona sin conexión. */ }
    finally { localStorage.clear(); navigate('/'); }
  };

  const linkClass = (path) =>
    [
      "office-nav-link block rounded-xl px-3 py-2 transition",
      location.pathname.startsWith(path)
        ? "office-nav-active bg-white/10 font-bold"
        : "text-white hover:bg-white/5 hover:text-brand-red",
    ].join(" ");

  return (
    <div className="office-theme min-h-screen bg-brand-black text-white" style={themeStyle(branding||{})}>
      <aside className="office-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-black p-6">
        <div className="mb-8">
          {branding?.logo&&<img src={branding.logo} alt="Logo de la inmobiliaria" className="mb-3 max-h-24 w-full object-contain"/>}
          <h1 className="break-words text-2xl font-bold">{branding?.display_name||branding?.office_name||<>ReyGom <span className="text-brand-red">CRM</span></>}</h1>
        </div>

        {identity && <div className="mb-5 text-sm">{profile?.photo&&<img src={profile.photo} alt="Tu foto de perfil" className="mb-3 h-14 w-14 rounded-full object-cover"/>}<p className="font-bold">{identity.username} · {identity.role==='superadmin'?'Super admin':identity.role==='admin'?'Administrador de oficina':'Agente'}</p>
{identity.role==='superadmin'?<label className="mt-2 block">Oficina activa<select aria-label="Oficina activa" className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white" value={identity.organization_id} onChange={e=>{localStorage.setItem('officeId',e.target.value);window.location.assign('/dashboard');}}>{offices.map(o=><option key={o.id} value={o.id}>{o.name}{o.status==='inactive'?' (inactiva)':''}</option>)}</select></label>:<p>{identity.office_name}</p>}</div>}
        {accessError&&<p role="alert" className="mb-4 text-red-300">{accessError}</p>}
        <nav className="space-y-2">
{identity&&<Link to="/profile" className={linkClass("/profile")}>Mi perfil</Link>}
{identity&&['admin','superadmin'].includes(identity.role)&&<Link to="/personalization" className={linkClass("/personalization")}>Personalizar inmobiliaria</Link>}
{identity&&['admin','superadmin'].includes(identity.role)&&<Link to="/mail" className={linkClass("/mail")}>Correo</Link>}
{identity?.role==='superadmin'&&<Link to="/access" className={linkClass('/access')}>Accesos autorizados</Link>}
{identity?.role==='superadmin'&&<Link to="/history" className={linkClass('/history')}>Historial de usuarios</Link>}
{identity&&['admin','superadmin'].includes(identity.role)&&<Link to="/administration" className={linkClass('/administration')}>{identity.role==='superadmin'?'Oficinas y equipo':'Mi equipo'}</Link>}
{identity&&['admin','superadmin'].includes(identity.role)&&<Link to="/submissions" className={linkClass("/submissions")}>Anuncios recibidos</Link>}
          <Link
            to="/dashboard"
            className={linkClass("/dashboard")}
          >
            Dashboard
          </Link>

          <Link
            to="/properties"
            className={linkClass("/properties")}
          >
            Inmuebles
          </Link>

          <Link
            to="/leads"
            className={linkClass("/leads")}
          >
            Leads
          </Link>

          <Link
            to="/alquileres"
            className={linkClass("/alquileres")}
          >
            Alquileres
          </Link>

          <span className="block rounded-xl px-3 py-2 text-gray-500">
            Agenda
          </span>

          <span className="block rounded-xl px-3 py-2 text-gray-500">
            Reportes
          </span>
        </nav>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl bg-brand-red px-5 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Cerrar sesión
          </button>

          <div className="mt-2 text-center text-xs text-slate-400">
            <div>CRM {appEnvironment}</div>
            <div>v{appVersion}</div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;