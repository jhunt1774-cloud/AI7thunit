'use strict';
(() => {
  const M=window.LanternLab,root=document.getElementById('coordinate-lab');
  if(!root||!M)return;
  const fields=['x','y','z','height'],numbers={},ranges={};
  fields.forEach(k=>{numbers[k]=document.getElementById('tower-'+k);ranges[k]=document.getElementById('tower-'+k+'-range');});
  const pick=document.getElementById('lab-challenge'),error=document.getElementById('lab-error'),feedback=document.getElementById('lab-feedback');
  const history=[],fmt=M.fmt;
  let current={...M.challenges[0].start};
  const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const txt=(x,y,s,anchor='start',fill='#183e36')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="22">${escaped(s)}</text>`;
  const line=(x1,y1,x2,y2,color='#c4d0bd',width=1)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
  function topView(e){
    const X=v=>60+(v+12)*20,Y=v=>40+(10-v)*20;
    let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" role="img" aria-label="Top view of4 by4 meter tower body at x${e.x},y${e.y}. Body x bounds${e.bounds.left} to${e.bounds.right};y bounds${e.bounds.front} to${e.bounds.back}.">`;
    s+='<rect x="60" y="40" width="480" height="400" fill="#e9f1e3" stroke="#183e36" stroke-width="2"/>';
    for(let x=-12;x<=12;x++)s+=line(X(x),40,X(x),440,x===0?'#a93438':'#c4d0bd',x===0?2:1);
    for(let y=-10;y<=10;y++)s+=line(60,Y(y),540,Y(y),y===0?'#34765c':'#c4d0bd',y===0?2:1);
    for(const x of [-12,-8,-4,0,4,8,12])s+=txt(X(x),472,x,'middle');
    for(const y of [-10,-5,0,5,10])s+=txt(45,Y(y)+7,y,'end');
    s+=`<rect x="${X(e.bounds.left)}" y="${Y(e.bounds.back)}" width="80" height="80" fill="#8eb1d6" fill-opacity=".8" stroke="${e.onMap?'#24678b':'#a93438'}" stroke-width="4"/>`;
    s+=`<circle cx="${X(e.x)}" cy="${Y(e.y)}" r="6" fill="#b95829"/>`;
    s+=txt(300,25,'Top view:1 square = 1 meter','middle')+txt(570,260,'X','middle')+txt(30,25,'Y','middle');
    s+=txt(Math.max(100,Math.min(500,X(e.x))),Math.max(65,Math.min(420,Y(e.y)-48)),`(${fmt(e.x)}, ${fmt(e.y)})`,'middle');
    return s+'</svg>';
  }
  function sideView(e){
    const X=v=>320+20*v,Z=v=>350-18*v;
    let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 540" role="img" aria-label="Side view:height${e.height} meters,center z${e.z},bottom${e.bottom},top${e.top}. The body is${e.condition}.">`;
    for(let z=-8;z<=16;z+=2){s+=line(40,Z(z),600,Z(z));s+=txt(35,Z(z)+7,z,'end');}
    const bx=X(e.x)-40,by=Z(e.top),bh=e.height*18;
    s+=`<rect x="${bx}" y="${by}" width="80" height="${bh}" fill="#a8c0dc" stroke="#24678b" stroke-width="3"/>`;
    if(e.bottom<0){const redTop=Math.min(e.top,0);s+=`<rect x="${bx}" y="${Z(redTop)}" width="80" height="${(redTop-e.bottom)*18}" fill="#edb2ad" stroke="#a93438" stroke-width="2"/>`;}
    s+=line(40,Z(0),600,Z(0),'#34765c',4)+txt(595,Z(0)-9,'ground0','end','#34765c');
    s+=`<circle cx="${X(e.x)}" cy="${Z(e.z)}" r="6" fill="#b95829"/>`;
    const lx=e.x>5?X(e.x)-55:X(e.x)+55,anchor=e.x>5?'end':'start';
    s+=txt(lx,Z(e.top)-8,'top '+fmt(e.top)+'m',anchor)+txt(lx,Z(e.z)-8,'center '+fmt(e.z)+'m',anchor)+txt(lx,Z(e.bottom)+25,'bottom '+fmt(e.bottom)+'m',anchor);
    s+=txt(320,25,'Side view:body height and center','middle')+txt(15,55,'Z ↑')+txt(320,520,'Same tower body as the top view','middle');
    return s+'</svg>';
  }
  function raw(){return Object.fromEntries(fields.map(k=>[k,numbers[k].value]));}
  function render(){
    feedback.textContent='';feedback.className='practice-feedback';
    const v=M.validate(raw());
    error.textContent=v.errors.join(' ');
    document.getElementById('lab-check').disabled=!v.valid;
    document.getElementById('lab-save').disabled=!v.valid;
    if(!v.valid){error.textContent+=' Drawing keeps the last complete valid values.';return false;}
    current=v.state;fields.forEach(k=>ranges[k].value=String(current[k]));
    const e=M.evaluate(current);
    document.getElementById('lab-top').innerHTML=topView(e);
    document.getElementById('lab-side').innerHTML=sideView(e);
    document.getElementById('lab-bottom').textContent=fmt(e.bottom)+'m';
    document.getElementById('lab-top-value').textContent=fmt(e.top)+'m';
    document.getElementById('lab-bounds').textContent='X['+fmt(e.bounds.left)+','+fmt(e.bounds.right)+'];Y['+fmt(e.bounds.front)+','+fmt(e.bounds.back)+']';
    document.getElementById('lab-condition').textContent=e.condition+(e.onMap?';footprint fits':' ;footprint extends off map');
    document.getElementById('lab-live-explanation').textContent=M.explanation(e,false);
    return true;
  }
  function load(id){
    const task=M.challenges.find(c=>c.id===Number(id))||M.challenges[0];
    pick.value=String(task.id);document.getElementById('lab-goal').textContent=task.goal;
    fields.forEach(k=>numbers[k].value=task.start[k]);
    render();
  }
  fields.forEach(k=>{
    numbers[k].addEventListener('input',render);
    ranges[k].addEventListener('input',()=>{numbers[k].value=ranges[k].value;render();});
  });
  pick.addEventListener('change',()=>{document.getElementById('lab-prediction').value='';load(pick.value);});
  document.getElementById('lab-reset').addEventListener('click',()=>load(pick.value));
  document.getElementById('lab-check').addEventListener('click',()=>{
    if(!render())return;
    const result=M.challengeResult(pick.value,current);
    feedback.className='practice-feedback '+(result.pass?'good':'bad');
    feedback.textContent=result.pass?'Challenge met. Explain why center z equals half the height,and name the footprint edges you checked.':(!result.matches?'Check the requested X,Y,and height as well as grounding. ':'')+M.explanation(result);
  });
  document.getElementById('lab-save').addEventListener('click',()=>{
    if(!render())return;
    const prediction=document.getElementById('lab-prediction').value.trim();
    if(!prediction){feedback.textContent='Write a prediction or reason before saving this trial.';return;}
    const task=M.challenges.find(c=>c.id===Number(pick.value)),e=M.challengeResult(task.id,current);
    history.push({challenge:task.title,prediction,state:{...current},bottom:e.bottom,top:e.top,bounds:e.bounds,result:e.pass?'met':'not yet met',explanation:M.explanation(e)});
    const log=history.map((h,i)=>'TRIAL '+(i+1)+' — '+h.challenge+'\nMy prediction/reason:'+h.prediction+'\nX='+h.state.x+',Y='+h.state.y+',center Z='+h.state.z+',height='+h.state.height+' meters\nBottom='+h.bottom+',top='+h.top+'\nFootprint:left='+h.bounds.left+',right='+h.bounds.right+',front='+h.bounds.front+',back='+h.bounds.back+' meters\nChallenge:'+h.result+'\n'+h.explanation).join('\n\n');
    document.getElementById('lab-log').textContent=log;
    document.getElementById('lab-download').disabled=false;
    feedback.textContent='Trial saved in this page’s log. Download or copy it before leaving.';
  });
  document.getElementById('lab-download').addEventListener('click',()=>{
    const blob=new Blob([document.getElementById('lab-log').textContent],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='Lantern-Reach-coordinate-practice.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  load(1);
})();
