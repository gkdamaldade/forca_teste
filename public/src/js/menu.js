document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  // Verifica se o usuário está logado
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Decodifica o token para extrair o nome do usuário
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload);
    const nomeUsuario = payload.nome;

    // Cria e exibe saudação no topo do menu
    const saudacao = document.createElement('p');
    saudacao.className = 'saudacao';
    saudacao.textContent = `Bem-vindo, ${nomeUsuario}!`;
    document.querySelector('.menu-container').prepend(saudacao);
  } catch (erro) {
    console.error('Token inválido ou expirado:', erro);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }

  // Botões do menu (exemplo de navegação futura)
  document.querySelector('.menu-button').addEventListener('click', () => {
    window.location.href = 'sessao_principal.html';
  });

  const botoesCirculares = document.querySelectorAll('.circle-button');
  botoesCirculares[0].addEventListener('click', () => {
    window.location.href = 'ranking.html';
  });
  botoesCirculares[1].addEventListener('click', () => {
    window.location.href = 'loja.html';
  });
  botoesCirculares[2].addEventListener('click', () => {
    window.location.href = 'configuracoes.html';
  });
});
    console.log("menu.js carregado!");

    // --- 1. Botão Principal: JOGAR ---
    const botaoJogar = document.querySelector('.menu-button');

    if (botaoJogar) {
        botaoJogar.addEventListener('click', () => {
            console.log("Clicou em JOGAR. Redirecionando para sessao_principal.html");
            // Redireciona para a tela de sessões (como configuramos antes)
            window.location.href = 'sessao_principal.html'; 
        });
    } else {
        console.error("Erro: Botão .menu-button (JOGAR) não encontrado.");
    }

    // --- 2. Botões de Ícone (Círculo) ---
    const botoesCirculo = document.querySelectorAll('.circle-button');
    
    botoesCirculo.forEach(botao => {
        botao.addEventListener('click', () => {
            // Pega o ícone que está dentro do botão para saber qual é
            const icone = botao.querySelector('i');

            if (icone.classList.contains('fa-medal')) {
                // Botão de Ranking
                console.log("Clicou em RANKING. Redirecionando para ranking.html");
                window.location.href = 'ranking.html';

            } else if (icone.classList.contains('fa-shopping-cart')) {
                // Botão da Loja
                console.log("Clicou em LOJA. Redirecionando para loja.html");
                window.location.href = 'loja.html';

            } else if (icone.classList.contains('fa-cog')) {
                // Botão de Configurações
                console.log("Clicou em CONFIGURAÇÕES. (Ainda não configurado)");
                // Se você não tiver uma página, pode deixar sem 'href' por enquanto
                // window.location.href = 'configuracoes.html'; 
            }
        });
    });
