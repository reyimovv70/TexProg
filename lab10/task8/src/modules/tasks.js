const tasks = [];
let nextId = 1;

export function addTask(text) {
  const clean = text.trim();

  if (clean === "") {
    return { ok: false, error: "Введите текст задачи" };
  }
  if (clean.length > 100) {
    return { ok: false, error: "Задача не длиннее 100 символов" };
  }
  if (tasks.some(t => t.text.toLowerCase() === clean.toLowerCase())) {
    return { ok: false, error: "Такая задача уже есть" };
  }

  tasks.push({ id: nextId++, text: clean });
  return { ok: true };
}

export function removeTask(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

export function getTasks() {
  return [...tasks];
}

export function setTasks(list) {
  tasks.length = 0;
  for (const item of list) {
    if (item && typeof item.text === "string" && Number.isInteger(item.id)) {
      tasks.push({ id: item.id, text: item.text });
    }
  }
  nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}
