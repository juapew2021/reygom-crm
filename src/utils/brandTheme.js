export function contrast(a,b){
 const lum=hex=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;};
 return (Math.max(lum(a),lum(b))+0.05)/(Math.min(lum(a),lum(b))+0.05);
}
export function readableInk(background){return contrast(background,'#ffffff')>=contrast(background,'#000000')?'#ffffff':'#000000';}
// Keep the office's hue when its original color needs more contrast for text.
function readableAccent(primary,background){
 if(contrast(primary,background)>=4.5)return primary;
 const target=readableInk(background);
 for(let step=1;step<=20;step++){
  const mixed='#'+[1,3,5].map(i=>Math.round(parseInt(primary.slice(i,i+2),16)*(1-step/20)+parseInt(target.slice(i,i+2),16)*step/20).toString(16).padStart(2,'0')).join('');
  if(contrast(mixed,background)>=4.5)return mixed;
 }
 return target;
}
export function themeStyle(branding={}){
 const primary=/^#[a-f0-9]{6}$/i.test(branding.primary_color||'')?branding.primary_color:'#e02424';
 const sidebar=/^#[a-f0-9]{6}$/i.test(branding.sidebar_color||'')?branding.sidebar_color:'#000000';
 const ink=readableInk(sidebar);
 return {'--color-brand-red':primary,'--office-content-accent':readableAccent(primary,'#ffffff'),'--office-primary':primary,'--office-primary-ink':readableInk(primary),'--office-sidebar':sidebar,'--office-sidebar-ink':ink,'--office-nav-active':readableAccent(primary,sidebar)};
}
