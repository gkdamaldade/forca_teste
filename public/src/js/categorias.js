document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  // Verifica se o usuário está logado
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Decodifica o token para extrair o nome do jogador
  let nomeUsuario = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    nomeUsuario = payload.name;
  } catch (erro) {
    console.error('Token inválido ou expirado:', erro);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  // Saudação no topo
  const saudacao = document.createElement('p');
  saudacao.className = 'saudacao';
  saudacao.textContent = `Olá, ${nomeUsuario}! Escolha uma categoria:`;
  document.querySelector('.menu-container').prepend(saudacao);

  // Lista de categorias
  const categorias = [
    'Animais',
    'Frutas',
    'Países',
    'Esportes',
    'Filmes',
    'Profissões',
    'Objetos',
    'Cores'
  ];

  // Preenche os botões
  const botoes = document.querySelectorAll('.grid-button');
  botoes.forEach((botao, i) => {
    botao.textContent = categorias[i];
    botao.addEventListener('click', () => {
      window.location.href = `jogo.html?categoria=${encodeURIComponent(categorias[i])}`;
    });
  });
});
