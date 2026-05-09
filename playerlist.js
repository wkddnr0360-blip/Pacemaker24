function PlayerList() {
    // Data structure
    this.players = new Array();

    // Add a player
    this.addPlayer = function(obj) {
        var isNew = true;
        for (var i in this.players) {
            if (this.players[i].name == obj.name) {
                isNew = false;
                break;
            }
        }
        if (isNew) {
            this.players.push(obj);
        }
    }

    // Get main player
    this.getMainPlayer = function() {
        return this.players[0];
    }

    // Get player by name
    this.getPlayer = function(name) {
        for (var i in this.players) {
            if (this.players[i].name == name) {
                return this.players[i];
            }
        }
    }

    // Remove player
    this.removePlayer = function(name) {
        for (var i in this.players) {
            if (this.players[i].name == name) {
                this.players = this.players.slice(0, i).concat(this.players.slice(parseInt(i)+1, this.players.length));
                break;
            }
        }
    }

    // Update player
    this.updatePlayer = function(player) {
        for (var i in this.players) {
            if (this.players[i].name == player.name) {
                for (var j in player) {
                    this.players[i][j] = player[j];
                }
                break;
            }
        }
    }
}
