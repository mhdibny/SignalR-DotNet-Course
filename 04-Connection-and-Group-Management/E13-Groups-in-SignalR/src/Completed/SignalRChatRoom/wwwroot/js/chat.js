const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .build();

const connectionStatus = document.getElementById("connection-status");
const roomSelect = document.getElementById("room-select");
const joinRoomButton = document.getElementById("join-room-button");
const leaveRoomButton = document.getElementById("leave-room-button");
const currentRoomLabel = document.getElementById("current-room");
const messageForm = document.getElementById("message-form");
const usernameInput = document.getElementById("username-input");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesList = document.getElementById("messages-list");
const feedback = document.getElementById("feedback");
let currentRoom = null;

connection.on("ReceiveMessage", renderMessage);


async function startConnection() {
    try {
        await connection.start();

        connectionStatus.className = "connected";
        connectionStatus.textContent = "متصل";

        joinRoomButton.disabled = false;
    }
    catch (error) {
        connectionStatus.className = "disconnected";
        connectionStatus.textContent = "اتصال برقرار نشد";

        console.error(error);
    }
}

async function joinRoom() {
    try {
        const succeeded = await connection.invoke("JoinRoom",roomSelect.value);

        if (!succeeded) {
            showError("ورود به اتاق انجام نشد.");
            return;
        }

        currentRoom = roomSelect.value;

        currentRoomLabel.textContent =
            roomSelect.options[roomSelect.selectedIndex].text;

        leaveRoomButton.disabled = false;
        sendButton.disabled = false;

        messagesList.replaceChildren();
        feedback.textContent = "";
    }
    catch (error) {
        console.error(error);
        showError("ورود به اتاق با خطا مواجه شد.");
    }
}

async function leaveRoom() {
    try {
        const succeeded = await connection.invoke("LeaveRoom");

        if (!succeeded) {
            showError("در حال حاضر عضو اتاقی نیستید.");
            return;
        }

        currentRoom = null;

        currentRoomLabel.textContent = "هیچ اتاقی انتخاب نشده";

        leaveRoomButton.disabled = true;
        sendButton.disabled = true;

        messagesList.replaceChildren();
        feedback.textContent = "";
    }
    catch (error) {
        console.error(error);
        showError("خروج از اتاق با خطا مواجه شد.");
    }
}

async function sendMessage() {
    if (!currentRoom) {
        showError("ابتدا وارد یک اتاق شوید.");
        return;
    }

    try {
        const succeeded = await connection.invoke(
            "SendMessage",
            usernameInput.value,
            messageInput.value
        );

        if (!succeeded) {
            showError("پیام ارسال نشد.");
            return;
        }

        messageInput.value = "";
        messageInput.focus();
    }
    catch (error) {
        console.error(error);
        showError("ارسال پیام با خطا مواجه شد.");
    }
}

function renderMessage(roomName, username, message, sentAt) {
    if (roomName !== currentRoom) {
        return;
    }

    const item = document.createElement("li");

    const usernameElement = document.createElement("strong");
    usernameElement.textContent = `${username}: `;

    const messageElement = document.createElement("span");
    messageElement.textContent = message;

    item.append(usernameElement, messageElement);

    if (sentAt) {
        const timeElement = document.createElement("small");
        timeElement.textContent =
            ` (${new Date(sentAt).toLocaleTimeString()})`;

        item.appendChild(timeElement);
    }

    messagesList.appendChild(item);
}
function showError(message) {
    feedback.className = "error";
    feedback.textContent = message;
}

joinRoomButton.addEventListener("click", joinRoom);
leaveRoomButton.addEventListener("click", leaveRoom);

messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await sendMessage();
});

startConnection();