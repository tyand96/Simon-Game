const buttonColors = ["red", "blue", "green", "yellow"];

class Var_SimonGame {
    constructor() {
        this.reset();
        this.playingGame = false;

        if (typeof Var_SimonGame.instance == "object") {
            return Var_SimonGame.instance;
        }

        Var_SimonGame.instance = this;
        return this;
    }

    grabGameLock() {
        this.playingGame = true;
    }

    releaseGameLock() {
        this.playingGame = false;
    }

    increaseLevel() {
        this.currentLevel++;
    }

    reset() {
        this.gameOver = false;
        this.gamePattern = [];
        this.chosenPattern = [];
        this.buttonPushed = false;
        this.currentLevel = 1;
    }
}

function flashElement(element) {
    // button.fadeOut(100).fadeIn(100);
    element.addClass("pressed");
    setTimeout(() => {
        element.removeClass("pressed");
    }, 100);
}

function playSound(color) {
    const soundFile = `./assets/sounds/${color}.mp3`;

    switch (color) {
        case "blue":
        case "green":
        case "red":
        case "yellow":
        case "wrong":
            {
                const audio = new Audio(soundFile);
                audio.play();
                break;
            }
        default:
            console.error(`Bad file: ${soundFile}`);
    }
}

async function State_StartingState() {
    $("body").removeClass("game-over");
    $("h1").text("Click Here to Start.");

    state = State_UpdateHeader;
}

async function State_AddNewColor() {
    const upperInt = buttonColors.length;
    const randomNumber = Math.floor(Math.random() * upperInt);
    const newColor = buttonColors[randomNumber];

    gameVar.gamePattern.push(newColor);
    state = State_DisplayColorSequence;
}

async function State_DisplayColorSequence() {
    const gamePattern = gameVar.gamePattern;
    for (var i=0; i<gamePattern.length; i++) {
        const selector = `button#${gamePattern[i]}`;
        await sleep(300);
        flashElement($(selector));
        playSound(gamePattern[i]);
    }

    state = State_FirstInputPrep;
}

async function State_DisplayChosenColor() {
    const selector = `button#${gameVar.chosenPattern[gameVar.chosenPattern.length - 1]}`;
    flashElement($(selector));

    state = State_CheckUserInput;
}

async function State_PlayColorSound() {
    const chosenPattern = gameVar.chosenPattern;
    const gamePattern = gameVar.gamePattern;
    playSound(chosenPattern[chosenPattern.length - 1]);

    if (gamePattern.length === chosenPattern.length) {
        gameVar.increaseLevel();
        state = State_UpdateHeader;
        await sleep(1000);
    } else {
        state = State_InputPrep;
    }
}

async function State_UpdateHeader() {
    $("h1").text(`Level ${gameVar.currentLevel}`);

    state = State_AddNewColor;
}

async function State_FirstInputPrep() {
    gameVar.chosenPattern = [];

    state = State_InputPrep;
}

async function State_InputPrep() {
    gameVar.buttonPushed = false;

    $("button").on("click", function (event) {
        gameVar.chosenPattern.push(event.target.id);
        gameVar.buttonPushed = true;
    })

    state = State_CaptureUserInput;
}

async function State_CaptureUserInput() {
    if (gameVar.buttonPushed) {
        $("button").off("click");
        state = State_DisplayChosenColor;
    }
}

async function State_CheckUserInput() {
    const chosenPattern = gameVar.chosenPattern;
    const chosenLength = chosenPattern.length;
    const gameSubPattern = gameVar.gamePattern.slice(0, chosenLength);

    if (chosenPattern.toString() === gameSubPattern.toString()) {
        state = State_PlayColorSound;
    } else {
        state = State_PlayWrongSound;
    }
}

async function State_PlayWrongSound() {
    playSound("wrong");

    state = State_ShowWrongAnswer;
}

async function State_ShowWrongAnswer() {
    state = State_GameOver;
}

async function State_GameOver() {
    $("body").addClass("game-over");

    $("h1").text(`Game Over. Score: ${gameVar.currentLevel}. Click here to restart.`);

    setTimeout(() => {
        $("body").removeClass("game-over");
    }, 200);
    
    gameVar.gameOver = true;
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));




let gameVar = new Var_SimonGame();
let state = State_StartingState;

async function playGame() {
    if (!gameVar.playingGame) {
        gameVar.grabGameLock();
        gameVar.reset();
        state = State_StartingState;
        while (!gameVar.gameOver) {
            await sleep(50);
            await state();
        }
        gameVar.releaseGameLock();
    }
}

$("h1").on("click", function () {
    if (!gameVar.playingGame) {
        flashElement($(this));
        playGame();
    }
});