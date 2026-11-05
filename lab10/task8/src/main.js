import { setTasks, getTasks } from "./modules/tasks.js";
import { renderTasks } from "./modules/render.js";
import { loadTasks } from "./modules/storage.js";
import { initHandlers } from "./modules/handlers.js";

setTasks(loadTasks());
renderTasks(getTasks());
initHandlers();
