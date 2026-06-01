        console.log("3. Script principal carregado! Iniciando sistema...");

        // --- CAPTURAR INFORMAÇÕES ---
        const modalLogin = document.getElementById('login-modal');
        const modalSenha = document.getElementById('senha-modal');
        const modalCadastro = document.getElementById('cadastro-modal');

        const inputTelefone = document.getElementById('telefone-login');
        const btnEntrar = document.getElementById('btn-entrar');

        const inputCadNome = document.getElementById('cad-nome');
        const inputCadTelefone = document.getElementById('cad-telefone');
        const inputCadEmail = document.getElementById('cad-email');
        const inputCadSenha = document.getElementById('cad-senha');
        const inputCadConfirmaSenha = document.getElementById('cad-confirma-senha');
        const btnCadastrar = document.getElementById('btn-cadastrar');

        // --- LÓGICA DE LOGIN DO BARBEIRO (ATUALIZADA) ---
        const btnEntrarBarbeiro = document.getElementById('btn-entrar-barbeiro');
        const inputLoginBarbeiro = document.getElementById('login-barbeiro');
        const inputSenhaBarbeiro = document.getElementById('senha-barbeiro');

        if (btnEntrarBarbeiro) {
            btnEntrarBarbeiro.addEventListener('click', async () => {
                const loginValue = inputLoginBarbeiro.value.trim();
                const senhaValue = inputSenhaBarbeiro.value;

                if (!loginValue || !senhaValue) {
                    mostrarToast("Preencha o login e a senha.", "aviso");
                    return;
                }

                const btnOriginalText = btnEntrarBarbeiro.innerHTML;
                btnEntrarBarbeiro.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando...';
                btnEntrarBarbeiro.disabled = true;

                try {
                    // Consulta a tabela "barbeiro" buscando pela coluna "login"
                    const { data, error } = await window.supabaseClient
                        .from('barbeiro')
                        .select('nome')
                        .eq('login', loginValue)
                        .eq('senha', senhaValue)
                        .single();

                    if (error || !data) {
                        mostrarToast("Acesso negado. Credenciais inválidas.", "aviso");
                    } else {
                        // Login bem-sucedido! Redireciona direto para a nova página
                        window.location.href = 'gestao.html';
                    }
                } catch (err) {
                    console.error("Erro fatal no login de barbeiro:", err);
                } finally {
                    btnEntrarBarbeiro.innerHTML = btnOriginalText;
                    btnEntrarBarbeiro.disabled = false;
                }
            });
        }

        // Função para sair da tela de gestão (Atualizada)
        window.sairBarbearia = function() {
            document.getElementById('tela-barbearia').style.display = 'none';
            if (inputLoginBarbeiro) inputLoginBarbeiro.value = '';
            if (inputSenhaBarbeiro) inputSenhaBarbeiro.value = '';
            document.getElementById('selecao-perfil-modal').style.display = 'flex';
        }
        
        // --- MÁSCARA PARA O TELEFONE ---
        if (inputTelefone) {
            inputTelefone.addEventListener('input', function (e) {
                let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            });
        }

        // --- FUNÇÕES DE NAVEGAÇÃO ---
        function voltarParaLogin() {
            if (modalSenha) modalSenha.style.display = 'none';
            if (modalCadastro) modalCadastro.style.display = 'none';
            if (modalLogin) modalLogin.style.display = 'flex';
        }

        // --- LÓGICA DO BOTÃO DE ENTRAR ---
        if (btnEntrar) {
            window.fazerLoginCliente = async function() {
                const inputTelefone = document.getElementById('telefone-login');
                const btnEntrar = document.getElementById('btn-entrar');
                
                if (!inputTelefone || inputTelefone.value.trim() === '') {
                    if (typeof mostrarToast === "function") mostrarToast('Por favor, digite seu número de celular.', 'aviso');
                    else alert('Por favor, digite seu número de celular.');
                    return;
                }

                const telefone = inputTelefone.value.trim();
                const textoOriginal = btnEntrar.innerHTML;
                
                btnEntrar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';
                btnEntrar.disabled = true;

                try {
                    // Apenas verifica se o cliente existe
                    const { data, error } = await window.supabaseClient
                        .from('clientes')
                        .select('nome')
                        .eq('celular', telefone)
                        .single();

                    if (error || !data) {
                        // NÚMERO NÃO ENCONTRADO: Redirecionar para a tela de cadastro
                        console.log("Usuário não encontrado. Redirecionando para cadastro...");
                        
                        // Opcional: Mostra um aviso amigável
                        if (typeof mostrarToast === "function") {
                            mostrarToast('Cadastro não encontrado. Vamos criar um!', 'aviso');
                        }
                        
                        // 1. Esconde a tela atual de login
                        document.getElementById('login-modal').style.display = 'none';
                        
                        // 2. Preenche o campo de telefone na tela de cadastro com o número digitado (pois é readonly)
                        const inputCadTelefone = document.getElementById('cad-telefone');
                        if (inputCadTelefone) {
                            inputCadTelefone.value = telefone;
                        }
                        
                        // 3. Abre a tela de cadastro
                        const modalCadastro = document.getElementById('cadastro-modal');
                        if (modalCadastro) {
                            modalCadastro.style.display = 'flex';
                        }
                    } else {
                        // SUCESSO: O usuário existe! 
                        // Esconde a tela do telefone e ABRE A TELA DE SENHA
                        console.log("Usuário encontrado! Abrindo tela de senha...");
                        document.getElementById('login-modal').style.display = 'none';
                        const modalSenha = document.getElementById('senha-modal');
                        if (modalSenha) modalSenha.style.display = 'flex';
                    }
                } catch (err) {
                    console.error("Erro fatal no login:", err);
                } finally {
                    btnEntrar.innerHTML = textoOriginal;
                    btnEntrar.disabled = false;
                }
            };
        }

        // --- LÓGICA DO BOTÃO DE CADASTRAR ---
        if (btnCadastrar) {
            btnCadastrar.addEventListener('click', async () => {
                console.log("Botão Cadastrar clicado!");
                const nome = inputCadNome.value.trim();
                const celular = inputCadTelefone.value;
                const email = inputCadEmail.value.trim();
                const senha = inputCadSenha.value;
                const confirmaSenha = inputCadConfirmaSenha.value;

                if (!nome || !senha || !confirmaSenha) {
                    alert("Por favor, preencha todos os campos obrigatórios (*).");
                    return;
                }
                if (senha !== confirmaSenha) {
                    alert("As senhas não coincidem!");
                    return;
                }

                const btnOriginalText = btnCadastrar.innerHTML;
                btnCadastrar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
                btnCadastrar.disabled = true;

                try {
                    const { data, error } = await window.supabaseClient
                        .from('clientes')
                        .insert([{ nome: nome, celular: celular, email: email || null, senha: senha }]);

                    if (error) {
                        console.error("Erro ao cadastrar:", error);
                        alert("Erro ao cadastrar: " + error.message);
                    } else {
                        alert("Cadastro realizado com sucesso!");
                        
                        // SALVA OS DADOS NA MEMÓRIA DO NAVEGADOR
                        localStorage.setItem('userNome', nome);
                        localStorage.setItem('userTelefone', celular);
                        
                        modalCadastro.style.display = 'none';
                        modalLogin.style.display = 'none';
                    }
                } catch (err) {
                    console.error("Erro fatal no cadastro:", err);
                } finally {
                    btnCadastrar.innerHTML = btnOriginalText;
                    btnCadastrar.disabled = false;
                }
            });
        }

        // --- LÓGICA DO BOTÃO DE ACESSAR (SENHA) ---
        const btnEntrarSenha = document.getElementById('btn-entrar-senha');
        const inputSenhaLogin = document.getElementById('senha-login');

        if (btnEntrarSenha) {
            btnEntrarSenha.addEventListener('click', async () => {
                const senhaValue = inputSenhaLogin.value;
                const telefoneValue = inputTelefone.value; // Puxa o celular que já foi digitado na primeira tela

                if (!senhaValue) {
                    alert("Por favor, digite sua senha.");
                    return;
                }

                const btnOriginalText = btnEntrarSenha.innerHTML;
                btnEntrarSenha.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';
                btnEntrarSenha.disabled = true;

                try {
                    const { data, error } = await window.supabaseClient
                        .from('clientes')
                        .select('nome')
                        .eq('celular', telefoneValue)
                        .eq('senha', senhaValue)
                        .single(); 

                    if (error && error.code === 'PGRST116') {
                        alert("Senha incorreta. Tente novamente.");
                        } else if (data) {
                   // Senha correta
                    console.log(`Login efetuado com sucesso! Bem-vindo(a), ${data.nome}`);
                    
                    // ESSAS DUAS LINHAS PRECISAM ESTAR AQUI:
                    localStorage.setItem('userNome', data.nome);
                    localStorage.setItem('userTelefone', telefoneValue);
                    
                    // Fecha o modal de senha
                    modalSenha.style.display = 'none';
                    
                    // Muda o botão principal e injeta os dados no dropdown
                    const btnToggle = document.getElementById('btn-toggle-dropdown');
                    if (btnToggle) {
                        const primeiroNome = data.nome.split(' ')[0];
                        btnToggle.innerHTML = `<i class="fa-solid fa-user-check"></i> Olá, ${primeiroNome}`;
                        
                        // Preenche o menu suspenso com os dados do banco
                        document.getElementById('dropdown-nome').innerText = data.nome;
                        document.getElementById('dropdown-telefone').innerText = telefoneValue;
                    }
                } else if (error) {
                        console.error("Erro no banco de dados:", error);
                    }
                } catch (err) {
                    console.error("Erro fatal na requisição de login:", err);
                } finally {
                    // Restaura o visual do botão
                    btnEntrarSenha.innerHTML = btnOriginalText;
                    btnEntrarSenha.disabled = false;
                }
            });
        }

         // --- LÓGICA DO MENU DROPDOWN E BOTÃO ENTRAR NAVBAR ---
        document.addEventListener('click', function(event) {
            const btnToggle = document.getElementById('btn-toggle-dropdown');
            const dropdown = document.getElementById('dropdown-menu');
            
            // Verifica se o clique foi no botão "Entrar / Registrar" (ou no nome logado)
            if (event.target.closest('#btn-toggle-dropdown')) {
                
                // Se estiver logado (tem "Olá"), abre/fecha o menu suspenso
                if (btnToggle.innerHTML.includes('Olá')) {
                    dropdown.classList.toggle('show');
                } 
                // Se NÃO estiver logado, abre a tela preta de Login
                else {
                    modalLogin.style.display = 'flex';
                }
            } 
            // Se o clique foi em qualquer outro lugar da tela, fecha o menu suspenso
            else if (dropdown && !event.target.closest('.dropdown-content')) {
                dropdown.classList.remove('show');
            }
        });

        // Lógica para sair da conta
        const btnSair = document.getElementById('btn-sair');
        if (btnSair) {
            btnSair.addEventListener('click', (e) => {
                e.preventDefault(); 
                
                // 1. Guarda o visual original e aplica o efeito de carregamento
                const textoOriginal = btnSair.innerHTML;
                btnSair.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saindo...';
                btnSair.style.pointerEvents = 'none'; // Trava o botão para evitar duplo clique
                
                // 2. Simula o tempo de 1.5 segundos
                setTimeout(() => {
                    const btnToggle = document.getElementById('btn-toggle-dropdown');
                    const dropdown = document.getElementById('dropdown-menu');
                    
                    // Reseta o visual do botão principal
                    if (btnToggle) btnToggle.innerHTML = 'Entrar / Registrar'; 
                    if (dropdown) dropdown.classList.remove('show'); 
                    
                    // Limpa os dados preenchidos nos inputs de login
                    const inputTel = document.getElementById('telefone-login');
                    const inputSenha = document.getElementById('senha-login');
                    if(inputTel) inputTel.value = '';
                    if(inputSenha) inputSenha.value = '';
                    
                    // APAGA A MEMÓRIA DO NAVEGADOR
                    localStorage.removeItem('userNome');
                    localStorage.removeItem('userTelefone');
                    localStorage.removeItem('agendNome');
                    localStorage.removeItem('agendTelefone');
                    
                    // Restaura o visual original do botão "Sair" para o próximo login
                    btnSair.innerHTML = textoOriginal;
                    btnSair.style.pointerEvents = 'auto';

                    console.log("Usuário deslogado.");
                    
                    // Mostra um aviso amigável que a conta foi desconectada
                    if (typeof mostrarToast === 'function') {
                        mostrarToast('Você saiu da sua conta com sucesso.');
                    }

                }, 1500); // 1500ms = 1.5 segundos
            });
        }

        // --- PERMITIR "ENTER" NO LOGIN DE GESTÃO (BARBEIRO) ---
        const inputLoginGestao = document.getElementById('login-barbeiro');
        const inputSenhaGestao = document.getElementById('senha-barbeiro');
        const btnAcessarGestao = document.getElementById('btn-entrar-barbeiro');

        if (btnAcessarGestao) {
            // Se apertar Enter enquanto digita o Login
            if (inputLoginGestao) {
                inputLoginGestao.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter' || event.keyCode === 13) {
                        event.preventDefault();
                        console.log("Enter detetado no Login de Gestão!");
                        btnAcessarGestao.click();
                    }
                });
            }
            
            // Se apertar Enter enquanto digita a Senha
            if (inputSenhaGestao) {
                inputSenhaGestao.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter' || event.keyCode === 13) {
                        event.preventDefault();
                        console.log("Enter detetado na Senha de Gestão!");
                        btnAcessarGestao.click();
                    }
                });
            }
        }

       // --- PERMITIR "ENTER" PARA AVANÇAR NOS MODAIS ---
        // Enter no campo de Telefone (Tela 1)
        if (inputTelefone && btnEntrar) {
            inputTelefone.addEventListener('keydown', function(event) {
                // Verifica se a tecla pressionada foi o Enter (código 13)
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault(); // Evita recarregar a página
                    console.log("Enter detetado no Telefone!"); // Aviso para o nosso teste (F12)
                    btnEntrar.click(); // Dispara o botão
                }
            });
        }

        // Enter no campo de Senha (Tela 2)
        // Como o inputSenhaLogin não foi declarado lá no topo com os outros, declaramos aqui:
        const inputSenhaLoginEnter = document.getElementById('senha-login');
        const btnEntrarSenhaEnter = document.getElementById('btn-entrar-senha');

        if (inputSenhaLoginEnter && btnEntrarSenhaEnter) {
            inputSenhaLoginEnter.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault(); 
                    console.log("Enter detetado na Senha!");
                    btnEntrarSenhaEnter.click(); 
                }
            });
        }

        // Enter no último campo de Cadastro (Confirmação de Senha)
        if (inputCadConfirmaSenha && btnCadastrar) {
            inputCadConfirmaSenha.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    console.log("Enter detetado no Cadastro!");
                    btnCadastrar.click(); 
                }
            });
        }

        // ==========================================
        // VERIFICAÇÃO AUTOMÁTICA DE SESSÃO AO CARREGAR A PÁGINA INICIAL
        // ==========================================
        document.addEventListener('DOMContentLoaded', () => {
            // Busca se existe algum usuário salvo na memória do navegador
            const nomeSalvo = localStorage.getItem('userNome');
            const telefoneSalvo = localStorage.getItem('userTelefone');
            
            // Captura os elementos da tela
            const modalSelecao = document.getElementById('selecao-perfil-modal');
            const btnToggle = document.getElementById('btn-toggle-dropdown');
            const dropNome = document.getElementById('dropdown-nome');
            const dropTel = document.getElementById('dropdown-telefone');
            
            // Se encontrou nome e telefone na memória, significa que já está logado!
            if (nomeSalvo && telefoneSalvo) {
                
                // 1. Esconde a tela inicial de "Sou Cliente / Sou Barbeiro"
                if (modalSelecao) {
                    modalSelecao.style.display = 'none';
                }
                
                // 2. Muda o botão da barra superior de "Entrar" para "Olá, Nome"
                if (btnToggle) {
                    const primeiroNome = nomeSalvo.split(' ')[0];
                    btnToggle.innerHTML = `<i class="fa-solid fa-user-check"></i> Olá, ${primeiroNome}`;
                }
                
                // 3. Injeta os dados corretos no menu suspenso do usuário
                if (dropNome) dropNome.innerText = nomeSalvo;
                if (dropTel) dropTel.innerText = telefoneSalvo;
                
                console.log(`Sessão restaurada automaticamente para: ${nomeSalvo}`);
            }
        });