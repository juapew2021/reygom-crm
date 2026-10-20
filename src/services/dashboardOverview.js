export function dashboardOverview(summary,properties,leads){
 const count=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
 const pipeline=new Map();
 if(Array.isArray(leads))for(const lead of leads){const stage=lead.pipeline_stage||'Nuevo';pipeline.set(stage,(pipeline.get(stage)||0)+1);}
 return {properties_count:Array.isArray(properties)?properties.length:null,leads_count:Array.isArray(leads)?leads.length:null,visits_today:count(summary?.visits_today),sales_count:count(summary?.sales_count),latest_properties:Array.isArray(properties)?properties.slice(0,4):null,latest_leads:Array.isArray(leads)?leads.slice(0,4):null,pipeline:Array.isArray(leads)?Object.fromEntries(pipeline):null};
}
export function nextDashboardAction({pending,properties,leads,manager}){
 if(manager&&pending>0)return {eyebrow:'Tu siguiente paso',title:`${pending} ${pending===1?'anuncio espera':'anuncios esperan'} tu revisión`,body:'Revisa los datos y las fotos antes de incorporar los anuncios a tu cartera.',label:'Revisar anuncios',to:'/submissions'};
 if(properties===0)return {eyebrow:'Empieza por tu cartera',title:'Tu próximo negocio empieza con un inmueble',body:'Añade los datos y las fotos de tu primer inmueble para empezar a trabajar con tu equipo.',label:'Añadir primer inmueble',to:'/properties/new'};
 if(leads===0)return {eyebrow:'Da el siguiente paso',title:'Convierte el interés en oportunidades',body:'Registra tus primeros contactos y organiza su seguimiento desde un solo lugar.',label:'Añadir un contacto',to:'/leads'};
 return {eyebrow:'Tu siguiente paso',title:'Dale continuidad a tus oportunidades',body:'Revisa tus contactos y actualiza su estado para que el equipo sepa cómo avanza cada operación.',label:'Gestionar contactos',to:'/leads'};
}
