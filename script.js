"use strict";

const players = JSON.parse(localStorage.getItem("players")) || {};
let budget = localStorage.getItem("budget")

while(budget===null || isNaN(budget) || budget===""){
    budget=prompt("Enter a valid budget in Cr")
}
budget=Number(budget)
localStorage.setItem("budget",budget)

const statsContainer = document.getElementById("stats-container");
const playersContainer = document.getElementById("players-container");

const  budgetElement= document.createElement("div");
budgetElement.textContent = `Budget: ${budget} Cr`;
budgetElement.className="budget"
statsContainer.appendChild(budgetElement);


for (const playerName in players) {
    const player = players[playerName];
    const playerElement = document.createElement("div");
    playerElement.textContent = `${playerName}: ${player.price} ${player.denomination}`;
    playerElement.className="player"
    playersContainer.appendChild(playerElement);
}

const addPlayer = (playerName, player) =>{
    addPlayerElement(playerName, player)
    budget-=player.price
    budgetElement.textContent = `Budget: ${budget} Cr`;
    localStorage.setItem("budget",budget)
}

const addPlayerElement = (playerName, player) =>{
    const playerElement = document.createElement("div");
    playerElement.textContent = `${playerName}: ${player.price} ${player.denomination}`;
    playersContainer.appendChild(playerElement);
}

document.getElementById("player-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const players = JSON.parse(localStorage.getItem("players")) || {};
    const playerName = document.getElementById("player-name-input").value.trim();
    const playerPrice = Number(document.getElementById("player-price-input").value.trim());
    const denomination = document.getElementById("denomination").value;

    if (!playerName) {
        alert("ERROR: Player's name cannot be empty!");
        return;
    }

    if (!playerPrice || isNaN(playerPrice)) {
        alert("ERROR: Player's price has to be a valid number!");
        return;
    }

    if(playerName in players){
        alert("Player already entered!");
        return;
    }

    if(playerPrice>=budget){
        alert("Player price exceeds the budget!");
        return;
    }

    players[playerName] = { price: playerPrice, denomination: denomination };
    localStorage.setItem("players", JSON.stringify(players));

    document.getElementById("player-name-input").value = "";
    document.getElementById("player-price-input").value = "";
    document.getElementById("denomination").value = "lakhs";

    addPlayer(playerName, players[playerName])
});

document.getElementById("delete-all-btn").addEventListener("click", (e) => {
    localStorage.clear()
    playersContainer.innerHTML=""
})
