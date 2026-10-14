import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
export default function VerifySubmissionPage(){
  const token=new URLSearchParams(window.location.hash.slice(1)).get('token')||'';
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  async function verify(){setBusy(true);setError('');try{const r=await api.post('/public/submissions/verify',{token});setMessage(r.data.message);}catch(e){setError(e.response?.data?.message||'No se pudo verificar el correo.');}finally{setBusy(false);}}
  return <main className="min-h-screen bg-brand-black p-8 text-white"><section className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-slate-900"><h1 className="text-2xl font-bold">Verificar correo</h1><p className="my-4">Confirma tu correo para que el equipo pueda revisar tu anuncio.</p>{message?<p role="status">{message}</p>:<button disabled={busy||!token} onClick={verify} className="rounded-xl bg-brand-red px-5 py-3 text-white">{busy?'Verificando…':'Confirmar correo'}</button>}{error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}<Link to="/publicar" className="mt-5 block underline">Volver a ReyGom</Link></section></main>;
}
