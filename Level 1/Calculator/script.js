// DOM Elements
const display = document.getElementById("display");
const btnContainer = document.getElementById("btnContainer");
const historyToggle = document.getElementById("historyToggle");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

// Toggle History Panel slideout
historyToggle.addEventListener("click", () => {
    historyPanel.classList.toggle("active");
});

// Centralized click controller (Event Delegation)
btnContainer.addEventListener("click", (e) => {
    if (!e.target.matches("button")) return;

    const btn = e.target;
    const val = btn.dataset.val;
    const action = btn.dataset.action;

    // Flush out the static Error string when beginning a new execution
    if (display.value === "Error") {
        display.value = "";
    }

    // Process character values (Numbers and core mathematical string additions)
    if (val) {
        display.value += val;
    }

    // Process custom operations
    if (action) {
        switch (action) {
            case "clear":
                display.value = "";
                break;
                
            case "delete":
                display.value = display.value.slice(0, -1);
                break;

            case "toggle-sign":
                toggleNumberSign();
                break;
                
            case "calculate":
                runCalculation();
                break;
        }
    }
});

// Smart toggling between positive and negative configurations
function toggleNumberSign() {
    if (!display.value || display.value === "Error") return;
    
    // Check if expression is just a single standalone number
    if (!isNaN(display.value)) {
        display.value = String(Number(display.value) * -1);
    } else {
        // Advanced calculation strings can wrap existing values into grouped negatives
        if (display.value.startsWith("-(") && display.value.endsWith(")")) {
            display.value = display.value.slice(2, -1);
        } else {
            display.value = `-(${display.value})`;
        }
    }
}

// Compute execution and register calculation logs inside history UI
function runCalculation() {
    let expression = display.value;
    if (!expression) return;

    try {
        // Pre-convert standard integer percentage patterns to safe decimals (e.g., 50% -> 50*0.01)
        let formattedExpression = expression.replace(/%/g, '*0.01');

        let result = eval(formattedExpression);
        
        // Sanitize abstract float rounding exceptions (e.g. 0.1 + 0.2 = 0.3000000000004)
        if (result % 1 !== 0) {
            result = parseFloat(result.toFixed(8));
        }

        // Add to history records
        addHistoryItem(expression, result);

        display.value = result;
    } catch (err) {
        display.value = "Error";
    }
}

// Append new computational data rows into history element tree
function addHistoryItem(expr, res) {
    // Remove default empty state messaging block if active
    const emptyState = historyList.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.innerHTML = `
        <div class="history-expr">${expr}</div>
        <div class="history-res">${res}</div>
    `;

    // Interactive history items: Clicking one populates your display!
    historyItem.addEventListener("click", () => {
        display.value = res;
    });

    // Prepend so the newest calculations always show at the top
    historyList.insertBefore(historyItem, historyList.firstChild);
}

// Clear all historical log values
clearHistoryBtn.addEventListener("click", () => {
    historyList.innerHTML = '<div class="empty-state">No recent calculations</div>';
});