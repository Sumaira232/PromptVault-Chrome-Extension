chrome.runtime.onInstalled.addListener(function () {

    createContextMenus();

});


// Create context menus

function createContextMenus() {

    chrome.contextMenus.removeAll(function () {

        chrome.contextMenus.create({

            id: "promptvault-root",

            title: "PromptVault",

            contexts: ["editable"]

        });

        chrome.storage.local.get(
            { prompts: [] },
            function (data) {

                data.prompts.forEach(function (prompt) {

                    chrome.contextMenus.create({

                        id: "prompt-" + prompt.id,

                        parentId: "promptvault-root",

                        title: prompt.title,

                        contexts: ["editable"]

                    });

                });

            }
        );

    });

}


// Handle right-click menu selection

chrome.contextMenus.onClicked.addListener(
    function (info, tab) {

        if (
            !info.menuItemId.startsWith("prompt-") ||
            !tab ||
            !tab.id
        ) {

            return;

        }

        const promptId =
            info.menuItemId.replace("prompt-", "");

        chrome.storage.local.get(
            { prompts: [] },
            function (data) {

                const selectedPrompt = data.prompts.find(
                    function (prompt) {

                        return prompt.id === promptId;

                    }
                );

                if (!selectedPrompt) {
                    return;
                }

                chrome.tabs.sendMessage(
                    tab.id,
                    {
                        type: "INSERT_PROMPT",
                        text: selectedPrompt.body
                    }
                );

            }
        );

    }
);
chrome.runtime.onMessage.addListener(
    function (message) {

        if (message.type === "UPDATE_CONTEXT_MENUS") {

            createContextMenus();

        }

    }
);