"use strict";

/* ---------- Данные разделов (JS-объекты и массивы) ---------- */
const menuItems = [
  { emoji: "☕", name: "Капучино",       desc: "Эспрессо с молочной пенкой",      price: 20, category: "Напитки" },
  { emoji: "🍵", name: "Зелёный чай",    desc: "Листовой чай, чайник 400 мл",     price: 10, category: "Напитки" },
  { emoji: "🥐", name: "Круассан",       desc: "Со сливочным маслом, свежий",     price: 5, category: "Выпечка" },
  { emoji: "🍰", name: "Чизкейк",        desc: "Классический Нью-Йорк",           price: 15, category: "Десерты" },
  { emoji: "🥗", name: "Салат «Цезарь»", desc: "Курица, пармезан, сухарики",      price: 20, category: "Горячее и салаты" },
  { emoji: "🍝", name: "Паста карбонара", desc: "Бекон, сыр, сливочный соус",     price: 25, category: "Горячее и салаты" }
];

const promos = [
  { title: "Кофе + десерт", text: "Любой кофе и десерт со скидкой 15%.", when: "Пн–Пт, 8:00–11:00" },
  { title: "Счастливые часы", text: "Второй напиток в подарок.",         when: "Ежедневно, 15:00–17:00" },
  { title: "Студенческая скидка", text: "10% по студенческому билету.",  when: "Каждый день" }
];

const address = {
  city: "г. Ашхабад",
  street: "ул. Университетская, 12",
  hours: "Ежедневно, 8:00 – 22:00",
  phone: "+993 12 00-00-00",
  email: "cafe@example.com"
};

/* ---------- Функции отрисовки каждой вкладки ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;   // textContent — безопасно
  return node;
}

function renderMenu() {
  const box = el("section");
  box.append(el("h2", "", "Меню"));
  const grid = el("div", "grid");
  menuItems.forEach(item => {
    const card = el("article", "card");
    card.append(
      el("div", "emoji", item.emoji),
      el("h3", "", item.name),
      el("p", "desc", item.desc),
      el("span", "badge", item.category),
      el("p", "price", item.price + " ₽")
    );
    grid.append(card);
  });
  box.append(grid);
  return box;
}

function renderPromo() {
  const box = el("section");
  box.append(el("h2", "", "Акции"));
  const grid = el("div", "grid");
  promos.forEach(p => {
    const card = el("article", "card");
    card.append(el("h3", "", p.title), el("p", "desc", p.text), el("span", "badge", p.when));
    grid.append(card);
  });
  box.append(grid);
  return box;
}

function renderAddress() {
  const box = el("section", "card info");
  box.append(
    el("h2", "", "Как нас найти"),
    el("p", "", "📍 " + address.city + ", " + address.street),
    el("p", "", "🕒 " + address.hours),
    el("p", "", "📞 " + address.phone),
    el("p", "", "✉️ " + address.email)
  );
  return box;
}

const pages = { menu: renderMenu, promo: renderPromo, address: renderAddress };

/* ---------- Навигация ---------- */
const content = document.querySelector("#content");
const tabButtons = Array.from(document.querySelectorAll("[data-page]"));

function showPage(name) {
  const render = pages[name];
  if (!render) {                       // защита от некорректных данных
    content.replaceChildren(el("p", "error", "Раздел не найден"));
    return;
  }
  content.replaceChildren(render());   // замена содержимого без перезагрузки

  tabButtons.forEach(btn => {
    const isActive = btn.dataset.page === name;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
    btn.tabIndex = isActive ? 0 : -1;
  });

  try { localStorage.setItem("cafe:lastTab", name); } catch (e) { /* хранилище недоступно */ }
}

tabButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));

  // Творческое задание: клавиатурная навигация стрелками, Home/End
  btn.addEventListener("keydown", e => {
    let next = null;
    if (e.key === "ArrowRight") next = (index + 1) % tabButtons.length;
    if (e.key === "ArrowLeft")  next = (index - 1 + tabButtons.length) % tabButtons.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End")  next = tabButtons.length - 1;
    if (next !== null) {
      e.preventDefault();
      tabButtons[next].focus();
      showPage(tabButtons[next].dataset.page);
    }
  });
});

/* Творческое задание: запомнить последнюю вкладку */
let start = "menu";
try {
  const saved = localStorage.getItem("cafe:lastTab");
  if (saved && pages[saved]) start = saved;
} catch (e) { /* игнорируем */ }
showPage(start);
