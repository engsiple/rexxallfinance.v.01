// REXXALLFINANCE MAIN APPLICATION SCRIPT

let state = {
    isLoggedIn: false,
    theme: 'dark',
    activeTab: 'dashboard',
    user: {
        name: 'Afif Nur Rasyid',
        title: 'Executive Financial Member',
        email: 'afif.rasyid@example.com',
        initials: 'AR'
    },
    period: 'Nov 2026 - Apr 2027',
    baseIncome: 50000,
    extraIncome: 0,
    wishlist: [],
    expenses: []
};

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initRupiahInputs();
    initCharts();
    loadMarketNews();
    renderAll();
});

// RUPIAH AUTO FORMATTER (3-digit Dot Separator)
function formatRupiahInput(value) {
    let number_string = value.replace(/[^\d]/g, '').toString();
    let split = number_string.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
}

function parseRupiahNumber(formattedValue) {
    if (!formattedValue) return 0;
    return parseFloat(formattedValue.toString().replace(/[^0-9]/g, '')) || 0;
}

function initRupiahInputs() {
    const rupiahFields = document.querySelectorAll('.rupiah-input');
    rupiahFields.forEach(input => {
        input.addEventListener('keyup', function(e) {
            this.value = formatRupiahInput(this.value);
            recalculateBudget();
        });
    });
}

// Theme Toggle (Light/Dark Only)
function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// Navigation
function navTo(tabId) {
    state.activeTab = tabId;
    ['dashboard', 'wishlist', 'analytics', 'news', 'profile'].forEach(tab => {
        const el = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
        if (el) {
            if (tab === tabId) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });
    closeDropdownMenu();
}

function toggleDropdownMenu() {
    const drop = document.getElementById('dropdownMenu');
    drop.classList.toggle('hidden');
}

function closeDropdownMenu() {
    const drop = document.getElementById('dropdownMenu');
    if (drop) drop.classList.add('hidden');
}

// Auth Handlers
function toggleAuthTab(type) {
    const btnLogin = document.getElementById('btnTabLogin');
    const btnReg = document.getElementById('btnTabRegister');
    const formLogin = document.getElementById('formLogin');
    const formReg = document.getElementById('formRegister');

    if (type === 'login') {
        formLogin.classList.remove('hidden');
        formReg.classList.add('hidden');
        btnLogin.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm transition-all";
        btnReg.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all";
    } else {
        formLogin.classList.add('hidden');
        formReg.classList.remove('hidden');
        btnReg.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm transition-all";
        btnLogin.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all";
    }
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    if (field.type === 'password') field.type = 'text';
    else field.type = 'password';
}

function handleAuthSubmit(e, type) {
    e.preventDefault();
    state.isLoggedIn = true;
    document.getElementById('authScreen').classList.add('hidden');
    renderAll();
}

function handleGoogleSSO() {
    state.isLoggedIn = true;
    document.getElementById('authScreen').classList.add('hidden');
    renderAll();
}

function handleLogout() {
    state.isLoggedIn = false;
    document.getElementById('authScreen').classList.remove('hidden');
    closeDropdownMenu();
}

// Recalculate Budget
function recalculateBudget() {
    const baseVal = document.getElementById('inputBaseIncome').value;
    const extraVal = document.getElementById('inputExtraIncome').value;

    const base = parseRupiahNumber(baseVal);
    const extra = parseRupiahNumber(extraVal);

    state.baseIncome = base;
    state.extraIncome = extra;

    const total = base + extra;

    document.getElementById('txtTotalIncome').innerText = 'Rp ' + formatRupiahInput(total.toString());

    document.getElementById('allocPribadi').innerText = 'Rp ' + formatRupiahInput(Math.round(total * 0.4).toString());
    document.getElementById('allocJajan').innerText = 'Rp ' + formatRupiahInput(Math.round(total * 0.3).toString());
    document.getElementById('allocTabungan').innerText = 'Rp ' + formatRupiahInput(Math.round(total * 0.2).toString());
    document.getElementById('allocDarurat').innerText = 'Rp ' + formatRupiahInput(Math.round(total * 0.1).toString());

    updateCharts();
}

function resetDataToZero() {
    if (confirm('Apakah Anda yakin ingin mengosongkan semua data pengeluaran dan wishlist untuk memulai dari 0?')) {
        state.expenses = [];
        state.wishlist = [];
        document.getElementById('inputBaseIncome').value = '0';
        document.getElementById('inputExtraIncome').value = '0';
        recalculateBudget();
        renderWishlist();
        renderExpenses();
    }
}

// Expense CRUD
function handleAddExpense(e) {
    e.preventDefault();
    const desc = document.getElementById('expDesc').value;
    const rawAmt = document.getElementById('expAmount').value;
    const amount = parseRupiahNumber(rawAmt);
    const category = document.getElementById('expCategory').value;

    if (!desc || amount <= 0) return;

    const newExp = {
        id: Date.now(),
        date: new Date().toLocaleDateString('id-ID'),
        desc: desc,
        category: category,
        amount: amount
    };

    state.expenses.unshift(newExp);
    document.getElementById('formAddExpense').reset();
    renderExpenses();
    updateCharts();
}

function deleteExpense(id) {
    state.expenses = state.expenses.filter(item => item.id !== id);
    renderExpenses();
    updateCharts();
}

function renderExpenses() {
    const tbody = document.getElementById('tableExpenseBody');
    if (state.expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">Belum ada transaksi. Silakan tambah data pengeluaran di atas.</td></tr>`;
        return;
    }

    tbody.innerHTML = state.expenses.map(exp => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
            <td class="p-3 text-slate-500">${exp.date}</td>
            <td class="p-3 font-semibold text-slate-900 dark:text-white">${exp.desc}</td>
            <td class="p-3"><span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium text-[10px]">${exp.category}</span></td>
            <td class="p-3 font-bold text-rose-500">Rp ${formatRupiahInput(exp.amount.toString())}</td>
            <td class="p-3 text-right">
                <button onclick="deleteExpense(${exp.id})" class="text-slate-400 hover:text-rose-500 transition-colors"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

// Wishlist CRUD
function handleAddWishlist(e) {
    e.preventDefault();
    const name = document.getElementById('wName').value;
    const rawTarget = document.getElementById('wTarget').value;
    const target = parseRupiahNumber(rawTarget);
    const marketplace = document.getElementById('wMarketplace').value;
    const link = document.getElementById('wLink').value || '#';
    const img = document.getElementById('wImg').value || 'assets/images/real_estate_villa.jpg';

    if (!name || target <= 0) return;

    const item = {
        id: Date.now(),
        name: name,
        target: target,
        collected: 0,
        marketplace: marketplace,
        link: link,
        img: img
    };

    state.wishlist.push(item);
    closeModal('modalAddWishlist');
    renderWishlist();
}

function depositWishlist(id, amount) {
    const item = state.wishlist.find(w => w.id === id);
    if (item) {
        item.collected += amount;
        renderWishlist();
    }
}

function deleteWishlist(id) {
    state.wishlist = state.wishlist.filter(w => w.id !== id);
    renderWishlist();
}

function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    if (state.wishlist.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center space-y-2">
                <div class="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <i data-lucide="gift" class="w-6 h-6"></i>
                </div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">Wishlist Masih Kosong</h4>
                <p class="text-xs text-slate-500">Klik "Tambah Target Impian" untuk menambahkan properti, gadget, atau kendaraan baru.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    grid.innerHTML = state.wishlist.map(item => {
        const percent = Math.min(100, Math.round((item.collected / item.target) * 100));
        const isDone = item.collected >= item.target;

        return `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                    <div class="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src="${item.img}" class="w-full h-full object-cover">
                        <span class="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold rounded-lg">${item.marketplace}</span>
                        ${isDone ? '<span class="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg uppercase shadow-md">Completed</span>' : ''}
                    </div>

                    <div class="p-4 space-y-3">
                        <div class="flex items-start justify-between gap-2">
                            <h4 class="font-bold text-xs text-slate-900 dark:text-white">${item.name}</h4>
                            <a href="${item.link}" target="_blank" class="text-slate-400 hover:text-emerald-500"><i data-lucide="external-link" class="w-3.5 h-3.5"></i></a>
                        </div>

                        <div>
                            <div class="flex justify-between text-[11px] mb-1">
                                <span class="text-slate-500">Terkumpul: <strong class="text-emerald-600 dark:text-emerald-400">Rp ${formatRupiahInput(item.collected.toString())}</strong></span>
                                <span class="text-slate-400">Rp ${formatRupiahInput(item.target.toString())}</span>
                            </div>
                            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div class="bg-emerald-500 h-full transition-all duration-300" style="width: ${percent}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div class="flex gap-1.5">
                        <button onclick="depositWishlist(${item.id}, 10000)" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-semibold rounded-lg">+10k</button>
                        <button onclick="depositWishlist(${item.id}, 50000)" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-semibold rounded-lg">+50k</button>
                    </div>
                    <button onclick="deleteWishlist(${item.id})" class="text-slate-400 hover:text-rose-500"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

// Load Financial Market News
function loadMarketNews() {
    fetch('php/market_news.php')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('marketNewsGrid');
            if (container && data.news_feed) {
                container.innerHTML = data.news_feed.map(news => `
                    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center">
                        <img src="${news.img}" class="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800">
                        <div class="space-y-1">
                            <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded-md">${news.category}</span>
                            <h4 class="font-bold text-xs text-slate-900 dark:text-white leading-snug">${news.title}</h4>
                            <p class="text-[10px] text-slate-400">${news.source} • ${news.time}</p>
                        </div>
                    </div>
                `).join('');
            }
        })
        .catch(err => console.log('News loaded locally'));
}

// Modals
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function handleSavePeriod(e) {
    e.preventDefault();
    const start = document.getElementById('perStart').value;
    const end = document.getElementById('perEnd').value;
    state.period = `${start} - ${end}`;
    document.getElementById('txtPeriodLabel').innerText = `Periode Active: ${state.period}`;
    closeModal('modalPeriod');
}

function handleSaveProfile(e) {
    e.preventDefault();
    state.user.name = document.getElementById('editName').value;
    state.user.title = document.getElementById('editTitle').value;
    state.user.email = document.getElementById('editEmail').value;

    document.getElementById('profName').innerText = state.user.name;
    document.getElementById('profTitle').innerText = state.user.title;
    document.getElementById('profEmail').innerText = state.user.email;
    document.getElementById('headerName').innerText = state.user.name;
    document.getElementById('welcomeHeading').innerText = `Selamat Datang, ${state.user.name} 👋`;

    closeModal('modalEditProfile');
}

function exportCSV() {
    if (state.expenses.length === 0) {
        alert('Tidak ada data transaksi untuk diekspor.');
        return;
    }

    let csv = 'Tanggal,Keterangan,Kategori,Nominal\n';
    state.expenses.forEach(exp => {
        csv += `"${exp.date}","${exp.desc}","${exp.category}",${exp.amount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RexxallFinance_Evaluasi_${Date.now()}.csv`;
    a.click();
}

function sendWAReport() {
    const text = `Halo, Laporan REXXALLFINANCE untuk ${state.user.name}:\nTotal Income Harian: Rp ${formatRupiahInput((state.baseIncome + state.extraIncome).toString())}\nTabungan (20%): Rp ${formatRupiahInput(Math.round((state.baseIncome + state.extraIncome)*0.2).toString())}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function handleComplaintSubmit(e) {
    e.preventDefault();
    const subj = document.getElementById('compSubject').value;
    const msg = document.getElementById('compMessage').value;
    window.location.href = `mailto:noreply.afif@gmail.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg)}`;
}

// AI Assistant
function toggleAiModal() {
    document.getElementById('aiChatBox').classList.toggle('hidden');
}

function handleAiSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if (!msg) return;

    const msgsBox = document.getElementById('aiMessages');
    msgsBox.innerHTML += `<div class="bg-emerald-600 text-white p-2.5 rounded-xl ml-auto max-w-[85%]">${msg}</div>`;
    input.value = '';

    setTimeout(() => {
        let reply = "Pertahankan disiplin alokasi 40-30-20-10 harian Anda untuk menjaga stabilitas keuangan.";
        if (msg.toLowerCase().includes('boros') || msg.toLowerCase().includes('jajan')) {
            reply = "Untuk menekan porsi jajan, batasi pengeluaran ke kategori 30% dan alihkan sisanya ke tabungan impian.";
        } else if (msg.toLowerCase().includes('saran') || msg.toLowerCase().includes('rekomendasi')) {
            reply = "Saran saya: Fokus selesaikan wishlist terkecil terlebih dahulu untuk membangun momentum menabung.";
        }
        msgsBox.innerHTML += `<div class="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-200 max-w-[85%]">${reply}</div>`;
        msgsBox.scrollTop = msgsBox.scrollHeight;
    }, 500);
}

// Chart.js
let chartTrend, chartDoughnut;

function initCharts() {
    const ctxTrend = document.getElementById('chartTrend').getContext('2d');
    chartTrend = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: ['Nov 26', 'Des 26', 'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27'],
            datasets: [{
                label: 'Income (Rp)',
                data: [1500000, 1500000, 1500000, 1500000, 1500000, 1500000],
                borderColor: '#10b981',
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxDoughnut = document.getElementById('chartDoughnut').getContext('2d');
    chartDoughnut = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Pribadi', 'Jajan', 'Tabungan', 'Darurat'],
            datasets: [{
                data: [40, 30, 20, 10],
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateCharts() {
    const total = state.baseIncome + state.extraIncome;
    if (chartTrend) {
        chartTrend.data.datasets[0].data = [total*30, total*30, total*30, total*30, total*30, total*30];
        chartTrend.update();
    }
}

function renderAll() {
    recalculateBudget();
    renderExpenses();
    renderWishlist();
}
