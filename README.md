# Brand Playground

Playground local pra decidir a identidade da marca em tempo real: nome, logo com iniciais, cores, tipografia, bordas, padrões, estilo de site, voz/escrita, missão, visão, valores. Tudo salva sozinho a cada mudança.

## Faz parte de um artigo

Este repositório acompanha um artigo publicado no **X** sobre montar uma identidade de marca
inteira e uma logo 3D usando só IA.

**Artigo:** _link em breve_

| Parte do artigo | Onde está aqui |
|---|---|
| O playground de marca | este repositório |
| A skill usada na logo 3D | [`skills/blender-logo-motion/`](skills/blender-logo-motion/) |

### A skill do Blender

`skills/blender-logo-motion/` é uma skill de agente para produzir logo 3D, animação e
exportações no Blender a partir de um vetor. É agnóstica de marca, paleta e sistema: não
tem nada da minha identidade dentro dela.

Para usar no Claude Code, copie para as skills do usuário ou do projeto:

```bash
cp -R skills/blender-logo-motion ~/.claude/skills/
```

Ela conta com o Blender aberto e o add-on do Blender MCP conectado.

## Rodar

```bash
node server.mjs        # abre em http://localhost:4747
```

Com o servidor rodando, o estado é gravado em `brand.json` e num backup diário em `backups/`. Os dois ficam fora do git.

Alternativa sem servidor: abrir `index.html` direto no navegador. Salva no `localStorage` do navegador (não em arquivo).

Fontes vêm do Google Fonts: precisa de internet pra ver as fontes reais.

## Abas

### Nome e domínio

Na seção **Identidade** da barra lateral: gerador de nomes com shortlist, e um bloco de **Domínios** que
monta candidatos a partir do nome (`amanha.com`, `amanha.com.br`, `amanhastudio.com`, `amanhaai.com`, `usamanha.com`…),
em 20 TLDs que você liga e desliga.

O botão **Checar disponibilidade** consulta o registro público de domínios (RDAP) através do servidor local:
`livre` só aparece quando o registro responsável respondeu que o domínio não existe. TLD sem RDAP (`.io`, por
exemplo) mostra `?` em vez de chutar. Cada linha também tem `↗` para o Instant Domain Search e `⌁` para a
ficha do domínio (registro.br nos `.br`).

Essa checagem sai da sua máquina: o nome consultado vai para `data.iana.org`, para o RDAP do registro do TLD
e, quando o RDAP não responde, para uma consulta de DNS. Nada mais do playground é enviado. Sem o servidor
rodando, os links manuais continuam funcionando e a checagem automática fica desligada.

| Aba | O que mostra |
|---|---|
| Site | Landing page completa com o estilo aplicado (hero, serviços, processo, cases, manifesto, time, FAQ, CTA, rodapé) |
| Logo | Monograma em 29 formas, todas as variações, tamanhos, respiro, "o que não fazer", download SVG |
| Cores & Tipo | Paleta, escalas 50–950, contraste WCAG, espécime das fontes |
| UI Kit | Botões, formulários, tags, alertas, tabela, modal, código |
| Aplicações | Cartão, assinatura de e-mail, crachá, posts/story, capa LinkedIn, slide, adesivos, camiseta |
| Voz | Sliders de tom, regras de escrita, palavras, amostras (e-mail, LinkedIn, suporte, 404…) |
| Manifesto | Brand book: missão, visão, promessa, posicionamento, valores, arquétipo |
| Brand Sheet | Resumo de uma página. Imprimir/PDF, exportar brand.md, tokens.css, JSON |

## Destaque "rabisco"

Marque a palavra com `*asteriscos*` no texto. Com **Destaque em títulos → Rabisco**, ela ganha
duas ondas embaixo, e elas reagem ao scroll da prévia: quanto mais rápido você rola, mais alto
o vagalhão. As duas camadas correm em sentidos opostos, então se cruzam como água de verdade.

Para congelar: **Movimento → Nenhum**. Também respeita `prefers-reduced-motion` do sistema.

## Guardar e restaurar uma versão

`snapshots/` guarda cópias que nada sobrescreve. O `backups/` do servidor não serve para isso:
ele é regravado a cada gravação, então guarda o estado mais recente, não o bom.

```bash
cp brand.json snapshots/nome-que-voce-lembre.json   # guardar o de agora
node restaurar.mjs                                  # listar o que tem
node restaurar.mjs nome-que-voce-lembre             # restaurar
```

Feche a aba do playground **antes** de restaurar. Ela mantém o estado em memória e regrava o
`brand.json` na próxima gravação. O `restaurar.mjs` guarda o estado atual em
`snapshots/antes-de-restaurar-*.json` antes de trocar, e carimba `updatedAt` novo, senão o
localStorage do navegador ganha do arquivo no boot e a restauração não pega.

## Atalhos

`⌘Z` desfaz · `⇧⌘Z` refaz · `1–8` abas · `R` me surpreenda · `D` claro/escuro · `⌘S` salvar · `⌘F` buscar ajuste · `?` ajuda

## Arquivos

- `index.html` — estrutura
- `styles.css` — ferramenta + CSS da marca (tudo em `--b-*`)
- `data.js` — fontes, paletas, arquétipos, bancos de texto, estado padrão
- `logo.js` — gerador SVG do monograma + utilidades de cor
- `render.js` — copy por tom de voz + renderizadores das abas + exports (brand.md, tokens.css)
- `app.js` — controles, estado, undo/redo, autosave, versões, comparação, randomizador
- `server.mjs` — servidor local (zero dependências)
- `brand.json` — seu estado salvo (criado ao usar)
- `test-render.mjs` — fuzz de 1026 combinações; rode `node test-render.mjs` depois de mexer no código
- `HANDOFF.md` — contexto para outro agente continuar o trabalho

## Ponto de extensão: aba "Começo"

Se existir um `guia.js` definindo `BP.GUIDE = { checklist, ideas, week, html, sources }` e ele for
incluído no `index.html` antes de `render.js`, aparece uma nona aba "Começo" com checklist
persistida (o que marcar fica salvo junto do resto). Sem esse arquivo, a aba simplesmente não existe.

## Licença

0BSD. Use, copie, modifique e distribua à vontade, com ou sem fins lucrativos.
Não precisa me creditar nem manter aviso nenhum. Veja `LICENSE`.
