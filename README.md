# Raja Watches — Setup Guide

Ye pura website ready hai: home page, products, WhatsApp order button, dark/light
mode, smooth animations, aur ek admin panel jahan se aap **har heading, paragraph,
link, product pic, naam, aur price** change kar saktay hain bina code likhay.

## Files kya hain

```
raja-watches/
├── index.html          → main store page
├── admin.html           → admin panel (password protected)
├── css/style.css        → design + animations + dark/light theme
├── js/store.js          → store logic + theme toggle + reveal animations
├── js/admin.js          → admin panel logic (products AND site text)
├── data/products.json   → your product list (admin panel edits this)
└── data/content.json    → every heading/paragraph/link on the site (admin panel edits this)
```

## Naya kya hai is version mein

- 🌙 **Dark / light mode** — top-right toggle button, visitor ka choice browser
  mein yaad rehta hai.
- 🎞️ **Smooth animations** — hero, product cards, aur contact section scroll
  karte waqt fade-in hotay hain; cards par hover pe lift + zoom; buttons par
  shine effect; products load hotay waqt ek halka "skeleton" placeholder dikhta
  hai taake site khaali na lagay.
- 📱 Fully responsive — mobile se le kar bade desktop screens tak.
- ✍️ **Naya "Site Text & Links" section admin panel mein** — home page ki har
  heading, paragraph, button text, aur social links ab bina code ke change ho
  saktay hain (neeche Step 5 mein tareeqa hai).

## Step 1 — GitHub par upload karein

1. github.com par jaake naya repository banayein (e.g. `raja-watches`), **Public** rakhein.
2. Is folder ki tamam files us repo mein upload kar dein (drag & drop bhi chalta hai
   GitHub ke "Add file → Upload files" button se), ya `git push` use karein.

## Step 2 — Netlify par deploy karein

1. netlify.com par sign up / login karein (GitHub account se karein to sab se easy hai).
2. "Add new site → Import an existing project" → GitHub select karein → apni
   `raja-watches` repo choose karein.
3. Build settings khaali chorr dein — koi build command nahi chahiye, kyunke
   ye plain HTML site hai. Publish directory `/` (root) rakhein.
4. Deploy dabayein. Aapko ek link mil jayega jaisay `raja-watches.netlify.app`.
   Chahein to Netlify settings mein custom domain bhi laga saktay hain.

Ab jab bhi GitHub repo mein `data/products.json` ya `data/content.json` update
hoga (admin panel se), Netlify khud-ba-khud site rebuild kar dega — 1 minute
mein naye changes live.

## Step 3 — WhatsApp number confirm karein

Pehle ye number `js/store.js` mein hardcode tha — ab ye **admin panel ke "Site
Text & Links" section mein** "WhatsApp order number" field se edit hota hai
(Step 5 dekhein). Default value:

```
923156090004
```

Ye Pakistani number `0315-6090004` ko international format mein likha gaya
hai (leading 0 hata kar 92 laga diya).

## Step 4 — Admin password set karein

File `js/admin.js` mein pehli line hai:

```js
const ADMIN_PASSWORD = "raja2026";
```

Ise apni marzi ka password bana lein, phir GitHub par re-upload kar dein.
(Yaad rahe — ye sirf ek halka sa lock hai taake koi aam visitor panel na
khol sakay; asal security aapka GitHub token hai jo sirf aap ke paas hota hai.)

## Step 5 — Admin panel use karna

1. Apni site ke `/admin.html` par jayein (e.g. `raja-watches.netlify.app/admin.html`).
2. Apna admin password dalein.
3. "GitHub Connection" box mein ye bharein:
   - **GitHub Username** — aapka GitHub account name
   - **Repository Name** — e.g. `raja-watches`
   - **Branch** — usually `main`
   - **Personal Access Token** — neeche steps dekhein kaise banayein
4. "Save Connection" dabayein.

### Site ki text/headings change karna (naya!)

1. "Site Text & Links" box mein "Load Site Text" dabayein.
2. Har field khul jayegi — brand name, hero heading, paragraph, button text,
   collection title, footer line, WhatsApp number, contact section, aur
   social media links.
3. Jo bhi change karna hai karein, phir **"Save Site Text"** dabayein.
   1 minute mein live site update ho jayegi.

### Products (pic/naam/price) change karna

1. "Products" box mein "Load Products" dabayein — aapke products dikhne lag
   jayenge.
2. Kisi bhi product ki pic, naam, price, ya description change karein, ya
   "Add New Watch" se naya watch add karein, ya "Delete" se hata dein.
3. Sab kuch set hone ke baad **"Save All Changes to GitHub"** dabayein.

### Personal Access Token kaise banayein (ek dafa ka kaam)

1. GitHub par: Settings → Developer settings → Personal access tokens →
   **Fine-grained tokens** → Generate new token.
2. Repository access mein sirf apni `raja-watches` repo select karein.
3. Permissions mein **Contents → Read and write** on karein.
4. Generate karein aur token copy kar lein (ye sirf ek dafa dikhta hai).
5. Ye token admin panel ke "Personal Access Token" field mein paste kar dein.
   Ye sirf aapke apne browser mein save hota hai — kisi server par nahi jata.

**Note:** Token kisi ke sath share na karein — ye aapke GitHub repo mein
likhne ki permission deta hai.

## Product photos ka size

Admin panel photo ko automatically resize/compress kar deta hai (max 800px
chaurai) taake `products.json` file zyada bhari na ho. Phir bhi, upload se
pehle chotay/halkay images (under 1-2 MB original) use karna behtar hai.

## Kuch aur badlaao jo aap khud kar saktay hain

- Rang/design ke tokens: `css/style.css` ke shuru mein `:root` aur
  `[data-theme="light"]` variables (dono themes ke colors yahin hain).
- Animations kam/zyada karne ke liye: `css/style.css` mein `.reveal`,
  `@keyframes` sections dekhein.
- Colors currently: ink-black dark mode / cream light mode, gold accent,
  burgundy highlight — luxury watch-shop look.
