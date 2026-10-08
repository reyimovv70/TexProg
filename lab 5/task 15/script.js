let secretNumber;
let attempts = 0;
let history = [];

const userNumber = document.querySelector("#userNumber");
const checkButton = document.querySelector("#checkButton");
const newGameButton = document.querySelector("#newGameButton");
const themeButton = document.querySelector("#themeButton");
const message = document.querySelector("#message");
const attemptsText = document.querySelector("#attempts");


// Функция генерации случайного числа
function generateNumber() {
    return Math.floor(Math.random() * 100) + 1;
}


// Функция запуска новой игры
function newGame() {
    secretNumber = generateNumber();
    attempts = 0;
    history = [];

    message.textContent = "Введите число";
    message.style.color = "black";

    attemptsText.textContent = "Количество попыток: 0";

    userNumber.value = "";
    userNumber.style.borderColor = "#ccc";
}


// Функция проверки числа
function checkNumber() {
    const number = Number(userNumber.value);

    if (number < 1 || number > 100 || isNaN(number)) {
        message.textContent = "Введите число от 1 до 100!";
        message.style.color = "red";
        return;
    }

    attempts++;

    history.push(number);

    // Цикл для просмотра истории попыток
    for (let i = 0; i < history.length; i++) {
        console.log("Попытка " + (i + 1) + ": " + history[i]);
    }


    if (number === secretNumber) {

        message.textContent =
            "🎉 Поздравляем! Вы угадали число " + secretNumber + "!";

        message.style.color = "green";

    } else if (number < secretNumber) {

        message.textContent =
            "⬆️ Загаданное число больше!";

        message.style.color = "orange";

    } else {

        message.textContent =
            "⬇️ Загаданное число меньше!";

        message.style.color = "orange";
    }

    attemptsText.textContent =
        "Количество попыток: " + attempts;
}


// Событие на кнопку "Проверить"
checkButton.addEventListener("click", checkNumber);


// Событие на кнопку "Новая игра"
newGameButton.addEventListener("click", newGame);


// Событие input
userNumber.addEventListener("input", function () {

    const number = Number(userNumber.value);

    if (number >= 1 && number <= 100) {
        userNumber.style.borderColor = "green";
    } else {
        userNumber.style.borderColor = "red";
    }

});


// Событие для переключения темы
themeButton.addEventListener("click", function () {

    document.body.style.backgroundColor = "#222";
    document.body.style.color = "white";

    message.style.color = "white";

});


// Запускаем игру
newGame();