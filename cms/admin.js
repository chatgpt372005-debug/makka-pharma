import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './config.js';
const el=id=>document.getElementById(id);
const status=(message,error=false)=>{el('status').textContent=message;el('status').classList.toggle('error',error)};
const configured=SUPABASE_URL.startsWith('https://')&&!!SUPABASE_PUBLISHABLE_KEY;
if(!configured){el('setup').classList.remove('hidden');status('Backend configuration is missing.',true)}else{start().catch(error=>{el('login').classList.remove('hidden');status('Dashboard could not connect. Please reload the page or check your connection. '+(error?.message||''),true);console.error(error)})}
async function start(){
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.10/+esm');
 const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
 let table='products',editing=null,records=[];
 async function verifyAdmin(){
  const {data:{user}}=await db.auth.getUser();
  if(!user)return false;
  const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
  return !error&&!!data;
 }
 async function refreshAuth(){
  const allowed=await verifyAdmin();
  el('login').classList.toggle('hidden',allowed);
  el('dashboard').classList.toggle('hidden',!allowed);
  el('logout').classList.toggle('hidden',!allowed);
  if(allowed)await load();
 }
 el('login-form').addEventListener('submit',async e=>{
  e.preventDefault();status('Signing in…');
  const {error}=await db.auth.signInWithPassword({email:el('email').value,password:el('password').value});
  if(error){status(error.message,true);return}
  if(!(await verifyAdmin())){await db.auth.signOut();status('This account is not authorized to manage Makka Pharma.',true);return}
  status('Signed in');await refreshAuth();
 });
 el('logout').addEventListener('click',async()=>{await db.auth.signOut();await refreshAuth();status('Signed out')});
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',async()=>{
  table=b.dataset.tab;editing=null;
  document.querySelectorAll('[data-tab]').forEach(t=>t.setAttribute('aria-selected',String(t===b)));
  el('editor-form').classList.toggle('hidden',table==='inquiries');
  el('editor-title').textContent=table==='partners'?'Add partner':table==='products'?'Add product':'Messages';
  el('list-title').textContent=table[0].toUpperCase()+table.slice(1);
  el('item-category').parentElement.classList.toggle('hidden',table==='partners');
  el('item-image').parentElement.firstChild.textContent=table==='partners'?'Logo URL':'Image URL';
  reset();await load();
 }));
 function reset(){editing=null;el('editor-form').reset();el('item-published').checked=true;el('editor-title').textContent='Add '+(table==='partners'?'partner':'product')}
 el('reset').addEventListener('click',reset);
 async function load(){
  const {data,error}=await db.from(table).select('*').order(table==='inquiries'?'created_at':'sort_order',{ascending:table!=='inquiries'});
  if(error){status(error.message,true);return}
  records=data||[];el('items').replaceChildren();
  for(const item of records){
   const row=document.createElement('div');row.className='item';
   const details=document.createElement('div');const name=document.createElement('strong');
   name.textContent=item.name||item.email||'Inquiry';details.append(name);
   const sub=document.createElement('span');sub.textContent=item.category||item.message||item.description||'';details.append(sub);row.append(details);
   if(table!=='inquiries'){
    const actions=document.createElement('div');actions.className='actions';
    const edit=document.createElement('button');edit.textContent='Edit';edit.className='secondary';edit.addEventListener('click',()=>{editing=item.id;el('item-name').value=item.name;el('item-category').value=item.category||'';el('item-image').value=item.image_url||item.logo_url||'';el('item-description').value=item.description||'';el('item-published').checked=item.published;el('editor-title').textContent='Edit '+(table==='partners'?'partner':'product');window.scrollTo({top:0,behavior:'smooth'})});
    const del=document.createElement('button');del.textContent='Delete';del.className='secondary';del.addEventListener('click',async()=>{if(!confirm('Delete this record?'))return;const {error}=await db.from(table).delete().eq('id',item.id);if(error)status(error.message,true);else await load()});
    actions.append(edit,del);row.append(actions);
   }
   el('items').append(row);
  }
 }
 el('editor-form').addEventListener('submit',async e=>{
  e.preventDefault();if(table==='inquiries')return;
  const payload={name:el('item-name').value.trim(),description:el('item-description').value.trim(),published:el('item-published').checked};
  if(table==='products'){payload.category=el('item-category').value.trim();payload.image_url=el('item-image').value.trim()}
  else{payload.logo_url=el('item-image').value.trim();payload.partnership_type='Partner'}
  const query=editing?db.from(table).update(payload).eq('id',editing):db.from(table).insert(payload);
  const {error}=await query;
  if(error){status(error.message,true);return}
  status('Saved successfully');reset();await load();
 });
 await refreshAuth();
}
