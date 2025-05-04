function showNotification(message, type) {
  const container = document.getElementById("notificationContainer");
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

export { showNotification };
