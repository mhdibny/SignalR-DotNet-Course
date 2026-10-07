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


startConnection();

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
    const username = document.getElementById('username-input').value;
    const message = document.getElementById('message-input').value;

    try {
        await connection.invoke("SendMessageToHub", username, message);
    }
    catch (err) {
        console.log(err);
    }

}

//When new message received, we need to show it to users.
function renderMessage(username, message) {
    let html = `<li>${username}: ${message}</li>`;

    document.getElementById('message-container').insertAdjacentHTML("beforeend", html);
}

