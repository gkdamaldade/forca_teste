document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  let nomeUsuario = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    nomeUsuario = payload.name || payload.nome || payload.username || '';
  } catch (erro) {
    console.error('Token inválido ou expirado:', erro);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  const cont = document.querySelector('.menu-container');
  if (cont) {
    const p = document.createElement('p');
    p.className = 'saudacao';
    p.textContent = `Olá, ${nomeUsuario}! Escolha uma categoria:`;
    cont.prepend(p);
  }

  const categorias = ['Animais','Frutas','Países','Esportes','Filmes','Profissões','Objetos','Cores'];

  const botoes = document.querySelectorAll('.grid-button');
  botoes.forEach((botao, i) => {
    if (!categorias[i]) return;
    let categoria = categorias[i];
    botao.textContent = categoria;

    botao.addEventListener('click', async () => {
      try {
        const resp = await fetch('/api/salas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Envie o token se a API exigir auth
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ categoria })
        });

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          throw new Error(data?.message || `Erro ${resp.status}`);
        }

        const params = new URLSearchParams({ sala: data.sala, categoria: data.categoria });
        window.location.href = `/public/pages/sessao_host.html?${params.toString()}`;
      } catch (e) {
        alert(`Falha ao criar sala: ${e.message}`);
      }
    });
  });
});
