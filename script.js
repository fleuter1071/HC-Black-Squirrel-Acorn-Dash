const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WORLD = { width: 1600, height: 1000 };
const GAME_SECONDS = 240;
const TARGET_ACORNS = 24;
const PLAYER_SPEED = 265;
const GOLDEN_ACORN_INTERVAL = 30;
const GOLDEN_ACORN_LIFETIME = 11;
const GOLDEN_ACORN_VALUE = 3;
const POWERUP_INTERVAL = 24;
const POWERUP_LIFETIME = 14;

const landmarks = [
  { id: "dc", name: "Dining Center", short: "THE DC", x: 238, y: 176, w: 235, h: 126, type: "dc", secret: { x: 225, y: 320 }, note: "Late-night pancake machine energy." },
  { id: "lloyd", name: "Lloyd Hall", short: "LLOYD", x: 502, y: 108, w: 238, h: 104, type: "dorm", secret: { x: 754, y: 187 }, note: "A suspiciously well-hidden dorm stash." },
  { id: "founders", name: "Founders Hall", short: "FOUNDERS", x: 790, y: 340, w: 330, h: 152, type: "founders", secret: { x: 948, y: 518 }, note: "SBS salutes the cupola." },
  { id: "barclay", name: "Barclay Hall", short: "BARCLAY", x: 1190, y: 480, w: 230, h: 116, type: "dorm", secret: { x: 1163, y: 572 }, note: "Oldest dorm. Excellent acorn masonry." },
  { id: "campus", name: "Whitehead Campus Center", short: "CAMPUS CENTER", x: 1118, y: 760, w: 275, h: 110, type: "center", secret: { x: 1087, y: 813 }, note: "SBS checked the mailroom twice." }
];

const paths = [
  [[120, 406], [470, 406], [760, 436], [945, 540], [1190, 630], [1450, 640]],
  [[348, 300], [394, 407]], [[630, 212], [710, 370]], [[954, 494], [1010, 714], [1190, 760]],
  [[475, 670], [820, 616], [1010, 714], [1060, 906]], [[1190, 630], [1280, 760]]
];

const trees = [
  [95,118,42],[170,215,34],[1380,142,45],[1480,240,36],[85,780,42],[185,880,38],[340,850,45],
  [525,530,30],[620,720,38],[760,795,33],[1460,840,46],[1310,930,36],[1060,190,39],[1180,135,31],
  [870,165,26],[560,315,28],[345,545,33],[1520,520,31],[40,510,36],[950,890,28],[118,630,27]
];

const acornSpots = [
  [170,390],[314,370],[448,434],[564,420],[678,465],[785,575],[882,610],[1020,670],[1110,704],
  [1235,675],[1374,628],[410,648],[548,678],[682,700],[800,780],[920,828],[1042,880],[1320,730],[1450,760]
];

const goldenSpots = [
  [180, 520], [310, 340], [520, 610], [700, 285], [840, 730],
  [970, 560], [1120, 690], [1290, 430], [1420, 720], [1010, 875]
];

const powerupSpots = [
  [285, 460], [470, 710], [625, 350], [820, 660], [1060, 610],
  [1205, 720], [1370, 690], [970, 835]
];

const powerupTypes = [
  { id:"pancake", name:"DC Pancake", note:"SBS has pancake-powered zoom!", duration:7 },
  { id:"leaf", name:"Arboretum Leaf", note:"Secret landmark stashes are glowing!", duration:9 },
  { id:"scroll", name:"Honor Code Scroll", note:"SBS is bump-proof for a few seconds!", duration:6 }
];

const hazardRoutes = [
  { type:"student", color:"#cf704d", speed:72, radius:18, points:[[510,405],[790,445],[890,550],[705,615]], offset:0 },
  { type:"student", color:"#5d78a7", speed:68, radius:18, points:[[1050,700],[1180,625],[1410,640],[1260,760]], offset:1.8 },
  { type:"student", color:"#e0a539", speed:74, radius:18, points:[[410,650],[680,705],[810,615],[550,535]], offset:3.4 },
  { type:"bike", color:"#4779a2", speed:155, radius:20, points:[[140,405],[470,405],[780,450],[1030,665],[1420,640]], offset:1 },
  { type:"bike", color:"#6d4c91", speed:140, radius:20, points:[[1060,900],[1015,715],[950,535],[730,420]], offset:3 },
  { type:"cart", color:"#ede9d3", speed:105, radius:28, points:[[1440,640],[1200,640],[1010,714],[820,616],[490,670]], offset:2.3 }
];

let state;
let audioCtx;
let lastTime = 0;
let toastTimer;
const keys = new Set();

function newState() {
  return {
    running: false, ended: false, muted: false, timeLeft: GAME_SECONDS, score: 0, secrets: 0,
    player: { x: 690, y: 560, r: 19, facing: 1, invulnerable: 0, bob: 0, spin: 0 },
    acorns: acornSpots.map(([x,y]) => ({ x, y, collected:false, hidden:false })),
    hidden: landmarks.map(l => ({ x:l.secret.x, y:l.secret.y, collected:false, hidden:true, landmark:l })),
    hazards: hazardRoutes.map(route => ({ ...route, segment:0, progress:0, x:route.points[0][0], y:route.points[0][1] })),
    particles: [], spills: [], reactions: [], celebrations: [], golden: null, powerup: null,
    activePowerups: { pancake:0, leaf:0, scroll:0 }, nextGoldenAt: 18, nextPowerupAt: 13, elapsed: 0
  };
}

function startGame() {
  const muted = state?.muted || false;
  state = newState();
  state.muted = muted;
  state.running = true;
  document.getElementById("startOverlay").classList.remove("show");
  document.getElementById("endOverlay").classList.remove("show");
  updateHud();
  playTone(440, .07, "square");
  playTone(660, .09, "square", .08);
}

function endGame() {
  state.running = false; state.ended = true;
  const allSecrets = state.secrets === landmarks.length;
  const title = state.score >= TARGET_ACORNS ? "Legend of Founders Green!" : state.score >= 14 ? "A noble stash!" : "A respectable scurry!";
  const text = allSecrets ? "You found every landmark secret. SBS would absolutely add this to the reunion newsletter." :
    "SBS left a few acorns behind for the next walk across campus. Very community-minded of him.";
  document.getElementById("endTitle").textContent = title;
  document.getElementById("finalScore").textContent = state.score;
  document.getElementById("endMessage").textContent = text;
  document.getElementById("endOverlay").classList.add("show");
  playTone(523, .12, "sine"); playTone(659, .12, "sine", .13); playTone(784, .18, "sine", .26);
}

function update(dt) {
  if (!state.running) return;
  state.elapsed += dt; state.timeLeft -= dt;
  if (state.timeLeft <= 0) { state.timeLeft = 0; endGame(); updateHud(); return; }

  const dx = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
  const dy = (keys.has("arrowdown") || keys.has("s") ? 1 : 0) - (keys.has("arrowup") || keys.has("w") ? 1 : 0);
  if (dx || dy) {
    const mag = Math.hypot(dx, dy);
    const speed = PLAYER_SPEED * (state.activePowerups.pancake > 0 ? 1.48 : 1);
    state.player.x = clamp(state.player.x + dx / mag * speed * dt, 28, WORLD.width - 28);
    state.player.y = clamp(state.player.y + dy / mag * speed * dt, 28, WORLD.height - 28);
    state.player.facing = dx ? Math.sign(dx) : state.player.facing;
    state.player.bob += dt * 13;
  }
  state.player.invulnerable = Math.max(0, state.player.invulnerable - dt);
  state.player.spin = Math.max(0, state.player.spin - dt);
  Object.keys(state.activePowerups).forEach(id => state.activePowerups[id] = Math.max(0, state.activePowerups[id] - dt));

  if (!state.golden && state.elapsed >= state.nextGoldenAt) spawnGoldenAcorn();
  if (state.golden) {
    state.golden.life -= dt;
    if (state.golden.life <= 0) {
      showToast("The golden acorn rolled away!");
      state.golden = null;
      state.nextGoldenAt = state.elapsed + GOLDEN_ACORN_INTERVAL;
    } else if (distance(state.player, state.golden) < 36) collectGoldenAcorn();
  }
  if (!state.powerup && state.elapsed >= state.nextPowerupAt) spawnPowerup();
  if (state.powerup) {
    state.powerup.life -= dt;
    if (state.powerup.life <= 0) {
      state.powerup = null;
      state.nextPowerupAt = state.elapsed + POWERUP_INTERVAL;
    } else if (distance(state.player, state.powerup) < 36) collectPowerup();
  }

  state.hazards.forEach(h => moveHazard(h, dt));
  [...state.acorns, ...state.hidden].forEach(acorn => {
    if (!acorn.collected && distance(state.player, acorn) < 31) collectAcorn(acorn);
  });
  state.spills.forEach(acorn => {
    acorn.life -= dt;
    if (!acorn.collected && distance(state.player, acorn) < 31) collectSpill(acorn);
  });
  state.spills = state.spills.filter(acorn => !acorn.collected && acorn.life > 0);
  if (!state.player.invulnerable && state.activePowerups.scroll <= 0) {
    for (const hazard of state.hazards) {
      if (distance(state.player, hazard) < state.player.r + hazard.radius) { bump(hazard); break; }
    }
  }
  state.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
  state.particles = state.particles.filter(p => p.life > 0);
  state.reactions.forEach(r => r.life -= dt);
  state.reactions = state.reactions.filter(r => r.life > 0);
  state.celebrations.forEach(c => c.life -= dt);
  state.celebrations = state.celebrations.filter(c => c.life > 0);
  updateHud();
}

function moveHazard(h, dt) {
  const from = h.points[h.segment], to = h.points[(h.segment + 1) % h.points.length];
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  h.progress += h.speed * dt / len;
  if (h.progress >= 1) { h.progress -= 1; h.segment = (h.segment + 1) % h.points.length; }
  const a = h.points[h.segment], b = h.points[(h.segment + 1) % h.points.length];
  h.x = a[0] + (b[0] - a[0]) * h.progress; h.y = a[1] + (b[1] - a[1]) * h.progress;
  h.angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
}

function collectAcorn(acorn) {
  acorn.collected = true; state.score++;
  spawnParticles(acorn.x, acorn.y, "#f4c65f");
  if (acorn.hidden) {
    state.secrets++;
    triggerLandmarkCelebration(acorn.landmark);
    showToast(`${acorn.landmark.name}: secret stash found!`);
    document.getElementById("missionTitle").textContent = acorn.landmark.name;
    document.getElementById("missionText").textContent = acorn.landmark.note;
    playTone(880, .08, "triangle"); playTone(1175, .14, "triangle", .09);
  } else playTone(740, .07, "triangle");
  if (state.score === TARGET_ACORNS) showToast("Stash goal reached! Keep exploring!");
}

function spawnPowerup() {
  const [x,y] = powerupSpots[Math.floor(Math.random() * powerupSpots.length)];
  const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
  state.powerup = { x, y, life:POWERUP_LIFETIME, type };
  showToast(`${type.name} appeared on campus!`);
}

function collectPowerup() {
  const { x, y, type } = state.powerup;
  state.activePowerups[type.id] = type.duration;
  state.powerup = null;
  state.nextPowerupAt = state.elapsed + POWERUP_INTERVAL;
  spawnParticles(x, y, type.id === "leaf" ? "#b7df70" : "#ffe38a");
  showToast(type.note);
  playTone(587, .08, "triangle"); playTone(784, .13, "triangle", .1);
}

function spawnGoldenAcorn() {
  const available = goldenSpots.filter(([x,y]) => distance(state.player, {x,y}) > 230);
  const [x,y] = available[Math.floor(Math.random() * available.length)];
  state.golden = { x, y, life:GOLDEN_ACORN_LIFETIME };
  showToast("Golden acorn spotted! Follow the pointer!");
  playTone(660, .08, "triangle"); playTone(880, .12, "triangle", .1);
}

function collectGoldenAcorn() {
  spawnParticles(state.golden.x, state.golden.y, "#ffe56b");
  state.score += GOLDEN_ACORN_VALUE;
  state.golden = null;
  state.nextGoldenAt = state.elapsed + GOLDEN_ACORN_INTERVAL;
  showToast(`Golden acorn! +${GOLDEN_ACORN_VALUE} for the stash!`);
  playTone(784, .08, "triangle"); playTone(1047, .1, "triangle", .09); playTone(1319, .16, "triangle", .2);
}

function collectSpill(acorn) {
  acorn.collected = true; state.score++;
  spawnParticles(acorn.x, acorn.y, "#f4c65f");
  playTone(620, .06, "triangle");
}

function bump(hazard) {
  state.player.invulnerable = 1.35;
  state.player.spin = hazard.type === "cart" ? .95 : .55;
  const lost = state.score > 0 ? 1 : 0;
  state.score -= lost;
  if (lost) spillAcorn(hazard.type === "bike" ? 2 : 1);
  const reaction = hazard.type === "cart"
    ? { text:"WHOA!", color:"#ffe56b", stars:true }
    : hazard.type === "bike"
      ? { text:"Bike lane!", color:"#fff5da", stars:false }
      : { text:"Sorry, SBS!", color:"#fff5da", stars:false };
  state.reactions.push({ x:state.player.x, y:state.player.y-28, life:1.05, ...reaction });
  const label = hazard.type === "cart" ? "Golf cart spinout!" : hazard.type === "bike" ? "Bike lane surprise!" : "Student crossing!";
  showToast(`${label}${lost ? " Grab that runaway acorn!" : ""}`);
  spawnParticles(state.player.x, state.player.y, "#ffffff");
  playTone(130, .18, "sawtooth");
}

function spillAcorn(count) {
  for (let i=0; i<count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const range = 42 + Math.random() * 35;
    state.spills.push({
      x:clamp(state.player.x + Math.cos(angle) * range, 28, WORLD.width - 28),
      y:clamp(state.player.y + Math.sin(angle) * range, 28, WORLD.height - 28),
      life:6.5, collected:false, spilled:true
    });
  }
}

function draw() {
  drawCampus();
  state.acorns.forEach(drawAcorn);
  state.hidden.forEach(drawHiddenAcorn);
  state.spills.forEach(drawSpilledAcorn);
  if (state.golden) drawGoldenAcorn(state.golden);
  if (state.powerup) drawPowerup(state.powerup);
  state.hazards.forEach(drawHazard);
  drawPlayer();
  state.particles.forEach(drawParticle);
  state.reactions.forEach(drawReaction);
  state.celebrations.forEach(drawCelebration);
  if (state.golden) drawGoldenPointer(state.golden);
  drawPowerupStatus();
}

function drawCampus() {
  ctx.fillStyle = "#91b77c"; ctx.fillRect(0,0,WORLD.width,WORLD.height);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  for (let x=30;x<WORLD.width;x+=52) for(let y=26;y<WORLD.height;y+=47) ctx.fillRect(x,y,3,3);
  ctx.fillStyle = "#b7d29a"; ctx.beginPath(); ctx.ellipse(900,640,470,270,-.18,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#94bedd"; ctx.beginPath(); ctx.ellipse(170,900,125,67,-.18,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#d4cbb4"; ctx.lineWidth = 34; ctx.lineCap = "round"; ctx.lineJoin = "round";
  paths.forEach(path => { ctx.beginPath(); path.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke(); });
  ctx.strokeStyle = "#ece4d3"; ctx.lineWidth = 23;
  paths.forEach(path => { ctx.beginPath(); path.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke(); });
  trees.forEach(([x,y,r]) => drawTree(x,y,r));
  landmarks.forEach(drawBuilding);
  drawMapLabel(90,946,"DUCK POND",11);
  drawMapLabel(760,914,"FOUNDERS GREEN",15);
  ctx.fillStyle="#486e4e"; ctx.font="900 15px Nunito"; ctx.fillText("HAVERFORD COLLEGE", 48, 62);
  ctx.font="800 10px Nunito"; ctx.fillText("ARBORETUM CAMPUS • SBS TERRITORY", 48, 80);
}

function drawBuilding(l) {
  const {x,y,w,h} = l;
  ctx.fillStyle="rgba(53,70,54,.2)"; roundRect(x+8,y+10,w,h,9); ctx.fill();
  ctx.fillStyle=l.type==="center" ? "#9b8874" : "#9b836c"; roundRect(x,y,w,h,8); ctx.fill();
  ctx.fillStyle="#c9b293"; roundRect(x+7,y+7,w-14,h-14,5); ctx.fill();
  ctx.strokeStyle="#806952"; ctx.lineWidth=4; ctx.stroke();
  if(l.type==="founders"){
    ctx.fillStyle="#e5d7bc"; ctx.fillRect(x+16,y+30,w-32,88);
    ctx.fillStyle="#87624d"; for(let i=0;i<8;i++) ctx.fillRect(x+27+i*39,y+50,15,32);
    ctx.fillStyle="#d3bd98"; ctx.fillRect(x+w/2-29,y-22,58,52); ctx.strokeRect(x+w/2-29,y-22,58,52);
    ctx.fillStyle="#7e604c"; ctx.fillRect(x+w/2-8,y+91,16,27);
  } else {
    ctx.fillStyle="#705849";
    const cols=Math.max(3,Math.floor(w/54));
    for(let i=0;i<cols;i++) for(let j=0;j<2;j++) ctx.fillRect(x+22+i*(w-44)/(cols-1)-7,y+25+j*42,15,20);
  }
  drawMapLabel(x+w/2,y+h+24,l.short,12);
}

function drawTree(x,y,r) {
  ctx.fillStyle="rgba(47,77,43,.22)"; ctx.beginPath(); ctx.ellipse(x+7,y+11,r*1.05,r*.66,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#416f46"; [[-.45,-.1],[.38,-.2],[0,.32],[0,-.42]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*.62,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#5f8a54"; ctx.beginPath();ctx.arc(x-r*.18,y-r*.3,r*.42,0,Math.PI*2);ctx.fill();
}

function drawAcorn(a) {
  if(a.collected) return;
  const bob=Math.sin(state.elapsed*5+a.x)*4;
  ctx.save();ctx.translate(a.x,a.y+bob);ctx.rotate(-.35);
  ctx.shadowColor="#ffe59a";ctx.shadowBlur=14;ctx.fillStyle="#b96e22";ctx.beginPath();ctx.ellipse(0,5,9,13,0,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle="#704426";ctx.fillRect(-9,-6,18,7);ctx.fillRect(2,-13,3,8);ctx.restore();
}

function drawSpilledAcorn(a) {
  if (a.collected) return;
  ctx.save();
  ctx.globalAlpha = a.life < 2 ? .45 + .45 * Math.abs(Math.sin(state.elapsed * 10)) : 1;
  drawAcorn(a);
  ctx.restore();
}

function drawGoldenAcorn(a) {
  const pulse = 1 + Math.sin(state.elapsed * 7) * .12;
  ctx.save();ctx.translate(a.x,a.y);ctx.scale(pulse,pulse);ctx.rotate(-.35);
  ctx.shadowColor="#fff08a";ctx.shadowBlur=28;ctx.fillStyle="#f4c94f";ctx.beginPath();ctx.ellipse(0,6,17,23,0,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle="#a96d21";ctx.fillRect(-17,-7,34,10);ctx.fillRect(4,-20,5,14);
  ctx.fillStyle="#fff5a9";ctx.beginPath();ctx.ellipse(-6,1,4,8,-.35,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawHiddenAcorn(a) {
  if(a.collected) return;
  ctx.save(); ctx.globalAlpha=state.activePowerups.leaf > 0 ? .85 : .28+.18*Math.sin(state.elapsed*3); ctx.strokeStyle=state.activePowerups.leaf > 0 ? "#ddff82" : "#fff1ad";ctx.lineWidth=state.activePowerups.leaf > 0 ? 6 : 3;
  ctx.beginPath();ctx.arc(a.x,a.y,13+Math.sin(state.elapsed*4)*3,0,Math.PI*2);ctx.stroke();ctx.restore();
}

function drawPowerup(p) {
  const bob=Math.sin(state.elapsed*5+p.x)*5;
  ctx.save();ctx.translate(p.x,p.y+bob);ctx.shadowColor="#fff5a6";ctx.shadowBlur=18;
  if(p.type.id==="pancake"){
    ctx.fillStyle="#d7923a";ctx.beginPath();ctx.ellipse(0,4,19,12,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#efbf55";ctx.beginPath();ctx.ellipse(0,-2,19,12,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f9df71";ctx.fillRect(-5,-7,10,8);
  } else if(p.type.id==="leaf"){
    ctx.fillStyle="#75a94e";ctx.beginPath();ctx.ellipse(0,0,14,23,-.65,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#e0ef9b";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12,14);ctx.lineTo(13,-16);ctx.stroke();
  } else {
    ctx.fillStyle="#f1dfaa";roundRect(-16,-19,32,38,5);ctx.fill();
    ctx.strokeStyle="#a98245";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#487053";ctx.font="900 14px Nunito";ctx.textAlign="center";ctx.fillText("HC",0,5);
  }
  ctx.restore();
}

function drawHazard(h) {
  ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.angle || 0);
  if(h.type==="student") {
    ctx.fillStyle="rgba(40,50,40,.18)";ctx.beginPath();ctx.ellipse(3,11,16,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=h.color;ctx.fillRect(-9,-8,18,24);ctx.fillStyle="#efc3a1";ctx.beginPath();ctx.arc(0,-15,8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#4e473c";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-5,15);ctx.lineTo(-8,25);ctx.moveTo(5,15);ctx.lineTo(8,25);ctx.stroke();
  } else if(h.type==="bike") {
    ctx.strokeStyle="#314f4f";ctx.lineWidth=4;[-14,14].forEach(x=>{ctx.beginPath();ctx.arc(x,6,10,0,Math.PI*2);ctx.stroke();});
    ctx.beginPath();ctx.moveTo(-14,6);ctx.lineTo(0,-7);ctx.lineTo(14,6);ctx.lineTo(-2,6);ctx.lineTo(-14,6);ctx.stroke();
    ctx.fillStyle=h.color;ctx.beginPath();ctx.arc(0,-15,8,0,Math.PI*2);ctx.fill();
  } else {
    ctx.fillStyle="#e5dec4";roundRect(-27,-17,54,34,6);ctx.fill();ctx.strokeStyle="#6d765e";ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle="#536949";ctx.fillRect(-15,-28,29,15); ctx.fillStyle="#f1c945";ctx.fillRect(16,-12,8,8);
    ctx.fillStyle="#38453b";[-16,16].forEach(x=>{ctx.beginPath();ctx.arc(x,18,7,0,Math.PI*2);ctx.fill();});
  }
  ctx.restore();
}

function drawPlayer() {
  const p=state.player, blink=p.invulnerable && Math.floor(state.elapsed*14)%2;
  if(blink)return;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spin ? (1-p.spin) * 18 : 0);ctx.scale(p.facing,1);
  const hop=Math.abs(Math.sin(p.bob))*3;ctx.translate(0,-hop);
  ctx.fillStyle="rgba(20,38,30,.2)";ctx.beginPath();ctx.ellipse(0,22,25,10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#17221f";ctx.beginPath();ctx.ellipse(-20,2,25,18,-.8,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(0,4,18,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(14,-10,13,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(7,-20);ctx.lineTo(11,-32);ctx.lineTo(18,-20);ctx.fill();
  ctx.fillStyle="#f7f2d5";ctx.beginPath();ctx.arc(20,-13,3,0,Math.PI*2);ctx.fill();ctx.fillStyle="#17221f";ctx.beginPath();ctx.arc(21,-13,1.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f3b543";ctx.beginPath();ctx.arc(-1,7,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.font="900 7px Nunito";ctx.textAlign="center";ctx.fillText("SBS",-1,10);
  if(state.activePowerups.scroll>0){ctx.strokeStyle="#fff0a0";ctx.lineWidth=4;ctx.globalAlpha=.7+.2*Math.sin(state.elapsed*8);ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}

function triggerLandmarkCelebration(landmark) {
  state.celebrations.push({ x:landmark.x+landmark.w/2, y:landmark.y+landmark.h/2, life:2.3, id:landmark.id });
}

function drawCelebration(c) {
  const age=2.3-c.life, rise=age*34;
  ctx.save();ctx.globalAlpha=Math.min(1,c.life);
  if(c.id==="founders"){
    ctx.fillStyle="#ffe56b";ctx.font="900 25px Nunito";
    for(let i=0;i<7;i++){const a=i*.9+age;ctx.fillText("✦",c.x+Math.cos(a)*92,c.y-50+Math.sin(a)*45);}
    drawBanner(c.x,c.y-85-rise*.25,"CUPOLA SALUTE!");
  } else if(c.id==="dc"){
    for(let i=0;i<6;i++) drawMiniPancake(c.x-75+i*30,c.y-rise-(i%2)*16);
    drawBanner(c.x,c.y-70-rise*.22,"PANCAKE POWER!");
  } else if(c.id==="barclay"){
    drawBanner(c.x,c.y-72-rise*.25,"OLDEST DORM STASH!");
  } else if(c.id==="lloyd"){
    ctx.fillStyle="#b96e22";ctx.font="900 23px Nunito";
    for(let i=0;i<9;i++)ctx.fillText("●",c.x-80+i*20,c.y-65+((i*17+age*80)%80));
    drawBanner(c.x,c.y-75-rise*.2,"LLOYD ACORN RAIN!");
  } else {
    ctx.fillStyle="#f8edcf";roundRect(c.x-26,c.y-20-rise*.35,52,36,3);ctx.fill();ctx.strokeStyle="#af8e5b";ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.moveTo(c.x-26,c.y-20-rise*.35);ctx.lineTo(c.x,c.y+2-rise*.35);ctx.lineTo(c.x+26,c.y-20-rise*.35);ctx.stroke();
    drawBanner(c.x,c.y-78-rise*.25,"YOU'VE GOT MAIL!");
  }
  ctx.restore();
}

function drawBanner(x,y,text) {
  ctx.font="900 17px Nunito";ctx.textAlign="center";const width=ctx.measureText(text).width+28;
  ctx.fillStyle="#fff4c8";roundRect(x-width/2,y-21,width,30,14);ctx.fill();
  ctx.fillStyle="#315440";ctx.fillText(text,x,y);ctx.textAlign="left";
}

function drawMiniPancake(x,y) {
  ctx.fillStyle="#e0a14c";ctx.beginPath();ctx.ellipse(x,y,13,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f2c75c";ctx.beginPath();ctx.ellipse(x,y-4,13,7,0,0,Math.PI*2);ctx.fill();
}

function drawPowerupStatus() {
  const active=powerupTypes.filter(p=>state.activePowerups[p.id]>0);
  active.forEach((p,i)=>{
    const x=20+i*156,y=950;
    ctx.fillStyle="rgba(255,253,246,.9)";roundRect(x,y,145,32,14);ctx.fill();
    ctx.fillStyle="#315440";ctx.font="900 13px Nunito";ctx.fillText(`${p.name} ${Math.ceil(state.activePowerups[p.id])}s`,x+12,y+21);
  });
}

function drawReaction(r) {
  const alpha = Math.min(1, r.life * 2);
  ctx.save();ctx.globalAlpha=alpha;
  if (r.stars) {
    ctx.fillStyle="#ffe56b";
    for(let i=0;i<4;i++){const a=state.elapsed*5+i*Math.PI/2;ctx.font="900 22px Nunito";ctx.fillText("★",r.x+Math.cos(a)*36,r.y+Math.sin(a)*24);}
  }
  ctx.font="900 18px Nunito";ctx.textAlign="center";const width=ctx.measureText(r.text).width+22;
  ctx.fillStyle=r.color;roundRect(r.x-width/2,r.y-43,width,30,14);ctx.fill();
  ctx.fillStyle="#284438";ctx.fillText(r.text,r.x,r.y-22);ctx.textAlign="left";ctx.restore();
}

function drawGoldenPointer(a) {
  const dx=a.x-state.player.x,dy=a.y-state.player.y,angle=Math.atan2(dy,dx);
  const edgeX=clamp(state.player.x+Math.cos(angle)*105,55,WORLD.width-55);
  const edgeY=clamp(state.player.y+Math.sin(angle)*105,55,WORLD.height-55);
  ctx.save();ctx.translate(edgeX,edgeY);ctx.rotate(angle);
  ctx.fillStyle="#ffe56b";ctx.strokeStyle="#9a641e";ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(-12,-15);ctx.lineTo(-7,0);ctx.lineTo(-12,15);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
  ctx.fillStyle="#fff8c4";ctx.font="900 16px Nunito";ctx.textAlign="center";
  ctx.fillText(`${Math.ceil(a.life)}s`,edgeX,edgeY-25);ctx.textAlign="left";
}

function spawnParticles(x,y,color) { for(let i=0;i<9;i++){ const a=Math.PI*2*i/9; state.particles.push({x,y,vx:Math.cos(a)*65,vy:Math.sin(a)*65,life:.55,color}); } }
function drawParticle(p) { ctx.save();ctx.globalAlpha=p.life/.55;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();ctx.restore(); }
function drawMapLabel(x,y,text,size){ctx.fillStyle="rgba(30,65,47,.82)";ctx.font=`900 ${size}px Nunito`;ctx.textAlign="center";ctx.fillText(text,x,y);ctx.textAlign="left";}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

function updateHud(){
  document.getElementById("score").textContent=state.score;document.getElementById("secrets").textContent=state.secrets;
  const s=Math.ceil(state.timeLeft);document.getElementById("timer").textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
}
function showToast(text){const el=document.getElementById("toast");el.textContent=text;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1800);}
function playTone(freq,duration,type="sine",delay=0){if(state?.muted)return;audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.05,audioCtx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+delay+duration);o.connect(g);g.connect(audioCtx.destination);o.start(audioCtx.currentTime+delay);o.stop(audioCtx.currentTime+delay+duration);}
function frame(t){const dt=Math.min((t-lastTime)/1000,.05)||0;lastTime=t;update(dt);draw();requestAnimationFrame(frame);}

window.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());});
window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
document.querySelectorAll(".touch-controls button").forEach(btn=>{const key={up:"arrowup",down:"arrowdown",left:"arrowleft",right:"arrowright"}[btn.dataset.dir];const on=e=>{e.preventDefault();keys.add(key)};const off=e=>{e.preventDefault();keys.delete(key)};btn.addEventListener("pointerdown",on);btn.addEventListener("pointerup",off);btn.addEventListener("pointerleave",off);});
document.getElementById("startButton").addEventListener("click",startGame);
document.getElementById("restartButton").addEventListener("click",startGame);
document.getElementById("soundButton").addEventListener("click",()=>{state.muted=!state.muted;document.getElementById("soundIcon").textContent=state.muted?"×":"♪";});
document.getElementById("shareButton").addEventListener("click",async()=>{const text=`I collected ${state.score} acorns as SBS in Super Black Squirrel: Acorn Dash!`;try{if(navigator.share)await navigator.share({title:"SBS: Acorn Dash",text,url:location.href});else{await navigator.clipboard.writeText(`${text} ${location.href}`);showToast("Score copied to clipboard!");}}catch{}});

state=newState();updateHud();requestAnimationFrame(frame);
