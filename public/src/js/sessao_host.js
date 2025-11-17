import { conectarSocket, aoReceberEvento } from './socket.js';

const urlParams = new URLSearchParams(window.location.search);
const sala = urlParams.get('sala');
const categoria = urlParams.get('categoria') || 'Geral';
const token = localStorage.getItem('token');
const nome = JSON.parse(atob(token.split('.')[1])).nome;

document.getElementById('sala-id').textContent = sala;

// Conecta ao socket e entra na sala
conectarSocket(sala, nome, categoria);

// Escuta evento de preparação (quando o segundo jogador entra)
aoReceberEvento((evento) => {
  if (evento.tipo === 'preparacao') {
    window.location.href = `/pages/sessao_preparacao.html?sala=${sala}&categoria=${categoria}`;
  }
});
