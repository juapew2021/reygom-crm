import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import CountryRegionFields from '../../components/CountryRegionFields';

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900';
const fields = [
  ['title','Título del anuncio','text',160],['price','Precio (€)','number'],
  ['bedrooms','Habitaciones','number'],['bathrooms','Baños','number'],
  ['built_area','Superficie construida (m²)','number'],['contact_name','Tu nombre','text',100],
  ['phone','Teléfono de contacto','tel',30],['email','Correo electrónico','email',254],
];

export default function PublishPropertyPage() {
  const [config,setConfig]=useState(null);
  const [location,setLocation]=useState({country_code:'ES',region_code:'',city:''});
  const [error,setError]=useState('');
  const [result,setResult]=useState(null);
  const [sending,setSending]=useState(false);
  const [images,setImages]=useState([]);
  const [previews,setPreviews]=useState([]);
  useEffect(()=>{let active=true;api.get('/public/submissions/config').then(r=>{if(active)setConfig(r.data);}).catch(()=>{if(active)setError('No se puede cargar el formulario. Inténtalo más tarde.');});return()=>{active=false;};},[]);
  useEffect(()=>()=>previews.forEach(url=>URL.revokeObjectURL(url)),[previews]);
  function selectImages(event) {
    const files=Array.from(event.target.files||[]);
    if(files.length>10 || files.some(f=>f.size>5*1024*1024) || files.reduce((n,f)=>n+f.size,0)>20*1024*1024) {
      setError('Añade hasta 10 fotos, de 5 MB como máximo cada una y 20 MB en total.');event.target.value='';setImages([]);setPreviews([]);return;
    }
    setError('');setImages(files);setPreviews(files.map(f=>URL.createObjectURL(f)));
  }
  async function submit(event) {
    event.preventDefault();if(sending || !config?.enabled)return;
    if(!images.length){setError('Añade al menos una fotografía.');return;}
    setSending(true);setError('');
    const data=new FormData(event.currentTarget);images.forEach(file=>data.append('images[]',file));
    try{const response=await api.post('/public/submissions',data);setResult(response.data);}
    catch(e){setError(e.response?.data?.message||'No se pudo enviar. Conserva tus datos y vuelve a intentarlo.');}
    finally{setSending(false);}
  }
  return <main className="min-h-screen bg-brand-black px-4 py-8 text-white">
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex items-center justify-between"><Link to="/" className="text-2xl font-bold">ReyGom <span className="text-brand-red">Inmuebles</span></Link><Link to="/" className="text-sm underline">Acceso del equipo</Link></header>
      <h1 className="text-3xl font-bold">Publica tu inmueble</h1>
      <p className="mb-6 mt-2 text-slate-300">Alquiler o venta. Añade sus datos y fotos, verifica tu correo y el equipo revisará el anuncio antes de hacerlo público.</p>
      {config?.test_mode&&<p role="status" className="mb-5 rounded-xl bg-amber-100 p-4 text-amber-900">Entorno de pruebas DEV. No enviamos correos reales. El equipo puede probar la verificación desde su bandeja de revisión.</p>}
      {error&&<p role="alert" className="mb-4 rounded-xl bg-red-100 p-4 text-red-900">{error}</p>}
      {result?<section className="rounded-2xl bg-white p-6 text-slate-900"><h2 className="text-2xl font-bold">Anuncio recibido</h2><p className="mt-3">{result.message}</p><p className="mt-3">El anuncio aún no está publicado.</p></section>:
      !config?<p>Cargando formulario…</p>:!config.enabled?<p className="rounded-xl bg-white p-5 text-slate-900">Estamos preparando la publicación de inmuebles. Vuelve a visitarnos próximamente.</p>:
      <form onSubmit={submit} className="rounded-2xl bg-white p-6 text-slate-900">
        <div className="mb-5"><CountryRegionFields required value={location} disabled={sending} onChange={setLocation}/></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>Operación<select name="operation_type" className={inputClass} required><option>Alquiler</option><option>Venta</option></select></label>
          <label>Tipo de inmueble<select name="property_type" className={inputClass} required>{['Piso','Casa','Ático','Dúplex','Local','Terreno','Garaje'].map(t=><option key={t}>{t}</option>)}</select></label>
          <label>Código postal (opcional)<input key={[location.country_code,location.region_code,location.city_code].join('-')} name="postal_code" inputMode="numeric" maxLength={location.country_code === 'CO'?6:5} pattern={location.country_code === 'CO'?'[0-9]{6}':'[0-9]{5}'} className={inputClass}/></label>
          {fields.map(([name,label,type,maxLength])=><label key={name}>{label}<input name={name} type={type} className={inputClass} required maxLength={maxLength} min={type==='number'?(name==='bedrooms'||name==='bathrooms'?0:1):undefined} step={type==='number'?(name==='price'||name==='built_area'?'0.01':'1'):undefined} autoComplete={name==='email'?'email':name==='phone'?'tel':name==='contact_name'?'name':undefined}/></label>)}
        </div>
        <label className="mt-5 block">Descripción completa<textarea name="description" required maxLength={12000} rows={6} className={inputClass} placeholder="Distribución, estado del inmueble y condiciones de alquiler o venta."/></label>
        <label className="mt-5 block">Fotografías<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectImages} className="mt-2 block w-full"/></label>
        <p className="mt-2 text-sm text-slate-600">Entre 1 y 10 fotos JPG, PNG o WebP. Hasta 5 MB por foto, 20 MB en total y 16 megapíxeles por imagen.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">{previews.map((url,i)=><img key={url} src={url} alt={`Foto seleccionada ${i+1}`} className="h-28 w-full rounded-lg object-cover"/>)}</div>
        <div aria-hidden="true" className="hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
        <label className="mt-6 flex gap-3"><input type="checkbox" name="contact_consent" value="yes" required/><span>Autorizo al equipo de ReyGom a contactar conmigo para revisar y gestionar este anuncio. Mi teléfono y correo no se incluyen en la ficha pública de este formulario.</span></label>
        <button disabled={sending} className="mt-6 rounded-xl bg-brand-red px-6 py-3 font-bold text-white disabled:opacity-50">{sending?'Enviando…':'Enviar para verificar y revisar'}</button>
      </form>}
    </div>
  </main>;
}
