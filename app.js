// Live Information Dashboard functionality
// Comet Assistant: adds real-time, simulated data updates for dashboard widgets

document.addEventListener('DOMContentLoaded', () => {
  // Utility helpers
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const format2 = n => n.toString().padStart(2, '0');

  // Safe text setter
  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  // Animated number update
  function tweenNumber({ el, from = 0, to = 0, duration = 600, formatter = v => v.toFixed(0) }) {
    if (!el) return;
    const start = performance.now();
    function frame(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (to - from) * eased;
      el.textContent = formatter(val);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Sparkline generator (optional, if canvas present)
  function updateSparkline(canvas, points) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth || 160;
    const h = canvas.height = canvas.offsetHeight || 48;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const scaleX = w / Math.max(1, points.length - 1);
    const scaleY = max === min ? 1 : h / (max - min);
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 2;
    // Gradient line
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#34d399');
    grad.addColorStop(1, '#10b981');
    ctx.strokeStyle = grad;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = i * scaleX;
      const y = h - (p - min) * scaleY;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // Clock: updates every second
  function initClock() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    function tick() {
      const now = new Date();
      const hh = format2(now.getHours());
      const mm = format2(now.getMinutes());
      const ss = format2(now.getSeconds());
      const timeStr = `${hh}:${mm}:${ss}`;
      const dateStr = now.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      setText(timeEl, timeStr);
      setText(dateEl, dateStr);
    }
    tick();
    return setInterval(tick, 1000);
  }

  // Weather simulation
  function initWeather() {
    const tempEl = document.getElementById('weather-temp'); // e.g., "72°F"
    const condEl = document.getElementById('weather-cond'); // e.g., "Sunny"
    const locEl = document.getElementById('weather-loc');   // e.g., city name
    const iconEl = document.getElementById('weather-icon'); // optional icon element

    const conditions = [
      { name: 'Sunny', icon: '☀️' },
      { name: 'Partly Cloudy', icon: '⛅' },
      { name: 'Cloudy', icon: '☁️' },
      { name: 'Light Rain', icon: '🌦️' },
      { name: 'Rain', icon: '🌧️' },
      { name: 'Storm', icon: '⛈️' },
      { name: 'Windy', icon: '🌬️' }
    ];

    const cities = ['Austin', 'New York', 'London', 'Paris', 'Nairobi', 'Kigali', 'Tokyo', 'Singapore'];

    let temp = randInt(50, 85);
    let idx = randInt(0, conditions.length - 1);
    let city = cities[randInt(0, cities.length - 1) | 0];

    function render() {
      tweenNumber({ el: tempEl, from: temp, to: temp = clamp(temp + randInt(-2, 2), 40, 100), duration: 500, formatter: v => `${Math.round(v)}°F` });
      const c = conditions[idx];
      setText(condEl, c ? c.name : '—');
      if (iconEl) setText(iconEl, c ? c.icon : '');
      setText(locEl, city);
    }

    function cycleCondition() {
      if (Math.random() < 0.4) idx = randInt(0, conditions.length - 1);
      if (Math.random() < 0.2) city = cities[randInt(0, cities.length - 1) | 0];
      render();
    }

    render();
    const t1 = setInterval(cycleCondition, 5000);
    return () => clearInterval(t1);
  }

  // Bitcoin price simulation
  function initBitcoin() {
    const priceEl = document.getElementById('btc-price');
    const changeEl = document.getElementById('btc-change');
    const spark = document.getElementById('btc-spark'); // <canvas>

    let price = 65000 + rand(-500, 500);
    let history = Array.from({ length: 30 }, () => price + rand(-300, 300));

    function render(next) {
      const from = price;
      price = clamp(next, 5000, 200000);
      const delta = price - from;
      const pct = (delta / from) * 100;
      tweenNumber({ el: priceEl, from, to: price, duration: 500, formatter: v => `$${Math.round(v).toLocaleString()}` });
      setText(changeEl, `${delta >= 0 ? '+' : ''}${pct.toFixed(2)}%`);
      changeEl?.classList.toggle('up', delta >= 0);
      changeEl?.classList.toggle('down', delta < 0);
      history.push(price);
      if (history.length > 60) history.shift();
      updateSparkline(spark, history);
    }

    function tick() {
      const vol = rand(50, 300); // volatility
      const dir = Math.random() < 0.5 ? -1 : 1;
      const next = price + dir * vol;
      render(next);
    }

    // initial paint
    render(price);
    const t = setInterval(tick, 4000);
    return () => clearInterval(t);
  }

  // Market sentiment simulation (0-100)
  function initSentiment() {
    const bar = document.getElementById('sentiment-bar'); // width or aria
    const label = document.getElementById('sentiment-label');

    let value = randInt(30, 70);

    function bucket(v) {
      if (v < 20) return 'Extreme Fear';
      if (v < 45) return 'Fear';
      if (v < 55) return 'Neutral';
      if (v < 80) return 'Greed';
      return 'Extreme Greed';
    }

    function render(next) {
      const from = value;
      value = clamp(next, 0, 100);
      tweenNumber({ el: label, from, to: value, duration: 600, formatter: v => `${Math.round(v)} · ${bucket(v)}` });
      if (bar) {
        bar.style.width = `${value}%`;
        bar.setAttribute('aria-valuenow', String(Math.round(value)));
      }
    }

    function tick() {
      const drift = rand(-8, 8);
      const next = value + drift;
      render(next);
    }

    render(value);
    const t = setInterval(tick, 3000);
    return () => clearInterval(t);
  }

  // News headlines rotator (if present)
  function initNewsTicker() {
    const items = $$('#news-ticker .news-item');
    if (!items.length) return () => {};
    let idx = 0;
    function show(i) {
      items.forEach((el, j) => el.classList.toggle('active', j === i));
    }
    show(0);
    const t = setInterval(() => {
      idx = (idx + 1) % items.length;
      show(idx);
    }, 4000);
    return () => clearInterval(t);
  }

  // KPI widgets: generic counters with random drift
  function initKPIs() {
    const widgets = $$('.kpi[data-min][data-max]');
    const timers = [];

    widgets.forEach(w => {
      const valEl = $('.kpi-value', w);
      const min = parseFloat(w.dataset.min);
      const max = parseFloat(w.dataset.max);
      const fmt = w.dataset.fmt || 'int'; // int, float, percent, currency

      let value = rand(min, max);

      function format(v) {
        switch (fmt) {
          case 'float': return v.toFixed(2);
          case 'percent': return `${v.toFixed(1)}%`;
          case 'currency': return `$${Math.round(v).toLocaleString()}`;
          default: return `${Math.round(v)}`;
        }
      }

      function tick() {
        const delta = rand(-(max - min) * 0.05, (max - min) * 0.05);
        const next = clamp(value + delta, min, max);
        tweenNumber({ el: valEl, from: value, to: next, duration: 600, formatter: v => format(v) });
        value = next;
      }

      // initial render
      setText(valEl, format(value));
      timers.push(setInterval(tick, randInt(2500, 4500)));
    });

    return () => timers.forEach(clearInterval);
  }

  // Task list interactions (checkbox progress)
  function initTasks() {
    const list = document.getElementById('tasks');
    if (!list) return () => {};
    const progress = document.getElementById('tasks-progress');

    function updateProgress() {
      const boxes = $$('input[type="checkbox"]', list);
      const done = boxes.filter(b => b.checked).length;
      const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
      if (progress) progress.style.width = `${pct}%`;
      const label = document.getElementById('tasks-progress-label');
      setText(label, `${pct}%`);
    }

    list.addEventListener('change', e => {
      if (e.target.matches('input[type="checkbox"]')) updateProgress();
    });

    updateProgress();
    return () => {};
  }

  // Notifications demo
  function notify(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    Object.assign(el.style, {
      position: 'fixed', right: '20px', top: '20px', zIndex: 1000,
      background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
      color: '#fff', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,.15)'
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // Theme toggle (if present)
  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return () => {};
    function apply(mode) {
      document.documentElement.dataset.theme = mode;
      localStorage.setItem('theme', mode);
      btn.setAttribute('aria-pressed', String(mode === 'dark'));
    }
    const saved = localStorage.getItem('theme') || 'light';
    apply(saved);
    btn.addEventListener('click', () => apply(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
    return () => {};
  }

  // Search filter demo (client-side filter for list items)
  function initFilter() {
    const input = document.getElementById('filter-input');
    const list = document.getElementById('filter-list');
    if (!input || !list) return () => {};
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      $$('#filter-list .filter-item').forEach(li => {
        const show = li.textContent.toLowerCase().includes(q);
        li.style.display = show ? '' : 'none';
      });
    });
    return () => {};
  }

  // Initialize everything
  const disposers = [];
  try { disposers.push(initClock()); } catch {}
  try { disposers.push(initWeather()); } catch {}
  try { disposers.push(initBitcoin()); } catch {}
  try { disposers.push(initSentiment()); } catch {}
  try { disposers.push(initNewsTicker()); } catch {}
  try { disposers.push(initKPIs()); } catch {}
  try { disposers.push(initTasks()); } catch {}
  try { disposers.push(initTheme()); } catch {}
  try { disposers.push(initFilter()); } catch {}

  // Accessibility: keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && (e.metaKey || e.ctrlKey)) {
      notify('Shortcuts: Ctrl/Cmd+? (this), T toggle theme, / focus filter');
    }
    if (e.key.toLowerCase() === 't') {
      const btn = document.getElementById('theme-toggle');
      btn?.click();
    }
    if (e.key === '/' && document.activeElement === document.body) {
      const input = document.getElementById('filter-input');
      input?.focus();
      e.preventDefault();
    }
  });

  // Expose to window for debugging (optional)
  window.__dashboardDebug = {
    rand, randInt, tweenNumber
  };

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    disposers.forEach(d => typeof d === 'function' && d());
  });
});
