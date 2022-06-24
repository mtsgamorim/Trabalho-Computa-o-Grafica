import * as THREE from "three";
import { TrackballControls } from "../build/jsm/controls/TrackballControls.js";
import { ShadowMapViewer } from "../build/jsm/utils/ShadowMapViewer.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  InfoBox,
  onWindowResize,
  createGroundPlaneWired,
  createLightSphere,
  degreesToRadians,
  createGroundPlaneXZ,
} from "../libs/util/util.js";
import createAviao from "./criarAviao.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import { CSG } from "../libs/other/CSGMesh.js";
import { FogExp2, SplineCurve } from "../build/three.module.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";

var scene = new THREE.Scene(); // Create main scene

let renderer = new THREE.WebGLRenderer();
document.getElementById("webgl-output").appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap; // default

var keyboard = new KeyboardState();
var clock = new THREE.Clock();
var camera = initCamera(new THREE.Vector3(0, 80, 120)); // Init camera in this position
camera.up.set(0, 1, 0);
let cont = 0;
let auxAnimation = true;
let gameover = false;
let auxiliarPosCamera = 0;
let hp = 5;
let objetoCura;
criaIconeVida();

//LUZ AMBIENTE
var ambientLight = new THREE.AmbientLight("rgb(60,60,60)");
scene.add(ambientLight);

var lightPosition = new THREE.Vector3(0, 90, 130);

var dirLight = new THREE.DirectionalLight("rgb(255,255,255)");
dirLight.position.copy(lightPosition);
dirLight.castShadow = true;
// Shadow Parameters
dirLight.shadow.mapSize.width = 700;
dirLight.shadow.mapSize.height = 300;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 600;
dirLight.shadow.camera.left = -360;
dirLight.shadow.camera.right = 360;
dirLight.shadow.camera.bottom = -200;
dirLight.shadow.camera.top = 200;
dirLight.shadow.bias = -0.0500;

// No effect on Basic and PCFSoft
dirLight.shadow.radius = 0.2;

// Just for VSM - to be added in threejs.r132
dirLight.shadow.blurSamples = 1;

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane1 = createGroundPlaneWired(700, 300, 10, 10, "rgb(0,128,0)");
plane1.receiveShadow = true;
let plane2 = createGroundPlaneWired(700, 300, 10, 10, "rgb(0,128,0)");
plane2.receiveShadow = true;
let plane3 = createGroundPlaneWired(700, 300, 10, 10, "rgb(0,128,0)");
plane3.receiveShadow = true;
let planeaux = createGroundPlaneWired(700, 300, 10, 10, "rgb(0,0,0)");

scene.add(plane1);
scene.add(plane2);
scene.add(plane3);
scene.add(planeaux);
plane2.translateY(300);
plane3.translateY(600);
planeaux.translateY(-300);

// create a cube for camera
var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
//cameraHolder.add(dirLight);
scene.add(cameraHolder);
scene.add(dirLight);
cameraHolder.translateY(0);

let aviao = createAviao();
scene.add(aviao);
var loader = new GLTFLoader();


loader.load(
  "./assets/aviao.glb",
  function (gltf) {
    var objAviao = gltf.scene;
    objAviao.name = "objAviao";
    objAviao.visible = true;
    objAviao.castShadow = true;
    objAviao.receiveShadow = true;
    objAviao.rotateZ(-1.55);
    objAviao.rotateX(1.5);
    objAviao.traverse(function (child) {
      if (child) {
        child.castShadow = true;
        child.receiveShadow = true
      }
    });

    aviao.add(objAviao);
  },
  null,
  null
);

//criando a BB do aviao
let aviaoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
aviaoBB.setFromObject(aviao);

let veloc = 2;
let veloc2 = 1;

var sphereGeometry = new THREE.SphereGeometry(1, 32, 1);
var sphereMaterial = new THREE.MeshLambertMaterial({ color: "rgb(50,0,80)" });
var sphereMaterial2 = new THREE.MeshLambertMaterial({ color: "rgb(255, 255, 255)" });

let qntdTiro = 0;
let qntdTiro2 = 0;
let tiros = [];
let tirosBB = [];
let misseis = [];
let misseisBB = [];
let enemyTiros = [];
let enemyTirosBB = [];

for (let i = 0; i < 20; i++) {
  tiros[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);
  //BB
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
var geometryEnemy = new THREE.BoxGeometry(5, 5, 5);
var groundGeometryEnemy = new THREE.BoxGeometry(8, 8, 8);
var materialEnemy = new THREE.MeshLambertMaterial({ color: "rgb(200,0,0)",
visible: false });
var groundMaterialEnemy = new THREE.MeshLambertMaterial({
  color: "rgb(0,0,200)",
  visible: false
});
//var enemy = new THREE.Mesh(geometryEnemy, materialEnemy);
let enemys = [];
let enemysBB = [];

let groundEnemys = [];
let groundEnemysBB = [];

let auxiliarEnemy1 = 1;

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

render();

function keyboardUpdate(gameover) {
  if (gameover === false) {
    keyboard.update();

    var speed = 100;
    var moveDistance = speed * clock.getDelta();

    // Keyboard.pressed - execute while is pressed
    if (keyboard.pressed("left") && aviao.position.x > -80)
      aviao.translateX(-moveDistance);
    if (keyboard.pressed("right") && aviao.position.x < 80)
      aviao.translateX(moveDistance);
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

    if (keyboard.down("space")) {
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
    }

    if (keyboard.down("ctrl")) {
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

    if (keyboard.pressed("G")) {
      hp = -1;
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
    "./assets/aviao2.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(0.7,0.7,0.7);
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
  enemysBB.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
  enemysBB[enemysBB.length - 1].setFromObject(enemys[enemys.length - 1]);
  let posicaoX = getRandomArbitrary(-90, 90);
  let posicaoZ = cameraHolder.position.z - 140;

  enemys[enemys.length - 1].position.set(posicaoX, 30, posicaoZ);
  enemys[enemys.length - 1].castShadow = true;
  enemys[enemys.length - 1].receiveShadow = true;
  scene.add(enemys[enemys.length - 1]);
}

function createGroundEnemy() {
  groundEnemys.push(new THREE.Mesh(groundGeometryEnemy, groundMaterialEnemy));
  loader.load(
    "./assets/toonTank.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.translateY(-4)
      objEnemy.scale.set(3,3,3);
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
  groundEnemysBB[groundEnemys.length - 1].setFromObject(
    enemys[enemys.length - 1]
  );
  let posicaoX = getRandomArbitrary(-90, 90);
  let posicaoZ = cameraHolder.position.z - 140;

  groundEnemys[groundEnemys.length - 1].position.set(posicaoX, 4, posicaoZ);
  groundEnemys[groundEnemys.length - 1].castShadow = true;
  groundEnemys[groundEnemys.length - 1].receiveShadow = true;
  scene.add(groundEnemys[groundEnemys.length - 1]);
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

    for (let j = 0; j < 20; j++) {
      misseis[j].translateZ(-veloc2);
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

    aviaoBB.copy(aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    for (let i = 0; i < enemys.length; i++) {
      if (enemys[i] !== null) {
        enemysBB[i]
          .copy(enemys[i].geometry.boundingBox)
          .applyMatrix4(enemys[i].matrixWorld);
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
    if (planeaux.position.z > 300 + 10 * auxiliarEnemy1) {
      //console.log(planeaux.position.z);
      createEnemy();
      createGroundEnemy();
      auxiliarEnemy1++;
    }
    for (let i = 0; i < enemys.length; i++) {
      if (enemys[i] !== null) {
        if (enemys[i].position.z > cameraHolder.position.z + 90) {
          scene.remove(enemys[i]);
          enemys[i] = null;
          enemysBB[i] = null;
        }
      }
    }

    for (let i = 0; i < groundEnemys.length; i++) {
      if (groundEnemys[i] !== null) {
        if (groundEnemys[i].position.z > cameraHolder.position.z + 90) {
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
}

function animationEndGame() {
  gameover = true;
  keyboardUpdate(gameover);
  aviao.rotateZ(70);
  aviao.rotateY(40);
  setInterval(aviaoMorte, 200);
}

function aviaoMorte() {
  scene.remove(aviao);
  if (animationOn === true) {
    alert("Fim de jogo");
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
}

function checkCollision() {
  //colisao entre o aviao e os inimigos
  for (let i = 0; i < enemys.length; i++) {
    if (enemys[i] !== null) {
      if (aviaoBB.intersectsBox(enemysBB[i])) {
        if (hp === -1) {
          break;
        }
        if(hp === 1){
          hp--;
        }else{
          hp = hp - 2;
        }
        
        scene.remove(enemys[i]);
        enemys[i] = null;
        enemysBB[i] = null;
        if (hp === 0) {
          animationEndGame();
        }
      }
    }
  }

  for (let i = 0; i < enemys.length; i++) {
    if (enemys[i] !== null) {
      for (let j = 0; j < 20; j++) {
        if (enemysBB[i].intersectsSphere(tirosBB[j])) {
          enemys[i].rotateZ(70);
          enemys[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigo(i), 200);
            auxAnimation = false;
            break;
          }
        }
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

  objetoCura = CSG.toMesh(objetoFinal, new THREE.Matrix4());
  objetoCura.material = materialObjetoCura;
  objetoCura.position.set(0, 80, 30);
  objetoCura.rotateX(0.8);
  scene.add(objetoCura);
  objetoCura.castShadow = true;
  let objetoCuraBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
  objetoCuraBB.setFromObject(objetoCura);
}

function render() {
  jogo();
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
  objetoCura.translateZ(0.1);
  checkCollision();
  requestAnimationFrame(render);
  keyboardUpdate(gameover);
  renderer.render(scene, camera); // Render scene
  limpavetor();
}
