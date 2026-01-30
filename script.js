const translations = {
    sr: { 
        hero_subtitle: "LIMITIRANA SERIJA // EDICIJA 01", shop_now: "NAJNOVIJE", cat_all: "SVE", cat_jdm: "JDM", cat_german: "GERMAN", cat_life: "LIFESTYLE", 
        order_title: "PORUDŽBINA", confirm: "POTVRDI", tag_new: "NOVO", male: "MUŠKI", female: "ŽENSKI", uni: "UNISEX",
        hoodie: "DUKS", tshirt: "MAJICA", select_color: "BOJA:", select_size: "VELIČINA:", 
        confirm_selection: "DALJE", ph_name: "Ime i Prezime", ph_email: "Email adresa", ph_phone: "Telefon", load_error: "Greška."
    },
    en: { 
        hero_subtitle: "LIMITED DROP // EDITION 01", shop_now: "SHOP LATEST", cat_all: "ALL", cat_jdm: "JDM", cat_german: "GERMAN", cat_life: "LIFE", 
        order_title: "ORDER DETAILS", confirm: "CONFIRM", tag_new: "NEW", male: "MALE", female: "FEMALE", uni: "UNISEX",
        hoodie: "HOODIE", tshirt: "T-SHIRT", select_color: "COLOR:", select_size: "SIZE:", 
        confirm_selection: "CONTINUE", ph_name: "Full Name", ph_email: "Email address", ph_phone: "Phone Number", load_error: "Error."
    }
};

let allProducts = [];
let currentLang = 'sr';
let activeProduct = null;
let selectedColor = '';
let selectedSize = '';
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => { fetchProducts(); });

async function fetchProducts() {
    const res = await fetch('products.txt');
    const text = await res.text();
    allProducts = text.split('\n').filter(l => l.trim()).map(line => {
        const p = line.split('|').map(x => x.trim());
        return { nSr:p[0], nEn:p[1], folder:p[2], price:p[3], type:p[4], category:p[5], isNew:p[6], gender:p[7], colors:p[8], numImages:parseInt(p[9]) };
    });
    render();
}

function render() {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    allProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-item';
        card.onclick = () => openModal(p.folder);
        card.innerHTML = `<div class="img-container"><img src="products/${p.folder}/${p.colors.split(',')[0].trim()}_0.png"></div>
                          <div class="info"><h3>${currentLang==='sr'?p.nSr:p.nEn}</h3><p>${p.price}</p></div>`;
        container.appendChild(card);
    });
}

function openModal(folder) {
    activeProduct = allProducts.find(p => p.folder === folder);
    selectedColor = activeProduct.colors.split(',')[0].trim();
    selectedSize = '';
    currentSlide = 0;
    
    document.getElementById('modal-title').textContent = currentLang==='sr'?activeProduct.nSr:activeProduct.nEn;
    document.getElementById('modal-price').textContent = activeProduct.price;
    document.getElementById('modal-gender').textContent = translations[currentLang][activeProduct.gender];
    
    updateModalImages();
    updateColorDots();
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('product-modal').style.display = 'block';
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

function updateColorDots() {
    const container = document.getElementById('color-dots');
    container.innerHTML = '';
    activeProduct.colors.split(',').forEach(c => {
        const dot = document.createElement('div');
        dot.className = `color-dot ${c.trim() === selectedColor ? 'active' : ''}`;
        dot.style.background = c.trim();
        dot.onclick = () => { selectedColor = c.trim(); updateColorDots(); updateModalImages(); };
        container.appendChild(dot);
    });
}

function pickSize(s) {
    selectedSize = s;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b.textContent === s));
}

function openFinalForm() {
    if(!selectedSize) return alert('Select size');
    document.getElementById('product-modal').style.display = 'none';
    document.getElementById('order-section').style.display = 'block';
    document.getElementById('selected-product').value = `${activeProduct.nEn} (${selectedColor.toUpperCase()}) - SIZE: ${selectedSize}`;
    document.getElementById('order-section').scrollIntoView({behavior:'smooth'});
}

function closeModal() { document.getElementById('product-modal').style.display = 'none'; }
function setLanguage(l) { currentLang = l; render(); }