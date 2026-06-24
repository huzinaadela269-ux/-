// ===== "База данных" в localStorage =====
const DB = {
    getUsers()    { return JSON.parse(localStorage.getItem('users')    || '[]'); },
    setUsers(u)   { localStorage.setItem('users',    JSON.stringify(u)); },

    getBookings() { return JSON.parse(localStorage.getItem('bookings') || '[]'); },
    setBookings(b){ localStorage.setItem('bookings', JSON.stringify(b)); },

    getReviews()  { return JSON.parse(localStorage.getItem('reviews')  || '[]'); },
    setReviews(r) { localStorage.setItem('reviews',  JSON.stringify(r)); },

    getCurrentUser() { return JSON.parse(sessionStorage.getItem('currentUser') || 'null'); },
    setCurrentUser(u){ u ? sessionStorage.setItem('currentUser', JSON.stringify(u)) : sessionStorage.removeItem('currentUser'); },

    // Инициализация админа
    init() {
        const users = this.getUsers();
        if (!users.find(u => u.login === 'Admin26')) {
            users.push({
                id: 1,
                login: 'Admin26',
                password: 'Demo20',
                fullname: 'Администратор',
                phone: '+7 (495) 123-45-67',
                email: 'admin@uchus.ru',
                role: 'admin'
            });
            this.setUsers(users);
        }
        // Курсы
        if (!localStorage.getItem('courses')) {
            localStorage.setItem('courses', JSON.stringify([
                { id: 1, name: 'Повышение квалификации', description: 'Курс для специалистов, желающих обновить знания' },
                { id: 2, name: 'Профессиональная переподготовка', description: 'Получение новой профессии за короткий срок' },
                { id: 3, name: 'Охрана труда', description: 'Обучение по охране труда и технике безопасности' }
            ]));
        }
    }
};
DB.init();

function getCourses() { return JSON.parse(localStorage.getItem('courses') || '[]'); }

// ===== Валидаторы =====
const Validator = {
    login(v) {
        v = (v || '').trim();
        if (v.length < 6) return 'Логин должен быть не менее 6 символов';
        if (!/^[A-Za-z0-9]+$/.test(v)) return 'Только латинские буквы и цифры';
        return null;
    },
    password(v) {
        if (!v || v.length < 8) return 'Пароль должен быть не менее 8 символов';
        return null;
    },
    fullname(v) {
        if (!v || v.trim().length < 3) return 'Укажите ФИО полностью';
        return null;
    },
    phone(v) {
        v = (v || '').trim();
        if (!/^\+?[0-9\s\-\(\)]{10,}$/.test(v)) return 'Некорректный номер телефона';
        return null;
    },
    email(v) {
        v = (v || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Некорректный e-mail';
        return null;
    }
};

// ===== Уведомления =====
function notify(message, type = 'info') {
    const box = document.createElement('div');
    box.className = 'notify notify-' + type;
    box.textContent = message;
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('show'));
    setTimeout(() => {
        box.classList.remove('show');
        setTimeout(() => box.remove(), 350);
    }, 3000);
}

// ===== Защита страниц =====
function requireAuth() {
    if (!DB.getCurrentUser()) location.href = 'login.html';
}
function requireAdmin() {
    const u = DB.getCurrentUser();
    if (!u || u.role !== 'admin') location.href = 'login.html';
}

// ===== Шапка с выходом =====
function renderHeader() {
    const user = DB.getCurrentUser();
    const header = document.getElementById('app-header');
    if (!header) return;
    if (!user) {
        header.innerHTML = `
            <div class="header-inner">
                <h1>Учусь.РФ</h1>
                <div class="user-info">
                    <a href="login.html" class="nav-link">Вход</a>
                    <a href="register.html" class="nav-link">Регистрация</a>
                </div>
            </div>`;
        return;
    }
    const isAdmin = user.role === 'admin';
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    header.innerHTML = `
        <div class="header-inner">
            <h1>Учусь.РФ</h1>
            <div class="user-info">
                <span style="font-size:14px; opacity:0.9;">👤 ${user.fullname}</span>
                ${isAdmin ? '<span class="admin-badge">Админ</span>' : ''}
                <a href="cabinet.html" class="nav-link ${currentPage === 'cabinet.html' ? 'active' : ''}">Кабинет</a>
                ${isAdmin ? '<a href="admin.html" class="nav-link ' + (currentPage === 'admin.html' ? 'active' : '') + '">Админ</a>' : ''}
                ${!isAdmin ? '<a href="booking.html" class="nav-link ' + (currentPage === 'booking.html' ? 'active' : '') + '">Заявка</a>' : ''}
                <button id="logoutBtn" class="btn-logout">Выход</button>
            </div>
        </div>`;
    document.getElementById('logoutBtn').onclick = () => {
        DB.setCurrentUser(null);
        notify('Вы вышли из системы', 'info');
        setTimeout(() => location.href = 'login.html', 400);
    };
}