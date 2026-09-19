# Prompt de reconstrução — Brand Playground

> Honestidade primeiro: **este não é o prompt que eu recebi.** O playground nasceu de um pedido
> curto e foi corrigido ao longo de muitas mensagens, com bugs descobertos no caminho. Este
> arquivo é o prompt que eu gostaria de ter recebido: ele já carrega tudo o que custou caro
> descobrir. Um agente competente com este texto chega ao mesmo lugar sem pisar nas mesmas minas.
>
> Cole da linha abaixo até o fim.

---

# Construa um playground local de identidade de marca

## Objetivo

Uma ferramenta local onde uma pessoa decide a identidade visual de uma marca vendo tudo mudar em
tempo real: cores, nome, logo com iniciais, tipografia, formas, bordas, padrões, estilo de site,
voz de escrita, propósito e valores. Tudo salva sozinho a cada alteração.

O caso de uso de referência é um estúdio de projetos de IA e desenvolvimento. Tom pretendido: humano,
brincalhão, calmo. Escreva a interface e os textos gerados em português do Brasil.

## Restrições duras

- **HTML, CSS e JavaScript puros. Zero dependência, zero etapa de build.** Abre no navegador e
  funciona.
- Quatro scripts carregados nesta ordem: `data.js`, `logo.js`, `render.js`, `app.js`. Um arquivo
  CSS. Um `index.html`. Um servidor Node opcional em `server.mjs`, só com módulos nativos.
- Nada de framework, nada de bundler, nada de TypeScript.

## Arquitetura

Um fluxo só, em quatro passos:

```
state (objeto único)
  → BP.applyRoot(root, state)   escreve ~50 variáveis --b-* e alguns data-* em .b-root
  → BP.renderTab(state, aba)    devolve uma string de HTML
  → CSS com prefixo .b-         lê as variáveis
```

**Toda decisão visual é uma variável CSS.** Nenhum estilo inline espalhado pelo HTML gerado.

Consequência prática: trocar a paleta inteira é reescrever cinco variáveis, não reescrever
componentes.

### Duas linguagens visuais, parede entre elas

| Conjunto | Prefixo | Onde vive |
|---|---|---|
| Ferramenta | `--t-*`, classes `.tb-` `.sec` `.field` | barra superior, lateral, modais |
| Marca | `--b-*`, classes `.b-` | só dentro de `.b-root`, o quadro da prévia |

A ferramenta nunca lê variável da marca e vice-versa. Sem essa parede, escolher botão "brutal" na
marca deixa a barra lateral brutal, e a ferramenta vira refém de cada experimento do usuário.

## Arquivos e responsabilidades

| Arquivo | Linhas aprox. | Responsabilidade |
|---|---|---|
| `index.html` | 90 | esqueleto: barra, lateral, prévia, modal, aviso, área de impressão |
| `styles.css` | 900 | CSS da ferramenta e CSS inteiro da marca, nessa ordem, separados por comentário |
| `data.js` | 230 | só dados: fontes, paletas, formas, padrões, arquétipos, bancos de texto, estado padrão |
| `logo.js` | 150 | gerador de monograma em SVG e toda a matemática de cor |
| `render.js` | 580 | geração de copy, `applyRoot`, os renderizadores de cada aba, exportações |
| `app.js` | 620 | estado, persistência, histórico, construtores de controle, abas, atalhos, boot |
| `server.mjs` | 110 | estático + `/api/state` + `/api/domain` |

## Dados mínimos em `data.js`

| Coleção | Quantidade | Detalhe |
|---|---|---|
| Fontes do Google | 65 | `{n: nome, c: categoria, w: pesos, i: tem itálico}` |
| Categorias de fonte | 6 | sans, display, rounded, hand, serif, mono |
| Duplas prontas | 12 | título, corpo, acento, mono |
| Paletas | 14 | cinco cores cada |
| Formas de símbolo | 29 | cada uma com `sf` e `dy`, explicado abaixo |
| Padrões de fundo | 9 | |
| Arquétipos de marca | 12 | principal e secundário |
| Extensões de domínio | 20 | incluindo `.com.br` e `.br` |

Mais bancos de sugestão para valores, clima, público, "somos", "não somos", nomes, clientes
fictícios, cases e perguntas frequentes.

`w` é a faixa variável (`'300..800'`) ou lista (`'400;700'`). Monte a URL do Google Fonts a
partir disso, com eixos (`ital,wght@0,300..800;1,300..800`), e carregue sob demanda.

## Abas da prévia

Site, Logo, Cores & Tipo, UI Kit, Aplicações, Voz, Manifesto, Brand Sheet. Atalho numérico 1 a 8.

A aba Site é uma landing page completa com seções ligáveis: clientes, serviços, processo, cases,
manifesto, time, depoimentos, FAQ, chamada final, rodapé. Cinco variações de hero, três de
navegação, três de rodapé.

## Seções da barra lateral

Identidade, Logo com iniciais, Cores, Tipografia, Forma & bordas, Padrões & movimento, Estilo do
site, Voz & escrita, Propósito & valores, Versões & diário.

Construtores declarativos: `text`, `textarea`, `range`, `tone`, `color`, `segment`, `toggle`,
`font`, `chips`, `list`. Controles complexos entram numa tabela `CUSTOM` separada: gerador de
nomes, painel de domínios, mini-prévia do logo, presets de paleta, harmonia, contraste, duplas de
fonte, seções, presets de tom, variações, arquétipo, posicionamento, versões, notas.

## Servidor

Três responsabilidades, nada além:

- estático;
- `GET/PUT /api/state`, gravando `brand.json` com escrita atômica (arquivo temporário e rename) e
  backup diário;
- `GET /api/domain?name=a.com,b.ai` para checar disponibilidade.

Sem servidor, a ferramenta ainda funciona e salva em `localStorage`.

---

# Regras que o código precisa respeitar

Dez invariantes. Quebrar qualquer uma reintroduz um bug que já foi caro.

1. **Cor de texto legível é calculada, não escolhida.** Uma função `readable(cor, fundo, 4.5)`
   empurra a luminosidade em HSL, passo a passo, até passar o contraste WCAG. É de onde saem as
   variáveis de texto derivadas da primária. Usar a primária crua como `color:` some no tema
   escuro.
2. **Nada de `pow()` no CSS.** Os tamanhos de título saem de escala modular calculada em
   JavaScript e escritos como pixels. Suporte de `pow()` ainda é irregular, e um h1 que não
   calcula é uma página quebrada.
3. **Fonte de acento serve para palavra solta, não para frase.** Frase inteira, como a tagline no
   verso do cartão, precisa de variável própria e de um controle para escolher entre título,
   acento e corpo. Sem isso, uma fonte manuscrita transforma a tagline em rabisco ilegível.
4. **Toda alteração reagenda a sincronia da barra lateral**, não só o redesenho da prévia. Painéis
   derivados, como contraste e mini-prévia do logo, ficam desatualizados sem isso. Coalescer com
   `requestAnimationFrame`.
5. **Cada forma de símbolo tem fator de tamanho e deslocamento vertical próprios.** Forma nova sem
   esses dois valores vaza o texto para fora. Some a isso um ajuste automático por quantidade de
   letras: 1, 2, 3 e 4 iniciais pedem escalas diferentes.
6. **Faça merge do estado padrão com o salvo no boot.** Campo novo aparece sozinho em estado
   antigo, sem migração. Em compensação, nunca renomeie campo existente sem pensar.
7. **Atalho de tecla solta só vale sem modificador.** Detalhado na seção de armadilhas, porque
   este destruiu trabalho de verdade.
8. **Especificidade de reset vence classe.** Detalhado abaixo.
9. **Nada de largura fixa em `em` dentro de coluna de largura variável.** Detalhado abaixo.
10. **Animação dirigida por scroll escreve variável CSS, nunca regera SVG por frame.**

---

# Armadilhas já resolvidas

Esta é a parte que vale o arquivo. Cada item é um defeito real que apareceu, com o sintoma e a
correção. Nenhum foi encontrado olhando a tela: todos vieram de medir.

## Cor

**Primária como cor de texto some no tema escuro.** Um chapéu de seção em verde médio sobre tinta
escura ficou praticamente invisível. A correção não é trocar o verde, é parar de confiar na cor
escolhida: derive `--b-primary-text` e `--b-primary-deep` com a função de legibilidade.

Ao trocar as ocorrências de `color:var(--b-primary)` no CSS, use lookbehind negativo para não
acertar `background-color` e `border-color`. Uma busca ingênua por `color:var(--b-primary)`
quebra fundos.

Depois disso, cuide dos casos em que o texto está sobre um painel já colorido: ali o chapéu deve
herdar (`color:inherit` com opacidade), não usar a cor derivada, senão fica ilegível de novo pelo
lado oposto.

**Misture em oklab, não em sRGB.** `color-mix(in oklab, ...)` para todas as cores derivadas.
Misturar em sRGB escurece o meio do caminho e produz cinza sujo entre duas cores saturadas.

## Tipografia

**Nada de `pow()` no CSS.** Calcule em JavaScript. Use expoentes não inteiros na escala, algo
como 5, 3,4, 2 e 1. Com inteiros, o h1 fica desproporcional em relação ao h2 assim que a razão
passa de 1,3.

## CSS e especificidade

**Um reset com elemento vence uma classe.** Uma regra como `.b-root ul{margin:0;padding:0}` tem
especificidade maior que `.b-nav-links{margin-left:auto}`. O menu fica grudado à esquerda e o
`margin:auto` parece simplesmente não funcionar. Corrija com dois níveis no seletor, por exemplo
`.b-nav-in .b-nav-links`.

Este ficou escondido por meses atrás de um segundo defeito: a barra de navegação tinha um teto de
largura fixo que mascarava o sintoma. Dois bugs se cancelando parecem um layout funcionando.

**Largura fixa em `em` dentro de coluna variável estranha à esquerda.** Se a largura do conteúdo é
configurável, um cabeçalho com `max-width: 34em` mantém o mesmo tamanho em qualquer coluna, e o
vazio à direita cresce junto com a largura escolhida. Use proporção com teto: `min(46em, 66%)`.

**Elemento de largura cheia não pode ter teto próprio.** Se a barra de navegação tem teto de
900px e as seções seguem a largura configurada, as bordas deixam de bater assim que o usuário
escolhe largura maior. Ou tudo segue a mesma variável, ou nada segue.

## Teclado

**Atalho de tecla solta precisa ignorar modificadores.** Sem a guarda, `Cmd+R` e `Cmd+Shift+R`,
que são recarregar a página, caem no atalho `R` e disparam a função de combinação aleatória. Ela
roda antes do reload e o resultado aleatório é salvo. O usuário perde a marca inteira e não faz
ideia do porquê, porque acha que só recarregou.

Ponha `if (e.metaKey || e.ctrlKey || e.altKey) return;` antes dos atalhos de uma tecla. Deixe
Shift passar, porque `?` precisa dele.

Isso aconteceu de verdade, mais de uma vez, e cada ocorrência foi salva por cima da anterior.

## Campos e foco

**Campo de chips perde foco e rascunho a cada sincronia.** Ao redesenhar a lista de chips, guarde
se o input estava focado e o que estava digitado, e restaure depois de recriar os elementos. Vale
a mesma regra para qualquer construtor de campo que releia o estado: só escreva no input se ele
não for o elemento ativo.

## Checagem de domínio

**Nunca diga "livre" sem um registro ter respondido 404.** A primeira versão consultava um
resolvedor genérico de RDAP para qualquer extensão e reportou `github.io` como livre, porque esse
serviço devolve 404 tanto para domínio inexistente quanto para extensão que ele não atende.

A forma correta: resolva o servidor RDAP da extensão pelo bootstrap oficial da IANA, com cache de
24 horas. Extensões brasileiras vão direto ao registro nacional. Se não existe servidor RDAP para
aquela extensão, mostre "desconhecido", nunca adivinhe. Como rede de segurança, uma consulta de
NS por DNS só consegue provar que está registrado, nunca que está livre.

Adicione cache de 10 minutos e limite de requisições por minuto.

**Aceite rótulos de um caractere.** A expressão de validação de domínio rejeitava `x.ai`. Domínio
de uma letra existe.

## Animação dirigida por scroll

Se o destaque de título tiver um efeito de onda que reage ao scroll:

**Não regere o SVG por frame.** Monte o ladrilho uma vez e anime por variável CSS: fase em
`background-position`, amplitude em `background-size`.

**Fixe o comprimento de onda em `em`.** Com `background-size: auto <altura>`, aumentar a amplitude
também estica a onda na horizontal, e o efeito lê como zoom em vez de onda subindo.

**Descarte deltas de scroll acima de ~240px.** Troca de aba zera a posição de scroll e isso vira
um coice visual.

**Deixe uma deriva lenta no repouso** para a onda não parecer morta, e desligue tudo em três
casos, checados a cada frame: o destaque não é o de onda, o usuário desligou movimento, ou o
sistema pede movimento reduzido. Deixe o mesmo repouso no CSS via media query, para quem abrir o
HTML sem o JavaScript.

**Duas camadas com comprimentos bem diferentes** leem como água. Duas camadas com comprimentos
parecidos leem como linha borrada. E derive a cor da segunda camada misturando a cor de acento
com o fundo, não usando outra cor da paleta: uma primária quase preta vira borrão, não
profundidade.

## Persistência

**O estado do usuário é trabalho dele.** Se você estiver testando e o servidor estiver no ar,
nunca envie estado de teste para a API e nunca carregue a aplicação real num navegador
automatizado. A página salva ao descarregar e sobrescreve o arquivo do usuário. Teste renderizando
páginas isoladas a partir de um contexto `vm`, ou numa cópia da pasta aberta por `file://` com
perfil de navegador separado.

**Escolha entre arquivo e navegador pelo carimbo mais novo.** No boot, compare
`meta.updatedAt` do arquivo com o do `localStorage`. Isso tem uma consequência não óbvia:
**copiar um backup por cima do arquivo não restaura nada**, porque o carimbo antigo perde para o
navegador. Qualquer script de restauração precisa carimbar a hora atual.

**Backup diário sobrescrito não é backup.** Um arquivo por dia, regravado a cada gravação, guarda
o estado mais recente, ou seja, guarda o estrago. Ofereça uma pasta de snapshots que nada
regrava, e um comando de restauração que guarda o estado atual antes de trocar.

## Exportação de logo

**SVG carregado como imagem não carrega fonte externa.** Um logo exportado com texto vivo e
`font-family` desenha com a fonte errada em `<img>`, favicon, importação em Figma, Illustrator sem
a fonte, e-mail. Ou seja, em quase todo uso real.

O arquivo de entrega precisa ter o texto convertido em curvas. Mantenha também uma versão com
texto vivo, claramente marcada como "para editar", mas não a entregue como logo.

## Verificação com navegador automatizado

**Espere a fonte carregar antes de medir ou capturar.** Uma captura tirada logo após o load mede a
fonte de sistema, não a webfont, e a diferença é grande o bastante para invalidar a comparação.
Force `document.fonts.load(...)`, espere `document.fonts.ready`, e confirme com
`document.fonts.check(...)` antes de medir.

**`--virtual-time-budget` não avança `requestAnimationFrame`.** Para testar animação, conecte no
protocolo de depuração e dirija a página em tempo real.

**Cuidado ao montar HTML de teste com `url("data:...")`.** As aspas duplas do data URI quebram o
atributo `style`. Escape antes de injetar.

---

# Design da ferramenta

A regra que gera todas as outras: **a ferramenta não pode se vestir melhor do que o trabalho.** O
playground existe para a pessoa julgar uma marca. Interface com personalidade forte entra na
comparação sem ser convidada.

- **Neutros quentes, nunca cinza puro.** Fundo em bege muito lavado, texto em quase-preto com
  matiz. Branco puro cria uma borda dura ao redor da prévia que não existe no mundo real.
- **Um acento só.** Se está com acento, é ativo, foco ou caminho principal. Dois acentos obrigam a
  inventar uma regra sobre qual usa quando, e essa regra sempre vaza. Aviso e perigo são sinais,
  não acentos.
- **Tema escuro é paleta escrita à mão, não inversão.** Principalmente o acento: verde escuro
  sobre fundo escuro desaparece, e o estado ativo some.
- **Profundidade padrão é linha de 1px.** Sombra fica reservada para o que realmente flutua: menu,
  modal, aviso e o quadro da prévia. Sombras com deslocamento negativo grande, para ficarem por
  baixo do objeto em vez de vazar pelos lados.
- **Raio de filho sempre menor que o do pai.** Arcos concêntricos desalinhados são o detalhe que
  faz um cartão parecer errado sem que se saiba dizer por quê.
- **Movimento é funcional e curto.** Quatro coisas se movem, nada mais. Numa ferramenta usada por
  horas, animação decorativa é imposto cobrado mil vezes.
- **Estado ativo em controle segmentado inverte** fundo e texto, em vez de usar o acento. Ativo em
  acento se confunde com hover.
- **Layout:** barra superior em três colunas com a do meio automática, para as abas ficarem
  opticamente centradas mesmo quando o nome da marca cresce. Miolo em duas colunas, lateral de
  aproximadamente 390px. Altura travada, e só duas áreas rolam.

Escolha a largura da lateral medindo, não chutando: é o menor valor que aceita dois cartões de
paleta lado a lado, rótulo e valor na mesma linha, e um segmentado de três opções sem quebrar.

---

# Verificação obrigatória

Entregar sem isto não conta como entregue.

1. **Harness de fuzz em Node.** Carregue `data.js`, `logo.js` e `render.js` num contexto `vm` e
   renderize o produto cartesiano de formas, heros, navegações, rodapés, imagens, temas, estilos
   de botão e cartão, padrões, animações, destaques, caixas, pessoas e tratamentos de voz,
   arquétipos e extremos de tom, mais um estado degenerado vazio. Passe de mil combinações.
   Falhe se aparecer exceção, `undefined`, `[object Object]` ou `NaN` na saída.
2. **Folha de contato das formas.** Renderize as 29 formas com 1, 2, 3 e 4 iniciais e olhe. Foi
   assim que quatro formas com texto vazando apareceram.
3. **Medição de alinhamento.** Para cada largura de conteúdo e cada variação de hero, meça a
   distância da borda esquerda e da direita de cada bloco de largura cheia. Assimetria é bug,
   exceto em coluna de grid, que é intencional.
4. **Contraste calculado, nos dois temas**, para a ferramenta e para a marca.

---

# O que ficou por resolver

Seja honesto sobre isto em vez de escondê-lo.

- **Concordância em primeira pessoa do singular.** O gerador de copy monta frases trocando a
  pessoa gramatical, e na primeira do singular produz "seu empresa" em vez de "sua empresa", e
  "com eu" em vez de "comigo". Precisa de concordância de gênero para os substantivos e de
  tratamento do pronome oblíquo.
- **Textos de seção não são editáveis.** Só título, subtítulo e botão do hero têm campo. Os
  demais vêm do gerador de tom e exigem mexer no código. Se o usuário quiser editar todos, isso é
  trabalho de adicionar campos.
- **Sem escala formal de espaçamento na ferramenta.** Funciona porque a densidade é uniforme e os
  componentes são poucos, mas é o primeiro lugar a formalizar se a ferramenta crescer.

---

# Entrega

Escreva também, em português:

- um `README.md` curto de como rodar e o que é cada aba;
- um `HANDOFF.md` para o próximo agente, contendo a regra de não sobrescrever o estado do
  usuário, a tabela de onde mexer para cada tipo de pedido, as invariantes, e as armadilhas acima;
- um `DESIGN.md` explicando as decisões visuais, com a tabela de contraste medida.

Nada de publicar em serviço externo. Entrega é arquivo no disco, aberto com `open <caminho>`.
