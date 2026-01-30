const translations = {
    sr: { hero_subtitle: "LIMITIRANA SERIJA // EDICIJA 01", select_color: "BOJA:", select_size: "VELIČINA:", confirm_selection: "DALJE", ph_name: "Ime i Prezime", ph_email: "Email adresa", ph_phone: "Telefon" },
    en: { hero_subtitle: "LIMITED DROP // EDITION 01", select_color: "COLOR_SPEC:", select_size: "SIZE_INDEX:", confirm_selection: "CONTINUE", ph_name: "Full Name", ph_email: "Email address", ph_phone: "Phone Number" }
};

let allProducts = [];
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
            return { nSr:p[0], nEn:p[1], folder:p[2], price:p[3], gender:p[7], colors:p[8], numImages:parseInt(p[9]) };
        });
        render();
    } catch (e) { console.error("Load failed", e); }
}

function render() {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    allProducts.forEach(p => {
        const firstColor = p.colors.split(',')[0].trim().toLowerCase();
        const card = document.createElement('div');
        card.className = 'product-item';
        card.onclick = () => openModal(p.folder);
        card.innerHTML = `
            <img src="products/${p.folder}/${firstColor}_0.png" onerror="this.src='logo.png'">
            <div style="margin-top:15px">
                <h3 style="font-size:1rem">${currentLang==='sr' ? p.nSr : p.nEn}</h3>
                <p style="color:var(--brand-red); font-weight:800; margin-top:5px">${p.price}</p>
            </div>`;
        container.appendChild(card);
    });
}

function openModal(folder) {
    activeProduct = allProducts.find(p => p.folder === folder);
    selectedColor = activeProduct.colors.split(',')[0].trim().toLowerCase();
    selectedSize = '';
    currentSlide = 0;
    
    document.getElementById('modal-title').textContent = currentLang==='sr' ? activeProduct.nSr : activeProduct.nEn;
    document.getElementById('modal-price').textContent = activeProduct.price;
    document.getElementById('modal-gender').textContent = activeProduct.gender.toUpperCase();
    
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
        dot.style.backgroundColor = color === 'sand' ? '#c2b280' : color;
        dot.onclick = (e) => { 
            selectedColor = color; 
            updateColorDots(); 
            updateModalImages(); 
        };
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
    if(!selectedSize) return alert(currentLang==='sr' ? 'Izaberite veličinu' : 'Please select size');
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

function setLanguage(l) {
    currentLang = l;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${l}`));
    render();
}