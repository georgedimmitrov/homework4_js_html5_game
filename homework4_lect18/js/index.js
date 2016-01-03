(function() {

	$(document).ready(function() {

		var game = {};

		game.stars = [];

		game.width = 700;
		game.height = 500;

		game.keys = [];

		game.projectiles = [];

		game.images = [];
		game.doneImages = 0;
		game.requiredImages = 0;

		game.gameOver = false;
		game.gameWon = false;
		game.moving = false;

		game.count = 0;
		game.division = 48;
		game.left = false;

		// sound effects
		game.explodeSound = new Audio("sounds/explode.wav");
		game.playSound = false;
		game.shootSound = new Audio("sounds/shoot.wav");

		game.bulletCounter = 100;
		game.score = 0;

		game.fullShootTimer = 20;
		game.shootTimer = game.fullShootTimer;

		game.player = {
			x: game.width / 2 - 50,
			y: game.height - 110,
			width: 100,
			height: 100,
			speed: 3,
			rendered: false
		};

		game.enemy = {
			x: 0,
			y: 0,
			width: 60,
			height: 60,
			speed: 2,
			image: 1,
			dead: false,
			deadTime: 50
		};

		game.canvasBackground = document.getElementById("backgroundCanvas");

		game.contextBackground = game.canvasBackground.getContext("2d");
		game.contextPlayer = document.getElementById("playerCanvas").getContext("2d");
		game.contextEnemy = document.getElementById("enemyCanvas").getContext("2d");

		// key listeners // left - 37, right - 39, space - 32
		$(document).keydown(function(e) {
			game.keys[e.keyCode ? e.keyCode : e.which] = true;
		});

		$(document).keyup(function(e) {
			delete game.keys[e.keyCode ? e.keyCode : e.which];
		});

		
		$(document).mousemove(handleMouse);
		$(document).click(mouseShoot);
	
		


		// Nqmah vreme da opravq toq gaden stuttering, koito se poluchava a i ne razbrah kak de :D
		// move with mouse function
		function handleMouse(event) {
			game.contextPlayer.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
			if (!game.gameOver && !game.gameWon) {
				if (event.pageX < game.player.x) {
					if (game.player.x >= 0) {
						game.player.x -= game.player.speed;
						game.player.rendered = false;
					}
				} else if (event.pageX > game.player.x ) {
					if (game.player.x <= game.width - game.player.width) {
						game.player.x += game.player.speed;
						game.player.rendered = false;
					}	
				}
			}
			
		}

		// shoot with mouseClick
		function mouseShoot(event) {
			game.bulletCounter--;
			addBullet();
			game.shootTimer = game.fullShootTimer;
			if (!game.playSound) {
				game.shootSound.play();
			}
		}

		function addBullet() {
			game.projectiles.push({
				x: game.player.x,
				y: game.player.y,
				size: 25,
				speed: 6,
				image: 2
			});
		}

		// function for initialization
		function init() {
			for(i = 0; i < 600; i++) {
				game.stars.push({
					x: Math.floor(Math.random() * game.width ),
					y: Math.floor(Math.random() * game.height ),
					size: Math.random() * 5
				});
			}
			
			loop();



		}

		// function for the background 
		function addStars(num) {
			for (i = 0; i < num; i++) {
				game.stars.push({
					x: Math.floor(Math.random() * game.width),
					y: game.height + 10,
					size: Math.random() * 5
				});
			}
		}

		// update function - game logic
		function update() {

			addStars(1);
			game.count++;
			if(game.shootTimer > 0) {
				game.shootTimer--;
			}
			
			// clear the canvas
			game.contextPlayer.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
			game.contextEnemy.clearRect(game.enemy.x, game.enemy.y, game.enemy.width, game.enemy.height);

			for (i in game.stars) {
				if (game.stars[i].y <= -5) {
					game.stars.splice(i, 1);
				}
				game.stars[i].y--;
			}

			if ( (game.keys[37] || game.keys[65]) && !game.gameOver && !game.gameWon) {
				if (game.player.x > 0) {
					game.player.x -= game.player.speed;
					game.player.rendered = false;
				}
				
			}
			if ( (game.keys[39] || game.keys[68]) && !game.gameOver && !game.gameWon) {
				if (game.player.x < game.width - game.player.width) {
					game.player.x += game.player.speed;
					game.player.rendered = false;
				}	
			}

		

			// turn around
			if(game.enemy.x >= game.width - game.enemy.width) {
				game.left = !game.left;
			}
			if (game.enemy.x < 0) {
				game.left = !game.left
			}

			if (!game.gameOver) {
				if (game.left) {
					game.enemy.x -= game.enemy.speed;
				} else {
					game.enemy.x += game.enemy.speed;
				}
			}

			if(game.moving) {
				game.enemy.y += 4;
			}
			

			// render player
			game.contextPlayer.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);	
			

			for (i in game.projectiles) {
				game.projectiles[i].y -= game.projectiles[i].speed;
				if (game.projectiles[i].y <= -game.projectiles[i].size) {
					game.projectiles.splice(i, 1);
				}
			}

			if (game.keys[32] && game.shootTimer <= 0 && !game.gameOver) {
				game.bulletCounter--;
				addBullet();

				game.shootTimer = game.fullShootTimer;
				if (!game.playSound) {
					game.shootSound.play();
				}

			}

			 for (p in game.projectiles) {
				if (collision(game.enemy, game.projectiles[p])) {
					game.contextEnemy.clearRect(game.projectiles[p].x, game.projectiles[p].y, game.projectiles[p].size, game.projectiles[p].size );
					game.projectiles.splice(p, 1);
					game.score++;
					
				}
			}			

			if (game.bulletCounter <= 0) {
				game.gameOver = true;
				game.moving = true;
			}

			// Pobeda pri 15 hit-a poneje 70 e mnogo bavno, a ima bomba kato biesh !
			if (game.score >= 15) {
				game.gameWon = true;
			}
		}

		// render function - rendering objects on screen
		function render() {
			game.contextBackground.clearRect(0, 0, game.width, game.height);
			game.contextBackground.fillStyle = "white";
			for (i in game.stars) {
				var star = game.stars[i];
				
				game.contextBackground.fillRect(star.x, star.y, star.size, star.size);
			}

			// tova spira prerendervaneto na player ako ne se dviji
			if (!game.player.rendered) {
				// console.log("rendering");
				game.player.rendered = true;
			 } 

			 // render enemy
			game.contextEnemy.drawImage(game.images[game.enemy.image], game.enemy.x, game.enemy.y, game.enemy.width, game.enemy.height);
			
			game.contextBackground.font = "bold 20px Arial";
			game.contextBackground.fillText("Score: " + game.score, 10, 110);
			game.contextBackground.fillText("Bullets: " + game.bulletCounter, 10, 140);

			// render projectiles
			for (i in game.projectiles) {
			 	var proj = game.projectiles[i];
			 	game.contextEnemy.clearRect(proj.x, proj.y, proj.size, proj.size);
			 	game.contextEnemy.drawImage(game.images[proj.image], proj.x, proj.y, proj.size, proj.size);
			 }

			 if(game.gameOver) {
				game.contextPlayer.font = "bold 50px arial";
				game.contextPlayer.fillStyle = "white";
				game.contextPlayer.fillText("game over",game.width / 2 - 140, game.height / 2 - 25 );
				
			}

			if(game.gameWon) {

				game.enemy.image = 3; 
				// disables sound if gameiswon/lost
				if (!game.playSound) { 
					game.explodeSound.play();
					game.playSound = true;
				}
				game.enemy.dead = true;

				game.player.y--;



				game.contextPlayer.font = "bold 50px arial";
				game.contextPlayer.fillStyle = "white";
				game.contextPlayer.fillText("game won",game.width / 2 - 140, game.height / 2 - 25 );
			}

			// destroy enemy if game is won
			if (game.enemy.dead) {
				game.enemy.deadTime--;		
			}

			if (game.enemy.dead && game.enemy.deadTime <= 0) {
				game.contextEnemy.clearRect(0, 0, game.width, game.height);
			}


		}
		
		// loop function
		function loop() {
			requestAnimFrame(function() {
				loop();
			});

			update();
			render();	
		}

		function initImages(paths) {
			game.requiredImages = paths.length;
			for (i in paths) {
				var img = new Image();
				img.src = paths[i];
				game.images[i] = img;
				game.images[i].onload = function() {
					game.doneImages++;
				}
			}
		}

		function collision(first, second) {
			return !(first.x > second.x + second.width ||
					first.x + first.width < second.x ||
					first.y > second.y + second.height ||
					first.y + first.height < second.y);
		}

		function checkImages() {
			if (game.doneImages >= game.requiredImages) {
				init();
			} else {
				setTimeout(function() {
					checkImages();
				}, 1);
			}
		}

		game.contextBackground.font = "bold 50px arial";
		game.contextBackground.fillStyle = "white";
		game.contextBackground.fillText("loading", game.width / 2 - 80, game.height / 2 - 25);
		initImages(["images/playerZ.png", "images/enemy.png", "images/bullet.png", "images/explosion.png"]);
		checkImages();
	});
})();

// shim layer with setTimeout fallback - by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


