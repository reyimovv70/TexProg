// Лаб. №12, вариант 8: роли student/teacher, серверная сессия, проверка роли на сервере.
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const PORT = process.env.PORT || 3000;
const TTL = Number(process.env.SESSION_TTL_MS) || 5 * 60 * 1000;
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Пароли хранятся только как хеши (scrypt + соль). Учётные записи тестовые.
function hashPassword(pw, salt = crypto.randomBytes(16)) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64) };
}
function checkPassword(pw, rec) {
  return crypto.timingSafeEqual(crypto.scryptSync(pw, rec.salt, 64), rec.hash);
}
const users = {
  student1: { id: 1, name: 'Студент Тестов', role: 'student', ...hashPassword('Student#2026') },
  teacher1: { id: 2, name: 'Преподаватель Тестов', role: 'teacher', ...hashPassword('Teacher#2026') },
};
const DUMMY = hashPassword('dummy');

const lessons = [
  { id: 1, title: 'Лекция 11. Работа с API', time: 'Пн 09:00' },
  { id: 2, title: 'Лабораторная 12. Аутентификация', time: 'Ср 11:00' },
];
const grades = [
  { student: 'Студент Тестов', work: 'Лаб. 11', grade: 90 },
  { student: 'Студент Тестов', work: 'Лаб. 12', grade: 95 },
];

const app = express();
app.use(express.json());
app.use(session({
  name: 'sid', secret: SECRET, resave: false, saveUninitialized: false, rolling: true,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: TTL },
}));

// 401 — не вошёл; 403 — вошёл, но роль не подходит. Роль берётся из серверной сессии.
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Требуется вход' });
    if (req.session.role !== role) return res.status(403).json({ error: 'Доступ запрещён для вашей роли' });
    next();
  };
}
// То же для HTML-страниц: без входа — на форму входа, чужая роль — 403.
function pageRole(role, file) {
  return (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    if (req.session.role !== role) return res.status(403).send('403 — Доступ запрещён для вашей роли');
    res.sendFile(path.join(__dirname, 'views', file));
  };
}

app.post('/api/login', (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) return res.status(400).json({ error: 'Заполните логин и пароль' });
  const user = users[String(login)];
  const ok = checkPassword(String(password), user || DUMMY) && !!user;
  if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' });
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    req.session.userId = user.id;
    req.session.name = user.name;
    req.session.role = user.role;
    res.json({ name: user.name, role: user.role, expiresAt: Date.now() + TTL });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => { res.clearCookie('sid'); res.json({ ok: true }); });
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Требуется вход' });
  res.json({ name: req.session.name, role: req.session.role, expiresAt: Date.now() + TTL });
});

app.get('/api/student/lessons', requireRole('student'), (req, res) => res.json(lessons));
app.get('/api/teacher/grades', requireRole('teacher'), (req, res) => res.json(grades));

app.get('/student', pageRole('student', 'student.html'));
app.get('/teacher', pageRole('teacher', 'teacher.html'));

// Страница входа: если уже вошёл — сразу в свой раздел
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect(req.session.role === 'teacher' ? '/teacher' : '/student');
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
