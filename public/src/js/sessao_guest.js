// import { conectarSocket, aoReceberEvento } from './socket.js';

// document.addEventListener('DOMContentLoaded', () => {
//   const token = localStorage.getItem('token');
//   if (!token) {
//     window.location.href = 'login.html';
//     return;
//   }

//   let nome = '';
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     nome = payload.name;
//   } catch (erro) {
//     console.error('Token inválido:', erro);
//     localStorage.removeItem('token');
//     window.location.href = 'login.html';
//     return;
//   }

//   const inputCodigo = document.getElementById('codigo');
//   const botaoEntrar = document.querySelector('.login-button');
//   const categoria = urlParams.get('categoria');

//   botaoEntrar.addEventListener('click', () => {
//     const sala = (inputCodigo.value || '').trim().toUpperCase();
//     if (!sala) {
//       alert('Informe o código da sala.');
//       return;
//     }

//     conectarSocket(sala, nome, categoria);

//     aoReceberEvento((evento) => {
//       if (evento.tipo === 'preparacao') {
//         window.location.href = `/pages/sessao_preparacao.html?sala=${encodeURIComponent(sala)}&categoria=${encodeURIComponent(categoria)}`;
//       }
//     });
//   });
// });

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
    nome = payload.name || payload.nome || "Guest";
  } catch (erro) {
    console.error('Token inválido:', erro);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  const inputCodigo = document.getElementById('codigo');
  const botaoEntrar = document.querySelector('.login-button');

  botaoEntrar.addEventListener('click', () => {
    const sala = (inputCodigo.value || '').trim().toUpperCase();
    if (!sala) {
      alert('Informe o código da sala.');
      return;
    }

    // Categoria ainda NÃO é conhecida pelo guest
    conectarSocket(sala, nome, null);

    aoReceberEvento((evento) => {

      if (evento.tipo === 'preparacao') {
        console.log("Host iniciou a preparação", evento);

        // Agora SIM recebemos a categoria da API/sala
        const categoriaSala = evento.categoria;

        window.location.href =
          `/public/pages/sessao_preparacao.html?sala=${encodeURIComponent(sala)}&categoria=${encodeURIComponent(categoriaSala)}`;
      }
    });
  });
});

