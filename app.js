'use strict';

const TOTAL_PAGES = 3;
const REQUIRED_BY_PAGE = {
  1: ['q1', 'q2', 'q3', 'q4', 'q5'],
  2: ['q6', 'q7', 'q8', 'q9', 'q10'],
  3: ['q11', 'q12', 'q13']
};
let currentPage = 1;
let toastTimer = null;

const QUESTION_DETAILS = {
  q1_details: 'تفاصيل المنصة أو البرمجة المطلوبة',
  q2_details: 'رابط الثيم الحالي أو المقترح (إن وجد)',
  q3_details: 'رابط الموقع الحالي أو تفاصيل الاستضافة',
  q4_details: 'اسم الدومين أو الدومين المقترح',
  q5_details: 'تحديد اللغات الإضافية المطلوبة',
  q6_details: 'الألوان الفعلية / أكواد الألوان (Hex Codes)',
  q7_details: 'روابط المواقع المرجعية وتفاصيلها',
  q9_details: 'شركات الشحن المفضلة',
  q10_details: 'أدوات إضافية مطلوبة وربطها',
  q11_details: 'قائمة السياسات المطلوبة',
  q12_details: 'ملاحظات / الحد الأقصى للبنرات المسموح بتصميمها',
  q13_details: 'تفاصيل جهة القيام بتصوير الفيديو'
};

document.addEventListener('DOMContentLoaded', () => {
  initChoiceInputs();
  initAssetCheckboxes();
  updateNav();
});

function initChoiceInputs() {
  document.querySelectorAll('.option-item input[type="radio"], .option-item input[type="checkbox"]').forEach(input => {
    const label = input.closest('.option-item');
    const update = () => {
      if (input.type === 'radio') {
        document.querySelectorAll(`input[type="radio"][name="${CSS.escape(input.name)}"]`).forEach(sibling => {
          sibling.closest('.option-item')?.classList.toggle('selected', sibling.checked);
        });
      } else {
        label?.classList.toggle('selected', input.checked);
        label?.classList.toggle('checked', input.checked);
      }
      clearError(input.name);
    };
    input.addEventListener('change', update);
    if (input.type === 'radio') label?.classList.toggle('selected', input.checked);
    else {
      label?.classList.toggle('selected', input.checked);
      label?.classList.toggle('checked', input.checked);
    }
  });
}

function initAssetCheckboxes() {
  document.querySelectorAll('.asset-check input[type="checkbox"]').forEach(input => {
    const label = input.closest('.asset-check');
    const sync = () => label?.classList.toggle('checked', input.checked);
    input.addEventListener('change', sync);
    sync();
  });
}

function hasAnswer(name) {
  if (name === 'q10') return document.querySelectorAll('input[type="checkbox"][name="q10"]:checked').length > 0;
  return Boolean(document.querySelector(`input[type="radio"][name="${CSS.escape(name)}"]:checked`));
}

function validatePage(pageNum) {
  let valid = true;
  let firstInvalid = null;
  (REQUIRED_BY_PAGE[pageNum] || []).forEach(name => {
    const block = document.getElementById(`${name}-block`);
    const answered = hasAnswer(name);
    block?.classList.toggle('has-error', !answered);
    const error = document.getElementById(`${name}-error`);
    if (error) error.textContent = answered ? '' : (name === 'q10' ? 'يرجى اختيار أداة واحدة على الأقل.' : 'يرجى اختيار إجابة لهذا السؤال.');
    if (!answered) {
      valid = false;
      if (!firstInvalid) firstInvalid = block;
    }
  });
  if (!valid) {
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('يرجى الإجابة على جميع الأسئلة المطلوبة قبل المتابعة');
  }
  return valid;
}

function clearError(name) {
  document.getElementById(`${name}-block`)?.classList.remove('has-error');
  const error = document.getElementById(`${name}-error`);
  if (error) error.textContent = '';
}

function showToast(message) {
  const toast = document.getElementById('validationToast');
  const messageElement = document.getElementById('toastMsg');
  if (!toast) return;
  if (messageElement && message) messageElement.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function navigate(direction) {
  if (direction === 1 && !validatePage(currentPage)) return;
  goToPage(currentPage + direction, true);
}

function goToPage(targetPage, alreadyValidated = false) {
  if (!Number.isInteger(targetPage) || targetPage < 1 || targetPage > TOTAL_PAGES) return;
  if (targetPage > currentPage && !alreadyValidated) {
    for (let page = currentPage; page < targetPage; page++) {
      if (!validatePage(page)) return;
    }
  }
  const target = document.getElementById(`page-${targetPage}`);
  if (!target) return;
  document.querySelector('.page.active')?.classList.remove('active');
  target.classList.add('active');
  currentPage = targetPage;
  updateNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNav() {
  const prev = document.getElementById('btnPrev');
  const next = document.getElementById('btnNext');
  const submit = document.getElementById('btnSubmit');
  const fill = document.getElementById('progressBarFill');
  if (prev) prev.style.display = currentPage > 1 ? 'inline-flex' : 'none';
  if (next) next.style.display = currentPage < TOTAL_PAGES ? 'inline-flex' : 'none';
  if (submit) submit.style.display = currentPage === TOTAL_PAGES ? 'inline-flex' : 'none';
  if (fill) fill.style.width = `${(currentPage / TOTAL_PAGES) * 100}%`;
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const step = document.getElementById(`step-dot-${i}`);
    if (!step) continue;
    step.classList.toggle('active', i === currentPage);
    step.classList.toggle('done', i < currentPage);
    step.setAttribute('aria-current', i === currentPage ? 'step' : 'false');
  }
  document.querySelectorAll('.nav-step-line').forEach((line, index) => {
    line.style.background = index < currentPage - 1 ? 'var(--brand)' : '#D8D8D8';
  });
}

function collectAnswers() {
  const answers = {};
  Object.keys(REQUIRED_BY_PAGE).flatMap(page => REQUIRED_BY_PAGE[page]).forEach(name => {
    if (name === 'q10') {
      answers.q10 = [...document.querySelectorAll('input[type="checkbox"][name="q10"]:checked')].map(input => input.value);
    } else {
      const selected = document.querySelector(`input[type="radio"][name="${CSS.escape(name)}"]:checked`);
      if (selected) answers[name] = selected.value;
    }
  });
  answers.assets = [...document.querySelectorAll('input[name="assets"]:checked')].map(input => input.value);
  document.querySelectorAll('input[type="text"], input[type="url"], textarea').forEach(input => {
    if (input.name && input.value.trim()) answers[input.name] = input.value.trim();
  });
  return answers;
}

async function submitForm() {
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    if (!validatePage(page)) {
      goToPage(page, true);
      return;
    }
  }
  // Open the print window directly from the click handler to avoid popup blockers.
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('المتصفح منع فتح نافذة PDF. اسمح بالنوافذ المنبثقة للموقع ثم حاول مرة أخرى.');
    return;
  }
  const overlay = document.getElementById('successOverlay');
  overlay?.classList.remove('hidden');
  const button = document.getElementById('btnSubmit');
  if (button) button.disabled = true;
  try {
    await generatePDF(collectAnswers(), printWindow);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('تعذر إنشاء ملف PDF. تأكد من اتصال الإنترنت، ثم حاول مرة أخرى. إذا استمرت المشكلة افتح الموقع باستخدام Live Server.');
  } finally {
    overlay?.classList.add('hidden');
    if (button) button.disabled = false;
  }
}

function cleanLabel(element) {
  return (element?.innerText || element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function makePdfElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function addPdfDetail(question, label, value) {
  question.append(makePdfElement('p', 'pdf-detail-label', label));
  question.append(makePdfElement('div', 'pdf-detail', value || 'لم تتم إضافة تفاصيل.'));
}

async function waitForFonts() {
  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch (_) { /* use fallback fonts */ }
  }
}

async function generatePDF(answers, printWindow) {
  await waitForFonts();

  const root = makePdfElement('div', 'pdf-export');
  root.setAttribute('dir', 'rtl');
  root.lang = 'ar';
  const header = makePdfElement('header', 'pdf-header');
  header.append(makePdfElement('div', 'pdf-brand', 'ROYA AGENCY'));
  header.append(makePdfElement('h1', 'pdf-title', 'استبيان متطلبات مشروع تطوير موقع إلكتروني'));
  header.append(makePdfElement('p', 'pdf-subtitle', 'Website Development Discovery & Requirements Questionnaire'));
  root.append(header);

  const pageLabels = ['المنصة والاستضافة واللغات', 'الهوية والتجارة والتسويق', 'السياسات والوسائط والأصول'];
  for (let pageNum = 1; pageNum <= TOTAL_PAGES; pageNum++) {
    const pageElement = document.getElementById(`page-${pageNum}`);
    if (!pageElement) continue;
    const section = makePdfElement('section', 'pdf-page');
    section.append(makePdfElement('h2', 'pdf-page-title', `القسم ${pageNum}: ${pageLabels[pageNum - 1]}`));

    pageElement.querySelectorAll('.question-block').forEach(block => {
      const choice = block.querySelector('input[type="radio"], input[type="checkbox"]');
      if (!choice) return;
      const name = choice.name;
      const question = makePdfElement('article', 'pdf-question');
      question.append(makePdfElement('h3', 'pdf-question-title', cleanLabel(block.querySelector('.question-text')) || name));
      let answerText = 'لم يتم تحديد إجابة';
      if (name === 'q10') {
        const selected = [...block.querySelectorAll('input[type="checkbox"]:checked')].map(input => cleanLabel(input.closest('.option-item')));
        if (selected.length) answerText = selected.join('، ');
      } else {
        const selected = block.querySelector('input[type="radio"]:checked');
        if (selected) answerText = cleanLabel(selected.closest('.option-item'));
      }
      question.append(makePdfElement('p', 'pdf-answer', `الإجابة: ${answerText}`));
      const detail = document.querySelector(`[name="${CSS.escape(name + '_details')}"]`);
      if (detail) addPdfDetail(question, QUESTION_DETAILS[detail.name] || 'تفاصيل إضافية', detail.value.trim());
      section.append(question);
    });

    if (pageNum === 3) {
      const assetSection = makePdfElement('article', 'pdf-question');
      assetSection.append(makePdfElement('h3', 'pdf-question-title', 'الأصول والملفات المطلوبة'));
      const assets = [...document.querySelectorAll('input[name="assets"]')];
      assets.forEach(input => {
        const label = cleanLabel(input.closest('.asset-check'));
        const row = makePdfElement('div', 'pdf-asset-row');
        row.append(makePdfElement('p', 'pdf-answer', `${input.checked ? '☑' : '☐'} ${label}`));
        assetSection.append(row);
      });
      const driveLinkFields = [
        ['assets_drive_logos', 'روابط Google Drive للشعارات'],
        ['assets_drive_fonts', 'روابط Google Drive للخطوط'],
        ['assets_drive_brand', 'روابط Google Drive لدليل الهوية والألوان'],
        ['assets_drive_media', 'روابط Google Drive للصور والوسائط وأيقونة الموقع']
      ];
      driveLinkFields.forEach(([fieldName, label]) => {
        const links = document.querySelector(`[name="${fieldName}"]`)?.value.trim();
        if (!links) return;
        const linkBlock = makePdfElement('div', 'pdf-drive-group');
        linkBlock.append(makePdfElement('p', 'pdf-detail-label', label));
        links.split(/\n+/).map(link => link.trim()).filter(Boolean).forEach(link => {
          const line = makePdfElement('p', 'pdf-asset-link');
          if (/^https?:\/\//i.test(link)) {
            const anchor = makePdfElement('a', '', link); anchor.href = link; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; line.append(anchor);
          } else { line.textContent = link; }
          linkBlock.append(line);
        });
        assetSection.append(linkBlock);
      });
      section.append(assetSection);
    }
    root.append(section);
  }

  root.append(makePdfElement('p', 'pdf-footer', `Roya Agency — استبيان متطلبات تطوير الموقع الإلكتروني · ${new Date().toLocaleDateString('ar-EG')}`));
  const style = makePdfElement('style');
  style.textContent = `
    .pdf-export{box-sizing:border-box;width:190mm;padding:7mm;background:#fff;color:#20242b;font-family:'Cairo',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;font-size:11px;line-height:1.9;}
    .pdf-export *{box-sizing:border-box;max-width:100%;}
    .pdf-header{border-bottom:3px solid #ff4632;padding:0 0 12px;margin-bottom:15px;}
    .pdf-brand{font-family:Arial,sans-serif;color:#ff4632;font-size:10px;font-weight:800;letter-spacing:2px;direction:ltr;text-align:right;}
    .pdf-title{font-family:'Cairo',Tahoma,Arial,sans-serif;font-size:19px;line-height:1.8;margin:6px 0;color:#20242b;font-weight:800;}
    .pdf-subtitle{font-family:Arial,sans-serif;font-size:9px;color:#777;direction:ltr;text-align:right;margin:0;}
    .pdf-page{margin:0 0 12px;}
    .pdf-page-title{font-family:'Cairo',Tahoma,Arial,sans-serif;font-size:14px;color:#ff4632;border-right:4px solid #ff4632;padding:5px 9px;margin:0 0 10px;background:#fff1ef;}
    .pdf-question{break-inside:avoid;border:1px solid #e6e8ec;border-radius:6px;padding:8px 10px;margin:0 0 8px;}
    .pdf-question-title{font-family:'Cairo',Tahoma,Arial,sans-serif;font-size:11px;margin:0 0 5px;font-weight:700;line-height:1.9;}
    .pdf-answer{font-family:'Cairo',Tahoma,Arial,sans-serif;margin:0;color:#242833;background:#fff8f6;padding:5px 8px;border-radius:3px;white-space:normal;overflow-wrap:anywhere;}
    .pdf-detail-label{font-family:'Cairo',Tahoma,Arial,sans-serif;font-size:9px;color:#777;margin:7px 0 3px;}
    .pdf-detail{font-family:'Cairo',Tahoma,Arial,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #eee;border-radius:3px;padding:6px 8px;min-height:24px;}
    .pdf-asset-row{break-inside:avoid;margin:0 0 6px;padding-bottom:5px;border-bottom:1px solid #eee;}
    .pdf-asset-link{font-family:Tahoma,Arial,sans-serif;direction:ltr;text-align:left;overflow-wrap:anywhere;word-break:break-word;font-size:9px;margin:4px 0 0;color:#2459a9;}
    .pdf-asset-link a{color:#2459a9;text-decoration:underline;}
    .pdf-drive-group{break-inside:avoid;border:1px solid #ffc0b8;border-radius:5px;padding:6px 8px;margin:8px 0;}
    .pdf-drive-group .pdf-detail-label{color:#ff4632;font-weight:700;}
    .pdf-footer{font-family:'Cairo',Tahoma,Arial,sans-serif;border-top:1px solid #ddd;color:#888;font-size:8px;padding-top:8px;margin-top:14px;}
  `;
  root.prepend(style);

  // Use the browser's native print engine instead of html2canvas/html2pdf.
  // This avoids blank canvases (height 0) and preserves Arabic shaping/RTL text.
  try {
    await waitForFonts();
    const printable = root.cloneNode(true);
    printable.removeAttribute('style');
    Object.assign(printable.style, {
      position: 'static', display: 'block', width: '190mm', height: 'auto',
      minHeight: '0', maxHeight: 'none', overflow: 'visible', opacity: '1',
      visibility: 'visible', pointerEvents: 'auto', margin: '0 auto'
    });
    const printCss = `
      @page { size: A4; margin: 10mm 8mm; }
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .pdf-export { width: 100% !important; margin: 0 auto !important; }
      .pdf-question, .pdf-asset-row, .pdf-drive-group { break-inside: avoid; page-break-inside: avoid; }
      .pdf-page { break-before: page; page-break-before: always; }
      .pdf-page:first-of-type { break-before: auto; page-break-before: auto; }
      a { color: #2459a9 !important; overflow-wrap: anywhere; }
      .mobile-print-help { position: sticky; top: 0; z-index: 99999; padding: 12px; background: #ff4632; color: white; text-align: center; font: 16px Arial,sans-serif; }
      .mobile-print-help button { display: block; margin: 8px auto 0; border: 0; border-radius: 8px; background: white; color: #ff4632; font-weight: 700; font-size: 16px; padding: 12px 18px; }
      @media print { .mobile-print-help { display: none !important; } }
    `;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const helpBar = `<div class="mobile-print-help" id="mobilePrintHelp">لحفظ الاستبيان PDF على iPhone: اضغط الزر ثم اختر Share أو Save to Files.<button type="button" onclick="window.focus(); window.print();">طباعة / حفظ PDF</button></div>`;
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><title>Roya Completed Questionnaire</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${printCss}</style></head><body>${isIOS ? helpBar : ''}${printable.outerHTML}<script>
      window.addEventListener('load', async function(){
        try { if(document.fonts && document.fonts.ready) await document.fonts.ready; } catch(e) {}
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (!ios) setTimeout(function(){ window.focus(); window.print(); }, 500);
      });
    <\/script></body></html>`);
    printWindow.document.close();
  } catch (error) {
    printWindow.close();
    throw error;
  } finally {
    root.remove();
    document.body.classList.remove('exporting-pdf');
  }
}


// ROYA LOADING SCREEN
(function () {
  const loader = document.getElementById("loader");

  if (!loader) return;

  let isHidden = false;

  function hideLoader() {
    if (isHidden) return;

    isHidden = true;
    loader.classList.add("loader-hidden");

    // Remove the loader after the fade-out animation
    setTimeout(() => {
      loader.remove();
    }, 700);
  }

  // Hide when the page and its resources finish loading
  window.addEventListener("load", hideLoader, { once: true });

  // Fallback in case a resource takes too long
  setTimeout(hideLoader, 8000);

  // Handle cases where the page has already loaded
  if (document.readyState === "complete") {
    hideLoader();
  }
})();