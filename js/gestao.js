        function abrirAbaGestao(idAba, elementoClicado) {
            // Remove 'active' de todas as abas no menu
            const tabs = document.querySelectorAll('.dash-tab');
            tabs.forEach(tab => tab.classList.remove('active'));

            // Remove 'active' de todos os containers de conteúdo
            const conteudos = document.querySelectorAll('.aba-conteudo');
            conteudos.forEach(conteudo => conteudo.classList.remove('active'));

            // Ativa o botão e a tela correspondente
            elementoClicado.classList.add('active');
            document.getElementById('aba-' + idAba).classList.add('active');
        }

        // Função para trocar de abas
        window.abrirAbaGestao = function(idAba, elementoClicado) {
            // 1. Remove a seleção de todos os botões do menu
            const tabs = document.querySelectorAll('.dash-tab');
            tabs.forEach(tab => tab.classList.remove('active'));

            // 2. Esconde todos os conteúdos das abas
            const conteudos = document.querySelectorAll('.aba-conteudo');
            conteudos.forEach(conteudo => conteudo.classList.remove('active'));

            // 3. Ativa o botão clicado e mostra a aba correspondente
            elementoClicado.classList.add('active');
            
            const abaParaAbrir = document.getElementById('aba-' + idAba);
            if (abaParaAbrir) {
                abaParaAbrir.classList.add('active');
            } else {
                console.error("Erro: A aba 'aba-" + idAba + "' não foi encontrada no HTML.");
            }
        };

        // Função para sair do sistema (Retorna à página principal)
        window.sairDoSistema = function() {
            console.log("Saindo do sistema...");
            // O comando abaixo redireciona para o site do cliente
            window.location.href = 'index.html'; 
        };


        function sairDoSistema() {
            // Redireciona de volta para o site principal externo
            window.location.href = 'index.html';
        }

        // --- LÓGICA DO MÓDULO DE SERVIÇOS ---
        function abrirModalServico() {
            document.getElementById('modal-servico').style.display = 'flex';
        }

        function fecharModalServico() {
            document.getElementById('modal-servico').style.display = 'none';
            // Limpa os campos quando fecha
            document.getElementById('serv-nome').value = '';
            document.getElementById('serv-desc').value = '';
            document.getElementById('serv-preco').value = '';
            document.getElementById('serv-duracao').value = '';
        }

        // BUSCAR SERVIÇOS NO BANCO
        async function carregarServicos() {
            const lista = document.getElementById('lista-servicos');
            if (!lista) return;

            lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin"></i> Buscando serviços...</p>';

            try {
                const { data, error } = await window.supabaseClient
                    .from('servicos')
                    .select('*')
                    .order('nome', { ascending: true });

                if (error) throw error;

                if (data.length === 0) {
                    lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Nenhum serviço cadastrado ainda.</p>';
                    return;
                }

                lista.innerHTML = ''; // Limpa a mensagem de carregamento

                // Monta o Card de cada serviço
                data.forEach(servico => {
                    const precoFormatado = Number(servico.preco).toFixed(2).replace('.', ',');
                    const desc = servico.descricao ? servico.descricao : '<em>Sem descrição</em>';
                    
                    const card = `
                        <div class="servico-card">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <h3>${servico.nome}</h3>
                                    <button class="btn-excluir-serv" onclick="excluirServico('${servico.id}')" title="Excluir Serviço">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                <p>${desc}</p>
                            </div>
                            <div class="servico-detalhes">
                                <span class="servico-preco">R$ ${precoFormatado}</span>
                                <span class="servico-duracao"><i class="fa-regular fa-clock"></i> ${servico.duracao} min</span>
                            </div>
                        </div>
                    `;
                    lista.innerHTML += card;
                });

            } catch (err) {
                console.error("Erro ao carregar serviços:", err);
                lista.innerHTML = '<p style="text-align: center; color: #ff4d4d; grid-column: 1/-1;">Erro ao carregar os serviços. Verifique o banco.</p>';
            }
        }

        // SALVAR NOVO SERVIÇO
        document.addEventListener('DOMContentLoaded', () => {
            // Carrega os serviços assim que o painel abrir
            carregarServicos();

            const btnSalvar = document.getElementById('btn-salvar-servico');
            if (btnSalvar) {
                btnSalvar.addEventListener('click', async () => {
                    const nome = document.getElementById('serv-nome').value.trim();
                    const desc = document.getElementById('serv-desc').value.trim();
                    const preco = document.getElementById('serv-preco').value;
                    const duracao = document.getElementById('serv-duracao').value;

                    // VERIFICAÇÃO DE CAMPOS VAZIOS
            if (!nome || !preco || !duracao) {
                mostrarToast('O Nome, Preço e Duração são obrigatórios!', 'aviso');
                return;
            }

            const textoOriginal = btnSalvar.innerHTML;
            btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
            btnSalvar.disabled = true;

            try {
                const { error } = await window.supabaseClient
                    .from('servicos')
                    .insert([{ 
                        nome: nome, 
                        descricao: desc || null, 
                        preco: parseFloat(preco), 
                        duracao: parseInt(duracao) 
                    }]);

                if (error) throw error;

                fecharModalServico();
                
                // MENSAGEM DE SUCESSO BONITA!
                mostrarToast('Serviço adicionado com sucesso!');
                
                carregarServicos(); 
                
            } catch (err) {
                console.error('Erro ao salvar serviço:', err);
                mostrarToast('Erro ao salvar: ' + err.message, 'aviso');
            } finally {
                btnSalvar.innerHTML = textoOriginal;
                btnSalvar.disabled = false;
            }
                });
            }
        });

        // FUNÇÃO EXTRA: EXCLUIR SERVIÇO
        async function excluirServico(id) {
            if(confirm("Tem certeza que deseja excluir este serviço do catálogo?")) {
                try {
                    const { error } = await window.supabaseClient
                        .from('servicos')
                        .delete()
                        .eq('id', id);
                        
                    if (error) throw error;
                    carregarServicos(); // Atualiza a lista
                } catch(err) {
                    alert("Erro ao excluir: " + err.message);
                }
            }
        }

        // --- SISTEMA DE NOTIFICAÇÃO ELEGANTE (TOAST) PARA A GESTÃO ---
        window.mostrarToast = function(mensagem, tipo = 'padrao') {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast ${tipo === 'aviso' ? 'toast-warning' : ''}`;
            
            const icone = tipo === 'aviso' ? '<i class="fa-solid fa-triangle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';

            toast.innerHTML = `${icone} <span>${mensagem}</span>`;
            
            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 400); 
            }, 3500);
        }

        // --- LÓGICA DO MÓDULO DE EQUIPE ---
        function abrirModalEquipe() {
            document.getElementById('modal-equipe').style.display = 'flex';
        }

        function fecharModalEquipe() {
            document.getElementById('modal-equipe').style.display = 'none';
            // Limpa campos
            document.getElementById('eqp-nome').value = '';
            document.getElementById('eqp-telefone').value = '';
            document.getElementById('eqp-comissao').value = '';
            document.getElementById('eqp-status').value = 'Ativo';
        }

        // BUSCAR PROFISSIONAIS NO BANCO
        async function carregarEquipe() {
            const lista = document.getElementById('lista-equipe');
            if (!lista) return;

            lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin"></i> Buscando equipe...</p>';

            try {
                const { data, error } = await window.supabaseClient
                    .from('equipe')
                    .select('*')
                    .order('nome', { ascending: true });

                if (error) throw error;

                if (data.length === 0) {
                    lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Nenhum profissional cadastrado.</p>';
                    return;
                }

                lista.innerHTML = ''; 

                data.forEach(prof => {
                    const statusClass = prof.status === 'Ativo' ? 'status-ativo' : 'status-inativo';
                    
                    const card = `
                        <div class="equipe-card">
                            <div class="equipe-avatar">👨🏼‍💼</div>
                            <h3>${prof.nome}</h3>
                            <p>${prof.telefone || 'Sem telefone'}</p>
                            <div class="equipe-comissao">Comissão: ${prof.comissao || 0}%</div>
                            <div class="badge-status ${statusClass}">${prof.status.toUpperCase()}</div>
                            
                            <hr style="width: 100%; border: 0; border-top: 1px solid #2a2a2a; margin-bottom: 20px;">
                            
                            <button class="btn-remover-eqp" onclick="removerProfissional('${prof.id}')">
                                🗑 Remover Profissional
                            </button>
                        </div>
                    `;
                    lista.innerHTML += card;
                });

            } catch (err) {
                console.error("Erro ao carregar equipe:", err);
                lista.innerHTML = '<p style="text-align: center; color: #ff4d4d; grid-column: 1/-1;">Erro ao carregar a equipe.</p>';
            }
        }

        // Adicionando a chamada da equipe junto com os serviços quando a tela carrega
        document.addEventListener('DOMContentLoaded', () => {
            // Você já tem uma função assim no seu JS, basta adicionar carregarEquipe() dentro dela, ou deixar esta nova solta aqui:
            carregarEquipe();
        });

        // SALVAR NOVO PROFISSIONAL
        document.addEventListener('DOMContentLoaded', () => {
            const btnSalvarEquipe = document.getElementById('btn-salvar-equipe');
            if (btnSalvarEquipe) {
                btnSalvarEquipe.addEventListener('click', async () => {
                    const nome = document.getElementById('eqp-nome').value.trim();
                    const telefone = document.getElementById('eqp-telefone').value.trim();
                    const comissao = document.getElementById('eqp-comissao').value;
                    const status = document.getElementById('eqp-status').value;

                    if (!nome) {
                        mostrarToast('O Nome do profissional é obrigatório!', 'aviso');
                        return;
                    }

                    const textoOriginal = btnSalvarEquipe.innerHTML;
                    btnSalvarEquipe.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
                    btnSalvarEquipe.disabled = true;

                    try {
                        const { error } = await window.supabaseClient
                            .from('equipe')
                            .insert([{ 
                                nome: nome, 
                                telefone: telefone || null, 
                                comissao: comissao ? parseFloat(comissao) : 0, 
                                status: status 
                            }]);

                        if (error) throw error;

                        fecharModalEquipe();
                        mostrarToast('Profissional adicionado à equipe com sucesso!');
                        carregarEquipe(); 
                        
                    } catch (err) {
                        console.error('Erro ao salvar profissional:', err);
                        mostrarToast('Erro ao salvar: ' + err.message, 'aviso');
                    } finally {
                        btnSalvarEquipe.innerHTML = textoOriginal;
                        btnSalvarEquipe.disabled = false;
                    }
                });
            }
        });

        // FUNÇÃO PARA REMOVER PROFISSIONAL
        async function removerProfissional(id) {
            if(confirm("Tem certeza que deseja remover este profissional da equipe?")) {
                try {
                    const { error } = await window.supabaseClient
                        .from('equipe')
                        .delete()
                        .eq('id', id);
                        
                    if (error) throw error;
                    mostrarToast('Profissional removido!', 'aviso');
                    carregarEquipe(); 
                } catch(err) {
                    mostrarToast("Erro ao remover: " + err.message, "aviso");
                }
            }
        }

        // --- LÓGICA DE CONFIGURAÇÕES GERAIS E HORÁRIOS ---
        let horariosSelecionados = []; // Guarda os horários ativos na memória

        // 1. Gera os botões de horário dinamicamente
        function gerarGradeHorarios() {
            const grid = document.getElementById('grid-horarios');
            if(!grid) return;
            grid.innerHTML = '';
            
            // Loop das 07:00 às 23:00
            for(let h = 7; h <= 23; h++) {
                for(let m = 0; m <= 30; m += 30) {
                    
                    // Para no 23:00 (Ignora o 23:30)
                    if(h === 23 && m === 30) continue; 

                    // Formata para 00:00
                    let horaFormatada = h.toString().padStart(2, '0') + ':' + (m === 0 ? '00' : '30');
                    
                    let slot = document.createElement('div');
                    slot.className = 'time-slot';
                    slot.id = 'slot-' + horaFormatada.replace(':', '');
                    slot.innerText = horaFormatada;
                    
                    // Lógica de clicar e mudar de cor
                    slot.onclick = function() {
                        this.classList.toggle('active');
                        if(this.classList.contains('active')) {
                            if(!horariosSelecionados.includes(horaFormatada)) {
                                horariosSelecionados.push(horaFormatada);
                            }
                        } else {
                            horariosSelecionados = horariosSelecionados.filter(horario => horario !== horaFormatada);
                        }
                    };
                    
                    grid.appendChild(slot);
                }
            }
        }

        // 2. Busca os dados salvos no banco ao abrir a página
        async function carregarConfiguracoesMaster() {
            try {
                const { data, error } = await window.supabaseClient
                    .from('configuracoes')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                
                if (data) {
                    // Preenche os Inputs da direita
                    document.getElementById('conf-nome').value = data.nome_barbearia || '';
                    document.getElementById('conf-telefone').value = data.telefone || '';
                    document.getElementById('conf-endereco').value = data.endereco || '';
                    document.getElementById('conf-duracao').value = data.duracao_padrao || 30;
                    document.getElementById('conf-intervalo').value = data.intervalo || 0;

                    // Restaura os botões amarelos (Horários da esquerda)
                    if (data.horarios_ativos && Array.isArray(data.horarios_ativos)) {
                        horariosSelecionados = data.horarios_ativos;
                        horariosSelecionados.forEach(hora => {
                            let idSlot = 'slot-' + hora.replace(':', '');
                            let botao = document.getElementById(idSlot);
                            if (botao) botao.classList.add('active');
                        });
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar configurações:", err);
            }
        }

        // Inicializa a tela gerando os botões e buscando do banco
        document.addEventListener('DOMContentLoaded', () => {
            gerarGradeHorarios();
            carregarConfiguracoesMaster();
        });

        // 3. Salvar apenas a grade de Horários
        window.salvarHorariosMaster = async function() {
            const btn = event.currentTarget;
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
            btn.disabled = true;

            try {
                const { error } = await window.supabaseClient
                    .from('configuracoes')
                    .update({ horarios_ativos: horariosSelecionados })
                    .eq('id', 1);

                if (error) throw error;
                if(typeof mostrarToast === 'function') mostrarToast('Grade de horários atualizada!');
                else alert('Horários salvos!');
            } catch (err) {
                alert("Erro ao salvar horários: " + err.message);
            } finally {
                btn.innerHTML = textoOriginal;
                btn.disabled = false;
            }
        }

        // 4. Salvar apenas os dados Gerais (Inputs)
        window.salvarConfigGerais = async function() {
            const btn = event.currentTarget;
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
            btn.disabled = true;

            const nome = document.getElementById('conf-nome').value;
            const tel = document.getElementById('conf-telefone').value;
            const end = document.getElementById('conf-endereco').value;
            const duracao = document.getElementById('conf-duracao').value;
            const intervalo = document.getElementById('conf-intervalo').value;

            try {
                const { error } = await window.supabaseClient
                    .from('configuracoes')
                    .update({ 
                        nome_barbearia: nome,
                        telefone: tel,
                        endereco: end,
                        duracao_padrao: parseInt(duracao) || 30,
                        intervalo: parseInt(intervalo) || 0
                    })
                    .eq('id', 1);

                if (error) throw error;
                if(typeof mostrarToast === 'function') mostrarToast('Configurações gerais atualizadas!');
                else alert('Configurações salvas!');
            } catch (err) {
                alert("Erro ao salvar configurações: " + err.message);
            } finally {
                btn.innerHTML = textoOriginal;
                btn.disabled = false;
            }
        }

        // ==========================================
        // MÓDULO DA AGENDA (RESTRIÇÃO E RENDERIZAÇÃO)
        // ==========================================

        // 1. Configura o calendário para os próximos 10 dias e carrega barbeiros
        document.addEventListener('DOMContentLoaded', async () => {
            const inputFiltroData = document.getElementById('filtro-data-agenda');
            if (inputFiltroData) {
                const dataHoje = new Date();
                
                // Define data limite para 10 dias à frente
                const dataLimite = new Date();
                dataLimite.setDate(dataHoje.getDate() + 10);

                // Formata as datas para YYYY-MM-DD
                const stringHoje = dataHoje.toISOString().split('T')[0];
                const stringLimite = dataLimite.toISOString().split('T')[0];

                // Aplica as restrições no input HTML
                inputFiltroData.min = stringHoje;
                inputFiltroData.max = stringLimite;
                inputFiltroData.value = stringHoje; // Inicia na data de hoje
            }

            // Alimenta o select com os barbeiros da equipe
            await preencherFiltroBarbeiros();
            
            // Dispara a busca inicial para o dia de hoje
            carregarAgendaDoDia();
        });

        async function preencherFiltroBarbeiros() {
            const select = document.getElementById('filtro-prof-agenda');
            if(!select) return;
            try {
                const { data, error } = await window.supabaseClient.from('equipe').select('id, nome').eq('status', 'Ativo');
                if (data) {
                    data.forEach(prof => {
                        select.innerHTML += `<option value="${prof.id}">${prof.nome}</option>`;
                    });
                }
            } catch(err) { console.error(err); }
        }

        // 2. Busca e cruza os dados
        window.carregarAgendaDoDia = async function() {
            const dataSelecionada = document.getElementById('filtro-data-agenda').value;
            const profissionalId = document.getElementById('filtro-prof-agenda').value;
            
            const gradeHtml = document.getElementById('grade-horarios-agenda');
            const listaHtml = document.getElementById('lista-agendamentos-dia');
            
            if(!gradeHtml || !listaHtml || !dataSelecionada) return;

            gradeHtml.innerHTML = '<p style="color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Atualizando grade...</p>';
            listaHtml.innerHTML = '<p style="color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Buscando clientes...</p>';

            try {
                // A. Puxa a Grade Master das configurações
                const { data: config } = await window.supabaseClient.from('configuracoes').select('horarios_ativos').eq('id', 1).single();
                const horariosMaster = config?.horarios_ativos || [];

                // B. Puxa os agendamentos reais daquela data
                let queryAgendamentos = window.supabaseClient.from('agendamentos').select('*').eq('data_agendamento', dataSelecionada);
                if (profissionalId !== 'todos') {
                    queryAgendamentos = queryAgendamentos.eq('profissional_id', profissionalId);
                }
                
                const { data: agendamentos, error } = await queryAgendamentos.order('horario', { ascending: true });
                if (error) throw error;

                // Extrai apenas as strings de horários que já foram ocupados
                const horariosOcupados = agendamentos.map(ag => ag.horario);

                // --- RENDERIZA A GRADE DE DISPONIBILIDADE ---
                gradeHtml.innerHTML = '';
                if (horariosMaster.length === 0) {
                    gradeHtml.innerHTML = '<p style="color: #ff4d4d; grid-column: 1/-1;">Nenhum horário global configurado na aba de Configurações.</p>';
                } else {
                    // Ordena os horários globais antes de renderizar
                    horariosMaster.sort().forEach(hora => {
                        const taOcupado = horariosOcupados.includes(hora);
                        const classe = taOcupado ? 'time-slot slot-ocupado' : 'time-slot slot-livre';
                        
                        gradeHtml.innerHTML += `
                            <div class="${classe}" title="${taOcupado ? 'Horário Reservado' : 'Disponível'}">
                                ${hora}
                            </div>
                        `;
                    });
                }

                // --- RENDERIZA OS CARDS DE AGENDAMENTO (EM ORDEM) ---
                listaHtml.innerHTML = '';
                if (agendamentos.length === 0) {
                    listaHtml.innerHTML = '<p style="color: var(--text-muted);">Nenhum cliente agendado para esta data.</p>';
                } else {
                    agendamentos.forEach(ag => {
                        // Aqui podemos no futuro descompactar os serviços, por enquanto exibimos fixo
                        const profTexto = profissionalId === 'todos' ? `<p><i class="fa-solid fa-scissors"></i> ${ag.profissional_nome}</p>` : '';
                        
                        listaHtml.innerHTML += `
                            <div class="agendamento-card">
                                <div class="agendamento-info">
                                    <h4>${ag.cliente_nome}</h4>
                                    <p><i class="fa-brands fa-whatsapp"></i> ${ag.cliente_telefone}</p>
                                    ${profTexto}
                                </div>
                                <div class="agendamento-hora">
                                    ${ag.horario}
                                </div>
                            </div>
                        `;
                    });
                }

            } catch (err) {
                console.error("Erro ao cruzar agenda:", err);
                gradeHtml.innerHTML = '<p style="color: #ff4d4d;">Erro de sincronização.</p>';
                listaHtml.innerHTML = '<p style="color: #ff4d4d;">Erro de sincronização.</p>';
            }
        }

        