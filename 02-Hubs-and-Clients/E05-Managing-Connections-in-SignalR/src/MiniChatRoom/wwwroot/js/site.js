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

connection.on("ReceiveConnectionId", renderConnectionId);
connection.on("ReceiveMessage", renderMessage);

startConnection();

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

