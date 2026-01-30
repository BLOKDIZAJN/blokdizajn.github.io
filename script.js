const translations = {
    sr: { hero_subtitle: "LIMITIRANA SERIJA", select_color: "BOJA:", select_size: "VELIČINA:", confirm_selection: "DALJE", ph_name: "Ime", ph_email: "Email", ph_phone: "Telefon" },
    en: { hero_subtitle: "LIMITED DROP", select_color: "COLOR:", select_size: "SIZE:", confirm_selection: "CONTINUE", ph_name: "Name", ph_email: "Email", ph_phone: "Phone" }
};

let allProducts = [];
let currentLang = 'sr';
let activeProduct = null;
let selectedColor = '';
let selectedSize = '';
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', fetchProducts);

async function fetchProducts() {
    const response = await fetch('products.txt');
    const text = await response.text();
    allProducts = text.split('\n').filter(l => l.trim()).map(line => {
        const p = line.split('|').map(x => x.trim());
        return { nSr:p[0], nEn:p[1], folder:p[2], price:p[3], colors:p[8], numImages:parseInt(p[9]) };
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
        card.innerHTML = `<img src="products/${p.folder}/${p.colors.split(',')[0].trim()}_0.png" style="width:100%">
                          <h3>${currentLang==='sr'?p.nSr:p.nEn}</h3>`;
        container.appendChild(card);
    });
}

function openModal(folder) {
    activeProduct = allProducts.find(p => p.folder === folder);
    selectedColor = activeProduct.colors.split(',')[0].trim();
    currentSlide = 0;
    document.getElementById('modal-title').textContent = currentLang==='sr'?activeProduct.nSr:activeProduct.nEn;
    updateModalImages();
    document.getElementById('product-modal').style.display = 'flex';
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
    const total = activeProduct.numImages;
    currentSlide = (currentSlide + dir + total) % total;
    document.getElementById('modal-image-track').style.transform = `translateX(-${currentSlide * 100}%)`;
}

function pickSize(s) {
    selectedSize = s;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b.textContent === s));
}

function closeModal() { document.getElementById('product-modal').style.display = 'none'; }