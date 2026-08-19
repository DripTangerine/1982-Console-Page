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
let passwordValue = "";
let connection = "DISCONNECTED";

const user = [
    {username: "ADMIN",
     password: "CALISTER1959",
     clearance: 2
    },
    {username: "USER1",
     password: "EXPECT1",
     clearance: 6
    },
    {username: "EZEKIEL",
     password: "WINTERGR0VE873",
     clearance: 4
    },
    {username: "MASTERACCESS",
     password: "H82MKEY452318",
     clearance: 10
    },
    {username: "GUEST",
     password: "",
     clearance: 1
    }
];
let currentUser = null;

const errorCodes = {
    syntax: "ERR SYx1",
    fileNotFound: "ERR FFx2",
    directoryNotFound: "ERR DFx3",
    insufficientClearance: "ERR ICx4"
};

async function loadingBar(length = 20) {

    const barElement = document.createElement("div");

    barElement.textContent = "[                    ]";

    output.appendChild(barElement);

    for (let i = 0; i < length; i++) {

        let delay = 60 + Math.random() * 120;

        if (Math.random() < 0.15) {
            delay += 300 + Math.random() * 500;
        }

        await pause(delay);

        const percentage = Math.round(((i + 1) / length) * 100);

        barElement.textContent =
            "[" +
            "#".repeat(i + 1) +
            "-".repeat(length - i - 1) +
            "] " +
            percentage +
            "%";

        output.scrollTop = output.scrollHeight;
    }

    output.appendChild(document.createElement("div"));
}

// TERMINAL OUTPUT


function print(text = "") {
    output.textContent += text + "\n";
    output.scrollTop = output.scrollHeight;
}

function updatePrompt() {
    if (currentPath.length === 0) {
        prompt.textContent = "C:\\>";
    } else {
        prompt.textContent = "C:\\" + currentPath.join("\\") + ">";
    }
}

let typingSpeed = 33;

function hasClearance(requiredLevel) {
    return currentUser && currentUser.clearance >= requiredLevel;
}

async function typeText(text) {
    for (const character of text) {
        output.textContent += character;
        await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }

    output.textContent += "\n";
    output.scrollTop = output.scrollHeight;
}

function scrollToInput() {
    const terminal = document.getElementById("terminal");

    terminal.scrollTop = terminal.scrollHeight;
}

function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// FILESYSTEM


const filesystem = {
    "README.TXT": {
        type: "file",
        path: "./C:/README.TXT",
        clearance: 1
    },

    "TEST1.TXT": {
        type: "file",
        path: "./C:/TEST1.TXT",
        clearance: 1
    },

    "TEST2.TXT": {
        type: "file",
        path: "./C:/TEST2.TXT",
        clearance: 1
    }
    
};


// COMMANDS

async function showLogin() {
    loggedIn = false;
    loginStage = "username";
    currentUser = null;

    output.textContent = "";
    prompt.textContent = "";

    cursor.style.opacity = "0";

    loginBusy = true;
    loginStage = "username";
    currentUser = null;

    typingSpeed = 1;

    await typeText(String.raw` _  _  __  _   __  __ __   ____  _ ___  
| || |/  \| | /__\| _\\ 'v' /  \| | __| 
| >< | /\ | || \/ | v |'. .'| | ' | _|  
|_||_|_||_|___\__/|__/  !_! |_|\__|___| `);

    typingSpeed = 150;
    await typeText("HALODYNE COMPUTING");

    await pause(200);

    typingSpeed = 33;
    await typeText("COPYRIGHT 1982");

    print("");

    await pause(500);

    await typeText("VERIFYING SYSTEM FILES");
    await loadingBar(25);

    print("");

    await pause(250);

    await typeText("CPU ........... OK");
    await typeText("MEMORY ........ 8192 OK");
    await typeText("DISPLAY ....... OK");
    await typeText("COM ADAPTER ... 300 BAUD OK");
    await typeText("PHONELINE ..... DISCONNECTED");

    print("");

    await typeText("SYSTEM ACCESS REQUIRED");

    print("");

    prompt.textContent = "USERNAME:";

    input.type = "text";
    input.value = "";
    passwordValue = "";

    input.focus();

    cursor.style.opacity = "1";
    loginBusy = false;
}


async function processLogin(value) {

    if (loginBusy) {
        return;
    }

    loginBusy = true;

    // USERNAME
    if (loginStage === "username") {

        const username = value.toUpperCase();

        const foundUser = user.find(
            account => account.username === username
        );

        if (!foundUser) {

            print(prompt.textContent + " " + value);

            await typeText("INVALID USERNAME");

            print("");

            prompt.textContent = "USERNAME:";
            input.value = "";

            loginBusy = false;
            input.focus();
            updateCursor();

            return;
        }

        // Store the logged-in user
        currentUser = foundUser;

        print(prompt.textContent + " " + value);
        print("");

        input.value = "";

        // GUEST/passwordless account
        if (currentUser.password === "") {

            await typeText("ACCESS GRANTED");
            print("");

            loggedIn = true;
            loginStage = "username";

            await pause(200);

            output.textContent = "";

            updatePrompt();

        } else {

            // Normal account requiring a password
            prompt.textContent = "PASSWORD:";
            loginStage = "password";
            passwordValue = "";
        }

        loginBusy = false;
        input.focus();
        updateCursor();

        return;
    }


    // PASSWORD
    if (loginStage === "password") {

        if (value === currentUser.password) {

            print(
                prompt.textContent + " " + "*".repeat(value.length)
            );

            print("");

            await typeText("ACCESS GRANTED");

            print("");

            loggedIn = true;
            loginStage = "username";

            input.value = "";
            passwordValue = "";

            await pause(200);

            output.textContent = "";

            updatePrompt();

        } else {

            print(
                prompt.textContent + " " + "*".repeat(value.length)
            );

            await typeText("ACCESS DENIED");

            print("");

            prompt.textContent = "PASSWORD:";

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
            if (!hasClearance(1)) {
                await giveError("insufficientClearance");
                break;
            }
                
            await commandLS();
            break;

        case "TYPE":
            if (!hasClearance(1)) {
                await giveError("insufficientClearance");
                break;
            }
            
            await commandTYPE(parts[1]);
            break;

        case "CLS":
            if (!hasClearance(1)) {
                await giveError("insufficientClearance");
                break;
            }
            
            output.textContent = "";
            break;

        case "HELP":
            if (!hasClearance(1)) {
                await giveError("insufficientClearance");
                break;
            }
            
            await commandHELP();
            break;

        case "ERROR":
            if (!hasClearance(1)) {
                await giveError("insufficientClearance");
                break;
            }
            
            await commandERROR();
            break;

        case "BAUD":
            if (!hasClearance(2)) {
                await giveError("insufficientClearance");
                break;
            }
            
            await commandBAUD(parts[1]);
            break;

        case "SYS":
            if (!hasClearance(2)) {
                await giveError("insufficientClearance");
                break;
            }
            
            await commandSYS();
            break;
            
        default:
            await giveError("syntax")
            break;
    }
}

// LS

async function commandLS() {

    if (currentPath.length !== 0) {
        await giveError("directoryNotFound")
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

// TYPE

async function commandTYPE(filename) {

    if (!filename) {
        await giveError("fileNotFound")
        return;
    }

    if (!hasClearance(file.clearance ?? 1)) {
    await giveError("insufficientClearance");
    return;
    }

    filename = filename.toUpperCase();

    const file = filesystem[filename];

    if (!file || file.type !== "file") {
        await giveError("fileNotFound")
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
            await giveError("fileNotFound")
            return;
        }

        const text = await response.text();

        print("");
        await typeText(text);

    } catch (error) {

        await giveError("fileNotFound")
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
            await giveError("fileNotFound")
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

        output.scrollTop = output.scrollHeight;

    } catch (error) {

        await giveError("fileNotFound")
        console.error(error);

    }
}

// HELP

async function commandHELP() {

    print("");
    await typeText("AVAILABLE COMMANDS:");
    print("");

    if (hasClearance(1)) {
        await typeText("LS  -----------------  DISPLAYS ALL FILES IN CURRENT DIRECTORY");
        await typeText("TYPE <filename>  ----  DISPLAYS CONTENTS OF SPECIFIED FILE");
        await typeText("CLS  ----------------  CLEARS SCREEN");
        await typeText("HELP ----------------  DISPLAYS CURRENT SCREEN");
        await typeText("ERROR ---------------  DISPLAYS ERROR CODES");
    }

    if (hasClearance(2)) {
        await typeText("BAUD ---------------- CHANGES COMMUNICATION RATE");
        await typeText("SYS ----------------- DISPLAYS SYSTEM INFORMATION");
    }

    print("");
}

// ERROR

async function commandERROR() {

    print("");
    await typeText("ERROR CODES:");
    print("");

    await typeText(`${errorCodes.syntax} -- COMMAND SYNTAX NOT FOUND OR FAILED`);
    await typeText(`${errorCodes.fileNotFound} -- FILE NOT FOUND`);
    await typeText(`${errorCodes.directoryNotFound} -- DIRECTORY NOT FOUND`);
    await typeText(`${errorCodes.insufficientClearance} -- INSUFFICIENT CLEARANCE`);
}

async function giveError(error) {
    await typeText(errorCodes[error] || errorCodes.syntax);
}
// BAUD

let currentBaud = 300;
async function commandBAUD(baud) {
    const baudRates = {
        "50": 200,
        "75": 133,
        "110": 91,
        "150": 67,
        "300": 33,
        "600": 17,
    };

    if (baudRates[baud]) {
        currentBaud = Number(baud);
        typingSpeed = baudRates[baud];

        await typeText(`COM ADAPTER ${currentBaud} BAUD`);
    } else {
        await typeText("INVALID BAUD RATE");
    }
}

//SYS

async function commandSYS() {
    print("");
    await typeText("HALODYNE FILE TERMINAL 1982 - FT82-600C/A");
    await typeText("MODEL REVISION 1.1.8");
    print("");
    await typeText("CPU: HC-81 3.00MHz");
    await typeText("MEMORY: 8192 BYTES");
    await typeText("DISPLAY: HDA-79 MODEL B");
    print("")
    await typeText("COMMUNICATION ADAPTER: HCA-82-600");
    await typeText(`CURRENT RATE: ${currentBaud} BAUD`);
    await typeText("SUPPORTED RATES: 50, 75, 110, 150, 300, 600");
    await typeText(`CURRENT CONNECTION: ${connection}`);
    print("")
    await typeText("STORAGE: HFS-78-400");
    await typeText("CAPACITY: 4.00 MB");
    await typeText("AVAILABLE: 2.89 MB");
    print("");
}
    

// INPUT / CURSOR

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
    scrollToInput();
});
updatePrompt();
showLogin();
