let userId;
let isAdmin;

function load(id, admin) {
    userId = id;
    isAdmin = admin
    loadGames(1);
}


function loadGames(pageNumber) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `games?page=${pageNumber}&size=10`, false);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            const games = JSON.parse(xhr.responseText);

            const gamesDiv = document.querySelector('#games-container');
            gamesDiv.innerHTML = '';


            games.forEach(function (game) {
                let color = ''
                let emoji = '🟢';
                let noStock = false;

                if (game.stock < 1) {
                    color = 'text-danger';
                    emoji = '🔴';
                    noStock = true;
                }

                let loggedInControls = '';

                if (userId !== -1) {
                    let buttonText = "Add to cart";
                    let buttonColor = "btn-success";
                    let buttonFunction = `addToCart(${game.id})`;
                    let buttonId = `buy${game.id}`;
                    let buttonDisabled = '';

                    if (game.customerCarts.includes(userId)) {
                        buttonText = "Remove from cart";
                        buttonColor = "btn-danger";
                        buttonFunction = `removeFromCart(${game.id})`;
                    } else if (noStock) {
                        buttonText = "Out of stock";
                        buttonColor = "btn-dark";
                        buttonDisabled = 'disabled';
                    }

                    if (isAdmin) {
                        loggedInControls = `
                            <div class="d-flex align-items-center justify-content-center gap-1">
                                <span class="flex-grow-1"></span>
                                <button class="btn btn-warning">Edit</button>
                                <button id="${buttonId}" class="btn ${buttonColor}" onclick="${buttonFunction}" ${buttonDisabled}>${buttonText}</button>
                            </div>
                        `;
                    } else {
                        loggedInControls = `
                            <div class="d-flex align-items-center justify-content-center gap-1">
                                <span class="flex-grow-1"></span>
                                <button id="${buttonId}" class="btn ${buttonColor}" onclick="${buttonFunction}" ${buttonDisabled}>${buttonText}</button>
                            </div>
                        `;
                    }
                }

                const gameCard = `
                    <div class="game-card">
                        <img src="${game.path}" alt="${game.name}">
                        <div class="game-details">
                            <h5>${game.name}</h5>
                            <div class="game-meta">
                                <span class="rating">⭐ ${game.rating}</span>
                                <span>💵 $${game.price}</span>
                                <span id="stock${game.id}" data-stock="${game.stock}">${emoji} <span class="${color}">${game.stock}</span></span>
                            </div>
                            <p>${game.description}</p>
                            ${loggedInControls}
                        </div>
                    </div>
                `;
                gamesDiv.insertAdjacentHTML('beforeend', gameCard);
            });

            search();
        }
    };

    xhr.send();
}

function addToCart(id) {
    const button = document.querySelector(`#buy${id}`);
    const stock = document.querySelector(`#stock${id}`);
    button.disabled = true;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", `addToCart?userId=${userId}&gameId=${id}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const response = JSON.parse(this.responseText);

            if (response.success === true) {
                button.classList.remove('btn', 'btn-success');
                button.classList.add('btn', 'btn-danger');
                button.textContent = "Remove from cart";

                button.onclick = function() {
                    removeFromCart(id);
                }

                stock.dataset.stock = Number(stock.dataset.stock) - 1;

                let color = ''
                let emoji = '🟢';

                if (stock.dataset.stock < 1) {
                    color = 'text-danger';
                    emoji = '🔴';
                }

                stock.innerHTML = `
                    ${emoji} <span class="${color}">${stock.dataset.stock}</span>
                `;
            }

            button.disabled = false;
        }
    }

    xhr.send();
}

function removeFromCart(id) {
    const button = document.querySelector(`#buy${id}`);
    const stock = document.querySelector(`#stock${id}`);
    button.disabled = true;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", `removeFromCart?userId=${userId}&gameId=${id}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const response = JSON.parse(this.responseText);

            if (response.success === true) {
                button.classList.remove('btn', 'btn-danger');
                button.classList.add('btn', 'btn-success');
                button.textContent = "Add to cart";

                button.onclick = function() {
                    addToCart(id);
                }

                stock.dataset.stock = Number(stock.dataset.stock) + 1;

                let emoji = '🟢';

                stock.innerHTML = `
                    ${emoji} <span>${stock.dataset.stock}</span>
                `;
            }

            button.disabled = false;
        }
    }

    xhr.send();
}

function search() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(function (card) {
        const gameName = card.querySelector('h5').textContent.toLowerCase();
        if (gameName.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

$('#page-selection').bootpag({
    total: 6,
    page: 1,
    maxVisible: 6
}).on('page', function(event, num){
    loadGames(num);
});

