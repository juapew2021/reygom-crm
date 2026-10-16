import {useEffect,useState} from 'react';
import {Navigate} from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import {canSearchRentals} from '../services/rentalAccess';
export default function RentalSearchAccess({children}){
 const [identity,setIdentity]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{const controller=new AbortController();api.get('/me',{signal:controller.signal}).then(({data})=>{if(!controller.signal.aborted)setIdentity(data.user);}).catch(()=>{if(!controller.signal.aborted)setError('No se pudo comprobar tu acceso. Vuelve a intentarlo.');});return()=>controller.abort();},[retry]);
 if(error)return <MainLayout><p role="alert">{error}</p><button className="mt-4 rounded-lg bg-brand-red px-4 py-2" onClick={()=>{setError('');setRetry(n=>n+1);}}>Volver a intentar</button></MainLayout>;
 if(!identity)return <MainLayout><p role="status">Comprobando acceso…</p></MainLayout>;
 if(!canSearchRentals(identity))return <Navigate to="/dashboard" replace/>;
 return children;
}
