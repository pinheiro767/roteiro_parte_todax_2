# Atlas Imersivo — Anatomia Humana Topográfica de Tórax

PWA estático pronto para GitHub Pages.

## Conteúdo
- 136 entradas/estruturas, na ordem integral do roteiro.
- Grupos G1, G2, G3 e G4.
- Cada entrada recebe um arquivo padrão sequencial em `assets/estruturas/`: `1.png`, `2.png`, ... `136.png`.
- Os PNGs incluídos são placeholders elegantes: substitua cada arquivo pela foto anatômica correspondente, mantendo o mesmo nome.
- Dentro do app, cada estrutura também aceita múltiplas fotos adicionais, armazenadas localmente via IndexedDB.
- Campo de “Informações pertinentes” por estrutura, salvo localmente.
- Busca, filtros por grupo, leitura por voz, alto contraste, ajuste de fonte, redução de movimento, tela cheia, som de interface.
- Instalável e funcional offline via Service Worker.

## Publicar no GitHub Pages
1. Crie um repositório.
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório.
3. Em Settings → Pages, escolha Deploy from a branch, branch `main`, pasta `/root`.
4. Abra o endereço publicado e aceite “Instalar” quando disponível.

## Fotos
A foto principal da entrada N é sempre:
`assets/estruturas/N.png`

Para trocar a imagem principal, substitua o placeholder correspondente, sem mudar o nome.

Fotos adicionadas pelo botão “Adicionar fotos” ficam no navegador daquele dispositivo. Isso permite inserir quantas quiser sem alterar o repositório.

## Observação importante de fidelidade
As terminologias foram transcritas do arquivo “Roteiro Tórax 2.pdf” como fornecido, sem correção editorial silenciosa.
