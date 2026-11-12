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
  initLiveLinkPreviews();
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
        if (input.checked && input.value.includes('لن يتم تغيير')) {
          document.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(input.name)}"]`).forEach(sibling => {
            if (sibling !== input) {
              sibling.checked = false;
              sibling.closest('.option-item')?.classList.remove('selected', 'checked');
            }
          });
        } else if (input.checked && !input.value.includes('لن يتم تغيير')) {
          document.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(input.name)}"]`).forEach(sibling => {
            if (sibling !== input && sibling.value.includes('لن يتم تغيير')) {
              sibling.checked = false;
              sibling.closest('.option-item')?.classList.remove('selected', 'checked');
            }
          });
        }
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

function getSelectedPlatform() {
  const selected = document.querySelector('input[type="radio"][name="q1"]:checked');
  if (!selected) return null;
  const val = selected.value.toLowerCase();
  if (val.includes('zid') || val.includes('زد') || val.includes('shopify') || val.includes('شوبيفاي') || val.includes('salla') || val.includes('سلة')) {
    return {
      type: 'saas',
      label: selected.value.replace(/\s*\([^)]*\)/g, '').trim(),
      raw: selected.value
    };
  }
  if (val.includes('wordpress') || val.includes('ووردبريس') || val.includes('custom') || val.includes('برمجة خاصة') || val.includes('كود')) {
    return {
      type: 'custom',
      label: selected.value.replace(/\s*\([^)]*\)/g, '').trim(),
      raw: selected.value
    };
  }
  return null;
}

function getSelectedThemeApproach() {
  const selected = document.querySelector('input[type="radio"][name="q2"]:checked');
  if (!selected) return null;
  const val = selected.value;
  if (val.includes('التعديل وتطوير الثيم الحالي') || val.includes('الثيم الحالي')) {
    return {
      type: 'current_theme',
      label: 'تعديل الثيم الحالي'
    };
  }
  if (val.includes('شراء ثيم جاهز') || val.includes('شراء')) {
    return {
      type: 'buy_theme',
      label: 'شراء ثيم جديد'
    };
  }
  if (val.includes('تصميم وبناء ثيم خاص') || val.includes('Custom Theme')) {
    return {
      type: 'custom_theme',
      label: 'تصميم وبناء ثيم خاص'
    };
  }
  return null;
}

function getSelectedSiteStatus() {
  const selected = document.querySelector('input[type="radio"][name="q3"]:checked');
  if (!selected) return null;
  const val = selected.value;
  if (val.includes('من الصفر') || val.includes('New Build') || val.includes('لا،')) {
    return {
      hasSite: false,
      type: 'new',
      label: 'بناء موقع جديد من الصفر'
    };
  }
  if (val.includes('موقع وحساب حالي') || val.includes('نعم')) {
    return {
      hasSite: true,
      type: 'existing',
      label: 'يوجد موقع وحساب حالي'
    };
  }
  return null;
}

function getSelectedWorkType() {
  return getSelectedSiteStatus();
}

function getEstimatedTimeline() {
  const platform = getSelectedPlatform();
  const theme = getSelectedThemeApproach();
  const site = getSelectedSiteStatus();

  if (!platform) return null;

  // 1. منصات سلة (Salla) أو زد (Zid) أو شوبيفاي (Shopify)
  if (platform.type === 'saas') {
    // بناء موقع جديد من الصفر: من 4 إلى 5 أيام
    if ((site && !site.hasSite) || (theme && theme.type === 'custom_theme' && (!site || !site.hasSite))) {
      return {
        daysAr: 'من 4 إلى 5 أيام',
        daysEn: '4 – 5 Days',
        badge: 'بناء متجر متكامل · Full Build',
        platformLabel: platform.label,
        siteStatusLabel: site ? site.label : 'بناء من الصفر',
        themeLabel: theme ? theme.label : 'متجر متكامل',
        workLabel: 'بناء موقع جديد من الصفر',
        desc: `المدة التقديرية لبناء متجر جديد بالكامل من الصفر على منصة ${platform.label}.`
      };
    }

    // لو العميل عنده موقع بالفعل، وهننفّذ التعديلات على الثيم الحالي: من يوم إلى 3 أيام
    if (theme && theme.type === 'current_theme') {
      return {
        daysAr: 'من يوم إلى 3 أيام',
        daysEn: '1 – 3 Days',
        badge: 'تسليم سريع · Express',
        platformLabel: platform.label,
        siteStatusLabel: site ? site.label : 'موقع حالي',
        themeLabel: theme.label,
        workLabel: 'تعديلات على الثيم الحالي',
        desc: `المدة التقديرية لتنفيذ التعديلات على الثيم الحالي لمتجر ${platform.label} القائم.`
      };
    }

    // لو العميل عنده موقع، لكنه هيشتري ثيم جديد وهنشتغل عليه: من 3 إلى 4 أيام
    if (theme && theme.type === 'buy_theme') {
      return {
        daysAr: 'من 3 إلى 4 أيام',
        daysEn: '3 – 4 Days',
        badge: 'تجهيز ثيم جديد · New Theme',
        platformLabel: platform.label,
        siteStatusLabel: site ? site.label : 'موقع حالي',
        themeLabel: theme.label,
        workLabel: 'تجهيز وتشغيل ثيم جديد',
        desc: `المدة التقديرية لشراء وتجهيز ثيم جديد وتشغيله لمتجر ${platform.label} القائم.`
      };
    }

    // لو العميل عنده موقع، ولكن اختار بناء ثيم خاص بالكامل: من 4 إلى 5 أيام
    if (theme && theme.type === 'custom_theme' && site && site.hasSite) {
      return {
        daysAr: 'من 4 إلى 5 أيام',
        daysEn: '4 – 5 Days',
        badge: 'ثيم خاص بالكامل · Custom Theme',
        platformLabel: platform.label,
        siteStatusLabel: site.label,
        themeLabel: theme.label,
        workLabel: 'تصميم وبناء ثيم خاص',
        desc: `المدة التقديرية لتصميم وبناء ثيم خاص مخصص لمتجر ${platform.label}.`
      };
    }

    // لو اختار موقع حالي وبانتظار تحديد الثيم
    if (site && site.hasSite) {
      return {
        daysAr: 'من يوم إلى 4 أيام',
        daysEn: '1 – 4 Days',
        badge: 'بانتظار تحديد الثيم',
        platformLabel: platform.label,
        siteStatusLabel: site.label,
        themeLabel: 'يرجى اختيار اتجاه الثيم',
        workLabel: 'تطوير على موقع حالي',
        desc: `تتراوح المدة التقديرية بين 1 و4 أيام بحسب اختيار التعديل على الثيم الحالي أو شراء ثيم جديد.`
      };
    }

    return null;
  }

  // 2. البرمجة الخاصة (Custom Code) أو WordPress
  if (platform.type === 'custom') {
    // لو العميل معندوش موقع وهنبني الموقع من الصفر: من 5 إلى 6 أيام
    if (site && !site.hasSite) {
      return {
        daysAr: 'من 5 إلى 6 أيام',
        daysEn: '5 – 6 Days',
        badge: 'بناء متكامل من الصفر · Full Build',
        platformLabel: platform.label,
        siteStatusLabel: site.label,
        themeLabel: theme ? theme.label : 'بناء كامل من الصفر',
        workLabel: 'إنشاء موقع جديد من الصفر',
        desc: `المدة التقديرية لبناء وتطوير موقع جديد بالكامل من الصفر بتقنية ${platform.label}.`
      };
    }

    // لو العميل عنده موقع بالفعل وهننفّذ تعديلات عليه: من 3 إلى 4 أيام
    if (site && site.hasSite) {
      return {
        daysAr: 'من 3 إلى 4 أيام',
        daysEn: '3 – 4 Days',
        badge: 'تطوير وتعديل · Custom Dev',
        platformLabel: platform.label,
        siteStatusLabel: site.label,
        themeLabel: theme ? theme.label : 'تعديلات على الموقع',
        workLabel: 'تعديلات على موقع حالي',
        desc: `المدة التقديرية لتنفيذ التعديلات والتطويرات على موقع ${platform.label} الحالي.`
      };
    }

    // لو اختار تعديل الثيم الحالي قبل تحديد سؤال 3
    if (theme && theme.type === 'current_theme') {
      return {
        daysAr: 'من 3 إلى 4 أيام',
        daysEn: '3 – 4 Days',
        badge: 'تطوير وتعديل · Custom Dev',
        platformLabel: platform.label,
        siteStatusLabel: 'موقع حالي',
        themeLabel: theme.label,
        workLabel: 'تعديلات على موقع حالي',
        desc: `المدة التقديرية لتنفيذ التعديلات والتطويرات على موقع ${platform.label} الحالي.`
      };
    }

    return null;
  }

  return null;
}

function hasAnswer(name) {
  const checkboxes = document.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(name)}"]`);
  if (checkboxes.length > 0) return document.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(name)}"]:checked`).length > 0;
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
    if (error) {
      if (answered) {
        error.textContent = '';
      } else {
        const errorText = (name === 'q10') ? 'يرجى اختيار أداة واحدة على الأقل.' : (name === 'q9' ? 'يرجى اختيار خيار واحد على الأقل.' : 'يرجى اختيار إجابة لهذا السؤال.');
        error.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> ${errorText}`;
      }
    }
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
  if (direction === -1 && currentPage === 1) {
    window.location.href = 'index.html';
    return;
  }
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
  if (prev) {
    prev.style.display = 'inline-flex';
    if (currentPage === 1) {
      prev.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        الرئيسية
      `;
      prev.title = 'العودة للصفحة الرئيسية (اختيار الخدمة)';
    } else {
      prev.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
        السابق
      `;
      prev.title = 'الصفحة السابقة';
    }
  }
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
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(name)}"]`);
    if (checkboxes.length > 0) {
      answers[name] = [...document.querySelectorAll(`input[type="checkbox"][name="${CSS.escape(name)}"]:checked`)].map(input => input.value);
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

function cleanLabel(element) {
  return (element?.innerText || element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function makePdfElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function extractUrls(text) {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+|[a-zA-Z0-9.-]+\.(?:com|org|net|sa|io|app|dev|ai|me|co|store|online|tech|shop|link)[^\s<]*)/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches.map(raw => raw.replace(/[.,،؛)\]}>]+$/, '')).filter(Boolean))];
}

function normalizeHref(url) {
  if (!url) return '';
  const clean = url.trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return 'https://' + clean;
}

function initLiveLinkPreviews() {
  document.querySelectorAll('.form-wrapper textarea').forEach(textarea => {
    let previewBox = textarea.parentElement.querySelector('.live-link-preview-box');
    if (!previewBox) {
      previewBox = document.createElement('div');
      previewBox.className = 'live-link-preview-box';
      previewBox.style.display = 'none';
      textarea.parentElement.appendChild(previewBox);
    }

    const updatePreview = () => {
      const urls = extractUrls(textarea.value);
      if (urls.length === 0) {
        previewBox.innerHTML = '';
        previewBox.style.display = 'none';
        return;
      }

      previewBox.innerHTML = '';
      previewBox.style.display = 'flex';

      const header = document.createElement('div');
      header.className = 'live-link-header';
      header.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        <span>روابط مضافة (اضغط للمعاينة والفتح في نافذة جديدة):</span>
      `;
      previewBox.appendChild(header);

      const list = document.createElement('div');
      list.className = 'live-link-list';

      urls.forEach(url => {
        const link = document.createElement('a');
        link.className = 'live-link-pill';
        link.href = normalizeHref(url);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = `فتح ${url}`;
        link.innerHTML = `
          <span>${url}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        `;
        list.appendChild(link);
      });

      previewBox.appendChild(list);
    };

    textarea.addEventListener('input', updatePreview);
    updatePreview();
  });
}

function formatTextWithLinks(container, text) {
  if (!text || !text.trim()) {
    container.textContent = 'لم تتم إضافة تفاصيل.';
    return;
  }

  const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+|[a-zA-Z0-9.-]+\.(?:com|org|net|sa|io|app|dev|ai|me|co|store|online|tech|shop|link)[^\s<]*)/gi;
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      container.appendChild(document.createElement('br'));
    }

    let lastIndex = 0;
    let match;
    urlRegex.lastIndex = 0;

    while ((match = urlRegex.exec(line)) !== null) {
      const matchStart = match.index;
      const matchEnd = urlRegex.lastIndex;

      if (matchStart > lastIndex) {
        container.appendChild(document.createTextNode(line.substring(lastIndex, matchStart)));
      }

      const rawUrl = match[0];
      const cleanUrl = rawUrl.replace(/[.,،؛)\]}>]+$/, '');
      const trailingPunct = rawUrl.substring(cleanUrl.length);

      const anchor = document.createElement('a');
      anchor.href = normalizeHref(cleanUrl);
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.className = 'clickable-pdf-link';
      anchor.textContent = cleanUrl;
      container.appendChild(anchor);

      if (trailingPunct) {
        container.appendChild(document.createTextNode(trailingPunct));
      }

      lastIndex = matchEnd;
    }

    if (lastIndex < line.length) {
      container.appendChild(document.createTextNode(line.substring(lastIndex)));
    }
  });
}

function addPdfDetail(question, label, value) {
  question.append(makePdfElement('p', 'pdf-detail-label', label));
  const detailBox = makePdfElement('div', 'pdf-detail');
  formatTextWithLinks(detailBox, value);
  question.append(detailBox);
}

function buildPrintableElement(answers) {
  const root = makePdfElement('div', 'pdf-export');
  root.setAttribute('dir', 'rtl');
  root.lang = 'ar';

  const header = makePdfElement('header', 'pdf-header');
  header.append(makePdfElement('div', 'pdf-brand', 'ROYA AGENCY'));
  header.append(makePdfElement('h1', 'pdf-title', 'استبيان متطلبات مشروع تطوير موقع إلكتروني'));
  header.append(makePdfElement('p', 'pdf-subtitle', 'Website Development Discovery & Requirements Questionnaire'));
  root.append(header);

  // Top of PDF page 1: Prominent Timeline Banner
  const timeline = getEstimatedTimeline();
  if (timeline) {
    const timelineBanner = makePdfElement('div', 'pdf-timeline-banner');
    const info = makePdfElement('div', 'pdf-timeline-info');
    info.append(makePdfElement('div', 'pdf-timeline-title', 'المدة الزمنية المتوقعة لتنفيذ المشروع · Estimated Project Timeline'));
    info.append(makePdfElement('div', 'pdf-timeline-desc', `${timeline.desc} (${timeline.platformLabel} — ${timeline.workLabel})`));

    const badge = makePdfElement('div', 'pdf-timeline-badge');
    badge.append(makePdfElement('span', 'pdf-timeline-days-ar', timeline.daysAr));
    badge.append(makePdfElement('span', 'pdf-timeline-days-en', ` (${timeline.daysEn})`));

    timelineBanner.append(info);
    timelineBanner.append(badge);
    root.append(timelineBanner);
  }

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
      const checkboxes = block.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length > 0) {
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
          const cleanLink = link.replace(/[.,،؛)\]}>]+$/, '');
          const anchor = makePdfElement('a', '', cleanLink);
          anchor.href = normalizeHref(cleanLink);
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          line.append(anchor);
          linkBlock.append(line);
        });
        assetSection.append(linkBlock);
      });
      section.append(assetSection);
    }
    root.append(section);
  }

  root.append(makePdfElement('p', 'pdf-footer', `Roya Agency — استبيان متطلبات تطوير الموقع الإلكتروني · ${new Date().toLocaleDateString('ar-EG')}`));
  return root;
}

async function submitForm() {
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    if (!validatePage(page)) {
      goToPage(page, true);
      return;
    }
  }

  const overlay = document.getElementById('successOverlay');
  overlay?.classList.remove('hidden');
  const button = document.getElementById('btnSubmit');
  if (button) button.disabled = true;

  try {
    const root = buildPrintableElement(collectAnswers());
    const reportHtml = root.outerHTML;

    window.royaPrintHtml = reportHtml;
    try { sessionStorage.setItem('roya_print_html', reportHtml); } catch (_) { }
    try { localStorage.setItem('roya_print_html', reportHtml); } catch (_) { }
    const printWindow = window.open('print.html', '_blank');
    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
      window.location.href = 'print.html';
      return;
    }
  } catch (error) {
    console.error('Print generation failed:', error);
    alert('حدث خطأ أثناء تجهيز الطباعة. يرجى المحاولة مرة أخرى.');
  } finally {
    overlay?.classList.add('hidden');
    if (button) button.disabled = false;
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