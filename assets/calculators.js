(function(){
'use strict';
function factors(n){if(!Number.isInteger(n)||n<1||n>1000000)throw new Error('Use whole numbers from 1 to 1,000,000.');const low=[],high=[];for(let i=1;i*i<=n;i++)if(n%i===0){low.push(i);if(i!==n/i)high.push(n/i)}return low.concat(high.reverse())}
function gcf(a,b){factors(a);factors(b);while(b){const remainder=a%b;a=b;b=remainder}return a}
function calculate(a,op,b){let result;if(op==='+')result=a+b;else if(op==='−')result=a-b;else if(op==='×')result=a*b;else if(op==='÷'){if(b===0)throw new Error('Cannot divide by zero');result=a/b}else throw new Error('Choose an operation');if(!Number.isFinite(result))throw new Error('Number is too large');return Number(result.toPrecision(12))}
function newCalc(){return {entry:'0',acc:null,op:null,fresh:false,lastOp:null,lastB:null,error:false}}
function press(s,key){if(key==='AC')return newCalc();if(s.error)s=newCalc();try{
if(/^\d$/.test(key)){if(s.fresh){s.entry='0';s.fresh=false;if(!s.op)s.acc=null}s.entry=s.entry==='0'?key:s.entry==='-0'?'-'+key:s.entry.length<15?s.entry+key:s.entry;}
else if(key==='.'){if(s.fresh){s.entry='0';s.fresh=false;if(!s.op)s.acc=null}if(!s.entry.includes('.'))s.entry+='.';}
else if(key==='±'){if(Number(s.entry)!==0)s.entry=s.entry.startsWith('-')?s.entry.slice(1):'-'+s.entry;}
else if(key==='⌫'){if(!s.fresh){s.entry=s.entry.slice(0,-1);if(!s.entry||s.entry==='-')s.entry='0'}}
else if(['+','−','×','÷'].includes(key)){if(s.op&&!s.fresh){s.acc=calculate(s.acc,s.op,Number(s.entry));s.entry=String(s.acc)}else if(s.acc===null||!s.op)s.acc=Number(s.entry);s.op=key;s.fresh=true;s.lastOp=null;s.lastB=null;}
else if(key==='='){if(s.op){const b=Number(s.entry);s.entry=String(calculate(s.acc,s.op,b));s.lastOp=s.op;s.lastB=b;s.op=null;s.acc=Number(s.entry);s.fresh=true;}else if(s.lastOp){s.entry=String(calculate(Number(s.entry),s.lastOp,s.lastB));s.acc=Number(s.entry);s.fresh=true;}}
}catch(e){s={...newCalc(),entry:e.message,error:true}}return s}
const api={factors,gcf,calculate,newCalc,press};if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;
const root=document.querySelector('#calculatorCorner');if(!root)return;
const prefsKey='adalyn-learning-quest-calculators-v1';let prefs={open:false,mode:'gcf'};try{const p=JSON.parse(localStorage.getItem(prefsKey)||'{}');prefs={open:p.open===true,mode:['standard','multiplication'].includes(p.mode)?p.mode:'gcf'}}catch(e){}
function savePrefs(){try{localStorage.setItem(prefsKey,JSON.stringify(prefs))}catch(e){}}
root.open=prefs.open;root.addEventListener('toggle',()=>{prefs.open=root.open;savePrefs()});
function setMode(mode){prefs.mode=mode;root.querySelectorAll('[data-calculator-mode]').forEach(b=>{const selected=b.dataset.calculatorMode===mode;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected)});document.querySelector('#gcfPanel').hidden=mode!=='gcf';document.querySelector('#standardPanel').hidden=mode!=='standard';document.querySelector('#multiplicationPanel').hidden=mode!=='multiplication';savePrefs()}
root.querySelectorAll('[data-calculator-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.calculatorMode)));setMode(prefs.mode);
const aInput=document.querySelector('#factorA'),bInput=document.querySelector('#factorB'),result=document.querySelector('#factorResult');
const factorKey='adalyn-learning-quest-factors-v1';
aInput.value='';bInput.value='';
try{const saved=JSON.parse(localStorage.getItem(factorKey)||'{}');if(typeof saved.a==='string')aInput.value=saved.a;if(typeof saved.b==='string')bInput.value=saved.b}catch(e){}
function renderFactors(){try{localStorage.setItem(factorKey,JSON.stringify({a:aInput.value,b:bInput.value}))}catch(e){}const a=Number(aInput.value),b=Number(bInput.value);if(!aInput.value.trim()||!bInput.value.trim()){result.textContent='Enter two numbers to see their factors.';return}try{const greatest=gcf(a,b);const rows=[a,b].map(n=>`<div class="factor-row"><div class="factor-label">Factors of <strong>${n}</strong></div><div class="factor-squares">${factors(n).map(f=>`<span class="factor-square ${f===greatest?'gcf-square':''}" aria-label="${f}${f===greatest?', greatest common factor':''}">${f}${f===greatest?'<small>GCF</small>':''}</span>`).join('')}</div></div>`).join('');result.innerHTML=`<div class="gcf-answer">The GCF of ${a} and ${b} is <strong>${greatest}</strong> ⭐</div>${rows}<p class="calc-help">Factors divide a number evenly, with nothing left over. The yellow square in each row is the biggest factor both numbers share.</p>`;}catch(e){result.textContent=e.message}}
document.querySelector('#gcfForm').addEventListener('submit',e=>{e.preventDefault();renderFactors()});aInput.addEventListener('input',renderFactors);bInput.addEventListener('input',renderFactors);document.querySelector('#clearFactors').addEventListener('click',()=>{aInput.value='';bInput.value='';renderFactors();aInput.focus()});renderFactors();
const standardKey='adalyn-learning-quest-standard-v1';
let calc=newCalc(),history=[];
const ops=['+','−','×','÷'];
try{const saved=JSON.parse(localStorage.getItem(standardKey)||'{}'),s=saved.calc;
 if(s&&typeof s.entry==='string'&&s.entry.length<=100&&(s.error===true||Number.isFinite(Number(s.entry)))&&(s.acc===null||Number.isFinite(s.acc))&&(s.op===null||ops.includes(s.op))&&(s.lastOp===null||ops.includes(s.lastOp))&&(s.lastB===null||Number.isFinite(s.lastB)))calc={...newCalc(),...s};
 if(Array.isArray(saved.history))history=saved.history.filter(x=>typeof x==='string'&&x.length<=160);
}catch(e){}
const output=document.querySelector('#calcDisplay'),operation=document.querySelector('#calcOperation'),historyList=document.querySelector('#calcHistory');
function saveStandard(){try{localStorage.setItem(standardKey,JSON.stringify({calc,history}))}catch(e){}}
function renderStandard(){
 output.textContent=calc.entry;output.classList.toggle('calc-error',calc.error);operation.textContent=calc.op?`${calc.acc} ${calc.op}`:'';
 root.querySelectorAll('[data-calc-key]').forEach(b=>{b.classList.toggle('pending-op',!!calc.op&&b.dataset.calcKey===calc.op)});
 historyList.replaceChildren();
 if(!history.length){const empty=document.createElement('p');empty.className='calc-help';empty.textContent='Your calculations will appear here.';historyList.appendChild(empty)}
 else{const list=document.createElement('ol');for(const line of history){const item=document.createElement('li');item.textContent=line;list.appendChild(item)}historyList.appendChild(list)}
 historyList.scrollTop=historyList.scrollHeight;
}
function runKey(key){
 const before={...calc};
 calc=press(calc,key);
 let left,op,right;
 if(!before.error){
  if(key==='='&&before.op){left=before.acc;op=before.op;right=Number(before.entry)}
  else if(key==='='&&before.lastOp){left=Number(before.entry);op=before.lastOp;right=before.lastB}
  else if(ops.includes(key)&&before.op&&!before.fresh){left=before.acc;op=before.op;right=Number(before.entry)}
 }
 if(op)history.push(`${left} ${op} ${right} = ${calc.entry}`);
 saveStandard();renderStandard();
}
document.querySelector('#clearCalcHistory').addEventListener('click',()=>{history=[];saveStandard();renderStandard()});
renderStandard();
document.querySelector('#calcKeypad').addEventListener('click',e=>{const button=e.target.closest('[data-calc-key]');if(button)runKey(button.dataset.calcKey)});
document.querySelector('#standardPanel').addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Enter'&&e.target.tagName==='BUTTON')return;const map={'*':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Escape':'AC'};const key=map[e.key]||e.key;if(/^\d$/.test(key)||['.','+','−','×','÷','=','AC','⌫'].includes(key)){e.preventDefault();runKey(key)}});

const chart=document.querySelector('#multiplicationChart'),chartStatus=document.querySelector('#multiplicationStatus');
const chartKey='adalyn-learning-quest-multiplication-v1';
const selections={rows:new Set(),columns:new Set(),cells:new Set()};
try{const saved=JSON.parse(localStorage.getItem(chartKey)||'{}');for(const kind of ['rows','columns']){const valid=(Array.isArray(saved[kind])?saved[kind]:[]).filter(value=>Number.isInteger(value)&&value>=1&&value<=20);if(valid.length)selections[kind].add(valid[valid.length-1])}}catch(e){}
function chartButton(kind,value,label,text){return '<button type="button" data-chart-kind="'+kind+'" data-chart-value="'+value+'" aria-label="'+label+'" aria-pressed="false">'+text+'</button>'}
let table='<table class="multiplication-table"><caption>Multiplication facts from 1 to 20</caption><thead><tr><th scope="col" class="multiplication-corner">×</th>';
for(let c=1;c<=20;c++)table+='<th scope="col">'+chartButton('columns',c,'Highlight column '+c,c)+'</th>';
table+='</tr></thead><tbody>';
for(let r=1;r<=20;r++){table+='<tr><th scope="row">'+chartButton('rows',r,'Highlight row '+r,r)+'</th>';for(let c=1;c<=20;c++)table+='<td data-chart-row="'+r+'" data-chart-column="'+c+'">'+chartButton('cells',r+':'+c,r+' times '+c+' equals '+r*c,r*c)+'</td>';table+='</tr>'}
chart.innerHTML=table+'</tbody></table>';
function paintChart(message){
 chart.querySelectorAll('[data-chart-kind]').forEach(b=>{const kind=b.dataset.chartKind;const value=kind==='cells'?b.dataset.chartValue:Number(b.dataset.chartValue);b.setAttribute('aria-pressed',String((kind==='cells'?selections.rows.has(Number(value.split(':')[0]))&&selections.columns.has(Number(value.split(':')[1])):selections[kind].has(value))))});
 chart.querySelectorAll('td').forEach(td=>{td.classList.toggle('row-highlight',selections.rows.has(Number(td.dataset.chartRow)));td.classList.toggle('column-highlight',selections.columns.has(Number(td.dataset.chartColumn)))});
 if(message)chartStatus.textContent=message;
 try{localStorage.setItem(chartKey,JSON.stringify({rows:[...selections.rows],columns:[...selections.columns],cells:[...selections.cells]}))}catch(e){}
}
chart.addEventListener('click',e=>{
 const b=e.target.closest('[data-chart-kind]');if(!b||!chart.contains(b))return;
 const kind=b.dataset.chartKind,value=b.dataset.chartValue;let selected;
 if(kind==='cells'){
  const [r,c]=value.split(':').map(Number);
  selected=!(selections.rows.has(r)&&selections.columns.has(c));
  selections.rows.clear();selections.columns.clear();
  if(selected){selections.rows.add(r);selections.columns.add(c)}
 }else{
  const n=Number(value);selected=!selections[kind].has(n);
  selections[kind].clear();if(selected)selections[kind].add(n);
 }
 paintChart(b.getAttribute('aria-label')+(selected?' — selected.':' — deselected.'));
});
document.querySelector('#clearMultiplication').addEventListener('click',()=>{Object.values(selections).forEach(s=>s.clear());paintChart('All highlights cleared.')});
paintChart();

})();