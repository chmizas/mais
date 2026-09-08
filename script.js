/**
 * MAIS DUTH - Master's Program "Information Systems"
 * Core Interactive Client JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Menu Toggle
  initMobileMenu();

  // 2. Announcements Engine & Modal Handler (if announcements grid exists on page)
  if (document.getElementById('announcements-container')) {
    initAnnouncements();
  }

  // 3. Lead / Interest Form Handling (if form exists on page)
  const leadForm = document.getElementById('interest-form');
  if (leadForm) {
    initLeadForm(leadForm);
  }

  // 4. Interactive Study Mode Toggle (Full-time vs Part-time)
  if (document.getElementById('study-mode-container')) {
    initStudyModeToggle();
  }

  // 5. Accordion Handlers
  initAccordions();
});

/* ==========================================================================
   1. MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('close-mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      mobileMenu.classList.add('flex');
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
    });
  }
}

/* ==========================================================================
   2. ANNOUNCEMENTS ENGINE & MODAL POPUP SYSTEM
   ========================================================================== */
let globalAnnouncements = [];

async function initAnnouncements() {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  try {
    const response = await fetch('announcements.json');
    if (!response.ok) throw new Error('Failed to fetch announcements');
    globalAnnouncements = await response.json();
    renderAnnouncements(globalAnnouncements);
  } catch (err) {
    console.error('Error loading announcements:', err);
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-slate-500">
        Αδυναμία φόρτωσης ανακοινώσεων. Παρακαλούμε δοκιμάστε αργότερα.
      </div>
    `;
  }
}

function renderAnnouncements(items) {
  const container = document.getElementById('announcements-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-slate-500">
        Δεν βρέθηκαν ανακοινώσεις.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item) => `
    <article class="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      ${item.image ? `<img src="${item.image}" alt="${item.title}" class="w-full h-44 object-cover">` : ''}
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-[#8B1538]/10 text-[#8B1538]">
              ${item.badge || item.category}
            </span>
            <span class="text-xs text-slate-400 font-medium">
              ${formatDate(item.date)}
            </span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2 line-clamp-2 hover:text-[#8B1538] transition-colors cursor-pointer" onclick="openAnnouncementModal('${item.id}')">
            ${item.title}
          </h3>
          <p class="text-slate-600 text-sm mb-4 line-clamp-3">
            ${item.excerpt}
          </p>
        </div>
        <div>
          <button onclick="openAnnouncementModal('${item.id}')" class="inline-flex items-center text-sm font-semibold text-[#8B1538] hover:text-[#9E1B32] transition-colors gap-1">
            Διαβάστε περισσότερα
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function openAnnouncementModal(id) {
  const item = globalAnnouncements.find(a => a.id === id);
  if (!item) return;

  const modal = document.getElementById('announcement-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalCategory = document.getElementById('modal-category');
  const modalBody = document.getElementById('modal-body');
  const modalAttachments = document.getElementById('modal-attachments');

  if (!modal) return;

  if (modalTitle) modalTitle.textContent = item.title;
  if (modalDate) modalDate.textContent = formatDate(item.date);
  if (modalCategory) modalCategory.textContent = item.category;

  if (modalBody) {
    let bodyHtml = item.content || `<p>${item.excerpt}</p>`;
    if (item.image) {
      bodyHtml = `<img src="${item.image}" alt="${item.title}" class="w-full max-h-72 object-contain rounded-lg mb-4 bg-slate-50 border border-slate-100 p-2">${bodyHtml}`;
    }
    modalBody.innerHTML = bodyHtml;
  }

  if (modalAttachments) {
    if (item.attachments && item.attachments.length > 0) {
      modalAttachments.innerHTML = `
        <h4 class="font-bold text-slate-800 text-sm mb-2">Συνημμένα Αρχεία:</h4>
        <div class="flex flex-wrap gap-2">
          ${item.attachments.map(att => `
            <a href="${att.url}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors" download>
              <svg class="w-4 h-4 text-[#8B1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              ${att.name}
            </a>
          `).join('')}
        </div>
      `;
      modalAttachments.classList.remove('hidden');
    } else {
      modalAttachments.innerHTML = '';
      modalAttachments.classList.add('hidden');
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAnnouncementModal() {
  const modal = document.getElementById('announcement-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('el-GR', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ==========================================================================
   3. LEAD FORM VALIDATION
   ========================================================================== */
function initLeadForm(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const phoneInput = document.getElementById('form-phone');
    const feedback = document.getElementById('form-feedback');

    let isValid = true;
    let errorMessage = '';

    if (!nameInput || !nameInput.value.trim()) {
      isValid = false;
      errorMessage = 'Παρακαλούμε συμπληρώστε το ονοματεπώνυμό σας.';
    } else if (!emailInput || !validateEmail(emailInput.value.trim())) {
      isValid = false;
      errorMessage = 'Παρακαλούμε εισάγετε μια έγκυρη διεύθυνση Email.';
    } else if (!phoneInput || !phoneInput.value.trim()) {
      isValid = false;
      errorMessage = 'Παρακαλούμε συμπληρώστε το τηλέφωνο επικοινωνίας.';
    }

    if (!isValid) {
      if (feedback) {
        feedback.className = 'mt-4 p-3 rounded-md bg-rose-50 text-rose-700 text-sm border border-rose-200';
        feedback.textContent = errorMessage;
        feedback.classList.remove('hidden');
      }
      return;
    }

    if (feedback) {
      feedback.className = 'mt-4 p-3 rounded-md bg-emerald-50 text-emerald-700 text-sm border border-emerald-200';
      feedback.textContent = 'Ευχαριστούμε για το ενδιαφέρον σας! Η αίτησή σας υποβλήθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας σύντομα.';
      feedback.classList.remove('hidden');
    }

    form.reset();
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ==========================================================================
   4. STUDY MODE TOGGLE (Full-Time vs Part-Time)
   ========================================================================== */
function initStudyModeToggle() {
  const btnFull = document.getElementById('btn-fulltime');
  const btnPart = document.getElementById('btn-parttime');
  const fullContent = document.getElementById('content-fulltime');
  const partContent = document.getElementById('content-parttime');

  if (!btnFull || !btnPart || !fullContent || !partContent) return;

  btnFull.addEventListener('click', () => {
    btnFull.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow bg-[#8B1538] text-white';
    btnPart.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100';
    fullContent.classList.remove('hidden');
    partContent.classList.add('hidden');
  });

  btnPart.addEventListener('click', () => {
    btnPart.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow bg-[#8B1538] text-white';
    btnFull.className = 'px-6 py-2.5 rounded-lg text-sm font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100';
    partContent.classList.remove('hidden');
    fullContent.classList.add('hidden');
  });
}

/* ==========================================================================
   5. ACCORDIONS
   ========================================================================== */
function initAccordions() {
  const accordionButtons = document.querySelectorAll('.accordion-btn');
  accordionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const target = document.getElementById(targetId);
      const icon = btn.querySelector('.accordion-icon');

      if (target) {
        const isHidden = target.classList.contains('hidden');
        if (isHidden) {
          target.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
          target.classList.add('hidden');
          if (icon) icon.style.transform = 'rotate(0deg)';
        }
      }
    });
  });
}
