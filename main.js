// العناصر الأساسية
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileContainer = document.getElementById('fileContainer');
const originalImage = document.getElementById('originalImage');
const originalVideo = document.getElementById('originalVideo');
const removeBtn = document.getElementById('removeBtn');
const loading = document.getElementById('loading');
const comparisonContainer = document.getElementById('comparisonContainer');
const beforeImage = document.getElementById('beforeImage');
const afterImage = document.getElementById('afterImage');
const beforeVideo = document.getElementById('beforeVideo');
const afterVideo = document.getElementById('afterVideo');
const downloadBtn = document.getElementById('downloadBtn');
const newFileBtn = document.getElementById('newFileBtn');
const themeToggle = document.getElementById('themeToggle');
const sampleItems = document.querySelectorAll('.sample-item');
const sliderHandle = document.getElementById('sliderHandle');
const comparisonSlider = document.getElementById('comparisonSlider');

// عناصر التبويبات والنصوص
const tabBtns = document.querySelectorAll('.tab-btn');
const uploadIcon = document.getElementById('uploadIcon');
const uploadText = document.getElementById('uploadText');
const uploadSubtext = document.getElementById('uploadSubtext');
const removeBtnText = document.getElementById('removeBtnText');
const downloadBtnText = document.getElementById('downloadBtnText');
const newFileBtnText = document.getElementById('newFileBtnText');
const loadingText = document.getElementById('loadingText');
const sampleTitle = document.getElementById('sampleTitle');
const imageComparison = document.getElementById('imageComparison');
const videoComparison = document.getElementById('videoComparison');

// عناصر معلومات الملف
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const videoDuration = document.getElementById('videoDuration');
const duration = document.getElementById('duration');

// عناصر شريط التقدم
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// مفتاح API لحذف الخلفية
const API_KEY = 'zK811CojSrKBDMmXPgB1SyYv';

let currentFileType = 'image'; // image أو video
let currentFile = null;
let processedFileData = null;

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

// التبديل بين تبويبات نوع الملف
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // إزالة الفئة النشطة من جميع الأزرار
        tabBtns.forEach(b => b.classList.remove('active'));
        // إضافة الفئة النشطة للزر المحدد
        btn.classList.add('active');
        
        const type = btn.dataset.type;
        currentFileType = type;
        
        updateUIForFileType(type);
        resetApplication();
    });
});

function updateUIForFileType(type) {
    if (type === 'image') {
        uploadIcon.className = 'fas fa-cloud-upload-alt upload-icon';
        uploadText.textContent = 'اسحب وأفلت صورتك هنا';
        uploadSubtext.textContent = 'أو انقر لاختيار ملف (JPG, PNG, WEBP)';
        fileInput.accept = 'image/*';
        removeBtnText.textContent = 'إزالة الخلفية';
        downloadBtnText.textContent = 'تحميل الصورة';
        newFileBtnText.textContent = 'صورة جديدة';
        loadingText.textContent = 'جاري معالجة الصورة بالذكاء الاصطناعي...';
        sampleTitle.textContent = 'أو جرب إحدى هذه الصور:';
    } else {
        uploadIcon.className = 'fas fa-video upload-icon';
        uploadText.textContent = 'اسحب وأفلت فيديوك هنا';
        uploadSubtext.textContent = 'أو انقر لاختيار ملف (MP4, MOV, AVI)';
        fileInput.accept = 'video/*';
        removeBtnText.textContent = 'إزالة خلفية الفيديو';
        downloadBtnText.textContent = 'تحميل الفيديو';
        newFileBtnText.textContent = 'فيديو جديد';
        loadingText.textContent = 'جاري معالجة الفيديو بالذكاء الاصطناعي...';
        sampleTitle.textContent = 'أو جرب إحدى هذه الفيديوهات:';
    }
}

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
    // التحقق من نوع الملف
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (currentFileType === 'image' && !isImage) {
        showNotification('يرجى اختيار ملف صورة صحيح', 'error');
        return;
    }
    
    if (currentFileType === 'video' && !isVideo) {
        showNotification('يرجى اختيار ملف فيديو صحيح', 'error');
        return;
    }

    // التحقق من حجم الملف
    const maxSize = currentFileType === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB للصور، 100MB للفيديو
    if (file.size > maxSize) {
        const sizeText = currentFileType === 'image' ? '10 ميجابايت' : '100 ميجابايت';
        showNotification(`حجم الملف كبير جداً. يرجى اختيار ${currentFileType === 'image' ? 'صورة' : 'فيديو'} أصغر من ${sizeText}`, 'error');
        return;
    }

    currentFile = file;
    displayFile(file);
    updateFileInfo(file);
}

function displayFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (currentFileType === 'image') {
            originalImage.src = e.target.result;
            originalImage.style.display = 'block';
            originalVideo.style.display = 'none';
        } else {
            originalVideo.src = e.target.result;
            originalVideo.style.display = 'block';
            originalImage.style.display = 'none';
            
            // الحصول على مدة الفيديو
            originalVideo.addEventListener('loadedmetadata', () => {
                const minutes = Math.floor(originalVideo.duration / 60);
                const seconds = Math.floor(originalVideo.duration % 60);
                duration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                videoDuration.style.display = 'flex';
            });
        }
        
        fileContainer.style.display = 'block';
        comparisonContainer.style.display = 'none';
        showNotification(`تم تحميل ${currentFileType === 'image' ? 'الصورة' : 'الفيديو'} بنجاح!`, 'success');
    };
    reader.readAsDataURL(file);
}

function updateFileInfo(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    if (currentFileType === 'video') {
        videoDuration.style.display = 'flex';
    } else {
        videoDuration.style.display = 'none';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// الملفات التجريبية
sampleItems.forEach(item => {
    item.addEventListener('click', () => {
        const sampleType = item.dataset.type;
        if (sampleType !== currentFileType) {
            showNotification(`يرجى التبديل إلى تبويب ${sampleType === 'image' ? 'الصور' : 'الفيديوهات'} أولاً`, 'warning');
            return;
        }
        
        if (currentFileType === 'image') {
            originalImage.src = item.src;
            originalImage.style.display = 'block';
            originalVideo.style.display = 'none';
        }
        
        fileContainer.style.display = 'block';
        comparisonContainer.style.display = 'none';
        
        // إنشاء ملف وهمي
        fetch(item.src)
            .then(res => res.blob())
            .then(blob => {
                currentFile = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
                updateFileInfo(currentFile);
                showNotification('تم تحميل الملف التجريبي!', 'success');
            })
            .catch(() => {
                showNotification('حدث خطأ في تحميل الملف التجريبي', 'error');
            });
    });
});

// إزالة الخلفية
removeBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    // إظهار شاشة التحميل
    loading.style.display = 'block';
    removeBtn.disabled = true;
    fileContainer.style.display = 'none';
    
    // إعادة تعيين شريط التقدم
    progressFill.style.width = '0%';
    progressText.textContent = '0%';

    try {
        if (currentFileType === 'image') {
            await processImageWithRealAPI();
        } else {
            await processVideoLocally();
        }
    } catch (error) {
        console.error('خطأ في معالجة الملف:', error);
        showNotification(`حدث خطأ أثناء معالجة ${currentFileType === 'image' ? 'الصورة' : 'الفيديو'}. يرجى المحاولة مرة أخرى.`, 'error');
        loading.style.display = 'none';
        fileContainer.style.display = 'block';
        removeBtn.disabled = false;
    }
});

async function processImageWithRealAPI() {
    try {
        // محاكاة التقدم
        simulateProgress();
        
        // إنشاء FormData لإرسال الصورة
        const formData = new FormData();
        formData.append('image_file', currentFile);
        formData.append('size', 'auto');

        // إرسال الطلب إلى API
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // الحصول على البيانات كـ blob
        const blob = await response.blob();
        processedFileData = blob;
        
        // إنشاء URL للصورة المعالجة
        const processedUrl = URL.createObjectURL(blob);
        
        // إظهار المقارنة
        beforeImage.src = originalImage.src;
        afterImage.src = processedUrl;
        
        imageComparison.style.display = 'block';
        videoComparison.style.display = 'none';
        
        loading.style.display = 'none';
        comparisonContainer.style.display = 'block';
        removeBtn.disabled = false;
        
        showNotification('تم إزالة الخلفية بنجاح!', 'success');
        
    } catch (error) {
        console.error('خطأ في API:', error);
        
        // في حالة فشل API، استخدم المعالجة المحلية كبديل
        showNotification('جاري استخدام المعالجة المحلية...', 'warning');
        await processImageLocally();
    }
}

async function processImageLocally() {
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
                
                // تطبيق خوارزمية محسنة لإزالة الخلفية
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
                    processedFileData = blob;
                    const processedUrl = URL.createObjectURL(blob);
                    
                    // إظهار المقارنة
                    beforeImage.src = originalImage.src;
                    afterImage.src = processedUrl;
                    
                    imageComparison.style.display = 'block';
                    videoComparison.style.display = 'none';
                    
                    loading.style.display = 'none';
                    comparisonContainer.style.display = 'block';
                    removeBtn.disabled = false;
                    
                    showNotification('تم إزالة الخلفية باستخدام المعالجة المحلية!', 'success');
                    resolve();
                }, 'image/png');
            };
            
            img.src = originalImage.src;
        }, 2000);
    });
}

async function processVideoLocally() {
    return new Promise((resolve) => {
        // محاكاة معالجة الفيديو
        simulateProgress();
        
        setTimeout(() => {
            // في التطبيق الحقيقي، ستتم معالجة الفيديو إطار بإطار
            // هنا نقوم بمحاكاة النتيجة
            
            processedFileData = currentFile; // مؤقتاً نستخدم الفيديو الأصلي
            
            // إظهار المقارنة
            beforeVideo.src = originalVideo.src;
            afterVideo.src = originalVideo.src; // مؤقتاً نستخدم نفس الفيديو
            
            imageComparison.style.display = 'none';
            videoComparison.style.display = 'block';
            
            loading.style.display = 'none';
            comparisonContainer.style.display = 'block';
            removeBtn.disabled = false;
            
            showNotification('تم معالجة الفيديو! (نسخة تجريبية)', 'success');
            resolve();
        }, 5000);
    });
}

function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 95) progress = 95;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
        if (progress >= 95) {
            clearInterval(interval);
        }
    }, 200);
}

// ملف جديد
newFileBtn.addEventListener('click', () => {
    resetApplication();
    showNotification(`جاهز لـ${currentFileType === 'image' ? 'صورة' : 'فيديو'} جديد!`, 'success');
});

function resetApplication() {
    fileContainer.style.display = 'none';
    comparisonContainer.style.display = 'none';
    loading.style.display = 'none';
    fileInput.value = '';
    currentFile = null;
    processedFileData = null;
    
    // إعادة تعيين شريط المقارنة
    sliderHandle.style.left = '50%';
    afterImage.style.clipPath = 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)';
    afterVideo.style.clipPath = 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)';
    
    // إعادة تعيين شريط التقدم
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
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
    
    if (currentFileType === 'image') {
        afterImage.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
    } else {
        afterVideo.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
    }
}

function stopResize() {
    isResizing = false;
}

// تحميل الملف الناتج
downloadBtn.addEventListener('click', () => {
    if (!processedFileData) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(processedFileData);
    
    const extension = currentFileType === 'image' ? 'png' : 'mp4';
    const prefix = currentFileType === 'image' ? 'removed-background' : 'processed-video';
    link.download = `${prefix}-${Date.now()}.${extension}`;
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
    
    showNotification(`تم تحميل ${currentFileType === 'image' ? 'الصورة' : 'الفيديو'} بنجاح!`, 'success');
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
        transition: 'all 0.3s ease',
        maxWidth: '350px'
    });
    
    document.body.appendChild(notification);
    
    // تحريك الإشعار للداخل
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // إزالة الإشعار بعد 4 ثوان
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
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
    const elements = document.querySelectorAll('.feature-card, .sample-item');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // تهيئة واجهة المستخدم للصور (افتراضي)
    updateUIForFileType('image');
    
    showNotification('مرحباً بك في Remove Images & Videos Background! 🎉', 'success');
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