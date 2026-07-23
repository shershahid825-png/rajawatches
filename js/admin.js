// ===== Raja Watches — admin panel logic =====

// CHANGE THIS before you deploy. This is a simple client-side gate only —
// it stops casual visitors from opening the panel, it is NOT real security.
// Real protection is your GitHub token, which only you hold.
const ADMIN_PASSWORD = "raja2026";

const PRODUCTS_PATH_IN_REPO = "data/products.json";
const CONTENT_PATH_IN_REPO = "data/content.json";

let products = [];
let currentSha = null;        // products.json sha
let currentContentSha = null; // content.json sha

const el = id => document.getElementById(id);

// ---------- theme (shared with the public site) ----------
(function initTheme() {
  const saved = localStorage.getItem("rw_theme");
  applyTheme(saved || "dark");
  const toggle = el("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem("rw_theme", next);
    });
  }
  function applyTheme(theme) {
    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    const knob = document.querySelector("#theme-toggle .knob");
    if (knob) knob.textContent = theme === "light" ? "☀" : "☾";
  }
})();

// ---------- login ----------
function checkLogin() {
  if (sessionStorage.getItem("rw_admin_ok") === "1") showPanel();
}
el("login-btn").addEventListener("click", () => {
  if (el("pw").value === ADMIN_PASSWORD) {
    sessionStorage.setItem("rw_admin_ok", "1");
    showPanel();
  } else {
    alert("Wrong password.");
  }
});
el("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("rw_admin_ok");
  location.reload();
});
function showPanel() {
  el("login-screen").style.display = "none";
  el("panel-screen").style.display = "block";
  loadSettingsFromStorage();
}

// ---------- GitHub connection settings ----------
function loadSettingsFromStorage() {
  el("gh-owner").value = localStorage.getItem("rw_gh_owner") || "";
  el("gh-repo").value = localStorage.getItem("rw_gh_repo") || "";
  el("gh-branch").value = localStorage.getItem("rw_gh_branch") || "main";
  el("gh-token").value = localStorage.getItem("rw_gh_token") || "";
}
el("save-settings-btn").addEventListener("click", () => {
  localStorage.setItem("rw_gh_owner", el("gh-owner").value.trim());
  localStorage.setItem("rw_gh_repo", el("gh-repo").value.trim());
  localStorage.setItem("rw_gh_branch", el("gh-branch").value.trim() || "main");
  localStorage.setItem("rw_gh_token", el("gh-token").value.trim());
  showStatus("Connection details saved on this browser.", "ok");
});

function getSettings() {
  return {
    owner: el("gh-owner").value.trim(),
    repo: el("gh-repo").value.trim(),
    branch: el("gh-branch").value.trim() || "main",
    token: el("gh-token").value.trim()
  };
}

function apiHeaders(token) {
  return {
    "Authorization": `token ${token}`,
    "Accept": "application/vnd.github+json"
  };
}

function withSpinner(btn, busyLabel, run) {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>${busyLabel}`;
  return Promise.resolve(run()).finally(() => {
    btn.disabled = false;
    btn.innerHTML = original;
  });
}

// =====================================================================
// SITE TEXT & LINKS (data/content.json)
// =====================================================================
const CONTENT_FIELDS = [
  "brandName", "brandAccent", "headerTag", "heroEyebrow",
  "heroHeadingPlain", "heroHeadingAccent", "heroParagraph", "heroButtonText",
  "sectionTitle", "footerTagline", "whatsappNumber",
  "contactEyebrow", "contactTitle", "contactAbout", "contactEmail",
  "socialInstagramUrl", "socialTiktokUrl", "socialWhatsappChannelUrl"
];

el("load-content-btn").addEventListener("click", () => {
  withSpinner(el("load-content-btn"), "Loading...", loadContentFromGitHub);
});
el("save-content-btn").addEventListener("click", () => {
  withSpinner(el("save-content-btn"), "Saving...", saveContentToGitHub);
});

async function loadContentFromGitHub() {
  const { owner, repo, branch, token } = getSettings();
  if (!owner || !repo || !token) {
    showStatus("Fill in GitHub username, repo and token first.", "err");
    return;
  }
  showStatus("Loading site text from GitHub...", "ok");
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${CONTENT_PATH_IN_REPO}?ref=${branch}`;
    const res = await fetch(url, { headers: apiHeaders(token) });
    if (!res.ok) throw new Error(`GitHub error ${res.status}: ${(await res.json()).message || ""}`);
    const data = await res.json();
    currentContentSha = data.sha;
    const jsonText = decodeURIComponent(escape(atob(data.content)));
    const content = JSON.parse(jsonText);
    fillContentForm(content);
    el("content-form").style.display = "block";
    showStatus("Site text loaded. Edit below, then Save.", "ok");
  } catch (err) {
    console.error(err);
    showStatus("Could not load site text: " + err.message, "err");
  }
}

function fillContentForm(content) {
  CONTENT_FIELDS.forEach(key => {
    const field = el("c-" + key);
    if (field) field.value = content[key] || "";
  });
}

function readContentForm() {
  const content = {};
  CONTENT_FIELDS.forEach(key => {
    const field = el("c-" + key);
    content[key] = field ? field.value : "";
  });
  return content;
}

async function saveContentToGitHub() {
  const { owner, repo, branch, token } = getSettings();
  if (!owner || !repo || !token) {
    showStatus("Fill in GitHub username, repo and token first.", "err");
    return;
  }
  if (!currentContentSha) {
    showStatus("Click 'Load Site Text' first so changes are saved on top of the latest version.", "err");
    return;
  }
  showStatus("Saving site text to GitHub...", "ok");
  try {
    const content = readContentForm();
    const body = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${CONTENT_PATH_IN_REPO}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...apiHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update site text via admin panel",
        content: body,
        sha: currentContentSha,
        branch
      })
    });
    if (!res.ok) throw new Error(`GitHub error ${res.status}: ${(await res.json()).message || ""}`);
    const data = await res.json();
    currentContentSha = data.content.sha;
    showStatus("Saved! Netlify will rebuild the store in about a minute.", "ok");
  } catch (err) {
    console.error(err);
    showStatus("Could not save: " + err.message, "err");
  }
}

// =====================================================================
// PRODUCTS (data/products.json)
// =====================================================================
el("load-products-btn").addEventListener("click", () => {
  withSpinner(el("load-products-btn"), "Loading...", loadProductsFromGitHub);
});

async function loadProductsFromGitHub() {
  const { owner, repo, branch, token } = getSettings();
  if (!owner || !repo || !token) {
    showStatus("Fill in GitHub username, repo and token first.", "err");
    return;
  }
  showStatus("Loading products from GitHub...", "ok");
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${PRODUCTS_PATH_IN_REPO}?ref=${branch}`;
    const res = await fetch(url, { headers: apiHeaders(token) });
    if (!res.ok) throw new Error(`GitHub error ${res.status}: ${(await res.json()).message || ""}`);
    const data = await res.json();
    currentSha = data.sha;
    const jsonText = decodeURIComponent(escape(atob(data.content)));
    products = JSON.parse(jsonText);
    renderProducts();
    showStatus("Products loaded. Edit below, then Save.", "ok");
  } catch (err) {
    console.error(err);
    showStatus("Could not load products: " + err.message, "err");
  }
}

// ---------- render editable product list ----------
function renderProducts() {
  const list = el("products-list");
  if (products.length === 0) {
    list.innerHTML = `<p class="hint">No products yet. Click "Add New Watch" below.</p>`;
    return;
  }
  list.innerHTML = products.map((p, i) => `
    <div class="product-edit" data-index="${i}" style="--i:${i}">
      <div class="thumb"><img src="${p.image}" alt=""></div>
      <div class="edit-fields">
        <div class="row2">
          <div class="field" style="margin-bottom:0">
            <label>Name</label>
            <input type="text" class="f-name" value="${attr(p.name)}">
          </div>
          <div class="field" style="margin-bottom:0">
            <label>Price (PKR)</label>
            <input type="number" class="f-price" value="${p.price}">
          </div>
        </div>
        <div class="field" style="margin-bottom:0">
          <label>Description</label>
          <textarea class="f-desc">${attr(p.description || "")}</textarea>
        </div>
        <div class="field" style="margin-bottom:0">
          <label>Replace Photo</label>
          <input type="file" class="f-image" accept="image/*">
        </div>
        <div class="edit-actions">
          <button class="btn danger small f-delete">Delete Watch</button>
        </div>
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".product-edit").forEach(card => {
    const i = Number(card.dataset.index);

    card.querySelector(".f-name").addEventListener("input", e => products[i].name = e.target.value);
    card.querySelector(".f-price").addEventListener("input", e => products[i].price = Number(e.target.value));
    card.querySelector(".f-desc").addEventListener("input", e => products[i].description = e.target.value);

    card.querySelector(".f-image").addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file) return;
      showStatus("Compressing image...", "ok");
      const dataUrl = await compressImageToDataURL(file, 800, 0.82);
      products[i].image = dataUrl;
      card.querySelector(".thumb img").src = dataUrl;
      showStatus("Photo updated. Click 'Save All Changes' to publish.", "ok");
    });

    card.querySelector(".f-delete").addEventListener("click", () => {
      if (confirm(`Delete "${products[i].name}"?`)) {
        card.style.transition = "opacity .25s ease, transform .25s ease";
        card.style.opacity = "0";
        card.style.transform = "translateX(12px)";
        setTimeout(() => {
          products.splice(i, 1);
          renderProducts();
        }, 200);
      }
    });
  });
}

// ---------- add product ----------
el("add-product-btn").addEventListener("click", () => {
  products.push({
    id: "rw-" + Date.now(),
    name: "New Watch",
    price: 0,
    description: "",
    image: "https://placehold.co/500x500/0D1117/C9A227?text=New+Watch"
  });
  renderProducts();
  const cards = el("products-list").querySelectorAll(".product-edit");
  if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
});

// ---------- save all changes back to GitHub ----------
el("save-all-btn").addEventListener("click", () => {
  withSpinner(el("save-all-btn"), "Saving...", saveAllToGitHub);
});

async function saveAllToGitHub() {
  const { owner, repo, branch, token } = getSettings();
  if (!owner || !repo || !token) {
    showStatus("Fill in GitHub username, repo and token first.", "err");
    return;
  }
  if (!currentSha) {
    showStatus("Click 'Load Products' first so changes are saved on top of the latest version.", "err");
    return;
  }
  showStatus("Saving to GitHub...", "ok");
  try {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 2))));
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${PRODUCTS_PATH_IN_REPO}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...apiHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update products via admin panel",
        content,
        sha: currentSha,
        branch
      })
    });
    if (!res.ok) throw new Error(`GitHub error ${res.status}: ${(await res.json()).message || ""}`);
    const data = await res.json();
    currentSha = data.content.sha;
    showStatus("Saved! Netlify will rebuild the store in about a minute.", "ok");
  } catch (err) {
    console.error(err);
    showStatus("Could not save: " + err.message, "err");
  }
}

// ---------- helpers ----------
function compressImageToDataURL(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showStatus(msg, type) {
  const box = el("status");
  box.classList.remove("show");
  // restart the reveal transition
  void box.offsetWidth;
  box.textContent = msg;
  box.className = `status-msg show ${type}`;
}

function attr(str = "") {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}

checkLogin();
