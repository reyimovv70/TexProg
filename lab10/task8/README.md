# Лабораторная работа №10 — Список задач (ES-модули)

Вариант 8. Приложение «Список задач» на чистом HTML, CSS и JavaScript (ES Modules).

## Структура

- `index.html` — страница
- `styles/style.css` — стили
- `src/main.js` — точка входа
- `src/modules/tasks.js` — модель задач (добавление, удаление, проверки)
- `src/modules/render.js` — отрисовка списка и сообщений
- `src/modules/handlers.js` — обработчики событий
- `src/modules/storage.js` — сохранение в localStorage

## Запуск

Из папки проекта:

```
python -m http.server 8000
```

Открыть http://localhost:8000 (через `file://` модули не загрузятся).
