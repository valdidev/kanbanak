let currentTask = null;
let currentColumnId = null;
let columnCount = 0;
let scrollInterval = null;

function saveBoardState() {
  const board = document.getElementById("kanbanBoard");
  const columns = Array.from(board.children).map((column) => ({
    id: column.id,
    title: column.querySelector(".column-header").textContent,
    tasks: Array.from(column.querySelector(".tasks").children).map(
      (task) => task.querySelector(".task-text").textContent
    ),
  }));
  localStorage.setItem("kanbanBoard", JSON.stringify(columns));
}

function loadBoardState() {
  const savedBoard = localStorage.getItem("kanbanBoard");
  if (savedBoard) {
    const columns = JSON.parse(savedBoard);
    columnCount = columns.reduce((max, col) => {
      const num = parseInt(col.id.split("-")[1] || 0);
      return Math.max(max, num);
    }, 0);
    columns.forEach((col) => {
      createColumn(col.id, col.title, col.tasks);
    });
  } else {
    createColumn("todo", "Por Hacer", []);
    createColumn("in-progress", "En Progreso", []);
    createColumn("done", "Hecho", []);
    columnCount = 3;
  }
}

function createColumn(columnId, title, tasks) {
  const column = document.createElement("div");
  column.className = "column";
  column.id = columnId;
  column.draggable = true;
  column.innerHTML = `
        <div class="column-header" onclick="openColumnEditModal('${columnId}')">${title}</div>
        <input type="text" class="task-input" placeholder="Nueva tarea..." onkeydown="if(event.key === 'Enter') addTask('${columnId}')">
        <button class="add-task" onclick="addTask('${columnId}')">Añadir Tarea</button>
        <div class="tasks"></div>
    `;
  document.getElementById("kanbanBoard").appendChild(column);

  tasks.forEach((taskText) => createTask(column, taskText));
  setupColumnEvents(column);
}

function addTask(columnId) {
  const column = document.getElementById(columnId);
  const input = column.querySelector(".task-input");
  const taskText = input.value.trim();

  if (taskText) {
    createTask(column, taskText);
    input.value = "";
    saveBoardState();
  } else {
    input.classList.add("shake");
    setTimeout(() => {
      input.classList.remove("shake");
      input.style.borderColor = "";
    }, 300);
  }
}

function createTask(column, taskText) {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.innerHTML = `
        <span class="task-text">${taskText}</span>
        <button class="duplicate-btn" onclick="duplicateTask(this)">Duplicar</button>
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

  task.addEventListener("drag", (e) => {
    handleAutoScroll(e);
  });

  task.addEventListener("click", (e) => {
    if (e.target.classList.contains("duplicate-btn")) return;
    e.stopPropagation();
    openTaskEditModal(task);
  });

  column.querySelector(".tasks").appendChild(task);
}

function duplicateTask(button) {
  const task = button.closest(".task");
  const column = task.closest(".column");
  const taskText = task.querySelector(".task-text").textContent;
  createTask(column, taskText);
  saveBoardState();
}

function addNewColumn() {
  columnCount++;
  const columnId = `column-${columnCount}`;
  createColumn(columnId, `Columna ${columnCount}`, []);
  saveBoardState();
}

function startAutoScroll(e) {
  handleAutoScroll(e);
  scrollInterval = setInterval(() => handleAutoScroll(e), 50);
}

function stopAutoScroll() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function handleAutoScroll(e) {
  const container = document.getElementById("kanbanContainer");
  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX;
  const edgeThreshold = 100;
  const scrollSpeed = 20;

  if (mouseX < rect.left + edgeThreshold) {
    container.scrollLeft -= scrollSpeed;
  } else if (mouseX > rect.right - edgeThreshold) {
    container.scrollLeft += scrollSpeed;
  }
}

function setupColumnEvents(column) {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingTask = document.querySelector(".task.dragging");
    if (draggingTask) {
      const tasksContainer = column.querySelector(".tasks");
      tasksContainer.appendChild(draggingTask);
    }
  });

  column.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("column")) {
      column.classList.add("dragging");
      startAutoScroll(e);
    }
  });

  column.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("column")) {
      column.classList.remove("dragging");
      stopAutoScroll();
      saveBoardState();
    }
  });

  column.addEventListener("drag", (e) => {
    if (e.target.classList.contains("column")) {
      handleAutoScroll(e);
    }
  });

  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingColumn = document.querySelector(".column.dragging");
    if (draggingColumn && draggingColumn !== column) {
      const board = document.getElementById("kanbanBoard");
      const allColumns = Array.from(board.children);
      const currentIndex = allColumns.indexOf(column);
      const draggingIndex = allColumns.indexOf(draggingColumn);
      if (currentIndex < draggingIndex) {
        board.insertBefore(draggingColumn, column);
      } else {
        board.insertBefore(draggingColumn, column.nextSibling);
      }
    }
  });
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
  const modal = document.getElementById("editTaskModal");
  modal.style.display = "none";
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
  input.value = column.querySelector(".column-header").textContent;
  modal.style.display = "flex";
  input.focus();
}

function closeColumnModal() {
  const modal = document.getElementById("editColumnModal");
  modal.style.display = "none";
  currentColumnId = null;
}

function saveColumnEdit() {
  const input = document.getElementById("editColumnInput");
  const newText = input.value.trim();
  if (newText && currentColumnId) {
    const column = document.getElementById(currentColumnId);
    column.querySelector(".column-header").textContent = newText;
    saveBoardState();
  }
  closeColumnModal();
}

// Cargar el estado del tablero al iniciar
loadBoardState();

// Configurar eventos para los modales
document.getElementById("editTaskModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    closeTaskModal();
  }
});

document.getElementById("editColumnModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    closeColumnModal();
  }
});
