export function renderTasks(tasks) {
  const list = document.querySelector("#task-list");
  list.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Список пуст";
    empty.className = "empty";
    list.append(empty);
    return;
  }

  for (const task of tasks) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = task.text;

    const btn = document.createElement("button");
    btn.textContent = "Удалить";
    btn.dataset.id = task.id;

    li.append(span, btn);
    list.append(li);
  }
}

export function showMessage(text, isError) {
  const box = document.querySelector("#message");
  box.textContent = text;
  box.className = isError ? "error" : "ok";
}
