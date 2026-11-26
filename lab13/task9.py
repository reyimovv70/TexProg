"""
Лабораторная работа №13. Коллекции и работа со структурами данных.
Вариант 9: Редактор текста — стек выполненных изменений, операция undo
и просмотр текущего текста.

Дополнительная функция: redo (второй стек) и сохранение/загрузка в JSON.
"""

import json


class TextEditor:
    """Текстовый редактор с историей изменений на стеке.

    Структуры данных:
      _text        — строка с текущим текстом (неизменяемая, замена целиком).
      _undo_stack  — list как стек (LIFO): снимки текста до каждого изменения.
      _redo_stack  — list как стек: снимки, отменённые через undo.
    """

    def __init__(self, text=""):
        self._text = text
        self._undo_stack = []
        self._redo_stack = []

    # ----- служебные методы -----

    def _push_undo(self):
        """Запоминает текущее состояние перед изменением.

        Новое изменение делает историю redo недействительной, поэтому
        стек redo очищается.
        """
        self._undo_stack.append(self._text)
        self._redo_stack.clear()

    # ----- операции редактирования -----

    def append(self, fragment):
        """Добавляет фрагмент в конец текста. Возвращает True при успехе."""
        if not fragment:
            return False  # пустой фрагмент — не изменение
        self._push_undo()
        self._text += fragment
        return True

    def delete_last(self, count):
        """Удаляет последние count символов. Возвращает True при успехе.

        Если count больше длины текста, удаляется всё содержимое.
        """
        if count <= 0 or not self._text:
            return False  # пустой текст или некорректное количество
        self._push_undo()
        self._text = self._text[:-count]
        return True

    # ----- отмена и повтор -----

    def undo(self):
        """Отменяет последнее изменение. Возвращает False, если стек пуст."""
        if not self._undo_stack:
            return False
        self._redo_stack.append(self._text)
        self._text = self._undo_stack.pop()
        return True

    def redo(self):
        """Повторяет отменённое изменение. Возвращает False, если нечего повторять."""
        if not self._redo_stack:
            return False
        self._undo_stack.append(self._text)
        self._text = self._redo_stack.pop()
        return True

    # ----- просмотр -----

    def show(self):
        """Возвращает текущий текст."""
        return self._text

    def history_size(self):
        """Количество изменений, которые можно отменить."""
        return len(self._undo_stack)

    # ----- дополнительная функция: JSON -----

    def save_json(self, path):
        """Сохраняет текст и оба стека в JSON-файл."""
        data = {
            "text": self._text,
            "undo": self._undo_stack,
            "redo": self._redo_stack,
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    @classmethod
    def load_json(cls, path):
        """Загружает редактор из JSON-файла. При отсутствии данных — пустой редактор."""
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        editor = cls(data.get("text", ""))
        editor._undo_stack = list(data.get("undo", []))
        editor._redo_stack = list(data.get("redo", []))
        return editor


# ----- тесты -----

def run_tests():
    """Проверяет 7 сценариев: обычный, пустая структура, дубликат,
    граничный случай, отсутствующий элемент, пустой фрагмент, очистка redo.

    Возвращает список строк таблицы: (№, вход, ожидаемый, фактический, статус).
    """
    rows = []

    def check(num, description, expected, actual_fn):
        try:
            actual = actual_fn()
        except Exception as exc:  # непредвиденная ошибка — тест провален
            actual = f"исключение: {exc}"
        status = "Пройден" if actual == expected else "Провален"
        rows.append((num, description, repr(expected), repr(actual), status))

    # 1. Обычный сценарий
    def t1():
        ed = TextEditor()
        ed.append("Привет")
        ed.append(", мир")
        ed.undo()
        return ed.show()
    check(1, "append «Привет», append «, мир», undo", "Привет", t1)

    # 2. Пустая структура
    def t2():
        ed = TextEditor()
        return (ed.undo(), ed.show())
    check(2, "undo в новом редакторе (стек пуст)", (False, ""), t2)

    # 3. Повтор / дубликат
    def t3():
        ed = TextEditor()
        ed.append("ab")
        ed.append("ab")
        ed.undo()
        return ed.show()
    check(3, "два одинаковых append «ab», затем undo", "ab", t3)

    # 4. Граничный случай: удаление больше длины текста
    def t4():
        ed = TextEditor("abc")
        ed.delete_last(10)
        cleared = ed.show()
        ed.undo()
        return (cleared, ed.show())
    check(4, "delete_last(10) для «abc», затем undo", ("", "abc"), t4)

    # 5. Пустой фрагмент и удаление из пустого текста
    def t5():
        ed = TextEditor()
        r1 = ed.append("")
        r2 = ed.delete_last(1)
        return (r1, r2, ed.history_size())
    check(5, "append(\"\") и delete_last(1) на пустом тексте", (False, False, 0), t5)

    # 6. Отсутствующий элемент: undo после исчерпания истории
    def t6():
        ed = TextEditor()
        ed.append("x")
        ed.undo()
        second = ed.undo()
        return (second, ed.show())
    check(6, "второй undo при единственном изменении", (False, ""), t6)

    # 7. Очистка redo после нового изменения
    def t7():
        ed = TextEditor()
        ed.append("a")
        ed.undo()
        ed.append("b")
        redo_ok = ed.redo()
        return (redo_ok, ed.show())
    check(7, "append «a», undo, append «b», redo", (False, "b"), t7)

    return rows


def print_test_table(rows):
    print(f"{'№':<3}| {'Вход':<45}| {'Ожидаемый':<20}| {'Фактический':<20}| Статус")
    print("-" * 110)
    for num, desc, exp, act, status in rows:
        print(f"{num:<3}| {desc:<45}| {exp:<20}| {act:<20}| {status}")
    passed = sum(1 for r in rows if r[4] == "Пройден")
    print(f"\nИтого: пройдено {passed} из {len(rows)}")


# ----- меню -----

MENU = """
========== Редактор текста ==========
1 — добавить текст
2 — удалить последние N символов
3 — отменить последнее изменение (undo)
4 — повторить отменённое (redo)
5 — показать текущий текст
6 — сохранить в JSON
7 — загрузить из JSON
8 — запустить автотесты
0 — выход
"""


def run_menu():
    editor = TextEditor()
    while True:
        print(MENU)
        choice = input("Выберите пункт: ").strip()

        if choice == "1":
            fragment = input("Введите текст: ")
            if editor.append(fragment):
                print("Текст добавлен.")
            else:
                print("Ошибка: пустой текст нельзя добавить.")

        elif choice == "2":
            raw = input("Сколько символов удалить: ").strip()
            if not raw.isdigit():
                print("Ошибка: введите неотрицательное целое число.")
                continue
            if editor.delete_last(int(raw)):
                print("Символы удалены.")
            else:
                print("Нечего удалять или некорректное число.")

        elif choice == "3":
            print("Отменено." if editor.undo() else "Отменять нечего: история пуста.")

        elif choice == "4":
            print("Повторено." if editor.redo() else "Повторять нечего.")

        elif choice == "5":
            text = editor.show()
            print(f"Текст: «{text}»" if text else "Текст пуст.")
            print(f"Изменений в истории: {editor.history_size()}")

        elif choice == "6":
            path = input("Имя файла (например, text.json): ").strip()
            editor.save_json(path)
            print(f"Сохранено в {path}.")

        elif choice == "7":
            path = input("Имя файла: ").strip()
            try:
                editor = TextEditor.load_json(path)
                print("Загружено.")
            except (OSError, json.JSONDecodeError) as exc:
                print(f"Ошибка загрузки: {exc}")

        elif choice == "8":
            print_test_table(run_tests())

        elif choice == "0":
            print("Выход.")
            break

        else:
            print("Неизвестный пункт меню.")


if __name__ == "__main__":
    run_menu()
