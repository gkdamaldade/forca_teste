document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  let nomeUsuario = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    nomeUsuario = payload.nome;
  } catch (erro) {
    console.error('Token inválido:', erro);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  // Saudação
  const saudacao = document.createElement('p');
  saudacao.className = 'saudacao';
  saudacao.textContent = `Olá, ${nomeUsuario}!`;
  document.querySelector('.loja-container').prepend(saudacao);

  // Saldo inicial
  let saldo = 50;
  const saldoEl = document.querySelector('.saldo');
  saldoEl.textContent = `${saldo} Coins`;

  // Habilidades disponíveis
  const habilidades = [
    {
      nome: 'Dica Extra',
      descricao: 'Revela uma letra aleatória da palavra.',
      preco: 10,
      imagem: '../assets/images/poder_dica.png'
    },
    {
      nome: 'Tempo Extra',
      descricao: 'Adiciona 30 segundos ao tempo de jogo.',
      preco: 15,
      imagem: '../assets/images/poder_tempo.png'
    },
    {
      nome: 'Pular Palavra',
      descricao: 'Troca a palavra atual por uma nova.',
      preco: 20,
      imagem: '../assets/images/poder_pular.png'
    }
  ];

  let indiceAtual = 0;
  const nomeEl = document.querySelector('.habilidade-nome');
  const descEl = document.querySelector('.habilidade-desc');
  const precoEl = document.querySelector('.preco');
  const imagemEl = document.querySelector('.card-header img');
  const botaoComprar = document.querySelector('.btn-comprar');
  const indicadores = document.querySelectorAll('.dot');

  const adquiridos = new Set();

  function renderizarCard() {
    const habilidade = habilidades[indiceAtual];
    nomeEl.textContent = habilidade.nome;
    descEl.textContent = habilidade.descricao;
    precoEl.textContent = `Preço: ${habilidade.preco}`;
    imagemEl.src = habilidade.imagem;

    // Atualiza botão
    if (adquiridos.has(indiceAtual)) {
      botaoComprar.textContent = 'Adquirido';
      botaoComprar.disabled = true;
      botaoComprar.className = 'btn-adquirido';
    } else {
      botaoComprar.textContent = 'Comprar';
      botaoComprar.disabled = false;
      botaoComprar.className = 'btn-comprar';
    }

    // Atualiza indicadores
    indicadores.forEach((dot, i) => {
      dot.classList.toggle('active', i === indiceAtual);
    });
  }

  // Navegação
  document.querySelector('.arrow-btn.left').addEventListener('click', () => {
    indiceAtual = (indiceAtual - 1 + habilidades.length) % habilidades.length;
    renderizarCard();
  });

  document.querySelector('.arrow-btn.right').addEventListener('click', () => {
    indiceAtual = (indiceAtual + 1) % habilidades.length;
    renderizarCard();
  });

  // Compra
  botaoComprar.addEventListener('click', () => {
    const habilidade = habilidades[indiceAtual];
    if (saldo >= habilidade.preco) {
      saldo -= habilidade.preco;
      saldoEl.textContent = `${saldo} Coins`;
      adquiridos.add(indiceAtual);
      mostrarMensagem(`${habilidade.nome} adquirida com sucesso!`, 'sucesso');
      renderizarCard();
    } else {
      mostrarMensagem('Saldo insuficiente para comprar.', 'erro');
    }
  });

  // Mensagem no topo
  function mostrarMensagem(texto, tipo) {
    const msg = document.createElement('div');
    msg.textContent = texto;
    msg.className = `mensagem ${tipo}`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }

  renderizarCard();
});
