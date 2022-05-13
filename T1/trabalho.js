import * as THREE from  'three';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneWired,
        createGroundPlaneXZ} from "../libs/util/util.js";
import createAviao from './criarAviao.js';
import KeyboardState from '../libs/util/KeyboardState.js';


var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var keyboard = new KeyboardState();
var clock = new THREE.Clock();
var camera = initCamera(new THREE.Vector3(0, 90, 40)); // Init camera in this position
let cont = 0;
initDefaultBasicLight(scene);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane1 = createGroundPlaneWired(200, 300, 10, 10, "rgb(0,0,0)");
let plane2 = createGroundPlaneWired(200, 300, 10, 10, "rgb(250,250,250)");
let plane3 = createGroundPlaneWired(200, 300, 10, 10, "rgb(80,70,100)");
scene.add(plane1);
scene.add(plane2);
scene.add(plane3);
plane2.translateY(300);
plane3.translateY(600);

// create a cube
var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
cameraHolder.translateY( 0 );
// position the cube

let aviao = createAviao()
scene.add(aviao);
function keyboardUpdate() {

  keyboard.update();

  var speed = 100;
  var moveDistance = speed * clock.getDelta();

  // Keyboard.pressed - execute while is pressed
  if ( keyboard.pressed("A") )  aviao.translateX( -moveDistance );
  if ( keyboard.pressed("D") )  aviao.translateX(  moveDistance );
  if ( keyboard.pressed("W") )  aviao.translateY(  moveDistance );
  if ( keyboard.pressed("S") )  aviao.translateY( -moveDistance );

}

let velocidade = -0.2;
let animationOn = true;
//

function andarCamera() {
  if(animationOn){
    cameraHolder.translateZ(velocidade);
    aviao.translateY(-velocidade);
    //plane.translateY(0.2)
    
  }
}
setInterval(planoInfinito, 25200);
function planoInfinito(){
    if(cont === 0){
      plane1.translateY(900)
      
    }else if(cont === 1){
      plane2.translateY(900);
    }else if(cont === 2){
      plane3.translateY(900);
    }
    cont++;
    if(cont === 3){
      cont = 0;
    }
}
 


// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
  andarCamera();
  requestAnimationFrame(render);
  keyboardUpdate();
  renderer.render(scene, camera) // Render scene
  
}

