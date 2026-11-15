document.querySelector('#year').textContent=new Date().getFullYear();const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.09,rootMargin:'0px 0px -35px 0px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'))}

/* Product search, category filtering and accessible detail view */
const productCards=[...document.querySelectorAll('.product-showcase-card')];
const productSearch=document.getElementById('product-search');
const portfolioCount=document.getElementById('portfolio-count');
let currentCategory='All products';
function updateProductGallery(){
 const term=(productSearch?.value||'').trim().toLocaleLowerCase();
 let shown=0;
 productCards.forEach(card=>{
  const categoryMatch=currentCategory==='All products'||card.dataset.category===currentCategory;
  const nameMatch=card.querySelector('h3').textContent.toLocaleLowerCase().includes(term);
  const hidden=!(categoryMatch&&nameMatch);
  card.classList.toggle('filtered-out',hidden);
  if(!hidden)shown++;
 });
 if(portfolioCount)portfolioCount.textContent=shown+' products shown';
}
document.querySelectorAll('.product-filter').forEach(button=>button.addEventListener('click',()=>{
 currentCategory=button.dataset.filter;
 document.querySelectorAll('.product-filter').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 updateProductGallery();
}));
productSearch?.addEventListener('input',updateProductGallery);
updateProductGallery();
const productDialog=document.getElementById('product-dialog');
const closeDialog=productDialog?.querySelector('.product-dialog-close');
let previousFocus=null;
productCards.forEach(card=>{
 card.setAttribute('tabindex','0');card.setAttribute('role','button');
 card.setAttribute('aria-label','View '+card.querySelector('h3').textContent+' details');
 function openProduct(){
  if(!productDialog)return;
  previousFocus=document.activeElement;
  const title=card.querySelector('h3').textContent;
  const category=card.dataset.category;
  const img=card.querySelector('img');
  document.getElementById('product-dialog-title').textContent=title;
  document.getElementById('product-dialog-category').textContent=category;
  const target=document.getElementById('product-dialog-image');
  target.src=img.getAttribute('src');target.alt=img.alt;
  document.getElementById('product-dialog-contact').href='mailto:info@makkapharma.com?subject='+encodeURIComponent('Product inquiry: '+title);
  productDialog.showModal();closeDialog?.focus();
 }
 card.addEventListener('click',openProduct);
 card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openProduct()}});
});
closeDialog?.addEventListener('click',()=>productDialog.close());
productDialog?.addEventListener('click',event=>{if(event.target===productDialog)productDialog.close()});
productDialog?.addEventListener('close',()=>previousFocus?.focus());
/* Subtle pointer response without excessive motion */
const heroVisual=document.querySelector('.hero-visual');
if(heroVisual&&matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
 heroVisual.addEventListener('pointermove',event=>{
  const rect=heroVisual.getBoundingClientRect();
  const x=(event.clientX-rect.left)/rect.width-.5;
  const y=(event.clientY-rect.top)/rect.height-.5;
  heroVisual.style.setProperty('--pointer-x',(x*9).toFixed(2)+'px');
  heroVisual.style.setProperty('--pointer-y',(y*9).toFixed(2)+'px');
 });
 heroVisual.addEventListener('pointerleave',()=>{heroVisual.style.setProperty('--pointer-x','0px');heroVisual.style.setProperty('--pointer-y','0px')});
}
