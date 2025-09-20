// Глобальные переменные
let products = [];
let cart = [];
let currentUser = null;
let filteredProducts = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Запуск MobileShop...');
    
    // Загружаем данные из localStorage
    loadFromStorage();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Загружаем примеры товаров если их нет
    if (products.length === 0) {
        loadSampleProducts();
    }
    
    // Обновляем интерфейс
    updateUI();
    
    console.log('✅ MobileShop готов к работе!');
});

// Загрузка примеров товаров
function loadSampleProducts() {
    products = [
        {
            id: 1,
            name: "Защитное стекло iPhone 15 Pro",
            description: "9H твердость, олеофобное покрытие, точная подгонка",
            price: 599,
            category: "screen-protectors",
            subcategory: "iphone",
            image: "🛡️",
            stock: 150,
            discount: 20,
            dateAdded: new Date()
        },
        {
            id: 2,
            name: "Беспроводная зарядка MagSafe",
            description: "Быстрая зарядка 15W, совместима с iPhone 12-15",
            price: 2499,
            category: "chargers",
            subcategory: "wireless",
            image: "🔋",
            stock: 75,
            discount: 0,
            dateAdded: new Date()
        },
        {
            id: 3,
            name: "Power Bank 20000mAh",
            description: "Портативное зарядное устройство с быстрой зарядкой",
            price: 1899,
            category: "batteries",
            subcategory: "powerbank",
            image: "🔌",
            stock: 45,
            discount: 15,
            dateAdded: new Date()
        },
        {
            id: 4,
            name: "Чехол iPhone 15 Pro Max",
            description: "Силиконовый чехол с защитой от ударов",
            price: 899,
            category: "cases",
            subcategory: "silicone",
            image: "📱",
            stock: 200,
            discount: 0,
            dateAdded: new Date()
        },
        {
            id: 5,
            name: "Кабель Lightning 2м",
            description: "Оригинальный кабель Apple с сертификацией MFi",
            price: 1299,
            category: "cables",
            subcategory: "lightning",
            image: "🔗",
            stock: 120,
            discount: 10,
            dateAdded: new Date()
        },
        {
            id: 6,
            name: "AirPods Pro 2",
            description: "Беспроводные наушники с активным шумоподавлением",
            price: 18999,
            category: "headphones",
            subcategory: "wireless",
            image: "🎧",
            stock: 25,
            discount: 5,
            dateAdded: new Date()
        }
    ];
    
    saveToStorage();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Каталог
    document.getElementById('catalogBtn').addEventListener('click', toggleCatalog);
    document.getElementById('closeCatalog').addEventListener('click', closeCatalog);
    document.getElementById('catalogOverlay').addEventListener('click', closeCatalog);
    
    // Ссылки в каталоге
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', handleCategoryClick);
    });
    
    // Поиск
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    // Фильтры
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('sortSelect').addEventListener('change', applySorting);
    
    // Корзина
    document.getElementById('cartBtn').addEventListener('click', openCartModal);
    document.getElementById('closeCartModal').addEventListener('click', closeModal);
    
    // Аккаунт
    document.getElementById('accountBtn').addEventListener('click', openAccountModal);
    document.getElementById('closeAccountModal').addEventListener('click', closeModal);
    document.querySelector('.save-btn').addEventListener('click', saveUserProfile);
    
    // Админ панель
    document.getElementById('adminBtn').addEventListener('click', openAdminModal);
    document.getElementById('closeAdminModal').addEventListener('click', closeModal);
    
    // Вкладки админ панели
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    // Загрузка файлов
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('fileUploadArea');
    
    fileInput.addEventListener('change', handleFileUpload);
    
    // Drag & Drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // Управление товарами
    document.getElementById('clearAllProducts').addEventListener('click', clearAllProducts);
    document.getElementById('exportProducts').addEventListener('click', exportToExcel);
    
    // Карточки категорий
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            filterByCategory(category);
        });
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
}

// === КАТАЛОГ ===
function toggleCatalog() {
    const sidebar = document.getElementById('catalogSidebar');
    const overlay = document.getElementById('catalogOverlay');
    
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCatalog() {
    const sidebar = document.getElementById('catalogSidebar');
    const overlay = document.getElementById('catalogOverlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function handleCategoryClick(e) {
    e.preventDefault();
    const category = this.dataset.category;
    const subcategory = this.dataset.subcategory;
    
    filterByCategory(category, subcategory);
    closeCatalog();
}

// === ПОИСК И ФИЛЬТРАЦИЯ ===
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    applyFilters();
    showNotification(`Найдено: ${filteredProducts.length} товаров`);
}

function filterByCategory(category, subcategory = null) {
    filteredProducts = products.filter(product => {
        const matchCategory = product.category === category;
        const matchSubcategory = !subcategory || product.subcategory === subcategory;
        return matchCategory && matchSubcategory;
    });
    
    applyFilters();
    showNotification(`Показаны товары: ${getCategoryName(category)}`);
}

function applyFilters() {
    let filtered = filteredProducts.length > 0 ? [...filteredProducts] : [...products];
    
    // Фильтр по категории
    const categoryFilter = document.getElementById('categoryFilter').value;
    if (categoryFilter) {
        filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Фильтр по цене
    const priceFilter = document.getElementById('priceFilter').value;
    if (priceFilter) {
        filtered = filtered.filter(product => {
            const price = product.price;
            switch(priceFilter) {
                case '0-500': return price <= 500;
                case '500-1500': return price > 500 && price <= 1500;
                case '1500-5000': return price > 1500 && price <= 5000;
                case '5000+': return price > 5000;
                default: return true;
            }
        });
    }
    
    renderProducts(filtered);
}

function applySorting() {
    const sortValue = document.getElementById('sortSelect').value;
    let sorted = [...(filteredProducts.length > 0 ? filteredProducts : products)];
    
    switch(sortValue) {
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
            sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        default:
            break;
    }
    
    renderProducts(sorted);
}

// === ОТОБРАЖЕНИЕ ТОВАРОВ ===
function renderProducts(productsToShow = products) {
    const grid = document.getElementById('productsGrid');
    
    if (productsToShow.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p style="color: #666; font-size: 1.2rem;">Товары не найдены</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const discountPrice = product.discount > 0 ? 
        Math.round(product.price * (1 - product.discount / 100)) : 
        product.price;
    
    const discountBadge = product.discount > 0 ? 
        `<div class="discount-badge">-${product.discount}%</div>` : '';
    
    const originalPrice = product.discount > 0 ? 
        `<span class="original-price">${product.price.toLocaleString()}₴</span>` : '';
    
    return `
        <div class="product-card">
            ${discountBadge}
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    ${originalPrice}
                    ${discountPrice.toLocaleString()}₴
                </div>
                <div class="product-stock">
                    <i class="fas fa-box"></i> В наличии: ${product.stock} шт.
                </div>
                <div class="product-actions">
                    <button class="btn-primary" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i>
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    `;
}

// === КОРЗИНА ===
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Товар не найден!', 'error');
        return;
    }
    
    if (product.stock <= 0) {
        showNotification('Товар закончился!', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += 1;
            showNotification('Количество товара увеличено!');
        } else {
            showNotification('Недостаточно товара на складе!', 'error');
            return;
        }
    } else {
        const discountPrice = product.discount > 0 ? 
            Math.round(product.price * (1 - product.discount / 100)) : 
            product.price;
            
        cart.push({
            id: product.id,
            name: product.name,
            price: discountPrice,
            image: product.image,
            quantity: 1,
            maxStock: product.stock
        });
        showNotification('Товар добавлен в корзину!');
    }
    
    updateCartCount();
    saveToStorage();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function openCartModal() {
    renderCart();
    document.getElementById('cartModal').classList.add('active');
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p style="color: #666;">Корзина пуста</p>
            </div>
        `;
        totalPrice.textContent = '0₴';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString()}₴</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
                <span style="margin: 0 10px; min-width: 20px; text-align: center;">${item.quantity}</span>
                <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="margin-left: 10px; background: #ff6b6b; color: white;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = `${total.toLocaleString()}₴`;
}

function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > item.maxStock) {
        showNotification('Недостаточно товара на складе!', 'error');
        return;
    }
    
    item.quantity = newQuantity;
    updateCartCount();
    renderCart();
    saveToStorage();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCart();
    saveToStorage();
    showNotification('Товар удален из корзины');
}

// === АККАУНТ ===
function openAccountModal() {
    if (currentUser) {
        document.getElementById('userName').value = currentUser.name || '';
        document.getElementById('userEmail').value = currentUser.email || '';
        document.getElementById('userPhone').value = currentUser.phone || '';
    }
    document.getElementById('accountModal').classList.add('active');
}

function saveUserProfile() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    
    if (!name) {
        showNotification('Введите имя!', 'error');
        return;
    }
    
    currentUser = { name, email, phone };
    saveToStorage();
    closeModal();
    showNotification('Профиль сохранен!');
}

// === АДМИН ПАНЕЛЬ ===
function openAdminModal() {
    updateStats();
    document.getElementById('adminModal').classList.add('active');
}

function switchTab(e) {
    const tabName = e.target.dataset.tab;
    
    // Убираем активный класс со всех кнопок и контента
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Добавляем активный класс к выбранной вкладке
    e.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// === ЗАГРУЗКА ФАЙЛОВ ===
function handleDragOver(e) {
    e.preventDefault();
    e.target.style.background = '#f8f9ff';
}

function handleFileDrop(e) {
    e.preventDefault();
    e.target.style.background = '';
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

function handleFileUpload(e) {
    const files = e.target.files;
    processFiles(files);
}

function processFiles(files) {
    if (files.length === 0) return;
    
    showUploadStatus('Обработка файлов...', 'info');
    
    Array.from(files).forEach(file => {
        console.log('📁 Обрабатываем файл:', file.name, 'Тип:', file.type);
        
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            processExcelFile(file);
        } else if (file.name.endsWith('.csv')) {
            processCSVFile(file);
        } else if (file.name.endsWith('.txt')) {
            processTXTFile(file);
        } else if (file.name.endsWith('.pdf')) {
            processPDFFile(file);
        } else {
            showUploadStatus(`Неподдерживаемый тип файла: ${file.name}`, 'error');
        }
    });
}

function processExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            console.log('📊 Данные из Excel:', jsonData);
            parseProductData(jsonData, 'Excel');
            
        } catch (error) {
            console.error('❌ Ошибка при чтении Excel:', error);
            showUploadStatus(`Ошибка при чтении Excel файла: ${error.message}`, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function processCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            const lines = csvData.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            const jsonData = [];
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index] || '';
                    });
                    jsonData.push(obj);
                }
            }
            
            console.log('📊 Данные из CSV:', jsonData);
            parseProductData(jsonData, 'CSV');
            
        } catch (error) {
            console.error('❌ Ошибка при чтении CSV:', error);
            showUploadStatus(`Ошибка при чтении CSV файла: ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
}

function processTXTFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const txtData = e.target.result;
            const lines = txtData.split('\n').filter(line => line.trim());
            
            const jsonData = [];
            lines.forEach((line, index) => {
                if (index === 0) return; // Пропускаем заголовок
                
                const parts = line.split('\t').map(p => p.trim());
                if (parts.length >= 3) {
                    jsonData.push({
                        'Название': parts[0] || '',
                        'Описание': parts[1] || '',
                        'Цена': parts[2] || '',
                        'Категория': parts[3] || '',
                        'Количество': parts[4] || '',
                        'Скидка': parts[5] || ''
                    });
                }
            });
            
            console.log('📊 Данные из TXT:', jsonData);
            parseProductData(jsonData, 'TXT');
            
        } catch (error) {
            console.error('❌ Ошибка при чтении TXT:', error);
            showUploadStatus(`Ошибка при чтении TXT файла: ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
}

function processPDFFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const typedarray = new Uint8Array(e.target.result);
            
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                console.log('📄 PDF загружен, страниц:', pdf.numPages);
                
                const pagePromises = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    pagePromises.push(
                        pdf.getPage(i).then(page => {
                            return page.getTextContent().then(textContent => {
                                return textContent.items.map(item => item.str).join(' ');
                            });
                        })
                    );
                }
                
                Promise.all(pagePromises).then(pages => {
                    const fullText = pages.join('\n');
                    console.log('📄 Текст из PDF извлечен');
                    parsePDFText(fullText);
                });
                
            }).catch(error => {
                console.error('❌ Ошибка при чтении PDF:', error);
                showUploadStatus(`Ошибка при чтении PDF файла: ${error.message}`, 'error');
            });
            
        } catch (error) {
            console.error('❌ Ошибка при обработке PDF:', error);
            showUploadStatus(`Ошибка при обработке PDF файла: ${error.message}`, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parsePDFText(text) {
    try {
        const lines = text.split('\n').filter(line => line.trim());
        const jsonData = [];
        
        lines.forEach(line => {
            // Пытаемся найти паттерны товаров в PDF
            const priceMatch = line.match(/(\d+[\.,]\d{2})/);
            const nameMatch = line.match(/([А-Яа-я\w\s]+)/);
            
            if (priceMatch && nameMatch && line.length > 10) {
                jsonData.push({
                    'Название': nameMatch[1].trim(),
                    'Цена': priceMatch[1].replace(',', '.'),
                    'Описание': 'Импорт из PDF',
                    'Категория': 'cases',
                    'Количество': Math.floor(Math.random() * 50) + 1
                });
            }
        });
        
        console.log('📊 Данные из PDF:', jsonData);
        parseProductData(jsonData, 'PDF');
        
    } catch (error) {
        console.error('❌ Ошибка при парсинге PDF:', error);
        showUploadStatus(`Ошибка при парсинге PDF: ${error.message}`, 'error');
    }
}

function parseProductData(data, fileType) {
    try {
        const newProducts = [];
        let skipped = 0;
        
        data.forEach((row, index) => {
            // Проверяем обязательные поля
            const name = row['Название'] || row['название'] || row['Name'] || row['name'] || '';
            const price = parseFloat(row['Цена'] || row['цена'] || row['Price'] || row['price'] || '0');
            
            if (!name.trim() || price <= 0) {
                skipped++;
                return;
            }
            
            const product = {
                id: Date.now() + index + Math.random(),
                name: name.trim(),
                description: (row['Описание'] || row['описание'] || row['Description'] || row['description'] || 'Импорт из ' + fileType).trim(),
                price: price,
                category: detectCategory(row['Категория'] || row['категория'] || row['Category'] || row['category'] || ''),
                subcategory: detectSubcategory(name),
                image: getProductEmoji(name),
                stock: parseInt(row['Количество'] || row['количество'] || row['Stock'] || row['stock'] || '0') || Math.floor(Math.random() * 100) + 1,
                discount: parseInt(row['Скидка'] || row['скидка'] || row['Discount'] || row['discount'] || '0') || 0,
                dateAdded: new Date()
            };
            
            newProducts.push(product);
        });
        
        if (newProducts.length > 0) {
            products.push(...newProducts);
            saveToStorage();
            updateUI();
            showUploadStatus(`✅ Загружено ${newProducts.length} товаров из ${fileType}!` + 
                           (skipped > 0 ? ` (пропущено ${skipped})` : ''), 'success');
        } else {
            showUploadStatus(`❌ Не удалось найти товары в ${fileType} файле`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Ошибка при парсинге данных:', error);
        showUploadStatus(`Ошибка при обработке данных: ${error.message}`, 'error');
    }
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function detectCategory(categoryName) {
    const name = categoryName.toLowerCase();
    
    if (name.includes('стекл') || name.includes('защит') || name.includes('screen')) return 'screen-protectors';
    if (name.includes('заряд') || name.includes('charger') || name.includes('зарядк')) return 'chargers';
    if (name.includes('батар') || name.includes('battery') || name.includes('power')) return 'batteries';
    if (name.includes('чехол') || name.includes('case') || name.includes('cover')) return 'cases';
    if (name.includes('кабел') || name.includes('cable') || name.includes('провод')) return 'cables';
    if (name.includes('наушник') || name.includes('headphone') || name.includes('airpods')) return 'headphones';
    
    return 'cases'; // По умолчанию
}

function detectSubcategory(productName) {
    const name = productName.toLowerCase();
    
    if (name.includes('iphone') || name.includes('айфон')) return 'iphone';
    if (name.includes('samsung') || name.includes('самсунг')) return 'samsung';
    if (name.includes('xiaomi') || name.includes('сяоми')) return 'xiaomi';
    if (name.includes('wireless') || name.includes('беспроводн')) return 'wireless';
    if (name.includes('fast') || name.includes('быстр')) return 'fast';
    if (name.includes('car') || name.includes('автомобил')) return 'car';
    if (name.includes('powerbank') || name.includes('павербанк')) return 'powerbank';
    if (name.includes('silicone') || name.includes('силикон')) return 'silicone';
    if (name.includes('leather') || name.includes('кож')) return 'leather';
    if (name.includes('lightning')) return 'lightning';
    if (name.includes('usb-c') || name.includes('type-c')) return 'usb-c';
    
    return 'universal';
}

function getProductEmoji(productName) {
    const name = productName.toLowerCase();
    
    if (name.includes('стекл') || name.includes('защит')) return '🛡️';
    if (name.includes('заряд') || name.includes('зарядк')) return '🔋';
    if (name.includes('батар') || name.includes('power')) return '🔌';
    if (name.includes('чехол') || name.includes('case')) return '📱';
    if (name.includes('кабел') || name.includes('cable')) return '🔗';
    if (name.includes('наушник') || name.includes('airpods')) return '🎧';
    
    return '📱';
}

function getCategoryName(category) {
    const names = {
        'screen-protectors': 'Защитные стекла',
        'chargers': 'Зарядки',
        'batteries': 'Батареи',
        'cases': 'Чехлы',
        'cables': 'Кабели',
        'headphones': 'Наушники'
    };
    return names[category] || category;
}

// === УПРАВЛЕНИЕ ТОВАРАМИ ===
function clearAllProducts() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ товары? Это действие нельзя отменить!')) {
        products = [];
        cart = [];
        filteredProducts = [];
        saveToStorage();
        updateUI();
        showNotification('Все товары удалены!');
    }
}

function exportToExcel() {
    if (products.length === 0) {
        showNotification('Нет товаров для экспорта!', 'error');
        return;
    }
    
    const exportData = products.map(product => ({
        'Название': product.name,
        'Описание': product.description,
        'Цена': product.price,
        'Категория': getCategoryName(product.category),
        'Количество': product.stock,
        'Скидка': product.discount,
        'Дата добавления': new Date(product.dateAdded).toLocaleDateString('ru-RU')
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Товары');
    
    XLSX.writeFile(wb, `MobileShop_товары_${new Date().toISOString().slice(0,10)}.xlsx`);
    showNotification('Товары экспортированы в Excel!');
}

// === СТАТИСТИКА ===
function updateStats() {
    const categories = [...new Set(products.map(p => p.category))];
    const averagePrice = products.length > 0 ? 
        Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('averagePrice').textContent = averagePrice.toLocaleString() + '₴';
    document.getElementById('totalValue').textContent = totalValue.toLocaleString() + '₴';
}

// === УВЕДОМЛЕНИЯ ===
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 4000;
        max-width: 300px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showUploadStatus(message, type) {
    const status = document.getElementById('uploadStatus');
    status.textContent = message;
    status.className = `upload-status ${type}`;
    
    if (type !== 'info') {
        setTimeout(() => {
            status.className = 'upload-status';
        }, 5000);
    }
}

// === МОДАЛЬНЫЕ ОКНА ===
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// === ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ===
function saveToStorage() {
    localStorage.setItem('mobileShop_products', JSON.stringify(products));
    localStorage.setItem('mobileShop_cart', JSON.stringify(cart));
    localStorage.setItem('mobileShop_user', JSON.stringify(currentUser));
}

function loadFromStorage() {
    const savedProducts = localStorage.getItem('mobileShop_products');
    const savedCart = localStorage.getItem('mobileShop_cart');
    const savedUser = localStorage.getItem('mobileShop_user');
    
    if (savedProducts) products = JSON.parse(savedProducts);
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedUser) currentUser = JSON.parse(savedUser);
}

function updateUI() {
    renderProducts();
    updateCartCount();
    updateStats();
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .discount-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff6b6b;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        z-index: 1;
    }
    
    .original-price {
        text-decoration: line-through;
        color: #999;
        font-size: 0.9rem;
        margin-right: 0.5rem;
    }
    
    .product-stock {
        color: #28a745;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
`;
document.head.appendChild(style);

console.log('📝 Script.js загружен и готов к работе!');
