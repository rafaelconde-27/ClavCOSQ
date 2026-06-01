        // --- LÓGICA DO MODAL DE PERFIL ---
        const modalPerfil = document.getElementById('perfil-modal');
        const btnAbrirPerfil = document.getElementById('btn-abrir-perfil');
        const btnSalvarPerfil = document.getElementById('btn-salvar-perfil');
        
        const inputPerfilNome = document.getElementById('perfil-nome');
        const inputPerfilTelefone = document.getElementById('perfil-telefone');
        const inputPerfilEmail = document.getElementById('perfil-email');

        // Função global para fechar no botão "voltar"
        window.fecharPerfil = function() {
            if (modalPerfil) modalPerfil.style.display = 'none';
        }

        // Abrir perfil e buscar dados
        if (btnAbrirPerfil) {
            btnAbrirPerfil.addEventListener('click', async (e) => {
                e.preventDefault(); // Evita que a página role para o topo
                
                // Fecha o menu dropdown ao clicar
                document.getElementById('dropdown-menu').classList.remove('show');
                
                // Puxamos o telefone do usuário logado que está visível no menu
                const telefoneLogado = document.getElementById('dropdown-telefone').innerText;
                
               if (!telefoneLogado || telefoneLogado === "(11) 90000-0000") {
                    mostrarToast("Faça login antes de assinar um plano.", 'aviso');
                    return;
                }

                // Mostra o modal com aviso de carregamento
                modalPerfil.style.display = 'flex';
                inputPerfilNome.value = 'Carregando...';
                inputPerfilEmail.value = 'Carregando...';
                inputPerfilTelefone.value = telefoneLogado;

                try {
                    // Busca nome e email atualizados do banco
                    const { data, error } = await window.supabaseClient
                        .from('clientes')
                        .select('nome, email')
                        .eq('celular', telefoneLogado)
                        .single();

                    if (data) {
                        inputPerfilNome.value = data.nome || '';
                        inputPerfilEmail.value = data.email || '';
                    } else if (error) {
                        console.error("Erro ao carregar perfil:", error);
                        alert("Não foi possível carregar os dados.");
                        fecharPerfil();
                    }
                } catch (err) {
                    console.error("Erro requisição perfil:", err);
                }
            });
        }

        // Salvar as alterações feitas
        if (btnSalvarPerfil) {
            btnSalvarPerfil.addEventListener('click', async () => {
                const novoNome = inputPerfilNome.value.trim();
                const novoEmail = inputPerfilEmail.value.trim();
                const telefoneLogado = inputPerfilTelefone.value; // Usado como nossa chave 'Where'

                if (!novoNome) {
                    alert("O nome não pode ficar vazio.");
                    return;
                }

                // Efeito visual de carregamento no botão
                const btnOriginalText = btnSalvarPerfil.innerHTML;
                btnSalvarPerfil.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
                btnSalvarPerfil.disabled = true;

                try {
                    // Dispara o UPDATE no Supabase
                    const { error } = await window.supabaseClient
                        .from('clientes')
                        .update({ nome: novoNome, email: novoEmail })
                        .eq('celular', telefoneLogado);

                    if (error) {
                        console.error("Erro ao atualizar:", error);
                        alert("Erro ao atualizar o perfil: " + error.message);
                    } else {
                        alert("Perfil atualizado com sucesso!");
                        
                        // Atualiza visualmente o nome no botão e no menu instantaneamente
                        const btnToggle = document.getElementById('btn-toggle-dropdown');
                        const primeiroNome = novoNome.split(' ')[0];
                        btnToggle.innerHTML = `<i class="fa-solid fa-user-check"></i> Olá, ${primeiroNome}`;
                        document.getElementById('dropdown-nome').innerText = novoNome;
                        
                        fecharPerfil(); // Fecha a tela após salvar
                    }
                } catch (err) {
                    console.error("Erro fatal na atualização:", err);
                } finally {
                    // Retorna o botão ao normal
                    btnSalvarPerfil.innerHTML = btnOriginalText;
                    btnSalvarPerfil.disabled = false;
                }
            });
        }

        // --- LÓGICA DO MODAL DE ASSINATURAS (MENU SUSPENSO) ---
        const modalAssinaturas = document.getElementById('assinaturas-modal');
        const btnAbrirAssinaturas = document.getElementById('btn-abrir-assinaturas');
        const containerAssinaturas = document.getElementById('lista-assinaturas-modal');

        window.fecharAssinaturas = function() {
            if (modalAssinaturas) modalAssinaturas.style.display = 'none';
        }

        if (btnAbrirAssinaturas) {
            btnAbrirAssinaturas.addEventListener('click', async (e) => {
                e.preventDefault(); 
                
                // Pega o telefone do usuário logado
                const telefoneLogado = document.getElementById('dropdown-telefone').innerText;
                
                if (!telefoneLogado || telefoneLogado === "(11) 90000-0000") {
                    alert("Você precisa estar logado para acessar os planos.");
                    return;
                }

                // 1. Fecha o menu dropdown
                document.getElementById('dropdown-menu').classList.remove('show');
                
                // 2. Abre a tela e mostra avisos de carregamento
                modalAssinaturas.style.display = 'flex';
                document.getElementById('status-meu-plano').innerText = 'Carregando...';
                document.getElementById('status-meu-plano').style.color = 'var(--gold)';
                containerAssinaturas.innerHTML = '<p style="text-align: center; margin-top: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando planos...</p>';

                try {
                    // --- PARTE 1: BUSCA O PLANO ATUAL DO CLIENTE LOGADO ---
                    const { data: dadosCliente, error: erroCliente } = await window.supabaseClient
                        .from('clientes')
                        .select('plano')
                        .eq('celular', telefoneLogado)
                        .single();

                    if (!erroCliente && dadosCliente) {
                        // Verifica se tem plano ou se está nulo/vazio
                        if (dadosCliente.plano) {
                            document.getElementById('status-meu-plano').innerText = dadosCliente.plano;
                            document.getElementById('status-meu-plano').style.color = 'var(--gold)';
                        } else {
                            document.getElementById('status-meu-plano').innerText = 'Nenhum plano assinado';
                            document.getElementById('status-meu-plano').style.color = 'var(--text-muted)';
                        }
                    } else {
                        document.getElementById('status-meu-plano').innerText = 'Erro ao verificar';
                        document.getElementById('status-meu-plano').style.color = '#ff4d4d';
                    }

                    // --- PARTE 2: BUSCA E LISTA OS PLANOS DISPONÍVEIS ---
                    const { data: planos, error: erroPlanos } = await window.supabaseClient
                        .from('assinaturas')
                        .select('*')
                        .order('preco', { ascending: true }); 

                    if (erroPlanos) {
                        console.error("Erro ao buscar assinaturas:", erroPlanos);
                        containerAssinaturas.innerHTML = '<p style="color: #ff4d4d; text-align: center;">Erro ao carregar os planos.</p>';
                        return;
                    }

                    if (planos && planos.length > 0) {
                        containerAssinaturas.innerHTML = ''; // Limpa o "Carregando..."
                        
                        planos.forEach(plano => {
                            const beneficiosHTML = plano.beneficios.map(beneficio => 
                                `<li style="font-size: 0.85rem; color: var(--text-light); padding: 4px 0;">
                                    <i class="fa-solid fa-check" style="color: var(--gold); margin-right: 8px;"></i> ${beneficio}
                                </li>`
                            ).join('');

                            const ehDestaque = plano.destaque;
                            const bordaCard = ehDestaque ? 'border: 2px solid var(--gold);' : 'border: 1px solid var(--border-color);';
                            const badge = ehDestaque ? `<div style="background: var(--gold); color: #000; font-size: 0.7rem; font-weight: bold; text-align: center; padding: 4px; border-radius: 4px; margin-bottom: 15px;">MAIS POPULAR</div>` : '';
                            const btnEstilo = ehDestaque ? 'background: var(--gold); color: #000; border: none;' : 'background: transparent; border: 1px solid var(--text-muted); color: var(--text-light);';
                            
                            // Formata o preço com vírgula
                            const precoFormatado = Number(plano.preco).toFixed(2).replace('.', ',');

                            const cardHTML = `
                                <div style="background-color: #151515; padding: 20px; border-radius: 10px; ${bordaCard}">
                                    ${badge}
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                        <h3 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 1.4rem; color: ${ehDestaque ? '#fff' : 'var(--gold)'};">${plano.nome}</h3>
                                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--gold);">
                                            R$ ${precoFormatado.split(',')[0]}<span style="font-size: 0.8rem; color: var(--text-muted);">/mês</span>
                                        </div>
                                    </div>
                                    <ul style="list-style: none; padding: 0; margin-bottom: 20px;">
                                        ${beneficiosHTML}
                                    </ul>
                                    <button onclick="abrirPagamento('${plano.nome}', '${precoFormatado}')" class="btn-outline" style="width: 100%; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: 0.3s; ${btnEstilo}">
                                        Assinar ${plano.nome}
                                    </button>
                                </div>
                            `;
                            
                            containerAssinaturas.innerHTML += cardHTML;
                        });
                    } else {
                        containerAssinaturas.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhum plano disponível no momento.</p>';
                    }

                } catch (err) {
                    console.error("Erro fatal na listagem de assinaturas:", err);
                    containerAssinaturas.innerHTML = '<p style="color: #ff4d4d; text-align: center;">Erro inesperado ao conectar com o servidor.</p>';
                }
            });
        }

        // --- LÓGICA DO PAGAMENTO SANDBOX ---
        const modalPagamento = document.getElementById('pagamento-modal');
        const btnConfirmarPagamento = document.getElementById('btn-confirmar-pagamento');
        let planoSelecionadoGlobal = ''; // Guarda qual plano o usuário clicou

        window.fecharPagamento = function() {
            if (modalPagamento) modalPagamento.style.display = 'none';
        }

        // Função chamada quando clica no botão "Assinar"
        window.abrirPagamento = async function(nomePlano, precoPlano) {
            // 1. Verifica se o usuário está logado
            const telefoneLogado = document.getElementById('dropdown-telefone').innerText;
            if (!telefoneLogado || telefoneLogado === "(11) 90000-0000") {
                alert("Você precisa entrar na sua conta antes de assinar um plano!");
                fecharAssinaturas();
                document.getElementById('login-modal').style.display = 'flex';
                return;
            }

            // 2. NOVA TRAVA: Verifica no banco se ele já tem ESSE plano exato
            try {
                const { data, error } = await window.supabaseClient
                    .from('clientes')
                    .select('plano')
                    .eq('celular', telefoneLogado)
                    .single();

                if (data && data.plano === nomePlano) {
                    // Usamos o 'aviso' no final para ele ficar laranja
                    mostrarToast(`Você já possui o plano ${nomePlano} ativo!`, 'aviso');
                    return; 
                }
            } catch (err) {
                console.error("Erro ao verificar o plano atual na trava de segurança:", err);
            }

            // 3. Se passou pela trava (não tem o plano ou tem um diferente), prepara a tela de pagamento
            planoSelecionadoGlobal = nomePlano;
            document.getElementById('pagamento-plano-nome').innerText = `Plano ${nomePlano}`;
            document.getElementById('pagamento-valor').innerText = `R$ ${precoPlano}`;

            // Troca as telas
            fecharAssinaturas();
            modalPagamento.style.display = 'flex';
        }

        // Ação do botão "Confirmar Assinatura"
        if (btnConfirmarPagamento) {
            btnConfirmarPagamento.addEventListener('click', async () => {
                const telefoneLogado = document.getElementById('dropdown-telefone').innerText;
                
                // Simulação visual de processamento
                const btnOriginalText = btnConfirmarPagamento.innerHTML;
                btnConfirmarPagamento.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando Pagamento...';
                btnConfirmarPagamento.disabled = true;

                // Simula um delay de 2 segundos (como se estivesse comunicando com o banco/cartão)
                setTimeout(async () => {
                    try {
                        // Atualiza a coluna 'plano' do cliente logado no Supabase
                        const { error } = await window.supabaseClient
                            .from('clientes')
                            .update({ plano: planoSelecionadoGlobal })
                            .eq('celular', telefoneLogado);

                        if (error) {
                            console.error("Erro ao vincular plano:", error);
                            alert("Erro ao processar a assinatura: " + error.message);
                        } else {
                            alert(`Pagamento aprovado! Você agora é um assinante do plano ${planoSelecionadoGlobal}.`);
                            fecharPagamento();
                        }
                    } catch (err) {
                        console.error("Erro fatal no pagamento:", err);
                    } finally {
                        // Restaura o botão
                        btnConfirmarPagamento.innerHTML = btnOriginalText;
                        btnConfirmarPagamento.disabled = false;
                    }
                }, 2000); // 2000 milissegundos = 2 segundos de simulação
            });
        }

        // --- CARREGAR PLANOS NA PÁGINA INICIAL DINAMICAMENTE ---
        async function carregarPlanosHome() {
            const gridPlanosHome = document.getElementById('grid-planos-home');
            
            if (!gridPlanosHome) return;

            gridPlanosHome.innerHTML = '<p style="text-align: center; grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando planos de assinatura...</p>';

            try {
                const { data: planos, error } = await window.supabaseClient
                    .from('assinaturas')
                    .select('*')
                    .order('preco', { ascending: true });

                if (error) {
                    console.error("Erro ao buscar planos da home:", error);
                    gridPlanosHome.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #ff4d4d;">Não foi possível carregar os planos no momento.</p>';
                    return;
                }

                if (planos && planos.length > 0) {
                    gridPlanosHome.innerHTML = ''; 

                    planos.forEach(plano => {
                        const listaBeneficiosHTML = plano.beneficios.map(beneficio => 
                            `<li><i class="fa-solid fa-check"></i> ${beneficio}</li>`
                        ).join('');

                        const precoFormatado = Number(plano.preco).toFixed(2).replace('.', ',');

                        // ESTAS SÃO AS VARIÁVEIS QUE ESTAVAM FALTANDO:
                        const classeCard = plano.destaque ? 'plano-card plano-ouro' : 'plano-card';
                        const ribbonDestaque = plano.destaque ? '<div class="ribbon">MAIS POPULAR</div>' : '';
                        const estiloTitulo = plano.destaque ? 'style="font-size: 1.8rem; color: #fff;"' : 'style="font-size: 1.8rem;"';

                        const cardHTML = `
                            <div class="${classeCard}">
                                ${ribbonDestaque}
                                <h3 class="serif" ${estiloTitulo}>${plano.nome}</h3>
                                <div class="plano-preco">R$ ${precoFormatado.split(',')[0]}<span>/mês</span></div>
                                <ul class="plano-lista">
                                    ${listaBeneficiosHTML}
                                </ul>
                                <button class="btn-outline" onclick="abrirPagamento('${plano.nome}', '${precoFormatado}')">Assinar</button>
                            </div>
                        `;

                        gridPlanosHome.innerHTML += cardHTML;
                    });
                } else {
                    gridPlanosHome.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum plano disponível no momento.</p>';
                }

            } catch (err) {
                console.error("Erro fatal ao renderizar planos da home:", err);
                gridPlanosHome.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #ff4d4d;">Erro de conexão com o servidor.</p>';
            }
        }

        // Executa a função
        carregarPlanosHome();

        // --- SISTEMA DE NOTIFICAÇÃO ELEGANTE (TOAST) ---
        window.mostrarToast = function(mensagem, tipo = 'padrao') {
            const container = document.getElementById('toast-container');
            if (!container) return;

            // Cria o elemento html da notificação
            const toast = document.createElement('div');
            toast.className = `toast ${tipo === 'aviso' ? 'toast-warning' : ''}`;
            
            // Define o ícone de acordo com o tipo
            const icone = tipo === 'aviso' ? '<i class="fa-solid fa-triangle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';

            toast.innerHTML = `${icone} <span>${mensagem}</span>`;
            
            // Adiciona na tela
            container.appendChild(toast);

            // Animação de entrada (desliza para dentro)
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            // Animação de saída (desliza para fora e remove o html) após 3.5 segundos
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 400); 
            }, 3500);
        }

        // --- NAVEGAÇÃO DA TELA DE SELEÇÃO DE PERFIL ---
        const modalSelecaoPerfil = document.getElementById('selecao-perfil-modal');
        const modalLoginBarbeiro = document.getElementById('login-barbeiro-modal');
        const btnSouCliente = document.getElementById('btn-sou-cliente');
        const btnSouBarbeiro = document.getElementById('btn-sou-barbeiro');
        const telaBarbearia = document.getElementById('tela-barbearia');
        
        // Função global para voltar para a seleção (Botões de Voltar)
        window.voltarParaSelecao = function() {
            console.log("Voltando para a tela inicial...");
            
            // Busca os elementos na hora, assim nunca dá erro de "not defined"
            const telaLoginCliente = document.getElementById('login-modal');
            const telaLoginBarbeiro = document.getElementById('login-barbeiro-modal');
            const telaSelecao = document.getElementById('selecao-perfil-modal');

            // Esconde as telas de login (se elas existirem na tela)
            if (telaLoginCliente) telaLoginCliente.style.display = 'none';
            if (telaLoginBarbeiro) telaLoginBarbeiro.style.display = 'none';
            
            // Mostra a tela de seleção novamente
            if (telaSelecao) telaSelecao.style.display = 'flex';
        }

        // --- FUNÇÕES VINCULADAS DIRETAMENTE AOS BOTÕES DO HTML ---
        // --- FUNÇÃO PARA ABRIR O ACESSO DE CLIENTES ---
        window.abrirLoginCliente = function() {
            const modalSelecao = document.getElementById('selecao-perfil-modal');
            const modalLoginTelefone = document.getElementById('login-modal'); // Esta é a tela do telefone

            // Esconde a tela de seleção Guapo x COSQ
            if (modalSelecao) {
                modalSelecao.style.display = 'none';
            }

            // Mostra a tela de login pedindo o celular
            if (modalLoginTelefone) {
                modalLoginTelefone.style.display = 'flex';
            }
            
            console.log("Navegando para a tela de clientes (Tabela: clientes)...");
        }

        window.abrirLoginBarbeiro = function() {
            console.log("Abrindo tela de Barbeiro...");
            document.getElementById('selecao-perfil-modal').style.display = 'none';
            document.getElementById('login-barbeiro-modal').style.display = 'flex';
        }

      // --- CONTROLE DE TROCA DE TELAS (BLINDADO) ---
        document.addEventListener('DOMContentLoaded', () => {
            const btnCliente = document.getElementById('btn-sou-cliente');
            const btnBarbeiro = document.getElementById('btn-sou-barbeiro');
            
            // Troca para tela de Cliente
            if (btnCliente) {
                btnCliente.addEventListener('click', (e) => {
                    e.preventDefault(); // Impede qualquer comportamento indesejado do botão
                    document.getElementById('selecao-perfil-modal').style.display = 'none';
                    document.getElementById('login-modal').style.display = 'flex';
                });
            }
            
            // Troca para tela de Barbeiro
            if (btnBarbeiro) {
                btnBarbeiro.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('selecao-perfil-modal').style.display = 'none';
                    document.getElementById('login-barbeiro-modal').style.display = 'flex';
                });
            }
        });

        // --- LÓGICA DO BOTÃO "QUERO AGENDAR" ---
        window.iniciarAgendamento = function() {
            const telefoneTela = document.getElementById('dropdown-telefone').innerText;

            // 1. Trava de segurança: Se não estiver logado, pede para fazer login
            if (!telefoneTela || telefoneTela === "(11) 90000-0000") {
                mostrarToast("Por favor, faça login ou cadastre-se antes de agendar.", "aviso");
                document.getElementById('login-modal').style.display = 'flex';
                return;
            }

            // 2. Pega o nome completo e fatia para pegar só o PRIMEIRO NOME
            const nomeCompleto = document.getElementById('dropdown-nome').innerText;
            const primeiroNome = nomeCompleto.split(' ')[0]; 

            // 3. Salva na memória do navegador de forma forçada
            localStorage.setItem('agendNome', primeiroNome);
            localStorage.setItem('agendTelefone', telefoneTela);

            // 4. Redireciona para a página
            window.location.href = 'agendamento.html';
        }

        // ==========================================
        // LÓGICA DO MODAL DE MEUS AGENDAMENTOS
        // ==========================================
        const modalMeusAgendamentos = document.getElementById('meus-agendamentos-modal');
        const btnAbrirMeusAgendamentos = document.getElementById('btn-abrir-meus-agendamentos');
        const listaMeusAgendamentos = document.getElementById('lista-meus-agendamentos');
        const tabFuturos = document.getElementById('tab-futuros');
        const tabPassados = document.getElementById('tab-passados');

        let agendamentosCliente = []; // Guarda a lista vinda do banco

        // Função global para fechar o modal
        window.fecharMeusAgendamentos = function() {
            if (modalMeusAgendamentos) modalMeusAgendamentos.style.display = 'none';
        }

        // Evento de abrir e buscar os dados
        if (btnAbrirMeusAgendamentos) {
            btnAbrirMeusAgendamentos.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const telefoneLogado = document.getElementById('dropdown-telefone').innerText;
                
                if (!telefoneLogado || telefoneLogado === "(11) 90000-0000") {
                    mostrarToast("Você precisa estar logado para ver seus agendamentos.", "aviso");
                    document.getElementById('login-modal').style.display = 'flex';
                    return;
                }

                // 1. Fecha o menu dropdown e abre o modal novo
                document.getElementById('dropdown-menu').classList.remove('show');
                modalMeusAgendamentos.style.display = 'flex';
                listaMeusAgendamentos.innerHTML = '<p style="text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Buscando seus horários...</p>';

                // Força a aba "Próximos" a ficar ativa visualmente ao abrir
                mudarAbaAgendamentos('futuros');

                try {
                    // 2. Busca todos os agendamentos desse cliente no Supabase
                    const { data, error } = await window.supabaseClient
                        .from('agendamentos')
                        .select('*')
                        .eq('cliente_telefone', telefoneLogado);

                    if (error) throw error;

                    agendamentosCliente = data || [];
                    renderizarAgendamentos('futuros'); // Inicia mostrando os do futuro

                } catch (err) {
                    console.error("Erro ao carregar agendamentos:", err);
                    listaMeusAgendamentos.innerHTML = '<p style="text-align: center; color: #ff4d4d;">Erro ao carregar seu histórico.</p>';
                }
            });
        }

        // Funções de clique das Abas
        if (tabFuturos) tabFuturos.addEventListener('click', () => mudarAbaAgendamentos('futuros'));
        if (tabPassados) tabPassados.addEventListener('click', () => mudarAbaAgendamentos('passados'));

        // Função para mudar o visual das abas
        window.mudarAbaAgendamentos = function(tipo) {
            if (tipo === 'futuros') {
                tabFuturos.style.background = 'var(--gold)';
                tabFuturos.style.color = '#000';
                tabFuturos.style.border = 'none';
                
                tabPassados.style.background = 'transparent';
                tabPassados.style.color = '#fff';
                tabPassados.style.border = '1px solid #333';
            } else {
                tabPassados.style.background = 'var(--gold)';
                tabPassados.style.color = '#000';
                tabPassados.style.border = 'none';

                tabFuturos.style.background = 'transparent';
                tabFuturos.style.color = '#fff';
                tabFuturos.style.border = '1px solid #333';
            }
            renderizarAgendamentos(tipo);
        }

        // Função que cruza as datas, separa passado/futuro e desenha os cards na tela
        function renderizarAgendamentos(tipo) {
            if (!listaMeusAgendamentos) return;
            listaMeusAgendamentos.innerHTML = '';

            const agora = new Date(); // Puxa a data e horário exato do seu computador

            // FILTRO: Separa passado e futuro
            const filtrados = agendamentosCliente.filter(ag => {
                // Monta uma data comparável: 2026-06-01 e 18:30 viram um objeto Date
                const [ano, mes, dia] = ag.data_agendamento.split('-');
                const [hora, minuto] = ag.horario.split(':');
                const dataAgendamento = new Date(ano, mes - 1, dia, hora, minuto);

                if (tipo === 'futuros') {
                    return dataAgendamento >= agora;
                } else {
                    return dataAgendamento < agora;
                }
            });

            // ORDENAÇÃO
            if (tipo === 'futuros') {
                // Futuros: do mais próximo para o mais distante (Crescente)
                filtrados.sort((a, b) => new Date(`${a.data_agendamento}T${a.horario}`) - new Date(`${b.data_agendamento}T${b.horario}`));
            } else {
                // Passados: do mais recente para o mais antigo (Decrescente)
                filtrados.sort((a, b) => new Date(`${b.data_agendamento}T${b.horario}`) - new Date(`${a.data_agendamento}T${a.horario}`));
            }

            if (filtrados.length === 0) {
                listaMeusAgendamentos.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">Nenhum agendamento encontrado.</p>`;
                return;
            }

            // GERAÇÃO DOS CARDS
            filtrados.forEach(ag => {
                const dataFormatada = ag.data_agendamento.split('-').reverse().join('/');
                
                // O Supabase devolve serviços como JSON. Isso extrai só os nomes
                let nomesServicos = '';
                try {
                    let srvs = typeof ag.servicos === 'string' ? JSON.parse(ag.servicos) : ag.servicos;
                    nomesServicos = srvs.map(s => s.nome).join(', ');
                } catch(e) {
                    nomesServicos = 'Corte/Serviço';
                }

                // Ajuste visual: Opacidade menor se for histórico
                const statusCor = tipo === 'futuros' ? 'var(--gold)' : '#555';
                const badgeTexto = tipo === 'futuros' ? 'Confirmado' : 'Realizado';
                const opacidade = tipo === 'futuros' ? '1' : '0.6';

                const card = `
                    <div style="background-color: #1a1a1a; padding: 18px; border-radius: 10px; border: 1px solid #333; opacity: ${opacidade}; position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 12px; margin-bottom: 12px;">
                            <div style="font-weight: bold; color: #fff; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-regular fa-calendar-check" style="color: ${statusCor}; font-size: 1.2rem;"></i> ${dataFormatada}
                            </div>
                            <div style="background-color: #111; color: ${statusCor}; font-weight: 800; padding: 6px 12px; border-radius: 6px; border: 1px solid ${statusCor}; font-size: 1rem;">
                                ${ag.horario}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: center;">
                            <div style="width: 35px; height: 35px; border-radius: 50%; background: #222; border: 1px solid #444; display: flex; justify-content: center; align-items: center; color: var(--gold);">
                                <i class="fa-solid fa-scissors"></i>
                            </div>
                            <div>
                                <span style="color: var(--text-muted); font-size: 0.8rem; display: block; line-height: 1;">Profissional</span>
                                <span style="color: #fff; font-weight: 600; font-size: 1.05rem;">${ag.profissional_nome}</span>
                            </div>
                        </div>

                        <div style="background: rgba(255, 255, 255, 0.03); padding: 10px; border-radius: 6px; border: 1px dashed #333;">
                            <span style="color: var(--text-muted); font-size: 0.8rem; display: block; margin-bottom: 3px;">Serviços Agendados:</span>
                            <span style="color: #ddd; font-size: 0.95rem; font-weight: 600;">${nomesServicos}</span>
                        </div>
                        
                        <div style="position: absolute; top: -10px; right: -10px; background: ${tipo === 'futuros' ? '#25D366' : '#444'}; color: #fff; font-size: 0.7rem; font-weight: bold; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">
                            ${badgeTexto}
                        </div>
                    </div>
                `;
                listaMeusAgendamentos.innerHTML += card;
            });
        }