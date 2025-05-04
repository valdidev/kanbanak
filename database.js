let db = null;

async function initDatabase() {
  try {
    const SQL = await initSqlJs({
      locateFile: (file) =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
    });

    const savedDb = localStorage.getItem("kanbanDB");

    if (savedDb) {
      const buffer = new Uint8Array(savedDb.split(",").map(Number));
      db = new SQL.Database(buffer);
      console.log("Base de datos cargada desde localStorage");
    } else {
      db = new SQL.Database();
      console.log("Nueva base de datos creada");

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

      saveDatabase();
    }

    loadFromDatabase();
  } catch (err) {
    console.error("Error al inicializar SQLite:", err);
    loadFromLocalStorage();
  }
}

function saveDatabase() {
  if (!db) return;

  try {
    const data = db.export();
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
    db.exec("BEGIN TRANSACTION;");

    db.run("DELETE FROM tasks;");
    db.run("DELETE FROM columns;");

    const columns = document.querySelectorAll(".column");
    columns.forEach((column, index) => {
      const columnId = column.id;
      const title = column.querySelector(".column-title").textContent;

      db.run("INSERT INTO columns (id, title, position) VALUES (?, ?, ?);", [
        columnId,
        title,
        index,
      ]);

      const tasks = column.querySelectorAll(".task");
      tasks.forEach((task, taskIndex) => {
        const taskText = task.querySelector(".task-text").textContent;
        db.run(
          "INSERT INTO tasks (column_id, text, position) VALUES (?, ?, ?);",
          [columnId, taskText, taskIndex]
        );
      });
    });

    db.exec("COMMIT;");
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
    const board = document.getElementById("kanbanBoard");
    board.innerHTML = "";
    window.columnCount = 0;

    const columnsQuery = db.exec("SELECT * FROM columns ORDER BY position;");

    if (!columnsQuery.length || !columnsQuery[0].values.length) {
      createInitialColumns();
      return;
    }

    const columns = columnsQuery[0].values;

    columns.forEach(([id, title, position]) => {
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
      window.columnCount++;
    });

    createAddColumnButton();
  } catch (err) {
    console.error("Error al cargar desde SQLite:", err);
    loadFromLocalStorage();
  }
}

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
    window.columnCount = 0;
    const board = document.getElementById("kanbanBoard");
    board.innerHTML = "";

    columns.forEach((column) => {
      createColumn(column.id, column.title, column.tasks);
      window.columnCount++;
    });

    createAddColumnButton();
    console.log("Datos cargados desde localStorage");
  } else {
    createInitialColumns();
  }
}

export { initDatabase, saveBoardState };
