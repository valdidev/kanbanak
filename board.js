function createInitialColumns() {
  window.columnCount = 0;
  createColumn("column-1", "Por Hacer", []);
  createColumn("column-2", "En Progreso", []);
  createColumn("column-3", "Hecho", []);
  window.columnCount = 3;
  createAddColumnButton();
  console.log("Columnas iniciales creadas");
}

function createColumn(columnId, title, tasks) {
  if (document.getElementById(columnId)) {
    console.error("ID de columna duplicado:", columnId);
    return;
  }

  const column = document.createElement("div");
  column.className = "column";
  column.id = columnId;
  column.draggable = true;
  column.innerHTML = `
    <div class="column-header">
      <button class="copy-tasks-btn" title="Copiar tareas">📋</button>
      <span class="column-title">${title}</span>
      <button class="delete-column-btn">Eliminar</button>
    </div>
    <input type="text" class="task-input" placeholder="Nueva tarea...">
    <button class="add-task">Añadir Tarea</button>
    <div class="tasks"></div>
  `;

  const board = document.getElementById("kanbanBoard");
  const addColumnBtn = document.getElementById("addColumnBtn");
  if (addColumnBtn) {
    board.insertBefore(column, addColumnBtn);
  } else {
    board.appendChild(column);
  }

  const columnHeader = column.querySelector(".column-header");
  const copyTasksBtn = column.querySelector(".copy-tasks-btn");
  const deleteColumnBtn = column.querySelector(".delete-column-btn");
  const taskInput = column.querySelector(".task-input");
  const addTaskBtn = column.querySelector(".add-task");

  columnHeader.addEventListener("click", (e) => {
    if (
      !e.target.classList.contains("copy-tasks-btn") &&
      !e.target.classList.contains("delete-column-btn")
    ) {
      openColumnEditModal(columnId);
    }
  });

  copyTasksBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    copyTasksToClipboard(columnId);
  });

  deleteColumnBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openDeleteColumnModal(columnId);
  });

  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTask(columnId);
    }
  });

  addTaskBtn.addEventListener("click", () => {
    addTask(columnId);
  });

  tasks.forEach((taskText) => createTask(column, taskText));
  setupColumnEvents(column);
}

function copyTasksToClipboard(columnId) {
  const column = document.getElementById(columnId);
  if (!column) return;

  const tasks = column.querySelectorAll(".task-text");
  const taskList = Array.from(tasks)
    .map((task, index) => `${index + 1}. ${task.textContent}`)
    .join("\n");

  if (taskList) {
    navigator.clipboard
      .writeText(taskList)
      .then(() => {
        showNotification("Tareas copiadas al portapapeles", "success");
      })
      .catch((err) => {
        console.error("Error al copiar tareas:", err);
        showNotification("Error al copiar tareas", "info");
      });
  } else {
    showNotification("No hay tareas para copiar", "info");
  }
}

function createAddColumnButton() {
  const existingBtn = document.getElementById("addColumnBtn");
  if (existingBtn) existingBtn.remove();

  const button = document.createElement("button");
  button.id = "addColumnBtn";
  button.className = "add-column-btn";
  button.textContent = "+";
  button.onclick = addNewColumn;
  document.getElementById("kanbanBoard").appendChild(button);
}

function addNewColumn() {
  window.columnCount++;
  const columnId = `column-${window.columnCount}`;
  createColumn(columnId, "Nueva Columna", []);
  createAddColumnButton();
  saveBoardState();
}

export {
  createColumn,
  createAddColumnButton,
  createInitialColumns,
  addNewColumn,
  copyTasksToClipboard,
};
