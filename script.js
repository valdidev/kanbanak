let currentTask = null;
let currentColumnId = null;
let columnCount = 0;
let scrollInterval = null;

function saveBoardState() {
  const board = document.getElementById("kanbanBoard");
  const columns = Array.from(board.getElementsByClassName("column")).map(
    (column) => ({
      id: column.id,
      title: column.querySelector(".column-title").textContent,
      tasks: Array.from(column.querySelector(".tasks").children).map(
        (task) => task.querySelector(".task-text").textContent
      ),
    })
  );
  localStorage.setItem("kanbanBoard", JSON.stringify(columns));
}

function loadBoardState() {
  // Limpiar localStorage para evitar conflictos con datos antiguos
  localStorage.removeItem("kanbanBoard");
  columnCount = 0;
  // Crear columnas iniciales con IDs únicos
  createColumn("column-1", "Por Hacer", []);
  createColumn("column-2", "En Progreso", []);
  createColumn("column-3", "Hecho", []);
  columnCount = 3;
  createAddColumnButton();
}

function createColumn(columnId, title, tasks) {
  // Validar que el columnId no exista
  if (document.getElementById(columnId)) {
    console.error("ID de columna duplicado:", columnId);
    return;
  }
  console.log("Creando columna con ID:", columnId); // Depuración
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

  // Configurar eventos dinámicos
  const columnHeader = column.querySelector(".column-header");
  const deleteColumnBtn = column.querySelector(".delete-column-btn");
  const taskInput = column.querySelector(".task-input");
  const addTaskBtn = column.querySelector(".add-task");

  columnHeader.addEventListener("click", () => {
    console.log("Clic en column-header, columnId:", columnId); // Depuración
    openColumnEditModal(columnId);
  });

  deleteColumnBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("Clic en delete-column-btn, columnId:", columnId); // Depuración
    openDeleteColumnModal(columnId);
  });

  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      console.log("Enter en task-input, columnId:", columnId); // Depuración
      addTask(columnId);
    }
  });

  addTaskBtn.addEventListener("click", () => {
    console.log("Clic en add-task, columnId:", columnId); // Depuración
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

function addTask(columnId) {
  console.log("addTask llamado con columnId:", columnId); // Depuración
  const column = document.getElementById(columnId);
  if (!column) {
    console.error("No se encontró la columna con ID:", columnId);
    return;
  }
  const input = column.querySelector(".task-input");
  const taskText = input.value.trim();

  if (taskText) {
    createTask(column, taskText);
    input.value = "";
    saveBoardState();
    showNotification("Tarea creada exitosamente", "success");
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

  task.addEventListener("drag", (e) => {
    handleAutoScroll(e);
  });

  task.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("duplicate-btn") ||
      e.target.classList.contains("delete-task-btn")
    )
      return;
    e.stopPropagation();
    openTaskEditModal(task);
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

function addNewColumn() {
  columnCount++;
  const columnId = `column-${columnCount}`;
  console.log("Creando nueva columna con ID:", columnId); // Depuración
  createColumn(columnId, "Nueva Columna", []);
  createAddColumnButton();
  saveBoardState();
}

function openDeleteColumnModal(columnId) {
  console.log("openDeleteColumnModal llamado con columnId:", columnId); // Depuración
  currentColumnId = columnId;
  const column = document.getElementById(columnId);
  if (!column) {
    console.error("No se encontró la columna con ID:", columnId);
    return;
  }
  const tasks = column.querySelector(".tasks").children.length;
  if (tasks > 0) {
    const modal = document.getElementById("deleteColumnModal");
    modal.style.display = "flex";
  } else {
    deleteColumn();
  }
}

function closeDeleteColumnModal() {
  const modal = document.getElementById("deleteColumnModal");
  modal.style.display = "none";
  currentColumnId = null;
}

function deleteColumn() {
  if (currentColumnId) {
    const column = document.getElementById(currentColumnId);
    if (!column) {
      console.error("No se encontró la columna con ID:", currentColumnId);
      return;
    }
    column.remove();
    saveBoardState();
    showNotification("Columna eliminada", "info");
    closeDeleteColumnModal();
  }
}

function openDeleteTaskModal(button) {
  currentTask = button.closest(".task");
  const modal = document.getElementById("deleteTaskModal");
  modal.style.display = "flex";
}

function closeDeleteTaskModal() {
  const modal = document.getElementById("deleteTaskModal");
  modal.style.display = "none";
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

function scrollToLeft() {
  const container = document.getElementById("kanbanContainer");
  container.scrollTo({
    left: 0,
    behavior: "smooth",
  });
}

function scrollToRight() {
  const container = document.getElementById("kanbanContainer");
  container.scrollTo({
    left: container.scrollWidth - container.clientWidth,
    behavior: "smooth",
  });
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
      const allColumns = Array.from(board.getElementsByClassName("column"));
      const currentIndex = allColumns.indexOf(column);
      const draggingIndex = allColumns.indexOf(draggingColumn);
      if (currentIndex < draggingIndex) {
        board.insertBefore(draggingColumn, column);
      } else {
        board.insertBefore(draggingColumn, column.nextSibling);
      }
      saveBoardState();
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
  console.log("openColumnEditModal llamado con columnId:", columnId); // Depuración
  currentColumnId = columnId;
  const modal = document.getElementById("editColumnModal");
  const input = document.getElementById("editColumnInput");
  const column = document.getElementById(columnId);
  if (!column) {
    console.error("No se encontró la columna con ID:", columnId);
    return;
  }
  input.value = column.querySelector(".column-title").textContent;
  modal.style.display = "flex";
  input.focus();
}

function closeColumnModal() {
  const modal = document.getElementById("editColumnModal");
  modal.style.display = "none";
  currentColumnId = null;
}

function saveColumnEdit() {
  console.log("saveColumnEdit llamado con currentColumnId:", currentColumnId); // Depuración
  const input = document.getElementById("editColumnInput");
  const newText = input.value.trim();
  if (newText && currentColumnId) {
    if (newText.length <= 25) {
      const column = document.getElementById(currentColumnId);
      if (!column) {
        console.error("No se encontró la columna con ID:", currentColumnId);
        return;
      }
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

function showNotification(message, type) {
  const container = document.getElementById("notificationContainer");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
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

document.getElementById("deleteColumnModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    closeDeleteColumnModal();
  }
});

document.getElementById("deleteTaskModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    closeDeleteTaskModal();
  }
});
