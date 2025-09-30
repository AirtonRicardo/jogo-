# Neon Wasteland — ODS Quiz (Futurista Cyberpunk com Natureza Degradada)

## Como rodar
Abra `index.html` em um servidor local (recomendado) para que `questions.json` carregue via `fetch`.
- No VS Code: use **Live Server**
- Ou via Python: `python -m http.server` e acesse `http://localhost:8000`

## Novidades
- HUD neon com **pontuação**, **combo**, **vidas** e **progresso**
- **Partículas** (chuva ácida/neon) e **scanlines** de CRT
- **Power-ups**: *Dica* (remove 2 erradas) e *Escudo* (ignora 1 erro)
- **Bônus de tempo** e **combo** que aumentam a pontuação
- **Layout lado a lado**: Perguntas à esquerda e feedback em destaque à direita
- **Sistema de Game Over** com opção de recomeçar quando as vidas acabam
- **Feedback visual** com mensagens centralizadas e coloridas

## Estrutura de arquivos
- `index.html` - Estrutura principal do jogo
- `style.css` - Estilos com tema cyberpunk
- `game.js` - Lógica do jogo e interações
- `questions.json` - Banco de perguntas com ODS
- `README.md` - Documentação

## Recursos
- **Perguntas**: 25 questões de desenvolvimento web
- **ODS**: Cada pergunta relacionada a um Objetivo de Desenvolvimento Sustentável
- **Sistema de vidas**: 3 vidas iniciais
- **Combos**: Acertos consecutivos aumentam a pontuação
- **Tempo**: 15 segundos por pergunta com bônus por resposta rápida