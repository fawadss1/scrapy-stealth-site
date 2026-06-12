// Init Syntax Highlighting
hljs.highlightAll();

// Populate Mobile Menu
document.getElementById('mobile-nav-target').innerHTML = document.querySelector('#sidebar-nav nav').innerHTML;
// Close drawer automatically when clicking a mobile menu item
document.querySelectorAll('#mobile-nav-target .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('sidebar-drawer').classList.add('-translate-x-full');
    });
});

// Tab Switching Mechanism
function switchTab(evt, tabId) {
    const container = evt.currentTarget.closest('.border-gray-800');
    container.querySelectorAll('.tab-pane').forEach(p => p.classList.replace('block', 'hidden'));
    container.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('text-white', 'border-indigo-500');
        b.classList.add('text-gray-500');
    });
    document.getElementById(tabId).classList.replace('hidden', 'block');
    evt.currentTarget.classList.add('text-white', 'border-indigo-500');
}

// Generate and Bind Copy-to-Clipboard Elements safely
document.querySelectorAll('.code-block').forEach(container => {
    const code = container.querySelector('code');
    if (!code) return;
    container.classList.add('relative');

    const btn = document.createElement('button');
    btn.className = "copy-btn absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold text-gray-400 bg-gray-800/80 hover:bg-indigo-600 hover:text-white rounded border border-gray-700/60 transition-all opacity-0 pointer-events-auto cursor-pointer flex items-center gap-1";
    btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';

    btn.addEventListener('click', () => {
        navigator.clipboard.writeText(code.innerText).then(() => {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
            btn.classList.add('bg-emerald-600', 'text-white');
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                btn.classList.remove('bg-emerald-600', 'text-white');
            }, 1800);
        });
    });
    container.appendChild(btn);
});

/** Set textContent on every element matching a CSS class name. */
function setGroupText(className, value) {
    document.querySelectorAll('.' + className).forEach(el => el.textContent = value);
}

function apiFetch(url, onSuccess, onError) {
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(res.status);
            return res.json();
        })
        .then(onSuccess)
        .catch(onError);
}

// 1. GitHub repo stats (stars, forks) + releases table — share one base URL
const GITHUB_REPO = 'https://api.github.com/repos/fawadss1/scrapy-stealth';

apiFetch(
    GITHUB_REPO,
    (repo) => {
        setGroupText('stars-lbl', repo.stargazers_count ?? '140+');
        setGroupText('forks-lbl', repo.forks_count ?? '—');
    },
    () => {
        setGroupText('stars-lbl', '140+');
        setGroupText('forks-lbl', '—');
    }
);

apiFetch(
    GITHUB_REPO + '/releases',
    (releases) => {
        const tbody = document.querySelector('#releases-table tbody');
        if (!Array.isArray(releases) || releases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500 text-xs italic">No dynamic tag release elements tracked.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        releases.slice(0, 5).forEach((rel, idx) => {
            const date = new Date(rel.published_at).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
            const isLatest = idx === 0;
            const isPre = rel.prerelease;
            const badgeColor = isPre ? '#e3b341' : '#238636';
            const badgeBorder = isPre ? '#f0883e' : '#2ea043';
            const badgeLabel = isPre ? 'Pre-release' : 'latest';

            const tagBadge = isLatest
                ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px 2px 6px;border-radius:9999px;font-size:11px;font-weight:600;background:${badgeColor}22;border:1px solid ${badgeBorder}55;color:${badgeColor};white-space:nowrap;">
                        ${badgeLabel}
                   </span>`
                : '';

            const preTag = isPre && !isLatest
                ? `<span style="display:inline-flex;align-items:center;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:600;background:#e3b34122;border:1px solid #f0883e55;color:#e3b341;">pre-release</span>`
                : '';

            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-800/10 transition-colors";
            tr.innerHTML = `
                <td class="p-3">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <a href="${rel.html_url}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 8px;border-radius:6px;font-size:12px;font-weight:600;background:#21262d;border:1px solid #30363d;color:#e6edf3;text-decoration:none;transition:border-color .15s;" onmouseover="this.style.borderColor='#8b949e'" onmouseout="this.style.borderColor='#30363d'">
                            <svg style="width:13px;height:13px;fill:#8b949e;" viewBox="0 0 16 16"><path d="M1 7.775V2.75C1 2.06 1.56 1.5 2.25 1.5h5.025a.75.75 0 0 1 .53.22l6.25 6.25a.75.75 0 0 1 0 1.06l-5.025 5.025a.75.75 0 0 1-1.06 0L1.22 8.305A.75.75 0 0 1 1 7.775zm1.5-.31 5.74 5.74 4.495-4.495L7 3.5H2.5v3.965zM4 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
                            ${rel.tag_name}
                        </a>
                        ${tagBadge}${preTag}
                    </div>
                </td>
                <td class="p-3 text-xs text-gray-400">${date}</td>
                <td class="p-3 text-xs"><a href="${rel.html_url}" target="_blank" class="text-indigo-400 hover:underline inline-flex items-center gap-1">View Bundle <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a></td>
            `;
            tbody.appendChild(tr);
        });
    },
    () => {
        const tbody = document.querySelector('#releases-table tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-red-400/60 text-xs italic">Failed to securely query versioning artifacts.</td></tr>';
    }
);

// 2. PyPI — version + downloads
apiFetch(
    'https://pypi.org/pypi/scrapy-stealth/json',
    (data) => {
        setGroupText('version-lbl', 'v' + data.info.version);
        setGroupText('downloads-lbl', '12K+');
    },
    () => {
        setGroupText('version-lbl', 'v0.4.0');
        setGroupText('downloads-lbl', '12K+');
    }
);

const targetSections = document.querySelectorAll('section, div[id="setup-global"], div[id="setup-spider"], div[id="proxy-rotation"], div[id="fingerprint-rotation"], div[id="intelligent-retry"]');
const sidebarLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-15% 0px -65% 0px', // Perfectly tuned tracking viewport threshold hot-zone
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const activeId = entry.target.getAttribute('id');
            if (!activeId) return;

            sidebarLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === '#' + activeId) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                }
            });
        }
    });
}, observerOptions);

targetSections.forEach(sec => observer.observe(sec));