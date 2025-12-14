// script.js

// Get the HTML Canvas Element and it's 2d context.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let img = new Image();
img.src = "./baby_original.png";

img.onload = function () {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    // Draw the image to the canvas, then get the image data.
    ctx.drawImage(img, 0, 0);
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Invert each pixel. Don't touch the alpha
    for (let n = 0; n < data.width * data.height; n++) {
        let index = n * 4;
        data.data[index] = 255 - data.data[index];
        data.data[index + 1] = 255 - data.data[index + 1];
        data.data[index + 2] = 255 - data.data[index + 2];
    }
    ctx.putImageData(data, 0, 0);   // Set the data back.
}

