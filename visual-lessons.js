"use strict";
(() => {
  const players = [];
  document.querySelectorAll(".visual-player").forEach(root => {
    const frames = Array.from(root.querySelectorAll(".visual-stage figure"));
    const prev = root.querySelector('[data-action="previous"]');
    const play = root.querySelector('[data-action="play"]');
    const next = root.querySelector('[data-action="next"]');
    const reset = root.querySelector('[data-action="restart"]');
    const status = root.querySelector('.step-label');
    const dots = Array.from(root.querySelectorAll('.step-dot'));
    let current = 0, timer = null;
    const pause = () => { if (timer !== null) clearInterval(timer);timer=null;play.textContent='Play';play.setAttribute('aria-pressed','false');root.classList.remove('visual-playing'); };
    const show = index => {
      current = Math.max(0, Math.min(frames.length - 1, index));
      frames.forEach((frame,i) => { frame.hidden = i !== current; });
      dots.forEach((dot,i) => dot.classList.toggle('active',i===current));
      status.textContent = 'Step '+(current+1)+' of '+frames.length;
      prev.disabled = current === 0;next.disabled = current === frames.length-1;
    };
    prev.addEventListener('click',() => { pause();show(current-1); });
    next.addEventListener('click',() => { pause();show(current+1); });
    reset.addEventListener('click',() => { pause();show(0); });
    play.addEventListener('click',() => {
      if (timer !== null) { pause();return; }
      players.forEach(p => p.pause());
      if (current === frames.length-1) show(0);
      play.textContent='Pause';play.setAttribute('aria-pressed','true');root.classList.add('visual-playing');
      timer=setInterval(() => { show(current+1);if(current===frames.length-1) pause(); },6000);
    });
    players.push({pause,show});show(0);
  });
  document.addEventListener('visibilitychange',() => { if(document.hidden) players.forEach(p=>p.pause()); });
  window.addEventListener('pagehide',() => players.forEach(p=>p.pause()));
})();
