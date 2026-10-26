import { showError } from "./toast.js";
import * as ui from "./ui.js";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .build();

let currentRoom = null;

connection.on("ReceiveMessage", handleMessage);
connection.on("UserJoined", handleUserJoined);
connection.on("UserLeft", handleUserLeft);

ui.onJoinClick(joinRoom);
ui.onLeaveClick(leaveRoom);
ui.onMessageSubmit(sendMessage);

startConnection();

async function startConnection() {
    try {
        await connection.start();
        ui.connected();
    }
    catch (error) {
        console.error(error);
        ui.disconnected();
    }
}

async function joinRoom() {
    const room = ui.getSelectedRoom();
    const username = ui.getUsername();
    try {
        const succeeded = await connection.invoke("JoinRoom", room, username);

        if (!succeeded) {
            showError("ورود به اتاق انجام نشد.");
            return;
        }

        currentRoom = room;
        ui.enteredRoom();
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
        ui.leftRoom();
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
            ui.getUsername(),
            ui.getMessage()
        );

        if (!succeeded) {
            showError("پیام ارسال نشد.");
            return;
        }

        ui.resetMessageInput();
    }
    catch (error) {
        console.error(error);
        showError("ارسال پیام با خطا مواجه شد.");
    }
}

function handleMessage(room, username, message, sentAt) {
    if (room !== currentRoom) return;
    ui.renderMessage(username, message, sentAt);
}

function handleUserJoined(room, username) {
    if (room !== currentRoom) return;
    ui.renderSystemMessage(`${username} وارد اتاق شد.`, "joined");
}

function handleUserLeft(room, username) {
    if (room !== currentRoom) return;
    ui.renderSystemMessage(`${username} از اتاق خارج شد.`, "left");
}