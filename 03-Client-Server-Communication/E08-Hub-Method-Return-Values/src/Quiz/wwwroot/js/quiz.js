const connection = new signalR.HubConnectionBuilder()
    .withUrl("quizHub")
    .build();

const connectionStatus =
    document.getElementById("connection-status");

const checkAnswerButton =
    document.getElementById("check-answer");

async function startConnection() {
    try {
        await connection.start();

        connectionStatus.textContent =
            "اتصال برقرار شد.";

        checkAnswerButton.disabled = false;
    }
    catch (err) {
        connectionStatus.textContent =
            "اتصال به Server برقرار نشد.";
    }
}

startConnection();


async function submitAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    const resultElement = document.getElementById('result');

    checkAnswerButton.disabled = true;
    resultElement.textContent = "درحال بررسی پاسخ...";

    try {
        const isCorrect = await connection.invoke("CheckAnswer", selectedOption.value); 
        
        if (isCorrect) {
            resultElement.textContent = "آفرین، پاسخت درست بود.";
        }
        else {
            resultElement.textContent = "اشتباه زدی";
        }
    }
    catch (err) {
        resultElement.textContent = "مشکلی از سمت سرور وجود دارد.";
    }
    finally {
        checkAnswerButton.disabled = false;
    }

    }

checkAnswerButton.addEventListener('click', submitAnswer);