// public/src/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Encontre o formulário
    const formLogin = document.getElementById('form-login');
    const mensagemErro = document.getElementById('mensagem-erro'); // (Opcional)

    // A URL do seu backend
    const BACKEND_URL = 'https://upgraded-space-umbrella-pj7jgrj7g755h66q-3000.app.github.dev';

    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            // 2. Pega os valores
            const email = event.target.email.value;
            const password = event.target.password.value;
            
            console.log("Frontend: Enviando dados de login...");
            if (mensagemErro) mensagemErro.textContent = '';

            try {
                // 3. Faz o 'fetch' para o endpoint de login
                const response = await fetch(`${BACKEND_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const resultado = await response.json();

                if (!response.ok) { // Se for 401 ou 500
                    throw new Error(resultado.message);
                }
                
                // 4. SUCESSO!
                console.log("Login bem-sucedido:", resultado);
                
                // 5. ESTE É O PASSO MAIS IMPORTANTE:
                // Guarda o "passe" de login no navegador
                localStorage.setItem('token', resultado.token);
                // (Também podemos guardar os dados do usuário)
                localStorage.setItem('user', JSON.stringify(resultado.user));

                alert("Login realizado com sucesso! Bem-vindo!");
                window.location.href = 'menu.html'; // Redireciona para o menu principal

            } catch (error) {
                console.error("Falha no login:", error.message);
                if (mensagemErro) {
                    mensagemErro.textContent = error.message;
                } else {
                    alert(`Erro: ${error.message}`);
                }
            }
        });
    }
});
