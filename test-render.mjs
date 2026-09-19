import fs from 'node:fs'; import vm from 'node:vm';
const ctx = vm.createContext({console, encodeURIComponent, Math, Date, JSON, Object, Array, String, Number, parseInt, parseFloat, Intl});
ctx.window = ctx; ctx.globalThis = ctx;
for (const f of ['data.js','logo.js','render.js']) vm.runInContext(fs.readFileSync(f,'utf8'), ctx, {filename:f});
const BP = ctx.BP;
const clone = o => JSON.parse(JSON.stringify(o));
const tabs = ['site','logo','colors','kit','apps','voice','manifesto','sheet','guide'];
let n=0, errs=[];
const run = (s, label) => { for (const t of tabs) { try { const h = BP.renderTab(s,t); n++; if (!h || h.length < 50) errs.push(`${label}/${t}: saída curta (${h?.length})`); if (/undefined|\[object Object\]|NaN/.test(h)) errs.push(`${label}/${t}: ${h.match(/.{0,60}(undefined|\[object Object\]|NaN).{0,40}/)[0]}`); } catch(e){ errs.push(`${label}/${t}: ${e.message}`);} } };
const base = clone(BP.DEFAULT_STATE);
run(base,'default');
// fuzz de combinações
const vary = [
 ['logo.shape', BP.SHAPES.map(x=>x.id)], ['logo.lockup',['horizontal','vertical','symbol','wordmark']], ['logo.bg',['primary','secondary','accent','ink','gradient']],
 ['site.hero',['left','centered','split','editorial','bento']], ['site.nav',['floating','bar','minimal']], ['site.footer',['big','columns','minimal']],
 ['site.image',['shapes','illustration','photo','3d']], ['site.theme',['light','dark']],
 ['shape.btn',['filled','outline','soft','brutal','gradient']], ['shape.card',['flat','bordered','elevated','glass','soft','brutal']],
 ['pattern.bg', BP.PATTERNS.map(x=>x.id)], ['pattern.anim',['none','subtle','playful']],
 ['type.highlight',['none','color','marker','squiggle','serif','box']], ['type.headCase',['normal','lower','upper','title']],
 ['voice.person',['a gente','nós','eu']], ['voice.address',['você','vocês','sua empresa']], ['voice.emoji',['nunca','raro','frequente']],
 ['purpose.archetype', BP.ARCHETYPES.map(a=>a.id)],
];
const set=(o,p,v)=>{const k=p.split('.');let t=o;for(let i=0;i<k.length-1;i++)t=t[k[i]];t[k[k.length-1]]=v;};
for (const [path, vals] of vary) for (const v of vals) { const s=clone(base); set(s,path,v); run(s, `${path}=${v}`); }
// tons extremos
for (const tone of [0,50,100]) { const s=clone(base); s.voice.casual=s.voice.playful=s.voice.simple=s.voice.warm=tone; s.voice.seed=tone; run(s,`tone=${tone}`); }
// estado degenerado
const empty=clone(base); empty.identity={name:'',tagline:'',initials:'',oneliner:'',domain:'',shortlist:[]}; empty.purpose.values=[]; empty.purpose.services=[]; empty.purpose.mood=[]; empty.purpose.are=[]; empty.purpose.arent=[]; empty.purpose.audience=[]; empty.voice.use=[]; empty.voice.avoid=[]; empty.purpose.manifesto='';
run(empty,'vazio');
// exports
try { const md = BP.brandMd(base); if (md.length<800) errs.push('brandMd curto'); if (/undefined/.test(md)) errs.push('brandMd tem undefined'); } catch(e){errs.push('brandMd: '+e.message);}
try { const css = BP.tokensCss(base); if (!/--color-primary/.test(css)) errs.push('tokensCss sem tokens'); } catch(e){errs.push('tokensCss: '+e.message);}
// logo svg variantes
for (const v of ['color','mono','inverse','white']) for (const sh of BP.SHAPES.map(x=>x.id)) { try { const s=clone(base); s.logo.shape=sh; const svg=BP.logoSVG(s,{variant:v,size:64}); if(!svg.startsWith('<svg')) errs.push(`svg ${sh}/${v} inválido`); if(/undefined|NaN/.test(svg)) errs.push(`svg ${sh}/${v}: ${svg.match(/.{0,40}(undefined|NaN)/)[0]}`);} catch(e){errs.push(`svg ${sh}/${v}: ${e.message}`);} }
// contraste
if (Math.abs(BP.contrast('#000000','#ffffff') - 21) > 0.01) errs.push('contrast() errado');
console.log(`renders: ${n}`);
console.log(errs.length ? 'ERROS:\n'+[...new Set(errs)].slice(0,25).join('\n') : 'sem erros');
