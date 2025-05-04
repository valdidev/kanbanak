let scrollInterval = null;

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

export {
  scrollToLeft,
  scrollToRight,
  startAutoScroll,
  stopAutoScroll,
  handleAutoScroll,
  setupColumnEvents,
};
