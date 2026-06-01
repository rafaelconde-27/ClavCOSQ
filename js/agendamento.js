        // --- LÓGICA DA PÁGINA DE AGENDAMENTO INDEPENDENTE ---

        // Objeto que vai guardar todas as escolhas do cliente (Declarado apenas UMA vez)
       let reservaAtual = {
            profissionalId: null,
            profissionalNome: null,
            servicos: [],
            data: null,     // ADICIONADO
            horario: null   // ADICIONADO
        };

        // Ao carregar a página, busca a equipe
        document.addEventListener('DOMContentLoaded', () => {
            carregarProfissionaisAgendamento();
        });

        // ==========================================
        // PASSO 1: PROFISSIONAIS
        // ==========================================
        async function carregarProfissionaisAgendamento() {
            const lista = document.getElementById('lista-profissionais-agendamento');
            if(!lista) return;

            try {
                const { data, error } = await window.supabaseClient
                    .from('equipe')
                    .select('*')
                    .eq('status', 'Ativo') 
                    .order('nome', { ascending: true });

                if (error) throw error;
                if (data.length === 0) {
                    lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Nenhum profissional disponível.</p>';
                    return;
                }

                lista.innerHTML = ''; 
                data.forEach(prof => {
                    const inicial = prof.nome.charAt(0).toUpperCase();
                    const isSelected = reservaAtual.profissionalId === prof.id ? 'selected' : '';
                    
                    const card = `
                        <div class="prof-card ${isSelected}" id="card-prof-${prof.id}" onclick="selecionarProfissional('${prof.id}', '${prof.nome}')">
                            <div class="prof-avatar-min">${inicial}</div>
                            <h4 style="margin: 0 0 5px 0; color: #fff;">${prof.nome}</h4>
                            <p style="margin: 0; color: var(--text-muted); font-size: 0.8rem;">
                                <i class="fa-solid fa-phone" style="color: #e91e63;"></i> ${prof.telefone || 'Sem número'}
                            </p>
                        </div>
                    `;
                    lista.innerHTML += card;
                });
            } catch (err) {
                console.error("Erro equipe:", err);
            }
        }

        window.selecionarProfissional = function(id, nome) {
            const cards = document.querySelectorAll('.prof-card');
            cards.forEach(card => card.classList.remove('selected'));
            document.getElementById(`card-prof-${id}`).classList.add('selected');

            reservaAtual.profissionalId = id;
            reservaAtual.profissionalNome = nome;

            document.getElementById('btn-proximo-step1').disabled = false;
        }

        // ==========================================
        // NAVEGAÇÃO E STEPPER
        // ==========================================
        function atualizarStepper(passoAtivo) {
            const steps = document.querySelectorAll('.step');
            steps.forEach((step, index) => {
                if (index < passoAtivo) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }

        function irParaStep2() {
            document.getElementById('step-1-profissional').style.display = 'none';
            document.getElementById('step-2-servicos').style.display = 'block';
            atualizarStepper(2); 
            carregarServicosAgendamento(); 
        }

        function voltarParaStep1() {
            document.getElementById('step-2-servicos').style.display = 'none';
            document.getElementById('step-1-profissional').style.display = 'block';
            atualizarStepper(1); 
        }

        // ==========================================
        // PASSO 2: SERVIÇOS
        // ==========================================
        async function carregarServicosAgendamento() {
            const lista = document.getElementById('lista-servicos-agendamento');
            lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin"></i> Buscando serviços...</p>';

            try {
                const { data, error } = await window.supabaseClient
                    .from('servicos')
                    .select('*')
                    .order('nome', { ascending: true });

                if (error) throw error;
                if (data.length === 0) {
                    lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Nenhum serviço disponível.</p>';
                    return;
                }

                lista.innerHTML = ''; 

                data.forEach(serv => {
                    const isSelected = reservaAtual.servicos.some(s => s.id === serv.id);
                    const classeSelecionado = isSelected ? 'selected' : '';
                    const corCheckbox = isSelected ? '#8b5cf6' : '#555';
                    const fundoCheckbox = isSelected ? '#8b5cf6' : 'transparent';
                    const iconeCheck = isSelected ? '<i class="fa-solid fa-check" style="color: #fff; font-size: 0.8rem;"></i>' : '';
                    
                    const precoFormatado = Number(serv.preco).toFixed(2).replace('.', ',');

                    const card = `
                        <div class="serv-card ${classeSelecionado}" id="card-serv-${serv.id}" onclick="toggleServico('${serv.id}', '${serv.nome}', ${serv.preco}, ${serv.duracao})">
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                <h4 style="margin: 0; color: #fff;">${serv.nome}</h4>
                                <div class="checkbox-servico" style="width: 20px; height: 20px; border: 2px solid ${corCheckbox}; border-radius: 4px; display: flex; justify-content: center; align-items: center; background-color: ${fundoCheckbox}; transition: 0.2s;">
                                    ${iconeCheck}
                                </div>
                            </div>
                            
                            <p style="margin: 0 0 15px 0; color: var(--text-muted); font-size: 0.85rem; line-height: 1.3;">${serv.descricao || ''}</p>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #333; padding-top: 10px;">
                                <span style="color: var(--gold); font-weight: bold;">R$ ${precoFormatado}</span>
                                <span style="color: #aaa; font-size: 0.8rem;"><i class="fa-regular fa-clock"></i> ${serv.duracao} min</span>
                            </div>
                        </div>
                    `;
                    lista.innerHTML += card;
                });
                
                validarBotaoStep2(); 

            } catch (err) {
                console.error("Erro serviços:", err);
                lista.innerHTML = '<p style="text-align: center; color: #ff4d4d; grid-column: 1/-1;">Erro ao carregar serviços.</p>';
            }
        }

        window.toggleServico = function(id, nome, preco, duracao) {
            const index = reservaAtual.servicos.findIndex(s => s.id === id);
            const card = document.getElementById(`card-serv-${id}`);
            const checkbox = card.querySelector('.checkbox-servico');

            if (index > -1) {
                reservaAtual.servicos.splice(index, 1);
                card.classList.remove('selected');
                checkbox.style.borderColor = '#555';
                checkbox.style.backgroundColor = 'transparent';
                checkbox.innerHTML = '';
            } else {
                reservaAtual.servicos.push({ id, nome, preco, duracao });
                card.classList.add('selected');
                checkbox.style.borderColor = '#8b5cf6';
                checkbox.style.backgroundColor = '#8b5cf6';
                checkbox.innerHTML = '<i class="fa-solid fa-check" style="color: #fff; font-size: 0.8rem;"></i>';
            }

            validarBotaoStep2();
        }

        function validarBotaoStep2() {
            const btn = document.getElementById('btn-proximo-step2');
            if (reservaAtual.servicos.length > 0) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }

        // ==========================================
        // NAVEGAÇÃO PARA O PASSO 3
        // ==========================================
        function irParaStep3() {
            document.getElementById('step-2-servicos').style.display = 'none';
            document.getElementById('step-3-horario').style.display = 'block';
            atualizarStepper(3); 
            
            // Configura o calendário (Limita a 10 dias)
            configurarInputData();
        }

        function voltarParaStep2() {
            document.getElementById('step-3-horario').style.display = 'none';
            document.getElementById('step-2-servicos').style.display = 'block';
            atualizarStepper(2);
        }

        function configurarInputData() {
            const inputData = document.getElementById('input-data-agendamento');
            if(!inputData) return;
            
            const hoje = new Date();
            const limite = new Date();
            limite.setDate(hoje.getDate() + 10); // Trava os 10 dias
            
            const stringHoje = hoje.toISOString().split('T')[0];
            const stringLimite = limite.toISOString().split('T')[0];
            
            inputData.min = stringHoje;
            inputData.max = stringLimite;
            
            // Se ainda não tiver data selecionada, preenche com hoje
            if(!inputData.value) {
                inputData.value = stringHoje; 
            }
            
            carregarHorariosDisponiveis();
        }

        // ==========================================
        // PASSO 3: HORÁRIOS (LÓGICA DE CRUZAMENTO)
        // ==========================================
        async function carregarHorariosDisponiveis() {
            const dataSelecionada = document.getElementById('input-data-agendamento').value;
            const lista = document.getElementById('lista-horarios-agendamento');
            const btnProximo = document.getElementById('btn-proximo-step3');
            
            if(!dataSelecionada || !lista) return;

            // Reseta a escolha de horário anterior (caso o cliente mude de dia)
            reservaAtual.data = dataSelecionada;
            reservaAtual.horario = null;
            btnProximo.disabled = true;

            lista.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin"></i> Verificando disponibilidade...</p>';

            try {
                // 1. Puxar a Grade Master configurada na Gestão
                const { data: config } = await window.supabaseClient.from('configuracoes').select('horarios_ativos').eq('id', 1).single();
                let horariosMaster = config?.horarios_ativos || [];

                if (horariosMaster.length === 0) {
                    lista.innerHTML = '<p style="text-align: center; color: #ff4d4d; grid-column: 1/-1;">Nenhum horário de funcionamento configurado na barbearia.</p>';
                    return;
                }

                // 2. Puxar os agendamentos já feitos para ESSE PROFISSIONAL e NESSA DATA
                const { data: agendamentos, error } = await window.supabaseClient
                    .from('agendamentos')
                    .select('horario')
                    .eq('data_agendamento', dataSelecionada)
                    .eq('profissional_id', reservaAtual.profissionalId);

                if (error) throw error;

                // Cria uma lista apenas com os textos dos horários ocupados
                const horariosOcupados = agendamentos.map(ag => ag.horario);

                // 3. A MÁGICA: Filtra os horários removendo tudo o que está ocupado
                const horariosLivres = horariosMaster.filter(hora => !horariosOcupados.includes(hora)).sort();

                lista.innerHTML = '';
                
                if (horariosLivres.length === 0) {
                    lista.innerHTML = '<p style="text-align: center; color: #ff4d4d; font-weight: bold; grid-column: 1/-1;">Agenda lotada para este dia! 😔<br><span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">Por favor, selecione outra data acima.</span></p>';
                    return;
                }

                // 4. Renderiza apenas os horários que sobraram livres
                horariosLivres.forEach(hora => {
                    lista.innerHTML += `
                        <div class="time-slot-cliente" id="slot-cliente-${hora.replace(':', '')}" onclick="selecionarHorario('${hora}')">
                            ${hora}
                        </div>
                    `;
                });

            } catch (err) {
                console.error("Erro ao carregar horários:", err);
                lista.innerHTML = '<p style="text-align: center; color: #ff4d4d; grid-column: 1/-1;">Erro ao comunicar com o servidor.</p>';
            }
        }

        window.selecionarHorario = function(hora) {
            // Desmarca todos os horários
            const slots = document.querySelectorAll('.time-slot-cliente');
            slots.forEach(slot => slot.classList.remove('selected'));
            
            // Marca apenas o clicado
            document.getElementById(`slot-cliente-${hora.replace(':', '')}`).classList.add('selected');
            
            // Salva na memória
            reservaAtual.horario = hora;
            
            // Libera o botão de avançar
            document.getElementById('btn-proximo-step3').disabled = false;
        }

        // ==========================================
        // NAVEGAÇÃO PARA O PASSO 4 (COM BUSCA NA BASE DE DADOS)
        // ==========================================
        window.irParaStep4 = async function() {
            // 1. Navegação visual e Stepper
            document.getElementById('step-3-horario').style.display = 'none';
            document.getElementById('step-4-confirmar').style.display = 'block';
            atualizarStepper(4);

            // 2. Preenche o Resumo do Agendamento (Profissional e Data)
            document.getElementById('resumo-prof').innerText = reservaAtual.profissionalNome;
            
            const dataPartes = reservaAtual.data.split('-');
            const dataFormatada = `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;
            document.getElementById('resumo-data-hora').innerHTML = `${dataFormatada} às <span style="color: var(--gold);">${reservaAtual.horario}</span>`;

            // 3. Renderiza a lista de Serviços e calcula o Total
            const divServicos = document.getElementById('resumo-servicos');
            divServicos.innerHTML = '';
            let valorTotal = 0;

            reservaAtual.servicos.forEach(serv => {
                valorTotal += serv.preco;
                const precoFmt = Number(serv.preco).toFixed(2).replace('.', ',');
                divServicos.innerHTML += `
                    <div class="resumo-servico-linha">
                        <span>${serv.nome}</span>
                        <span>R$ ${precoFmt}</span>
                    </div>
                `;
            });

            document.getElementById('resumo-total').innerText = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;

            // Mostra um aviso amigável (Toast)
            if (typeof mostrarToast === 'function') {
                mostrarToast(`Preparando confirmação para o dia ${dataFormatada} às ${reservaAtual.horario}`);
            }

            // ==========================================
            // 4. BUSCA INTELIGENTE NA BASE DE DADOS
            // ==========================================
            const inputNome = document.getElementById('agend-cliente-nome');
            const inputTelefone = document.getElementById('agend-cliente-telefone');
            
            // Pega o número de telemóvel guardado no login para usar como "chave de busca"
            const telefoneSessao = localStorage.getItem('userTelefone') || localStorage.getItem('agendTelefone');

            if (telefoneSessao) {
                // Já preenche o telefone no input imediatamente
                if (inputTelefone) inputTelefone.value = telefoneSessao;

                // Vai à tabela 'clientes' do Supabase procurar o dono deste número
                try {
                    const { data, error } = await window.supabaseClient
                        .from('clientes')
                        .select('nome')
                        .eq('celular', telefoneSessao)
                        .single();

                    if (data && !error) {
                        // Se encontrar, pega apenas o primeiro nome e injeta no input
                        if (inputNome) {
                            inputNome.value = data.nome.split(' ')[0];
                        }
                        console.log("Dados sincronizados com a base de dados para:", data.nome);
                    }
                } catch (err) {
                    console.error("Erro ao puxar informações da base de dados:", err);
                }
            }
        }

        // ==========================================
        // UTILITÁRIOS
        // ==========================================
        window.mostrarToast = function(mensagem, tipo = 'padrao') {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast ${tipo === 'aviso' ? 'toast-warning' : ''}`;
            const icone = tipo === 'aviso' ? '<i class="fa-solid fa-triangle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';
            toast.innerHTML = `${icone} <span>${mensagem}</span>`;
            
            container.appendChild(toast);
            setTimeout(() => { toast.classList.add('show'); }, 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => { toast.remove(); }, 400); 
            }, 3500);
        }

        // ==========================================
        // NAVEGAÇÃO PARA O PASSO 4 E CÁLCULO DO RESUMO
        // ==========================================
        function irParaStep4() {
            document.getElementById('step-3-horario').style.display = 'none';
            document.getElementById('step-4-confirmar').style.display = 'block';
            atualizarStepper(4);

            // 1. Preenche o Nome do Profissional
            document.getElementById('resumo-prof').innerText = reservaAtual.profissionalNome;
            
            // 2. Formata a Data (de YYYY-MM-DD para DD/MM/YYYY)
            const dataPartes = reservaAtual.data.split('-');
            const dataFormatada = `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;
            document.getElementById('resumo-data-hora').innerHTML = `${dataFormatada} às <span style="color: var(--gold);">${reservaAtual.horario}</span>`;

            // 3. Renderiza a lista de Serviços e calcula o Total
            const divServicos = document.getElementById('resumo-servicos');
            divServicos.innerHTML = '';
            let valorTotal = 0;

            reservaAtual.servicos.forEach(serv => {
                valorTotal += serv.preco;
                const precoFmt = Number(serv.preco).toFixed(2).replace('.', ',');
                divServicos.innerHTML += `
                    <div class="resumo-servico-linha">
                        <span>${serv.nome}</span>
                        <span>R$ ${precoFmt}</span>
                    </div>
                `;
            });

            document.getElementById('resumo-total').innerText = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
        }

        function voltarParaStep3() {
            document.getElementById('step-4-confirmar').style.display = 'none';
            document.getElementById('step-3-horario').style.display = 'block';
            atualizarStepper(3);
        }

        // Máscara Automática para o Input de Telefone do Passo 4
        document.addEventListener('DOMContentLoaded', () => {
            const inputTelAgendamento = document.getElementById('agend-cliente-telefone');
            if(inputTelAgendamento) {
                inputTelAgendamento.addEventListener('input', function (e) {
                    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
                    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
                });
            }
        });

        // ==========================================
        // GRAVAÇÃO NO BANCO DE DADOS (SUPABASE)
        // ==========================================
        window.finalizarAgendamento = async function() {
            const nomeCliente = document.getElementById('agend-cliente-nome').value.trim();
            const telefoneCliente = document.getElementById('agend-cliente-telefone').value.trim();

            // Validação Básica
            if (!nomeCliente || !telefoneCliente || telefoneCliente.length < 14) {
                alert("Por favor, preencha seu nome e um WhatsApp válido.");
                return;
            }

            const btnFinalizar = document.getElementById('btn-finalizar-agendamento');
            const textoOriginal = btnFinalizar.innerHTML;
            btnFinalizar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirmando...';
            btnFinalizar.disabled = true;

            try {
                console.log("Tentando salvar no banco...", reservaAtual);
                
                // Envia o pacote completo para a tabela 'agendamentos'
                const { error } = await window.supabaseClient
                    .from('agendamentos')
                    .insert([{
                        cliente_nome: nomeCliente,
                        cliente_telefone: telefoneCliente,
                        profissional_id: reservaAtual.profissionalId,
                        profissional_nome: reservaAtual.profissionalNome,
                        servicos: reservaAtual.servicos, 
                        data_agendamento: reservaAtual.data,
                        horario: reservaAtual.horario,
                        status: 'Confirmado'
                    }]);

                // Se o Supabase recusar a gravação, ele joga o erro para o bloco "catch" abaixo
                if (error) {
                    throw error; 
                }

                // Garante que o Passo 4 desapareça da tela
                document.getElementById('step-4-confirmar').style.display = 'none';

                // Se deu certo, transforma o conteúdo da tela numa mensagem de sucesso linda!
                const telaConteudo = document.querySelector('.agendamento-content');
                if(telaConteudo) {
                    telaConteudo.innerHTML = `
                        <div style="text-align: center; padding: 40px 10px;">
                            <i class="fa-solid fa-circle-check" style="font-size: 5rem; color: #25D366; margin-bottom: 25px;"></i>
                            <h2 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 10px;">Agendamento Confirmado!</h2>
                            <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 40px; line-height: 1.6;">
                                <strong>${nomeCliente}</strong>, te esperamos no dia<br>
                                <span style="color: var(--gold); font-weight: bold; font-size: 1.2rem;">${reservaAtual.data.split('-').reverse().join('/')} às ${reservaAtual.horario}</span><br>
                                com o profissional ${reservaAtual.profissionalNome}.
                            </p>
                            <button class="btn-gold" style="width: 100%; max-width: 300px; padding: 15px; border-radius: 8px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer;" onclick="window.location.href='index.html'">Voltar para a Home</button>
                        </div>
                    `;
                }

                const stepper = document.querySelector('.stepper-container');
                if(stepper) stepper.style.display = 'none';

            } catch (err) {
                console.error("Erro fatal ao salvar agendamento:", err);
                
                // MOSTRA O ERRO EXATO NA TELA E DESTRAVA O BOTÃO
                alert("Erro no Banco de Dados: " + (err.message || JSON.stringify(err)));
                
                if (btnFinalizar) {
                    btnFinalizar.innerHTML = textoOriginal;
                    btnFinalizar.disabled = false;
                }
            }
        }