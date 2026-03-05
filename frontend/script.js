// ══════════════════════════════════════════════════════════
//  NÉCESSAIRE × Django REST API
// ══════════════════════════════════════════════════════════

const S = {
    tasks: [], allTasks: [], filter: 'all', prioFilter: 'all',
    search: '', editingId: null, detailId: null,
};

// ── API ───────────────────────────────────────────────────
function apiBase() { return document.getElementById('apiBase').value.replace(/\/$/, ''); }

async function api(method, path, body = null) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(apiBase() + path, opts);
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}

// ── TOAST ─────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast ${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── API STATUS DOT ────────────────────────────────────────
async function checkApi() {
    const dot = document.getElementById('apiDot');
    try {
        await fetch(apiBase() + '/dashboard/stats/');
        dot.className = 'api-dot ok';
    } catch {
        dot.className = 'api-dot err';
    }
}

// ── FETCH ALL TASKS ───────────────────────────────────────
async function fetchTasks() {
    try {
        // Toujours fetch TOUT, on filtre côté client
        const data = await api('GET', '/tasks/?page_size=200');
        S.allTasks = data.results ?? data;   // garde une copie complète
        S.tasks = S.filter === 'all'
            ? S.allTasks
            : S.allTasks.filter(t => t.status === S.filter);
        render();
    } catch (e) {
        toast('Impossible de charger les tâches. Vérifie la base URL.', 'error');
    }
}

// ── UTILS ─────────────────────────────────────────────────
function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function isOverdue(task) {
    return task.status === 'overdue' || (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done');
}
const STATUS_META = {
    pending: { label: 'À débuter', cls: 'pill-pending', dot: '⚪' },
    in_progress: { label: 'En cours', cls: 'pill-in_progress', dot: '🟡' },
    done: { label: 'Terminée', cls: 'pill-done', dot: '🟢' },
    overdue: { label: 'Dépassée', cls: 'pill-overdue', dot: '🔴' },
};
const PRIO_META = { 1: '🟢 Basse', 2: '🟡 Moyenne', 3: '🔴 Haute' };

function getFiltered() {
    let t = [...S.tasks];
    if (S.prioFilter !== 'all') t = t.filter(x => String(x.priority) === String(S.prioFilter));
    if (S.search.trim()) {
        const q = S.search.toLowerCase();
        t = t.filter(x => x.title.toLowerCase().includes(q) || (x.description || '').toLowerCase().includes(q));
    }
    return t;
}

// ── RENDER SIDEBAR ────────────────────────────────────────
function renderSidebar() {
    const total = S.tasks.length;
    const done = S.tasks.filter(t => t.status === 'done').length;
    ['all', 'in_progress', 'done', 'overdue'].forEach(k => {
        const el = document.getElementById('badge-' + k);
        if (!el) return;
        el.textContent = k === 'all' ? total : S.tasks.filter(t => t.status === k).length;
    });
    const pct = total ? Math.round(done / total * 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressLabel').textContent = `${done} / ${total} tâches`;
    document.querySelectorAll('.filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.filter === S.filter)
    );
    const titles = { all: 'Toutes les tâches', in_progress: 'En cours', done: 'Terminées', overdue: 'Dépassées' };
    document.getElementById('viewTitle').textContent = titles[S.filter] || 'Tâches';
}

// ── RENDER BOARD ──────────────────────────────────────────
function renderBoard() {
    const board = document.getElementById('taskBoard');
    const empty = document.getElementById('emptyState');
    const tasks = getFiltered();
    [...board.children].forEach(c => { if (c !== empty) c.remove(); });
    if (!tasks.length) { empty.classList.add('visible'); return; }
    empty.classList.remove('visible');

    tasks.forEach((task, i) => {
        const sm = STATUS_META[task.status] || STATUS_META.pending;
        const card = document.createElement('div');
        card.className = 'task-card' + (task.status === 'done' ? ' done' : '');
        card.style.animationDelay = (i * 0.04) + 's';
        card.dataset.id = task.id;
        card.innerHTML = `
      <div class="task-check${task.status === 'done' ? ' checked' : ''}" data-id="${task.id}"></div>
      <div class="task-body">
        <div class="task-title">${esc(task.title)}</div>
        ${task.description ? `<div class="task-desc">${esc(task.description)}</div>` : ''}
        <div class="task-meta">
          <span class="status-pill ${sm.cls}">${sm.dot} ${sm.label}</span>
          ${task.due_date ? `<span class="task-due${isOverdue(task) ? 'overdue' : ''}">${isOverdue(task) ? '⚠ ' : ''}${fmtDate(task.due_date)}</span>` : ''}
        </div>
      </div>
      <div class="task-right">
        <div class="prio-dot prio-${task.priority}" title="${PRIO_META[task.priority] || ''}"></div>
        <div class="task-actions">
          <button class="task-action-btn edit-btn" data-id="${task.id}" title="Modifier">✎</button>
          <button class="task-action-btn del del-btn"  data-id="${task.id}" title="Supprimer">✕</button>
        </div>
      </div>
    `;
        card.addEventListener('click', e => {
            if (e.target.closest('.task-check,.edit-btn,.del-btn')) return;
            openDetail(task.id);
        });
        board.appendChild(card);
    });

    board.querySelectorAll('.task-check').forEach(el =>
        el.addEventListener('click', ev => { ev.stopPropagation(); toggleDone(el.dataset.id); })
    );
    board.querySelectorAll('.edit-btn').forEach(el =>
        el.addEventListener('click', ev => { ev.stopPropagation(); openTaskModal(el.dataset.id); })
    );
    board.querySelectorAll('.del-btn').forEach(el =>
        el.addEventListener('click', ev => { ev.stopPropagation(); deleteTask(el.dataset.id); })
    );
}

function render() { renderSidebar(); renderBoard(); }

// ── ACTIONS ───────────────────────────────────────────────
async function toggleDone(id) {
    const task = S.tasks.find(t => t.id == id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    try {
        const updated = await api('PATCH', `/tasks/${id}/`, { status: newStatus });
        Object.assign(task, updated);
        render();
        toast(newStatus === 'done' ? '✓ Tâche terminée !' : 'Tâche réouverte');
    } catch { toast('Erreur lors de la mise à jour.', 'error'); }
}

async function deleteTask(id) {
    if (!confirm('Supprimer cette tâche ?')) return;
    try {
        await api('DELETE', `/tasks/${id}/`);
        S.tasks = S.tasks.filter(t => t.id != id);
        if (S.detailId == id) closeDetail();
        render();
        toast('Tâche supprimée.');
    } catch { toast('Erreur lors de la suppression.', 'error'); }
}

// ── MODAL TÂCHE ───────────────────────────────────────────
function openTaskModal(id = null) {
    S.editingId = id;
    const task = id ? S.tasks.find(t => t.id == id) : null;
    document.getElementById('modalTitle').textContent = id ? 'MODIFIER LA TÂCHE' : 'NOUVELLE TÂCHE';
    document.getElementById('taskTitle').value = task?.title || '';
    document.getElementById('taskDesc').value = task?.description || '';
    document.getElementById('taskStatus').value = task?.status || 'pending';
    document.getElementById('taskPriority').value = String(task?.priority ?? 2);
    document.getElementById('titleError').textContent = '';
    document.getElementById('taskTitle').classList.remove('error');
    if (task?.due_date) {
        // Convert to datetime-local format
        const d = new Date(task.due_date);
        document.getElementById('taskDue').value = d.toISOString().slice(0, 16);
    } else {
        document.getElementById('taskDue').value = '';
    }
    openOverlay('taskModalOverlay');
    setTimeout(() => document.getElementById('taskTitle').focus(), 60);
}
function closeTaskModal() { closeOverlay('taskModalOverlay'); S.editingId = null; }

async function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) {
        document.getElementById('taskTitle').classList.add('error');
        document.getElementById('titleError').textContent = 'Le titre est obligatoire.';
        document.getElementById('taskTitle').focus();
        return;
    }
    const dueRaw = document.getElementById('taskDue').value;
    const body = {
        title,
        description: document.getElementById('taskDesc').value.trim(),
        status: document.getElementById('taskStatus').value,
        priority: parseInt(document.getElementById('taskPriority').value),
        due_date: dueRaw ? new Date(dueRaw).toISOString() : null,
    };
    const btn = document.getElementById('saveTask');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Enregistrement…';
    try {
        if (S.editingId) {
            const updated = await api('PATCH', `/tasks/${S.editingId}/`, body);
            const idx = S.tasks.findIndex(t => t.id == S.editingId);
            if (idx !== -1) S.tasks[idx] = updated;
            toast('Tâche mise à jour !');
        } else {
            const created = await api('POST', '/tasks/', body);
            S.tasks.unshift(created);
            toast('Tâche créée !');
        }
        closeTaskModal();
        render();
    } catch (err) {
        const msg = typeof err === 'object' ? Object.values(err).flat().join(' ') : 'Erreur API.';
        toast(msg, 'error');
    }
    btn.disabled = false;
    btn.textContent = 'Enregistrer';
}

// ── MODAL DÉTAIL ──────────────────────────────────────────
function openDetail(id) {
    const task = S.tasks.find(t => t.id == id);
    if (!task) return;
    S.detailId = id;
    const sm = STATUS_META[task.status] || STATUS_META.pending;
    const overdue = isOverdue(task);
    document.getElementById('detailBody').innerHTML = `
    <div class="detail-title">${esc(task.title)}</div>
    ${task.description
            ? `<div class="detail-desc">${esc(task.description)}</div>`
            : `<div class="detail-desc" style="opacity:.35;font-style:italic">Aucune description.</div>`}
    <div class="detail-chips">
      <span class="detail-chip"><span class="status-pill ${sm.cls}">${sm.dot} ${sm.label}</span></span>
      <span class="detail-chip">${PRIO_META[task.priority] || '—'}</span>
    </div>
    <div class="detail-meta">
      ${task.created_at ? `<div class="detail-meta-row"><span class="dmr-key">CRÉÉE LE</span><span class="dmr-val">${new Date(task.created_at).toLocaleString('fr-FR')}</span></div>` : ''}
      ${task.due_date ? `<div class="detail-meta-row"><span class="dmr-key">ÉCHÉANCE</span><span class="dmr-val${overdue ? ' overdue' : ''}">${overdue ? '⚠ ' : ''}${fmtDate(task.due_date)}</span></div>` : ''}
      ${task.updated_at ? `<div class="detail-meta-row"><span class="dmr-key">MODIFIÉE LE</span><span class="dmr-val">${new Date(task.updated_at).toLocaleString('fr-FR')}</span></div>` : ''}
    </div>
  `;
    openOverlay('detailOverlay');
}
function closeDetail() { closeOverlay('detailOverlay'); S.detailId = null; }

// ── OVERLAY HELPERS ───────────────────────────────────────
function openOverlay(id) { document.getElementById(id).classList.add('open'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('open'); }

// ── WIRING ────────────────────────────────────────────────
document.getElementById('openTaskModal').addEventListener('click', () => openTaskModal());
document.getElementById('saveTask').addEventListener('click', saveTask);
document.getElementById('cancelTaskModal').addEventListener('click', closeTaskModal);
document.getElementById('closeTaskModal').addEventListener('click', closeTaskModal);
document.getElementById('taskTitle').addEventListener('input', function () {
    this.classList.remove('error');
    document.getElementById('titleError').textContent = '';
});
document.getElementById('taskTitle').addEventListener('keydown', e => { if (e.key === 'Enter') saveTask(); });

document.getElementById('closeDetail').addEventListener('click', closeDetail);
document.getElementById('detailEdit').addEventListener('click', () => { const id = S.detailId; closeDetail(); openTaskModal(id); });
document.getElementById('detailDelete').addEventListener('click', () => { if (S.detailId) deleteTask(S.detailId); });

['taskModalOverlay', 'detailOverlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
        if (e.target.id === id) { closeTaskModal(); closeDetail(); }
    });
});

document.querySelectorAll('.filter-btn').forEach(b =>
    b.addEventListener('click', () => {
        S.filter = b.dataset.filter;
        fetchTasks();
    })
);

document.querySelectorAll('.prio-chip').forEach(b =>
    b.addEventListener('click', () => {
        document.querySelectorAll('.prio-chip').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        S.prioFilter = b.dataset.prio;
        render();
    })
);

document.getElementById('searchInput').addEventListener('input', e => {
    S.search = e.target.value; render();
});

// Reload on base URL change
let apiTimer;
document.getElementById('apiBase').addEventListener('input', () => {
    clearTimeout(apiTimer);
    apiTimer = setTimeout(() => { checkApi(); fetchTasks(); }, 600);
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeTaskModal(); closeDetail(); return; }
    const tag = document.activeElement.tagName;
    if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT')
        openTaskModal();
});

// ── INIT ──────────────────────────────────────────────────
checkApi();
fetchTasks();