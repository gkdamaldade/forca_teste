function gerarCodigoSala(tamanho = 6) {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < tamanho; i++) {
    codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  return codigo;
}

document.getElementById('btnCriar').addEventListener('click', () => {
  const categoria = document.getElementById('categoria').value;
  const sala = gerarCodigoSala();

  // Jogador 1 (host) vai para tela de espera
  window.location.href = `/pages/sessao_host.html?sala=${sala}&categoria=${categoria}`;
});

document.getElementById('btnEntrar').addEventListener('click', () => {
  const sala = document.getElementById('codigoSala').value.trim().toUpperCase();
  const categoria = document.getElementById('categoria').value;

  if (!sala) {
    alert('Digite o código da sala para entrar.');
    return;
  }

  // Jogador 2 (convidado) vai direto para tela de preparação
  window.location.href = `/pages/sessao_preparacao.html?sala=${sala}&categoria=${categoria}`;
});

