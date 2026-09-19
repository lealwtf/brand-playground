/* app.js — controles, estado, persistência, abas, exportação */
(function () {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const KEY = 'brand-playground:v1';
  const SERVER = /^https?:$/.test(location.protocol);
  const clone = o => JSON.parse(JSON.stringify(o));
  const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  const set = (o, p, v) => { const ks = p.split('.'); let t = o; for (let i = 0; i < ks.length - 1; i++) { if (t[ks[i]] == null || typeof t[ks[i]] !== 'object') t[ks[i]] = {}; t = t[ks[i]]; } t[ks[ks.length - 1]] = v; };
  const merge = (base, over) => { if (Array.isArray(base) || Array.isArray(over)) return over === undefined ? base : over; if (typeof base !== 'object' || base === null) return over === undefined ? base : over; const out = {...base}; for (const k in over) out[k] = (typeof base[k] === 'object' && base[k] !== null && !Array.isArray(base[k])) ? merge(base[k], over[k]) : over[k]; return out; };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const rnd = a => a[Math.floor(Math.random() * a.length)];

  let state = clone(BP.DEFAULT_STATE);
  let history = [], hIdx = -1, lastGroupKey = null, lastGroupAt = 0;
  const updaters = [];   // funções que atualizam partes derivadas da sidebar

  const TABS = [['site', 'Site'], ['logo', 'Logo'], ['colors', 'Cores & Tipo'], ['kit', 'UI Kit'], ['apps', 'Aplicações'], ['voice', 'Voz'], ['manifesto', 'Manifesto'], ['sheet', 'Brand Sheet']];
  if (BP.GUIDE) TABS.push(['guide', 'Começo']);

  /* ---------------- Fontes (Google) ---------------- */
  BP.fontUrl = (name, italic) => {
    const f = BP.fontMeta(name);
    const fam = encodeURIComponent(name).replace(/%20/g, '+');
    let axes = `wght@${f.w}`;
    if (italic && f.i) { const wi = f.wi || f.w; axes = f.w.includes('..') ? `ital,wght@0,${f.w};1,${wi}` : `ital,wght@${f.w.split(';').map(x => '0,' + x).join(';')};${wi.split(';').map(x => '1,' + x).join(';')}`; }
    return `https://fonts.googleapis.com/css2?family=${fam}:${axes}&display=swap`;
  };
  const loadedFonts = new Set();
  function ensureFont(name, italic) {
    const key = name + (italic ? ':i' : '');
    if (loadedFonts.has(key)) return;
    loadedFonts.add(key);
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = BP.fontUrl(name, italic); document.head.appendChild(l);
  }
  function ensureStateFonts() { const t = state.type; ensureFont(t.head); ensureFont(t.body); ensureFont(t.accent, true); ensureFont(t.mono); ensureFont(state.logo.font); }

  /* ---------------- Persistência ---------------- */
  const statusEl = $('#tb-status');
  function setStatus(txt, cls) { statusEl.textContent = txt; statusEl.className = 'status ' + (cls || ''); }
  const hhmm = () => new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('localStorage', e); } }
  let serverOk = SERVER;
  async function saveServer() {
    if (!serverOk) return;
    try { const r = await fetch('/api/state', {method: 'PUT', headers: {'content-type': 'application/json'}, body: JSON.stringify(state)}); if (!r.ok) throw new Error(r.status); setStatus(`Salvo em brand.json às ${hhmm()}`, 'ok'); }
    catch (e) { serverOk = false; setStatus(`Salvo no navegador às ${hhmm()} (servidor indisponível)`, 'ok'); }
  }
  const saveServerDebounced = debounce(saveServer, 600);
  function scheduleSave() {
    state.meta.updatedAt = Date.now();
    setStatus('Salvando…', 'saving');
    saveLocal();
    if (serverOk) saveServerDebounced(); else setStatus(`Salvo no navegador às ${hhmm()}`, 'ok');
  }
  async function load() {
    let local = null; try { local = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    let remote = null;
    if (SERVER) { try { const r = await fetch('/api/state'); if (r.ok) remote = await r.json(); else if (r.status !== 404) serverOk = false; } catch (e) { serverOk = false; } }
    const pick = (remote && (!local || (remote.meta?.updatedAt || 0) >= (local.meta?.updatedAt || 0))) ? remote : local;
    if (pick && pick.v === 1) state = merge(clone(BP.DEFAULT_STATE), pick);
    if (SERVER && serverOk && !remote && local) saveServer();
  }

  /* ---------------- Histórico ---------------- */
  function pushHistory(groupKey) {
    const now = Date.now();
    const snap = JSON.stringify(state);
    if (groupKey && groupKey === lastGroupKey && now - lastGroupAt < 900 && hIdx >= 0) { history[hIdx] = snap; lastGroupAt = now; return; }
    history = history.slice(0, hIdx + 1); history.push(snap); if (history.length > 120) history.shift(); hIdx = history.length - 1;
    lastGroupKey = groupKey; lastGroupAt = now; updateUndoBtns();
  }
  function restore(i) { state = JSON.parse(history[i]); hIdx = i; lastGroupKey = null; syncControls(); scheduleSave(); render(); updateUndoBtns(); }
  function undo() { if (hIdx > 0) { restore(hIdx - 1); toast('Desfeito'); } }
  function redo() { if (hIdx < history.length - 1) { restore(hIdx + 1); toast('Refeito'); } }
  function updateUndoBtns() { $('#btn-undo').disabled = hIdx <= 0; $('#btn-redo').disabled = hIdx >= history.length - 1; }

  /* ---------------- Mutação ---------------- */
  function touch(path) { const t = state.meta.touched; const key = path.split('.').slice(0, 2).join('.'); if (!t.includes(key)) t.push(key); }
  function commit(path, value, o = {}) {
    set(state, path, value); touch(path);
    if (o.after) o.after(value);
    pushHistory(o.group ? path : null); scheduleSave(); render(o); syncSoon();
  }
  function commitMany(fn, label) { fn(state); pushHistory(null); scheduleSave(); syncControls(); render(); if (label) toast(label); }

  /* ---------------- Schema dos controles ---------------- */
  const SHADOWS = [['none', 'Nenhuma'], ['soft', 'Suave'], ['diffuse', 'Difusa'], ['hard', 'Dura'], ['tinted', 'Colorida']];
  const SCHEMA = [
    {id: 'identity', title: 'Identidade', icon: '✎', help: 'Nome, tagline e iniciais. Tudo o mais deriva daqui.', fields: [
      {k: 'identity.name', t: 'text', l: 'Nome da marca', group: 1, after: v => { if (!state.meta.touched.includes('identity.initials.manual')) state.identity.initials = BP.autoInitials(v); }},
      {k: 'identity.tagline', t: 'text', l: 'Tagline', group: 1},
      {k: 'identity.initials', t: 'text', l: 'Iniciais (logo)', max: 3, group: 1, after: () => { if (!state.meta.touched.includes('identity.initials.manual')) state.meta.touched.push('identity.initials.manual'); }},
      {k: 'identity.oneliner', t: 'textarea', l: 'Uma frase sobre', group: 1},
      {k: 'identity.domain', t: 'text', l: 'Domínio (ideia)', group: 1},
      {t: 'custom', id: 'namegen', l: 'Gerador de nomes'},
      {t: 'custom', id: 'domains', l: 'Domínios'},
    ]},
    {id: 'logo', title: 'Logo com iniciais', icon: '◈', help: 'Monograma: iniciais dentro de uma forma. Aba "Logo" mostra todas as variações.', fields: [
      {t: 'custom', id: 'logoPreview'},
      {k: 'logo.shape', t: 'segment', l: 'Forma do símbolo', o: BP.SHAPES.map(x => [x.id, x.n])},
      {k: 'logo.lockup', t: 'segment', l: 'Composição', o: [['horizontal', 'Símbolo + nome'], ['vertical', 'Empilhado'], ['symbol', 'Só símbolo'], ['wordmark', 'Só nome']]},
      {k: 'logo.font', t: 'font', l: 'Fonte do logo'},
      {k: 'logo.weight', t: 'range', l: 'Peso', min: 300, max: 900, step: 100},
      {k: 'logo.size', t: 'range', l: 'Tamanho das iniciais', min: 26, max: 82},
      {k: 'logo.tracking', t: 'range', l: 'Espaço entre letras', min: -8, max: 8},
      {k: 'logo.yShift', t: 'range', l: 'Ajuste vertical', min: -10, max: 10},
      {k: 'logo.case', t: 'segment', l: 'Caixa das iniciais', o: [['upper', 'AB'], ['lower', 'ab'], ['mixed', 'Ab']]},
      {k: 'logo.detail', t: 'segment', l: 'Detalhe', o: [['none', 'Nenhum'], ['.', 'Ponto'], ['_', 'Underline'], ['*', 'Asterisco'], ['/', 'Barra'], [':', 'Dois pontos'], ['+', 'Mais'], ['°', 'Grau']]},
      {k: 'logo.bg', t: 'segment', l: 'Cor do símbolo', o: [['primary', 'Primária'], ['secondary', 'Secundária'], ['accent', 'Acento'], ['ink', 'Tinta'], ['gradient', 'Gradiente']]},
      {k: 'logo.fg', t: 'segment', l: 'Cor das letras', o: [['paper', 'Papel'], ['ink', 'Tinta'], ['primary', 'Primária'], ['accent', 'Acento'], ['secondary', 'Secundária']]},
      {k: 'logo.tilt', t: 'range', l: 'Inclinação do símbolo', min: -15, max: 15, help: 'Um pouco de inclinação deixa playful. Muito, deixa bêbado.'},
      {k: 'logo.wordCase', t: 'segment', l: 'Caixa do nome', o: [['normal', 'Como escrito'], ['lower', 'minúsculas'], ['upper', 'MAIÚSCULAS']]},
      {k: 'logo.wordWeight', t: 'range', l: 'Peso do nome', min: 300, max: 900, step: 100},
      {k: 'logo.italic', t: 'toggle', l: 'Nome em itálico'},
      {k: 'logo.gap', t: 'range', l: 'Espaço símbolo–nome', min: 4, max: 24},
    ]},
    {id: 'colors', title: 'Cores', icon: '◐', help: 'Cinco cores bastam: primária, secundária, acento, papel e tinta. O resto é derivado.', fields: [
      {t: 'custom', id: 'palettes', l: 'Paletas prontas'},
      {k: 'colors.primary', t: 'color', l: 'Primária'},
      {k: 'colors.secondary', t: 'color', l: 'Secundária'},
      {k: 'colors.accent', t: 'color', l: 'Acento'},
      {k: 'colors.paper', t: 'color', l: 'Papel (fundo claro)'},
      {k: 'colors.ink', t: 'color', l: 'Tinta (texto / fundo escuro)'},
      {t: 'custom', id: 'harmony', l: 'Gerar a partir da primária'},
      {k: 'colors.gradient', t: 'toggle', l: 'Usar gradiente (primária → secundária)'},
      {k: 'colors.gradientAngle', t: 'range', l: 'Ângulo do gradiente', min: 0, max: 360, step: 15, unit: '°'},
      {t: 'custom', id: 'contrast', l: 'Contraste (WCAG)'},
    ]},
    {id: 'type', title: 'Tipografia', icon: 'Aa', help: 'Título + corpo + uma fonte de acento (itálico) + mono. Duplas prontas abaixo.', fields: [
      {t: 'custom', id: 'fontPairs', l: 'Duplas sugeridas'},
      {k: 'type.head', t: 'font', l: 'Fonte de títulos'},
      {k: 'type.body', t: 'font', l: 'Fonte de corpo'},
      {k: 'type.accent', t: 'font', l: 'Fonte de acento (itálico, destaques)', italic: 1},
      {k: 'type.mono', t: 'font', l: 'Fonte mono (código, labels)'},
      {k: 'type.taglineFont', t: 'segment', l: 'Fonte da tagline', o: [['head', 'Títulos'], ['accent', 'Acento (itálico)'], ['body', 'Corpo']], help: 'Onde a tagline aparece como frase inteira: verso do cartão, post do manifesto. A fonte de acento é boa em palavra solta, pesada em frase longa.'},
      {k: 'type.headWeight', t: 'range', l: 'Peso dos títulos', min: 300, max: 900, step: 100},
      {k: 'type.bodyWeight', t: 'range', l: 'Peso do corpo', min: 300, max: 600, step: 100},
      {k: 'type.base', t: 'range', l: 'Tamanho base', min: 14, max: 21, unit: 'px'},
      {k: 'type.scale', t: 'segment', l: 'Escala tipográfica', o: [[1.2, '1.200 menor'], [1.25, '1.250'], [1.333, '1.333'], [1.414, '1.414'], [1.5, '1.500 dramática']]},
      {k: 'type.lh', t: 'range', l: 'Altura de linha (corpo)', min: 1.3, max: 1.9, step: 0.05},
      {k: 'type.headLh', t: 'range', l: 'Altura de linha (títulos)', min: 0.9, max: 1.4, step: 0.02},
      {k: 'type.headTracking', t: 'range', l: 'Tracking dos títulos', min: -5, max: 8, step: 0.5, unit: '/100em'},
      {k: 'type.headCase', t: 'segment', l: 'Caixa dos títulos', o: [['normal', 'Normal'], ['lower', 'minúsculas'], ['upper', 'MAIÚSCULAS'], ['title', 'Title Case']]},
      {k: 'type.highlight', t: 'segment', l: 'Destaque em títulos', o: [['none', 'Nenhum'], ['color', 'Cor'], ['marker', 'Marca-texto'], ['squiggle', 'Rabisco'], ['serif', 'Itálico de acento'], ['box', 'Caixinha']], help: 'Nos textos, marque a palavra com *asteriscos*. O rabisco vira onda de verdade quando voce rola a previa (desliga em Movimento: Nenhum).'},
    ]},
    {id: 'shape', title: 'Forma & bordas', icon: '▢', help: 'Raio, borda, sombra, densidade. É o que separa "corporativo" de "amigável".', fields: [
      {k: 'shape.radius', t: 'range', l: 'Raio das bordas', min: 0, max: 32, unit: 'px'},
      {k: 'shape.pill', t: 'toggle', l: 'Botões em pílula'},
      {k: 'shape.corners', t: 'segment', l: 'Cantos dos cards', o: [['uniform', 'Iguais'], ['leaf', 'Folha'], ['top', 'Só em cima'], ['diagonal', 'Diagonal']]},
      {k: 'shape.borderW', t: 'segment', l: 'Espessura de borda', o: [[0, '0'], [1, '1px'], [2, '2px'], [3, '3px']]},
      {k: 'shape.shadow', t: 'segment', l: 'Sombra', o: SHADOWS},
      {k: 'shape.btn', t: 'segment', l: 'Estilo de botão', o: [['filled', 'Preenchido'], ['outline', 'Contorno'], ['soft', 'Suave'], ['brutal', 'Brutal'], ['gradient', 'Gradiente']]},
      {k: 'shape.card', t: 'segment', l: 'Estilo de card', o: [['flat', 'Flat'], ['bordered', 'Com borda'], ['elevated', 'Elevado'], ['glass', 'Vidro'], ['soft', 'Tingido'], ['brutal', 'Brutal']]},
      {k: 'shape.density', t: 'segment', l: 'Densidade', o: [['compact', 'Compacta'], ['comfortable', 'Confortável'], ['airy', 'Arejada']]},
      {k: 'shape.iconStroke', t: 'range', l: 'Traço dos ícones', min: 1, max: 3, step: 0.25},
    ]},
    {id: 'pattern', title: 'Padrões & movimento', icon: '✦', help: 'Textura de fundo e enfeites. Pouco é mais. Mas um pouco é bom.', fields: [
      {k: 'pattern.bg', t: 'segment', l: 'Textura de fundo', o: BP.PATTERNS.map(x => [x.id, x.n])},
      {k: 'pattern.intensity', t: 'range', l: 'Intensidade', min: 0, max: 100, unit: '%'},
      {k: 'pattern.sparkles', t: 'toggle', l: 'Sparkles ✦'},
      {k: 'pattern.sticker', t: 'toggle', l: 'Sticker rotacionado'},
      {k: 'pattern.blobs', t: 'toggle', l: 'Blobs de cor desfocados'},
      {k: 'pattern.arrows', t: 'toggle', l: 'Seta rabiscada "começa aqui"'},
      {k: 'pattern.anim', t: 'segment', l: 'Animação', o: [['none', 'Nenhuma'], ['subtle', 'Sutil'], ['playful', 'Brincalhona']], help: 'Passe o mouse nos botões e cards do preview.'},
    ]},
    {id: 'site', title: 'Estilo do site', icon: '▤', help: 'Estrutura da landing page.', fields: [
      {k: 'site.hero', t: 'segment', l: 'Layout do hero', o: [['left', 'Texto + visual'], ['centered', 'Centralizado'], ['split', 'Dividido'], ['editorial', 'Editorial'], ['bento', 'Bento']]},
      {k: 'site.nav', t: 'segment', l: 'Menu', o: [['floating', 'Pílula flutuante'], ['bar', 'Barra completa'], ['minimal', 'Mínimo']]},
      {k: 'site.width', t: 'segment', l: 'Largura do conteúdo', o: [['narrow', 'Estreita'], ['medium', 'Média'], ['wide', 'Larga']]},
      {k: 'site.image', t: 'segment', l: 'Estilo de imagem', o: [['shapes', 'Formas'], ['illustration', 'Mascote'], ['photo', 'Foto'], ['3d', '3D']]},
      {k: 'site.footer', t: 'segment', l: 'Rodapé', o: [['big', 'Grande com CTA'], ['columns', 'Colunas'], ['minimal', 'Mínimo']]},
      {k: 'site.theme', t: 'segment', l: 'Tema padrão', o: [['light', 'Claro'], ['dark', 'Escuro']]},
      {t: 'custom', id: 'sections', l: 'Seções da página'},
    ]},
    {id: 'voice', title: 'Voz & escrita', icon: '“', help: 'Os sliders mudam os textos do site e das amostras na aba "Voz".', fields: [
      {t: 'custom', id: 'tonePresets', l: 'Presets de tom'},
      {k: 'voice.casual', t: 'tone', l: 'Registro', a: 'Formal', b: 'Casual'},
      {k: 'voice.playful', t: 'tone', l: 'Humor', a: 'Sério', b: 'Brincalhão'},
      {k: 'voice.simple', t: 'tone', l: 'Linguagem', a: 'Técnico', b: 'Simples'},
      {k: 'voice.warm', t: 'tone', l: 'Proximidade', a: 'Reservado', b: 'Caloroso'},
      {k: 'voice.person', t: 'segment', l: 'Como a marca se chama', o: [['a gente', '"a gente"'], ['nós', '"nós"'], ['eu', '"eu"']]},
      {k: 'voice.address', t: 'segment', l: 'Como chama o cliente', o: [['você', '"você"'], ['vocês', '"vocês"'], ['sua empresa', '"sua empresa"']]},
      {k: 'voice.emoji', t: 'segment', l: 'Emoji', o: [['nunca', 'Nunca'], ['raro', 'Raro'], ['frequente', 'Frequente']]},
      {t: 'custom', id: 'variation', l: 'Variação dos textos'},
      {k: 'voice.headline', t: 'text', l: 'Headline própria (opcional)', group: 1, help: 'Deixe vazio pra usar a gerada. Use *asteriscos* pra destacar.'},
      {k: 'voice.sub', t: 'textarea', l: 'Subtítulo próprio (opcional)', group: 1},
      {k: 'voice.cta', t: 'text', l: 'CTA próprio (opcional)', group: 1},
      {k: 'voice.use', t: 'chips', l: 'Palavras que usamos'},
      {k: 'voice.avoid', t: 'chips', l: 'Palavras que evitamos'},
    ]},
    {id: 'purpose', title: 'Propósito & valores', icon: '♥', help: 'Missão, visão, valores, arquétipo, posicionamento. Aparece no Manifesto e no Brand Sheet.', fields: [
      {k: 'purpose.mission', t: 'textarea', l: 'Missão', group: 1, help: 'O que a gente faz, pra quem, e por quê.'},
      {k: 'purpose.vision', t: 'textarea', l: 'Visão', group: 1, help: 'Como o mundo fica se der certo.'},
      {k: 'purpose.promise', t: 'text', l: 'Promessa de marca', group: 1, help: 'Uma frase que dá pra cobrar.'},
      {t: 'custom', id: 'archetype', l: 'Arquétipo (clique: principal · clique de novo: secundário)'},
      {k: 'purpose.mood', t: 'chips', l: 'Mood (adjetivos)', bank: BP.MOOD_BANK},
      {k: 'purpose.values', t: 'list', l: 'Valores', bank: BP.VALUE_BANK},
      {k: 'purpose.are', t: 'chips', l: 'Somos', bank: BP.ARE_BANK},
      {k: 'purpose.arent', t: 'chips', l: 'Não somos', bank: BP.ARENT_BANK},
      {k: 'purpose.audience', t: 'chips', l: 'Público-alvo', bank: BP.AUDIENCE_BANK},
      {k: 'purpose.services', t: 'list', l: 'Serviços'},
      {t: 'custom', id: 'positioning', l: 'Posicionamento'},
      {k: 'purpose.manifesto', t: 'textarea', l: 'Manifesto', rows: 9, group: 1, help: 'Uma frase por linha. Linhas pares viram itálico de acento.'},
    ]},
    {id: 'versions', title: 'Versões & diário', icon: '⌛', help: 'Salve versões pra comparar depois. Anote o porquê das decisões.', fields: [
      {t: 'custom', id: 'snapshots', l: 'Versões salvas'},
      {t: 'custom', id: 'notes', l: 'Diário de decisões'},
    ]},
  ];

  /* ---------------- Construção dos controles ---------------- */
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]); } for (const c of kids) if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c))); return e; };
  const fieldWrap = (f, ...kids) => { const w = el('div', {class: 'field', 'data-s': ((f.l || '') + ' ' + (f.help || '')).toLowerCase()}, ...kids); if (f.help) w.append(el('div', {class: 'help'}, f.help)); return w; };
  const label = (f, val) => { const lb = el('label', {}, f.l); if (val !== undefined) lb.append(el('span', {class: 'val'}, val)); return lb; };

  const builders = {
    text(f) { const inp = el('input', {type: 'text', maxlength: f.max, value: get(state, f.k) ?? ''}); inp.addEventListener('input', () => commit(f.k, inp.value, {group: f.group, after: f.after})); updaters.push(() => { if (document.activeElement !== inp) inp.value = get(state, f.k) ?? ''; }); return fieldWrap(f, label(f), inp); },
    textarea(f) { const inp = el('textarea', {rows: f.rows || 3}); inp.value = get(state, f.k) ?? ''; inp.addEventListener('input', () => commit(f.k, inp.value, {group: f.group})); updaters.push(() => { if (document.activeElement !== inp) inp.value = get(state, f.k) ?? ''; }); return fieldWrap(f, label(f), inp); },
    range(f) { const v = get(state, f.k); const inp = el('input', {type: 'range', min: f.min, max: f.max, step: f.step || 1, value: v}); const lb = label(f, v + (f.unit || '')); inp.addEventListener('input', () => { const val = parseFloat(inp.value); lb.querySelector('.val').textContent = val + (f.unit || ''); commit(f.k, val, {group: true}); }); updaters.push(() => { const val = get(state, f.k); inp.value = val; lb.querySelector('.val').textContent = val + (f.unit || ''); }); return fieldWrap(f, lb, inp); },
    tone(f) { const v = get(state, f.k); const inp = el('input', {type: 'range', min: 0, max: 100, value: v}); const lb = label(f, v); inp.addEventListener('input', () => { lb.querySelector('.val').textContent = inp.value; commit(f.k, parseInt(inp.value), {group: true}); }); updaters.push(() => { inp.value = get(state, f.k); lb.querySelector('.val').textContent = get(state, f.k); }); return fieldWrap(f, lb, el('div', {class: 'tone'}, inp, el('div', {class: 'ends'}, el('span', {}, f.a), el('span', {}, f.b)))); },
    color(f) { const v = get(state, f.k); const pick = el('input', {type: 'color', value: v}); const hex = el('input', {type: 'text', value: v, maxlength: 7, spellcheck: 'false'}); const apply = val => { if (/^#[0-9a-f]{6}$/i.test(val)) { pick.value = val; hex.value = val; commit(f.k, val.toLowerCase(), {group: true}); } }; pick.addEventListener('input', () => apply(pick.value)); hex.addEventListener('input', () => { let x = hex.value.trim(); if (!x.startsWith('#')) x = '#' + x; apply(x); }); updaters.push(() => { const val = get(state, f.k); pick.value = val; if (document.activeElement !== hex) hex.value = val; }); return fieldWrap(f, label(f), el('div', {class: 'color-ctl'}, pick, hex)); },
    segment(f) { const wrap = el('div', {class: 'seg'}); const btns = f.o.map(([val, txt]) => { const b = el('button', {type: 'button'}, txt); b.addEventListener('click', () => commit(f.k, val)); return [val, b]; }); btns.forEach(([, b]) => wrap.append(b)); const sync = () => { const cur = get(state, f.k); btns.forEach(([val, b]) => b.classList.toggle('on', String(val) === String(cur))); }; sync(); updaters.push(sync); return fieldWrap(f, label(f), wrap); },
    toggle(f) { const inp = el('input', {type: 'checkbox'}); inp.checked = !!get(state, f.k); inp.addEventListener('change', () => commit(f.k, inp.checked)); updaters.push(() => { inp.checked = !!get(state, f.k); }); return fieldWrap(f, el('label', {class: 'sw'}, inp, el('span', {}, f.l))); },
    font(f) {
      const sel = el('select'); const cats = {}; BP.FONTS.forEach(x => (cats[x.c] = cats[x.c] || []).push(x));
      for (const c in cats) { const og = el('optgroup', {label: BP.FONT_CATS[c] || c}); cats[c].forEach(x => og.append(el('option', {value: x.n}, x.n))); sel.append(og); }
      sel.value = get(state, f.k);
      const prev = el('div', {class: 'font-preview'}, 'O futuro chegou calmo. Aa Bb 123');
      const syncPrev = () => { const n = get(state, f.k); ensureFont(n, f.italic); prev.style.fontFamily = BP.fontFamily(n); prev.style.fontStyle = f.italic ? 'italic' : 'normal'; sel.value = n; };
      sel.addEventListener('change', () => commit(f.k, sel.value));
      const all = el('button', {type: 'button', class: 'btn sm fix'}, 'ver todas'); all.addEventListener('click', () => openFontModal(f));
      const prevB = el('button', {type: 'button', class: 'btn sm fix', title: 'anterior'}, '‹'); const nextB = el('button', {type: 'button', class: 'btn sm fix', title: 'próxima'}, '›');
      const step = d => { const i = BP.FONTS.findIndex(x => x.n === get(state, f.k)); const nx = BP.FONTS[(i + d + BP.FONTS.length) % BP.FONTS.length]; commit(f.k, nx.n); };
      prevB.addEventListener('click', () => step(-1)); nextB.addEventListener('click', () => step(1));
      syncPrev(); updaters.push(syncPrev);
      return fieldWrap(f, label(f), el('div', {class: 'font-ctl'}, el('div', {class: 'row'}, sel, prevB, nextB, all), prev));
    },
    chips(f) {
      const wrap = el('div', {class: 'chips'}); const inp = el('input', {class: 'chip-input', placeholder: '+ adicionar e Enter'});
      const bankWrap = el('div', {class: 'chips'});
      const sync = () => { const hadFocus = document.activeElement === inp, draft = inp.value; wrap.innerHTML = ''; (get(state, f.k) || []).forEach((x, i) => { const ch = el('span', {class: 'chip'}, x); const del = el('button', {class: 'x', type: 'button', title: 'remover'}, '×'); del.addEventListener('click', () => { const arr = [...get(state, f.k)]; arr.splice(i, 1); commit(f.k, arr); }); ch.append(del); wrap.append(ch); }); wrap.append(inp); inp.value = draft; if (hadFocus) inp.focus(); if (f.bank) { bankWrap.innerHTML = ''; f.bank.filter(b => !(get(state, f.k) || []).includes(b)).slice(0, 14).forEach(b => { const c = el('span', {class: 'chip bank'}, '+ ' + b); c.addEventListener('click', () => commit(f.k, [...get(state, f.k), b])); bankWrap.append(c); }); } };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && inp.value.trim()) { e.preventDefault(); commit(f.k, [...get(state, f.k), inp.value.trim()]); inp.value = ''; setTimeout(() => wrap.querySelector('.chip-input')?.focus(), 0); } });
      sync(); updaters.push(sync);
      return fieldWrap(f, label(f), wrap, f.bank ? bankWrap : null);
    },
    list(f) {
      const wrap = el('div', {class: 'lst'}); const bankWrap = el('div', {class: 'chips'});
      const sync = () => {
        wrap.innerHTML = '';
        (get(state, f.k) || []).forEach((it, i) => {
          const n = el('input', {type: 'text', value: it.n, placeholder: 'Nome'}); const d = el('textarea', {placeholder: 'Descrição curta'}); d.value = it.d || '';
          const upd = () => { const arr = clone(get(state, f.k)); arr[i] = {n: n.value, d: d.value}; commit(f.k, arr, {group: true}); };
          n.addEventListener('input', upd); d.addEventListener('input', upd);
          const x = el('button', {class: 'x', type: 'button', title: 'remover'}, '×'); x.addEventListener('click', () => { const arr = clone(get(state, f.k)); arr.splice(i, 1); commit(f.k, arr); });
          wrap.append(el('div', {class: 'item'}, n, d, x));
        });
        const add = el('button', {type: 'button', class: 'btn sm'}, '+ adicionar'); add.addEventListener('click', () => commit(f.k, [...get(state, f.k), {n: 'Novo', d: ''}])); wrap.append(add);
        if (f.bank) { bankWrap.innerHTML = ''; f.bank.filter(b => !(get(state, f.k) || []).some(x => x.n === b.n)).forEach(b => { const c = el('span', {class: 'chip bank', title: b.d}, '+ ' + b.n); c.addEventListener('click', () => commit(f.k, [...get(state, f.k), {n: b.n, d: b.d}])); bankWrap.append(c); }); }
      };
      sync(); updaters.push(() => { if (!wrap.contains(document.activeElement)) sync(); });
      return fieldWrap(f, label(f), wrap, f.bank ? bankWrap : null);
    },
    custom(f) { const node = CUSTOM[f.id](f); return node; },
  };

  /* ---------------- Controles customizados ---------------- */
  function genNames() {
    const N = BP.NAMES, out = new Set();
    const inv = () => { const n = 2 + Math.floor(Math.random() * 2); let w = ''; for (let i = 0; i < n; i++) w += rnd(N.onsets) + rnd(N.vowels); if (Math.random() < .4) w += rnd(['n', 'r', 'l', 's', 'x']); return BP.cap(w); };
    const F = [() => rnd(N.pt), () => rnd(N.en), () => rnd(N.pt) + rnd(N.suffix), () => rnd(N.en) + rnd(N.suffix), () => rnd(N.prefix) + rnd(N.pt), () => rnd(N.pt) + ' & ' + rnd(N.pt), () => inv(), () => inv() + rnd(N.suffix), () => rnd(N.en) + ' ' + rnd(N.pt).toLowerCase(), () => inv() + ' Studio'];
    let guard = 0; while (out.size < 12 && guard++ < 100) out.add(rnd(F)());
    return [...out];
  }
  const CUSTOM = {
    namegen(f) {
      const grid = el('div', {class: 'names'}); const short = el('div', {class: 'chips'});
      const btn = el('button', {type: 'button', class: 'btn'}, '🎲 Sugerir 12 nomes');
      const draw = names => { grid.innerHTML = ''; names.forEach(n => { const s = el('span', {title: 'usar este nome'}, n); s.addEventListener('click', () => commitMany(st => { st.identity.name = n; st.identity.initials = BP.autoInitials(n); st.meta.touched = st.meta.touched.filter(x => x !== 'identity.initials.manual'); }, `Nome: ${n}`)); const star = el('button', {type: 'button', title: 'guardar na shortlist'}, '☆'); star.addEventListener('click', () => { if (!state.identity.shortlist.includes(n)) commit('identity.shortlist', [...state.identity.shortlist, n]); }); grid.append(el('div', {class: 'nm'}, s, star)); }); };
      btn.addEventListener('click', () => draw(genNames()));
      const syncShort = () => { short.innerHTML = ''; if (!state.identity.shortlist.length) { short.append(el('span', {class: 'help'}, 'Shortlist vazia. Clique ☆ pra guardar nomes.')); return; } state.identity.shortlist.forEach((n, i) => { const c = el('span', {class: 'chip'}); const t = el('span', {style: 'cursor:pointer'}, n); t.addEventListener('click', () => commitMany(st => { st.identity.name = n; st.identity.initials = BP.autoInitials(n); }, `Nome: ${n}`)); const x = el('button', {class: 'x', type: 'button'}, '×'); x.addEventListener('click', () => { const a = [...state.identity.shortlist]; a.splice(i, 1); commit('identity.shortlist', a); }); c.append(t, x); short.append(c); }); };
      syncShort(); updaters.push(syncShort);
      return fieldWrap(f, label(f), btn, grid, el('label', {}, 'Shortlist'), short);
    },
    domains(f) {
      const id = () => state.identity;
      const baseInp = el('input', {type: 'text', placeholder: BP.domainBase(state.identity.name) || 'palavra-base'});
      const dice = el('button', {type: 'button', class: 'btn sm fix', title: 'outras variações'}, '🎲');
      const tldWrap = el('div', {class: 'chips'});
      const listA = el('div', {class: 'doms'}), listB = el('div', {class: 'doms'}), favWrap = el('div', {class: 'doms'});
      const varSel = el('select', {style: 'width:auto;padding:2px 4px;font-size:11px'});
      const headB = el('div', {class: 'dom-head'}, 'Variações em ', varSel);
      const headFav = el('div', {class: 'dom-head'}, 'Favoritos');
      const checkBtn = el('button', {type: 'button', class: 'btn primary'}, 'Checar disponibilidade');
      const manual = el('input', {type: 'text', placeholder: 'checar outro domínio: exemplo.com.br'});
      const manualBtn = el('button', {type: 'button', class: 'btn sm fix'}, 'checar');
      const manualOut = el('div', {class: 'doms'});

      const badge = st => { const [txt, cls] = BP.DOMAIN_STATUS[st] || (st === 'checando' ? ['…', 'un'] : ['?', 'un']); return el('span', {class: 'd-st ' + cls}, txt); };
      const setBadge = (d, st) => $$('.dom[data-d="' + CSS.escape(d) + '"]').forEach(row => { const old = row.querySelector('.d-st'); if (old) old.replaceWith(badge(st)); });

      const row = dom => {
        const r = el('div', {class: 'dom' + (id().domain === dom ? ' on' : ''), 'data-d': dom});
        const use = el('button', {type: 'button', class: 'd-use', title: 'usar como domínio da marca'}, dom);
        use.addEventListener('click', () => commit('identity.domain', dom));
        const fav = el('button', {type: 'button', class: 'ib2' + (id().domainShortlist.includes(dom) ? ' on' : ''), title: 'favoritar'}, id().domainShortlist.includes(dom) ? '★' : '☆');
        fav.addEventListener('click', () => { const l = [...id().domainShortlist]; const i = l.indexOf(dom); i >= 0 ? l.splice(i, 1) : l.push(dom); commit('identity.domainShortlist', l); });
        const ext = el('a', {class: 'ib2', href: BP.domainSearchUrl(dom), target: '_blank', rel: 'noopener', title: 'buscar no Instant Domain Search'}, '↗');
        const reg = el('a', {class: 'ib2', href: BP.domainRegistrarUrl(dom), target: '_blank', rel: 'noopener', title: /\.br$/.test(dom) ? 'abrir no registro.br' : 'abrir a ficha do domínio'}, '⌁');
        r.append(use, badge(id().domainChecked[dom] || 'desconhecido'), fav, ext, reg);
        return r;
      };
      const visible = () => [...listA.children, ...listB.children].map(x => x.dataset.d).filter(Boolean);

      const sync = () => {
        const s = id();
        const base = s.domainBase || BP.domainBase(s.name);
        if (document.activeElement !== baseInp) { baseInp.value = s.domainBase; baseInp.placeholder = BP.domainBase(s.name) || 'palavra-base'; }
        tldWrap.innerHTML = '';
        BP.DOMAIN_TLDS.forEach(t => {
          const on = s.domainTlds.includes(t);
          const c = el('span', {class: 'chip' + (on ? '' : ' bank'), style: 'cursor:pointer'}, t);
          c.addEventListener('click', () => { const l = [...s.domainTlds]; const i = l.indexOf(t); i >= 0 ? l.splice(i, 1) : l.push(t); commit('identity.domainTlds', l); });
          tldWrap.append(c);
        });
        if (varSel.options.length !== BP.DOMAIN_TLDS.length) { varSel.innerHTML = ''; BP.DOMAIN_TLDS.forEach(t => varSel.append(el('option', {value: t}, t))); }
        varSel.value = s.domainVarTld;
        listA.innerHTML = ''; listB.innerHTML = ''; favWrap.innerHTML = '';
        if (!base) { listA.append(el('span', {class: 'help'}, 'Dê um nome à marca (ou escreva uma palavra-base) para gerar domínios.')); return; }
        s.domainTlds.forEach(t => listA.append(row(base + t)));
        BP.domainVariants(s.name, base, s.domainSeed, 14).forEach(v => listB.append(row(v + s.domainVarTld)));
        if (!s.domainShortlist.length) favWrap.append(el('span', {class: 'help'}, 'Nenhum favorito. Clique ☆ para guardar.'));
        else s.domainShortlist.forEach(dm => favWrap.append(row(dm)));
      };

      baseInp.addEventListener('input', () => commit('identity.domainBase', BP.slugify(baseInp.value), {group: true}));
      dice.addEventListener('click', () => commit('identity.domainSeed', (id().domainSeed || 0) + 1));
      varSel.addEventListener('change', () => commit('identity.domainVarTld', varSel.value));
      checkBtn.addEventListener('click', async () => {
        checkBtn.disabled = true; checkBtn.textContent = 'Checando…';
        await checkDomains(visible(), setBadge);
        checkBtn.disabled = false; checkBtn.textContent = 'Checar disponibilidade';
      });
      const doManual = async () => {
        const dm = manual.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (!/^[a-z0-9][a-z0-9-]*(\.[a-z]{2,20}){1,2}$/.test(dm)) { toast('Domínio inválido'); return; }
        manualOut.innerHTML = ''; manualOut.append(row(dm));
        await checkDomains([dm], setBadge);
      };
      manualBtn.addEventListener('click', doManual);
      manual.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doManual(); } });

      sync(); updaters.push(sync);
      return fieldWrap({...f, help: 'Clique no domínio para adotá-lo · ☆ favorita · ↗ Instant Domain Search · ⌁ ficha do domínio. A checagem consulta o registro público (RDAP) pelo servidor local.'},
        label(f), el('div', {class: 'row'}, baseInp, dice), tldWrap,
        el('div', {class: 'dom-head'}, 'Seu nome'), listA, headB, listB,
        checkBtn, headFav, favWrap,
        el('div', {class: 'dom-head'}, 'Checar um domínio específico'), el('div', {class: 'row'}, manual, manualBtn), manualOut);
    },
    logoPreview(f) { const box = el('div', {class: 'logo-mini'}); const sync = () => { box.innerHTML = BP.lockup(state, {size: 44}); box.style.setProperty('--b-fg', state.colors.ink); box.style.color = state.colors.ink; }; sync(); updaters.push(sync); return fieldWrap({l: '', help: 'Prévia rápida. Aba "Logo" tem todas as variações.'}, box); },
    palettes(f) { const g = el('div', {class: 'pal'}); BP.PALETTES.forEach(p => { const b = el('button', {type: 'button', title: p.m}); b.append(el('div', {class: 'sw-row'}, ...['primary', 'secondary', 'accent', 'paper', 'ink'].map(k => el('i', {style: `background:${p[k]}`}))), el('span', {class: 'pn'}, p.n)); b.addEventListener('click', () => commitMany(st => { Object.assign(st.colors, {primary: p.primary, secondary: p.secondary, accent: p.accent, paper: p.paper, ink: p.ink}); st.meta.touched.push('colors.primary'); }, `Paleta: ${p.n}`)); g.append(b); }); return fieldWrap(f, label(f), g); },
    harmony(f) { const row = el('div', {class: 'seg'}); [['analog', 'Análoga'], ['comp', 'Complementar'], ['triad', 'Tríade'], ['soft', 'Suave']].forEach(([m, n]) => { const b = el('button', {type: 'button'}, n); b.addEventListener('click', () => commitMany(st => Object.assign(st.colors, BP.harmony(st.colors.primary, m)), `Harmonia ${n.toLowerCase()} gerada`)); row.append(b); }); return fieldWrap({...f, help: 'Recalcula secundária, acento, papel e tinta a partir da primária.'}, label(f), row); },
    contrast(f) { const box = el('div', {class: 'contrast'}); const sync = () => { const c = state.colors; const on = BP.bestOn(c.primary, c.paper, c.ink); const pairs = [[c.ink, c.paper, 'Texto no papel'], [c.primary, c.paper, 'Primária no papel'], [on, c.primary, 'Texto no botão'], [c.paper, c.ink, 'Papel na tinta'], [c.ink, c.accent, 'Tinta no acento']]; box.innerHTML = ''; pairs.forEach(([fg, bg, n]) => { const r = BP.contrast(fg, bg); const [lbl, cls] = BP.badge(r); box.append(el('div', {class: 'c-row'}, el('span', {class: 'c-sample', style: `background:${bg};color:${fg}`}, 'Aa'), el('span', {}, n), el('span', {class: 'c-ratio'}, r.toFixed(2)), el('span', {class: 'badge ' + cls}, lbl))); }); }; sync(); updaters.push(sync); return fieldWrap(f, label(f), box); },
    fontPairs(f) { const w = el('div', {class: 'pairs'}); BP.FONT_PAIRS.forEach(p => { const b = el('button', {type: 'button', class: 'pair'}); b.append(el('span', {class: 'ph', style: `font-family:${BP.fontFamily(p.head)};font-weight:700`}, p.head), el('span', {class: 'pb', style: `font-family:${BP.fontFamily(p.body)}`}, p.body + ' · ' + p.accent), el('span', {class: 'pn'}, p.n)); b.addEventListener('mouseenter', () => { ensureFont(p.head); ensureFont(p.body); }, {once: true}); b.addEventListener('click', () => commitMany(st => { Object.assign(st.type, {head: p.head, body: p.body, accent: p.accent, mono: p.mono}); st.logo.font = p.head; st.meta.touched.push('type.head'); }, `Dupla: ${p.n}`)); w.append(b); }); return fieldWrap(f, label(f), w); },
    sections(f) { const names = {clients: 'Clientes', services: 'Serviços', process: 'Processo', cases: 'Cases', manifesto: 'Manifesto', team: 'Time', testimonials: 'Depoimentos', faq: 'FAQ', cta: 'CTA final'}; const g = el('div', {class: 'grid-2'}); const inputs = {}; for (const k in names) { const inp = el('input', {type: 'checkbox'}); inp.checked = !!state.site.sections[k]; inp.addEventListener('change', () => commit('site.sections.' + k, inp.checked)); inputs[k] = inp; g.append(el('label', {class: 'sw'}, inp, el('span', {}, names[k]))); } updaters.push(() => { for (const k in inputs) inputs[k].checked = !!state.site.sections[k]; }); return fieldWrap(f, label(f), g); },
    tonePresets(f) { const P = [['Consultor sereno', {casual: 30, playful: 20, simple: 55, warm: 55, person: 'nós', emoji: 'nunca'}], ['Amigo nerd', {casual: 70, playful: 60, simple: 45, warm: 75, person: 'a gente', emoji: 'raro'}], ['Parceiro direto', {casual: 60, playful: 35, simple: 80, warm: 50, person: 'a gente', emoji: 'nunca'}], ['Visionário calmo', {casual: 45, playful: 40, simple: 60, warm: 65, person: 'nós', emoji: 'raro'}], ['Descontraído', {casual: 90, playful: 85, simple: 80, warm: 85, person: 'a gente', emoji: 'frequente'}], ['Solo, com rosto', {casual: 75, playful: 55, simple: 70, warm: 80, person: 'eu', emoji: 'raro'}]]; const row = el('div', {class: 'seg'}); P.forEach(([n, v]) => { const b = el('button', {type: 'button'}, n); b.addEventListener('click', () => commitMany(st => Object.assign(st.voice, v), `Tom: ${n}`)); row.append(b); }); return fieldWrap(f, label(f), row); },
    variation(f) { const b = el('button', {type: 'button', class: 'btn'}, '↻ Outra variação de texto'); b.addEventListener('click', () => commit('voice.seed', (state.voice.seed || 0) + 1)); return fieldWrap({...f, help: 'Troca headline e frases geradas por outra opção do mesmo tom.'}, b); },
    archetype(f) { const g = el('div', {class: 'arch'}); const btns = BP.ARCHETYPES.map(a => { const b = el('button', {type: 'button', title: a.s}); b.append(el('b', {}, a.e + ' ' + a.n), el('small', {}, a.d)); b.addEventListener('click', () => { if (state.purpose.archetype === a.id) return; if (state.purpose.archetype2 === a.id) commit('purpose.archetype2', null); else if (!state.purpose.archetype2 || state.purpose.archetype2 === state.purpose.archetype) commit('purpose.archetype2', a.id); else commitMany(st => { st.purpose.archetype = a.id; }, `Arquétipo principal: ${a.n}`); }); g.append(b); return [a.id, b]; }); const sync = () => btns.forEach(([id, b]) => { b.classList.toggle('on', state.purpose.archetype === id); b.classList.toggle('on2', state.purpose.archetype2 === id); }); sync(); updaters.push(sync); const setMain = el('button', {type: 'button', class: 'btn sm'}, 'Trocar principal ↔ secundário'); setMain.addEventListener('click', () => { if (state.purpose.archetype2) commitMany(st => { [st.purpose.archetype, st.purpose.archetype2] = [st.purpose.archetype2, st.purpose.archetype]; }); }); return fieldWrap({...f, help: 'Sólido = principal. Tracejado = secundário.'}, label(f), g, setMain); },
    positioning(f) { const keys = [['who', 'Para (quem)'], ['need', 'que (precisa de)'], ['category', 'a marca é (categoria)'], ['diff', 'que (diferencial)'], ['alt', 'Diferente de (alternativa)'], ['proof', 'nós (prova)']]; const sent = el('div', {class: 'pos-sentence'}); const inputs = keys.map(([k, l]) => { const inp = el('input', {type: 'text', value: state.purpose.positioning[k]}); inp.addEventListener('input', () => commit('purpose.positioning.' + k, inp.value, {group: true})); return [k, inp, el('label', {}, l)]; }); const sync = () => { const p = state.purpose.positioning; sent.innerHTML = `Para <b>${BP.esc(p.who)}</b> que <b>${BP.esc(p.need)}</b>, <b>${BP.esc(state.identity.name)}</b> é <b>${BP.esc(p.category)}</b> que <b>${BP.esc(p.diff)}</b>. Diferente de <b>${BP.esc(p.alt)}</b>, <b>${BP.esc(p.proof)}</b>.`; inputs.forEach(([k, inp]) => { if (document.activeElement !== inp) inp.value = p[k]; }); }; sync(); updaters.push(sync); const w = fieldWrap(f, label(f), sent); inputs.forEach(([, inp, lb]) => w.append(lb, inp)); return w; },
    snapshots(f) { const list = el('div', {class: 'lst'}); const nameInp = el('input', {type: 'text', placeholder: 'nome da versão (ex: v1 verde)', class: 'chip-input', style: 'flex:1'}); const save = el('button', {type: 'button', class: 'btn primary fix'}, 'Salvar versão'); const doSave = () => { const n = nameInp.value.trim() || `Versão ${state.snapshots.length + 1}`; const snap = clone(state); delete snap.snapshots; delete snap.notes; commitMany(st => st.snapshots.push({id: uid(), n, t: Date.now(), s: snap}), `Versão "${n}" salva`); nameInp.value = ''; }; save.addEventListener('click', doSave); nameInp.addEventListener('keydown', e => { if (e.key === 'Enter') doSave(); }); const sync = () => { list.innerHTML = ''; if (!state.snapshots.length) list.append(el('span', {class: 'help'}, 'Nenhuma versão ainda. Salve pra comparar A/B depois.')); state.snapshots.forEach((sn, i) => { const row = el('div', {class: 'snap'}); const b = el('b', {}, sn.n); const sm = el('small', {}, new Date(sn.t).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})); const load = el('button', {type: 'button', class: 'btn sm'}, 'carregar'); load.addEventListener('click', () => commitMany(st => { const keep = {snapshots: st.snapshots, notes: st.notes, meta: st.meta}; Object.assign(st, clone(sn.s), keep); }, `Versão "${sn.n}" carregada`)); const cmp = el('button', {type: 'button', class: 'btn sm'}, 'comparar'); cmp.addEventListener('click', () => openCompare(sn)); const x = el('button', {type: 'button', class: 'btn sm danger'}, '×'); x.addEventListener('click', () => commitMany(st => st.snapshots.splice(i, 1))); row.append(b, sm, load, cmp, x); list.append(row); }); }; sync(); updaters.push(sync); return fieldWrap({...f, help: 'Versões guardam tudo (cores, fontes, textos…). "Comparar" abre lado a lado.'}, label(f), el('div', {class: 'row'}, nameInp, save), list); },
    notes(f) { const list = el('div', {class: 'lst'}); const ta = el('textarea', {rows: 2, placeholder: 'Ex.: escolhi verde porque transmite calma e não parece "tech genérico"'}); const add = el('button', {type: 'button', class: 'btn'}, 'Anotar'); const doAdd = () => { if (!ta.value.trim()) return; commitMany(st => st.notes.unshift({t: Date.now(), text: ta.value.trim()})); ta.value = ''; }; add.addEventListener('click', doAdd); ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) doAdd(); }); const sync = () => { list.innerHTML = ''; state.notes.forEach((n, i) => { const d = el('div', {class: 'note'}); const x = el('button', {type: 'button', class: 'x'}, '×'); x.addEventListener('click', () => commitMany(st => st.notes.splice(i, 1))); d.append(x, el('small', {}, new Date(n.t).toLocaleString('pt-BR')), document.createTextNode(n.text)); list.append(d); }); }; sync(); updaters.push(sync); return fieldWrap({...f, help: '⌘+Enter pra anotar. Vai junto no brand.md.'}, label(f), ta, add, list); },
  };

  function buildControls() {
    const root = $('#controls'); root.innerHTML = ''; updaters.length = 0;
    SCHEMA.forEach((sec, i) => {
      const d = el('details', {class: 'sec', 'data-sec': sec.id}); if (i < 2) d.open = true;
      const keys = sec.fields.filter(f => f.k).map(f => f.k.split('.').slice(0, 2).join('.'));
      const cnt = el('span', {class: 'cnt'}); const done = el('button', {type: 'button', class: 'done', title: 'Marcar seção como decidida'}, '✓ decidido');
      done.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); commitMany(st => { const set = new Set(st.meta.touched); const all = keys.every(k => set.has(k)); keys.forEach(k => all ? set.delete(k) : set.add(k)); if (!keys.length) { all && set.has('sec.' + sec.id) ? set.delete('sec.' + sec.id) : set.add('sec.' + sec.id); } st.meta.touched = [...set]; }); });
      const sum = el('summary', {}, el('span', {class: 'arrow'}, '▶'), el('span', {class: 'ico'}, sec.icon), sec.title, cnt, done);
      const body = el('div', {class: 'sec-body'}); if (sec.help) body.append(el('div', {class: 'sec-help'}, sec.help));
      sec.fields.forEach(f => body.append(builders[f.t](f)));
      d.append(sum, body); root.append(d);
      updaters.push(() => { const set = new Set(state.meta.touched); const n = keys.filter(k => set.has(k)).length; cnt.textContent = keys.length ? `${n}/${keys.length}` : ''; done.classList.toggle('on', keys.length ? n === keys.length : set.has('sec.' + sec.id)); });
    });
    syncControls();
  }
  let syncRaf = 0;
  function syncSoon() { cancelAnimationFrame(syncRaf); syncRaf = requestAnimationFrame(syncControls); }
  function syncControls() { updaters.forEach(u => { try { u(); } catch (e) { console.warn(e); } }); updateProgress(); }
  function updateProgress() {
    const keys = new Set(); SCHEMA.forEach(sec => sec.fields.forEach(f => { if (f.k) keys.add(f.k.split('.').slice(0, 2).join('.')); }));
    const set = new Set(state.meta.touched); const n = [...keys].filter(k => set.has(k)).length; const pct = Math.round(n / keys.size * 100);
    $('#prog-bar').style.width = pct + '%'; $('#prog-txt').textContent = `${pct}% decidido`;
  }

  /* ---------------- Render ---------------- */
  const root = $('#b-root'), frame = $('#frame'), scroller = $('#pv-scroll');
  let raf = 0;
  function render(o = {}) { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => doRender(o)); }
  function doRender() {
    ensureStateFonts();
    BP.applyRoot(root, state);
    const top = scroller.scrollTop;
    root.innerHTML = BP.renderTab(state, state.meta.tab);
    scroller.scrollTop = top;
    frame.dataset.device = state.meta.device;
    frame.style.setProperty('--frame-w', {desktop: '100%', tablet: '860px', mobile: '420px'}[state.meta.device]);
    frame.style.setProperty('--frame-zoom', (state.meta.zoom || 100) / 100);
    $('#tb-name').textContent = state.identity.name;
    $('#tb-logo').innerHTML = BP.logoSVG(state, {size: 34});
    $('#favicon').href = 'data:image/svg+xml,' + encodeURIComponent(BP.logoSVG(state, {size: 64}));
    document.title = `${state.identity.name} · Brand Playground`;
    $('#pv-hint').textContent = {site: 'Landing page completa. Role pra ver tudo.', logo: 'Clique em "SVG" pra baixar.', colors: 'Contraste: mire em AA pelo menos.', kit: 'Passe o mouse nos botões e cards.', apps: 'Marca aplicada em coisas reais.', voice: 'Mexa nos sliders de tom na lateral.', manifesto: 'Brand book: missão, visão, valores.', sheet: 'Resumo de uma página. Imprima em PDF.', guide: 'Checklist salva automaticamente.'}[state.meta.tab] || '';
    $$('#theme-seg button').forEach(b => b.classList.toggle('on', b.dataset.t === state.site.theme));
    $$('#device-seg button').forEach(b => b.classList.toggle('on', b.dataset.d === state.meta.device));
    updateProgress();
  }

  /* ---------------- Ondas: o rabisco reage ao scroll ----------------
     Duas camadas de onda no destaque "rabisco". A roda do mouse vira velocidade;
     velocidade vira fase (a onda anda) e amplitude (a onda cresce). As camadas
     correm em sentidos opostos, entao elas se cruzam em vez de so deslizar.
     O SVG nao e regerado: fase = background-position, amplitude = background-size. */
  const WAVE = {x: 0, x2: 0, v: 0, e: 0, wheel: 0, top: 0, raf: 0, live: false, last: ''};
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
  const waveOn = () => state.type.highlight === 'squiggle' && state.pattern.anim !== 'none' && !REDUCE.matches;

  function waveRest() {
    WAVE.x = WAVE.x2 = WAVE.v = WAVE.e = WAVE.wheel = 0; WAVE.live = false; WAVE.last = '';
    ['--b-wave-x', '--b-wave-x2', '--b-wave-y', '--b-wave-y2', '--b-wave-h', '--b-wave-h2'].forEach(k => root.style.removeProperty(k));
  }

  function waveTick() {
    WAVE.raf = requestAnimationFrame(waveTick);
    if (document.hidden) { WAVE.wheel = 0; return; }
    if (!waveOn()) { if (WAVE.live) waveRest(); return; }
    WAVE.live = true;

    const top = scroller.scrollTop;
    let d = top - WAVE.top;
    WAVE.top = top;
    if (Math.abs(d) > 240) d = 0;                        // troca de aba / salto: nao e gesto
    if (!d && WAVE.wheel) d = WAVE.wheel * .3;           // roda no fim do scroll ainda agita
    WAVE.wheel = 0;

    WAVE.v += (d - WAVE.v) * .22;                        // velocidade suavizada
    WAVE.v *= .92;                                       // atrito
    if (Math.abs(WAVE.v) < .02) WAVE.v = 0;

    const drift = state.pattern.anim === 'playful' ? .20 : .07;   // mare parada nunca fica morta
    WAVE.x += WAVE.v * .85 + drift;
    WAVE.x2 -= WAVE.v * 1.5 + drift * .55;               // camada de tras contra o ritmo
    if (Math.abs(WAVE.x) > 1e6) WAVE.x = 0;
    if (Math.abs(WAVE.x2) > 1e6) WAVE.x2 = 0;

    const target = Math.min(1, Math.abs(WAVE.v) / 30);
    WAVE.e += (target - WAVE.e) * (target > WAVE.e ? .3 : .05);   // sobe rapido, assenta devagar
    if (WAVE.e < .002) WAVE.e = 0;

    root.style.setProperty('--b-wave-x', WAVE.x.toFixed(1) + 'px');
    root.style.setProperty('--b-wave-x2', WAVE.x2.toFixed(1) + 'px');

    const e = WAVE.e, bob = Math.sin(WAVE.x * .06) * e * 2.2;
    const key = e.toFixed(2) + '|' + bob.toFixed(1);
    if (key === WAVE.last) return;                       // amplitude parada: nao mexe no layout
    WAVE.last = key;
    root.style.setProperty('--b-wave-h', (.32 + e * .20).toFixed(3) + 'em');
    root.style.setProperty('--b-wave-h2', (.22 + e * .17).toFixed(3) + 'em');
    root.style.setProperty('--b-wave-y', bob.toFixed(2) + 'px');
    root.style.setProperty('--b-wave-y2', (-bob * .7).toFixed(2) + 'px');
  }
  scroller.addEventListener('wheel', e => { WAVE.wheel += e.deltaY; }, {passive: true});

  /* ---------------- Abas / toolbar ---------------- */
  function buildTabs() { const t = $('#tabs'); t.innerHTML = ''; TABS.forEach(([id, n], i) => { const b = el('button', {type: 'button', 'data-tab': id}, n, el('kbd', {}, i + 1)); b.addEventListener('click', () => setTab(id)); t.append(b); }); syncTabs(); }
  function syncTabs() { $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === state.meta.tab)); }
  function setTab(id) { state.meta.tab = id; saveLocal(); syncTabs(); scroller.scrollTop = 0; render(); }
  $('#device-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.meta.device = b.dataset.d; saveLocal(); render(); });
  $('#theme-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; commit('site.theme', b.dataset.t); });
  $('#zoom').addEventListener('input', e => { state.meta.zoom = +e.target.value; $('#zoom-txt').textContent = e.target.value + '%'; saveLocal(); render(); });
  $('#btn-theme').addEventListener('click', () => { const next = document.documentElement.dataset.toolTheme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.toolTheme = next; state.meta.toolTheme = next; saveLocal(); });
  $('#btn-undo').addEventListener('click', undo); $('#btn-redo').addEventListener('click', redo);
  $('#btn-random').addEventListener('click', surprise);
  $('#btn-help').addEventListener('click', openHelp);
  $('#btn-menu').addEventListener('click', e => { e.stopPropagation(); $('#menu-list').hidden = !$('#menu-list').hidden; });
  document.addEventListener('click', e => { if (!e.target.closest('.menu')) $('#menu-list').hidden = true; });
  $('#menu-list').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $('#menu-list').hidden = true; act(b.dataset.act); });
  root.addEventListener('click', e => {
    const dl = e.target.closest('[data-dl]'); if (dl) { downloadLogo(dl.dataset.dl); return; }
    const a = e.target.closest('[data-act]'); if (a) { act(a.dataset.act); return; }
    const idea = e.target.closest('[data-idea]'); if (idea) { const id = idea.dataset.idea; commitMany(st => { const arr = st.guide.ideasDone; const i = arr.indexOf(id); i >= 0 ? arr.splice(i, 1) : arr.push(id); }); return; }
  });
  root.addEventListener('change', e => { const c = e.target.closest('[data-check]'); if (c) { const id = c.dataset.check; commitMany(st => { const arr = st.guide.done; const i = arr.indexOf(id); c.checked ? (i < 0 && arr.push(id)) : (i >= 0 && arr.splice(i, 1)); }); } });

  /* busca de controles */
  $('#search').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('#controls details.sec').forEach(d => { let any = false; $$('.field', d).forEach(f => { const hit = !q || (f.dataset.s || '').includes(q); f.classList.toggle('hidden', !hit); if (hit) any = true; }); d.style.display = any || !q ? '' : 'none'; if (q && any) d.open = true; });
  });

  /* ---------------- Ações ---------------- */
  function download(name, content, type = 'text/plain') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], {type})); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
  const slug = () => state.identity.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'marca';
  function downloadLogo(variant) { download(`${slug()}-logo-${variant}.svg`, BP.logoSVG(state, {size: 512, variant}), 'image/svg+xml'); toast('SVG baixado'); }
  function act(a) {
    switch (a) {
      case 'export-json': download(`${slug()}-brand.json`, JSON.stringify(state, null, 2), 'application/json'); toast('JSON baixado'); break;
      case 'import-json': $('#file-import').click(); break;
      case 'export-md': download('brand.md', BP.brandMd(state), 'text/markdown'); toast('brand.md baixado'); break;
      case 'copy-md': navigator.clipboard.writeText(BP.brandMd(state)).then(() => toast('brand.md copiado'), () => toast('Não deu pra copiar')); break;
      case 'export-css': download('tokens.css', BP.tokensCss(state), 'text/css'); toast('tokens.css baixado'); break;
      case 'print': printSheet(); break;
      case 'reset': openReset(); break;
    }
  }
  $('#file-import').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { const j = JSON.parse(await f.text()); if (j.v !== 1) throw new Error('formato'); commitMany(st => Object.assign(st, merge(clone(BP.DEFAULT_STATE), j)), 'JSON importado'); } catch (err) { toast('Arquivo inválido'); } e.target.value = ''; });
  function printSheet() { const pa = $('#print-area'); pa.innerHTML = ''; const r = el('div', {class: 'b-root'}); BP.applyRoot(r, state); r.dataset.theme = 'light'; r.innerHTML = BP.renderSheet(state); pa.append(r); setTimeout(() => window.print(), 300); }

  function surprise() {
    commitMany(st => {
      const p = rnd(BP.PALETTES); Object.assign(st.colors, {primary: p.primary, secondary: p.secondary, accent: p.accent, paper: p.paper, ink: p.ink, gradient: Math.random() < .25});
      const fp = rnd(BP.FONT_PAIRS); Object.assign(st.type, {head: fp.head, body: fp.body, accent: fp.accent, mono: fp.mono, highlight: rnd(['color', 'marker', 'squiggle', 'serif', 'box', 'none']), headTracking: rnd([-3, -2, -1, 0, 1]), scale: rnd([1.2, 1.25, 1.333, 1.414])});
      st.logo.font = fp.head; st.logo.shape = rnd(BP.SHAPES).id; st.logo.tilt = rnd([0, 0, 0, -6, 6, -10]); st.logo.bg = rnd(['primary', 'primary', 'secondary', 'ink', 'gradient']); st.logo.fg = st.logo.bg === 'ink' ? rnd(['paper', 'accent']) : 'paper'; st.logo.detail = rnd(['none', 'none', '.', '_', '*']);
      const r = rnd([0, 4, 8, 12, 16, 20, 28]); Object.assign(st.shape, {radius: r, pill: Math.random() < .6, corners: rnd(['uniform', 'uniform', 'leaf', 'top']), shadow: rnd(SHADOWS)[0], btn: rnd(['filled', 'outline', 'soft', 'brutal', 'gradient']), card: rnd(['flat', 'bordered', 'elevated', 'glass', 'soft', 'brutal']), density: rnd(['compact', 'comfortable', 'airy']), borderW: rnd([0, 1, 1, 2])});
      if (st.shape.btn === 'brutal') { st.shape.card = 'brutal'; st.shape.shadow = 'hard'; }
      Object.assign(st.pattern, {bg: rnd(BP.PATTERNS).id, intensity: 20 + Math.floor(Math.random() * 50), sparkles: Math.random() < .6, sticker: Math.random() < .5, blobs: Math.random() < .5, arrows: Math.random() < .3, anim: rnd(['subtle', 'subtle', 'playful', 'none'])});
      Object.assign(st.site, {hero: rnd(['left', 'centered', 'split', 'editorial', 'bento']), nav: rnd(['floating', 'bar', 'minimal']), image: rnd(['shapes', 'illustration', 'photo', '3d']), footer: rnd(['big', 'columns', 'minimal'])});
      Object.assign(st.voice, {casual: 20 + Math.floor(Math.random() * 75), playful: 10 + Math.floor(Math.random() * 85), simple: 30 + Math.floor(Math.random() * 65), warm: 30 + Math.floor(Math.random() * 65), seed: Math.floor(Math.random() * 3)});
    }, '🎲 Surpresa! (⌘Z desfaz)');
  }

  /* ---------------- Domínios ---------------- */
  // Consulta o servidor local, que fala com o RDAP público. Sem servidor, só os links manuais funcionam.
  let checking = false;
  async function checkDomains(list, onUpdate) {
    if (!SERVER || !serverOk) { toast('Checagem precisa do servidor: node server.mjs'); return; }
    if (checking) return;
    checking = true;
    const store = state.identity.domainChecked;
    list.forEach(d => onUpdate(d, 'checando'));
    try {
      for (let i = 0; i < list.length; i += 12) {
        const batch = list.slice(i, i + 12);
        try {
          const r = await fetch('/api/domain?name=' + encodeURIComponent(batch.join(',')));
          const j = await r.json();
          (j.results || []).forEach(x => { store[x.domain] = x.status; onUpdate(x.domain, x.status); });
        } catch { batch.forEach(d => onUpdate(d, 'erro')); }
      }
      const keys = Object.keys(store);
      if (keys.length > 300) keys.slice(0, keys.length - 300).forEach(k => delete store[k]);
      scheduleSave();
    } finally { checking = false; }
  }

  /* ---------------- Modais ---------------- */
  const modal = $('#modal'), mbody = $('#modal-body');
  function openModal(html, narrow) { mbody.innerHTML = ''; if (typeof html === 'string') mbody.innerHTML = html; else mbody.append(html); $('.modal-box').classList.toggle('narrow', !!narrow); modal.hidden = false; }
  function closeModal() { modal.hidden = true; mbody.innerHTML = ''; }
  $('#modal-x').addEventListener('click', closeModal); modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  function openHelp() { openModal(`<h2>Atalhos & dicas</h2><div class="kbd-list"><kbd>⌘Z</kbd><span>Desfazer</span><kbd>⇧⌘Z</kbd><span>Refazer</span><kbd>1–${TABS.length}</kbd><span>Trocar de aba</span><kbd>R</kbd><span>Me surpreenda (combinação aleatória)</span><kbd>D</kbd><span>Alternar claro / escuro do preview</span><kbd>⌘S</kbd><span>Forçar salvamento</span><kbd>⌘F</kbd><span>Buscar ajuste na lateral</span><kbd>?</kbd><span>Esta ajuda</span><kbd>Esc</kbd><span>Fechar</span></div><p style="margin-top:14px;color:var(--t-muted)">Tudo salva sozinho: no navegador (localStorage) e, se o servidor estiver rodando, em <code>brand.json</code>. Exporte JSON de vez em quando como backup.</p><p style="color:var(--t-muted)">Nos textos, marque uma palavra com <code>*asteriscos*</code> pra aplicar o destaque de título.</p>`, true); }
  function openReset() { const box = el('div'); box.innerHTML = `<h2>Resetar tudo?</h2><p>Apaga todas as escolhas, versões e notas. Baixe um JSON antes se quiser guardar.</p>`; const row = el('div', {class: 'row', style: 'margin-top:14px;justify-content:flex-end'}); const b1 = el('button', {class: 'btn'}, 'Baixar JSON antes'); b1.addEventListener('click', () => act('export-json')); const b2 = el('button', {class: 'btn danger'}, 'Sim, resetar'); b2.addEventListener('click', () => { closeModal(); commitMany(st => { const keep = {tab: st.meta.tab, toolTheme: st.meta.toolTheme}; Object.assign(st, clone(BP.DEFAULT_STATE)); Object.assign(st.meta, keep); }, 'Resetado'); }); const b3 = el('button', {class: 'btn primary'}, 'Cancelar'); b3.addEventListener('click', closeModal); row.append(b1, b2, b3); box.append(row); openModal(box, true); }
  let allFontsLoaded = false;
  function openFontModal(f) {
    if (!allFontsLoaded) { allFontsLoaded = true; BP.FONTS.forEach(x => ensureFont(x.n)); }
    const box = el('div'); box.innerHTML = `<h2>${f.l}</h2><p style="color:var(--t-muted)">Clique pra aplicar. Fontes carregam do Google Fonts (precisa de internet).</p>`;
    const filt = el('div', {class: 'seg', style: 'margin-bottom:12px'}); const grid = el('div', {class: 'font-grid'});
    let cat = 'all';
    const draw = () => { grid.innerHTML = ''; BP.FONTS.filter(x => cat === 'all' || x.c === cat).forEach(x => { const b = el('button', {type: 'button', class: get(state, f.k) === x.n ? 'on' : ''}); b.append(el('div', {class: 'fn', style: `font-family:${BP.fontFamily(x.n)};${f.italic ? 'font-style:italic' : ''}`}, x.n), el('div', {class: 'fc'}, (BP.FONT_CATS[x.c] || x.c) + ' · ' + (x.w.includes('..') ? 'variável ' + x.w.replace('..', '–') : x.w.replace(/;/g, ', ')))); b.addEventListener('click', () => { commit(f.k, x.n); $$('button', grid).forEach(z => z.classList.remove('on')); b.classList.add('on'); }); grid.append(b); }); };
    [['all', 'Todas'], ...Object.entries(BP.FONT_CATS)].forEach(([id, n]) => { const b = el('button', {type: 'button', class: id === 'all' ? 'on' : ''}, n); b.addEventListener('click', () => { cat = id; $$('button', filt).forEach(z => z.classList.remove('on')); b.classList.add('on'); draw(); }); filt.append(b); });
    draw(); box.append(filt, grid); openModal(box);
  }
  function openCompare(sn) {
    const box = el('div'); box.innerHTML = `<h2>Comparar: "${BP.esc(sn.n)}" × atual</h2>`;
    const wrap = el('div', {class: 'compare'});
    const mk = (st, title) => { const d = el('div'); d.append(el('h3', {}, title)); const r = el('div', {class: 'b-root'}); const full = merge(clone(BP.DEFAULT_STATE), st); BP.applyRoot(r, full); r.innerHTML = BP.renderSite(full); d.append(r); return d; };
    wrap.append(mk(sn.s, sn.n), mk(state, 'Atual')); box.append(wrap); openModal(box);
  }

  /* ---------------- Toast / atalhos ---------------- */
  let toastT; function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1800); }
  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveLocal(); saveServer(); toast('Salvo'); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); $('#search').focus(); return; }
    if (e.key === 'Escape') { closeModal(); $('#menu-list').hidden = true; return; }
    // Atalhos de tecla solta so valem sem modificador. Sem isso, Cmd+Shift+R (recarregar
    // ignorando cache) caia no "R" e disparava surprise(), rerolando a marca antes do reload.
    // Shift passa: "?" precisa dele.
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (typing) return;
    if (e.key === '?') openHelp();
    else if (e.key.toLowerCase() === 'r') surprise();
    else if (e.key.toLowerCase() === 'd') commit('site.theme', state.site.theme === 'dark' ? 'light' : 'dark');
    else if (/^[1-9]$/.test(e.key) && TABS[+e.key - 1]) setTab(TABS[+e.key - 1][0]);
  });
  window.addEventListener('beforeunload', () => saveLocal());
  document.addEventListener('visibilitychange', () => { if (document.hidden) { saveLocal(); saveServer(); } });

  /* ---------------- Boot ---------------- */
  (async function boot() {
    await load();
    document.documentElement.dataset.toolTheme = state.meta.toolTheme || 'light';
    $('#zoom').value = state.meta.zoom || 100; $('#zoom-txt').textContent = ($('#zoom').value) + '%';
    if (!TABS.some(t => t[0] === state.meta.tab)) state.meta.tab = 'site';
    buildTabs(); buildControls();
    history = [JSON.stringify(state)]; hIdx = 0; updateUndoBtns();
    doRender();
    WAVE.top = scroller.scrollTop; waveTick();
    setStatus(SERVER && serverOk ? 'Salvando em brand.json' : 'Salvando no navegador', 'ok');
    if (!SERVER) console.info('Aberto via file://. Salva em localStorage. Rode "node server.mjs" pra salvar em brand.json.');
  })();
})();
