const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WORLD = { width: 1600, height: 1000 };
const GAME_SECONDS = 120;
const TARGET_ACORNS = 24;
const PLAYER_SPEED = 265;
const GOLDEN_ACORN_INTERVAL = 30;
const GOLDEN_ACORN_LIFETIME = 11;
const GOLDEN_ACORN_VALUE = 3;
const FIRST_GOLDEN_ACORN_AT = 60;
const POWERUP_INTERVAL = 24;
const POWERUP_LIFETIME = 14;
const FIRST_POWERUP_AT = 38;
const SKEETERS_SHIELD_SECONDS = 8;
const SKEETERS_BOOST_SECONDS = 2;
const CAPE_SECONDS = 7;
const CAPE_SPEED_MULTIPLIER = 1.22;
const BLUE_BUS_SPEED = 110;
const BLUE_BUS_DWELL_SECONDS = 2.6;
const STORAGE_KEY = "sbs-acorn-dash-bests";
const ZONE_PROGRESS_KEY = "sbs-acorn-dash-zone-progress";
const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 630;
const SOUND_SPRITE_SOURCES = ["assets/audio/sbs-sounds.wav"];
const VOICE_LINES = {
  sbsGreeting: "assets/audio/voice/sbs-greeting.mp3"
};
const POWERUP_AUDIO = {
  capeFlight: "assets/audio/powerups/super-sbs-flight.mp3"
};
const SBS_GREETING_DISTANCE = 82;
const CAPE_FLIGHT_VOLUME = .42;
const CAPE_FLIGHT_FADE_SECONDS = 1.35;
const MODE_HUB = "hub";
const MODE_DINING_CENTER = "diningCenter";
const DINING_CENTER_ZONE = {
  id: MODE_DINING_CENTER,
  name: "Dining Center Dash",
  subtitle: "Collect snacks. Dodge trays. Escape with dignity.",
  width: 2400,
  height: 1500,
  duration: 75,
  requiredSnacks: 12,
  bonkLimit: 3,
  start: { x: 190, y: 1260 },
  return: { x: 342, y: 328 },
  marker: { x: 330, y: 338, radius: 54 },
  exit: { x: 2185, y: 1260, radius: 76 },
  cookie: { x: 2050, y: 395, collected: false },
  coffee: { x: 1180, y: 825, collected: false, respawn: 0 },
  snacks: [
    [315,1185],[505,1110],[700,1005],[925,1045],[1120,950],[1325,1030],
    [1545,900],[1760,760],[1955,605],[1855,410],[1540,470],[1185,570]
  ],
  puddles: [
    { x:760, y:1220, rx:82, ry:36, angle:.18 },
    { x:1430, y:735, rx:92, ry:34, angle:-.22 }
  ],
  tables: [
    { x:470, y:780, w:210, h:116 }, { x:760, y:690, w:210, h:116 },
    { x:1070, y:685, w:210, h:116 }, { x:1370, y:610, w:210, h:116 },
    { x:570, y:1035, w:190, h:104 }, { x:875, y:905, w:190, h:104 },
    { x:1190, y:1115, w:210, h:112 }, { x:1530, y:1065, w:210, h:112 },
    { x:1810, y:965, w:190, h:104 }
  ],
  counters: [
    { x:260, y:210, w:560, h:130, label:"SNACK LINE" },
    { x:940, y:205, w:420, h:130, label:"SOUP?" },
    { x:1530, y:205, w:520, h:130, label:"COOKIE WATCH" },
    { x:2145, y:520, w:135, h:470, label:"TRAY RETURN" }
  ],
  hazards: [
    { type:"dcStudent", color:"#cf704d", speed:96, radius:24, segment:0, progress:.15, points:[[420,520],[1920,520],[1920,675],[420,675]] },
    { type:"dcStudent", color:"#5d78a7", speed:82, radius:24, segment:0, progress:.55, points:[[620,1210],[1720,1210],[1720,985],[620,985]] },
    { type:"dcStudent", color:"#e0a539", speed:88, radius:24, segment:0, progress:.3, points:[[320,890],[760,810],[1120,875],[1510,790],[1860,850]] },
    { type:"tray", speed:210, radius:28, segment:0, progress:.1, points:[[2080,560],[2080,1020]] },
    { type:"tray", speed:235, radius:28, segment:0, progress:.65, points:[[1320,430],[2140,430]] }
  ]
};
const SOUND_SPRITES = {
  start: [0, 450],
  acorn: [530, 240],
  secret: [850, 700],
  golden: [1630, 620],
  powerup: [2330, 460],
  cape: [2870, 860],
  shield: [3810, 440],
  dodge: [4330, 240],
  bump: [4650, 380],
  wobble: [5110, 560],
  bird: [5750, 500],
  quack: [6330, 340],
  horn: [6750, 620],
  urgent: [7450, 740],
  finish: [8270, 960]
};
const SOUND_PLAYBACK = {
  acorn: { cooldown: .055, rateJitter: .01, volume: .58 },
  dodge: { cooldown: .18, rateJitter: .025, volume: .58 },
  horn: { cooldown: 1.2, volume: .64 },
  bird: { cooldown: 2.5, volume: .34 },
  quack: { cooldown: 1.5, volume: .4 },
  bump: { cooldown: .28, volume: .72 },
  wobble: { cooldown: .34, volume: .74 },
  secret: { volume: .82 },
  golden: { volume: .8 },
  finish: { volume: .78 }
};
const SOUND_REVIEW_ITEMS = [
  { id:"start", label:"Start cue", category:"Start", use:"Plays when the countdown ends and SBS can start scurrying." },
  { id:"acorn", label:"Acorn pickup", category:"Common reward", use:"Plays when SBS collects a regular trail acorn." },
  { id:"secret", label:"Hidden memory", category:"Discovery reward", use:"Plays when SBS finds a hidden landmark memory like the tray, key, cupola, stone, or mail." },
  { id:"golden", label:"Golden acorn", category:"Rare reward", use:"Plays when SBS collects the temporary golden acorn bonus." },
  { id:"powerup", label:"Powerup pickup", category:"Powerup", use:"Plays for most powerups: DC Soup, Arboretum Leaf, Honor Code Scroll, and Skeeter's Pie pickup." },
  { id:"cape", label:"Super SBS cape", category:"Powerup", use:"Plays when SBS collects the Super SBS Cape and launches into flight mode." },
  { id:"shield", label:"Skeeter's block", category:"Protection", use:"Plays when the Skeeter's pizza box blocks a collision and saves the stash." },
  { id:"dodge", label:"Near miss", category:"Skill reward", use:"Plays when SBS earns a close-call dodge bonus near students, bikes, cart, or bus." },
  { id:"bump", label:"Small bump", category:"Mistake", use:"Plays when SBS hits a student or bike without protection." },
  { id:"wobble", label:"Big bump", category:"Mistake", use:"Plays when SBS gets bumped by the golf cart or Blue Bus." },
  { id:"bird", label:"Ambient bird", category:"Campus ambience", use:"Plays occasionally as a light campus background sound." },
  { id:"quack", label:"Duck quack", category:"Campus ambience", use:"Plays occasionally near the Duck Pond ambience loop." },
  { id:"horn", label:"Golf cart horn", category:"Hazard warning", use:"Plays when the golf cart gets close enough to warn the player." },
  { id:"urgent", label:"Final scurry", category:"Timer warning", use:"Plays once when 30 seconds remain." },
  { id:"finish", label:"End card", category:"Run complete", use:"Plays when the final postcard/result card appears." },
  { id:"sbsGreeting", label:"Student greeting", category:"Voice cameo", use:"Plays once per run when SBS passes a student on the campus paths." },
  { id:"capeFlight", label:"Cape flight layer", category:"Powerup layer", use:"Starts when SBS gets the Super SBS Cape, plays while flight is active, then fades out as it ends." }
];
const mobileQuery = window.matchMedia("(pointer: coarse), (max-width: 760px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const landmarks = [
  { id: "dc", name: "Dining Center", short: "THE DC", x: 238, y: 176, w: 235, h: 126, type: "dc", secret: { x: 225, y: 320, object: "tray", label: "Dining tray memory" }, note: "SBS remembers the clatter of DC trays." },
  { id: "lloyd", name: "Lloyd Hall", short: "LLOYD", x: 502, y: 108, w: 238, h: 104, type: "dorm", secret: { x: 754, y: 187, object: "key", label: "Dorm key memory" }, note: "A suspiciously well-hidden dorm stash." },
  { id: "founders", name: "Founders Hall", short: "FOUNDERS", x: 790, y: 340, w: 330, h: 152, type: "founders", secret: { x: 948, y: 518, object: "cupola", label: "Cupola memory" }, note: "SBS salutes the cupola." },
  { id: "barclay", name: "Barclay Hall", short: "BARCLAY", x: 1190, y: 480, w: 230, h: 116, type: "dorm", secret: { x: 1163, y: 572, object: "stone", label: "Old stone memory" }, note: "Oldest dorm. Excellent acorn masonry." },
  { id: "campus", name: "Whitehead Campus Center", short: "CAMPUS CENTER", x: 1118, y: 760, w: 275, h: 110, type: "center", secret: { x: 1087, y: 813, object: "mail", label: "Mailroom memory" }, note: "SBS checked the mailroom twice." }
];

const paths = [
  [[120, 406], [470, 406], [760, 436], [945, 540], [1190, 630], [1450, 640]],
  [[348, 300], [394, 407]], [[630, 212], [710, 370]], [[954, 494], [1010, 714], [1190, 760]],
  [[475, 670], [820, 616], [1010, 714], [1060, 906]], [[1190, 630], [1280, 760]]
];

const trees = [
  [95,118,42],[170,215,34,"dogwood"],[1380,142,45],[1480,240,36],[85,780,42],[185,880,38],[340,850,45],
  [525,530,30],[620,720,38],[760,795,33],[1460,840,46,"sycamore"],[1310,930,36],[1060,190,39],[1180,135,31],
  [870,165,26,"maple"],[560,315,28],[345,545,33],[1520,520,31],[40,510,36,"maple"],[950,890,28],[118,630,27]
];

const trailChapters = [
  { name:"DC to Lloyd", destination:"Lloyd", spots:[[170,390],[314,370],[448,434],[564,420],[678,465]] },
  { name:"Lloyd to Founders", destination:"Founders", spots:[[785,575],[882,610],[1020,670],[1110,704],[1235,675],[1374,628]] },
  { name:"Founders to Barclay", destination:"Barclay", spots:[[410,648],[548,678],[682,700],[800,780],[920,828],[1042,880]] },
  { name:"Barclay to Campus Center", destination:"Campus Center", spots:[[1320,730],[1450,760],[1410,690],[1280,720],[1160,735]] }
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
  { id:"soup", name:"Mysterious DC Mushroom Soup", shortName:"DC Soup", popName:"DC SOUP", note:"Mysterious DC mushroom soup: questionable, but fast!", duration:7, weight:3 },
  { id:"leaf", name:"Arboretum Leaf", note:"Secret landmark stashes are glowing!", duration:9, weight:3 },
  { id:"scroll", name:"Honor Code Scroll", note:"SBS is bump-proof for a few seconds!", duration:6, weight:3 },
  { id:"skeeters", name:"Skeeter's Pie", note:"Skeeter's Pie! Late-night delivery mode.", duration:SKEETERS_SHIELD_SECONDS, weight:3 },
  { id:"cape", name:"Super SBS Cape", shortName:"Super SBS", popName:"SUPER SBS!", note:"Super SBS takes flight!", duration:CAPE_SECONDS, weight:3 }
];

const hazardRoutes = [
  { type:"student", style:"hoodie", color:"#cf704d", skin:"#efc3a1", hair:"#503629", speed:72, radius:18, points:[[510,405],[790,445],[890,550],[705,615]], offset:0 },
  { type:"student", style:"backpack", color:"#5d78a7", skin:"#8c5f45", hair:"#25221e", speed:68, radius:18, points:[[1050,700],[1180,625],[1410,640],[1260,760]], offset:1.8 },
  { type:"student", style:"books", color:"#e0a539", skin:"#c98e70", hair:"#a05d38", speed:74, radius:18, points:[[410,650],[680,705],[810,615],[550,535]], offset:3.4 },
  { type:"bike", style:"helmet", color:"#4779a2", frame:"#315f76", skin:"#d99b72", hair:"#52372b", speed:155, radius:20, points:[[140,405],[470,405],[780,450],[1030,665],[1420,640]], offset:1 },
  { type:"bike", style:"basket", color:"#6d4c91", frame:"#7c4c52", skin:"#7f563f", hair:"#25221e", speed:140, radius:20, points:[[1060,900],[1015,715],[950,535],[730,420]], offset:3 },
  { type:"cart", style:"security", color:"#f2eddc", speed:105, radius:28, points:[[1440,640],[1200,640],[1010,714],[820,616],[490,670]], offset:2.3 },
  { type:"bus", style:"bluebus", speed:BLUE_BUS_SPEED, radius:78, w:250, h:68, stopAt:4, dwell:BLUE_BUS_DWELL_SECONDS, oneWay:true, points:[[1540,245],[1320,245],[1110,255],[930,270],[760,250],[620,230],[520,220]], offset:0 }
];

let state;
let audioCtx;
let gameSoundSprite;
const voiceSounds = {};
const powerupSounds = {};
const lastSoundAt = {};
let capeFlightSoundId = null;
let capeFlightFading = false;
let lastTime = 0;
let toastTimer;
let storyTimer;
let countdownTimer;
let professorBoltzSprite;
const keys = new Set();
const joystick = { x:0, y:0, pointerId:null };
let portraitBypass = false;
let orientationGateEnabled = false;

function newState() {
  return {
    mode: MODE_HUB, running: false, ended: false, paused: false, muted: false, timeLeft: GAME_SECONDS, score: 0, secrets: 0, combo:0, bestCombo:0, comboWindow:0, flash:0, shake:0, hintLife:0, landmarkPulse:0, finalScurry:false, goldenCaught:0, dodges:0, chapterIndex:0, presentationTime:0, introCamera:0, introCameraDuration:0,
    player: { x: 690, y: 560, vx:0, vy:0, r: 19, facing: 1, invulnerable: 0, bob: 0, spin: 0, secretDance: 0, moving:false, skeetersHero:{ scale:1, lift:0, rotate:-.12, glow:0 }, capeLaunch:{ burst:0, lift:0, capeScale:1, streak:0 } },
    camera: { x:690, y:560 },
    acorns: trailChapters.flatMap((chapter,chapterIndex)=>chapter.spots.map(([x,y],spotIndex)=>({x,y,collected:false,hidden:false,chapterIndex,spotIndex}))),
    hidden: landmarks.map(l => ({ x:l.secret.x, y:l.secret.y, object:l.secret.object, label:l.secret.label, collected:false, hidden:true, landmark:l })),
    hazards: hazardRoutes.map(route => ({ ...route, segment:0, progress:0, x:route.points[0][0], y:route.points[0][1] })),
    particles: [], spills: [], reactions: [], celebrations: [], scorePops: [], golden: null, powerup: null, powerupBag: [],
    activePowerups: { soup:0, leaf:0, scroll:0, skeeters:0, skeetersBoost:0, cape:0 }, skeetersDeliveries:0, skeetersBlocks:0, capeFlights:0, chuckWaves:0, chuckCheckIns:0, sbsGreetingPlayed:false, progress:loadZoneProgress(), zone:null, zonePrompt:null, nextGoldenAt: FIRST_GOLDEN_ACORN_AT, nextPowerupAt: FIRST_POWERUP_AT, nextAmbientAt: 8, nextDuckAt:18, hornReady:true, elapsed: 0,
    leaves: Array.from({length:20},(_,i)=>({x:(i*137)%WORLD.width,y:(i*83)%WORLD.height,phase:i*.7,speed:8+(i%5)*2})),
    ducks: [{x:118,y:884,phase:0,speed:7},{x:174,y:912,phase:1.8,speed:5},{x:220,y:883,phase:3.4,speed:6}],
    professorBoltz: { x:292, y:862, segment:0, progress:0, speed:24, dwellLeft:1.8, facing:-1, wave:0, route:[[292,862],[246,840],[192,826],[134,846],[103,884],[128,930],[204,948],[270,916],[292,862]] }
  };
}

function startGame() {
  const muted = state?.muted || false;
  stopCapeFlightAudio(0);
  state = newState();
  Object.keys(lastSoundAt).forEach(name => delete lastSoundAt[name]);
  state.muted = muted;
  state.introCameraDuration=reducedMotionQuery.matches ? .2 : isMobileView() ? 2 : 2.8;
  state.introCamera=state.introCameraDuration;
  resetJoystick();
  document.getElementById("pauseOverlay").classList.remove("show");
  document.getElementById("mobileHelp").classList.remove("show");
  document.getElementById("helpButton").setAttribute("aria-expanded","false");
  showDefaultNotebook();
  document.getElementById("startOverlay").classList.remove("show");
  document.getElementById("endOverlay").classList.remove("show","postcard-reveal");
  document.getElementById("gameFrame").classList.add("cinematic");
  document.getElementById("campusGlide").classList.add("show");
  document.querySelectorAll(".tour-stops span").forEach(el=>el.classList.remove("found"));
  const story = document.getElementById("storyBeat");
  story.classList.add("show");
  spawnOpeningScatter();
  clearTimeout(storyTimer);
  storyTimer=setTimeout(()=>{
    story.classList.remove("show");
    document.getElementById("gameFrame").classList.remove("cinematic");
    document.getElementById("campusGlide").classList.remove("show");
    runCountdown();
  },state.introCameraDuration*1000);
  updateHud();
}

function endGame() {
  stopCapeFlightAudio(.25);
  state.running = false; state.ended = true;
  resetJoystick();
  document.getElementById("mobileHelp").classList.remove("show");
  document.getElementById("helpButton").setAttribute("aria-expanded","false");
  const bests=savePersonalBests();
  const allSecrets = state.secrets === landmarks.length;
  const title = state.score >= TARGET_ACORNS ? "Legend of Founders Green!" : state.score >= 14 ? "A noble stash!" : "A respectable scurry!";
  const text = allSecrets ? "You found every landmark secret. SBS would absolutely add this to the reunion newsletter." :
    "SBS left a few acorns behind for the next walk across campus. Very community-minded of him.";
  document.getElementById("endTitle").textContent = title;
  document.getElementById("finalScore").textContent = state.score;
  document.getElementById("resultRank").textContent = getRank();
  document.getElementById("finalSecrets").textContent = `${state.secrets} / ${landmarks.length}`;
  document.getElementById("finalCombo").textContent = `${state.bestCombo}x`;
  document.getElementById("personalBest").textContent = bests.score;
  document.getElementById("bestMoment").textContent = `Best moment: ${getBestMoment()}`;
  document.getElementById("endMessage").textContent = text;
  renderLandmarkBadges();
  const endOverlay=document.getElementById("endOverlay");
  endOverlay.classList.add("show");
  requestAnimationFrame(()=>endOverlay.classList.add("postcard-reveal"));
  playSound("finish");
}

function update(dt) {
  state.presentationTime+=dt;
  state.introCamera=Math.max(0,state.introCamera-dt);
  updateAtmosphere(dt);
  if (!state.running) {
    state.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    state.particles = state.particles.filter(p => p.life > 0);
    return;
  }
  state.elapsed += dt;
  if (state.mode === MODE_DINING_CENTER) {
    state.zone.timeLeft = Math.max(0, state.zone.timeLeft - dt);
    if (state.zone.timeLeft <= 0) failDiningCenterZone("Snack mission timed out.");
  } else {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) { state.timeLeft = 0; endGame(); updateHud(); return; }
    if (state.elapsed >= state.nextAmbientAt) {
      playSound("bird");
      state.nextAmbientAt = state.elapsed + 10 + Math.random() * 9;
    }
    if(state.timeLeft<=30&&!state.finalScurry){state.finalScurry=true;showToast("Final scurry! Thirty seconds left!");playSound("urgent");}
  }
  state.comboWindow=Math.max(0,state.comboWindow-dt);
  if(!state.comboWindow)state.combo=0;
  state.flash=Math.max(0,state.flash-dt);
  state.shake=Math.max(0,state.shake-dt);
  state.landmarkPulse=Math.max(0,state.landmarkPulse-dt);
  state.hintLife=Math.max(0,state.hintLife-dt);

  const dx = clamp((keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0)+joystick.x,-1,1);
  const dy = clamp((keys.has("arrowdown") || keys.has("s") ? 1 : 0) - (keys.has("arrowup") || keys.has("w") ? 1 : 0)+joystick.y,-1,1);
  state.player.moving = Boolean(dx || dy);
  const mag = Math.hypot(dx, dy)||1;
  const coffeeBoost = state.zone?.coffeeBoost > 0 ? 1.34 : 1;
  const boost = Math.max(state.activePowerups.soup > 0 ? 1.48 : 1, state.activePowerups.skeetersBoost > 0 ? 1.32 : 1, state.activePowerups.cape > 0 ? CAPE_SPEED_MULTIPLIER : 1, coffeeBoost);
  const speed = PLAYER_SPEED * boost;
  const targetVx=dx/mag*speed,targetVy=dy/mag*speed;
  const ease=1-Math.exp(-(dx||dy?13:18)*dt);
  const previousPlayerX=state.player.x,previousPlayerY=state.player.y;
  state.player.vx+=(targetVx-state.player.vx)*ease;state.player.vy+=(targetVy-state.player.vy)*ease;
  const world=getCurrentWorld();
  state.player.x=clamp(state.player.x+state.player.vx*dt,28,world.width-28);state.player.y=clamp(state.player.y+state.player.vy*dt,28,world.height-28);
  if(state.mode === MODE_DINING_CENTER && isDiningCenterBlocked(state.player)){
    state.player.x=previousPlayerX;state.player.y=previousPlayerY;state.player.vx*=.18;state.player.vy*=.18;
  }
  updateCamera(dt);
  if(Math.abs(state.player.vx)>.5)state.player.facing=Math.sign(state.player.vx);
  if(Math.hypot(state.player.vx,state.player.vy)>8)state.player.bob+=dt*13;
  state.player.invulnerable = Math.max(0, state.player.invulnerable - dt);
  state.player.spin = Math.max(0, state.player.spin - dt);
  state.player.secretDance = Math.max(0, state.player.secretDance - dt);
  if (state.player.capeLaunch && (!window.gsap || reducedMotionQuery.matches)) {
    state.player.capeLaunch.burst=Math.max(0,state.player.capeLaunch.burst-dt*1.8);
    state.player.capeLaunch.streak=Math.max(0,state.player.capeLaunch.streak-dt*1.8);
    state.player.capeLaunch.lift=Math.max(0,state.player.capeLaunch.lift-dt*90);
    state.player.capeLaunch.capeScale=1+Math.max(0,state.player.capeLaunch.capeScale-1-dt*1.2);
  }
  Object.keys(state.activePowerups).forEach(id => state.activePowerups[id] = Math.max(0, state.activePowerups[id] - dt));
  updateCapeFlightAudio();
  updateSecretRevealAnimations();

  if (state.mode === MODE_DINING_CENTER) {
    updateDiningCenterZone(dt);
    updateTransientEffects(dt);
    updateHud();
    return;
  }

  updateZoneEntryPrompt();

  if (!hasSpecialEvent() && state.elapsed >= state.nextGoldenAt) spawnGoldenAcorn();
  if (state.golden) {
    state.golden.life -= dt;
    if (state.golden.life <= 0) {
      showToast("The golden acorn rolled away!");
      state.golden = null;
      state.nextGoldenAt = state.elapsed + GOLDEN_ACORN_INTERVAL;
    } else if (distance(state.player, state.golden) < 36) collectGoldenAcorn();
  }
  if (!hasSpecialEvent() && state.elapsed >= state.nextPowerupAt) spawnPowerup();
  if (state.powerup) {
    state.powerup.life -= dt;
    if (state.powerup.life <= 0) {
      state.powerup = null;
      state.nextPowerupAt = state.elapsed + POWERUP_INTERVAL;
    } else if (distance(state.player, state.powerup) < 36) collectPowerup();
  }

  state.hazards.forEach(h => {moveHazard(h, dt);updateNearMiss(h);maybePlaySbsGreeting(h);});
  const cart=state.hazards.find(h=>h.type==="cart"),cartDistance=distance(state.player,cart);
  if(cartDistance<165&&state.hornReady){playSound("horn");state.hornReady=false;}
  if(cartDistance>260)state.hornReady=true;
  if(state.elapsed>=state.nextDuckAt){playSound("quack");state.nextDuckAt=state.elapsed+16+Math.random()*18;}
  [...state.acorns.filter(acorn=>acorn.chapterIndex<=state.chapterIndex), ...state.hidden].forEach(acorn => {
    if (!acorn.collected && distance(state.player, acorn) < 31) collectAcorn(acorn);
  });
  state.spills.forEach(acorn => {
    acorn.x+=acorn.vx*dt;acorn.y+=acorn.vy*dt;acorn.vx*=Math.pow(.08,dt);acorn.vy*=Math.pow(.08,dt);
    acorn.life -= dt;
    if (!acorn.collected && distance(state.player, acorn) < 31) collectSpill(acorn);
  });
  state.spills = state.spills.filter(acorn => !acorn.collected && acorn.life > 0);
  if (!state.player.invulnerable && state.activePowerups.scroll <= 0 && state.activePowerups.cape <= 0) {
    for (const hazard of state.hazards) {
      if (isHazardCollision(hazard)) {
        if (state.activePowerups.skeeters > 0) blockWithSkeetersPie(hazard);
        else bump(hazard);
        break;
      }
    }
  }
  updateTransientEffects(dt);
  updateHud();
}

function getCurrentWorld() {
  return state?.mode === MODE_DINING_CENTER ? DINING_CENTER_ZONE : WORLD;
}

function updateCamera(dt) {
  if(state.mode !== MODE_DINING_CENTER){
    updateMobileCamera(dt);
    return;
  }
  const ease=1-Math.exp(-8*dt);
  state.camera.x+=(state.player.x-state.camera.x)*ease;
  state.camera.y+=(state.player.y-state.camera.y)*ease;
}

function updateTransientEffects(dt) {
  state.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
  state.particles = state.particles.filter(p => p.life > 0);
  state.reactions.forEach(r => r.life -= dt);
  state.reactions = state.reactions.filter(r => r.life > 0);
  state.scorePops.forEach(p => { p.life -= dt; p.y -= 34 * dt; });
  state.scorePops = state.scorePops.filter(p => p.life > 0);
  state.celebrations.forEach(c => c.life -= dt);
  state.celebrations = state.celebrations.filter(c => c.life > 0);
}

function createDiningCenterZoneState() {
  return {
    id: DINING_CENTER_ZONE.id,
    timeLeft: DINING_CENTER_ZONE.duration,
    snacksCollected: 0,
    cookieCollected: false,
    bonks: 0,
    coffeeBoost: 0,
    result: null,
    snacks: DINING_CENTER_ZONE.snacks.map(([x,y],index)=>({ x, y, index, collected:false })),
    cookie: { ...DINING_CENTER_ZONE.cookie, collected:false },
    coffee: { ...DINING_CENTER_ZONE.coffee, collected:false, respawn:0 },
    hazards: DINING_CENTER_ZONE.hazards.map(h=>({ ...h, points:h.points.map(([x,y])=>[x,y]) })),
    returnTo: { x: state.player.x, y: state.player.y }
  };
}

function enterDiningCenterZone() {
  if(state.mode !== MODE_HUB || !state.running)return;
  const muted=state.muted;
  state.mode=MODE_DINING_CENTER;
  state.zone=createDiningCenterZoneState();
  state.player.x=DINING_CENTER_ZONE.start.x;state.player.y=DINING_CENTER_ZONE.start.y;
  state.player.vx=0;state.player.vy=0;state.player.invulnerable=.8;state.player.spin=0;
  state.camera.x=state.player.x;state.camera.y=state.player.y;
  state.golden=null;state.powerup=null;state.spills=[];
  state.activePowerups.soup=0;state.activePowerups.skeetersBoost=0;state.activePowerups.cape=0;
  stopCapeFlightAudio(.2);
  state.muted=muted;
  showToast(DINING_CENTER_ZONE.subtitle);
  document.getElementById("missionTitle").textContent=DINING_CENTER_ZONE.name;
  document.getElementById("missionText").textContent="Collect 12 snack acorns, grab the DC Cookie, then reach the glowing exit.";
  playSound("powerup");
}

function returnToHubFromDiningCenter(message) {
  const completed=state.zone?.result === "complete";
  const returnTo=state.zone?.returnTo || DINING_CENTER_ZONE.return;
  if(completed){
    state.progress.diningCenter.completed=true;
    state.progress.diningCenter.snacks=Math.max(state.progress.diningCenter.snacks, state.zone.snacksCollected);
    const finishTime=Math.max(0, DINING_CENTER_ZONE.duration - state.zone.timeLeft);
    state.progress.diningCenter.bestTime=state.progress.diningCenter.bestTime == null ? finishTime : Math.min(state.progress.diningCenter.bestTime, finishTime);
    saveZoneProgress();
  }
  state.mode=MODE_HUB;
  state.zone=null;
  state.player.x=returnTo.x;state.player.y=returnTo.y;
  state.player.vx=0;state.player.vy=0;state.player.invulnerable=1;
  state.camera.x=state.player.x;state.camera.y=state.player.y;
  state.hintLife=5;
  showDefaultNotebook();
  showToast(message);
  updateHud();
}

function completeDiningCenterZone() {
  if(state.zone?.result)return;
  state.zone.result="complete";
  state.score+=5;
  state.flash=.55;
  spawnParticles(state.player.x,state.player.y,"#ffe38a");
  addScorePop(state.player.x,state.player.y-34,"DC CLEARED! +5","#fff1bd",24);
  state.reactions.push({ x:state.player.x, y:state.player.y-44, life:1.2, text:"SUSPICIOUSLY CAFFEINATED!", color:"#fff1bd", stars:true });
  playSound("finish");
  setTimeout(()=>returnToHubFromDiningCenter("DC Dash cleared. SBS is suspiciously caffeinated."),900);
}

function failDiningCenterZone(message) {
  if(state.zone?.result)return;
  state.zone.result="fail";
  state.player.invulnerable=1;
  state.shake=reducedMotionQuery.matches?0:.24;
  showToast(message || "Snack mission compromised.");
  playSound("wobble");
  setTimeout(()=>returnToHubFromDiningCenter("SBS retreated from the DC. The snacks remain under watch."),900);
}

function updateDiningCenterZone(dt) {
  if(!state.zone || state.zone.result)return;
  state.zone.coffeeBoost=Math.max(0,state.zone.coffeeBoost-dt);
  if(state.zone.coffee.respawn>0){
    state.zone.coffee.respawn=Math.max(0,state.zone.coffee.respawn-dt);
    if(state.zone.coffee.respawn===0)state.zone.coffee.collected=false;
  }
  state.zone.hazards.forEach(h=>moveDiningCenterHazard(h,dt));
  state.zone.snacks.forEach(snack=>{
    if(!snack.collected && distance(state.player,snack)<34)collectDiningCenterSnack(snack);
  });
  if(!state.zone.cookie.collected && distance(state.player,state.zone.cookie)<42)collectDiningCenterCookie();
  if(!state.zone.coffee.collected && distance(state.player,state.zone.coffee)<42)collectDiningCenterCoffee();
  const puddle=DINING_CENTER_ZONE.puddles.find(p=>isInEllipse(state.player,p));
  if(puddle){
    state.player.vx*=1.02;state.player.vy*=1.02;
    if(Math.random()<dt*3)spawnParticles(state.player.x,state.player.y,"#c7e6ff");
  }
  if(!state.player.invulnerable){
    const hit=state.zone.hazards.find(h=>distance(state.player,h)<state.player.r+h.radius);
    if(hit)bonkDiningCenterHazard(hit);
  }
  if(state.zone.cookieCollected && state.zone.snacksCollected>=DINING_CENTER_ZONE.requiredSnacks && distance(state.player,DINING_CENTER_ZONE.exit)<DINING_CENTER_ZONE.exit.radius){
    completeDiningCenterZone();
  }
}

function moveDiningCenterHazard(h,dt) {
  const from=h.points[h.segment],to=h.points[(h.segment+1)%h.points.length];
  const len=Math.hypot(to[0]-from[0],to[1]-from[1])||1;
  h.progress+=h.speed*dt/len;
  if(h.progress>=1){
    h.progress-=1;
    h.segment=(h.segment+1)%h.points.length;
  }
  const a=h.points[h.segment],b=h.points[(h.segment+1)%h.points.length];
  h.x=a[0]+(b[0]-a[0])*h.progress;h.y=a[1]+(b[1]-a[1])*h.progress;
  h.angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
}

function collectDiningCenterSnack(snack) {
  snack.collected=true;
  state.zone.snacksCollected++;
  state.score++;
  extendCombo();
  spawnParticles(snack.x,snack.y,"#f4c65f");
  addScorePop(snack.x,snack.y,`SNACK ${state.zone.snacksCollected}/${DINING_CENTER_ZONE.requiredSnacks}`,"#fff4b4",16);
  playSound("acorn");
}

function collectDiningCenterCookie() {
  state.zone.cookie.collected=true;
  state.zone.cookieCollected=true;
  state.score+=3;
  state.flash=.35;
  spawnParticles(state.zone.cookie.x,state.zone.cookie.y,"#ffe38a");
  addScorePop(state.zone.cookie.x,state.zone.cookie.y,"DC COOKIE! +3","#fff1bd",23);
  showToast("Legendary DC Cookie acquired. Now find the exit!");
  playSound("golden");
}

function collectDiningCenterCoffee() {
  state.zone.coffee.collected=true;
  state.zone.coffee.respawn=18;
  state.zone.coffeeBoost=5.5;
  state.player.invulnerable=Math.max(state.player.invulnerable,.35);
  spawnParticles(state.zone.coffee.x,state.zone.coffee.y,"#d4d07d");
  addScorePop(state.zone.coffee.x,state.zone.coffee.y,"CAFFEINATED!","#fff0a8",20);
  showToast("Caffeinated Squirrel Mode activated.");
  playSound("powerup");
}

function bonkDiningCenterHazard(hazard) {
  state.zone.bonks++;
  state.player.invulnerable=1.15;
  state.player.spin=.55;
  state.combo=0;state.comboWindow=0;
  state.shake=reducedMotionQuery.matches?0:.2;
  spawnParticles(state.player.x,state.player.y,"#ffffff");
  state.reactions.push({ x:state.player.x, y:state.player.y-30, life:1, text:hazard.type==="tray"?"TRAY TRAFFIC!":"Sorry, SBS!", color:"#fff5da", stars:false });
  showToast(`Tray traffic bonk ${state.zone.bonks}/${DINING_CENTER_ZONE.bonkLimit}.`);
  playSound("bump");
  if(state.zone.bonks>=DINING_CENTER_ZONE.bonkLimit)failDiningCenterZone("Tray traffic has defeated the squirrel.");
}

function isDiningCenterBlocked(point) {
  const blockers=[...DINING_CENTER_ZONE.tables,...DINING_CENTER_ZONE.counters];
  return blockers.some(rect=>circleRectOverlap(point.x,point.y,state.player.r,rect));
}

function circleRectOverlap(cx,cy,r,rect) {
  const closestX=clamp(cx,rect.x,rect.x+rect.w),closestY=clamp(cy,rect.y,rect.y+rect.h);
  return Math.hypot(cx-closestX,cy-closestY)<r;
}

function isInEllipse(point,puddle) {
  const cos=Math.cos(-(puddle.angle||0)),sin=Math.sin(-(puddle.angle||0));
  const dx=point.x-puddle.x,dy=point.y-puddle.y;
  const x=dx*cos-dy*sin,y=dx*sin+dy*cos;
  return (x*x)/(puddle.rx*puddle.rx)+(y*y)/(puddle.ry*puddle.ry)<=1;
}

function updateZoneEntryPrompt() {
  const marker=DINING_CENTER_ZONE.marker;
  const near=distance(state.player,marker)<marker.radius+28;
  state.zonePrompt=near ? MODE_DINING_CENTER : null;
  if(near && (keys.has(" ") || keys.has("enter"))){
    keys.delete(" ");keys.delete("enter");
    enterDiningCenterZone();
  }
}

function moveHazard(h, dt) {
  if (h.dwellLeft > 0) {
    h.dwellLeft = Math.max(0, h.dwellLeft - dt);
    h.doorsOpen = true;
    return;
  }
  h.doorsOpen = false;
  const from = h.points[h.segment], to = h.points[(h.segment + 1) % h.points.length];
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const scale=getDifficultyScale(h.type);
  h.progress += h.speed * scale * dt / len;
  if (h.progress >= 1) {
    h.progress -= 1;
    h.segment = (h.segment + 1) % h.points.length;
    if (h.oneWay && h.segment === h.points.length - 1) {
      h.segment = 0; h.progress = 0; h.x = h.points[0][0]; h.y = h.points[0][1];
    }
    if (h.segment === h.stopAt) { h.progress = 0; h.dwellLeft = h.dwell; }
  }
  const a = h.points[h.segment], b = h.points[(h.segment + 1) % h.points.length];
  h.x = a[0] + (b[0] - a[0]) * h.progress; h.y = a[1] + (b[1] - a[1]) * h.progress;
  h.angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
}

function getAcornValue() {
  return state.combo>=10?3:state.combo>=5?2:1;
}

function getDifficultyScale(type) {
  const progress=1-state.timeLeft/GAME_SECONDS;
  if(type==="bus")return 1;
  if(type==="student")return 1+progress*.08;
  if(type==="bike")return 1+progress*.28;
  return 1+progress*.38;
}

function updateNearMiss(hazard) {
  if(hazard.type==="student")return;
  if(hazard.type==="bus") {
    const hit=busCollisionGap(hazard);
    hazard.nearMissReady??=true;
    if(hit<22&&hit>0&&hazard.nearMissReady){
      hazard.nearMissReady=false;state.score++;state.dodges++;
      addScorePop(state.player.x,state.player.y-22,"CAUGHT THE GAP! +1","#dff3ff",17);playSound("dodge");
    }
    if(hit>70)hazard.nearMissReady=true;
    return;
  }
  const gap=distance(state.player,hazard),threshold=state.player.r+hazard.radius+25;
  hazard.nearMissReady??=true;
  if(gap<threshold&&gap>state.player.r+hazard.radius&&hazard.nearMissReady){
    hazard.nearMissReady=false;state.score++;state.dodges++;
    if(hazard.type==="cart")state.chuckWaves++;
    const flying=state.activePowerups.cape>0;
    addScorePop(state.player.x,state.player.y-22,flying?"SOARING! +1":hazard.type==="cart"?"CHUCK WAVES! +1":"NICE DODGE! +1",flying?"#ffe56b":hazard.type==="cart"?"#fff0a8":"#dfffa8",17);playSound("dodge");
  }
  if(gap>threshold+55)hazard.nearMissReady=true;
}

function isHazardCollision(hazard) {
  if (hazard.type === "bus") return isBusCollision(hazard);
  return distance(state.player, hazard) < state.player.r + hazard.radius;
}

function getBusLocalPosition(bus) {
  const cos=Math.cos(-(bus.angle||0)),sin=Math.sin(-(bus.angle||0));
  const dx=state.player.x-bus.x,dy=state.player.y-bus.y;
  return { x:dx*cos-dy*sin, y:dx*sin+dy*cos };
}

function isBusCollision(bus) {
  const local=getBusLocalPosition(bus),halfW=bus.w*.5,halfH=bus.h*.5;
  return Math.abs(local.x)<halfW+state.player.r*.55 && Math.abs(local.y)<halfH+state.player.r*.7;
}

function busCollisionGap(bus) {
  const local=getBusLocalPosition(bus),halfW=bus.w*.5,halfH=bus.h*.5;
  const dx=Math.abs(local.x)-halfW-state.player.r*.55,dy=Math.abs(local.y)-halfH-state.player.r*.7;
  if(dx<0&&dy<0)return -Math.min(-dx,-dy);
  return Math.hypot(Math.max(dx,0),Math.max(dy,0));
}

function showDefaultNotebook() {
  if(state.progress?.diningCenter?.completed){
    document.getElementById("missionTitle").textContent="DC Dash cleared";
    document.getElementById("missionText").textContent="The Dining Center snack heist is complete. Keep roaming campus or chase the next acorn trail.";
    return;
  }
  const chapter=trailChapters[state.chapterIndex];
  document.getElementById("missionTitle").textContent=chapter?`Next stop: ${chapter.destination}`:"Campus trail complete";
  document.getElementById("missionText").textContent=chapter?`Follow the glowing acorn trail along ${chapter.name}.`:"Sniff around landmark signs for any secret stashes you missed.";
}

function hasSpecialEvent() {
  return Boolean(state.golden||state.powerup);
}

function updateTrailChapter() {
  const chapter=trailChapters[state.chapterIndex];
  if(!chapter)return;
  const chapterAcorns=state.acorns.filter(acorn=>acorn.chapterIndex===state.chapterIndex);
  if(!chapterAcorns.every(acorn=>acorn.collected))return;
  state.chapterIndex++;
  const next=trailChapters[state.chapterIndex];
  showToast(next?`${chapter.name} complete! Next stop: ${next.destination}.`:"Campus trail complete! Hunt down the remaining secrets.");
  showDefaultNotebook();
}

function updateSecretRevealAnimations() {
  state.hidden.forEach(secret=>{
    if(secret.collected||secret.revealAnimated)return;
    const visible=distance(state.player,secret)<145||state.activePowerups.leaf>0;
    if(!visible)return;
    secret.revealAnimated=true;
    secret.revealScale=.68;
    secret.revealGlow=0;
    secret.revealLift=10;
    if(window.gsap&&!reducedMotionQuery.matches){
      gsap.to(secret,{revealScale:1,duration:.52,ease:"back.out(2.2)"});
      gsap.to(secret,{revealLift:0,duration:.52,ease:"sine.out"});
      gsap.to(secret,{revealGlow:1,duration:.28,ease:"sine.out",yoyo:true,repeat:1});
    } else {
      secret.revealScale=1;
      secret.revealLift=0;
    }
  });
}

function collectAcorn(acorn) {
  const points=getAcornValue();acorn.collected = true; state.score+=points;
  spawnParticles(acorn.x, acorn.y, "#f4c65f");
  addScorePop(acorn.x, acorn.y, `+${points}`, points>1?"#ffe56b":"#fff4b4");
  extendCombo();
  if (acorn.hidden) {
    state.secrets++;
    state.landmarkPulse=.75;
    state.player.secretDance=.55;
    updateTourProgress(acorn.landmark.id);
    triggerLandmarkCelebration(acorn.landmark);
    showToast(`${acorn.label}: ${acorn.landmark.name} secret found!`);
    document.getElementById("missionTitle").textContent = acorn.landmark.name;
    document.getElementById("missionText").textContent = acorn.landmark.note;
    playSound("secret");
  } else {playSound("acorn");updateTrailChapter();}
}

function spawnPowerup() {
  const [x,y] = powerupSpots[Math.floor(Math.random() * powerupSpots.length)];
  const type = choosePowerupType();
  state.powerup = { x, y, life:POWERUP_LIFETIME, type };
}

function collectPowerup() {
  const { x, y, type } = state.powerup;
  state.activePowerups[type.id] = type.duration;
  if (type.id === "skeeters") {
    state.activePowerups.skeetersBoost = SKEETERS_BOOST_SECONDS;
    state.skeetersDeliveries++;
    triggerSkeetersHeroMoment();
  }
  if (type.id === "cape") {
    state.capeFlights++;
    triggerCapeComicLaunch();
    startCapeFlightAudio();
  }
  state.powerup = null;
  state.nextPowerupAt = state.elapsed + POWERUP_INTERVAL;
  spawnParticles(x, y, type.id === "leaf" ? "#b7df70" : type.id === "skeeters" ? "#ffb45d" : type.id === "cape" ? "#8b0000" : "#ffe38a");
  addScorePop(x, y, type.popName || type.name.toUpperCase(), "#f7f2bf");
  showToast(type.note);
  playSound(type.id === "cape" ? "cape" : "powerup");
}

function triggerCapeComicLaunch() {
  const launch = state.player.capeLaunch;
  launch.burst = 1;
  launch.lift = 30;
  launch.capeScale = 1.35;
  launch.streak = 1;
  spawnCapeSparkles(state.player.x, state.player.y, 32, 1.35);
  addScorePop(state.player.x, state.player.y - 50, "WHOOSH!", "#ffe56b", 24);
  state.reactions.push({ x:state.player.x, y:state.player.y-42, life:1.2, text:"SUPER SBS!", color:"#fff1bd", stars:true });
  if (window.gsap && !reducedMotionQuery.matches) {
    gsap.killTweensOf(launch);
    gsap.to(launch, { lift:0, capeScale:1, duration:.58, ease:"back.out(2.4)" });
    gsap.to(launch, { burst:0, streak:0, duration:.72, ease:"power2.out" });
  } else {
    launch.burst = .35;
    launch.lift = 0;
    launch.capeScale = 1;
    launch.streak = .25;
  }
}

function triggerSkeetersHeroMoment() {
  const hero = state.player.skeetersHero;
  hero.scale = .28;
  hero.lift = 22;
  hero.rotate = -.7;
  hero.glow = 0;
  spawnPizzaCrumbs(state.player.x + 20, state.player.y - 8, 24, 1.28);
  addScorePop(state.player.x, state.player.y - 42, "PIZZA BOX HERO!", "#fff0a8", 20);
  state.reactions.push({ x:state.player.x, y:state.player.y-46, life:1.15, text:"SKEETER'S!", color:"#fff1bd", stars:true });
  if (window.gsap && !reducedMotionQuery.matches) {
    gsap.killTweensOf(hero);
    gsap.to(hero, { scale:1, lift:0, rotate:-.12, duration:.52, ease:"back.out(2.6)" });
    gsap.to(hero, { glow:1, duration:.22, ease:"sine.out", yoyo:true, repeat:2 });
  } else {
    hero.scale = 1;
    hero.lift = 0;
    hero.rotate = -.12;
    hero.glow = .35;
  }
}

function choosePowerupType() {
  if (!state.powerupBag.length) state.powerupBag = makePowerupBag();
  const nextId = state.powerupBag.pop();
  return powerupTypes.find(type => type.id === nextId) || powerupTypes[0];
}

function makePowerupBag() {
  const bag = powerupTypes.flatMap(type => Array.from({ length:type.weight || 1 }, () => type.id));
  for (let i=bag.length-1; i>0; i--) {
    const j=Math.floor(Math.random()*(i+1));
    [bag[i],bag[j]]=[bag[j],bag[i]];
  }
  return bag;
}

function spawnGoldenAcorn() {
  const available = goldenSpots.filter(([x,y]) => distance(state.player, {x,y}) > 230);
  const [x,y] = available[Math.floor(Math.random() * available.length)];
  state.golden = { x, y, life:GOLDEN_ACORN_LIFETIME, introScale:.25, introGlow:0 };
  if(window.gsap&&!reducedMotionQuery.matches){
    gsap.to(state.golden,{introScale:1,duration:.58,ease:"back.out(2.6)"});
    gsap.to(state.golden,{introGlow:1,duration:.24,ease:"sine.out",yoyo:true,repeat:1});
  } else {
    state.golden.introScale=1;
  }
  showToast("Golden acorn spotted! Follow the pointer!");
  playTone(660, .08, "triangle"); playTone(880, .12, "triangle", .1);
}

function collectGoldenAcorn() {
  spawnParticles(state.golden.x, state.golden.y, "#ffe56b");
  state.score += GOLDEN_ACORN_VALUE;
  state.goldenCaught++;
  addScorePop(state.golden.x, state.golden.y, `+${GOLDEN_ACORN_VALUE} GOLDEN!`, "#fff08a", 24);
  extendCombo(2); state.flash=.5;
  state.golden = null;
  state.nextGoldenAt = state.elapsed + GOLDEN_ACORN_INTERVAL;
  state.nextGoldenAt -= Math.min(8,state.elapsed/36);
  showToast(`Golden acorn! +${GOLDEN_ACORN_VALUE} for the stash!`);
  state.reactions.push({ x:state.player.x, y:state.player.y-35, life:1.1, text:"GOLDEN!", color:"#fff4a8", stars:true });
  playSound("golden");
}

function collectSpill(acorn) {
  const points=getAcornValue();acorn.collected = true; state.score+=points;
  spawnParticles(acorn.x, acorn.y, "#f4c65f");
  addScorePop(acorn.x, acorn.y, `RECOVERED +${points}`, "#fff4b4", 17);
  extendCombo();
  playTone(620, .06, "triangle");
}

function bump(hazard) {
  state.player.invulnerable = 1.75;
  state.player.spin = hazard.type === "cart" || hazard.type === "bus" ? .95 : .55;
  state.shake = reducedMotionQuery.matches ? 0 : hazard.type === "cart" || hazard.type === "bus" ? .48 : .18;
  state.combo=0;state.comboWindow=0;
  const lost = state.score > 0 ? 1 : 0;
  state.score -= lost;
  if (lost) spillAcorn(hazard.type === "bike" ? 2 : 1);
  if(hazard.type==="cart")state.chuckCheckIns++;
  const reaction = hazard.type === "bus"
    ? { text:"BLUE BUS!", color:"#dff3ff", stars:true }
    : hazard.type === "cart"
    ? { text:"CHUCK!", color:"#ffe56b", stars:true }
    : hazard.type === "bike"
      ? { text:"Bike lane!", color:"#fff5da", stars:false }
      : { text:"Sorry, SBS!", color:"#fff5da", stars:false };
  state.reactions.push({ x:state.player.x, y:state.player.y-28, life:1.05, ...reaction });
  const label = hazard.type === "bus" ? "Blue Bus at Stokes Bay!" : hazard.type === "cart" ? "Chuck checked on SBS!" : hazard.type === "bike" ? "Bike lane surprise!" : "Student crossing!";
  showToast(`${label}${lost ? " Grab that runaway acorn!" : ""}`);
  spawnParticles(state.player.x, state.player.y, "#ffffff");
  playSound(hazard.type==="cart"||hazard.type==="bus" ? "wobble" : "bump");
}

function blockWithSkeetersPie(hazard) {
  state.activePowerups.skeeters = 0;
  state.activePowerups.skeetersBoost = 0;
  state.player.invulnerable = 1.1;
  state.player.spin = hazard.type === "cart" ? .45 : .25;
  state.shake = reducedMotionQuery.matches ? 0 : .16;
  state.skeetersBlocks++;
  spawnPizzaCrumbs(state.player.x, state.player.y);
  addScorePop(state.player.x, state.player.y-22, "PIZZA BOX BLOCK!", "#fff0a8", 19);
  showToast("Pizza box saved the stash!");
  state.reactions.push({ x:state.player.x, y:state.player.y-32, life:1.1, text:"SKEETER'S!", color:"#fff1bd", stars:true });
  playSound("shield");
}

function spillAcorn(count) {
  for (let i=0; i<count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const range = 42 + Math.random() * 35;
    state.spills.push({
      x:clamp(state.player.x + Math.cos(angle) * range, 28, WORLD.width - 28),
      y:clamp(state.player.y + Math.sin(angle) * range, 28, WORLD.height - 28),
      vx:Math.cos(angle)*(85+Math.random()*45),vy:Math.sin(angle)*(85+Math.random()*45),
      life:7.5, collected:false, spilled:true
    });
  }
}

function draw() {
  ctx.save();
  applyOpeningCamera();
  if(state.shake){const strength=state.shake*14;ctx.translate((Math.random()-.5)*strength,(Math.random()-.5)*strength);}
  if(state.mode === MODE_DINING_CENTER){
    drawDiningCenterZone();
  } else {
    drawCampus();
    drawAtmosphere();
    state.acorns.forEach(drawAcorn);
    state.hidden.forEach(drawHiddenAcorn);
    state.spills.forEach(drawSpilledAcorn);
    if (state.golden) drawGoldenAcorn(state.golden);
    if (state.powerup) drawPowerup(state.powerup);
    drawZoneMarkers();
    state.hazards.forEach(drawHazard);
    drawPlayer();
    state.particles.forEach(drawParticle);
    state.reactions.forEach(drawReaction);
    state.scorePops.forEach(drawScorePop);
    state.celebrations.forEach(drawCelebration);
    if (state.golden) drawGoldenPointer(state.golden);
    drawPowerupStatus();
    drawGuidance();
  }
  ctx.restore();
  if(state.flash){ctx.save();ctx.globalAlpha=state.flash*.42;ctx.fillStyle="#fff1a3";ctx.fillRect(0,0,WORLD.width,WORLD.height);ctx.restore();}
  if(state.landmarkPulse){ctx.save();ctx.globalAlpha=state.landmarkPulse*.14;ctx.fillStyle="#e6ffae";ctx.fillRect(0,0,WORLD.width,WORLD.height);ctx.restore();}
  if(state.finalScurry){ctx.save();ctx.globalAlpha=.035+.02*Math.sin(state.elapsed*6);ctx.fillStyle="#ef9c4d";ctx.fillRect(0,0,WORLD.width,WORLD.height);ctx.restore();}
}

function applyOpeningCamera() {
  if(state.mode === MODE_DINING_CENTER){applyDiningCenterCamera();return;}
  if(!state.introCamera){applyMobileCamera();return;}
  const progress=1-state.introCamera/state.introCameraDuration;
  const eased=1-Math.pow(1-progress,3);
  const startZoom=isMobileView()?Math.max(1.2,canvas.width/WORLD.width,canvas.height/WORLD.height):1.2;
  const endZoom=isMobileView()?getMobileZoom():1;
  const zoom=startZoom+(endZoom-startZoom)*eased;
  const focusX=955+(state.player.x-955)*eased;
  const focusY=420+(state.player.y-420)*eased;
  applyWorldCamera(focusX,focusY,zoom);
}

function isMobileView() {
  return mobileQuery.matches;
}

function getMobileZoom() {
  const preferred=window.innerHeight>window.innerWidth?1.04:.83;
  return Math.max(preferred,canvas.width/WORLD.width,canvas.height/WORLD.height);
}

function updateMobileCamera(dt) {
  if(!isMobileView())return;
  const ease=1-Math.exp(-7*dt);
  state.camera.x+=(state.player.x-state.camera.x)*ease;
  state.camera.y+=(state.player.y-state.camera.y)*ease;
}

function applyMobileCamera() {
  if(!isMobileView())return;
  const zoom=getMobileZoom();
  applyWorldCamera(state.camera.x,state.camera.y,zoom);
}

function applyWorldCamera(x,y,zoom) {
  const halfW=canvas.width/(2*zoom),halfH=canvas.height/(2*zoom);
  const world=getCurrentWorld();
  const focusX=clamp(x,halfW,world.width-halfW);
  const focusY=clamp(y,halfH,world.height-halfH);
  ctx.translate(canvas.width/2,canvas.height/2);
  ctx.scale(zoom,zoom);
  ctx.translate(-focusX,-focusY);
}

function applyDiningCenterCamera() {
  const zoom=isMobileView()?Math.max(.84,canvas.width/DINING_CENTER_ZONE.width,canvas.height/DINING_CENTER_ZONE.height):1;
  applyWorldCamera(state.camera.x,state.camera.y,zoom);
}

function resizeCanvasForViewport() {
  if(!isMobileView()){canvas.width=WORLD.width;canvas.height=WORLD.height;return;}
  const frame=document.getElementById("gameFrame"),ratio=frame.clientWidth/frame.clientHeight||1;
  canvas.width=1200;canvas.height=Math.round(1200/ratio);
}

async function requestMobileFullscreen(forceExpand=false) {
  if(!isMobileView())return;
  orientationGateEnabled=true;
  const root=document.documentElement;
  try{if(!document.fullscreenElement&&root.requestFullscreen)await root.requestFullscreen({navigationUI:"hide"});}catch{}
  try{if(screen.orientation?.lock)await screen.orientation.lock("landscape");}catch{}
  if(forceExpand||document.fullscreenElement)document.body.classList.add("mobile-play");
  showToast(document.fullscreenElement ? "Full screen enabled." : forceExpand ? "Expanded mobile view enabled." : "Rotate complete. Tap Expand for a bigger view.");
  refreshFullscreenButton();
  refreshOrientationGate();
  resizeCanvasForViewport();
}

function refreshFullscreenButton() {
  const expanded=Boolean(document.fullscreenElement)||document.body.classList.contains("mobile-play");
  document.getElementById("mobileFullscreenButton").classList.toggle("hidden",expanded);
}

function refreshOrientationGate() {
  const portrait=isMobileView()&&window.innerHeight>window.innerWidth;
  document.getElementById("orientationOverlay").classList.toggle("show",orientationGateEnabled&&portrait&&!portraitBypass);
}

function drawZoneMarkers() {
  const marker=DINING_CENTER_ZONE.marker,completed=state.progress.diningCenter.completed;
  const near=distance(state.player,marker)<marker.radius+24;
  const pulse=Math.sin(state.elapsed*5)*.5+.5;
  ctx.save();
  ctx.globalAlpha=.82;
  ctx.strokeStyle=completed?"#fff1bd":"#ffe56b";
  ctx.lineWidth=5+pulse*3;
  ctx.beginPath();ctx.arc(marker.x,marker.y,marker.radius+pulse*8,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=completed?"rgba(255,241,189,.28)":"rgba(255,229,107,.24)";
  ctx.beginPath();ctx.arc(marker.x,marker.y,marker.radius,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#fffdf6";roundRect(marker.x-77,marker.y-78,154,38,14);ctx.fill();
  ctx.strokeStyle="rgba(49,84,64,.35)";ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle="#315440";ctx.font="900 12px Nunito";ctx.textAlign="center";
  ctx.fillText(completed?"DC DASH CLEARED":"DINING CENTER DASH",marker.x,marker.y-54);
  if(near){
    ctx.fillStyle="#173c2d";roundRect(marker.x-128,marker.y+62,256,42,18);ctx.fill();
    ctx.fillStyle="#fff7d8";ctx.font="900 14px Nunito";ctx.fillText("Press Space / Enter to raid the DC",marker.x,marker.y+88);
  }
  ctx.textAlign="left";ctx.restore();
}

function drawDiningCenterZone() {
  drawDiningCenterRoom();
  DINING_CENTER_ZONE.counters.forEach(drawDiningCounter);
  DINING_CENTER_ZONE.tables.forEach(drawDiningTable);
  DINING_CENTER_ZONE.puddles.forEach(drawDiningPuddle);
  drawDiningExit();
  state.zone.snacks.forEach(drawDiningSnack);
  drawDiningCoffee(state.zone.coffee);
  drawDiningCookie(state.zone.cookie);
  state.zone.hazards.forEach(drawDiningHazard);
  drawPlayer();
  state.particles.forEach(drawParticle);
  state.reactions.forEach(drawReaction);
  state.scorePops.forEach(drawScorePop);
  drawDiningCenterObjective();
}

function drawDiningCenterRoom() {
  ctx.fillStyle="#dcc7a5";ctx.fillRect(0,0,DINING_CENTER_ZONE.width,DINING_CENTER_ZONE.height);
  ctx.fillStyle="rgba(255,253,246,.18)";
  for(let x=0;x<DINING_CENTER_ZONE.width;x+=80)ctx.fillRect(x,0,4,DINING_CENTER_ZONE.height);
  for(let y=0;y<DINING_CENTER_ZONE.height;y+=80)ctx.fillRect(0,y,DINING_CENTER_ZONE.width,4);
  ctx.fillStyle="#c9ad84";ctx.fillRect(0,0,DINING_CENTER_ZONE.width,62);ctx.fillRect(0,DINING_CENTER_ZONE.height-62,DINING_CENTER_ZONE.width,62);
  ctx.fillStyle="#a6815e";ctx.fillRect(0,0,58,DINING_CENTER_ZONE.height);ctx.fillRect(DINING_CENTER_ZONE.width-58,0,58,DINING_CENTER_ZONE.height);
  ctx.fillStyle="rgba(71,52,36,.13)";
  [[180,1340,360,42],[2050,1350,315,42],[120,95,440,32]].forEach(([x,y,w,h])=>{roundRect(x,y,w,h,12);ctx.fill();});
  ctx.fillStyle="#6a0000";ctx.font="900 28px Fraunces, Georgia";ctx.textAlign="left";ctx.fillText("DINING CENTER DASH",110,122);
  ctx.fillStyle="#5f4a35";ctx.font="900 15px Nunito";ctx.fillText("Snack mission in progress",112,150);
}

function drawDiningCounter(counter) {
  ctx.save();
  ctx.fillStyle="rgba(56,42,31,.22)";roundRect(counter.x+8,counter.y+10,counter.w,counter.h,10);ctx.fill();
  ctx.fillStyle="#a47d55";roundRect(counter.x,counter.y,counter.w,counter.h,10);ctx.fill();
  ctx.strokeStyle="#704f35";ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle="#f2dfbd";roundRect(counter.x+16,counter.y+18,counter.w-32,38,8);ctx.fill();
  ctx.fillStyle="#315440";ctx.font="900 15px Nunito";ctx.textAlign="center";ctx.fillText(counter.label,counter.x+counter.w/2,counter.y+43);
  ctx.fillStyle="#8fb36d";for(let x=counter.x+42;x<counter.x+counter.w-30;x+=78){ctx.beginPath();ctx.arc(x,counter.y+88,13,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawDiningTable(table) {
  ctx.save();
  ctx.fillStyle="rgba(56,42,31,.2)";roundRect(table.x+8,table.y+9,table.w,table.h,16);ctx.fill();
  ctx.fillStyle="#8f684d";roundRect(table.x,table.y,table.w,table.h,14);ctx.fill();
  ctx.strokeStyle="#5e3e2c";ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle="#b8895f";roundRect(table.x+16,table.y+15,table.w-32,table.h-30,10);ctx.fill();
  ctx.fillStyle="rgba(255,245,214,.5)";
  [[table.x+32,table.y+28],[table.x+table.w-44,table.y+table.h-32]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.fill();});
  ctx.restore();
}

function drawDiningPuddle(puddle) {
  ctx.save();ctx.translate(puddle.x,puddle.y);ctx.rotate(puddle.angle||0);
  ctx.fillStyle="rgba(150,198,220,.48)";ctx.beginPath();ctx.ellipse(0,0,puddle.rx,puddle.ry,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.45)";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,puddle.rx-12,puddle.ry-8,0,0,Math.PI*2);ctx.stroke();
  ctx.restore();
}

function drawDiningSnack(snack) {
  if(snack.collected)return;
  drawAcorn({ ...snack, chapterIndex:0, collected:false });
}

function drawDiningCookie(cookie) {
  if(cookie.collected)return;
  const pulse=1+Math.sin(state.elapsed*6)*.08;
  ctx.save();ctx.translate(cookie.x,cookie.y);ctx.scale(pulse,pulse);
  ctx.shadowColor="#ffe38a";ctx.shadowBlur=22;
  ctx.fillStyle="#c98745";ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle="#7b4b2d";ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle="#5a3525";[[-9,-8],[8,-3],[-2,10],[13,12]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#fff8d8";ctx.font="900 9px Nunito";ctx.textAlign="center";ctx.fillText("DC",0,4);ctx.restore();
}

function drawDiningCoffee(coffee) {
  if(coffee.collected)return;
  ctx.save();ctx.translate(coffee.x,coffee.y+Math.sin(state.elapsed*5)*3);
  ctx.shadowColor="#d4d07d";ctx.shadowBlur=18;
  ctx.fillStyle="#fff4d2";roundRect(-18,-20,36,34,8);ctx.fill();
  ctx.strokeStyle="#7a5132";ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle="#6b3d25";ctx.fillRect(-12,-13,24,9);
  ctx.strokeStyle="#fff4d2";ctx.lineWidth=4;ctx.beginPath();ctx.arc(20,-4,8,-Math.PI/2,Math.PI/2);ctx.stroke();
  ctx.shadowBlur=0;ctx.fillStyle="#315440";ctx.font="900 8px Nunito";ctx.textAlign="center";ctx.fillText("JAVA",0,8);ctx.restore();
}

function drawDiningExit() {
  const exit=DINING_CENTER_ZONE.exit,ready=state.zone.cookieCollected&&state.zone.snacksCollected>=DINING_CENTER_ZONE.requiredSnacks;
  const pulse=Math.sin(state.elapsed*5)*.5+.5;
  ctx.save();
  ctx.strokeStyle=ready?"#caff75":"rgba(255,253,246,.6)";
  ctx.lineWidth=ready?6+pulse*4:4;
  ctx.beginPath();ctx.arc(exit.x,exit.y,exit.radius+pulse*8,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=ready?"rgba(202,255,117,.26)":"rgba(255,253,246,.18)";
  ctx.beginPath();ctx.arc(exit.x,exit.y,exit.radius,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#315440";roundRect(exit.x-72,exit.y-18,144,36,16);ctx.fill();
  ctx.fillStyle="#fff7d8";ctx.font="900 15px Nunito";ctx.textAlign="center";ctx.fillText(ready?"ESCAPE!":"EXIT LOCKED",exit.x,exit.y+5);
  ctx.restore();
}

function drawDiningHazard(h) {
  ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.angle||0);
  if(h.type==="tray")drawSlidingTrayHazard();
  else drawDiningStudentHazard(h);
  ctx.restore();
}

function drawDiningStudentHazard(h) {
  ctx.save();ctx.rotate(-(h.angle||0));
  ctx.fillStyle="rgba(24,37,31,.22)";ctx.beginPath();ctx.ellipse(0,23,20,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=h.color;roundRect(-14,-9,28,32,8);ctx.fill();ctx.strokeStyle="#263930";ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle="#efc3a1";ctx.beginPath();ctx.arc(0,-20,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#503629";ctx.beginPath();ctx.arc(0,-23,10,Math.PI,0);ctx.fill();
  ctx.fillStyle="#d7d2c4";roundRect(-28,-2,56,22,5);ctx.fill();ctx.strokeStyle="#7a7f76";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#8fb36d";roundRect(-18,3,15,10,3);ctx.fill();ctx.fillStyle="#f6f0dc";roundRect(5,3,16,10,3);ctx.fill();
  ctx.restore();
}

function drawSlidingTrayHazard() {
  ctx.fillStyle="rgba(24,37,31,.24)";roundRect(-38,-16,76,32,8);ctx.fill();
  ctx.fillStyle="#d7d2c4";roundRect(-34,-20,68,40,7);ctx.fill();
  ctx.strokeStyle="#7a7f76";ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle="#f6f0dc";roundRect(-22,-10,20,14,3);ctx.fill();
  ctx.fillStyle="#b65b43";ctx.beginPath();ctx.arc(15,7,7,0,Math.PI*2);ctx.fill();
}

function drawDiningCenterObjective() {
  const x=state.camera.x-canvas.width/2+26,y=state.camera.y-canvas.height/2+24;
  ctx.save();
  ctx.fillStyle="rgba(255,253,246,.92)";roundRect(x,y,330,86,12);ctx.fill();
  ctx.strokeStyle="rgba(49,84,64,.28)";ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle="#6a0000";ctx.font="900 14px Nunito";ctx.fillText("Dining Center Dash",x+18,y+26);
  ctx.fillStyle="#315440";ctx.font="900 18px Nunito";ctx.fillText(`Snacks ${state.zone.snacksCollected}/${DINING_CENTER_ZONE.requiredSnacks} · Bonks ${state.zone.bonks}/${DINING_CENTER_ZONE.bonkLimit}`,x+18,y+52);
  ctx.fillStyle=state.zone.cookieCollected?"#315440":"#8a6b3f";ctx.font="900 13px Nunito";ctx.fillText(state.zone.cookieCollected?"Cookie secured. Find the exit.":"Grab the legendary DC Cookie.",x+18,y+73);
  ctx.restore();
}

function drawCampus() {
  ctx.fillStyle = "#91b77c"; ctx.fillRect(0,0,WORLD.width,WORLD.height);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  for (let x=30;x<WORLD.width;x+=52) for(let y=26;y<WORLD.height;y+=47) ctx.fillRect(x,y,3,3);
  ctx.strokeStyle="rgba(75,112,66,.16)";ctx.lineWidth=2;
  for(let x=18;x<WORLD.width;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-90,WORLD.height);ctx.stroke();}
  ctx.fillStyle = "#b7d29a"; ctx.beginPath(); ctx.ellipse(900,640,470,270,-.18,0,Math.PI*2); ctx.fill();
  drawBlueBusRoad();
  drawPond();
  paths.forEach(drawIllustratedPath);
  trees.forEach(([x,y,r,type]) => drawTree(x,y,r,type));
  landmarks.forEach(drawBuilding);
  drawCampusDetails();
  drawMapLabel(90,946,"DUCK POND",11);
  drawMapLabel(760,220,"STOKES BAY",12);
  drawMapLabel(760,914,"FOUNDERS GREEN",15);
  drawEasterEggs();
  ctx.fillStyle="#486e4e"; ctx.font="900 15px Nunito"; ctx.fillText("HAVERFORD COLLEGE", 48, 62);
  ctx.font="800 10px Nunito"; ctx.fillText("ARBORETUM CAMPUS • SBS TERRITORY", 48, 80);
  drawCompassRose(1510,84);
}

function drawPond() {
  ctx.fillStyle="rgba(49,82,76,.2)";ctx.beginPath();ctx.ellipse(177,909,132,70,-.18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#94bedd";ctx.beginPath();ctx.ellipse(170,900,125,67,-.18,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(230,245,232,.48)";ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(170,900,115,58,-.18,0,Math.PI*2);ctx.stroke();
}

function drawIllustratedPath(path) {
  ctx.lineCap="round";ctx.lineJoin="round";
  [["rgba(60,76,60,.2)",42],["#d4cbb4",34],["#ece4d3",23]].forEach(([color,width])=>{
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
    path.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  });
}

function drawBlueBusRoad() {
  const road=[[1585,238],[1320,238],[1110,248],[930,263],[760,243],[620,223],[520,220]];
  ctx.save();
  ctx.lineCap="round";ctx.lineJoin="round";
  [["rgba(23,44,53,.18)",58],["#7d8c8f",46],["#9ba8a7",34]].forEach(([color,width])=>{
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
    road.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  });
  ctx.strokeStyle="rgba(255,253,236,.7)";ctx.lineWidth=3;ctx.setLineDash([22,18]);ctx.beginPath();
  road.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle="rgba(255,253,246,.78)";roundRect(700,204,120,28,8);ctx.fill();
  ctx.strokeStyle="rgba(23,60,45,.35)";ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle="#173c2d";ctx.font="900 10px Nunito";ctx.textAlign="center";ctx.fillText("BLUE BUS STOP",760,222);ctx.textAlign="left";
  drawBusStopSign(682,236);
  ctx.restore();
}

function drawBusStopSign(x,y) {
  ctx.save();ctx.translate(x,y);
  ctx.strokeStyle="#2a4840";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,39);ctx.stroke();
  ctx.fillStyle="#0b6db6";roundRect(-19,-22,38,25,5);ctx.fill();
  ctx.fillStyle="#fffdf6";ctx.font="900 8px Nunito";ctx.textAlign="center";ctx.fillText("Bi-Co",0,-12);ctx.fillText("BUS",0,-3);ctx.restore();
}

function drawCompassRose(x,y) {
  ctx.save();ctx.translate(x,y);ctx.fillStyle="rgba(32,76,55,.52)";
  ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(7,-3);ctx.lineTo(0,2);ctx.lineTo(-7,-3);ctx.closePath();ctx.fill();
  ctx.font="900 11px Nunito";ctx.textAlign="center";ctx.fillText("N",0,-31);ctx.restore();
}

function drawBuilding(l) {
  const {x,y,w,h} = l;
  ctx.fillStyle="rgba(38,61,45,.25)"; roundRect(x+9,y+12,w,h,9); ctx.fill();
  ctx.fillStyle=l.type==="center" ? "#917d6b" : "#90745c"; roundRect(x,y,w,h,8); ctx.fill();
  ctx.fillStyle="#c8ad88"; roundRect(x+7,y+7,w-14,h-14,5); ctx.fill();
  ctx.strokeStyle="#806952"; ctx.lineWidth=4; ctx.stroke();
  ctx.strokeStyle="rgba(255,244,218,.58)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+10,y+11);ctx.lineTo(x+w-10,y+11);ctx.stroke();
  if(l.type==="founders"){
    ctx.fillStyle="#e7d9bd"; ctx.fillRect(x+16,y+29,w-32,89);
    drawStoneTexture(x+16,y+29,w-32,89);
    ctx.fillStyle="#87624d"; for(let i=0;i<8;i++) ctx.fillRect(x+27+i*39,y+50,15,32);
    ctx.fillStyle="#d5c09a"; ctx.fillRect(x+w/2-31,y-26,62,56); ctx.strokeRect(x+w/2-31,y-26,62,56);
    ctx.fillStyle="#edf0df"; for(let i=0;i<3;i++)ctx.fillRect(x+w/2-22+i*16,y-16,10,24);
    ctx.fillStyle="#5b5243";ctx.beginPath();ctx.moveTo(x+w/2-37,y-26);ctx.lineTo(x+w/2,y-47);ctx.lineTo(x+w/2+37,y-26);ctx.fill();
    ctx.fillStyle="#7e604c"; ctx.fillRect(x+w/2-8,y+91,16,27);
    ctx.fillStyle="#f0e4ca";ctx.fillRect(x+18,y+93,w-36,7);for(let i=0;i<10;i++)ctx.fillRect(x+22+i*31,y+98,5,20);
  } else if(l.id==="barclay"){
    drawStoneTexture(x+7,y+7,w-14,h-14);
    ctx.fillStyle="#665344";for(let i=0;i<5;i++)for(let j=0;j<2;j++)ctx.fillRect(x+24+i*43,y+25+j*39,14,20);
    ctx.fillStyle="#5f4b3d";ctx.fillRect(x+w/2-11,y+72,22,37);
    ctx.fillStyle="#6e5847";ctx.beginPath();ctx.moveTo(x,y+13);ctx.lineTo(x+w/2,y-17);ctx.lineTo(x+w,y+13);ctx.fill();
  } else if(l.id==="lloyd"){
    drawStoneTexture(x+7,y+7,w-14,h-14);
    ctx.fillStyle="#6a5546";for(let i=0;i<5;i++)for(let j=0;j<2;j++)ctx.fillRect(x+25+i*43,y+22+j*35,14,19);
    ctx.fillStyle="#5d493b";ctx.fillRect(x+w/2-10,y+60,20,38);
    ctx.fillStyle="#b69a78";ctx.fillRect(x+12,y+10,w-24,8);
  } else if(l.id==="dc"){
    drawStoneTexture(x+7,y+7,w-14,h-14);
    ctx.fillStyle="#765b48";ctx.fillRect(x+25,y+30,w-50,62);
    ctx.fillStyle="#d9d3b9";for(let i=0;i<6;i++)ctx.fillRect(x+34+i*29,y+38,15,44);
    ctx.fillStyle="#664938";ctx.fillRect(x+w/2-14,y+76,28,43);
  } else if(l.type==="center"){
    ctx.fillStyle="#a18c74";ctx.fillRect(x+13,y+15,w-26,h-30);
    ctx.fillStyle="#50696b";for(let i=0;i<6;i++)ctx.fillRect(x+25+i*40,y+28,24,50);
    ctx.fillStyle="#ddd1b4";ctx.fillRect(x+w/2-18,y+67,36,36);
  } else {
    ctx.fillStyle="#705849";
    const cols=Math.max(3,Math.floor(w/54));
    for(let i=0;i<cols;i++) for(let j=0;j<2;j++) ctx.fillRect(x+22+i*(w-44)/(cols-1)-7,y+25+j*42,15,20);
  }
  drawMapLabel(x+w/2,y+h+24,l.short,12);
}

function drawStoneTexture(x,y,w,h) {
  ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle="#7e6956";ctx.lineWidth=2;
  for(let row=0;row<h;row+=15){for(let col=(row/15%2)*10;col<w;col+=22){ctx.strokeRect(x+col,y+row,19,11);}}
  ctx.restore();
}

function drawTree(x,y,r,type) {
  if(type==="dogwood")return drawDogwoodTree(x,y,r);
  if(type==="tulip")return drawTulipPoplarTree(x,y,r);
  if(type==="sycamore")return drawSycamoreTree(x,y,r);
  if(type==="maple")return drawMapleTree(x,y,r);
  ctx.fillStyle="rgba(47,77,43,.22)"; ctx.beginPath(); ctx.ellipse(x+7,y+11,r*1.05,r*.66,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#6f563e";ctx.fillRect(x-4,y-4,8,r*.72);
  ctx.fillStyle="#416f46"; [[-.45,-.1],[.38,-.2],[0,.32],[0,-.42]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*.62,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#5f8a54"; ctx.beginPath();ctx.arc(x-r*.18,y-r*.3,r*.42,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(34,75,45,.52)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r*.76,0,Math.PI*2);ctx.stroke();
}

function drawDogwoodTree(x,y,r) {
  ctx.save();
  ctx.fillStyle="rgba(47,77,43,.18)";ctx.beginPath();ctx.ellipse(x+6,y+10,r*.9,r*.56,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#735a42";ctx.lineWidth=6;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(x,y+18);ctx.lineTo(x,y-8);ctx.moveTo(x,y-3);ctx.lineTo(x-r*.28,y-r*.2);ctx.moveTo(x,y-4);ctx.lineTo(x+r*.32,y-r*.18);ctx.stroke();
  [[-.34,-.18],[.28,-.22],[-.12,.2],[.2,.18],[0,-.38]].forEach(([dx,dy],i)=>{
    ctx.fillStyle=i%2?"#4f7f4b":"#5d9154";ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*.36,0,Math.PI*2);ctx.fill();
  });
  ctx.fillStyle="#fff5e8";
  for(let i=0;i<9;i++){const a=i*.72;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*r*.48,y+Math.sin(a)*r*.34,5,3,a,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle="#e6b7bf";ctx.beginPath();ctx.arc(x-r*.18,y-r*.15,4,0,Math.PI*2);ctx.arc(x+r*.24,y-r*.08,3.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawTulipPoplarTree(x,y,r) {
  ctx.save();
  ctx.fillStyle="rgba(47,77,43,.18)";ctx.beginPath();ctx.ellipse(x+7,y+12,r*.92,r*.58,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#7a5b3d";ctx.fillRect(x-5,y-5,10,r*.82);
  ctx.fillStyle="#4f7f3d";ctx.beginPath();ctx.ellipse(x,y-r*.05,r*.62,r*.92,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#6c9e4f";ctx.beginPath();ctx.ellipse(x-r*.18,y-r*.2,r*.43,r*.66,-.28,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#7eae55";ctx.beginPath();ctx.ellipse(x+r*.2,y-r*.15,r*.38,r*.58,.24,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(39,79,42,.55)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-r*.78);ctx.lineTo(x-r*.22,y-r*.2);ctx.lineTo(x,y+r*.55);ctx.lineTo(x+r*.22,y-r*.2);ctx.closePath();ctx.stroke();
  ctx.fillStyle="#f0c75f";
  [-.18,.18,0].forEach((dx,i)=>{ctx.beginPath();ctx.moveTo(x+dx*r,y-r*(.48-i*.18));ctx.lineTo(x+dx*r-5,y-r*(.34-i*.18));ctx.lineTo(x+dx*r+5,y-r*(.34-i*.18));ctx.closePath();ctx.fill();});
  ctx.restore();
}

function drawSycamoreTree(x,y,r) {
  ctx.save();
  ctx.fillStyle="rgba(47,77,43,.2)";ctx.beginPath();ctx.ellipse(x+8,y+13,r*1.08,r*.66,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#d9d1bd";ctx.lineWidth=9;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(x,y+24);ctx.lineTo(x,y-12);ctx.moveTo(x,y-3);ctx.lineTo(x-r*.22,y-r*.34);ctx.moveTo(x+1,y-5);ctx.lineTo(x+r*.26,y-r*.32);ctx.stroke();
  ctx.strokeStyle="#816b51";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-4,y+10);ctx.lineTo(x+4,y+2);ctx.moveTo(x-5,y-6);ctx.lineTo(x+5,y-12);ctx.stroke();
  [[-.36,-.16],[.33,-.18],[0,-.38],[-.1,.22],[.25,.18]].forEach(([dx,dy],i)=>{
    ctx.fillStyle=i%2?"#668e54":"#547f49";ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*.46,0,Math.PI*2);ctx.fill();
  });
  ctx.strokeStyle="rgba(42,78,45,.48)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r*.78,0,Math.PI*2);ctx.stroke();
  ctx.restore();
}

function drawMapleTree(x,y,r) {
  ctx.save();
  ctx.fillStyle="rgba(76,43,35,.16)";ctx.beginPath();ctx.ellipse(x+7,y+12,r*.94,r*.54,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#5d3329";ctx.lineWidth=5;ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(x,y+22);ctx.lineTo(x,y-4);
  ctx.moveTo(x,y-1);ctx.quadraticCurveTo(x-r*.22,y-r*.14,x-r*.48,y-r*.22);
  ctx.moveTo(x,y-3);ctx.quadraticCurveTo(x+r*.22,y-r*.15,x+r*.48,y-r*.24);
  ctx.moveTo(x-1,y-8);ctx.quadraticCurveTo(x-r*.12,y-r*.28,x-r*.28,y-r*.4);
  ctx.moveTo(x+1,y-8);ctx.quadraticCurveTo(x+r*.12,y-r*.3,x+r*.3,y-r*.42);
  ctx.stroke();
  [
    [-.42,-.3,"#7e2730",1.05],[-.28,-.45,"#96313a",.92],[-.08,-.52,"#a9433f",1],
    [.18,-.48,"#8d2d38",.95],[.42,-.3,"#6f2430",1.05],[.3,-.12,"#9e3b39",.9],
    [-.32,-.08,"#8a2d35",.95],[-.04,-.19,"#b24d42",1.08],[.08,-.32,"#7c2832",.88]
  ].forEach(([dx,dy,color,scale],i)=>drawJapaneseMapleCluster(x+dx*r,y+dy*r,r*.2*scale,color,i*.8));
  ctx.strokeStyle="rgba(91,42,35,.45)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-r*.21,r*.62,Math.PI*.08,Math.PI*.92);ctx.stroke();
  ctx.restore();
}

function drawJapaneseMapleCluster(x,y,size,color,phase=0) {
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(phase)*.2);
  ctx.fillStyle=color;
  ctx.beginPath();ctx.ellipse(0,0,size*1.05,size*.72,-.16,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,160,126,.16)";
  ctx.beginPath();ctx.ellipse(-size*.28,-size*.16,size*.42,size*.25,-.3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(75,34,31,.34)";ctx.lineWidth=2;ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(-size*.72,0);ctx.lineTo(size*.72,0);
  ctx.moveTo(-size*.28,size*.45);ctx.lineTo(size*.18,-size*.48);
  ctx.moveTo(size*.28,size*.42);ctx.lineTo(-size*.12,-size*.46);
  ctx.stroke();
  ctx.restore();
}

function drawCampusDetails() {
  [[488,390],[744,442],[1005,705],[1180,630],[1370,640]].forEach(([x,y])=>drawLamp(x,y));
  [[248,304],[1190,598],[1095,870]].forEach(([x,y])=>drawFlowerBed(x,y));
  drawWaitingStudents();
}

function drawWaitingStudents() {
  [[735,232,"#5d78a7"],[790,236,"#cf704d"],[815,246,"#e0a539"]].forEach(([x,y,color],i)=>{
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle="rgba(24,37,31,.18)";ctx.beginPath();ctx.ellipse(0,19,11,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=color;roundRect(-7,-5,14,19,5);ctx.fill();
    ctx.fillStyle=i===1?"#8c5f45":"#efc3a1";ctx.beginPath();ctx.arc(0,-12,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#28342f";roundRect(7,-2,6,13,3);ctx.fill();
    ctx.restore();
  });
}

function drawLawnChair(x,y) {
  ctx.save();ctx.translate(x,y);ctx.strokeStyle="#ba523f";ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(-13,-12);ctx.lineTo(0,4);ctx.lineTo(14,-12);ctx.moveTo(0,4);ctx.lineTo(-15,18);ctx.moveTo(0,4);ctx.lineTo(16,18);ctx.moveTo(-10,9);ctx.lineTo(11,9);ctx.stroke();ctx.restore();
}

function drawLamp(x,y) {
  ctx.fillStyle="#334b42";ctx.fillRect(x-3,y-21,6,23);ctx.beginPath();ctx.arc(x,y-24,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#fff0ad";ctx.beginPath();ctx.arc(x,y-24,4,0,Math.PI*2);ctx.fill();
}

function drawFlowerBed(x,y) {
  ctx.fillStyle="#6d8b58";ctx.beginPath();ctx.ellipse(x,y,42,15,0,0,Math.PI*2);ctx.fill();
  ["#e99bb0","#d7b06a","#f1d4df"].forEach((color,i)=>{ctx.fillStyle=color;for(let j=0;j<7;j++){ctx.beginPath();ctx.arc(x-29+j*10,y-6+(j+i)%3*5,3,0,Math.PI*2);ctx.fill();}});
}

function drawAcorn(a) {
  if(a.collected||a.chapterIndex>state.chapterIndex) return;
  const bob=Math.sin(state.elapsed*5+a.x)*4;
  const upcoming=state.acorns.filter(acorn=>acorn.chapterIndex===state.chapterIndex&&!acorn.collected).slice(0,4).includes(a);
  ctx.save();ctx.translate(a.x,a.y+bob);ctx.rotate(-.35);
  ctx.shadowColor=upcoming?"#fff09b":"#ffe59a";ctx.shadowBlur=upcoming?22:14;ctx.fillStyle=upcoming?"#cc812c":"#b96e22";ctx.beginPath();ctx.ellipse(0,5,9,13,0,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle="#704426";ctx.fillRect(-9,-6,18,7);ctx.fillRect(2,-13,3,8);ctx.restore();
  if(upcoming){ctx.save();ctx.globalAlpha=.25+.14*Math.sin(state.elapsed*6+(a.spotIndex||0));ctx.strokeStyle="#fff1a4";ctx.lineWidth=3;ctx.beginPath();ctx.arc(a.x,a.y+bob,18,0,Math.PI*2);ctx.stroke();ctx.restore();}
}

function drawSpilledAcorn(a) {
  if (a.collected) return;
  ctx.save();
  ctx.globalAlpha = a.life < 2 ? .45 + .45 * Math.abs(Math.sin(state.elapsed * 10)) : 1;
  ctx.strokeStyle="rgba(255,244,168,.52)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(a.x,a.y,19+Math.sin(state.elapsed*7)*4,0,Math.PI*2);ctx.stroke();
  drawAcorn(a);
  ctx.restore();
}

function drawGoldenAcorn(a) {
  const pulse = 1 + Math.sin(state.elapsed * 7) * .12;
  const introScale=a.introScale??1,introGlow=a.introGlow??0;
  ctx.save();ctx.translate(a.x,a.y);ctx.scale(pulse*introScale,pulse*introScale);ctx.rotate(-.35);
  ctx.shadowColor="#fff08a";ctx.shadowBlur=28+introGlow*36;ctx.fillStyle="#f4c94f";ctx.beginPath();ctx.ellipse(0,6,17,23,0,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle="#a96d21";ctx.fillRect(-17,-7,34,10);ctx.fillRect(4,-20,5,14);
  ctx.fillStyle="#fff5a9";ctx.beginPath();ctx.ellipse(-6,1,4,8,-.35,0,Math.PI*2);ctx.fill();ctx.restore();
  if(introGlow>0){
    ctx.save();ctx.globalAlpha=introGlow*.5;ctx.strokeStyle="#fff3a5";ctx.lineWidth=4;ctx.beginPath();ctx.arc(a.x,a.y,30+introGlow*24,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
}

function drawHiddenAcorn(a) {
  if(a.collected) return;
  const near=distance(state.player,a)<145;
  const revealed=state.activePowerups.leaf>0;
  const revealGlow=a.revealGlow??0,revealLift=a.revealLift??0;
  const alpha=revealed ? .95 : near ? .72+.16*Math.sin(state.elapsed*5) : .32+.1*Math.sin(state.elapsed*3);
  ctx.save();ctx.globalAlpha=alpha;
  drawSecretSparkles(a.x,a.y,near||revealed,revealGlow);
  if(near||revealed)drawSecretObject(a);
  if(revealGlow>0){
    ctx.save();ctx.globalAlpha=revealGlow*.45;ctx.strokeStyle="#fff3a5";ctx.lineWidth=4;ctx.beginPath();ctx.arc(a.x,a.y-revealLift,34+revealGlow*18,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  if(near){
    ctx.fillStyle="#fff8c7";ctx.strokeStyle="rgba(38,60,43,.65)";ctx.lineWidth=3;ctx.font="900 12px Nunito";ctx.textAlign="center";
    ctx.strokeText(a.label.toUpperCase(),a.x,a.y-34-revealLift);ctx.fillText(a.label.toUpperCase(),a.x,a.y-34-revealLift);
  }
  ctx.restore();
}

function drawSecretSparkles(x,y,strong=false,boost=0) {
  const count=strong?7:4, radius=(strong?28:18)+boost*10;
  ctx.fillStyle=strong?"#fff0a0":"#fff5bd";
  for(let i=0;i<count;i++){
    const angle=state.elapsed*1.8+i*Math.PI*2/count, twinkle=.65+.35*Math.sin(state.elapsed*5+i);
    const sx=x+Math.cos(angle)*radius, sy=y+Math.sin(angle*1.15)*radius*.58;
    ctx.globalAlpha*=twinkle;
    ctx.fillRect(sx-2,sy-2,4,4);
    ctx.globalAlpha/=twinkle;
  }
}

function drawSecretObject(a) {
  const scale=a.revealScale??1,lift=a.revealLift??0;
  ctx.save();ctx.translate(a.x,a.y+Math.sin(state.elapsed*4)*2-lift);ctx.scale(scale,scale);
  ctx.fillStyle="rgba(30,48,34,.2)";ctx.beginPath();ctx.ellipse(0,17,22,7,0,0,Math.PI*2);ctx.fill();
  if(a.object==="tray")drawSecretTray();
  else if(a.object==="key")drawSecretKey();
  else if(a.object==="cupola")drawSecretCupola();
  else if(a.object==="stone")drawSecretStone();
  else drawSecretMail();
  ctx.restore();
}

function drawSecretTray() {
  ctx.fillStyle="#d7d2c4";roundRect(-21,-12,42,27,5);ctx.fill();
  ctx.strokeStyle="#7a7f76";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#f6f0dc";roundRect(-14,-7,15,10,3);ctx.fill();
  ctx.fillStyle="#8fb36d";roundRect(5,-7,10,10,3);ctx.fill();
  ctx.fillStyle="#b65b43";ctx.beginPath();ctx.arc(-8,8,4,0,Math.PI*2);ctx.fill();
}

function drawSecretKey() {
  ctx.strokeStyle="#f2d06c";ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-4,1);ctx.lineTo(20,1);ctx.stroke();
  ctx.fillStyle="#f8df85";ctx.beginPath();ctx.arc(-10,1,10,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#8b6a2f";ctx.lineWidth=3;ctx.beginPath();ctx.arc(-10,1,5,0,Math.PI*2);ctx.moveTo(14,1);ctx.lineTo(14,10);ctx.moveTo(20,1);ctx.lineTo(20,8);ctx.stroke();
}

function drawSecretCupola() {
  ctx.fillStyle="#f1dfbc";roundRect(-14,-2,28,19,3);ctx.fill();
  ctx.strokeStyle="#7b604d";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#5b5243";ctx.beginPath();ctx.moveTo(-18,-2);ctx.lineTo(0,-20);ctx.lineTo(18,-2);ctx.closePath();ctx.fill();
  ctx.fillStyle="#7c5748";[-7,0,7].forEach(x=>ctx.fillRect(x-2,5,4,12));
}

function drawSecretStone() {
  ctx.fillStyle="#cbb898";roundRect(-18,-10,36,27,5);ctx.fill();
  ctx.strokeStyle="#7d6a52";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#7d6a52";ctx.font="900 10px Nunito";ctx.textAlign="center";ctx.fillText("1877",0,5);
}

function drawSecretMail() {
  ctx.fillStyle="#f8edcf";roundRect(-19,-11,38,25,3);ctx.fill();
  ctx.strokeStyle="#af8e5b";ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-19,-11);ctx.lineTo(0,2);ctx.lineTo(19,-11);ctx.moveTo(-19,14);ctx.lineTo(-2,1);ctx.moveTo(19,14);ctx.lineTo(2,1);ctx.stroke();
}

function drawPowerup(p) {
  const bob=Math.sin(state.elapsed*5+p.x)*5;
  ctx.save();ctx.translate(p.x,p.y+bob);
  drawPowerupRing(p.type.id);
  if(p.type.id==="soup")drawSoupPowerup();
  else if(p.type.id==="leaf")drawLeafPowerup();
  else if(p.type.id==="scroll")drawScrollPowerup();
  else if(p.type.id==="skeeters")drawSkeetersPiePowerup();
  else drawCapePowerup();
  ctx.restore();
}

function drawPowerupRing(type) {
  const pulse=Math.sin(state.elapsed*6);
  const colors={soup:"#d4d07d",leaf:"#caff75",scroll:"#bde8ff",skeeters:"#ffb45d",cape:"#8b0000"};
  ctx.save();ctx.globalAlpha=.42+.12*pulse;ctx.strokeStyle=colors[type]||"#fff5a6";ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(0,2,30+pulse*3,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=.2;ctx.fillStyle=colors[type]||"#fff5a6";ctx.beginPath();ctx.arc(0,2,35,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawSoupPowerup() {
  ctx.save();ctx.rotate(Math.sin(state.elapsed*4)*.05);ctx.shadowColor="#d4d07d";ctx.shadowBlur=20;
  ctx.strokeStyle="rgba(95,78,45,.45)";ctx.lineWidth=4;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-31,9);ctx.lineTo(-47,9);ctx.moveTo(-29,18);ctx.lineTo(-42,18);ctx.stroke();
  ctx.fillStyle="#7f7449";ctx.beginPath();ctx.ellipse(0,9,26,13,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#b8a166";ctx.beginPath();ctx.ellipse(0,2,28,17,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#6f5a33";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#d8c474";ctx.beginPath();ctx.ellipse(0,0,21,10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#7b7244";for(let i=0;i<4;i++){const x=-12+i*8,y=-1+Math.sin(i)*3;ctx.beginPath();ctx.ellipse(x,y,5,3,.25,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle="#5d6d43";ctx.beginPath();ctx.arc(9,2,3,0,Math.PI*2);ctx.arc(-5,4,2.4,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle="rgba(255,248,202,.82)";ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-12+i*12,-15);ctx.bezierCurveTo(-19+i*12,-24,-6+i*12,-26,-12+i*12,-34);ctx.stroke();}
  ctx.fillStyle="#fff7d0";ctx.font="900 7px Nunito";ctx.textAlign="center";ctx.fillText("DC",0,8);ctx.textAlign="left";ctx.restore();
}

function drawLeafPowerup() {
  ctx.save();ctx.shadowColor="#caff75";ctx.shadowBlur=20;
  const pulse=Math.sin(state.elapsed*5);
  ctx.strokeStyle="rgba(202,255,117,.58)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,1,22+pulse*3,-.7,.7);ctx.stroke();
  ctx.fillStyle="#75a94e";ctx.beginPath();ctx.ellipse(0,0,16,27,-.66,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#91c957";ctx.beginPath();ctx.ellipse(-4,-3,10,22,-.66,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle="#e0ef9b";ctx.lineWidth=3;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-14,17);ctx.lineTo(15,-19);ctx.moveTo(-4,5);ctx.lineTo(-15,0);ctx.moveTo(3,-4);ctx.lineTo(14,-5);ctx.stroke();
  ctx.fillStyle="#f0ffd2";for(let i=0;i<4;i++){const a=state.elapsed*2+i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*27,Math.sin(a)*18,2.3,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawScrollPowerup() {
  ctx.save();ctx.shadowColor="#bde8ff";ctx.shadowBlur=20;
  ctx.fillStyle="rgba(132,187,214,.3)";ctx.beginPath();ctx.moveTo(0,-31);ctx.lineTo(26,-18);ctx.lineTo(22,16);ctx.lineTo(0,31);ctx.lineTo(-22,16);ctx.lineTo(-26,-18);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#d7f0ff";ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle="#e6cf91";ctx.beginPath();ctx.ellipse(-15,-16,7,5,0,0,Math.PI*2);ctx.ellipse(15,16,7,5,0,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle="#f1dfaa";roundRect(-17,-20,34,40,5);ctx.fill();ctx.strokeStyle="#a98245";ctx.lineWidth=3;ctx.stroke();
  ctx.strokeStyle="#8c6a34";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-11,-9);ctx.lineTo(11,-9);ctx.moveTo(-11,10);ctx.lineTo(11,10);ctx.stroke();
  ctx.fillStyle="#315440";ctx.font="900 15px Nunito";ctx.textAlign="center";ctx.fillText("HC",0,5);ctx.textAlign="left";
  ctx.strokeStyle="rgba(255,240,160,.78)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.stroke();ctx.restore();
}

function drawSkeetersPiePowerup() {
  ctx.save();ctx.rotate(Math.sin(state.elapsed*4)*.08);ctx.shadowColor="#ffb45d";ctx.shadowBlur=18;
  ctx.fillStyle="#fff0c2";roundRect(-24,12,48,13,4);ctx.fill();
  ctx.strokeStyle="#a7502a";ctx.lineWidth=2;ctx.stroke();
  ctx.shadowBlur=0;ctx.fillStyle="#7d3e24";ctx.font="900 6px Nunito";ctx.textAlign="center";ctx.fillText("SKEETER'S",0,21);

  ctx.fillStyle="#b56b2b";ctx.beginPath();ctx.arc(0,-4,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f7c95b";ctx.beginPath();ctx.arc(0,-4,20,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#cf5d37";ctx.beginPath();ctx.arc(0,-4,15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#ffd86b";ctx.beginPath();ctx.arc(0,-4,17,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(124,64,28,.35)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(0,-21);ctx.moveTo(0,-4);ctx.lineTo(16,3);ctx.moveTo(0,-4);ctx.lineTo(-15,4);ctx.stroke();
  ctx.fillStyle="#b94234";[[7,-14],[-9,-10],[12,-1],[-5,6],[1,-3]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,3.3,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#fff1a8";[[-3,-15],[9,7],[-13,0]].forEach(([x,y])=>{ctx.beginPath();ctx.ellipse(x,y,2.7,1.4,.35,0,Math.PI*2);ctx.fill();});
  ctx.restore();
}

function drawCapePowerup() {
  const flutter=Math.sin(state.elapsed*6)*2;
  ctx.save();ctx.rotate(Math.sin(state.elapsed*4)*.07);ctx.shadowColor="#ffdf69";ctx.shadowBlur=20;
  ctx.fillStyle="rgba(255,229,107,.2)";ctx.beginPath();ctx.arc(0,1,28,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle="#8b0000";ctx.beginPath();
  ctx.moveTo(-8,-24);ctx.bezierCurveTo(8,-26,22,-14,18,4+flutter);
  ctx.bezierCurveTo(13,24,-8,26,-20,9);ctx.bezierCurveTo(-13,3,-15,-13,-8,-24);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle="#7a2e25";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#a51c30";ctx.beginPath();
  ctx.moveTo(-5,-19);ctx.bezierCurveTo(8,-18,15,-8,12,4+flutter*.5);
  ctx.bezierCurveTo(7,15,-7,17,-14,6);ctx.bezierCurveTo(-10,0,-11,-11,-5,-19);
  ctx.closePath();ctx.fill();
  ctx.fillStyle="#fff1bd";ctx.beginPath();ctx.arc(0,-1,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#8b0000";ctx.font="900 14px Lato";ctx.textAlign="center";ctx.fillText("S",0,4);
  ctx.fillStyle="#ffe56b";for(let i=0;i<4;i++){const a=state.elapsed*2+i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*28,Math.sin(a)*22,2.4,0,Math.PI*2);ctx.fill();}
  ctx.textAlign="left";ctx.restore();
}

function drawHazard(h) {
  if(h.type==="bus") {
    drawBlueBus(h);
    return;
  }
  ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.angle || 0);
  ctx.fillStyle="rgba(31,47,39,.18)";ctx.beginPath();ctx.ellipse(2,h.type==="bus"?34:h.type==="cart"?21:15,h.type==="bus"?140:h.type==="cart"?34:21,h.type==="bus"?18:h.type==="cart"?10:7,0,0,Math.PI*2);ctx.fill();
  if(h.type==="student") {
    drawStudentHazard(h);
  } else if(h.type==="bike") {
    drawBikeHazard(h);
  } else {
    drawCartHazard(h);
  }
  ctx.restore();
}

function drawBlueBus(h) {
  const facingLeft=Math.cos(h.angle||0)<0;
  ctx.save();
  ctx.translate(h.x,h.y);
  ctx.rotate(facingLeft ? (h.angle||0)-Math.PI : (h.angle||0));
  ctx.fillStyle="rgba(31,47,39,.18)";ctx.beginPath();ctx.ellipse(2,34,140,18,0,0,Math.PI*2);ctx.fill();
  drawBlueBusHazard(h,facingLeft);
  ctx.restore();
}

function drawBlueBusHazard(h,facingLeft=false) {
  const w=h.w,hgt=h.h,doorOpen=h.doorsOpen;
  const redX=facingLeft?w/2-87:-w/2+5,blueX=facingLeft?-w/2+5:-w/2+86,blueW=w-92;
  const doorX=facingLeft?-w/2+10:w/2-38,doorLightX=facingLeft?-w/2+34:w/2-50;
  const haverfordX=facingLeft?84:-84,brynMawrX=facingLeft?-53:53;
  ctx.save();
  ctx.translate(0,-8);
  ctx.fillStyle="rgba(6,18,31,.35)";roundRect(-w/2+4,-hgt/2+12,w,58,12);ctx.fill();
  ctx.fillStyle="#071827";roundRect(-w/2,-hgt/2,w,hgt,13);ctx.fill();
  ctx.fillStyle="#c51f33";roundRect(redX,-hgt/2+5,82,hgt-10,8);ctx.fill();
  ctx.fillStyle="#0067b8";roundRect(blueX,-hgt/2+5,blueW,hgt-10,8);ctx.fill();
  ctx.fillStyle="#edf2f5";ctx.beginPath();ctx.moveTo(-43,-hgt/2+5);ctx.lineTo(32,hgt/2-5);ctx.lineTo(11,hgt/2-5);ctx.lineTo(-65,-hgt/2+5);ctx.closePath();ctx.fill();
  ctx.fillStyle="#0d74bd";ctx.beginPath();ctx.moveTo(-12,-hgt/2+5);ctx.lineTo(63,hgt/2-5);ctx.lineTo(50,hgt/2-5);ctx.lineTo(-26,-hgt/2+5);ctx.closePath();ctx.fill();
  ctx.fillStyle="#f6f8fa";ctx.beginPath();ctx.moveTo(14,-hgt/2+5);ctx.lineTo(89,hgt/2-5);ctx.lineTo(79,hgt/2-5);ctx.lineTo(3,-hgt/2+5);ctx.closePath();ctx.fill();
  ctx.fillStyle="#09253d";roundRect(-w/2+12,-hgt/2+9,w-34,25,5);ctx.fill();
  for(let x=-91;x<=74;x+=38){ctx.fillStyle="#12334d";roundRect(x,-hgt/2+13,27,18,3);ctx.fill();ctx.fillStyle="rgba(83,192,255,.45)";ctx.fillRect(x+4,-hgt/2+16,15,3);}
  ctx.fillStyle="#06121f";roundRect(doorX,-hgt/2+10,28,51,5);ctx.fill();
  if(doorOpen){
    ctx.fillStyle="#dff3ff";roundRect(doorLightX,-hgt/2+18,16,40,4);ctx.fill();
    ctx.fillStyle="rgba(223,243,255,.22)";ctx.beginPath();ctx.ellipse(doorLightX+4,30,35,11,0,0,Math.PI*2);ctx.fill();
  } else {
    ctx.strokeStyle="#5fc0ff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(doorX+7,-hgt/2+17);ctx.lineTo(doorX+7,hgt/2-9);ctx.stroke();
  }
  ctx.fillStyle="#fff9ee";ctx.font="900 18px Georgia";ctx.textAlign="center";ctx.fillText("HAVERFORD",haverfordX,10);
  ctx.font="900 12px Georgia";ctx.fillText("COLLEGE",haverfordX,25);
  ctx.font="900 18px Georgia";ctx.fillText("BRYN MAWR",brynMawrX,8);
  ctx.font="900 10px Georgia";ctx.fillText("COLLEGE",brynMawrX,23);ctx.textAlign="left";
  drawBusWheel(-75,31);drawBusWheel(88,31);
  ctx.fillStyle="#ffd46a";ctx.fillRect(facingLeft?w/2-18:-w/2+7,4,11,7);
  ctx.fillStyle="#f6fbff";ctx.fillRect(facingLeft?-w/2+3:w/2-9,5,11,8);
  if(doorOpen){
    ctx.fillStyle="#173c2d";ctx.font="900 10px Nunito";ctx.textAlign="center";ctx.fillText("STOKES BAY",0,-47);ctx.textAlign="left";
  }
  ctx.restore();
}

function drawBusWheel(x,y) {
  ctx.fillStyle="#050608";ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#20262c";ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#59616a";ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();
}

function drawStudentHazard(h) {
  const step=Math.sin(state.elapsed*9+h.offset)*4;
  ctx.strokeStyle="rgba(35,47,39,.72)";ctx.lineWidth=7;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-6,15);ctx.lineTo(-10,27+step);ctx.moveTo(6,15);ctx.lineTo(11,27-step);ctx.stroke();
  ctx.fillStyle="#f1dfaa";ctx.beginPath();ctx.arc(-10,30+step,4,0,Math.PI*2);ctx.arc(11,30-step,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(24,37,31,.28)";roundRect(-15,-11,30,31,8);ctx.fill();
  if(h.style==="backpack"){ctx.fillStyle="#35463e";roundRect(-18,-6,11,22,5);ctx.fill();ctx.fillStyle="#c7d0b5";ctx.fillRect(-15,-1,5,12);}
  ctx.fillStyle=h.color;roundRect(-12,-10,24,29,7);ctx.fill();ctx.strokeStyle="#263930";ctx.lineWidth=2;ctx.stroke();
  if(h.style==="hoodie"){ctx.strokeStyle=h.color;ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,-15,12,Math.PI,0);ctx.stroke();ctx.fillStyle="#f3e3c3";ctx.fillRect(-3,0,6,7);ctx.strokeStyle="#fff3cf";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-4,-5);ctx.lineTo(-7,3);ctx.moveTo(4,-5);ctx.lineTo(7,3);ctx.stroke();}
  if(h.style==="books"){ctx.fillStyle="#eee1b9";roundRect(8,-2,14,7,2);ctx.fill();ctx.fillStyle="#8d5443";roundRect(9,5,13,7,2);ctx.fill();ctx.strokeStyle="#5b4334";ctx.lineWidth=1.5;ctx.strokeRect(8,-2,14,7);ctx.strokeRect(9,5,13,7);}
  ctx.fillStyle=h.skin;ctx.beginPath();ctx.arc(0,-18,9,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=h.hair;ctx.beginPath();ctx.arc(0,-21,9,Math.PI,0);ctx.fill();
  ctx.fillStyle="#24322d";ctx.beginPath();ctx.arc(-3,-18,1.4,0,Math.PI*2);ctx.arc(4,-18,1.4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#f3e3c3";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-18,10+step*.25);ctx.moveTo(11,0);ctx.lineTo(18,9-step*.25);ctx.stroke();
}

function drawBikeHazard(h) {
  const wheelSpin=state.elapsed*10+h.offset;
  ctx.strokeStyle="rgba(20,34,29,.5)";ctx.lineWidth=7;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-42,2);ctx.lineTo(-59,2);ctx.moveTo(-38,13);ctx.lineTo(-54,13);ctx.stroke();
  [-17,17].forEach((x,i)=>{
    ctx.strokeStyle="#1c2b27";ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,8,13,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle="rgba(245,249,225,.7)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,8);ctx.lineTo(x+Math.cos(wheelSpin+i)*11,8+Math.sin(wheelSpin+i)*11);ctx.moveTo(x,8);ctx.lineTo(x+Math.cos(wheelSpin+i+Math.PI)*11,8+Math.sin(wheelSpin+i+Math.PI)*11);ctx.stroke();
  });
  ctx.strokeStyle=h.frame;ctx.lineWidth=5;ctx.lineJoin="round";ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-17,8);ctx.lineTo(-3,-9);ctx.lineTo(17,8);ctx.lineTo(-2,8);ctx.lineTo(-17,8);ctx.moveTo(-3,-9);ctx.lineTo(7,-20);ctx.moveTo(-6,-13);ctx.lineTo(-15,-14);ctx.stroke();
  ctx.fillStyle=h.color;roundRect(-10,-30,20,18,6);ctx.fill();ctx.strokeStyle="#20342f";ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=h.skin;ctx.beginPath();ctx.arc(1,-37,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=h.hair;ctx.beginPath();ctx.arc(1,-40,8,Math.PI,0);ctx.fill();
  if(h.style==="helmet"){ctx.fillStyle="#f2bf4c";ctx.beginPath();ctx.arc(1,-40,9,Math.PI,0);ctx.fill();ctx.fillStyle="#fff2a8";ctx.fillRect(-4,-45,9,2);}
  if(h.style==="basket"){ctx.strokeStyle="#9a744e";ctx.lineWidth=3;ctx.strokeRect(17,-5,15,11);ctx.beginPath();ctx.moveTo(18,-1);ctx.lineTo(31,-1);ctx.moveTo(22,-5);ctx.lineTo(22,6);ctx.moveTo(27,-5);ctx.lineTo(27,6);ctx.stroke();}
}

function drawCartHazard(h) {
  const beaconPulse=.75+.25*Math.sin(state.elapsed*7+h.offset);
  ctx.strokeStyle="rgba(35,52,43,.42)";ctx.lineWidth=7;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-52,0);ctx.lineTo(-70,0);ctx.moveTo(-50,15);ctx.lineTo(-64,15);ctx.stroke();
  ctx.fillStyle="rgba(255,196,64,.18)";ctx.beginPath();ctx.arc(0,-31,23*beaconPulse,0,Math.PI*2);ctx.fill();

  ctx.fillStyle="#f1ecda";roundRect(-42,-24,84,48,10);ctx.fill();
  ctx.strokeStyle="#43584a";ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle="#dfe8df";roundRect(2,-18,31,30,6);ctx.fill();
  ctx.fillStyle="#e8f1ec";roundRect(-31,-17,28,29,6);ctx.fill();
  ctx.fillStyle="#536b54";roundRect(-42,3,84,9,3);ctx.fill();
  ctx.fillStyle="#f8f3df";roundRect(-25,5,50,10,3);ctx.fill();
  ctx.fillStyle="#315440";ctx.font="900 8px Nunito";ctx.textAlign="center";ctx.fillText("SECURITY",0,13);

  ctx.fillStyle="#f6cf57";roundRect(-11,-33,22,8,3);ctx.fill();
  ctx.fillStyle="#fff1a6";ctx.globalAlpha=.8;roundRect(-6,-31,12,4,2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle="#ffd86b";ctx.beginPath();ctx.arc(39,-8,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,216,107,.75)";ctx.beginPath();ctx.moveTo(42,-10);ctx.lineTo(58,-17);ctx.lineTo(58,2);ctx.closePath();ctx.fill();
  ctx.fillStyle="#c45d41";ctx.fillRect(-42,-12,6,9);

  drawChuckDriver();
  [-24,24].forEach(x=>{ctx.fillStyle="#20302b";ctx.beginPath();ctx.arc(x,24,9,0,Math.PI*2);ctx.fill();ctx.fillStyle="#7c8874";ctx.beginPath();ctx.arc(x,24,4,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#315440";roundRect(-23,26,46,6,3);ctx.fill();
  ctx.fillStyle="#fff7d8";ctx.font="900 7px Nunito";ctx.textAlign="center";ctx.fillText("CHUCK",0,31);ctx.textAlign="left";
}

function drawChuckDriver() {
  const wave=Math.sin(state.elapsed*8)*.24;
  ctx.strokeStyle="#efc3a1";ctx.lineWidth=4;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(15,-8);ctx.lineTo(27,-15+wave*10);ctx.stroke();
  ctx.fillStyle="#efc3a1";ctx.beginPath();ctx.arc(0,-11,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#4f3a2d";ctx.beginPath();ctx.arc(0,-14,8,Math.PI,0);ctx.fill();
  ctx.fillStyle="#23332e";ctx.beginPath();ctx.arc(-3,-11,1.3,0,Math.PI*2);ctx.arc(4,-11,1.3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#7a4a38";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(1,-9,4,.15,Math.PI-.15);ctx.stroke();
  ctx.fillStyle="#315440";roundRect(-9,-3,18,12,5);ctx.fill();
}

function drawPlayer() {
  const p=state.player, blink=p.invulnerable && Math.floor(state.elapsed*14)%2;
  if(blink)return;
  ctx.save();ctx.translate(p.x,p.y);
  if(p.secretDance>0)ctx.rotate(Math.sin((.55-p.secretDance)*30)*.32);
  ctx.rotate(p.spin ? (1-p.spin) * 18 : 0);ctx.scale(p.facing,1);
  const flying=state.activePowerups.cape>0;
  const launch=p.capeLaunch || { burst:0, lift:0, capeScale:1, streak:0 };
  const stride=Math.sin(p.bob),hop=p.moving?Math.abs(stride)*4:Math.sin(state.elapsed*2)*1.5,flightLift=flying?14+Math.sin(state.elapsed*6)*3+launch.lift:0;
  if(flying&&launch.burst>0)drawCapeLaunchBurst(launch);
  ctx.fillStyle=flying?"rgba(20,38,30,.14)":"rgba(20,38,30,.22)";
  ctx.beginPath();ctx.ellipse(0,flying?30:23,flying?18:27,flying?6:10,0,0,Math.PI*2);ctx.fill();
  ctx.translate(0,-hop-flightLift);
  if(p.secretDance>0)ctx.translate(0,-Math.sin((.55-p.secretDance)*Math.PI/.55)*8);
  if(flying)drawSuperCape(stride,launch.capeScale);
  const tailSwing=Math.sin(state.elapsed*(p.moving?10:3))*.24;
  ctx.fillStyle="#101b18";ctx.beginPath();ctx.ellipse(-29,-5,33,25,-.78+tailSwing,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#1f2c28";ctx.beginPath();ctx.ellipse(-35,-13,21,17,-.78+tailSwing,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#2d3b35";ctx.beginPath();ctx.ellipse(-29,-15,12,8,-.8+tailSwing,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(247,242,213,.16)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(-34,-11,15,-2.2,-.2);ctx.stroke();
  ctx.fillStyle="#101b18";ctx.beginPath();ctx.ellipse(0,5,19,18,.1,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#17221f";ctx.beginPath();ctx.arc(15,-11,14,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(6,-21);ctx.lineTo(11,-34);ctx.lineTo(17,-21);ctx.closePath();ctx.fill();
  ctx.fillStyle="#27342f";ctx.beginPath();ctx.moveTo(10,-23);ctx.lineTo(12,-29);ctx.lineTo(15,-23);ctx.closePath();ctx.fill();
  ctx.fillStyle="#27342f";ctx.beginPath();ctx.arc(4,-1,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f7f2d5";ctx.beginPath();ctx.arc(20,-14,4.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#17221f";ctx.beginPath();ctx.arc(21,-14,1.8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#fff7d7";ctx.beginPath();ctx.arc(22,-15,1,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(247,242,213,.28)";ctx.beginPath();ctx.arc(15,-7,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#d2a17a";ctx.beginPath();ctx.arc(27,-8,3.4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#f7f2d5";ctx.lineWidth=2;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(25,-8);ctx.lineTo(36,-12);ctx.moveTo(25,-6);ctx.lineTo(37,-5);ctx.moveTo(25,-4);ctx.lineTo(35,1);ctx.stroke();
  ctx.strokeStyle="#101b18";ctx.lineWidth=5;ctx.lineCap="round";
  if(p.moving){ctx.beginPath();ctx.moveTo(-7,16);ctx.lineTo(-14,24+stride*5);ctx.moveTo(8,16);ctx.lineTo(15,24-stride*5);ctx.moveTo(7,1);ctx.lineTo(18,8-stride*3);ctx.moveTo(-7,2);ctx.lineTo(-16,8+stride*3);ctx.stroke();}
  else {ctx.beginPath();ctx.moveTo(-6,16);ctx.lineTo(-11,23);ctx.moveTo(7,16);ctx.lineTo(12,23);ctx.moveTo(8,2);ctx.lineTo(16,7);ctx.stroke();}
  ctx.fillStyle="#f3b543";ctx.beginPath();ctx.arc(-1,7,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff1bd";ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle="#fff";ctx.font="900 7px Nunito";ctx.textAlign="center";ctx.fillText("SBS",-1,10);
  if(state.activePowerups.soup>0){ctx.strokeStyle="rgba(212,208,125,.72)";ctx.lineWidth=4;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-44-i*13,-10+i*10);ctx.lineTo(-62-i*13,-10+i*10);ctx.stroke();}}
  if(state.activePowerups.scroll>0){ctx.save();ctx.strokeStyle="#fff0a0";ctx.lineWidth=4;ctx.globalAlpha=.7+.2*Math.sin(state.elapsed*8);ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(state.activePowerups.skeeters>0)drawSkeetersBoxShield();
  if(flying)drawCapeFlightTrail(launch.streak);
  ctx.restore();
}

function drawCapeLaunchBurst(launch) {
  const b=launch.burst;
  ctx.save();
  ctx.globalAlpha=.18+.38*b;
  ctx.fillStyle="#ffe56b";
  ctx.strokeStyle="#8b0000";
  ctx.lineWidth=3;
  ctx.beginPath();
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8;
    const r=i%2?46+26*b:20+10*b;
    const x=Math.cos(a)*r,y=Math.sin(a)*r;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.globalAlpha=.5*b;ctx.strokeStyle="#fff1bd";ctx.lineWidth=4;
  for(let i=0;i<6;i++){const a=-Math.PI*.92+i*.34;ctx.beginPath();ctx.moveTo(Math.cos(a)*34,Math.sin(a)*22+22);ctx.lineTo(Math.cos(a)*(72+18*b),Math.sin(a)*(44+14*b)+36);ctx.stroke();}
  ctx.restore();
}

function drawSuperCape(stride,capeScale=1) {
  const flutter=Math.sin(state.elapsed*9)*4+stride*2;
  ctx.save();ctx.scale(capeScale,capeScale);
  ctx.fillStyle="#8b0000";ctx.strokeStyle="#4d0000";ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(-4,-8);ctx.bezierCurveTo(-23,-20,-49,-16,-55,1+flutter);
  ctx.bezierCurveTo(-38,8+flutter,-28,21,-5,12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle="#a51c30";ctx.beginPath();
  ctx.moveTo(-7,-5);ctx.bezierCurveTo(-24,-11,-38,-8,-45,2+flutter*.5);
  ctx.bezierCurveTo(-29,5+flutter*.5,-21,12,-7,9);ctx.closePath();ctx.fill();
  ctx.restore();
}

function drawCapeFlightTrail(streak=0) {
  ctx.save();
  ctx.strokeStyle="rgba(255,229,107,.76)";ctx.lineWidth=3+streak*2;ctx.lineCap="round";
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-42-i*13,-15+i*10);ctx.lineTo(-60-i*13-streak*28,-15+i*10);ctx.stroke();}
  if(streak>0){ctx.strokeStyle="rgba(139,0,0,.58)";ctx.lineWidth=2;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-45-i*16,-5+i*18);ctx.lineTo(-83-i*20-streak*22,-5+i*18);ctx.stroke();}}
  ctx.fillStyle="#ffe56b";for(let i=0;i<3;i++){const a=state.elapsed*4+i*2.1;ctx.beginPath();ctx.arc(-39+Math.cos(a)*12-streak*10,-20+Math.sin(a)*18,2+streak,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawSkeetersBoxShield() {
  const pulse=.85+.15*Math.sin(state.elapsed*8);
  const hero=state.player.skeetersHero || { scale:1, lift:0, rotate:-.12, glow:0 };
  ctx.save();
  ctx.globalAlpha=Math.min(1,pulse+.18*hero.glow);
  ctx.translate(26,-8-hero.lift);
  ctx.rotate(hero.rotate);
  ctx.scale(hero.scale,hero.scale);
  if(hero.glow>0){ctx.shadowColor="#ffca73";ctx.shadowBlur=18*hero.glow;}
  ctx.fillStyle="#fff0c2";roundRect(-6,-19,38,29,4);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle="#a7502a";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#d77737";roundRect(-1,-14,26,6,3);ctx.fill();
  ctx.fillStyle="#713a21";ctx.font="900 6px Nunito";ctx.textAlign="center";ctx.fillText("SKEETER'S",13,2);
  ctx.restore();
  ctx.save();ctx.globalAlpha=.36+.16*Math.sin(state.elapsed*7)+.24*hero.glow;ctx.strokeStyle="#ffca73";ctx.lineWidth=4+hero.glow*3;ctx.beginPath();ctx.arc(2,0,33+hero.glow*9,0,Math.PI*2);ctx.stroke();ctx.restore();
}

function addScorePop(x,y,text,color,size=19) {
  state.scorePops.push({x,y,life:1,text,color,size});
}

function drawScorePop(p) {
  ctx.save();ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.strokeStyle="rgba(52,63,45,.55)";ctx.lineWidth=4;
  ctx.font=`900 ${p.size}px Nunito`;ctx.textAlign="center";ctx.strokeText(p.text,p.x,p.y);ctx.fillText(p.text,p.x,p.y);ctx.restore();
}

function updateTourProgress(id) {
  document.querySelector(`.tour-stops [data-landmark="${id}"]`)?.classList.add("found");
}

function extendCombo(amount=1) {
  state.combo+=amount;state.bestCombo=Math.max(state.bestCombo,state.combo);state.comboWindow=3.4;
}

function runCountdown() {
  const el=document.getElementById("countdown");
  const steps=["3","2","1","SCURRY!"];let i=0;
  clearInterval(countdownTimer);el.classList.add("show");el.textContent=steps[i];
  countdownTimer=setInterval(()=>{
    i++;
    if(i===steps.length){clearInterval(countdownTimer);el.classList.remove("show");state.running=true;state.hintLife=7;if(document.hidden)pauseForBackground();showToast("Follow the pulsing acorn to start!");playSound("start");return;}
    el.textContent=steps[i];playTone(steps[i]==="SCURRY!"?720:440,.08,"square");
  },650);
}

function drawGuidance() {
  if(!state.hintLife)return;
  const target=state.acorns.find(a=>a.chapterIndex===state.chapterIndex&&!a.collected);if(!target)return;
  ctx.save();ctx.globalAlpha=Math.min(1,state.hintLife);
  ctx.strokeStyle="#fff4a8";ctx.lineWidth=6;ctx.beginPath();ctx.arc(target.x,target.y,22+Math.sin(state.elapsed*7)*8,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle="#fff9d7";ctx.font="900 16px Nunito";ctx.textAlign="center";ctx.fillText("FIRST ACORN",target.x,target.y-34);ctx.restore();
}

function updateAtmosphere(dt) {
  state.leaves.forEach(leaf=>{
    leaf.x+=leaf.speed*dt;leaf.y+=leaf.speed*.45*dt;
    if(leaf.x>WORLD.width+20)leaf.x=-20;
    if(leaf.y>WORLD.height+20)leaf.y=-20;
  });
  state.ducks.forEach(duck=>{
    duck.x+=duck.speed*dt;
    if(duck.x>255)duck.x=92;
  });
  updateProfessorBoltz(dt);
}

function drawAtmosphere() {
  ctx.save();
  state.leaves.forEach(leaf=>{
    ctx.save();
    ctx.translate(leaf.x,leaf.y);ctx.rotate(Math.sin(state.elapsed*2+leaf.phase));
    ctx.fillStyle="rgba(197,139,62,.46)";ctx.beginPath();ctx.ellipse(0,0,6,3,.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });
  ctx.strokeStyle="rgba(255,255,255,.28)";ctx.lineWidth=3;
  for(let i=0;i<3;i++){const ripple=(state.elapsed*18+i*28)%78;ctx.beginPath();ctx.ellipse(170,900,ripple*1.7,ripple*.8,-.18,0,Math.PI*2);ctx.stroke();}
  state.ducks.forEach(drawDuck);
  drawProfessorBoltz();
  ctx.restore();
}

function updateProfessorBoltz(dt) {
  const prof=state.professorBoltz;
  if(prof.dwellLeft>0){
    prof.dwellLeft=Math.max(0,prof.dwellLeft-dt);
    prof.wave=Math.max(prof.wave,prof.dwellLeft);
    return;
  }
  const from=prof.route[prof.segment],to=prof.route[(prof.segment+1)%prof.route.length];
  const len=Math.hypot(to[0]-from[0],to[1]-from[1]);
  prof.progress+=prof.speed*dt/len;
  if(prof.progress>=1){
    prof.progress=0;
    prof.segment=(prof.segment+1)%prof.route.length;
    if(prof.segment===2||prof.segment===5)prof.dwellLeft=1.9;
  }
  const a=prof.route[prof.segment],b=prof.route[(prof.segment+1)%prof.route.length];
  prof.x=a[0]+(b[0]-a[0])*prof.progress;
  prof.y=a[1]+(b[1]-a[1])*prof.progress;
  if(Math.abs(b[0]-a[0])>.1)prof.facing=Math.sign(b[0]-a[0]);
  prof.wave=Math.max(0,prof.wave-dt);
}

function maybePlaySbsGreeting(passerby) {
  if(!state.running || state.sbsGreetingPlayed || state.muted)return;
  if(passerby.type !== "student")return;
  if(distance(state.player, passerby) > SBS_GREETING_DISTANCE)return;
  const voice = getVoiceSound("sbsGreeting");
  if(!voice)return;
  state.sbsGreetingPlayed = true;
  voice.play();
}

function drawDuck(duck) {
  const y=duck.y+Math.sin(state.elapsed*2+duck.phase)*3;
  ctx.strokeStyle="rgba(255,255,255,.38)";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(duck.x-9,y+4);ctx.lineTo(duck.x-25,y+8);ctx.moveTo(duck.x-6,y+7);ctx.lineTo(duck.x-21,y+14);ctx.stroke();
  ctx.fillStyle="#f4f0d8";ctx.beginPath();ctx.ellipse(duck.x,y,13,8,-.08,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#3d6a52";ctx.beginPath();ctx.arc(duck.x+10,y-7,6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#e8a143";ctx.beginPath();ctx.moveTo(duck.x+15,y-7);ctx.lineTo(duck.x+23,y-4);ctx.lineTo(duck.x+15,y-2);ctx.fill();
  ctx.fillStyle="#17221f";ctx.beginPath();ctx.arc(duck.x+12,y-9,1.3,0,Math.PI*2);ctx.fill();
}

function drawProfessorBoltz() {
  const prof=state.professorBoltz;
  const bob=Math.sin(state.elapsed*4+prof.segment)*1.8;
  ctx.save();
  ctx.translate(prof.x,prof.y+bob);
  ctx.scale(prof.facing,1);
  ctx.fillStyle="rgba(20,35,30,.2)";ctx.beginPath();ctx.ellipse(0,28,22,7,0,0,Math.PI*2);ctx.fill();
  if(professorBoltzSprite?.complete&&professorBoltzSprite.naturalWidth){
    const stroll=prof.dwellLeft>0?0:Math.sin(state.elapsed*7)*2.2;
    ctx.rotate(stroll*.012);
    ctx.drawImage(professorBoltzSprite,-25,-58,50,72);
  } else {
    drawProfessorBoltzFallback(prof);
  }
  if(prof.dwellLeft>0){
    ctx.scale(prof.facing,1);
    ctx.fillStyle="rgba(255,253,246,.92)";roundRect(14,-68,68,23,10);ctx.fill();
    ctx.strokeStyle="rgba(38,60,43,.35)";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#315440";ctx.font="900 8px Nunito";ctx.textAlign="center";ctx.fillText("nice ducks",48,-53);
  }
  ctx.restore();
}

function drawProfessorBoltzFallback(prof) {
  const stroll=prof.dwellLeft>0?0:Math.sin(state.elapsed*7)*2.5;
  const wave=prof.wave>0?Math.sin(state.elapsed*9)*.65:0;
  ctx.strokeStyle="#141716";ctx.lineWidth=6;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(-7,12);ctx.lineTo(-13,25+stroll);ctx.moveTo(8,12);ctx.lineTo(14,25-stroll);ctx.stroke();
  ctx.fillStyle="#111312";roundRect(-15,-7,30,28,8);ctx.fill();
  ctx.fillStyle="#4a5969";ctx.beginPath();ctx.moveTo(-18,-8);ctx.lineTo(0,22);ctx.lineTo(18,-8);ctx.lineTo(12,21);ctx.lineTo(-12,21);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#f0bf9e";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(-23,11);ctx.moveTo(13,0);ctx.lineTo(23,10-wave*9);ctx.stroke();
  ctx.fillStyle="#f0bf9e";ctx.beginPath();ctx.arc(0,-23,11,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#6a3d2a";ctx.beginPath();ctx.ellipse(-9,-18,12,25,-.45,0,Math.PI*2);ctx.ellipse(7,-19,16,28,.35,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f0bf9e";ctx.beginPath();ctx.arc(0,-22,9,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#23465a";ctx.beginPath();ctx.arc(-3,-24,1.3,0,Math.PI*2);ctx.arc(4,-24,1.3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#8f5349";ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(1,-18,4,.15,Math.PI-.15);ctx.stroke();
  ctx.fillStyle="#f3ead2";roundRect(-22,10,20,14,3);ctx.fill();ctx.strokeStyle="#6e533b";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#30443b";ctx.font="900 6px Nunito";ctx.textAlign="center";ctx.fillText("PSY",-12,20);
}

function drawEasterEggs() {
  ctx.fillStyle="#f3e1b7";roundRect(645,870,112,35,4);ctx.fill();ctx.strokeStyle="#765a41";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#315440";ctx.font="900 12px Nunito";ctx.textAlign="center";ctx.fillText("CLASS OF '96",701,892);
  ctx.fillStyle="#765a41";ctx.fillRect(696,905,8,22);
  drawMapLabel(190,975,"DUCK POND DETOUR",10);
}

function spawnOpeningScatter() {
  for(let i=0;i<22;i++){const a=Math.PI*2*i/22;state.particles.push({x:690,y:560,vx:Math.cos(a)*(70+i%4*24),vy:Math.sin(a)*(70+i%4*24),life:1.55,color:i%3?"#f4c65f":"#ffffff"});}
}

function getRank() {
  if(state.score>=31&&state.secrets===landmarks.length)return "Super Black Squirrel Legend";
  if(state.score>=25)return "DC Soup Comet";
  if(state.score>=16)return "Founders Green Forager";
  return "Duck Pond Wanderer";
}

function getBestMoment() {
  if(state.secrets===landmarks.length)return "found every campus secret.";
  if(state.progress?.diningCenter?.completed)return "cleared the Dining Center snack heist.";
  if(state.capeFlights>0)return "sent Super SBS flying over campus trouble.";
  if(state.skeetersBlocks>0)return "saved the stash with a Skeeter's pizza box.";
  if(state.skeetersDeliveries>0)return "completed a heroic Skeeter's delivery.";
  if(state.bestCombo>=10)return `built a ${state.bestCombo}x scurry streak.`;
  if(state.goldenCaught>=2)return `rescued ${state.goldenCaught} golden acorns.`;
  if(state.dodges>=2)return `threaded ${state.dodges} close-call dodges.`;
  return "kept SBS's reunion stash moving.";
}

function renderLandmarkBadges() {
  document.getElementById("landmarkBadges").innerHTML=landmarks.map(l=>{
    const found=state.hidden.some(a=>a.landmark.id===l.id&&a.collected);
    return `<span class="landmark-badge ${found?"found":""}">${found?"✓ ":""}${l.short}</span>`;
  }).join("");
}

function loadPersonalBests() {
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{score:0,combo:0,secrets:0};}catch{return {score:0,combo:0,secrets:0};}
}

function loadZoneProgress() {
  const fallback={ diningCenter:{ completed:false, bestTime:null, snacks:0 } };
  try{
    const saved=JSON.parse(localStorage.getItem(ZONE_PROGRESS_KEY));
    return {
      diningCenter: {
        ...fallback.diningCenter,
        ...(saved?.diningCenter || {})
      }
    };
  }catch{return fallback;}
}

function saveZoneProgress() {
  try{localStorage.setItem(ZONE_PROGRESS_KEY,JSON.stringify(state.progress));}catch{}
}

function savePersonalBests() {
  const bests=loadPersonalBests();
  const next={score:Math.max(bests.score,state.score),combo:Math.max(bests.combo,state.bestCombo),secrets:Math.max(bests.secrets,state.secrets)};
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{}
  return next;
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
    for(let i=0;i<6;i++) drawMiniTray(c.x-75+i*30,c.y-rise-(i%2)*16);
    drawBanner(c.x,c.y-70-rise*.22,"DC TRAY TREASURE!");
  } else if(c.id==="barclay"){
    drawBanner(c.x,c.y-72-rise*.25,"OLDEST DORM STASH!");
  } else if(c.id==="lloyd"){
    ctx.fillStyle="#b96e22";ctx.font="900 23px Nunito";
    for(let i=0;i<9;i++)ctx.fillText("●",c.x-80+i*20,c.y-65+((i*17+age*80)%80));
    drawBanner(c.x,c.y-75-rise*.2,"LLOYD ACORN RAIN!");
  } else {
    ctx.fillStyle="#f8edcf";roundRect(c.x-26,c.y-20-rise*.35,52,36,3);ctx.fill();ctx.strokeStyle="#af8e5b";ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.moveTo(c.x-26,c.y-20-rise*.35);ctx.lineTo(c.x,c.y+2-rise*.35);ctx.lineTo(c.x+26,c.y-20-rise*.35);ctx.stroke();
    drawBanner(c.x,c.y-78-rise*.25,"CAMPUS CENTER STASH!");
  }
  ctx.restore();
}

function drawBanner(x,y,text) {
  ctx.font="900 17px Nunito";ctx.textAlign="center";const width=ctx.measureText(text).width+28;
  ctx.fillStyle="#fff4c8";roundRect(x-width/2,y-21,width,30,14);ctx.fill();
  ctx.fillStyle="#315440";ctx.fillText(text,x,y);ctx.textAlign="left";
}

function drawMiniTray(x,y) {
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(state.elapsed*4+x)*.12);
  ctx.fillStyle="#d7d2c4";roundRect(-15,-9,30,19,4);ctx.fill();
  ctx.strokeStyle="#7a7f76";ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle="#f6f0dc";roundRect(-10,-5,11,7,2);ctx.fill();
  ctx.fillStyle="#8fb36d";roundRect(4,-5,7,7,2);ctx.fill();
  ctx.strokeStyle="#9a9d91";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(1,-8);ctx.lineTo(1,10);ctx.moveTo(-15,2);ctx.lineTo(15,2);ctx.stroke();
  ctx.restore();
}

function spawnPizzaCrumbs(x,y,count=12,force=1) {
  for(let i=0;i<count;i++){
    const a=Math.PI*2*i/count, speed=(55+(i%4)*18)*force;
    state.particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:.7,color:i%3?"#ffd271":"#fff1bd"});
  }
}

function spawnCapeSparkles(x,y,count=18,force=1) {
  for(let i=0;i<count;i++){
    const a=Math.PI*2*i/count, speed=(70+(i%5)*18)*force;
    state.particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:.9,color:i%3?"#ffe56b":"#8b0000"});
  }
}

function drawPowerupStatus() {
  const active=powerupTypes.filter(p=>state.activePowerups[p.id]>0);
  active.forEach((p,i)=>{
    const x=20+i*156,y=950;
    ctx.fillStyle="rgba(255,253,246,.9)";roundRect(x,y,145,32,14);ctx.fill();
    ctx.fillStyle="#315440";ctx.font="900 13px Nunito";ctx.fillText(`${p.shortName || p.name} ${Math.ceil(state.activePowerups[p.id])}s`,x+12,y+21);
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

function resetJoystick() {
  joystick.x=0;joystick.y=0;joystick.pointerId=null;
  document.getElementById("joystickThumb").style.transform="translate(0, 0)";
}

function updateJoystick(event) {
  const ring=document.querySelector(".joystick-ring"),rect=ring.getBoundingClientRect();
  const max=rect.width*.18,dx=event.clientX-(rect.left+rect.width/2),dy=event.clientY-(rect.top+rect.height/2);
  const distanceFromCenter=Math.hypot(dx,dy),scale=distanceFromCenter>max?max/distanceFromCenter:1;
  const x=dx*scale,y=dy*scale,deadZone=max*.16;
  joystick.x=Math.abs(x)<deadZone?0:x/max;joystick.y=Math.abs(y)<deadZone?0:y/max;
  document.getElementById("joystickThumb").style.transform=`translate(${x}px, ${y}px)`;
}

function pauseForBackground() {
  if(!state.running||state.ended)return;
  stopCapeFlightAudio(.25);
  state.running=false;state.paused=true;resetJoystick();
  document.getElementById("pauseOverlay").classList.add("show");
}

function resumeGame() {
  if(!state.paused)return;
  state.paused=false;state.running=true;
  if(state.activePowerups.cape > 0)startCapeFlightAudio();
  document.getElementById("pauseOverlay").classList.remove("show");
}

function updateHud(){
  document.getElementById("score").textContent=state.score;
  if(state.mode === MODE_DINING_CENTER && state.zone){
    document.getElementById("tourKicker").textContent=`DC snacks ${state.zone.snacksCollected} / ${DINING_CENTER_ZONE.requiredSnacks}`;
    document.getElementById("mobileDestination").textContent=state.zone.cookieCollected?"Reach the DC exit":"Find the DC Cookie";
  } else {
    document.getElementById("tourKicker").textContent=`Campus secrets ${state.secrets} / ${landmarks.length}`;
    const chapter=trailChapters[state.chapterIndex];document.getElementById("mobileDestination").textContent=chapter?`Next stop: ${chapter.destination}`:"Campus trail complete";
  }
  document.getElementById("combo").textContent=state.combo;document.getElementById("comboCard").classList.toggle("hot",state.combo>=3);
  const timerValue=state.mode === MODE_DINING_CENTER && state.zone ? state.zone.timeLeft : state.timeLeft;
  const s=Math.ceil(timerValue);document.getElementById("timer").textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  document.querySelector(".timer-card").classList.toggle("urgent",state.running&&timerValue<=20);
}
function showToast(text){const el=document.getElementById("toast");el.textContent=text;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1800);}
function initGameAudio() {
  if(gameSoundSprite || !window.Howl)return gameSoundSprite;
  gameSoundSprite = new Howl({
    src: SOUND_SPRITE_SOURCES,
    sprite: SOUND_SPRITES,
    volume: .72,
    preload: true,
    onloaderror: () => { gameSoundSprite = null; }
  });
  window.Howler?.mute(!!state?.muted);
  return gameSoundSprite;
}

function getVoiceSound(name) {
  if(!window.Howl || !VOICE_LINES[name])return null;
  voiceSounds[name] ||= new Howl({
    src: [VOICE_LINES[name]],
    volume: .72,
    preload: true
  });
  window.Howler?.mute(!!state?.muted);
  return voiceSounds[name];
}

function getPowerupSound(name) {
  if(!window.Howl || !POWERUP_AUDIO[name])return null;
  powerupSounds[name] ||= new Howl({
    src: [POWERUP_AUDIO[name]],
    volume: CAPE_FLIGHT_VOLUME,
    loop: true,
    preload: true
  });
  window.Howler?.mute(!!state?.muted);
  return powerupSounds[name];
}

function startCapeFlightAudio() {
  capeFlightFading = false;
  if(state?.muted)return;
  const sound = getPowerupSound("capeFlight");
  if(!sound)return;
  if(capeFlightSoundId)sound.stop(capeFlightSoundId);
  capeFlightSoundId = sound.play();
  sound.volume(0, capeFlightSoundId);
  sound.fade(0, CAPE_FLIGHT_VOLUME, 420, capeFlightSoundId);
}

function updateCapeFlightAudio() {
  const capeSeconds = state?.activePowerups?.cape || 0;
  if(capeSeconds > 0 && !capeFlightSoundId && !state.muted){
    startCapeFlightAudio();
    return;
  }
  if(!capeFlightSoundId)return;
  if(!state.running || state.paused || state.ended || state.muted || capeSeconds <= 0){
    stopCapeFlightAudio(.45);
    return;
  }
  if(!capeFlightFading && capeSeconds <= CAPE_FLIGHT_FADE_SECONDS){
    capeFlightFading = true;
    getPowerupSound("capeFlight")?.fade(CAPE_FLIGHT_VOLUME, 0, capeSeconds * 1000, capeFlightSoundId);
  }
}

function stopCapeFlightAudio(fadeSeconds = .4) {
  const sound = powerupSounds.capeFlight;
  if(!sound || !capeFlightSoundId){
    capeFlightSoundId = null;
    capeFlightFading = false;
    return;
  }
  const soundId = capeFlightSoundId;
  capeFlightSoundId = null;
  capeFlightFading = false;
  if(fadeSeconds <= 0){
    sound.stop(soundId);
    return;
  }
  sound.fade(CAPE_FLIGHT_VOLUME, 0, fadeSeconds * 1000, soundId);
  setTimeout(() => sound.stop(soundId), fadeSeconds * 1000 + 80);
}

function playTone(freq,duration,type="sine",delay=0,volume=.05){
  if(state?.muted)return;
  const AudioClass = window.AudioContext || window.webkitAudioContext;
  if(!AudioClass)return;
  audioCtx ||= new AudioClass();
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=type;
  o.frequency.value=freq;
  g.gain.setValueAtTime(volume,audioCtx.currentTime+delay);
  g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+delay+duration);
  o.connect(g);g.connect(audioCtx.destination);
  o.start(audioCtx.currentTime+delay);
  o.stop(audioCtx.currentTime+delay+duration);
}

function getSoundClock() {
  return state?.elapsed ?? performance.now() / 1000;
}

function playReviewSound(name) {
  const wasMuted = state?.muted;
  if(wasMuted){
    state.muted = false;
    window.Howler?.mute(false);
    document.getElementById("soundIcon").textContent = "♪";
  }
  if(VOICE_LINES[name]){
    getVoiceSound(name)?.play();
    return;
  }
  if(POWERUP_AUDIO[name]){
    const sound = getPowerupSound(name);
    if(sound){
      const soundId = sound.play();
      sound.volume(CAPE_FLIGHT_VOLUME, soundId);
      setTimeout(() => sound.fade(CAPE_FLIGHT_VOLUME, 0, 700, soundId), 1600);
      setTimeout(() => sound.stop(soundId), 2380);
    }
    return;
  }
  const options = SOUND_PLAYBACK[name] || {};
  const soundSprite = initGameAudio();
  if(soundSprite && SOUND_SPRITES[name]){
    const soundId = soundSprite.play(name);
    if(soundId && options.volume != null)soundSprite.volume(options.volume, soundId);
    return;
  }
  const previousMute = state?.muted;
  if(state)state.muted = false;
  playSound(name);
  if(state)state.muted = previousMute;
}

function playSound(name){
  if(state?.muted)return;
  const options = SOUND_PLAYBACK[name] || {};
  const now = getSoundClock();
  if(options.cooldown && lastSoundAt[name] && now - lastSoundAt[name] < options.cooldown)return;
  lastSoundAt[name] = now;
  const soundSprite = initGameAudio();
  if(soundSprite && SOUND_SPRITES[name]){
    const soundId = soundSprite.play(name);
    if(soundId && options.volume != null)soundSprite.volume(options.volume, soundId);
    if(soundId && options.rateJitter)soundSprite.rate(1 + (Math.random() * 2 - 1) * options.rateJitter, soundId);
    return;
  }
  const sounds={
    start:[[392,.11,"sine",0,.018],[523,.12,"triangle",.15,.015]],
    acorn:[[740,.07,"triangle",0,.035]],
    secret:[[740,.08,"triangle",0,.045],[988,.14,"sine",.1,.04],[1319,.18,"triangle",.28,.035]],
    golden:[[784,.08,"triangle",0],[1047,.1,"triangle",.09],[1319,.16,"triangle",.2]],
    powerup:[[587,.08,"triangle",0],[784,.13,"triangle",.1]],
    cape:[[523,.07,"triangle",0,.05],[784,.09,"triangle",.08,.05],[1175,.14,"triangle",.18,.045]],
    shield:[[392,.1,"sine",0,.026],[523,.13,"triangle",.11,.024],[659,.1,"sine",.28,.02]],
    dodge:[[740,.06,"sine",0,.022],[880,.08,"triangle",.08,.02]],
    bump:[[220,.1,"sine",0,.024],[174,.14,"triangle",.09,.018]],
    wobble:[[196,.12,"sine",0,.022],[165,.14,"sine",.16,.018],[247,.1,"triangle",.34,.015]],
    bird:[[1250,.05,"sine",0],[1580,.06,"sine",.09],[1390,.05,"sine",.18]],
    quack:[[247,.09,"sine",0,.02],[196,.12,"triangle",.1,.016]],
    horn:[[294,.13,"sine",0,.022],[392,.14,"triangle",.2,.018]],
    urgent:[[392,.08,"triangle",0,.024],[523,.08,"triangle",.2,.022],[659,.11,"sine",.42,.02]],
    finish:[[523,.12,"sine",0],[659,.12,"sine",.13],[784,.18,"sine",.26]]
  };
  sounds[name]?.forEach(args=>playTone(...args));
}

function renderSoundReviewPanel() {
  const list = document.getElementById("soundReviewList");
  if(!list)return;
  list.innerHTML = SOUND_REVIEW_ITEMS.map(item => `
    <article class="sound-review-item" data-sound="${item.id}">
      <div>
        <div class="sound-review-name"><strong>${item.label}</strong><span>${item.id} · ${item.category}</span></div>
        <p class="sound-review-use">${item.use}</p>
      </div>
      <div class="sound-review-actions">
        <button class="sound-review-play" type="button" data-sound-play="${item.id}">Play</button>
        <button class="sound-review-mark" type="button" data-sound-mark="${item.id}" aria-pressed="false">Needs change</button>
      </div>
    </article>
  `).join("");
  updateSoundReviewNotes();
}

function updateSoundReviewNotes() {
  const notes = document.getElementById("soundReviewNotes");
  if(!notes)return;
  const marked = [...document.querySelectorAll(".sound-review-item.needs-change")].map(el => {
    const item = SOUND_REVIEW_ITEMS.find(sound => sound.id === el.dataset.sound);
    return item ? `- ${item.id}: ${item.label} (${item.use})` : "";
  }).filter(Boolean);
  notes.value = marked.length ? marked.join("\n") : "";
}

function toggleSoundReviewPanel(show) {
  const panel = document.getElementById("soundReviewPanel");
  const toggle = document.getElementById("soundReviewToggle");
  if(!panel || !toggle)return;
  const next = show ?? !panel.classList.contains("show");
  panel.classList.toggle("show", next);
  toggle.setAttribute("aria-expanded", next);
}
function frame(t){const dt=Math.min((t-lastTime)/1000,.05)||0;lastTime=t;update(dt);draw();requestAnimationFrame(frame);}

function initStartButtonBounce() {
  const button=document.getElementById("startButton");
  if(!button||!window.gsap||reducedMotionQuery.matches)return;
  gsap.to(button,{
    y:-5,
    scale:1.035,
    duration:.72,
    ease:"sine.inOut",
    repeat:-1,
    yoyo:true,
    repeatDelay:1.15
  });
}

function loadSpriteAssets() {
  professorBoltzSprite=new Image();
  professorBoltzSprite.src="assets/marilyn-boltz-professor-sprite.svg";
}

window.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());});
window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener("click",()=>{if(state?.zonePrompt===MODE_DINING_CENTER)enterDiningCenterZone();});
const joystickEl=document.getElementById("joystick");
joystickEl.addEventListener("pointerdown",event=>{event.preventDefault();joystick.pointerId=event.pointerId;joystickEl.setPointerCapture(event.pointerId);updateJoystick(event);});
joystickEl.addEventListener("pointermove",event=>{if(event.pointerId===joystick.pointerId)updateJoystick(event);});
["pointerup","pointercancel","lostpointercapture"].forEach(type=>joystickEl.addEventListener(type,event=>{if(event.pointerId===joystick.pointerId)resetJoystick();}));
document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseForBackground();});
document.getElementById("resumeButton").addEventListener("click",resumeGame);
document.getElementById("fullscreenButton").addEventListener("click",requestMobileFullscreen);
document.getElementById("fullscreenGateButton").addEventListener("click",requestMobileFullscreen);
document.getElementById("mobileFullscreenButton").addEventListener("click",()=>requestMobileFullscreen(true));
document.getElementById("portraitContinueButton").addEventListener("click",()=>{portraitBypass=true;refreshOrientationGate();});
document.getElementById("helpButton").addEventListener("click",()=>{
  const help=document.getElementById("mobileHelp"),show=!help.classList.contains("show");
  help.classList.toggle("show",show);document.getElementById("helpButton").setAttribute("aria-expanded",show);
});
document.getElementById("startButton").addEventListener("click",async()=>{if(window.gsap)gsap.killTweensOf("#startButton");if(isMobileView())await requestMobileFullscreen(true);startGame();});
document.getElementById("restartButton").addEventListener("click",startGame);
document.getElementById("soundButton").addEventListener("click",()=>{
  state.muted=!state.muted;
  window.Howler?.mute(state.muted);
  if(state.muted)stopCapeFlightAudio(.2);
  else if(state.activePowerups.cape > 0)startCapeFlightAudio();
  document.getElementById("soundIcon").textContent=state.muted?"×":"♪";
});
document.getElementById("soundReviewToggle").addEventListener("click",()=>toggleSoundReviewPanel());
document.getElementById("soundReviewClose").addEventListener("click",()=>toggleSoundReviewPanel(false));
document.getElementById("soundReviewList").addEventListener("click",event=>{
  const playButton = event.target.closest("[data-sound-play]");
  if(playButton){
    playReviewSound(playButton.dataset.soundPlay);
    return;
  }
  const markButton = event.target.closest("[data-sound-mark]");
  if(markButton){
    const item = markButton.closest(".sound-review-item");
    const active = item.classList.toggle("needs-change");
    markButton.setAttribute("aria-pressed", active);
    markButton.textContent = active ? "Marked" : "Needs change";
    updateSoundReviewNotes();
  }
});
function getPostcardSignature() {
  const name=document.getElementById("playerName")?.value.trim().replace(/\s+/g," ")||"";
  const year=(document.getElementById("classYear")?.value||"").replace(/\D/g,"").slice(0,4);
  if(!name&&!year)return "";
  return `${name||"A Haverford friend"}${year?` '${year.slice(-2)}`:""}`;
}

function getShareResult() {
  return {
    title: getRank(),
    score: state.score,
    secrets: state.secrets,
    totalSecrets: landmarks.length,
    combo: state.bestCombo,
    bestMoment: getBestMoment(),
    signature: getPostcardSignature()
  };
}

function getShareText() {
  const result=getShareResult();
  const signed=result.signature?` Signed on the Honor Code by ${result.signature}.`:"";
  return `Can you beat my SBS reunion score? I earned the ${result.title} title with ${result.score} points and ${result.secrets}/${result.totalSecrets} campus secrets in SBS: Acorn Dash. My best moment: ${result.bestMoment}${signed} ${location.href}`;
}

function wrapCanvasText(cardCtx,text,x,y,maxWidth,lineHeight,maxLines=3) {
  const words=text.split(" ");
  let line="",lines=0;
  for(const word of words){
    const test=line?`${line} ${word}`:word;
    if(cardCtx.measureText(test).width>maxWidth&&line){
      cardCtx.fillText(line,x,y);y+=lineHeight;lines++;
      line=word;
      if(lines>=maxLines-1)break;
    }else line=test;
  }
  if(line)cardCtx.fillText(line,x,y);
}

function roundCanvasRect(cardCtx,x,y,w,h,r) {
  cardCtx.beginPath();
  cardCtx.roundRect(x,y,w,h,r);
}

function drawSharePostcard() {
  const shareCanvas=document.getElementById("shareCanvas");
  const cardCtx=shareCanvas.getContext("2d");
  const result=getShareResult();
  shareCanvas.width=SHARE_IMAGE_WIDTH;
  shareCanvas.height=SHARE_IMAGE_HEIGHT;
  cardCtx.clearRect(0,0,SHARE_IMAGE_WIDTH,SHARE_IMAGE_HEIGHT);

  const grd=cardCtx.createLinearGradient(0,0,SHARE_IMAGE_WIDTH,SHARE_IMAGE_HEIGHT);
  grd.addColorStop(0,"#fff8e7");grd.addColorStop(.55,"#f2e2be");grd.addColorStop(1,"#dfe9d6");
  cardCtx.fillStyle=grd;cardCtx.fillRect(0,0,SHARE_IMAGE_WIDTH,SHARE_IMAGE_HEIGHT);
  cardCtx.fillStyle="rgba(49,84,64,.08)";
  for(let x=-60;x<SHARE_IMAGE_WIDTH;x+=88){cardCtx.fillRect(x,0,34,SHARE_IMAGE_HEIGHT);}

  cardCtx.fillStyle="#fffdf6";roundCanvasRect(cardCtx,58,54,1084,522,24);cardCtx.fill();
  cardCtx.strokeStyle="#d7c49e";cardCtx.lineWidth=7;cardCtx.stroke();
  cardCtx.strokeStyle="rgba(128,105,82,.35)";cardCtx.lineWidth=2;roundCanvasRect(cardCtx,80,76,1040,478,12);cardCtx.stroke();

  cardCtx.fillStyle="#6a0000";cardCtx.font="900 38px Georgia, serif";cardCtx.textAlign="left";
  cardCtx.fillText("Greetings from Haverford",112,132);
  cardCtx.fillStyle="#25211c";cardCtx.font="900 20px Nunito, Arial, sans-serif";
  cardCtx.fillText("SBS: ACORN DASH RESULT CARD",114,166);

  cardCtx.save();
  cardCtx.translate(988,142);cardCtx.rotate(.13);
  cardCtx.fillStyle="#6a0000";roundCanvasRect(cardCtx,-68,-58,136,116,10);cardCtx.fill();
  cardCtx.strokeStyle="#fff3c6";cardCtx.lineWidth=5;cardCtx.strokeRect(-52,-42,104,84);
  cardCtx.fillStyle="#fff8db";cardCtx.textAlign="center";cardCtx.font="900 31px Georgia, serif";cardCtx.fillText("SBS",0,-4);
  cardCtx.font="900 13px Nunito, Arial, sans-serif";cardCtx.fillText("REUNION",0,25);
  cardCtx.restore();

  cardCtx.fillStyle="#6a0000";cardCtx.font="900 92px Georgia, serif";cardCtx.textAlign="left";
  cardCtx.fillText(String(result.score),124,310);
  cardCtx.fillStyle="#6a604c";cardCtx.font="900 28px Nunito, Arial, sans-serif";
  cardCtx.fillText("acorns collected",258,286);
  cardCtx.fillStyle="#25211c";cardCtx.font="900 42px Nunito, Arial, sans-serif";
  wrapCanvasText(cardCtx,result.title,258,336,500,48,2);

  const statY=410;
  [["Campus secrets",`${result.secrets} / ${result.totalSecrets}`],["Best streak",`${result.combo}x`],["Best moment",result.bestMoment.replace(/\.$/,"")]].forEach(([label,value],i)=>{
    const x=124+i*290,w=i===2?360:240;
    cardCtx.fillStyle=i===2?"#fff1bd":"#f1eadb";roundCanvasRect(cardCtx,x,statY,w,96,14);cardCtx.fill();
    cardCtx.fillStyle="#71664f";cardCtx.font="900 18px Nunito, Arial, sans-serif";cardCtx.fillText(label,x+20,statY+34);
    cardCtx.fillStyle="#25211c";cardCtx.font=i===2?"900 20px Nunito, Arial, sans-serif":"900 34px Nunito, Arial, sans-serif";
    wrapCanvasText(cardCtx,value,x+20,statY+70,w-40,25,2);
  });

  cardCtx.save();
  cardCtx.translate(900,260);
  cardCtx.fillStyle="#1f1d19";cardCtx.beginPath();cardCtx.ellipse(0,42,78,48,0,0,Math.PI*2);cardCtx.fill();
  cardCtx.beginPath();cardCtx.arc(-48,0,42,0,Math.PI*2);cardCtx.fill();
  cardCtx.beginPath();cardCtx.arc(-68,-40,18,0,Math.PI*2);cardCtx.arc(-28,-40,18,0,Math.PI*2);cardCtx.fill();
  cardCtx.strokeStyle="#1f1d19";cardCtx.lineWidth=28;cardCtx.beginPath();cardCtx.arc(56,8,64,-.5,1.9);cardCtx.stroke();
  cardCtx.fillStyle="#fff8db";cardCtx.beginPath();cardCtx.arc(-62,-8,5,0,Math.PI*2);cardCtx.fill();
  cardCtx.fillStyle="#8a5d27";cardCtx.beginPath();cardCtx.ellipse(86,86,28,38,.22,0,Math.PI*2);cardCtx.fill();
  cardCtx.fillStyle="#5b3a1e";cardCtx.fillRect(72,42,28,14);
  cardCtx.restore();

  cardCtx.fillStyle="#315440";cardCtx.font="900 24px Nunito, Arial, sans-serif";cardCtx.textAlign="left";
  cardCtx.fillText(result.signature?`Signed on the Honor Code: ${result.signature}`:"Signed on the Honor Code: Optional",112,548);
  cardCtx.fillStyle="#6a604c";cardCtx.font="800 18px Nunito, Arial, sans-serif";cardCtx.textAlign="right";
  cardCtx.fillText(location.host||"SBS: Acorn Dash",1088,548);
}

function getShareImageBlob() {
  drawSharePostcard();
  return new Promise(resolve=>document.getElementById("shareCanvas").toBlob(resolve,"image/png",.95));
}

async function getShareImageFile() {
  const blob=await getShareImageBlob();
  return blob?new File([blob],"sbs-acorn-dash-postcard.png",{type:"image/png"}):null;
}

async function shareWithNativePicker(preferFiles=false) {
  const text=getShareText();
  if(!navigator.share)return false;
  if(preferFiles){
    const file=await getShareImageFile();
    if(file&&navigator.canShare?.({files:[file]})){
      await navigator.share({title:"SBS: Acorn Dash",text,files:[file]});
      return true;
    }
  }
  await navigator.share({title:"SBS: Acorn Dash",text});
  return true;
}

document.getElementById("honorCardForm").addEventListener("submit",event=>event.preventDefault());
document.getElementById("classYear").addEventListener("input",event=>{event.target.value=event.target.value.replace(/\D/g,"").slice(0,4);});
document.getElementById("whatsappButton").addEventListener("click",async()=>{
  try{if(await shareWithNativePicker(true))return;}catch{}
  window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`,"_blank","noopener");
  showToast("Postcard text opened for WhatsApp.");
});
document.getElementById("shareButton").addEventListener("click",async()=>{
  try{if(await shareWithNativePicker(true))return;}catch{}
  try{await navigator.clipboard.writeText(getShareText());showToast("Classmate challenge copied!");}catch{}
});
document.getElementById("copyButton").addEventListener("click",async()=>{
  const text=getShareText();
  try{
    if(window.ClipboardItem&&navigator.clipboard?.write){
      const blob=await getShareImageBlob();
      if(blob){await navigator.clipboard.write([new ClipboardItem({"image/png":blob,"text/plain":new Blob([text],{type:"text/plain"})})]);showToast("Postcard image copied!");return;}
    }
  }catch{}
  try{await navigator.clipboard.writeText(text);showToast("Challenge link copied!");}catch{}
});

resizeCanvasForViewport();
refreshOrientationGate();
refreshFullscreenButton();
window.addEventListener("resize",()=>{resizeCanvasForViewport();refreshOrientationGate();refreshFullscreenButton();});
document.addEventListener("fullscreenchange",()=>{refreshFullscreenButton();resizeCanvasForViewport();});
screen.orientation?.addEventListener?.("change",()=>{resizeCanvasForViewport();refreshOrientationGate();refreshFullscreenButton();});
loadSpriteAssets();state=newState();updateHud();renderSoundReviewPanel();initStartButtonBounce();requestAnimationFrame(frame);
