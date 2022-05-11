import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js'
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera, 
        degreesToRadians, 
        onWindowResize,
        createGroundPlaneXZ,
        initDefaultBasicLight} from "../libs/util/util.js";

var stats = new Stats();          // To show FPS information
var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(5, 5, 7)); // Init camera in this position
var trackballControls = new TrackballControls( camera, renderer.domElement );
initDefaultBasicLight(scene);

// Set angles of rotation
var caminhar = 0.08;
var speed = 0.0002;
var animationOn = false; // control if animation is on or of

// Show world axes
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

let plane = createGroundPlaneXZ(10, 10)
scene.add(plane);

// Base sphere
var sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
var sphereMaterial = new THREE.MeshPhongMaterial( {color:'rgb(180,180,255)'} );
var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
var sphere2 = new THREE.Mesh( sphereGeometry, sphereMaterial );
scene.add(sphere);
scene.add(sphere2);
// Set initial position of the sphere
sphere.translateX(-4.8).translateY(0.2).translateZ(2.0);
sphere2.translateX(-4.8).translateY(0.2).translateZ(-2.0);


// More information about cylinderGeometry here ---> https://threejs.org/docs/#api/en/geometries/CylinderGeometry


// Rede cylinder


// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

buildInterface();
render();

function  andarBolinha1(){
    if(animationOn){
        sphere.translateX(caminhar);
       if(sphere.position.x > 5){
        animationOn = false;
        console.log("entrei!");    
       }
    }
}

function buildInterface()
{
  var controls = new function ()
  {
    this.onBolinha1 = function(){
     animationOn = !animationOn;
      
    };
    this.onBolinha2 = function(){
        animationOn = !animationOn;
    };
    this.reset1 = function(){
        animationOn = !animationOn;
    };

    this.speed = 0.05;

    this.changeSpeed = function(){
      speed = this.speed;
    };
  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, 'onBolinha1',true).name("Esfera 1");
  gui.add(controls, 'onBolinha2',true).name("Esfera 2");
  gui.add(controls, 'reset1',true).name("reset");

  gui.add(controls, 'speed', 0.05, 0.5)
    .onChange(function(e) { controls.changeSpeed() })
    .name("Change Speed");
}

function render()
{
  stats.update(); // Update FPS
  trackballControls.update();
  andarBolinha1();
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}