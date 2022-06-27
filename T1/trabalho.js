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

//Camera virtual para a viewport
var camPosition = new THREE.Vector3(0, -200, 30);
var vcWidth = 400;
var vcHeidth = 300;
var virtualCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  300
);
virtualCamera.position.copy(camPosition);
scene.add(virtualCamera);

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

// Use this to show information onscreen
var controls = new InfoBox();
controls.add("TRABALHO CG - GRUPO 13");
controls.addParagraph();
controls.add("Use keyboard to interact:");
controls.add("* UP button to translate forward");
controls.add("* DOWN button to translate back");
controls.add("* LEFT button to translate on left direction");
controls.add("* RIGHT button to translate on right direction");
controls.addParagraph();
controls.add("* SPACE button to simple shot.");
controls.add("* CTRL button to ground bomb.");
controls.add("* G button to 'God Mode'.");
controls.show();

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
dirLight.shadow.bias = -0.05;

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
        child.receiveShadow = true;
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
var sphereMaterial = new THREE.MeshLambertMaterial({ color: "rgb(0,0,0)" });
var sphereMaterial2 = new THREE.MeshLambertMaterial({
  color: "rgb(255, 255, 255)",
});
var sphereMaterial3 = new THREE.MeshLambertMaterial({ color: "rgb(255,0,0)" });

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
let auxiliarEnemy4 = 1;
let auxiliarEnemy5 = 1;
let auxiliarEnemy6 = 1;

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

render();
//criando auxiliares para os tiros
let shoot = true;
let shootM = true;
let cadencia = 4;

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
          if (qntdTiro === 19) {
            qntdTiro = 0;
          }
          qntdTiro++;
        }, 1000 / cadencia);
      }
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
      objEnemy.scale.set(0.7, 0.7, 0.7);
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
    "./assets/aviao2.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(0.7, 0.7, 0.7);
      objEnemy.rotateY(1.5);
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

function createEnemyReto2() {
  enemysReto2.push(new THREE.Mesh(geometryEnemy, materialEnemy));
  loader.load(
    "./assets/aviao2.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(0.7, 0.7, 0.7);
      objEnemy.rotateY(-1.5);
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
    "./assets/aviao2.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(0.7, 0.7, 0.7);
      objEnemy.rotateY(1);
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
    "./assets/aviao2.glb",
    function (gltf) {
      var objEnemy = gltf.scene;
      objEnemy.name = "Inimigo1";
      objEnemy.visible = true;
      objEnemy.castShadow = true;
      objEnemy.scale.set(0.7, 0.7, 0.7);
      objEnemy.rotateY(-1);
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
  tiroInimigo.lookAt(aviao.position);
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
      objEnemy.translateY(-4);
      objEnemy.scale.set(3, 3, 3);
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
  let posicaoX = getRandomArbitrary(-90, 90);
  let posicaoZ = cameraHolder.position.z - 280;

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
    if (planeaux.position.z > 300 + 40 * auxiliarEnemy1) {
      //console.log(planeaux.position.z);
      console.log(planeaux.position.z);
      createEnemy();
      createEnemyReto();
      createGroundEnemy();
      createGroundEnemy();
      auxiliarEnemy1++;
    }
    if (planeaux.position.z > 300 + 200 * auxiliarCura) {
      createObjetoCura();
      auxiliarCura++;
    }
    if (planeaux.position.z > 300 + 100 * auxiliarEnemy2) {
      createEnemy();
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
}

function removeInimigoReto(i) {
  scene.remove(enemysReto[i]);
  scene.remove(enemysRetoBB[i]);
  enemysReto[i] = null;
  enemysRetoBB[i] = null;
  limpavetor();
  auxAnimation = true;
}

function removeInimigoReto2(i) {
  scene.remove(enemysReto2[i]);
  scene.remove(enemysReto2BB[i]);
  enemysReto2[i] = null;
  enemysReto2BB[i] = null;
  limpavetor();
  auxAnimation = true;
}

function removeInimigoDiagonal(i) {
  scene.remove(enemysDiagonal[i]);
  scene.remove(enemysDiagonalBB[i]);
  enemysDiagonal[i] = null;
  enemysDiagonalBB[i] = null;
  limpavetor();
  auxAnimation = true;
}

function removeInimigoDiagonal2(i) {
  scene.remove(enemysDiagonal2[i]);
  scene.remove(enemysDiagonal2BB[i]);
  enemysDiagonal2[i] = null;
  enemysDiagonal2BB[i] = null;
  limpavetor();
  auxAnimation = true;
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

function checkCollision() {
  //colisao entre o aviao e os inimigos verticais
  for (let i = 0; i < enemys.length; i++) {
    if (enemys[i] !== null) {
      if (aviaoBB.intersectsBox(enemysBB[i])) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
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
  //colisao entre o aviao e os inimigos horizontais
  for (let i = 0; i < enemysReto.length; i++) {
    if (enemysReto[i] !== null) {
      if (aviaoBB.intersectsBox(enemysRetoBB[i])) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        scene.remove(enemysReto[i]);
        enemysReto[i] = null;
        enemysRetoBB[i] = null;
        if (hp === 0) {
          animationEndGame();
        }
      }
    }
  }
  for (let i = 0; i < enemysReto2.length; i++) {
    if (enemysReto2[i] !== null) {
      if (aviaoBB.intersectsBox(enemysReto2BB[i])) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        scene.remove(enemysReto2[i]);
        enemysReto2[i] = null;
        enemysReto2BB[i] = null;
        if (hp === 0) {
          animationEndGame();
        }
      }
    }
  }
  // colisao entre o aviao e os inimigos diagonais
  for (let i = 0; i < enemysDiagonal.length; i++) {
    if (enemysDiagonal[i] !== null) {
      if (aviaoBB.intersectsBox(enemysDiagonalBB[i])) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        scene.remove(enemysDiagonal[i]);
        enemysDiagonal[i] = null;
        enemysDiagonalBB[i] = null;
        if (hp === 0) {
          animationEndGame();
        }
      }
    }
  }
  for (let i = 0; i < enemysDiagonal2.length; i++) {
    if (enemysDiagonal2[i] !== null) {
      if (aviaoBB.intersectsBox(enemysDiagonal2BB[i])) {
        if (hp === -1) {
          break;
        }
        if (hp === 1) {
          hp--;
        } else {
          hp = hp - 2;
        }

        scene.remove(enemysDiagonal2[i]);
        enemysDiagonal2[i] = null;
        enemysDiagonal2BB[i] = null;
        if (hp === 0) {
          animationEndGame();
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

  //colisao tiros aviao com inimigos aereos verticais
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

  //colisao tiros aviao com inimigos aereos horizontais
  for (let i = 0; i < enemysReto.length; i++) {
    if (enemysReto[i] !== null) {
      for (let j = 0; j < 20; j++) {
        if (enemysRetoBB[i].intersectsSphere(tirosBB[j])) {
          enemysReto[i].rotateZ(70);
          enemysReto[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoReto(i), 200);
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
          enemysReto2[i].rotateZ(70);
          enemysReto2[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoReto2(i), 200);
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
          enemysDiagonal[i].rotateZ(70);
          enemysDiagonal[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoDiagonal(i), 200);
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
          enemysDiagonal2[i].rotateZ(70);
          enemysDiagonal2[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoDiagonal2(i), 200);
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
          groundEnemys[i].rotateZ(70);
          groundEnemys[i].rotateY(40);
          if (auxAnimation === true) {
            setTimeout(() => removeInimigoChao(i), 200);
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
  renderer.render(scene, virtualCamera); // Render scene of the virtual camera
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

  setTimeout(function () {
    Venceu();
    gameover = true;
    keyboardUpdate(gameover);
  }, 120000);
  checkCollision();
  requestAnimationFrame(render);
  // controlledRender();
  keyboardUpdate(gameover);
  renderer.render(scene, camera); // Render scene
  limpavetor();
}
