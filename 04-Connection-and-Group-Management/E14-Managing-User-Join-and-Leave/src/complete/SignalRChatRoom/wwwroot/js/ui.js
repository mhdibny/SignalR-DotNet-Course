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
    messagesList: document.getElementById("messages-list")
};

//Connection

export function connected() {
    els.connectionStatus.className = "connected";
    els.connectionStatus.textContent = "متصل";
    els.joinRoomButton.disabled = false;
}

export function disconnected() {
    els.connectionStatus.className = "disconnected";
    els.connectionStatus.textContent = "اتصال برقرار نشد";
}

//Room

export function enteredRoom() {
    els.currentRoomLabel.textContent =
        els.roomSelect.options[els.roomSelect.selectedIndex].text;
    els.usernameInput.disabled = true;
    els.leaveRoomButton.disabled = false;
    els.sendButton.disabled = false;
    els.messagesList.replaceChildren();
}

export function leftRoom() {
    els.currentRoomLabel.textContent = "هیچ اتاقی انتخاب نشده";
    els.usernameInput.disabled = false;
    els.joinRoomButton.disabled = false;
    els.leaveRoomButton.disabled = true;
    els.sendButton.disabled = true;
    els.messagesList.replaceChildren();
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