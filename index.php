<?php
// index.php — Iraq World Cup 2026 Frame App by Haya Pharmacy
$pageTitle = 'العراق في كأس العالم 2026 | صيدلية حيا';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="أضف إطار كأس العالم 2026 العراقي لصورتك الشخصية - من صيدلية حيا">
    <meta name="theme-color" content="#015645">
    <title><?= $pageTitle ?></title>

    <!-- Open Graph -->
    <meta property="og:title" content="العراق في كأس العالم 2026 | صيدلية حيا">
    <meta property="og:description" content="أضف إطار المنتخب العراقي لصورتك وشاركها مع الجميع!">
    <meta property="og:type" content="website">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <!-- App CSS -->
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- Animated flag background -->
    <div class="flag-bg-container" aria-hidden="true">
        <div class="flag-float flag-float-1">
            <div class="flag-3d">
                <div class="flag-stripe-bg black"></div>
                <div class="flag-stripe-bg white"><span class="flag-text-bg">الله أكبر</span></div>
                <div class="flag-stripe-bg red"></div>
            </div>
        </div>
        <div class="flag-float flag-float-2">
            <div class="flag-3d">
                <div class="flag-stripe-bg black"></div>
                <div class="flag-stripe-bg white"><span class="flag-text-bg">الله أكبر</span></div>
                <div class="flag-stripe-bg red"></div>
            </div>
        </div>
        <div class="flag-float flag-float-3">
            <div class="flag-3d">
                <div class="flag-stripe-bg black"></div>
                <div class="flag-stripe-bg white"><span class="flag-text-bg">الله أكبر</span></div>
                <div class="flag-stripe-bg red"></div>
            </div>
        </div>
    </div>

    <!-- ── Header ── -->
    <header class="haya-top-bar" id="siteHeader">
        <div class="haya-top-container">
            <!-- Left Group: Hamburger + Dropdown (Mobile only) -->
            <div class="header-left-group">
                <!-- Hamburger Menu Button -->
                <button class="hamburger-btn" id="hamburgerBtn" aria-label="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <!-- Dropdown Menu -->
                <div class="header-dropdown" id="headerDropdown">
                    <div class="dropdown-inner">
                        <p class="dropdown-title">تابعنا على</p>
                        <div class="dropdown-socials">
                            <a href="https://wa.me/" target="_blank" class="dropdown-social-link whatsapp-link" aria-label="WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                                <span>WhatsApp</span>
                            </a>
                            <a href="https://instagram.com/" target="_blank" class="dropdown-social-link instagram-link" aria-label="Instagram">
                                <i class="fab fa-instagram"></i>
                                <span>Instagram</span>
                            </a>
                            <a href="https://facebook.com/" target="_blank" class="dropdown-social-link facebook-link" aria-label="Facebook">
                                <i class="fab fa-facebook-f"></i>
                                <span>Facebook</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Logo (Left on Desktop, Center on Mobile) -->
            <div class="haya-main-logo">
                <img src="haya-logo.png" alt="Haya Logo">
            </div>

            <!-- Iraq Mini Flag (Right side) -->
            <div class="header-iraq-flag">
                <div class="header-flag-mini">
                    <div class="header-flag-stripe black"></div>
                    <div class="header-flag-stripe white"><span>الله أكبر</span></div>
                    <div class="header-flag-stripe red"></div>
                </div>
            </div>
        </div>
    </header>

    <!-- ── Hero / Title ── -->
    <section class="hero-title-section">
        <div class="hero-title-inner">
            <div class="hero-stars-row">
                <i class="fas fa-star"></i>
                <h1 class="hero-main-title">Support <span class="iraq-word">Iraq</span> in the World Cup</h1>
                <i class="fas fa-star"></i>
            </div>
            <p class="hero-sub-line">
                <i class="fas fa-chevron-left"></i>
                صورة بروفايل لدعم منتخب العراق
                <i class="fas fa-chevron-right"></i>
            </p>
        </div>
    </section>

    <!-- ── Main App Container ── -->
    <main class="app-main">

        <!-- Preview Canvas Area (shown after upload) -->
        <section class="preview-canvas-section hidden" id="stepPreview">
            <div class="canvas-wrapper">
                <div class="canvas-container" id="canvasContainer">
                    <canvas id="previewCanvas"></canvas>
                    <div class="canvas-loading hidden" id="canvasLoading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>جاري المعالجة...</span>
                    </div>
                </div>
            </div>

            <!-- Frame Toggle Options -->
            <div class="frame-options-row">
                <div class="frame-options-label-text">شكل الإطار:</div>
                <div class="frame-toggle-group">
                    <button class="frame-toggle active" id="btnCircle" data-shape="circle">
                        <i class="fas fa-circle"></i>
                        دائري
                    </button>
                    <button class="frame-toggle" id="btnSquare" data-shape="square">
                        <i class="fas fa-square"></i>
                        مربع
                    </button>
                </div>
            </div>

            <!-- Zoom Control -->
            <div class="zoom-row">
                <div class="zoom-label-text">حجم الصورة (اسحب للتحريك والزوم):</div>
                <div class="zoom-slider-wrap">
                    <i class="fas fa-search-minus"></i>
                    <input type="range" id="zoomSlider" min="1" max="4" step="0.02" value="1" class="zoom-slider">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>

            <!-- New Photo Button inside preview -->
            <button class="new-photo-btn" id="btnReset">
                <i class="fas fa-redo"></i>
                صورة جديدة
            </button>
        </section>

        <!-- Step 1: Upload / Camera (hero style) -->
        <section class="step-section" id="stepUpload">
            <!-- Big Iraq flag visual area -->
            <div class="flag-hero-area">
                <div class="big-flag-circle">
                    <div class="big-flag-inner">
                        <div class="big-flag-stripe black"></div>
                        <div class="big-flag-stripe white">
                            <span class="allah-akbar-text">الله أكبر</span>
                        </div>
                        <div class="big-flag-stripe red"></div>
                    </div>
                    <!-- Stars on the flag -->
                    <div class="flag-stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <!-- IRAQ badge -->
                    <div class="iraq-badge-top">العراق</div>
                </div>
            </div>
        </section>

        <!-- Upload + Camera Buttons (always visible) -->
        <div class="upload-row-btns" id="uploadRowBtns">
            <!-- Upload Image -->
            <label for="fileGallery" class="upload-card-btn" id="btnGallery">
                <div class="upload-card-icon green-icon">
                    <i class="fas fa-upload"></i>
                </div>
                <div class="upload-card-text">
                    <strong>Upload Image</strong>
                    <span>Choose from your gallery</span>
                </div>
                <input type="file" id="fileGallery" accept="image/*" class="file-input-hidden">
            </label>

            <!-- Take Photo -->
            <label for="fileCamera" class="upload-card-btn" id="btnCamera">
                <div class="upload-card-icon red-icon">
                    <i class="fas fa-camera"></i>
                </div>
                <div class="upload-card-text">
                    <strong>Take Photo</strong>
                    <span>Use your camera</span>
                </div>
                <input type="file" id="fileCamera" accept="image/*" capture="user" class="file-input-hidden">
            </label>
        </div>

        <!-- Apply Frame Row -->
        <div class="apply-frame-row" id="applyFrameRow">
            <div class="apply-frame-left">
                <div class="apply-frame-icon">
                    <i class="fas fa-magic"></i>
                </div>
                <div class="apply-frame-text">
                    <strong>Apply Frame</strong>
                    <span>Add the Iraq support frame</span>
                </div>
            </div>
            <i class="fas fa-chevron-right apply-frame-arrow"></i>
        </div>

        <!-- Download Photo Button -->
        <button class="download-photo-btn" id="btnDownload">
            <i class="fas fa-download"></i>
            <div class="download-btn-text">
                <strong>Download Photo</strong>
                <span>Save your support profile picture</span>
            </div>
        </button>

        <!-- Share Section (inside preview) -->
        <div class="share-section hidden" id="shareSection">
            <p class="share-label">شارك مع أصدقائك:</p>
            <div class="share-btns">
                <button class="share-btn share-btn--whatsapp" id="btnShareWhatsapp">
                    <i class="fab fa-whatsapp"></i>
                    واتساب
                </button>
                <button class="share-btn share-btn--generic" id="btnShare">
                    <i class="fas fa-share-alt"></i>
                    مشاركة
                </button>
            </div>
        </div>

        <!-- How to Use Section -->
        <section class="how-section">
            <div class="how-inner">
                <h2 class="how-title">كيف تستخدم التطبيق؟</h2>
                <div class="how-steps">
                    <div class="how-step">
                        <div class="how-icon" style="background: var(--haya-green);">
                            <i class="fas fa-upload"></i>
                        </div>
                        <p>ارفع صورتك أو التقط صورة جديدة</p>
                    </div>
                    <div class="how-arrow"><i class="fas fa-chevron-left"></i></div>
                    <div class="how-step">
                        <div class="how-icon" style="background: var(--iraq-red);">
                            <i class="fas fa-magic"></i>
                        </div>
                        <p>يُضاف الإطار تلقائياً على صورتك</p>
                    </div>
                    <div class="how-arrow"><i class="fas fa-chevron-left"></i></div>
                    <div class="how-step">
                        <div class="how-icon" style="background: var(--haya-gold);">
                            <i class="fas fa-share-alt"></i>
                        </div>
                        <p>حمّل الصورة وشاركها مع الجميع!</p>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <!-- ── Footer ── -->
    <footer class="app-footer">
        <div class="footer-inner">
            <img src="haya-logo.png" alt="صيدلية حيا" class="footer-logo">
            <div class="footer-text">
                <p class="footer-tagline">شريكك لحياة صحية</p>
                <p class="footer-copy">© 2026 صيدلية حيا — جميع الحقوق محفوظة</p>
            </div>
            <div class="footer-socials">
                <i class="fab fa-whatsapp"></i>
                <i class="fab fa-instagram"></i>
                <i class="fab fa-facebook-f"></i>
            </div>
        </div>
        <div class="footer-bottom-bar">
            <i class="fas fa-globe"></i>
            <span>Perfect for WhatsApp, Instagram, and Facebook profile pictures</span>
        </div>
    </footer>

    <!-- ── Camera Capture Modal ── -->
    <div class="camera-modal hidden" id="cameraModal">
        <div class="camera-modal-content">
            <div class="camera-modal-header">
                <h3 class="camera-modal-title">التقط صورتك</h3>
                <button class="camera-modal-close" id="btnCloseCameraModal">&times;</button>
            </div>
            <div class="video-container">
                <video id="cameraVideo" autoplay playsinline muted></video>
                <div class="video-overlay-frame"></div>
            </div>
            <div class="camera-modal-footer">
                <button class="capture-btn" id="btnCapturePhoto">
                    <i class="fas fa-camera"></i>
                    التقاط الصورة
                </button>
            </div>
        </div>
    </div>

    <!-- ── Toast Notification ── -->
    <div class="toast" id="toast">
        <i class="fas fa-check-circle"></i>
        <span id="toastMsg">تم بنجاح!</span>
    </div>

    <!-- App JS -->
    <script src="app.js"></script>
</body>
</html>
