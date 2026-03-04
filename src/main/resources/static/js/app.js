/**
 * Money Tracker — Main Application
 */
document.addEventListener('DOMContentLoaded', () => {
    // ===== State =====
    let categories = [];
    let transactions = [];
    let deleteCallback = null;

    // ===== DOM Elements =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const sidebar = $('#sidebar');
    const menuToggle = $('#menuToggle');
    const pageTitle = $('#pageTitle');
    const navItems = $$('.nav-item');
    const pages = $$('.page');

    // Dashboard
    const totalIncomeEl = $('#totalIncome');
    const totalExpensesEl = $('#totalExpenses');
    const balanceEl = $('#balance');
    const categoryBarsEl = $('#categoryBars');
    const recentTransactionsEl = $('#recentTransactions');

    // Transactions
    const transactionsBody = $('#transactionsBody');
    const transactionsEmpty = $('#transactionsEmpty');
    const filterType = $('#filterType');
    const filterFrom = $('#filterFrom');
    const filterTo = $('#filterTo');
    const applyFiltersBtn = $('#applyFilters');
    const clearFiltersBtn = $('#clearFilters');

    // Categories
    const categoriesGrid = $('#categoriesGrid');
    const categoriesEmpty = $('#categoriesEmpty');

    // Transaction Modal
    const transactionModal = $('#transactionModal');
    const transactionForm = $('#transactionForm');
    const transactionIdEl = $('#transactionId');
    const transactionModalTitle = $('#transactionModalTitle');
    const transactionTypeEl = $('#transactionType');
    const transactionAmountEl = $('#transactionAmount');
    const transactionCategoryEl = $('#transactionCategory');
    const transactionDescriptionEl = $('#transactionDescription');
    const transactionDateEl = $('#transactionDate');
    const typeExpenseBtn = $('#typeExpenseBtn');
    const typeIncomeBtn = $('#typeIncomeBtn');

    // Category Modal
    const categoryModal = $('#categoryModal');
    const categoryForm = $('#categoryForm');
    const categoryIdEl = $('#categoryId');
    const categoryModalTitle = $('#categoryModalTitle');
    const categoryNameEl = $('#categoryName');
    const categoryTypeEl = $('#categoryType');

    // Delete Modal
    const deleteModal = $('#deleteModal');
    const deleteMessage = $('#deleteMessage');

    // ===== Utility Functions =====
    function formatMoney(amount) {
        const num = parseFloat(amount) || 0;
        return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function showToast(message, type = 'success') {
        const container = $('#toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function getCategoryIcon(type) {
        return type === 'INCOME' ? 'fa-arrow-down' : 'fa-arrow-up';
    }

    // ===== Navigation =====
    const pageTitles = {
        dashboard: 'Дашборд',
        transactions: 'Транзакции',
        categories: 'Категории',
    };

    function navigateTo(page) {
        navItems.forEach(item => item.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));

        const navItem = $(`.nav-item[data-page="${page}"]`);
        const pageEl = $(`#${page}Page`);

        if (navItem) navItem.classList.add('active');
        if (pageEl) pageEl.classList.add('active');
        pageTitle.textContent = pageTitles[page] || page;

        // Reload data for each page
        if (page === 'dashboard') loadDashboard();
        else if (page === 'transactions') loadTransactions();
        else if (page === 'categories') loadCategories();

        // Close sidebar on mobile
        sidebar.classList.remove('open');
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // ===== Dashboard =====
    async function loadDashboard() {
        try {
            const [summary, txns] = await Promise.all([
                API.getSummary(),
                API.getTransactions(),
            ]);

            // Summary Cards
            totalIncomeEl.textContent = formatMoney(summary.totalIncome);
            totalExpensesEl.textContent = formatMoney(summary.totalExpenses);
            balanceEl.textContent = formatMoney(summary.balance);

            // Category Bars
            renderCategoryBars(summary.spendingByCategory || {});

            // Recent Transactions (last 7)
            const recent = txns.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);
            renderRecentTransactions(recent);
        } catch (err) {
            showToast('Ошибка загрузки данных', 'error');
        }
    }

    function renderCategoryBars(spending) {
        const entries = Object.entries(spending);
        if (entries.length === 0) {
            categoryBarsEl.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>Нет расходов</p></div>';
            return;
        }

        const max = Math.max(...entries.map(([, v]) => v));

        categoryBarsEl.innerHTML = entries.map(([name, amount], i) => `
            <div class="bar-item">
                <div class="bar-header">
                    <span class="bar-name">${name}</span>
                    <span class="bar-amount">${formatMoney(amount)}</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill c${i % 8}" style="width: ${(amount / max) * 100}%"></div>
                </div>
            </div>
        `).join('');
    }

    function renderRecentTransactions(txns) {
        if (txns.length === 0) {
            recentTransactionsEl.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>Нет транзакций</p></div>';
            return;
        }

        recentTransactionsEl.innerHTML = txns.map(tx => {
            const isIncome = tx.type === 'INCOME';
            const typeClass = isIncome ? 'income' : 'expense';
            const sign = isIncome ? '+' : '−';
            const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';

            return `
                <div class="recent-item">
                    <div class="recent-icon ${typeClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="recent-info">
                        <div class="recent-desc">${tx.description || '—'}</div>
                        <div class="recent-category">${tx.category?.name || '—'}</div>
                    </div>
                    <div>
                        <div class="recent-amount ${typeClass}">${sign}${formatMoney(tx.amount)}</div>
                        <div class="recent-date">${formatDate(tx.date)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== Transactions =====
    async function loadTransactions() {
        try {
            const params = {};
            if (filterType.value) params.type = filterType.value;
            if (filterFrom.value) params.from = filterFrom.value;
            if (filterTo.value) params.to = filterTo.value;

            transactions = await API.getTransactions(params);
            renderTransactions(transactions);
        } catch (err) {
            showToast('Ошибка загрузки транзакций', 'error');
        }
    }

    function renderTransactions(txns) {
        if (txns.length === 0) {
            transactionsBody.innerHTML = '';
            transactionsEmpty.style.display = 'block';
            transactionsBody.closest('.card').querySelector('.table-wrapper').style.display = 'none';
            return;
        }

        transactionsEmpty.style.display = 'none';
        transactionsBody.closest('.card').querySelector('.table-wrapper').style.display = 'block';

        // Sort by date desc
        const sorted = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date));

        transactionsBody.innerHTML = sorted.map(tx => {
            const isIncome = tx.type === 'INCOME';
            const typeClass = isIncome ? 'income' : 'expense';
            const typeLabel = isIncome ? 'Доход' : 'Расход';
            const sign = isIncome ? '+' : '−';
            const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';

            return `
                <tr>
                    <td>${formatDate(tx.date)}</td>
                    <td>${tx.description || '—'}</td>
                    <td>${tx.category?.name || '—'}</td>
                    <td>
                        <span class="type-badge ${typeClass}">
                            <i class="fas ${icon}"></i> ${typeLabel}
                        </span>
                    </td>
                    <td class="amount-cell ${typeClass}">${sign}${formatMoney(tx.amount)}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon edit" onclick="editTransaction(${tx.id})" title="Редактировать">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn-icon delete" onclick="confirmDeleteTransaction(${tx.id})" title="Удалить">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    applyFiltersBtn.addEventListener('click', loadTransactions);
    clearFiltersBtn.addEventListener('click', () => {
        filterType.value = '';
        filterFrom.value = '';
        filterTo.value = '';
        loadTransactions();
    });

    // ===== Categories =====
    async function loadCategories() {
        try {
            categories = await API.getCategories();
            renderCategories(categories);
        } catch (err) {
            showToast('Ошибка загрузки категорий', 'error');
        }
    }

    function renderCategories(cats) {
        if (cats.length === 0) {
            categoriesGrid.innerHTML = '';
            categoriesEmpty.style.display = 'block';
            return;
        }

        categoriesEmpty.style.display = 'none';

        // Sort: EXPENSE first, then INCOME
        const sorted = [...cats].sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'EXPENSE' ? -1 : 1;
        });

        categoriesGrid.innerHTML = sorted.map(cat => {
            const typeClass = cat.type === 'INCOME' ? 'income' : 'expense';
            const typeLabel = cat.type === 'INCOME' ? 'Доход' : 'Расход';
            const icon = getCategoryIcon(cat.type);

            return `
                <div class="category-card">
                    <div class="category-icon ${typeClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="category-info">
                        <div class="category-name">${cat.name}</div>
                        <div class="category-type">${typeLabel}</div>
                    </div>
                    <div class="category-actions">
                        <button class="btn-icon edit" onclick="editCategory(${cat.id})" title="Редактировать">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="btn-icon delete" onclick="confirmDeleteCategory(${cat.id}, '${cat.name}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== Transaction Modal =====
    function openTransactionModal(tx = null) {
        transactionForm.reset();
        transactionIdEl.value = '';

        if (tx) {
            transactionModalTitle.textContent = 'Редактировать транзакцию';
            transactionIdEl.value = tx.id;
            transactionAmountEl.value = tx.amount;
            transactionDescriptionEl.value = tx.description || '';
            transactionDateEl.value = tx.date;
            setTransactionType(tx.type);
            loadCategoryOptions(tx.type, tx.category?.id);
        } else {
            transactionModalTitle.textContent = 'Новая транзакция';
            transactionDateEl.value = new Date().toISOString().split('T')[0];
            setTransactionType('EXPENSE');
            loadCategoryOptions('EXPENSE');
        }

        transactionModal.classList.add('active');
    }

    function closeTransactionModalFn() {
        transactionModal.classList.remove('active');
    }

    function setTransactionType(type) {
        transactionTypeEl.value = type;
        typeExpenseBtn.classList.toggle('active', type === 'EXPENSE');
        typeIncomeBtn.classList.toggle('active', type === 'INCOME');
    }

    async function loadCategoryOptions(type, selectedId = null) {
        try {
            const cats = await API.getCategories();
            const filtered = cats.filter(c => c.type === type);
            transactionCategoryEl.innerHTML = '<option value="">Выберите категорию</option>' +
                filtered.map(c =>
                    `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.name}</option>`
                ).join('');
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    }

    typeExpenseBtn.addEventListener('click', () => {
        setTransactionType('EXPENSE');
        loadCategoryOptions('EXPENSE');
    });

    typeIncomeBtn.addEventListener('click', () => {
        setTransactionType('INCOME');
        loadCategoryOptions('INCOME');
    });

    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            amount: parseFloat(transactionAmountEl.value),
            type: transactionTypeEl.value,
            categoryId: parseInt(transactionCategoryEl.value),
            description: transactionDescriptionEl.value || null,
            date: transactionDateEl.value,
        };

        try {
            const id = transactionIdEl.value;
            if (id) {
                await API.updateTransaction(id, data);
                showToast('Транзакция обновлена');
            } else {
                await API.createTransaction(data);
                showToast('Транзакция создана');
            }
            closeTransactionModalFn();
            // Refresh current page
            const activePage = $('.nav-item.active')?.dataset.page;
            if (activePage === 'dashboard') loadDashboard();
            else if (activePage === 'transactions') loadTransactions();
        } catch (err) {
            showToast(err.message || 'Ошибка сохранения', 'error');
        }
    });

    $('#addTransactionBtn').addEventListener('click', () => openTransactionModal());
    $('#closeTransactionModal').addEventListener('click', closeTransactionModalFn);
    $('#cancelTransaction').addEventListener('click', closeTransactionModalFn);

    // ===== Category Modal =====
    function openCategoryModal(cat = null) {
        categoryForm.reset();
        categoryIdEl.value = '';

        if (cat) {
            categoryModalTitle.textContent = 'Редактировать категорию';
            categoryIdEl.value = cat.id;
            categoryNameEl.value = cat.name;
            categoryTypeEl.value = cat.type;
        } else {
            categoryModalTitle.textContent = 'Новая категория';
        }

        categoryModal.classList.add('active');
    }

    function closeCategoryModalFn() {
        categoryModal.classList.remove('active');
    }

    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: categoryNameEl.value,
            type: categoryTypeEl.value,
        };

        try {
            const id = categoryIdEl.value;
            if (id) {
                await API.updateCategory(id, data);
                showToast('Категория обновлена');
            } else {
                await API.createCategory(data);
                showToast('Категория создана');
            }
            closeCategoryModalFn();
            loadCategories();
        } catch (err) {
            showToast(err.message || 'Ошибка сохранения', 'error');
        }
    });

    $('#addCategoryBtn').addEventListener('click', () => openCategoryModal());
    $('#closeCategoryModal').addEventListener('click', closeCategoryModalFn);
    $('#cancelCategory').addEventListener('click', closeCategoryModalFn);

    // ===== Delete Modal =====
    function openDeleteModal(message, callback) {
        deleteMessage.textContent = message;
        deleteCallback = callback;
        deleteModal.classList.add('active');
    }

    function closeDeleteModalFn() {
        deleteModal.classList.remove('active');
        deleteCallback = null;
    }

    $('#closeDeleteModal').addEventListener('click', closeDeleteModalFn);
    $('#cancelDelete').addEventListener('click', closeDeleteModalFn);
    $('#confirmDelete').addEventListener('click', async () => {
        if (deleteCallback) {
            await deleteCallback();
        }
        closeDeleteModalFn();
    });

    // ===== Global Functions (called from onclick) =====
    window.editTransaction = async function (id) {
        try {
            const tx = await API.getTransactionById(id);
            openTransactionModal(tx);
        } catch (err) {
            showToast('Ошибка загрузки транзакции', 'error');
        }
    };

    window.confirmDeleteTransaction = function (id) {
        openDeleteModal('Вы уверены, что хотите удалить эту транзакцию?', async () => {
            try {
                await API.deleteTransaction(id);
                showToast('Транзакция удалена');
                const activePage = $('.nav-item.active')?.dataset.page;
                if (activePage === 'dashboard') loadDashboard();
                else loadTransactions();
            } catch (err) {
                showToast(err.message || 'Ошибка удаления', 'error');
            }
        });
    };

    window.editCategory = async function (id) {
        try {
            const cat = await API.getCategoryById(id);
            openCategoryModal(cat);
        } catch (err) {
            showToast('Ошибка загрузки категории', 'error');
        }
    };

    window.confirmDeleteCategory = function (id, name) {
        openDeleteModal(`Удалить категорию "${name}"? Если у неё есть транзакции, удаление невозможно.`, async () => {
            try {
                await API.deleteCategory(id);
                showToast('Категория удалена');
                loadCategories();
            } catch (err) {
                showToast(err.message || 'Ошибка удаления категории', 'error');
            }
        });
    };

    // ===== Close modals on overlay click =====
    [transactionModal, categoryModal, deleteModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // ===== Keyboard: Escape to close modals =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [transactionModal, categoryModal, deleteModal].forEach(m => m.classList.remove('active'));
        }
    });

    // ===== Init =====
    navigateTo('dashboard');
});

