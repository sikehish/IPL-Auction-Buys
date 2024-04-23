"use strict";

const MIN_PLAYERS=18
const MAX_PLAYERS=25
const MAX_OVERSEAS=8

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


inputBudgetIfEmpty("first-render");

const statsContainer = document.getElementById("stats-container");
const batsmanTable = document.getElementById("batsman-table").querySelector("tbody");
const bowlerTable = document.getElementById("bowler-table").querySelector("tbody");
const wicketkeeperTable = document.getElementById("wicketkeeper-table").querySelector("tbody");
const allrounderTable = document.getElementById("allrounder-table").querySelector("tbody");

const budgetElement = document.getElementById("budget");
budgetElement.textContent = `Budget: ${formatBudget(budget)}`;

const players = JSON.parse(localStorage.getItem("players")) || {};

const updateStats = () => {
    const players = JSON.parse(localStorage.getItem("players")) || {};
    const totalPlayersCount = Object.keys(players).length;
    const totalOverseasPlayersCount = Object.values(players).filter(player => player.nationality === "overseas").length;
    document.getElementById("total-players-value").textContent = totalPlayersCount;
    document.getElementById("total-overseas-players-value").textContent = totalOverseasPlayersCount;
};


updateStats();

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
        throw(error.message)
    }
};

for (const playerName in players) {
    const player = players[playerName];
    addPlayer(playerName, player, true);
}

function manageBudget(player, operation) {
    //Keeping count of overseas players
    const players = JSON.parse(localStorage.getItem("players")) || {};
    const count = Object.values(players).filter((player) => player.nationality === "overseas").length;

    const playerPrice =player.price * (player.denomination === "crore" ? 10000000 : 100000);
    switch (operation) {
        case "add":
            if (playerPrice > budget) {
                throw new Error("Player price cannot exceed budget!");
            }
            else if(playerPrice==budget && Object.keys(players)<MIN_PLAYERS-1){
                throw new Error("You need to buy atleast " + (MIN_PLAYERS-Object.keys(players)-1) + " players!")
            }
            else if(Object.keys(players)==MAX_PLAYERS){
                throw new Error("You can't have more than 25 players playing for you!")
            }
            else if(count==MAX_OVERSEAS){
                throw new Error("You can't have more than 8 overseas players!")
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

    try{
        addPlayer(playerName, player);
        updateStats()
    }catch(err){
        alert(err)
        return
    }

    document.getElementById("player-name-input").value = "";
    document.getElementById("player-price-input").value = "";
    document.getElementById("denomination").value = "lakhs";
});

document.getElementById("reset-btn").addEventListener("click", () => {
    budget = null;
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
