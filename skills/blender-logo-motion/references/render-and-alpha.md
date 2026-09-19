# Render, loop e transparência: verificações e falhas observadas

As ocorrências abaixo são evidências de um trabalho anterior, não defeitos universais do Blender nem uma configuração obrigatória. Use o diagnóstico proporcional ao problema. Descubra versões e ferramentas locais antes de adaptar comandos.

## Quadros com materiais pretos ou inconsistentes

Ocorrência: uma sequência apresentou alguns quadros com letras pretas apesar de os quadros vizinhos estarem corretos. Renders isolados corrigiram o resultado. O uso de cache persistente foi associado à falha; as sequências seguintes usaram `scene.render.use_persistent_data=False` e, para isolamento adicional, reabriram o `.blend` a cada quadro.

Diagnóstico útil:
1. Separe um quadro defeituoso e um quadro de referência. Confira se a mudança poderia vir da animação de material, luz, câmera ou objetos.
2. Renderize o quadro defeituoso isoladamente com a mesma cena e configurações.
3. Se houver diferença inesperada, teste sem cache persistente.
4. Se necessário, reabra a cena entre quadros ou use processos isolados. Isso custa tempo; não imponha o custo a cenas estáveis.
5. Repare os quadros afetados, reconstrua os vídeos derivados e verifique novamente.

Inspecione amostras distribuídas pela sequência, evento principal e extremos de movimento. Análises de brilho/alpha podem ajudar a detectar anomalias, mas regiões naturalmente escuras não são automaticamente falhas. Adapte qualquer limiar à composição.

## Loop: geometria, reprodução e áudio

Confira duração, FPS e contagem esperada de frames no arquivo exportado. Um loop de duração T a F fps normalmente exporta T×F frames; o endpoint adicional usado para interpolação pode ficar fora da faixa.

Compare a emenda em movimento, não apenas duas imagens. Verifique posição, rotação, escala, velocidade, câmera e luz. Holds intencionais são aceitáveis; não duplique pausas acidentalmente.

Quando endpoints precisarem coincidir, compare primeiro as imagens de origem. Compressão com perdas pode criar pequenas diferenças entre quadros visualmente equivalentes, portanto não exija igualdade binária no MP4.

Ouça a emenda. Ajuste continuidade, fades ou silêncio nas extremidades conforme a proposta. Verifique a sincronia do evento sonoro no vídeo final, inclusive após remontar ou inverter trechos da animação. Não reutilize automaticamente o timing do áudio anterior.

## Alpha: exportar não é comprovar

Preserve RGBA desde o render até a codificação. Uma etapa intermediária RGB ou um fundo composto elimina a transparência. MP4 H.264 comum não é uma entrega com alpha. MOV é um contêiner: o codec e suas opções precisam preservar o canal; ProRes 4444 é uma opção para composição.

Faça três verificações complementares:
- Metadados: codec, formato de pixel e indicação de alpha, quando disponíveis.
- Canal: decodifique para RGBA e confira regiões vazias, bordas e logo. Um canal totalmente opaco em uma composição que deveria ter área vazia exige investigação.
- Composição: sobreponha em fundos claro, escuro e contrastante. Procure halos, bordas sujas ou áreas opacas inesperadas. Verifique interpretação straight/premultiplied se aparecerem contornos errados.

Não confunda fundo preto do player com pixels pretos incorporados ao arquivo.

Ocorrência com WebM: a inspeção padrão reportou `yuv420p` apesar de existir indicação `alpha_mode=1`; foi necessário selecionar `libvpx-vp9` na decodificação para preservar o alpha na imagem de teste. Metadados sozinhos não comprovaram nem refutaram a transparência.

Exemplo de diagnóstico, se FFmpeg e o decoder estiverem disponíveis (substitua os caminhos):

```sh
ffprobe -v error -show_streams -show_format -of json input.webm
ffmpeg -c:v libvpx-vp9 -i input.webm -frames:v 1 -pix_fmt rgba check.png
```

Coloque a opção de decoder antes de `-i`. Não sobrescreva um arquivo de teste existente sem intenção. Use um instante representativo se o primeiro quadro estiver vazio.

Outra ocorrência: uma inspeção de alpha decodificado em 16 bits produziu uma interpretação enganosa do bounding box em uma ferramenta. Uma decodificação RGBA de 8 bits permitiu verificar visualmente o resultado. Confira profundidade, modo de imagem e escala dos valores antes de concluir que o alpha está errado.

## Limite do vidro sobre vídeo

Alpha preserva a composição, mas não recalcula refração tridimensional sobre um fundo desconhecido. Reflexos do estúdio podem estar presentes nos pixels da logo mesmo com o exterior transparente. Teste os fundos do uso pretendido. Se o usuário precisar refratar um vídeo específico, ele pode precisar integrar esse vídeo à cena ou usar uma composição planejada para isso.

## Máquina e recursos portáveis

Render e viewport renderizado simultâneos podem disputar GPU e memória. Manter a interface em solid/wireframe permite acompanhar objetos e timing enquanto a exportação trabalha. Não mude a preferência do usuário sem necessidade.

Em uma execução anterior, o Blender precisou de execução fora do sandbox para inicializar a GPU. Isso é uma condição daquele ambiente, não uma autorização reutilizável nem motivo para escalar por padrão. Use os mecanismos de permissão vigentes se o problema ocorrer.

Recursos gerados durante a execução nem sempre estarão disponíveis em outra máquina. Confira imagens/HDR, fontes e áudio incorporados ou distribuídos com caminhos relativos. Um arquivo abrir sem erro não prova que todos os recursos necessários foram carregados.

Na interface, um timeout de colagem já ocorreu mesmo com o texto inserido corretamente. Confira o estado atual antes de repetir uma ação, evitando comandos duplicados. Não trate essa ocorrência como comportamento garantido de outras ferramentas.
