let currentTask = null;
let currentColumnId = null;

function openDeleteColumnModal(columnId) {
  currentColumnId = columnId;
  const column = document.getElementById(columnId);
  const tasks = column.querySelector(".tasks").children.length;

  if (tasks > 0) {
    document.getElementById("deleteColumnModal").style.display = "flex";
  } else {
    deleteColumn();
  }
}

function closeDeleteColumnModal() {
  document.getElementById("deleteColumnModal").style.display = "none";
  currentColumnId = null;
}

function deleteColumn() {
  if (currentColumnId) {
    document.getElementById(currentColumnId).remove();
    saveBoardState();
    showNotification("Columna eliminada", "info");
    closeDeleteColumnModal();
  }
}

function openDeleteTaskModal(button) {
  currentTask = button.closest(".task");
  document.getElementById("deleteTaskModal").style.display = "flex";
}

function closeDeleteTaskModal() {
  document.getElementById("deleteTaskModal").style.display = "none";
  currentTask = null;
}

function deleteTask() {
  if (currentTask) {
    currentTask.remove();
    saveBoardState();
    showNotification("Tarea eliminada", "info");
    closeDeleteTaskModal();
  }
}

function openTaskEditModal(task) {
  currentTask = task;
  const modal = document.getElementById("editTaskModal");
  const input = document.getElementById("editTaskInput");
  input.value = task.querySelector(".task-text").textContent;
  modal.style.display = "flex";
  input.focus();
}

function closeTaskModal() {
  document.getElementById("editTaskModal").style.display = "none";
  currentTask = null;
}

function saveTaskEdit() {
  const input = document.getElementById("editTaskInput");
  const newText = input.value.trim();
  if (newText && currentTask) {
    currentTask.querySelector(".task-text").textContent = newText;
    saveBoardState();
  }
  closeTaskModal();
}

function openColumnEditModal(columnId) {
  currentColumnId = columnId;
  const modal = document.getElementById("editColumnModal");
  const input = document.getElementById("editColumnInput");
  const column = document.getElementById(columnId);
  input.value = column.querySelector(".column-title").textContent;
  modal.style.display = "flex";
  input.focus();
}

function closeColumnModal() {
  document.getElementById("editColumnModal").style.display = "none";
  currentColumnId = null;
}

function saveColumnEdit() {
  const input = document.getElementById("editColumnInput");
  const newText = input.value.trim();
  if (newText && currentColumnId) {
    if (newText.length <= 25) {
      const column = document.getElementById(currentColumnId);
      column.querySelector(".column-title").textContent = newText;
      saveBoardState();
      closeColumnModal();
    } else {
      showNotification("El título no puede exceder 25 caracteres", "info");
    }
  } else {
    showNotification("El título no puede estar vacío", "info");
  }
}

export {
  openDeleteColumnModal,
  closeDeleteColumnModal,
  deleteColumn,
  openDeleteTaskModal,
  closeDeleteTaskModal,
  deleteTask,
  openTaskEditModal,
  closeTaskModal,
  saveTaskEdit,
  openColumnEditModal,
  closeColumnModal,
  saveColumnEdit,
};
