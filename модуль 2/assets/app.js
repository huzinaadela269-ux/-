// ============================================
//   ОБЩИЙ JAVASCRIPT ДЛЯ ВСЕХ СТРАНИЦ
// ============================================

// ===== БАЗА ДАННЫХ (localStorage) =====
const DB = {
    getUsers() {
        return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    },
    setUsers(u) {
        localStorage.setItem('registeredUsers', JSON.stringify(u));
    },
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    },
    setCurrentUser(u) {
        u ? localStorage.setItem('currentUser', JSON.stringify(u)) : localStorage.removeItem('currentUser');
    },
    getBookings() {
        return JSON.parse(localStorage.getItem('bookings') || '[]');
    },
    setBookings(b) {
        localStorage.setItem('bookings', JSON.stringify(b));
    },
    getReviews() {
        return JSON.parse(localStorage.getItem('reviews') || '[]');
    },
    setReviews(r) {
        localStorage.setItem('reviews', JSON.stringify(r));
    }
};

// ===== ДЕМО-ПОЛЬЗОВАТЕЛИ =====
const DEMO_USERS = [
    { login: 'Admin26', password: 'Demo20', role: 'admin', name: 'Администратор' },
    { login: 'user2026', password: 'password', role: 'user', name: 'Иванов Иван Иванович' }
];

// ===== КУРСЫ =====
const COURSES = [
    { id: 'qualification', name: 'Повышение квалификации', icon: '📚' },
    { id: 'retraining', name: 'Профессиональная переподготовка', icon: '🎓' },
    { id: 'safety', name: 'Охрана труда', icon: '🛡️' }
];

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getInitials(name) {
    if (!name) return 'У';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function parseDate(dateStr) {
    const parts = dateStr.split('.');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function formatDate(date) {
    const d = new Date(date);
    return String(d.getDate()).padStart(2, '0') + '.' + 
           String(d.getMonth() + 1).padStart(2, '0') + '.' + 
           d.getFullYear();
}

// ===== TOAST / УВЕДОМЛЕНИЯ =====
function showToast(message, type = '') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<i class="fas fa-exclamation-circle"></i><span id="toastText">Сообщение</span>';
        document.body.appendChild(toast);
    }
    const toastText = document.getElementById('toastText');
    toastText.textContent = message;
    toast.className = 'toast ' + type;
    toast.querySelector('i').className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== ПРОВЕРКА АВТОРИЗАЦИИ =====
function requireAuth() {
    const user = DB.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    const user = DB.getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ===== ВАЛИДАЦИЯ =====
function validateLogin(login) {
    if (!login || login.length < 6) return 'Минимум 6 символов';
    if (!/^[a-zA-Z0-9]+$/.test(login)) return 'Только латиница и цифры';
    return null;
}

function validatePassword(password) {
    if (!password || password.length < 8) return 'Минимум 8 символов';
    return null;
}

function validateEmail(email) {
    if (!email) return 'Введите email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Некорректный email';
    return null;
}

function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (!phone || digits.length < 11) return 'Введите корректный номер';
    return null;
}

function validateFullName(name) {
    if (!name || name.trim().split(' ').length < 2) return 'Введите полное ФИО';
    return null;
}

// ============================================
//   СТРАНИЦА: ГЛАВНАЯ (index.html)
// ============================================
function initIndexPage() {
    const user = DB.getCurrentUser();
    if (user) {
        if (user.role === 'admin') {
            window.location.href = 'assets/admin.html';
        } else {
            window.location.href = 'assets/cabinet.html';
        }
    }
}

// ============================================
//   СТРАНИЦА: ВХОД (login.html)
// ============================================
function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMsg');

    function showError() {
        if (errorMsg) errorMsg.classList.add('visible');
        loginInput.classList.add('error');
        passwordInput.classList.add('error');
        showToast('Неверный логин или пароль');
        setTimeout(() => {
            loginInput.classList.remove('error');
            passwordInput.classList.remove('error');
        }, 600);
    }

    loginInput.addEventListener('input', () => {
        if (errorMsg) errorMsg.classList.remove('visible');
        loginInput.classList.remove('error');
    });
    
    passwordInput.addEventListener('input', () => {
        if (errorMsg) errorMsg.classList.remove('visible');
        passwordInput.classList.remove('error');
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        if (!login || !password) {
            showToast('Заполните все поля');
            return;
        }

        const demoUser = DEMO_USERS.find(u => u.login === login && u.password === password);
        if (demoUser) {
            DB.setCurrentUser(demoUser);
            if (demoUser.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'cabinet.html';
            }
            return;
        }

        const users = DB.getUsers();
        const regUser = users.find(u => u.login === login && u.password === password);
        if (regUser) {
            DB.setCurrentUser(regUser);
            showToast('Вход выполнен успешно!', 'success');
            setTimeout(() => {
                window.location.href = 'cabinet.html';
            }, 800);
            return;
        }

        showError();
    });
}

// ============================================
//   СТРАНИЦА: РЕГИСТРАЦИЯ (register.html)
// ============================================
function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const inputs = {
        fullName: document.getElementById('fullName'),
        login: document.getElementById('login'),
        password: document.getElementById('password'),
        phone: document.getElementById('phone'),
        email: document.getElementById('email')
    };
    const errors = {
        fullName: document.getElementById('fullNameError'),
        login: document.getElementById('loginError'),
        password: document.getElementById('passwordError'),
        phone: document.getElementById('phoneError'),
        email: document.getElementById('emailError')
    };

    function showError(field, show) {
        if (show) {
            inputs[field].classList.add('error');
            errors[field].classList.add('visible');
        } else {
            inputs[field].classList.remove('error');
            errors[field].classList.remove('visible');
        }
    }

    // Маска для телефона
    inputs.phone.addEventListener('input', function(e) {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 0) {
            if (val[0] === '7' || val[0] === '8') val = val.substring(1);
            let formatted = '+7';
            if (val.length > 0) formatted += ' (' + val.substring(0, 3);
            if (val.length >= 3) formatted += ') ' + val.substring(3, 6);
            if (val.length >= 6) formatted += '-' + val.substring(6, 8);
            if (val.length >= 8) formatted += '-' + val.substring(8, 10);
            e.target.value = formatted;
        }
    });

    // Индикатор силы пароля
    const strengthDiv = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    inputs.password.addEventListener('input', function() {
        const val = this.value;
        if (val.length > 0) {
            strengthDiv.classList.add('visible');
            strengthBar.className = 'password-strength-bar';
            if (val.length < 6) strengthBar.classList.add('strength-weak');
            else if (val.length < 10) strengthBar.classList.add('strength-medium');
            else strengthBar.classList.add('strength-strong');
        } else {
            strengthDiv.classList.remove('visible');
        }
    });

    // Валидация на blur
    inputs.login.addEventListener('blur', function() {
        const err = validateLogin(this.value);
        showError('login', !!err);
        if (err) errors.login.querySelector('span').textContent = err;
    });
    inputs.password.addEventListener('blur', function() {
        const err = validatePassword(this.value);
        showError('password', !!err);
        if (err) errors.password.querySelector('span').textContent = err;
    });
    inputs.email.addEventListener('blur', function() {
        const err = validateEmail(this.value);
        showError('email', !!err);
        if (err) errors.email.querySelector('span').textContent = err;
    });
    inputs.fullName.addEventListener('blur', function() {
        const err = validateFullName(this.value);
        showError('fullName', !!err);
        if (err) errors.fullName.querySelector('span').textContent = err;
    });
    inputs.phone.addEventListener('blur', function() {
        const err = validatePhone(this.value);
        showError('phone', !!err);
        if (err) errors.phone.querySelector('span').textContent = err;
    });

    // Очистка ошибок при вводе
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', () => showError(key, false));
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let valid = true;

        const fullNameErr = validateFullName(inputs.fullName.value);
        if (fullNameErr) { showError('fullName', true); errors.fullName.querySelector('span').textContent = fullNameErr; valid = false; }

        const loginErr = validateLogin(inputs.login.value);
        if (loginErr) { showError('login', true); errors.login.querySelector('span').textContent = loginErr; valid = false; }

        const passwordErr = validatePassword(inputs.password.value);
        if (passwordErr) { showError('password', true); errors.password.querySelector('span').textContent = passwordErr; valid = false; }

        const phoneErr = validatePhone(inputs.phone.value);
        if (phoneErr) { showError('phone', true); errors.phone.querySelector('span').textContent = phoneErr; valid = false; }

        const emailErr = validateEmail(inputs.email.value);
        if (emailErr) { showError('email', true); errors.email.querySelector('span').textContent = emailErr; valid = false; }

        if (valid) {
            const users = DB.getUsers();
            const existing = users.find(u => u.login === inputs.login.value.trim());
            if (existing) {
                showError('login', true);
                errors.login.querySelector('span').textContent = 'Этот логин уже занят';
                showToast('Этот логин уже занят', 'error');
                return;
            }

            const newUser = {
                login: inputs.login.value.trim(),
                password: inputs.password.value,
                name: inputs.fullName.value.trim(),
                phone: inputs.phone.value,
                email: inputs.email.value.trim(),
                role: 'user'
            };
            users.push(newUser);
            DB.setUsers(users);

            showToast('Регистрация прошла успешно!', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        } else {
            showToast('Проверьте правильность заполнения полей', 'error');
        }
    });
}

// ============================================
//   СТРАНИЦА: ЗАЯВКА (booking.html)
// ============================================
function initBookingPage() {
    if (!requireAuth()) return;

    // Заполнение списка курсов
    const select = document.getElementById('courseSelect');
    if (select) {
        select.innerHTML = `<option value="" disabled selected>Выберите курс</option>`;
        COURSES.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.icon + ' ' + c.name;
            select.appendChild(opt);
        });
    }

    // Маска даты
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        dateInput.addEventListener('input', function(e) {
            let val = this.value.replace(/\D/g, '');
            let formatted = '';
            if (val.length > 0) formatted += val.substring(0, 2);
            if (val.length >= 2) formatted += '.' + val.substring(2, 4);
            if (val.length >= 4) formatted += '.' + val.substring(4, 8);
            this.value = formatted;
        });
    }

    // Настройка оплаты
    const paymentContainer = document.getElementById('paymentContainer');
    let selectedPayment = null;
    if (paymentContainer) {
        paymentContainer.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', function() {
                paymentContainer.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedPayment = this.dataset.payment;
            });
        });
    }

    // Обработка формы
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const course = document.getElementById('courseSelect').value;
            const date = document.getElementById('dateInput').value;

            if (!course) {
                showToast('Выберите курс');
                return;
            }
            if (!date || date.length < 10) {
                showToast('Введите корректную дату');
                return;
            }
            if (!selectedPayment) {
                showToast('Выберите способ оплаты');
                return;
            }

            const user = DB.getCurrentUser();
            const bookings = DB.getBookings();
            const courseObj = COURSES.find(c => c.id === course);
            
            bookings.push({
                id: Date.now(),
                user_id: user ? user.login : 'anonymous',
                user_name: user ? user.name : 'Гость',
                course: courseObj ? courseObj.name : course,
                course_id: course,
                date: date,
                payment: selectedPayment,
                status: 'new',
                created_at: new Date().toISOString()
            });
            DB.setBookings(bookings);

            document.getElementById('successModal').classList.add('active');
        });
    }

    // Закрытие модалки успеха
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === this) {
                window.location.href = 'cabinet.html';
            }
        });
    }

    // Кнопка закрытия модалки
    const closeBtn = document.querySelector('#successModal .btn-success');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            window.location.href = 'cabinet.html';
        });
    }
}

// ============================================
//   СТРАНИЦА: КАБИНЕТ (cabinet.html)
// ============================================
function initCabinetPage() {
    if (!requireAuth()) return;

    // Загрузка пользователя в шапку
    const user = DB.getCurrentUser();
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl && user) {
        avatarEl.textContent = getInitials(user.name);
    }

    // Инициализация слайдера
    const track = document.getElementById('sliderTrack');
    if (track) {
        const slides = track.querySelectorAll('.slide');
        if (slides.length > 0) {
            let currentSlide = 0;
            const totalSlides = slides.length;
            let autoSlideInterval;

            const dotsContainer = document.getElementById('sliderDots');
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'dot' + (i === 0 ? ' active' : '');
                dot.onclick = () => goToSlide(i);
                dotsContainer.appendChild(dot);
            });

            const dots = dotsContainer.querySelectorAll('.dot');

            function updateSlider() {
                track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentSlide);
                });
            }

            function goToSlide(index) {
                currentSlide = index;
                if (currentSlide < 0) currentSlide = totalSlides - 1;
                if (currentSlide >= totalSlides) currentSlide = 0;
                updateSlider();
                resetAutoSlide();
            }

            function nextSlide() { goToSlide(currentSlide + 1); }
            function prevSlide() { goToSlide(currentSlide - 1); }

            function startAutoSlide() {
                autoSlideInterval = setInterval(nextSlide, 3000);
            }

            function resetAutoSlide() {
                clearInterval(autoSlideInterval);
                startAutoSlide();
            }

            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            if (prevBtn) prevBtn.addEventListener('click', prevSlide);
            if (nextBtn) nextBtn.addEventListener('click', nextSlide);

            let touchStartX = 0;
            let touchEndX = 0;
            track.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            });
            track.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 50) nextSlide();
                if (touchEndX - touchStartX > 50) prevSlide();
            });

            startAutoSlide();
        }
    }

    // Получаем данные
    const bookings = DB.getBookings().filter(b => b.user_id === user.login || b.user_name === user.name);
    const reviews = DB.getReviews();

    // Рендер заявок
    const container = document.getElementById('requestsList');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Заявок пока нет. Создайте первую заявку!</p>
            </div>
        `;
    } else {
        container.innerHTML = bookings.map((b, index) => {
            const statusMap = {
                'new': { class: 'status-new', label: 'Новая' },
                'assigned': { class: 'status-assigned', label: 'Идет обучение' },
                'completed': { class: 'status-completed', label: 'Обучение завершено' }
            };
            const status = statusMap[b.status] || statusMap['new'];
            
            const myReview = reviews.find(r => r.booking_id === b.id);
            const canReview = (b.status === 'assigned' || b.status === 'completed') && !myReview;
            
            let reviewBlock = '';
            if (myReview) {
                reviewBlock = `<div style="background:#f8f9fa;padding:8px 12px;border-radius:8px;font-size:13px;margin-top:8px;">⭐ ${myReview.rating}/5 — ${myReview.comment}</div>`;
            } else if (canReview) {
                reviewBlock = `
                    <div class="request-actions" style="margin-top:8px;">
                        <button class="btn-review" onclick="openReviewModal('${b.course}', ${b.id})">
                            <i class="fas fa-star"></i>Оставить отзыв
                        </button>
                    </div>
                `;
            } else {
                reviewBlock = `<div style="font-size:12px;color:#ced4da;margin-top:8px;">Отзыв будет доступен после подтверждения администратором</div>`;
            }

            return `
                <div class="request-card ${status.class}" style="animation-delay: ${index * 0.1}s;">
                    <div class="request-header">
                        <div class="request-course">${b.course}</div>
                        <span class="request-status">${status.label}</span>
                    </div>
                    <div class="request-details">
                        <div class="request-detail"><i class="fas fa-calendar-alt"></i>${b.date}</div>
                        <div class="request-detail"><i class="fas fa-credit-card"></i>${b.payment}</div>
                    </div>
                    ${reviewBlock}
                </div>
            `;
        }).join('');
    }

    // Модальное окно для отзывов
    let currentBookingId = null;
    
    window.openReviewModal = function(courseName, bookingId) {
        currentBookingId = bookingId;
        document.getElementById('reviewCourseName').textContent = courseName;
        document.getElementById('reviewModal').classList.add('active');
        document.querySelectorAll('#ratingStars .star').forEach(s => s.classList.remove('active'));
        document.querySelector('.review-textarea').value = '';
    };

    window.closeReviewModal = function() {
        document.getElementById('reviewModal').classList.remove('active');
    };

    window.submitReview = function() {
        const stars = document.querySelectorAll('#ratingStars .star');
        let rating = 0;
        stars.forEach((s, i) => {
            if (s.classList.contains('active')) rating = i + 1;
        });
        
        if (rating === 0) {
            showToast('Поставьте оценку', 'error');
            return;
        }
        
        const comment = document.querySelector('.review-textarea').value.trim();
        if (!comment) {
            showToast('Введите текст отзыва', 'error');
            return;
        }

        const reviewsList = DB.getReviews();
        reviewsList.push({
            id: Date.now(),
            booking_id: currentBookingId,
            user_id: user.login,
            rating: rating,
            comment: comment,
            created_at: new Date().toISOString()
        });
        DB.setReviews(reviewsList);

        showToast('Отзыв отправлен!', 'success');
        window.closeReviewModal();
        setTimeout(() => location.reload(), 500);
    };

    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) window.closeReviewModal();
        });
    }

    // Звезды рейтинга
    document.querySelectorAll('#ratingStars .star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            document.querySelectorAll('#ratingStars .star').forEach((s, i) => {
                s.classList.toggle('active', i < rating);
            });
        });
    });
}

// ============================================
//   СТРАНИЦА: АДМИН (admin.html)
// ============================================
function initAdminPage() {
    if (!requireAdmin()) return;

    let bookings = DB.getBookings();
    
    // Если заявок нет, создаем демо-заявки
    if (bookings.length === 0) {
        const demoBookings = [
            { id: 1, user_name: 'Иванов Иван Иванович', user_id: 'ivanov_ii', course: 'Повышение квалификации', date: '15.07.2026', payment: 'Предоплата по QR', status: 'new', created_at: new Date().toISOString() },
            { id: 2, user_name: 'Петрова Мария Сергеевна', user_id: 'petrova_ms', course: 'Профпереподготовка', date: '18.07.2026', payment: 'Карта МИР', status: 'new', created_at: new Date().toISOString() },
            { id: 3, user_name: 'Сидоров Алексей Викторович', user_id: 'sidorov_av', course: 'Охрана труда', date: '20.07.2026', payment: 'Постоплата в офисе', status: 'new', created_at: new Date().toISOString() },
            { id: 4, user_name: 'Козлова Елена Дмитриевна', user_id: 'kozlova_ed', course: 'Повышение квалификации', date: '12.07.2026', payment: 'Карта МИР', status: 'assigned', created_at: new Date().toISOString() },
            { id: 5, user_name: 'Новиков Дмитрий Андреевич', user_id: 'novikov_da', course: 'Профпереподготовка', date: '20.07.2026', payment: 'Предоплата по QR', status: 'assigned', created_at: new Date().toISOString() },
            { id: 6, user_name: 'Морозова Анна Павловна', user_id: 'morozova_ap', course: 'Охрана труда', date: '10.06.2026', payment: 'Постоплата в офисе', status: 'completed', created_at: new Date().toISOString() }
        ];
        DB.setBookings(demoBookings);
        bookings = DB.getBookings();
    }

    let currentFilter = 'all';
    let currentSort = 'date-desc';
    let currentPage = 1;
    const itemsPerPage = 4;
    let editingRequestId = null;
    let selectedNewStatus = null;

    const statusLabels = {
        new: 'Новая',
        assigned: 'Идет обучение',
        completed: 'Обучение завершено'
    };

    function filterRequests() {
        let filtered = [...bookings];

        if (currentFilter !== 'all') {
            const filterMap = { 'new': 'new', 'assigned': 'assigned', 'completed': 'completed' };
            filtered = filtered.filter(r => r.status === filterMap[currentFilter]);
        }

        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(r => 
                r.user_name.toLowerCase().includes(searchTerm) ||
                (r.user_id && r.user_id.toLowerCase().includes(searchTerm)) ||
                r.course.toLowerCase().includes(searchTerm)
            );
        }

        filtered.sort((a, b) => {
            switch(currentSort) {
                case 'date-desc':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'date-asc':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'name':
                    return a.user_name.localeCompare(b.user_name);
                case 'course':
                    return a.course.localeCompare(b.course);
                default: return 0;
            }
        });

        return filtered;
    }

    function renderRequests() {
        const filtered = filterRequests();
        const container = document.getElementById('requestsContainer');
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const pageItems = filtered.slice(start, start + itemsPerPage);

        container.innerHTML = '';

        if (pageItems.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:#CED4DA;"><i class="fas fa-inbox" style="font-size:48px;margin-bottom:12px;opacity:0.5;display:block;"></i><p>Заявки не найдены</p></div>';
            document.getElementById('pagination').innerHTML = '';
            updateStats();
            return;
        }

        pageItems.forEach((req, index) => {
            const card = document.createElement('div');
            card.className = 'admin-request-item status-' + req.status;
            card.style.animationDelay = (index * 0.1) + 's';
            card.innerHTML = `
                <div class="admin-request-header">
                    <div class="admin-request-user">
                        <div class="admin-user-avatar">${getInitials(req.user_name)}</div>
                        <div>
                            <div class="admin-user-name">${req.user_name}</div>
                            <div class="admin-user-login">${req.user_id || 'user'}</div>
                        </div>
                    </div>
                    <span class="admin-request-badge">${statusLabels[req.status]}</span>
                </div>
                <div class="admin-request-details">
                    <div class="admin-detail-cell"><i class="fas fa-graduation-cap"></i>${req.course}</div>
                    <div class="admin-detail-cell"><i class="fas fa-calendar-alt"></i>${req.date}</div>
                    <div class="admin-detail-cell"><i class="fas fa-credit-card"></i>${req.payment}</div>
                </div>
                <div class="admin-request-actions">
                    <button class="admin-btn-action admin-btn-assign" onclick="openStatusModal(${req.id})" ${req.status === 'assigned' ? 'disabled' : ''}>
                        <i class="fas fa-graduation-cap"></i>Начать обучение
                    </button>
                    <button class="admin-btn-action admin-btn-complete" onclick="openStatusModal(${req.id})" ${req.status === 'completed' ? 'disabled' : ''}>
                        <i class="fas fa-check-double"></i>Завершить
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        renderPagination(totalPages);
        updateStats();
    }

    function renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        html += '<button class="admin-page-btn" onclick="changePage(' + (currentPage - 1) + ')" ' + (currentPage === 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';

        for (let i = 1; i <= totalPages; i++) {
            html += '<button class="admin-page-btn ' + (i === currentPage ? 'active' : '') + '" onclick="changePage(' + i + ')">' + i + '</button>';
        }

        html += '<button class="admin-page-btn" onclick="changePage(' + (currentPage + 1) + ')" ' + (currentPage === totalPages ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
        pagination.innerHTML = html;
    }

    function changePage(page) {
        currentPage = page;
        renderRequests();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateStats() {
        const counts = { new: 0, assigned: 0, completed: 0 };
        bookings.forEach(r => {
            if (r.status === 'new') counts.new++;
            else if (r.status === 'assigned') counts.assigned++;
            else if (r.status === 'completed') counts.completed++;
        });
        document.getElementById('statNew').textContent = counts.new;
        document.getElementById('statAssigned').textContent = counts.assigned;
        document.getElementById('statCompleted').textContent = counts.completed;
        document.getElementById('statTotal').textContent = bookings.length;
    }

    // Фильтры
    document.querySelectorAll('.admin-filter-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.admin-filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            currentPage = 1;
            renderRequests();
        });
    });

    document.getElementById('searchInput').addEventListener('input', function() {
        currentPage = 1;
        renderRequests();
    });

    document.getElementById('sortSelect').addEventListener('change', function() {
        currentSort = this.value;
        renderRequests();
    });

    // Модальное окно статуса
    const modal = document.getElementById('statusModal');

    window.openStatusModal = function(requestId) {
        editingRequestId = requestId;
        const req = bookings.find(r => r.id === requestId);
        document.getElementById('modalRequestInfo').textContent = 'Заявка №' + req.id + ' — ' + req.user_name;

        selectedNewStatus = req.status;
        document.querySelectorAll('.admin-status-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.status === req.status);
        });

        modal.classList.add('active');
    };

    window.selectStatus = function(status) {
        selectedNewStatus = status;
        document.querySelectorAll('.admin-status-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.status === status);
        });
    };

    window.confirmStatusChange = function() {
        if (!selectedNewStatus || !editingRequestId) return;

        const req = bookings.find(r => r.id === editingRequestId);
        if (req) {
            req.status = selectedNewStatus;
            DB.setBookings(bookings);
            showToast('Статус заявки №' + req.id + ' изменён на «' + statusLabels[selectedNewStatus] + '»', 'success');
            renderRequests();
        }
        closeStatusModal();
    };

    function closeStatusModal() {
        modal.classList.remove('active');
        editingRequestId = null;
        selectedNewStatus = null;
    }

    modal.addEventListener('click', e => {
        if (e.target === modal) closeStatusModal();
    });

    // Инициализация
    renderRequests();
}

// ============================================
//   АВТОЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(path) {
        case 'index.html':
            initIndexPage();
            break;
        case 'login.html':
            initLoginPage();
            break;
        case 'register.html':
            initRegisterPage();
            break;
        case 'booking.html':
            initBookingPage();
            break;
        case 'cabinet.html':
            initCabinetPage();
            break;
        case 'admin.html':
            initAdminPage();
            break;
        default:
            // Если страница не распознана, пытаемся определить по наличию элементов
            if (document.getElementById('loginForm')) initLoginPage();
            else if (document.getElementById('registerForm')) initRegisterPage();
            else if (document.getElementById('bookingForm')) initBookingPage();
            else if (document.getElementById('requestsList')) initCabinetPage();
            else if (document.getElementById('requestsContainer')) initAdminPage();
            else if (document.querySelector('.hero')) initIndexPage();
    }
});