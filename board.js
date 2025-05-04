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
  const deleteColumnBtn = column.querySelector(".delete-column-btn");
  const taskInput = column.querySelector(".task-input");
  const addTaskBtn = column.querySelector(".add-task");

  columnHeader.addEventListener("click", () => {
    openColumnEditModal(columnId);
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
};
