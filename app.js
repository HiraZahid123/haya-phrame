/**
 * Haya Frame App — Iraq World Cup 2026
 * app.js — Image upload + programmatic frame drawing (guaranteed transparency)
 */

(function () {
    'use strict';

    /* ── DOM References ────────────────────────────────────── */
    const siteHeader       = document.getElementById('siteHeader');
    const fileGallery      = document.getElementById('fileGallery');
    const fileCamera       = document.getElementById('fileCamera');
    const stepUpload       = document.getElementById('stepUpload');
    const stepPreview      = document.getElementById('stepPreview');
    const previewCanvas    = document.getElementById('previewCanvas');
    const canvasLoading    = document.getElementById('canvasLoading');
    const btnDownload      = document.getElementById('btnDownload');
    const btnReset         = document.getElementById('btnReset');
    const btnCircle        = document.getElementById('btnCircle');
    const btnSquare        = document.getElementById('btnSquare');
    const btnShareWhatsapp = document.getElementById('btnShareWhatsapp');
    const btnShare         = document.getElementById('btnShare');
    const toast            = document.getElementById('toast');
    const toastMsg         = document.getElementById('toastMsg');
    const btnGallery       = document.getElementById('btnGallery');
    const btnCamera        = document.getElementById('btnCamera');
    const cameraModal      = document.getElementById('cameraModal');
    const btnCloseCameraModal = document.getElementById('btnCloseCameraModal');
    const cameraVideo      = document.getElementById('cameraVideo');
    const btnCapturePhoto  = document.getElementById('btnCapturePhoto');
    const shareSection     = document.getElementById('shareSection');
    const applyFrameRow    = document.getElementById('applyFrameRow');

    /* ── Constants ─────────────────────────────────────────── */
    const SIZE       = 800;          // Canvas resolution
    const PHOTO_R    = 290;          // Radius of the circular photo area
    const CX         = SIZE / 2;     // Center X
    const CY         = SIZE / 2;     // Center Y

    /* ── Colors ─────────────────────────────────────────────── */
    const C = {
        black  : '#0A0A0A',
        white  : '#F2F2F2',
        red    : '#CE1126',
        green  : '#007A3D',
        gold   : '#C8A45A',
        goldDk : '#9A7030',
        hGreen : '#015645',
        hGold  : '#BB9960',
    };

    /* ── State ──────────────────────────────────────────────── */
    let userImage    = null;
    let currentShape = 'circle';
    let zoom         = 1.0;
    let panX         = 0;
    let panY         = 0;
    let isDragging   = false;
    let startX       = 0;
    let startY       = 0;
    let videoStream  = null;

    const zoomSlider = document.getElementById('zoomSlider');

    /* ── File Input Handlers ────────────────────────────────── */
    function handleFileInput(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                userImage = img;
                zoom = 1.0;
                panX = 0;
                panY = 0;
                if (zoomSlider) zoomSlider.value = 1.0;
                showPreview();
                renderComposite();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    fileGallery.addEventListener('change', e => handleFileInput(e.target.files[0]));
    fileCamera.addEventListener('change',  e => handleFileInput(e.target.files[0]));

    /* ── Webcam Stream Functions ────────────────────────────── */
    async function startWebcam() {
        try {
            // Request camera permissions with facingMode user (front camera)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 800 },
                    height: { ideal: 800 }
                },
                audio: false
            });
            videoStream = stream;
            cameraVideo.srcObject = stream;
            cameraModal.classList.remove('hidden');
        } catch (err) {
            console.warn('Webcam access failed, falling back to file picker:', err);
            showToast('تم فتح كاميرا الهاتف للالتقاط');
            fileCamera.click(); // Fallback to native camera/gallery chooser
        }
    }

    function stopWebcam() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        cameraVideo.srcObject = null;
        cameraModal.classList.add('hidden');
    }

    // Capture photo from video stream
    function capturePhoto() {
        if (!cameraVideo.srcObject) return;
        
        const capCanvas = document.createElement('canvas');
        capCanvas.width = 800;
        capCanvas.height = 800;
        const capCtx = capCanvas.getContext('2d');
        
        // Mirror the image to match the video element display
        capCtx.translate(800, 0);
        capCtx.scale(-1, 1);
        
        // Draw centered square crop from the video feed
        const vWidth = cameraVideo.videoWidth;
        const vHeight = cameraVideo.videoHeight;
        const vSize = Math.min(vWidth, vHeight);
        const sx = (vWidth - vSize) / 2;
        const sy = (vHeight - vSize) / 2;
        
        capCtx.drawImage(cameraVideo, sx, sy, vSize, vSize, 0, 0, 800, 800);
        
        // Convert canvas image to HTMLImageElement
        const img = new Image();
        img.onload = function () {
            userImage = img;
            zoom = 1.0;
            panX = 0;
            panY = 0;
            if (zoomSlider) zoomSlider.value = 1.0;
            stopWebcam();
            showPreview();
            renderComposite();
        };
        img.src = capCanvas.toDataURL('image/png');
    }

    // Attach listeners
    // btnGallery is now a <label for="fileGallery">, so no JS needed — native click works.
    // btnCamera is a <label for="fileCamera">, but we intercept to try webcam first on desktop.
    if (btnCamera) {
        btnCamera.addEventListener('click', (e) => {
            // On desktop: try webcam modal; on mobile: let native camera open via fileCamera
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (!isMobile) {
                e.preventDefault();
                startWebcam();
            }
            // On mobile: label's native for="fileCamera" will open camera directly — no JS needed
        });
    }

    if (btnCloseCameraModal) {
        btnCloseCameraModal.addEventListener('click', () => {
            stopWebcam();
        });
    }

    if (btnCapturePhoto) {
        btnCapturePhoto.addEventListener('click', () => {
            capturePhoto();
        });
    }

    /* ── Show/Hide Sections ─────────────────────────────────── */
    function showPreview() {
        stepUpload.classList.add('hidden');
        stepPreview.classList.remove('hidden');
        if (shareSection) shareSection.classList.remove('hidden');
        stepPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ── Main Render ────────────────────────────────────────── */
    function renderComposite() {
        if (!userImage) return;

        const canvas = previewCanvas;
        canvas.width  = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');

        canvasLoading.classList.remove('hidden');

        requestAnimationFrame(() => setTimeout(() => {
            ctx.clearRect(0, 0, SIZE, SIZE);

            /* STEP 1 — Draw user photo clipped to the photo area */
            ctx.save();
            ctx.beginPath();
            if (currentShape === 'circle') {
                ctx.arc(CX, CY, PHOTO_R, 0, Math.PI * 2);
            } else {
                ctx.rect(CX - PHOTO_R, CY - PHOTO_R, PHOTO_R * 2, PHOTO_R * 2);
            }
            ctx.closePath();
            ctx.clip();

            // Calculate cover size relative to the photo area (PHOTO_R * 2)
            const photoSize = PHOTO_R * 2;
            const ia = userImage.width / userImage.height;
            let dw, dh;
            if (ia > 1) { // Landscape
                dh = photoSize;
                dw = photoSize * ia;
            } else { // Portrait or Square
                dw = photoSize;
                dh = photoSize / ia;
            }

            // Apply zoom
            dw *= zoom;
            dh *= zoom;

            // Center in photo area and apply panning
            const dx = CX + panX - dw / 2;
            const dy = CY + panY - dh / 2;

            ctx.drawImage(userImage, dx, dy, dw, dh);
            ctx.restore();

            /* STEP 2 — Draw the frame ON TOP (programmatic, guaranteed transparency) */
            drawFrame(ctx);

            canvasLoading.classList.add('hidden');
        }, 60));
    }

    /* ── Cover-fit image draw ───────────────────────────────── */
    function drawCover(ctx, img, dx, dy, dw, dh) {
        const ia = img.width / img.height;
        const ca = dw / dh;
        let sx, sy, sw, sh;
        if (ia > ca) {
            sh = img.height; sw = sh * ca;
            sx = (img.width - sw) / 2; sy = 0;
        } else {
            sw = img.width; sh = sw / ca;
            sx = 0; sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    /* ══════════════════════════════════════════════════════════
       FRAME DRAWING — 100% programmatic, zero PNG dependency
       ══════════════════════════════════════════════════════════ */
    function drawFrame(ctx) {

        /* ── 1. Build flag-band layer with a hole punched in center ── */
        const fl  = Object.assign(document.createElement('canvas'), { width: SIZE, height: SIZE });
        const fc  = fl.getContext('2d');

        // Iraqi flag horizontal bands
        fc.fillStyle = C.black;
        fc.fillRect(0, 0, SIZE, 267);

        fc.fillStyle = C.white;
        fc.fillRect(0, 267, SIZE, 266);

        fc.fillStyle = C.red;
        fc.fillRect(0, 533, SIZE, 267);

        // Punch out the photo hole
        fc.globalCompositeOperation = 'destination-out';
        fc.beginPath();
        if (currentShape === 'circle') {
            fc.arc(CX, CY, PHOTO_R, 0, Math.PI * 2);
        } else {
            fc.rect(CX - PHOTO_R, CY - PHOTO_R, PHOTO_R * 2, PHOTO_R * 2);
        }
        fc.fill();
        fc.globalCompositeOperation = 'source-over';

        // Composite flag layer onto main canvas
        ctx.drawImage(fl, 0, 0);

        /* ── 2. Outer decorative border ─────────────────────────────── */
        // Thick gold outer border
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 18;
        ctx.strokeRect(9, 9, SIZE - 18, SIZE - 18);

        // Thin black inner line
        ctx.strokeStyle = C.black;
        ctx.lineWidth = 3;
        ctx.strokeRect(22, 22, SIZE - 44, SIZE - 44);

        // Thin gold inner line
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 2;
        ctx.strokeRect(28, 28, SIZE - 56, SIZE - 56);

        /* ── 3. Decorative corner squares ────────────────────────────── */
        const corners = [[22,22], [SIZE-62,22], [22,SIZE-62], [SIZE-62,SIZE-62]];
        corners.forEach(([x, y]) => {
            ctx.fillStyle = C.gold;
            ctx.fillRect(x, y, 40, 40);
            ctx.fillStyle = C.black;
            ctx.fillRect(x+6, y+6, 28, 28);
            ctx.fillStyle = C.gold;
            ctx.fillRect(x+11, y+11, 18, 18);
        });

        /* ── 4. Gold border around photo area ────────────────────────── */
        if (currentShape === 'circle') {
            // Outer glow ring
            ctx.strokeStyle = C.goldDk;
            ctx.lineWidth = 28;
            ctx.beginPath();
            ctx.arc(CX, CY, PHOTO_R + 14, 0, Math.PI * 2);
            ctx.stroke();

            // Bright gold ring
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 16;
            ctx.beginPath();
            ctx.arc(CX, CY, PHOTO_R + 14, 0, Math.PI * 2);
            ctx.stroke();

            // Inner thin black ring
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(CX, CY, PHOTO_R + 26, 0, Math.PI * 2);
            ctx.stroke();

            // Inner thin gold ring (just inside photo edge)
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(CX, CY, PHOTO_R + 3, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Square Borders
            // Outer glow
            ctx.strokeStyle = C.goldDk;
            ctx.lineWidth = 28;
            ctx.strokeRect(CX - PHOTO_R - 14, CY - PHOTO_R - 14, PHOTO_R * 2 + 28, PHOTO_R * 2 + 28);

            // Bright gold border
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 16;
            ctx.strokeRect(CX - PHOTO_R - 14, CY - PHOTO_R - 14, PHOTO_R * 2 + 28, PHOTO_R * 2 + 28);

            // Inner thin black line
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeRect(CX - PHOTO_R - 26, CY - PHOTO_R - 26, PHOTO_R * 2 + 52, PHOTO_R * 2 + 52);

            // Inner thin gold line (just inside photo edge)
            ctx.strokeStyle = C.gold;
            ctx.lineWidth = 3;
            ctx.strokeRect(CX - PHOTO_R - 3, CY - PHOTO_R - 3, PHOTO_R * 2 + 6, PHOTO_R * 2 + 6);
        }

        /* ── 5. Stars in the black top area ──────────────────────────── */
        ctx.fillStyle = C.gold;
        const starRow = [
            [100, 80, 18], [185, 60, 22], [280, 52, 26],
            [400, 48, 30],
            [520, 52, 26], [615, 60, 22], [700, 80, 18],
        ];
        starRow.forEach(([x, y, r]) => drawStar(ctx, x, y, r, 5, r * 0.42));

        // Side stars
        drawStar(ctx, 48,  170, 14, 5, 6);
        drawStar(ctx, 752, 170, 14, 5, 6);

        /* ── 6. Soccer balls in top corners ─────────────────────────── */
        drawSoccerBall(ctx, 48,  48,  38);
        drawSoccerBall(ctx, 752, 48,  38);
        drawSoccerBall(ctx, 48,  752, 30);
        drawSoccerBall(ctx, 752, 752, 30);

        /* ── 7. "الله أكبر" in green on white band ───────────────────── */
        ctx.fillStyle = C.green;
        ctx.font = 'bold 36px "Tajawal", "Arial Unicode MS", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('الله أكبر', CX, 400);

        /* ── 8. Eagle / coat of arms placeholder (gold crescent) ───── */
        // Gold decorative arch at top of white band
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(CX, 267, 46, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = C.gold;
        ctx.beginPath();
        ctx.arc(CX, 267, 10, 0, Math.PI * 2);
        ctx.fill();

        /* ── 9. Text "العراق في كأس العالم" in red area ─────────────── */
        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur  = 6;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 44px "Tajawal", "Arial Unicode MS", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('العراق في كأس العالم', CX, 615);

        ctx.font = 'bold 54px Arial, sans-serif';
        ctx.fillStyle = C.gold;
        ctx.fillText('2026 ⚽', CX, 675);

        // Reset shadow
        ctx.shadowColor   = 'transparent';
        ctx.shadowBlur    = 0;
        ctx.shadowOffsetY = 0;

        /* ── 10. Haya Pharmacy branding ──────────────────────────────── */
        ctx.fillStyle = C.hGold;
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('Haya Pharmacy', SIZE - 36, SIZE - 36);

        // Small green dot before branding
        ctx.fillStyle = C.hGreen;
        ctx.beginPath();
        ctx.arc(SIZE - 190, SIZE - 42, 5, 0, Math.PI * 2);
        ctx.fill();

        /* ── 11. Decorative horizontal lines on white band ──────────── */
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 1.5;
        [310, 355, 445, 490].forEach(y => {
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.moveTo(35, y);
            ctx.lineTo(SIZE - 35, y);
            ctx.stroke();
        });
        ctx.globalAlpha = 1;

        /* ── Reset ─────────────────────────────────────────────────── */
        ctx.textAlign    = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    /* ── Draw a 5-point star ────────────────────────────────── */
    function drawStar(ctx, cx, cy, outerR, pts, innerR) {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < pts * 2; i++) {
            const angle = (i * Math.PI / pts) - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /* ── Draw a simple soccer ball ──────────────────────────── */
    function drawSoccerBall(ctx, cx, cy, r) {
        ctx.save();
        // Ball
        const g = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, r*0.1, cx, cy, r);
        g.addColorStop(0, '#555');
        g.addColorStop(1, '#111');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // White patches (simplified hexagon/pentagon shapes)
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.3, r * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        const patchAngles = [60, 180, 300];
        patchAngles.forEach(deg => {
            const rad = (deg - 90) * Math.PI / 180;
            ctx.beginPath();
            ctx.arc(cx + r * 0.55 * Math.cos(rad), cy + r * 0.55 * Math.sin(rad), r * 0.22, 0, Math.PI * 2);
            ctx.fill();
        });

        // Gold ring
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = r * 0.12;
        ctx.beginPath();
        ctx.arc(cx, cy, r + r * 0.06, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    /* ── Shape Toggle ───────────────────────────────────────── */
    if (btnCircle) {
        btnCircle.addEventListener('click', () => {
            currentShape = 'circle';
            btnCircle.classList.add('active');
            if (btnSquare) btnSquare.classList.remove('active');
            renderComposite();
        });
    }

    if (btnSquare) {
        btnSquare.addEventListener('click', () => {
            currentShape = 'square';
            btnSquare.classList.add('active');
            if (btnCircle) btnCircle.classList.remove('active');
            renderComposite();
        });
    }

    /* ── Download ───────────────────────────────────────────── */
    if (btnDownload) btnDownload.addEventListener('click', () => {
        if (!userImage) {
            showToast('الرجاء اختيار صورة أولاً');
            // Scroll to upload section
            if (stepUpload) stepUpload.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        const link     = document.createElement('a');
        link.download  = 'iraq-wc2026-' + Date.now() + '.png';
        link.href      = previewCanvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('تم تحميل الصورة بنجاح! 🇮🇶');
    });

    /* ── Reset ──────────────────────────────────────────────── */
    if (btnReset) btnReset.addEventListener('click', () => {
        userImage = null;
        fileGallery.value = '';
        fileCamera.value  = '';
        zoom = 1.0;
        panX = 0;
        panY = 0;
        if (zoomSlider) zoomSlider.value = 1.0;

        currentShape = 'circle';
        if (btnCircle) btnCircle.classList.add('active');
        if (btnSquare) btnSquare.classList.remove('active');

        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        stepPreview.classList.add('hidden');
        if (shareSection) shareSection.classList.add('hidden');
        stepUpload.classList.remove('hidden');
        stepUpload.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* ── Apply Frame Row click — triggers gallery upload ─── */
    if (applyFrameRow) {
        applyFrameRow.addEventListener('click', () => {
            fileGallery.click();
        });
    }

    /* ── Share via Web Share API ────────────────────────────── */
    if (btnShare) btnShare.addEventListener('click', async () => {
        if (!userImage) return;
        if (navigator.share && navigator.canShare) {
            try {
                const blob = await new Promise(res => previewCanvas.toBlob(res, 'image/png', 1.0));
                const file = new File([blob], 'iraq-wc2026.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'العراق في كأس العالم 2026',
                        text: 'انظر صورتي مع إطار المنتخب العراقي! 🇮🇶⚽',
                        files: [file]
                    });
                    return;
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error(err);
            }
        }
        if (btnDownload) btnDownload.click();
        showToast('انقر على تحميل الصورة ثم شاركها يدوياً');
    });

    /* ── Share via WhatsApp ─────────────────────────────────── */
    if (btnShareWhatsapp) btnShareWhatsapp.addEventListener('click', () => {
        if (userImage && btnDownload) btnDownload.click();
        setTimeout(() => {
            const text = encodeURIComponent('العراق في كأس العالم 2026! 🇮🇶⚽\nمن صيدلية حيا — شريكك لحياة صحية\n');
            window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
        }, 400);
        showToast('تم تحميل الصورة — شاركها في واتساب! 💚');
    });

    /* ── Toast ──────────────────────────────────────────────── */
    let toastTimer = null;
    function showToast(msg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
    }

    /* ── Drag & Zoom Event Handlers ─────────────────────────── */
    function getEventCoords(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function startDrag(e) {
        if (!userImage) return;
        isDragging = true;
        const coords = getEventCoords(e);
        const rect = previewCanvas.getBoundingClientRect();
        const scale = SIZE / rect.width;
        startX = coords.x * scale - panX;
        startY = coords.y * scale - panY;
    }

    function doDrag(e) {
        if (!isDragging || !userImage) return;
        e.preventDefault();
        const coords = getEventCoords(e);
        const rect = previewCanvas.getBoundingClientRect();
        const scale = SIZE / rect.width;
        panX = coords.x * scale - startX;
        panY = coords.y * scale - startY;
        renderComposite();
    }

    function stopDrag() {
        isDragging = false;
    }

    previewCanvas.addEventListener('mousedown', startDrag);
    previewCanvas.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    previewCanvas.addEventListener('touchstart', startDrag, { passive: false });
    previewCanvas.addEventListener('touchmove', doDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);

    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            zoom = parseFloat(e.target.value);
            renderComposite();
        });
    }

    /* ── Scroll Handler ─────────────────────────────────────── */
    window.addEventListener('scroll', () => {
        if (siteHeader) {
            siteHeader.classList.toggle('scrolled', window.scrollY > 30);
        }
    });

    /* ── Mobile: fix double-trigger on touch ────────────────── */
    document.querySelectorAll('button').forEach(btn => {
        // Skip hamburger button — handled separately with stopPropagation
        if (btn.id === 'hamburgerBtn') return;
        btn.addEventListener('touchend', e => {
            e.preventDefault();
            btn.click();
        }, { passive: false });
    });

    /* ── Hamburger Menu ──────────────────────────────────────── */
    const hamburgerBtn    = document.getElementById('hamburgerBtn');
    const headerDropdown  = document.getElementById('headerDropdown');

    if (hamburgerBtn && headerDropdown) {
        // Toggle open/close
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = headerDropdown.classList.contains('open');
            hamburgerBtn.classList.toggle('open', !isOpen);
            headerDropdown.classList.toggle('open', !isOpen);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !headerDropdown.contains(e.target)) {
                hamburgerBtn.classList.remove('open');
                headerDropdown.classList.remove('open');
            }
        });

        // Close when a social link is clicked
        headerDropdown.querySelectorAll('.dropdown-social-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('open');
                headerDropdown.classList.remove('open');
            });
        });

        // Close dropdown on scroll
        window.addEventListener('scroll', () => {
            hamburgerBtn.classList.remove('open');
            headerDropdown.classList.remove('open');
        }, { passive: true });
    }

})();
