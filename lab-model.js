/* Shared arithmetic for the Chromebook coordinate practice. No Blender calls. */
(function(root,factory){
  const model=factory();
  if(typeof module==='object'&&module.exports) module.exports=model;
  else root.LanternLab=model;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const EPS=1e-7;
  const limits={x:[-12,12],y:[-10,10],z:[-2,10],height:[2,10]};
  const challenges=[
    {id:1,title:'Ground the 8-meter tower',goal:'Keep the center at x=-7,y=4 and height8m. Change center z so the body rests on ground0.',start:{x:-7,y:4,z:2,height:8},target:{x:-7,y:4,height:8}},
    {id:2,title:'Keep the whole body on the map',goal:'Place a6-meter body at x=10,y=-2 and ground it. Its4-meter footprint must stay inside the24×20m terrain.',start:{x:11,y:-2,z:3,height:6},target:{x:10,y:-2,height:6}},
    {id:3,title:'Change the height and keep contact',goal:'Place a10-meter body at x=5,y=-3. Find the center z that keeps its bottom on ground0.',start:{x:5,y:-3,z:3,height:10},target:{x:5,y:-3,height:10}},
    {id:4,title:'Try a decimal height',goal:'Place a7-meter body at x=-6,y=3. Work out its center z before changing the controls.',start:{x:-6,y:3,z:2,height:7},target:{x:-6,y:3,height:7}}
  ];
  function validate(raw){
    const state={},errors=[];
    for(const key of Object.keys(limits)){
      const value=raw[key];
      if(value===null||value===undefined||String(value).trim()===''||!Number.isFinite(Number(value))){errors.push(key+': enter a number.');continue;}
      const n=Number(value),[low,high]=limits[key];
      if(n<low||n>high){errors.push(key+': use '+low+' through '+high+' meters.');continue;}
      state[key]=n;
    }
    return {valid:errors.length===0,state,errors};
  }
  function evaluate(state){
    const check=validate(state);if(!check.valid)throw new Error(check.errors.join(' '));
    const s=check.state,bottom=s.z-s.height/2,top=s.z+s.height/2;
    const bounds={left:s.x-2,right:s.x+2,front:s.y-2,back:s.y+2};
    const grounded=Math.abs(bottom)<EPS;
    const onMap=bounds.left>=-12-EPS&&bounds.right<=12+EPS&&bounds.front>=-10-EPS&&bounds.back<=10+EPS;
    return {...s,bottom,top,bounds,grounded,onMap,condition:grounded?'grounded':bottom<0?'buried':'floating',correctionZ:s.height/2};
  }
  function challengeResult(id,state){
    const task=challenges.find(c=>c.id===Number(id));if(!task)throw new Error('Unknown challenge');
    const e=evaluate(state),matches=Object.entries(task.target).every(([k,v])=>Math.abs(e[k]-v)<EPS);
    return {...e,pass:matches&&e.grounded&&e.onMap,matches};
  }
  function fmt(n){return String(Math.round((Math.abs(n)<EPS?0:n)*100)/100);}
  function explanation(e,includeCorrection=true){
    const half=e.height/2;
    let sentence='Bottom = '+fmt(e.z)+' − '+fmt(e.height)+'÷2 = '+fmt(e.bottom)+'m. ';
    if(e.condition==='buried')sentence+='The bottom is '+fmt(-e.bottom)+'m below ground,so the body is '+(e.top<=0?'entirely':'partly')+' underground.'+(includeCorrection?' Set center z to '+fmt(e.correctionZ)+'m to ground this height.':'');
    else if(e.condition==='floating')sentence+='The bottom is '+fmt(e.bottom)+'m above ground,so the body is floating.'+(includeCorrection?' Set center z to '+fmt(e.correctionZ)+'m to ground this height.':'');
    else sentence+='The bottom meets ground0. Half-height is '+fmt(half)+'m,so center z='+fmt(e.correctionZ)+'m is correct for grounding.';
    sentence+=e.onMap?' The body footprint fits the terrain.':' The center may be on the map,but part of the body footprint extends outside the terrain.';
    return sentence;
  }
  return {limits,challenges,validate,evaluate,challengeResult,fmt,explanation};
});
