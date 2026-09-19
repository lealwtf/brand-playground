# Handoff — Brand Playground

Para o próximo agente que pegar este projeto. Leia isto antes de tocar em qualquer arquivo.

## O que é

Playground local onde a pessoa usuária decide a identidade de uma marca nova: uma **agência de projetos de IA
e desenvolvimento, para empresas que querem estar prontas para o futuro**. Tom pretendido: humano,
brincalhão, tranquilo. Tudo em português do Brasil.

Não é um site da agência. É a ferramenta onde ele testa nome, logo, cores, tipografia, bordas,
padrões visuais, estilo de site, voz de escrita, missão, valores e domínio — vendo tudo ao vivo.

## Rodar

```bash
node server.mjs   # http://localhost:4747
```

O servidor provavelmente já está no ar nesta máquina. Antes de subir outro:

```bash
pkill -f 'node server.mjs'
```

Sem servidor, abrir o `index.html` direto também funciona: salva no `localStorage` em vez de arquivo,
e a checagem de domínio fica desligada (os links manuais continuam).

## ⚠️ Regra número um: `brand.json` é trabalho dele, não seu

`brand.json` guarda as escolhas reais de quem está usando a ferramenta, e costuma
estar bem longe do estado padrão. Nunca sobrescreva esse arquivo em teste.

- **Nunca** faça `PUT /api/state` para testar nada.
- **Nunca** carregue `http://localhost:4747/` em navegador headless: ao fechar, a página salva o
  estado de volta. Se ele estiver editando na mesma hora, você sobrescreve o trabalho dele.
- Para testar visualmente, gere um HTML avulso e abra por `file://` (receita na seção "Como testar").
- Se precisar mesmo mexer, copie antes: `cp brand.json brand.json.bak`.

## Arquitetura

Zero dependências. Zero build. Quatro scripts carregados em ordem pelo `index.html`.

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Esqueleto: topbar, sidebar, área de preview, modal, toast |
| `styles.css` | Duas metades. Prefixo `--t-*` / `.tb-`, `.sec`, `.field` = a **ferramenta**. Prefixo `--b-*` / `.b-` = a **marca** renderizada |
| `data.js` | Só dados: 65 fontes, 12 duplas, 14 paletas, 29 formas, 12 arquétipos, bancos de texto, TLDs, e o `BP.DEFAULT_STATE` |
| `logo.js` | Gerador SVG do monograma (`BP.logoSVG`, `BP.lockup`, `BP.shapeSVG`) + utilidades de cor (`contrast`, `readable`, `harmony`, `mix`) |
| `render.js` | Copy gerada por tom de voz (`BP.copy`, `BP.samples`), um renderizador por aba, `BP.applyRoot` (estado → variáveis CSS), exports `brand.md` e `tokens.css` |
| `app.js` | Controles da sidebar, estado, undo/redo, autosave, versões, comparação, randomizador, domínios |
| `server.mjs` | Servidor estático + `/api/state` (grava `brand.json`) + `/api/domain` (RDAP) |

### Como o estado vira pixels

`state` (objeto único) → `BP.applyRoot(root, state)` escreve ~50 variáveis `--b-*` e alguns
`data-*` no elemento `.b-root` → `BP.renderTab(state, aba)` devolve uma string de HTML → o CSS
com prefixo `.b-` lê as variáveis. **Toda decisão visual é uma variável CSS.** Nada de estilo
inline espalhado.

`state.meta.touched` é a lista de seções já mexidas; alimenta a barra "% decidido".

### Regras que o código já respeita, não quebre

1. **Cor de texto legível é calculada, não escolhida.** `BP.readable(fg, bg, 4.5)` empurra a
   luminosidade até passar em contraste WCAG. É de onde saem `--b-primary-text` e
   `--b-primary-deep`. Se você usar `var(--b-primary)` como `color:` em texto novo, some no tema
   escuro. Use `--b-primary-text`.
2. **Nada de `pow()` no CSS.** Os tamanhos `--b-h1`..`--b-h4` são calculados em JS por causa de
   suporte irregular.
3. **A fonte de acento é para palavra solta, não frase.** Frases inteiras usam
   `--b-font-tagline` (controlada por `type.taglineFont`). Já houve reclamação exatamente disso: a
   tagline saía em Shantell Sans no verso do cartão.
4. **`commit()` reagenda o sync da sidebar** (`syncSoon`), senão painéis derivados (contraste,
   prévia do logo) ficam desatualizados. Todo builder de campo que lê estado precisa registrar
   seu `sync` em `updaters`, e proteger o foco: `if (document.activeElement !== inp)`.
5. **Cada forma de logo tem `sf` (fator de tamanho) e `dy` (deslocamento vertical)** em
   `BP.SHAPES`. Forma nova sem esses ajustes = texto vazando. Teste com 1, 2 e 3 letras.
6. **`merge(DEFAULT_STATE, salvo)`** roda no boot. Campo novo em `DEFAULT_STATE` aparece sozinho
   nos estados antigos. Não precisa de migração; só não renomeie campo existente sem pensar.
7. **Atalho de tecla solta exige ausência de modificador.** O handler de `keydown` tem
   `if (e.metaKey || e.ctrlKey || e.altKey) return;` antes dos atalhos de uma tecla. Sem isso,
   `Cmd+R` e `Cmd+Shift+R` (recarregar) caíam no atalho `R` e disparavam `surprise()`, que rerola
   cores, fontes, forma, padrão e voz. Já se perdeu a marca inteira assim, várias vezes, antes de
   perceber. Shift continua passando porque `?` precisa dele. Atalho novo de tecla solta entra
   depois dessa guarda.
8. **`.b-root ul{margin:0;padding:0}` (linha ~266) vence qualquer `margin:auto` que você
   escrever num `<ul>` só com classe.** Especificidade 0,1,1 contra 0,1,0. Foi por isso que o
   `margin-left:auto` do `.b-nav-links` nunca funcionou: o menu ficava grudado à esquerda com um
   vazio à direita. Para posicionar um `ul` da marca, use dois níveis (`.b-nav-in .b-nav-links`).
9. **Bloco de largura fixa dentro de coluna variável estranha à esquerda.** `site.width` muda
   `--b-container` (920/1120/1320). Qualquer `max-width` em `em` fixo dentro dele cria um vazio
   que cresce junto com a coluna. Use proporção com teto: `min(46em, 66%)`, como em `.b-sec-head`.
10. **A onda do destaque "rabisco" é variável CSS, não SVG regerado.** O `rAF` em `app.js`
   (bloco `WAVE` / `waveTick`) só escreve `--b-wave-*` no `.b-root`. O ladrilho SVG é montado uma
   vez por `applyRoot`. Não regere o data-URI por frame: era o caminho óbvio e é o caro.

## Checagem de domínio (`/api/domain`)

Consulta RDAP, o protocolo público dos registros. Sem chave de API.

Fluxo: pega o TLD → acha o servidor RDAP dele no bootstrap oficial da IANA
(`data.iana.org/rdap/dns.json`, cache de 24h; `.br` vai direto para `rdap.registro.br`) → 404
significa livre, 200 significa registrado. Se o TLD não tem RDAP, ou o RDAP não respondeu, tenta
registros NS no DNS: NS respondendo prova que está registrado, ausência não prova nada.

**A invariante que importa: nunca dizer "livre" sem um registro de verdade ter respondido 404.**
A primeira versão usava `rdap.org` para tudo e dava `github.io` como livre, porque o rdap.org
devolve 404 tanto para domínio inexistente quanto para TLD que ele não conhece. Se você mexer
aqui, refaça este teste:

```bash
curl -s "http://localhost:4747/api/domain?name=github.io,x.ai,google.com,globo.com.br" | python3 -m json.tool
# nenhum pode voltar "livre"
```

Cache de 10 min em memória, teto de 60 consultas por minuto, timeout de 9s.

## Como testar sem quebrar nada

**Fuzz de renderização** — 1026 combinações (todas as formas × heros × padrões × temas ×
arquétipos × tons), procurando exceção, `undefined` e `NaN` no HTML. Rode sempre depois de mexer
em `render.js`, `logo.js` ou `data.js`:

```bash
node /tmp/bp-test.mjs      # se sumiu, o script está reproduzido no fim deste arquivo
```

**Sintaxe:** `for f in *.js *.mjs; do node --check $f; done`

**Visual, sem tocar no estado dele:** carregue os módulos num contexto `vm`, monte a página
você mesmo e abra por `file://`. `BP.fontUrl` mora em `app.js` (é browser-only), então reimplemente
a URL do Google Fonts no script de teste. Foi assim que as 29 formas e a correção da tagline foram
conferidas.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-sandbox --hide-scrollbars --virtual-time-budget=9000 --window-size=1500,900 \
  --screenshot=/tmp/x.png "file://$PWD/arquivo.html"
```

A extensão do Chrome do Claude não estava conectada nesta máquina; o headless acima foi o
substituto. Erros de `CVDisplayLinkCreateWithCGDisplay` no stderr são ruído do headless no macOS,
pode ignorar.

## Estado atual

Funcionando e verificado: 8 abas, 29 formas de logo, 65 fontes, autosave em disco, undo/redo,
versões com comparação lado a lado, exportação (`brand.md`, `tokens.css`, JSON, SVG, PDF),
gerador de nomes, gerador de domínios com checagem RDAP real.

**Aba "Começo" existe no código mas está desligada.** `BP.renderGuide` e o CSS `.b-guide` estão
prontos; a aba só aparece se existir um `guia.js` definindo
`BP.GUIDE = { checklist, ideas, week, html, sources }`, incluído no `index.html` antes do
`render.js`. Formato dos itens: `checklist` é `[{id, t, d, p:1|2|3, u?}]` (p = prioridade),
`ideas` é `[{id, f, pillar, h, d, w}]` (f = formato, h = gancho, w = por que funciona),
`week` é `[{d, f, t}]`.

Isso ficou pendente de propósito: foi pedida uma pesquisa web sobre abrir agência no Brasil
(MEI vs ME, Simples Nacional, CNAE, NFS-e, INPI) e ideias de post para Instagram, depois disse
"não precisa fazer a pesquisa, só finaliza o playground". **Não refaça a pesquisa por conta
própria.** Se ele pedir, o conteúdo entra em `guia.js` e a aba acende sozinha.

## Onde mexer para cada tipo de pedido

| Pedido | Arquivo | Onde |
|---|---|---|
| Nova forma de logo | `data.js` (`BP.SHAPES`, com `sf`/`dy`) + `logo.js` (`BP.shapeSVG`) | teste com 1/2/3 letras |
| Nova paleta ou dupla de fontes | `data.js` (`BP.PALETTES`, `BP.FONT_PAIRS`) | só dados |
| Nova fonte | `data.js` (`BP.FONTS`): `{n, c, w, i}` — `w` é a faixa variável `'300..800'` ou lista `'400;700'`, `i:1` se tem itálico |
| Novo controle na sidebar | `app.js` → `SCHEMA` (declarativo) ou `CUSTOM` (controle complexo) |
| Nova seção do site | `render.js` → `BP.renderSite` + `state.site.sections` + o toggle em `CUSTOM.sections` |
| Nova aba | `render.js` (`BP.renderTab`) + `TABS` no `app.js` |
| Mudar textos gerados | `render.js` → `BP.copy` (site) e `BP.samples` (aba Voz). Os arrays são indexados por faixa de tom: `[sério, médio, brincalhão]` |
| Exportação | `render.js` → `BP.brandMd`, `BP.tokensCss` |
| Guardar / restaurar versão | `snapshots/` (cópias) + `restaurar.mjs` (carimba `updatedAt`, guarda o atual antes) |
| Mexer na onda do rabisco | `app.js` (`WAVE`/`waveTick`: física) + `styles.css` (`--b-wave-*`, regra `[data-hl=squiggle] .b-hl`) + `render.js` (`squiggle`/`squiggleUrl`: as duas camadas) |

## A onda do destaque "rabisco"

Pedido registrado: *"esse efeito de onda que fica embaixo de '(sem pânico)', coloca pra ser
responsivo com o scroll do mouse, tipo, as ondas realmente serem ondas."*

Como funciona: `.b-hl` (o `*texto entre asteriscos*` de `BP.hl`) recebe **duas** camadas de onda
quando `type.highlight === 'squiggle'`.

| Camada | Ladrilho | Papel |
|---|---|---|
| 1 | 40×10, 2 cristas, traço 3, cor `accent` | marola rápida, comprimento `--b-wave-w` = 1.3em |
| 2 | 80×10, 1 crista, traço 1.6, `accent` misturado 45% no fundo | vagalhão lento, `--b-wave-w2` = 2.4em |

O loop `waveTick` lê `scroller.scrollTop` a cada frame e converte o delta em velocidade
amortecida. A velocidade vira duas coisas:

- **fase** → `--b-wave-x` / `--b-wave-x2`, em sentidos opostos, então as camadas se cruzam em vez
  de deslizar juntas;
- **amplitude** → `--b-wave-h` / `--b-wave-h2`, que sobem rápido (fator .3) e assentam devagar
  (.05), mais um balanço vertical `--b-wave-y`.

Três detalhes que parecem arbitrários e não são:

1. **O comprimento de onda é fixo em `em`.** Com `background-size: auto <altura>` a onda ficava
   mais *comprida* junto com a amplitude, o que lê como zoom, não como onda subindo. Largura
   explícita separa as duas coisas.
2. **Delta acima de 240px é descartado.** Troca de aba zera `scrollTop` e isso viraria um coice.
3. **Existe deriva de repouso** (.07 px/frame em `subtle`, .20 em `playful`) para a maré nunca
   ficar morta. Em `Movimento: Nenhum` a deriva é zero e `waveRest()` apaga as variáveis inline,
   devolvendo o rabisco estático de antes.

Desliga sozinho em três casos, checados a cada frame: destaque diferente de rabisco,
`pattern.anim === 'none'`, ou `prefers-reduced-motion: reduce`. O CSS tem o mesmo fallback no
`@media`, para quem abrir o HTML sem o JS.

## Como ele trabalha

Escreve em português, direto, sem rodeio. Manda mensagem no meio da tarefa para corrigir rumo —
leia e ajuste na hora, não termine o que já foi descartado. Reporta problema visual em uma frase
curta ("ficou com fonte errada"); vá olhar o estado real dele em `brand.json` antes de chutar,
foi assim que a fonte da tagline foi diagnosticada.

Há instrução global na máquina: **nunca usar a ferramenta Artifact.** Entrega é arquivo em disco,
aberto com `open <caminho>`. Nada vai para claude.ai.

Há também um hook de "caveman mode" que corta artigos e floreio das respostas. Código, commits e
avisos de segurança continuam em português normal.

## Pendências conhecidas

- Nada quebrado. Últimos 1026 renders passaram limpos.
- Alinhamento em `site.width` foi medido, não olhado: um script via CDP compara `esq` e `dir` de
  cada bloco de largura cheia nos cinco heros e nas três larguras. O único assimétrico que sobra
  é `.b-hero-copy`, que é coluna de grid por design.
- **O estado do usuário foi rerolado pelo bug do `Cmd+Shift+R`** antes da correção, mais de uma
  vez. O backup diário (`backups/brand-AAAA-MM-DD.json`) não salvou nada porque é sobrescrito a
  cada gravação, então guardou a versão já estragada. Se ele pedir robustez de backup, o ponto é
  esse: versionar por hora, ou só gravar backup quando o conteúdo mudar de verdade.
- Por isso existe `snapshots/`, que nada regrava, e `restaurar.mjs`. **Restaurar exige carimbar
  `meta.updatedAt` com a hora atual**: `load()` escolhe entre arquivo e localStorage pelo mais
  novo, então copiar um snapshot antigo por cima na mão não restaura nada. O primeiro snapshot
  guardado fica em `snapshots/`, nomeado com a marca e o carimbo de data e hora.
- É preciso **recarregar o navegador** para pegar as formas novas, o painel de domínios, a
  correção da tagline e a onda do rabisco. O código em memória na aba dele é anterior.
- `.io`, `.so` e alguns outros TLDs não têm RDAP: a checagem mostra `?` em vez de adivinhar. É o
  comportamento correto, não é bug.
- A prévia do logo em SVG referencia a fonte pelo nome. Para arquivo final de verdade, o texto
  precisa virar curva no Figma ou Illustrator. Já está avisado na aba Logo.

## Anexo: o script de fuzz (`/tmp/bp-test.mjs`)

Rode de dentro de `brand-playground/`.

```js
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
```
