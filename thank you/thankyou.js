/* ═══════════════════════════════════════════════════════════
   প্রশান্তির সন্ধানে — Thank You Page Scripts
   ═══════════════════════════════════════════════════════════ */

/* ── 1. Reduced Motion Check ─────────────────────────────── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 2. Bangla Number Converter ──────────────────────────── */
function toBanglaNum(n) {
  return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
}

/* ── 3. Populate Dynamic Fields from Session Storage ──────────── */
function populateOrderData() {
  const orderDataStr = sessionStorage.getItem('proshanti_order');
  let orderData = {};
  if (orderDataStr) {
    try {
      orderData = JSON.parse(orderDataStr);
    } catch(e) {}
  }
  
  const customerName = orderData.name     || 'রাহেলা বেগম';
  const customerPhone= orderData.phone    || '০১৮৩৪-৫৬৭৮৯০';
  const qty          = parseInt(orderData.qty || '1');
  const district     = orderData.district || 'ঢাকা';
  const totalPrice   = orderData.grand    || String(qty * 999);

  // Random order ID
  const orderId = '#PS-' + Math.floor(10000 + Math.random() * 90000);

  // Update DOM
  document.getElementById('heroHeadline').innerHTML =
    'ধন্যবাদ, <span class="name-hl">' + customerName + '!</span><br/>আপনার অর্ডারটি কনফার্ম হয়েছে';

  document.getElementById('orderIdDisplay').textContent  = orderId;
  document.getElementById('qtyDisplay').textContent      = toBanglaNum(qty) + ' কপি';
  document.getElementById('districtDisplay').textContent = district;
  document.getElementById('phoneDisplay').textContent    = customerPhone;
  document.getElementById('totalDisplay').textContent    = '৳ ' + toBanglaNum(parseInt(totalPrice));
}

/* ── 4. Sunrise Arc + Sun Animation (~800ms, runs once) ──── */
function animateArc() {
  const arcBand   = document.getElementById('arcBand');
  const sunHalo   = document.getElementById('sunHalo');
  const sunCore   = document.getElementById('sunCore');
  const sunCenter = document.getElementById('sunCenter');
  const checkRing = document.getElementById('checkRing');

  /* Helper: set cx/cy on a circle element */
  function setPos(el, x, y) {
    el.setAttribute('cx', x);
    el.setAttribute('cy', y);
  }

  /* If user prefers reduced motion — jump to final state */
  if (prefersReduced) {
    arcBand.style.strokeDashoffset = String(692 * 0.5);
    setPos(sunHalo,   230, 14);
    setPos(sunCore,   230, 14);
    setPos(sunCenter, 230, 14);
    checkRing.classList.add('pop');
    return;
  }

  /*
   * Arc geometry:
   *   Centre = (230, 230), radius = 220
   *   Sun travels from 180° (left horizon) → 88° (near top)
   *   Arc total stroke length ≈ 692 (full half-circle)
   *   We draw the first half (left to top) by animating strokeDashoffset
   *     from 692 → 692 * 0.5
   */
  const totalLength   = 692;
  const duration      = 800; // ms
  const cx = 230, cy = 230, r = 220;
  const startAngleDeg = 180;
  const endAngleDeg   = 88;
  const startTime     = performance.now();

  /* Cubic ease-out */
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function frame(now) {
    const elapsed = now - startTime;
    const raw     = Math.min(elapsed / duration, 1);
    const t       = easeOut(raw);

    /* Draw arc */
    arcBand.style.strokeDashoffset = totalLength * (1 - t * 0.5);

    /* Sun position along arc */
    const angleDeg = startAngleDeg + (endAngleDeg - startAngleDeg) * t;
    const angleRad = angleDeg * Math.PI / 180;
    const sx = cx + r * Math.cos(angleRad);
    const sy = cy + r * Math.sin(angleRad);
    setPos(sunHalo,   sx, sy);
    setPos(sunCore,   sx, sy);
    setPos(sunCenter, sx, sy);

    /* Halo grows + brightens as sun rises */
    const haloR = 18 + t * 14;
    sunHalo.setAttribute('r', haloR);
    sunHalo.setAttribute('fill', `rgba(232,163,61,${(0.18 + t * 0.22).toFixed(2)})`);

    if (raw < 1) {
      requestAnimationFrame(frame);
    } else {
      /* Snap to final resting position */
      arcBand.style.strokeDashoffset = String(totalLength * 0.5);
      setPos(sunHalo,   230, 14);
      setPos(sunCore,   230, 14);
      setPos(sunCenter, 230, 14);
      sunHalo.setAttribute('r', '28');

      /* Trigger checkmark pop after a short pause */
      setTimeout(() => checkRing.classList.add('pop'), 80);
    }
  }

  requestAnimationFrame(frame);
}

/* ── 5. IntersectionObserver: Scroll Reveal ──────────────── */
function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!prefersReduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => observer.observe(el));
  } else {
    /* No observer support or reduced motion — show everything */
    revealEls.forEach(el => el.classList.add('visible'));
  }
}

/* ── 6. Timeline Staggered Steps ─────────────────────────── */
function initSteps() {
  const timeline  = document.getElementById('timeline');
  const stepItems = document.querySelectorAll('.step-item');

  if (!prefersReduced && 'IntersectionObserver' in window) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stepItems.forEach(item => item.classList.add('slide-in'));
          stepObserver.disconnect(); // once only
        }
      });
    }, { threshold: 0.2 });

    stepObserver.observe(timeline);
  } else {
    stepItems.forEach(item => {
      item.style.opacity   = '1';
      item.style.transform = 'none';
    });
  }
}

/* ── 7. Share Buttons ────────────────────────────────────── */
function shareWhatsApp() {
  const text = encodeURIComponent(
    'প্রশান্তির সন্ধানে বইটি পড়লাম — অসাধারণ! ' +
    'ট্রমা ও অ্যাংজাইটি থেকে বের হয়ে আসার পথ দেখায়। ' +
    'তোমাকেও পড়তে বলছি।'
  );
  window.open('https://wa.me/?text=' + text, '_blank');
}

function shareFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank');
}

function copyLink() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('লিংক কপি হয়েছে!'))
      .catch(() => alert('কপি করা যায়নি, ম্যানুয়ালি কপি করুন।'));
  } else {
    /* Fallback for older browsers */
    const el = document.createElement('textarea');
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('লিংক কপি হয়েছে!');
  }
}

/* ── 8. Init on Load ─────────────────────────────────────── */
window.addEventListener('load', () => {
  populateOrderData();
  animateArc();
  initReveal();
  initSteps();
});
