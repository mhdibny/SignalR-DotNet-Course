(function () {
    "use strict";

    if (window.__quizAppLoaded) return;
    window.__quizAppLoaded = true;

    const state = {
        currentQuestion: 1,
        totalQuestions: 0,
        score: 0,
        isConnecting: false,
        isAnswering: false,
        isNavigating: false,
    };

    let connection = null;
    let isRestarting = false;

    function init() {
        UI.onClick("btn-connect", handleConnect);
        UI.onClick("btn-start", handleStart);
        UI.onClick("btn-next", handleNext);
        UI.onClick("btn-restart", handleRestart);
        UI.onOptionClick(handleAnswer);
    }

    document.addEventListener("DOMContentLoaded", init);

    async function createConnection() {
        if (connection) {
            try { await connection.stop(); } catch { }
            connection = null;
        }

        connection = new signalR.HubConnectionBuilder()
            .withUrl("/quizhub")
            .withAutomaticReconnect([2000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connection.on("ReceiveError", message => UI.showToast(message));

        connection.onreconnecting(() =>
            UI.showToast("اتصال قطع شد، در حال تلاش مجدد...", "info"));

        connection.onreconnected(() =>
            UI.showToast("اتصال دوباره برقرار شد.", "success"));

        connection.onclose(() => {
            if (!isRestarting) {
                UI.showToast("اتصال به سرور قطع شد.", "error");
            }
        });

        await connection.start();
    }

    async function handleConnect() {
        if (state.isConnecting) return;
        state.isConnecting = true;

        try {
            UI.showScreen("connecting");
            await createConnection();
            await UI.sleep(700);
            UI.showScreen("ready");
        } catch (err) {
            console.error(err);
            UI.showScreen("connect");
            UI.showToast("اتصال به سرور برقرار نشد. دوباره تلاش کن.");
        } finally {
            state.isConnecting = false;
        }
    }

    async function handleStart() {
        if (state.isAnswering || state.isNavigating) return;

        try {
            state.currentQuestion = 1;
            state.score = 0;
            state.totalQuestions = await connection.invoke("GetTotalQuestionsAsync");

            UI.updateScore(0);
            UI.showScreen("quiz");
            await loadQuestion(state.currentQuestion);
        } catch (err) {
            console.error(err);
            UI.showToast("خطا در شروع آزمون.");
        }
    }

    async function loadQuestion(questionId) {
        try {
            const question = await connection.invoke("GetQuestionAsync", questionId);
            if (question === null) return;
            UI.renderQuestion(question, questionId, state.totalQuestions);
        } catch (err) {
            console.error(err);
            UI.showToast("خطا در دریافت سوال.");
        }
    }

    async function handleAnswer(optionId) {
        if (state.isAnswering) return;
        state.isAnswering = true;

        try {
            const result = await connection.invoke(
                "SubmitAnswerAsync",
                state.currentQuestion,
                optionId
            );

            if (result === null) return;

            UI.markAnswer(optionId, result.correctOptionId);
            UI.updateScore(result.score);
            state.score = result.score;

            const isLast = state.currentQuestion >= state.totalQuestions;
            UI.enableNext(isLast);
        } catch (err) {
            console.error(err);
            UI.showToast("خطا در ثبت پاسخ.");
        } finally {
            state.isAnswering = false;
        }
    }

    async function handleNext() {
        if (state.isNavigating) return;
        state.isNavigating = true;
        UI.disableNext();

        try {
            if (state.currentQuestion >= state.totalQuestions) {
                await finishQuiz();
                return;
            }
            state.currentQuestion++;
            await loadQuestion(state.currentQuestion);
        } finally {
            state.isNavigating = false;
        }
    }

    async function finishQuiz() {
        try {
            const summary = await connection.invoke("GetScoreAsync");
            UI.showFinal({
                score: summary.score,
                total: summary.total,
                correct: summary.score,
                wrong: summary.answered - summary.score,
            });
        } catch (err) {
            console.error(err);
            UI.showToast("خطا در دریافت نمره.");
        }
    }

    async function handleRestart() {
        UI.showScreen("connecting");
        isRestarting = true;

        try {
            await createConnection();
            await UI.sleep(700);
            UI.showScreen("ready");

            state.currentQuestion = 1;
            state.score = 0;
        } catch (err) {
            console.error(err);
            UI.showScreen("final");
            UI.showToast("اتصال دوباره برقرار نشد. صفحه را رفرش کن.");
        } finally {
            isRestarting = false;
        }
    }
})();