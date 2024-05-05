const players = {}

const playersTable = document.getElementById("player-table")

const addPlayerRow = (playerName, player) => {
    const row = playersTable.insertRow();
    const nameCell = row.insertCell(0);
    const priceCell = row.insertCell(1);
    const nationalityCell = row.insertCell(2);

    nameCell.textContent = playerName;
    priceCell.textContent = `${player.price} ${player.denomination}`;
    nationalityCell.textContent = player.nationality;
};

const addPlayer = (playerName, player) => {
    try {
        players[playerName] = player;
        // Storing the data of players in our localStorage
        localStorage.setItem("players", JSON.stringify(players));
        addPlayerRow(playerName, player);
    } catch (error) {
        throw(error.message)
    }
};


document.getElementById("player-form").addEventListener("submit", (e) => {
    e.preventDefault();
    // Getting all the values from the form
    const playerName = document.getElementById("player-name-input").value.trim();
    const playerPrice = Number(document.getElementById("player-price-input").value.trim());
    const denomination = document.getElementById("denomination").value;
    const nationality = document.getElementById("nationality").value;

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

    const player = { price: playerPrice, denomination, nationality };

    try {
        addPlayer(playerName, player);
    } catch(err) {
        alert(err)
        return
    }

    // To clear the form - not always needed, it would do it automatically, but we did e.preventDefault() that prevents the form from clearing
    document.getElementById("player-name-input").value = "";
    document.getElementById("player-price-input").value = "";
    document.getElementById("denomination").value = "lakhs";
});