// Constants for minimum and maximum number of players and maximum number of overseas players
const MIN_PLAYERS = 18;
const MAX_PLAYERS = 25;
const MAX_OVERSEAS = 8;

// Retrieve budget from localStorage, using localStorage to keep app data even if the user leaves or reloads the page
let budget = localStorage.getItem("budget");

// Retrieve players data from localStorage, if it exists, or initialize an empty object
const players = JSON.parse(localStorage.getItem("players")) || {};

// Function to format budget amount with currency symbol
function formatBudget(budget) {
    let rupee = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    });

    if (budget >= 10000000) return `Rs ${rupee.format(budget / 10000000)} Cr`;
    if (budget >= 100000) return `Rs ${rupee.format(budget / 100000)} Lakh`;
    return `Rs ${budget}`;
}

// Function to prompt user for budget input if it is empty or invalid
const inputBudgetIfEmpty = (operation) => {
    while (budget === null || isNaN(budget) || budget === "" || Number(budget) <= 0) {
        budget = prompt("Enter a valid budget in Cr");
        if (operation == "reset" && budget === null) return "cancel";
        if (Number(budget) > 0) {
            budget *= 10000000;
            localStorage.setItem("originalBudget", budget);
        }
    }
    budget = Number(budget);
    localStorage.setItem("budget", budget);
};

// Call inputBudgetIfEmpty function to prompt for budget input on first render
inputBudgetIfEmpty("first-render");

// Get references to HTML elements
const statsContainer = document.getElementById("stats-container");
const batsmanTable = document.getElementById("batsman-table").querySelector("tbody");
const bowlerTable = document.getElementById("bowler-table").querySelector("tbody");
const wicketkeeperTable = document.getElementById("wicketkeeper-table").querySelector("tbody");
const allrounderTable = document.getElementById("allrounder-table").querySelector("tbody");
const budgetElement = document.getElementById("budget");

// Display budget amount on the page
budgetElement.textContent = `Budget: ${formatBudget(budget)}`;

// Function to update statistics on the page
const updateStats = () => {
    const players = JSON.parse(localStorage.getItem("players")) || {};
    const totalPlayersCount = Object.keys(players).length;
    const totalOverseasPlayersCount = Object.values(players).filter(player => player.nationality === "overseas").length;
    document.getElementById("total-players-value").textContent = totalPlayersCount;
    document.getElementById("total-overseas-players-value").textContent = totalOverseasPlayersCount;
};

// Call updateStats function to display initial statistics
updateStats();

// Function to add a player row to the specified table
const addPlayerRow = (table, playerName, player) => {
    const row = table.insertRow();
    const nameCell = row.insertCell(0);
    const priceCell = row.insertCell(1);
    const nationalityCell = row.insertCell(2);

    nameCell.textContent = playerName;
    priceCell.textContent = `${player.price} ${player.denomination}`;
    nationalityCell.textContent = player.nationality;
};

// Function to add a player to the players object and display the player in the appropriate table
const addPlayer = (playerName, player, initialRender=false) => {
    try {
        if(!initialRender) manageBudget(player, "add");
        budgetElement.textContent = `Budget: ${formatBudget(budget)}`;
        localStorage.setItem("budget", budget);
        players[playerName] = player;
        // Storing the data of players in our localStorage
        localStorage.setItem("players", JSON.stringify(players));

        // Sending the player details to be added to the right table
        switch (player.role) {
            case "batsman":
                addPlayerRow(batsmanTable, playerName, player);
                break;
            case "bowler":
                addPlayerRow(bowlerTable, playerName, player);
                break;
            case "wicketkeeper":
                addPlayerRow(wicketkeeperTable, playerName, player);
                break;
            case "allrounder":
                addPlayerRow(allrounderTable, playerName, player);
                break;
            default:
                break;
        }
    } catch (error) {
        console.log(error)
        throw(error.message)
    }
};

// Loop through existing players and add them to the players object and display in the appropriate table
for (const playerName in players) {
    const player = players[playerName];
    addPlayer(playerName, player, true);
}

// Function to manage budget based on player addition or removal
function manageBudget(player, operation) {
    // Keeping count of overseas players
    const count = Object.values(players).filter((player) => player.nationality === "overseas").length;

    const playerPrice =player.price * (player.denomination === "crore" ? 10000000 : 100000);
    switch (operation) {
        case "add":
            if (playerPrice > budget) {
                throw new Error("Player price cannot exceed budget!");
            }
            else if(playerPrice==budget && Object.keys(players).length<MIN_PLAYERS-1){
                throw new Error("You need to buy atleast " + (MIN_PLAYERS-Object.keys(players).length-1) + " players!")
            }
            else if(Object.keys(players).length==MAX_PLAYERS){
                throw new Error(`You can't have more than ${MAX_PLAYERS} players playing for you!`)
            }
            else if(count==MAX_OVERSEAS){
                throw new Error(`You can't have more than ${MAX_OVERSEAS} overseas players!`)
            }
            budget -= playerPrice;
            break;
        case "remove":
            // This is functionality for you to implement! 
            // Try adding a remove player button for each player so that teams can manage their roster!
            budget += playerPrice;
            break;
    }
}

// Event listener for player form submission
document.getElementById("player-form").addEventListener("submit", (e) => {
    e.preventDefault();
    // Getting all the values from the form
    const playerName = document.getElementById("player-name-input").value.trim();
    const playerPrice = Number(document.getElementById("player-price-input").value.trim());
    const denomination = document.getElementById("denomination").value;
    const nationality = document.getElementById("nationality").value;
    const role = document.getElementById("role").value;

    // Some checks to make sure our data is right.
    if (!playerName) {
        alert("ERROR: Player's name cannot be empty!");
        return;
    }

    if (!playerPrice || isNaN(playerPrice)) {
        alert("ERROR: Player's price has to be a valid number!");
        return;
    }

    if (playerName in players) {
        alert("Player already entered!");
        return;
    }

    const player = { price: playerPrice, denomination, nationality, role };

    try {
        addPlayer(playerName, player);
        updateStats()
    } catch(err) {
        alert(err)
        return
    }

    // To clear the form - not always needed, it would do it automatically, but we did e.preventDefault() that prevents the form from clearing.
    document.getElementById("player-name-input").value = "";
    document.getElementById("player-price-input").value = "";
    document.getElementById("denomination").value = "lakhs";
});

// Event listener for reset button click
document.getElementById("reset-btn").addEventListener("click", () => {
    budget = null; // Reset the budget
    // Ask for a budget again.
    // If the user cancels the prompt, then don't delete the player data and restore the budget value
    if (inputBudgetIfEmpty("reset") === "cancel") {
        budget = localStorage.getItem("budget");
        return;
    }
    localStorage.removeItem("players");
    budgetElement.textContent = `Budget: ${formatBudget(budget)}`;
    batsmanTable.innerHTML = "";
    bowlerTable.innerHTML = "";
    wicketkeeperTable.innerHTML = "";
    allrounderTable.innerHTML = "";
    document.getElementById("player-name-input").value = "";
    document.getElementById("player-price-input").value = "";
    document.getElementById("denomination").value = "lakhs";
    document.getElementById("total-players-value").textContent = 0;
    document.getElementById("total-overseas-players-value").textContent = 0;
});