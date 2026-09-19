---
name: blender-logo-motion
description: Crie ou altere logos 3D e animações de marca no Blender a partir de vetores e referências, com cena editável e exportações para imagens, vídeos ou composição com alpha. Use para transformar uma identidade existente em 3D ou revisar esse trabalho; não para inventar uma nova marca ou gerar apenas um mockup raster.
---

# Blender Logo Motion

Produza geometria, materiais e animação reais no Blender, preservando a identidade fornecida. A skill é agnóstica de marca, paleta, material, sistema operacional e ferramentas disponíveis. O briefing do usuário define as entregas; não transforme todo pedido simples em um kit completo.

## Defina o trabalho com o contexto disponível

Identifique a versão final da logo, referências, paleta, acabamento, aplicações, câmera, elementos móveis, duração/FPS, necessidade de loop, áudio e alpha. Para iniciar um projeto sem briefing suficiente, use [references/briefing.md](references/briefing.md). Não reapresente o questionário se as respostas já estiverem na conversa.

Resolva ambiguidades que mudariam a geometria ou exigiriam um render completo novamente. Para escolhas secundárias, declare uma suposição razoável e avance. Liberdade criativa não autoriza alterar letras, símbolo ou proporções da marca.

Em revisões, descubra qual cena/exportação é a base atual e preserve as decisões anteriores. Atualize apenas as entregas afetadas pelo pedido. Se o arquivo solicitado já existe e atende aos requisitos, confira-o e entregue o link, sem renderizar outra vez.

## Prepare a cena sem perder o trabalho existente

- Descubra se Blender, integração MCP, execução de scripts e ferramentas de exportação estão disponíveis. Não presuma executáveis, versões, GPU ou suporte a codecs com base em outro ambiente.
- Prefira a integração disponível que permita editar e verificar a cena com eficiência. Scripts Python executados pelo Blender são uma alternativa ao MCP; controle de interface serve para operações visuais e acompanhamento.
- Inspecione a cena aberta antes de substituí-la. Preserve alterações não salvas em uma cópia identificável, além dos arquivos originais.
- Se o usuário quiser acompanhar, atualize a cena visível e confira que ela realmente foi carregada. Mantenha o viewport em solid ou wireframe quando necessário; ele não precisa estar renderizado durante o render de produção.
- Respeite a autorização e a capacidade de CPU/GPU. Não deduza permissão ou uma configuração universal desta skill. Evite múltiplos renders pesados competindo pela mesma máquina.

## Preserve o desenho ao modelar

Use os contornos reais do vetor, sem substituir a marca por uma fonte parecida. Preserve silhueta, proporções, alinhamentos e espaçamento. Quando uma troca de letra for autorizada e houver a forma necessária na própria marca, reutilizá-la pode garantir consistência melhor que uma reconstrução.

Inspecione contornos duplicados, sobreposições, furos e caminhos abertos antes da extrusão. Um SVG correto visualmente pode produzir superfícies internas ou volumes sobrepostos. Una regiões preenchidas quando necessário sem fechar os vazios intencionais da marca. Confira normais e faces.

Crie espessura e bevel de acordo com a escala. Não deixe o bevel engrossar a silhueta, consumir hastes finas ou fechar espaços. Separe apenas os elementos que precisam de controle independente e escolha origens adequadas para seus movimentos.

## Desenvolva material, iluminação e enquadramento

Use a referência para orientar o acabamento, não para copiar outra identidade. Material, iluminação e espessura devem funcionar juntos. Confira silhueta, reflexos e leitura no tamanho real de aplicação, evitando altas luzes estouradas ou superfícies quase pretas.

Para vidro, trabalhe transmissão, refração, rugosidade e volume; reduzir opacidade não substitui esse acabamento. Fundo transparente ainda exige iluminação/reflexos. Um vidro pré-renderizado não recalcula a refração de qualquer vídeo colocado atrás dele: explique essa limitação quando afetar a aplicação.

A orientação do viewport não define a câmera do render. Confira câmera ativa, transformações dos objetos e de seus pais. Para frontal fixo, verifique também keyframes de posição, rotação, lente ou escala ortográfica. Não imponha câmera frontal a pedidos de perspectiva.

Enquadre toda a amplitude do movimento. Em variantes de aplicação, ajuste a composição: margem circular para perfil, espaço útil para texto em banners, escala adequada a vertical/quadrado. Não dependa de cortes automáticos que eliminem elementos.

## Anime e faça uma prévia antes da produção

Respeite quais elementos podem se mover e diferencie movimento de câmera e de objeto. Use curvas e acomodação compatíveis com o acabamento e a direção criativa. Som é opcional, conforme o briefing.

Faça uma imagem de teste e quadros representativos do início, maior abertura, evento principal e final. Inspecione geometria, material, câmera e margens antes dos renders completos. Peça decisão do usuário apenas quando houver ambiguidade relevante ou uma etapa de revisão solicitada; não invente uma aprovação obrigatória.

Para loop, a repetição no player é apenas a reprodução. Confira continuidade de pose, velocidade, luz e câmera. Poses iguais nas extremidades não garantem continuidade de movimento. Um endpoint extra pode fechar a interpolação sem integrar a faixa exportada; avalie sua duração para não acrescentar uma pausa indevida. Confira também a emenda sonora.

## Renderize e valide o resultado exportado

Antes de exportar animação ou transparência, leia [references/render-and-alpha.md](references/render-and-alpha.md), que contém as falhas observadas, diagnóstico e verificações específicas. Para imagens estáticas sem alpha, consulte apenas se surgir um problema de render.

Não habilite nem desabilite cache persistente como regra universal. Houve um caso de quadros com materiais pretos associado a `use_persistent_data=True`; use comparação com render isolado para diagnosticar e escale o isolamento somente quando necessário.

Verifique amostras ao longo da sequência, especialmente eventos e emendas. Não declare todos os quadros corretos porque o primeiro ficou bom. Confira os arquivos finais e não apenas as configurações da cena.

## Entregue somente o que foi produzido e conferido

Ajuste formatos e resoluções às aplicações solicitadas. Exemplos: PNG RGBA para imagens; MP4 para vídeo opaco; MOV ProRes 4444 para composição com alpha; WebM com alpha quando compatível com o destino. Não prometa alpha apenas pela extensão.

Entregue o `.blend` editável quando fizer parte do trabalho, com imagens, ambiente, fontes e áudio necessários incorporados ou distribuídos com caminhos portáveis. Confira recursos ausentes. Não deixe a cena depender dos caminhos absolutos da máquina de produção.

Organize por função quando o volume justificar: `source`, `logos`, `perfil`, `banners`, `animation`, `preview`. Use nomes que distingam versões. Não misture exportações antigas com a revisão atual. Gere ZIP e guia curto apenas quando úteis ou solicitados.

Dê links diretos para os principais arquivos e indique qualquer limitação material de verificação. Cena configurada, render em andamento e exportação verificada são estados diferentes; comunique-os com precisão. Preserve originais e versões anteriores sem inflar a entrega com backups internos.
