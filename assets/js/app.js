/* EVENT/OS — browser-based front end. UI and demo storage are deliberately separate. */
(() => {
  'use strict';
  const Store = window.EventData;
  const root = document.getElementById('app');
  const overlays = document.getElementById('overlay-root');
  const toasts = document.getElementById('toast-root');
  const AUTH_KEY = 'eventos_demo_role_v2';
  const SESSION_USER_KEY = 'eventos_demo_username_v4';
  const USER_ACCOUNTS_KEY = 'eventos_demo_accounts_v4';
  const ACCOUNTS = {
    admin: {password: 'Event@2026', role: 'admin', name: 'Administrator', initials: 'AD'},
    user: {password: 'User@2026', role: 'user', name: 'Jordan Lee', initials: 'JL'}
  };
  // Additional accounts belong to this browser demo, not to an authentication server.
  let cachedAccounts = null;
  function customAccounts() {
    if (cachedAccounts) return cachedAccounts;
    try {
      const parsed = JSON.parse(localStorage.getItem(USER_ACCOUNTS_KEY) || '{}');
      cachedAccounts = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) { cachedAccounts = {}; }
    return cachedAccounts;
  }
  function lookupAccount(username) {
    const key = String(username || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(ACCOUNTS, key)) {
      return { ...ACCOUNTS[key], username: key, participantId: key === 'user' ? 'p5' : null };
    }
    return Object.prototype.hasOwnProperty.call(customAccounts(), key) ? customAccounts()[key] : null;
  }
  function createAccount(username, password) {
    const key = username.toLowerCase();
    if (lookupAccount(key)) throw new Error('Username is already taken.');
    const participantId = `p_user_${key}`;
    // Create a linked participant without asking for any extra signup fields.
    Store.ensureSignupParticipant(username, participantId);
    const accounts = customAccounts();
    accounts[key] = { username, password, role: 'user', name: username, initials: username.slice(0, 2).toUpperCase(), participantId };
    try { localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts)); }
    catch (error) { /* Account still works until the tab is refreshed if storage is blocked. */ }
  }
  function sessionUsername() {
    let role, username;
    try { role = sessionStorage.getItem(AUTH_KEY); username = sessionStorage.getItem(SESSION_USER_KEY); }
    catch (error) { role = window.__eventosDemoRole; username = window.__eventosDemoUsername; }
    if (!username) username = role === 'user' ? 'user' : role === 'admin' ? 'admin' : null;
    const account = lookupAccount(username);
    return account && account.role === role ? account.username : null;
  }
  const currentAccount = () => lookupAccount(sessionUsername());
  const currentParticipantId = () => currentAccount()?.participantId || null;
  const adminPages = ['dashboard', 'events', 'participants', 'registrations', 'schedules'];
  const userPages = ['dashboard', 'events', 'my-registrations', 'schedules'];
  const titles = { dashboard: 'Dashboard', events: 'Events', participants: 'Participants', registrations: 'Registrations', 'my-registrations': 'My Registrations', schedules: 'Schedules' };
  const nouns = { events: 'event', participants: 'participant', registrations: 'registration', schedules: 'schedule entry' };
  const icons = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    ticket: '<path d="M2 9a3 3 0 0 0 0 6v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 0 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2m0 4v2m0 4v2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6M10 10v6m4-6v6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M3 3l18 18M10.6 5.1A11.4 11.4 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.2 4.1M6 6.1C3.5 8 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 7v6m0 4h.01"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    filter: '<path d="M4 7h16M7 12h10M10 17h4"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
    'calendar-check': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m6 6 2 2 4-4"/>'
  };
  const icon = (name, size = 18) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.info}</svg>`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const fmt = value => value ? new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtTime = value => value ? new Date(value).toLocaleTimeString('en-PH', {hour: 'numeric', minute: '2-digit'}) : '—';
  const fmtFull = value => value ? `${fmt(value)} · ${fmtTime(value)}` : '—';
  const number = n => new Intl.NumberFormat('en-PH').format(n);
  let state = { page: 'dashboard', query: '', filter: 'All', selected: {}, overlay: null, mobileNav: false };
  let toastTimeout;

  function getRole() { return currentAccount()?.role || null; }
  const isLoggedIn = () => !!getRole();
  function setRole(role, username = '') {
    try {
      if (role) {
        sessionStorage.setItem(AUTH_KEY, role);
        sessionStorage.setItem(SESSION_USER_KEY, username);
      } else {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(SESSION_USER_KEY);
      }
    } catch (error) {
      window.__eventosDemoRole = role;
      window.__eventosDemoUsername = username;
    }
  }
  const isAdmin = () => getRole() === 'admin';
  const allowedPages = () => isAdmin() ? adminPages : userPages;
  function badge(text) {
    const cls = String(text || '').toLowerCase().replace(/\s+/g, '-');
    return `<span class="badge badge--${esc(cls)}">${esc(text)}</span>`;
  }
  const singular = type => nouns[type];
  const adminNav = [
    ['dashboard','dashboard','Dashboard'], ['events','calendar','Events'],
    ['participants','users','Participants'], ['registrations','ticket','Registrations'], ['schedules','clock','Schedules']
  ];
  const userNav = [
    ['dashboard','dashboard','Dashboard'], ['events','calendar','Events'],
    ['my-registrations','ticket','My registrations'], ['schedules','clock','Schedules']
  ];
  function brand() { return `<span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span><span class="brand-name">EVENT<span>/</span>OS</span>`; }

  function renderLogin() {
    document.title = 'Login — EVENT/OS';
    root.innerHTML = `<main class="login-screen" id="login-page">
      <header class="login-top"><div class="brand">${brand()}</div></header>
      <section class="login-box" aria-labelledby="login-title">
        <div class="login-heading"><div class="login-rule"></div><h1 id="login-title">LOGIN</h1></div>
        <form id="login-form" novalidate>
          <div class="field"><label for="login-username">Username</label><input id="login-username" name="username" type="text" autocomplete="username" placeholder="Enter username" spellcheck="false"><div class="field-error" id="login-username-error" data-error-for="username" aria-live="polite"></div></div>
          <div class="field"><label for="login-password">Password</label><div class="password-wrap"><input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Enter password"><button type="button" id="toggle-password" class="password-toggle" data-action="toggle-password" aria-label="Show password" title="Show password">${icon('eye',20)}</button></div><div class="field-error" id="login-password-error" data-error-for="password" aria-live="polite"></div></div>
          <div class="form-error" id="login-error" role="alert" hidden></div>
          <button type="submit" id="login-submit" class="btn btn--dark btn--full">Login ${icon('arrow',19)}</button>
        </form>
        <p class="auth-switch">Don't have an account? <a href="#signup" id="signup-link">Sign up</a></p>
      </section>
    </main>`;
    overlays.innerHTML = '';
    clearTimeout(toastTimeout);
    toasts.innerHTML = '';
    document.body.classList.remove('overlay-open');
  }

  function renderSignup() {
    document.title = 'Sign Up — EVENT/OS';
    root.innerHTML = `<main class="login-screen" id="signup-page">
      <header class="login-top"><div class="brand">${brand()}</div></header>
      <section class="login-box" aria-labelledby="signup-title">
        <div class="login-heading"><div class="login-rule"></div><h1 id="signup-title">SIGN UP</h1></div>
        <form id="signup-form" novalidate>
          <div class="field"><label for="signup-username">Username</label><input id="signup-username" name="username" type="text" autocomplete="username" placeholder="Enter username" maxlength="20" spellcheck="false"><div class="field-error" data-error-for="username" aria-live="polite"></div></div>
          <div class="field"><label for="signup-password">Password</label><div class="password-wrap"><input id="signup-password" name="password" type="password" autocomplete="new-password" placeholder="Enter password"><button type="button" id="toggle-signup-password" class="password-toggle" data-action="toggle-password" data-target="signup-password" aria-label="Show password" title="Show password">${icon('eye',20)}</button></div><div class="field-error" data-error-for="password" aria-live="polite"></div></div>
          <div class="field"><label for="signup-confirm">Confirm Password</label><div class="password-wrap"><input id="signup-confirm" name="confirm" type="password" autocomplete="new-password" placeholder="Confirm password"><button type="button" id="toggle-signup-confirm" class="password-toggle" data-action="toggle-password" data-target="signup-confirm" aria-label="Show confirm password" title="Show confirm password">${icon('eye',20)}</button></div><div class="field-error" data-error-for="confirm" aria-live="polite"></div></div>
          <div class="form-error" id="signup-error" role="alert" hidden></div>
          <button type="submit" id="signup-submit" class="btn btn--dark btn--full">Create Account ${icon('arrow',19)}</button>
        </form>
        <p class="auth-switch">Already have an account? <a href="#login" id="back-to-login">Login</a></p>
      </section>
    </main>`;
    overlays.innerHTML = '';
    clearTimeout(toastTimeout);
    toasts.innerHTML = '';
    document.body.classList.remove('overlay-open');
  }

  function sidebar() {
    const role = getRole();
    const account = currentAccount();
    const navData = role === 'admin' ? adminNav : userNav;
    return `<aside class="sidebar ${state.mobileNav ? 'sidebar--open' : ''}" id="sidebar">
      <a href="#dashboard" class="sidebar-brand" aria-label="EVENT/OS overview">${brand()}</a>
      <nav class="side-nav" aria-label="Main navigation">${navData.map(([key,ico,text]) => `<a href="#${key}" data-nav="${key}" data-testid="nav-${key}" class="nav-link ${state.page === key ? 'nav-link--active' : ''}" ${state.page===key ? 'aria-current="page"' : ''}>${icon(ico,19)}<span>${text}</span>${state.page === key ? '<span class="nav-rail"></span>' : ''}</a>`).join('')}</nav>
      <div class="sidebar-bottom"><div class="profile"><span class="avatar">${account.initials}</span><span class="profile-text"><strong>${account.name}</strong><span>${role==='admin'?'Admin':'User'}</span></span></div><button class="icon-btn sidebar-logout" type="button" id="logout-button" data-action="logout" title="Log out" aria-label="Log out">${icon('logout',19)}</button></div>
    </aside>`;
  }
  function topbar() {
    const account = currentAccount();
    return `<header class="topbar"><div class="topbar-left"><button type="button" class="icon-btn menu-toggle" data-action="mobile-nav" aria-label="Toggle navigation" title="Menu">${icon('menu')}</button><strong>${titles[state.page]}</strong></div><div class="topbar-right"><span class="topbar-date">${new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span><span class="header-avatar" title="${account.name}">${account.initials}</span></div></header>`;
  }
  function visitorHeader() {
    const navigation = [
      ['dashboard','Home'], ['events','Explore events'],
      ['my-registrations','My tickets'], ['schedules','Schedule']
    ];
    return `<header class="visitor-header" id="visitor-header">
      <div class="visitor-header-inner">
        <a href="#dashboard" data-nav="dashboard" class="visitor-brand" aria-label="EVENT/OS home">EVENT<span>/</span>OS<span class="visitor-brand-dot">.</span></a>
        <nav class="visitor-navigation ${state.mobileNav ? 'visitor-navigation--open' : ''}" aria-label="User navigation" id="visitor-navigation">
          ${navigation.map(([page,label])=>`<a href="#${page}" data-nav="${page}" data-testid="nav-${page}" class="visitor-nav-link ${state.page===page ? 'visitor-nav-link--active' : ''}" ${state.page===page?'aria-current="page"':''}>${label}</a>`).join('')}
          <button class="visitor-nav-logout" type="button" data-action="logout" id="visitor-mobile-logout">${icon('logout',16)} Log out</button>
        </nav>
        <div class="visitor-header-actions">
          <span class="visitor-account" title="${esc(currentAccount().name)}"><span class="visitor-avatar">${esc(currentAccount().initials)}</span><span>${esc(currentAccount().name)}</span></span>
          <button class="visitor-logout icon-btn" id="logout-button" type="button" data-action="logout" aria-label="Log out" title="Log out">${icon('logout',19)}</button>
          <button class="visitor-menu icon-btn" type="button" data-action="mobile-nav" aria-label="${state.mobileNav?'Close menu':'Open menu'}" aria-expanded="${state.mobileNav}" aria-controls="visitor-navigation">${icon(state.mobileNav?'x':'menu',24)}</button>
        </div>
      </div>
    </header>`;
  }
  function visitorFooter() {
    return `<footer class="visitor-footer"><div class="visitor-container visitor-footer-inner"><span class="visitor-footer-brand">EVENT/OS</span><span>© ${new Date().getFullYear()}</span></div></footer>`;
  }
  function renderApp() {
    if (!isLoggedIn()) return location.hash === '#signup' ? renderSignup() : renderLogin();
    state.page = allowedPages().includes(location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard';
    document.title = `${isAdmin()? titles[state.page] : ({dashboard:'Home',events:'Explore events','my-registrations':'My tickets',schedules:'Schedule'}[state.page])} — EVENT/OS`;
    if (isAdmin()) {
      root.innerHTML = `<div class="app-shell">${sidebar()}${state.mobileNav ? '<button class="mobile-scrim" data-action="mobile-nav" aria-label="Close navigation"></button>' : ''}<div class="main-shell">${topbar()}<main class="page-content" id="main-content">${state.page === 'dashboard' ? renderDashboard() : renderModule(state.page)}</main></div></div>`;
    } else {
      root.innerHTML = `<div class="visitor-shell">${visitorHeader()}${state.mobileNav ? '<button class="visitor-scrim" data-action="mobile-nav" aria-label="Close menu"></button>' : ''}<main class="visitor-main" id="main-content">${renderUserPage(state.page)}</main>${visitorFooter()}</div>`;
    }
    renderOverlay();
    if (!isAdmin() && state.page === 'events') updateUserLists();
  }
  const eventName = id => Store.get('events', id)?.title || 'Removed event';
  const personName = id => Store.get('participants', id)?.fullName || 'Removed participant';
  function pageHeading(kicker, title, action = '') {
    return `<div class="page-header"><div><h1 class="page-title">${esc(title).toUpperCase()}</h1></div>${action}</div>`;
  }
  const addButton = type => `<button type="button" class="btn btn--dark add-button" data-action="add" data-type="${type}" id="add-${type}" data-testid="add-${type}">${icon('plus',18)} Add ${cap(nouns[type])}</button>`;
  function renderDashboard() {
    const events = Store.all('events');
    const people = Store.all('participants');
    const regs = Store.all('registrations');
    const schedules = Store.all('schedules');
    const upcoming = events.filter(e => new Date(e.endsAt) >= new Date() && e.status !== 'Cancelled').sort((a,b) => a.startsAt.localeCompare(b.startsAt)).slice(0,4);
    const recent = regs.slice().sort((a,b) => b.registeredAt.localeCompare(a.registeredAt)).slice(0,4);
    const confirmed = regs.filter(r => r.status === 'Confirmed').length;
    const metrics = [
      ['Total events',events.length,'calendar'], ['Participants',people.length,'users'],
      ['Registrations',regs.length,'ticket'], ['Schedule entries',schedules.length,'clock']
    ];
    return `${pageHeading('Dashboard', 'Dashboard', `<button class="btn btn--dark" data-action="add" data-type="events">${icon('plus')} New event</button>`)}
      <section class="metric-grid" aria-label="Summary">${metrics.map(([label,value,ico],i) => `<div class="metric" data-testid="metric-${i}"><div class="metric-top"><span>${label}</span>${icon(ico,19)}</div><div class="metric-value">${number(value).padStart(2,'0')}</div><div class="metric-line"></div></div>`).join('')}</section>
      <div class="dashboard-grid">
        <section class="panel panel--wide" aria-labelledby="upcoming-title"><div class="panel-header"><div><h2 id="upcoming-title">Upcoming events</h2></div><a href="#events" class="text-link" data-testid="see-all-events">All events ${icon('arrow',15)}</a></div>
        <div class="upcoming-list">${upcoming.length ? upcoming.map((e,i) => `<div class="upcoming-item"><div class="date-block"><strong>${new Date(e.startsAt).toLocaleDateString('en-PH',{day:'2-digit'})}</strong><span>${new Date(e.startsAt).toLocaleDateString('en-PH',{month:'short'}).toUpperCase()}</span></div><div class="upcoming-details"><strong>${esc(e.title)}</strong><span>${esc(e.venue)} <span class="dot"></span> ${fmtTime(e.startsAt)}</span></div><div class="upcoming-end">${badge(e.status)}</div></div>`).join('') : '<p class="list-empty">No upcoming events.</p>'}</div></section>
        <section class="panel" aria-labelledby="activity-title"><div class="panel-header"><div><h2 id="activity-title">Recent registrations</h2></div><a href="#registrations" class="text-link">View all ${icon('arrow',15)}</a></div>
        <div class="activity-list">${recent.length ? recent.map(r => `<div class="activity-item"><span class="activity-dot"></span><div><strong>${esc(personName(r.participantId))}</strong><span>${esc(eventName(r.eventId))}</span></div><span class="activity-status">${badge(r.status)}</span></div>`).join('') : '<p class="list-empty">No registrations yet.</p>'}</div></section>
      </div>`;
  }
  function searchableText(type, item) {
    if (type === 'events') return `${item.title} ${item.type} ${item.venue} ${item.status}`;
    if (type === 'participants') return `${item.fullName} ${item.email} ${item.organization} ${item.phone}`;
    if (type === 'registrations') return `${personName(item.participantId)} ${eventName(item.eventId)} ${item.status}`;
    return `${item.title} ${eventName(item.eventId)} ${item.location}`;
  }
  function sorted(type, rows) {
    if (type === 'events' || type === 'schedules') return rows.sort((a,b) => a.startsAt.localeCompare(b.startsAt));
    if (type === 'registrations') return rows.sort((a,b) => b.registeredAt.localeCompare(a.registeredAt));
    return rows.sort((a,b) => a.fullName.localeCompare(b.fullName));
  }
  function filtered(type) {
    const query = state.query.trim().toLowerCase();
    return sorted(type, Store.all(type).filter(item => (!query || searchableText(type,item).toLowerCase().includes(query)) && (state.filter === 'All' || item.status === state.filter)));
  }
  function renderModule(type) {
    const canAdd = !(type === 'registrations' && (!Store.all('events').length || !Store.all('participants').length)) && !(type === 'schedules' && !Store.all('events').length);
    const options = type === 'events' ? ['All','Planned','Open','Closed','Cancelled'] : type === 'registrations' ? ['All','Confirmed','Waitlisted','Cancelled'] : null;
    const total = Store.all(type).length;
    return `${pageHeading('Management', titles[type], canAdd ? addButton(type) : '')}
      <section class="records-panel" aria-label="${esc(titles[type])} records">
        <div class="records-toolbar"><div class="records-toolbar-left"><h2>All ${esc(titles[type].toLowerCase())}</h2><span class="count-label" id="total-count">${number(total)}</span></div><div class="records-toolbar-right"><label class="search-field">${icon('search',18)}<span class="sr-only">Search ${titles[type]}</span><input type="search" id="record-search" data-testid="record-search" placeholder="Search ${titles[type].toLowerCase()}" value="${esc(state.query)}" autocomplete="off"></label>${options ? `<label class="filter-select">${icon('filter',17)}<span class="sr-only">Filter status</span><select id="record-filter" data-testid="record-filter" aria-label="Filter status">${options.map(x=>`<option value="${x}" ${x===state.filter?'selected':''}>${x==='All'?'All status':x}</option>`).join('')}</select></label>` : ''}</div></div>
        <div class="results-label" id="results-label">${filtered(type).length} ${filtered(type).length === 1 ? 'record' : 'records'}</div>
        <div class="table-scroll" id="table-wrap">${renderTable(type)}</div>
      </section>`;
  }
  function columns(type) {
    if (type === 'events') return ['Event','Date & time','Venue','Registrations','Status',''];
    if (type === 'participants') return ['Participant','Phone','Organization','Registrations',''];
    if (type === 'registrations') return ['Participant','Event','Registered','Status',''];
    return ['Schedule entry','Event','Date & time','Location',''];
  }
  function iconButton(action, type, id, name, ico) { return `<button type="button" class="icon-btn table-action" data-action="${action}" data-type="${type}" data-id="${esc(id)}" data-testid="${action}-${esc(id)}" aria-label="${name}" title="${name}">${icon(ico,18)}</button>`; }
  function renderTable(type) {
    const data = filtered(type);
    const head = columns(type).map(x=>`<th scope="col">${esc(x)}</th>`).join('');
    const rows = data.map(item => {
      let cols;
      if (type === 'events') cols = `<td><strong class="cell-title">${esc(item.title)}</strong><span class="cell-sub">${esc(item.type)}</span></td><td><span class="cell-strong">${fmt(item.startsAt)}</span><span class="cell-sub">${fmtTime(item.startsAt)}</span></td><td>${esc(item.venue)}</td><td>${Store.all('registrations').filter(r=>r.eventId===item.id && r.status==='Confirmed').length} / ${item.capacity}</td><td>${badge(item.status)}</td>`;
      else if (type === 'participants') cols = `<td><strong class="cell-title">${esc(item.fullName)}</strong><span class="cell-sub">${esc(item.email)}</span></td><td>${esc(item.phone || '—')}</td><td>${esc(item.organization || '—')}</td><td>${Store.all('registrations').filter(r=>r.participantId===item.id).length}</td>`;
      else if (type === 'registrations') cols = `<td><strong class="cell-title">${esc(personName(item.participantId))}</strong></td><td>${esc(eventName(item.eventId))}</td><td>${fmt(item.registeredAt)}</td><td>${badge(item.status)}</td>`;
      else cols = `<td><strong class="cell-title">${esc(item.title)}</strong></td><td>${esc(eventName(item.eventId))}</td><td><span class="cell-strong">${fmt(item.startsAt)}</span><span class="cell-sub">${fmtTime(item.startsAt)} – ${fmtTime(item.endsAt)}</span></td><td>${esc(item.location || '—')}</td>`;
      let columnIndex = 0;
      cols = cols.replace(/<td(?=[\s>])/g, () => `<td data-label="${esc(columns(type)[columnIndex++])}"`);
      const selected = state.selected[type] === item.id;
      return `<tr tabindex="0" class="record-row ${selected?'record-row--selected':''}" data-record-row="${esc(item.id)}" data-testid="${type}-row-${esc(item.id)}" data-type="${type}" data-id="${esc(item.id)}" aria-selected="${selected}">${cols}<td data-label="Actions" class="actions-cell"><div class="table-actions">${iconButton('view',type,item.id,'View record','eye')}${iconButton('edit',type,item.id,'Edit record','edit')}${iconButton('delete',type,item.id,'Delete record','trash')}</div></td></tr>`;
    }).join('');
    return `<table class="records-table" id="records-table"><thead><tr>${head}</tr></thead><tbody>${rows || `<tr><td colspan="${columns(type).length}" class="empty-state">${state.query || state.filter!=='All' ? 'No matching records.' : 'No records yet. Add one to get started.'}</td></tr>`}</tbody></table>`;
  }
  function updateTable() {
    const target = document.getElementById('table-wrap');
    if (!target) return;
    target.innerHTML = renderTable(state.page);
    const label = document.getElementById('results-label');
    const count = filtered(state.page).length;
    if (label) label.textContent = `${count} ${count === 1 ? 'record' : 'records'}`;
  }
  const fields = {
    events: [
      ['title','Event name','text','e.g. Design Conference',true],
      ['type','Category','select',['Conference','Workshop','Seminar','Social','Other'],true],
      ['venue','Venue','text','e.g. Main Auditorium',true],
      ['capacity','Capacity','number','e.g. 100',true],
      ['startsAt','Start date & time','datetime-local','',true],
      ['endsAt','End date & time','datetime-local','',true],
      ['status','Status','select',['Planned','Open','Closed','Cancelled'],true]
    ],
    participants: [
      ['fullName','Full name','text','e.g. Alex Rivera',true],
      ['email','Email address','email','e.g. alex@example.com',true],
      ['phone','Phone number','tel','e.g. 09171234567',false],
      ['organization','Organization','text','Optional',false]
    ],
    registrations: [
      ['eventId','Event','events','',true],
      ['participantId','Participant','participants','',true],
      ['status','Status','select',['Confirmed','Waitlisted','Cancelled'],true]
    ],
    schedules: [
      ['eventId','Event','events','',true],
      ['title','Session title','text','e.g. Opening remarks',true],
      ['startsAt','Start date & time','datetime-local','',true],
      ['endsAt','End date & time','datetime-local','',true],
      ['location','Location','text','Optional',false]
    ]
  };
  function fieldHtml([key,label,kind,placeholder,required], value) {
    let control;
    const id = `field-${key}`;
    const attrs = `id="${id}" name="${key}" data-testid="${id}" ${required?'required':''} aria-describedby="error-${key}"`;
    if (kind === 'select' || kind === 'events' || kind === 'participants') {
      const options = kind === 'select' ? placeholder.map(v=>[v,v]) : Store.all(kind).map(v=>[v.id,kind==='events'?v.title:v.fullName]);
      control = `<select ${attrs}>${options.map(([v,text]) => `<option value="${esc(v)}" ${value===v?'selected':''}>${esc(text)}</option>`).join('')}</select>`;
    } else {
      const min = kind === 'number' ? 'min="1" step="1"' : '';
      control = `<input type="${kind}" ${attrs} ${min} value="${esc(value ?? '')}" placeholder="${esc(placeholder)}" autocomplete="off">`;
    }
    return `<div class="field ${['startsAt','endsAt','capacity','type','status','eventId','participantId'].includes(key)?'field--half':''}"><label for="${id}">${esc(label)}${required?'<span class="required" aria-label="required"> *</span>':''}</label>${control}<div class="field-error" data-error-for="${key}" id="error-${key}" aria-live="polite"></div></div>`;
  }
  function overlayForm(type, id) {
    const item = id ? Store.get(type,id) : null;
    const defaultEvent = Store.all('events')[0];
    const defaults = type==='events' ? { type:'Conference', status:'Planned', capacity:'50', startsAt: Store.dateAt(5,9), endsAt:Store.dateAt(5,17) }
      : type==='registrations' ? {eventId:defaultEvent?.id, participantId:Store.all('participants')[0]?.id,status:'Confirmed'}
      : type==='schedules' ? {eventId:defaultEvent?.id, startsAt:defaultEvent?.startsAt, endsAt:defaultEvent?.endsAt}
      : {};
    const values = {...defaults,...item};
    const heading = item ? `Edit ${singular(type)}` : `Add ${singular(type)}`;
    const fieldList = fields[type].map(f => fieldHtml(f,values[f[0]])).join('');
    return `<div class="overlay-backdrop" data-action="close-overlay"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><span class="eyebrow">${esc(titles[type])}</span><h2 id="modal-title">${esc(heading)}</h2></div><button type="button" class="icon-btn" data-action="close-overlay" aria-label="Close dialog">${icon('x',21)}</button></div>
       <form id="record-form" data-type="${type}" data-id="${esc(id||'')}" novalidate><div class="modal-body"><div class="form-grid">${fieldList}</div><div id="form-error" class="form-error" role="alert" hidden></div></div><div class="modal-footer"><button type="button" class="btn btn--light" data-action="close-overlay">Cancel</button><button type="submit" class="btn btn--dark" id="save-record" data-testid="save-record">${icon('check',17)} ${item?'Save changes':'Add record'}</button></div></form></section></div>`;
  }
  function labelRows(type, item) {
    if (type==='events') return [['Event name',item.title],['Category',item.type],['Venue',item.venue],['Start',fmtFull(item.startsAt)],['End',fmtFull(item.endsAt)],['Capacity',String(item.capacity)],['Confirmed',String(Store.countConfirmed(item.id))],['Status',item.status]];
    if (type==='participants') return [['Full name',item.fullName],['Email',item.email],['Phone',item.phone||'—'],['Organization',item.organization||'—'],['Registrations',String(Store.all('registrations').filter(r=>r.participantId===item.id).length)]];
    if (type==='registrations') return [['Participant',personName(item.participantId)],['Event',eventName(item.eventId)],['Status',item.status],['Registered on',fmtFull(item.registeredAt)]];
    return [['Session',item.title],['Event',eventName(item.eventId)],['Start',fmtFull(item.startsAt)],['End',fmtFull(item.endsAt)],['Location',item.location||'—']];
  }
  function itemHeading(type, item) { return type==='participants'?item.fullName : type==='registrations'?personName(item.participantId) : item.title; }
  function overlayView(type,id) {
    const item = Store.get(type,id);
    if (!item) return '';
    return `<div class="overlay-backdrop overlay-backdrop--drawer" data-action="close-overlay"><aside class="details-drawer" role="dialog" aria-modal="true" aria-labelledby="details-title"><div class="drawer-top"><span class="eyebrow">${esc(cap(nouns[type]))} details</span><button type="button" class="icon-btn" data-action="close-overlay" aria-label="Close details">${icon('x',21)}</button></div><h2 id="details-title">${esc(itemHeading(type,item))}</h2><div class="details-rule"></div><dl class="details-list">${labelRows(type,item).map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><div class="drawer-footer"><button type="button" class="btn btn--light" data-action="delete" data-type="${type}" data-id="${esc(id)}">${icon('trash')} Delete</button><button type="button" class="btn btn--dark" data-action="edit" data-type="${type}" data-id="${esc(id)}">${icon('edit')} Edit</button></div></aside></div>`;
  }
  function overlayDelete(type,id) {
    const item = Store.get(type,id);
    if (!item) return '';
    return `<div class="overlay-backdrop" data-action="close-overlay"><section class="modal-card modal-card--small" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div class="modal-head"><div><span class="eyebrow">Delete record</span><h2 id="delete-title">Delete ${esc(singular(type))}?</h2></div><button class="icon-btn" type="button" data-action="close-overlay" aria-label="Close dialog">${icon('x')}</button></div><div class="modal-body"><p class="delete-name">${esc(itemHeading(type,item))}</p><p class="delete-note">This action cannot be undone.</p><div class="form-error" id="delete-error" role="alert" hidden></div></div><div class="modal-footer"><button type="button" class="btn btn--light" data-action="close-overlay">Cancel</button><button type="button" class="btn btn--danger" id="confirm-delete" data-action="confirm-delete" data-type="${type}" data-id="${esc(id)}" data-testid="confirm-delete">${icon('trash')} Delete</button></div></section></div>`;
  }
  // Visitor experience: a public-facing event discovery interface, separate from the admin workspace.
  const myRegistrations = () => Store.all('registrations').filter(r => r.participantId === currentParticipantId());
  const ownRegistration = id => myRegistrations().find(r => r.eventId === id);
  function canRegister(event) {
    return event && event.status === 'Open' && new Date(event.endsAt) >= new Date() &&
      Store.countConfirmed(event.id) < Number(event.capacity);
  }
  const monthShort = value => value ? new Date(value).toLocaleDateString('en-PH',{month:'short'}).toUpperCase() : '—';
  const dayNum = value => value ? new Date(value).getDate() : '—';
  const dateLine = value => value ? new Date(value).toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric'}) : '—';
  const eventThemes = ['plum','orange','forest','sky','sand'];
  function themeFor(event) {
    const categories = {Conference:'plum',Workshop:'orange',Seminar:'forest',Social:'sky'};
    if (categories[event.type]) return categories[event.type];
    const n=Array.from(event.id||'event').reduce((sum,char)=>sum+char.charCodeAt(0),0);
    return eventThemes[n % eventThemes.length];
  }
  function poster(event, variant='card') {
    return `<div class="visitor-poster visitor-poster--${themeFor(event)} visitor-poster--${variant}" aria-hidden="true">
      <div class="visitor-poster-ring"></div><div class="visitor-poster-ring visitor-poster-ring--two"></div>
      <div class="visitor-poster-top"><span>EVENT/OS</span><span>${esc(monthShort(event.startsAt))} ${esc(new Date(event.startsAt).getFullYear())}</span></div>
      <div class="visitor-poster-word ${(event.type||'Event').length>=8 ? 'visitor-poster-word--long' : ''}">${esc((event.type||'Event').toUpperCase())}</div>
      <div class="visitor-poster-bottom"><span>${esc(event.venue)}</span><span>↗</span></div>
    </div>`;
  }
  function userEventCard(event) {
    const current = ownRegistration(event.id);
    const active = current && current.status !== 'Cancelled';
    const available = canRegister(event);
    return `<article class="user-event-card visitor-event-card" data-testid="user-event-${esc(event.id)}">
      <button class="visitor-poster-button" type="button" data-action="user-view" data-id="${esc(event.id)}" aria-label="View ${esc(event.title)} details">${poster(event)}</button>
      <div class="visitor-event-card-body"><div class="visitor-card-intro"><span class="visitor-card-category">${esc(event.type)}</span><span class="visitor-card-date">${esc(dateLine(event.startsAt))}</span></div>
        <h3>${esc(event.title)}</h3><p class="visitor-card-location">${icon('pin',16)} ${esc(event.venue)}</p>
        <div class="visitor-card-bottom"><span class="visitor-card-status">${active?badge(current.status):!available?badge(event.status):'<span class="visitor-open-dot"></span> Registration open'}</span>
          <div class="visitor-card-actions"><button type="button" class="visitor-view-link" data-action="user-view" data-id="${esc(event.id)}">Details ${icon('arrow',16)}</button>
          ${active ? '' : available ? `<button class="visitor-register-btn" type="button" data-action="user-register" data-id="${esc(event.id)}" data-testid="register-${esc(event.id)}">Register</button>` : ''}
          </div></div></div>
    </article>`;
  }
  function visitorPageHeading(eyebrow,heading,subtext='') {
    return `<div class="visitor-page-heading"><div><span class="visitor-overline">${esc(eyebrow)}</span><h1 class="visitor-page-title">${esc(heading)}</h1>${subtext?`<p>${esc(subtext)}</p>`:''}</div></div>`;
  }
  function visitorEmpty(title,body,action=false) {
    return `<div class="visitor-empty"><span class="visitor-empty-icon">${icon('ticket',27)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p>${action?`<a href="#events" data-nav="events" class="visitor-primary-link">Explore events ${icon('arrow',17)}</a>`:''}</div>`;
  }
  function renderUserPage(page) {
    const events = Store.all('events').slice().sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
    if (page === 'dashboard') {
      const featured = events.find(e=>canRegister(e)) || events.find(e=>e.status!=='Cancelled') || null;
      const upcoming=events.filter(e=>new Date(e.endsAt)>=new Date() && e.status!=='Cancelled').slice(0,3);
      const booked=myRegistrations().filter(r=>r.status!=='Cancelled');
      return `<div class="visitor-container visitor-home">
        <section class="visitor-hero"><div class="visitor-hero-copy"><span class="visitor-hero-label"><span></span> DISCOVER WHAT'S NEXT</span><h1>FIND YOUR<br>NEXT <em>EVENT.</em></h1><p>Explore upcoming events and reserve your spot.</p><div class="visitor-hero-actions"><a href="#events" data-nav="events" class="visitor-primary-link">Explore events ${icon('arrow',19)}</a><a href="#my-registrations" data-nav="my-registrations" class="visitor-secondary-link">My tickets</a></div></div>
        <div class="visitor-hero-art">${featured ? poster(featured,'hero') : '<div class="visitor-hero-placeholder">EVENT/OS</div>'}</div></section>
        ${booked.length ? `<section class="visitor-booking-strip"><div><span class="visitor-overline">YOUR PLANS</span><strong>You have ${booked.length} active ${booked.length===1?'registration':'registrations'}.</strong></div><a href="#my-registrations" data-nav="my-registrations">View tickets ${icon('arrow',17)}</a></section>` : ''}
        <section class="visitor-section"><div class="visitor-section-heading"><div><span class="visitor-overline">THE LINEUP</span><h2>Upcoming events</h2></div><a href="#events" data-nav="events" class="visitor-section-link">View all events ${icon('arrow',17)}</a></div>
        <div class="visitor-event-grid">${upcoming.length ? upcoming.map(userEventCard).join('') : visitorEmpty('No upcoming events','Check back soon for new events.')}</div></section>

      </div>`;
    }
    if (page === 'events') {
      const categories=[...new Set(events.map(e=>e.type).filter(Boolean))].sort();
      return `<div class="visitor-container visitor-catalog">${visitorPageHeading('FIND YOUR EVENT','Explore events','Discover events worth showing up for.')}
        <div class="visitor-catalog-tools"><label class="visitor-search">${icon('search',20)}<span class="sr-only">Search events</span><input type="search" id="record-search" placeholder="Search events or venues" value="${esc(state.query)}"></label>
        <label class="visitor-category-wrap"><span class="sr-only">Filter event category</span><select id="visitor-category" aria-label="Filter event category"><option value="All">All categories</option>${categories.map(c=>`<option value="${esc(c)}" ${state.filter===c?'selected':''}>${esc(c)}</option>`).join('')}</select>${icon('chevron',16)}</label></div>
        <div class="visitor-results-head"><strong id="visitor-result-count"></strong><span>Find your next experience</span></div>
        <div class="visitor-event-grid visitor-event-grid--catalog" id="user-event-results">${renderUserEventResults()}</div>
      </div>`;
    }
    if (page === 'my-registrations') return `<div class="visitor-container visitor-tickets-page">${visitorPageHeading('YOUR BOOKINGS','My tickets','All your event registrations in one place.')}
      <div id="my-registration-list" class="visitor-ticket-list">${renderMyRegistrations()}</div></div>`;
    const schedules=Store.all('schedules').slice().sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
    return `<div class="visitor-container visitor-schedule-page">${visitorPageHeading('PLAN YOUR DAY','Event schedule','Sessions and activities across upcoming events.')}
      <div class="visitor-agenda"><div class="visitor-agenda-heading"><h2>Sessions</h2><span>${schedules.length} ${schedules.length===1?'session':'sessions'}</span></div>
      ${schedules.length ? schedules.map(entry=>`<article class="schedule-card visitor-agenda-row" data-testid="schedule-${esc(entry.id)}"><div class="visitor-agenda-day"><strong>${esc(dayNum(entry.startsAt))}</strong><span>${esc(monthShort(entry.startsAt))}</span></div><div class="visitor-agenda-time">${esc(fmtTime(entry.startsAt))}<span>${esc(fmtTime(entry.endsAt))}</span></div><div class="visitor-agenda-info"><span>${esc(eventName(entry.eventId))}</span><h3>${esc(entry.title)}</h3><p>${icon('pin',15)} ${esc(entry.location||'—')}</p></div><button type="button" class="visitor-agenda-detail" data-action="user-view" data-id="${esc(entry.eventId)}" aria-label="View event ${esc(eventName(entry.eventId))}">${icon('arrow',19)}</button></article>`).join('') : visitorEmpty('No sessions yet','Schedules will appear here when they are available.')}</div>
    </div>`;
  }
  function renderUserEventResults() {
    const filtered = Store.all('events').filter(event => `${event.title} ${event.type} ${event.venue}`.toLowerCase().includes(state.query.trim().toLowerCase()) && (state.filter==='All' || event.type===state.filter)).sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
    return filtered.length ? filtered.map(userEventCard).join('') : visitorEmpty('No events found','Try another search or category.');
  }
  function renderMyRegistrations() {
    const regs = myRegistrations().slice().sort((a,b)=>b.registeredAt.localeCompare(a.registeredAt));
    return regs.length ? regs.map(r => {
      const event=Store.get('events',r.eventId);
      return `<article class="registration-card visitor-ticket ${r.status==='Cancelled'?'visitor-ticket--cancelled':''}" data-testid="my-registration-${esc(r.id)}">
        <div class="visitor-ticket-side"><span class="visitor-ticket-brand">EVENT/OS</span><span class="visitor-ticket-type">ENTRY PASS</span><strong>${esc(dayNum(event?.startsAt))}<small>${esc(monthShort(event?.startsAt))}</small></strong></div>
        <div class="visitor-ticket-main"><div class="visitor-ticket-title"><div><span class="visitor-overline">${esc(event?.type||'Event')}</span><h3>${esc(eventName(r.eventId))}</h3></div>${badge(r.status)}</div>
          <div class="visitor-ticket-meta"><span>${icon('clock',16)} ${esc(fmtFull(event?.startsAt))}</span><span>${icon('pin',16)} ${esc(event?.venue||'—')}</span></div>
          <div class="visitor-ticket-actions"><button type="button" class="visitor-view-link" data-action="user-view" data-id="${esc(r.eventId)}">Event details ${icon('arrow',16)}</button>
          ${r.status==='Cancelled'?'':`<button type="button" class="visitor-cancel-link" data-action="user-cancel" data-id="${esc(r.id)}">Cancel registration</button>`}</div>
        </div></article>`;
    }).join('') : visitorEmpty('No tickets yet','Your registrations will appear here after you sign up for an event.',true);
  }
  function updateUserLists() {
    const target = document.getElementById('user-event-results');
    if (target) target.innerHTML = renderUserEventResults();
    const counter = document.getElementById('visitor-result-count');
    if (counter) counter.textContent = `${target?.querySelectorAll('.visitor-event-card').length||0} events`;
  }
  function overlayLogout() {
    return `<div class="overlay-backdrop" data-action="close-overlay"><section class="modal-card modal-card--small" role="alertdialog" aria-modal="true" aria-labelledby="logout-title">
      <div class="modal-head"><h2 id="logout-title">Log out?</h2><button type="button" class="icon-btn" data-action="close-overlay" aria-label="Close dialog">${icon('x')}</button></div>
      <div class="modal-body"><p class="confirm-text">Are you sure you want to log out?</p></div>
      <div class="modal-footer"><button type="button" class="btn btn--light" data-action="close-overlay">Cancel</button><button type="button" class="btn btn--dark" id="confirm-logout" data-action="confirm-logout">Log out</button></div>
    </section></div>`;
  }
  function overlayUserEvent(id) {
    const e = Store.get('events',id);
    if (!e) return '';
    const current=ownRegistration(id), active=current && current.status!=='Cancelled';
    return `<div class="overlay-backdrop" data-action="close-overlay"><section class="modal-card visitor-detail-modal" role="dialog" aria-modal="true" aria-labelledby="user-event-title">
      <div class="visitor-detail-cover">${poster(e,'detail')}<button type="button" class="visitor-detail-close" data-action="close-overlay" aria-label="Close dialog">${icon('x',21)}</button></div>
      <div class="visitor-detail-body"><span class="visitor-overline">${esc(e.type)}</span><h2 id="user-event-title">${esc(e.title)}</h2>
        <div class="visitor-detail-facts"><div>${icon('calendar',19)}<span><strong>${esc(dateLine(e.startsAt))}</strong><small>${esc(fmtTime(e.startsAt))} – ${esc(fmtTime(e.endsAt))}</small></span></div>
          <div>${icon('pin',19)}<span><strong>${esc(e.venue)}</strong><small>Venue</small></span></div>
          <div>${icon('users',19)}<span><strong>${esc(String(Math.max(0,Number(e.capacity)-Store.countConfirmed(e.id))))} spots left</strong><small>${esc(e.status)}</small></span></div></div>
        <div class="visitor-detail-actions"><button type="button" class="btn btn--light" data-action="close-overlay">Close</button>
        ${active ? `<span class="visitor-detail-booked">${icon('check',17)} Registered</span>` : canRegister(e) ? `<button type="button" class="visitor-primary-link" data-action="user-register" data-id="${esc(e.id)}">Register now ${icon('arrow',18)}</button>` : '<span class="visitor-detail-booked">Registration unavailable</span>'}</div>
      </div>
    </section></div>`;
  }
  function overlayUserRegister(id) {
    const e = Store.get('events', id);
    if (!e) return '';
    return `<div class="overlay-backdrop" data-action="close-overlay"><section class="modal-card modal-card--small" role="alertdialog" aria-modal="true" aria-labelledby="register-title">
      <div class="modal-head"><h2 id="register-title">Confirm registration</h2><button type="button" class="icon-btn" data-action="close-overlay" aria-label="Close dialog">${icon('x')}</button></div>
      <div class="modal-body"><p class="confirm-text"><strong>${esc(e.title)}</strong></p><p class="confirm-detail">${fmt(e.startsAt)} · ${fmtTime(e.startsAt)}<br>${esc(e.venue)}</p><div class="form-error" id="member-action-error" role="alert" hidden></div></div>
      <div class="modal-footer"><button type="button" class="btn btn--light" data-action="close-overlay">Cancel</button><button type="button" class="btn btn--dark" id="confirm-register" data-action="confirm-register" data-id="${esc(id)}">Confirm</button></div>
    </section></div>`;
  }
  function overlayUserCancel(id) {
    const r=Store.get('registrations',id);
    if (!r || r.participantId !== currentParticipantId()) return '';
    return `<div class="overlay-backdrop" data-action="close-overlay"><section class="modal-card modal-card--small" role="alertdialog" aria-modal="true" aria-labelledby="cancel-title">
      <div class="modal-head"><h2 id="cancel-title">Cancel registration?</h2><button type="button" class="icon-btn" data-action="close-overlay" aria-label="Close dialog">${icon('x')}</button></div>
      <div class="modal-body"><p class="confirm-text">${esc(eventName(r.eventId))}</p><p class="confirm-detail">Your registration will be marked as cancelled.</p><div class="form-error" id="member-action-error" role="alert" hidden></div></div>
      <div class="modal-footer"><button type="button" class="btn btn--light" data-action="close-overlay">Keep registration</button><button type="button" class="btn btn--danger" id="confirm-cancel-registration" data-action="confirm-cancel-registration" data-id="${esc(id)}">Cancel registration</button></div>
    </section></div>`;
  }
  function memberActionError(message) {const target=document.getElementById('member-action-error');if(target){target.hidden=false;target.textContent=message;}}
  function confirmRegistration(eventId) {
    const event=Store.get('events',eventId), existing=ownRegistration(eventId);
    if (!event || !canRegister(event) || (existing && existing.status!=='Cancelled')) {memberActionError('Registration is unavailable.');return;}
    try {
      if (sessionUsername() === 'user') Store.ensureDemoUser();
      Store.save('registrations',{...(existing||{}), eventId,participantId:currentParticipantId(),status:'Confirmed',registeredAt:new Date().toISOString()});
      closeOverlay();renderApp();notify('Registration confirmed.');
    } catch (error) {memberActionError(error.message);}
  }
  function confirmCancelRegistration(id) {
    const r=Store.get('registrations',id);
    if (!r || r.participantId !== currentParticipantId() || r.status==='Cancelled') {memberActionError('Registration is unavailable.');return;}
    try {Store.save('registrations',{...r,status:'Cancelled'});closeOverlay();renderApp();notify('Registration cancelled.');}
    catch (error) {memberActionError(error.message);}
  }
  function renderOverlay() {
    const detail = state.overlay;
    if (!detail) { overlays.innerHTML=''; document.body.classList.remove('overlay-open'); return; }
    overlays.innerHTML = detail.mode === 'logout' ? overlayLogout() :
      detail.mode === 'user-view' ? overlayUserEvent(detail.id) :
      detail.mode === 'user-register' ? overlayUserRegister(detail.id) :
      detail.mode === 'user-cancel' ? overlayUserCancel(detail.id) :
      detail.mode === 'form' ? overlayForm(detail.type,detail.id) :
      detail.mode === 'view' ? overlayView(detail.type,detail.id) : overlayDelete(detail.type,detail.id);
    document.body.classList.add('overlay-open');
    const focus = overlays.querySelector('input,select,#confirm-delete,#confirm-register,#confirm-cancel-registration,#confirm-logout,.modal-head .icon-btn,.drawer-top .icon-btn');
    if (focus) focus.focus();
  }
  function openOverlay(mode,type,id='') {
    if (!isAdmin()) return;
    if (!Store.get(type,id) && id) { notify('Record no longer exists.','error'); return; }
    if (mode==='form' && !id && ((type==='registrations' && (!Store.all('events').length || !Store.all('participants').length)) || (type==='schedules' && !Store.all('events').length))) {
      notify('Add the related records first.','error'); return;
    }
    state.overlay={mode,type,id}; renderOverlay();
  }
  function closeOverlay() { state.overlay=null;renderOverlay(); }
  function notify(message,kind='success') {
    clearTimeout(toastTimeout);
    toasts.innerHTML = `<div class="toast toast--${kind}" data-testid="toast" role="status">${icon(kind==='success'?'check':'alert',18)}<span>${esc(message)}</span><button class="icon-btn" type="button" data-action="dismiss-toast" aria-label="Dismiss message">${icon('x',16)}</button></div>`;
    toastTimeout = setTimeout(()=>toasts.innerHTML='', 4500);
  }
  function showError(form,key,message) {
    const field = form.querySelector(`[name="${key}"]`);
    const target = form.querySelector(`[data-error-for="${key}"]`);
    if (field) field.setAttribute('aria-invalid','true');
    if (target) target.textContent=message;
  }
  function clearErrors(form) {
    form.querySelectorAll('.field-error').forEach(el=>el.textContent='');
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    const general=form.querySelector('.form-error');
    if (general) {general.hidden=true;general.textContent='';}
  }
  function showGeneral(form,message) {
    const elem = form.querySelector('.form-error');
    if (elem) {elem.hidden=false;elem.textContent=message;}
  }
  function login(form) {
    clearErrors(form);
    const username=form.elements.username.value.trim();
    const password=form.elements.password.value;
    let error=false;
    if (!username) {showError(form,'username','Enter your username.');error=true;}
    if (!password) {showError(form,'password','Enter your password.');error=true;}
    if (error) return;
    const account = lookupAccount(username);
    if (!account || password !== account.password) {
      const elem = document.getElementById('login-error');
      elem.hidden=false;elem.textContent='Incorrect username or password.';
      return;
    }
    setRole(account.role, account.username);
    if (account.username.toLowerCase() === 'user') Store.ensureDemoUser();
    state.query='';state.filter='All';
    location.hash='dashboard';renderApp();
  }
  function signup(form) {
    clearErrors(form);
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    const confirm = form.elements.confirm.value;
    if (!username) showError(form, 'username', 'Enter a username.');
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) showError(form, 'username', 'Use 3–20 letters, numbers, or underscores.');
    else if (lookupAccount(username)) showError(form, 'username', 'Username is already taken.');
    if (!password) showError(form, 'password', 'Enter a password.');
    else if (password.length < 8) showError(form, 'password', 'Password must be at least 8 characters.');
    if (!confirm) showError(form, 'confirm', 'Confirm your password.');
    else if (password !== confirm) showError(form, 'confirm', 'Passwords do not match.');
    if (form.querySelector('[aria-invalid="true"]')) return;
    try {
      createAccount(username, password);
      location.hash = 'login';
      renderLogin();
      document.getElementById('login-username').value = username;
      notify('Account created. Log in to continue.');
    } catch (error) { showGeneral(form, error.message); }
  }
  function submitRecord(form) {
    clearErrors(form);
    const type=form.dataset.type, id=form.dataset.id;
    const original=id ? Store.get(type,id) : {};
    const value={...original};
    for (const [key,label,kind,_,required] of fields[type]) {
      value[key] = String(form.elements[key]?.value || '').trim();
      if (required && !value[key]) showError(form,key,`${label} is required.`);
    }
    if (form.querySelector('[aria-invalid="true"]')) {showGeneral(form,'Check the highlighted fields.');return;}
    if (type==='participants') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) showError(form,'email','Enter a valid email address.');
      if (value.phone && (value.phone.replace(/\D/g,'').length < 7 || value.phone.replace(/\D/g,'').length > 15 || !/^[+\d\s()-]+$/.test(value.phone))) showError(form,'phone','Enter a valid phone number.');
    }
    if ((type==='events' || type==='schedules') && value.endsAt<=value.startsAt) showError(form,'endsAt','End time must be later than start time.');
    if (type==='events' && (!/^\d+$/.test(value.capacity) || Number(value.capacity)<1)) showError(form,'capacity','Enter a capacity of at least 1.');
    if (form.querySelector('[aria-invalid="true"]')) {showGeneral(form,'Check the highlighted fields.');return;}
    try {
      Store.save(type,value);
      closeOverlay();
      renderApp();
      notify(`${cap(singular(type))} ${id?'updated':'added'} successfully.`);
    } catch (error) {showGeneral(form,error.message);}
  }
  function confirmDelete(type,id) {
    try {
      Store.remove(type,id);
      if (state.selected[type]===id) state.selected[type]=null;
      closeOverlay();renderApp();notify(`${cap(singular(type))} deleted successfully.`);
    } catch(error) {
      const target=document.getElementById('delete-error');
      if(target) {target.hidden=false;target.textContent=error.message;}
    }
  }
  function navigate(page) { if (!allowedPages().includes(page)) return; state.query='';state.filter='All';state.mobileNav=false;state.overlay=null;location.hash=page;renderApp(); }

  document.addEventListener('submit', e => {
    if (e.target.id==='login-form') {e.preventDefault();login(e.target);}
    if (e.target.id==='signup-form') {e.preventDefault();signup(e.target);}
    if (e.target.id==='record-form') {e.preventDefault();if (isAdmin()) submitRecord(e.target);}
  });
  document.addEventListener('click', e => {
    const nav=e.target.closest('[data-nav]');
    if (nav) {e.preventDefault();navigate(nav.dataset.nav);return;}
    const link=e.target.closest('a[href^="#"]');
    if (link && isLoggedIn()) {e.preventDefault();navigate(link.getAttribute('href').slice(1));return;}
    const button=e.target.closest('[data-action]');
    if (button) {
      const a=button.dataset.action, type=button.dataset.type, id=button.dataset.id;
      if (a==='mobile-nav') {state.mobileNav=!state.mobileNav;renderApp();return;}
      if (a==='logout') {state.overlay={mode:'logout'};renderOverlay();return;}
      if (a==='confirm-logout') {setRole(null);state.overlay=null;state.mobileNav=false;state.selected={};state.query='';state.filter='All';location.hash='login';renderLogin();return;}
      if (a==='toggle-password') {const input=document.getElementById(button.dataset.target || 'login-password');if(!input)return;const show=input.type==='password';input.type=show?'text':'password';button.innerHTML=icon(show?'eye-off':'eye',20);const label=input.id==='signup-confirm'?'confirm password':'password';button.title=show?`Hide ${label}`:`Show ${label}`;button.setAttribute('aria-label',button.title);return;}
      if (a==='add' && isAdmin()) {openOverlay('form',type);return;}
      if (a==='edit' && isAdmin()) {openOverlay('form',type,id);return;}
      if (a==='view' && isAdmin()) {openOverlay('view',type,id);return;}
      if (a==='delete' && isAdmin()) {openOverlay('delete',type,id);return;}
      if (a==='confirm-delete' && isAdmin()) {confirmDelete(type,id);return;}
      if (a==='user-view' && !isAdmin()) {state.overlay={mode:'user-view',id};renderOverlay();return;}
      if (a==='user-register' && !isAdmin()) {state.overlay={mode:'user-register',id};renderOverlay();return;}
      if (a==='user-cancel' && !isAdmin()) {state.overlay={mode:'user-cancel',id};renderOverlay();return;}
      if (a==='confirm-register' && !isAdmin()) {confirmRegistration(id);return;}
      if (a==='confirm-cancel-registration' && !isAdmin()) {confirmCancelRegistration(id);return;}
      if (a==='dismiss-toast') {clearTimeout(toastTimeout);toasts.innerHTML='';return;}
      if (a==='close-overlay') {if(button.classList.contains('overlay-backdrop') && e.target!==button) return;closeOverlay();return;}
    }
    const row=e.target.closest('[data-record-row]');
    if (row && isAdmin()) {state.selected[row.dataset.type]=row.dataset.id;updateTable();}
  });
  document.addEventListener('keydown', e => {
    if (e.key==='Escape' && state.overlay) {closeOverlay();return;}
    if (isAdmin() && (e.key==='Enter'||e.key===' ') && e.target.matches('[data-record-row]')) {e.preventDefault();state.selected[e.target.dataset.type]=e.target.dataset.id;updateTable();}
  });
  document.addEventListener('input', e => {
    if (e.target.id==='record-search') {state.query=e.target.value;isAdmin()?updateTable():updateUserLists();return;}
    const form=e.target.closest('form');
    if (!form) return;
    const name=e.target.name;
    const field=form.querySelector(`[data-error-for="${name}"]`);
    if (field) field.textContent='';
    e.target.removeAttribute('aria-invalid');
    const message=form.querySelector('.form-error');
    if (message) {message.hidden=true;message.textContent='';}
  });
  document.addEventListener('change', e => {
    if (e.target.id==='record-filter') {state.filter=e.target.value;isAdmin()?updateTable():updateUserLists();return;}
    if (e.target.id==='visitor-category' && !isAdmin()) {state.filter=e.target.value;updateUserLists();return;}
    if (e.target.id==='field-eventId' && state.overlay?.mode==='form' && state.overlay?.type==='schedules' && !state.overlay.id) {
      const event=Store.get('events',e.target.value);
      if (event) {document.getElementById('field-startsAt').value=event.startsAt;document.getElementById('field-endsAt').value=event.endsAt;}
    }
  });
  window.addEventListener('hashchange', () => {
    if (!isLoggedIn()) {
      if (location.hash === '#signup') { if (!document.getElementById('signup-page')) renderSignup(); }
      else if (!document.getElementById('login-page')) renderLogin();
      return;
    }
    const next=location.hash.slice(1);
    if(next!==state.page) {state.query='';state.filter='All';state.overlay=null;state.mobileNav=false;}
    renderApp();
  });
  Store.all('events');
  renderApp();
})();
