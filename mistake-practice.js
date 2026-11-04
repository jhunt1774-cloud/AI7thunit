'use strict';
(() => {
  const source=document.getElementById('mistake-data');if(!source)return;
  const cases=JSON.parse(source.textContent),attempts=[];
  const completed=new Map();
  const summary=document.getElementById('mistake-summary');
  function updateLog(){
    document.getElementById('mistake-log').textContent=attempts.map((a,i)=>'TRY '+(i+1)+' — Day '+a.day+':'+a.title+'\nMy diagnosis/reason:'+a.reason+'\nMy repair:'+a.answer+'\nCheck:'+(a.correct?'correct':'not yet correct')+'\nExplanation:'+a.explanation).join('\n\n');
    const correct=Array.from(completed.values()).filter(Boolean).length;
    summary.textContent=completed.size+' of '+cases.length+' activities tried;'+correct+' currently have the checked repair correct. Practice only;your teacher checks the written reasoning.';
    document.getElementById('mistake-download').disabled=attempts.length===0;
  }
  for(const item of cases){
    const card=document.getElementById('day'+item.day),answer=card.querySelector('.repair-answer'),feedback=card.querySelector('.feedback'),reason=card.querySelector('.diagnosis');
    card.querySelector('.check-repair').addEventListener('click',()=>{
      const raw=answer.value;
      if(raw.trim()===''||(item.kind==='number'&&!Number.isFinite(Number(raw)))){feedback.textContent='Enter or choose a repair before checking.';feedback.className='feedback';return;}
      const correct=item.kind==='number'?Math.abs(Number(raw)-item.answer)<1e-7:raw===String(item.answer);
      feedback.className='feedback'+(correct?' correct':'');
      feedback.textContent=(correct?'Correct repair. ':'Not yet. ')+item.explanation;
      const label=item.kind==='number'?raw+(item.unit?' '+item.unit:''):item.options[Number(raw)];
      attempts.push({day:item.day,title:item.title,reason:reason.value.trim()||'(No written reason recorded.)',answer:label,correct,explanation:item.explanation});
      completed.set(item.day,correct);updateLog();
    });
  }
  document.getElementById('mistake-download').addEventListener('click',()=>{
    const blob=new Blob([document.getElementById('mistake-log').textContent],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='Lantern-Reach-find-the-mistake.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  updateLog();
})();
