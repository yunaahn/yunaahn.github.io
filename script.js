const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const screens = ['home', 'career', 'projects', 'skills', 'contact'];
const listLinks = $$('.list a');
const projects = listLinks.map(a => a.hash.split('/')[1]);
let current = 'home', project = projects[0], first = true;

function route() {
  let [screen, id] = location.hash.slice(1).split('/');
  if (!screens.includes(screen)) screen = 'home';
  if (projects.includes(id)) project = id;
  current = screen;
  screens.forEach(s => $('#' + s).classList.toggle('on', s === screen));
  $$('article').forEach(a => a.classList.toggle('on', a.id === 'p-' + project));
  $$('.top nav a').forEach(a => mark(a, a.hash === '#' + screen));
  listLinks.forEach(a => mark(a, a.hash.endsWith('/' + project)));
  scrollTo(0, 0);
  if (!first) {
    // 휴대폰에서는 목록 아래에 있는 상세 내용으로 바로 이동
    if (id && matchMedia('(max-width:820px)').matches) $('#p-' + project).scrollIntoView();
    else if (!document.activeElement.closest('.list, .cmd')) $('#' + screen).focus({ preventScroll: true });
  }
  first = false;
}
function mark(a, on) { on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); }
const go = hash => { location.hash = hash; };
addEventListener('hashchange', route);
route();

// 키보드
const input = $('#cmd'), output = $('.cmd output');
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || viewer.open) return;
  if (e.target === input) {
    if (e.key === 'Escape') { output.textContent = ''; input.value = ''; input.blur(); }
    return;
  }
  if (/^[1-5]$/.test(e.key)) go(screens[e.key - 1]);
  else if (e.key === '/') { e.preventDefault(); input.focus(); }
  else if (e.key === 'Escape') output.textContent = '';
  else if (current === 'projects' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault();
    const n = projects.length, i = projects.indexOf(project);
    const next = (i + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
    if (document.activeElement.closest('.list')) listLinks[next].focus();
    go('projects/' + projects[next]);
  }
});

// 명령어
const names = { home: ['1', '소개'], career: ['2', '경력'], projects: ['3', '프로젝트'], skills: ['4', '기술'], contact: ['5', '연락처'] };
$('.cmd').addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim().toLowerCase();
  input.value = '';
  output.textContent = '';
  const word = text.replace(/^(open|cd|cat)\s+/, '');
  const screen = screens.find(s => s === word || names[s].includes(word));
  if (screen) go(screen);
  else if (projects.includes(word)) go('projects/' + word);
  else if (word === 'ls') output.textContent = projects.join('  ');
  else if (word === 'whoami') output.textContent = '안유나, AI시대에 적합한 인재';
  else if (word === 'clear') return;
  else if (!word || word === 'help') output.textContent = '소개 / 경력 / 프로젝트 / 기술 / 연락처: 화면 이동\nopen emass: 프로젝트 열기\nls: 프로젝트 이름 보기\nwhoami: 자기소개\nEsc: 닫기';
  else output.textContent = `'${word}' 명령어가 없습니다. help를 입력해 보세요.`;
});
document.addEventListener('click', e => { if (!e.target.closest('.cmd')) output.textContent = ''; });

// 기술 → 프로젝트 (각 프로젝트에 적힌 기술스택 기준)
const uses = projects.map((id, i) => ({
  id, label: listLinks[i].textContent,
  stack: ($('#p-' + id + ' .stack')?.textContent || '').replace(/\(.*?\)/g, '').split(',').map(s => s.trim()),
  body: $('#p-' + id).textContent,
}));
$$('.skills dd').forEach(dd => {
  const items = dd.textContent.split(',').map(s => s.trim());
  dd.replaceChildren(...items.map(name => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = name; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      $$('.skills button').forEach(x => x.setAttribute('aria-pressed', x === b));
      const key = name.replace(/\s*\(.*\)/, '').replace(' Framework', '');
      const inBody = ['JPA', 'QueryDSL', 'JWT', 'STOMP', 'Kafka', 'Docker'].includes(key);
      const hits = uses.filter(u => u.stack.includes(key) || (inBody && u.body.includes(key)));
      $('.used').replaceChildren(...(hits.length ? hits.map(u => {
        const a = document.createElement('a'); a.href = '#projects/' + u.id; a.textContent = u.label; return a;
      }) : [`${name}: 프로젝트 기술스택에 따로 적지 않은 기술입니다.`]));
    });
    return b;
  }));
});

// 이미지 확대
const viewer = $('#viewer'), big = $('img', viewer);
$$('.shot').forEach(b => {
  const img = $('img', b);
  b.setAttribute('aria-label', `${img.alt} 크게 보기`);
  b.addEventListener('click', () => {
    big.src = img.src; big.alt = img.alt;
    big.style.maxWidth = `${img.naturalWidth * 2}px`;
    viewer.showModal();
  });
});
viewer.addEventListener('click', e => { if (e.target !== big) viewer.close(); });
