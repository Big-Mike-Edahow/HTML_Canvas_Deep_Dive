// script.js

// Get the HTML Canvas Element and it's 2d context.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.globalCompositeOperation = "lighter"; // Set the blend mode.
ctx.fillStyle = "#ff6699";              // Fill with a pink.

// Randomly draw 50 circles.
for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    ctx.arc(
        Math.random() * 400,    // Random x 
        Math.random() * 400,    // Random y 
        40,                     // Radius 
        0, Math.PI * 2);        // Full circle 
    ctx.closePath();
    ctx.fill();
} 
