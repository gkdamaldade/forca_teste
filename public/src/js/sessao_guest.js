import { conectarSocket, aoReceberEvento } from './socket.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  let nome = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    nome = payload.name;
  } catch (erro) {
    console.error('Token inválido:', erro);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  const inputCodigo = document.getElementById('codigo');
  const botaoEntrar = document.querySelector('.login-button');
  const categoria = urlParams.get('categoria');

  botaoEntrar.addEventListener('click', () => {
    const sala = (inputCodigo.value || '').trim().toUpperCase();
    if (!sala) {
      alert('Informe o código da sala.');
      return;
    }

    conectarSocket(sala, nome, categoria);

    aoReceberEvento((evento) => {
      if (evento.tipo === 'preparacao') {
        window.location.href = `/pages/sessao_preparacao.html?sala=${encodeURIComponent(sala)}&categoria=${encodeURIComponent(categoria)}`;
      }
    });
  });
});



// // Importações necessárias
// import { conectarSocket, aoReceberEvento } from './socket.js';

// document.addEventListener('DOMContentLoaded', () => {

//     // 1. Obtenção de Parâmetros e Token
//     const urlParams = new URLSearchParams(window.location.search);
//     const sala = urlParams.get('sala');
//     const categoria = urlParams.get('categoria') || 'Geral';
//     const token = localStorage.getItem('token');

//     let nome;

//     // 2. Decodificação do Token
//     try {
//         const tokenParts = token.split('.');
//         if (tokenParts.length !== 3) throw new Error('Token mal formatado.');

//         const payload = JSON.parse(atob(tokenParts[1]));
//         nome = payload.name || payload.nome;

//         if (!nome) {
//             console.error('Nome do usuário não encontrado no token.');
//             nome = 'Guest';
//         }

//     } catch (e) {
//         console.error('Erro ao decodificar token:', e);
//         window.location.href = 'login.html';
//         return;
//     }

//     // 3. Exibir o ID da sala na tela
//     const salaIdElement = document.getElementById('sala-id');
//     if (salaIdElement) {
//         salaIdElement.textContent = sala;
//     } else {
//         console.error("Elemento 'sala-id' não encontrado no HTML.");
//     }

//     // 4. Conectar ao socket com os mesmos dados do host
//     conectarSocket(sala, nome, categoria);

//     // 5. Escuta dos Eventos enviados pelo servidor
//     aoReceberEvento((evento) => {

//         if (evento.tipo === 'preparacao') {
//             console.log("Host iniciou a preparação. Redirecionando...");

//             // Redirecionamento padronizado
//             window.location.href =
//                 `/pages/sessao_preparacao.html?sala=${encodeURIComponent(sala)}&categoria=${encodeURIComponent(categoria)}`;
//         }

//     });
// });

