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
        path: "C:/README.TXT"
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

        default:
            print("ERR AA0x2");
    }
}

// DIR

function commandDIR() {

    if (currentPath.length !== 0) {
        print("DIRECTORY NOT FOUND");
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

async function commandTYPE(filename) {

    if (!filename) {
        print("ERR AA0x2");
        return;
    }

    filename = filename.toUpperCase();

    const file = filesystem[filename];

    if (!file || file.type !== "file") {
        print("ERR AA0x2");
        return;
    }

    try {

        const response = await fetch(file.path);

        if (!response.ok) {
            print("ERR AA0x3");
            return;
        }

        const text = await response.text();

        print("");
        print(text);
        print("");

    } catch (error) {

        print("ERR AA0x3");

    }
}

// HELP

function commandHELP() {

    print("");
    print("AVAILABLE COMMANDS:");
    print("");
    print("LS------------------DISPLAYS ALL FILES IN CURRENT DIRECTORY");
    print("TYPE_<filename>-----DISPLAYS CONTENTS OF SPECIFIED FILE");
    print("CLS-----------------CLEARS SCREEN");
    print("HELP");
    print("");
}

// INPUT

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
