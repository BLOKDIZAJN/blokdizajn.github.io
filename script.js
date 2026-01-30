const translations = {
    sr: { hero_subtitle: "LIMITIRANA SERIJA // EDICIJA 01", view_more: "PRIKAŽI VIŠE", cat_all: "SVE", select_color: "BOJA:", select_size: "VELIČINA:", confirm_selection: "DALJE", order_title: "MANIFEST DOSTAVE", confirm: "POTVRDI NARUDŽBINU", ph_name: "Ime i Prezime", ph_email: "Email adresa", ph_phone: "Telefon" },
    en: { hero_subtitle: "LIMITED DROP // EDITION 01", view_more: "VIEW DETAILS", cat_all: "ALL UNITS", select_color: "COLOR:", select_size: "SIZE:", confirm_selection: "CONTINUE", order_title: "SHIPPING MANIFEST", confirm: "CONFIRM ORDER", ph_name: "Full Name", ph_email: "Email Address", ph_phone: "Phone Number" }
};

let allProducts = [];
let filteredProducts = [];
let currentLang = 'sr';
let activeProduct = null;
let selectedColor = '';
let selectedSize = '';
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', fetchProducts);

async function fetchProducts() {
    try {
        const response = await fetch('products.txt');
        const text = await response.text();
        allProducts = text.split('\n').filter(l => l.trim()).map(line => {
            const p = line.split('|').map(x => x.trim());
            return { 
                nSr: p[0], nEn: p[1], folder: p[2], price: p[3], 
                category: p[5].toLowerCase(), // Index [5] is where 'jdm' is found
                colors: p[8], numImages: parseInt(p[9]) 
            };
        });
        filteredProducts = allProducts;
        render();
    } catch (e) { console.error("Error loading products", e); }
}

function render() {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    filteredProducts.forEach(p => {
        const firstColor = p.colors.split(',')[0].trim().toLowerCase();
        const card = document.createElement('div');
        card.className = 'product-item';
        card.onclick = () => openModal(p.folder);
        card.innerHTML = `
            <div class="product-overlay"><span class="cta-text">${translations[currentLang].view_more}</span></div>
            <img src="products/${p.folder}/${firstColor}_0.png">
            <div class="product-info">
                <h3>${currentLang === 'sr' ? p.nSr : p.nEn}</h3>
                <p style="color:var(--brand-red); font-weight:800">${p.price}</p>
            </div>`;
        container.appendChild(card);
    });
}

function filterByCat(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (cat === 'all') {
        filteredProducts = allProducts;
    } else {
        // Replaces underscores in categories like 'eastern_bloc' to match 'eastern bloc' text
        filteredProducts = allProducts.filter(p => p.category === cat.replace('_', ' '));
    }
    render();
}

function setLanguage(l) {
    currentLang = l;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${l}`));
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[l][key]) el.textContent = translations[l][key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (translations[l][key]) el.placeholder = translations[l][key];
    });
    render();
}

function openModal(folder) {
    activeProduct = allProducts.find(p => p.folder === folder);
    selectedColor = activeProduct.colors.split(',')[0].trim().toLowerCase();
    selectedSize = '';
    currentSlide = 0;
    document.getElementById('modal-title').textContent = currentLang === 'sr' ? activeProduct.nSr : activeProduct.nEn;
    document.getElementById('modal-price').textContent = activeProduct.price;
    updateModalImages();
    updateColorDots();
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('product-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function updateColorDots() {
    const container = document.getElementById('color-dots');
    container.innerHTML = '';
    activeProduct.colors.split(',').forEach(c => {
        const color = c.trim().toLowerCase();
        const dot = document.createElement('div');
        dot.className = `color-dot ${color === selectedColor ? 'active' : ''}`;
        dot.style.backgroundColor = color === 'sand' ? '#c2b280' : (color === 'white' ? '#fff' : color);
        dot.onclick = (e) => { e.stopPropagation(); selectedColor = color; updateColorDots(); updateModalImages(); };
        container.appendChild(dot);
    });
}

function updateModalImages() {
    const track = document.getElementById('modal-image-track');
    track.innerHTML = '';
    for(let i=0; i<activeProduct.numImages; i++) {
        const img = document.createElement('img');
        img.src = `products/${activeProduct.folder}/${selectedColor}_${i}.png`;
        track.appendChild(img);
    }
    track.style.transform = `translateX(0)`;
}

function changeSlide(dir) {
    currentSlide = (currentSlide + dir + activeProduct.numImages) % activeProduct.numImages;
    document.getElementById('modal-image-track').style.transform = `translateX(-${currentSlide * 100}%)`;
}

function pickSize(s) {
    selectedSize = s;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b.textContent === s));
}

function openFinalForm() {
    if(!selectedSize) return alert(currentLang === 'sr' ? 'Izaberite veličinu' : 'Please select size');
    closeModal();
    const section = document.getElementById('order-section');
    section.style.display = 'block';
    document.getElementById('selected-product').value = `${activeProduct.nEn} [${selectedColor.toUpperCase()} / ${selectedSize}]`;
    section.scrollIntoView({ behavior: 'smooth' });
}

function closeModal() { 
    document.getElementById('product-modal').style.display = 'none'; 
    document.body.style.overflow = 'auto'; 
}