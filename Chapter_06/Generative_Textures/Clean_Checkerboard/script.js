// script.js

// Get the HTML Canvas Element and it's 2d context.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Create a new 320 x 240 pixel buffer.
let data = ctx.createImageData(320, 240);

// Loop over every pixel.
for (let x = 0; x < data.width; x++) {
    for (let y = 0; y < data.height; y++) {

        let val = 0;
        let horz = (Math.floor(x / 4) % 2 == 0); // Loop every 4 pixels.
        let vert = (Math.floor(y / 4) % 2 == 0); // Loop every 4 pixels.
        if ((horz && !vert) || (!horz && vert)) {
            val = 255;
        } else {
            val = 0;
        }

        let index = (y * data.width + x) * 4;   // Calculate the index. 
        data.data[index] = val;                 // Red 
        data.data[index + 1] = val;             // Green 
        data.data[index + 2] = val;             // Blue 
        data.data[index + 3] = 255;             // Force alpha to 100%. 
    }
}

// Set the data back. 
ctx.putImageData(data, 0, 0);
