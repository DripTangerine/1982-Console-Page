const output = document.getElementById("output");
const input = document.getElementById("command-input");
const prompt = document.getElementById("prompt");

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
            commandDIR();
            break;

        case "TYPE":
            await commandTYPE(parts[1]);
            break;

        case "CLS":
            output.textContent = "";
            break;

        case "HELP":
            commandHELP();
            break;

        case "ERROR":
            commandERROR();
            break;

        default:
            print("ERR SYx1");
    }
}

// DIR

function commandDIR() {

    if (currentPath.length !== 0) {
        print("ERR DFx3");
        return;
    }

    print("");
    print(" Directory of C:\\");
    print("");

    for (const name in filesystem) {

        const item = filesystem[name];

        if (item.type === "file") {
            print(name);
        }
    }

    print("");
}

// TYPE

const typingSpeed = 15; // milliseconds per character

async function typeText(text) {
    for (const character of text) {
        output.textContent += character;
        await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }

    output.textContent += "\n";
}

async function commandTYPE(filename) {

    if (!filename) {
        print("ERR FFx2");
        return;
    }

    filename = filename.toUpperCase();

    const file = filesystem[filename];

    if (!file || file.type !== "file") {
        print("ERR FFx2");
        return;
    }

    try {

        const response = await fetch(file.path);

        if (!response.ok) {
            print("ERR FFx2");
            return;
        }

        const text = await response.text();

    print("");
    await typeText(text);
    print("");

    } catch (error) {

        print("ERR FFx2");
        console.error(error);

    }
}

// HELP

function commandHELP() {

    print("");
    print("AVAILABLE COMMANDS:");
    print("");
    print("LS  --  DISPLAYS ALL FILES IN CURRENT DIRECTORY");
    print("TYPE_<filename>  --  DISPLAYS CONTENTS OF SPECIFIED FILE");
    print("CLS  --  CLEARS SCREEN");
    print("HELP --  DISPLAYS CURRENT SCREEN");
    print("");
    print("ERROR --  DISPLAYS ERROR CODES");
    print("");
}

// ERROR

function commandERROR() {

    print("");
    print("ERROR CODES:");
    print("");
    print("ERR SYx1 -- COMMAND SYNTAX FAILED");
    print("");
    print("ERR FFx2 -- FILE NOT FOUND");
    print("");
    print("ERR DFx3 -- DIRECTORY NOT FOUND");
    print("");
    print("ERR ICx4 -- INSUFFICIENT CLEARANCE");
}


// INPUT

const cursor = document.getElementById("cursor");

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

    cursor.style.left = (textWidth - input.scrollLeft) + "px";
}

input.addEventListener("input", updateCursor);
input.addEventListener("click", updateCursor);
input.addEventListener("keyup", updateCursor);
input.addEventListener("select", updateCursor);
input.addEventListener("focus", updateCursor);
input.addEventListener("keydown", () => {
    requestAnimationFrame(updateCursor);
});
    cursor.style.opacity = "0";
});

input.addEventListener("keydown", async function(event) {

    if (event.key !== "Enter") {
        return;
    }

    const commandLine = input.value.trim();

    if (!commandLine) {
        return;
    }

    print(prompt.textContent + " " + commandLine);

    input.value = "";

    await executeCommand(commandLine);

    updatePrompt();
});

updatePrompt();
updateCursor();
