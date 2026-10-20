import { useState } from 'react';

export default function PanoramaViewer({ scenes, demo = false }) {
 const [active, setActive] = useState(0);
 const [started, setStarted] = useState(false);
 const scene = scenes[active] || scenes[0];
 if (!scene) return null;
 const source = `${import.meta.env.BASE_URL}360/pannellum.htm#panorama=${encodeURIComponent(scene.image_url)}&autoLoad=true&hfov=100`;
 return <section aria-label={demo ? 'Ejemplo 360°' : 'Visita 360°'} className="my-8 overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900">
  <div className="p-5"><h2 className="text-2xl font-bold">{demo ? 'Ejemplo 360°' : 'Conoce el inmueble en 360°'}</h2>
   <p className="mt-2 text-sm text-gray-600">{demo ? 'Demostración ilustrada. No corresponde a un inmueble real.' : 'Explora cada estancia a tu ritmo.'} Arrastra con el ratón o el dedo para mirar alrededor.</p>
  </div>
  {scenes.length > 1 && <div className="flex flex-wrap gap-2 px-5 pb-4" aria-label="Estancias">{scenes.map((item,index)=><button type="button" key={item.id} aria-pressed={active===index} onClick={()=>{setActive(index);setStarted(true);}} className={`rounded-lg border px-4 py-2 font-bold ${active===index?'bg-gray-900 text-white':'bg-white text-gray-900'}`}>{item.label}</button>)}</div>}
  {started ? <iframe key={source} title={`Vista 360°: ${scene.label}`} src={source} allowFullScreen referrerPolicy="no-referrer" className="block h-[360px] w-full border-0 sm:h-[480px]" /> : <div className="flex h-[280px] flex-col items-center justify-center gap-4 bg-gray-950 p-6 text-center text-white">
   <span className="text-5xl" aria-hidden="true">360°</span><p>{scene.label}</p>
   <button type="button" onClick={()=>setStarted(true)} className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white">{demo ? 'Probar ejemplo 360°' : 'Abrir visita 360°'}</button>
  </div>}
  {started && <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><p>Usa + / − para acercarte. Pantalla completa disponible en el visor. También puedes usar las flechas del teclado.</p><button type="button" className="font-bold underline" onClick={()=>setStarted(false)}>Cerrar visor</button></div>}
 </section>;
}
