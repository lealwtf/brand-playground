/* data.js — bancos de dados do playground (fontes, paletas, arquétipos, textos, estado padrão) */
window.BP = window.BP || {};

/* Fontes do Google Fonts. w = faixa variável 'a..b' ou lista '400;700'. i = tem itálico. wi = pesos itálicos (se diferentes) */
BP.FONTS = [
  {n:'Inter',c:'sans',w:'100..900',i:1},{n:'DM Sans',c:'sans',w:'100..1000',i:1},{n:'Plus Jakarta Sans',c:'sans',w:'200..800',i:1},
  {n:'Manrope',c:'sans',w:'200..800'},{n:'Space Grotesk',c:'sans',w:'300..700'},{n:'Sora',c:'sans',w:'100..800'},
  {n:'Outfit',c:'sans',w:'100..900'},{n:'Urbanist',c:'sans',w:'100..900',i:1},{n:'Figtree',c:'sans',w:'300..900',i:1},
  {n:'Onest',c:'sans',w:'100..900'},{n:'Work Sans',c:'sans',w:'100..900',i:1},{n:'Karla',c:'sans',w:'200..800',i:1},
  {n:'Rubik',c:'sans',w:'300..900',i:1},{n:'Archivo',c:'sans',w:'100..900',i:1},{n:'Epilogue',c:'sans',w:'100..900',i:1},
  {n:'Schibsted Grotesk',c:'sans',w:'400..900',i:1},{n:'Instrument Sans',c:'sans',w:'400..700',i:1},{n:'Hanken Grotesk',c:'sans',w:'100..900',i:1},
  {n:'Gabarito',c:'sans',w:'400..900'},{n:'Albert Sans',c:'sans',w:'100..900',i:1},{n:'Red Hat Display',c:'sans',w:'300..900',i:1},
  {n:'Nunito Sans',c:'sans',w:'200..1000',i:1},{n:'Lexend',c:'sans',w:'100..900'},{n:'Geologica',c:'sans',w:'100..900'},
  {n:'Golos Text',c:'sans',w:'400..900'},{n:'Familjen Grotesk',c:'sans',w:'400..700',i:1},{n:'Poppins',c:'sans',w:'300;400;500;600;700;800',i:1},
  {n:'Bricolage Grotesque',c:'display',w:'200..800'},{n:'Syne',c:'display',w:'400..800'},{n:'Unbounded',c:'display',w:'200..900'},
  {n:'Righteous',c:'display',w:'400'},{n:'Caprasimo',c:'display',w:'400'},{n:'Bagel Fat One',c:'display',w:'400'},
  {n:'Gasoek One',c:'display',w:'400'},{n:'Dela Gothic One',c:'display',w:'400'},
  {n:'Nunito',c:'rounded',w:'200..1000',i:1},{n:'Quicksand',c:'rounded',w:'300..700'},{n:'Comfortaa',c:'rounded',w:'300..700'},
  {n:'Baloo 2',c:'rounded',w:'400..800'},{n:'Fredoka',c:'rounded',w:'300..700'},{n:'Sniglet',c:'rounded',w:'400;800'},
  {n:'Shantell Sans',c:'hand',w:'300..800',i:1},{n:'Playpen Sans',c:'hand',w:'100..800'},{n:'Caveat',c:'hand',w:'400..700'},
  {n:'Fraunces',c:'serif',w:'100..900',i:1},{n:'Playfair Display',c:'serif',w:'400..900',i:1},{n:'DM Serif Display',c:'serif',w:'400',i:1},
  {n:'Instrument Serif',c:'serif',w:'400',i:1},{n:'Lora',c:'serif',w:'400..700',i:1},{n:'Newsreader',c:'serif',w:'200..800',i:1},
  {n:'Literata',c:'serif',w:'200..900',i:1},{n:'Source Serif 4',c:'serif',w:'200..900',i:1},{n:'Crimson Pro',c:'serif',w:'200..900',i:1},
  {n:'EB Garamond',c:'serif',w:'400..800',i:1},{n:'Cormorant Garamond',c:'serif',w:'300;400;500;600;700',i:1},
  {n:'Libre Baskerville',c:'serif',w:'400;700',i:1,wi:'400'},{n:'Spectral',c:'serif',w:'200;300;400;500;600;700;800',i:1},
  {n:'Bodoni Moda',c:'serif',w:'400..900',i:1},{n:'Young Serif',c:'serif',w:'400'},{n:'Gloock',c:'serif',w:'400'},
  {n:'JetBrains Mono',c:'mono',w:'100..800',i:1},{n:'IBM Plex Mono',c:'mono',w:'100;200;300;400;500;600;700',i:1},
  {n:'Space Mono',c:'mono',w:'400;700',i:1},{n:'DM Mono',c:'mono',w:'300;400;500',i:1},{n:'Fira Code',c:'mono',w:'300..700'},
];
BP.FONT_CATS = {sans:'Sans',display:'Display',rounded:'Arredondada',hand:'Manuscrita',serif:'Serifada',mono:'Mono'};

BP.FONT_PAIRS = [
  {n:'Calmo & moderno',head:'Sora',body:'Inter',accent:'Instrument Serif',mono:'JetBrains Mono'},
  {n:'Editorial humano',head:'Fraunces',body:'Figtree',accent:'Fraunces',mono:'IBM Plex Mono'},
  {n:'Amigável',head:'Nunito',body:'Nunito Sans',accent:'Caveat',mono:'DM Mono'},
  {n:'Geométrico',head:'Outfit',body:'DM Sans',accent:'DM Serif Display',mono:'Space Mono'},
  {n:'Techie tranquilo',head:'Space Grotesk',body:'Work Sans',accent:'Newsreader',mono:'JetBrains Mono'},
  {n:'Brincalhão',head:'Baloo 2',body:'Plus Jakarta Sans',accent:'Shantell Sans',mono:'Fira Code'},
  {n:'Clássico novo',head:'Playfair Display',body:'Lora',accent:'Playfair Display',mono:'IBM Plex Mono'},
  {n:'Grotesk suave',head:'Bricolage Grotesque',body:'Onest',accent:'Instrument Serif',mono:'DM Mono'},
  {n:'Redondinho',head:'Fredoka',body:'Quicksand',accent:'Caveat',mono:'Space Mono'},
  {n:'Sério mas leve',head:'Manrope',body:'Manrope',accent:'Literata',mono:'JetBrains Mono'},
  {n:'Bold & quente',head:'Unbounded',body:'Hanken Grotesk',accent:'Young Serif',mono:'Fira Code'},
  {n:'Papel & tinta',head:'Newsreader',body:'Albert Sans',accent:'Newsreader',mono:'IBM Plex Mono'},
];

BP.PALETTES = [
  {n:'Sálvia & Terracota',m:'calmo, quente',primary:'#4F7A63',secondary:'#E07A5F',accent:'#F2CC8F',paper:'#FAF7F2',ink:'#2B2D2F'},
  {n:'Céu & Tangerina',m:'leve, otimista',primary:'#4C86C6',secondary:'#FF8C42',accent:'#FFD166',paper:'#F7F9FC',ink:'#1E2A38'},
  {n:'Lavanda & Limão',m:'brincalhão',primary:'#7C6FCD',secondary:'#C9E265',accent:'#FFB5A7',paper:'#FBFAFF',ink:'#2A2540'},
  {n:'Oceano & Coral',m:'fresco',primary:'#1F6F8B',secondary:'#FF7B72',accent:'#FFD8B1',paper:'#F6FAFB',ink:'#14303B'},
  {n:'Areia & Floresta',m:'sereno, sólido',primary:'#2F5D50',secondary:'#C8A97E',accent:'#E9C46A',paper:'#FBF8F1',ink:'#1F2A26'},
  {n:'Grafite & Manteiga',m:'direto, moderno',primary:'#2E2E38',secondary:'#F5D76E',accent:'#8FB8DE',paper:'#F6F5F0',ink:'#1B1B22'},
  {n:'Pêssego & Índigo',m:'acolhedor',primary:'#4A4E9D',secondary:'#FFB49A',accent:'#7ED6C0',paper:'#FFF9F5',ink:'#26264A'},
  {n:'Menta & Ameixa',m:'elegante, leve',primary:'#5D3A6B',secondary:'#A7E8D0',accent:'#F7C59F',paper:'#F9F7FB',ink:'#2A1F30'},
  {n:'Mono & Sol',m:'minimal',primary:'#232323',secondary:'#FFC857',accent:'#6C9BD1',paper:'#FAFAF7',ink:'#171717'},
  {n:'Musgo & Céu',m:'natural',primary:'#6E9B7F',secondary:'#BFD8FF',accent:'#F4A261',paper:'#F8FAF7',ink:'#23302A'},
  {n:'Argila & Água',m:'artesanal',primary:'#B85C38',secondary:'#7FB3D5',accent:'#F1DCA7',paper:'#FBF6F1',ink:'#33261F'},
  {n:'Noite suave',m:'tech, calmo',primary:'#7AA2F7',secondary:'#F7768E',accent:'#E0AF68',paper:'#F5F6FA',ink:'#1A1B26'},
  {n:'Cobre & Petróleo',m:'sofisticado',primary:'#1B4B5A',secondary:'#D98E5A',accent:'#F0E6C8',paper:'#F7F5F0',ink:'#12262C'},
  {n:'Cereja & Creme',m:'caloroso, ousado',primary:'#C2413F',secondary:'#F6E7C1',accent:'#7BAF8E',paper:'#FFFBF4',ink:'#2E1C1C'},
];

BP.SHAPES = [
  {id:'circle',n:'Círculo'},
  {id:'squircle',n:'Squircle'},
  {id:'rounded',n:'Quadrado'},
  {id:'notch',n:'Chanfrado',sf:.92},
  {id:'pill',n:'Pílula',sf:.9},
  {id:'ticket',n:'Bilhete',sf:.58},
  {id:'hex',n:'Hexágono'},
  {id:'pentagon',n:'Pentágono',sf:.82,dy:3},
  {id:'octagon',n:'Octógono',sf:.92},
  {id:'triangle',n:'Triângulo',sf:.55,dy:9},
  {id:'diamond',n:'Losango',sf:.72},
  {id:'cross',n:'Cruz',sf:.68},
  {id:'arch',n:'Arco',sf:.8,dy:6},
  {id:'shield',n:'Escudo',sf:.78,dy:-2},
  {id:'drop',n:'Gota',sf:.68,dy:10},
  {id:'leaf',n:'Folha',sf:.7},
  {id:'flower',n:'Flor',sf:.8},
  {id:'cloud',n:'Nuvem',sf:.62,dy:5},
  {id:'blob',n:'Blob'},
  {id:'blob2',n:'Blob 2',sf:.82},
  {id:'speech',n:'Balão',sf:.7,dy:-9},
  {id:'bookmark',n:'Marcador',sf:.72,dy:-10},
  {id:'star',n:'Estrela',sf:.6,dy:3},
  {id:'burst',n:'Selo pontudo',sf:.72},
  {id:'seal',n:'Selo ondulado',sf:.82},
  {id:'spark',n:'Faísca',sf:.5},
  {id:'ring',n:'Anel vazado',sf:.8},
  {id:'ringSquare',n:'Moldura',sf:.85},
  {id:'none',n:'Sem fundo'},
];
BP.STROKE_SHAPES = ['ring','ringSquare'];
BP.PATTERNS = [
  {id:'none',n:'Liso'},{id:'grain',n:'Grão'},{id:'dots',n:'Pontos'},{id:'grid',n:'Grade'},{id:'lines',n:'Diagonais'},
  {id:'cross',n:'Cruzinhas'},{id:'aurora',n:'Aurora'},{id:'blobs',n:'Blobs'},{id:'waves',n:'Ondas'},
];

BP.ARCHETYPES = [
  {id:'sage',n:'O Sábio',e:'🦉',d:'Entende antes de agir. Explica com clareza.',s:'Soa calmo, preciso, didático.'},
  {id:'explorer',n:'O Explorador',e:'🧭',d:'Curioso, gosta de território novo.',s:'Soa aberto, inquieto, otimista.'},
  {id:'creator',n:'O Criador',e:'🛠️',d:'Faz coisas que não existiam.',s:'Soa inventivo, prático, orgulhoso do ofício.'},
  {id:'magician',n:'O Mago',e:'✨',d:'Transforma o complicado em simples.',s:'Soa visionário, com pé no chão.'},
  {id:'caregiver',n:'O Cuidador',e:'🌱',d:'Cuida de quem está junto.',s:'Soa acolhedor, paciente, generoso.'},
  {id:'jester',n:'O Bobo da Corte',e:'🎈',d:'Leveza para assuntos sérios.',s:'Soa divertido, espontâneo, humano.'},
  {id:'hero',n:'O Herói',e:'🏔️',d:'Encara o problema difícil.',s:'Soa confiante, direto, encorajador.'},
  {id:'everyman',n:'A Pessoa Comum',e:'☕',d:'Gente como a gente. Sem pedestal.',s:'Soa próximo, honesto, sem frescura.'},
  {id:'lover',n:'O Amante',e:'💛',d:'Faz com carinho. Detalhe importa.',s:'Soa caloroso, sensível, estético.'},
  {id:'ruler',n:'O Governante',e:'🏛️',d:'Ordem, método, responsabilidade.',s:'Soa firme, organizado, confiável.'},
  {id:'innocent',n:'O Inocente',e:'🌤️',d:'Otimismo sincero. Simplicidade.',s:'Soa leve, positivo, limpo.'},
  {id:'outlaw',n:'O Fora da Lei',e:'⚡',d:'Questiona o jeito velho de fazer.',s:'Soa provocador, ousado, sem medo.'},
];

BP.VALUE_BANK = [
  {n:'Calma',d:'Pressa é inimiga de projeto bom. A gente pensa antes de construir.'},
  {n:'Clareza',d:'Se você não entendeu, a culpa é nossa. Explicamos até fazer sentido.'},
  {n:'Curiosidade',d:'Perguntamos "por quê?" mais vezes do que seria educado.'},
  {n:'Honestidade radical',d:'Se IA não resolve, a gente fala. Mesmo perdendo a venda.'},
  {n:'Futuro com pé no chão',d:'Visão longa, passos curtos. Nada de promessa mágica.'},
  {n:'Menos, melhor',d:'Um problema resolvido de verdade vale mais que dez "features".'},
  {n:'Pessoas primeiro',d:'Tecnologia serve gente. Nunca o contrário.'},
  {n:'Aprender em voz alta',d:'Compartilhamos o que descobrimos, inclusive os erros.'},
  {n:'Feito com carinho',d:'Detalhe importa. Do código à mensagem de erro.'},
  {n:'Coragem',d:'Topar o projeto difícil e dizer não pro projeto errado.'},
  {n:'Parceria',d:'Fazemos junto. Cliente não é ticket, é time.'},
  {n:'Simplicidade',d:'Complexidade escondida, não empurrada pro usuário.'},
  {n:'Responsabilidade',d:'IA com critério: dados, privacidade e impacto levados a sério.'},
  {n:'Ficar por perto',d:'Entrega não é despedida. Acompanhamos depois do deploy.'},
  {n:'Leveza',d:'Trabalho sério não precisa ser pesado.'},
  {n:'Autonomia do cliente',d:'Você entende e controla o que construímos. Sem dependência forçada.'},
];

BP.MOOD_BANK = ['calmo','curioso','caloroso','preciso','ousado','sonhador','direto','acolhedor','esperto','leve','confiável','inventivo','honesto','otimista','sereno','nerd','elegante','descomplicado','brincalhão','artesanal'];
BP.AUDIENCE_BANK = ['PMEs em crescimento','Indústria','Varejo','Saúde','Educação','Agro','Serviços financeiros','Startups','Escritórios de advocacia','Times de operações','Diretores de inovação','Fundadores','Logística','Imobiliário','Contabilidades'];
BP.ARE_BANK = ['calmos','curiosos','honestos','próximos','práticos','didáticos','leves','artesanais','pacientes','diretos','otimistas','nerds'];
BP.ARENT_BANK = ['apressados','vendedores de hype','frios','arrogantes','corporativos demais','misteriosos','caros por esporte','robóticos','genéricos','alarmistas'];

BP.NAMES = {
  pt:['Amanhã','Vindouro','Próximo','Norte','Bússola','Lume','Farol','Semente','Raiz','Ponte','Trilha','Porto','Horizonte','Alvorada','Maré','Órbita','Vela','Leme','Quintal','Varanda','Estufa','Oficina','Manhã','Adiante','Traço','Rumo','Passo','Clareira','Compasso','Fábrica'],
  en:['Lumen','Nova','Orbit','Kite','Hatch','Loom','Tandem','Compass','Prisma','Tessera','Ember','Haven','Almanac','Meridian','Kindred','Oriel','Sprout','Ferry','Anteia','Halo','Verso','Atlas','Nimbus','Tonic','Marlow','Bloom','Beacon','Fathom','Ridge','Mosaic'],
  suffix:[' Labs',' Studio',' & Co',' Collective',' Works',' Projetos',' Ateliê',' Digital',' Futuros',' Lab','.ai',' Tech',' Estúdio'],
  prefix:['Casa ','Estúdio ','Oficina ','Laboratório ','Clube ','Coletivo ','Ateliê '],
  onsets:['n','m','l','r','v','t','k','s','z','b','d','p','f','j','al','ar','or','an'],
  vowels:['a','e','i','o','u','ia','io','ei'],
};

/* ---------- Domínios ---------- */
BP.DOMAIN_TLDS = ['.com', '.com.br', '.br', '.ai', '.app', '.dev', '.io', '.co', '.studio', '.tech', '.digital', '.agency', '.works', '.design', '.systems', '.software', '.solutions', '.consulting', '.net', '.xyz'];
BP.DOMAIN_PREFIXES = ['', 'somos', 'agencia', 'estudio', 'use', 'get', 'oi', 'hey', 'vai', 'time', 'grupo', 'casa', 'fala', 'sou', 'the'];
BP.DOMAIN_SUFFIXES = ['', 'ia', 'ai', 'lab', 'labs', 'studio', 'digital', 'tech', 'co', 'projetos', 'works', 'hq', 'dev', 'agencia', 'sistemas', 'app'];
BP.DOMAIN_GENERIC = ['studio', 'estudio', 'labs', 'lab', 'co', 'collective', 'coletivo', 'digital', 'tech', 'agency', 'agencia', 'works', 'projetos', 'atelie', 'de', 'da', 'do', 'e', 'the', 'of', 'and'];

BP.slugify = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
/* núcleo do nome, sem as palavras genéricas: "Amanhã Studio" -> "amanha" */
BP.domainBase = name => {
  const words = String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const core = words.filter(w => !BP.DOMAIN_GENERIC.includes(w));
  return BP.slugify((core.length ? core : words).join(''));
};
/* variações do nome, ordenadas por "quanto menos enfeite, melhor" */
BP.domainVariants = function (name, base, seed = 0, n = 18) {
  const b = base || BP.domainBase(name);
  if (!b) return [];
  const full = BP.slugify(name);
  const out = [];
  const push = w => { if (w && w.length >= 4 && w.length <= 24 && !out.includes(w)) out.push(w); };
  if (full !== b) push(full);
  const combos = [];
  for (const p of BP.DOMAIN_PREFIXES) for (const s of BP.DOMAIN_SUFFIXES) {
    if (!p && !s) continue;
    const w = p + b + s;
    if (w.length < 4 || w.length > 24) continue;
    combos.push({w, score: w.length + (p && s ? 8 : 0) + (p ? 3 : 0)});
  }
  combos.sort((x, y) => x.score - y.score || (x.w < y.w ? -1 : 1));
  const off = combos.length ? (seed * 5) % combos.length : 0;
  for (let i = 0; i < combos.length && out.length < n; i++) push(combos[(i + off) % combos.length].w);
  return out.slice(0, n);
};
BP.DOMAIN_STATUS = {livre: ['livre', 'ok'], registrado: ['registrado', 'no'], desconhecido: ['?', 'un'], limite: ['espere', 'un'], erro: ['erro', 'un']};
/* busca manual: instantdomainsearch para tudo, registro.br para .br */
BP.domainSearchUrl = d => 'https://instantdomainsearch.com/?q=' + encodeURIComponent(String(d).split('.')[0]);
BP.domainRegistrarUrl = d => /\.br$/.test(d) ? 'https://registro.br/busca-dominio/?fqdn=' + encodeURIComponent(d) : 'https://instantdomainsearch.com/domain/' + encodeURIComponent(d);

BP.CLIENTS = ['Padaria do Futuro','Transportes Zé & Filhos','Clínica Bem-Estar','Escola Girassol','Loja da Esquina','Cooperativa Sol','Ramos Advogados','Metalúrgica Norte'];

BP.CASES = [
  {n:'Padaria do Futuro',t:'Agente de pedidos no WhatsApp',r:'−40% de tempo no atendimento',tags:['agentes','whatsapp'],v:'shapes'},
  {n:'Transportes Zé & Filhos',t:'Roteirização inteligente',r:'+18% de entregas por dia',tags:['dados','automação'],v:'photo'},
  {n:'Clínica Bem-Estar',t:'Portal do paciente',r:'Zero papel na recepção',tags:['produto','web'],v:'3d'},
];

BP.FAQ = [
  {q:'Minha empresa é pequena. IA faz sentido pra mim?',a:'Depende do problema, não do tamanho. Começamos entendendo onde dói de verdade. Às vezes a resposta é uma automação simples. Às vezes é "ainda não". As duas são boas respostas.'},
  {q:'Quanto tempo leva um projeto?',a:'Diagnóstico: cerca de 2 semanas. Primeiro resultado no ar: entre 4 e 8 semanas. Preferimos entregar algo pequeno funcionando do que algo grande no papel.'},
  {q:'Vocês trabalham com quais ferramentas?',a:'As que fizerem sentido pro seu contexto. Não temos parceria escondida com fornecedor. Se dá pra resolver com o que você já usa, melhor ainda.'},
  {q:'E depois que entrega, some?',a:'Não. Acompanhamento faz parte. Ficamos por perto pra ajustar, treinar o time e evoluir o que foi construído.'},
];

/* Pessoa ficticia usada nas amostras (cartao, assinatura, cracha, time).
   E placeholder de demonstracao: troque pelos seus dados ao usar de verdade. */
BP.DEMO_PERSON = {name:'Alex Ribeiro', first:'Alex', initials:'AR', role:'Fundador(a) · IA & produto'};

BP.DEFAULT_STATE = {
  v:1,
  identity:{name:'Amanhã Studio',tagline:'Prontos pro futuro, com calma.',initials:'AS',oneliner:'Estúdio de projetos de IA e desenvolvimento para empresas que querem estar prontas pro que vem.',domain:'amanha.studio',shortlist:[],domainBase:'',domainTlds:['.com','.com.br','.ai','.studio','.app','.dev','.io','.co'],domainShortlist:[],domainChecked:{},domainSeed:0,domainVarTld:'.com'},
  logo:{shape:'squircle',font:'Sora',weight:700,tracking:-2,size:50,yShift:2,detail:'none',bg:'primary',fg:'paper',tilt:0,case:'upper',lockup:'horizontal',wordCase:'lower',wordWeight:600,italic:false,gap:12},
  colors:{primary:'#4F7A63',secondary:'#E07A5F',accent:'#F2CC8F',paper:'#FAF7F2',ink:'#2B2D2F',gradient:false,gradientAngle:135},
  type:{head:'Sora',body:'Inter',accent:'Instrument Serif',mono:'JetBrains Mono',headWeight:700,bodyWeight:400,base:17,scale:1.25,lh:1.55,headLh:1.08,headTracking:-2,headCase:'normal',highlight:'serif',taglineFont:'head'},
  shape:{radius:14,pill:true,corners:'uniform',borderW:1,shadow:'soft',density:'comfortable',btn:'filled',card:'bordered',iconStroke:1.75},
  pattern:{bg:'grain',intensity:40,sparkles:true,sticker:true,blobs:true,arrows:false,anim:'subtle'},
  site:{hero:'left',nav:'floating',width:'medium',image:'shapes',footer:'big',theme:'light',sections:{clients:true,services:true,process:true,cases:true,manifesto:true,team:true,testimonials:true,faq:true,cta:true}},
  voice:{casual:60,playful:55,simple:65,warm:70,person:'a gente',address:'você',emoji:'raro',seed:0,headline:'',sub:'',cta:'',
    use:['claro','de verdade','com calma','junto','sem complicação','funciona'],avoid:['disruptivo','sinergia','revolucionário','solução','game changer','alavancar','robusto']},
  purpose:{
    mission:'Ajudar empresas a usar IA e tecnologia de um jeito útil, humano e sustentável, para que estejam prontas para o que vem sem perder o que as torna únicas.',
    vision:'Um mundo onde toda empresa, de qualquer tamanho, aproveita a tecnologia com calma, critério e confiança.',
    promise:'Fazemos junto, explicamos tudo e só entregamos o que funciona.',
    archetype:'sage',archetype2:'jester',
    values:[{n:'Calma',d:'Pressa é inimiga de projeto bom. A gente pensa antes de construir.'},{n:'Clareza',d:'Se você não entendeu, a culpa é nossa. Explicamos até fazer sentido.'},{n:'Honestidade radical',d:'Se IA não resolve, a gente fala. Mesmo perdendo a venda.'},{n:'Ficar por perto',d:'Entrega não é despedida. Acompanhamos depois do deploy.'}],
    are:['calmos','curiosos','honestos','próximos'],arent:['apressados','vendedores de hype','frios'],
    audience:['PMEs em crescimento','Times de operações','Fundadores'],
    services:[{n:'Diagnóstico de IA',d:'Onde IA faz sentido na sua operação (e onde não faz).'},{n:'Agentes & automações',d:'Assistentes que trabalham de verdade, integrados ao que você já usa.'},{n:'Desenvolvimento de produto',d:'Apps, plataformas e integrações, do rascunho ao deploy.'},{n:'Dados prontos pra IA',d:'Organizar a casa pra IA ter com o que trabalhar.'},{n:'Capacitação de times',d:'Seu time usando IA com critério, não por modismo.'},{n:'Acompanhamento contínuo',d:'A gente fica por perto depois do lançamento.'}],
    positioning:{who:'empresas que querem crescer sem virar reféns de tecnologia',need:'precisam usar IA de um jeito útil e seguro',category:'um estúdio de projetos de IA e desenvolvimento',diff:'faz junto, explica tudo e entrega o que funciona',alt:'grandes consultorias e agências de hype',proof:'ficamos por perto depois do deploy'},
    manifesto:'O futuro não chega de uma vez.\nEle chega em pedaços pequenos, todo dia.\nA gente acredita em tecnologia que serve pessoas.\nEm projetos que começam pequenos e crescem com critério.\nEm explicar até fazer sentido.\nEm dizer "não" quando IA não é a resposta.\nE em ficar por perto depois que a coisa vai pro ar.\nSem pânico. Sem hype. Com calma.',
    mood:['calmo','curioso','caloroso','esperto'],
  },
  guide:{done:[],ideasDone:[]},
  notes:[],snapshots:[],
  meta:{touched:[],updatedAt:0,tab:'site',toolTheme:'light',device:'desktop',zoom:100},
};
