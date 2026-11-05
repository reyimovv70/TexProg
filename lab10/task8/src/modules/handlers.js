import { addTask, removeTask, getTasks } from "./tasks.js";
import { renderTasks, showMessage } from "./render.js";
import { saveTasks } from "./storage.js";

function refresh() {
  const tasks = getTasks();
  renderTasks(tasks);
  saveTasks(tasks);
}

export function initHandlers() {
  const input = document.querySelector("#task-input");
  const addBtn = document.querySelector("#add-btn");
  const list = document.querySelector("#task-list");

  function handleAdd() {
    const result = addTask(input.value);
    if (!result.ok) {
      showMessage(result.error, true);
      return;
    }
    input.value = "";
    input.focus();
    showMessage("Задача добавлена", false);
    refresh();
  }

  addBtn.addEventListener("click", handleAdd);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAdd();
  });

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    removeTask(Number(btn.dataset.id));
    showMessage("Задача удалена", false);
    refresh();
  });
}
