import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Bell} from 'lucide-react';
import api from '../services/api';
export default function NotificationBell({className=''}){
 const [count,setCount]=useState(0),[offline,setOffline]=useState(false);
 useEffect(()=>{let live=true,inflight=false;const refresh=async()=>{if(inflight||document.visibilityState==='hidden')return;inflight=true;try{const r=await api.get('/notifications/unread');if(live){setCount(r.data.unread);setOffline(false);}}catch{if(live)setOffline(true);}finally{inflight=false;}};
 refresh();const timer=setInterval(refresh,30000);window.addEventListener('reygom-notifications-updated',refresh);document.addEventListener('visibilitychange',refresh);return()=>{live=false;clearInterval(timer);window.removeEventListener('reygom-notifications-updated',refresh);document.removeEventListener('visibilitychange',refresh);};},[]);
 return <Link to="/notifications" onClick={()=>window.dispatchEvent(new Event('reygom-notifications-open'))} className={`${className} flex items-center gap-2`} aria-label={`Notificaciones${count?`, ${count} sin leer`:''}${offline?', sin conexión':''}`}><Bell size={19} aria-hidden="true"/><span>Notificaciones</span>{count>0&&<span className="rounded-full bg-brand-red px-2 text-xs" aria-hidden="true">{count>99?'99+':count}</span>}{offline&&<span className="text-xs">Sin conexión</span>}</Link>;
}
