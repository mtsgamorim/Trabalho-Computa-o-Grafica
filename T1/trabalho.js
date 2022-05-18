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
var camera = initCamera(new THREE.Vector3(0, 140, 40)); // Init camera in this position
let cont = 0;
initDefaultBasicLight(scene);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane1 = createGroundPlaneWired(400, 300, 10, 10, "rgb(0,128,0)");
let plane2 = createGroundPlaneWired(400, 300, 10, 10, "rgb(0,128,0)");
let plane3 = createGroundPlaneWired(400, 300, 10, 10, "rgb(0,128,0)");
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


let veloc = 2;
var sphereGeometry = new THREE.SphereGeometry( 1, 32, 1);
var sphereMaterial = new THREE.MeshNormalMaterial();
let qntdTiro = 0;
let tiros = [];
for(let i = 0; i < 10; i++){
  tiros[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);
}
 var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

function keyboardUpdate() {

  keyboard.update();

  var speed = 100;
  var moveDistance = speed * clock.getDelta();

  // Keyboard.pressed - execute while is pressed
  if ( keyboard.pressed("A") && aviao.position.x > -90)  aviao.translateX( -moveDistance );
  if ( keyboard.pressed("D") && aviao.position.x < 90)  aviao.translateX(  moveDistance );
  if ( keyboard.pressed("W") && aviao.position.z > cameraHolder.position.z - 40)  aviao.translateY(  moveDistance );
  if ( keyboard.pressed("S") && aviao.position.z < cameraHolder.position.z + 50)  aviao.translateY( -moveDistance );

  if (keyboard.down("space")) {
    
    tiros[qntdTiro].position.set(aviao.position.x , aviao.position.y , aviao.position.z )
    scene.add(tiros[qntdTiro]);
    if(qntdTiro === 9){
      qntdTiro = 0;
    }
    qntdTiro++;
    
  } 

}

let velocidade = -0.2;
let animationOn = true;


function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
  // criação inimigo
  var geometryEnemy = new THREE.BoxGeometry(4, 4, 4);
  var materialEnemy = new THREE.MeshLambertMaterial({color:"rgb(200,0,0)"})
  var enemy = new THREE.Mesh(geometryEnemy, materialEnemy);
  var enemy2 = new THREE.Mesh(geometryEnemy, materialEnemy);
  var enemy3 = new THREE.Mesh(geometryEnemy, materialEnemy);
  //criação inimigo
  function enemySpawn() {
    
    let posicaoX = getRandomArbitrary(-52, 52);
    let posicaoZ = cameraHolder.position.z - 45;
    enemy.position.set(posicaoX, 30, posicaoZ);
    scene.add(enemy);
    

  }
  function enemySpawn2() {
    
    let posicaoX = getRandomArbitrary(-52, 52);
    let posicaoZ = cameraHolder.position.z - 45;
    enemy2.position.set(posicaoX, 30, posicaoZ);
    scene.add(enemy2);
    
    
    
  }
  function enemySpawn3() {
    
    let posicaoX = getRandomArbitrary(-52, 52);
    let posicaoZ = cameraHolder.position.z - 45;
    enemy3.position.set(posicaoX, 30, posicaoZ);
    scene.add(enemy3);
  }
 

//
let auxiliarPosCamera = 1;
let auxiliarEnemy1 = 1;
let auxiliarEnemy2 = 1;
let auxiliarEnemy3 = 1;
function andarCamera() {
  if(animationOn){
    cameraHolder.translateZ(velocidade);
    aviao.translateY(-velocidade);
    for(let i = 0; i < 10; i++){
      tiros[i].translateZ(-veloc);
    }
   
    
    if(cameraHolder.position.z < (300 * -auxiliarPosCamera)){
      planoInfinito();
      auxiliarPosCamera++;
    }
    if(cameraHolder.position.z < (40 * -auxiliarEnemy1)){
      enemySpawn();
      
      auxiliarEnemy1++;
    }
    if(cameraHolder.position.z < (70 * -auxiliarEnemy2)){
      enemySpawn2();
      
      auxiliarEnemy2++;
    }
    if(cameraHolder.position.z < (100 * -auxiliarEnemy3)){
      enemySpawn3();
      
      auxiliarEnemy3++;
    }
  }
}

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
  console.log(`Posiçao aviao em y = ${aviao.position.y}`)
  console.log(`Posição da camera = ${cameraHolder.position.z} `)
  enemy.translateZ(getRandomArbitrary(0.4, 2))
  enemy2.translateZ(getRandomArbitrary(0.4, 2))
  enemy3.translateZ(getRandomArbitrary(0.4, 2))
  requestAnimationFrame(render);
  keyboardUpdate();
  renderer.render(scene, camera) // Render scene
}


