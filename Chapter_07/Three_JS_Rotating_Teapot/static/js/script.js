// script.js

let scene;
let camera;
let teapot;
let renderer;
let spotLight;
let controllers;
let teapotSize = 100;
let selectedTheme = "blood_valley";

function init() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 80000);
    camera.position.set(- 600, 550, 1300);
    const cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.addEventListener('change', render);

    // INIT SKYBOX
    // Init cube textures.
    cubeLoader_blood_valley = new THREE.CubeTextureLoader();
    cubeLoader_blood_valley.setPath('static/images/skybox/blood-valley/');
    blood_valley = cubeLoader_blood_valley.load([
        'ft.png', 'bk.png',
        'up.png', 'dn.png',
        'rt.png', 'lf.png'
    ]);

    cubeLoader_castle = new THREE.CubeTextureLoader();
    cubeLoader_castle.setPath('static/images/skybox/castle/');
    castle = cubeLoader_castle.load([
        'ft.png', 'bk.png',
        'up.png', 'dn.png',
        'rt.png', 'lf.png'
    ]);

    cubeLoader_city = new THREE.CubeTextureLoader();
    cubeLoader_city.setPath('static/images/skybox/city/');
    city = cubeLoader_city.load([
        'ft.png', 'bk.png',
        'up.png', 'dn.png',
        'rt.png', 'lf.png'
    ]);

    scene.background = blood_valley; // Default theme.

    // INIT TEAPOT
    // Init colors.
    materialColor = new THREE.Color();
    materialColor.setRGB(1, 1, 1);
    specularColor = new THREE.Color();
    specularColor.setRGB(1, 1, 1);

    // Init textures.
    teapotTexture = new THREE.TextureLoader().load('static/images/ferns/fern.png');
    teapotTexture.wrapS = teapotTexture.wrapT = THREE.RepeatWrapping;
    teapotTexture.anisotropy = 21;
    specularMap = new THREE.TextureLoader().load('static/images/ferns/fern_specular_map.png');
    specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;
    specularMap.anisotropy = 21;
    displacementMap = new THREE.TextureLoader().load('static/images/ferns/fern_displacement_map.png');
    displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
    displacementMap.anisotropy = 21;
    displacementMap.roughness = 0;
    bumpMap = new THREE.TextureLoader().load('static/images/ferns/fern_bump_map.png');
    bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.anisotropy = 21;
    bumpMap.roughness = 0;

    // Init lights.
    ambientLight = new THREE.AmbientLight(0x333333, 0.1);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.6);
    directionalLight.position.set(-1000, 1000, 1000);
    scene.add(directionalLight);

    spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 500, 500);
    scene.add(spotLight);

    // Finish init.
    const container = document.getElementById("display");
    container.appendChild(renderer.domElement);

    // Attach info.
    info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '15px';
    info.style.left = '50px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = "lightgreen";
    info.innerHTML = "<h1>ThreeJS Rotating Teapot</h1><p>Hacked by Mike Jackson</p>";
    container.appendChild(info);

    initGUI();
    render();
}

function initGUI() {
    controllers = new function () {
        this.ambientLight = true;
        this.directionalLight = true;
        this.spotLight = true;
        this.spotLightXPosition = 0;
        this.spotLightZPosition = 90;
        this.spotLightLightness = 0.5;
        this.spotLightAngle = 60;
        this.showFlatShading = false;
        this.showteapotDecal = false;
        this.segmentNum = 10;
        this.showSpecular = false;
        this.shininess = 30;
        this.specularColor = 0xFFFFFF;
        this.showDisplacement = false;
        this.displacementScale = 0;
        this.showBump = false;
        this.bumpScale = 0;
        this.showCube = false;
        this.envMapping = false;
        this.skyboxTheme = 'blood_valley';
    }

    const gui = new dat.GUI();
    lightControls = gui.addFolder("Light Controls");
    ambCtrl = lightControls.add(controllers, "ambientLight", true, false).name("Ambient Light").onChange(render);
    directCtrl = lightControls.add(controllers, "directionalLight", true, false).name("Directional Light").onChange(render);
    spotCtrl = lightControls.add(controllers, "spotLight", true, false).name("Spot Light").onChange(render);
    lightControls.add(controllers, "spotLightXPosition", -180, 180).name("X Position of Spot Light").onChange(render);
    lightControls.add(controllers, "spotLightZPosition", -180, 180).name("Z Position of Spot Light").onChange(render);
    lightControls.add(controllers, "spotLightLightness", 0, 1).name("Spot Light Lightness").onChange(render);
    lightControls.add(controllers, "spotLightAngle", 0, 180).name("Spot Light Angle").onChange(render);

    teapotMaterialControl = gui.addFolder("Teapot Materials");
    teapotMaterialControl.add(controllers, "showFlatShading", true, false).name("Show Flat Shading").onChange(render);
    teapotMaterialControl.add(controllers, "showteapotDecal", true, false).name("Show teapot Decal").onChange(render);
    teapotMaterialControl.add(controllers, "segmentNum", 1, 210).name("Number of Segment").onChange(render)
    teapotSpecularControl = gui.addFolder("Teapot Specular");
    specularCtrl = teapotSpecularControl.add(controllers, "showSpecular", true, false).name("Show Specular").onChange(render);
    teapotSpecularControl.add(controllers, "shininess", 1, 10000).name("Shininess").onChange(render);
    teapotSpecularControl.addColor(controllers, 'specularColor').name('Specular Color').onChange(render);
    teapotDisplacementControl = gui.addFolder("Teapot Displacement");
    displacementCtrl = teapotDisplacementControl.add(controllers, "showDisplacement", true, false).name("Show Displacement").onChange(render);
    teapotDisplacementControl.add(controllers, "displacementScale", 0, 30).name("Displacement Scale").onChange(render);
    teapotBumpControl = gui.addFolder("Teapot Bump");
    bumpCtrl = teapotBumpControl.add(controllers, "showBump", true, false).name("Show Bump").onChange(render);
    teapotBumpControl.add(controllers, "bumpScale", 0, 1).name("Bump Scale").onChange(render);
    skybBoxControl = gui.addFolder("Sky Box and IBL");
    skybBoxControl.add(controllers, "showCube", true, false).name("Show Sky Box").onChange(render);
    skybBoxControl.add(controllers, "envMapping", true, false).name("Environment Lighting").onChange(render);
    skybBoxControl
        .add(
            controllers,
            "skyboxTheme",
            {
                "Blood Valley": "blood_valley",
                "Castle": "castle",
                "City": "city"
            })
        .name("Skybox Theme")
        .onChange(
            function (value) {
                selectedTheme = value;
                render();
            });
}

function render() {
    let spotLightLightness = controllers.spotLightLightness;
    let currTheme = blood_valley;

    scene.remove(teapot);
    specularColor.set(controllers.specularColor);

    // Skybox theme selection.
    if (selectedTheme == "blood_valley") {
        currTheme = blood_valley;
    } else if (selectedTheme == "castle") {
        currTheme = castle;
    } else if (selectedTheme == "city") {
        currTheme = city
    } else {
        throw new Error('404: Theme not found!');
    }

    if (controllers.showCube) {
        scene.background = currTheme;
        envMap = currTheme;
        if (!controllers.envMapping) {
            envMap = null;
        }
    } else {
        envMap = null;
        scene.background = new THREE.Color(0x00000);
    }

    // Teapot.
    teapotGeometry = new THREE.TeapotBufferGeometry(teapotSize, controllers.segmentNum, true, true, true, false, true);
    phongMaterial = new THREE.MeshPhongMaterial({ color: materialColor, envMap: envMap, side: THREE.DoubleSide });
    phongMaterial.combine = THREE.MixOperation;

    // Displacement trigger.
    if (controllers.showDisplacement) {
        phongMaterial.displacementMap = displacementMap;
        phongMaterial.displacementScale = controllers.displacementScale;
    } else {
        phongMaterial.displacementMap = null;
        phongMaterial.displacementScale = 0;
    }

    // Bump trigger.
    if (controllers.showBump) {
        phongMaterial.bumpMap = bumpMap;
        phongMaterial.bumpScale = controllers.bumpScale;
    } else {
        phongMaterial.bumpMap = null;
        phongMaterial.bumpScale = 0
    }

    // Teapot Decal trigger.
    if (controllers.showteapotDecal) {
        phongMaterial.map = teapotTexture;

    } else {
        phongMaterial.map = null;
    }

    // Specular.
    if (controllers.showSpecular) {
        phongMaterial.specularMap = specularMap;
        phongMaterial.specular = specularColor;
        phongMaterial.shininess = controllers.shininess;
    } else {
        phongMaterial.specularMap = null;
        phongMaterial.shininess = 0;
    }

    // Flat shading.
    phongMaterial.flatShading = controllers.showFlatShading;
    teapot = new THREE.Mesh(teapotGeometry, phongMaterial);
    scene.add(teapot);

    // Ambient light trigger.
    if (controllers.ambientLight) {
        scene.remove(ambientLight);
        scene.add(ambientLight);
    } else {
        scene.remove(ambientLight);
    }

    // Directional light trigger.
    if (controllers.directionalLight) {
        scene.remove(directionalLight);
        scene.add(directionalLight);
    } else {
        scene.remove(directionalLight);
    }

    // Spotlight trigger.
    if (controllers.spotLight) {
        scene.remove(spotLight);
        spotLight = new THREE.SpotLight(0xffffff, spotLightLightness);
        spotLight.angle = controllers.spotLightAngle * Math.PI / 180;
        spotLight.target = teapot;
        positionX = controllers.spotLightXPosition * Math.PI / 180 * 500;
        positionZ = controllers.spotLightZPosition * Math.PI / 180 * 500;
        spotLight.position.set(positionX, 500, positionZ);
        scene.add(spotLight);
    } else {
        scene.remove(spotLight);
    }

    renderer.render(scene, camera);
}

window.addEventListener("load", init, false);
