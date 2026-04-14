const dbNode = {
    getUsers: () => JSON.parse(localStorage.getItem('medUsers')) || [],
    setUsers: (users) => localStorage.setItem('medUsers', JSON.stringify(users)),
    getMedicines: () => JSON.parse(localStorage.getItem('medicines')) || [],
    setMedicines: (meds) => localStorage.setItem('medicines', JSON.stringify(meds)),
};

let currentUser = null;
let currentProfileName = "";
let currentFilter = 'all';
let donutChart = null;

function initApp() {
    const sessionUser = sessionStorage.getItem('activeUser');
    const sessionName = sessionStorage.getItem('activeName');
    
    if (!sessionUser) {
        window.location.href = "index.html";
        return;
    }
    
    currentUser = sessionUser;
    currentProfileName = sessionName || sessionUser;
    
    // Set UI Profile Name
    const nameDisplay = document.getElementById('displayUserName');
    if(nameDisplay) nameDisplay.innerText = currentProfileName;
    
    const settingsInput = document.getElementById('settingName');
    if(settingsInput) settingsInput.value = currentProfileName;

    initTheme();
}

// ---------------- THEME / DARK MODE ---------------- //

function initTheme() {
    const savedTheme = localStorage.getItem('themePreference') || 'light';
    if(savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeUI('dark');
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if(isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('themePreference', 'light');
        updateThemeUI('light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('themePreference', 'dark');
        updateThemeUI('dark');
    }
    
    // Redraw chart to update font colors if on dashboard
    if(window.location.pathname.includes('dashboard.html')) {
        loadDashboardStats();
    }
}

function updateThemeUI(theme) {
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');
    if(icon && text) {
        if(theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
            text.innerText = 'Light Mode';
        } else {
            icon.className = 'fa-solid fa-moon';
            text.innerText = 'Dark Mode';
        }
    }
}

// ---------------- APP LOGIC ---------------- //

function logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

function getProcessedMeds() {
    const allMeds = dbNode.getMedicines();
    const userMeds = allMeds.filter(m => m.user === currentUser);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    return userMeds.map(med => {
        const expDate = new Date(med.expiry);
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        
        let status = 'safe', statusText = '<i class="fa-solid fa-circle-check"></i> Safe';
        if (diffDays < 0) { status = 'expired'; statusText = '<i class="fa-solid fa-circle-xmark"></i> Expired'; }
        else if (diffDays <= 7) { status = 'near'; statusText = '<i class="fa-solid fa-triangle-exclamation"></i> Near Expiry'; }
        
        return { ...med, diffDays, status, statusText };
    }).sort((a,b) => new Date(a.expiry) - new Date(b.expiry));
}

// ---------------- DASHBOARD & CHARTS ---------------- //

function loadDashboardStats() {
    const meds = getProcessedMeds();
    
    let safeCount = meds.filter(m => m.status === 'safe').length;
    let nearCount = meds.filter(m => m.status === 'near').length;
    let expiredCount = meds.filter(m => m.status === 'expired').length;
    
    const countEl = document.getElementById('totalCount');
    if(countEl) {
        countEl.innerText = meds.length;
        document.getElementById('safeCount').innerText = safeCount;
        document.getElementById('nearCount').innerText = nearCount;
        document.getElementById('expiredCount').innerText = expiredCount;
        
        const recentContainer = document.getElementById('recentList');
        recentContainer.innerHTML = '';
        
        if(meds.length === 0) {
            recentContainer.innerHTML = '<p class="empty-state">No medicines found</p>';
        } else {
            const recentMeds = [...meds].sort((a,b) => b.id - a.id).slice(0, 3);
            recentMeds.forEach(med => {
                recentContainer.appendChild(createMedElement(med));
            });
        }

        renderChart(safeCount, nearCount, expiredCount);
    }
}

function renderChart(safe, near, expired) {
    const ctx = document.getElementById('medChart');
    if(!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f0f0f0' : '#333333';

    if(donutChart) {
        donutChart.destroy();
    }

    if (safe === 0 && near === 0 && expired === 0) return; // Don't render empty chart

    donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Safe', 'Near Expiry', 'Expired'],
            datasets: [{
                data: [safe, near, expired],
                backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
                hoverBackgroundColor: ['#388E3C', '#F57C00', '#D32F2F'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, font: { family: 'Inter', size: 12 } }
                }
            },
            cutout: '70%'
        }
    });
}

// ---------------- MEDICINES PAGE ---------------- //

function renderMedicines() {
    const container = document.getElementById('fullMedicineList');
    if(!container) return; // Not on meds page
    
    const srchParam = document.getElementById('searchInput');
    const query = srchParam ? srchParam.value.toLowerCase() : '';
    container.innerHTML = '';
    
    let meds = getProcessedMeds();
    
    if(currentFilter !== 'all') {
        meds = meds.filter(m => m.status === currentFilter);
    }
    
    if(query) {
        meds = meds.filter(m => m.name.toLowerCase().includes(query) || (m.notes && m.notes.toLowerCase().includes(query)));
    }
    
    if (meds.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-box-open"></i>
                <p>No medicines match your current filters or search.</p>
            </div>`;
        return;
    }
    
    meds.forEach(med => {
        container.appendChild(createMedElement(med));
    });
}

function mapCategoryIcon(cat) {
    switch (cat) {
        case 'pill': return 'fa-capsules';
        case 'syrup': return 'fa-prescription-bottle-medical';
        case 'injection': return 'fa-syringe';
        case 'drops': return 'fa-eye-dropper';
        case 'inhaler': return 'fa-pump-medical';
        default: return 'fa-pills';
    }
}

function createMedElement(med) {
    const el = document.createElement('div');
    const iconClass = mapCategoryIcon(med.category);

    el.className = 'med-item';
    el.innerHTML = `
        <div class="med-details">
            <h4><i class="fa-solid ${iconClass}" style="color:var(--primary);"></i> ${med.name}</h4>
            <div>
                <p><i class="fa-regular fa-calendar"></i> Expiry: ${med.expiry}</p>
                ${med.notes ? `<p style="font-style:italic"><i class="fa-solid fa-note-sticky"></i> ${med.notes}</p>` : ''}
            </div>
        </div>
        <div class="med-actions">
            <span class="badge ${med.status}">${med.statusText}</span>
            <button class="delete-btn" onclick="deleteMedicine(${med.id})" title="Delete entry"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    return el;
}

function filterMedicines() { renderMedicines(); }

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
    const btn = document.getElementById(`f-${filter}`);
    if(btn) btn.classList.add('active');
    renderMedicines();
}

function deleteMedicine(id) {
    if (confirm("Permanently delete this medicine record?")) {
        let meds = dbNode.getMedicines();
        dbNode.setMedicines(meds.filter(m => m.id !== id));
        showToast("Record deleted successfully", "success");
        
        if (window.location.pathname.includes('medicines.html')) renderMedicines();
        else if (window.location.pathname.includes('dashboard.html')) loadDashboardStats();
    }
}

// ---------------- ADD MODAL ---------------- //

function openAddModal() { document.getElementById('addModal').classList.add('active'); }
function closeAddModal() { 
    document.getElementById('addModal').classList.remove('active'); 
    document.getElementById('medName').value = '';
    document.getElementById('medCategory').value = 'pill'; // default
    if(document.getElementById('medDiseaseCategory')) document.getElementById('medDiseaseCategory').value = 'General';
    document.getElementById('medExpiry').value = '';
    document.getElementById('medNotes').value = '';
}

function saveMedicineAction() {
    // const name = document.getElementById('medName').value.trim();
    const category = document.getElementById('medCategory').value;
    const name = document.getElementById('medName').value;
    const diseaseCategory = getCategory(name); // 🔥 AUTO CATEGORY
    const expiry = document.getElementById('medExpiry').value;
    const notes = document.getElementById('medNotes').value.trim();

    if (!name || !expiry) return showToast("Medicine name and expiry are required", "error");

    const meds = dbNode.getMedicines();
    meds.push({
        id: Date.now(),
        user: currentUser,
        name,
        category,
        diseaseCategory,
        expiry,
        notes
    });
    dbNode.setMedicines(meds);
    closeAddModal();
    showToast(`${name} tracking started!`, "success");
    
    if (window.location.pathname.includes('dashboard.html')) loadDashboardStats();
    if (window.location.pathname.includes('medicines.html')) renderMedicines();
    
    setTimeout(() => checkNotifications(), 500);
}

// ---------------- SETTINGS ---------------- //

function updateProfile() {
    const newName = document.getElementById('settingName').value.trim();
    if(!newName) return showToast("Name cannot be empty!", "error");
    
    let users = dbNode.getUsers();
    let index = users.findIndex(u => u.user === currentUser);
    if(index > -1) {
        users[index].name = newName;
        dbNode.setUsers(users);
        sessionStorage.setItem('activeName', newName);
        currentProfileName = newName;
        initApp();
        showToast("Profile successfully updated", "success");
    }
}

function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// ---------------- CATEGORIES MODAL ---------------- //

function openCategoriesModal() {
    document.getElementById('categoriesModal').classList.add('active');
    renderCategoryList();
}

function closeCategoriesModal() {
    document.getElementById('categoriesModal').classList.remove('active');
}

function renderCategoryList() {
    const container = document.getElementById('categoriesModalBody');
    if(!container) return;
    
    const meds = getProcessedMeds();
    const categories = [
        { name: 'General', icon: 'fa-kit-medical', color: '#607D8B' },
        { name: 'Fever', icon: 'fa-temperature-high', color: '#F44336' },
        { name: 'Cold & Cough', icon: 'fa-head-side-cough', color: '#2196F3' },
        { name: 'Diabetes', icon: 'fa-droplet', color: '#9C27B0' },
        { name: 'Blood Pressure', icon: 'fa-heart-pulse', color: '#E91E63' }
    ];
    
    let html = '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:15px;">';
    categories.forEach(cat => {
        const catMeds = meds.filter(m => (m.diseaseCategory || 'General') === cat.name);
        const count = catMeds.length;
        html += `
            <div onclick="viewCategoryMeds('${cat.name}')" style="background:var(--white); border:1px solid var(--border-color); padding:20px 10px; border-radius:12px; cursor:pointer; text-align:center; transition:0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <i class="fa-solid ${cat.icon}" style="font-size:2rem; color:${cat.color}; margin-bottom:10px;"></i>
                <h4 style="color:var(--text-dark); font-size:1rem; margin-bottom:5px;">${cat.name}</h4>
                <span style="display:inline-block; background:var(--bg-light); padding:2px 8px; border-radius:12px; color:var(--text-muted); font-size:0.8rem;">${count} item${count !== 1 ? 's' : ''}</span>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function viewCategoryMeds(categoryName) {
    const container = document.getElementById('categoriesModalBody');
    if(!container) return;
    
    let meds = getProcessedMeds();
    
    // Sort logic already handles Earliest Expiry first via getProcessedMeds(), 
    // but just in case, we also highlight expired at the top.
    const filteredMeds = meds.filter(m => (m.diseaseCategory || 'General') === categoryName);
    
    // Custom sort to put expired first, then near, then safe.
    filteredMeds.sort((a,b) => {
        const valA = a.status === 'expired' ? 0 : (a.status === 'near' ? 1 : 2);
        const valB = b.status === 'expired' ? 0 : (b.status === 'near' ? 1 : 2);
        if(valA !== valB) return valA - valB;
        return new Date(a.expiry) - new Date(b.expiry); // earliest first within same status
    });
    
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid var(--border-color);">
            <button onclick="renderCategoryList()" style="background:transparent; color:var(--primary); border:none; cursor:pointer; font-size:1rem; font-weight:600; display:flex; align-items:center; gap:5px;">
                <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <h4 style="color:var(--text-dark); margin:0;">${categoryName} Medicines</h4>
        </div>
    `;
    
    container.innerHTML = html;
    
    if(filteredMeds.length === 0) {
        container.innerHTML += '<div class="empty-state" style="padding:2rem 0;"><i class="fa-solid fa-box-open" style="font-size:2.5rem; margin-bottom:10px; color:var(--text-muted);"></i><p style="color:var(--text-muted);">No medicines found.</p></div>';
    } else {
        const listDiv = document.createElement('div');
        listDiv.className = 'medicine-list small-list';
        listDiv.style.display = 'flex';
        listDiv.style.flexDirection = 'column';
        listDiv.style.gap = '10px';
        
        filteredMeds.forEach(med => {
            listDiv.appendChild(createMedElement(med));
        });
        container.appendChild(listDiv);
    }
}
