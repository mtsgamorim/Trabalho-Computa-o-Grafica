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


var textureLoader = new THREE.TextureLoader();
var floor = textureLoader.load('../assets/textures/marble.png');

var planeGeometry = new THREE.PlaneGeometry(4.0, 4.0, 10, 10);
var planeMaterial = new THREE.MeshLambertMaterial({color:"rgb(255,255,255)",side:THREE.DoubleSide});
planeMaterial.map = floor;
var plane1 = new THREE.Mesh(planeGeometry, planeMaterial);
var plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
var plane3 = new THREE.Mesh(planeGeometry, planeMaterial);
var plane4 = new THREE.Mesh(planeGeometry, planeMaterial);
var plane5 = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane1);
plane1.add(plane2);
plane1.add(plane3);
plane1.add(plane4);
plane1.add(plane5);
plane2.translateX(2)
plane2.translateZ(2)
plane2.rotateY(1.55)
plane3.translateX(-2)
plane3.translateZ(2)
plane3.rotateY(1.55)
plane4.translateY(2)
plane4.translateZ(2)
plane4.rotateX(1.55)
plane5.translateY(-2)
plane5.translateZ(2)
plane5.rotateX(1.55)


plane1.translateZ(-2)
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