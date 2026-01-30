const translations = {
    sr: { 
        hero_subtitle: "LIMITIRANA SERIJA // EDICIJA 01", shop_now: "NAJNOVIJE", cat_all: "SVE", cat_jdm: "JDM", cat_german: "GERMAN", cat_life: "LIFESTYLE", 
        order_title: "PORUDŽBINA", confirm: "POTVRDI", tag_new: "NOVO", tag_male: "MUŠKI", tag_female: "ŽENSKI", tag_uni: "UNISEX",
        hoodie: "DUKS", tshirt: "MAJICA", crewneck: "DUKS BEZ KAPULJAČE", select_color: "BOJA:", select_size: "VELIČINA:", 
        confirm_selection: "DALJE", ph_name: "Ime i Prezime", ph_email: "Email adresa", ph_phone: "Telefon", ph_address: "Adresa i Grad", ph_zip: "Poštanski broj",
        load_error: "Greška pri učitavanju proizvoda.", loading: "Učitavanje..."
    },
    en: { 
        hero_subtitle: "LIMITED DROP // EDITION 01", shop_now: "SHOP LATEST", cat_all: "ALL", cat_jdm: "JDM", cat_german: "GERMAN", cat_life: "LIFE", 
        order_title: "ORDER DETAILS", confirm: "CONFIRM", tag_new: "NEW", tag_male: "MALE", tag_female: "FEMALE", tag_uni: "UNISEX",
        hoodie: "HOODIE", tshirt: "T-SHIRT", crewneck: "CREWNECK", select_color: "COLOR:", select_size: "SIZE:", 
        confirm_selection: "CONTINUE", ph_name: "Full Name", ph_email: "Email Address", ph_phone: "Phone Number", ph_address: "Address & City", ph_zip: "Zip Code",
        load_error: "Error loading products.", loading: "Loading..."
    }
};

const colorMap = {
    black: "#1a1a1a", white: "#ffffff", sand: "#C2B280", navy: "#000080", 
    grey: "#808080", gray: "#808080", pink: "#ff69b4", blue: "#007bff",
    yellow: "#ffd700", brown: "#8b4513", red: "#ff3333", green: "#28a745"
};

let currentLang = localStorage.getItem('miste_lang') || 'sr';
let allProducts = [], activeProduct = null, selectedColor = '', selectedSize = '', currentSlide = 0, activeCategory = 'all';

async function init() {
    updateLangUI(); 
    const container = document.getElementById('product-container');
    container.innerHTML = `<div class="error-box"><p>${translations[currentLang].loading}</p></div>`;

    try {
        const res = await fetch('products.txt');
        const data = await res.text();
        // Parsing logic updated for 10 fields per line
        allProducts = data.trim().split('\n').map(line => {
            const [nSr, nEn, fld, prc, type, cat, isN, gen, clrs, numImg] = line.split('|');
            return { 
                nSr, nEn, folder: fld.trim(), price: prc.trim(), type: type.trim(), 
                cat: cat.trim(), isNew: isN.trim()==='true', gender: gen.trim().toLowerCase(), 
                colors: clrs.trim(), numImages: parseInt(numImg.trim()) 
            };
        });
        render();
    } catch(e) { showError(); }
}

function getGenderData(genderCode) {
    if(genderCode === 'male') return { class: 'badge-male', langKey: 'tag_male' };
    if(genderCode === 'female') return { class: 'badge-female', langKey: 'tag_female' };
    return { class: 'badge-uni', langKey: 'tag_uni' };
}

function render() {
    const container = document.getElementById('product-container');
    container.innerHTML = allProducts.map(p => {
        const isVisible = (activeCategory === 'all' || p.cat === activeCategory);
        if(!isVisible) return '';

        const name = currentLang === 'sr' ? p.nSr : p.nEn;
        const firstCol = p.colors.split(',')[0].trim().toLowerCase();
        const gender = getGenderData(p.gender);

        return `
            <div class="product-item">
                <div class="badge-container">
                    ${p.isNew ? `<div class="badge badge-new">${translations[currentLang].tag_new}</div>` : ''}
                    <div class="badge ${gender.class}">${translations[currentLang][gender.langKey]}</div>
                </div>
                <div class="img-container">
                    <img src="products/${p.folder}/${firstCol}_0.png" onerror="this.src='logo_nobg_upscaled.png'">
                </div>
                <span class="type-label">${translations[currentLang][p.type]}</span>
                <h3>${name}</h3>
                <p class="price">${p.price}</p>
                <button class="btn-submit" onclick="openModal('${p.folder}')">${currentLang==='sr'?'POGLEDAJ':'VIEW'}</button>
            </div>`;
    }).join('');
    updateUIContent();
    syncCategoryButtons();
}

function openModal(folder) {
    activeProduct = allProducts.find(p => p.folder === folder);
    selectedColor = activeProduct.colors.split(',')[0].trim().toLowerCase();
    selectedSize = '';
    currentSlide = 0;

    document.getElementById('modal-title').textContent = currentLang==='sr'?activeProduct.nSr:activeProduct.nEn;
    document.getElementById('modal-price').textContent = activeProduct.price;
    document.getElementById('modal-gender').textContent = translations[currentLang][getGenderData(activeProduct.gender).langKey];
    
    // Generate multi-image track
    updateModalImages();

    const dots = document.getElementById('color-dots');
    dots.innerHTML = activeProduct.colors.split(',').map(col => {
        const cleanCol = col.trim().toLowerCase();
        const hex = colorMap[cleanCol] || "#ccc";
        return `<div class="color-dot ${cleanCol === selectedColor ? 'active' : ''}" style="background:${hex}" onclick="selectColor('${cleanCol}', this)"></div>`;
    }).join('');
    
    document.getElementById('product-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function updateModalImages() {
    const track = document.getElementById('modal-image-track');
    track.innerHTML = '';
    for(let i=0; i < activeProduct.numImages; i++) {
        const img = document.createElement('img');
        img.src = `products/${activeProduct.folder}/${selectedColor}_${i}.png`;
        img.onerror = function() { this.src='logo_nobg_upscaled.png'; };
        track.appendChild(img);
    }
    updateSlide();
}

function selectColor(color, el) {
    selectedColor = color.toLowerCase();
    if(el) { document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active')); el.classList.add('active'); }
    updateModalImages();
}

function changeSlide(d) {
    currentSlide = (currentSlide + d + activeProduct.numImages) % activeProduct.numImages;
    updateSlide();
}

function updateSlide() { 
    document.getElementById('modal-image-track').style.transform = `translateX(-${currentSlide * 100}%)`; 
}

// Inherited Functions from your structure
function filterProducts(cat, el) {
    activeCategory = cat;
    render();
}

function syncCategoryButtons() {
    document.querySelectorAll('.cat-card').forEach(btn => {
        const btnCat = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        btn.classList.toggle('active', btnCat === activeCategory);
    });
}

function setLanguage(l) {
    currentLang = l;
    localStorage.setItem('miste_lang', l);
    updateLangUI();
    render();
}

function updateLangUI() {
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${currentLang}`));
}

function updateUIContent() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[currentLang][key]) el.textContent = translations[currentLang][key];
    });
}

function openFinalForm() {
    if(!selectedSize) return alert(currentLang==='sr'?'Izaberi veličinu':'Select size');
    closeModal();
    const section = document.getElementById('order-section');
    section.style.display = 'block';
    document.getElementById('selected-product').value = `${activeProduct.nEn} [${selectedColor.toUpperCase()} / ${selectedSize}]`;
    window.scrollTo({ top: section.offsetTop - 100, behavior: 'smooth' });
}

function closeModal() { document.getElementById('product-modal').style.display = 'none'; document.body.style.overflow = 'auto'; }
function showError() { document.getElementById('product-container').innerHTML = `<div class="error-box"><p>${translations[currentLang].load_error}</p></div>`; }
function resetPage() { window.scrollTo({top:0, behavior:'smooth'}); }

window.onload = init;