import * as THREE from "three";
import GUI from "./libs/util/dat.gui.module.js";
import { TrackballControls } from "./build/jsm/controls/TrackballControls.js";
import { ShadowMapViewer } from "./build/jsm/utils/ShadowMapViewer.js";
import { OrbitControls } from "./build/jsm/controls/OrbitControls.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  onWindowResize,
  createGroundPlaneWired,
  createLightSphere,
  degreesToRadians,
  createGroundPlaneXZ,
  createGroundPlane,
} from "./libs/util/util.js";
import createAviao from "./T1/criarAviao.js";
import KeyboardState from "./libs/util/KeyboardState.js";
import { CSG } from "./libs/other/CSGMesh.js";
import { FogExp2, Line, SplineCurve } from "./build/three.module.js";
import { GLTFLoader } from "./build/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "./build/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "./build/jsm/loaders/MTLLoader.js";
import { Water } from "./build/jsm/objects/Water.js";
import { Line3 } from "three";
import { Buttons } from "./libs/other/buttons.js";

const textureLoader = new THREE.TextureLoader();
var buttons = new Buttons(onButtonDown, onButtonUp);
var pressedA = false;
var pressedB = false;
let pause = true;
let grass = textureLoader.load("./assets/textures/grass.jpg");
let stone = textureLoader.load("./T1/assets/stonefloor.jpg");
let stoneNormal = textureLoader.load("./T1/assets/stoneNormal.jpg");
let stoneDis = textureLoader.load("./T1/assets/StoneDis.png");
let lateral = textureLoader.load("./T1/assets/lateral.jpg");
let lateralN = textureLoader.load("./T1/assets/lateralNormal.jpg");
let lateralD = textureLoader.load("./T1/assets/lateralDis.png");
let explosion = [];
for (let i = 1; i < 17; i++) {
  explosion[i - 1] = textureLoader.load(`./assets/textures/${i}.png`);
}
let auxDoTiro = 0;
var scene = new THREE.Scene(); // Create main scene
var scene2 = new THREE.Scene();
var luz2 = new THREE.AmbientLight("rgb(255,255,255)");
scene2.add(luz2);
//scene2.background = new THREE.Color("rgb(255,255,0)");

let renderer = new THREE.WebGLRenderer({ alpha: true });
document.getElementById("webgl-output").appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap; // default
renderer.autoClear = false;

//Camera virtual para a viewport
var camPosition = new THREE.Vector3(0, 80, 120);
//var lookAtVec = new THREE.Vector3(0,15,0);
//var upVec = new THREE.Vector3(0,1,0);
var vcWidth = 400;
var vcHeidth = 300;
var virtualCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  300
);
virtualCamera.position.copy(camPosition);
//virtualCamera.up.copy(upVec);
virtualCamera.lookAt(0, 0, 0);
var cameraHelper = new THREE.CameraHelper(virtualCamera);
scene2.add(cameraHelper);
//scene2.add(virtualCamera);

let audioLoader, audioPath;

const loadingManager = new THREE.LoadingManager(() => {
  let loadingScreen = document.getElementById("loading-screen");
  loadingScreen.transition = 0;
  loadingScreen.style.setProperty("--speed1", "0");
  loadingScreen.style.setProperty("--speed2", "0");
  loadingScreen.style.setProperty("--speed3", "0");

  let button = document.getElementById("myBtn");
  button.style.backgroundColor = "Red";
  button.innerHTML = "Click to Enter";
  button.addEventListener("click", onButtonPressed);
});

function onButtonPressed() {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.transition = 0;
  loadingScreen.classList.add("fade-out");
  loadingScreen.addEventListener("transitionend", (e) => {
    const element = e.target;
    //element.remove();
  });
  pause = false;
  // Config and play the loaded audio
  let sound = new THREE.Audio(new THREE.AudioListener());
  audioLoader.load(audioPath, function (buffer) {
    sound.setVolume(0.01);
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.play();
  });
}

let soundMissilLoader = new THREE.AudioLoader();
let soundMissil = new THREE.Audio(new THREE.AudioListener());
soundMissilLoader.load("./T1/assets/missil.mp3", function (buffer) {
  soundMissil.setVolume(0.01);
  soundMissil.setBuffer(buffer);
});

let soundTirosLoader = new THREE.AudioLoader();
let soundTiros = new THREE.Audio(new THREE.AudioListener());
soundTirosLoader.load("./T1/assets/tiros.mp3", function (buffer) {
  soundTiros.setVolume(0.01);
  soundTiros.setBuffer(buffer);
  soundTiros.duration = 0.06;
});

let soundExplosaoLoader = new THREE.AudioLoader();
let soundExplosao = new THREE.Audio(new THREE.AudioListener());
soundExplosaoLoader.load("./T1/assets/explosao.mp3", function (buffer) {
  soundExplosao.setVolume(0.01);
  soundExplosao.setBuffer(buffer);
  soundExplosao.duration = 0.8;
});

loadAudio(loadingManager, "./assets/sounds/sampleMusic.mp3");

function loadAudio(manager, audio) {
  // Create ambient sound
  audioLoader = new THREE.AudioLoader(manager);
  audioPath = audio;
}

var keyboard = new KeyboardState();
var clock = new THREE.Clock();
var camera = initCamera(new THREE.Vector3(0, 80, 120)); // Init camera in this position
camera.up.set(0, 1, 0);
let cont = 0;
let auxAnimation = true;
let gameover = false;
let auxiliarPosCamera = 0;
let hp = 5;
let objetoCura = [];
let objetoCuraBB = [];

//LUZ AMBIENTE
var ambientLight = new THREE.AmbientLight("rgb(60,60,60)");
scene.add(ambientLight);

var lightPosition = new THREE.Vector3(0, 90, 130);

var dirLight = new THREE.DirectionalLight("rgb(255,255,255)");
dirLight.position.copy(lightPosition);
dirLight.castShadow = true;
// Shadow Parameters
dirLight.shadow.mapSize.width = 512;
dirLight.shadow.mapSize.height = 512;
dirLight.castShadow = true;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 600;
dirLight.shadow.camera.left = -110;
dirLight.shadow.camera.right = 110;
dirLight.shadow.camera.top = 200;
dirLight.shadow.camera.bottom = -200;

dirLight.shadow.bias = -0.009;

// No effect on Basic and PCFSoft
dirLight.shadow.radius = 1;

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Show axes (parameter is size of each axis)
//var axesHelper = new THREE.AxesHelper(12);
//scene.add(axesHelper);

// create the ground plane

let plane1 = createGroundPlaneWired(150, 305, 10, 10, "lightgray");
plane1.receiveShadow = true;
let plane2 = createGroundPlaneWired(150, 305, 10, 10, "lightgray");
plane2.receiveShadow = true;
let plane3 = createGroundPlaneWired(150, 305, 10, 10, "lightgray");
plane3.receiveShadow = true;
let planeaux = createGroundPlaneWired(150, 305, 10, 10, "lightgray");

let curvedPlane1 = createGroundPlaneWired(300, 45, 10, 10, "lightgray");
let curvedPlane2 = createGroundPlaneWired(300, 45, 10, 10, "lightgray");
let curvedPlane3 = createGroundPlaneWired(300, 45, 10, 10, "lightgray");
let curvedPlane4 = createGroundPlaneWired(300, 45, 10, 10, "lightgray");
let curvedPlane5 = createGroundPlaneWired(300, 45, 10, 10, "lightgray");
let curvedPlane6 = createGroundPlaneWired(300, 45, 10, 10, "lightgray");

let glassPlane1 = createGroundPlane(180, 300, 10, 10, "rgb(0,255,0)");
let glassPlane2 = createGroundPlane(180, 300, 10, 10, "rgb(0,255,0)");
glassPlane1.translateX(175);
glassPlane1.translateZ(19);
plane1.add(glassPlane1);
glassPlane2.translateX(-175);
glassPlane2.translateZ(19);
plane1.add(glassPlane2);

let glassPlane3 = createGroundPlane(180, 300, 10, 10, "rgb(0,255,0)");
let glassPlane4 = createGroundPlane(180, 300, 10, 10, "rgb(0,255,0)");
glassPlane3.translateX(175);
glassPlane3.translateZ(19);
plane2.add(glassPlane3);
glassPlane4.translateX(-175);
glassPlane4.translateZ(19);
plane2.add(glassPlane4);

let glassPlane5 = createGroundPlane(180, 300, 10, 10, "rgb(0,255,0)");
let glassPlane6 = createGroundPlane(180, 300, 10, 10, "rgb(0,255,0)");
glassPlane5.translateX(175);
glassPlane5.translateZ(19);
plane3.add(glassPlane5);
glassPlane6.translateX(-175);
glassPlane6.translateZ(19);
plane3.add(glassPlane6);

curvedPlane1.translateX(75);
curvedPlane2.translateX(-75);
curvedPlane3.translateX(75);
curvedPlane4.translateX(-75);
curvedPlane5.translateX(75);
curvedPlane6.translateX(-75);
//curvedPlane1.rotateY(Math.PI / 1.5);
curvedPlane1.rotateY(Math.PI / 2);
curvedPlane1.rotateX(-Math.PI / 0.85);
//curvedPlane2.rotateY(-Math.PI / 1.5);
curvedPlane2.rotateY(-Math.PI / 2);
curvedPlane2.rotateX(-Math.PI / 0.85);

//curvedPlane3.rotateY(Math.PI / 1.5);
curvedPlane3.rotateY(Math.PI / 2);
curvedPlane3.rotateX(-Math.PI / 0.85);

//curvedPlane4.rotateY(-Math.PI / 1.5);
curvedPlane4.rotateY(-Math.PI / 2);
curvedPlane4.rotateX(-Math.PI / 0.85);

//curvedPlane5.rotateY(Math.PI / 1.5);
curvedPlane5.rotateY(Math.PI / 2);
curvedPlane5.rotateX(-Math.PI / 0.85);

//curvedPlane6.rotateY(-Math.PI / 1.5);
curvedPlane6.rotateY(-Math.PI / 2);
curvedPlane6.rotateX(-Math.PI / 0.85);

glassPlane1.material.map = grass;
glassPlane2.material.map = grass;
glassPlane3.material.map = grass;
glassPlane4.material.map = grass;
glassPlane5.material.map = grass;
glassPlane6.material.map = grass;

plane1.material.map = lateral;
plane1.material.normalMap = lateralN;
plane1.material.displacementMap = lateralD;
plane1.material.displacementScale = 3;

plane2.material.map = lateral;
plane2.material.normalMap = lateralN;
plane2.material.displacementMap = lateralD;
plane2.material.displacementScale = 3;

plane3.material.map = lateral;
plane3.material.normalMap = lateralN;
plane3.material.displacementMap = lateralD;
plane3.material.displacementScale = 3;

curvedPlane1.material.map = stone;
curvedPlane1.material.normalMap = stoneNormal;
curvedPlane1.material.displacementMap = stoneDis;
curvedPlane1.material.displacementScale = 4;

curvedPlane2.material.map = stone;
curvedPlane2.material.normalMap = stoneNormal;
curvedPlane2.material.displacementMap = stoneDis;
curvedPlane2.material.displacementScale = 4;

curvedPlane3.material.map = stone;
curvedPlane3.material.normalMap = stoneNormal;
curvedPlane3.material.displacementMap = stoneDis;
curvedPlane3.material.displacementScale = 4;

curvedPlane4.material.map = stone;
curvedPlane4.material.normalMap = stoneNormal;
curvedPlane4.material.displacementMap = stoneDis;
curvedPlane4.material.displacementScale = 4;

curvedPlane5.material.map = stone;
curvedPlane5.material.normalMap = stoneNormal;
curvedPlane5.material.displacementMap = stoneDis;
curvedPlane5.material.displacementScale = 4;

curvedPlane6.material.map = stone;
curvedPlane6.material.normalMap = stoneNormal;
curvedPlane6.material.displacementMap = stoneDis;
curvedPlane6.material.displacementScale = 4;

function setTextureOptions(material, repu, repv) {
  material.map.repeat.set(repu, repv);
  material.displacementMap.repeat.set(repu, repv);
  material.normalMap.repeat.set(repu, repv);

  material.map.wrapS =
    material.displacementMap.wrapS =
    material.normalMap.wrapS =
      THREE.RepeatWrapping;
  material.map.wrapT =
    material.displacementMap.wrapT =
    material.normalMap.wrapT =
      THREE.RepeatWrapping;
}

setTextureOptions(curvedPlane1.material, 8, 1);

scene.add(plane1);
scene.add(plane2);
scene.add(plane3);
scene.add(planeaux);
plane1.add(curvedPlane1);
plane1.add(curvedPlane2);
plane2.add(curvedPlane3);
plane2.add(curvedPlane4);
plane3.add(curvedPlane5);
plane3.add(curvedPlane6);
plane2.translateY(300);
plane3.translateY(600);

planeaux.translateY(-300);

//water
const waterGeometry = new THREE.PlaneGeometry(150, 600);

// Water shader parameters
let water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    "./assets/textures/waternormals.jpg",
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }
  ),
  //sunDirection: new THREE.Vector3(),
  //sunColor: 0xffffff,
  waterColor: "rgba(0,255,255)",
  distortionScale: 7,
});
//water.material.transparent = true;
//water.material.opacity = 0.2;
water.translateY(5);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// create a cube for camera
var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
//cameraHolder.add(dirLight);
scene.add(cameraHolder);
scene.add(dirLight);
cameraHolder.translateY(0);

let aviao = createAviao();
scene.add(aviao);
var loader = new GLTFLoader(loadingManager);

loader.load(
  "./T1/assets/F-16D.gltf",
  function (gltf) {
    var objAviao = gltf.scene;
    objAviao.name = "objAviao";
    objAviao.visible = true;
    //objAviao.castShadow = true;
    //objAviao.receiveShadow = true;
    objAviao.rotateZ(2 * -1.57);
    objAviao.rotateX(1.5);
    objAviao.traverse(function (child) {
      if (child) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    aviao.add(objAviao);
  },
  null,
  null
);

const explosionG = new THREE.SphereGeometry(6, 32, 16);
const explosionM = new THREE.MeshBasicMaterial({ color: "lightred" });
const sphere = new THREE.Mesh(explosionG, explosionM);

//sphere.rotateX(Math.PI / 2);
function explode1(name) {
  name.remove(sphere);
  sphere.material.map = explosion[0];
  name.add(sphere);
  soundExplosao.play();
}
function explode2(name) {
  name.remove(sphere);
  sphere.material.map = explosion[1];
  name.add(sphere);
}
function explode3(name) {
  name.remove(sphere);
  sphere.material.map = explosion[2];
  name.add(sphere);
}
function explode4(name) {
  name.remove(sphere);
  sphere.material.map = explosion[3];
  name.add(sphere);
}
function explode5(name) {
  name.remove(sphere);
  sphere.material.map = explosion[4];
  name.add(sphere);
}
function explode6(name) {
  name.remove(sphere);
  sphere.material.map = explosion[5];
  name.add(sphere);
}
function explode7(name) {
  name.remove(sphere);
  sphere.material.map = explosion[6];
  name.add(sphere);
}
function explode8(name) {
  name.remove(sphere);
  sphere.material.map = explosion[7];
  name.add(sphere);
}
function explode9(name) {
  name.remove(sphere);
  sphere.material.map = explosion[8];
  name.add(sphere);
}
function explode10(name) {
  name.remove(sphere);
  sphere.material.map = explosion[9];
  name.add(sphere);
}
function explode11(name) {
  name.remove(sphere);
  sphere.material.map = explosion[10];
  name.add(sphere);
}
function explode12(name) {
  name.remove(sphere);
  sphere.material.map = explosion[11];
  name.add(sphere);
}
function explode13(name) {
  name.remove(sphere);
  sphere.material.map = explosion[12];
  name.add(sphere);
}
function explode14(name) {
  name.remove(sphere);
  sphere.material.map = explosion[13];
  name.add(sphere);
}
function explode15(name) {
  name.remove(sphere);
  sphere.material.map = explosion[14];
  name.add(sphere);
}
function explode16(name) {
  name.remove(sphere);
  sphere.material.map = explosion[15];
  name.add(sphere);
}
function explode17(name) {
  name.remove(sphere);
  sphere.material.map = explosion[16];
  name.add(sphere);
}
function fimExplosion(name) {
  name.remove(sphere);
}
function explode(name) {
  setTimeout(() => explode1(name), 1);
  setTimeout(() => explode2(name), 30);
  setTimeout(() => explode3(name), 60);
  setTimeout(() => explode4(name), 90);
  setTimeout(() => explode5(name), 120);
  setTimeout(() => explode6(name), 150);
  setTimeout(() => explode7(name), 180);
  setTimeout(() => explode8(name), 210);
  setTimeout(() => explode9(name), 240);
  setTimeout(() => explode10(name), 270);
  setTimeout(() => explode11(name), 300);
  setTimeout(() => explode12(name), 330);
  setTimeout(() => explode13(name), 360);
  setTimeout(() => explode14(name), 390);
  setTimeout(() => explode15(name), 420);
  setTimeout(() => explode16(name), 450);
  setTimeout(() => explode17(name), 480);
  setTimeout(() => fimExplosion(name), 500);
}

//criando a BB do aviao
let aviaoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
aviaoBB.setFromObject(aviao);

let veloc = 2;
let veloc2 = 1;

var sphereGeometry = new THREE.SphereGeometry(1, 32, 1);
var sphereMaterial = new THREE.MeshLambertMaterial({ color: "rgb(0,0,0)" });
var sphereMaterial2 = new THREE.MeshLambertMaterial({
  color: "rgb(255, 255, 255)",
});
var sphereMaterial3 = new THREE.MeshLambertMaterial({ color: "rgb(255,0,0)" });
var sphereMaterial4 = new THREE.MeshLambertMaterial({ color: "rgb(0,255,0)" });

let qntdTiro = 0;
let qntdTiro2 = 0;
let tiros = [];
let tirosBB = [];
let misseis = [];
let misseisBB = [];
let enemyTiros = [];
let enemyTirosBB = [];
let groundTiros = [];
let groundTirosBB = [];

var geometry = new THREE.BoxGeometry(10, 30, 0);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//let cube = new THREE.Mesh( geometry, material );
//var sphere2Material = new THREE.MeshLambertMaterial({ color: "rgb(255,0,0)" });
//let esferaTeste = new THREE.Mesh(sphereGeometry, sphere2Material);
var life = [];

for (var i = 0; i < 5; i++) {
  life[i] = new THREE.Mesh(geometry, material);
  life[i].position.set(i * -15, 0, 0);
  scene2.add(life[i]);
}

for (let i = 0; i < 20; i++) {
  tiros[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);
  tirosBB[i] = new THREE.Sphere(tiros[i].position, 1);
}

for (let i = 0; i < 20; i++) {
  misseis[i] = new THREE.Mesh(sphereGeometry, sphereMaterial2);
  //BB
  misseisBB[i] = new THREE.Sphere(misseis[i].position, 1);
}

let velocidade = -0.2;
let animationOn = true;

// criação inimigo
var geometryEnemy = new THREE.BoxGeometry(6, 6, 6);
var groundGeometryEnemy = new THREE.BoxGeometry(6, 6, 6);
var materialEnemy = new THREE.MeshLambertMaterial({
  color: "rgb(200,0,0)",
  visible: false,
});
var groundMaterialEnemy = new THREE.MeshLambertMaterial({
  color: "rgb(0,0,200)",
  visible: false,
});
//var enemy = new THREE.Mesh(geometryEnemy, materialEnemy);
let enemys = [];
let enemysBB = [];

let enemysReto = [];
let enemysRetoBB = [];

let enemysReto2 = [];
let enemysReto2BB = [];

let enemysDiagonal = [];
let enemysDiagonalBB = [];

let enemysDiagonal2 = [];
let enemysDiagonal2BB = [];

let groundEnemys = [];
let groundEnemysBB = [];

let auxiliarEnemy1 = 1;
let auxiliarCura = 1;
let auxiliarEnemy2 = 1;
let auxiliarEnemy3 = 1;

let Cgeometry = new THREE.CylinderGeometry(1, 2, 5, 32);
let Cmaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  visible: false,
});

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

var controls = new OrbitControls(camera, renderer.domElement);

let fwdValue = 0;
let bkdValue = 0;
let rgtValue = 0;
let lftValue = 0;
let tempVector = new THREE.Vector3();
let upVector = new THREE.Vector3(0, 1, 0);

addJoysticks();

render();
//criando auxiliares para os tiros
let shoot = true;
let shootM = true;
let cadencia = 4;

function addJoysticks() {
  // Details in the link bellow:
  // https://yoannmoi.net/nipplejs/

  let joystick = nipplejs.create({
    zone: document.getElementById("joystickWrapper1"),
    mode: "static",
    position: { top: "-80px", left: "80px" },
  });

  joystick.on("move", function (evt, data) {
    const forward = data.vector.y;
    const turn = data.vector.x;
    fwdValue = bkdValue = lftValue = rgtValue = 0;

    if (forward > 0) fwdValue = Math.abs(forward);
    else if (forward < 0) bkdValue = Math.abs(forward);

    if (turn > 0) rgtValue = Math.abs(turn);
    else if (turn < 0) lftValue = Math.abs(turn);
  });

  joystick.on("end", function (evt) {
    bkdValue = 0;
    fwdValue = 0;
    lftValue = 0;
    rgtValue = 0;
  });
}

function updatePlayer() {
  // move the player
  var speed = 100;
  var moveDistance = speed * clock.getDelta();
  var angle2 = degreesToRadians(12);
  const angle = controls.getAzimuthalAngle();

  if (fwdValue > 0) {
    if (aviao.position.z > cameraHolder.position.z - 90)
      aviao.translateY(moveDistance);
  }

  if (bkdValue > 0) {
    if (aviao.position.z < cameraHolder.position.z + 70)
      aviao.translateY(-moveDistance);
  }

  if (lftValue > 0) {
    if (aviao.position.x > -80) {
      aviao.position.y = 30;
      aviao.translateX(-moveDistance);

      if (aviao.rotation.y > -angle2) aviao.rotateY(-angle2);
    }
  }

  if (rgtValue > 0) {
    if (aviao.position.x < 80) {
      aviao.position.y = 30;
      aviao.translateX(moveDistance);

      if (aviao.rotation.y < angle2) aviao.rotateY(angle2);
    }
  }
}

function onButtonDown(event) {
  switch (event.target.id) {
    case "A":
      console.log("oi");
      pressedA = true;

      /*if (shoot) {
                shoot = false;
                setTimeout(function () {
                    shoot = true;
                    tiros[qntdTiro].position.set(
                        aviao.position.x,
                        aviao.position.y,
                        aviao.position.z
                    );
                    scene.add(tiros[qntdTiro]);
                    if (qntdTiro === 19) {
                        qntdTiro = 0;
                    }
                    qntdTiro++;
                }, 1000 / cadencia);
            }*/
      break;
    case "B":
      pressedB = true;
      /*
            if (shootM) {
                shootM = false;
                setTimeout(function () {
                    shootM = true;
                    misseis[qntdTiro2].position.set(
                        aviao.position.x,
                        aviao.position.y,
                        aviao.position.z
                    );
                    scene.add(misseis[qntdTiro2]);
                    if (qntdTiro2 === 19) {
                        qntdTiro2 = 0;
                    }
                    qntdTiro2++;
                }, 1000 / cadencia);
            }*/
      break;
    case "full":
      buttons.setFullScreen();
      break;
  }
}

function onButtonUp(event) {
  pressedA = pressedB = false;
}

function executeIfKeyPressed() {
  if (pressedA) {
    if (shoot) {
      shoot = false;
      setTimeout(function () {
        shoot = true;
        tiros[qntdTiro].position.set(
          aviao.position.x,
          aviao.position.y,
          aviao.position.z
        );
        scene.add(tiros[qntdTiro]);
        if (qntdTiro === 19) {
          qntdTiro = 0;
        }
        qntdTiro++;
      }, 1000 / cadencia);
    }
  }
  if (pressedB) {
    if (shootM) {
      shootM = false;
      setTimeout(function () {
        shootM = true;
        misseis[qntdTiro2].position.set(
          aviao.position.x,
          aviao.position.y,
          aviao.position.z
        );
        scene.add(misseis[qntdTiro2]);
        if (qntdTiro2 === 19) {
          qntdTiro2 = 0;
        }
        qntdTiro2++;
      }, 1000 / cadencia);
    }
  }
}

function keyboardUpdate(gameover) {
  if (gameover === false) {
    keyboard.update();

    var speed = 100;
    var moveDistance = speed * clock.getDelta();
    var angle = degreesToRadians(12);

    if (pause === false) {
      // Keyboard.pressed - execute while is pressed
      if (keyboard.pressed("left") && aviao.position.x > -80) {
        aviao.position.y = 30;
        aviao.translateX(-moveDistance);

        if (aviao.rotation.y > -angle) aviao.rotateY(-angle);
      }

      if (keyboard.up("left")) {
        aviao.position.y = 30;
        aviao.rotateY(angle);
      }

      if (keyboard.pressed("right") && aviao.position.x < 80) {
        aviao.position.y = 30;
        aviao.translateX(moveDistance);

        if (aviao.rotation.y < angle) aviao.rotateY(angle);
      }

      if (keyboard.up("right")) {
        aviao.position.y = 30;
        aviao.rotateY(-angle);
      }

      if (
        keyboard.pressed("up") &&
        aviao.position.z > cameraHolder.position.z - 90
      )
        aviao.translateY(moveDistance);

      if (
        keyboard.pressed("down") &&
        aviao.position.z < cameraHolder.position.z + 70
      )
        aviao.translateY(-moveDistance);

      if (keyboard.pressed("space")) {
        if (shootM) {
          shootM = false;
          setTimeout(function () {
            shootM = true;
            misseis[qntdTiro2].position.set(
              aviao.position.x,
              aviao.position.y,
              aviao.position.z
            );
            scene.add(misseis[qntdTiro2]);
            soundTiros.play();
            if (qntdTiro2 === 19) {
              qntdTiro2 = 0;
            }
            qntdTiro2++;
          }, 1000 / cadencia);
        }
      }

      if (keyboard.pressed("ctrl")) {
        if (shoot) {
          shoot = false;
          setTimeout(function () {
            shoot = true;
            tiros[qntdTiro].position.set(
              aviao.position.x,
              aviao.position.y,
              aviao.position.z
            );
            scene.add(tiros[qntdTiro]);
            soundTiros.play();
            if (qntdTiro === 19) {
              qntdTiro = 0;
            }
            qntdTiro++;
          }, 1000 / cadencia);
        }
      }
      if (keyboard.up("ctrl")) {
        tiros[qntdTiro].position.set(
          aviao.position.x,
          aviao.position.y,
          aviao.position.z
        );
        scene.add(tiros[qntdTiro]);
        if (qntdTiro === 19) {
          qntdTiro = 0;
        }
        qntdTiro++;
      }
    }
    if (keyboard.pressed("G")) {
      hp = -1;
    }
    if (keyboard.up("P")) {
      if (pause === false) {
        pause = true;
      } else {
        pause = false;
      }
    }
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function planoInfinito() {
  if (cont === 0) {
    plane1.translateY(900);
  } else if (cont === 1) {
    plane2.translateY(900);
  } else if (cont === 2) {
    plane3.translateY(900);
  }
  cont++;
  if (cont === 3) {
    cont = 0;
  }
}

function createEnemy() {
  enemys.push(new THREE.Mesh(geometryEnemy, materialEnemy));
  loader.load(
    "./T1/assets/space.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      //objEnemy.rotateY(1.57);
      objEnemy.scale.set(1, 1, 1);
      objEnemy.traverse(function (child) {
        if (child) {
          child.castShadow = true;
        }
      });
      enemys[enemys.length - 1].add(objEnemy);
    },
    null,
    null
  );

  //var obj = loadOBJFile("./assets/", "plane", 1.0, 0, true)
  //enemys[enemys.length - 1].add(obj);
  enemysBB.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
  enemysBB[enemysBB.length - 1].setFromObject(enemys[enemys.length - 1]);
  let posicaoX = getRandomArbitrary(-90, 90);
  let posicaoZ = cameraHolder.position.z - 140;

  enemys[enemys.length - 1].position.set(posicaoX, 30, posicaoZ);
  enemys[enemys.length - 1].castShadow = true;
  enemys[enemys.length - 1].receiveShadow = true;
  scene.add(enemys[enemys.length - 1]);
  enemyTiros.push(new THREE.Mesh(sphereGeometry, sphereMaterial3));
  setTimeout(
    () =>
      tiroInimigo(enemys[enemys.length - 1], enemyTiros[enemyTiros.length - 1]),
    600
  );
  enemyTirosBB.push(
    new THREE.Sphere(enemyTiros[enemyTiros.length - 1].position, 1)
  );
}

function createEnemyReto() {
  enemysReto.push(new THREE.Mesh(geometryEnemy, materialEnemy));
  loader.load(
    "./T1/assets/aviao3.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(6.5, 6.5, 6.5);
      //objEnemy.rotateY();
      objEnemy.traverse(function (child) {
        if (child) {
          child.castShadow = true;
        }
      });
      enemysReto[enemysReto.length - 1].add(objEnemy);
    },
    null,
    null
  );
  enemysRetoBB.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
  enemysRetoBB[enemysRetoBB.length - 1].setFromObject(
    enemysReto[enemysReto.length - 1]
  );
  let posicaoX = -110;
  let posicaoZ = getRandomArbitrary(-140, 90);

  enemysReto[enemysReto.length - 1].position.set(posicaoX, 30, posicaoZ);
  enemysReto[enemysReto.length - 1].castShadow = true;
  enemysReto[enemysReto.length - 1].receiveShadow = true;
  scene.add(enemysReto[enemysReto.length - 1]);
  // enemyTiros.push(new THREE.Mesh(sphereGeometry, sphereMaterial));
  // setTimeout(
  //   () =>
  //     tiroInimigo(enemys[enemys.length - 1], enemyTiros[enemyTiros.length - 1]),
  //   600
  // );
}

function loadOBJFile(modelPath, modelName, desiredScale, angle, visibility) {
  var currentModel = modelName;
  var manager = new THREE.LoadingManager();

  var mtlLoader = new MTLLoader(manager);
  mtlLoader.setPath(modelPath);
  mtlLoader.load(modelName + ".mtl", function (materials) {
    materials.preload();

    var objLoader = new OBJLoader(manager);
    objLoader.setMaterials(materials);
    objLoader.setPath(modelPath);
    objLoader.load(
      modelName + ".obj",
      function (obj) {
        obj.visible = visibility;
        obj.name = modelName;
        // Set 'castShadow' property for each children of the group
        obj.traverse(function (child) {
          child.castShadow = true;
        });

        obj.traverse(function (node) {
          if (node.material) node.material.side = THREE.DoubleSide;
        });

        var obj = normalizeAndRescale(obj, desiredScale);
        var obj = fixPosition(obj);
        obj.rotateY(degreesToRadians(angle));

        //scene.add(obj);
        //objectArray.push(obj);
      },
      onProgress,
      onError
    );
  });
}

function createEnemyReto2() {
  enemysReto2.push(new THREE.Mesh(geometryEnemy, materialEnemy));
  loader.load(
    "./T1/assets/aviao3.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(6.5, 6.5, 6.5);
      objEnemy.rotateY(-3.14);
      objEnemy.traverse(function (child) {
        if (child) {
          child.castShadow = true;
        }
      });
      enemysReto2[enemysReto2.length - 1].add(objEnemy);
    },
    null,
    null
  );
  enemysReto2BB.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
  enemysReto2BB[enemysReto2BB.length - 1].setFromObject(
    enemysReto2[enemysReto2.length - 1]
  );
  let posicaoX = +190;
  let posicaoZ = getRandomArbitrary(-140, 90);

  enemysReto2[enemysReto2.length - 1].position.set(posicaoX, 30, posicaoZ);
  enemysReto2[enemysReto2.length - 1].castShadow = true;
  enemysReto2[enemysReto2.length - 1].receiveShadow = true;
  scene.add(enemysReto2[enemysReto2.length - 1]);
  // enemyTiros.push(new THREE.Mesh(sphereGeometry, sphereMaterial));
  // setTimeout(
  //   () =>
  //     tiroInimigo(enemys[enemys.length - 1], enemyTiros[enemyTiros.length - 1]),
  //   600
  // );
}

function createEnemyDiagonal() {
  enemysDiagonal.push(new THREE.Mesh(geometryEnemy, materialEnemy));
  loader.load(
    "./T1/assets/nave.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(6, 6, 6);
      objEnemy.rotateY(0.785398);
      objEnemy.traverse(function (child) {
        if (child) {
          child.castShadow = true;
        }
      });
      enemysDiagonal[enemysDiagonal.length - 1].add(objEnemy);
    },
    null,
    null
  );
  enemysDiagonalBB.push(
    new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
  );
  enemysDiagonalBB[enemysDiagonalBB.length - 1].setFromObject(
    enemysDiagonal[enemysDiagonal.length - 1]
  );
  let posicaoX = -170;
  let posicaoZ = -140;

  enemysDiagonal[enemysDiagonal.length - 1].position.set(
    posicaoX,
    30,
    posicaoZ
  );
  enemysDiagonal[enemysDiagonal.length - 1].castShadow = true;
  enemysDiagonal[enemysDiagonal.length - 1].receiveShadow = true;
  scene.add(enemysDiagonal[enemysDiagonal.length - 1]);
  // enemyTiros.push(new THREE.Mesh(sphereGeometry, sphereMaterial));
  // setTimeout(
  //   () =>
  //     tiroInimigo(enemys[enemys.length - 1], enemyTiros[enemyTiros.length - 1]),
  //   600
  // );
}

function createEnemyDiagonal2() {
  enemysDiagonal2.push(new THREE.Mesh(geometryEnemy, materialEnemy));
  loader.load(
    "./T1/assets/nave.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(6, 6, 6);
      objEnemy.rotateY(-0.785398);
      objEnemy.traverse(function (child) {
        if (child) {
          child.castShadow = true;
        }
      });
      enemysDiagonal2[enemysDiagonal2.length - 1].add(objEnemy);
    },
    null,
    null
  );
  enemysDiagonal2BB.push(
    new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
  );
  enemysDiagonal2BB[enemysDiagonal2BB.length - 1].setFromObject(
    enemysDiagonal2[enemysDiagonal2.length - 1]
  );
  let posicaoX = +170;
  let posicaoZ = -140;

  enemysDiagonal2[enemysDiagonal2.length - 1].position.set(
    posicaoX,
    30,
    posicaoZ
  );
  enemysDiagonal2[enemysDiagonal2.length - 1].castShadow = true;
  enemysDiagonal2[enemysDiagonal2.length - 1].receiveShadow = true;
  scene.add(enemysDiagonal2[enemysDiagonal2.length - 1]);
  // enemyTiros.push(new THREE.Mesh(sphereGeometry, sphereMaterial));
  // setTimeout(
  //   () =>
  //     tiroInimigo(enemys[enemys.length - 1], enemyTiros[enemyTiros.length - 1]),
  //   600
  // );
}

function tiroInimigo(inimigo, tiroInimigo) {
  tiroInimigo.position.set(
    inimigo.position.x,
    inimigo.position.y,
    inimigo.position.z
  );
  scene.add(tiroInimigo);
  soundTiros.play();
  tiroInimigo.lookAt(aviao.position);
}

function createGroundEnemy() {
  groundEnemys.push(new THREE.Mesh(groundGeometryEnemy, groundMaterialEnemy));
  loader.load(
    "./T1/assets/ship.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.translateY(-2);
      objEnemy.rotateY(-1.57);
      objEnemy.scale.set(0.5, 0.5, 0.5);
      objEnemy.traverse(function (child) {
        if (child) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      groundEnemys[groundEnemys.length - 1].add(objEnemy);
    },
    null,
    null
  );
  groundEnemysBB.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
  groundEnemysBB[groundEnemysBB.length - 1].setFromObject(
    groundEnemys[groundEnemys.length - 1]
  );
  let posicaoX = getRandomArbitrary(-60, 60);
  let posicaoZ = cameraHolder.position.z - 180;

  groundEnemys[groundEnemys.length - 1].position.set(posicaoX, 4, posicaoZ);
  groundEnemys[groundEnemys.length - 1].castShadow = true;
  groundEnemys[groundEnemys.length - 1].receiveShadow = true;
  scene.add(groundEnemys[groundEnemys.length - 1]);
  groundTiros.push(new THREE.Mesh(Cgeometry, Cmaterial));
  loader.load(
    "./T1/assets/missil.glb",
    function (gltf) {
      var objM = gltf.scene;
      objM.name = "objM";
      objM.visible = true;
      //objM.castShadow = true;
      //objM.receiveShadow = true;
      objM.scale.set(2, 2, 2);
      objM.traverse(function (child) {
        if (child) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      //aviao.add(objAviao);
      groundTiros[groundTiros.length - 1].add(objM);
    },
    null,
    null
  );
  if (groundEnemys[groundEnemys.length - 1].position.z < -100) {
    groundTirosBB.push(
      new THREE.Sphere(groundTiros[groundTiros.length - 1].position, 1)
    );
    tiroInimigoGround(
      groundEnemys[groundEnemys.length - 1],
      groundTiros[groundTiros.length - 1]
    );
  }
}

function tiroInimigoGround(inimigo, tiroInimigo) {
  tiroInimigo.position.set(
    inimigo.position.x,
    inimigo.position.y,
    inimigo.position.z
  );
  scene.add(tiroInimigo);
  soundMissil.play();
}

function jogo() {
  if (animationOn) {
    plane1.translateY(velocidade);
    plane2.translateY(velocidade);
    plane3.translateY(velocidade);
    planeaux.translateY(velocidade);
    //spotLight.translateZ(-velocidade);
    for (let i = 0; i < 20; i++) {
      tiros[i].translateZ(-veloc);
      tiros[i].castShadow = true;

      tirosBB[i].center.set(
        tiros[i].position.x,
        tiros[i].position.y,
        tiros[i].position.z
      );

      if (tiros[i].position.z < cameraHolder.position.z - 140) {
        scene.remove(tiros[i]);
      }
    }

    for (let i = 0; i < enemyTiros.length; i++) {
      if (enemyTiros[i] !== null) {
        enemyTiros[i].translateZ(veloc);
        enemyTiros[i].castShadow = true;

        enemyTirosBB[i].center.set(
          enemyTiros[i].position.x,
          enemyTiros[i].position.y,
          enemyTiros[i].position.z
        );

        if (enemyTiros[i].position.z > cameraHolder.position.z + 140) {
          scene.remove(enemyTiros[i]);
          enemyTiros[i] = null;
        }
      }
    }

    for (let i = 0; i < groundTiros.length; i++) {
      if (groundTiros[i] !== null) {
        if (groundTiros[i].position.y < 30 && auxDoTiro === 0) {
          groundTiros[i].translateY(0.3);
        } else {
          if (auxDoTiro === 0) {
            groundTiros[i].lookAt(aviao.position);
            groundTiros[i].rotateX(Math.PI / 2);
            auxDoTiro++;
          }
          groundTiros[i].translateY(veloc);
          groundTiros[i].castShadow = true;

          groundTirosBB[i].center.set(
            groundTiros[i].position.x,
            groundTiros[i].position.y,
            groundTiros[i].position.z
          );

          if (groundTiros[i].position.z > cameraHolder.position.z + 140) {
            scene.remove(groundTiros[i]);
            groundTiros[i] = null;
            groundTirosBB[i] = null;
            auxDoTiro = 0;
          }
        }
      }
    }

    for (let j = 0; j < 20; j++) {
      misseis[j].translateZ(-veloc);
      misseis[j].translateY(-veloc2);
      misseis[j].castShadow = true;

      misseisBB[j].center.set(
        misseis[j].position.x,
        misseis[j].position.y,
        misseis[j].position.z
      );

      if (misseis[j].position.y < cameraHolder.position.y - 90) {
        scene.remove(misseis[j]);
      }
    }

    for (let i = 0; i < objetoCura.length; i++) {
      if (objetoCura[i] !== null) {
        //objetoCura[i].translateZ(veloc);
        objetoCura[i].castShadow = true;

        objetoCuraBB[i].center.set(
          objetoCura[i].position.x,
          objetoCura[i].position.y,
          objetoCura[i].position.z
        );

        if (objetoCura[i].position.z > cameraHolder.position.z + 140) {
          scene.remove(objetoCura[i]);
          objetoCura[i] = null;
        }
      }
    }

    aviaoBB.copy(aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    for (let i = 0; i < enemys.length; i++) {
      if (enemys[i] !== null) {
        enemysBB[i]
          .copy(enemys[i].geometry.boundingBox)
          .applyMatrix4(enemys[i].matrixWorld);
      }
    }

    for (let i = 0; i < enemysReto.length; i++) {
      if (enemysReto[i] !== null) {
        enemysRetoBB[i]
          .copy(enemysReto[i].geometry.boundingBox)
          .applyMatrix4(enemysReto[i].matrixWorld);
      }
    }

    for (let i = 0; i < enemysReto2.length; i++) {
      if (enemysReto2[i] !== null) {
        enemysReto2BB[i]
          .copy(enemysReto2[i].geometry.boundingBox)
          .applyMatrix4(enemysReto2[i].matrixWorld);
      }
    }

    for (let i = 0; i < enemysDiagonal.length; i++) {
      if (enemysDiagonal[i] !== null) {
        enemysDiagonalBB[i]
          .copy(enemysDiagonal[i].geometry.boundingBox)
          .applyMatrix4(enemysDiagonal[i].matrixWorld);
      }
    }

    for (let i = 0; i < enemysDiagonal2.length; i++) {
      if (enemysDiagonal2[i] !== null) {
        enemysDiagonal2BB[i]
          .copy(enemysDiagonal2[i].geometry.boundingBox)
          .applyMatrix4(enemysDiagonal2[i].matrixWorld);
      }
    }

    for (let i = 0; i < groundEnemys.length; i++) {
      if (groundEnemys[i] !== null) {
        groundEnemysBB[i]
          .copy(groundEnemys[i].geometry.boundingBox)
          .applyMatrix4(groundEnemys[i].matrixWorld);
      }
    }

    if (
      plane1.position.z > 300 ||
      plane2.position.z > 300 ||
      plane3.position.z > 300
    ) {
      planoInfinito();
      auxiliarPosCamera++;
    }

    //GAMEPLAY
    if (planeaux.position.z > 300 + 20 * auxiliarEnemy1) {
      //console.log(planeaux.position.z);
      createEnemy();
      auxiliarEnemy1++;
    }
    if (planeaux.position.z > 300 + 80 * auxiliarCura) {
      createObjetoCura();
      auxiliarCura++;
    }
    if (planeaux.position.z > 300 + 100 * auxiliarEnemy2) {
      //createGroundEnemy();
      createGroundEnemy();
      createEnemyDiagonal2();
      createEnemyReto2();
      auxiliarEnemy2++;
    }
    if (planeaux.position.z > 800 + 40 * auxiliarEnemy3) {
      createEnemyDiagonal();
      createEnemyReto();
      auxiliarEnemy3++;
    }

    for (let i = 0; i < enemys.length; i++) {
      if (enemys[i] !== null) {
        if (enemys[i].position.z > cameraHolder.position.z + 120) {
          scene.remove(enemys[i]);
          enemys[i] = null;
          enemysBB[i] = null;
        }
      }
    }

    for (let i = 0; i < enemysReto.length; i++) {
      if (enemysReto[i] !== null) {
        if (enemysReto[i].position.x > cameraHolder.position.x + 180) {
          scene.remove(enemysReto[i]);
          enemysReto[i] = null;
          enemysRetoBB[i] = null;
        }
      }
    }

    for (let i = 0; i < enemysReto2.length; i++) {
      if (enemysReto2[i] !== null) {
        if (enemysReto2[i].position.x < cameraHolder.position.x - 180) {
          scene.remove(enemysReto2[i]);
          enemysReto2[i] = null;
          enemysReto2BB[i] = null;
        }
      }
    }

    for (let i = 0; i < objetoCura.length; i++) {
      if (objetoCura[i] !== null) {
        if (objetoCura[i].position.z > cameraHolder.position.z + 120) {
          scene.remove(objetoCura[i]);
          objetoCura[i] = null;
          //console.log(objetoCura);
          objetoCuraBB[i] = null;
        }
      }
    }

    for (let i = 0; i < enemysDiagonal.length; i++) {
      if (enemysDiagonal[i] !== null) {
        if (enemysDiagonal[i].position.x > cameraHolder.position.x + 120) {
          scene.remove(enemysDiagonal[i]);
          enemysDiagonal[i] = null;
          enemysDiagonalBB[i] = null;
        }
      }
    }

    for (let i = 0; i < enemysDiagonal2.length; i++) {
      if (enemysDiagonal2[i] !== null) {
        if (enemysDiagonal2[i].position.x < cameraHolder.position.x - 120) {
          scene.remove(enemysDiagonal2[i]);
          enemysDiagonal2[i] = null;
          enemysDiagonal2BB[i] = null;
        }
      }
    }

    for (let i = 0; i < groundEnemys.length; i++) {
      if (groundEnemys[i] !== null) {
        if (groundEnemys[i].position.z > cameraHolder.position.z + 120) {
          scene.remove(groundEnemys[i]);
          groundEnemys[i] = null;
          groundEnemysBB[i] = null;
        }
      }
    }
  }
}

function removeInimigo(i) {
  scene.remove(enemys[i]);
  scene.remove(enemysBB[i]);
  enemys[i] = null;
  enemysBB[i] = null;
  limpavetor();
  auxAnimation = true;
  auxColision = true;
}

function removeInimigoReto(i) {
  scene.remove(enemysReto[i]);
  scene.remove(enemysRetoBB[i]);
  enemysReto[i] = null;
  enemysRetoBB[i] = null;
  limpavetor();
  auxAnimation = true;
  auxColision = true;
}

function removeInimigoReto2(i) {
  scene.remove(enemysReto2[i]);
  scene.remove(enemysReto2BB[i]);
  enemysReto2[i] = null;
  enemysReto2BB[i] = null;
  limpavetor();
  auxAnimation = true;
  auxColision = true;
}

function removeInimigoDiagonal(i) {
  scene.remove(enemysDiagonal[i]);
  scene.remove(enemysDiagonalBB[i]);
  enemysDiagonal[i] = null;
  enemysDiagonalBB[i] = null;
  limpavetor();
  auxAnimation = true;
  auxColision = true;
}

function removeInimigoDiagonal2(i) {
  scene.remove(enemysDiagonal2[i]);
  scene.remove(enemysDiagonal2BB[i]);
  enemysDiagonal2[i] = null;
  enemysDiagonal2BB[i] = null;
  limpavetor();
  auxAnimation = true;
  auxColision = true;
}

function removeInimigoChao(i) {
  scene.remove(groundEnemys[i]);
  scene.remove(groundEnemysBB[i]);
  groundEnemys[i] = null;
  groundEnemysBB[i] = null;
  limpavetor();
  auxAnimation = true;
}

function removeObjetoCura(i) {
  scene.remove(objetoCura[i]);
  scene.remove(objetoCuraBB[i]);
  objetoCura[i] = null;
  objetoCuraBB[i] = null;
  limpavetor();
  auxAnimation = true;
}

function animationEndGame() {
  gameover = true;
  //keyboardUpdate(gameover);
  explode(aviao);
  //aviao.rotateZ(70);
  //aviao.rotateY(40);
  setInterval(aviaoMorte, 500);
}

function aviaoMorte() {
  scene.remove(aviao);
  if (animationOn === true) {
    alert("Fim de jogo");
  }
  animationOn = false;
}

function Venceu() {
  scene.remove(aviao);
  if (animationOn === true) {
    alert("Você venceu!");
  }
  animationOn = false;
}

function limpavetor() {
  for (let i = 0; i < enemys.length; i++) {
    if (enemys[i] === null) {
      enemys.splice(i, 1);
      enemysBB.splice(i, 1);
    }
  }
  for (let i = 0; i < groundEnemys.length; i++) {
    if (groundEnemys[i] === null) {
      groundEnemys.splice(i, 1);
      groundEnemysBB.splice(i, 1);
    }
  }
  for (let i = 0; i < enemyTiros.length; i++) {
    if (enemyTiros[i] === null) {
      enemyTiros.splice(i, 1);
      enemyTirosBB.splice(i, 1);
    }
  }
  for (let i = 0; i < groundTiros.length; i++) {
    if (groundTiros[i] === null) {
      groundTiros.splice(i, 1);
      groundTirosBB.splice(i, 1);
    }
  }
  for (let i = 0; i < enemysReto.length; i++) {
    if (enemysReto[i] === null) {
      enemysReto.splice(i, 1);
      enemysRetoBB.splice(i, 1);
    }
  }

  for (let i = 0; i < enemysReto2.length; i++) {
    if (enemysReto2[i] === null) {
      enemysReto2.splice(i, 1);
      enemysReto2BB.splice(i, 1);
    }
  }
  for (let i = 0; i < enemysDiagonal.length; i++) {
    if (enemysDiagonal[i] === null) {
      enemysDiagonal.splice(i, 1);
      enemysDiagonalBB.splice(i, 1);
    }
  }
  for (let i = 0; i < enemysDiagonal2.length; i++) {
    if (enemysDiagonal2[i] === null) {
      enemysDiagonal2.splice(i, 1);
      enemysDiagonal2BB.splice(i, 1);
    }
  }
  for (let i = 0; i < objetoCura.length; i++) {
    if (objetoCura[i] === null) {
      objetoCura.splice(i, 1);
      objetoCuraBB.splice(i, 1);
    }
  }
}

let auxColision = true;

function checkCollision() {
  //colisao entre o aviao e os inimigos verticais
  for (let i = 0; i < enemys.length; i++) {
    if (enemys[i] !== null) {
      if (aviaoBB.intersectsBox(enemysBB[i]) && auxColision === true) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        //scene.remove(enemys[i]);
        //enemys[i] = null;
        //enemysBB[i] = null;
        auxColision = false;
        explode(enemys[i]);
        if (hp === 0) {
          animationEndGame();
        }

        //enemys[i].rotateZ(70);
        //enemys[i].rotateY(40);
        if (auxAnimation === true) {
          setTimeout(() => removeInimigo(i), 500);
          auxAnimation = false;
          break;
        }
      }
    }
  }
  //colisao entre o aviao e os inimigos horizontais
  for (let i = 0; i < enemysReto.length; i++) {
    if (enemysReto[i] !== null) {
      if (aviaoBB.intersectsBox(enemysRetoBB[i]) && auxColision === true) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        //scene.remove(enemysReto[i]);
        //enemysReto[i] = null;
        //enemysRetoBB[i] = null;
        auxColision = false;
        explode(enemysReto[i]);
        if (hp === 0) {
          animationEndGame();
        }
        //enemysReto[i].rotateZ(70);
        //enemysReto[i].rotateY(40);
        if (auxAnimation === true) {
          setTimeout(() => removeInimigoReto(i), 500);
          auxAnimation = false;
          break;
        }
      }
    }
  }
  for (let i = 0; i < enemysReto2.length; i++) {
    if (enemysReto2[i] !== null) {
      if (aviaoBB.intersectsBox(enemysReto2BB[i]) && auxColision === true) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        //scene.remove(enemysReto2[i]);
        //enemysReto2[i] = null;
        //enemysReto2BB[i] = null;
        auxColision = false;
        explode(enemysReto2[i]);
        if (hp === 0) {
          animationEndGame();
        }
        //enemysReto[i].rotateZ(70);
        //enemysReto[i].rotateY(40);
        if (auxAnimation === true) {
          setTimeout(() => removeInimigoReto2(i), 500);
          auxAnimation = false;
          break;
        }
      }
    }
  }
  // colisao entre o aviao e os inimigos diagonais
  for (let i = 0; i < enemysDiagonal.length; i++) {
    if (enemysDiagonal[i] !== null) {
      if (aviaoBB.intersectsBox(enemysDiagonalBB[i]) && auxColision === true) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        //scene.remove(enemysDiagonal[i]);
        //enemysDiagonal[i] = null;
        //enemysDiagonalBB[i] = null;
        auxColision = false;
        explode(enemysDiagonal[i]);
        if (hp === 0) {
          animationEndGame();
        }
        //enemysDiagonal[i].rotateZ(70);
        //enemysDiagonal[i].rotateY(40);
        if (auxAnimation === true) {
          setTimeout(() => removeInimigoDiagonal(i), 500);
          auxAnimation = false;
          break;
        }
      }
    }
  }
  for (let i = 0; i < enemysDiagonal2.length; i++) {
    if (enemysDiagonal2[i] !== null) {
      if (aviaoBB.intersectsBox(enemysDiagonal2BB[i]) && auxColision === true) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        //scene.remove(enemysDiagonal2[i]);
        //enemysDiagonal2[i] = null;
        //enemysDiagonal2BB[i] = null;
        auxColision = false;
        explode(enemysDiagonal2[i]);
        if (hp === 0) {
          animationEndGame();
        }
        //enemysDiagonal[i].rotateZ(70);
        //enemysDiagonal[i].rotateY(40);
        if (auxAnimation === true) {
          setTimeout(() => removeInimigoDiagonal2(i), 500);
          auxAnimation = false;
          break;
        }
      }
    }
  }

  //colisao tiros inimigos e aviao
  for (let i = 0; i < enemyTiros.length; i++) {
    if (enemyTiros[i] !== null) {
      if (aviaoBB.intersectsSphere(enemyTirosBB[i])) {
        if (hp === -1) {
          break;
        } else {
          hp--;
        }

        scene.remove(enemyTiros[i]);
        enemyTiros[i] = null;
        enemyTirosBB[i] = null;
        if (hp === 0) {
          animationEndGame();
        }
      }
    }
  }

  for (let i = 0; i < groundTiros.length; i++) {
    if (groundTiros[i] !== null) {
      if (aviaoBB.intersectsSphere(groundTirosBB[i])) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        scene.remove(groundTiros[i]);
        groundTiros[i] = null;
        groundTirosBB[i] = null;
        if (hp === 0) {
          animationEndGame();
        }
      }
    }
  }

  //colisao tiros aviao com inimigos aereos verticais
  for (let i = 0; i < enemys.length; i++) {
    if (enemys[i] !== null) {
      for (let j = 0; j < 20; j++) {
        if (enemysBB[i].intersectsSphere(tirosBB[j])) {
          explode(enemys[i]);
          //enemys[i].rotateZ(70);
          //enemys[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigo(i), 500);
            auxAnimation = false;
            break;
          }
        }
      }
    }
  }

  //colisao tiros aviao com inimigos aereos horizontais
  for (let i = 0; i < enemysReto.length; i++) {
    if (enemysReto[i] !== null) {
      for (let j = 0; j < 20; j++) {
        if (enemysRetoBB[i].intersectsSphere(tirosBB[j])) {
          explode(enemysReto[i]);
          //enemysReto[i].rotateZ(70);
          //enemysReto[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoReto(i), 500);
            auxAnimation = false;
            break;
          }
        }
      }
    }
  }
  for (let i = 0; i < enemysReto2.length; i++) {
    if (enemysReto2[i] !== null) {
      for (let j = 0; j < 20; j++) {
        if (enemysReto2BB[i].intersectsSphere(tirosBB[j])) {
          explode(enemysReto2[i]);
          //enemysReto2[i].rotateZ(70);
          //enemysReto2[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoReto2(i), 500);
            auxAnimation = false;
            break;
          }
        }
      }
    }
  }

  //colisao tiros aviao com inimigos aereos diagonais
  for (let i = 0; i < enemysDiagonal.length; i++) {
    if (enemysDiagonal[i] !== null) {
      for (let j = 0; j < 20; j++) {
        if (enemysDiagonalBB[i].intersectsSphere(tirosBB[j])) {
          explode(enemysDiagonal[i]);
          //enemysDiagonal[i].rotateZ(70);
          //enemysDiagonal[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoDiagonal(i), 500);
            auxAnimation = false;
            break;
          }
        }
      }
    }
  }
  for (let i = 0; i < enemysDiagonal2.length; i++) {
    if (enemysDiagonal2[i] !== null) {
      for (let j = 0; j < 20; j++) {
        if (enemysDiagonal2BB[i].intersectsSphere(tirosBB[j])) {
          explode(enemysDiagonal2[i]);
          //enemysDiagonal2[i].rotateZ(70);
          //enemysDiagonal2[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoDiagonal2(i), 500);
            auxAnimation = false;
            break;
          }
        }
      }
    }
  }

  //colisao misseis aviao com inimigos terrestres
  for (let i = 0; i < groundEnemys.length; i++) {
    if (groundEnemys[i] !== null) {
      for (let j = 0; j < 20; j++) {
        if (groundEnemysBB[i].intersectsSphere(misseisBB[j])) {
          explode(groundEnemys[i]);
          //groundEnemys[i].rotateZ(70);
          //groundEnemys[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoChao(i), 500);
            auxAnimation = false;
            break;
          }
        }
      }
    }
  }
  //colisao com o objeto cura aviao
  for (let i = 0; i < objetoCura.length; i++) {
    if (objetoCura[i] !== null) {
      if (aviaoBB.intersectsSphere(objetoCuraBB[i])) {
        if (hp === -1) {
          break;
        }
        if (hp === 5) {
          removeObjetoCura(i);
          break;
        } else {
          hp++;
          removeObjetoCura(i);
        }

        //scene.remove(objetoCura[i]);
        //objetoCura[i] = null;
        //objetoCuraBB[i] = null;
      }
    }
  }
}

function criaIconeVida() {
  let materialObjetoCura = new THREE.MeshLambertMaterial({
    color: "red",
  });

  let cilindro = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.4, 32));

  let cruz1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.5));

  let cruz2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.5));

  cilindro.position.set(0, 0, 0);
  cruz1.position.set(0, 0, 0);
  cruz2.rotateY(1.57);
  cruz2.position.set(0, 0, 0);

  cruz1.matrixAutoUpdate = false;
  cruz1.updateMatrix();

  cruz2.matrixAutoUpdate = false;
  cruz2.updateMatrix();

  let cilindroCSG = CSG.fromMesh(cilindro);
  let cruz1CSG = CSG.fromMesh(cruz1);
  let cruz2CSG = CSG.fromMesh(cruz2);

  let cruzCompleta = cruz1CSG.union(cruz2CSG);
  let objetoFinal = cilindroCSG.subtract(cruzCompleta);

  let objetoCurar = CSG.toMesh(objetoFinal, new THREE.Matrix4());
  objetoCurar.material = materialObjetoCura;
  return objetoCurar;
}

function createObjetoCura() {
  objetoCura.push(criaIconeVida());
  let posicaoX = getRandomArbitrary(-50, 50);
  objetoCura[objetoCura.length - 1].position.set(posicaoX, 30, -150);
  objetoCura[objetoCura.length - 1].rotateX(1.57);
  scene.add(objetoCura[objetoCura.length - 1]);
  objetoCura[objetoCura.length - 1].castShadow = true;
  //objetoCuraBB.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
  objetoCuraBB.push(
    new THREE.Sphere(objetoCura[objetoCura.length - 1].position, 2.5)
  );

  //objetoCuraBB[objetoCuraBB.length - 1].setFromObject(objetoCura[objetoCura.length - 1]);
}

function controlledRender() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  // Set main viewport
  renderer.setViewport(0, 0, width, height); // Reset viewport
  renderer.setScissorTest(false); // Disable scissor to paint the entire window
  renderer.render(scene, camera);

  // Set virtual camera viewport
  var offset = -90;
  renderer.setViewport(offset, height - vcHeidth - offset, vcWidth, vcHeidth); // Set virtual camera viewport
  renderer.setScissor(offset, height - vcHeidth - offset, vcWidth, vcHeidth); // Set scissor with the same size as the viewport
  renderer.setScissorTest(true); // Enable scissor to paint only the scissor are (i.e., the small viewport)
  //renderer.clear();
  renderer.render(scene2, virtualCamera); // Render scene of the virtual camera
}

function render() {
  if (pause === false) {
    jogo();

    water.material.uniforms["time"].value += 0.01;
    for (let i = 0; i < enemys.length; i++) {
      if (enemys[i] !== null) {
        enemys[i].translateZ(getRandomArbitrary(0.2, 1));
      }
    }
    for (let i = 0; i < groundEnemys.length; i++) {
      if (groundEnemys[i] !== null) {
        groundEnemys[i].translateZ(getRandomArbitrary(0.2, 1));
      }
    }
    for (let i = 0; i < enemysReto.length; i++) {
      if (enemysReto[i] !== null) {
        enemysReto[i].translateX(getRandomArbitrary(0.2, 1));
      }
    }
    for (let i = 0; i < enemysReto2.length; i++) {
      if (enemysReto2[i] !== null) {
        enemysReto2[i].translateX(-0.5);
      }
    }
    for (let i = 0; i < enemysDiagonal.length; i++) {
      if (enemysDiagonal[i] !== null) {
        enemysDiagonal[i].translateX(0.5);
        enemysDiagonal[i].translateZ(0.5);
      }
    }
    for (let i = 0; i < enemysDiagonal2.length; i++) {
      if (enemysDiagonal2[i] !== null) {
        enemysDiagonal2[i].translateX(-0.5);
        enemysDiagonal2[i].translateZ(0.5);
      }
    }

    for (let i = 0; i < objetoCura.length; i++) {
      if (objetoCura[i] !== null) {
        objetoCura[i].translateY(0.5);
      }
    }
    if (hp === 5) {
      scene2.add(life[0]);
      scene2.add(life[1]);
      scene2.add(life[2]);
      scene2.add(life[3]);
      scene2.add(life[4]);
    } else if (hp === 4) {
      scene2.remove(life[0]);
      scene2.add(life[1]);
      scene2.add(life[2]);
      scene2.add(life[3]);
      scene2.add(life[4]);
    } else if (hp === 3) {
      scene2.remove(life[0]);
      scene2.remove(life[1]);
      scene2.add(life[2]);
      scene2.add(life[3]);
      scene2.add(life[4]);
    } else if (hp === 2) {
      scene2.remove(life[0]);
      scene2.remove(life[1]);
      scene2.remove(life[2]);
      scene2.add(life[3]);
      scene2.add(life[4]);
    } else if (hp === 1) {
      scene2.remove(life[0]);
      scene2.remove(life[1]);
      scene2.remove(life[2]);
      scene2.remove(life[3]);
      scene2.add(life[4]);
    } else if (hp === 0) {
      scene2.remove(life[0]);
      scene2.remove(life[1]);
      scene2.remove(life[2]);
      scene2.remove(life[3]);
      scene2.remove(life[4]);
    }
    checkCollision();
  }
  setTimeout(function () {
    Venceu();
    gameover = true;
    //keyboardUpdate(gameover);
  }, 120000);
  controls.update();
  trackballControls.update();
  updatePlayer();
  executeIfKeyPressed();
  //keyboardUpdate(gameover);
  requestAnimationFrame(render);
  //renderer.render(scene, camera); // Render scene
  controlledRender();
  limpavetor();
}
