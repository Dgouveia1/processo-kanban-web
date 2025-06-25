
// Dados simulados para demonstração
let currentUser = null;
let processes = [
    {
        id: 1,
        number: "5005618-91.2023.4.03.6109",
        client: "Maria Silva Santos",
        cpf: "123.456.789-00",
        oab: "SP123456",
        stage: "analysis",
        entryDate: "2023-10-15",
        lawyer: "Dr. João Oliveira",
        description: "Ação de Cobrança - Contrato de Prestação de Serviços"
    },
    {
        id: 2,
        number: "1001234-56.2024.8.26.0100",
        client: "Carlos Pereira Lima",
        cpf: "987.654.321-00",
        oab: "SP234567",
        stage: "distributed",
        entryDate: "2024-01-20",
        lawyer: "Dra. Ana Costa",
        description: "Divórcio Consensual"
    },
    {
        id: 3,
        number: "2002468-13.2024.5.02.0011",
        client: "Empresa ABC Ltda",
        cpf: "12.345.678/0001-90",
        oab: "SP345678",
        stage: "hearing",
        entryDate: "2024-02-10",
        lawyer: "Dr. Roberto Silva",
        description: "Ação Trabalhista - Rescisão Indireta"
    },
    {
        id: 4,
        number: "7007890-12.2023.8.26.0602",
        client: "José Santos Filho",
        cpf: "456.789.123-00",
        oab: "SP456789",
        stage: "sentenced",
        entryDate: "2023-08-05",
        lawyer: "Dra. Patricia Alves",
        description: "Indenização por Danos Morais"
    },
    {
        id: 5,
        number: "3003579-24.2022.4.01.3400",
        client: "Loja XYZ S.A.",
        cpf: "98.765.432/0001-10",
        oab: "SP567890",
        stage: "archived",
        entryDate: "2022-12-01",
        lawyer: "Dr. Fernando Rocha",
        description: "Mandado de Segurança - Tributário"
    }
];

let financialData = [
    {
        id: 1,
        date: "2024-01-15",
        client: "Maria Silva Santos",
        value: 2500.00,
        status: "paid",
        payment: "PIX"
    },
    {
        id: 2,
        date: "2024-01-20",
        client: "Carlos Pereira Lima",
        value: 1800.00,
        status: "pending",
        payment: "Boleto"
    },
    {
        id: 3,
        date: "2024-01-10",
        client: "Empresa ABC Ltda",
        value: 5000.00,
        status: "overdue",
        payment: "Transferência"
    },
    {
        id: 4,
        date: "2024-01-25",
        client: "José Santos Filho",
        value: 3200.00,
        status: "paid",
        payment: "Cartão"
    },
    {
        id: 5,
        date: "2024-01-30",
        client: "Loja XYZ S.A.",
        value: 4500.00,
        status: "pending",
        payment: "Boleto"
    }
];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema AdvogaSystem iniciado');
    
    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainSystem();
    } else {
        showLoginForm();
    }
    
    // Event listeners para formulários
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Inicializar dados se o usuário estiver logado
    if (currentUser) {
        updateDashboard();
        renderKanbanBoard();
        renderFinancialTable();
    }
});

// =================== AUTENTICAÇÃO ===================

function showLoginForm() {
    console.log('Mostrando tela de login');
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('mainSystem').classList.remove('active');
}

function showRegisterForm() {
    console.log('Mostrando tela de cadastro');
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.add('active');
    document.getElementById('mainSystem').classList.remove('active');
}

function handleLogin(e) {
    e.preventDefault();
    console.log('Tentativa de login');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validação básica
    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Simular autenticação (em produção, seria feita no backend)
    const userData = {
        id: 1,
        name: "Dr. João Silva",
        email: email,
        oab: "SP123456"
    };
    
    currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    console.log('Login realizado com sucesso:', userData);
    showMainSystem();
}

function handleRegister(e) {
    e.preventDefault();
    console.log('Tentativa de cadastro');
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const oab = document.getElementById('registerOAB').value;
    const password = document.getElementById('registerPassword').value;
    
    // Validação básica
    if (!name || !email || !oab || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Simular cadastro (em produção, seria feito no backend)
    const userData = {
        id: Date.now(),
        name: name,
        email: email,
        oab: oab
    };
    
    currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    console.log('Cadastro realizado com sucesso:', userData);
    alert('Cadastro realizado com sucesso!');
    showMainSystem();
}

function showMainSystem() {
    console.log('Mostrando sistema principal');
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('mainSystem').classList.add('active');
    
    // Atualizar interface com dados do usuário
    if (currentUser) {
        document.getElementById('userWelcome').textContent = `Bem-vindo, ${currentUser.name}!`;
        updateDashboard();
        renderKanbanBoard();
        renderFinancialTable();
    }
}

function logout() {
    console.log('Fazendo logout');
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginForm();
    
    // Limpar formulários
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

// =================== NAVEGAÇÃO ===================

function showSection(sectionName) {
    console.log('Navegando para seção:', sectionName);
    
    // Remover classe active de todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Ativar seção e botão correspondentes
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    // Atualizar dados da seção se necessário
    switch(sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'kanban':
            renderKanbanBoard();
            break;
        case 'financial':
            renderFinancialTable();
            break;
    }
}

// =================== DASHBOARD ===================

function updateDashboard() {
    console.log('Atualizando dashboard');
    
    // Contar processos por etapa
    const counts = {
        analysis: processes.filter(p => p.stage === 'analysis').length,
        distributed: processes.filter(p => p.stage === 'distributed').length,
        hearing: processes.filter(p => p.stage === 'hearing').length,
        sentenced: processes.filter(p => p.stage === 'sentenced').length,
        archived: processes.filter(p => p.stage === 'archived').length
    };
    
    // Atualizar números nos cards
    document.getElementById('countAnalysis').textContent = counts.analysis;
    document.getElementById('countDistributed').textContent = counts.distributed;
    document.getElementById('countHearing').textContent = counts.hearing;
    document.getElementById('countSentenced').textContent = counts.sentenced;
    document.getElementById('countArchived').textContent = counts.archived;
    
    console.log('Contadores atualizados:', counts);
}

// =================== KANBAN ===================

function renderKanbanBoard() {
    console.log('Renderizando board Kanban');
    
    const stages = ['analysis', 'distributed', 'hearing', 'sentenced', 'archived'];
    
    stages.forEach(stage => {
        const container = document.getElementById(`kanban-${stage}`);
        const stageProcesses = processes.filter(p => p.stage === stage);
        
        container.innerHTML = '';
        
        stageProcesses.forEach(process => {
            const card = createProcessCard(process);
            container.appendChild(card);
        });
    });
    
    // Adicionar funcionalidade de drag and drop
    addDragAndDropListeners();
}

function createProcessCard(process) {
    const card = document.createElement('div');
    card.className = 'process-card';
    card.draggable = true;
    card.dataset.processId = process.id;
    
    card.innerHTML = `
        <h4>${process.number}</h4>
        <p><strong>Cliente:</strong> ${process.client}</p>
        <p><strong>CPF/CNPJ:</strong> ${process.cpf}</p>
        <p class="oab"><strong>OAB:</strong> ${process.oab}</p>
        <p><strong>Advogado:</strong> ${process.lawyer}</p>
    `;
    
    card.addEventListener('click', () => showProcessDetails(process.id));
    
    return card;
}

function addDragAndDropListeners() {
    console.log('Adicionando listeners de drag and drop');
    
    // Adicionar listeners aos cards
    document.querySelectorAll('.process-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    // Adicionar listeners às colunas
    document.querySelectorAll('.kanban-cards').forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    console.log('Iniciando drag');
    e.dataTransfer.setData('text/plain', e.target.dataset.processId);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    console.log('Finalizando drag');
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.parentElement.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.parentElement.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    console.log('Drop realizado');
    
    const processId = parseInt(e.dataTransfer.getData('text/plain'));
    const newStage = e.currentTarget.parentElement.dataset.stage;
    
    // Remover classe de destaque
    e.currentTarget.parentElement.classList.remove('drag-over');
    
    // Atualizar processo
    const process = processes.find(p => p.id === processId);
    if (process) {
        process.stage = newStage;
        console.log(`Processo ${processId} movido para ${newStage}`);
        
        // Re-renderizar kanban e dashboard
        renderKanbanBoard();
        updateDashboard();
    }
}

// =================== MODAL DE PROCESSOS ===================

function showProcessDetails(processId) {
    console.log('Mostrando detalhes do processo:', processId);
    
    const process = processes.find(p => p.id === processId);
    if (!process) return;
    
    const detailsHtml = `
        <div class="process-detail">
            <p><strong>Número:</strong> ${process.number}</p>
            <p><strong>Cliente:</strong> ${process.client}</p>
            <p><strong>CPF/CNPJ:</strong> ${process.cpf}</p>
            <p><strong>OAB:</strong> ${process.oab}</p>
            <p><strong>Etapa:</strong> ${getStageLabel(process.stage)}</p>
            <p><strong>Data de Entrada:</strong> ${formatDate(process.entryDate)}</p>
            <p><strong>Advogado Responsável:</strong> ${process.lawyer}</p>
            <p><strong>Descrição:</strong> ${process.description}</p>
        </div>
    `;
    
    document.getElementById('processDetails').innerHTML = detailsHtml;
    document.getElementById('processModal').style.display = 'block';
    
    // Armazenar ID do processo atual para edição
    document.getElementById('processModal').dataset.currentProcessId = processId;
}

function closeModal() {
    console.log('Fechando modal');
    document.getElementById('processModal').style.display = 'none';
}

function editProcess() {
    const processId = parseInt(document.getElementById('processModal').dataset.currentProcessId);
    console.log('Editando processo:', processId);
    
    // Em um sistema real, abriria um formulário de edição
    alert('Funcionalidade de edição será implementada em breve!');
}

function getStageLabel(stage) {
    const labels = {
        'analysis': 'Em Análise',
        'distributed': 'Distribuído',
        'hearing': 'Em Audiência',
        'sentenced': 'Sentenciado',
        'archived': 'Arquivado'
    };
    return labels[stage] || stage;
}

// =================== FINANCEIRO ===================

function renderFinancialTable() {
    console.log('Renderizando tabela financeira');
    
    const tbody = document.getElementById('financialTableBody');
    tbody.innerHTML = '';
    
    financialData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td>${item.client}</td>
            <td>R$ ${item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td><span class="status-badge status-${item.status}">${getStatusLabel(item.status)}</span></td>
            <td>${item.payment}</td>
        `;
        tbody.appendChild(row);
    });
}

function filterFinancial(status) {
    console.log('Filtrando financeiro por status:', status);
    
    const tbody = document.getElementById('financialTableBody');
    tbody.innerHTML = '';
    
    const filteredData = financialData.filter(item => item.status === status);
    
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td>${item.client}</td>
            <td>R$ ${item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td><span class="status-badge status-${item.status}">${getStatusLabel(item.status)}</span></td>
            <td>${item.payment}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Destacar card selecionado temporariamente
    document.querySelectorAll('.financial-card').forEach(card => {
        card.style.transform = '';
    });
    
    const selectedCard = document.querySelector(`.financial-card.${status}`);
    if (selectedCard) {
        selectedCard.style.transform = 'scale(1.05)';
        setTimeout(() => {
            selectedCard.style.transform = '';
        }, 1000);
    }
}

function getStatusLabel(status) {
    const labels = {
        'paid': 'Pago',
        'pending': 'Pendente',
        'overdue': 'Atrasado'
    };
    return labels[status] || status;
}

// =================== BUSCA AVANÇADA ===================

function searchByCPF() {
    const cpf = document.getElementById('searchCPF').value.trim();
    console.log('Buscando por CPF:', cpf);
    
    if (!cpf) {
        alert('Por favor, digite um CPF para buscar.');
        return;
    }
    
    const results = processes.filter(process => 
        process.cpf.includes(cpf) || process.cpf.replace(/\D/g, '').includes(cpf.replace(/\D/g, ''))
    );
    
    displaySearchResults(results, 'CPF', cpf);
}

function searchByOAB() {
    const oab = document.getElementById('searchOAB').value.trim();
    console.log('Buscando por OAB:', oab);
    
    if (!oab) {
        alert('Por favor, digite um número da OAB para buscar.');
        return;
    }
    
    const results = processes.filter(process => 
        process.oab.toLowerCase().includes(oab.toLowerCase())
    );
    
    displaySearchResults(results, 'OAB', oab);
}

function displaySearchResults(results, searchType, searchTerm) {
    console.log(`Resultados da busca por ${searchType}:`, results);
    
    const resultsContainer = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>Nenhum processo encontrado para ${searchType}: <strong>${searchTerm}</strong></p>
            </div>
        `;
        return;
    }
    
    let resultsHtml = `
        <h3>Resultados da busca por ${searchType}: <strong>${searchTerm}</strong></h3>
        <p>Encontrados ${results.length} processo(s):</p>
    `;
    
    results.forEach(process => {
        resultsHtml += `
            <div class="result-item" onclick="showProcessDetails(${process.id})">
                <h4>${process.number}</h4>
                <p><strong>Cliente:</strong> ${process.client}</p>
                <p><strong>CPF/CNPJ:</strong> ${process.cpf}</p>
                <p><strong>OAB:</strong> ${process.oab}</p>
                <p><strong>Etapa:</strong> ${getStageLabel(process.stage)}</p>
                <p><strong>Advogado:</strong> ${process.lawyer}</p>
                <p class="click-hint">Clique para ver mais detalhes</p>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHtml;
}

// =================== UTILITÁRIOS ===================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Fechar modal quando clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('processModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Adicionar alguns processos extras para demonstração
function addSampleData() {
    const extraProcesses = [
        {
            id: 6,
            number: "4004567-89.2024.8.26.0100",
            client: "Indústria DEF Ltda",
            cpf: "11.222.333/0001-44",
            oab: "SP678901",
            stage: "analysis",
            entryDate: "2024-03-01",
            lawyer: "Dr. Marcos Andrade",
            description: "Ação de Execução - Título Executivo"
        },
        {
            id: 7,
            number: "6006789-01.2024.5.02.0031",
            client: "Sandra Oliveira",
            cpf: "789.123.456-00",
            oab: "SP789012",
            stage: "distributed",
            entryDate: "2024-02-15",
            lawyer: "Dra. Luciana Ferreira",
            description: "Reclamação Trabalhista - Horas Extras"
        }
    ];
    
    processes.push(...extraProcesses);
    
    console.log('Dados de exemplo adicionados');
}

// Adicionar dados de exemplo ao carregar
setTimeout(() => {
    addSampleData();
    if (currentUser) {
        updateDashboard();
        renderKanbanBoard();
    }
}, 1000);

console.log('Sistema AdvogaSystem carregado com sucesso!');
