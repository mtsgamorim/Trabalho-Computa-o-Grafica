import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
initDefaultBasicLight(scene);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var cylinderGeometry = new THREE.CylinderGeometry( 0.2, 0.2, 3, 32 );
var cubeMaterial = new THREE.MeshLambertMaterial({color:"rgb(200,0,0)"});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
var c1 = new THREE.Mesh(cylinderGeometry, cubeMaterial);
var c2 = new THREE.Mesh(cylinderGeometry, cubeMaterial);
var c3 = new THREE.Mesh(cylinderGeometry, cubeMaterial);
var c4 = new THREE.Mesh(cylinderGeometry, cubeMaterial);
// position the cube
cube.position.set(0.0, 0.15, 0.0);
c1.position.set(0.0, 1.5, 0.0);
c2.position.set(0.0, 1.5, 0.0);
c3.position.set(0.0, 1.5, 0.0);
c4.position.set(0.0, 1.5, 0.0);
cube.scale.set(11,0.3,6);
cube.translateY(3);
c1.translateX(-5.0);
c1.translateZ(-2.5);
c2.translateX(5.0);
c2.translateZ(-2.5);
c3.translateX(-5.0);
c3.translateZ(2.5);
c4.translateX(5.0);
c4.translateZ(2.5);

// add the cube to the scene
scene.add(cube);
scene.add(c1);
scene.add(c2);
scene.add(c3);
scene.add(c4);
// Use this to show information onscreen
var controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
  trackballControls.update(); // Enable mouse movements
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}