from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)

THE_SPORTS_DB_API_KEY = '3'

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/get_data', methods=['GET'])
def get_data():
    sport = request.form.get('sport')
    team_or_player = request.form.get('team_or_player')
    league_id = request.form.get('league_id')
    season = request.form.get('season')

    if sport and team_or_player:
        try:
            #Fetch team data
            team_url = f"https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t={team_or_player}"
            team_response = requests.get(team_url)
            team_data = team_response.json()

            if team_data['teams']:
                team_id = team_data['teams'][0]['idTeam']
            
                #Fetch Standings
                standings_url = f"https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l={league_id}&s={season}"
                standings_response = requests.get(standings_url)
                standings_data = standings_response.json()
            
                #Fetch Players
                players_url = f"https://www.thesportsdb.com/api/v1/json/3/loolup_all_players.php?id={team_id}"
                players_response = requests.get(players_url)
                players_data = players_response.json()

                #Fetch Articles
                articles_url = f"https://www.thesportsdb.com/api/v1/json/3/search_all_articles.php?s={team_or_player}"
                articles_response = requests.get(articles_url)
                articles_data = articles_response.json()

                return jsonify({
                    "team": team_data,
                    "standings": standings_data,
                    "player": players_data,
                    "articles": articles_data
                })
        
            # Fetch player data if no team data is found
            player_url = f"https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p={team_or_player}"
            player_response = requests.get(player_url)
            player_data = player_response.json()

            if player_data['player']:
                return jsonify({"player": player_data['player'][0]})
            
            return jsonify({"error": "Team or Player not found"}), 404
        
        except requests.exceptions.RequestException as e:
            return jsonify({"error": str(e)}), 500
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    return jsonify({"error": "Invalid Input"}), 400

@app.route('/player/<player_id>')
def player(player_id):
    return render_template('player.html', player_id=player_id)

@app.route('/team/<team_id>')
def team(team_id):
    return render_template('team.html', team_id=team_id) 

if __name__ == "__main__":
    app.run(debug=True)
    
