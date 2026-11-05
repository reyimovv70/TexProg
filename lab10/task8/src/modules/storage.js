const KEY = "lab10_tasks";

export function saveTasks(tasks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    // хранилище недоступно — приложение продолжит работать без сохранения
  }
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
