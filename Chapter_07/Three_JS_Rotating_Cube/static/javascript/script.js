// script.js

import * as THREE from 'three';                                     // Import the Three.js library.

const scene = new THREE.Scene();                                    // Create a new scene container.
const camera = new THREE.PerspectiveCamera(75, 480/360, 0.1, 1000); // Create a new Perspective Camera.
camera.position.z = 5;                                              // Move the camera back.

const renderer = new THREE.WebGLRenderer();                         // Create a new WebGL renderer.
renderer.setSize(480, 360);                                         // Set the size in pixels.
const canvas = document.getElementById('canvas-container');         // Get the grid container's id.
canvas.appendChild(renderer.domElement);                            // Append the canvas to the grid.

// Create a red cube, and add it to the scene.
const geometry = new THREE.BoxGeometry(2, 2, 2);                    // Define the cube's shape.
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });  // Define the cube's material (red).
const cube = new THREE.Mesh(geometry, material);                    // Create the mesh object.
scene.add(cube);                                                    // Add the cube to the scene.

function animate() {                                                // The main animation loop.
    requestAnimationFrame(animate);                                 // Schedule the next frame.
    cube.rotation.x += 0.01;                                        // Rotate the cube.
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);                                 // Render the scene.
}

requestAnimationFrame(animate);                                     // Start the animation loop.


