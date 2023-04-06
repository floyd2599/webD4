var game = {
    paused : false,

    clearPlayArea : function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    },

    setText : function(colour) {
        context.font = "30px Play";
        context.fillStyle = colour;
    },

    drawScore : function() {
        context.fillText("Score", 10,60);
        this.setText("#000");
        context.fillText(player.stats.score, 10, 30);

    },

    drawAmmo : function() {
        this.setText("#c33");
        context.fillText("Ammo", 700,60);
        context.fillText(player.stats.ammo, canvas.width - context.measureText(player.stats.ammo).width - 10, 30)
    },

    drawLives : function() {
        for(var i = 0; i < player.stats.lives; ++i) {
            context.beginPath();
            context.arc(canvas.width/2 + (i*25) + 5, 20, 10, 0, 2*Math.PI);
            context.closePath();
            context.fillStyle = "#c33";
            context.fill();
            context.fillText("lives", 400,60);
        }
    },

    drawStats : function() {
        this.drawScore();
        this.drawLives();
        this.drawAmmo();
    },

    togglePause : function() {
        this.paused = this.paused? false: true;
        if(!this.paused)
            requestAnimationFrame(animate);
    },

    drawGameOverStats : function() {
        this.clearPlayArea();
        this.drawStats();
        this.setText("#000");
        context.fillText("Game Over.", canvas.width/2 - context.measureText("Game Over.").width/2, canvas.height/2);
        context.fillText("Score : " + player.stats.score, canvas.width/2 - context.measureText("Score : " + player.stats.score).width/2, canvas.height/2 + context.measureText("Score : " + player.stats.score).height + 10);
    },

    over : function() {
        this.togglePause();
        this.clearPlayArea();
        this.drawGameOverStats();
    },

    reset : function() {
        this.togglePause();
        cancelAnimationFrame(startGame);
        start();
    }
};

var player = {
    currentColour : 0,
    colourSet : ["#369", "#c33", "#396"],
    radius : 20,
    speed_x : 15,
    speed_y : 15,
    bigHits : 0,
    stats : {
        lives : 3,
        score : 0,
        ammo : 10,
        blocksHit : 0,
        blocksMissed : 0,
        blueHit : 0,
        redHit : 0,
        greenHit : 0,
        orangeHit : 0,
        whiteHit : 0
    },

    setColourByName : function(colour) {
        this.colour = colour;
    },

    setColourByIndex : function(index) {
        this.currentColour = index;
        this.colour = this.colourSet[index];
    },

    setRadius : function(radius) {
        this.radius = radius;
    },

    setSpeedX : function(speed_x) {
        this.speed_x = speed_x;
    },

    setSpeedY : function(speed_y) {
        this.speed_y = speed_y;
    },

    setPosition : function(x, y) {
        this.x = x;
        this.y = y;
    },

    draw : function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        context.closePath();
        context.fillStyle = this.colour;
        context.fill();
    },

    reset : function() {
        this.setPosition(canvas.width/2, canvas.height - this.radius);
        this.draw();
        this.setSpeedX(10);
        this.setSpeedY(10);
        this.setColourByName("#369");
    },

    move : function(x, y) {
        this.x += x;
        this.y += y;

        this.draw();
    },

    shoot : function() {
        if(this.stats.ammo > 0) {
            bullets.push(new Bullet());
            player.updateStats.ammoDown();
        }

    },

    control : function(keyCode) {
        switch(keyCode) {
            //left arrow key - move left
            case 37:
                if(!game.paused && (this.x - this.radius) > 0)
                    this.move(-1 * this.speed_x, 0);
                break;
            //up arrow key(38) or space bar(32) - shoot
            case 32:
            case 38:
                // this.move(0, -1 * this.speed_y);
                if(!game.paused)
                    this.shoot();
                break;
            //right arrow key - move right
            case 39:
                if(!game.paused && (this.x + this.radius) < canvas.width)
                    this.move(this.speed_x, 0);
                break;
            //down
            case 40:
                break;
            //c - change colour
            case 67:
                this.currentColour++;
                this.currentColour %= this.colourSet.length;
                this.setColourByIndex(this.currentColour);
                break;

            case 80:
                game.togglePause();
                break;
            //r for reset
            case 82:
                if(!game.paused)
                    this.reset();
                else
                    window.location.reload();
                break;
        }
    },

    crashWith : function(obstacle) {
        //compare obstacle borders with my borders

        var	obstacleLeft = obstacle.x,
            obstacleRight = obstacle.x + obstacle.width,
            obstacleTop = obstacle.y,
            obstacleBottom = obstacle.y + obstacle.height;

        var myLeft = this.x - this.radius,
            myRight = this.x + this.radius,
            myTop = this.y - this.radius,
            myBottom = this.y + this.radius;

        var crash = true;
        if(	(myBottom < obstacleTop) ||
            (myTop > obstacleBottom) ||
            (myRight < obstacleLeft) ||
            (myLeft > obstacleRight))
            crash = false;

        return crash;
    },

    kill : function() {
        this.setColourByName("#000");
        this.setSpeedX(0);
        this.setSpeedY(0);
        this.reset();
    },

    updateStats : {
        blockHit : function(obstacle) {
            player.stats.blocksHit++;
        },

        blockMissed : function() {
            this.stats.blocksMissed++;
        },

        scoreUp2x : function() {
            player.stats.score += 2 * (new Obstacle).scoreValue;
        },

        scoreUp : function(obstacle) {
            player.stats.score += obstacle.scoreValue;
        },

        replenishAmmo : function() {
            player.stats.ammo = 10;
        },

        ammoUp : function() {
            ++player.stats.ammo;
        },

        ammoDown : function() {
            --player.stats.ammo;
        },

        lifeDown : function() {
            --player.stats.lives;
            if(player.stats.lives == -1) {
                game.over();
            }
        }
    }
};

function Bullet() {
    this.colour = player.colour;
    this.width = 3;
    this.height = 3;
    this.speed = -5;
    this.x = player.x - 1;
    this.y = player.y - player.radius;
    this.draw = function() {
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    };

    this.hits = function(obstacle) {
        //compare obstacle borders with my borders

        var	obstacleLeft = obstacle.x,
            obstacleRight = obstacle.x + obstacle.width,
            obstacleTop = obstacle.y,
            obstacleBottom = obstacle.y + obstacle.height;

        var myLeft = this.x,
            myRight = this.x + this.width,
            myTop = this.y,
            myBottom = this.y + this.height;

        var hit = true;
        if(	(myBottom < obstacleTop) ||
            (myTop > obstacleBottom) ||
            (myRight < obstacleLeft) ||
            (myLeft > obstacleRight))
            hit = false;

        return hit;
    }
}

function Obstacle(x, y, colour) {
    this.colour = colour;
    this.colourSet = ["#369", "#c33", "#396"];
    this.width = 50;
    this.height = 20;
    this.x = x;
    this.y = y;
    this.scoreValue = 10;

    this.setHeight = function(height) {
        this.height = height;
    };

    this.setWidth = function(width) {
        this.width = width;
    };

    this.setColour = function(colour) {
        this.colour = colour;
    };

    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    };

    this.draw = function() {
        // context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    };

}

function BigSpecialObstacle(y) {
    this.colour = "orange";
    this.width = canvas.width;
    this.height = 50;
    this.x = 0;
    this.y = y;
    this.scoreValue = 50;

    this.setHeight = function(height) {
        this.height = height;
    };

    this.setWidth = function(width) {
        this.width = width;
    };

    this.setColour = function(colour) {
        this.colour = colour;
    };

    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    };

    this.draw = function() {
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    };

}

function SmallSpecialObstacle(x, y) {
    this.colour = "white";
    this.width = 10;
    this.height = 10;
    this.x = x;
    this.y = y;
    this.scoreValue = 100;

    this.setHeight = function(height) {
        this.height = height;
    };

    this.setWidth = function(width) {
        this.width = width;
    };

    this.setColour = function(colour) {
        this.colour = colour;
    };

    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    };

    this.draw = function() {
        context.fillStyle = this.colour;
        context.fillRect(this.x, this.y, this.width, this.height);
    };

}