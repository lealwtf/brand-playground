/* render.js — copy por tom de voz + renderizadores de cada aba do preview */
window.BP = window.BP || {};
const esc = BP.esc;

/* *palavra* → destaque */
BP.hl = t => esc(t).replace(/\*([^*]+)\*/g, '<em class="b-hl">$1</em>');
const bucket = x => x < 34 ? 0 : x < 67 ? 1 : 2;
const EMOJI_RE = /\s?(?:[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|\u{2B50}|\u{2705})\u{FE0F}?/gu;
BP.emoji = (t, level) => {
  if (level === 'frequente') return t;
  if (level === 'nunca') return t.replace(EMOJI_RE, '');
  let n = 0; return t.replace(EMOJI_RE, m => (n++ === 0 ? m : ''));
};

/* ---------- COPY ---------- */
BP.copy = function (s) {
  const v = s.voice, id = s.identity;
  const P = bucket(v.playful), C = bucket(v.casual), S = bucket(v.simple), W = bucket(v.warm);
  const we = v.person;
  const w = (ag, nos, eu) => we === 'a gente' ? ag : we === 'nós' ? nos : (eu ?? nos);
  const yours = noun => v.address === 'você' ? `seu ${noun}` : v.address === 'vocês' ? `${noun} de vocês` : `${noun} da sua empresa`;
  const seed = v.seed || 0;
  const pick = arr => arr[seed % arr.length];
  const E = t => BP.emoji(t, v.emoji);
  const bang = W === 2 ? '!' : '.';

  const H = [
    ['Prepare sua empresa para o que *vem a seguir*.', 'IA e desenvolvimento com *critério* e método.', 'Tecnologia que sua empresa *entende* e controla.'],
    ['O futuro chega de qualquer jeito. Melhor chegar *preparado*.', `${BP.cap(w('A gente constrói', 'Nós construímos', 'Eu construo'))} o que sua empresa vai precisar *amanhã*.`, 'IA de verdade, *sem hype*.'],
    [`O futuro ligou. *${w('A gente atende', 'Nós atendemos', 'Eu atendo')}* com você.`, 'Robôs? Sim. Mas com *gente boa* por perto.', 'Sua empresa pronta pro amanhã *(sem pânico)*.'],
  ];
  const SUB = [
    `Diagnóstico, arquitetura, agentes, automações e produto digital. ${BP.cap(w('A gente entra', 'Nós entramos', 'Eu entro'))} no detalhe técnico para ${yours('time')} não precisar${bang}`,
    `${BP.cap(w('A gente ajuda', 'Nós ajudamos', 'Eu ajudo'))} empresas a colocar IA pra trabalhar de verdade: projetos, automações e produtos que fazem sentido no dia a dia${bang}`,
    `${BP.cap(w('A gente ajuda', 'Nós ajudamos', 'Eu ajudo'))} ${yours('empresa')} a usar IA de um jeito útil. Sem complicação, sem promessa vazia ${W === 2 ? '🙂' : ''}`.trim(),
  ];
  const CTA = [['Agendar uma conversa', 'Conhecer os serviços'], ['Vamos conversar', 'Ver como funciona'], ['Bora conversar?', `Espia o que ${w('a gente faz', 'fazemos', 'eu faço')}`]];
  const PROOF = ['Sem contrato de 12 meses. Sem jargão. Sem surpresa na fatura.', 'Sem contrato de 12 meses • Sem jargão • Sem susto', 'Sem contrato de 12 meses ✌️ sem jargão ✌️ sem susto'];

  const c = {
    headline: v.headline || pick(H[P]),
    sub: E(v.sub || SUB[S]),
    cta: E(v.cta || CTA[C][0]), cta2: CTA[C][1],
    proof: E(PROOF[P]),
    sticker: E(['Novidade', 'Olá 👋', 'Bora? ✨'][P]),
    arrow: ['comece por aqui', 'começa aqui', 'é aqui, ó'][P],
    clients: ['Empresas que confiam no trabalho', 'Empresas que já estão se preparando', 'Gente que já topou'][P],
    services: ['O que fazemos', `O que ${w('a gente faz', 'fazemos', 'eu faço')}`, `Coisas que ${w('a gente faz', 'fazemos', 'faço')} bem`][P],
    servicesSub: ['Serviços pensados para empresas que querem evoluir com segurança.', 'Do diagnóstico ao acompanhamento. Você escolhe por onde começar.', 'Pode começar pequeno. A gente prefere assim.'][S === 0 ? 0 : P === 2 ? 2 : 1],
    process: ['Como trabalhamos', 'Como funciona', 'Sem mistério: como funciona'][P],
    processSub: ['Um método claro, com entregas frequentes e comunicação transparente.', 'Passos curtos, entregas visíveis, zero caixa-preta.', 'Quatro passos. Nenhum deles é "confia em mim".'][P],
    steps: [
      {n:'Escutar', d:`${BP.cap(w('A gente conversa', 'Conversamos', 'Converso'))} com quem faz o trabalho acontecer. Onde dói? Onde trava?`, t:'1–2 semanas'},
      {n:'Desenhar', d:'Um plano pequeno e honesto: o que fazer primeiro, o que deixar pra depois, o que nem fazer.', t:'1 semana'},
      {n:'Construir', d:'Entregas a cada poucos dias. Você vê funcionando antes de virar "projeto grande".', t:'4–8 semanas'},
      {n:'Cuidar', d:'Treinamento, ajustes, evolução. Ficar por perto faz parte do serviço.', t:'contínuo'},
    ],
    cases: ['Projetos recentes', 'Histórias de quem já começou', 'Quem já pulou pro futuro'][P],
    manifestoKicker: ['Nossa promessa', 'No que acreditamos', 'Combinado é combinado'][P],
    team: ['Equipe', 'Quem está por trás', 'Gente de verdade'][P],
    teamSub: ['Profissionais com experiência em IA, produto e engenharia.', 'Pessoas que gostam de explicar e de fazer.', 'Sem robô fingindo ser gente. (Os robôs ficam nos bastidores.)'][P],
    testimonials: ['O que dizem nossos clientes', `Quem trabalhou com ${w('a gente', 'nós', 'eu')} diz`, 'Palavra de cliente'][P],
    faq: ['Perguntas frequentes', 'Dúvidas comuns', `Coisas que ${w('a gente ouve', 'ouvimos', 'ouço')} muito`][P],
    ctaHead: ['Vamos preparar sua empresa para o futuro.', 'Que tal começar essa conversa?', 'Bora dar o primeiro passo?'][P],
    ctaSub: E(['Uma conversa de 30 minutos para entender seu contexto. Sem compromisso.', 'Uma conversa de 30 minutos, sem compromisso e sem apresentação de 80 slides.', '30 minutos, café virtual, zero slides. Prometido 🤝'][P]),
    footCta: ['Vamos conversar?', 'Bora conversar?', 'Diz oi 👋'][P],
    footTag: E(['Projetos de IA e desenvolvimento para empresas que querem estar prontas para o futuro.', `Projetos de IA e desenvolvimento pra ${yours('empresa')} chegar pronta no futuro.`, 'IA, desenvolvimento e gente boa. Pra sua empresa chegar tranquila no amanhã ✨'][P]),
    P, C, S, W, w, yours, E,
  };
  return c;
};

/* Amostras de voz (aba Voz) */
BP.samples = function (s) {
  const c = BP.copy(s), v = s.voice, name = s.identity.name, P = c.P, w = c.w, E = c.E;
  const sig = w(name, name, BP.DEMO_PERSON.first);
  const welcome = [
    `Assunto: Bem-vindo(a) à ${name}\n\nOlá, Ana.\n\nObrigado pela confiança. Nos próximos dias ${w('a gente organiza', 'organizaremos', 'organizo')} o diagnóstico inicial e ${w('compartilha', 'compartilharemos', 'compartilho')} um plano claro, com prazos e responsáveis.\n\nQualquer dúvida, é só responder este e-mail.\n\nAtenciosamente,\n${sig}`,
    `Assunto: Começamos! 👋\n\nOi, Ana!\n\nQue bom ter você por aqui. Nas próximas duas semanas ${w('a gente mergulha', 'mergulhamos', 'eu mergulho')} no seu contexto pra entender onde IA ajuda de verdade (e onde não ajuda).\n\nSem enrolação: você vai receber um plano simples, com o que fazer primeiro.\n\nQualquer coisa, responde aqui mesmo.\n\nAbraço,\n${sig}`,
    `Assunto: Bora? 🚀\n\nOi, Ana!\n\nOficialmente começamos. Pode guardar o PowerPoint: nas próximas semanas ${w('a gente vai conversar', 'vamos conversar', 'vou conversar')} com quem coloca a mão na massa, entender o que trava e desenhar o primeiro passo.\n\nPrometido: sem jargão, sem susto no fim do mês.\n\nTe vejo em breve,\n${sig}`,
  ];
  const linkedin = [
    `Muitas empresas perguntam: "por onde começar com IA?"\n\nNossa resposta é sempre a mesma: por um problema real, pequeno e mensurável. Não pela ferramenta.\n\nTrês critérios que usamos para escolher o primeiro projeto:\n1. Alguém sofre com isso toda semana.\n2. Dá pra medir antes e depois.\n3. Cabe em 6 semanas.\n\nSe passou nos três, é um bom começo.`,
    `Toda semana alguém me pergunta: "IA vai substituir meu time?"\n\nResposta curta: não.\nResposta longa: vai tirar do time o que ele odeia fazer.\n\nSemana passada um cliente parou de digitar pedido à mão. Ninguém sentiu falta. 🙂`,
    `Cliente: "quero um ChatGPT da minha empresa."\n${BP.cap(w('A gente', 'Nós', 'Eu'))}: "ótimo, e o que ele vai fazer na segunda de manhã?"\n\nSilêncio.\n\nDepois: a melhor conversa do mês.\n\nComeçar pelo problema, não pela ferramenta. Sempre. ✨`,
  ];
  const notfound = ['Página não encontrada. O endereço pode ter mudado ou nunca existiu.\n\n→ Voltar ao início', 'Ops, essa página não existe.\n(Ou existiu num futuro que ainda não chegou.)\n\n→ Voltar pro início', '404.\nAté nosso agente de IA procurou e não achou.\n\n→ Vai por aqui'];
  const support = [
    `Olá, Carlos. Recebemos sua mensagem sobre a automação de pedidos. Identificamos a causa e a correção será publicada até amanhã, às 12h. Manteremos você informado.`,
    `Oi, Carlos! Vi sua mensagem sobre a automação. Já achei o motivo (um campo mudou de nome na planilha) e amanhã até meio-dia está corrigido. Te aviso quando subir.`,
    `Oi, Carlos! Culpa nossa: a planilha mudou um campo e o robô ficou confuso, coitado. Amanhã até 12h ele volta ao normal. Te aviso assim que subir 🙂`,
  ];
  const bio = [`${name} · Projetos de IA e desenvolvimento para empresas prontas para o futuro.`, `${name} 🌱 IA e tecnologia com calma e critério · Para empresas que querem estar prontas pro que vem`, `${name} · ${w('a gente prepara', 'preparamos', 'eu preparo')} sua empresa pro futuro (sem pânico) 🚀 · IA, automação e produto`];
  const proposal = [
    `Proposta: Diagnóstico de IA\n\nObjetivo: mapear oportunidades de automação e IA na operação, com priorização por impacto e esforço.\nEntregas: relatório de oportunidades, plano de 90 dias, sessão de apresentação.\nPrazo: 2 semanas. Investimento: R$ X.`,
    `Proposta: Diagnóstico de IA\n\nEm duas semanas, ${w('a gente entende', 'entendemos', 'eu entendo')} sua operação de perto e devolve um plano de 90 dias: o que automatizar primeiro, o que deixar pra depois e o que não vale a pena.\n\nVocê sai com clareza, não com um PDF de 60 páginas.`,
    `Proposta: Diagnóstico de IA\n\nDuas semanas. ${BP.cap(w('A gente conversa', 'Conversamos', 'Converso'))} com seu time, ${w('fuça', 'fuçamos', 'fuço')} nos processos e ${w('volta', 'voltamos', 'volto')} com um plano de 90 dias que cabe numa página.\n\nSem PDF de 60 páginas. Prometido.`,
  ];
  const micro = {
    loading: ['Carregando…', 'Um instante, organizando as coisas…', 'Só um segundinho ✨'][P],
    empty: ['Nenhum item ainda.', 'Nada por aqui ainda. Que tal criar o primeiro?', 'Vazio. Bonito, mas vazio. Bora criar algo?'][P],
    error: ['Ocorreu um erro. Tente novamente.', 'Algo deu errado por aqui. Tenta de novo?', 'Deu ruim. Mas já estamos olhando. Tenta de novo?'][P],
    success: ['Salvo com sucesso.', 'Pronto, salvo!', 'Salvo! 🎉'][P],
  };
  const rules = [];
  rules.push([`Registro formal. "Para", nunca "pra". Sem gírias.`, `Português do dia a dia, sem gíria forçada.`, `Escreve como fala: "pra", "né" e contrações são bem-vindos.`][c.C]);
  rules.push([`Sério e sóbrio. Sem piada.`, `Leveza sim, piada só quando cabe.`, `Humor faz parte da voz. Nunca às custas do cliente.`][P]);
  rules.push([`Fala técnico com quem é técnico. Precisão acima de tudo.`, `Termos técnicos sempre com contexto.`, `Uma ideia por frase. Jargão só com explicação na mesma frase.`][c.S]);
  rules.push([`Objetivo e direto. Cortesia mínima.`, `Cordial, sem exagero.`, `Fala com a pessoa, não com o cargo. Nome próprio, sempre.`][c.W]);
  rules.push(v.person === 'a gente' ? 'Primeira pessoa do plural informal: "a gente".' : v.person === 'nós' ? 'Primeira pessoa do plural: "nós".' : 'Primeira pessoa do singular: "eu". Marca com rosto.');
  rules.push(v.address === 'você' ? 'Fala com "você". Uma pessoa por vez.' : v.address === 'vocês' ? 'Fala com "vocês": o time inteiro.' : 'Fala com "sua empresa": tom institucional.');
  rules.push(v.emoji === 'nunca' ? 'Zero emoji.' : v.emoji === 'raro' ? 'Emoji raro: no máximo um por texto, e só quando soma.' : 'Emoji liberado. Com gosto, não com pressa.');
  rules.push('Promessa só do que dá pra cumprir. Se IA não resolve, a gente diz.');
  return {welcome: E(welcome[P]), linkedin: E(linkedin[P]), notfound: E(notfound[P]), support: E(support[P]), bio: E(bio[P]), proposal: E(proposal[P]), micro: Object.fromEntries(Object.entries(micro).map(([k, t]) => [k, E(t)])), rules};
};

/* ---------- Helpers visuais ---------- */
BP.ICONS = {
  spark: '<svg class="b-icon" viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>',
  bot: '<svg class="b-icon" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M9 17.5h6"/></svg>',
  code: '<svg class="b-icon" viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>',
  data: '<svg class="b-icon" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  people: '<svg class="b-icon" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c3 0 5.5 2 5.5 5"/></svg>',
  heart: '<svg class="b-icon" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>',
  check: '<svg class="b-icon" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  arrow: '<svg class="b-icon" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};
const SERVICE_ICONS = ['spark', 'bot', 'code', 'data', 'people', 'heart'];
BP.sparkle = k => `<span class="b-sparkle ${k}"><svg viewBox="0 0 24 24"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z"/></svg></span>`;
const ARROW_SVG = '<svg viewBox="0 0 64 40"><path d="M4 6c10 22 30 30 56 20"/><path d="M50 18l10 8-13 4"/></svg>';

BP.visual = function (s, kind, cls = '') {
  kind = kind || s.site.image;
  if (kind === 'photo') return `<div class="b-visual b-visual-photo ${cls}"><span>foto real aqui</span></div>`;
  if (kind === '3d') return `<div class="b-visual b-visual-3d ${cls}"><div class="b-orb"></div></div>`;
  if (kind === 'illustration') return `<div class="b-visual b-visual-illu ${cls}"><svg viewBox="0 0 200 180"><path d="M100 10c45 0 85 30 85 75s-35 85-85 85S12 130 12 85 55 10 100 10z" fill="var(--b-primary)"/><circle cx="72" cy="80" r="9" fill="var(--b-paper)"/><circle cx="128" cy="80" r="9" fill="var(--b-paper)"/><circle cx="74" cy="82" r="4" fill="var(--b-ink)"/><circle cx="130" cy="82" r="4" fill="var(--b-ink)"/><path d="M70 115c15 18 45 18 60 0" stroke="var(--b-paper)" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="52" cy="105" r="8" fill="var(--b-secondary)" opacity=".8"/><circle cx="148" cy="105" r="8" fill="var(--b-secondary)" opacity=".8"/><path d="M160 20l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="var(--b-accent)"/></svg></div>`;
  return `<div class="b-visual b-visual-shapes ${cls}"><i class="s1"></i><i class="s2"></i><i class="s3"></i><i class="s4"></i></div>`;
};
const avatar = (init, cls = '') => `<div class="b-avatar ${cls}">${esc(init)}</div>`;

/* ---------- SITE ---------- */
BP.renderSite = function (s) {
  const c = BP.copy(s), id = s.identity, sec = s.site.sections, p = s.pattern, pu = s.purpose;
  const nav = `<nav class="b-nav"><div class="b-container b-nav-in">${BP.lockup(s, {size: 34})}<ul class="b-nav-links"><li>Serviços</li><li>Como funciona</li><li>Cases</li><li>Manifesto</li></ul><a class="b-btn primary sm">${esc(c.cta)}</a></div></nav>`;
  const decor = `${p.blobs ? '<i class="b-blob b1"></i><i class="b-blob b2"></i>' : ''}${p.sticker ? `<div class="b-sticker">${esc(c.sticker)}</div>` : ''}`;
  const sparkles = p.sparkles ? BP.sparkle('k1') + BP.sparkle('k2') + BP.sparkle('k3') : '';
  const arrow = p.arrows ? `<span class="b-arrow">${ARROW_SVG}<span>${esc(c.arrow)}</span></span>` : '';
  const actions = `<div class="b-actions"><a class="b-btn primary lg">${esc(c.cta)}</a><a class="b-btn ghost lg">${esc(c.cta2)} ${BP.ICONS.arrow}</a>${arrow}</div>`;
  const proof = `<p class="b-tiny">${esc(c.proof)}</p>`;
  const copyBlock = `<div class="b-hero-copy">${sparkles}<span class="b-eyebrow">${esc(id.tagline)}</span><h1>${BP.hl(c.headline)}</h1><p class="b-lead">${esc(c.sub)}</p>${actions}${proof}</div>`;
  let hero;
  switch (s.site.hero) {
    case 'centered': hero = `<header class="b-hero">${decor}<div class="b-container b-hero-in">${copyBlock}${BP.visual(s, null, 'wide')}</div></header>`; break;
    case 'split': hero = `<header class="b-hero">${decor}<div class="b-hero-in">${copyBlock}<div class="b-hero-visual">${BP.visual(s)}</div></div></header>`; break;
    case 'editorial': hero = `<header class="b-hero">${decor}<div class="b-container b-hero-in"><div class="b-hero-copy">${sparkles}<span class="b-eyebrow">${esc(id.tagline)}</span><h1>${BP.hl(c.headline)}</h1><div class="b-ed-row"><p class="b-lead">${esc(c.sub)}</p><div>${actions}${proof}</div></div></div><div class="b-hero-visual">${BP.visual(s, null, 'wide')}</div></div></header>`; break;
    case 'bento': hero = `<header class="b-hero">${decor}<div class="b-container b-hero-in"><div class="b-bento main">${sparkles}<span class="b-eyebrow">${esc(id.tagline)}</span><h1>${BP.hl(c.headline)}</h1><p class="b-lead">${esc(c.sub)}</p></div><div class="b-bento vis">${BP.visual(s)}</div><div class="b-bento stat"><b>4–8</b><span>semanas até o primeiro resultado no ar</span></div><div class="b-bento stat"><b>0</b><span>slides de hype por reunião</span></div><div class="b-bento p"><span>${esc(c.ctaSub)}</span><a class="b-btn primary">${esc(c.cta)}</a></div></div></header>`; break;
    default: hero = `<header class="b-hero">${decor}<div class="b-container b-hero-in">${copyBlock}<div class="b-hero-visual">${BP.visual(s)}</div></div></header>`;
  }
  const clients = sec.clients ? `<section class="b-clients"><div class="b-container"><small>${esc(c.clients)}</small>${BP.CLIENTS.map(n => `<span class="b-client">${esc(n)}</span>`).join('')}</div></section>` : '';
  const services = sec.services ? `<section class="b-section"><div class="b-container"><div class="b-sec-head"><span class="b-kicker">Serviços</span><h2>${esc(c.services)}</h2><p>${esc(c.servicesSub)}</p></div><div class="b-grid c3">${pu.services.map((sv, i) => `<div class="b-card"><div class="b-icon-box">${BP.ICONS[SERVICE_ICONS[i % SERVICE_ICONS.length]]}</div><h3>${esc(sv.n)}</h3><p>${esc(sv.d)}</p></div>`).join('')}</div></div></section>` : '';
  const process = sec.process ? `<section class="b-section alt"><div class="b-container"><div class="b-sec-head"><span class="b-kicker">Processo</span><h2>${esc(c.process)}</h2><p>${esc(c.processSub)}</p></div><div class="b-steps">${c.steps.map(st => `<div class="b-step"><h3>${esc(st.n)}</h3><p>${esc(st.d)}</p><span class="b-dur">${esc(st.t)}</span></div>`).join('')}</div></div></section>` : '';
  const cases = sec.cases ? `<section class="b-section"><div class="b-container"><div class="b-sec-head"><span class="b-kicker">Cases</span><h2>${esc(c.cases)}</h2><p>Exemplos ilustrativos. Troque pelos seus quando existirem.</p></div><div class="b-grid c3">${BP.CASES.map(cs => `<div class="b-card b-case">${BP.visual(s, cs.v)}<div class="b-tags">${cs.tags.map((t, i) => `<span class="b-tag ${'pas'[i % 3]}">${esc(t)}</span>`).join('')}</div><span class="b-client-name">${esc(cs.n)}</span><h3>${esc(cs.t)}</h3><div class="b-result">${esc(cs.r)}</div></div>`).join('')}</div></div></section>` : '';
  const manifesto = sec.manifesto ? `<section class="b-section p b-manifesto-strip"><div class="b-container"><div><span class="b-kicker">${esc(c.manifestoKicker)}</span><blockquote>${esc(pu.promise).replace(/(explicamos tudo|explica tudo|com calma|de verdade|funciona)/i, '<em>$1</em>')}</blockquote></div><ul class="b-values-list">${pu.values.slice(0, 4).map(vl => `<li><b>${esc(vl.n)}</b><span>${esc(vl.d)}</span></li>`).join('')}</ul></div></section>` : '';
  const team = sec.team ? `<section class="b-section"><div class="b-container"><div class="b-sec-head c"><span class="b-kicker">Time</span><h2>${esc(c.team)}</h2><p>${esc(c.teamSub)}</p></div><div class="b-team"><div class="b-person">${avatar(BP.DEMO_PERSON.initials)}<h3>${BP.DEMO_PERSON.name}</h3><p>${BP.DEMO_PERSON.role}</p></div><div class="b-person">${avatar('?')}<h3>Alguém incrível</h3><p>Em breve por aqui</p></div><div class="b-person">${avatar('+')}<h3>Talvez você?</h3><p>${c.P === 2 ? 'Se curte café e código, chama.' : 'Estamos sempre abertos a conversar.'}</p></div></div></div></section>` : '';
  const testimonials = sec.testimonials ? `<section class="b-section alt"><div class="b-container"><div class="b-sec-head"><span class="b-kicker">Depoimentos</span><h2>${esc(c.testimonials)}</h2></div><div class="b-grid c2"><div class="b-card b-quote"><p>Achei que IA era coisa de empresa grande. Em seis semanas a gente parou de digitar pedido à mão e ninguém sentiu falta.</p><footer>${avatar('JP')}<div><b>Nome da pessoa</b><span>Cargo · Empresa (placeholder)</span></div></footer></div><div class="b-card b-quote"><p>O que mais gostei: eles explicaram cada decisão. Hoje meu time entende o que foi construído e mexe sem medo.</p><footer>${avatar('CR')}<div><b>Nome da pessoa</b><span>Cargo · Empresa (placeholder)</span></div></footer></div></div></div></section>` : '';
  const faq = sec.faq ? `<section class="b-section"><div class="b-container"><div class="b-sec-head c"><span class="b-kicker">FAQ</span><h2>${esc(c.faq)}</h2></div><div class="b-faq">${BP.FAQ.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></div></section>` : '';
  const cta = sec.cta ? `<section class="b-section"><div class="b-container"><div class="b-cta">${p.sparkles ? BP.sparkle('k1') + BP.sparkle('k2') + BP.sparkle('k3') : ''}<h2>${esc(c.ctaHead)}</h2><p>${esc(c.ctaSub)}</p><div class="b-actions" style="justify-content:center;margin:0"><a class="b-btn primary lg">${esc(c.cta)}</a><a class="b-btn ghost lg">${esc(id.domain ? 'oi@' + id.domain : 'oi@email.com')}</a></div></div></div></section>` : '';
  const footCols = `<div class="b-foot-cols" style="display:contents"><div><h4>Serviços</h4><ul>${pu.services.slice(0, 4).map(sv => `<li>${esc(sv.n)}</li>`).join('')}</ul></div><div><h4>Estúdio</h4><ul><li>Manifesto</li><li>Cases</li><li>Time</li><li>Blog</li></ul></div><div><h4>Contato</h4><ul><li>${esc(id.domain ? 'oi@' + id.domain : 'oi@email.com')}</li><li>WhatsApp</li><li>LinkedIn</li><li>Instagram</li></ul></div></div>`;
  const footer = `<footer class="b-footer ${s.site.footer}"><div class="b-container">${s.site.footer === 'big' ? `<div class="b-foot-cta"><h2>${esc(c.footCta)}</h2><a>${esc(id.domain ? 'oi@' + id.domain : 'oi@email.com')}</a></div>` : ''}<div class="b-foot-brand">${BP.lockup(s, {size: 30})}<p>${esc(c.footTag)}</p></div>${footCols}<div class="b-bottom"><span>© ${new Date().getFullYear()} ${esc(id.name)}. Feito com calma.</span><span>Privacidade · Termos · ${esc(id.domain)}</span></div></div></footer>`;
  return `<div class="b-site">${nav}${hero}${clients}${services}${process}${cases}${manifesto}${team}${testimonials}${faq}${cta}${footer}</div>`;
};

/* ---------- LOGO ---------- */
BP.renderLogo = function (s) {
  const sym = (v, size) => BP.logoSVG(s, {variant: v, size});
  const dont = (inner, cap) => `<figure class="b-panel" style="margin:0"><div class="b-center" style="min-height:120px">${inner}</div><figcaption>${cap}</figcaption></figure>`;
  return `<div class="b-page">
  <h2>Logo & monograma</h2><p class="b-intro">Iniciais dentro de uma forma. Ajuste forma, fonte, cor e composição na barra lateral. Baixe o SVG quando gostar.</p>
  <div class="b-block"><div class="b-logo-hero">
    <div class="b-panel paper"><span class="b-lbl">assinatura principal</span><div class="b-center">${BP.lockup(s, {size: 96})}</div></div>
    <div class="b-panel ink"><span class="b-lbl">sobre tinta</span><div class="b-center">${BP.lockup(s, {size: 96, variant: 'inverse'})}</div></div>
  </div></div>
  <div class="b-block"><h3>Composições</h3><div class="b-grid c4">
    <div class="b-panel"><span class="b-lbl">horizontal</span><div class="b-center">${BP.lockup(s, {size: 48, lockup: 'horizontal'})}</div></div>
    <div class="b-panel"><span class="b-lbl">empilhado</span><div class="b-center">${BP.lockup(s, {size: 56, lockup: 'vertical'})}</div></div>
    <div class="b-panel"><span class="b-lbl">só símbolo</span><div class="b-center">${BP.lockup(s, {size: 72, lockup: 'symbol'})}</div></div>
    <div class="b-panel"><span class="b-lbl">só nome</span><div class="b-center">${BP.lockup(s, {size: 60, lockup: 'wordmark'})}</div></div>
  </div></div>
  <div class="b-block"><h3>Variações de cor</h3><div class="b-grid c4">
    <div class="b-panel paper"><span class="b-lbl">colorido</span><div class="b-center">${sym('color', 90)}</div></div>
    <div class="b-panel paper"><span class="b-lbl">mono</span><div class="b-center">${sym('mono', 90)}</div></div>
    <div class="b-panel ink"><span class="b-lbl">invertido</span><div class="b-center">${sym('inverse', 90)}</div></div>
    <div class="b-panel prim"><span class="b-lbl">sobre primária</span><div class="b-center">${sym('white', 90)}</div></div>
  </div></div>
  <div class="b-block"><h3>Tamanhos <small>a versão de 16px precisa continuar legível</small></h3><div class="b-panel"><div class="b-sizes">${[16, 24, 32, 48, 64, 96, 128].map(n => `<div>${sym('color', n)}<span>${n}px</span></div>`).join('')}</div></div></div>
  <div class="b-block"><h3>Espaço de respiro <small>margem mínima = 25% do símbolo</small></h3><div class="b-panel check"><div class="b-center" style="min-height:220px"><span class="b-clear">${sym('color', 110)}<i class="b-cs o"></i><i class="b-cs i"></i><span class="b-cs-lbl">área livre</span></span></div></div></div>
  <div class="b-block"><h3>Onde ele aparece</h3><div class="b-grid c3">
    <div class="b-panel"><span class="b-lbl">aba do navegador</span><div class="b-center"><div class="b-browser" style="width:100%"><div class="bar"><i></i><i></i><i></i><span class="tab">${sym('color', 14)} ${esc(s.identity.name)}</span></div><div style="height:70px;background:var(--b-bg)"></div></div></div></div>
    <div class="b-panel"><span class="b-lbl">ícone de app</span><div class="b-center"><div class="b-phone"><div class="app"><i></i>Mail</div><div class="app"><i></i>Fotos</div><div class="app">${BP.logoSVG(s, {size: 32})}${esc(s.identity.name.split(' ')[0])}</div><div class="app"><i></i>Notas</div></div></div></div>
    <div class="b-panel"><span class="b-lbl">avatar redes sociais</span><div class="b-center" style="gap:14px"><div style="border-radius:50%;overflow:hidden;width:72px;height:72px;box-shadow:0 0 0 3px var(--b-line)">${sym('color', 72)}</div><div style="border-radius:50%;overflow:hidden;width:44px;height:44px">${sym('color', 44)}</div><div style="border-radius:50%;overflow:hidden;width:28px;height:28px">${sym('color', 28)}</div></div></div>
  </div></div>
  <div class="b-block b-donts"><h3>O que não fazer <small>combinado desde já</small></h3><div class="b-grid c4">
    ${dont(`<span style="display:inline-block;transform:scaleX(1.5)">${sym('color', 70)}</span>`, 'Não estica nem espreme')}
    ${dont(`<span style="display:inline-block;filter:drop-shadow(6px 8px 6px rgba(0,0,0,.5))">${sym('color', 70)}</span>`, 'Sem sombra pesada')}
    ${dont(`<span style="display:inline-block;filter:hue-rotate(140deg) saturate(3)">${sym('color', 70)}</span>`, 'Cor fora da paleta, não')}
    ${dont(`<span style="display:inline-block;transform:rotate(37deg)">${sym('color', 70)}</span>`, 'Girar assim, também não')}
  </div></div>
  <div class="b-block"><h3>Baixar</h3><div class="b-actions" style="margin:0"><button class="b-btn primary" data-dl="color">SVG colorido</button><button class="b-btn secondary" data-dl="mono">SVG mono</button><button class="b-btn secondary" data-dl="inverse">SVG invertido</button><span class="b-tiny" style="margin:0">O SVG referencia a fonte pelo nome. Pra virar arquivo final, converta o texto em curvas no Figma/Illustrator.</span></div></div>
  </div>`;
};

/* ---------- CORES & TIPO ---------- */
BP.renderColors = function (s) {
  const c = s.colors, t = s.type;
  const roles = [['primary', 'Primária', 'Botões, links, destaques'], ['secondary', 'Secundária', 'Apoio, stickers, contraste'], ['accent', 'Acento', 'Marca-texto, detalhes, sparkles'], ['paper', 'Papel', 'Fundo claro'], ['ink', 'Tinta', 'Texto e fundo escuro']];
  const scale = k => `<div class="b-scale">${[95, 85, 70, 55, 35, 0, -20, -35, -50, -65].map((m, i) => `<i data-n="${(i + 1) * 100 - 50}" style="background:color-mix(in oklab,${c[k]},${m >= 0 ? 'white ' + m : 'black ' + (-m)}%)"></i>`).join('')}</div>`;
  const on = (bg) => BP.bestOn(bg, c.paper, c.ink);
  const pairs = [[c.ink, c.paper, 'Texto / papel'], [c.paper, c.ink, 'Papel / tinta'], [c.primary, c.paper, 'Primária / papel'], [on(c.primary), c.primary, 'Texto no botão'], [c.secondary, c.paper, 'Secundária / papel'], [on(c.secondary), c.secondary, 'Texto na secundária'], [c.ink, c.accent, 'Tinta / acento'], [c.primary, c.ink, 'Primária / tinta']];
  const cc = pairs.map(([fg, bg, n]) => { const r = BP.contrast(fg, bg); const [lbl, cls] = BP.badge(r); return `<div class="b-cc" style="background:${bg};color:${fg}"><b>Aa</b><span>${n}</span><span>${r.toFixed(2)}:1</span><span class="badge ${cls}">${lbl}</span></div>`; }).join('');
  const sizes = ['h1', 'h2', 'h3', 'h4'].map((h, i) => `${h} ${(t.base * Math.pow(t.scale, [5, 3.4, 2, 1][i])).toFixed(0)}px`).join(' · ');
  return `<div class="b-page">
  <h2>Cores & tipografia</h2><p class="b-intro">Paleta, escalas geradas automaticamente, teste de contraste (WCAG) e espécime das fontes escolhidas.</p>
  <div class="b-block"><h3>Paleta</h3><div class="b-swatches">${roles.map(([k, n, d]) => `<div class="b-swatch"><div class="top" style="background:${c[k]};color:${on(c[k])}">${c[k].toUpperCase()}</div><div class="info"><b>${n}</b><span>${d}</span></div></div>`).join('')}</div>
    <div style="margin-top:1.2em">${['primary', 'secondary', 'accent'].map(k => `<div class="b-scale-row"><span>${k}</span>${scale(k)}</div>`).join('')}</div>
    ${c.gradient ? `<div class="b-panel grad" style="margin-top:1em;min-height:70px;display:flex;align-items:center"><span class="b-lbl">gradiente ${c.gradientAngle}°</span><b style="font-family:var(--b-font-head)">primária → secundária</b></div>` : ''}
  </div>
  <div class="b-block"><h3>Contraste <small>AA = 4.5:1 texto normal · 3:1 texto grande</small></h3><div class="b-contrast-grid">${cc}</div></div>
  <div class="b-block"><h3>Duas fontes, uma voz</h3><div class="b-type-pair">
    <div class="b-panel"><h4>títulos · ${esc(t.head)} ${t.headWeight}</h4><div class="big" style="font-family:var(--b-font-head);font-weight:var(--b-head-weight);letter-spacing:var(--b-head-tracking)">Aa</div><div class="name">${esc(t.head)}</div><div class="b-alpha">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</div></div>
    <div class="b-panel"><h4>corpo · ${esc(t.body)} ${t.bodyWeight}</h4><div class="big" style="font-family:var(--b-font-body)">Aa</div><div class="name" style="font-family:var(--b-font-body);font-weight:600">${esc(t.body)}</div><div class="b-alpha" style="font-family:var(--b-font-body);font-size:var(--b-base)">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 ?!&@</div></div>
    <div class="b-panel"><h4>acento · ${esc(t.accent)} itálico</h4><div class="big b-accent-font">Aa</div><div class="name b-accent-font" style="font-size:var(--b-h3)">${esc(t.accent)}</div><p class="b-muted" style="font-size:var(--b-sm)">Usada em destaques de título, citações e detalhes com personalidade.</p></div>
    <div class="b-panel"><h4>mono · ${esc(t.mono)}</h4><div class="big" style="font-family:var(--b-font-mono);font-weight:500">Aa</div><div class="name" style="font-family:var(--b-font-mono);font-weight:500">${esc(t.mono)}</div><div class="b-code">const futuro = <span class="s">'com calma'</span>;\n<span class="c">// labels, números, código</span></div></div>
  </div></div>
  <div class="b-block"><h3>Espécime <small>base ${t.base}px · escala ${t.scale} · ${sizes}</small></h3><div class="b-panel"><div class="b-specimen">
    <div class="b-sp"><small>display</small><div class="disp">${BP.hl('Pronto pro *amanhã*')}</div></div>
    <div class="b-sp"><small>h1 · ${(t.base * Math.pow(t.scale, 5)).toFixed(0)}px</small><h1>O futuro chega em pedaços pequenos</h1></div>
    <div class="b-sp"><small>h2</small><h2>Tecnologia que sua empresa entende</h2></div>
    <div class="b-sp"><small>h3</small><h3>Diagnóstico em duas semanas</h3></div>
    <div class="b-sp"><small>h4</small><h4>Agentes que trabalham de verdade</h4></div>
    <div class="b-sp"><small>lead</small><p class="b-lead">A gente ajuda empresas a colocar IA pra trabalhar de verdade: projetos, automações e produtos que fazem sentido no dia a dia.</p></div>
    <div class="b-sp"><small>corpo · ${t.base}px</small><p>Começamos entendendo onde dói. Às vezes a resposta é uma automação simples. Às vezes é "ainda não". As duas são boas respostas. Preferimos entregar algo pequeno funcionando do que algo grande no papel. <a style="color:var(--b-primary);text-decoration:underline">Link inline</a>, <b>negrito</b>, <em>itálico</em> e <code>código</code>.</p></div>
    <div class="b-sp"><small>pequeno</small><p style="font-size:var(--b-sm);color:var(--b-muted)">Sem contrato de 12 meses. Sem jargão. Sem surpresa na fatura.</p></div>
    <div class="b-sp"><small>eyebrow</small><span class="b-eyebrow" style="margin:0">Serviços</span></div>
  </div></div></div>
  </div>`;
};

/* ---------- UI KIT ---------- */
BP.renderKit = function (s) {
  const m = BP.samples(s).micro;
  return `<div class="b-page">
  <h2>UI kit</h2><p class="b-intro">Componentes de interface com as regras da marca aplicadas. Útil pra ver como raio, sombra, borda e cor conversam entre si.</p>
  <div class="b-kit">
    <div class="b-panel"><h4>Botões</h4><div class="row"><a class="b-btn primary lg">Primário grande</a><a class="b-btn primary">Primário</a><a class="b-btn primary sm">Pequeno</a></div><div class="row"><a class="b-btn secondary">Secundário</a><a class="b-btn ghost">Fantasma</a><a class="b-btn primary">${BP.ICONS.spark} Com ícone</a><a class="b-btn primary" style="opacity:.5;pointer-events:none">Desabilitado</a></div></div>
    <div class="b-panel"><h4>Formulário</h4><div><span class="b-label">Seu e-mail</span><input class="b-input" placeholder="voce@empresa.com.br"></div><div><span class="b-label">Conta pra gente o que trava hoje</span><textarea class="b-input" rows="2" placeholder="Ex.: digitamos pedido à mão…"></textarea></div><div class="row"><span class="b-check on"><i>✓</i> Quero receber a newsletter</span><span class="b-check"><i></i> Já usei IA na empresa</span><span class="b-toggle on"></span><span class="b-toggle"></span></div></div>
    <div class="b-panel"><h4>Tags & badges</h4><div class="row"><span class="b-tag p">agentes</span><span class="b-tag s">automação</span><span class="b-tag a">produto</span><span class="b-tag">dados</span><span class="b-tag p">${BP.ICONS.check} feito</span></div><div class="row"><span class="b-crumbs">Início <span>/</span> Cases <span>/</span> <b>Padaria do Futuro</b></span></div><div class="row"><span class="b-tabs"><span class="on">Visão geral</span><span>Processo</span><span>Resultados</span></span></div><div class="row"><span class="b-pag"><span>‹</span><span class="on">1</span><span>2</span><span>3</span><span>›</span></span><span class="b-avatar-row">${avatar(BP.DEMO_PERSON.initials)}${avatar('AC')}${avatar('+3')}</span></div></div>
    <div class="b-panel"><h4>Feedback</h4><div class="b-alert info">${BP.ICONS.spark}<div><b>Dica</b> · Comece pelo processo que mais dói. Não pela ferramenta.</div></div><div class="b-alert ok">${BP.ICONS.check}<div><b>${esc(m.success)}</b></div></div><div class="b-alert warn"><span>⚠</span><div><b>Atenção</b> · Esse campo mudou de nome na planilha.</div></div><div class="b-alert err"><span>✕</span><div><b>${esc(m.error)}</b></div></div><div class="row"><span class="b-toast">${BP.ICONS.check} ${esc(m.success)}</span><span class="b-tooltip">${esc(m.loading)}</span></div></div>
    <div class="b-panel"><h4>Card & progresso</h4><div class="b-card"><span class="b-tag p" style="margin-bottom:.8em">em andamento</span><h3>Agente de pedidos</h3><p>Sprint 3 de 5 · próxima entrega sexta</p><div class="b-progress" style="margin-top:1em"><i></i></div></div><div class="b-empty"><b>${esc(m.empty)}</b>${esc(BP.copy(s).cta)}</div></div>
    <div class="b-panel"><h4>Tabela</h4><table class="b-table"><tr><th>Projeto</th><th>Status</th><th>Prazo</th></tr><tr><td>Agente de pedidos</td><td><span class="b-tag p">construindo</span></td><td class="b-mono">sex, 12</td></tr><tr><td>Portal do paciente</td><td><span class="b-tag a">desenho</span></td><td class="b-mono">qui, 25</td></tr><tr><td>Roteirização</td><td><span class="b-tag">cuidando</span></td><td class="b-mono">contínuo</td></tr></table></div>
    <div class="b-panel"><h4>Modal</h4><div class="b-modal-mock"><h3>Confirmar diagnóstico?</h3><p>Duas semanas, sem compromisso de continuidade. Você recebe um plano de 90 dias que cabe numa página.</p><div class="b-actions"><a class="b-btn ghost">Depois</a><a class="b-btn primary">Confirmar</a></div></div></div>
    <div class="b-panel"><h4>Código</h4><div class="b-code"><span class="k">const</span> agente = <span class="k">await</span> criar({\n  nome: <span class="s">'atendente'</span>,\n  tom: <span class="s">'${esc(s.voice.playful > 66 ? 'brincalhão' : s.voice.playful > 33 ? 'leve' : 'sério')}'</span>,\n  promete: <span class="s">'só o que cumpre'</span>,\n});\n<span class="c">// ${esc(m.loading)}</span></div></div>
  </div></div>`;
};

/* ---------- APLICAÇÕES ---------- */
BP.renderApps = function (s) {
  const id = s.identity, c = BP.copy(s), sm = BP.samples(s);
  const mail = id.domain ? 'oi@' + id.domain : 'oi@email.com';
  const tee = cls => `<svg class="b-tee ${cls}" viewBox="0 0 200 200"><path class="fabric" d="M60 30l25-10c5 8 25 8 30 0l25 10 30 30-25 20-10-8v98H65V72l-10 8-25-20z"/><foreignObject x="82" y="70" width="36" height="36"><div xmlns="http://www.w3.org/1999/xhtml">${BP.logoSVG(s, {size: 36, variant: cls === 'light' ? 'color' : 'white'})}</div></foreignObject></svg>`;
  return `<div class="b-page">
  <h2>Aplicações</h2><p class="b-intro">A marca vivendo em coisas reais: cartão, e-mail, redes sociais, slide, adesivo, camiseta. Se funciona aqui, funciona em qualquer lugar.</p>
  <div class="b-apps">
    <div class="b-app wide"><h4>Cartão de visita</h4><div class="b-cards">
      <div class="b-bcard front">${BP.lockup(s, {size: 30, color: 'var(--b-ink)'})}<div><div class="who"><b>${BP.DEMO_PERSON.name}</b><span>${BP.DEMO_PERSON.role}</span></div><div class="contact" style="margin-top:.6em">${esc(mail)}<br>${esc(id.domain || 'site.com.br')}<br>+55 (11) 9 9999-9999</div></div></div>
      <div class="b-bcard back"><div class="tag">${esc(id.tagline)}</div>${BP.lockup(s, {size: 150, lockup: 'symbol', variant: 'white'})}</div>
    </div></div>
    <div class="b-app"><h4>Assinatura de e-mail</h4><div class="b-sig">${BP.logoSVG(s, {size: 52})}<div class="sig-l"><b>${BP.DEMO_PERSON.name}</b><div class="r">Fundador · ${esc(id.name)}</div><div class="m">${esc(mail)} · ${esc(id.domain || '')}</div></div></div></div>
    <div class="b-app"><h4>Crachá</h4><div class="b-badge-id">${BP.lockup(s, {size: 22})}${avatar(BP.DEMO_PERSON.initials)}<b>${BP.DEMO_PERSON.name}</b><span>${esc(id.name)}</span></div></div>
    <div class="b-app wide"><h4>Instagram · feed & story</h4><div class="b-social">
      <div class="b-post">${s.pattern.sticker ? `<div class="b-sticker">${esc(c.sticker)}</div>` : '<span></span>'}<span class="n">01 / 05</span><h3>${BP.hl(c.headline)}</h3><div class="foot">${BP.lockup(s, {size: 22, color: 'var(--b-ink)'})}<span>@${esc(id.name.toLowerCase().replace(/[^a-z0-9]/g, ''))}</span></div></div>
      <div class="b-post alt"><span></span><h3>${esc(['3 coisas que IA faz na sua empresa hoje. Sem mágica.', '3 coisas que IA já faz na sua empresa hoje (sem mágica)', 'IA na sua empresa: 3 coisas que dá pra fazer HOJE ☕'][c.P])}</h3><div class="foot"><span>deslize →</span><span>${esc(id.domain || '')}</span></div></div>
      <div class="b-story ${s.colors.gradient ? 'g' : ''}"><div class="top"><i></i><i></i><i></i></div><h3>${esc(['Bastidores de um projeto de IA', 'Bastidores: como nasce um agente', 'Bora ver um robô nascendo? 🤖'][c.P])}</h3><span class="cta">${esc(c.cta)}</span></div>
      <div class="b-post ink"><span></span><h3 class="b-tagline-font" style="font-weight:400">"${esc(s.purpose.promise)}"</h3><div class="foot">${BP.lockup(s, {size: 22, variant: 'inverse'})}<span>manifesto</span></div></div>
    </div></div>
    <div class="b-app wide"><h4>Capa do LinkedIn</h4><div class="b-banner"><div>${BP.lockup(s, {size: 34, variant: 'inverse'})}<h3 style="margin-top:.8em">${BP.hl(c.headline)}</h3></div><div class="b-visual-shapes"><i class="s1"></i><i class="s2"></i><i class="s3"></i></div></div></div>
    <div class="b-app wide"><h4>Slide de abertura</h4><div class="b-slide"><div class="stripe"></div>${s.pattern.sparkles ? BP.sparkle('k1') : ''}${BP.lockup(s, {size: 34, color: 'var(--b-ink)'})}<h2 style="color:var(--b-ink)">${BP.hl(['Diagnóstico de IA: *proposta*', 'Proposta: diagnóstico de IA em *duas semanas*', 'Bora? Diagnóstico de IA em *duas semanas* ✨'][c.P])}</h2><div class="meta"><span>${esc(id.name)} · ${new Date().toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}</span><span>confidencial</span></div></div></div>
    <div class="b-app"><h4>Adesivos</h4><div class="b-stickers"><span class="b-die">${BP.logoSVG(s, {size: 84})}</span><span class="b-die sq">${BP.logoSVG(s, {size: 84, variant: 'mono'})}</span><span class="b-die-txt">${esc(['sem hype', 'sem hype ✌️', 'sem pânico 🚀'][c.P])}</span></div></div>
    <div class="b-app"><h4>Camiseta</h4><div class="b-stickers">${tee('')}${tee('light')}</div></div>
    <div class="b-app wide"><h4>Bio & CTA</h4><div class="b-panel"><p style="font-size:var(--b-base)"><b style="font-family:var(--b-font-head)">${esc(sm.bio)}</b></p><p class="b-muted" style="margin-top:.6em;font-size:var(--b-sm)">↓ ${esc(c.cta)} · ${esc(id.domain || '')}</p></div></div>
  </div></div>`;
};

/* ---------- VOZ ---------- */
BP.renderVoice = function (s) {
  const v = s.voice, sm = BP.samples(s), c = BP.copy(s);
  const bars = [['casual', 'Formal', 'Casual'], ['playful', 'Sério', 'Brincalhão'], ['simple', 'Técnico', 'Simples'], ['warm', 'Reservado', 'Caloroso']].map(([k, a, b]) => `<div class="tb"><span>${a}</span><div class="track"><i style="left:${v[k]}%"></i></div><span class="r">${b}</span></div>`).join('');
  const sample = (t, body) => `<div class="b-sample"><h4>${t}</h4><div>${esc(body).replace(/^(Assunto:.*)$/m, '<b>$1</b>').replace(/^(Proposta:.*)$/m, '<b>$1</b>')}</div></div>`;
  return `<div class="b-page">
  <h2>Voz & escrita</h2><p class="b-intro">Como a marca fala. Mexa nos sliders de tom e veja o mesmo texto mudar de roupa. Os textos do site também seguem essas regras.</p>
  <div class="b-block"><div class="b-voice-grid">
    <div class="b-panel"><span class="b-lbl">tom de voz</span><div class="b-tone-bars" style="margin-top:1.6em">${bars}</div><p class="b-muted" style="margin-top:1.4em;font-size:var(--b-sm)">Pessoa: <b>${esc(v.person)}</b> · Trata por: <b>${esc(v.address)}</b> · Emoji: <b>${esc(v.emoji)}</b></p></div>
    <div class="b-panel"><span class="b-lbl">no site, hoje</span><div style="margin-top:1.6em"><h3 style="font-size:var(--b-h3)">${BP.hl(c.headline)}</h3><p class="b-lead" style="font-size:var(--b-base);margin-top:.6em">${esc(c.sub)}</p><div class="b-actions" style="margin-top:1em"><a class="b-btn primary">${esc(c.cta)}</a><a class="b-btn ghost">${esc(c.cta2)}</a></div></div></div>
  </div></div>
  <div class="b-block"><h3>Regras de escrita <small>derivadas do tom</small></h3><ul class="b-rules">${sm.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>
  <div class="b-block"><h3>Palavras</h3><div class="b-words"><div class="b-panel use"><h4>Usamos</h4>${v.use.map(x => `<span class="w">${esc(x)}</span>`).join('')}</div><div class="b-panel avoid"><h4>Evitamos</h4>${v.avoid.map(x => `<span class="w">${esc(x)}</span>`).join('')}</div></div></div>
  <div class="b-block"><h3>A mesma voz em lugares diferentes</h3><div class="b-samples">${sample('E-mail de boas-vindas', sm.welcome)}${sample('Post no LinkedIn', sm.linkedin)}${sample('Resposta de suporte', sm.support)}${sample('Proposta comercial (abertura)', sm.proposal)}${sample('Página 404', sm.notfound)}${sample('Bio do Instagram', sm.bio)}</div></div>
  <div class="b-block"><h3>Microcopy</h3><div class="b-micro"><div><small>carregando</small>${esc(sm.micro.loading)}</div><div><small>vazio</small>${esc(sm.micro.empty)}</div><div><small>erro</small>${esc(sm.micro.error)}</div><div><small>sucesso</small>${esc(sm.micro.success)}</div></div></div>
  </div>`;
};

/* ---------- MANIFESTO (brand book) ---------- */
BP.renderManifesto = function (s) {
  const pu = s.purpose, id = s.identity, po = pu.positioning;
  const arch = BP.ARCHETYPES.find(a => a.id === pu.archetype) || BP.ARCHETYPES[0];
  const arch2 = BP.ARCHETYPES.find(a => a.id === pu.archetype2);
  const manifesto = pu.manifesto.split('\n').filter(Boolean).map(l => `<p>${esc(l)}</p>`).join('');
  return `<div class="b-page"><div class="b-book">
    <div class="b-book-cover">${s.pattern.sparkles ? BP.sparkle('k2') + BP.sparkle('k3') : ''}${BP.lockup(s, {size: 40, variant: 'white', color: 'inherit'})}<div><h1>${esc(id.tagline)}</h1><small style="display:block;margin-top:1.5em">brand book · v0.1 · ${new Date().toLocaleDateString('pt-BR')}</small></div></div>
    <div class="b-spread">
      <div class="b-panel"><span class="b-kicker">Missão</span><p class="big">${esc(pu.mission)}</p></div>
      <div class="b-panel"><span class="b-kicker">Visão</span><p class="big">${esc(pu.vision)}</p></div>
    </div>
    <div class="b-spread one"><div class="b-panel prim"><span class="b-kicker">Promessa</span><p class="big" style="font-size:var(--b-h2)">${esc(pu.promise)}</p></div></div>
    <div class="b-spread one"><div class="b-panel"><span class="b-kicker">Posicionamento</span><p class="big" style="font-size:var(--b-h4);font-weight:500;line-height:1.5">Para <em>${esc(po.who)}</em> que <em>${esc(po.need)}</em>, <b>${esc(id.name)}</b> é <em>${esc(po.category)}</em> que <em>${esc(po.diff)}</em>. Diferente de <em>${esc(po.alt)}</em>, ${esc(po.proof)}.</p></div></div>
    <div class="b-block"><h3>Valores</h3><div class="b-vals">${pu.values.map(v => `<div class="b-val"><b>${esc(v.n)}</b><span>${esc(v.d)}</span></div>`).join('')}</div></div>
    <div class="b-spread">
      <div class="b-panel"><span class="b-kicker">Personalidade</span><div class="b-arch"><span class="e">${arch.e}</span><div><b>${esc(arch.n)}</b><span>${esc(arch.d)} ${esc(arch.s)}</span></div></div>${arch2 ? `<div class="b-arch" style="margin-top:1em;opacity:.8"><span class="e">${arch2.e}</span><div><b>com um toque de ${esc(arch2.n)}</b><span>${esc(arch2.s)}</span></div></div>` : ''}<div class="b-mood" style="margin-top:1.4em">${pu.mood.map((m, i) => `<span style="--r:${[-2, 1, -1, 2, 0][i % 5]}">${esc(m)}</span>`).join('')}</div></div>
      <div class="b-panel"><span class="b-kicker">Somos / não somos</span><div class="b-are"><div><h4>Somos</h4><ul>${pu.are.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="no"><h4>Não somos</h4><ul>${pu.arent.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div><h4 style="margin:1.4em 0 .5em;font-size:var(--b-xs);text-transform:uppercase;letter-spacing:.08em;color:var(--b-muted)">Para quem</h4><div class="b-mood">${pu.audience.map(a => `<span style="font-weight:500">${esc(a)}</span>`).join('')}</div></div>
    </div>
    <div class="b-spread one"><div class="b-panel" style="padding:calc(var(--b-space)*3)"><span class="b-kicker">Manifesto</span><div class="b-manifesto-text">${manifesto}</div></div></div>
  </div></div>`;
};

/* ---------- BRAND SHEET ---------- */
BP.renderSheet = function (s) {
  const c = s.colors, t = s.type, sh = s.shape, v = s.voice, pu = s.purpose, id = s.identity;
  const arch = BP.ARCHETYPES.find(a => a.id === pu.archetype) || BP.ARCHETYPES[0];
  const bars = [['casual', 'Formal', 'Casual'], ['playful', 'Sério', 'Brincalhão'], ['simple', 'Técnico', 'Simples'], ['warm', 'Reservado', 'Caloroso']].map(([k, a, b]) => `<div class="tb"><span>${a}</span><div class="track"><i style="left:${v[k]}%"></i></div><span class="r">${b}</span></div>`).join('');
  const shadowN = {none: 'nenhuma', soft: 'suave', diffuse: 'difusa', hard: 'dura', tinted: 'colorida'}[sh.shadow];
  return `<div class="b-page"><div class="b-sheet">
    <div class="s12"><div class="b-sheet-head"><div>${BP.lockup(s, {size: 44})}<p>${esc(id.oneliner)}</p></div><small>brand sheet · ${new Date().toLocaleDateString('pt-BR')}<br>${esc(id.domain)}</small></div></div>
    <div class="b-panel s4"><h4>Logo</h4><div class="b-lockups">${BP.lockup(s, {size: 56, lockup: 'vertical'})}${BP.logoSVG(s, {size: 56, variant: 'mono'})}</div></div>
    <div class="b-panel s8"><h4>Cores</h4><div class="b-mini-sw">${['primary', 'secondary', 'accent', 'paper', 'ink'].map(k => `<div style="background:${c[k]};color:${BP.bestOn(c[k], c.paper, c.ink)}">${c[k].toUpperCase()}</div>`).join('')}</div></div>
    <div class="b-panel s6"><h4>Tipografia</h4><div class="ft" style="font-family:var(--b-font-head);font-weight:var(--b-head-weight)">${esc(t.head)}</div><small>títulos · ${t.headWeight} · tracking ${t.headTracking / 100}em</small><div class="ft" style="font-family:var(--b-font-body);font-size:var(--b-h4)">${esc(t.body)}</div><small>corpo · ${t.base}px · escala ${t.scale} · altura ${t.lh}</small><div class="ft b-accent-font" style="font-size:var(--b-h4)">${esc(t.accent)}</div><small>acento</small></div>
    <div class="b-panel s6"><h4>Forma</h4><dl class="kv"><dt>raio</dt><dd>${sh.radius}px ${sh.pill ? '· botões pílula' : ''} ${sh.corners !== 'uniform' ? '· cantos ' + sh.corners : ''}</dd><dt>borda</dt><dd>${sh.borderW}px</dd><dt>sombra</dt><dd>${shadowN}</dd><dt>botão</dt><dd>${sh.btn}</dd><dt>card</dt><dd>${sh.card}</dd><dt>densidade</dt><dd>${sh.density}</dd><dt>padrão</dt><dd>${s.pattern.bg} ${s.pattern.intensity}%</dd><dt>animação</dt><dd>${s.pattern.anim}</dd></dl><div class="b-actions" style="margin-top:.8em"><a class="b-btn primary sm">Botão</a><a class="b-btn secondary sm">Outro</a><span class="b-tag p">tag</span></div></div>
    <div class="b-panel s6"><h4>Voz</h4><div class="b-tone-bars">${bars}</div><p style="font-size:var(--b-xs);color:var(--b-muted);margin-top:.8em">${esc(v.person)} · ${esc(v.address)} · emoji ${esc(v.emoji)}</p></div>
    <div class="b-panel s6"><h4>Personalidade</h4><div class="b-arch"><span class="e">${arch.e}</span><div><b>${esc(arch.n)}</b><span>${esc(arch.s)}</span></div></div><div class="b-mood" style="margin-top:.8em">${pu.mood.map(m => `<span style="font-size:var(--b-xs);padding:.3em .7em">${esc(m)}</span>`).join('')}</div></div>
    <div class="b-panel s6"><h4>Missão</h4><p style="font-size:var(--b-sm)">${esc(pu.mission)}</p><h4 style="margin-top:1em">Promessa</h4><p style="font-size:var(--b-sm);font-family:var(--b-font-head);font-weight:600">${esc(pu.promise)}</p></div>
    <div class="b-panel s6"><h4>Valores</h4><div class="b-vals">${pu.values.slice(0, 4).map(vl => `<div class="b-val"><b>${esc(vl.n)}</b><span>${esc(vl.d)}</span></div>`).join('')}</div></div>
    <div class="b-sheet-actions"><button class="b-btn secondary" data-act="export-css">tokens.css</button><button class="b-btn secondary" data-act="export-json">JSON</button><button class="b-btn secondary" data-act="export-md">brand.md</button><button class="b-btn primary" data-act="print">Imprimir / PDF</button></div>
  </div></div>`;
};

/* ---------- COMEÇO (guia + checklist) ---------- */
BP.renderGuide = function (s) {
  const g = BP.GUIDE, d = s.guide || {done: [], ideasDone: []};
  if (!g) return `<div class="b-page"><h2>Começo</h2><p class="b-intro">Guia ainda não carregado (arquivo guia.js ausente).</p></div>`;
  const pri = {1: ['agora', 'p'], 2: ['esta semana', 'a'], 3: ['pode esperar', '']};
  const items = g.checklist.map((it, i) => { const done = d.done.includes(it.id); const [pl, pc] = pri[it.p]; return `<label class="${done ? 'done' : ''}"><input type="checkbox" data-check="${it.id}" ${done ? 'checked' : ''}><span class="t"><b>${esc(it.t)}</b><span>${esc(it.d)}</span>${it.u ? `<a href="${esc(it.u)}" target="_blank" rel="noopener">abrir ↗</a>` : ''}</span><span class="b-tag ${pc} pri">${pl}</span></label>`; }).join('');
  const ideas = g.ideas.map(it => `<div class="b-idea ${d.ideasDone.includes(it.id) ? 'done' : ''}" data-idea="${it.id}"><span class="fmt">${esc(it.f)} · ${esc(it.pillar)}</span><b>${esc(it.h)}</b><span>${esc(it.d)}</span><span class="why">↳ ${esc(it.w)}</span></div>`).join('');
  const week = g.week.map(w => `<div class="b-day"><b>${esc(w.d)}</b><span class="fmt">${esc(w.f)}</span><span>${esc(w.t)}</span></div>`).join('');
  const doneN = d.done.length, total = g.checklist.length;
  return `<div class="b-page"><div class="b-guide">
    <h2>Começo</h2><p class="b-intro">O que precisa existir pra agência funcionar, do dia zero, e como começar a postar essa semana. Marque o que já fez. Fica salvo.</p>
    <div class="b-block"><h3>Checklist do dia zero <small>${doneN}/${total} feitos</small></h3><div class="b-progress" style="margin-bottom:1em"><i style="width:${total ? Math.round(doneN / total * 100) : 0}%"></i></div><div class="b-check-list">${items}</div></div>
    <div class="b-block"><h3>Primeira semana no Instagram</h3><div class="b-week">${week}</div></div>
    <div class="b-block"><h3>Ideias de conteúdo <small>clique pra marcar como feita · ${d.ideasDone.length}/${g.ideas.length}</small></h3><div class="b-ideas">${ideas}</div></div>
    <div class="b-block"><h3>Guia completo</h3><div class="b-panel b-md">${g.html}</div></div>
    <div class="b-block"><h3>Fontes</h3><ul class="b-sources">${g.sources.map(u => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join('')}</ul></div>
  </div></div>`;
};

BP.renderTab = function (s, tab) {
  switch (tab) {
    case 'logo': return BP.renderLogo(s);
    case 'colors': return BP.renderColors(s);
    case 'kit': return BP.renderKit(s);
    case 'apps': return BP.renderApps(s);
    case 'voice': return BP.renderVoice(s);
    case 'manifesto': return BP.renderManifesto(s);
    case 'sheet': return BP.renderSheet(s);
    case 'guide': return BP.renderGuide(s);
    default: return BP.renderSite(s);
  }
};

/* ---------- Variáveis CSS da marca ---------- */
/* Onda: um ladrilho de N cristas que emenda em repeat-x. Amplitude e fase vem
   do CSS (background-size / background-position), entao o SVG nao muda por frame. */
const squiggle = (color, {w = 40, crests = 2, sw = 3, op = 1} = {}) => {
  const arc = w / (crests * 2);            // meia onda
  let d = `M0 6Q${arc / 2} 0 ${arc} 6`;
  for (let i = 2; i <= crests * 2; i++) d += `T${+(arc * i).toFixed(3)} 6`;
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='10' viewBox='0 0 ${w} 10'><path d='${d}' fill='none' stroke='${color}' stroke-opacity='${op}' stroke-width='${sw}' stroke-linecap='round'/></svg>`;
};
const squiggleUrl = (color, o) => `url("data:image/svg+xml,${encodeURIComponent(squiggle(color, o))}")`;
BP.applyRoot = function (root, s) {
  const c = s.colors, t = s.type, sh = s.shape, p = s.pattern;
  const r = sh.radius;
  const rCard = sh.corners === 'leaf' ? `${r * 2}px ${Math.max(2, r * .3)}px ${r * 2}px ${Math.max(2, r * .3)}px` : sh.corners === 'top' ? `${r}px ${r}px 0 0` : sh.corners === 'diagonal' ? `${r * 1.6}px 0 ${r * 1.6}px 0` : `${r}px`;
  const shadows = {none: 'none', soft: '0 1px 2px rgb(0 0 0/.04), 0 10px 28px -14px rgb(0 0 0/.22)', diffuse: '0 30px 70px -28px rgb(0 0 0/.28)', hard: '6px 6px 0 0 var(--b-fg)', tinted: '0 16px 40px -12px color-mix(in oklab, var(--b-primary) 50%, transparent)'};
  const bgHex = s.site.theme === 'dark' ? c.ink : c.paper;
  const softHex = BP.mix(c.primary, bgHex, 0.86);
  const vars = {
    '--b-primary-text': BP.readable(c.primary, bgHex, 4.5),
    '--b-primary-deep': BP.readable(c.primary, softHex, 4.5),
    '--b-primary': c.primary, '--b-secondary': c.secondary, '--b-accent': c.accent, '--b-paper': c.paper, '--b-ink': c.ink,
    '--b-on-primary': BP.bestOn(c.primary, c.paper, c.ink), '--b-on-secondary': BP.bestOn(c.secondary, c.paper, c.ink), '--b-on-accent': BP.bestOn(c.accent, c.paper, c.ink),
    '--b-grad-angle': c.gradientAngle + 'deg',
    '--b-font-tagline': BP.fontFamily({head: t.head, accent: t.accent, body: t.body}[t.taglineFont] || t.head),
    '--b-tagline-style': t.taglineFont === 'accent' ? 'italic' : 'normal',
    '--b-font-head': BP.fontFamily(t.head), '--b-font-body': BP.fontFamily(t.body), '--b-font-accent': BP.fontFamily(t.accent), '--b-font-mono': BP.fontFamily(t.mono),
    '--b-h1': (t.base * Math.pow(t.scale, 5)).toFixed(2) + 'px', '--b-h2': (t.base * Math.pow(t.scale, 3.4)).toFixed(2) + 'px',
    '--b-h3': (t.base * Math.pow(t.scale, 2)).toFixed(2) + 'px', '--b-h4': (t.base * t.scale).toFixed(2) + 'px',
    '--b-head-weight': t.headWeight, '--b-body-weight': t.bodyWeight, '--b-base': t.base + 'px', '--b-scale': t.scale, '--b-lh': t.lh, '--b-head-lh': t.headLh,
    '--b-head-tracking': (t.headTracking / 100) + 'em', '--b-head-case': t.headCase === 'upper' ? 'uppercase' : t.headCase === 'lower' ? 'lowercase' : t.headCase === 'title' ? 'capitalize' : 'none',
    '--b-radius': r + 'px', '--b-radius-btn': sh.pill ? '999px' : r + 'px', '--b-radius-card': rCard, '--b-border-w': sh.borderW + 'px', '--b-shadow': shadows[sh.shadow] || 'none',
    '--b-space': {compact: '12px', comfortable: '18px', airy: '26px'}[sh.density] || '18px', '--b-container': {narrow: '920px', medium: '1120px', wide: '1320px'}[s.site.width] || '1120px',
    '--b-stroke': sh.iconStroke, '--b-pat': (4 + p.intensity * .3).toFixed(1) + '%', '--b-grain': (p.intensity / 100 * .4).toFixed(3),
    '--b-squiggle': squiggleUrl(c.accent, {w: 40, crests: 2, sw: 3}),
    '--b-squiggle2': squiggleUrl(BP.mix(c.accent, bgHex, .45), {w: 80, crests: 1, sw: 1.6, op: .9}),
  };
  for (const k in vars) root.style.setProperty(k, String(vars[k]));
  Object.assign(root.dataset, {theme: s.site.theme, btn: sh.btn, card: sh.card, hl: t.highlight, anim: p.anim, pattern: p.bg, hero: s.site.hero, nav: s.site.nav, gradient: c.gradient ? '1' : '0'});
};

/* ---------- Exports ---------- */
BP.tokensCss = function (s) {
  const c = s.colors, t = s.type, sh = s.shape;
  return `/* ${s.identity.name} — tokens gerados pelo Brand Playground em ${new Date().toISOString().slice(0, 10)} */
:root {
  --color-primary: ${c.primary};
  --color-secondary: ${c.secondary};
  --color-accent: ${c.accent};
  --color-paper: ${c.paper};
  --color-ink: ${c.ink};
  --color-on-primary: ${BP.bestOn(c.primary, c.paper, c.ink)};
  --font-heading: ${BP.fontFamily(t.head)};
  --font-body: ${BP.fontFamily(t.body)};
  --font-accent: ${BP.fontFamily(t.accent)};
  --font-mono: ${BP.fontFamily(t.mono)};
  --font-heading-weight: ${t.headWeight};
  --font-size-base: ${t.base}px;
  --type-scale: ${t.scale};
  --line-height: ${t.lh};
  --heading-line-height: ${t.headLh};
  --heading-tracking: ${t.headTracking / 100}em;
  --radius: ${sh.radius}px;
  --radius-button: ${sh.pill ? '999px' : sh.radius + 'px'};
  --border-width: ${sh.borderW}px;
  --space: ${{compact: 12, comfortable: 18, airy: 26}[sh.density]}px;
  --container: ${{narrow: 920, medium: 1120, wide: 1320}[s.site.width]}px;
}
/* Google Fonts */
${[...new Set([t.head, t.body, t.accent, t.mono])].map(n => `/* ${BP.fontUrl ? BP.fontUrl(n, n === t.accent) : n} */`).join('\n')}
`;
};

BP.brandMd = function (s) {
  const id = s.identity, c = s.colors, t = s.type, sh = s.shape, v = s.voice, pu = s.purpose, sm = BP.samples(s), cp = BP.copy(s), po = pu.positioning;
  const arch = BP.ARCHETYPES.find(a => a.id === pu.archetype) || BP.ARCHETYPES[0], arch2 = BP.ARCHETYPES.find(a => a.id === pu.archetype2);
  const tone = k => v[k] < 34 ? 'baixo' : v[k] < 67 ? 'médio' : 'alto';
  return `# ${id.name}

> ${id.tagline}

${id.oneliner}

Domínio: ${id.domain || '—'} · Iniciais: ${id.initials}

## Essência

- **Missão:** ${pu.mission}
- **Visão:** ${pu.vision}
- **Promessa:** ${pu.promise}
- **Posicionamento:** Para ${po.who} que ${po.need}, ${id.name} é ${po.category} que ${po.diff}. Diferente de ${po.alt}, ${po.proof}.
- **Público:** ${pu.audience.join(', ')}

## Valores

${pu.values.map(x => `- **${x.n}** — ${x.d}`).join('\n')}

## Personalidade

- Arquétipo: ${arch.n} (${arch.d} ${arch.s})${arch2 ? `\n- Toque de: ${arch2.n} (${arch2.s})` : ''}
- Mood: ${pu.mood.join(', ')}
- Somos: ${pu.are.join(', ')}
- Não somos: ${pu.arent.join(', ')}

## Serviços

${pu.services.map(x => `- **${x.n}** — ${x.d}`).join('\n')}

## Voz & tom

| Eixo | Valor |
|---|---|
| Formal → Casual | ${v.casual}/100 (${tone('casual')}) |
| Sério → Brincalhão | ${v.playful}/100 (${tone('playful')}) |
| Técnico → Simples | ${v.simple}/100 (${tone('simple')}) |
| Reservado → Caloroso | ${v.warm}/100 (${tone('warm')}) |

- Pessoa: "${v.person}" · Trata o cliente por: "${v.address}" · Emoji: ${v.emoji}
- Palavras que usamos: ${v.use.join(', ')}
- Palavras que evitamos: ${v.avoid.join(', ')}

### Regras de escrita
${sm.rules.map(r => `- ${r}`).join('\n')}

### Exemplos
- **Headline:** ${cp.headline.replace(/\*/g, '')}
- **Sub:** ${cp.sub}
- **CTA:** ${cp.cta} / ${cp.cta2}
- **Bio Instagram:** ${sm.bio}
- **404:** ${sm.notfound.replace(/\n+/g, ' ')}
- **Microcopy:** carregando "${sm.micro.loading}" · vazio "${sm.micro.empty}" · erro "${sm.micro.error}" · sucesso "${sm.micro.success}"

**E-mail de boas-vindas**

\`\`\`
${sm.welcome}
\`\`\`

**Post LinkedIn**

\`\`\`
${sm.linkedin}
\`\`\`

## Identidade visual

### Cores
| Papel | Hex |
|---|---|
| Primária | ${c.primary} |
| Secundária | ${c.secondary} |
| Acento | ${c.accent} |
| Papel (fundo claro) | ${c.paper} |
| Tinta (texto / fundo escuro) | ${c.ink} |
| Texto sobre primária | ${BP.bestOn(c.primary, c.paper, c.ink)} |

Gradiente: ${c.gradient ? `sim, ${c.gradientAngle}° (primária → secundária)` : 'não'}

### Tipografia
- Títulos: ${t.head} ${t.headWeight} · tracking ${t.headTracking / 100}em · caixa ${t.headCase} · destaque "${t.highlight}"
- Corpo: ${t.body} ${t.bodyWeight} · base ${t.base}px · escala ${t.scale} · altura de linha ${t.lh}
- Acento (itálico): ${t.accent}
- Fonte da tagline: ${{head: 'títulos', accent: 'acento', body: 'corpo'}[t.taglineFont] || 'títulos'}
- Mono: ${t.mono}

### Forma
- Raio: ${sh.radius}px${sh.pill ? ' (botões pílula)' : ''} · cantos: ${sh.corners}
- Borda: ${sh.borderW}px · Sombra: ${sh.shadow} · Densidade: ${sh.density}
- Botões: ${sh.btn} · Cards: ${sh.card} · Traço de ícone: ${sh.iconStroke}

### Padrões & movimento
- Fundo: ${s.pattern.bg} (${s.pattern.intensity}%) · Sparkles: ${s.pattern.sparkles ? 'sim' : 'não'} · Sticker: ${s.pattern.sticker ? 'sim' : 'não'} · Blobs: ${s.pattern.blobs ? 'sim' : 'não'} · Setas: ${s.pattern.arrows ? 'sim' : 'não'}
- Animação: ${s.pattern.anim}

### Logo
- Forma: ${s.logo.shape} · Fonte: ${s.logo.font} ${s.logo.weight} · Iniciais: ${BP.caseText(id.initials, s.logo.case)}${s.logo.detail !== 'none' ? s.logo.detail : ''}
- Símbolo: ${s.logo.bg} · Letras: ${s.logo.fg} · Inclinação: ${s.logo.tilt}° · Composição: ${s.logo.lockup}
- Nome: caixa ${s.logo.wordCase}, peso ${s.logo.wordWeight}${s.logo.italic ? ', itálico' : ''}

### Site
- Hero: ${s.site.hero} · Nav: ${s.site.nav} · Largura: ${s.site.width} · Imagens: ${s.site.image} · Rodapé: ${s.site.footer} · Tema: ${s.site.theme}
- Seções: ${Object.entries(s.site.sections).filter(([, on]) => on).map(([k]) => k).join(', ')}

## Manifesto

${pu.manifesto.split('\n').map(l => l ? `> ${l}` : '>').join('\n')}

${s.notes.length ? `## Diário de decisões\n\n${s.notes.map(n => `- ${new Date(n.t).toLocaleString('pt-BR')} — ${n.text}`).join('\n')}\n` : ''}
---
Gerado pelo Brand Playground em ${new Date().toLocaleString('pt-BR')}.
`;
};
