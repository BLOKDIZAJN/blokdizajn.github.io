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
        confirm_selection: "CONTINUE", ph_name: "Full Name", ph_email: "Email address", ph_phone: "Phone Number", ph_address: "Address & City", ph_zip: "ZIP Code",
        load_error: "Error loading products.", loading: "Loading..."
    }
};

let allProducts = [];
let currentLang = localStorage.getItem('blok_lang') || 'sr';
let activeCategory = 'all';
let activeProduct = null;
let selectedColor = '';
let selectedSize = '';
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    fetchProducts();
});

async function fetchProducts() {
    try {
        const response = await fetch('products.txt');
        const text = await response.text();
        allProducts = text.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const parts = line.split('|').map(p => p.trim());
                return {
                    nSr: parts[0], nEn: parts[1], folder: parts[2], price: parts[3],
                    type: parts[4], category: parts[5], isNew: parts[6] === 'true',
                    gender: parts[7], colors: parts[8], numImages: parseInt(parts[9])
                };
            });
        render();
    } catch (e) {
        console.error(e);
        document.getElementById('product-container').innerHTML = `<p>${translations[currentLang].load_error}</p>`;
    }
}

function render() {
    updateUIContent();
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    const filtered = activeCategory === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === activeCategory);

    filtered.forEach(p => {
        const firstColor = p.colors.split(',')[0].trim().toLowerCase();
        const card = document.createElement('div');
        card.className = 'product-item';
        card.onclick = () => openModal(p.folder);
        
        card.innerHTML = `
            <div class="img-container">
                <img src="products/${p.folder}/${firstColor}_0.png" alt="${p.nEn}" onerror="this.src='logo.png'">
            </div>
            <div class="product-info">
                <span class="modal-badge">${translations[currentLang][p.gender] || p.gender}</span>
                <h3>${currentLang === 'sr' ? p.nSr : p.nEn}</h3>
                <p class="price">${p.price}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function openModal(folder) {
    activeProduct = allProducts.find(p => p.folder === folder);
    selectedColor = activeProduct.colors.split(',')[0].trim().toLowerCase();
    selectedSize = ''; 
    currentSlide = 0;

    const modal = document.getElementById('product-modal');
    document.getElementById('modal-title').textContent = currentLang === 'sr' ? activeProduct.nSr : activeProduct.nEn;
    document.getElementById('modal-price').textContent = activeProduct.price;
    document.getElementById('modal-gender').textContent = translations[currentLang][activeProduct.gender] || activeProduct.gender;

    // Reset Size UI
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));

    updateModalImages();
    updateColorDots();
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function updateModalImages() {
    const track = document.getElementById('modal-image-track');
    track.innerHTML = '';
    for (let i = 0; i < activeProduct.numImages; i++) {
        const img = document.createElement('img');
        img.src = `products/${activeProduct.folder}/${selectedColor}_${i}.png`;
        img.onerror = () => img.style.display = 'none';
        track.appendChild(img);
    }
    currentSlide = 0;
    track.style.transform = `translateX(0)`;
}

function updateColorDots() {
    const container = document.getElementById('color-dots');
    container.innerHTML = '';
    const colors = activeProduct.colors.split(',');
    colors.forEach(c => {
        const color = c.trim().toLowerCase();
        const dot = document.createElement('div');
        dot.className = `color-dot ${color === selectedColor ? 'active' : ''}`;
        dot.style.backgroundColor = color === 'white' ? '#fff' : (color === 'sand' ? '#c2b280' : color);
        dot.onclick = (e) => {
            e.stopPropagation();
            selectedColor = color;
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            updateModalImages();
        };
        container.appendChild(dot);
    });
}

function pickSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === size);
    });
}

function changeSlide(dir) {
    const track = document.getElementById('modal-image-track');
    currentSlide = (currentSlide + dir + activeProduct.numImages) % activeProduct.numImages;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function openFinalForm() {
    if (!selectedSize) {
        alert(currentLang === 'sr' ? 'Molimo izaberite veličinu.' : 'Please select a size.');
        return;
    }
    closeModal();
    const section = document.getElementById('order-section');
    section.style.display = 'block';
    document.getElementById('selected-product').value = `${activeProduct.nEn} - ${selectedColor.toUpperCase()} [${selectedSize}]`;
    section.scrollIntoView({ behavior: 'smooth' });
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function setLanguage(l) {
    currentLang = l;
    localStorage.setItem('blok_lang', l);
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${l}`));
    render();
}

function updateUIContent() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.textContent = translations[currentLang][key];
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (translations[currentLang][key]) el.placeholder = translations[currentLang][key];
    });
}

function filterProducts(cat, btn) {
    activeCategory = cat;
    document.querySelectorAll('.cat-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
}

function resetPage() {
    activeCategory = 'all';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
}