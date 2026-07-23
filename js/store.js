// ===== Raja Watches — store front logic =====

const CONTENT_URL = "data/content.json";
const PRODUCTS_URL = "data/products.json";

let siteContent = null;

// ---------- theme ----------
function initTheme() {
  const saved = localStorage.getItem("rw_theme");
  const preferredDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (preferredDark ? "dark" : "dark"); // default dark (brand default)
  applyTheme(theme);
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem("rw_theme", next);
    });
  }
}
function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  const knob = document.querySelector("#theme-toggle .knob");
  if (knob) knob.textContent = theme === "light" ? "☀" : "☾";
}

// ---------- scroll reveal ----------
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => io.observe(el));
}
// re-run reveal for elements injected after initial load (e.g. product cards)
function revealNode(el) {
  if (!("IntersectionObserver" in window)) {
    el.classList.add("is-visible");
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  io.observe(el);
}

// ---------- content ----------
async function loadContent() {
  try {
    const res = await fetch(CONTENT_URL, { cache: "no-store" });
    siteContent = await res.json();
  } catch (err) {
    console.error("Could not load site content, using page defaults.", err);
    siteContent = null;
    return;
  }
  applyContent(siteContent);
}

function applyContent(c) {
  if (!c) return;
  setText("brand-accent-slot", c.brandAccent);
  setText("brand-main-slot", c.brandName);
  setText("header-tag", c.headerTag);
  setText("hero-eyebrow", c.heroEyebrow);
  setText("hero-heading-plain", c.heroHeadingPlain);
  setText("hero-heading-accent", c.heroHeadingAccent);
  setText("hero-paragraph", c.heroParagraph);
  setText("hero-cta", c.heroButtonText);
  setText("section-title", c.sectionTitle);
  setText("footer-tagline", c.footerTagline);
  setText("contact-eyebrow", c.contactEyebrow);
  setText("contact-title", c.contactTitle);
  setText("contact-about", c.contactAbout);

  const emailEl = document.getElementById("contact-email");
  if (emailEl && c.contactEmail) {
    emailEl.textContent = c.contactEmail;
    emailEl.href = "mailto:" + c.contactEmail;
  }
  setHref("social-instagram", c.socialInstagramUrl);
  setHref("social-tiktok", c.socialTiktokUrl);
  setHref("social-whatsapp-channel", c.socialWhatsappChannelUrl);
}
function setText(id, value) {
  if (value === undefined || value === null) return;
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
function setHref(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el) el.href = value;
}

// ---------- products ----------
function showSkeletons(grid, count = 6) {
  grid.innerHTML = Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-block img"></div>
      <div class="skeleton-block line"></div>
      <div class="skeleton-block line short"></div>
    </div>
  `).join("");
}

async function loadProducts() {
  const grid = document.getElementById("product-grid");
  showSkeletons(grid);
  try {
    const res = await fetch(PRODUCTS_URL, { cache: "no-store" });
    const products = await res.json();
    renderProducts(products, grid);
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--muted)">Could not load products right now. Please refresh.</p>`;
    console.error(err);
  }
}

function renderProducts(products, grid) {
  if (!products || products.length === 0) {
    grid.innerHTML = `<p style="color:var(--muted)">No watches listed yet. Check back soon.</p>`;
    return;
  }
  grid.innerHTML = products.map((p, i) => `
    <div class="card reveal" style="--i:${i}">
      <div class="card-img"><img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy"></div>
      <div class="card-body">
        <h3 class="card-name">${escapeHtml(p.name)}</h3>
        <p class="card-desc">${escapeHtml(p.description || "")}</p>
        <div class="card-price">PKR ${Number(p.price).toLocaleString()}</div>
        <button class="btn wa" data-id="${escapeAttr(p.id)}">Order on WhatsApp</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".card").forEach(card => revealNode(card));

  grid.querySelectorAll(".btn.wa").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = products.find(p => p.id === btn.dataset.id);
      orderOnWhatsApp(product);
    });
  });
}

function orderOnWhatsApp(product) {
  const number = (siteContent && siteContent.whatsappNumber) || "923156090004";
  const message =
    `Hello Raja Watches, I want to order:\n` +
    `Watch: ${product.name}\n` +
    `Price: PKR ${Number(product.price).toLocaleString()}\n` +
    `Please confirm availability and delivery details.`;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}
function escapeAttr(str = "") { return escapeHtml(str); }

// ---------- boot ----------
initTheme();
initReveal();
loadContent().then(loadProducts);
