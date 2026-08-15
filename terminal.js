const output = document.getElementById("output");
const input = document.getElementById("command-input");
const prompt = document.getElementById("prompt");
const cursor = document.getElementById("cursor");

let currentPath = [];
let pendingType = null;
let pendingTypeTimer = null;

let loggedIn = false;
let loginStage = "username";
let loginBusy = false;
let passwordDisplay = "";
let passwordValue = "";

const loginUsername = "ADMIN";
const loginPassword = "1982";

async function loadingBar(length = 20) {

    // Create one line for the loading bar
    const barElement = document.createElement("div");

    // Start with an empty bar
    barElement.textContent = "[" + " ".repeat(length) + "]";

    output.appendChild(barElement);

    for (let i = 0; i < length; i++) {

        // Random delay between 50 and 250 ms
        const delay = 50 + Math.random() * 200;

        await pause(delay);

        // Build the current state of the bar
        const bar =
            "■".repeat(i + 1) +
            " ".repeat(length - i - 1);

        // Update the EXISTING line
        barElement.textContent = "[" + bar + "]";

        window.scrollTo(0, document.body.scrollHeight);
    }
}

// -------------------------
// TERMINAL OUTPUT
// -------------------------

function print(text = "") {
    output.textContent += text + "\n";
    window.scrollTo(0, document.body.scrollHeight);
}

function updatePrompt() {
    if (currentPath.length === 0) {
        prompt.textContent = "C:\\>";
    } else {
        prompt.textContent = "C:\\" + currentPath.join("\\") + ">";
    }
}

const typingSpeed = 15;

async function typeText(text) {
    for (const character of text) {
        output.textContent += character;
        await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }

    output.textContent += "\n";
    window.scrollTo(0, document.body.scrollHeight);
}

function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------------
// FILESYSTEM
// -------------------------

const filesystem = {
    "README.TXT": {
        type: "file",
        path: "./C:/README.TXT"
    },

    "TEST1.TXT": {
        type: "file",
        path: "./C:/TEST1.TXT"
    },

    "TEST2.TXT": {
        type: "file",
        path: "./C:/TEST2.TXT"
    }
    
};

// -------------------------
// COMMANDS
// -------------------------

async function showLogin() {

    output.textContent = "";

    cursor.style.opacity = "0";

    await typeText("HALODYNE COMPUTING");
    await pause(200)
    await typeText("COPYRIGHT 1982")
    await pause(500)
    await loadingBar(20);
    await typeText("SYSTEM ACCESS REQUIRED");
    print("");

    await typeText("USERNAME:");

    prompt.textContent = "";

    input.type = "text";
    input.value = "";
    passwordValue = "";

    input.focus();

    cursor.style.opacity = "1";
}

async function processLogin(value) {

    if (loginBusy) {
        return;
    }

    loginBusy = true;

    if (loginStage === "username") {

        if (value.toUpperCase() === loginUsername) {

            print("USERNAME: " + value);
            print("");

            input.value = "";

            await typeText("PASSWORD:");

            loginStage = "password";
            passwordValue = "";

        } else {

            print("USERNAME: " + value);
            await typeText("INVALID USERNAME");
            print("");

            await typeText("USERNAME:");

            input.value = "";
        }

        loginBusy = false;
        input.focus();
        updateCursor();

        return;
    }

    if (loginStage === "password") {

        if (value === loginPassword) {

            print("PASSWORD: " + "*".repeat(value.length));
            print("");

            await typeText("ACCESS GRANTED");
            print("");

            loggedIn = true;
            loginStage = "username";

            input.value = "";
            passwordValue = "";

            updatePrompt();

        } else {

            print("PASSWORD: " + "*".repeat(value.length));
            await typeText("ACCESS DENIED");
            print("");

            await typeText("PASSWORD:");

            input.value = "";
            passwordValue = "";
        }

        loginBusy = false;
        input.focus();
        updateCursor();
    }
}

async function executeCommand(commandLine) {

    const parts = commandLine.trim().split(/\s+/);
    const command = parts[0].toUpperCase();

    switch (command) {

        case "LS":
            await commandLS();
            break;

        case "TYPE":
            await commandTYPE(parts[1]);
            break;

        case "CLS":
            output.textContent = "";
            break;

        case "HELP":
            await commandHELP();
            break;

        case "ERROR":
            await commandERROR();
            break;

        default:
            await typeText("ERR SYx1");
    }
}

// -------------------------
// LS
// -------------------------

async function commandLS() {

    if (currentPath.length !== 0) {
        await typeText("ERR DFx3");
        return;
    }

    for (const name in filesystem) {

        const item = filesystem[name];

        if (item.type === "file") {
            await typeText(name);
        }
    }

    print("");
}

// -------------------------
// TYPE
// -------------------------

async function commandTYPE(filename) {

    if (!filename) {
        await typeText("ERR FFx2");
        return;
    }

    filename = filename.toUpperCase();

    const file = filesystem[filename];

    if (!file || file.type !== "file") {
        await typeText("ERR FFx2");
        return;
    }

    // If another TYPE command is waiting,
    // run both files together.
    if (pendingType !== null) {

        clearTimeout(pendingTypeTimer);

        const firstFile = pendingType;

        pendingType = null;
        pendingTypeTimer = null;

        await runSyncedFiles(firstFile, file);

        return;
    }

    // Wait 500 ms to see if another TYPE command arrives.
    pendingType = file;

    pendingTypeTimer = setTimeout(async () => {

        if (pendingType === file) {

            pendingType = null;
            pendingTypeTimer = null;

            await runFile(file);
        }

    }, 500);
}

async function runFile(file) {

    try {

        const response = await fetch(file.path);

        if (!response.ok) {
            await typeText("ERR FFx2");
            return;
        }

        const text = await response.text();

        print("");
        await typeText(text);

    } catch (error) {

        await typeText("ERR FFx2");
        console.error(error);

    }
}

async function runSyncedFiles(file1, file2) {

    try {

        const [response1, response2] = await Promise.all([
            fetch(file1.path),
            fetch(file2.path)
        ]);

        if (!response1.ok || !response2.ok) {
            await typeText("ERR FFx2");
            return;
        }

        const [text1, text2] = await Promise.all([
            response1.text(),
            response2.text()
        ]);

        print("");

        const length = Math.max(text1.length, text2.length);

        for (let i = 0; i < length; i++) {

            if (i < text1.length) {
                output.textContent += text1[i];
            }

            if (i < text2.length) {
                output.textContent += text2[i];
            }

            await new Promise(resolve =>
                setTimeout(resolve, typingSpeed)
            );
        }

        output.textContent += "\n";

        window.scrollTo(0, document.body.scrollHeight);

    } catch (error) {

        await typeText("ERR FFx2");
        console.error(error);

    }
}

// -------------------------
// HELP
// -------------------------

async function commandHELP() {

    print("");
    await typeText("AVAILABLE COMMANDS:");
    print("");

    await typeText("LS  --  DISPLAYS ALL FILES IN CURRENT DIRECTORY");
    await typeText("TYPE_<filename>  --  DISPLAYS CONTENTS OF SPECIFIED FILE");
    await typeText("CLS  --  CLEARS SCREEN");
    await typeText("HELP --  DISPLAYS CURRENT SCREEN");

    print("");

    await typeText("ERROR --  DISPLAYS ERROR CODES");
}

// -------------------------
// ERROR
// -------------------------

async function commandERROR() {

    print("");
    await typeText("ERROR CODES:");
    print("");

    await typeText("ERR SYx1 -- COMMAND SYNTAX NOT FOUND OR FAILED");
    await typeText("ERR FFx2 -- FILE NOT FOUND");
    await typeText("ERR DFx3 -- DIRECTORY NOT FOUND");
    await typeText("ERR ICx4 -- INSUFFICIENT CLEARANCE");
}

// -------------------------
// INPUT / CURSOR
// -------------------------

function updateCursor() {

    const position = input.selectionStart;

    const measure = document.createElement("span");
    const styles = getComputedStyle(input);

    measure.style.position = "absolute";
    measure.style.visibility = "hidden";
    measure.style.whiteSpace = "pre";

    measure.style.fontFamily = styles.fontFamily;
    measure.style.fontSize = styles.fontSize;
    measure.style.fontWeight = styles.fontWeight;
    measure.style.fontStyle = styles.fontStyle;
    measure.style.letterSpacing = styles.letterSpacing;

    measure.textContent = input.value.substring(0, position);

    document.body.appendChild(measure);

    const textWidth = measure.getBoundingClientRect().width;

    measure.remove();

    cursor.style.left = textWidth + "px";
}

// Typing
input.addEventListener("input", function () {

    if (loginStage !== "password") {
        updateCursor();
        return;
    }

    const newLength = input.value.length;

    if (newLength > passwordValue.length) {

        // New character was typed
        passwordValue += input.value.slice(passwordValue.length);

    } else if (newLength < passwordValue.length) {

        // Character was deleted
        passwordValue = passwordValue.slice(0, newLength);
    }

    // Replace what is visible with stars
    input.value = "*".repeat(passwordValue.length);

    // Put cursor at the end
    input.selectionStart = input.value.length;
    input.selectionEnd = input.value.length;

    updateCursor();
});

// Clicking within text
input.addEventListener("click", updateCursor);

// Arrow keys, Home, End, etc.
input.addEventListener("keyup", updateCursor);

// Selecting text
input.addEventListener("select", updateCursor);

// Focus
input.addEventListener("focus", function () {
    cursor.style.opacity = "1";
    updateCursor();
});

// Lose focus
input.addEventListener("blur", function () {
    cursor.style.opacity = "0";
});

// Enter
input.addEventListener("keydown", async function (event) {

    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();

    if (loginBusy) {
        return;
    }
    
    let commandLine;

    if (loginStage === "password") {
        commandLine = passwordValue;
    } else {
        commandLine = input.value.trim();
    }
    
    if (!commandLine) {
        return;
    }

    // LOGIN SCREEN
    if (!loggedIn) {

        await processLogin(commandLine);

        updateCursor();

        return;
    }

    // NORMAL TERMINAL
    print(prompt.textContent + " " + commandLine);

    input.value = "";

    updateCursor();

    await executeCommand(commandLine);

    updatePrompt();

    input.focus();
});
updatePrompt();
showLogin();
