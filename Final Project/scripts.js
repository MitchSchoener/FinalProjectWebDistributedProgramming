document.getElementById('sports-form').addEventListener('submit', handleSubmit);

function handleSubmit(event) {
    event.preventDefault();

    const sport = document.getElementById('sport').value;
    const teamOrPlayer = document.getElementById('team_or_player').value;
    const leagueId = document.getElementById('league_id').value;
    const season = document.getElementById('season').value;

    fetch('/get_data', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            sport: sport,
            team_or_player: teamOrPlayer,
            league_id: leagueId,
            season: season,
        })
    })
    .then(response => response.json())
    .then(data => displayResults(data))
    .catch(error => console.error('Error:', error));
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (data.error) {
        resultsDiv.innerHTML = `<p>${data.error}</p>`;
        return;
    }

     const team = data.team.teams[0];
     resultsDiv.innerHTML += `
         <h3>${team.strTeam}</h3>
         <p>Sport: ${team.strSport}</p>
         <p>Country: ${team.strCountry}</p>
         <img src="${team.strTeamBadge}" alt="${team.strTeam} Badge" width="100">
     `;

     // Display team standings
     const standings = data.standings;
     resultsDiv.innerHTML += '<h4>Standings:</h4><table><tr><th>Position</th><th>Team</th><th>Points</th></tr>';
     standings.forEach(item => {
         resultsDiv.innerHTML += `
             <tr>
                 <td>${item.rank}</td>
                 <td>${item.teamName}</td>
                 <td>${item.points}</td>
             </tr>
         `;
     });
     resultsDiv.innerHTML += '</table>'

     // Display articles
     const articles = data.articles;
     resultsDiv.innerHTML += '<h4>Articles:</h4>';
     articles.forEach(article => {
         resultsDiv.innerHTML += `
             <div>
                 <h5>${article.title}</h5>
                 <p>${article.description}</p>
                 <a href="${article.url}" target="_blank">Read more</a>
             </div>
         `;
     });

     // Display player statistics
     const players = data.players;
     resultsDiv.innerHTML += '<h4>Players:</h4><ul>';
     players.forEach(player => {
         resultsDiv.innerHTML += `<li>${player.strPlayer} - Position: ${player.strPosition}</li>`;
     });
         resultsDiv.innerHTML += '</ul>';

         // Update chart with player statistics
         updatePlayerStatsChart(players);
}

function updatePlayerStatsChart(players) {
    const ctx = document.getElementById('playerStatsChart').getContext('2d');
    const playerStatsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: players.map(player => player.strPlayer),
            datasets: [{
                label: 'Goals',
                data: players.map(player => player.strGoals), // Assuming strGoals is the correct field
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
