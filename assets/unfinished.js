(function(){
'use strict';
const WEEK_KEY='adalyn-learning-quest-week-';
function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T12:00:00Z'))}
function sunday(value){const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-d.getUTCDay());return d.toISOString().slice(0,10)}
function cutoff(viewWeek,today){const realWeek=sunday(today);return viewWeek>realWeek?viewWeek:realWeek}
function unfinished(weeks,states,before){return weeks.filter(w=>w.start<before).map(w=>({...w,tasks:w.tasks.filter(t=>states[w.start]?.[t.id]?.done!==true)})).filter(w=>w.tasks.length)}
const api={validDate,sunday,cutoff,unfinished};if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;
const bridge=window.learningQuestWeek,root=document.querySelector('#unfinishedWeeks');if(!bridge||!root)return;
const scriptUrl=document.currentScript.src,base=new URL('../',scriptUrl);
const status=root.querySelector('[data-unfinished-status]'),list=root.querySelector('[data-unfinished-list]'),count=root.querySelector('[data-unfinished-count]');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let loaded=[],failed=[],busy=false,ready=false,refreshAgain=false;
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function readState(start){const raw=localStorage.getItem(WEEK_KEY+start);if(raw!==null)return JSON.parse(raw)||{};if(start==='2026-10-11'){const legacy=JSON.parse(localStorage.getItem('adalyn-learning-quest-2026-10-11-v1')||'{}'),result={};for(const t of loaded.find(w=>w.start===start)?.tasks||[]){if(legacy[t.legacyId])result[t.id]={done:legacy[t.legacyId].done===true,day:legacy[t.legacyId].day==='tomorrow'?'1':'0'}}return result}return {}}
function paint(){
 if(!ready)return;
 const states={};try{for(const w of loaded)states[w.start]=readState(w.start)}catch(e){count.textContent='Unavailable';status.textContent='Saved progress could not be read. Open the original week to check its assignments; no progress has been changed.';list.innerHTML='';return}
 const groups=unfinished(loaded,states,cutoff(bridge.weekStart,today()));
 const total=groups.reduce((sum,w)=>sum+w.tasks.length,0);
 count.textContent=total+' unfinished';
 status.textContent=failed.length?'Some earlier weeks could not be loaded. Use Refresh list to try again.':total?'Open an assignment to finish it in its original week. These missions do not add to this week’s totals.':'All checked off! No unfinished assignments found in earlier published weeks.';
 list.innerHTML=groups.map(w=>{
 const url=new URL('weeks/'+w.start+'.html',base);
 return '<section class="unfinished-week"><h3>Week of '+escape(w.start)+'</h3><ul>'+w.tasks.map(t=>{
  const target=new URL(url);target.searchParams.set('mission',t.id);
  const day=states[w.start]?.[t.id]?.day??t.defaultDay;
  const planned=/^[0-6]$/.test(String(day))?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][Number(day)]:'Not planned yet';
  return '<li><div><span class="unfinished-subject">'+escape(t.subject)+'</span><a href="'+escape(target.href)+'">'+escape(t.title)+' <span aria-hidden="true">↗</span></a><small>Original plan: '+planned+' · Week of '+escape(w.start)+'</small>'+(t.extra?'<p>'+escape(t.extra)+'</p>':'')+'</div></li>'
 }).join('')+'</ul></section>'
 }).join('');
}
async function refresh(){
 if(busy){refreshAgain=true;return}busy=true;status.textContent='Checking earlier weeks…';
 try{
 const response=await fetch(new URL('weeks.json',base),{cache:'no-store'});if(!response.ok)throw Error('registry');
 const registry=await response.json();if(!Array.isArray(registry))throw Error('registry');
 const earlier=[...new Map(registry.filter(w=>validDate(w.start)&&w.start<cutoff(bridge.weekStart,today())).map(w=>[w.start,w])).values()].sort((a,b)=>b.start.localeCompare(a.start));
 const results=await Promise.allSettled(earlier.map(async w=>{
  if(w.start===bridge.weekStart)return {...w,tasks:bridge.getTasks()};
  const response=await fetch(new URL('source/weekly-tasks-'+w.start+'.json',base),{cache:'no-store'});
  if(!response.ok)throw Error(w.start);
  const tasks=await response.json();if(!Array.isArray(tasks))throw Error(w.start);
  return {...w,tasks};
 }));
 loaded=[];failed=[];results.forEach((r,i)=>{if(r.status==='fulfilled')loaded.push(r.value);else failed.push(earlier[i].start)});
 ready=true;paint();
 }catch(e){count.textContent='Not loaded';status.textContent='Could not load earlier weeks. Check your connection and use Refresh list. Your saved checkmarks are unchanged.'}
 finally{busy=false;if(refreshAgain){refreshAgain=false;refresh()}}
}
root.querySelector('[data-unfinished-refresh]').addEventListener('click',refresh);
root.addEventListener('toggle',()=>{try{localStorage.setItem('adalyn-learning-quest-unfinished-open-v1',String(root.open))}catch(e){}if(root.open)refresh()});
try{root.open=localStorage.getItem('adalyn-learning-quest-unfinished-open-v1')==='true'}catch(e){}
window.addEventListener('storage',paint);window.addEventListener('focus',()=>refresh());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
new MutationObserver(paint).observe(document.querySelector('#missions'),{childList:true});
const mission=new URL(location.href).searchParams.get('mission');
if(mission)bridge.jumpTo(mission);
refresh();
})();
