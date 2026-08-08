/* ═══════════════════════════════════════════
   PRASHANTIR SANDHANE — app.js
   View: home | checkout | thankyou
═══════════════════════════════════════════ */

// ── Districts list ──────────────────────────
const DISTRICTS = [
  'ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','ময়মনসিংহ','রংপুর',
  'কুমিল্লা','নারায়ণগঞ্জ','গাজীপুর','টাঙ্গাইল','কিশোরগঞ্জ','নেত্রকোনা','শেরপুর',
  'জামালপুর','ফরিদপুর','গোপালগঞ্জ','মাদারীপুর','শরীয়তপুর','রাজবাড়ী','মানিকগঞ্জ',
  'মুন্সীগঞ্জ','নরসিংদী','ব্রাহ্মণবাড়িয়া','চাঁদপুর','লক্ষ্মীপুর','নোয়াখালী',
  'ফেনী','কক্সবাজার','বান্দরবান','রাঙামাটি','খাগড়াছড়ি','বগুড়া','জয়পুরহাট',
  'নওগাঁ','নাটোর','চাঁপাইনবাবগঞ্জ','পাবনা','সিরাজগঞ্জ','যশোর','সাতক্ষীরা',
  'মেহেরপুর','নড়াইল','কুষ্টিয়া','মাগুরা','ঝিনাইদহ','চুয়াডাঙ্গা','বাগেরহাট',
  'পিরোজপুর','পটুয়াখালী','ভোলা','ঝালকাঠি','বরগুনা','হবিগঞ্জ','মৌলভীবাজার',
  'সুনামগঞ্জ','নীলফামারী','লালমনিরহাট','কুড়িগ্রাম','গাইবান্ধা','দিনাজপুর',
  'ঠাকুরগাঁও','পঞ্চগড়'
];

// ── View management ──────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + name);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // Init checkout if needed
  if (name === 'checkout') initCheckout();
}

// Wire all [data-goto] buttons
document.addEventListener('click', function(e) {
  const btn = e.target.closest('[data-goto]');
  if (!btn) return;
  const dest = btn.getAttribute('data-goto');
  
  if (dest === 'checkout') {
    window.location.href = 'checkout/index.html';
  } else if (dest === 'thankyou') {
    window.location.href = 'thank you/thankyou.html';
  } else if (dest === 'home') {
    window.location.href = 'index.html';
  }
});

// ── Scroll-reveal (IntersectionObserver) ─────
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Accordion ────────────────────────────────
function initAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', function() {
      const item = this.closest('.accordion-item');
      const isOpen = item.classList.contains('is-open');

      // Close all
      document.querySelectorAll('.accordion-item.is-open').forEach(openItem => {
        openItem.classList.remove('is-open');
        openItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (unless it was already open)
      if (!isOpen) {
        item.classList.add('is-open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ── Custom Dropdown ───────────────────────────
class CustomSelect {
  constructor(el) {
    this.el = el;
    this.trigger = el.querySelector('.custom-select-trigger');
    this.panel = el.querySelector('.custom-select-panel');
    this.valueEl = el.querySelector('.select-value');
    this.optionsEl = el.querySelector('.select-options');
    this.searchEl = el.querySelector('.select-search');
    this.focusedIndex = -1;
    this.options = [];
    this.selectedValue = null;
    this.bind();
  }

  bind() {
    this.trigger.addEventListener('click', () => this.toggle());
    this.trigger.addEventListener('keydown', (e) => this.onTriggerKey(e));

    if (this.searchEl) {
      this.searchEl.addEventListener('input', () => this.filterOptions());
      this.searchEl.addEventListener('keydown', (e) => this.onSearchKey(e));
    }

    document.addEventListener('click', (e) => {
      if (!this.el.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  setOptions(items) {
    this.options = items;
    this.renderOptions(items);
  }

  renderOptions(items) {
    if (!this.optionsEl) return;
    this.optionsEl.innerHTML = '';
    items.forEach((item, idx) => {
      const label = typeof item === 'object' ? item.label : item;
      const value = typeof item === 'object' ? item.value : item;
      const div = document.createElement('div');
      div.className = 'select-option' + (value === this.selectedValue ? ' selected' : '');
      div.setAttribute('role', 'option');
      div.setAttribute('data-value', value);
      div.setAttribute('data-label', label);
      div.setAttribute('tabindex', '-1');
      div.innerHTML = `<span>${label}</span><svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      div.addEventListener('click', () => this.select(value, label));
      div.addEventListener('mouseenter', () => this.setFocus(idx));
      this.optionsEl.appendChild(div);
    });
  }

  filterOptions() {
    const q = this.searchEl.value.toLowerCase();
    const filtered = this.options.filter(item => {
      const label = typeof item === 'object' ? item.label : item;
      return label.toLowerCase().includes(q);
    });
    this.renderOptions(filtered);
    this.focusedIndex = -1;
  }

  select(value, label) {
    this.selectedValue = value;
    this.valueEl.textContent = label;
    this.el.setAttribute('data-value', value);
    // Refresh to show checkmark
    if (this.searchEl) {
      this.renderOptions(this.options);
    } else {
      this.renderOptions(this.options);
    }
    this.close();
    this.trigger.focus();
    // Dispatch change
    this.el.dispatchEvent(new CustomEvent('select-change', { detail: { value, label } }));
    // Update order summary if needed
    updateOrderSummary();
  }

  toggle() {
    this.el.getAttribute('aria-expanded') === 'true' ? this.close() : this.open();
  }

  open() {
    this.el.setAttribute('aria-expanded', 'true');
    if (this.searchEl) {
      setTimeout(() => { this.searchEl.focus(); this.searchEl.value = ''; this.renderOptions(this.options); }, 60);
    }
    this.focusedIndex = -1;
  }

  close() {
    this.el.setAttribute('aria-expanded', 'false');
    this.focusedIndex = -1;
    // Clear search
    if (this.searchEl) this.searchEl.value = '';
  }

  setFocus(idx) {
    this.focusedIndex = idx;
    const opts = this.optionsEl.querySelectorAll('.select-option');
    opts.forEach((o, i) => o.classList.toggle('focused', i === idx));
  }

  onTriggerKey(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.open(); this.moveFocus(1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); this.open(); this.moveFocus(-1); }
  }

  onSearchKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); this.moveFocus(1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); this.moveFocus(-1); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const opts = this.optionsEl.querySelectorAll('.select-option');
      if (this.focusedIndex >= 0 && opts[this.focusedIndex]) {
        opts[this.focusedIndex].click();
      }
    }
  }

  moveFocus(dir) {
    const opts = this.optionsEl.querySelectorAll('.select-option');
    if (!opts.length) return;
    this.focusedIndex = Math.max(0, Math.min(opts.length - 1, this.focusedIndex + dir));
    this.setFocus(this.focusedIndex);
    opts[this.focusedIndex]?.scrollIntoView({ block: 'nearest' });
  }
}

// ── Order summary update ─────────────────────
const PRICE_PER_BOOK = 999;
function updateOrderSummary() {
  const qtyEl = document.getElementById('qty-select');
  const qty = qtyEl ? parseInt(qtyEl.getAttribute('data-value') || '1') : 1;
  const total = qty * PRICE_PER_BOOK;
  const bookPriceEl = document.getElementById('order-book-price');
  const totalPriceEl = document.getElementById('order-total-price');
  if (bookPriceEl) bookPriceEl.textContent = '৳' + total.toLocaleString('bn-BD');
  if (totalPriceEl) totalPriceEl.textContent = '৳' + total.toLocaleString('bn-BD');
}

// ── Checkout init ────────────────────────────
let checkoutInited = false;
function initCheckout() {
  if (checkoutInited) return;
  checkoutInited = true;

  // District select
  const districtEl = document.getElementById('district-select');
  if (districtEl) {
    const ds = new CustomSelect(districtEl);
    ds.setOptions(DISTRICTS);
  }

  // Qty select
  const qtyEl = document.getElementById('qty-select');
  if (qtyEl) {
    const qs = new CustomSelect(qtyEl);
    // Already has static options in HTML, just init
    const opts = qtyEl.querySelectorAll('.select-option');
    qs.options = Array.from(opts).map(o => ({ value: o.dataset.value, label: o.dataset.label }));
    qs.selectedValue = '1';
    // Rebind
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        qs.select(opt.dataset.value, opt.dataset.label);
      });
    });
    // Mark first as selected
    if (opts[0]) opts[0].classList.add('selected');
  }
}

// ── Sticky CTA (mobile) ──────────────────────
function initStickyCTA() {
  const sticky = document.getElementById('sticky-cta');
  if (!sticky) return;

  const heroCTA = document.querySelector('.hero-cta');
  if (!heroCTA) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) {
        sticky.classList.add('show');
      } else {
        sticky.classList.remove('show');
      }
    });
  }, { threshold: 0.1 });

  obs.observe(heroCTA);
}

// ── Boot ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initAccordion();
  initStickyCTA();
});
