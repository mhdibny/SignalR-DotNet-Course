const feedbackEl = document.getElementById("feedback");
if (feedbackEl) {
    feedbackEl.hidden = true;
    feedbackEl.addEventListener("click", hideToast);
}

let toastTimer = null;
let hideToken = 0;

const ICONS = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
const TITLES = { success: "موفق", error: "خطا", warning: "هشدار", info: "اطلاع" };

const SVG_NS = "http://www.w3.org/2000/svg";

function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
}

function svgEl(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
}

export function showToast(message, type = "info", duration = 3500) {
    if (!feedbackEl) return;

    clearTimer();
    hideToken++;

    const wasVisible = !feedbackEl.hidden && feedbackEl.classList.contains("toast-visible");

    feedbackEl.className = `toast toast-${type}`;
    feedbackEl.replaceChildren();
    feedbackEl.hidden = false;

    const accent = el("div", "toast-accent");

    const content = el("div", "toast-content");
    content.appendChild(el("div", "toast-title", TITLES[type] ?? TITLES.info));
    content.appendChild(el("div", "toast-message", message));

    const ring = el("div", "toast-ring");

    const svg = svgEl("svg", { viewBox: "0 0 100 100" });
    svg.classList.add("toast-ring-svg");

    svg.appendChild(svgEl("circle", {
        cx: 50, cy: 50, r: 40, class: "toast-ring-track"
    }));

    const progress = svgEl("circle", {
        cx: 50, cy: 50, r: 40, class: "toast-ring-progress"
    });
    svg.appendChild(progress);

    ring.appendChild(svg);
    ring.appendChild(el("div", "toast-icon", ICONS[type] ?? ICONS.info));

    feedbackEl.append(accent, content, ring);

    if (!wasVisible) {
        void feedbackEl.offsetWidth;
        feedbackEl.classList.add("toast-visible");
    }

    if (duration > 0) {
        progress.style.animationDuration = `${duration}ms`;
        void progress.offsetWidth;
        progress.classList.add("toast-ring-progress-active");
        toastTimer = window.setTimeout(hideToast, duration);
    }
}

export function hideToast() {
    if (!feedbackEl) return;
    clearTimer();

    if (feedbackEl.hidden) return;

    feedbackEl.classList.remove("toast-visible");
    const token = ++hideToken;

    window.setTimeout(() => {
        if (token !== hideToken || feedbackEl.hidden) return;
        feedbackEl.hidden = true;
        feedbackEl.className = "";
        feedbackEl.replaceChildren();
    }, 500);
}

function clearTimer() {
    if (toastTimer !== null) {
        window.clearTimeout(toastTimer);
        toastTimer = null;
    }
}

export const showError = (msg) => showToast(msg, "error");
export const showSuccess = (msg) => showToast(msg, "success");
export const showWarning = (msg) => showToast(msg, "warning");