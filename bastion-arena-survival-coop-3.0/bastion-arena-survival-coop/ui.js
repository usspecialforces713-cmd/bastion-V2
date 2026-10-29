// ───────── Bastion Arena 3.0 — lobby, modes, squad, shop, leaderboard, results ─────────
const UI = (() => {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = n => '#' + (n >>> 0).toString(16).padStart(6, '0');
  const ov = () => $('ov');

  // ── Content ────────────────────────────────────────────────
  const STARTERS = ['tireur', 'guerrier', 'medic', 'mage', 'assassin', 'gardien', 'archer', 'pyro'];
  const TIER1 = ['neant', 'meteor', 'terre', 'plant', 'givre', 'volt', 'ingenieur', 'toxine'];
  const TIER2 = ['necro', 'ombre', 'samourai', 'paladin', 'chasseur', 'maree', 'vent', 'sable', 'boomerang', 'pirate'];
  const price = k => STARTERS.includes(k) ? 0 : TIER1.includes(k) ? 400 : TIER2.includes(k) ? 800 : 1400;
  const ROLE_TAG = { tireur: 'ranged', archer: 'ranged', boomerang: 'ranged', pirate: 'ranged', ingenieur: 'tech', mecha: 'tech', medic: 'support', paladin: 'support', gardien: 'tank', terre: 'tank', assassin: 'assault', ombre: 'assault', samourai: 'assault', guerrier: 'melee', mage: 'magic', neant: 'magic', pyro: 'magic', meteor: 'magic', givre: 'magic', volt: 'magic', necro: 'summon', druide: 'shape', dragon: 'shape', plant: 'control', toxine: 'control', chasseur: 'control', maree: 'control', vent: 'control', sable: 'control', magnet: 'control', joker: 'special', miroir: 'special' };
  const SKINS = [
    { id: 'default', price: 0, name: { en: 'Default', fr: 'Défaut' } },
    { id: 'cyber', col: 0xff2bd6, price: 300, name: { en: 'Cyber Pink', fr: 'Cyber Rose' } },
    { id: 'toxic', col: 0x7dff3a, price: 300, name: { en: 'Toxic', fr: 'Toxique' } },
    { id: 'frost', col: 0x8fe9ff, price: 300, name: { en: 'Frost', fr: 'Givré' } },
    { id: 'void', col: 0x9b5cff, price: 650, name: { en: 'Void', fr: 'Néant' } },
    { id: 'gold', col: 0xffc94a, price: 900, name: { en: 'Gold Chrome', fr: 'Chrome Or' } }
  ];
  const MODES = {
    survival: { icon: '🛡️', mult: 1, grad: 'linear-gradient(135deg,#19f0ff,#3a5bff)' },
    blitz: { icon: '⚡', mult: 1.15, grad: 'linear-gradient(135deg,#ffd166,#ff6b2b)' },
    bossrush: { icon: '💀', mult: 1.6, grad: 'linear-gradient(135deg,#ff2e63,#8a1cff)' },
    mega: { icon: '🏰', mult: 1.4, grad: 'linear-gradient(135deg,#ff2bd6,#7c4dff)' },
    daily: { icon: '📅', mult: 1.25, grad: 'linear-gradient(135deg,#7dff3a,#19c8ff)' }
  };
  const MODS = ['glass', 'speed', 'horde', 'tank', 'crit', 'regen'];
  const RANKS = [0, 100, 250, 500, 900, 1400, 2000];
  const RANK_COL = ['#d0884f', '#c9d3e6', '#ffd166', '#5ff5e0', '#7cc8ff', '#ff5ad8', '#ffef6b'];
  const today = () => new Date().toISOString().slice(0, 10);
  function dailyMods(date = today()) { let h = 0; for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0; const a = h % MODS.length; let b = (h >>> 8) % MODS.length; if (b === a) b = (b + 1) % MODS.length; return [MODS[a], MODS[b]]; }

  // ── Profile (local first, synced to the cloud when signed in) ──
  const KEY = 'bastion-v3';
  function blank() { return { v: 3, coins: 300, xp: 0, lvl: 1, trophies: 0, runs: 0, kills: 0, best: {}, unlocked: STARTERS.slice(), skins: { owned: {}, eq: {} }, squad: ['tireur', 'guerrier', 'medic', 'mage'], mode: 'survival', daily: { date: '', done: false }, history: [] }; }
  function load() {
    let p = null; try { p = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!p || p.v !== 3) {
      p = blank();
      try { const ob = JSON.parse(localStorage.getItem('bastion-best')); const op = JSON.parse(localStorage.getItem('bastion-profile')); if (ob) p.best.survival = { score: ob.score | 0, wave: ob.wave | 0 }; if (op) { p.runs = op.runs | 0; p.kills = op.kills | 0; } } catch (e) {}
    }
    const b = blank(); for (const k in b) if (p[k] === undefined) p[k] = b[k];
    p.unlocked = [...new Set([...STARTERS, ...(p.unlocked || [])])].filter(k => ROLES[k]);
    p.squad = (p.squad || []).filter(k => p.unlocked.includes(k)).slice(0, 6); if (!p.squad.length) p.squad = ['tireur', 'guerrier', 'medic', 'mage'];
    if (!MODES[p.mode]) p.mode = 'survival';
    return p;
  }
  let P = load();
  let syncT = 0;
  function save(sync = true) {
    try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {}
    if (sync) { clearTimeout(syncT); syncT = setTimeout(cloudSave, 600); }
  }
  function bestOverall() { let s = 0, w = 0; for (const k in P.best) { s = Math.max(s, P.best[k].score | 0); w = Math.max(w, P.best[k].wave | 0); } return { score: s, wave: w }; }
  function cloudSave() {
    try { if (window.BastionCloud) window.BastionCloud.save({ profile: { runs: P.runs, kills: P.kills, highestLevel: P.lvl }, best: bestOverall(), progress: P }).catch(() => {}); } catch (e) {}
  }
  function adoptCloud(progress) {
    const score = p => (p.lvl | 0) * 100000 + (p.xp | 0);
    if (progress && progress.v === 3 && score(progress) > score(P)) { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(blank(), progress))); } catch (e) {} P = load(); refresh(); }
  }
  const xpNeed = l => 120 + l * 60;
  const rankOf = tr => { let r = 0; for (let i = 0; i < RANKS.length; i++) if (tr >= RANKS[i]) r = i; return r; };
  const skinCol = k => { const id = P.skins.eq[k]; const s = SKINS.find(x => x.id === id); return s && s.col ? s.col : ROLES[k].col; };
  const heroName = k => ROLES[k] ? ROLES[k].name : k;

  // ── Small helpers ──
  let toastT = 0;
  function toast(msg, kind = '') { let el = $('toast'); if (!el) return; el.textContent = msg; el.className = 'toast show ' + kind; clearTimeout(toastT); toastT = setTimeout(() => el.className = 'toast', 2200); }
  function blip(f = 660) { try { if (typeof snd === 'function') snd(f, .07, 'triangle'); } catch (e) {} }
  function topBar() {
    const r = rankOf(P.trophies), need = xpNeed(P.lvl);
    return `<header class="lb-top">
      <div class="brand"><div class="logo">B<i></i></div><div><b class="glitch" data-t="BASTION">BASTION</b><small>ARENA · 3.0</small></div></div>
      <div class="chips">
        <div class="chip player"><span class="ava">${esc((userName() || 'G')[0].toUpperCase())}</span><span><b>${esc(userName() || t('guest'))}</b><small>${t('level')} ${P.lvl}</small><i class="xpb"><u style="width:${Math.min(100, P.xp / need * 100)}%"></u></i></span></div>
        <div class="chip coin" title="${t('coins')}"><span>🪙</span><b id="coin-n">${P.coins}</b></div>
        <div class="chip rank" style="--rk:${RANK_COL[r]}" title="${t('trophies')}"><span>🏆</span><b>${P.trophies}</b><small>${t('rank_' + r)}</small></div>
        <button class="chip icon" data-go="settings" aria-label="${t('settings')}">⚙️</button>
      </div></header>`;
  }
  function userName() { try { const u = window.BastionCloud && window.BastionCloud.user && window.BastionCloud.user(); return u ? u.username : ''; } catch (e) { return ''; } }
  function nav(active) {
    const tabs = [['lobby', '🏠', 'PLAY'], ['modes', '🎮', 'modes'], ['squad', '🦸', 'heroes'], ['shop', '🛒', 'shop'], ['ranks', '🏆', 'ranks']];
    return `<nav class="lb-nav">${tabs.map(([id, ic, k]) => `<button data-go="${id}" class="${active === id ? 'on' : ''}"><span>${ic}</span>${k === 'PLAY' ? t('lobby') : t(k)}</button>`).join('')}</nav>`;
  }
  function shell(active, inner, cls = '') {
    const o = ov(); o.hidden = false; o.className = 'ui-screen ' + cls;
    o.innerHTML = `<div class="ui-wrap">${topBar()}${inner}${nav(active)}</div><div id="toast" class="toast"></div>`;
    if (o.dataset.scr !== active) { o.scrollTop = 0; o.dataset.scr = active; }
    o.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { blip(520); go(b.dataset.go); });
    document.body.dataset.screen = active;
  }
  let current = 'lobby';
  function go(id) { current = id; ({ lobby, modes, squad, shop, ranks, settings }[id] || lobby)(); }
  function refresh() { if (S && (S.mode === 'menu')) go(current); }

  // ── Lobby ──
  let online = null, feed = [];
  function lobby() {
    const m = P.mode, md = MODES[m], b = P.best[m] || {};
    const squadHtml = P.squad.map((k, i) => `<div class="sq" style="--c:${hex(skinCol(k))}"><b>${i + 1}</b><span>${esc(heroName(k))}</span></div>`).join('');
    const isDaily = m === 'daily', mods = dailyMods();
    shell('lobby', `<main class="lobby">
      <section class="hero-col">
        <div class="kicker">${online != null ? `<span class="dot"></span>${t('online', { n: online })}` : `<span class="dot off"></span>${t('offline')}`}</div>
        <h1 class="title"><span>BASTION</span><em>ARENA</em></h1>
        <p class="tag">${t('tagline')}</p>
        <div class="mode-pick" style="--g:${md.grad}">
          <button class="arrow" id="m-prev" aria-label="prev">‹</button>
          <div class="mode-face" id="m-face"><span class="ic">${md.icon}</span><div><b>${t('m_' + m)}</b><small>${t('m_' + m + '_d')}</small>
            ${isDaily ? `<div class="mods">${mods.map(x => `<span>${t('mod_' + x)} · ${t('mod_' + x + '_d')}</span>`).join('')}</div>` : ''}
            <div class="meta"><span>${t('reward', { x: md.mult })}</span>${b.score ? `<span>★ ${b.score}</span>` : ''}${isDaily && P.daily.date === today() && P.daily.done ? `<span>${t('dailyDone')}</span>` : isDaily ? `<span class="hot">🪙×2</span>` : ''}</div></div></div>
          <button class="arrow" id="m-next" aria-label="next">›</button>
        </div>
        <button class="play-btn" id="play"><span>${t('play')}</span><i>▶</i></button>
        <div class="squad-strip"><div class="sq-list">${squadHtml}</div><button class="ghost" data-go="squad">✎ ${t('heroes')}</button></div>
      </section>
      <aside class="side-col">
        <div class="glass stats"><h3>${t('statsTitle')}</h3><div class="grid4">
          <div><small>${t('bestScore')}</small><b>${bestOverall().score || '—'}</b></div><div><small>${t('bestWave')}</small><b>${bestOverall().wave || '—'}</b></div>
          <div><small>${t('runs')}</small><b>${P.runs}</b></div><div><small>${t('kills')}</small><b>${P.kills}</b></div></div></div>
        <div class="glass feed"><h3><span class="dot"></span>${t('lbRecent')}</h3><ul id="feed">${feedHtml()}</ul></div>
      </aside></main>`, 'lobby-screen');
    const keys = Object.keys(MODES), cyc = d => { P.mode = keys[(keys.indexOf(P.mode) + d + keys.length) % keys.length]; save(false); blip(700); lobby(); };
    $('m-prev').onclick = () => cyc(-1); $('m-next').onclick = () => cyc(1); $('m-face').onclick = () => go('modes');
    $('play').onclick = () => launch(P.mode);
  }
  function feedHtml() {
    if (!feed.length) return `<li class="muted">${online == null ? t('lbOffline') : t('lbEmpty')}</li>`;
    return feed.slice(0, 7).map(r => `<li><b>${esc(r.username)}</b> <span>${t('m_' + r.mode) || r.mode}</span> <em>${r.score}</em><small>${t('wave')} ${r.wave}</small></li>`).join('');
  }

  // ── Modes ──
  function modes() {
    const mods = dailyMods();
    shell('modes', `<main class="page"><h2>${t('chooseMode')}</h2><div class="mode-grid">${Object.keys(MODES).map(k => { const m = MODES[k], b = P.best[k] || {};
      return `<button class="mode-card ${P.mode === k ? 'on' : ''}" data-m="${k}" style="--g:${m.grad}"><span class="ic">${m.icon}</span><b>${t('m_' + k)}</b><small>${t('m_' + k + '_d')}</small>
      ${k === 'daily' ? `<div class="mods">${mods.map(x => `<span>${t('mod_' + x)}</span>`).join('')}</div>` : ''}<div class="meta"><span>${t('reward', { x: m.mult })}</span>${b.score ? `<span>★ ${b.score}</span>` : ''}</div></button>`; }).join('')}</div></main>`, 'page-screen');
    ov().querySelectorAll('.mode-card').forEach(b => b.onclick = () => { P.mode = b.dataset.m; save(false); blip(760); go('lobby'); });
  }

  // ── Squad / heroes ──
  let filter = 'all', query = '';
  function squad() {
    const tags = ['all', ...new Set(Object.values(ROLE_TAG))];
    shell('squad', `<main class="page"><div class="page-head"><div><h2>${t('chooseSquad')}</h2><p>${t('squadHint')}</p></div><div class="count" id="cnt">${P.squad.length} / 6</div></div>
      <div class="filters"><input id="hq" type="search" placeholder="🔎" value="${esc(query)}">${tags.map(x => `<button class="pill ${filter === x ? 'on' : ''}" data-f="${x}">${x === 'all' ? '★' : t('roleTag_' + x)}</button>`).join('')}</div>
      <div class="hero-grid" id="hg"></div>
      <div class="page-actions"><button class="ghost" data-go="lobby">← ${t('back')}</button><button class="play-btn small" id="play2"><span>${t('deploy')}</span><i>▶</i></button></div></main>`, 'page-screen');
    const draw = () => {
      const q = query.toLocaleLowerCase();
      $('hg').innerHTML = Object.keys(ROLES).filter(k => (filter === 'all' || ROLE_TAG[k] === filter) && (heroName(k) + ' ' + heroDesc(k)).toLocaleLowerCase().includes(q)).map(k => {
        const r = ROLES[k], own = P.unlocked.includes(k), idx = P.squad.indexOf(k), mv = typeof CHARGED_MOVES !== 'undefined' && CHARGED_MOVES[k];
        return `<button class="h-card ${idx >= 0 ? 'sel' : ''} ${own ? '' : 'locked'}" data-k="${k}" style="--c:${hex(skinCol(k))}">
          <div class="h-art"><div class="h-sil"><i class="hd"></i><i class="bd"></i></div><span class="num">${idx >= 0 ? idx + 1 : own ? '+' : '🔒'}</span></div>
          <div class="h-info"><b>${esc(r.name)}</b><span class="tagp">${t('roleTag_' + (ROLE_TAG[k] || 'special'))}</span><small>${esc(heroDesc(k))}</small>
          <div class="h-stats"><span>♥ ${r.hp}</span><span>➜ ${r.spd}</span>${mv ? `<span class="mv">R · ${esc(mv.name)}</span>` : ''}</div>
          ${own ? '' : `<span class="price">🪙 ${price(k)}</span>`}</div></button>`;
      }).join('');
      $('cnt').textContent = P.squad.length + ' / 6';
      $('hg').querySelectorAll('.h-card').forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        if (!P.unlocked.includes(k)) { buyHero(k, draw); return; }
        if (P.squad.includes(k)) { if (P.squad.length > 1) P.squad = P.squad.filter(x => x !== k); } else if (P.squad.length < 6) P.squad.push(k);
        blip(600 + P.squad.length * 40); save(false); draw();
      });
    };
    $('hq').oninput = e => { query = e.target.value; draw(); };
    ov().querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; squad(); });
    $('play2').onclick = () => launch(P.mode);
    draw();
  }
  let pendingBuy = null, pendingT = 0;
  function buyHero(k, after) {
    const c = price(k);
    if (P.coins < c) { toast(t('notEnough') + ' · 🪙 ' + c, 'bad'); blip(180); return; }
    if (pendingBuy !== k) { pendingBuy = k; clearTimeout(pendingT); pendingT = setTimeout(() => pendingBuy = null, 3000); toast(t('unlock') + ' ' + heroName(k) + ' · 🪙 ' + c + ' — tap again ✓'); blip(500); return; }
    pendingBuy = null;
    P.coins -= c; P.unlocked.push(k); save(); toast(heroName(k) + ' · ' + t('bought'), 'good'); blip(880); after && after();
    const cn = $('coin-n'); if (cn) cn.textContent = P.coins;
  }

  // ── Shop ──
  let shopTab = 'heroes', shopHero = null;
  function shop() {
    if (!shopHero || !P.unlocked.includes(shopHero)) shopHero = P.squad[0];
    let body = '';
    if (shopTab === 'heroes') {
      const locked = Object.keys(ROLES).filter(k => !P.unlocked.includes(k)).sort((a, b) => price(a) - price(b));
      body = `<div class="shop-grid">${locked.length ? locked.map(k => `<button class="shop-item" data-k="${k}" style="--c:${hex(ROLES[k].col)}"><div class="h-sil big"><i class="hd"></i><i class="bd"></i></div><b>${esc(heroName(k))}</b><small>${esc(heroDesc(k))}</small><span class="price">🪙 ${price(k)}</span></button>`).join('') : `<p class="muted">✓</p>`}</div>`;
    } else {
      const own = P.skins.owned[shopHero] || ['default'], eq = P.skins.eq[shopHero] || 'default';
      body = `<div class="filters">${P.unlocked.map(k => `<button class="pill ${k === shopHero ? 'on' : ''}" data-h="${k}">${esc(heroName(k))}</button>`).join('')}</div>
        <h3 class="sub">${t('skinOf', { h: esc(heroName(shopHero)) })}</h3>
        <div class="skin-grid">${SKINS.map(s => { const c = s.col || ROLES[shopHero].col, has = s.id === 'default' || own.includes(s.id), on = eq === s.id;
          return `<button class="skin ${on ? 'on' : ''}" data-s="${s.id}" style="--c:${hex(c)}"><div class="h-sil big"><i class="hd"></i><i class="bd"></i></div><b>${s.name[LANG] || s.name.en}</b><span class="${has ? 'own' : 'price'}">${on ? t('equipped') : has ? t('equip') : '🪙 ' + s.price}</span></button>`; }).join('')}</div>`;
    }
    shell('shop', `<main class="page"><div class="page-head"><h2>${t('shop')}</h2><div class="tabs"><button class="pill ${shopTab === 'heroes' ? 'on' : ''}" data-t="heroes">${t('shopHeroes')}</button><button class="pill ${shopTab === 'skins' ? 'on' : ''}" data-t="skins">${t('shopSkins')}</button></div></div>${body}</main>`, 'page-screen');
    ov().querySelectorAll('[data-t]').forEach(b => b.onclick = () => { shopTab = b.dataset.t; shop(); });
    ov().querySelectorAll('.shop-item').forEach(b => b.onclick = () => buyHero(b.dataset.k, shop));
    ov().querySelectorAll('[data-h]').forEach(b => b.onclick = () => { shopHero = b.dataset.h; shop(); });
    ov().querySelectorAll('.skin').forEach(b => b.onclick = () => {
      const s = SKINS.find(x => x.id === b.dataset.s), own = P.skins.owned[shopHero] || [];
      if (s.id !== 'default' && !own.includes(s.id)) { if (P.coins < s.price) { toast(t('notEnough'), 'bad'); return; } P.coins -= s.price; P.skins.owned[shopHero] = [...own, s.id]; toast(t('bought'), 'good'); }
      P.skins.eq[shopHero] = s.id; blip(900); save(); shop();
    });
  }

  // ── Leaderboard ──
  let lbMode = 'survival';
  async function ranks() {
    const local = (P.history || []).filter(h => h.mode === lbMode).sort((a, b) => b.score - a.score).slice(0, 5);
    shell('ranks', `<main class="page"><div class="page-head"><h2>${t('lbTitle')}</h2><div class="tabs">${Object.keys(MODES).map(k => `<button class="pill ${lbMode === k ? 'on' : ''}" data-l="${k}">${MODES[k].icon} ${t('m_' + k)}</button>`).join('')}</div></div>
      <div class="lb-cols"><div class="glass"><table class="lb"><thead><tr><th>#</th><th>${t('account')}</th><th>${t('score')}</th><th>${t('wave')}</th></tr></thead><tbody id="lb-body"><tr><td colspan="4" class="muted">…</td></tr></tbody></table></div>
      <div class="glass"><h3>${t('lbLocal')}</h3><ul class="loc">${local.length ? local.map(h => `<li><b>${h.score}</b><span>${t('wave')} ${h.wave}</span><small>${esc(h.date)}</small></li>`).join('') : `<li class="muted">${t('lbEmpty')}</li>`}</ul>
      ${userName() ? '' : `<p class="muted small">${t('signInToRank')}</p><button class="ghost" id="lb-sign">${t('signin')}</button>`}</div></div></main>`, 'page-screen');
    ov().querySelectorAll('[data-l]').forEach(b => b.onclick = () => { lbMode = b.dataset.l; ranks(); });
    const sb = $('lb-sign'); if (sb) sb.onclick = () => { const a = $('account-open'); if (a) a.click(); };
    const rows = await lbFetch(lbMode), body = $('lb-body'); if (!body) return;
    if (!rows) { body.innerHTML = `<tr><td colspan="4" class="muted">${t('lbOffline')}</td></tr>`; return; }
    if (!rows.length) { body.innerHTML = `<tr><td colspan="4" class="muted">${t('lbEmpty')}</td></tr>`; return; }
    const me = userName();
    body.innerHTML = rows.map((r, i) => `<tr class="${r.username === me ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td>${esc(r.username)}<small>${esc((r.squad || '').split(',').map(k => ROLES[k] ? ROLES[k].name : '').filter(Boolean).slice(0, 3).join(' · '))}</small></td><td><b>${r.score}</b></td><td>${r.wave}</td></tr>`).join('');
  }
  async function lbFetch(mode) {
    try { if (!window.BastionCloud || !window.BastionCloud.api) return null; const d = await window.BastionCloud.api('leaderboard?mode=' + encodeURIComponent(mode)); return d.rows || []; } catch (e) { return null; }
  }

  // ── Settings ──
  function settings() {
    const row = (label, key, opts) => `<div class="set-row"><span>${label}</span><div class="seg">${opts.map(([v, l]) => `<button class="${String(SETTINGS[key]) === String(v) ? 'on' : ''}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div></div>`;
    shell('settings', `<main class="page narrow"><h2>${t('settings')}</h2><div class="glass">
      <div class="set-row"><span>${t('setLang')}</span><div class="seg"><button class="${LANG === 'en' ? 'on' : ''}" data-lang="en">🇬🇧 English</button><button class="${LANG === 'fr' ? 'on' : ''}" data-lang="fr">🇫🇷 Français</button></div></div>
      ${row(t('setQuality'), 'q', [['high', t('qHigh')], ['low', t('qLow')]])}
      ${row(t('setShake'), 'shake', [[1, t('on')], [0, t('off')]])}
      ${row(t('setNames'), 'nums', [[1, t('on')], [0, t('off')]])}
      <div class="set-row"><span>${t('setSound')}</span><div class="seg"><button class="${!MUTED ? 'on' : ''}" data-snd="1">${t('on')}</button><button class="${MUTED ? 'on' : ''}" data-snd="0">${t('off')}</button></div></div>
      </div><div class="page-actions"><button class="ghost" data-go="lobby">← ${t('back')}</button></div></main>`, 'page-screen');
    ov().querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { setLang(b.dataset.lang); settings(); });
    ov().querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k; SETTINGS[k] = k === 'q' ? b.dataset.v : +b.dataset.v; saveSettings(); if (k === 'q') setupRenderer(); SHAKE = SETTINGS.shake ? 1 : 0; settings(); });
    ov().querySelectorAll('[data-snd]').forEach(b => b.onclick = () => { setMuted(b.dataset.snd === '0'); settings(); });
  }

  // ── Match flow ──
  function launch(mode) {
    SEL = P.squad.filter(k => P.unlocked.includes(k)).slice(0, 6); if (!SEL.length) SEL = ['tireur'];
    reset(); S.modeId = mode; S.modeCfg = MODES[mode]; S.mods = mode === 'daily' ? dailyMods() : [];
    S.dailyFirst = mode === 'daily' && !(P.daily.date === today() && P.daily.done);
    applyMods();
    if (mode === 'blitz') S.blitzT = 180;
    S.mode = 'countdown'; document.body.dataset.screen = 'game';
    const o = ov(); o.hidden = false; o.className = 'ui-screen countdown';
    o.innerHTML = `<div class="cd"><div class="cd-found">${t('matchFound')}</div><div class="cd-mode" style="--g:${MODES[mode].grad}">${MODES[mode].icon} ${t('m_' + mode)}</div>
      ${S.mods.length ? `<div class="cd-mods">${S.mods.map(x => `<span>${t('mod_' + x)}</span>`).join('')}</div>` : ''}<div class="cd-n" id="cdn">3</div><div class="cd-sub">${t('deploying')}</div></div>`;
    let n = 3; blip(440);
    const tick = () => { n--; const el = $('cdn'); if (!el) return; if (n > 0) { el.textContent = n; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); blip(440); setTimeout(tick, 650); }
      else { el.textContent = t('go'); el.classList.add('go'); blip(880); setTimeout(() => { if (S.mode !== 'countdown') return; o.className = ''; if (mode === 'mega') { S.megaOnly = true; startMega(SEL[0]); } else { S.megaOnly = false; startWave(); } }, 450); } };
    setTimeout(tick, 900);
  }
  function applyMods() {
    S.enemyHp = 1; S.enemySpd = 1; S.spawnMul = 1; S.regen = 0;
    for (const m of S.mods) {
      if (m === 'glass') { S.dm += 2; C.forEach(c => { c.max = Math.round(c.max * .6); c.hp = c.max; }); }
      if (m === 'speed') S.enemySpd = 1.3; if (m === 'horde') S.spawnMul = 1.5; if (m === 'tank') S.enemyHp = 1.6; if (m === 'crit') S.critBonus = (S.critBonus || 0) + .2; if (m === 'regen') S.regen = 1;
    }
    hud();
  }

  // ── Results ──
  function endMatch(kind) {
    if (S.mode === 'results') return;
    const mode = S.modeId || 'survival', md = MODES[mode] || MODES.survival;
    const score = S.score | 0, wave = S.wave | 0, kills = S.runKills | 0;
    const win = kind !== 'defeat';
    let coins = Math.round((score / 15 + wave * 6 + kills * .5) * md.mult) + (win ? 40 : 0);
    if (S.dailyFirst) coins *= 2;
    coins += S.bonusCoins | 0;
    const xp = Math.round(score / 8 + wave * 12 + (win ? 40 : 0));
    let tr = mode === 'blitz' ? Math.round(score / 220 - 6) : mode === 'mega' ? (win ? 30 : -6) : mode === 'bossrush' ? wave * 6 - 10 : wave * 3 - 12;
    tr = Math.max(-12, Math.min(50, tr));
    const prevBest = (P.best[mode] || {}).score || 0, record = score > prevBest;
    const rank0 = rankOf(P.trophies), lvl0 = P.lvl;
    P.coins += coins; P.trophies = Math.max(0, P.trophies + tr); P.runs++; P.kills += kills; P.xp += xp;
    while (P.xp >= xpNeed(P.lvl)) { P.xp -= xpNeed(P.lvl); P.lvl++; P.coins += 50; }
    if (record) P.best[mode] = { score, wave };
    if (mode === 'daily') P.daily = { date: today(), done: true };
    P.history = [{ mode, score, wave, date: today() }, ...(P.history || [])].slice(0, 30);
    save();
    let posted = false;
    try { if (userName() && window.BastionCloud && window.BastionCloud.api && score > 0) { posted = true; window.BastionCloud.api('leaderboard', { method: 'POST', body: JSON.stringify({ mode, score, wave, squad: SEL.join(',') }) }).then(() => { const n = $('posted'); if (n) n.textContent = '✓ ' + t('submitted'); }).catch(() => {}); } } catch (e) {}
    S.mode = 'results'; down = false; rdown = false;
    const rankUp = rankOf(P.trophies) > rank0, lvlUp = P.lvl > lvl0, r = rankOf(P.trophies);
    const title = kind === 'victory' ? t('victory') : kind === 'timeup' ? t('timeUp') : t('defeat');
    const o = ov(); o.hidden = false; o.className = 'ui-screen results ' + (win ? 'win' : 'lose');
    o.innerHTML = `<div class="res"><div class="res-mode">${md.icon} ${t('m_' + mode)}</div><h1 class="res-title" data-t="${esc(title)}">${esc(title)}</h1>
      ${record ? `<div class="badge gold">★ ${t('newRecord')}</div>` : ''}${rankUp ? `<div class="badge pink">▲ ${t('rankUp')} · ${t('rank_' + r)}</div>` : ''}${lvlUp ? `<div class="badge cyan">⬆ ${t('levelUp')} · ${t('level')} ${P.lvl}</div>` : ''}
      <div class="res-stats"><div><small>${t('score')}</small><b class="cnt" data-v="${score}">0</b></div><div><small>${t('wave')}</small><b>${wave}</b></div><div><small>${t('kills')}</small><b>${kills}</b></div><div><small>${t('level')}</small><b>${S.level || 1}</b></div></div>
      <div class="rewards"><div><span>🪙</span><b class="cnt" data-v="${coins}">0</b><small>${t('coinsGained')}${S.dailyFirst ? ' ×2' : ''}</small></div><div><span>✦</span><b class="cnt" data-v="${xp}">0</b><small>${t('xpGained')}</small></div><div class="${tr < 0 ? 'neg' : ''}"><span>🏆</span><b>${tr >= 0 ? '+' : ''}${tr}</b><small>${t('trophies')} · ${t('rank_' + r)}</small></div></div>
      <div class="xp-line"><span>${t('level')} ${P.lvl}</span><i><u style="width:${Math.min(100, P.xp / xpNeed(P.lvl) * 100)}%"></u></i><span>${P.xp}/${xpNeed(P.lvl)}</span></div>
      <p class="muted small" id="posted">${posted ? '…' : t('signInToRank')}</p>
      <div class="res-actions"><button class="play-btn small" id="again"><span>${t('playAgain')}</span><i>↻</i></button><button class="ghost" id="tolobby">🏠 ${t('lobby')}</button></div></div>`;
    o.querySelectorAll('.cnt').forEach(el => { const v = +el.dataset.v, t0 = performance.now(); const f = () => { const k = Math.min(1, (performance.now() - t0) / 900); el.textContent = Math.round(v * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    $('again').onclick = () => { cleanup(); launch(mode); };
    $('tolobby').onclick = () => { cleanup(); toLobby(); };
    blip(win ? 990 : 220);
  }
  function cleanup() { try { if (S.mega) megaClean(); } catch (e) {} }
  function toLobby() { reset(); S.mode = 'menu'; current = 'lobby'; lobby(); }

  // ── Online presence + feed ──
  const PID = (() => { try { let id = localStorage.getItem('bastion-pid'); if (!id) { id = Math.random().toString(36).slice(2, 12); localStorage.setItem('bastion-pid', id); } return id; } catch (e) { return 'anon'; } })();
  async function heartbeat() {
    try {
      if (!window.BastionCloud || !window.BastionCloud.api) return;
      const d = await window.BastionCloud.api('presence', { method: 'POST', body: JSON.stringify({ id: PID }) });
      online = d.online | 0; feed = d.recent || [];
    } catch (e) { online = null; }
    if (S && S.mode === 'menu' && current === 'lobby') { const f = $('feed'); if (f) f.innerHTML = feedHtml(); const k = document.querySelector('.kicker'); if (k) k.innerHTML = online != null ? `<span class="dot"></span>${t('online', { n: online })}` : `<span class="dot off"></span>${t('offline')}`; }
  }
  setInterval(heartbeat, 45000); setTimeout(heartbeat, 1200);

  document.addEventListener('langchange', () => { if (typeof hud === 'function' && S) hud(); refresh(); });
  document.addEventListener('bastion-auth', e => { if (e.detail && e.detail.progress) adoptCloud(e.detail.progress); refresh(); });

  function boot() { current = 'lobby'; lobby(); const b = $('boot'); if (b) { b.classList.add('done'); setTimeout(() => b.remove(), 700); } }
  return { boot, lobby: toLobby, launch, endMatch, toast, refresh, skinCol, profile: () => P, MODES, heroName, go };
})();
