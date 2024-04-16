"use strict";

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

    players[playerName] = { price: playerPrice, denomination: denomination };
    localStorage.setItem("players", JSON.stringify(players));

    document.getElementById("player-name-input").value = "";
    document.getElementById("player-price-input").value = "";
    document.getElementById("denomination").value = "lakhs";
});