let currentTask = null;
let currentColumnId = null;
let columnCount = 0;
let scrollInterval = null;
let db = null;

// Inicializar la base de datos SQLite
async function initDatabase() {
  try {
    // Cargar SQL.js
    const SQL = await initSqlJs({
      locateFile: (file) =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
    });

    // Verificar si hay una base de datos guardada
    const savedDb = localStorage.getItem("kanbanDB");

    if (savedDb) {
      // Convertir el string guardado a Uint8Array
      const buffer = new Uint8Array(savedDb.split(",").map(Number));
      db = new SQL.Database(buffer);
      console.log("Base de datos cargada desde localStorage");
    } else {
      // Crear nueva base de datos
      db = new SQL.Database();
      console.log("Nueva base de datos creada");

      // Crear tablas
      db.run(`
        CREATE TABLE columns (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          position INTEGER NOT NULL
        );
      `);

      db.run(`
        CREATE TABLE tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          column_id TEXT NOT NULL,
          text TEXT NOT NULL,
          position INTEGER NOT NULL,
          FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
        );
      `);

      // Crear columnas iniciales
      db.run("INSERT INTO columns (id, title, position) VALUES (?, ?, ?);", [
        "column-1",
        "Por Hacer",
        0,
      ]);
      db.run("INSERT INTO columns (id, title, position) VALUES (?, ?, ?);", [
        "column-2",
        "En Progreso",
        1,
      ]);
      db.run("INSERT INTO columns (id, title, position) VALUES (?, ?, ?);", [
        "column-3",
        "Hecho",
        2,
      ]);

      // Guardar la base de datos inicial
      saveDatabase();
    }

    // Cargar los datos en la interfaz
    loadFromDatabase();
  } catch (err) {
    console.error("Error al inicializar SQLite:", err);
    // Fallback a localStorage
    loadFromLocalStorage();
  }
}

function saveDatabase() {
  if (!db) return;

  try {
    // Exportar la base de datos a un array de bytes
    const data = db.export();
    // Convertir a string para guardar en localStorage
    localStorage.setItem("kanbanDB", Array.from(data).join(","));
    console.log("Base de datos guardada");
  } catch (err) {
    console.error("Error al guardar la base de datos:", err);
  }
}

function saveBoardState() {
  if (!db) {
    saveToLocalStorage();
    return;
  }

  try {
    // Comenzar transacción
    db.exec("BEGIN TRANSACTION;");

    // Limpiar tablas
    db.run("DELETE FROM tasks;");
    db.run("DELETE FROM columns;");

    // Guardar columnas
    const columns = document.querySelectorAll(".column");
    columns.forEach((column, index) => {
      const columnId = column.id;
      const title = column.querySelector(".column-title").textContent;

      db.run("INSERT INTO columns (id, title, position) VALUES (?, ?, ?);", [
        columnId,
        title,
        index,
      ]);

      // Guardar tareas
      const tasks = column.querySelectorAll(".task");
      tasks.forEach((task, taskIndex) => {
        const taskText = task.querySelector(".task-text").textContent;
        db.run(
          "INSERT INTO tasks (column_id, text, position) VALUES (?, ?, ?);",
          [columnId, taskText, taskIndex]
        );
      });
    });

    // Finalizar transacción
    db.exec("COMMIT;");

    // Guardar la base de datos
    saveDatabase();
  } catch (err) {
    console.error("Error al guardar:", err);
    db.exec("ROLLBACK;");
    saveToLocalStorage();
  }
}

function loadFromDatabase() {
  if (!db) {
    loadFromLocalStorage();
    return;
  }

  try {
    // Limpiar el tablero
    const board = document.getElementById("kanbanBoard");
    board.innerHTML = "";
    columnCount = 0;

    // Cargar columnas ordenadas por posición
    const columnsQuery = db.exec("SELECT * FROM columns ORDER BY position;");

    if (!columnsQuery.length || !columnsQuery[0].values.length) {
      createInitialColumns();
      return;
    }

    const columns = columnsQuery[0].values;

    // Crear columnas
    columns.forEach(([id, title, position]) => {
      // Cargar tareas para esta columna
      const tasks = [];
      const stmt = db.prepare(
        "SELECT text FROM tasks WHERE column_id = ? ORDER BY position;"
      );
      stmt.bind([id]);

      while (stmt.step()) {
        tasks.push(stmt.getAsObject().text);
      }
      stmt.free();

      createColumn(id, title, tasks);
      columnCount++;
    });

    createAddColumnButton();
  } catch (err) {
    console.error("Error al cargar desde SQLite:", err);
    loadFromLocalStorage();
  }
}

// Funciones de fallback a localStorage
function saveToLocalStorage() {
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
  console.log("Datos guardados en localStorage");
}

function loadFromLocalStorage() {
  const savedData = localStorage.getItem("kanbanBoard");
  if (savedData) {
    const columns = JSON.parse(savedData);
    columnCount = 0;
    const board = document.getElementById("kanbanBoard");
    board.innerHTML = "";

    columns.forEach((column) => {
      createColumn(column.id, column.title, column.tasks);
      columnCount++;
    });

    createAddColumnButton();
    console.log("Datos cargados desde localStorage");
  } else {
    createInitialColumns();
  }
}

function createInitialColumns() {
  columnCount = 0;
  createColumn("column-1", "Por Hacer", []);
  createColumn("column-2", "En Progreso", []);
  createColumn("column-3", "Hecho", []);
  columnCount = 3;
  createAddColumnButton();
  console.log("Columnas iniciales creadas");
}

// Resto de las funciones (sin cambios)

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

  // Configurar eventos
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

function addNewColumn() {
  columnCount++;
  const columnId = `column-${columnCount}`;
  createColumn(columnId, "Nueva Columna", []);
  createAddColumnButton();
  saveBoardState();
}

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

function scrollToLeft() {
  document.getElementById("kanbanContainer").scrollTo({
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
      column.querySelector(".tasks").appendChild(draggingTask);
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

function showNotification(message, type) {
  const container = document.getElementById("notificationContainer");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

// Eventos del DOM
document.addEventListener("DOMContentLoaded", () => {
  // Configurar eventos para los modales
  document.getElementById("editTaskModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeTaskModal();
  });

  document.getElementById("editColumnModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeColumnModal();
  });

  document
    .getElementById("deleteColumnModal")
    .addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeDeleteColumnModal();
    });

  document.getElementById("deleteTaskModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeDeleteTaskModal();
  });

  // Inicializar la aplicación
  initDatabase();
});
