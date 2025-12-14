// script.js

// Get the HTML Canvas Element and it's 2d context.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.shadowColor = "white";
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
ctx.shadowBlur = 30;

ctx.font = 'bold 60pt Arial';
ctx.fillStyle = "#55cc55";
ctx.fillText("ALIEN", 40, 150);
