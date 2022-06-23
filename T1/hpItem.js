import * as THREE from "three";
import Stats from "../build/jsm/libs/stats.module.js";
import GUI from "../libs/util/dat.gui.module.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import { TrackballControls } from "../build/jsm/controls/TrackballControls.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  createGroundPlaneXZ,
  createLightSphere,
  onWindowResize,
} from "../libs/util/util.js";

import { CSG } from "../libs/other/CSGMesh.js";

var scene = new THREE.Scene(); // Create main scene
var stats = new Stats(); // To show FPS information
var keyboard = new KeyboardState();

var renderer = initRenderer(); // View function in util/utils
renderer.setClearColor("rgb(30, 30, 40)");
var camera = initCamera(new THREE.Vector3(4, 4, 8)); // Init camera in this position
camera.up.set(0, 1, 0);

window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);
let light = initDefaultBasicLight(
  scene,
  true,
  new THREE.Vector3(2.5, 0.7, 4.5),
  28,
  1024
);

let lightPosition = light.position;
let lightSphere = createLightSphere(scene, 0.1, 10, 10, lightPosition);
lightSphere.visible = false;

var groundPlane = createGroundPlaneXZ(20, 20); // width and height (x, y)
groundPlane.position.set(0.0, -2.0, 0.0);
scene.add(groundPlane);

var trackballControls = new TrackballControls(camera, renderer.domElement);

// CRIAÇAO DO OBJETO COMEÇA AQUI

let materialObjetoCura = new THREE.MeshPhongMaterial({
  color: "red",
  shininess: "150",
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

let objetoCura = CSG.toMesh(objetoFinal, new THREE.Matrix4());
objetoCura.material = materialObjetoCura;
objetoCura.position.set(0, 2, 0);
scene.add(objetoCura);

// CRIAÇAO DO OBJETO TERMINA AQUI

buildInterface();
render();

function updateObject(mesh) {
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
}

function buildInterface() {
  var controls = new (function () {
    this.wire = false;

    this.onWireframeMode = function () {
      caneca.material.wireframe = this.wire;
    };
  })();

  // GUI interface
  var gui = new GUI();
  gui
    .add(controls, "wire", false)
    .name("Wireframe")
    .onChange(function (e) {
      controls.onWireframeMode();
    });
}

function keyboardUpdate() {
  keyboard.update();
  if (keyboard.pressed("D")) {
    lightPosition.x += 0.05;
    updateLightPosition();
  }
  if (keyboard.pressed("A")) {
    lightPosition.x -= 0.05;
    updateLightPosition();
  }
  if (keyboard.pressed("W")) {
    lightPosition.y += 0.05;
    updateLightPosition();
  }
  if (keyboard.pressed("S")) {
    lightPosition.y -= 0.05;
    updateLightPosition();
  }
  if (keyboard.pressed("E")) {
    lightPosition.z -= 0.05;
    updateLightPosition();
  }
  if (keyboard.pressed("Q")) {
    lightPosition.z += 0.05;
    updateLightPosition();
  }
}

// Update light position of the current light
function updateLightPosition() {
  light.position.copy(lightPosition);
  lightSphere.position.copy(lightPosition);
  console.log(light.position);
}

function render() {
  stats.update(); // Update FPS
  keyboardUpdate();
  trackballControls.update();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera); // Render scene
}
