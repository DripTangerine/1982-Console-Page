const output = document.getElementById("output");
const input = document.getElementById("command-input");
const prompt = document.getElementById("prompt");
const cursor = document.getElementById("cursor");

let currentPath = [];

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

// -------------------------
// FILESYSTEM
// -------------------------

const filesystem = {
    "README.TXT": {
        type: "file",
        path: "./C:/README.TXT"
    }
};

// -------------------------
// COMMANDS
// -------------------------

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
input.addEventListener("input", updateCursor);

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

    const commandLine = input.value.trim();

    if (!commandLine) {
        return;
    }

    print(prompt.textContent + " " + commandLine);

    input.value = "";

    updateCursor();

    await executeCommand(commandLine);

    updatePrompt();

    input.focus();
});
