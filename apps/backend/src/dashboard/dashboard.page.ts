import {
  GROUP_ORDER,
  NPM_SCRIPT_GROUPS,
  NpmScriptEntry,
  npmRunCommand,
} from './scripts.catalog';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderScriptRow(script: NpmScriptEntry): string {
  const command = npmRunCommand(script.name);
  return `
    <li class="row">
      <div class="run">
        <code>${escapeHtml(command)}</code>
        <button type="button" class="copy-btn" data-copy="${escapeHtml(command)}" title="Copy command" aria-label="Copy ${escapeHtml(command)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        </button>
      </div>
      <p class="meta">
        <span class="does">${escapeHtml(script.description)}</span>
        <span class="sep" aria-hidden="true">·</span>
        <span class="when">${escapeHtml(script.when)}</span>
      </p>
    </li>`;
}

function renderGroup(title: string, scripts: NpmScriptEntry[]): string {
  if (scripts.length === 0) return '';
  const rows = scripts.map(renderScriptRow).join('');
  return `
    <section class="panel">
      <header class="panel-head"><h2>${escapeHtml(title)}</h2></header>
      <ul class="panel-body">${rows}</ul>
    </section>`;
}

export function renderDashboardPage(scripts: NpmScriptEntry[]): string {
  const byGroup = new Map<NpmScriptEntry['group'], NpmScriptEntry[]>();
  for (const group of GROUP_ORDER) byGroup.set(group, []);
  for (const script of scripts) byGroup.get(script.group)?.push(script);

  const panels = GROUP_ORDER.map((group) =>
    renderGroup(NPM_SCRIPT_GROUPS[group], byGroup.get(group) ?? []),
  ).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Backend scripts · Spendbrains</title>
  <style>
    :root, [data-theme="light"] {
      --ink-900: #0c0e12;
      --ink-700: #2a3140;
      --ink-500: #525c6b;
      --ink-400: #6b7585;
      --ink-200: #c4cad4;
      --ink-100: #e4e8ee;
      --ink-50: #f3f5f8;
      --white: #ffffff;
      --blue-700: #1e40af;
      --blue-600: #2563eb;
      --blue-500: #3b82f6;
      --blue-100: #dbeafe;
      --blue-50: #eff6ff;
      --navy-900: #0f172a;
      --navy-800: #1e293b;
      --success: #15803d;

      --bg: var(--ink-50);
      --bg-subtle: linear-gradient(180deg, #eef2f7 0%, #f6f8fb 100%);
      --surface: var(--white);
      --surface-muted: #fafbfd;
      --border: var(--ink-100);
      --border-strong: var(--ink-200);
      --text: var(--ink-900);
      --text-secondary: var(--ink-700);
      --text-tertiary: var(--ink-500);
      --accent: var(--blue-600);
      --accent-soft: var(--blue-50);
      --accent-border: #bfdbfe;
      --bar-bg: var(--navy-900);
      --bar-text: #f8fafc;
      --bar-muted: #94a3b8;
      --shadow-sm: 0 1px 2px rgba(12, 14, 18, 0.05);
      --shadow-md: 0 4px 16px rgba(12, 14, 18, 0.06);
    }

    [data-theme="dark"] {
      --ink-900: #f1f5f9;
      --ink-700: #cbd5e1;
      --ink-500: #94a3b8;
      --ink-400: #64748b;
      --ink-200: #334155;
      --ink-100: #243044;
      --ink-50: #1a2230;
      --white: #141a24;
      --blue-700: #93c5fd;
      --blue-600: #60a5fa;
      --blue-500: #3b82f6;
      --blue-100: #1e3a5f;
      --blue-50: #152238;
      --navy-900: #080b10;
      --navy-800: #0f141c;
      --success: #4ade80;

      --bg: #090b0f;
      --bg-subtle: linear-gradient(180deg, #090b0f 0%, #0e1218 100%);
      --surface: #121820;
      --surface-muted: #161d27;
      --border: #222b38;
      --border-strong: #2f3a4d;
      --text: #eef2f7;
      --text-secondary: #b6c0cc;
      --text-tertiary: #7b8798;
      --accent: var(--blue-600);
      --accent-soft: var(--blue-50);
      --accent-border: #1e3a5f;
      --bar-bg: #06080c;
      --bar-text: #e8edf4;
      --bar-muted: #6b7788;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.35);
      --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    *, *::before, *::after { box-sizing: border-box; }

    html {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 12px;
      line-height: 1.45;
      letter-spacing: -0.01em;
      color: var(--text);
      background: var(--bg);
      background-image: var(--bg-subtle);
      transition: background 0.2s ease, color 0.2s ease;
    }

    .page {
      width: 100%;
      padding: 14px clamp(14px, 2.5vw, 28px) 20px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
      padding: 11px 16px;
      background: var(--bar-bg);
      color: var(--bar-text);
      border-radius: 8px;
      box-shadow: var(--shadow-md);
    }

    .topbar-text h1 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .topbar-text p {
      margin: 3px 0 0;
      font-size: 11px;
      font-weight: 400;
      color: var(--bar-muted);
      letter-spacing: 0;
    }

    .topbar-text code {
      font-family: "Cascadia Code", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
      font-size: 10.5px;
      font-weight: 500;
      color: var(--blue-500);
      letter-spacing: 0;
    }

    .theme-btn {
      flex-shrink: 0;
      font: 500 11px/1 "Segoe UI", ui-sans-serif, system-ui, sans-serif;
      padding: 6px 12px;
      border: 1px solid var(--border-strong);
      border-radius: 6px;
      background: var(--surface-muted);
      color: var(--text-secondary);
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
    }

    .theme-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--accent-soft);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: clamp(10px, 1.2vw, 14px);
    }

    @media (max-width: 1080px) {
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; }
      .row { grid-template-columns: 1fr; gap: 4px; }
    }

    .panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .panel:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
    }

    .panel-head {
      padding: 7px 12px;
      background: var(--accent-soft);
      border-bottom: 1px solid var(--accent-border);
    }

    .panel-head h2 {
      margin: 0;
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--blue-700);
    }

    .panel-body {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .row {
      display: grid;
      grid-template-columns: minmax(128px, 42%) 1fr;
      gap: 10px 14px;
      align-items: start;
      padding: 7px 12px;
      border-bottom: 1px solid var(--border);
      transition: background 0.12s ease;
    }

    .row:last-child { border-bottom: none; }
    .row:nth-child(even) { background: var(--surface-muted); }
    .row:hover { background: var(--accent-soft); }

    .run {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .run code {
      font-family: "Cascadia Code", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
      font-size: 11px;
      font-weight: 500;
      line-height: 1.3;
      letter-spacing: -0.02em;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      min-width: 0;
    }

    .does { color: var(--text-secondary); font-weight: 450; }
    .sep { margin: 0 5px; color: var(--ink-400); font-weight: 400; }
    .when { color: var(--text-tertiary); font-weight: 400; }

    .copy-btn {
      flex-shrink: 0;
      display: inline-flex;
      width: 22px;
      height: 22px;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 5px;
      background: transparent;
      color: var(--text-tertiary);
      cursor: pointer;
      transition: background 0.12s, border-color 0.12s, color 0.12s;
    }

    .copy-btn:hover {
      background: var(--surface);
      border-color: var(--border-strong);
      color: var(--accent);
    }

    .copy-btn.copied {
      color: var(--success);
      border-color: transparent;
      background: transparent;
    }

    .foot {
      margin: 12px 2px 0;
      font-size: 10px;
      color: var(--text-tertiary);
      letter-spacing: 0.01em;
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="topbar">
      <div class="topbar-text">
        <h1>npm scripts</h1>
        <p>Run from <code>apps/backend</code> · Postgres: <code>docker compose up -d</code> at repo root</p>
      </div>
      <button type="button" class="theme-btn" id="theme-toggle" aria-label="Toggle color theme">Dark mode</button>
    </header>
    <div class="grid">${panels}</div>
    <p class="foot">Server · Prisma · DB status panels — coming next.</p>
  </div>
  <script>
    (function () {
      var root = document.documentElement;
      var btn = document.getElementById('theme-toggle');
      var stored = localStorage.getItem('spendbrains-dashboard-theme');
      var theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      function apply(t) {
        root.setAttribute('data-theme', t);
        btn.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
        localStorage.setItem('spendbrains-dashboard-theme', t);
      }
      apply(theme);
      btn.addEventListener('click', function () {
        apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
      document.querySelectorAll('.copy-btn').forEach(function (el) {
        el.addEventListener('click', async function () {
          var text = el.getAttribute('data-copy');
          if (!text) return;
          try {
            await navigator.clipboard.writeText(text);
            el.classList.add('copied');
            setTimeout(function () { el.classList.remove('copied'); }, 1000);
          } catch (_) {}
        });
      });
    })();
  </script>
</body>
</html>`;
}
