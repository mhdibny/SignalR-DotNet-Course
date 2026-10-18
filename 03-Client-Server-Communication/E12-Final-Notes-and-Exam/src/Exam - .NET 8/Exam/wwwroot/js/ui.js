window.UI = (function () {
    "use strict";

    const el = {
        screens: {
            connect: document.getElementById("screen-connect"),
            connecting: document.getElementById("screen-connecting"),
            ready: document.getElementById("screen-ready"),
            quiz: document.getElementById("screen-quiz"),
            final: document.getElementById("screen-final"),
        },
        toast: document.getElementById("toast"),
        qCurrent: document.getElementById("q-current"),
        qTotal: document.getElementById("q-total"),
        progressFill: document.getElementById("progress-fill"),
        qText: document.getElementById("question-text"),
        optionsBox: document.getElementById("options"),
        scoreValue: document.getElementById("score-value"),
        scoreChip: document.getElementById("score-chip"),
        nextBtn: document.getElementById("btn-next"),
        finalScore: document.getElementById("final-score"),
        finalTotal: document.getElementById("final-total"),
        correctCount: document.getElementById("correct-count"),
        wrongCount: document.getElementById("wrong-count"),
        percentage: document.getElementById("percentage"),
    };

    const OPTION_LETTERS = ["الف", "ب", "ج", "د"];
    let toastTimer = null;

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function animateNumber(element, from, to, duration) {
        const start = performance.now();
        function frame(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = Math.round(from + (to - from) * eased);
            element.textContent = String(value);
            if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    function renderBidiText(container, text) {
        container.textContent = "";
        const pattern = /(?=[!-~]*[A-Za-z])[!-~]+/g;
        let lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                container.appendChild(
                    document.createTextNode(text.slice(lastIndex, match.index))
                );
            }
            const bdi = document.createElement("bdi");
            bdi.dir = "ltr";
            bdi.textContent = match[0];
            container.appendChild(bdi);
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            container.appendChild(
                document.createTextNode(text.slice(lastIndex))
            );
        }
    }

    function showScreen(name) {
        Object.values(el.screens).forEach(s => s && s.classList.remove("active"));
        const target = el.screens[name];
        if (target) target.classList.add("active");
    }

    function showToast(message, type = "error") {
        if (!el.toast) return;

        const palette = {
            error: { bg: "rgba(255, 69, 58, 0.95)", shadow: "rgba(255, 69, 58, 0.45)" },
            info: { bg: "rgba(10, 132, 255, 0.95)", shadow: "rgba(10, 132, 255, 0.45)" },
            success: { bg: "rgba(48, 209, 88, 0.95)", shadow: "rgba(48, 209, 88, 0.45)" },
        };
        const theme = palette[type] || palette.error;

        clearTimeout(toastTimer);
        el.toast.textContent = message;
        el.toast.style.background = theme.bg;
        el.toast.style.boxShadow = `0 12px 40px ${theme.shadow}`;

        void el.toast.offsetWidth;
        el.toast.classList.add("show");

        toastTimer = setTimeout(() => el.toast.classList.remove("show"), 3500);
    }

    function renderQuestion(question, index, total) {
        el.qCurrent.textContent = String(index);
        el.qTotal.textContent = String(total);

        const pct = total > 0 ? ((index - 1) / total) * 100 : 0;
        el.progressFill.style.width = pct + "%";

        el.nextBtn.disabled = true;
        el.nextBtn.textContent = "سوال بعدی";

        const hasPreviousOptions = el.optionsBox.children.length > 0;
        el.qText.style.transition = "opacity 0.25s ease";
        el.qText.style.opacity = "0";

        const oldOptions = el.optionsBox.querySelectorAll(".option-btn");
        oldOptions.forEach(btn => {
            btn.style.transition = "opacity 0.2s ease";
            btn.style.opacity = "0";
        });

        const fadeDuration = hasPreviousOptions ? 250 : 0;

        setTimeout(() => {
            renderBidiText(el.qText, question.text);
            el.qText.style.transition =
                "opacity 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2), " +
                "transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
            el.qText.style.transform = "translateY(8px)";
            el.qText.style.opacity = "1";

            requestAnimationFrame(() => {
                el.qText.style.transform = "translateY(0)";
            });

            el.optionsBox.innerHTML = "";

            question.options.forEach((opt, i) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "option-btn";
                btn.dataset.id = String(opt.id);
                btn.style.opacity = "0";
                btn.style.transform = "translateY(15px)";

                const letter = document.createElement("span");
                letter.className = "option-letter";
                letter.textContent = OPTION_LETTERS[i] || String(opt.id);

                const text = document.createElement("span");
                text.className = "option-text";
                renderBidiText(text, opt.text);

                btn.appendChild(letter);
                btn.appendChild(text);
                el.optionsBox.appendChild(btn);

                setTimeout(() => {
                    btn.style.transition =
                        "opacity 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2), " +
                        "transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
                    btn.style.opacity = "1";
                    btn.style.transform = "translateY(0)";
                }, 60 + i * 70);
            });
        }, fadeDuration);
    }

    function markAnswer(selectedId, correctId) {
        const buttons = el.optionsBox.querySelectorAll(".option-btn");
        buttons.forEach(btn => {
            btn.disabled = true;
            const id = Number(btn.dataset.id);
            if (id === correctId) {
                btn.classList.add("correct");
            } else if (id === selectedId) {
                btn.classList.add("wrong");
            } else {
                btn.classList.add("dimmed");
            }
        });
    }

    function updateScore(score) {
        el.scoreValue.textContent = String(score);
        el.scoreChip.classList.remove("bump");
        void el.scoreChip.offsetWidth;
        el.scoreChip.classList.add("bump");
        setTimeout(() => el.scoreChip.classList.remove("bump"), 400);
    }

    function enableNext(isLast) {
        el.nextBtn.disabled = false;
        el.nextBtn.textContent = isLast ? "مشاهده نتیجه" : "سوال بعدی";
    }

    function disableNext() {
        el.nextBtn.disabled = true;
    }

    function showFinal(data) {
        showScreen("final");

        el.finalTotal.textContent = String(data.total);
        el.correctCount.textContent = String(data.correct);
        el.wrongCount.textContent = String(data.wrong);

        const pct = data.total > 0
            ? Math.round((data.correct / data.total) * 100)
            : 0;
        el.percentage.textContent = pct + "%";

        el.finalScore.textContent = "0";
        animateNumber(el.finalScore, 0, data.score, 1200);
    }

    function onClick(id, handler) {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener("click", handler);
    }

    function onOptionClick(handler) {
        el.optionsBox.addEventListener("click", event => {
            const btn = event.target.closest(".option-btn");
            if (!btn || btn.disabled) return;
            handler(Number(btn.dataset.id));
        });
    }

    return {
        showScreen,
        showToast,
        renderQuestion,
        markAnswer,
        updateScore,
        enableNext,
        disableNext,
        showFinal,
        onClick,
        onOptionClick,
        sleep,
    };
})();