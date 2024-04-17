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


const inputBudgetIfEmpty=(operation)=>{
    while (budget === null || isNaN(budget) || budget === "") {
        budget = prompt("Enter a valid budget in Cr");
        if(operation=="delete-all" && budget===null) return "cancel"
        if (Number(budget)) {
            budget *= 10000000;
            localStorage.setItem("originalBudget",budget);
            console.log(budget)
        }
    }
    budget = Number(budget);
    localStorage.setItem("budget", budget);
}

inputBudgetIfEmpty("first-render")

const statsContainer = document.getElementById("stats-container");
const playersContainer = document.getElementById("players-container");

const budgetElement = document.createElement("div");
budgetElement.textContent = `Budget: ${formatBudget(budget)}`;
budgetElement.className = "budget";
statsContainer.appendChild(budgetElement);

const players = JSON.parse(localStorage.getItem("players")) || {};

for (const playerName in players) {
    const player = players[playerName];
    const playerElement = document.createElement("div");
    playerElement.textContent = `${playerName}: ${player.price} ${player.denomination}`;
    playerElement.className = "player";
    playersContainer.appendChild(playerElement);
}

function manageBudget(player, operation) {
    const playerPrice =
        player.price * (player.denomination === "crore"? 10000000 : 100000);
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

const addPlayer = (playerName, player) => {
    try {
        manageBudget(player, "add");
        budgetElement.textContent = `Budget: ${formatBudget(budget)}`;
        localStorage.setItem("budget", budget);
        players[playerName] = player;
        localStorage.setItem("players", JSON.stringify(players));
        addPlayerElement(playerName, player);
        console.log(players)
    } catch (error) {
        throw new Error(e.message)
    }
};                       

const addPlayerElement = (playerName, player) => {
    const playerElement = document.createElement("div");
    playerElement.textContent = `${playerName}: ${player.price} ${player.denomination}`;
    playersContainer.appendChild(playerElement);
};

document.getElementById("player-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const players = JSON.parse(localStorage.getItem("players")) || {};
    const playerName = document.getElementById("player-name-input")
       .value.trim();
    const playerPrice = Number(
        document.getElementById("player-price-input").value.trim()
    );
    const denomination = document.getElementById("denomination").value;

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

    const player = { price: playerPrice, denomination };

    try {
        addPlayer(playerName, player);
    } catch (e) {
        alert(e.message);
        return;
    }

    document.getElementById("player-name-input").value = "";
    document.getElementById("player-price-input").value = "";
    document.getElementById("denomination").value = "lakhs";
});

document.getElementById("delete-all-btn").addEventListener("click", (e) => {
    budget=null
    if(inputBudgetIfEmpty("delete-all")=="cancel") {
        console.log("INSIDE")
        budget=localStorage.getItem("budget")
        return
    }
    localStorage.removeItem("players")
    budgetElement.textContent = `Budget: ${formatBudget(budget)}`;
    playersContainer.innerHTML = "";
});
