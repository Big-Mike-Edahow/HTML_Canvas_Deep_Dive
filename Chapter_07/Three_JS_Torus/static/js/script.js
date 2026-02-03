// script.js

import * as THREE from 'three';                                     // Import the ThreeJS library.  

const scene = new THREE.Scene();                                    // Create a new scene container.
const camera = new THREE.PerspectiveCamera(75, 480/450, 0.1, 1000); // Create a new Perspective Camera.

const renderer = new THREE.WebGLRenderer({ antialias: true });      // Create a new WebGL renderer.
renderer.setSize(480, 450);                                         // Set the size in pixels.
renderer.setClearColor(new THREE.Color('lightgrey'), 1)             // Set the color to lightgrey.
const canvas = document.getElementById('canvas-container');         // Get the grid container's id.
canvas.appendChild(renderer.domElement);                            // Append the canvas to the grid.

const arc = Math.PI * 2;                                            // Full circle (2*PI).
const geometry = new THREE.TorusKnotGeometry(6.5, 2, 16, 100, arc); // Define the torus shape.
const material = new THREE.MeshNormalMaterial();                    // Define the torus material.
const torus = new THREE.Mesh(geometry, material);                   // Create the mesh object.
scene.add(torus);                                                   // Add the torus to the scene.
camera.position.z = 20;                                             // Position the camera.

function animate() {                                                // Main animation loop.
    requestAnimationFrame(animate);                                 // Set up the next animation frame.
    torus.rotation.x += 0.01;                                       // Rotate the torus.
    torus.rotation.y += 0.005;

    renderer.render(scene, camera);                                 // Render the scene.
}
requestAnimationFrame(animate);                                     // Start the animation loop.


