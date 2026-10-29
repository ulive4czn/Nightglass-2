const $ = id => document.getElementById(id);
let state = { tabs: [], activeTabId: null, current: null };

function render() {
  const tabsEl = $('tabs');
  tabsEl.replaceChildren();
  state.tabs.forEach(tab => {
    const el = document.createElement('div');
    el.className = 'tab' + (tab.id === state.activeTabId ? ' active' : '');
    el.title = tab.url || tab.title;
    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tab.title || 'New tab';
    const close = document.createElement('span');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = 'Close tab';
    close.addEventListener('click', event => {
      event.stopPropagation();
      window.nightglass.closeTab(tab.id);
    });
    el.append(title, close);
    el.addEventListener('click', () => window.nightglass.activateTab(tab.id));
    tabsEl.append(el);
  });
  const c = state.current;
  $('address').value = c?.url || '';
  $('back').disabled = !c?.canGoBack;
  $('forward').disabled = !c?.canGoForward;
  $('reload').textContent = c?.loading ? '×' : '↻';
  $('connectionStatus').textContent = c?.loading ? 'LOADING' : 'READY';
  $('statusText').textContent = c?.url ? (c.url.startsWith('https://') ? 'Secure HTTPS connection · tracker filter active' : 'Non-HTTPS connection · data may not be encrypted') : 'Your browsing data is kept in a temporary app session.';
  $('securityIcon').textContent = c?.url?.startsWith('https://') ? '◇' : '○';
  $('securityIcon').style.color = c?.url?.startsWith('https://') ? '#8aaf98' : '#c4a47d';
}

window.nightglass.onState(next => {
  state = next;
  render();
});
$('newTab').addEventListener('click', () => window.nightglass.newTab());
$('back').addEventListener('click', () => window.nightglass.back());
$('forward').addEventListener('click', () => window.nightglass.forward());
$('reload').addEventListener('click', () => window.nightglass.reload());
$('home').addEventListener('click', () => window.nightglass.home());
$('addressForm').addEventListener('submit', event => {
  event.preventDefault();
  window.nightglass.navigate($('address').value);
  $('address').blur();
});
$('privacyInfo').addEventListener('click', () => $('privacyPanel').hidden = !$('privacyPanel').hidden);
$('closePanel').addEventListener('click', () => $('privacyPanel').hidden = true);
$('clearSession').addEventListener('click', async () => {
  const ok = confirm('Clear cookies, site storage and cached files for this session? Some sites may sign you out.');
  if (ok) {
    await window.nightglass.clearSession();
    $('statusText').textContent = 'Session storage and cache cleared.';
  }
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
    event.preventDefault();
    $('address').focus();
    $('address').select();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
    event.preventDefault();
    window.nightglass.newTab();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w') {
    event.preventDefault();
    if (state.activeTabId !== null) window.nightglass.closeTab(state.activeTabId);
  }
});
