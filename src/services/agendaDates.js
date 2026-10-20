export const ZONES=['Europe/Madrid','Atlantic/Canary','America/Bogota'];
export const KINDS={visit:'Visita',meeting:'Reunión',task:'Tarea'};
export const STATUSES={scheduled:'Programada',completed:'Completada',cancelled:'Cancelada'};
export function localInput(value,zone){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value));
 const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
export const dayKey=(value,zone)=>localInput(value,zone).slice(0,10);
export const shiftDay=(day,amount)=>new Date(Date.parse(day+'T12:00:00Z')+amount*86400000).toISOString().slice(0,10);
export const dayLabel=day=>new Intl.DateTimeFormat('es-ES',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long'}).format(new Date(day+'T12:00:00Z'));
export function coversDay(event,day,zone){return dayKey(event.starts_at,zone)<=day && dayKey(new Date(new Date(event.ends_at).getTime()-1),zone)>=day;}
export function monthDays(month){const first=month+'-01';const weekday=new Date(first+'T12:00:00Z').getUTCDay();const start=shiftDay(first,-((weekday+6)%7));return Array.from({length:42},(_,i)=>shiftDay(start,i));}
export function monthRange(month){return {from:shiftDay(month+'-01',-8)+'T00:00:00Z',to:shiftDay(month+'-01',44)+'T00:00:00Z'};}
export const eventTime=(event,zone)=>`${new Intl.DateTimeFormat('es-ES',{timeZone:zone,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(event.starts_at))} – ${new Intl.DateTimeFormat('es-ES',{timeZone:zone,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(event.ends_at))}`;
export function eventForm(event){return {...event,starts_at:localInput(event.starts_at,event.timezone),ends_at:localInput(event.ends_at,event.timezone),property_id:event.property_id||''};}
export const freshEvent=(day,timezone)=>({title:'',kind:'visit',starts_at:day+'T09:00',ends_at:day+'T10:00',timezone,property_id:'',location:'',notes:'',status:'scheduled'});
export function savePayload(form){return Object.fromEntries(['title','kind','starts_at','ends_at','timezone','property_id','location','notes','status'].map(key=>[key,form[key]]));}

export function validDay(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value?value:null;}
