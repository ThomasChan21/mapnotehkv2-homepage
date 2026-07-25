/**
 * Handles interest-registration form submit: POST to configured endpoint
 * or persist locally when no endpoint is set (development / static preview).
 */
(function initInterestForm() {
  const config = window.MapNoteInterestConfig || {};
  const endpoint = (config.FORM_ENDPOINT || '').trim();
  const storageKey = config.STORAGE_KEY || 'mapnotehk_interest_submissions';

  /** @type {HTMLFormElement | null} */
  const form = document.getElementById('interest-form');
  if (!form) return;

  const submitBtn = form.querySelector('[type="submit"]');
  const statusEl = document.getElementById('form-status');

  /** Human-readable labels for stored interest values. */
  const INTEREST_LABELS = {
    planning_map: '規劃申請地圖（免費）',
    note_ai_improve: 'AI 整理筆記（Premium）',
    pdf_brochure: '可分享 PDF（Premium）',
    planning_alerts: '規劃申請通知（Premium）',
    note_templates: '五類 workflow 筆記',
    ai_faq: 'AI 物業問答',
  };

  /**
   * Show accessible status message after submit.
   * @param {'success' | 'error'} type
   * @param {string} message
   */
  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.className = 'form-status form-status--' + type;
    statusEl.textContent = message;
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');
  }

  /**
   * Read selected interest checkbox values.
   * @returns {string[]}
   */
  function readInterests() {
    return Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(function mapChecked(input) {
      return /** @type {HTMLInputElement} */ (input).value;
    });
  }

  /**
   * Collect normalized payload from form fields.
   * @returns {Record<string, string>}
   */
  function readPayload() {
    const data = new FormData(form);
    const interests = readInterests();
    const interestLabels = interests.map(function mapLabel(key) {
      return INTEREST_LABELS[key] || key;
    });

    return {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      role: String(data.get('role') || '').trim(),
      district: String(data.get('district') || '').trim(),
      interests: interests.join(', '),
      interestLabels: interestLabels.join(' · '),
      submittedAt: new Date().toISOString(),
      source: 'mapnotehk-landing',
    };
  }

  /**
   * Validate required fields before submit.
   * @param {Record<string, string>} payload
   * @returns {string | null} Error message or null if valid.
   */
  function validate(payload) {
    if (!payload.name) return '請填寫姓名。';
    if (!payload.email) return '請填寫 Email。';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return '請輸入有效的 Email。';
    if (!payload.role) return '請選擇你的身份。';
    return null;
  }

  /**
   * Save submission to localStorage when no remote endpoint is configured.
   * @param {Record<string, string>} payload
   */
  function saveLocally(payload) {
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existing.push(payload);
    localStorage.setItem(storageKey, JSON.stringify(existing));
  }

  /**
   * POST interest data to remote endpoint (Formspree-compatible).
   * @param {Record<string, string>} payload
   */
  async function postRemote(payload) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Submit failed: ' + response.status);
  }

  form.addEventListener('submit', async function onSubmit(event) {
    event.preventDefault();

    const payload = readPayload();
    const error = validate(payload);
    if (error) {
      setStatus('error', error);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '提交中…';
    }

    try {
      if (endpoint) {
        await postRemote(payload);
      } else {
        saveLocally(payload);
        console.info('[MapNoteHK] Interest saved locally:', payload);
      }

      form.reset();
      setStatus(
        'success',
        '多謝登記！我們會在 MVP 測試開放時優先聯絡你。你選擇的功能會幫助我們安排試用次序。'
      );
    } catch (err) {
      console.error('[MapNoteHK] Interest submit failed:', err);
      setStatus('error', '提交失敗，請稍後再試或直接電郵 contact@mapnotehk.com。');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '提交使用意向';
      }
    }
  });
})();
