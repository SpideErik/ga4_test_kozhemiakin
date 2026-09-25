'use strict';
// На следующих занятиях здесь можно добавить обработчики учебных событий.
// Google Tag устанавливается отдельно в head каждой HTML-страницы.
(() => {
  const leadForm = document.querySelector('#lead-form');
  if (!leadForm) return;
  const params = new URLSearchParams(window.location.search);
  const defaults = {utm_source:'direct', utm_medium:'none', utm_campaign:'not_set'};
  for (const [key, fallback] of Object.entries(defaults)) {
    leadForm.elements.namedItem(key).value = params.get(key)?.trim() || fallback;
  }
  const requestId = leadForm.elements.namedItem('request_id');
  leadForm.addEventListener('submit', event => {
    // Это защита от случайной отправки неполностью настроенного примера.
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(leadForm.action)) {
      event.preventDefault();
      document.querySelector('#form-status').textContent = 'Сначала укажите URL опубликованного Apps Script Web App.';
      return;
    }
    // Повторная доставка той же заявки сохраняет ID. Новый ID — после reset.
    if (!requestId.value) requestId.value = 'REQ-' + crypto.randomUUID().toUpperCase();
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {lead_source:'contact_form'});
    }
    document.querySelector('#form-status').textContent =
      'POST отправляется. Подтвердите сохранение по request_id в таблице: ' + requestId.value;
    // На штатном пути preventDefault() НЕ вызываем: браузер отправляет POST.
    // Событие GA4 отражает попытку отправки, а не ответ сервера.
  });
  leadForm.addEventListener('reset', () => {
    setTimeout(() => {
      requestId.value = '';
      for (const [key, fallback] of Object.entries(defaults)) {
        leadForm.elements.namedItem(key).value = params.get(key)?.trim() || fallback;
      }
      document.querySelector('#form-status').textContent = 'Можно заполнить новую заявку.';
    }, 0);
  });
})();

const programCta = document.querySelector('#program-cta');
if (programCta) {
  programCta.addEventListener('click', () => {
    document.querySelector('#program-preview').hidden = false;
    gtag('event', 'cta_click', {
      button_name: 'program',
      page_section: 'hero'
    });
  });
}

document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => {
    gtag('event', 'nav_click', {
      link_text: link.textContent.trim(),
      from_page: document.title
    });
  });
});

const params = new URLSearchParams(window.location.search);
const utmSource = params.get('utm_source');
if (utmSource) {
  gtag('event', 'utm_visit', {
    utm_source: utmSource,
    utm_medium: params.get('utm_medium') || 'not_set',
    utm_campaign: params.get('utm_campaign') || 'not_set',
    landing_page: window.location.pathname
  });
}

let readCounted = false;
setTimeout(() => {
  if (readCounted || document.hidden) return;
  readCounted = true;
  gtag('event', 'read_30s', {
    page_path: window.location.pathname
  });
}, 30000);

const leadFormFields = document.querySelector('#contact-form');
if (leadFormFields) {
  leadFormFields.addEventListener('invalid', (event) => {
    gtag('event', 'form_error', {
      field_name: event.target.name || 'unknown',
      form_id: 'lead-form'
    });
  }, true);
}
