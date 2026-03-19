// ===== 데이터 (메모리 배열) =====
let todos = [];   // { id, text, completed, createdAt, completedAt }
let nextId = 1;

// ===== 필터 상태 =====
let currentFilter = 'all';  // 'all' | 'active' | 'completed'

// ===== LocalStorage 키 =====
const STORAGE_KEY = 'todos';

// ===== DOM 요소 캐싱 =====
const todoInput = document.getElementById('todoInput');
const btnAdd    = document.getElementById('btnAdd');
const todoList  = document.getElementById('todoList');

// ===== 날짜 포맷 헬퍼: Date → "YY년 MM월 DD일" =====
function formatDate(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
}

// ===== LocalStorage 저장 =====
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, nextId }));
}

// ===== LocalStorage 불러오기 (날짜 문자열 → Date 객체 복원) =====
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const data = JSON.parse(raw);
  nextId = data.nextId;
  todos = data.todos.map(t => ({
    ...t,
    createdAt:   new Date(t.createdAt),
    completedAt: t.completedAt ? new Date(t.completedAt) : null,
  }));
}

// ===== 통계 업데이트 =====
function updateStats() {
  const total     = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const remaining = total - completed;
  document.getElementById('todoStats').textContent =
    `전체 ${total}개　　완료 ${completed}개　　미완료 ${remaining}개`;
}

// ===== 렌더링: 필터 적용 후 목록 그리기 =====
function render() {
  todoList.innerHTML = '';

  // 필터에 따라 표시할 항목 결정
  const filtered = todos.filter(t => {
    if (currentFilter === 'active')    return !t.completed;
    if (currentFilter === 'completed') return  t.completed;
    return true;
  });

  filtered.forEach(todo => {
    // 항목 <li>
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    // 체크박스
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-check';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    // 텍스트 + 날짜를 묶는 컨테이너
    const info = document.createElement('div');
    info.className = 'todo-info';

    // 할일 텍스트
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    // 날짜 영역
    const meta = document.createElement('div');
    meta.className = 'todo-meta';
    meta.textContent = `추가: ${formatDate(todo.createdAt)}`;
    if (todo.completedAt) {
      meta.textContent += `　　완료: ${formatDate(todo.completedAt)}`;
    }

    info.appendChild(span);
    info.appendChild(meta);

    // 삭제 버튼
    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-delete';
    btnDelete.textContent = '삭제';
    btnDelete.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(info);
    li.appendChild(btnDelete);
    todoList.appendChild(li);
  });

  // 필터 버튼 active 클래스 동기화
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });

  // 완료된 항목 삭제 버튼: 완료 항목 없으면 비활성화
  document.getElementById('btnClearCompleted').disabled = !todos.some(t => t.completed);

  updateStats();
}

// ===== 할일 추가 =====
function addTodo() {
  const text = todoInput.value.trim();

  // 빈 값 검사
  if (!text) {
    alert('할 일을 입력하세요');
    todoInput.focus();
    return;
  }

  // 중복 검사
  if (todos.some(t => t.text === text)) {
    alert('이미 등록된 할 일입니다');
    todoInput.focus();
    return;
  }

  todos.push({ id: nextId++, text: text, completed: false, createdAt: new Date(), completedAt: null });
  todoInput.value = '';
  render();
  saveToStorage();
}

// ===== 완료/미완료 토글 =====
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date() : null;
  }
  render();
  saveToStorage();
}

// ===== 할일 삭제 =====
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  render();
  saveToStorage();
}

// ===== 완료된 항목 일괄 삭제 =====
function deleteCompleted() {
  todos = todos.filter(t => !t.completed);
  render();
  saveToStorage();
}

// ===== 이벤트 연결 및 초기화 =====
function initApp() {
  // 저장된 데이터 불러오기
  loadFromStorage();
  render();

  // 추가하기 버튼 클릭
  btnAdd.addEventListener('click', addTodo);

  // Enter 키로 추가
  todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  // 필터 버튼
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // 완료된 항목 일괄 삭제
  document.getElementById('btnClearCompleted').addEventListener('click', deleteCompleted);
}

initApp();
