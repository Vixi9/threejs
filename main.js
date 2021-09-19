import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

let scene, camera, renderer, controls;
let sun, car, terrain1, terrain2;

init();
animate();

function init() {
  // Textures
  const textureLoader = new THREE.TextureLoader();
  const height = textureLoader.load('assets/height.png');

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.y = 1.5;
  camera.rotation.x = -0.1

  // Render
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.localClippingEnabled = true;

  // Clipping
  const localPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 50 );
  
  // Sun
  sun = new THREE.Mesh(new THREE.CircleGeometry(10, 50, 0, Math.PI), new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color(0xFF71CE)
      },
      color2: {
        value: new THREE.Color(0xFFFB96)
      }
    },
    vertexShader: `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
      }
    `,
  }));
  
  sun.position.z = -50;
  scene.add(sun);
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
  scene.add(ambientLight);
  
  // Terrain
  const terrainGeometry = new THREE.PlaneBufferGeometry(50, 50, 25, 25);
  const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF71CE,
      wireframe: true,
      displacementMap: height,
      displacementScale: 5,
      clippingPlanes: [ localPlane ],
  });
  terrain1 = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain1.rotation.x = Math.PI / 2;
  terrain1.rotation.y = Math.PI;
  terrain1.position.z = -25;

  terrain2 = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain2.rotation.x = Math.PI / 2;
  terrain2.rotation.y = Math.PI;
  terrain2.position.z = -75;

  scene.add(terrain1, terrain2);

  // Car
  const objLoader = new GLTFLoader();
  objLoader.load('assets/models/testarossa.glb', function( object ) {
    car = object;
    car.scene.position.z = -4;
    car.scene.position.y = 0.15;
    car.scene.rotation.y = Math.PI;
    scene.add(car.scene);
    console.log("Succesfuly loaded 3D models")
  }, 
  function ( xhr ) {
    console.log("Loading 3D models...")
  }, 
  function ( error ) {
    console.log(`Error during 3D models loading : ${error}`)
  });

  // HTML
  document.body.appendChild(renderer.domElement);

  //controls = new OrbitControls(camera, renderer.domElement);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame(animate);

  //controls.update();

  terrain1.position.z += 0.1
  terrain2.position.z += 0.1

  if(terrain1.position.z > 25) {
    terrain1.position.z = -75;
  }

  if(terrain2.position.z > 25) {
    terrain2.position.z = -75;
  }

  render();
}

function render() {
  renderer.render(scene, camera);
}
