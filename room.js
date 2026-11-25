(() => {
  const canvas = document.querySelector('#room-model');
  const replay = document.querySelector('#room-replay');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 6500;
  let frame = 0;
  let elapsed = duration;
  let size = 1;
  let origin = [0, 0];
  let offset = [0, 0, 0];

  function point(x, y, z) {
    x += offset[0]; y += offset[1]; z += offset[2];
    return [origin[0] + (x - y) * size, origin[1] + ((x + y) * .44 - z) * size];
  }
  function polygon(vertices, fill, stroke) {
    ctx.beginPath();
    vertices.forEach(([x,y,z], i) => {
      const [px,py] = point(x,y,z);
      if (i) ctx.lineTo(px,py); else ctx.moveTo(px,py);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = size * .009; ctx.stroke(); }
  }
  function line(a,b,color,width=.012) {
    ctx.beginPath(); ctx.moveTo(...point(...a)); ctx.lineTo(...point(...b));
    ctx.strokeStyle = color; ctx.lineWidth = size * width; ctx.stroke();
  }
  function box(x,y,z,w,d,h,colors) {
    const a=x+w, b=y+d, t=z+h;
    polygon([[a,y,z],[a,b,z],[a,b,t],[a,y,t]],colors[1]);
    polygon([[x,b,z],[a,b,z],[a,b,t],[x,b,t]],colors[2]);
    polygon([[x,y,t],[a,y,t],[a,b,t],[x,b,t]],colors[0]);
  }
  // A rounded footprint gives upholstery, the rug and stone their distinct profiles.
  function slab(x,y,z,w,d,h,r,top,side) {
    const ring=[];
    for(const [cx,cy,angle] of [[x+w-r,y+r,-90],[x+w-r,y+d-r,0],[x+r,y+d-r,90],[x+r,y+r,180]]) {
      for(let step=0;step<=8;step++) {
        const t=(angle+step*90/8)*Math.PI/180;
        ring.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);
      }
    }
    const faces=ring.map((a,i)=>[a,ring[(i+1)%ring.length]]).filter(([a,b])=>b[1]-a[1]>b[0]-a[0]);
    for(const [a,b] of faces) polygon([[...a,z],[...b,z],[...b,z+h],[...a,z+h]],side,side);
    polygon(ring.map(p=>[...p,z+h]),top);
  }
  function shell() {
    box(-.08,-.08,-.22,8.16,6.16,.22,['#d5c8b3','#9b886f','#b49f83']);
    for(let x=.5;x<8;x+=.5) line([x,0,.005],[x,6,.005],'#bead9690');
    for(let x=0;x<8;x+=.5) for(let y=.65+(x*3)%1.7;y<6;y+=2.6) line([x,y,.005],[x+.5,y,.005],'#c4b39d');
    box(-.1,0,0,.14,6.04,2.75,['#ece4d7','#d8cdbc','#b7aa99']);
    box(-.1,-.12,0,8.17,.16,2.75,['#ebdfcc','#ae9982','#c5b197']);
    // Recessed glazing with pale linen shades and a deep stone sill.
    polygon([[.055,.65,.48],[.055,4.98,.48],[.055,4.98,2.47],[.055,.65,2.47]],'#807968');
    polygon([[.065,.72,.56],[.065,4.9,.56],[.065,4.9,2.4],[.065,.72,2.4]],'#e8e5d5');
    for(let y=.74;y<4.9;y+=.14) line([.075,y,.56],[.075,y,2.4],'#cbc6b555',.028);
    for(const y of [2.12,3.52]) box(.07,y,.54,.045,.045,1.9,['#7e725e','#8c806b','#69604f']);
    box(.04,.55,.42,.23,4.5,.09,['#f3ebde','#c8bbaa','#c2b29c']);
    for(let x=5.32;x<8;x+=.125) box(x,.045,0,.08,.07,2.74,['#a18362','#70533d','#8c6b4c']);
    box(2.1,.06,1.06,1.85,.08,1.26,['#8a6d50','#69523e','#816549']);
    polygon([[2.16,.151,1.12],[3.89,.151,1.12],[3.89,.151,2.26],[2.16,.151,2.26]],'#eee2cd');
    polygon([[2.44,.16,1.29],[3.62,.16,1.29],[3.62,.16,1.63],[3.15,.16,2.07],[2.85,.16,1.68]],'#ac8064');
  }
  function place(start, direction, draw) {
    const t=Math.max(0,Math.min(1,(elapsed-start)/1450));
    if (!t) return;
    const remaining=(1-t)**3;
    offset=direction.map(v=>v*remaining);
    ctx.save(); ctx.globalAlpha=Math.min(1,t*3); draw(); ctx.restore();
    offset=[0,0,0];
  }
  function rug() {
    slab(1.18,1.05,.015,5.65,4.17,.035,.14,'#c3b398','#a89a83');
    for(let i=0;i<52;i++)line([1.34,1.15+i*.076,.054],[6.64,1.15+i*.076,.054],i%2?'#d0c2a976':'#b2a38670',.014);
  }
  function sofa() {
    slab(1.12,.52,.13,4.55,1.34,.28,.24,'#c7b99f','#a79a83');
    slab(1.08,.45,.35,4.63,.34,.68,.16,'#eee4d2','#d1c4ad');
    for(let i=0;i<3;i++)slab(1.38+i*1.34,.82,.36,1.32,1.03,.24,.16,'#f5ecda','#dfd1bb');
    for(const x of [1.05,5.37])slab(x,.57,.31,.36,1.4,.45,.17,'#eaddc6','#cdbca3');
    slab(4.52,.83,.61,.68,.34,.27,.12,'#956a53','#79543f');
  }
  function chair() {
    const wood=['#815d46','#533b2d','#664936'];
    for(const x of [6.13,7.08]) for(const y of [2.12,3.15]) box(x,y,.05,.09,.09,.48,wood);
    slab(5.98,2,.44,1.27,1.35,.22,.17,'#bb8963','#956447');
    slab(6.98,1.98,.58,.35,1.4,.57,.17,'#c28e65','#9a6847');
    for(const y of [1.99,3.18])slab(6.06,y,.61,1,.16,.15,.075,'#9c714e','#775438');
  }
  function table() {
    slab(3.15,2.73,.06,1.55,.64,.34,.3,'#6d4e3c','#634839');
    slab(2.83,2.48,.39,2.22,1.13,.18,.44,'#9f7360','#795342');
    line([3.11,2.82,.576],[4.76,3.27,.576],'#c59a7d',.019);
    box(3.39,2.83,.57,.57,.37,.065,['#e4d9c3','#bcb09b','#cebea4']);
    slab(4.34,2.92,.57,.29,.29,.2,.144,'#e8d7b9','#bfa98b');
  }
  function lamp() {
    slab(6.79,.54,.01,.59,.59,.08,.29,'#9e885c','#705f42');
    box(7.055,.81,.09,.048,.048,1.63,['#c1a578','#897653','#b7a17a']);
    slab(6.73,.48,1.7,.72,.72,.44,.358,'#fff2d9','#ddcbb0');
  }
  function render() {
    const w=canvas.clientWidth,h=canvas.clientHeight;
    if (!w || !h) return;
    const ratio=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){
      canvas.width=Math.round(w*ratio); canvas.height=Math.round(h*ratio);
    }
    ctx.setTransform(ratio,0,0,ratio,0,0); ctx.clearRect(0,0,w,h);
    size=Math.min(w/16.5,h/10.7); origin=[w/2-size,h/2-size*1.76];
    ctx.save(); ctx.shadowColor='#533e2a4a';ctx.shadowBlur=size*.44;ctx.shadowOffsetY=size*.2;
    polygon([[0,0,-.24],[8,0,-.24],[8,6,-.24],[0,6,-.24]],'#c4b39b');ctx.restore();
    shell(); place(100,[0,1.4,.1],rug); place(1150,[-.4,0,1],sofa);
    place(2150,[.6,0,.8],lamp); place(3000,[1.4,.1,.4],chair);
    place(4100,[0,1.2,.65],table);
  }
  function play() {
    cancelAnimationFrame(frame);
    if(reduce.matches){elapsed=duration;render();return;}
    const start=performance.now();
    function tick(now){elapsed=Math.min(duration,now-start);render();if(elapsed<duration)frame=requestAnimationFrame(tick);}
    frame=requestAnimationFrame(tick);
  }
  new ResizeObserver(render).observe(canvas);
  replay.hidden=false;
  replay.addEventListener('click',play);
  reduce.addEventListener('change',()=>{cancelAnimationFrame(frame);elapsed=duration;render();});
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();play();}
    },{threshold:.3});
    observer.observe(canvas);
  }
  render();
})();
