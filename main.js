import { initDatabase, saveBoardState } from "./database.js";
import {
  createColumn,
  createAddColumnButton,
  createInitialColumns,
  addNewColumn,
} from "./board.js";
import { addTask, createTask, duplicateTask } from "./tasks.js";
import {
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
} from "./modals.js";
import {
  scrollToLeft,
  scrollToRight,
  startAutoScroll,
  stopAutoScroll,
  setupColumnEvents,
} from "./scroll.js";
import { showNotification } from "./notifications.js";

// Exportar funciones para acceso global (necesario para eventos onclick en HTML)
window.saveBoardState = saveBoardState;
window.createColumn = createColumn;
window.createAddColumnButton = createAddColumnButton;
window.createInitialColumns = createInitialColumns;
window.addNewColumn = addNewColumn;
window.addTask = addTask;
window.createTask = createTask;
window.duplicateTask = duplicateTask;
window.openDeleteColumnModal = openDeleteColumnModal;
window.closeDeleteColumnModal = closeDeleteColumnModal;
window.deleteColumn = deleteColumn;
window.openDeleteTaskModal = openDeleteTaskModal;
window.closeDeleteTaskModal = closeDeleteTaskModal;
window.deleteTask = deleteTask;
window.openTaskEditModal = openTaskEditModal;
window.closeTaskModal = closeTaskModal;
window.saveTaskEdit = saveTaskEdit;
window.openColumnEditModal = openColumnEditModal;
window.closeColumnModal = closeColumnModal;
window.saveColumnEdit = saveColumnEdit;
window.scrollToLeft = scrollToLeft;
window.scrollToRight = scrollToRight;
window.startAutoScroll = startAutoScroll;
window.stopAutoScroll = stopAutoScroll;
window.setupColumnEvents = setupColumnEvents;
window.showNotification = showNotification;
window.columnCount = 0;

// Configurar eventos del DOM
document.addEventListener("DOMContentLoaded", () => {
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

  initDatabase();
});
