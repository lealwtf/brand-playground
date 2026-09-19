# Design do playground — o que eu fiz e por quê

Documento sobre a **ferramenta**, não sobre a marca que ela gera. Se você quer saber como o
código funciona, leia `HANDOFF.md`. Aqui é sobre as decisões visuais: cores, posicionamento,
tipografia, profundidade, movimento. E sobre a pergunta do "bom gosto", que tem resposta e não é
mística.

---

## A regra que gera todas as outras

**A ferramenta não pode se vestir melhor do que o trabalho.**

Isso não é modéstia, é função. O playground existe para você julgar uma marca. Se a interface
tem personalidade forte, ela entra na comparação sem ser convidada. Você olha um verde na
prévia e não sabe se está reagindo ao verde da marca ou ao verde do botão que está ao lado.

Toda decisão daqui pra frente é consequência disso. A interface é neutra, quieta, previsível e
convencional de propósito. A cor mora na prévia. O contraste alto mora na prévia. A
personalidade mora na prévia.

Isso está imposto no código por uma parede: dois conjuntos de variáveis que nunca se cruzam.

| Conjunto | Prefixo | Onde vive |
|---|---|---|
| Ferramenta | `--t-*`, classes `.tb-` `.sec` `.field` | barra superior, lateral, modais |
| Marca | `--b-*`, classes `.b-` | só dentro de `.b-root`, o quadro da prévia |

A ferramenta nunca lê uma variável da marca, e a marca nunca lê uma da ferramenta. É por isso
que escolher botão "brutal" na marca não deixa a barra lateral brutal. Sem essa parede, o
playground viraria refém de cada experimento seu.

---

## Cores da ferramenta

### Os tokens

```
--t-bg        #f3f0e9   fundo da aplicação
--t-panel     #fffdf8   superfície elevada (barra, lateral, cartões)
--t-panel-2   #f7f3eb   superfície recuada (abas, hover)
--t-ink       #1f2321   texto principal
--t-muted     #6f736f   texto secundário
--t-line      #e4ded2   divisória e borda de campo
--t-line-2    #d5cdbd   borda em hover, trilho de switch
--t-accent    #3b6d5a   único acento
--t-accent-soft #e1efe7 fundo do acento
--t-warn      #b8641f   salvando
--t-danger    #b23a3a   ações destrutivas
```

### Por que neutro quente e não cinza

Nada aqui é cinza puro. O fundo é `#f3f0e9`, um bege muito lavado. O texto é `#1f2321`, um
quase-preto com verde dentro, não `#000`.

Duas razões. A primeira é que branco puro ao lado de uma prévia de marca cria uma borda dura que
não existe no mundo real: um site nunca é visto grudado num retângulo `#ffffff`. Um neutro quente
recua e deixa a prévia parecer uma coisa no mundo, não um recorte.

A segunda é que preto puro sobre branco puro é o contraste máximo possível, e num painel de
controle que você olha por horas isso cansa. Treze e meio pra um já é mais do que suficiente.

### Um acento só

`#3b6d5a`, um verde dessaturado. Um. Não tem cor secundária na ferramenta.

Um acento único faz o trabalho de hierarquia sozinho: se está com acento, é o estado ativo, o
foco, ou o caminho principal. Você aprende isso em cinco segundos e nunca mais precisa pensar.
Duas cores de acento já obrigam a inventar uma regra sobre qual usa quando, e essa regra sempre
vaza.

Aviso e perigo existem, mas não são acentos. São sinais, e aparecem em dois lugares contados.

### Contraste medido, não achado

| Par | Claro | Escuro |
|---|---|---|
| Texto principal sobre fundo | 13,97:1 | 15,35:1 |
| Texto principal sobre painel | 15,64:1 | 14,08:1 |
| Texto secundário sobre painel | 4,74:1 | 6,31:1 |
| Acento sobre painel | 5,87:1 | 8,69:1 |
| Branco sobre acento | 5,96:1 | — |

Tudo passa em AA. O texto secundário no tema claro passa por pouco, 4,74 contra o mínimo de 4,5,
e isso foi deliberado: `--t-muted` precisa recuar de verdade para a hierarquia funcionar, e
recuar mais do que isso seria reprovar.

**Ponto fraco conhecido:** a borda de campo `--t-line` sobre o fundo dá 1,32:1. Como divisória é
irrelevante, mas em campos de texto a borda é o que delimita o controle, e o ideal seriam 3:1.
Hoje o campo também se distingue pelo fundo mais escuro que o painel, o que segura. Se algum dia
alguém reclamar de não achar os campos, é aqui que se mexe.

### Tema escuro

Não é inversão. É uma segunda paleta escrita à mão, sob `html[data-tool-theme=dark]`.

O acento muda de `#3b6d5a` para `#8fc6ad`, bem mais claro. Verde escuro sobre fundo escuro
desaparece. A mesma cor de acento nos dois temas é o erro mais comum em tema escuro, e o
resultado é um estado ativo que ninguém vê.

Os quatro selos de contraste também têm par escuro próprio, escrito à mão. São os únicos lugares
com cor codificada, porque significam aprovado, limítrofe e reprovado, e essa leitura não pode
depender de derivação automática.

---

## Cores da marca

Aqui a lógica se inverte. Na ferramenta eu escolhi tudo. Na marca você escolhe **cinco** cores e o
sistema deriva o resto.

```
primária · secundária · acento · papel · tinta
```

Tudo o mais é calculado com `color-mix` em oklab: superfície, superfície 2, linha, texto
apagado, primária suave, primária profunda. Oklab e não sRGB porque misturar em sRGB escurece
o meio do caminho e produz aquele cinza sujo entre duas cores saturadas.

### A regra que salva o sistema

**Cor de texto legível é calculada, não escolhida.**

`BP.readable(cor, fundo, 4.5)` empurra a luminosidade da cor, passo a passo, até o contraste
passar. É de onde saem `--b-primary-text` e `--b-primary-deep`.

Isso existe porque a alternativa não funciona. Se o texto de destaque usasse a primária crua,
qualquer primária escura sumiria no tema escuro e qualquer primária clara sumiria no claro. Eu
descobri isso vendo um chapéu de seção em verde `#4F7A63` praticamente invisível sobre tinta
`#2B2D2F` numa captura de tela. A correção não foi trocar o verde. Foi parar de confiar na cor
escolhida e passar a calcular a legível.

Consequência prática: **você pode escolher qualquer paleta, inclusive uma ruim, e o texto
continua legível.** O sistema protege você da sua própria escolha sem impedir a escolha.

---

## Layout e posicionamento

### A estrutura

```
┌──────────────────────────────────────────────┐
│ barra superior            54px               │
├───────────────┬──────────────────────────────┤
│ lateral       │ prévia                       │
│ 392px         │ resto                        │
│               │                              │
└───────────────┴──────────────────────────────┘
```

Duas grades aninhadas. O `body` é `grid-template-rows: auto 1fr`. O miolo é
`grid-template-columns: 392px 1fr`. Altura travada em `100vh` com `overflow:hidden`, e só duas
áreas rolam: a lista de controles e a prévia. A página inteira nunca rola.

Isso importa mais do que parece. Num editor, a barra de ferramentas fugindo pra cima quando você
rola é uma das coisas que mais faz uma ferramenta parecer amadora.

### Por que 392px

Número medido, não escolhido. É o menor valor que aceita, sem apertar:

- dois cartões de paleta lado a lado com as cinco faixas de cor legíveis;
- um rótulo à esquerda e o valor numérico à direita na mesma linha;
- um controle segmentado de três opções sem quebrar em duas linhas.

Abaixo disso os presets de paleta viram uma coluna e a lateral fica alta demais para navegar.
Acima disso a prévia começa a ficar estreita, e a prévia é o produto.

### A barra superior é 1fr auto 1fr

```css
.topbar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}
```

Três colunas, sendo a do meio automática e as laterais iguais. Resultado: **as abas ficam
opticamente centradas na janela**, e continuam centradas quando o nome da marca cresce à
esquerda. Se fosse flexbox com `space-between`, as abas dançariam para os lados a cada letra que
você digitasse no nome.

### A prévia

O quadro é centralizado com `margin: 0 auto` e limitado por `--frame-w`, que muda com o
dispositivo escolhido: 100%, 860px, 420px. A transição de largura tem 0,25s, então trocar de
desktop para celular é um movimento e não um corte, e você consegue ver o layout se reorganizar.

O zoom usa `zoom`, não `transform: scale`. `zoom` refaz o layout no tamanho novo, então textos
continuam quebrando onde quebrariam de verdade. `scale` só amplia os pixels e mentiria pra você
sobre a quebra de linha.

A rolagem da prévia é preservada entre redesenhos. Você mexe num slider, o HTML inteiro é
regerado, e a página não pula de volta pro topo.

### Responsivo

Em telas abaixo de 900px a grade vira uma coluna, a lateral ganha teto de 45vh e as abas passam
a ocupar a linha inteira com rolagem horizontal. É um plano B honesto, não um layout mobile de
verdade. Uma ferramenta de decisão visual num celular seria fingimento.

---

## Tipografia

### Na ferramenta

Fonte do sistema, não fonte carregada. `-apple-system` primeiro. Duas razões: nunca pisca no
carregamento, e a interface se parece com o resto do computador, o que reforça que ela é
ferramenta e não conteúdo.

A escada, em pixels:

| Tamanho | Onde |
|---|---|
| 17px | títulos de modal, prévia de fonte |
| 14px | nome da marca na barra |
| 13,5px | corpo, base do `body` |
| 13px | título de seção |
| 12,5px | rótulo de switch, item de lista |
| 12px | rótulo de campo, botão |
| 11,5px | texto de ajuda, dica |
| 11px | rótulo de progresso, extremos de slider |
| 10 a 10,5px | metadados, contagem, tecla de atalho |

Nove degraus num intervalo de sete pixels. Não é escala modular, é ajuste ótico: a diferença
entre 12 e 11,5 é pequena o suficiente para não criar hierarquia visível, mas suficiente para o
olho separar "rótulo" de "ajuda" sem precisar de outra cor.

Os meios pixels são deliberados. Em 13px a lateral fica apertada, em 14px fica pesada nessa
densidade. Meio pixel resolve, e telas modernas renderizam bem.

Monoespaçada aparece em quatro lugares e só neles: valor numérico de campo, código hexadecimal
de cor, razão de contraste e tecla de atalho. Ou seja, onde alinhar dígitos ajuda a comparar, ou
onde o texto representa uma tecla.

### Na marca

Aqui é o contrário: escala modular de verdade. Você escolhe base e razão, e os quatro títulos
saem de potências dela.

```
h1 = base × razão^5
h2 = base × razão^3.4
h3 = base × razão^2
h4 = base × razão
```

Os expoentes não são inteiros de propósito. Com inteiros, h1 fica gigante demais em relação a h2
quando a razão passa de 1,3. O 3,4 no h2 é o que mantém a escada utilizável em toda a faixa de
razão que a ferramenta oferece.

O cálculo é feito em JavaScript e escrito como pixels, não deixado para o CSS. `pow()` no CSS
ainda tem suporte irregular, e um h1 que não calcula é uma página quebrada.

---

## Espaço, raio e profundidade

### Raio

Família de quatro, e a regra é que o filho é sempre menor que o pai.

| Valor | Onde |
|---|---|
| 14px | quadro da prévia, caixa de modal |
| 12px | raiz, `--t-radius` |
| 8 a 10px | botões, campos, cartões |
| 5 a 7px | coisas dentro de coisas: chip, tecla, ícone de seção |
| 99px | pílulas: chip, selo, aviso, barra de progresso |

Raio de filho igual ao do pai é o detalhe que faz um cartão parecer errado sem que você saiba
dizer por quê. O olho lê os dois arcos concêntricos e percebe que estão desalinhados.

### Profundidade

A profundidade padrão é **uma linha de 1px**, não sombra. Barra, lateral, campo, cartão, tudo se
separa por `1px solid var(--t-line)`.

Sombra é reservada para o que realmente flutua sobre o resto, e são quatro coisas:

```
menu suspenso   0 12px 32px -8px  rgb(0 0 0/.25)
modal           0 30px 80px -20px rgb(0 0 0/.5)
aviso           0 10px 30px -10px rgb(0 0 0/.4)
quadro da prévia  0 1px 2px .06  +  0 24px 60px -30px .35
```

Todas com deslocamento negativo grande. Isso mantém a sombra por baixo do objeto em vez de
vazar pelas laterais, que é o que faz sombra parecer suja.

A do quadro da prévia é dupla de propósito: um contato de 1px que cola o quadro na superfície,
mais uma difusa e muito aberta que o levanta. É o único elemento da interface que ganha
tratamento caprichado, porque é o único que representa o trabalho.

### Espaço

Não tem escala de espaçamento na ferramenta. Os valores são 2, 4, 5, 6, 8, 10, 12, 14, 22.
Confesso: isso é menos rigoroso do que deveria. Funciona porque a densidade é uniforme e os
componentes são poucos, mas se a ferramenta crescer, esse é o primeiro lugar a formalizar.

Na marca, ao contrário, o espaço é um token só, `--b-space`, com três valores conforme a
densidade escolhida: 12px compacto, 18px confortável, 26px arejado. Todo o resto do site é
múltiplo dele, tipo `calc(var(--b-space) * 2.4)`. Um número muda o ritmo da página inteira.

---

## Movimento

Na ferramenta, movimento é funcional e curto. Só quatro coisas se movem:

| O quê | Duração | Por quê |
|---|---|---|
| Seta da seção girando | 0,15s | confirma que abriu |
| Switch deslizando | 0,15s | mostra o estado indo de um lado pro outro |
| Largura do quadro | 0,25s | deixa ver o layout se reorganizando |
| Barra de progresso | 0,4s | acumula, então merece ser notada |

Nada mais. Sem animação de entrada, sem fade em modal, sem elemento aparecendo com atraso.
Numa ferramenta que você usa por horas, animação decorativa vira imposto: você paga a mesma
fração de segundo mil vezes.

A animação toda mora na marca, onde é assunto e não enfeite, e tem controle próprio com opção de
desligar. E respeita `prefers-reduced-motion`.

---

## Estados

Um vocabulário só, aplicado a tudo.

| Estado | Como se mostra |
|---|---|
| Repouso | borda `--t-line`, fundo `--t-panel` |
| Hover | fundo vai pra `--t-panel-2`, ou a borda vai pra `--t-line-2` |
| Foco | borda vira acento, fundo clareia pra painel |
| Ativo em segmentado | **inverte**: fundo `--t-ink`, texto `--t-bg` |
| Ativo em cartão | borda de acento e fundo `--t-accent-soft` |
| Desabilitado | opacidade 0,35 e cursor normal |

A inversão no segmentado é a decisão mais forte da interface. Um segmentado com o ativo em
acento se confunde com hover. Invertido, ele é inconfundível de qualquer distância e não gasta
o acento. É o único lugar onde a ferramenta usa contraste máximo, e é de propósito: é o controle
que você mais usa.

Cartões de escolha, como paleta e arquétipo, usam acento em vez de inversão porque neles a cor
da amostra é o conteúdo, e inverter o fundo destruiria a leitura da amostra.

---

## Sobre o "bom gosto"

A pergunta merece resposta direta, então: não teve inspiração. Teve restrição, convenção e
medição, nessa ordem.

**Restrição.** Onze cores, uma fonte, quatro raios, uma sombra por camada de elevação, nove
tamanhos de texto. Um conjunto pequeno o suficiente para caber na cabeça significa que a
próxima decisão quase sempre já está tomada. Consistência não é resultado de disciplina, é
resultado de não ter opção. E consistência é a maior parte do que as pessoas chamam de bom
gosto.

**Convenção.** Quase nada aqui é invenção minha. Barra superior com abas ao centro, lateral de
controles à esquerda, tela à direita: é o layout de todo editor desde os anos noventa.
Acordeão, segmentado, switch, chip, aviso em pílula: componentes que você já sabe usar. Isso é
escolha, não preguiça. Numa ferramenta, novidade na interface é imposto cobrado da atenção que
pertence ao seu trabalho. O lugar de arriscar é a prévia.

**Medição.** As coisas que mais parecem gosto foram medidas. Os 392px da lateral saíram de
testar o que cabe. O contraste está na tabela ali em cima porque eu calculei, não porque olhei.
Os limites de alinhamento nas três larguras de conteúdo saíram de um script que compara a
distância esquerda e direita de cada bloco. Os vinte e nove símbolos de logo têm fator de
tamanho individual porque eu renderizei todos numa folha de contato e vi quatro vazando texto.

**E a parte que sobra.** Depois de restrição, convenção e medição, sobra pouco, e essa parte
sobrando é gosto de verdade. Foi ela que escolheu bege em vez de cinza e verde dessaturado em
vez de azul. Não sei defender essas duas com número. São as únicas.

---

## Onde eu errei

Documentar só os acertos daria uma ideia errada de como isso foi feito. Quatro erros reais, os
quatro achados medindo, nenhum achado olhando.

1. **Contraste no tema escuro.** Chapéu de seção em primária sobre tinta escura, quase
   invisível. Apareceu numa captura de tela, não na minha cabeça. Gerou a função que calcula cor
   legível, que hoje é uma das melhores partes do sistema. Erro que virou regra.
2. **Especificidade em `ul`.** A regra `.b-root ul{margin:0}` anulava o `margin-left:auto` do
   menu, e o menu ficava grudado à esquerda. Nunca tinha funcionado. Ficou escondido porque o
   menu tinha teto de 900px, que mascarava o sintoma. Dois defeitos se cancelando.
3. **Largura fixa dentro de coluna variável.** Cabeçalho de seção com medida em `em` fixo: quanto
   mais larga a coluna, maior o vazio à direita. Só aparece quando alguém muda a largura, o que
   eu não tinha testado.
4. **Quatro símbolos de logo vazando texto.** Achados renderizando os vinte e nove numa folha só.

O padrão é o mesmo nos quatro: **defeito que só aparece numa combinação que eu não pensei em
olhar.** Por isso o projeto tem um script que renderiza mil e vinte e seis combinações e um
outro que mede alinhamento via navegador. Bom gosto sem verificação é bom gosto na média e
vergonha nas pontas.

---

## Como manter isso

Se você for mexer, seis regras.

1. **Não adicione um segundo acento.** Se algo precisa de destaque e o acento já está em uso
   perto, o problema é hierarquia, não falta de cor.
2. **Cor nova na ferramenta precisa da tabela de contraste.** Nos dois temas.
3. **Filho com raio menor que o pai.** Sempre.
4. **Sombra só para o que flutua.** O resto é linha de 1px.
5. **Animação nova precisa justificar o que ela comunica.** Se a resposta for "fica bonito", não
   entra na ferramenta. Entra na marca, com controle para desligar.
6. **Componente novo herda o vocabulário de estados** da tabela acima. Se ele precisar de um
   estado novo, provavelmente ele deveria ser um componente que já existe.

E a regra zero, que vale mais que as seis: **se a mudança faz a ferramenta chamar mais atenção
que a prévia, ela está errada, mesmo que esteja bonita.**
