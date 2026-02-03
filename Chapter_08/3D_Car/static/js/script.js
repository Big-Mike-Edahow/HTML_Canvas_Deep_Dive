// script.js

var stats;
var scene;
let renderer;
var camera;
var keyboard;
var car;

// Init the scene.
function init() {
    // Create a new renderer.
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setClearColorHex(0xFFFFFF, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);


    // Add Stats.
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    document.body.appendChild(stats.domElement);

    // Create a scene.
    scene = new THREE.Scene();

    // Put a camera in the scene.
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.set(0, 3, 120);
    scene.add(camera);

    // create a camera contol
    //cameraControls	= new THREEx.DragPanControls(camera)
    keyboard = new THREEx.KeyboardState();

    // Window resize. p for screenshot. f for fullscreen.
    THREEx.WindowResize.bind(renderer, camera);
    THREEx.Screenshot.bindKey(renderer);
    if (THREEx.FullScreen.available()) {
        THREEx.FullScreen.bindKey();
        document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
    }

    // Add objects to the scene.
    var geometry = new THREE.TorusGeometry(1, 0.42);
    var material = new THREE.MeshNormalMaterial();
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Turn on shadows.
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;


    // Add Skymap. 
    // Load sky images.
    var urls = [
        "static/images/sky1.png",
        "static/images/sky1.png",
        "static/images/sky1.png",
        "static/images/sky1.png",
        "static/images/sky1.png",
        "static/images/sky1.png",
    ];
    var textureCube = THREE.ImageUtils.loadTextureCube(urls);

    // Setup the cube shader.
    var shader = THREE.ShaderUtils.lib["cube"];
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    uniforms['tCube'].texture = textureCube;
    var material = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: uniforms
    });

    // Add sunlight.
    const light = new THREE.SpotLight();
    light.position.set(0, 500, 0);
    scene.add(light);

    // Add ground.
    const grassTex = THREE.ImageUtils.loadTexture('/static/images/grass.png');
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.x = 256;
    grassTex.repeat.y = 256;
    const groundMat = new THREE.MeshBasicMaterial({ map: grassTex });

    const groundGeo = new THREE.PlaneGeometry(400, 400);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.9;               // Lower it.
    ground.rotation.x = -Math.PI / 2;       // -90 degrees around the xaxis.
    ground.doubleSided = true;              // Draw on both sides.
    scene.add(ground);

    // Load a car.			
    // Use ./ or it may not load the .bin correctly.
    new THREE.BinaryLoader().load('/static/js/vendor/VeyronNoUv_bin.js', function (geometry) {
        const material = new THREE.MeshNormalMaterial();
        const orange = new THREE.MeshLambertMaterial({ color: 0x995500, opacity: 1.0, transparent: false });
        const mesh = new THREE.Mesh(geometry, orange);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.05;
        scene.add(mesh);
        car = mesh;
    });
}

let composer;
let renderModel;
const angle = Math.PI / 2;

function animate() {                                        // Main animation loop.
    requestAnimationFrame(animate);                         // Set up animation for the next frame.
    render();                                               // Render the scene.
    stats.update();                                         // Update the stats.
}

// Render the scene.
function render() {
    // Update camera controls.
    if (keyboard.pressed("left")) {
        car.rotation.y += 0.1;
    }
    if (keyboard.pressed("right")) {
        car.rotation.y -= 0.1;
    }
    if (keyboard.pressed("up")) {
        car.position.z -= 1.0;
    }
    if (keyboard.pressed("down")) {
        car.position.z += 1.0;
    }

    renderer.render(scene, camera);                             // Render the scene.
}

window.addEventListener("load", init, false);

requestAnimationFrame(animate);
