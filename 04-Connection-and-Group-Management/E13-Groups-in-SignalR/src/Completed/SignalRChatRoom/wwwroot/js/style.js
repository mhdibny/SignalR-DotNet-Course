(function () {
    function enhance() {
        const nativeSelect = document.getElementById("room-select");

        if (!nativeSelect || nativeSelect.dataset.enhanced === "true") {
            return;
        }

        nativeSelect.dataset.enhanced = "true";
        nativeSelect.classList.add("room-select-native");
        nativeSelect.setAttribute("tabindex", "-1");
        nativeSelect.setAttribute("aria-hidden", "true");

        const wrapper = document.createElement("div");
        wrapper.className = "custom-select";

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "custom-select-trigger";
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");

        const valueSpan = document.createElement("span");
        valueSpan.className = "custom-select-value";

        const arrowSpan = document.createElement("span");
        arrowSpan.className = "custom-select-arrow";
        arrowSpan.setAttribute("aria-hidden", "true");
        arrowSpan.innerHTML =
            '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

        trigger.appendChild(valueSpan);
        trigger.appendChild(arrowSpan);

        const menu = document.createElement("ul");
        menu.className = "custom-select-menu";
        menu.setAttribute("role", "listbox");
        menu.hidden = true;

        function refreshValue() {
            const current = nativeSelect.options[nativeSelect.selectedIndex];
            valueSpan.textContent = current ? current.text : "";
        }

        function refreshOptions() {
            menu.replaceChildren();

            Array.from(nativeSelect.options).forEach(function (option, index) {
                const item = document.createElement("li");
                item.className = "custom-select-option";
                item.setAttribute("role", "option");
                item.setAttribute("tabindex", "-1");
                item.textContent = option.text;

                if (index === nativeSelect.selectedIndex) {
                    item.classList.add("is-selected");
                    item.setAttribute("aria-selected", "true");
                } else {
                    item.setAttribute("aria-selected", "false");
                }

                item.addEventListener("click", function () {
                    pick(index);
                });

                menu.appendChild(item);
            });
        }

        function refresh() {
            refreshValue();
            refreshOptions();
        }

        function pick(index) {
            nativeSelect.selectedIndex = index;
            nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
            refresh();
            closeMenu();
            trigger.focus();
        }

        function openMenu() {
            menu.hidden = false;
            trigger.setAttribute("aria-expanded", "true");

            const selected = menu.querySelector(".is-selected") || menu.firstElementChild;

            if (selected) {
                selected.focus();
            }
        }

        function closeMenu() {
            menu.hidden = true;
            trigger.setAttribute("aria-expanded", "false");
        }

        function toggleMenu() {
            if (menu.hidden) {
                openMenu();
            } else {
                closeMenu();
            }
        }

        trigger.addEventListener("click", toggleMenu);

        trigger.addEventListener("keydown", function (event) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                openMenu();
            }
        });

        menu.addEventListener("keydown", function (event) {
            const options = Array.from(menu.querySelectorAll(".custom-select-option"));
            const currentIndex = options.indexOf(document.activeElement);

            if (event.key === "ArrowDown") {
                event.preventDefault();
                const next = options[Math.min(currentIndex + 1, options.length - 1)];
                if (next) next.focus();
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                const prev = options[Math.max(currentIndex - 1, 0)];
                if (prev) prev.focus();
            } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (currentIndex >= 0) pick(currentIndex);
            } else if (event.key === "Home") {
                event.preventDefault();
                options[0]?.focus();
            } else if (event.key === "End") {
                event.preventDefault();
                options[options.length - 1]?.focus();
            } else if (event.key === "Tab") {
                closeMenu();
            }
        });

        document.addEventListener("click", function (event) {
            if (!wrapper.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !menu.hidden) {
                closeMenu();
                trigger.focus();
            }
        });

        nativeSelect.parentNode.insertBefore(wrapper, nativeSelect);
        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);
        wrapper.appendChild(nativeSelect);

        refresh();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", enhance);
    } else {
        enhance();
    }
})();