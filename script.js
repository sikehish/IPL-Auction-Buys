"use strict";

let budget = localStorage.getItem("budget");

function formatBudget(budget) {
    let rupee = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    });

    if (budget >= 10000000) return `Rs ${rupee.format(budget / 10000000)} Cr`;
    if (budget >= 100000) return `Rs ${rupee.format(budget / 100000)} Lakh`;
    return `Rs ${budget}`;
}

const inputBudgetIfEmpty = (operation) => {
    while (budget === null || isNaN(budget) || budget === "") {
        budget = prompt("Enter a valid budget in Cr");
        if (operation == "delete-all" && budget === null) return "cancel";
        if (Number(budget)) {
            budget *= 10000000;
            localStorage.setItem("originalBudget", budget);
        }
    }
    budget = Number(budget);
    localStorage.setItem("budget", budget);
};

inputBudgetIfEmpty("first-render");

const statsContainer = document.getElementById("stats-container");
const batsmanTable = document.getElementById("batsman-table").querySelector("tbody");
const bowlerTable = document.getElementById("bowler-table").querySelector("tbody");
const wicketkeeperTable = document.getElementById("wicketkeeper-table").querySelector("tbody");
const allrounderTable = document.getElementById("allrounder-table").querySelector("tbody");

const budgetElement = document.getElementById("budget");
budgetElement.textContent = `Budget: ${formatBudget(budget)}`;

const players = JSON.parse(localStorage.getItem("players")) || {};

const addPlayerRow = (table, playerName, player) => {
    console.log(table)
    const row = table.insertRow();
    const nameCell = row.insertCell(0);
    const priceCell = row.insertCell(1);
    const nationalityCell = row.insertCell(2);

    nameCell.textContent = playerName;
    priceCell.textContent = `${player.price} ${player.denomination}`;
    nationalityCell.textContent = player.nationality;
};

const addPlayer = (playerName, player, initialRender=false) => {
    try {
        if(!initialRender) manageBudget(player, "add");
        budgetElement.textContent = `Budget: ${formatBudget(budget)}`;
        localStorage.setItem("budget", budget);
        players[playerName] = player;
        localStorage.setItem("players", JSON.stringify(players));

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
        alert(error.message);
    }
};

for (const playerName in players) {
    const player = players[playerName];
    addPlayer(playerName, player, true);
}

function manageBudget(player, operation) {
    const playerPrice =
        player.price * (player.denomination === "crore" ? 10000000 : 100000);
    switch (operation) {
        case "add":
            if (playerPrice >= budget) {
                throw new Error("Player price cannot exceed budget!");
            }
            budget -= playerPrice;
            break;
        case "remove":
            budget += playerPrice;
            break;
    }
}

document.getElementById("player-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const players = JSON.parse(localStorage.getItem("players")) || {};
    const playerName = document.getElementById("player-name-input")
        .value.trim();
    const playerPrice = Number(
        document.getElementById("player-price-input").value.trim()
    );
    const denomination = document.getElementById("denomination").value;
    const nationality = document.getElementById("nationality").value;
    const role = document.getElementById("role").value;

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

    addPlayer(playerName, player);

    document.getElementById("player-name-input").value = "";
    document.getElementById("player-price-input").value = "";
    document.getElementById("denomination").value = "lakhs";
});

document.getElementById("delete-all-btn").addEventListener("click", () => {
    budget = null;
    if (inputBudgetIfEmpty("delete-all") === "cancel") {
        budget = localStorage.getItem("budget");
        return;
    }
    localStorage.removeItem("players");
    budgetElement.textContent = `Budget: ${formatBudget(budget)}`;
    batsmanTable.innerHTML = "";
    bowlerTable.innerHTML = "";
    wicketkeeperTable.innerHTML = "";
    allrounderTable.innerHTML = "";
});
