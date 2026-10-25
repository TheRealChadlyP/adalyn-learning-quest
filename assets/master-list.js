(function(){
const base=new URL('../',document.currentScript.src),parent=document.querySelector('.parent-tools'),button=document.createElement('button'),panel=document.createElement('div');
button.textContent='View master assignment list';button.type='button';panel.hidden=true;panel.style.cssText='overflow:auto;max-height:600px;margin-top:15px;background:white;padding:12px';
parent.append(button,panel);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
button.addEventListener('click',async()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(panel.hidden)return;panel.textContent='Loading all published weeks…';
try{const response=await fetch(new URL('weeks.json',base),{cache:'no-store'});if(!response.ok)throw Error();const weeks=await response.json();let rows='',errors=[];
for(const week of weeks){try{const r=await fetch(new URL('source/weekly-tasks-'+week.start+'.json',base),{cache:'no-store'});if(!r.ok)throw Error();const tasks=await r.json(),state=JSON.parse(localStorage.getItem('adalyn-learning-quest-week-'+week.start)||'{}');
for(const t of tasks){const s=state[t.id]||{},day=s.day??t.defaultDay;let planned='Unplanned';if(/^[0-6]$/.test(String(day))){const date=new Date(week.start+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+Number(day));planned=date.toISOString().slice(0,10)}
const url=new URL('weeks/'+week.start+'.html',base);url.searchParams.set('mission',t.id);
rows+='<tr>'+[week.start,t.subject,'<a href="'+esc(url.href)+'">'+esc(t.title)+'</a>',planned,s.done?'Complete':'Incomplete',s.done?(s.completedAt?new Date(s.completedAt).toLocaleString():'Not recorded (older checkmark)'):'—'].map((v,i)=>'<td style="padding:8px;border-bottom:1px solid #ddd">'+(i===2?v:esc(v))+'</td>').join('')+'</tr>'}
}catch(e){errors.push(week.start)}}
panel.innerHTML='<p>All published weeks · Completion means checked off in this app, not verified in Canvas. Older completion dates cannot be recovered.</p>'+(errors.length?'<p>Could not load: '+esc(errors.join(', '))+'. Close and reopen to retry.</p>':'')+'<table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr>'+['Week','Subject','Assignment','Planned date','Status','Completed at'].map(s=>'<th style="text-align:left;padding:8px">'+s+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table>';
}catch(e){panel.textContent='Could not load the list. Check your connection, then close and reopen it.'}
});
})();