// العناصر الأساسية
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imageContainer = document.getElementById('imageContainer');
const originalImage = document.getElementById('originalImage');
const removeBtn = document.getElementById('removeBtn');
const loading = document.getElementById('loading');
const comparisonContainer = document.getElementById('comparisonContainer');
const beforeImage = document.getElementById('beforeImage');
const afterImage = document.getElementById('afterImage');
const downloadBtn = document.getElementById('downloadBtn');
const newImageBtn = document.getElementById('newImageBtn');
const themeToggle = document.getElementById('themeToggle');
const sampleImages = document.querySelectorAll('.sample-image');
const sliderHandle = document.getElementById('sliderHandle');
const comparisonSlider = document.getElementById('comparisonSlider');

let currentImageFile = null;
let processedImageData = null;

// التبديل بين الوضع الداكن والفاتح
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// رفع الملفات
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('يرجى اختيار ملف صورة صحيح', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('حجم الملف كبير جداً. يرجى اختيار صورة أصغر من 10 ميجابايت', 'error');
        return;
    }

    currentImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        imageContainer.style.display = 'block';
        comparisonContainer.style.display = 'none';
        showNotification('تم تحميل الصورة بنجاح!', 'success');
    };
    reader.readAsDataURL(file);
}

// الصور التجريبية
sampleImages.forEach(img => {
    img.addEventListener('click', () => {
        // محاكاة تحميل صورة تجريبية
        originalImage.src = img.src;
        imageContainer.style.display = 'block';
        comparisonContainer.style.display = 'none';
        
        // إنشاء ملف وهمي للصورة التجريبية
        fetch(img.src)
            .then(res => res.blob())
            .then(blob => {
                currentImageFile = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
                showNotification('تم تحميل الصورة التجريبية!', 'success');
            })
            .catch(() => {
                showNotification('حدث خطأ في تحميل الصورة التجريبية', 'error');
            });
    });
});

// إزالة الخلفية
removeBtn.addEventListener('click', async () => {
    if (!currentImageFile) return;

    // إظهار شاشة التحميل
    loading.style.display = 'block';
    removeBtn.disabled = true;
    imageContainer.style.display = 'none';

    try {
        // محاكاة عملية المعالجة بالذكاء الاصطناعي
        await processImageWithAI();
    } catch (error) {
        showNotification('حدث خطأ أثناء معالجة الصورة', 'error');
        loading.style.display = 'none';
        imageContainer.style.display = 'block';
        removeBtn.disabled = false;
    }
});

async function processImageWithAI() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // إنشاء صورة وهمية بدون خلفية
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // رسم الصورة الأصلية
                ctx.drawImage(img, 0, 0);
                
                // محاكاة إزالة الخلفية باستخدام تقنيات متقدمة
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // تطبيق خوارزمية محاكاة لإزالة الخلفية
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // خوارزمية محسنة لاكتشاف الخلفية
                    const brightness = (r + g + b) / 3;
                    const isBackground = brightness > 180 || 
                                       (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30);
                    
                    if (isBackground) {
                        data[i + 3] = 0; // شفافية كاملة
                    } else {
                        // تحسين حواف الكائن
                        data[i + 3] = Math.min(255, data[i + 3] * 1.1);
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                // تحويل إلى blob
                canvas.toBlob((blob) => {
                    processedImageData = blob;
                    const processedUrl = URL.createObjectURL(blob);
                    
                    // إظهار المقارنة
                    beforeImage.src = originalImage.src;
                    afterImage.src = processedUrl;
                    
                    loading.style.display = 'none';
                    comparisonContainer.style.display = 'block';
                    removeBtn.disabled = false;
                    
                    showNotification('تم إزالة الخلفية بنجاح!', 'success');
                    resolve();
                }, 'image/png');
            };
            
            img.src = originalImage.src;
        }, 3000); // محاكاة وقت المعالجة
    });
}

// صورة جديدة
newImageBtn.addEventListener('click', () => {
    resetApplication();
    showNotification('جاهز لصورة جديدة!', 'success');
});

function resetApplication() {
    imageContainer.style.display = 'none';
    comparisonContainer.style.display = 'none';
    loading.style.display = 'none';
    fileInput.value = '';
    currentImageFile = null;
    processedImageData = null;
    
    // إعادة تعيين شريط المقارنة
    sliderHandle.style.left = '50%';
    afterImage.style.clipPath = 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)';
}

// شريط المقارنة التفاعلي
let isResizing = false;

sliderHandle.addEventListener('mousedown', startResize);
document.addEventListener('mousemove', doResize);
document.addEventListener('mouseup', stopResize);

// دعم اللمس للأجهزة المحمولة
sliderHandle.addEventListener('touchstart', startResize);
document.addEventListener('touchmove', doResize);
document.addEventListener('touchend', stopResize);

function startResize(e) {
    isResizing = true;
    e.preventDefault();
}

function doResize(e) {
    if (!isResizing) return;
    
    const rect = comparisonSlider.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    sliderHandle.style.left = percentage + '%';
    afterImage.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
}

function stopResize() {
    isResizing = false;
}

// تحميل الصورة الناتجة
downloadBtn.addEventListener('click', () => {
    if (!processedImageData) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(processedImageData);
    link.download = `removed-background-${Date.now()}.png`;
    link.click();
    
    // تأثير بصري للتحميل
    const originalContent = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-check"></i> تم التحميل!';
    downloadBtn.style.background = 'var(--success)';
    downloadBtn.style.borderColor = 'var(--success)';
    
    setTimeout(() => {
        downloadBtn.innerHTML = originalContent;
        downloadBtn.style.background = '';
        downloadBtn.style.borderColor = '';
    }, 2000);
    
    showNotification('تم تحميل الصورة بنجاح!', 'success');
});

// نظام الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // إضافة الأنماط
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: '600',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // تحريك الإشعار للداخل
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // إزالة الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'var(--success)';
        case 'error': return 'var(--error)';
        case 'warning': return 'var(--warning)';
        default: return 'var(--primary)';
    }
}

// تهيئة التطبيق عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    // استرجاع تفضيلات المستخدم
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
    }
    
    // تأثيرات التحميل
    const elements = document.querySelectorAll('.feature-card, .sample-image');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    showNotification('مرحباً بك في Remove AI! 🎉', 'success');
});

// معالجة الأخطاء العامة
window.addEventListener('error', (e) => {
    console.error('خطأ في التطبيق:', e.error);
    showNotification('حدث خطأ غير متوقع', 'error');
});

// منع السحب والإفلات خارج منطقة الرفع
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});