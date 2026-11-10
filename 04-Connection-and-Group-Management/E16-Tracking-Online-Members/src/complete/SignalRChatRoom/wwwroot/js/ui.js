const els = {
    connectionStatus: document.getElementById("connection-status"),
    roomSelect: document.getElementById("room-select"),
    joinRoomButton: document.getElementById("join-room-button"),
    leaveRoomButton: document.getElementById("leave-room-button"),
    currentRoomLabel: document.getElementById("current-room"),
    messageForm: document.getElementById("message-form"),
    usernameInput: document.getElementById("username-input"),
    messageInput: document.getElementById("message-input"),
    sendButton: document.getElementById("send-button"),
    messagesList: document.getElementById("messages-list"),
    roomUsersList: document.getElementById("room-users-list"),
    roomUsersCount: document.getElementById("room-users-count")
};

//Connection state

export function connected() {
    els.connectionStatus.className = "connected";
    els.connectionStatus.textContent = "متصل";
    els.joinRoomButton.disabled = false;
}

export function reconnecting() {
    els.connectionStatus.className = "reconnecting";
    els.connectionStatus.textContent = "در حال اتصال مجدد...";
    els.joinRoomButton.disabled = true;
    els.leaveRoomButton.disabled = true;
    els.sendButton.disabled = true;
}

export function disconnected(text = "اتصال برقرار نشد") {
    els.connectionStatus.className = "disconnected";
    els.connectionStatus.textContent = text;
    els.joinRoomButton.disabled = true;
    els.leaveRoomButton.disabled = true;
    els.sendButton.disabled = true;
}

//Room state

export function enteredRoom() {
    els.currentRoomLabel.textContent =
        els.roomSelect.options[els.roomSelect.selectedIndex].text;
    els.usernameInput.disabled = true;
    els.leaveRoomButton.disabled = false;
    els.sendButton.disabled = false;
    els.messagesList.replaceChildren();
}

export function rejoinedRoom() {
    els.currentRoomLabel.textContent =
        els.roomSelect.options[els.roomSelect.selectedIndex].text;
    els.usernameInput.disabled = true;
    els.leaveRoomButton.disabled = false;
    els.sendButton.disabled = false;
}

export function leftRoom() {
    els.currentRoomLabel.textContent = "هیچ اتاقی انتخاب نشده";
    els.usernameInput.disabled = false;
    els.joinRoomButton.disabled = false;
    els.leaveRoomButton.disabled = true;
    els.sendButton.disabled = true;
    els.messagesList.replaceChildren();
    clearRoomUsers();
}

//Online members

export function renderRoomUsers(usernames) {
    const list = els.roomUsersList;
    const count = els.roomUsersCount;
    if (!list || !count) return;

    const existing = new Map();
    list.querySelectorAll("li[data-user]").forEach(li => {
        existing.set(li.dataset.user, li);
    });

    const newSet = new Set(usernames);

    existing.forEach((el, name) => {
        if (!newSet.has(name)) {
            el.classList.add("user-leaving");
            el.addEventListener("animationend", () => el.remove(), { once: true });
            existing.delete(name);
        }
    });

    usernames.forEach((name, index) => {
        let li = existing.get(name);

        if (!li) {
            li = createUserItem(name);
            li.classList.add("user-entering");
            li.addEventListener("animationend",
                () => li.classList.remove("user-entering"),
                { once: true });
            list.appendChild(li);
        }

        li.style.setProperty("--i", index);
        li.style.order = index;
    });

    const prev = parseInt(count.textContent, 10) || 0;
    const next = usernames.length;
    count.textContent = next;

    if (prev !== next) {
        count.classList.remove("bump-up", "bump-down");
        void count.offsetWidth;
        count.classList.add(next > prev ? "bump-up" : "bump-down");
    }
}

export function clearRoomUsers() {
    if (els.roomUsersList) {
        els.roomUsersList.querySelectorAll("li[data-user]").forEach(li => li.remove());
    }
    if (els.roomUsersCount) {
        els.roomUsersCount.textContent = "0";
    }
}

function createUserItem(name) {
    const li = document.createElement("li");
    li.dataset.user = name;

    const avatar = document.createElement("span");
    avatar.className = "user-avatar";
    avatar.style.setProperty("--hue", hashHue(name));
    avatar.textContent = getInitials(name);

    const nameSpan = document.createElement("span");
    nameSpan.className = "user-name";
    nameSpan.textContent = name;

    li.append(avatar, nameSpan);
    return li;
}

function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function hashHue(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
}

//Getters

export function getSelectedRoom() {
    return els.roomSelect.value;
}

export function getUsername() {
    return els.usernameInput.value.trim();
}

export function getMessage() {
    return els.messageInput.value;
}

//Actions

export function resetMessageInput() {
    els.messageInput.value = "";
    els.messageInput.focus();
}

export function renderMessage(username, message, sentAt) {
    const item = document.createElement("li");

    const usernameEl = document.createElement("strong");
    usernameEl.textContent = `${username}: `;

    const messageEl = document.createElement("span");
    messageEl.textContent = message;

    item.append(usernameEl, messageEl);

    if (sentAt) {
        const timeEl = document.createElement("small");
        timeEl.textContent = ` (${new Date(sentAt).toLocaleTimeString()})`;
        item.appendChild(timeEl);
    }

    els.messagesList.appendChild(item);
}

export function renderSystemMessage(message, type) {
    const item = document.createElement("li");
    item.className = `system-message system-message--${type}`;
    item.textContent = message;
    els.messagesList.appendChild(item);
}

//Events

export function onJoinClick(handler) {
    els.joinRoomButton.addEventListener("click", handler);
}

export function onLeaveClick(handler) {
    els.leaveRoomButton.addEventListener("click", handler);
}

export function onMessageSubmit(handler) {
    els.messageForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handler();
    });
}