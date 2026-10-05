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


connection.on("ReceiveMessage", renderMessage);

startConnection();

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

