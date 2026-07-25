/**
 * Landing page init: hero quick-form scroll + URL interest pre-fill.
 */
(function initLandingPage() {
  /** Map URL ?interest= values to checkbox values. */
  const INTEREST_ALIASES = {
    note_ai_improve: 'note_ai_improve',
    pdf_brochure: 'pdf_brochure',
    planning_alerts: 'planning_alerts',
    ozp: 'planning_alerts',
    planning_map: 'planning_map',
  };

  /**
   * Pre-fill signup email when user submits hero quick form.
   */
  function initHeroQuickForm() {
    const heroForm = document.getElementById('hero-interest-form');
    const signupEmail = document.getElementById('signup-email');
    if (!heroForm || !signupEmail) return;

    heroForm.addEventListener('submit', function onHeroSubmit(event) {
      event.preventDefault();
      const emailInput = document.getElementById('hero-email');
      const email = emailInput ? emailInput.value.trim() : '';
      if (email) signupEmail.value = email;
      const signupSection = document.getElementById('signup');
      if (signupSection) signupSection.scrollIntoView({ behavior: 'smooth' });
      signupEmail.focus();
    });
  }

  /**
   * Pre-check interest checkboxes from ?interest= query param (supports hash links).
   * @returns {void}
   */
  function initInterestFromUrl() {
    const hash = window.location.hash || '';
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(window.location.search || hashQuery);
    const rawInterest = params.get('interest');
    if (!rawInterest) return;

    const interestKey = INTEREST_ALIASES[rawInterest] || rawInterest;
    const checkbox = document.querySelector(
      'input[name="interests"][value="' + interestKey + '"]'
    );
    if (checkbox instanceof HTMLInputElement) {
      checkbox.checked = true;
    }

    if (hash.startsWith('#signup')) {
      const signupSection = document.getElementById('signup');
      if (signupSection) {
        requestAnimationFrame(function scrollToSignup() {
          signupSection.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  }

  initHeroQuickForm();
  initInterestFromUrl();
  window.addEventListener('hashchange', initInterestFromUrl);
})();
