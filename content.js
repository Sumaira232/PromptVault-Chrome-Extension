let lastFocusedElement = null;

// Track the last focused editable element

document.addEventListener(
    "focusin",
    function (event) {

        const element = event.target;

        if (
            element.matches(
                "textarea, input:not([type]), input[type='text'], input[type='search'], [contenteditable='true']"
            )
        ) {

            lastFocusedElement = element;

        }

    },
    true
);


// Receive messages from popup

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {

        if (message.type === "INSERT_PROMPT") {

            const element = lastFocusedElement;

            if (!element || !document.contains(element)) {

                sendResponse({
                    success: false,
                    error: "No editable field selected."
                });

                return;

            }

            insertText(element, message.text);

            sendResponse({
                success: true
            });

        }

        return true;

    }
);


// Insert text into the selected element

function insertText(element, text) {

    element.focus();

    if (element.isContentEditable) {

        document.execCommand("insertText", false, text);

    }

    else {

        const start = element.selectionStart;

        const end = element.selectionEnd;

        const currentValue = element.value;

        const newValue =
            currentValue.substring(0, start) +
            text +
            currentValue.substring(end);

        const newCursorPosition =
            start + text.length;

        const descriptor = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(element),
            "value"
        );

        if (descriptor && descriptor.set) {

            descriptor.set.call(element, newValue);

        } else {

            element.value = newValue;

        }

        element.setSelectionRange(
            newCursorPosition,
            newCursorPosition
        );

        element.dispatchEvent(
            new Event("input", { bubbles: true })
        );

    }

}