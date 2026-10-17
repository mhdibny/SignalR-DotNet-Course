const connection = new signalR.HubConnectionBuilder()
    .withUrl("/ChatHub")
    .build();

async function startConnection() {
    try {
        await connection.start();
        console.log("connection started...")
    }
    catch (err) {
        console.log(err);
    }
}

//Handle server events
connection.on("ReceiveConnectionId", renderConnectionId);
connection.on("ReceiveMessage", renderMessage);
connection.on("MyConnectionReceivedMessages", rednerMyConnectionReceivedMessages);
connection.on("ReceivedHubInstanceId", renderHubInstanceId);
connection.on("ShowError", showErrorToast);

startConnection();

function renderHubInstanceId(hubId) {
    document.getElementById('hub-id').innerHTML = hubId;
}

async function testHubInstanceId() {
    try {
        await connection.invoke("TestHubInstance");
    }
    catch (err) {
        console.log(err);
    }
}

//Render messages received by this connection
function rednerMyConnectionReceivedMessages(username, message) {
    let html = `<li class="private-message">${username}: ${message}</li>`;

    document.getElementById('message-container').insertAdjacentHTML("beforeend", html);
}

//Send message to a specefic connection
async function sendMessageToTargetConnection() {
    const username = document.getElementById('username-input').value;
    const message = document.getElementById('message-input').value;
    const connectionId = document.getElementById('target-connection-id-input').value;

    try {
        await connection.invoke("SendMessageToTargetConnectionId", connectionId, username, message);
    }
    catch (err) {
        console.log(err);
    }

}


//Get current ConnectionID
async function getConnectionId() {
    try {
        await connection.invoke("GetConnectionId");
    }
    catch (err) {
        console.log(err);
    }
}

//Render current ConnectionID
async function renderConnectionId(cid) {
    document.getElementById('connection-id').innerHTML = cid;
}

//Send message to others clients
async function sendMessageToOthers() {
    try {
        await connection.invoke("SendMessageToOthers");
    }
    catch (err) {
        console.log(err);
    }
}

//For sending a new message to signalR hub.
async function sendMessage() {
    if (connection.state !== signalR.HubConnectionState.Connected) {
        showErrorToast(["اتصال برقرار نیست، لطفا صفحه را رفرش کنید."]);
        return;
    }

    const username = document.getElementById('username-input').value;
    const message = document.getElementById('message-input').value;
    const request = {
        username: username,
        message: message
    };

    try {
        const sendMessageResult = await connection.invoke("SendMessageToHub", request);
        if (sendMessageResult === true) {
            document.getElementById('message-input').value = '';
        }
    }
    catch (err) {
        console.log(err);
        showErrorToast(["ارسال پیام با خطا مواجه شد."]);
    }
}

//When new message received, we need to show it to users.
function renderMessage(username, message) {
    let html = `<li>${username}: ${message}</li>`;

    document.getElementById('message-container').insertAdjacentHTML("beforeend", html);
}

function showErrorToast(errors) {
    const toastContainer = document.getElementById("toast-container");
    const messages = Array.isArray(errors)
        ? errors
        : [String(errors)];

    const toast = document.createElement("div");
    toast.className = "toast-error";
    toast.setAttribute("role", "alert");

    const list = document.createElement("ul");

    for (const error of messages) {
        const item = document.createElement("li");
        item.textContent = error;
        list.appendChild(item);
    }

    toast.appendChild(list);
    toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 5000);
}
