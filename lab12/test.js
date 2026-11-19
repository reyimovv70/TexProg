// Автотест 8 обязательных сценариев + проверка ролей. Запуск: npm install && npm test
const { spawn } = require('child_process');
const PORT = 3101, BASE = `http://localhost:${PORT}`;

async function call(method, url, body, cookie) {
  const res = await fetch(BASE + url, {
    method, redirect: 'manual',
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie()[0] : null;
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, cookie: sc ? sc.split(';')[0] : null, flags: sc || '' };
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const S = { login: 'student1', password: 'Student#2026' }, T = { login: 'teacher1', password: 'Teacher#2026' };

(async () => {
  const srv = spawn('node', ['server.js'], { env: { ...process.env, PORT, SESSION_TTL_MS: 2000 } });
  await new Promise(r => srv.stdout.on('data', r));
  const rows = [];
  const check = (n, name, exp, got) => rows.push([n, name, exp, got, exp === got ? 'Пройден' : 'Не пройден']);

  let r = await call('POST', '/api/login', S);
  check('1', 'Корректный вход студента (200, роль student)', 'student/200', `${r.data.role}/${r.status}`);
  const sc = r.cookie; console.log('Set-Cookie:', r.flags);
  r = await call('POST', '/api/login', { ...S, password: 'wrong' });  check('2', 'Неверный пароль', 401, r.status);
  r = await call('POST', '/api/login', { login: '', password: '' });  check('3', 'Пустые поля', 400, r.status);
  r = await call('GET', '/api/student/lessons');                       check('4', 'Доступ без входа', 401, r.status);
  r = await call('GET', '/api/me', null, sc);                          check('8', 'Обновление страницы (сессия сохраняется)', 200, r.status);
  r = await call('GET', '/api/student/lessons', null, sc);             check('R1', 'Студент → свой раздел', 200, r.status);
  r = await call('GET', '/teacher', null, sc);                         check('R2', 'Студент → страница /teacher', 403, r.status);
  r = await call('GET', '/teacher');                                   check('R3', 'Без входа → /teacher (редирект)', 302, r.status);

  r = await call('GET', '/api/teacher/grades', null, sc);              check('7', 'Студент → ресурс преподавателя', 403, r.status);
  let t = await call('POST', '/api/login', T);
  r = await call('GET', '/api/teacher/grades', null, t.cookie);        check('R4', 'Преподаватель → свой раздел', 200, r.status);
  r = await call('GET', '/api/student/lessons', null, t.cookie);       check('R5', 'Преподаватель → раздел студента', 403, r.status);

  await call('POST', '/api/logout', {}, sc);
  r = await call('GET', '/api/student/lessons', null, sc);             check('5', 'Повторный запрос после выхода', 401, r.status);

  r = await call('POST', '/api/login', S); const c2 = r.cookie; await sleep(2600);
  r = await call('GET', '/api/me', null, c2);                          check('6', 'Истёкшая сессия', 401, r.status);

  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  console.log('\n№ | Сценарий | Ожидается | Получено | Статус');
  for (const x of rows) console.log(x.join(' | '));
  srv.kill(); process.exit(rows.every(x => x[4] === 'Пройден') ? 0 : 1);
})();
