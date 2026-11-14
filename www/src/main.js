import { Game } from './core/Game.js';

const game = new Game({
  canvas: document.getElementById('game-canvas'),
  appEl: document.getElementById('app'),
  uiEl: document.getElementById('ui'),
});
game.start();

// Con ?debug en la URL, el juego queda accesible en la consola como `__game`.
if (new URLSearchParams(window.location.search).has('debug')) {
  window.__game = game;
}
