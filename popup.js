const promptForm = document.getElementById("promptForm");

const promptTitle = document.getElementById("promptTitle");

const promptBody = document.getElementById("promptBody");

const promptList = document.getElementById("promptList");

let editingId = null;

function loadPrompts() {

    chrome.storage.local.get(
        { prompts: [] },
        function (data) {

            displayPrompts(data.prompts);

        }
    );

}

chrome.storage.local.get()

function displayPrompts(prompts) {

    promptList.innerHTML = "";

    if (prompts.length === 0) {

        promptList.innerHTML =
            "<p>No prompts saved yet.</p>";

        return;
    }

    prompts.forEach(function (prompt) {

        const card = document.createElement("div");

        card.className = "prompt-card";

        const title = document.createElement("h3");

        title.textContent = prompt.title;

        const body = document.createElement("p");

        body.textContent = prompt.body;

        const insertButton = document.createElement("button");

        insertButton.textContent = "Insert";

        insertButton.addEventListener("click", function () {

            insertPrompt(prompt.body);

        });

        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        editButton.className = "edit-btn";

        editButton.addEventListener("click", function () {

            editPrompt(prompt);

        });

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function () {

            deletePrompt(prompt.id);

        });

        card.appendChild(title);

        card.appendChild(body);

        card.appendChild(insertButton);

        card.appendChild(editButton);

        card.appendChild(deleteButton);

        promptList.appendChild(card);

    });

}

promptForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = promptTitle.value.trim();

    const body = promptBody.value.trim();

    if (!title || !body) {

        return;

    }

    chrome.storage.local.get(
        { prompts: [] },
        function (data) {

            let prompts = data.prompts;

            if (editingId !== null) {

                prompts = prompts.map(function (prompt) {

                    if (prompt.id === editingId) {

                        return {
                            ...prompt,
                            title: title,
                            body: body
                        };

                    }

                    return prompt;

                });

                editingId = null;

                document.getElementById("saveBtn").textContent =
                    "Save Prompt";

            } else {

                const newPrompt = {

                    id: crypto.randomUUID(),

                    title: title,

                    body: body

                };

                prompts.push(newPrompt);

            }

            chrome.storage.local.set(
                { prompts: prompts },
                function () {

                    promptForm.reset();

                    displayPrompts(prompts);

                    updateContextMenus();

                }
            );

        }
    );

});

function editPrompt(prompt) {

    promptTitle.value = prompt.title;

    promptBody.value = prompt.body;

    editingId = prompt.id;

    document.getElementById("saveBtn").textContent =
        "Update Prompt";

}

function deletePrompt(id) {

    chrome.storage.local.get(
        { prompts: [] },
        function (data) {

            const updatedPrompts = data.prompts.filter(
                function (prompt) {

                    return prompt.id !== id;

                }
            );

            chrome.storage.local.set(
                { prompts: updatedPrompts },
                function () {

                    displayPrompts(updatedPrompts);

                    updateContextMenus();

                }
            );

        }
    );

}

function insertPrompt(text) {

    chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {

            if (!tabs[0] || !tabs[0].id) {
                return;
            }

            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    type: "INSERT_PROMPT",
                    text: text
                },
                function () {

                    if (chrome.runtime.lastError) {

                        console.log(
                            "Cannot access this page."
                        );

                    }

                }
            );

        }
    );

}
function updateContextMenus() {

    chrome.runtime.sendMessage({
        type: "UPDATE_CONTEXT_MENUS"
    });

}
loadPrompts();