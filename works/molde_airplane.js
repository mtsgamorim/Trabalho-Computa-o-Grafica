import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneWired,
        degreesToRadians,
        createGroundPlaneXZ} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
initDefaultBasicLight(scene);
var keyboard = new KeyboardState();
var clock = new THREE.Clock();

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneWired(1000, 1000);
scene.add(plane);

// create the airplane (cone)
var geometry = new THREE.ConeGeometry( 5, 40, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var cone = new THREE.Mesh( geometry, material );

cone.position.set(0, 30, 0);

let angle = degreesToRadians(-90);
cone.rotateX(angle);

scene.add( cone );

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
  trackballControls.update(); // Enable mouse movements
  requestAnimationFrame(render);
  keyboardUpdate();
  renderer.render(scene, camera) // Render scene
}

function keyboardUpdate() {

    keyboard.update();
  
    var speed = 100;
    var moveDistance = speed * clock.getDelta();
  
    // Keyboard.pressed - execute while is pressed
    if ( keyboard.pressed("A") )  cone.translateX( -moveDistance );
    if ( keyboard.pressed("D") )  cone.translateX(  moveDistance );
    if ( keyboard.pressed("W") )  cone.translateY(  moveDistance );
    if ( keyboard.pressed("S") )  cone.translateY( -moveDistance );
  
  }