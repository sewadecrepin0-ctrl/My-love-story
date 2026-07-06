/* =========================================================
   Une histoire romantique — script principal
   ========================================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const stage = $("#stage");
const fx = $("#fx-layer");
const toast = $("#toast");
const badgesBar = $("#badges-bar");

const state = {
  name: "......",
  ambianceIdx: 0,
  answers: {},
  score: 0,
  badges: new Set(),
  music: false,
};

const AMBIANCES = ["galaxy", "sunset", "sakura", "rain", "fireworks", "night"];
const AMBIANCE_LABEL = {
  galaxy: "✨ Galaxie", sunset: "🌇 Coucher", sakura: "🌸 Sakura",
  rain: "🌧️ Pluie romantique", fireworks: "🎆 Feux d'artifice", night: "🌙 Nuit",
};

/* ---------- Toast ---------- */
let toastT;
function showToast(msg, ms = 2200) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => toast.classList.remove("show"), ms);
}

/* ---------- Curseur ---------- */
const cursor = $("#cursor"), cursorDot = $("#cursor-dot");
let mx = -100, my = -100, cx = mx, cy = my;
window.addEventListener("mousemove", (e) => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  if (Math.random() < 0.08) {
    const t = document.createElement("div");
    t.className = "cursor-trail";
    t.textContent = pick(["❤", "✦", "✧", "♡"]);
    t.style.left = mx + "px"; t.style.top = my + "px";
    t.style.color = pick(["#ff6ba9", "#f6c667", "#4cc9f0"]);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 800);
  }
});
(function loop() {
  cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
  cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  requestAnimationFrame(loop);
})();
document.addEventListener("mouseover", (e) => {
  if (e.target.closest("button,a,input,.chip,.envelope,.catch-heart")) cursor.classList.add("is-hover");
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest("button,a,input,.chip,.envelope,.catch-heart")) cursor.classList.remove("is-hover");
});

/* ---------- Particules canvas (fond) ---------- */
const canvas = $("#particles");
const ctx = canvas.getContext("2d");
let particles = [];
function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
resize();
addEventListener("resize", () => { ctx.setTransform(1, 0, 0, 1, 0, 0); resize(); });
function initParticles() {
  particles = Array.from({ length: 70 }, () => ({
    x: rand(0, innerWidth), y: rand(0, innerHeight),
    r: rand(0.6, 2.2), vx: rand(-0.15, 0.15), vy: rand(-0.25, -0.05),
    a: rand(0.2, 0.7), hue: pick([330, 45, 210, 270]),
  }));
}
initParticles();
function drawParticles() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.y < -10) { p.y = innerHeight + 10; p.x = rand(0, innerWidth); }
    if (p.x < -10) p.x = innerWidth + 10;
    if (p.x > innerWidth + 10) p.x = -10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue},90%,70%,${p.a})`;
    ctx.shadowBlur = 12; ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ---------- Ambiance layer ---------- */
const ambLayer = $("#ambiance-layer");
let ambRAF = null;
function setAmbiance(name) {
  document.body.dataset.ambiance = name;
  ambLayer.innerHTML = "";
  cancelAnimationFrame(ambRAF);
  if (name === "rain") {
    for (let i = 0; i < 80; i++) {
      const d = document.createElement("div");
      d.className = "rain-drop";
      d.style.left = rand(0, 100) + "%";
      d.style.animationDuration = rand(0.6, 1.4) + "s";
      d.style.animationDelay = rand(0, 2) + "s";
      d.style.opacity = rand(0.3, 0.7);
      ambLayer.appendChild(d);
    }
  } else if (name === "sakura") {
    for (let i = 0; i < 30; i++) {
      const s = document.createElement("div");
      s.className = "sakura";
      s.textContent = "🌸";
      s.style.left = rand(0, 100) + "%";
      s.style.setProperty("--dx", rand(-40, 40) + "vw");
      s.style.animationDuration = rand(8, 16) + "s";
      s.style.animationDelay = rand(0, 8) + "s";
      s.style.opacity = rand(0.6, 1);
      ambLayer.appendChild(s);
    }
  } else if (name === "fireworks") {
    const shoot = () => {
      const cx = rand(15, 85), cy = rand(15, 55);
      const hue = pick([330, 45, 200, 270, 15]);
      for (let i = 0; i < 24; i++) {
        const f = document.createElement("div");
        f.className = "firework";
        const ang = (i / 24) * Math.PI * 2;
        f.style.left = cx + "%"; f.style.top = cy + "%";
        f.style.background = `hsl(${hue},90%,65%)`;
        f.style.boxShadow = `0 0 8px hsl(${hue},90%,65%)`;
        f.style.setProperty("--dx", Math.cos(ang) * rand(60, 120) + "px");
        f.style.setProperty("--dy", Math.sin(ang) * rand(60, 120) + "px");
        ambLayer.appendChild(f);
        setTimeout(() => f.remove(), 1300);
      }
    };
    const interval = setInterval(shoot, 900);
    ambRAF = { cancel: () => clearInterval(interval) };
    setTimeout(shoot, 100);
  }
  showToast(AMBIANCE_LABEL[name]);
}
setAmbiance("galaxy");

/* ---------- FX Confettis / cœurs ---------- */
function burst(count = 60, emojis = ["❤", "💖", "💕", "💗", "✨"]) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "fx-piece";
    p.textContent = pick(emojis);
    p.style.left = rand(0, 100) + "vw";
    p.style.top = "-40px";
    p.style.setProperty("--dx", rand(-25, 25) + "vw");
    p.style.setProperty("--r", rand(-720, 720) + "deg");
    p.style.animationDuration = rand(2.5, 5) + "s";
    p.style.animationDelay = rand(0, 0.6) + "s";
    p.style.fontSize = rand(0.9, 2) + "rem";
    fx.appendChild(p);
    setTimeout(() => p.remove(), 6000);
  }
}

/* ---------- Audio (WebAudio SFX + musique) ---------- */
const music = $("#music"), soundBtn = $("#sound-toggle"), volume = $("#volume");
let audioCtx = null;
function ensureCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function sfx(type = "pop") {
  try {
    const c = ensureCtx();
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    const now = c.currentTime;
    g.gain.value = 0.0001;
    if (type === "pop") { o.frequency.value = 660; o.frequency.exponentialRampToValueAtTime(880, now + 0.08); g.gain.exponentialRampToValueAtTime(0.15, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18); }
    else if (type === "chime") { o.type = "sine"; o.frequency.value = 880; o.frequency.exponentialRampToValueAtTime(1320, now + 0.25); g.gain.exponentialRampToValueAtTime(0.18, now + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5); }
    else if (type === "heart") { o.type = "triangle"; o.frequency.value = 523; g.gain.exponentialRampToValueAtTime(0.15, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3); }
    o.start(now); o.stop(now + 0.6);
  } catch {}
}
/* ---------- YouTube : Willylancien - Elle m'a eu ---------- */
const YT_VIDEO_ID = "Eb8HXIgEbCs";
let ytPlayer = null, ytReady = false, ytFailed = false;
function loadYT() {
  if (window.YT || document.getElementById("yt-api")) return;
  const s = document.createElement("script");
  s.id = "yt-api"; s.src = "https://www.youtube.com/iframe_api";
  s.onerror = () => { ytFailed = true; };
  document.head.appendChild(s);
  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new YT.Player("yt-player", {
      videoId: YT_VIDEO_ID, host: "https://www.youtube-nocookie.com",
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, playsinline: 1, rel: 0, loop: 1, playlist: YT_VIDEO_ID },
      events: {
        onReady: () => { ytReady = true; ytPlayer.setVolume(Math.round(+volume.value * 100)); },
        onError: () => { ytFailed = true; showToast("YouTube indisponible — piste de secours"); },
      },
    });
  };
}
loadYT();

soundBtn.addEventListener("click", () => {
  state.music = !state.music;
  soundBtn.textContent = state.music ? "🎵" : "🔇";
  soundBtn.setAttribute("aria-pressed", state.music);
  if (state.music) {
    if (ytReady && !ytFailed) {
      try { ytPlayer.setVolume(Math.round(+volume.value * 100)); ytPlayer.playVideo(); return; } catch {}
    }
    music.volume = +volume.value;
    music.play().catch(() => showToast("Musique bloquée par le navigateur"));
  } else {
    if (ytReady) { try { ytPlayer.pauseVideo(); } catch {} }
    music.pause();
  }
});
volume.addEventListener("input", () => {
  music.volume = +volume.value;
  if (ytReady) { try { ytPlayer.setVolume(Math.round(+volume.value * 100)); } catch {} }
});

/* ---------- Service Worker (mode hors-ligne) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

/* ---------- Reduced motion (toggle + auto detect) ---------- */
const motionBtn = $("#motion-toggle");
const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
function applyReducedMotion(on) {
  document.body.classList.toggle("reduce-motion", on);
  motionBtn.setAttribute("aria-pressed", on);
  motionBtn.textContent = on ? "🐢" : "🌀";
  localStorage.setItem("reduce-motion", on ? "1" : "0");
}
const savedRM = localStorage.getItem("reduce-motion");
applyReducedMotion(savedRM ? savedRM === "1" : mqReduce.matches);
motionBtn.addEventListener("click", () => {
  applyReducedMotion(!document.body.classList.contains("reduce-motion"));
  showToast(document.body.classList.contains("reduce-motion") ? "Animations réduites 🐢" : "Animations fluides ✨");
});
mqReduce.addEventListener?.("change", (e) => { if (localStorage.getItem("reduce-motion") === null) applyReducedMotion(e.matches); });

/* ---------- Toolbar ---------- */
$("#theme-toggle").addEventListener("click", () => {
  const dark = document.documentElement.getAttribute("data-theme") !== "light";
  document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
  $("#theme-toggle").textContent = dark ? "☀️" : "🌙";
});
$("#ambiance-btn").addEventListener("click", () => {
  state.ambianceIdx = (state.ambianceIdx + 1) % AMBIANCES.length;
  setAmbiance(AMBIANCES[state.ambianceIdx]);
});
$("#restart").addEventListener("click", () => {
  if (confirm("Recommencer l'expérience ?")) { state.answers = {}; state.badges.clear(); renderBadges(); sceneIntro(); }
});

/* ---------- Badges ---------- */
const BADGES = {
  first_answer: { icon: "🌱", label: "Premier pas" },
  streak5: { icon: "⭐", label: "Cinq réponses" },
  game_win: { icon: "❤️", label: "Attrape-cœurs" },
  wheel: { icon: "🎡", label: "Roue tournée" },
  yes: { icon: "💖", label: "Premier Oui" },
  soulmate: { icon: "🌟", label: "Âme sœur" },
  funny: { icon: "😂", label: "Très drôle" },
};
function unlock(id) {
  if (state.badges.has(id) || !BADGES[id]) return;
  state.badges.add(id);
  renderBadges();
  sfx("chime");
  showToast(`Badge débloqué : ${BADGES[id].icon} ${BADGES[id].label}`);
}
function renderBadges() {
  badgesBar.innerHTML = "";
  for (const id of state.badges) {
    const b = BADGES[id]; if (!b) continue;
    const el = document.createElement("div");
    el.className = "badge-chip";
    el.innerHTML = `<span>${b.icon}</span><span>${b.label}</span>`;
    badgesBar.appendChild(el);
  }
}

/* ---------- Scène helper ---------- */
async function swap(html) {
  const cur = stage.firstElementChild;
  if (cur) {
    cur.classList.add("out");
    await sleep(500);
  }
  stage.innerHTML = html;
}

async function typeInto(el, text, speed = 32) {
  el.classList.add("typing");
  el.textContent = "";
  for (const ch of text) {
    el.textContent += ch;
    await sleep(speed + (ch === "." || ch === "," ? 120 : 0));
  }
  el.classList.remove("typing");
}

/* ==========================================================
   SCÈNES
   ========================================================== */

/* ---------- Intro cinématique ---------- */
async function sceneIntro() {
  await swap(`
    <section class="card" role="region" aria-label="Introduction">
      <span class="eyebrow">Une histoire pour toi</span>
      <h1 class="title" id="intro-title">…</h1>
      <p class="subtitle" id="intro-sub">…</p>
      <div class="actions">
        <button class="btn btn-primary" id="start">Commencer l'aventure ✨</button>
      </div>
    </section>
  `);
  await typeInto($("#intro-title"), "Il paraît qu'un instant peut tout changer.");
  await sleep(300);
  await typeInto($("#intro-sub"), "Alors offre-moi quelques minutes… j'ai préparé un petit voyage rien que pour toi.", 22);
  $("#start").addEventListener("click", () => { sfx("chime"); sceneName(); });
}

/* ---------- Prénom + consentement ---------- */
async function sceneName() {
  await swap(`
    <section class="card">
      <span class="eyebrow">Faisons connaissance</span>
      <h1 class="title">Comment t'appelles-tu ?</h1>
      <p class="subtitle">Ton prénom rendra cette histoire vraiment personnelle.</p>
      <div class="field">
        <input id="name-input" class="text-input" type="text" value="${state.name}" maxlength="30" placeholder="Ton prénom" autocomplete="off" />
      </div>
      <div class="actions">
        <button class="btn btn-primary" id="name-ok">Continuer</button>
      </div>
    </section>
  `);
  const input = $("#name-input"); input.focus(); input.select();
  const go = () => {
    const v = input.value.trim(); if (!v) return input.focus();
    state.name = v.charAt(0).toUpperCase() + v.slice(1);
    sceneGreet();
  };
  $("#name-ok").addEventListener("click", go);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
}

async function sceneGreet() {
  await swap(`
    <section class="card">
      <span class="eyebrow">Enchanté</span>
      <h1 class="title" id="greet"></h1>
      <p class="subtitle" id="greet-sub"></p>
      <div class="actions">
        <button class="btn btn-primary" id="go">Je suis prête ❤️</button>
      </div>
    </section>
  `);
  burst(20, ["✨", "❤"]);
  await typeInto($("#greet"), `${state.name}, cette question est spécialement pour toi.`);
  await sleep(200);
  await typeInto($("#greet-sub"), "Prends une inspiration. On y va doucement…", 22);
  $("#go").addEventListener("click", () => sceneChapter(0));
}

/* ---------- 4 chapitres narratifs ---------- */
const CHAPTERS = [
  { eyebrow: "Chapitre 1", title: `${"NAME"}, j'ai quelque chose à t'avouer…`, sub: "Ça me trotte dans la tête depuis un moment.", cta: "Je t'écoute…" },
  { eyebrow: "Chapitre 2", title: "Depuis quelque temps…", sub: "Un détail t'a fait entrer dans mes pensées, et il n'en est plus jamais sorti.", cta: "Continue" },
  { eyebrow: "Chapitre 3", title: "Tu occupes souvent mes pensées.", sub: "Tes rires, ta façon d'être toi, tout simplement.", cta: "Et alors ?" },
  { eyebrow: "Chapitre 4", title: "J'ai une question à te poser.", sub: "Mais avant, apprenons à mieux nous connaître avec un petit quiz ❤️", cta: "Commencer le quiz" },
];
async function sceneChapter(i) {
  const c = CHAPTERS[i];
  const title = c.title.replace("NAME", state.name);
  await swap(`
    <section class="card">
      <span class="eyebrow">${c.eyebrow}</span>
      <h1 class="title" id="t"></h1>
      <p class="subtitle" id="s"></p>
      <div class="actions">
        <button class="btn btn-primary" id="next">${c.cta}</button>
      </div>
    </section>
  `);
  await typeInto($("#t"), title);
  await sleep(150);
  await typeInto($("#s"), c.sub, 22);
  $("#next").addEventListener("click", () => {
    sfx("pop");
    if (i < CHAPTERS.length - 1) sceneChapter(i + 1);
    else sceneQuiz(0);
  });
}

/* ---------- QUIZ ---------- */
const QUIZ = [
  { cat: "Romance", q: "Ta déclaration idéale ?", options: ["Sous les étoiles", "Dans une lettre", "Sur une plage", "Un dîner intime"] },
  { cat: "Goûts", q: "Ta soirée parfaite ?", options: ["Cinéma & pop-corn", "Balade main dans la main", "Restaurant cosy", "Danser toute la nuit"] },
  { cat: "Humour", q: "Un compliment qui te fait sourire ?", options: ["Tu es rayonnante", "Tu es drôle", "Tu es intelligente", "Tu es unique"] },
  { cat: "Musique", q: "Ton style musical romantique ?", options: ["Jazz doux", "Pop moderne", "R&B", "Acoustique"] },
  { cat: "Voyage", q: "Une destination avec quelqu'un que tu aimes ?", options: ["Paris ❤️", "Bali 🌴", "Santorin", "Kyoto 🌸"] },
  { cat: "Films", q: "Ton genre de film préféré à deux ?", options: ["Romance", "Comédie", "Aventure", "Drame"] },
  { cat: "Communication", q: "Le message parfait ?", options: ["Bonne nuit 🌙", "Je pense à toi", "Un vocal", "Un dessin"] },
  { cat: "Objectifs", q: "Dans dix ans, tu te vois…", options: ["Bien entourée", "Voyager", "Créer une famille", "Réaliser tes rêves"] },
  { cat: "Goûts", q: "Une gourmandise irrésistible ?", options: ["Chocolat", "Glace", "Macarons", "Fruits frais"] },
  { cat: "Romance", q: "Le geste qui touche le plus ?", options: ["Une main dans le dos", "Un regard complice", "Un mot doux", "Une surprise"] },
];
const COMPLIMENTS = [
  "Tu as un très bon goût 😄", "J'aime beaucoup cette réponse ❤️", "Je crois qu'on va bien s'entendre.",
  "Une réponse qui te ressemble.", "Voilà pourquoi tu es unique ✨", "Tellement toi ❤",
];
const SURPRISES = [
  { type: "compliment", text: `Tu es la personne la plus lumineuse que je connaisse.` },
  { type: "citation", text: `« Aimer, c'est trouver sa richesse hors de soi. » — Alain` },
  { type: "citation", text: `« Il n'y a qu'un bonheur dans la vie : aimer et être aimé. » — G. Sand` },
  { type: "souvenir", text: `Tu te souviens de ce fou rire qu'on n'arrivait pas à arrêter ? Je le rejoue souvent dans ma tête.` },
  { type: "gif", text: `🎁 Un petit cœur virtuel : 💝` },
];

async function sceneQuiz(i) {
  if (i >= QUIZ.length) return sceneMiniGame();
  const q = QUIZ[i];
  const total = QUIZ.length;
  const pct = Math.round((i / total) * 100);
  await swap(`
    <section class="card wide">
      <div class="progress"><span style="width:${pct}%"></span></div>
      <p class="step-info">Question ${i + 1} / ${total} · <span class="category-tag">${q.cat}</span></p>
      <h2 class="title" style="font-size:clamp(1.3rem,3.5vw,1.9rem)">${q.q}</h2>
      <div class="chip-group" role="radiogroup" aria-label="Options">
        ${q.options.map((o, j) => `<button class="chip" role="radio" data-i="${j}">${o}</button>`).join("")}
      </div>
      <div id="reply"></div>
      <div class="actions" style="margin-top:1rem">
        <button class="btn-mini" id="surprise">🎁 Ouvrir une surprise</button>
        ${i > 0 ? `<button class="btn-mini" id="skip">Passer →</button>` : ""}
      </div>
    </section>
  `);
  $$(".chip").forEach((c) =>
    c.addEventListener("click", async () => {
      $$(".chip").forEach((x) => x.classList.remove("selected"));
      c.classList.add("selected");
      sfx("pop");
      state.answers[q.cat] = (state.answers[q.cat] || 0) + 1;
      if (i === 0) unlock("first_answer");
      if (i === 4) unlock("streak5");
      const rep = $("#reply");
      rep.innerHTML = `<div class="surprise-card"><em>${pick(COMPLIMENTS)}</em></div>`;
      if (Math.random() < 0.25) burst(15, ["✨", "❤"]);
      await sleep(1100);
      // insert mini-game roughly midway
      if (i === 4) return sceneMiniGame(() => sceneQuiz(i + 1));
      if (i === 7) return sceneWheel(() => sceneQuiz(i + 1));
      sceneQuiz(i + 1);
    })
  );
  $("#surprise").addEventListener("click", () => {
    const s = pick(SURPRISES);
    const rep = $("#reply");
    rep.innerHTML = `<div class="surprise-card"><em>🎁 ${s.text}</em></div>`;
    burst(20, ["🎁", "✨", "❤"]);
    sfx("chime");
  });
  const skip = $("#skip"); if (skip) skip.addEventListener("click", () => sceneQuiz(i + 1));
}

/* ---------- Mini-jeu : attrape les cœurs ---------- */
async function sceneMiniGame(next) {
  await swap(`
    <section class="card wide">
      <span class="eyebrow">Mini-jeu</span>
      <h2 class="title" style="font-size:clamp(1.3rem,3.5vw,1.9rem)">Attrape 5 cœurs en 10 secondes ❤️</h2>
      <div class="mini-hud"><span>Score : <b id="ms">0</b> / 5</span><span>Temps : <b id="mt">10</b>s</span></div>
      <div class="mini-arena" id="arena"></div>
      <div class="actions"><button class="btn-mini" id="skip">Passer →</button></div>
    </section>
  `);
  const arena = $("#arena"); let score = 0; let t = 10;
  const spawn = () => {
    const h = document.createElement("div");
    h.className = "catch-heart"; h.textContent = pick(["❤️", "💖", "💕"]);
    h.style.left = rand(4, 90) + "%"; h.style.top = rand(4, 82) + "%";
    h.addEventListener("click", () => {
      score++; $("#ms").textContent = score; sfx("heart");
      h.style.transform = "scale(1.8)"; h.style.opacity = "0";
      setTimeout(() => h.remove(), 200);
      if (score >= 5) end(true);
    });
    arena.appendChild(h);
    setTimeout(() => h.remove(), 2000);
  };
  const spawnI = setInterval(spawn, 500); spawn();
  const tick = setInterval(() => { t--; $("#mt").textContent = t; if (t <= 0) end(false); }, 1000);
  const end = (win) => {
    clearInterval(spawnI); clearInterval(tick);
    if (win) { unlock("game_win"); burst(30); }
    setTimeout(() => (next ? next() : sceneQuiz(5)), 700);
  };
  $("#skip").addEventListener("click", () => { end(false); });
}

/* ---------- Roue de la chance ---------- */
async function sceneWheel(next) {
  const options = ["🍿 Cinéma", "🍕 Pizza", "🎳 Bowling", "🌅 Balade", "🎮 Jeux", "☕ Café"];
  const n = options.length; const seg = 360 / n;
  const grad = options.map((_, i) => {
    const c = `hsl(${(i * 360) / n},80%,65%)`;
    return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
  }).join(",");
  await swap(`
    <section class="card">
      <span class="eyebrow">Roue de la chance</span>
      <h2 class="title" style="font-size:clamp(1.3rem,3.5vw,1.9rem)">Notre prochaine activité ?</h2>
      <div class="wheel-wrap">
        <div class="wheel-pointer">▼</div>
        <div class="wheel" id="wheel" style="background:conic-gradient(${grad})"></div>
      </div>
      <p class="subtitle" id="result">Clique pour faire tourner la roue.</p>
      <div class="actions">
        <button class="btn btn-primary" id="spin">🎡 Faire tourner</button>
        <button class="btn-mini" id="next">Continuer →</button>
      </div>
    </section>
  `);
  const wheel = $("#wheel"); let rot = 0;
  $("#spin").addEventListener("click", () => {
    unlock("wheel");
    const winIdx = Math.floor(Math.random() * n);
    const target = 360 * 6 + (360 - (winIdx * seg + seg / 2));
    rot = target;
    wheel.style.transform = `rotate(${rot}deg)`;
    sfx("chime");
    setTimeout(() => { $("#result").innerHTML = `✨ La roue a choisi : <b>${options[winIdx]}</b>`; burst(20); }, 4700);
  });
  $("#next").addEventListener("click", () => (next ? next() : sceneQuestion()));
}

/* ---------- LA question (Oui / Non fugitif) ---------- */
async function sceneQuestion() {
  await swap(`
    <section class="card">
      <span class="eyebrow">La question</span>
      <h1 class="title" id="qt"></h1>
      <p class="subtitle" id="qs"></p>
      <div class="actions" id="qa">
        <button class="btn btn-primary" id="yes">Oui ❤️</button>
        <button class="btn btn-ghost btn-shy" id="no">Non</button>
      </div>
      <p class="subtitle" id="tease" style="min-height:1.3em;font-style:italic;color:var(--c-pink-2);margin-top:1rem"></p>
    </section>
  `);
  await typeInto($("#qt"), `${state.name}, veux-tu être ma Valentine ?`);
  await typeInto($("#qs"), "Prends ton temps… mais choisis avec le cœur.", 22);

  const yes = $("#yes"), no = $("#no"), tease = $("#tease");
  let attempts = 0;
  const TEASES = ["Tu es sûre ? 🥺", "Vraiment sûre ?", "Regarde encore le bouton rose…", "Il paraît que dire oui porte chance ✨", "Allez, une chance ? ❤️"];
  const growYes = () => { yes.style.transform = `scale(${1 + attempts * 0.12})`; };
  no.addEventListener("mouseenter", moveNo);
  no.addEventListener("focus", moveNo);
  no.addEventListener("click", (e) => { e.preventDefault(); moveNo(); });
  function moveNo() {
    attempts++;
    const r = stage.getBoundingClientRect();
    const nb = no.getBoundingClientRect();
    const maxX = r.width - nb.width - 20;
    const maxY = r.height - nb.height - 20;
    no.style.position = "fixed";
    no.style.left = clamp(rand(20, maxX), 20, innerWidth - nb.width - 20) + "px";
    no.style.top = clamp(rand(20, maxY), 20, innerHeight - nb.height - 20) + "px";
    tease.textContent = pick(TEASES);
    growYes();
    sfx("pop");
  }
  yes.addEventListener("click", () => { unlock("yes"); burst(80); sfx("chime"); sceneLetter(); });
}

/* ---------- Enveloppe + lettre ---------- */
async function sceneLetter() {
  await swap(`
    <section class="card wide">
      <span class="eyebrow">Pour toi</span>
      <h2 class="title" style="font-size:clamp(1.3rem,3.5vw,1.9rem)">Clique sur l'enveloppe 💌</h2>
      <div class="envelope" id="env" role="button" tabindex="0" aria-label="Ouvrir la lettre">
        <div class="body"></div>
        <div class="flap"></div>
        <div class="seal">❤</div>
      </div>
      <div id="letter-slot"></div>
      <div class="actions" style="margin-top:1rem"><button class="btn btn-primary" id="next" style="display:none">Découvrir notre compatibilité →</button></div>
    </section>
  `);
  const env = $("#env");
  const open = () => {
    if (env.classList.contains("open")) return;
    env.classList.add("open"); sfx("chime");
    setTimeout(() => {
      $("#letter-slot").innerHTML = `
        <div class="letter">
          <p>Chère ${state.name},</p>
          <p>Merci d'avoir joué le jeu jusqu'ici. Chaque réponse m'a fait sourire.</p>
          <p>Ce petit site n'est qu'un prétexte pour te dire ce que je pense vraiment : tu comptes, énormément.</p>
          <p class="sign">— Avec tout mon cœur ❤️</p>
        </div>`;
      $("#next").style.display = "";
      burst(30);
    }, 900);
  };
  env.addEventListener("click", open);
  env.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  $("#next").addEventListener("click", sceneCompat);
}

/* ---------- Compatibilité (jauges + anneau) ---------- */
async function sceneCompat() {
  const cats = ["Romance", "Humour", "Musique", "Goûts", "Films", "Voyage", "Communication", "Objectifs"];
  const values = cats.map(() => Math.floor(rand(78, 99)));
  const score = Math.min(100, Math.round(values.reduce((a, b) => a + b, 0) / values.length) + 3);
  state.score = score;
  if (score >= 92) unlock("soulmate");
  await swap(`
    <section class="card wide">
      <span class="eyebrow">Compatibilité</span>
      <h1 class="title" style="font-size:clamp(1.5rem,4vw,2.2rem)">Notre compatibilité</h1>
      <div class="score-ring" id="ring"><span id="score-n">0%</span></div>
      <div class="gauges">
        ${cats.map((c, i) => `
          <div class="gauge">
            <div class="lbl"><span>${c}</span><span id="g${i}v">0%</span></div>
            <div class="bar"><span id="g${i}"></span></div>
          </div>`).join("")}
      </div>
      <div class="actions" style="margin-top:1.25rem">
        <button class="btn btn-primary" id="next">Voir le certificat →</button>
      </div>
    </section>
  `);
  await sleep(50);
  const ring = $("#ring");
  ring.style.setProperty("--p", (score * 3.6) + "deg");
  const scoreN = $("#score-n"); let cur = 0;
  const ticker = setInterval(() => {
    cur = Math.min(score, cur + Math.max(1, Math.round((score - cur) / 8)));
    scoreN.textContent = cur + "%";
    if (cur >= score) clearInterval(ticker);
  }, 30);
  cats.forEach((_, i) => setTimeout(() => {
    $(`#g${i}`).style.width = values[i] + "%";
    $(`#g${i}v`).textContent = values[i] + "%";
  }, 200 + i * 120));
  $("#next").addEventListener("click", sceneCertificate);
}

/* ---------- Certificat + télécharger ---------- */
async function sceneCertificate() {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  await swap(`
    <section class="card wide">
      <span class="eyebrow">Souvenir</span>
      <h1 class="title" style="font-size:clamp(1.4rem,3.8vw,2rem)">Ton certificat</h1>
      <div id="cert" class="certificate">
        <h2>Certificat officiel de compatibilité ❤️</h2>
        <p>Il est officiellement reconnu que</p>
        <div class="names">${state.name} & Moi</div>
        <p>partagent une compatibilité de</p>
        <div class="score-big">${state.score}%</div>
        <div class="date-line">Délivré le ${date}</div>
      </div>
      <div class="actions" style="margin-top:1rem">
        <button class="btn btn-primary" id="dl">📥 Télécharger le souvenir</button>
        <button class="btn-mini" id="next">Continuer →</button>
      </div>
    </section>
  `);
  $("#dl").addEventListener("click", downloadCertificate);
  $("#next").addEventListener("click", sceneCapsule);
}

function downloadCertificate() {
  const c = document.createElement("canvas");
  c.width = 1200; c.height = 800;
  const g = c.getContext("2d");
  // fond
  const grad = g.createLinearGradient(0, 0, 1200, 800);
  grad.addColorStop(0, "#fffbf3"); grad.addColorStop(1, "#ffe4f0");
  g.fillStyle = grad; g.fillRect(0, 0, 1200, 800);
  // cadre
  g.strokeStyle = "#ff6ba9"; g.lineWidth = 6;
  g.strokeRect(40, 40, 1120, 720);
  g.lineWidth = 2; g.strokeRect(55, 55, 1090, 690);
  // titre
  g.fillStyle = "#ff6ba9"; g.font = "bold 44px Fraunces, serif";
  g.textAlign = "center";
  g.fillText("Certificat de compatibilité ❤", 600, 160);
  g.fillStyle = "#2b0b3d"; g.font = "italic 26px Fraunces, serif";
  g.fillText("Il est officiellement reconnu que", 600, 240);
  g.fillStyle = "#a06cd5"; g.font = "italic 70px Great Vibes, cursive";
  g.fillText(`${state.name} & Moi`, 600, 350);
  g.fillStyle = "#2b0b3d"; g.font = "26px Fraunces, serif";
  g.fillText("partagent une compatibilité de", 600, 420);
  g.fillStyle = "#ff6ba9"; g.font = "bold 110px Fraunces, serif";
  g.fillText(`${state.score}%`, 600, 550);
  g.fillStyle = "#7a5090"; g.font = "20px Inter, sans-serif";
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  g.fillText(`Délivré le ${date}`, 600, 640);
  g.font = "16px Inter, sans-serif";
  g.fillText("— Une histoire romantique interactive —", 600, 700);
  const link = document.createElement("a");
  link.download = `souvenir-${state.name}.png`;
  link.href = c.toDataURL("image/png");
  link.click();
  showToast("Souvenir téléchargé ❤");
}

/* ---------- Capsule temporelle ---------- */
async function sceneCapsule() {
  const saved = localStorage.getItem("love-capsule");
  await swap(`
    <section class="card">
      <span class="eyebrow">Capsule temporelle</span>
      <h2 class="title" style="font-size:clamp(1.3rem,3.5vw,1.9rem)">Un mot pour ton futur toi ?</h2>
      <p class="subtitle">Ton message sera conservé sur cet appareil. Tu pourras le relire.</p>
      <div class="field">
        <textarea id="cap" class="text-input text-area" placeholder="Cher moi du futur…">${saved || ""}</textarea>
      </div>
      <div class="actions">
        <button class="btn btn-primary" id="save">Sauvegarder</button>
        <button class="btn-mini" id="next">Aller à la fin →</button>
      </div>
    </section>
  `);
  $("#save").addEventListener("click", () => {
    localStorage.setItem("love-capsule", $("#cap").value);
    showToast("Message sauvegardé 💌"); sfx("chime");
  });
  $("#next").addEventListener("click", sceneFinal);
}

/* ---------- Écran final spectaculaire ---------- */
async function sceneFinal() {
  setAmbiance("fireworks");
  await swap(`
    <section class="card wide" style="text-align:center">
      <div class="big-heart">❤</div>
      <h1 class="title">Merci, ${state.name} ❤️</h1>
      <p class="subtitle">Compatibilité finale : <b>${state.score}%</b> · Badges : ${state.badges.size}</p>
      <div class="actions">
        <button class="btn btn-primary" id="share">🔗 Partager</button>
        <button class="btn btn-ghost" id="dl">📥 Souvenir</button>
        <button class="btn btn-ghost" id="again">↺ Revivre</button>
      </div>
    </section>
  `);
  const heartsRain = setInterval(() => burst(15, ["❤", "💖", "💕", "✨"]), 1200);
  setTimeout(() => clearInterval(heartsRain), 15000);
  burst(120);
  $("#dl").addEventListener("click", downloadCertificate);
  $("#again").addEventListener("click", () => { state.answers = {}; state.badges.clear(); renderBadges(); setAmbiance("galaxy"); sceneIntro(); });
  $("#share").addEventListener("click", async () => {
    const shareData = { title: "Une petite question pour toi ❤️", text: `${state.name} & Moi : ${state.score}% de compatibilité ❤`, url: location.href };
    if (navigator.share) { try { await navigator.share(shareData); } catch {} }
    else { await navigator.clipboard.writeText(location.href); showToast("Lien copié 📋"); }
  });
}

/* ---------- Démarrage ---------- */
(async () => {
  await sleep(1600);
  $("#loader").classList.add("hidden");
  await sleep(300);
  sceneIntro();
})();

/* =========================================================
   MUR DE CARTES glassmorphism : parallaxe + modale + score
   ========================================================= */
const BONUS_QUESTIONS = [
  { cat:"Câlins", q:"Câlin du matin ?", opts:["Oui absolument","Parfois","Plutôt un bisou","Un café d'abord"], best:0 },
  { cat:"Musique", q:"Notre style ?", opts:["Douce & lente","Dansante","Acoustique","Rap romantique"], best:0 },
  { cat:"Voyage", q:"Escapade idéale ?", opts:["Montagne","Plage","Ville","Nature"], best:1 },
  { cat:"Cinéma", q:"Un film ce soir ?", opts:["Romance","Comédie","Action","Animation"], best:0 },
  { cat:"Cadeau", q:"Le plus touchant ?", opts:["Fait main","Une lettre","Une fleur","Une chanson"], best:1 },
  { cat:"Rythme", q:"Ton moment préféré ?", opts:["Matin","Après-midi","Soirée","Nuit"], best:2 },
  { cat:"Saveur", q:"Un dessert à deux ?", opts:["Chocolat","Fraise","Vanille","Caramel"], best:0 },
  { cat:"Sortie", q:"On sort où ?", opts:["Concert","Musée","Parc","Restaurant"], best:0 },
  { cat:"Douceur", q:"Ta faiblesse ?", opts:["Les regards","Les mots","Les gestes","Les silences"], best:0 },
  { cat:"Complicité", q:"Signe de complicité ?", opts:["Un fou rire","Un surnom","Un secret","Un projet"], best:0 },
  { cat:"Mots", q:"Ce que tu aimes entendre ?", opts:["Je pense à toi","Tu me manques","Tu es belle","Merci"], best:0 },
  { cat:"Rêves", q:"Un rêve à deux ?", opts:["Voyager loin","Construire","Créer","Grandir"], best:1 },
];

const wall = $("#cards-wall");
let cards = [];
let cardIO = null;
const isMobile = matchMedia("(max-width:640px)").matches;
const cardsAnswered = new Set();

function buildCardsWall() {
  if (!wall || isMobile) return;
  const w = innerWidth, h = innerHeight;
  const cols = w >= 1600 ? 6 : w >= 1200 ? 5 : 4;
  const rows = 4;
  const cellW = w / cols, cellH = h / rows;
  const frag = document.createDocumentFragment();
  cards = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = (r * cols + c) % BONUS_QUESTIONS.length;
      const q = BONUS_QUESTIONS[idx];
      const el = document.createElement("button");
      el.type = "button";
      el.className = "gcard";
      el.dataset.qidx = idx;
      const jx = rand(-cellW * 0.15, cellW * 0.15);
      const jy = rand(-cellH * 0.15, cellH * 0.15);
      const x = c * cellW + (cellW - 170) / 2 + jx;
      const y = r * cellH + (cellH - 200) / 2 + jy;
      const depth = rand(-140, 80);
      const rot = rand(-6, 6);
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.setProperty("--baseX", x + "px");
      el.style.setProperty("--baseY", y + "px");
      el.style.setProperty("--depth", depth);
      el.style.setProperty("--rz", rot + "deg");
      el.style.setProperty("--tz", depth + "px");
      el.innerHTML = `<span class="g-cat">${q.cat}</span><span class="g-q">${q.q}</span><span class="g-hint">Clique pour répondre →</span>`;
      el.addEventListener("click", () => openModal(idx, el));
      frag.appendChild(el);
      cards.push(el);
    }
  }
  wall.innerHTML = "";
  wall.appendChild(frag);
  observeCards();
}

function observeCards() {
  if (cardIO) cardIO.disconnect();
  cardIO = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle("in-view", e.isIntersecting);
  }, { rootMargin: "80px" });
  cards.forEach((c) => cardIO.observe(c));
}

/* Parallaxe souris + scroll — GPU only, rAF-throttled */
let pmx = 0.5, pmy = 0.5, scrollY = 0, wallRAF = 0, wallDirty = false;
function scheduleWall() {
  if (wallDirty) return;
  wallDirty = true;
  wallRAF = requestAnimationFrame(applyParallax);
}
function applyParallax() {
  wallDirty = false;
  if (document.body.classList.contains("reduce-motion")) return;
  for (const el of cards) {
    if (!el.classList.contains("in-view")) continue;
    const d = parseFloat(el.style.getPropertyValue("--depth")) || 0;
    const factor = (d + 140) / 220; // 0..1
    const tx = (pmx - 0.5) * 40 * factor;
    const ty = (pmy - 0.5) * 40 * factor + scrollY * factor * 0.15;
    el.style.setProperty("--tx", tx + "px");
    el.style.setProperty("--ty", ty + "px");
  }
}
window.addEventListener("mousemove", (e) => {
  pmx = e.clientX / innerWidth;
  pmy = e.clientY / innerHeight;
  scheduleWall();
}, { passive: true });
window.addEventListener("scroll", () => { scrollY = window.scrollY; scheduleWall(); }, { passive: true });
window.addEventListener("resize", () => { buildCardsWall(); }, { passive: true });

/* ---------- Modale question bonus ---------- */
const modal = $("#modal");
let modalCardEl = null;
function openModal(idx, cardEl) {
  const q = BONUS_QUESTIONS[idx];
  modalCardEl = cardEl;
  $("#modal-cat").textContent = q.cat;
  $("#modal-q").textContent = q.q;
  $("#modal-feedback").textContent = "";
  const opts = $("#modal-options");
  opts.innerHTML = q.opts.map((o, j) => `<button class="chip" data-j="${j}">${o}</button>`).join("");
  opts.querySelectorAll(".chip").forEach((b) =>
    b.addEventListener("click", () => {
      const j = +b.dataset.j;
      opts.querySelectorAll(".chip").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      sfx("pop");
      // Score : +8 pts pour la « meilleure » réponse, +4 sinon
      const pts = j === q.best ? 8 : 4;
      state.answers[q.cat] = (state.answers[q.cat] || 0) + pts;
      state.score = Math.min(100, (state.score || 0) + pts);
      if (!cardsAnswered.has(idx)) {
        cardsAnswered.add(idx);
        cardEl?.classList.add("answered");
        if (cardsAnswered.size === 1) unlock("first_answer");
        if (cardsAnswered.size >= 5) unlock("streak5");
      }
      $("#modal-feedback").innerHTML = `<em>${pick(COMPLIMENTS)}</em> · <b>+${pts}</b> compatibilité (${state.score}%)`;
      burst(10, ["✨", "❤"]);
      setTimeout(closeModal, 900);
    })
  );
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modalCardEl = null;
}
modal.addEventListener("click", (e) => { if (e.target.dataset.close !== undefined) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

/* Build wall after first paint */
requestAnimationFrame(() => buildCardsWall());
