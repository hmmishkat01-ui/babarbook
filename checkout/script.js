/* ═══════════════════════════════════════════
   প্রশান্তির সন্ধানে — CHECKOUT SCRIPT
   ═══════════════════════════════════════════ */

/* ─── CONSTANTS ─── */
const BOOK_PRICE       = 999;
const DELIVERY_INSIDE  = 70;
const DELIVERY_OUTSIDE = 120;

/* ─── Telegram notifier (Cloudflare Worker URL) ───
   ধাপে ধাপে বসানোর গাইড: ../telegram-worker/README.md
   Worker ডিপ্লয় করার পর, নিচের ঠিকানাটা আপনার নিজের Worker URL দিয়ে বদলে দিন।
   উদাহরণ: 'https://prashantir-order-notify.YOUR-SUBDOMAIN.workers.dev' */
const ORDER_NOTIFY_URL = 'https://prashantir-order-notify.hm-mishkat01.workers.dev';

const DISTRICTS = [
  'ঢাকার ভিতরে (৳৭০)',
  'ঢাকার বাইরে (৳১২০)'
];

/* ─── Bangla numeral helper (with thousands separator) ─── */
function toBanglaNum(n) {
  return Number(n).toLocaleString('en-IN').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
}

/* ─── STATE ─── */
let qty              = 1;
let selectedDistrict = '';
let districtOpen     = false;
let districtFocusIdx = -1;

/* ══════════════════════════════════
   QUANTITY STEPPER
══════════════════════════════════ */
function changeQty(delta) {
  const next = qty + delta;
  if (next < 1 || next > 10) return;
  qty = next;

  const display = document.getElementById('qty-display');
  display.textContent = toBanglaNum(qty);

  /* bounce animation */
  display.classList.remove('qty-bounce');
  void display.offsetWidth;               /* force reflow */
  display.classList.add('qty-bounce');
  setTimeout(() => display.classList.remove('qty-bounce'), 280);

  document.getElementById('qty-minus').disabled = qty <= 1;
  document.getElementById('qty-plus').disabled  = qty >= 10;

  updateTotal();
}

/* ══════════════════════════════════
   CUSTOM DISTRICT DROPDOWN
══════════════════════════════════ */
function buildDistrictOptions() {
  const panel = document.getElementById('district-panel');
  panel.innerHTML = '';

  DISTRICTS.forEach((district, idx) => {
    const isSelected = district === selectedDistrict;

    const item = document.createElement('div');
    item.className   = 'select-option' + (isSelected ? ' selected' : '');
    item.setAttribute('role',          'option');
    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    item.setAttribute('tabindex',      '-1');
    item.setAttribute('data-idx',       idx);

    item.innerHTML = `
      <span>${district}</span>
      <svg class="select-checkmark" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`;

    item.addEventListener('click',      () => selectDistrict(district));
    item.addEventListener('mouseenter', () => { districtFocusIdx = idx; highlightOption(); });

    panel.appendChild(item);
  });
}

function toggleDistrict() {
  districtOpen ? closeDistrict() : openDistrict();
}

function openDistrict() {
  districtOpen     = true;
  districtFocusIdx = selectedDistrict ? DISTRICTS.indexOf(selectedDistrict) : -1;

  const btn   = document.getElementById('district-btn');
  const panel = document.getElementById('district-panel');

  btn.setAttribute('aria-expanded', 'true');
  buildDistrictOptions();
  panel.classList.add('open');
}

function closeDistrict() {
  districtOpen = false;
  document.getElementById('district-btn').setAttribute('aria-expanded', 'false');
  document.getElementById('district-panel').classList.remove('open');
}

function selectDistrict(district) {
  selectedDistrict = district;

  const display = document.getElementById('district-display');
  display.textContent = district;
  display.classList.remove('placeholder');

  /* clear error */
  document.getElementById('district-btn').classList.remove('error');
  document.getElementById('err-district').classList.remove('visible');

  closeDistrict();
  updateTotal();
}

function highlightOption() {
  document.querySelectorAll('#district-panel .select-option')
    .forEach((el, i) => el.classList.toggle('focused', i === districtFocusIdx));
}

/* ── Keyboard navigation ── */
document.addEventListener('keydown', function(e) {
  if (!districtOpen) return;

  switch (e.key) {
    case 'Escape':
      closeDistrict();
      document.getElementById('district-btn').focus();
      break;
    case 'ArrowDown':
      e.preventDefault();
      districtFocusIdx = Math.min(districtFocusIdx + 1, DISTRICTS.length - 1);
      highlightOption();
      break;
    case 'ArrowUp':
      e.preventDefault();
      districtFocusIdx = Math.max(districtFocusIdx - 1, 0);
      highlightOption();
      break;
    case 'Enter':
      if (districtFocusIdx >= 0) selectDistrict(DISTRICTS[districtFocusIdx]);
      break;
  }
});

/* ── Click outside to close ── */
document.addEventListener('mousedown', function(e) {
  if (!districtOpen) return;
  const btn   = document.getElementById('district-btn');
  const panel = document.getElementById('district-panel');
  if (!btn.contains(e.target) && !panel.contains(e.target)) {
    closeDistrict();
  }
});

/* ══════════════════════════════════
   REAL-TIME TOTAL CALCULATION
══════════════════════════════════ */
function updateTotal() {
  const subtotal       = qty * BOOK_PRICE;
  const isInsideDhaka  = selectedDistrict === 'ঢাকার ভিতরে (৳৭০)';
  const delivery       = selectedDistrict
    ? (isInsideDhaka ? DELIVERY_INSIDE : DELIVERY_OUTSIDE)
    : DELIVERY_INSIDE; /* default preview */
  const grand          = subtotal + delivery;

  document.getElementById('total-label-sub').textContent =
    `বইয়ের মূল্য (${toBanglaNum(qty)} কপি × ৳${toBanglaNum(BOOK_PRICE)})`;
  document.getElementById('total-subtotal').textContent = `৳${toBanglaNum(subtotal)}`;
  document.getElementById('total-delivery').textContent = `৳${toBanglaNum(delivery)}`;
  document.getElementById('total-grand').textContent    = `৳${toBanglaNum(grand)}`;

  const note = document.getElementById('delivery-note');
  if (!selectedDistrict) {
    note.textContent = 'ঢাকার মধ্যে ৳৭০ · ঢাকার বাইরে ৳১২০';
  } else if (isInsideDhaka) {
    note.textContent = 'ঢাকার মধ্যে ডেলিভারি';
  } else {
    note.textContent = 'ঢাকার বাইরে ডেলিভারি';
  }
}

/* ══════════════════════════════════
   FORM VALIDATION HELPERS
══════════════════════════════════ */
function validateBDPhone(num) {
  return /^01[3-9]\d{8}$/.test(num.trim());
}

function setError(inputId, errId) {
  const field = document.getElementById(inputId);
  const msg   = document.getElementById(errId);
  field.classList.add('error');
  msg.classList.add('visible');

  field.classList.remove('shake');
  void field.offsetWidth;
  field.classList.add('shake');
  setTimeout(() => field.classList.remove('shake'), 400);
}

function clearError(inputId, errId) {
  document.getElementById(inputId).classList.remove('error');
  document.getElementById(errId).classList.remove('visible');
}

/* ── Live clear on correct input ── */
function initLiveValidation() {
  document.getElementById('field-name').addEventListener('input', function() {
    if (this.value.trim().length >= 2) clearError('field-name', 'err-name');
  });
  document.getElementById('field-phone').addEventListener('input', function() {
    if (validateBDPhone(this.value)) clearError('field-phone', 'err-phone');
  });
  document.getElementById('field-address').addEventListener('input', function() {
    if (this.value.trim().length > 5) clearError('field-address', 'err-address');
  });
}

/* ══════════════════════════════════
   FORM SUBMIT
══════════════════════════════════ */
function submitOrder() {
  const name    = document.getElementById('field-name').value.trim();
  const phone   = document.getElementById('field-phone').value.trim();
  const address = document.getElementById('field-address').value.trim();
  let   hasError = false;

  /* validate name */
  if (name.length < 2) {
    setError('field-name', 'err-name');
    hasError = true;
  } else {
    clearError('field-name', 'err-name');
  }

  /* validate phone */
  if (!validateBDPhone(phone)) {
    setError('field-phone', 'err-phone');
    hasError = true;
  } else {
    clearError('field-phone', 'err-phone');
  }

  /* validate address */
  if (address.length < 6) {
    setError('field-address', 'err-address');
    hasError = true;
  } else {
    clearError('field-address', 'err-address');
  }

  /* validate district */
  if (!selectedDistrict) {
    const btn = document.getElementById('district-btn');
    btn.classList.add('error');
    document.getElementById('err-district').classList.add('visible');
    btn.classList.remove('shake');
    void btn.offsetWidth;
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 400);
    hasError = true;
  } else {
    document.getElementById('district-btn').classList.remove('error');
    document.getElementById('err-district').classList.remove('visible');
  }

  if (hasError) {
    /* scroll to first visible error */
    const firstErr = document.querySelector(
      '.form-input.error, .form-textarea.error, .custom-select-btn.error'
    );
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  /* ── Build order payload ── */
  const subtotal      = qty * BOOK_PRICE;
  const isInsideDhaka = selectedDistrict === 'ঢাকার ভিতরে (৳৭০)';
  const delivery      = isInsideDhaka ? DELIVERY_INSIDE : DELIVERY_OUTSIDE;
  const grand         = subtotal + delivery;
  const note          = document.getElementById('field-note').value.trim();

  const order = { name, phone, address, district: selectedDistrict, note, qty, subtotal, delivery, grand };

  /* Pass to Thank You page via sessionStorage */
  sessionStorage.setItem('proshanti_order', JSON.stringify(order));

  /* Show a brief loading state, then navigate */
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.classList.add('is-loading');

  /* Fire the Telegram notification in the background — don't make the
     customer wait for it, and don't block checkout if it fails */
  notifyTelegram(order);

  setTimeout(() => {
    window.location.href = '../thank you/thankyou.html';
  }, 550);
}

/* ══════════════════════════════════
   TELEGRAM ORDER NOTIFICATION
══════════════════════════════════ */
function notifyTelegram(order) {
  if (!ORDER_NOTIFY_URL || ORDER_NOTIFY_URL.includes('YOUR-SUBDOMAIN')) {
    console.warn('[Telegram] ORDER_NOTIFY_URL সেট করা হয়নি — অর্ডার নোটিফিকেশন পাঠানো হয়নি।');
    return;
  }
  fetch(ORDER_NOTIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  }).catch(err => {
    // Order still completes for the customer even if this fails —
    // we just log it so it doesn't silently disappear.
    console.error('[Telegram] notify failed:', err);
  });
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  updateTotal();
  initLiveValidation();

  /* Back button */
  document.getElementById('back-btn').addEventListener('click', function() {
    window.location.href = '../index.html';
  });
});