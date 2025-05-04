import { handleAutoScroll, startAutoScroll, stopAutoScroll } from "./scroll.js";

function addTask(columnId) {
  const column = document.getElementById(columnId);
  if (!column) return;

  const input = column.querySelector(".task-input");
  const taskText = input.value.trim();

  if (taskText) {
    createTask(column, taskText);
    input.value = "";
    saveBoardState();
    showNotification("Tarea creada exitosamente", "success");
  } else {
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 300);
  }
}

function createTask(column, taskText) {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.innerHTML = `
    <span class="task-text">${taskText}</span>
    <div class="task-buttons">
      <button class="duplicate-btn" onclick="duplicateTask(this)">Duplicar</button>
      <button class="delete-task-btn" onclick="openDeleteTaskModal(this)">Eliminar</button>
    </div>
  `;

  task.addEventListener("dragstart", (e) => {
    e.stopPropagation();
    task.classList.add("dragging");
    startAutoScroll(e);
  });

  task.addEventListener("dragend", (e) => {
    e.stopPropagation();
    task.classList.remove("dragging");
    stopAutoScroll();
    saveBoardState();
  });

  task.addEventListener("drag", handleAutoScroll);

  task.addEventListener("click", (e) => {
    if (
      !e.target.classList.contains("duplicate-btn") &&
      !e.target.classList.contains("delete-task-btn")
    ) {
      e.stopPropagation();
      openTaskEditModal(task);
    }
  });

  column.querySelector(".tasks").prepend(task);
}

function duplicateTask(button) {
  const task = button.closest(".task");
  const column = task.closest(".column");
  const taskText = task.querySelector(".task-text").textContent;
  createTask(column, taskText);
  saveBoardState();
  showNotification("Tarea duplicada", "info");
}

export { addTask, createTask, duplicateTask };
