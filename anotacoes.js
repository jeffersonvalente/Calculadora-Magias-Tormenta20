let annotations = [];
let selectedAnnotation = null;
let editingAnnotation = null;

document.addEventListener('DOMContentLoaded', () => {
  const annotationForm = document.getElementById('annotationForm');
  const toggleAnnotationFormBtn = document.getElementById('toggleAnnotationFormBtn');
  const annotationFormContainer = document.getElementById('annotationFormContainer');
  const cancelAnnotationFormBtn = document.getElementById('cancelAnnotationForm');
  const annotationOverlayBackdrop = document.getElementById('annotationOverlayBackdrop');

  loadAnnotations();
  updateAnnotationDetails();

  // Formulário de Anotação
  annotationForm.addEventListener('submit', handleAnnotationSubmit);

  // Botão Nova Anotação
  toggleAnnotationFormBtn.addEventListener('click', () => {
    editingAnnotation = null;
    document.getElementById('annotationFormTitle').textContent = "Nova Anotação";
    annotationFormContainer.classList.add('open');
    annotationOverlayBackdrop.classList.add('open');
    annotationForm.reset();
  });

  // Botão Cancelar
  cancelAnnotationFormBtn.addEventListener('click', () => {
    annotationFormContainer.classList.remove('open');
    annotationOverlayBackdrop.classList.remove('open');
    annotationForm.reset();
  });

  // Fecha o formulário ao clicar no backdrop
  annotationOverlayBackdrop.addEventListener('click', () => {
    annotationFormContainer.classList.remove('open');
    annotationOverlayBackdrop.classList.remove('open');
  });
});

async function loadAnnotations() {
  try {
    const response = await fetch(`${window.location.origin}/api/anotacoes`);
    annotations = await response.json();
    updateAnnotationsList();
  } catch (err) {
    console.error('Erro ao carregar anotações:', err);
    alert('Erro ao carregar anotações. Por favor, recarregue a página.');
  }
}

function updateAnnotationsList() {
  const listContainer = document.getElementById('annotationsList');
  listContainer.innerHTML = '';

  annotations.forEach(annotation => {
    const div = document.createElement('div');
    div.className = 'annotation-item';
    if (selectedAnnotation && selectedAnnotation.id === annotation.id) {
      div.classList.add('selected');
    }
    div.innerHTML = `
      <h3>${annotation.titulo}</h3>
      <div class="spell-actions">
        <button class="edit-annotation" aria-label="Editar Anotação">Editar</button>
        <button class="delete-annotation" aria-label="Excluir Anotação">Excluir</button>
      </div>
    `;
    div.addEventListener('click', () => selectAnnotation(annotation));
    div.querySelector('.edit-annotation').addEventListener('click', (e) => {
      e.stopPropagation();
      editAnnotation(annotation);
    });
    div.querySelector('.delete-annotation').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteAnnotation(annotation);
    });
    listContainer.appendChild(div);
  });
}

function selectAnnotation(annotation) {
  selectedAnnotation = annotation;
  updateAnnotationsList();
  updateAnnotationDetails();
}

function updateAnnotationDetails() {
  const detailsDiv = document.getElementById('annotationDetails');
  if (!selectedAnnotation) {
    detailsDiv.innerHTML = '<p>Selecione uma anotação para ver seus detalhes</p>';
    return;
  }
  detailsDiv.innerHTML = `
    <h3>${selectedAnnotation.titulo}</h3>
    <p>${selectedAnnotation.conteudo.replace(/\n/g, '<br>')}</p>
  `;
}

async function handleAnnotationSubmit(e) {
  e.preventDefault();
  const titulo = document.getElementById('annotationTitulo').value.trim();
  const conteudo = document.getElementById('annotationConteudo').value.trim();
  if (!titulo || !conteudo) {
    alert('Preencha todos os campos da anotação.');
    return;
  }
  const annotation = {
    id: editingAnnotation ? editingAnnotation.id : Date.now(),
    titulo,
    conteudo
  };

  try {
    if (editingAnnotation) {
      // Atualizar anotação
      await fetch(`${window.location.origin}/api/anotacoes/${editingAnnotation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation)
      });
      const index = annotations.findIndex(a => a.id === editingAnnotation.id);
      annotations[index] = annotation;
      editingAnnotation = null;
    } else {
      // Nova anotação
      await fetch(`${window.location.origin}/api/anotacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation)
      });
      annotations.push(annotation);
    }
    updateAnnotationsList();
    updateAnnotationDetails();
    document.getElementById('annotationForm').reset();
    document.getElementById('annotationFormContainer').classList.remove('open');
    document.getElementById('annotationOverlayBackdrop').classList.remove('open');
  } catch (err) {
    console.error('Erro ao salvar anotação:', err);
    alert('Erro ao salvar anotação. Por favor, tente novamente.');
  }
}

function editAnnotation(annotation) {
  editingAnnotation = annotation;
  document.getElementById('annotationFormTitle').textContent = `Editando: ${annotation.titulo}`;
  document.getElementById('annotationTitulo').value = annotation.titulo;
  document.getElementById('annotationConteudo').value = annotation.conteudo;
  document.getElementById('annotationFormContainer').classList.add('open');
  document.getElementById('annotationOverlayBackdrop').classList.add('open');
}

async function deleteAnnotation(annotation) {
  if (confirm('Tem certeza que deseja excluir esta anotação?')) {
    try {
      await fetch(`${window.location.origin}/api/anotacoes/${annotation.id}`, {
        method: 'DELETE'
      });
      annotations = annotations.filter(a => a.id !== annotation.id);
      if (selectedAnnotation && selectedAnnotation.id === annotation.id) {
        selectedAnnotation = null;
      }
      updateAnnotationsList();
      updateAnnotationDetails();
    } catch (err) {
      console.error('Erro ao excluir anotação:', err);
      alert('Erro ao excluir anotação. Por favor, tente novamente.');
    }
  }
}
