// script.js

// Create the canvas and get the 2d context.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variable declarations.
let game = {
    state: "start",
};

let overlay = {
    counter: -1,
    title: "foo",
    subtitle: "bar",
};

let player = {
    x: 100,
    y: 350,
    width: 20,
    height: 50,
    counter: 0,
};

let keyboard = {};
let playerBullets = [];
let enemies = [];
let enemyBullets = [];

// =========== Player ============

function firePlayerBullet() {
    // Create a new bullet.
    playerBullets.push({
        x: player.x,
        y: player.y - 5,
        width: 10,
        height: 10,
    });
}

function drawPlayer() {
    if (player.state == "dead") return;

    if (player.state == "hit") {
        ctx.fillStyle = "yellow";
        ctx.fillRect(player.x, player.y, player.width, player.height);
        return;
    }
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlayerBullets() {
    ctx.fillStyle = "blue";
    for (let i in playerBullets) {
        let bullet = playerBullets[i];
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// =========== Game ============

function updateGame() {
    if (game.state == "playing" && enemies.length == 0) {
        game.state = "won";
        overlay.title = "SWARM DEAD";
        overlay.subtitle = "Press space to play again";
        overlay.counter = 0;
    }
    if (game.state == "over" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay.counter = -1;
    }
    if (game.state == "won" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay.counter = -1;
    }
    if (overlay.counter >= 0) {
        overlay.counter++;
    }
}

function updatePlayer() {
    if (player.state == "dead") return;

    // Left arrow.
    if (keyboard[37]) {
        player.x -= 7;
        if (player.x < 0) player.x = 0;
    }
    // Right arrow.
    if (keyboard[39]) {
        player.x += 7;
        let right = canvas.width - player.width;
        if (player.x > right) player.x = right;
    }
    // Space bar.
    if (keyboard[32]) {
        if (!keyboard.fired) {
            firePlayerBullet();
            keyboard.fired = true;
        }
    } else {
        keyboard.fired = false;
    }

    if (player.state == "hit") {
        player.counter++;
        if (player.counter >= 40) {
            player.counter = 0;
            player.state = "dead";
            game.state = "over";
            overlay.title = "GAME OVER";
            overlay.subtitle = "Press space to play again";
            overlay.counter = 0;
        }
    }
}

function updatePlayerBullets() {
    // Move each bullet.
    for (let i in playerBullets) {
        let bullet = playerBullets[i];
        bullet.y -= 8;
        bullet.counter++;
    }
    // Remove the ones that are off the screen.
    playerBullets = playerBullets.filter(function (bullet) {
        return bullet.y > 0;
    });
}

// =========== Background ============

function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateBackground() {
}

// ============== Enemy =============

function drawEnemies() {
    for (let i in enemies) {
        let enemy = enemies[i];
        if (enemy.state == "alive") {
            ctx.fillStyle = "green";
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        if (enemy.state == "hit") {
            ctx.fillStyle = "purple";
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        // This probably won't ever be called.
        if (enemy.state == "dead") {
            ctx.fillStyle = "black";
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    }
}

function createEnemyBullet(enemy) {
    return {
        x: enemy.x,
        y: enemy.y + enemy.height,
        width: 4,
        height: 12,
        counter: 0,
    }
}

function drawEnemyBullets() {
    for (let i in enemyBullets) {
        let bullet = enemyBullets[i];
        ctx.fillStyle = "yellow";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function updateEnemies() {
    // Create 10 new enemies the first time through.
    if (game.state == "start") {
        enemies = [];
        enemyBullets = [];
        for (let i = 0; i < 10; i++) {
            enemies.push({
                x: 50 + i * 50,
                y: 10,
                width: 40,
                height: 40,
                state: "alive", // The starting state of enemies.
                counter: 0,     // A counter to use when calculating effects in each state.
                phase: Math.floor(Math.random() * 50), // Make the enemies not be identical.
                shrink: 20,
            });
        }
        game.state = "playing";
    }

    // For each enemy.
    for (let i = 0; i < 10; i++) {
        let enemy = enemies[i];
        if (!enemy) continue;

        // Float back and forth when alive.
        if (enemy && enemy.state == "alive") {
            enemy.counter++;
            enemy.x += Math.sin(enemy.counter * Math.PI * 2 / 100) * 2;
            // Fire a bullet every 50 ticks.
            // Use 'phase' so they don't all fire at the same time.
            if ((enemy.counter + enemy.phase) % 200 == 0) {
                enemyBullets.push(createEnemyBullet(enemy));
            }
        }

        // Enter the destruction state when hit.
        if (enemy && enemy.state == "hit") {
            enemy.counter++;

            // Finally they're dead, so it will get cleaned up.
            if (enemy.counter >= 20) {
                enemy.state = "dead";
                enemy.counter = 0;
            }
        }
    }

    // Remove the dead ones.
    enemies = enemies.filter(function (e) {
        if (e && e.state != "dead") return true;
        return false;
    });
}

function updateEnemyBullets() {
    for (let i in enemyBullets) {
        let bullet = enemyBullets[i];
        bullet.y += 2;
        bullet.counter++;
    }
}

// ======= Check for collisions =======

function checkCollisions() {
    for (let i in playerBullets) {
        let bullet = playerBullets[i];
        for (let j in enemies) {
            let enemy = enemies[j];
            if (collided(bullet, enemy)) {
                bullet.state = "hit";
                enemy.state = "hit";
                enemy.counter = 0;
            }
        }
    }

    if (player.state == "hit" || player.state == "dead") return;
    for (let i in enemyBullets) {
        let bullet = enemyBullets[i];
        if (collided(bullet, player)) {
            bullet.state = "hit";
            player.state = "hit";
            player.counter = 0;
        }
    }
}

function collided(a, b) {
    // Check for horizontal collision.
    if (b.x + b.width >= a.x && b.x < a.x + a.width) {
        // Check for vertical collision.
        if (b.y + b.height >= a.y && b.y < a.y + a.height) {
            return true;
        }
    }

    // Check a inside b.
    if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
        if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
            return true;
        }
    }

    // Check b inside a.
    if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
        if (a.y <= b.y && a.y + a.height >= b.y + b.height) {
            return true;
        }
    }
    return false;
}

// ============= Overlay ==============

function drawOverlay() {
    if (game.state == "over") {
        ctx.fillStyle = "white";
        ctx.font = "Bold 40pt Arial";
        ctx.fillText("GAME OVER", 140, 200);
        ctx.font = "14pt Arial";
        ctx.fillText("Press space to play again", 190, 250);
    }
    if (game.state == "won") {
        ctx.fillStyle = "white";
        ctx.font = "Bold 40pt Arial";
        ctx.fillText("SWARM DEFEATED", 50, 200);
        ctx.font = "14pt Arial";
        ctx.fillText("Press space to play again", 190, 250);
    }
}

function attachEvent(node, name, func) {
    if (node.addEventListener) {
        node.addEventListener(name, func, false);
    } else if (node.attachEvent) {
        node.attachEvent(name, func);
    }
};

function doSetup() {
    attachEvent(document, "keydown", function (e) {
        keyboard[e.keyCode] = true;
    });
    attachEvent(document, "keyup", function (e) {
        keyboard[e.keyCode] = false;
    });
}

doSetup();

// Call requestAnimationFrame to schedule itself for the next frame,
// then perform the current frame's updates, physics, drawing, etc.
function mainLoop() {
    requestAnimationFrame(mainLoop);

    updateGame();
    updateBackground();
    updateEnemies();
    updatePlayer();

    updatePlayerBullets();
    updateEnemyBullets();

    checkCollisions();

    drawBackground();
    drawEnemies();
    drawPlayer();
    drawEnemyBullets();
    drawPlayerBullets();
    drawOverlay();
}

// Initial call to requestAnimationFrame to start the loop.
requestAnimationFrame(mainLoop);

