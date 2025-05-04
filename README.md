# Kanban Board Application

## Overview
This is a web-based Kanban board application built with HTML, CSS, and JavaScript. It allows users to manage tasks by organizing them into columns, supporting drag-and-drop functionality for tasks and columns, task creation, editing, duplication, deletion, and persistent storage using SQLite (with a fallback to localStorage). The application features a dark-themed, responsive UI with modals for task/column editing and notifications for user actions.

## Features
- **Columns and Tasks**: Create, edit, delete, and reorder columns and tasks via drag-and-drop.
- **Persistent Storage**: Data is stored in a SQLite database in the browser, with localStorage as a fallback.
- **Modals**: Interactive modals for editing tasks, editing column titles, and confirming deletions.
- **Notifications**: Success and info notifications for user actions (e.g., task created, column deleted).
- **Responsive Design**: Optimized for both desktop and mobile devices (below 768px).
- **Auto-Scroll**: Automatic scrolling during drag-and-drop operations for better usability.
- **Scroll Buttons**: Fixed buttons for scrolling the board left or right.

## Project Structure
The project is modularized for maintainability, with separate files for JavaScript and CSS based on functionality.

```
/kanban-board
├── index.html              # Main HTML file
├── main.js                 # Main JavaScript module coordinating other modules
├── database.js             # SQLite and localStorage management
├── board.js                # Board and column creation/management
├── tasks.js                # Task creation, duplication, and drag-and-drop
├── modals.js               # Modal management for editing and deletion
├── scroll.js               # Scroll buttons and auto-scroll functionality
├── notifications.js        # Notification display logic
├── base.css                # Global styles and Kanban container
├── board.css               # Board and column styles
├── tasks.css               # Task and task input/button styles
├── modals.css              # Modal styles
├── notifications.css       # Notification styles
├── scroll-buttons.css      # Scroll button styles
├── responsive.css          # Responsive design adjustments
```

## Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge).
- A local web server to serve the files (required for ES modules due to CORS restrictions).
- Node.js (optional, for running a local server like `http-server`).

## Installation
1. **Clone or Download the Repository**:
   ```bash
   git clone <repository-url>
   cd kanban-board
   ```
   Alternatively, download and extract the project files.

2. **Install a Local Server** (if not already installed):
   Install `http-server` globally using npm:
   ```bash
   npm install -g http-server
   ```

## Running the Application
1. **Start the Local Server**:
   From the project directory, run:
   ```bash
   http-server .
   ```
   This will start a server, typically at `http://localhost:8080`.

2. **Access the Application**:
   Open a web browser and navigate to `http://localhost:8080`. The Kanban board should load, displaying initial columns ("Por Hacer", "En Progreso", "Hecho").

## Usage
- **Create a Column**: Click the "+" button to add a new column.
- **Edit a Column**: Click the column header to open the edit modal and change the title (max 25 characters).
- **Delete a Column**: Hover over the column header to reveal the "Eliminar" button; confirm deletion in the modal if tasks exist.
- **Add a Task**: Enter text in the task input field and click "Añadir Tarea" or press Enter.
- **Edit a Task**: Click a task to open the edit modal and modify its text.
- **Duplicate a Task**: Hover over a task to reveal the "Duplicar" button and create a copy.
- **Delete a Task**: Hover over a task to reveal the "Eliminar" button and confirm deletion in the modal.
- **Reorder Tasks/Columns**: Drag and drop tasks within or between columns, or drag columns to reorder them.
- **Scroll the Board**: Use the left/right scroll buttons or drag tasks/columns near the edges for auto-scrolling.

## Technical Details
- **Frontend**: Built with vanilla HTML, CSS, and JavaScript (ES modules).
- **Storage**: Uses `sql.js` (SQLite in WebAssembly) for persistent storage, with localStorage as a fallback if SQLite fails.
- **Dependencies**: 
  - `sql.js` (v1.8.0) loaded via CDN: `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js`.
- **Modular Design**:
  - JavaScript is split into modules for database, board, tasks, modals, scroll, and notifications.
  - CSS is split into base, board, tasks, modals, notifications, scroll-buttons, and responsive styles.
- **Responsive Design**: Adjusts column widths, task text limits, and padding for screens below 768px.

## Troubleshooting
- **"Failed to load module" Error**: Ensure you're running the app through a local server (`http://`), not directly from `file://`, due to CORS restrictions with ES modules.
- **SQLite Errors**: Verify that `sql-wasm.js` loads correctly. Check the browser console for network errors.
- **Styles Not Applied**: Confirm all CSS files are in the project directory and correctly referenced in `index.html`.
- **Drag-and-Drop Issues**: Ensure `handleAutoScroll` and other functions are available (see `main.js` for global exports).

## Contributing
To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Make changes and test thoroughly.
4. Commit changes (`git commit -m "Add feature-name"`).
5. Push to the branch (`git push origin feature-name`).
6. Open a pull request.

## License
This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgments
- Built with [sql.js](https://sql.js.org/) for in-browser SQLite.
- Inspired by classic Kanban board applications like Trello.

---

For issues or suggestions, please open an issue on the repository or contact the maintainer.