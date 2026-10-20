import { useEffect, useState } from 'react';
import api from '../../services/api';
import PanoramaViewer from '../PanoramaViewer';

export default function PropertyPanoramas({ propertyId }) {
 const [scenes,setScenes]=useState([]),[label,setLabel]=useState(''),[file,setFile]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[preview,setPreview]=useState(null);
 useEffect(()=>{if(!propertyId)return;const controller=new AbortController();api.get(`/properties/${propertyId}/panoramas`,{signal:controller.signal}).then(r=>setScenes(r.data)).catch(e=>{if(!controller.signal.aborted)setError(e.response?.data?.message||'No se pudieron cargar las vistas 360°.');});return()=>controller.abort();},[propertyId]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview.image_url);},[preview]);
 async function upload(event){
  event.preventDefault();if(!file)return;setBusy(true);setError('');setMessage('');
  try{const data=new FormData();data.append('label',label);data.append('panorama',file);const r=await api.post(`/properties/${propertyId}/panoramas`,data);setScenes(r.data);setFile(null);setLabel('');event.target.reset();setMessage('Panorámica guardada. Ya puedes previsualizarla.');}catch(e){setError(e.response?.data?.message||'No se pudo subir la panorámica.');}finally{setBusy(false);}
 }
 async function show(scene){setBusy(true);setError('');try{const r=await api.get(`/properties/${propertyId}/panoramas/${scene.id}/image`,{responseType:'blob'});setPreview({...scene,image_url:URL.createObjectURL(r.data)});}catch{setError('No se pudo abrir la panorámica.');}finally{setBusy(false);}}
 async function remove(scene){if(!window.confirm(`¿Quitar la estancia «${scene.label}» de la visita 360°?`))return;setBusy(true);setError('');try{await api.delete(`/properties/${propertyId}/panoramas/${scene.id}`);setScenes(current=>current.filter(s=>s.id!==scene.id));if(preview?.id===scene.id)setPreview(null);setMessage('Estancia retirada de la visita pública.');}catch(e){setError(e.response?.data?.message||'No se pudo quitar la estancia.');}finally{setBusy(false);}}
 return <section className="mt-8 rounded-2xl bg-white p-6 text-gray-900" aria-label="Vistas 360° del inmueble"><h2 className="text-2xl font-bold">Visita 360°</h2><p className="my-3 text-gray-600">Añade una panorámica esférica por estancia. Las fotos normales siguen en la galería. JPG, PNG o WebP; proporción 2:1; de 1024 × 512 a 8192 × 4096 píxeles; máximo 15 MB y 10 estancias.</p>
  <a className="font-bold underline" href="/web-preview/ejemplo-360" target="_blank" rel="noreferrer">Ver ejemplo 360° de demostración</a>
  {!propertyId?<p className="mt-4">Guarda primero el inmueble para añadir sus panorámicas.</p>:<>
  {error&&<p role="alert" className="my-4 text-red-700">{error}</p>}{message&&<p role="status" className="my-4 text-green-700">{message}</p>}
  <form onSubmit={upload} className="my-5 grid gap-4"><label className="font-bold">Nombre de la estancia<input required maxLength={80} value={label} onChange={e=>setLabel(e.target.value)} placeholder="Ej.: Salón" className="mt-2 block w-full rounded-lg border p-3" /></label><label className="font-bold">Panorámica 360°<input type="file" required accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files[0]||null)} className="mt-2 block w-full rounded-lg border p-3" /></label><button disabled={busy||!file||scenes.length>=10} className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Procesando…':'Guardar estancia 360°'}</button></form>
  <ul className="space-y-3">{scenes.map(scene=><li key={scene.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><span className="font-bold">{scene.label}</span><div className="flex gap-4"><button type="button" disabled={busy} onClick={()=>show(scene)} className="font-bold underline">Ver 360°</button><button type="button" disabled={busy} onClick={()=>remove(scene)} className="text-red-700 underline">Quitar</button></div></li>)}</ul>
  {!scenes.length&&<p className="text-gray-600">Este inmueble todavía no tiene estancias 360°.</p>}
  {preview&&<PanoramaViewer key={preview.image_url} scenes={[preview]} />}</>}
 </section>;
}
