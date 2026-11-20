import * as THREE from "three";
import { FOTOS } from "./esfera.js?v=2";

/* ============ CONFIGURAÇÃO ============ */
const TOTAL_FOTOS = FOTOS.length;   // fotos da esfera embutidas em esfera.js
const N = 20;            // quantidade de planos na esfera

/* ============ ANIMAÇÕES, DOCK, GALERIA ============ */
(function () {
  /* Entrada ao rolar */
  var io = new IntersectionObserver(function (e) {
    e.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.rv').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * .08 + 's';
    io.observe(el);
  });

  /* Dock: aba ativa conforme a rolagem */
  var tabs = [].slice.call(document.querySelectorAll('.dock a.t'));
  var map = tabs.map(function (t) { return document.querySelector(t.getAttribute('href')); });
  function act() {
    var y = innerHeight * .45, cur = -1;
    map.forEach(function (s, i) { if (s.getBoundingClientRect().top < y) cur = i; });
    tabs.forEach(function (t, i) { t.classList.toggle('on', i === cur); });
  }
  addEventListener('scroll', act, { passive: true });
  act();

  /* Ajusta cada moldura ao formato real da foto */
  function fitBox(img, min, max) {
    function go() {
      var r = img.naturalWidth / img.naturalHeight;
      if (!r) return;
      r = Math.min(max, Math.max(min, r));
      img.parentNode.style.aspectRatio = r;
      img.parentNode.classList.add('fit');
    }
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go);
  }
  document.querySelectorAll('.ph img').forEach(function (i) { fitBox(i, 0.75, 2); });
  document.querySelectorAll('.portrait img').forEach(function (i) { fitBox(i, 0.6, 1.5); });

  /* Galeria das categorias */
  var lb = document.getElementById('lb'), img = document.getElementById('lbImg'), thumbs = document.getElementById('thumbs');
  var titleEl = document.getElementById('lbTitle'), countEl = document.getElementById('lbCount');
  var emptyEl = document.getElementById('lbEmpty'), folderEl = document.getElementById('lbFolder');
  var cache = {}, list = [], idx = 0;

  // descobre quantas fotos existem: 1.jpg, 2.jpg, ... até faltar uma
  function probe(cat) {
    if (cache[cat]) return Promise.resolve(cache[cat]);
    return new Promise(function (resolve) {
      var found = [], n = 1;
      (function next() {
        if (n > 60) { cache[cat] = found; return resolve(found); }
        var src = 'fotos/' + cat + '/' + n + '.jpg', t = new Image();
        t.onload = function () { found.push(src); n++; next(); };
        t.onerror = function () { cache[cat] = found; resolve(found); };
        t.src = src;
      })();
    });
  }

  function show(i) {
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    img.classList.add('out');
    setTimeout(function () { img.src = list[idx]; img.classList.remove('out'); }, 180);
    countEl.textContent = (idx + 1) + ' / ' + list.length;
    [].forEach.call(thumbs.children, function (t, k) { t.classList.toggle('on', k === idx); });
    var on = thumbs.children[idx];
    if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  function open(cat, title) {
    titleEl.innerHTML = title; countEl.textContent = '';
    thumbs.innerHTML = ''; img.removeAttribute('src');
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('noscroll');
    img.style.display = 'none'; emptyEl.style.display = 'none'; folderEl.textContent = cat;
    probe(cat).then(function (l) {
      list = l;
      if (!l.length) { emptyEl.style.display = 'block'; return; }
      img.style.display = '';
      l.forEach(function (src, k) {
        var t = new Image(); t.src = src; t.alt = '';
        t.onclick = function () { show(k); };
        thumbs.appendChild(t);
      });
      img.src = l[0]; show(0);
    });
  }
  function close() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('noscroll');
  }

  document.querySelectorAll('[data-cat]').forEach(function (c) {
    c.addEventListener('click', function () { open(c.dataset.cat, c.dataset.title); });
  });
  document.getElementById('lbClose').onclick = close;
  document.getElementById('lbPrev').onclick = function () { show(idx - 1); };
  document.getElementById('lbNext').onclick = function () { show(idx + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.id === 'stage') close(); });
  addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var sx = null, stage = document.getElementById('stage');
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });
})();

// Legendas da galeria. Chave = "pasta/número da foto" (ex.: cidades/1 = fotos/cidades/1.jpg)
// Para editar: troque o texto entre aspas. Use sempre aspas duplas e termine a linha com vírgula.
// Foto sem legenda aparece normalmente.
export const LEGENDAS = {

  // ---- Cotidiano & As Cidades ----
  "cidades/1": "Pôr do sol alaranjado com barco ancorado. Belém (PA) · 11/2024",
  "cidades/2": "Redes coloridas e venda de queijo manteiga de Almeirim a bordo de um barco. Pará · 11/2024",
  "cidades/3": "Bandeira de São Paulo entre prédios e guarda-sóis. São Paulo (SP) · 03/2025",
  "cidades/4": "Casa de madeira azul à beira do rio, com canoa. Icoaraci (PA) · 11/2024",
  "cidades/5": "Cúpula de vidro de aeroporto ao entardecer. Fortaleza (CE) · 11/2017",
  "cidades/6": "Crianças brincando na água ao lado de uma canoa. Icoaraci (PA) · 11/2024",
  "cidades/7": "Banca de feira com pimentas, alhos e molhos. Rio de Janeiro (RJ) · 08/2025",
  "cidades/8": "Arco-íris sobre os prédios da cidade. Salvador (BA) · 04/2026",
  "cidades/9": "Cestos de palha cheios de açaí. Icoaraci (PA) · 11/2024",
  "cidades/10": "Silhueta de barco contra o pôr do sol. Belém (PA) · 11/2024",
  "cidades/11": "Fim de tarde na praia, com banhistas e pôr do sol. Salvador (BA) · 06/2025",

  // ---- Natureza & Seus Seres ----
  "natureza/1": "Tartaruga nadando na superfície da água. Belém (PA) · 11/2024",
  "natureza/2": "Coruja empoleirada entre as folhas de uma árvore. Belém (PA) · 11/2024",
  "natureza/3": "Garça branca em um galho com coqueiros e céu azul ao fundo. Belém (PA) · 11/2024",
  "natureza/4": "Pássaro amarelo caminhando na areia da praia. Macaé (RJ) · 06/2024",
  "natureza/5": "Aves pousadas sobre as rochas à beira-mar. Macaé (RJ) · 06/2024",
  "natureza/6": "Borboleta pousada em uma folha verde. São Francisco de Itabapoana (RJ) · 01/2025",
  "natureza/7": "Bois reunidos em área rural. São Francisco de Itabapoana (RJ) · 01/2025",
  "natureza/8": "Lua minguante no céu azul durante o dia. Macaé (RJ) · 07/2024",
  "natureza/9": "Céu estrelado durante a noite. Paraná do Serpa (AM) · 11/2024",
  "natureza/10": "Lua cheia brilhando no céu escuro. Campos dos Goytacazes (RJ) · 01/2025",
  "natureza/11": "Pôr do sol dourado sobre o mar e montanhas ao fundo. Rio de Janeiro (RJ) · 12/2024",
  "natureza/12": "Caverna de pedras com iluminação. Presidente Figueiredo (AM) · 12/2024",
  "natureza/13": "Rio e vegetação verde sob céu azul com nuvens. Teresópolis (RJ) · 12/2021",
  "natureza/14": "Estufa com flores e folhagens. Belém (PA) · 11/2024",
  "natureza/15": "Copa de coqueiro contra prédio e céu azul limpo. Campos dos Goytacazes (RJ) · 12/2024",
  "natureza/16": "Rio avermelhado cercado pela mata. Presidente Figueiredo (AM) · 12/2024",
  "natureza/17": "Estrutura coletiva de palha cercada de árvores altas. Rio de Janeiro (RJ) · 08/2018",
  "natureza/18": "Encosta rochosa e mar de águas cristalinas. Rio das Ostras (RJ) · 02/2022",
  "natureza/19": "Rio de águas claras cercado por floresta verde. Presidente Figueiredo (AM) · 12/2024",
  "natureza/20": "Vista panorâmica de enseada com mar azul e morros verdes. Rio de Janeiro (RJ) · 01/2018",
  "natureza/21": "Botão de flor de lótus entre vitórias-régias verdes na água. Belém (PA) · 11/2024",
  "natureza/22": "Farol histórico à beira do mar azul-turquesa. Salvador (BA) · 11/2025",
  "natureza/23": "Coqueiros altos na praia em dia ensolarado. Rio de Janeiro (RJ) · 12/2024",
  "natureza/24": "Céu alaranjado e azul no fim de tarde sobre o mar. Fortaleza (CE) · 05/2017",

  // ---- Comidas Irresistíveis ----
  "comidas/1": "Risoto de cogumelos servido ao ar livre junto a um rio e vegetação. Teresópolis (RJ)",
  "comidas/2": "Panela de barro na brasa preparando moqueca à beira-mar. Rio das Ostras (RJ)",
  "comidas/3": "Moqueca de banana-da-terra em cumbuca de barro com o mar ao fundo. Rio das Ostras (RJ)",
  "comidas/4": "Feijoada acompanhada de farofa, couve e rodela de laranja. Campos dos Goytacazes (RJ)",
  "comidas/5": "Produto embalado com rótulo central da marca Farofeito. Campos dos Goytacazes (RJ)",
  "comidas/6": "Hambúrguer artesanal acompanhado de batatas fritas. Cordeiro (RJ)",
  "comidas/7": "Bolo decorado com frutas frescas por cima. Campos dos Goytacazes (RJ)",
  "comidas/8": "Bolo de cenoura com cobertura de chocolate e fatia cortada ao lado. Teresópolis (RJ)",
  "comidas/9": "Bolo de amendoim com cobertura de chocolate. Teresópolis (RJ)",
  "comidas/10": "Sushi hossomaki Califórnia dispostos no prato. Campos dos Goytacazes (RJ)",
  "comidas/11": "Harumaki de camarão dourado com molho e folhas verdes decorativas. Campos dos Goytacazes (RJ)",
  "comidas/12": "Sushi Hot Filadélfia dourados e crocantes com folhas verdes decorativas. Campos dos Goytacazes (RJ)",

  // ---- Estadias e Experiências ----
  "estadias/1": "Sala com sofá confortável, mesa de centro rústica de tronco e artes na parede. Airbnb, Belém (PA) · 2024",
  "estadias/2": "Área interna ampla com escada de entrada e sala de estar ao fundo. Airbnb, Belém (PA) · 2024",
  "estadias/3": "Varanda aberta gradeada com portas de vidro amplas, cadeira de madeira e plantas. Airbnb, Belém (PA) · 2024",
  "estadias/4": "Cantinho de trabalho com mesa de vidro, cadeira branca e quadro colorido. Airbnb, Belém (PA) · 2024",
  "estadias/5": "Banheiro com azulejos verdes vintage e pia amarela. Airbnb, Belém (PA) · 2024",
  "estadias/6": "Cozinha com azulejos vintage, fogão, pia e armários de madeira. Airbnb, Belém (PA) · 2024",
  "estadias/7": "Casa com jardim florido ao pôr do sol. Airbnb, São Francisco de Itabapoana (RJ) · 2025",
  "estadias/8": "Quarto com cama de madeira e cadeira rede de balanço. São Francisco de Itabapoana (RJ) · 2025",
  "estadias/9": "Quarto com janela de madeira e vista para jardim. São Francisco de Itabapoana (RJ) · 2025",
  "estadias/10": "Banheiro de azulejos claros com detalhe azul. São Francisco de Itabapoana (RJ) · 2025",
  "estadias/11": "Casinha de passarinho de madeira sobre um tronco. São Francisco de Itabapoana (RJ) · 2025",

/* ============ ESFERA 3D ============ */
const el = document.getElementById("sphere");
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
el.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.z = 12;
const scene = new THREE.Scene();
const group = new THREE.Group();
scene.add(group);

let k = 1, R = 3, S = 1.4;
const planes = [];

/* sombra suave (gradiente radial) */
const shadowTex = (function () {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64);
  gr.addColorStop(0, "rgba(0,0,0,0.75)"); gr.addColorStop(0.55, "rgba(0,0,0,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
const loader = new THREE.TextureLoader();

for (let i = 0; i < N; i++) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x1b1b1d, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  const y = i * (2 / N) - 1 + 1 / N;
  const r = Math.sqrt(1 - y * y);
  const a = Math.PI * (3 - Math.sqrt(5)) * i;
  mesh.userData = { dir: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), aspect: 1.5 };
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  sh.position.set(0.05, -0.09, -0.25); sh.scale.set(1.5, 1.5, 1);
  mesh.add(sh);
  mesh.userData.mat = mat; mesh.userData.shadow = sh;
  loader.load(FOTOS[i % TOTAL_FOTOS], function (tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
    mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true;
    mesh.userData.aspect = tex.image.width / tex.image.height;
    layout();
  });
  group.add(mesh);
  planes.push(mesh);
}

function layout() {
  planes.forEach(function (m) {
    m.position.copy(m.userData.dir).multiplyScalar(R);
    const asp = m.userData.aspect;
    if (asp >= 1) m.scale.set(S, S / asp, 1); else m.scale.set(S * asp, S, 1);
  });
}

function resize() {
  const w = el.clientWidth, h = el.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  k = (2 * 12 * Math.tan(Math.PI / 6)) / h;
  const base = Math.min(w, h);
  R = k * base * (w < 700 ? 0.37 : 0.42);
  S = k * base * (w < 700 ? 0.15 : 0.15);
  layout();
}
addEventListener("resize", resize);
resize();

let vx = 0, vy = 0, drag = false, lx = 0, ly = 0, idle = true;
el.addEventListener("pointerdown", function (e) { drag = true; idle = false; lx = e.clientX; ly = e.clientY; });
addEventListener("pointerup", function () { drag = false; });
addEventListener("pointermove", function (e) {
  if (!drag) return;
  vx += (e.clientX - lx) * 0.0012;
  vy += (e.clientY - ly) * 0.0012;
  lx = e.clientX; ly = e.clientY;
});

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
const AY = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3(1, 0, 0);
const inv = new THREE.Quaternion();
const tv = new THREE.Vector3();

function frame() {
  requestAnimationFrame(frame);
  if (idle && !reduce) vx += 0.00012;
  qa.setFromAxisAngle(AY, vx);
  qb.setFromAxisAngle(AX, vy);
  group.quaternion.premultiply(qa).premultiply(qb);
  vx *= 0.94; vy *= 0.94;
  inv.copy(group.quaternion).invert();
  planes.forEach(function (m) {
    m.quaternion.copy(inv);
    tv.copy(m.userData.dir).applyQuaternion(group.quaternion);
    const f = 0.5 + 0.5 * tv.z;                       // 0 = atrás, 1 = frente
    let op = 1;
    if (tv.z > 0) {                                    // fotos da frente se afastam do centro (texto)
      const d = Math.min(1, Math.hypot(tv.x, tv.y) / 0.62);
      op = 0.1 + 0.9 * d * d * (3 - 2 * d);
    }
    const mat = m.userData.mat;
    mat.opacity = op;
    if (mat.map) mat.color.setScalar(0.4 + 0.6 * f);   // profundidade: atrás mais escuro
    m.userData.shadow.material.opacity = op * (0.35 + 0.65 * f);
  });
  renderer.render(scene, camera);
}
frame();
