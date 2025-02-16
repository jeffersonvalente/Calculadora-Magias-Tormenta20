let spells = [];
let selectedSpell = null;
let editingSpell = null;

document.addEventListener('DOMContentLoaded', () => {
    const spellForm = document.getElementById('spellForm');
    const addAprimoramentoBtn = document.getElementById('addAprimoramento');
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    const formContainer = document.getElementById('spellFormContainer');
    const cancelFormBtn = document.getElementById('cancelForm');

    loadSpells();
    
    spellForm.addEventListener('submit', handleSpellSubmit);
    addAprimoramentoBtn.addEventListener('click', addAprimoramentoField);

    toggleFormBtn.addEventListener('click', () => {
        formContainer.style.display = 'block';
        toggleFormBtn.style.display = 'none';
    });

    cancelFormBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        toggleFormBtn.style.display = 'block';
        spellForm.reset();
        document.getElementById('aprimoramentosContainer').innerHTML = '';
    });

    // Após salvar uma magia, esconde o formulário
    const originalHandleSubmit = handleSpellSubmit;
    spellForm.addEventListener('submit', (e) => {
        originalHandleSubmit(e);
        formContainer.style.display = 'none';
        toggleFormBtn.style.display = 'block';
    });
});

function addAprimoramentoField() {
    const pmInput = document.getElementById('novoPM');
    const descInput = document.getElementById('novaDescricao');
    const aumentaCheck = document.getElementById('novoAumenta');
    
    const pm = pmInput.value;
    const descricao = descInput.value;
    
    if (!pm || !descricao || isNaN(pm)) {
        return;
    }

    const container = document.getElementById('aprimoramentosContainer');
    const div = document.createElement('div');
    div.className = 'aprimoramento-entry';
    
    div.innerHTML = `
        <input type="number" value="${pm}" class="pm-input" readonly>
        <input type="text" value="${descricao}" class="desc-input" readonly>
        <input type="checkbox" class="aumenta-check" ${aumentaCheck.checked ? 'checked' : ''} disabled>
        <label>Aumenta?</label>
        <button type="button" class="remove-button">-</button>
    `;
    
    div.querySelector('.remove-button').addEventListener('click', () => {
        div.remove();
    });
    
    container.appendChild(div);
    
    // Limpa os campos
    pmInput.value = '';
    descInput.value = '';
    aumentaCheck.checked = false;
}

function handleSpellSubmit(e) {
    e.preventDefault();
    
    const spell = {
        id: editingSpell ? editingSpell.id : Date.now(),
        nome: document.getElementById('nome').value,
        custo: parseInt(document.getElementById('custo').value),
        execucao: document.getElementById('execucao').value,
        alcance: document.getElementById('alcance').value,
        alvoArea: document.getElementById('alvoArea').value,
        duracao: document.getElementById('duracao').value,
        resistencia: document.getElementById('resistencia').value,
        descricao: document.getElementById('descricao').value,
        aprimoramentos: []
    };

    const aprimoramentoEntries = document.querySelectorAll('.aprimoramento-entry');
    aprimoramentoEntries.forEach(entry => {
        const pm = entry.querySelector('.pm-input').value;
        const desc = entry.querySelector('.desc-input').value;
        const aumenta = entry.querySelector('.aumenta-check').checked;
        
        if (pm && desc) {
            spell.aprimoramentos.push({
                pm: parseInt(pm),
                descricao: desc,
                aumenta: aumenta,
                count: 0
            });
        }
    });

    if (editingSpell) {
        const index = spells.findIndex(s => s.id === editingSpell.id);
        spells[index] = spell;
        editingSpell = null;
    } else {
        spells.push(spell);
    }

    saveSpells();
    updateSpellsList();
    e.target.reset();
    document.getElementById('aprimoramentosContainer').innerHTML = '';
    addAprimoramentoField();
}

function saveSpells() {
    localStorage.setItem('spells', JSON.stringify(spells));
}

function loadSpells() {
    const savedSpells = localStorage.getItem('spells');
    if (savedSpells) {
        spells = JSON.parse(savedSpells);
        updateSpellsList();
    }
}

function updateSpellsList() {
    const spellsList = document.getElementById('spellsList');
    spellsList.innerHTML = '';
    
    spells.forEach(spell => {
        const div = document.createElement('div');
        div.className = 'spell-item';
        if (selectedSpell && selectedSpell.id === spell.id) {
            div.classList.add('selected');
        }
        
        div.innerHTML = `
            <h3>${spell.nome}</h3>
            <p>Custo Base: ${spell.custo} PM</p>
            <div class="spell-actions">
                <button class="edit-spell">Editar</button>
                <button class="delete-spell">Excluir</button>
            </div>
        `;
        
        div.addEventListener('click', () => selectSpell(spell));
        div.querySelector('.edit-spell').addEventListener('click', (e) => {
            e.stopPropagation();
            editSpell(spell);
        });
        div.querySelector('.delete-spell').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSpell(spell);
        });
        
        spellsList.appendChild(div);
    });
}

function selectSpell(spell) {
    selectedSpell = spell;
    updateSpellsList();
    updateSpellDetails();
}

function updateSpellDetails() {
    const detailsDiv = document.getElementById('spellDetails');
    const custoTotalSpan = document.getElementById('custoTotalValue');
    
    if (!selectedSpell) {
        detailsDiv.innerHTML = '<p>Selecione uma magia para ver seus detalhes</p>';
        custoTotalSpan.textContent = '0';
        return;
    }

    let custoTotal = selectedSpell.custo;
    
    let aprimoramentosHtml = selectedSpell.aprimoramentos.map(apr => {
        const isAumenta = apr.descricao.toLowerCase().startsWith('aumenta');
        const inputHtml = isAumenta ? 
            `<div class="aumenta-controls">
                <button class="btn-minus">-</button>
                <span class="count-value">0</span>
                <button class="btn-plus">+</button>
             </div>` :
            `<input type="checkbox" class="apr-check">`;
            
        return `
            <div class="aprimoramento-item">
                <div class="apr-header">
                    <strong>+${apr.pm} PM</strong> - ${apr.descricao}
                </div>
                <div class="apr-controls">
                    ${inputHtml}
                    <span class="apr-custo-atual">(+0 PM)</span>
                </div>
            </div>
        `;
    }).join('');

    detailsDiv.innerHTML = `
        <h3>${selectedSpell.nome}</h3>
        <div class="spell-info">
            <p><strong>Custo Base:</strong> ${selectedSpell.custo} PM</p>
            <p><strong>Execução:</strong> ${selectedSpell.execucao}</p>
            <p><strong>Alcance:</strong> ${selectedSpell.alcance}</p>
            <p><strong>Alvo ou Área:</strong> ${selectedSpell.alvoArea}</p>
            <p><strong>Duração:</strong> ${selectedSpell.duracao}</p>
            <p><strong>Resistência:</strong> ${selectedSpell.resistencia}</p>
            <p><strong>Descrição:</strong></p>
            <p class="spell-description">${selectedSpell.descricao}</p>
        </div>
        <div class="aprimoramentos-section">
            <h4>Aprimoramentos Disponíveis:</h4>
            <div class="aprimoramentos-list">
                ${aprimoramentosHtml}
            </div>
        </div>
    `;

    const updateCustoTotal = () => {
        custoTotal = selectedSpell.custo;
        const aprimoramentoItems = detailsDiv.querySelectorAll('.aprimoramento-item');
        
        aprimoramentoItems.forEach((item, index) => {
            const apr = selectedSpell.aprimoramentos[index];
            const custoAtualSpan = item.querySelector('.apr-custo-atual');
            let custoApr = 0;

            if (apr.descricao.toLowerCase().startsWith('aumenta')) {
                const count = parseInt(item.querySelector('.count-value').textContent) || 0;
                custoApr = apr.pm * count;
            } else {
                const isChecked = item.querySelector('.apr-check').checked;
                custoApr = isChecked ? apr.pm : 0;
            }

            custoAtualSpan.textContent = custoApr > 0 ? `(+${custoApr} PM)` : '(+0 PM)';
            custoTotal += custoApr;
        });

        custoTotalSpan.textContent = custoTotal;
        saveSpells(); // Salva o estado atual dos aprimoramentos
    };

    // Adiciona eventos para os controles de "Aumenta"
    detailsDiv.querySelectorAll('.aumenta-controls').forEach((controls, index) => {
        const countSpan = controls.querySelector('.count-value');
        const btnMinus = controls.querySelector('.btn-minus');
        const btnPlus = controls.querySelector('.btn-plus');

        btnMinus.addEventListener('click', () => {
            const currentCount = parseInt(countSpan.textContent) || 0;
            if (currentCount > 0) {
                countSpan.textContent = currentCount - 1;
                updateCustoTotal();
            }
        });

        btnPlus.addEventListener('click', () => {
            const currentCount = parseInt(countSpan.textContent) || 0;
            countSpan.textContent = currentCount + 1;
            updateCustoTotal();
        });
    });

    // Adiciona eventos para os checkboxes
    detailsDiv.querySelectorAll('.apr-check').forEach((checkbox, index) => {
        checkbox.addEventListener('change', updateCustoTotal);
    });

    updateCustoTotal();
}

function editSpell(spell) {
    editingSpell = spell;
    
    // Mostra o formulário
    const formContainer = document.getElementById('spellFormContainer');
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    formContainer.style.display = 'block';
    toggleFormBtn.style.display = 'none';
    
    document.getElementById('nome').value = spell.nome;
    document.getElementById('custo').value = spell.custo;
    document.getElementById('execucao').value = spell.execucao;
    document.getElementById('alcance').value = spell.alcance;
    document.getElementById('alvoArea').value = spell.alvoArea;
    document.getElementById('duracao').value = spell.duracao;
    document.getElementById('resistencia').value = spell.resistencia;
    document.getElementById('descricao').value = spell.descricao;
    
    const container = document.getElementById('aprimoramentosContainer');
    container.innerHTML = '';
    
    spell.aprimoramentos.forEach(apr => {
        const div = document.createElement('div');
        div.className = 'aprimoramento-entry';
        div.innerHTML = `
            <input type="number" value="${apr.pm}" class="pm-input" readonly>
            <input type="text" value="${apr.descricao}" class="desc-input" readonly>
            <input type="checkbox" class="aumenta-check" ${apr.aumenta ? 'checked' : ''} disabled>
            <label>Aumenta?</label>
            <button type="button" class="remove-button">-</button>
        `;
        
        div.querySelector('.remove-button').addEventListener('click', () => {
            div.remove();
        });
        
        container.appendChild(div);
    });
}

function deleteSpell(spell) {
    if (confirm('Tem certeza que deseja excluir esta magia?')) {
        spells = spells.filter(s => s.id !== spell.id);
        if (selectedSpell && selectedSpell.id === spell.id) {
            selectedSpell = null;
        }
        saveSpells();
        updateSpellsList();
        updateSpellDetails();
    }
}

addAprimoramentoField();