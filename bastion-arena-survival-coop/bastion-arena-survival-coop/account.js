(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const modal = $('account-modal');
  const form = $('account-form');
  const usernameInput = $('account-username');
  const passwordInput = $('account-password');
  const message = $('account-message');
  const submit = $('account-submit');
  const logout = $('account-logout');
  const openButton = $('account-open');
  const status = $('account-status');
  const subtitle = document.querySelector('.account-subtitle');
  let mode = 'login';
  let currentUser = null;

  const readLocal = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (_) { return fallback; }
  };
  const writeLocal = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  };
  const localData = () => ({
    profile: readLocal('bastion-profile', { runs: 0, kills: 0, highestLevel: 1 }),
    best: readLocal('bastion-best', { wave: 0, score: 0 })
  });
  async function api(path, options = {}) {
    const response = await fetch(`/api/${path}`, {
      credentials: 'same-origin', cache: 'no-store',
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
    });
    let data;
    try { data = await response.json(); } catch (_) { throw new Error('Réponse API invalide. Vérifie que le serveur Node tourne et que DATABASE_URL est définie.'); }
    if (!response.ok || data.ok === false) throw new Error(data.message || `Erreur serveur (${response.status}).`);
    return data;
  }
  function showMessage(text, error = false) {
    message.textContent = text;
    message.classList.toggle('error', error);
  }
  function setMode(next) {
    mode = next;
    $('tab-login').classList.toggle('active', mode === 'login');
    $('tab-register').classList.toggle('active', mode === 'register');
    $('account-title').textContent = mode === 'login' ? 'Connexion' : 'Créer un compte';
    submit.textContent = mode === 'login' ? 'Se connecter' : 'Créer mon compte';
    passwordInput.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    showMessage('');
  }
  function renderUser() {
    if (currentUser) {
      status.textContent = `Compte : ${currentUser.username}`;
      openButton.textContent = 'Mon compte';
      $('account-title').textContent = `Bienvenue, ${currentUser.username}`;
      if (subtitle) subtitle.textContent = 'La sauvegarde locale et la synchronisation en ligne sont actives.';
      form.hidden = true;
      $('account-tabs').hidden = true;
      logout.hidden = false;
      showMessage('Connecté · synchronisation activée.');
    } else {
      status.textContent = 'Mode local';
      openButton.textContent = 'Connexion';
      if (subtitle) subtitle.textContent = 'Synchronise tes records et statistiques sur ce serveur.';
      form.hidden = false;
      $('account-tabs').hidden = false;
      logout.hidden = true;
    }
  }
  function mergeAndStore(cloud) {
    const local = localData();
    const cp = cloud?.profile || {};
    const cb = cloud?.best || {};
    const profile = {
      runs: Math.max(Number(local.profile.runs) || 0, Number(cp.runs) || 0),
      kills: Math.max(Number(local.profile.kills) || 0, Number(cp.kills) || 0),
      highestLevel: Math.max(Number(local.profile.highestLevel) || 1, Number(cp.highestLevel) || 1)
    };
    const best = (Number(cb.score) || 0) > (Number(local.best.score) || 0)
      ? { score: Number(cb.score) || 0, wave: Number(cb.wave) || 0 }
      : { score: Number(local.best.score) || 0, wave: Number(local.best.wave) || 0 };
    writeLocal('bastion-profile', profile);
    writeLocal('bastion-best', best);
    return { profile, best };
  }
  async function syncAfterLogin() {
    const loaded = await api('load');
    const merged = mergeAndStore(loaded.save || {});
    await api('save', { method: 'POST', body: JSON.stringify(merged) });
  }
  openButton.addEventListener('click', () => { modal.hidden = false; if (!currentUser) usernameInput.focus(); });
  $('account-close').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', (event) => { if (event.target === modal) modal.hidden = true; });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) modal.hidden = true; });
  $('tab-login').addEventListener('click', () => setMode('login'));
  $('tab-register').addEventListener('click', () => setMode('register'));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submit.disabled = true;
    showMessage(mode === 'login' ? 'Connexion…' : 'Création du compte…');
    try {
      const result = await api('auth', { method: 'POST', body: JSON.stringify({ action: mode === 'login' ? 'login' : 'register', username: usernameInput.value.trim(), password: passwordInput.value }) });
      currentUser = result.user;
      passwordInput.value = '';
      renderUser();
      try {
        await syncAfterLogin();
        showMessage('Connecté · sauvegarde locale synchronisée avec le serveur.');
      } catch (syncError) {
        showMessage(`Compte connecté, mais synchronisation impossible : ${syncError.message}`, true);
      }
    } catch (error) {
      showMessage(error.message || 'Connexion impossible.', true);
    } finally { submit.disabled = false; }
  });
  logout.addEventListener('click', async () => {
    logout.disabled = true;
    try {
      await api('me', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
      currentUser = null; renderUser(); setMode('login'); showMessage('Déconnecté. La sauvegarde locale reste disponible.');
    } catch (error) { showMessage(error.message || 'Déconnexion impossible.', true); }
    finally { logout.disabled = false; }
  });
  window.BastionCloud = {
    isLoggedIn: () => !!currentUser,
    save: async (data) => {
      writeLocal('bastion-profile', data.profile);
      writeLocal('bastion-best', data.best);
      if (!currentUser) return { localOnly: true };
      return api('save', { method: 'POST', body: JSON.stringify(data) });
    },
    load: async () => {
      if (!currentUser) return localData();
      const loaded = await api('load');
      return mergeAndStore(loaded.save || {});
    }
  };
  async function init() {
    try {
      const data = await api('me');
      currentUser = data.user || null;
      renderUser();
      if (currentUser) {
        try { await syncAfterLogin(); }
        catch (error) { console.warn('[Bastion] Synchronisation initiale impossible:', error.message); }
      }
    } catch (error) {
      status.textContent = 'Mode local · serveur indisponible';
      console.warn('[Bastion] API non disponible:', error.message);
    }
  }
  setMode('login');
  renderUser();
  init();
})();
