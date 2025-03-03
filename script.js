let spells = [];
let selectedSpell = null;
let editingSpell = null;

document.addEventListener('DOMContentLoaded', () => {
  // Carrega os valores salvos do localStorage
  loadState();
  // Atualiza o mana disponível com base nos valores carregados
  updateManaInfo();

  const spellForm = document.getElementById('spellForm');
  const addAprimoramentoBtn = document.getElementById('addAprimoramento');
  const toggleFormBtn = document.getElementById('toggleFormBtn');
  const formContainer = document.getElementById('spellFormContainer');
  const cancelFormBtn = document.getElementById('cancelForm');
  const overlayBackdrop = document.getElementById('overlayBackdrop');
  const manaPool = document.getElementById('manaPool');
  const resistanceDC = document.getElementById('resistanceDC');
  const deductManaBtn = document.getElementById('deductManaBtn');
  const recoverManaBtn = document.getElementById('recoverManaBtn');
  const formTitle = document.getElementById('formTitle');

  loadSpells();
  updateSpellDetails(); // se não houver magia, oculta custo total

  // Formulário
  spellForm.addEventListener('submit', handleSpellSubmit);
  addAprimoramentoBtn.addEventListener('click', addAprimoramentoField);

  // Botão Nova Magia
  toggleFormBtn.addEventListener('click', () => {
    editingSpell = null; // Estamos criando uma nova magia
    formTitle.textContent = "Nova Magia";
    formContainer.classList.add('open');
    overlayBackdrop.classList.add('open');
    spellForm.reset();
    document.getElementById('existingAprimoramentosSection').style.display = 'none';
    document.getElementById('existingAprimoramentosContainer').innerHTML = '';
    document.getElementById('aprimoramentosContainer').innerHTML = '';
  });

  // Botão Cancelar
  cancelFormBtn.addEventListener('click', () => {
    formContainer.classList.remove('open');
    overlayBackdrop.classList.remove('open');
    spellForm.reset();
    document.getElementById('existingAprimoramentosSection').style.display = 'none';
    document.getElementById('existingAprimoramentosContainer').innerHTML = '';
    document.getElementById('aprimoramentosContainer').innerHTML = '';
  });

  // Fecha painel após submit
  spellForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSpellSubmit(e);
    formContainer.classList.remove('open');
    overlayBackdrop.classList.remove('open');
  });

  // Mana e Resistência - adiciona saveState após atualização
  manaPool.addEventListener('input', () => {
    updateManaInfo();
    saveState();
  });
  resistanceDC.addEventListener('input', () => {
    updateResistanceInfo();
    saveState();
  });
  deductManaBtn.addEventListener('click', deductMana);

  // Recuperar Mana
  recoverManaBtn.addEventListener('click', () => {
    const recoverInput = document.getElementById('recoverAmount');
    const amount = parseInt(recoverInput.value) || 0;
    if (amount > 0) {
      recoverMana(amount);
      showRecoverMessage('PM Recuperado!');
    }
  });

  // Fecha se clicar no backdrop
  overlayBackdrop.addEventListener('click', () => {
    formContainer.classList.remove('open');
    overlayBackdrop.classList.remove('open');
  });
});

// Funções para persistência via localStorage
function saveState() {
  localStorage.setItem('manaPool', document.getElementById('manaPool').value);
  localStorage.setItem('manaSpent', document.getElementById('manaSpent').textContent);
  localStorage.setItem('resistanceDC', document.getElementById('resistanceDC').value);
}

function loadState() {
  const manaPoolVal = localStorage.getItem('manaPool');
  if (manaPoolVal !== null) {
    document.getElementById('manaPool').value = manaPoolVal;
  }
  const manaSpentVal = localStorage.getItem('manaSpent');
  if (manaSpentVal !== null) {
    document.getElementById('manaSpent').textContent = manaSpentVal;
  }
  const resistanceDCVal = localStorage.getItem('resistanceDC');
  if (resistanceDCVal !== null) {
    document.getElementById('resistanceDC').value = resistanceDCVal;
  }
}

function updateManaInfo() {
  const manaPool = document.getElementById('manaPool');
  const manaAvailable = document.getElementById('manaAvailable');
  const manaSpentSpan = document.getElementById('manaSpent');
  const totalMana = parseInt(manaPool.value) || 0;
  const spentMana = parseInt(manaSpentSpan.textContent) || 0;
  const availableMana = Math.max(0, totalMana - spentMana);

  manaAvailable.textContent = availableMana;
  
  const availableCircle = document.querySelector('.circle-border.available');
  if (totalMana > 0) {
    const availablePercentage = (availableMana / totalMana) * 100;
    availableCircle.style.setProperty('--percentage', `${availablePercentage}%`);
    
    let availableGradient;
    if (availablePercentage <= 25) {
      availableGradient = `linear-gradient(135deg, var(--danger-color) ${availablePercentage}%, rgba(255,82,82,0.2))`;
    } else if (availablePercentage <= 50) {
      availableGradient = `linear-gradient(135deg, var(--secondary-color) ${availablePercentage}%, rgba(255,152,0,0.2))`;
    } else {
      availableGradient = `linear-gradient(135deg, var(--success-color) ${availablePercentage}%, rgba(179,136,255,0.2))`;
    }
    availableCircle.style.setProperty('--border-gradient', availableGradient);
    
    const borderWidth = Math.max(2, 5 * (availablePercentage / 100));
    availableCircle.style.borderWidth = `${borderWidth}px`;
  } else {
    availableCircle.style.setProperty('--percentage', '0%');
    availableCircle.style.setProperty('--border-gradient', 'linear-gradient(135deg, var(--danger-color) 0%, rgba(255,82,82,0.2))');
    availableCircle.style.borderWidth = '2px';
  }
  
  const recoverManaBtn = document.getElementById('recoverManaBtn');
  recoverManaBtn.disabled = availableMana >= totalMana;

  updateDeductButton();
}

function updateResistanceInfo() {
  const resistanceDC = document.getElementById('resistanceDC');
  const baseCD = parseInt(resistanceDC.value) || 10;
  
  const baseCDCircle = document.querySelector('.circle-border.base-cd');
  const gradientStyle = `linear-gradient(135deg, var(--primary-color), var(--primary-dark))`;
  baseCDCircle.style.setProperty('--border-gradient', gradientStyle);
}

function updateDeductButton() {
  const deductManaBtn = document.getElementById('deductManaBtn');
  const manaAvailable = document.getElementById('manaAvailable');
  const custoTotalValue = document.getElementById('custoTotalValue');
  const availableMana = parseInt(manaAvailable.textContent) || 0;
  const spellCost = parseInt(custoTotalValue.textContent) || 0;

  if (!selectedSpell) {
    deductManaBtn.disabled = true;
    return;
  }

  // Se houver Truque
  const hasTruque = selectedSpell.aprimoramentos.some(apr => 
    apr.count > 0 && apr.descricao.toLowerCase().startsWith('truque')
  );
  if (hasTruque) {
    deductManaBtn.disabled = true;
    custoTotalValue.textContent = '0';
    return;
  }
  deductManaBtn.disabled = (spellCost === 0) || (spellCost > availableMana);
}

function deductMana() {
  const manaSpentSpan = document.getElementById('manaSpent');
  const custoTotalValue = document.getElementById('custoTotalValue');
  const spellCost = parseInt(custoTotalValue.textContent) || 0;
  if (spellCost > 0) {
    manaSpentSpan.textContent = parseInt(manaSpentSpan.textContent || 0) + spellCost;
    updateManaInfo();
    saveState(); // Salva o estado após deduzir mana
  }
}

function recoverMana(amount) {
  const manaSpentSpan = document.getElementById('manaSpent');
  const manaPool = document.getElementById('manaPool');
  const currentSpent = parseInt(manaSpentSpan.textContent) || 0;
  const totalMana = parseInt(manaPool.value) || 0;
  const maxRecover = Math.min(amount, currentSpent);
  const newSpent = Math.max(0, currentSpent - maxRecover);
  manaSpentSpan.textContent = newSpent;
  updateManaInfo();
  saveState(); // Salva o estado após recuperar mana
}

function showRecoverMessage(message) {
  const messageDiv = document.getElementById('recoverMessage');
  messageDiv.textContent = message;
  messageDiv.classList.add('show');
  setTimeout(() => {
    messageDiv.classList.remove('show');
  }, 2000);
}

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
    <button type="button" class="remove-button" aria-label="Remover Aprimoramento">-</button>
  `;
  div.querySelector('.remove-button').addEventListener('click', () => {
    div.remove();
  });
  container.appendChild(div);
  pmInput.value = '';
  descInput.value = '';
  aumentaCheck.checked = false;
}

function validateSpellForm() {
  const nome = document.getElementById('nome').value.trim();
  const custo = document.getElementById('custo').value;
  const execucao = document.getElementById('execucao').value.trim();
  const alcance = document.getElementById('alcance').value.trim();
  const alvoArea = document.getElementById('alvoArea').value.trim();
  const duracao = document.getElementById('duracao').value.trim();
  const resistencia = document.getElementById('resistencia').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  
  if (!nome || !custo || !execucao || !alcance || !alvoArea || !duracao || !descricao) {
    alert('Por favor, preencha todos os campos obrigatórios da magia.');
    return false;
  }
  if (isNaN(parseInt(custo)) || parseInt(custo) < 0) {
    alert('O custo da magia deve ser um número válido maior ou igual a zero.');
    return false;
  }
  return true;
}

function handleSpellSubmit(e) {
  e.preventDefault();
  if (!validateSpellForm()) {
    return;
  }
  const spell = {
    id: editingSpell ? editingSpell.id : Date.now(),
    nome: document.getElementById('nome').value.trim(),
    custo: parseInt(document.getElementById('custo').value),
    execucao: document.getElementById('execucao').value.trim(),
    alcance: document.getElementById('alcance').value.trim(),
    alvoArea: document.getElementById('alvoArea').value.trim(),
    duracao: document.getElementById('duracao').value.trim(),
    resistencia: document.getElementById('resistencia').value.trim(),
    descricao: document.getElementById('descricao').value.trim(),
    aprimoramentos: editingSpell ? [...editingSpell.aprimoramentos] : []
  };

  // Pega novos aprimoramentos do container
  const aprEntries = document.querySelectorAll('#aprimoramentosContainer .aprimoramento-entry');
  let hasInvalidAprimoramento = false;
  aprEntries.forEach(entry => {
    const pmInput = entry.querySelector('.pm-input');
    const descInput = entry.querySelector('.desc-input');
    const aumentaCheck = entry.querySelector('.aumenta-check');
    const pm = pmInput.value.trim();
    const desc = descInput.value.trim();
    const aumenta = aumentaCheck.checked;
    if (pm || desc) {
      if (!pm || !desc || isNaN(parseInt(pm)) || parseInt(pm) < 0) {
        hasInvalidAprimoramento = true;
        pmInput.classList.add('invalid');
        descInput.classList.add('invalid');
      } else {
        spell.aprimoramentos.push({
          pm: parseInt(pm),
          descricao: desc,
          aumenta: aumenta,
          count: 0
        });
      }
    }
  });

  if (hasInvalidAprimoramento) {
    alert('Verifique os campos de aprimoramento. O PM deve ser válido e a descrição preenchida.');
    return;
  }

  if (editingSpell) {
    // Atualiza magia existente
    const index = spells.findIndex(s => s.id === editingSpell.id);
    spells[index] = spell;
    editingSpell = null;
  } else {
    // Nova magia
    spells.push(spell);
  }

  saveSpells();
  updateSpellsList();
  e.target.reset();
  document.getElementById('existingAprimoramentosSection').style.display = 'none';
  document.getElementById('existingAprimoramentosContainer').innerHTML = '';
  document.getElementById('aprimoramentosContainer').innerHTML = '';
}

const API_BASE = window.location.origin;

async function saveSpells() {
  try {
    if (editingSpell) {
      await fetch(`${API_BASE}/api/spells/${editingSpell.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSpell)
      });
    } else {
      await fetch(`${API_BASE}/api/spells`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spells[spells.length - 1])
      });
    }
  } catch (err) {
    console.error('Erro ao salvar magia:', err);
    alert('Erro ao salvar magia. Por favor, tente novamente.');
  }
}

async function loadSpells() {
  try {
    const response = await fetch(`${API_BASE}/api/spells`);
    spells = await response.json();
    updateSpellsList();
  } catch (err) {
    console.error('Erro ao carregar magias:', err);
    alert('Erro ao carregar magias. Por favor, recarregue a página.');
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
        <button class="edit-spell" aria-label="Editar Magia">Editar</button>
        <button class="delete-spell" aria-label="Excluir Magia">Excluir</button>
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
  updateSpellsList(); // para manter a seleção visual
  updateSpellDetails();
}

function parseSpellIncrement(incrementText) {
  const diceMatch = incrementText.match(/(\d+)d(\d+)\+(\d+)/);
  if (diceMatch) {
    return {
      numDice: parseInt(diceMatch[1]),
      diceSides: parseInt(diceMatch[2]),
      bonus: parseInt(diceMatch[3])
    };
  }
  return null;
}

function parseSpellBase(spellText) {
  const diceMatch = spellText.match(/(\d+)d(\d+)\+(\d+)/);
  if (diceMatch) {
    return {
      numDice: parseInt(diceMatch[1]),
      diceSides: parseInt(diceMatch[2]),
      bonus: parseInt(diceMatch[3]),
      fullMatch: diceMatch[0],
      index: diceMatch.index,
      length: diceMatch[0].length
    };
  }
  return null;
}

function updateSpellDescription(baseText, aprimoramentos) {
  let updatedText = baseText;
  const baseValues = parseSpellBase(baseText);
  if (baseValues) {
    let totalNumDice = baseValues.numDice;
    let totalBonus = baseValues.bonus;
    aprimoramentos.forEach(apr => {
      if (apr.count && apr.count > 0 && apr.descricao.toLowerCase().startsWith('aumenta')) {
        const increment = parseSpellIncrement(apr.descricao);
        if (increment) {
          totalNumDice += increment.numDice * apr.count;
          totalBonus += increment.bonus * apr.count;
        }
      }
    });
    const beforeText = updatedText.substring(0, baseValues.index);
    const afterText = updatedText.substring(baseValues.index + baseValues.length);
    const newDiceText = `${totalNumDice}d${baseValues.diceSides}+${totalBonus}`;
    updatedText = beforeText + newDiceText + afterText;
  }
  return updatedText;
}

function updateSpellDetails() {
  const detailsDiv = document.getElementById('spellDetails');
  const custoTotalSpan = document.getElementById('custoTotalValue');
  const custoTotalContainer = document.getElementById('custoTotal');

  if (!selectedSpell) {
    detailsDiv.innerHTML = '<p>Selecione uma magia para ver seus detalhes</p>';
    custoTotalSpan.textContent = '0';
    custoTotalContainer.style.display = 'none';
    updateDeductButton();
    return;
  }

  custoTotalContainer.style.display = 'flex';

  let custoTotal = selectedSpell.custo;
  const aprimoramentosHtml = selectedSpell.aprimoramentos.map(apr => {
    const isAumenta = apr.descricao.toLowerCase().startsWith('aumenta');
    const inputHtml = isAumenta
      ? `<div class="aumenta-controls">
          <button class="btn-minus" aria-label="Diminuir">-</button>
          <span class="count-value">${apr.count || 0}</span>
          <button class="btn-plus" aria-label="Aumentar">+</button>
        </div>`
      : `<input type="checkbox" class="apr-check" ${apr.count ? 'checked' : ''} aria-label="Selecionar Aprimoramento">`;
    return `
      <div class="aprimoramento-item">
        <div class="apr-header">
          <strong>+${apr.pm} PM</strong> - ${apr.descricao}
        </div>
        <div class="apr-controls">
          ${inputHtml}
          <span class="apr-custo-atual">(+${(apr.count || 0) * apr.pm} PM)</span>
        </div>
      </div>
    `;
  }).join('');

  const updatedDescription = updateSpellDescription(selectedSpell.descricao, selectedSpell.aprimoramentos);

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
      <p class="spell-description">${updatedDescription}</p>
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
    const items = detailsDiv.querySelectorAll('.aprimoramento-item');
    items.forEach((item, index) => {
      const apr = selectedSpell.aprimoramentos[index];
      const custoAtualSpan = item.querySelector('.apr-custo-atual');
      let custoApr = 0;
      if (apr.descricao.toLowerCase().startsWith('aumenta')) {
        const count = parseInt(item.querySelector('.count-value').textContent) || 0;
        apr.count = count;
        custoApr = apr.pm * count;
      } else {
        const isChecked = item.querySelector('.apr-check').checked;
        apr.count = isChecked ? 1 : 0;
        custoApr = isChecked ? apr.pm : 0;
      }
      custoTotal += custoApr;
      custoAtualSpan.textContent = custoApr > 0 ? `(+${custoApr} PM)` : '(+0 PM)';
    });

    // Se houver Truque selecionado
    const hasTruque = selectedSpell.aprimoramentos.some(apr => 
      apr.count > 0 && apr.descricao.toLowerCase().startsWith('truque')
    );
    custoTotalSpan.textContent = hasTruque ? '0' : custoTotal;
    updateDeductButton();

    const descriptionElement = detailsDiv.querySelector('.spell-description');
    descriptionElement.textContent = updateSpellDescription(selectedSpell.descricao, selectedSpell.aprimoramentos);
    saveSpells();
  };

  // Botões + e -
  detailsDiv.querySelectorAll('.aumenta-controls').forEach(controls => {
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

  // Checkboxes
  detailsDiv.querySelectorAll('.apr-check').forEach(checkbox => {
    checkbox.addEventListener('change', updateCustoTotal);
  });

  updateCustoTotal();
  detailsDiv.classList.add('fade-in');
  setTimeout(() => {
    detailsDiv.classList.remove('fade-in');
  }, 400);
}

function editSpell(spell) {
  editingSpell = spell;

  const formContainer = document.getElementById('spellFormContainer');
  const overlayBackdrop = document.getElementById('overlayBackdrop');
  const formTitle = document.getElementById('formTitle');
  const existingSection = document.getElementById('existingAprimoramentosSection');
  const existingContainer = document.getElementById('existingAprimoramentosContainer');
  const aprContainerNovo = document.getElementById('aprimoramentosContainer');

  formTitle.textContent = `Editando: ${spell.nome}`;
  formContainer.classList.add('open');
  overlayBackdrop.classList.add('open');

  // Preenche campos
  document.getElementById('nome').value = spell.nome;
  document.getElementById('custo').value = spell.custo;
  document.getElementById('execucao').value = spell.execucao;
  document.getElementById('alcance').value = spell.alcance;
  document.getElementById('alvoArea').value = spell.alvoArea;
  document.getElementById('duracao').value = spell.duracao;
  document.getElementById('resistencia').value = spell.resistencia;
  document.getElementById('descricao').value = spell.descricao;

  // Limpa "novo" antes de mostrar
  aprContainerNovo.innerHTML = '';

  // Exibe Aprimoramentos Existentes
  existingContainer.innerHTML = '';
  existingSection.style.display = 'none';

  if (spell.aprimoramentos && spell.aprimoramentos.length > 0) {
    existingSection.style.display = 'block';
    spell.aprimoramentos.forEach(apr => {
      const div = document.createElement('div');
      div.className = 'existing-aprimoramento-card';
      div.innerHTML = `
        <div class="apr-info">
          <strong>+${apr.pm} PM</strong> - ${apr.descricao}
          ${apr.aumenta ? '<span class="aumenta-badge">Aumenta</span>' : ''}
        </div>
      `;
      existingContainer.appendChild(div);
    });
  }
}

async function deleteSpell(spell) {
  if (confirm('Tem certeza que deseja excluir esta magia?')) {
    try {
      await fetch(`${API_BASE}/api/spells/${spell.id}`, {
        method: 'DELETE'
      });
      spells = spells.filter(s => s.id !== spell.id);
      if (selectedSpell && selectedSpell.id === spell.id) {
        selectedSpell = null;
      }
      updateSpellsList();
      updateSpellDetails();
    } catch (err) {
      console.error('Erro ao excluir magia:', err);
      alert('Erro ao excluir magia. Por favor, tente novamente.');
    }
  }
}
