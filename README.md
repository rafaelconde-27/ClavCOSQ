# BarberFast (Guapo The Barber) 💈

Um sistema completo e independente de gestão e agendamento para barbearias. Desenvolvido com foco em alta eficiência operacional, conversão de clientes e um design corporativo, profissional e minimalista, característico dos produtos com a assinatura **COSQ**.

O projeto utiliza uma arquitetura híbrida (MPA com comportamentos de SPA), construído com Vanilla JavaScript, CSS Puro e integrado diretamente ao Supabase (Backend as a Service).

---

## 📑 Índice
1. [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
2. [Estrutura de Arquivos](#-estrutura-de-arquivos)
3. [Módulos e Funcionalidades](#-módulos-e-funcionalidades)
4. [Esquema do Banco de Dados (Supabase)](#-esquema-do-banco-de-dados-supabase)
5. [Gestão de Estado e Segurança](#-gestão-de-estado-e-segurança)
6. [Como Executar o Projeto](#-como-executar-o-projeto)

---

## 🛠 Arquitetura e Tecnologias

O front-end foi projetado para ser leve e extremamente rápido, sem a dependência de frameworks reativos pesados (como React ou Angular), manipulando o DOM diretamente via JavaScript.

* **HTML5 & CSS3:** Estilização componentizada com CSS Variables (`:root`), CSS Grid e Flexbox. Dark Mode nativo com destaques em `#d4af37` (Dourado) e interações suaves.
* **Vanilla JavaScript (ES6+):** Lógica de negócios modularizada, requisições assíncronas (`async/await`) e manipulação de DOM baseada em transições de estado (`display: none` / `.active`).
* **Supabase (BaaS):** Banco de dados PostgreSQL, utilizado via CDN (Supabase JS SDK) para operações de CRUD em tempo real.
* **LocalStorage:** Gerenciamento de sessão "stateless" e persistência de dados temporários para evitar atritos na conversão (ex: preenchimento automático no checkout).

---

## 📁 Estrutura de Arquivos

```text
├── index.html           # Vitrine (Landing Page), Hub de Login, Planos e Perfil
├── agendamento.html     # Funil de Conversão (Wizard de 4 passos)
├── gestao.html          # Dashboard Administrativo (Acesso restrito)
│
├── css/
│   ├── index.css        # Estilos globais e vitrine
│   ├── login.css        # Modais de autenticação (backdrop-filter, inputs)
│   ├── barber.css       # Design contínuo do split de perfil (Cliente/Barbeiro)
│   ├── agendamento.css  # Stepper, cards de seleção e resumo
│   └── gestao.css       # Layout do painel (Sidebar/Navbar horizontal, Data Grids)
│
└── js/
    ├── auth.js          # Inicialização do SDK do Supabase (Client Singleton)
    ├── login.js         # Fluxos de Auth (Cliente e Barbeiro), Máscaras e Eventos de Teclado
    ├── script.js        # Lógica da Home, Checkout Sandbox e Histórico de Agendamentos
    ├── agendamento.js   # Máquina de estado do Wizard, cruzamento de horários livres
    └── gestao.js        # CRUDs de Equipe/Serviços, Configurações Globais e Agenda Mestra
