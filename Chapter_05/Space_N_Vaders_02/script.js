// script.js

const canvas = document.getElementById("gameCanvas");       // Create the canvas.
const ctx = canvas.getContext("2d");                        // Get the 2d context.

// Variable declaration.
let game = {
    state: "start",
};

let overlay = {
    counter: -1,
    title: "foo",
    subtitle: "bar",
};

let ship_image;
let bomb_image;
let bullet_image;

let player = {
    x: 100,
    y: 350,
    width: 46,
    height: 46,
    counter: 0,
};

let keyboard = {};
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let particles = [];

// =========== Init =============

function loadResources() {
    ship_image = new Image();
    ship_image.src = "images/Hunter1.png";
    bomb_image = new Image();
    bomb_image.src = "images/bomb.png";
    bullet_image = new Image();
    bullet_image.src = "images/bullets.png";
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

// =========== Game  ============

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

// =========== Player ============

function drawPlayer() {
    if (player.state == "dead") return;

    if (player.state == "hit") {
        drawPlayerExplosion();
        return;
    }
    ctx.drawImage(ship_image,
        25, 1, 23, 23,                                      // Source coordinates.
        player.x, player.y, player.width, player.height     // Destination coordinates.
    );
}

function drawPlayerExplosion() {
    // Start.
    if (player.counter == 0) {
        particles = [];                                     // Clear any old values.
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                xv: (Math.random() - 0.5) * 2.0 * 5.0,      // X velocity.
                yv: (Math.random() - 0.5) * 2.0 * 5.0,      // Y velocity.
                age: 0,
            });
        }
    }

    // Update and draw.
    if (player.counter > 0) {
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.x += p.xv;
            p.y += p.yv;
            let v = 255 - p.age * 3;
            ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
            ctx.fillRect(p.x, p.y, 3, 3);
            p.age++;
        }
    }
};

function drawPlayerBullets() {
    ctx.fillStyle = "blue";
    for (let i in playerBullets) {
        let bullet = playerBullets[i];
        let count = Math.floor(bullet.counter / 4);
        let xoff = (count % 4) * 24;

        // Replaces ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.drawImage(
            bullet_image,
            xoff + 10, 0 + 9, 8, 8,                             // Source
            bullet.x, bullet.y, bullet.width, bullet.height     // Destination
        );
    }
}

function firePlayerBullet() {
    // Create a new bullet.
    playerBullets.push({
        x: player.x + 14,
        y: player.y - 5,
        width: 20,
        height: 20,
        counter: 0,
    });
}

function updatePlayer() {
    if (player.state == "dead") return;

    // Left arrow.
    if (keyboard[37]) {
        player.x -= 10;
        if (player.x < 0) player.x = 0;
    }
    // Right arrow.
    if (keyboard[39]) {
        player.x += 10;
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

// ============== Enemy =============

function drawEnemies() {
    for (let i in enemies) {
        let enemy = enemies[i];
        if (enemy.state == "alive") {
            ctx.fillStyle = "green";
            drawEnemy(enemy, 15);
        }
        if (enemy.state == "hit") {
            ctx.fillStyle = "purple";
            enemy.shrink--;
            drawEnemy(enemy, enemy.shrink);
        }
        // This probably won't ever be called.
        if (enemy.state == "dead") {
            ctx.fillStyle = "black";
            ctx.drawEnemy(enemy, 15);
        }
    }
}

function drawEnemy(enemy, radius) {
    if (radius <= 0) radius = 1;
    let theta = enemy.counter;

    ctx.save();                                         // Save the current drawing state.
    ctx.translate(0, 30);                               // Translate to the new position.

    // Draw the background circle.
    circlePath(enemy.x, enemy.y, radius * 2);
    ctx.fill();

    // Draw the wavy dots.
    for (let i = 0; i < 10; i++) {
        let xoff = Math.sin(toRadians(theta + i * 36 * 2)) * radius;
        let yoff = Math.sin(toRadians(theta + i * 36 * 1.5)) * radius;
        circlePath(enemy.x + xoff, enemy.y + yoff, 3);
        ctx.fillStyle = "white";
        ctx.fill();
    }
    ctx.restore();                                      // Restore the previous drawing state.
}

function toRadians(d) {
    return d * Math.PI * 2.0 / 360.0;
}

function circlePath(x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, 0, Math.PI * 2);
}

function createEnemyBullet(enemy) {
    return {
        x: enemy.x,
        y: enemy.y + enemy.height,
        width: 30,
        height: 30,
        counter: 0,
    }
}

function drawEnemyBullets() {
    for (let i in enemyBullets) {
        let bullet = enemyBullets[i];
        let xoff = (bullet.counter % 9) * 12 + 1;
        let yoff = 1;
        ctx.drawImage(bomb_image,
            xoff, yoff, 11, 11,                                 // Source.
            bullet.x, bullet.y, bullet.width, bullet.height     // Destination.
        );
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

            // Finally be dead so it will get cleaned up.
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

// =========== Background ============

function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateBackground() {
}

// ====== Check for collisions ======

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

// ============ Overlay =============

function drawOverlay() {
    if (overlay.counter == -1) return;

    // Fade in.
    let alpha = overlay.counter / 50.0;
    if (alpha > 1) alpha = 1;
    ctx.globalAlpha = alpha;

    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = "Bold 40pt Arial";
    ctx.fillText(overlay.title, 140, 200);
    ctx.font = "14pt Arial";
    ctx.fillText(overlay.subtitle, 190, 250);
    ctx.restore();
}

loadResources();
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

