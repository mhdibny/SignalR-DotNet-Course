const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById('colorPicker');
const lineWidthInput = document.getElementById('lineWidth');
const connectionStatus = document.getElementById('connectionStatus');

let isInititalStateLoaded = false;
const pendingSegments = [];


const connection = new signalR.HubConnectionBuilder()
    .withUrl('/onlineWhiteboard')
    .build();

connection.on("DrawReceived", (segment) => {
    if (!isInititalStateLoaded) {
        pendingSegments.push(segment);
        return;
    }

    drawSegment(segment);

});
connection.on("LoadDrawing", renderLoadedSegments);

function renderLoadedSegments(segments) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const segment of segments) {
        drawSegment(segment);
    }

    for (const segment of pendingSegments) {
        drawSegment(segment);
    }

    pendingSegments.length = 0;
    isInititalStateLoaded = true;

}

function drawSegment(segment) {
    ctx.beginPath();

    ctx.moveTo(segment.x1, segment.y1);
    ctx.lineTo(segment.x2, segment.y2);

    ctx.strokeStyle = segment.color;
    ctx.lineWidth = segment.lineWidth;
    ctx.lineCap = "round";

    ctx.stroke();
}

function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}

let isDrawing = false;
let previousPoint = null;

canvas.addEventListener("pointerdown", (event) => {
    isDrawing = true;
    previousPoint = getCanvasPoint(event);

    canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
    if (!isDrawing || !previousPoint) {
        return;
    }
    const currentPoint = getCanvasPoint(event);
    const segment = {
        x1: previousPoint.x,
        y1: previousPoint.y,
        x2: currentPoint.x,
        y2: currentPoint.y,
        color: colorPicker.value,
        lineWidth: Number(lineWidthInput.value)
    };

    if (connection.state === signalR.HubConnectionState.Connected) {

        connection.send("Draw", segment).catch(error => consloe.log(err));
    }

    drawSegment(segment);
    previousPoint = currentPoint;

});

function stopDrawing() {
    isDrawing = false;
    previousPoint = null;
}

canvas.addEventListener("pointerup", stopDrawing);

async function startConnection() {
    try {
        await connection.start();
        connectionStatus.textContent = "متصل به سرور";

    }
    catch (err) {
        connectionStatus.textContent = "اتصال برقرار نشد";
        console.log(err);
    }
}

startConnection();