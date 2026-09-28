(() => {
  'use strict';

  const cloud = window.studentHubCloud;
  const app = window.studentHubApp;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const loading = $('#authLoading');
  const gate = $('#authGate');
  const shell = $('#appShell');
  const authMessage = $('#authMessage');
  const signupForm = $('#signupForm');
  const signinForm = $('#signinForm');
  const signupButton = $('#signupSubmit');
  const signinButton = $('#signinSubmit');
  const profileAvatar = $('#profileAvatar');
  const profileMenu = $('#profileMenu');
  const profileName = $('#profileName');
  const profileEmail = $('#profileEmail');
  const logoutButton = $('#logoutButton');
  const cloudStatusTitle = $('#cloudStatusTitle');
  const cloudStatusText = $('#cloudStatusText');

  let currentUser = null;
  let currentSemester = null;

  const COMMON_PASSWORD_PARTS = [
    'password', 'qwerty', 'letmein', 'welcome', 'admin', 'student',
    '123456', '12345678', '123456789', '111111', 'abc123', 'iloveyou'
  ];

  function setBusy(button, busy, busyText) {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyText;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  }

  function setMessage(message = '', type = 'neutral') {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.className = `auth-message ${message ? 'visible' : ''} ${type}`;
  }

  function humanizeError(error) {
    if (!error) return 'Something went wrong. Please try again.';
    if (error.code === 409) return 'An account with this email already exists. Try signing in.';
    if (error.code === 401) return 'Email or password is incorrect.';
    if (error.code === 429) return 'Too many attempts. Please wait a little and try again.';
    if (error.type === 'user_invalid_credentials') return 'Email or password is incorrect.';
    if (error.type === 'user_password_mismatch') return 'Email or password is incorrect.';
    return error.message || 'Something went wrong. Please try again.';
  }

  function initials(user) {
    const source = (user?.name || user?.email || 'Student Hub').trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }

  function personalTokens(name, email) {
    const tokens = [];
    const add = value => {
      String(value || '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(token => token.length >= 3)
        .forEach(token => tokens.push(token));
    };
    add(name);
    add(String(email || '').split('@')[0]);
    return [...new Set(tokens)];
  }

  function analyzePassword(password, name, email) {
    const lower = password.toLowerCase();
    const personal = personalTokens(name, email);

    const checks = {
      length: password.length >= 12,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9\s]/.test(password),
      personal: !personal.some(token => lower.includes(token)),
      common: !COMMON_PASSWORD_PARTS.some(part => lower.includes(part))
    };

    const structuralPassed = ['length', 'lower', 'upper', 'number', 'special']
      .filter(key => checks[key]).length;

    let level = 0;
    if (password.length) level = 1;
    if (structuralPassed >= 3) level = 2;
    if (structuralPassed === 5) level = 3;
    if (Object.values(checks).every(Boolean)) level = 4;

    const labels = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];

    return {
      checks,
      level,
      label: labels[level],
      valid: Object.values(checks).every(Boolean)
    };
  }

  function updatePasswordStrength() {
    const password = $('#signupPassword')?.value || '';
    const confirm = $('#signupPasswordConfirm')?.value || '';
    const name = $('#signupName')?.value || '';
    const email = $('#signupEmail')?.value || '';
    const result = analyzePassword(password, name, email);

    const meter = $('#passwordMeter');
    const label = $('#passwordStrengthLabel');
    if (meter) meter.dataset.level = String(result.level);
    if (label) label.textContent = result.label;

    Object.entries(result.checks).forEach(([key, ok]) => {
      const item = $(`[data-password-check="${key}"]`);
      if (!item) return;
      item.classList.toggle('passed', ok);
      item.setAttribute('aria-checked', ok ? 'true' : 'false');
    });

    const match = Boolean(password) && password === confirm;
    const matchItem = $('[data-password-check="match"]');
    if (matchItem) {
      matchItem.classList.toggle('passed', match);
      matchItem.setAttribute('aria-checked', match ? 'true' : 'false');
    }

    const fieldsReady = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);
    if (signupButton) signupButton.disabled = !(result.valid && match && fieldsReady);

    return { ...result, match, fieldsReady };
  }

  function setAuthMode(mode) {
    const signup = mode === 'signup';
    signinForm?.classList.toggle('hidden', signup);
    signupForm?.classList.toggle('hidden', !signup);
    $$('[data-auth-mode]').forEach(button => {
      const active = button.dataset.authMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    setMessage('');
    setTimeout(() => (signup ? $('#signupName') : $('#signinEmail'))?.focus(), 30);
  }

  function showAuth() {
    loading?.classList.add('hidden');
    shell?.classList.add('hidden');
    gate?.classList.remove('hidden');
    document.body.classList.add('auth-open');
    setAuthMode('signin');
  }

  async function showApp(user) {
    currentUser = user;

    try {
      currentSemester = await cloud.ensureSemester(user);
    } catch (error) {
      console.error('Semester sync failed:', error);
      currentSemester = null;
    }

    let academicSync = { academicCloudReady: false };
    if (app?.setCloudContext) {
      academicSync = await app.setCloudContext(user, currentSemester);
    } else {
      app?.setUserContext?.(user.$id, currentSemester?.name || 'My Semester');
    }

    if (profileAvatar) {
      profileAvatar.textContent = initials(user);
      profileAvatar.setAttribute('aria-label', `Open account menu for ${user.name || user.email}`);
    }
    if (profileName) profileName.textContent = user.name || 'Student';
    if (profileEmail) profileEmail.textContent = user.email || '';

    if (cloudStatusTitle) {
      cloudStatusTitle.textContent = academicSync?.academicCloudReady && academicSync?.plannerCloudReady && academicSync?.knowledgeCloudReady
        ? 'Full semester cloud synced'
        : (academicSync?.academicCloudReady && academicSync?.plannerCloudReady
          ? 'Academic + planner cloud synced'
          : (academicSync?.academicCloudReady ? 'Academic cloud synced' : (currentSemester ? 'Semester connected' : 'Account connected')));
    }
    if (cloudStatusText) {
      cloudStatusText.textContent = academicSync?.academicCloudReady && academicSync?.plannerCloudReady && academicSync?.knowledgeCloudReady
        ? `${currentSemester.name}: ${academicSync.courses || 0} courses, ${academicSync.assessments || 0} assessments, ${academicSync.tasks || 0} tasks, ${academicSync.resources || 0} resources, ${academicSync.inbox || 0} open Inbox items, and ${academicSync.studySessions || 0} study sessions are stored in Appwrite.`
        : (academicSync?.academicCloudReady && academicSync?.plannerCloudReady
          ? `${currentSemester.name}: academic and planner data are synced, but Library/Inbox/study need the resources, inbox_items, and study_sessions tables.`
          : (academicSync?.academicCloudReady
            ? `${currentSemester.name}: courses and assessments are synced, but planner cloud needs the tasks/work_blocks tables.`
            : (currentSemester
              ? `${currentSemester.name} is connected, but Courses/Assessments cloud sync is not ready yet. Check the Appwrite table setup.`
              : 'Signed in with Appwrite. Semester sync needs attention.')));
    }

    loading?.classList.add('hidden');
    gate?.classList.add('hidden');
    shell?.classList.remove('hidden');
    document.body.classList.remove('auth-open');
  }

  async function bootstrap() {
    if (!cloud?.ready) {
      loading?.classList.add('hidden');
      gate?.classList.remove('hidden');
      shell?.classList.add('hidden');
      setMessage('Appwrite could not initialize. Check appwrite.js and the browser console.', 'error');
      return;
    }

    try {
      const user = await cloud.getCurrentUser();
      if (user) await showApp(user);
      else showAuth();
    } catch (error) {
      console.error(error);
      showAuth();
      setMessage(humanizeError(error), 'error');
    }
  }

  signinForm?.addEventListener('submit', async event => {
    event.preventDefault();
    setMessage('');
    setBusy(signinButton, true, 'Signing in…');

    try {
      await cloud.signIn({
        email: $('#signinEmail').value.trim(),
        password: $('#signinPassword').value
      });
      const user = await cloud.getCurrentUser();
      await showApp(user);
    } catch (error) {
      setMessage(humanizeError(error), 'error');
    } finally {
      setBusy(signinButton, false);
    }
  });

  signupForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const strength = updatePasswordStrength();

    if (!strength.valid || !strength.match || !strength.fieldsReady) {
      setMessage('Please satisfy every password requirement before creating your account.', 'error');
      return;
    }

    setMessage('');
    setBusy(signupButton, true, 'Creating account…');

    const payload = {
      name: $('#signupName').value.trim(),
      email: $('#signupEmail').value.trim(),
      password: $('#signupPassword').value
    };

    try {
      await cloud.signUp(payload);
      await cloud.signIn({ email: payload.email, password: payload.password });
      const user = await cloud.getCurrentUser();
      await showApp(user);
      app?.toast?.('Account created. Welcome to Student Hub.');
    } catch (error) {
      setMessage(humanizeError(error), 'error');
    } finally {
      setBusy(signupButton, false);
      updatePasswordStrength();
    }
  });

  ['signupName', 'signupEmail', 'signupPassword', 'signupPasswordConfirm']
    .forEach(id => $(`#${id}`)?.addEventListener('input', updatePasswordStrength));

  $$('[data-auth-mode]').forEach(button => {
    button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
  });

  profileAvatar?.addEventListener('click', event => {
    event.stopPropagation();
    profileMenu?.classList.toggle('hidden');
  });

  logoutButton?.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try {
      await cloud.signOut();
      currentUser = null;
      currentSemester = null;
      profileMenu?.classList.add('hidden');
      app?.resetUserContext?.();
      showAuth();
      setMessage('You have been signed out.', 'success');
    } catch (error) {
      app?.toast?.(humanizeError(error));
    } finally {
      logoutButton.disabled = false;
    }
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.profile-wrap')) profileMenu?.classList.add('hidden');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') profileMenu?.classList.add('hidden');
  });

  updatePasswordStrength();
  bootstrap();
})();
