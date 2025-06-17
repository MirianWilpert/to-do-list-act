import './styles.css';

let allTasks = [];
let currentFilter = 'todas';
let editingTaskId = null;

const taskForm = document.getElementById('task-form');
const editForm = document.getElementById('edit-form');
const taskList = document.getElementById('task-list');
const loading = document.getElementById('loading');
const emptyMessage = document.getElementById('empty-message');
const totalTasksElement = document.getElementById('total-tasks');
const completedTasksElement = document.getElementById('completed-tasks');
const modal = document.getElementById('edit-modal');

const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const prioritySelect = document.getElementById('task-priority');

const editTitleInput = document.getElementById('edit-title');
const editDescriptionInput = document.getElementById('edit-description');
const editPrioritySelect = document.getElementById('edit-priority');
const editTaskIdInput = document.getElementById('edit-task-id');

function startApp() {
  console.log('📱 Iniciando aplicação...');
  setupEventListeners();
  loadAllTasks();
}

function setupEventListeners() {
  taskForm.addEventListener('submit', handleFormSubmit);
  editForm.addEventListener('submit', handleEditSubmit);

  document.getElementById('close-modal').addEventListener('click', closeEditModal);
  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeEditModal();
  });

  const filterButtons = document.querySelectorAll('.filter');
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      changeFilter(e.target.dataset.filter);
    });
  });
}

async function loadAllTasks() {
  try {
    showLoadingMessage();
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Erro ao carregar tarefas');
    allTasks = await response.json();
    displayTasks();
    updateTaskStats();
  } catch (error) {
    console.error('❌ Erro:', error);
    showErrorMessage('Erro ao carregar tarefas');
  } finally {
    hideLoadingMessage();
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = prioritySelect.value;

  if (!title) {
    alert('Por favor, digite um título para a tarefa');
    return;
  }

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: title, descricao: description, prioridade: priority })
    });
    if (!response.ok) throw new Error('Erro ao criar tarefa');

    const newTask = await response.json();
    allTasks.unshift(newTask);
    taskForm.reset();
    displayTasks();
    updateTaskStats();
    showSuccessMessage('Tarefa adicionada com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    showErrorMessage('Erro ao adicionar tarefa');
  }
}

async function toggleTaskComplete(taskId) {
  try {
    const task = allTasks.find(t => t._id === taskId);
    if (!task) return;

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, concluida: !task.concluida })
    });

    if (!response.ok) throw new Error('Erro ao atualizar tarefa');

    const updatedTask = await response.json();
    const taskIndex = allTasks.findIndex(t => t._id === taskId);
    allTasks[taskIndex] = updatedTask;
    displayTasks();
    updateTaskStats();
  } catch (error) {
    console.error('❌ Erro:', error);
    showErrorMessage('Erro ao atualizar tarefa');
  }
}

async function deleteTask(taskId) {
  if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

  try {
    const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao deletar tarefa');
    allTasks = allTasks.filter(t => t._id !== taskId);
    displayTasks();
    updateTaskStats();
  } catch (error) {
    console.error('❌ Erro:', error);
    showErrorMessage('Erro ao deletar tarefa');
  }
}

function openEditModal(taskId) {

  const task = allTasks.find(t => t._id === taskId);
  if (!task) return;
  editingTaskId = taskId;
  editTaskIdInput.value = task._id;
  editTitleInput.value = task.titulo;
  editDescriptionInput.value = task.descricao || '';
  editPrioritySelect.value = task.prioridade;
  modal.classList.remove('hidden');
}

function closeEditModal() {
  modal.classList.add('hidden');
  editingTaskId = null;
}

async function handleEditSubmit(e) {
  e.preventDefault();
  const title = editTitleInput.value.trim();
  const description = editDescriptionInput.value.trim();
  const priority = editPrioritySelect.value;
  if (!title) {
    alert('Por favor, digite um título para a tarefa');
    return;
  }
  try {
    const taskBeingEdited = allTasks.find(t => t._id === editingTaskId);
    const response = await fetch(`/api/tasks/${editingTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: title,
        descricao: description,
        prioridade: priority,
        concluida: taskBeingEdited.concluida
      })
    });
    if (!response.ok) throw new Error('Erro ao atualizar tarefa');
    const updatedTask = await response.json();
    const taskIndex = allTasks.findIndex(t => t._id === editingTaskId);
    allTasks[taskIndex] = updatedTask;
    closeEditModal();
    displayTasks();
    showSuccessMessage('Tarefa atualizada com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    showErrorMessage('Erro ao atualizar tarefa');
  }
}

function changeFilter(filterType) {
  currentFilter = filterType;
  document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
  displayTasks();
}

function showLoadingMessage() {
  loading.classList.remove('hidden');
  taskList.classList.add('hidden');
  emptyMessage.classList.add('hidden');
}

function hideLoadingMessage() {
  loading.classList.add('hidden');
  taskList.classList.remove('hidden');
}

function showSuccessMessage(message) {
  showNotificationMessage(message, 'success');
}

function showErrorMessage(message) {
  showNotificationMessage(message, 'error');
}

function showNotificationMessage(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  notification.innerHTML = `
    <i class="fas ${icon}"></i>
    ${message}
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function updateTaskStats() {
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.concluida).length;
  totalTasksElement.textContent = `${totalTasks} ${totalTasks === 1 ? 'tarefa' : 'tarefas'}`;
  completedTasksElement.textContent = `${completedTasks} ${completedTasks === 1 ? 'concluída' : 'concluídas'}`;
}

function getFilteredTasks() {
  if (currentFilter === 'pendentes') return allTasks.filter(task => !task.concluida);
  if (currentFilter === 'concluidas') return allTasks.filter(task => task.concluida);
  return allTasks;
}

function displayTasks() {
  const filteredTasks = getFilteredTasks();
  if (filteredTasks.length === 0) {
    taskList.innerHTML = '';
    emptyMessage.classList.remove('hidden');
    return;
  }
  emptyMessage.classList.add('hidden');
  let tasksHTML = '';
  filteredTasks.forEach(function (task) {
    const isCompleted = task.concluida ? 'completed' : '';
    const isChecked = task.concluida ? 'checked' : '';
    tasksHTML += `
      <div class="task ${isCompleted}" data-priority="${task.prioridade}">
        <div class="task-content">
          <div class="checkbox-container">
            <input type="checkbox" ${isChecked} onchange="toggleTaskComplete('${task._id}')">
          </div>
          <div class="task-info">
            <h3 class="task-title">${cleanText(task.titulo)}</h3>
            ${task.descricao ? `<p class="task-description">${cleanText(task.descricao)}</p>` : ''}
            <div class="task-meta">
              <span class="priority priority-${task.prioridade}">${getPriorityName(task.prioridade)}</span>
              <span class="creation-date">${formatTaskDate(task.criadaEm)}</span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-icon btn-edit" onclick="openEditModal('${task._id}')" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-delete" onclick="deleteTask('${task._id}')" title="Deletar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  taskList.innerHTML = tasksHTML;
}

function getPriorityName(priority) {
  const priorityNames = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
  return priorityNames[priority] || 'Média';
}

function formatTaskDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function cleanText(text) {
  const tempDiv = document.createElement('div');
  tempDiv.textContent = text;
  return tempDiv.innerHTML;
}

startApp();

window.toggleTaskComplete = toggleTaskComplete;
window.deleteTask = deleteTask;
window.openEditModal = openEditModal;