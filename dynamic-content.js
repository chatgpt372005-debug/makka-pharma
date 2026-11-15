/* Supabase-backed public catalogue; static HTML remains a fallback if API is unavailable. */
(() => {
 const API='https://fyndscnhdbmtvqqegxbe.supabase.co/rest/v1', KEY='sb_publishable_Xwx_hzTtU2KdZCO59MyKKg_DZU9YYfA';
 const headers={apikey:KEY,Authorization:'Bearer '+KEY};
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 const asset=url=>{if(!url)return '';try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
 async function get(table){const r=await fetch(API+'/'+table+'?select=*&published=eq.true&order=sort_order.asc',{headers});if(!r.ok)throw Error('Content request failed');return await r.json()}
 function card(item){
  const c=make('article','product-showcase-card visible');c.dataset.category=item.category;c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-label','View '+item.name+' details');
  const photo=make('div','product-photo'),img=make('img');img.src=asset(item.image_url);img.alt=item.name+' product packaging';img.loading='lazy';photo.append(img);
  const caption=make('div','product-caption');caption.append(make('span','',item.category),make('h3','',item.name));c.append(photo,caption);
  const open=()=>{const dlg=document.getElementById('product-dialog');if(!dlg)return;document.getElementById('product-dialog-title').textContent=item.name;document.getElementById('product-dialog-category').textContent=item.category;const target=document.getElementById('product-dialog-image');target.src=img.src;target.alt=img.alt;document.getElementById('product-dialog-contact').href='mailto:info@makkapharma.com?subject='+encodeURIComponent('Product inquiry: '+item.name);dlg.showModal()};
  c.addEventListener('click',open);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  return c;
 }
 function partner(item,i){
  const article=make('article','partnership-card visible'),visual=make('div','partnership-card-visual '+(['visual-rameda','visual-motahedon','visual-private'][i%3]));
  if(item.logo_url){const img=make('img','partner-brand-image');img.src=asset(item.logo_url);img.alt=item.name+' logo';visual.append(img)}else visual.append(make('span','partner-wordmark',item.name));
  visual.append(make('span','partner-visual-tag',item.partnership_type));
  const body=make('div','partnership-card-body');body.append(make('span','partner-counter',String(i+1).padStart(2,'0')+' / '+item.partnership_type),make('h3','',item.name),make('p','',item.description));
  article.append(visual,body);return article;
 }
 Promise.allSettled([get('products'),get('partners')]).then(([prod,parts])=>{
  if(prod.status==='fulfilled'){
   const grid=document.querySelector('.product-showcase-grid');
   if(grid){grid.replaceChildren(...prod.value.map(card));productCards=[...grid.querySelectorAll('.product-showcase-card')];updateProductGallery()}
  }
  if(parts.status==='fulfilled'){
   const grid=document.querySelector('.partnership-cards');if(grid)grid.replaceChildren(...parts.value.map(partner))
  }
 }).catch(console.error);
})();