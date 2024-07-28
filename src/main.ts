import './style.css'
import * as THREE from 'three'

/*** Development Mode Only ***/
/**
 * Theatre.js
 */
import studio from '@theatre/studio'
import { getProject, types } from '@theatre/core'
studio.initialize()   /** alt + \ + . */
/*** Development Mode Only ***/

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

////////////////////////////////////////////////////////////
// Create a project for the animation
const project = getProject('THREE.js x Theatre.js')

// Create a sheet
const sheet = project.sheet('Animated scene')

// Play the animation on repeat
project.ready.then(() => sheet.sequence.play({ iterationCount: Infinity }))
////////////////////////////////////////////////////////////

/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  10,
  200,
)

camera.position.z = 50

/**
 * Scene
 */

const scene = new THREE.Scene()

/*
 * TorusKnot
 */
const geometry = new THREE.TorusKnotGeometry(10, 3, 300, 16)
const material = new THREE.MeshStandardMaterial({color: '#f00'})
material.color = new THREE.Color('#049ef4')
material.roughness = 0.5

const mesh = new THREE.Mesh(geometry, material)
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)

////////////////////////////////////////////////////////////
// Create a Theatre.js object with the props you want to
// animate
const torusKnotObj = sheet.object('Torus Knot', {
  // Note that the rotation is in radians
  // (full rotation: 2 * Math.PI)
  rotation: types.compound({
    x: types.number(mesh.rotation.x, { range: [-2, 2] }),
    y: types.number(mesh.rotation.y, { range: [-2, 2] }),
    z: types.number(mesh.rotation.z, { range: [-2, 2] }),
  }),
})

torusKnotObj.onValuesChange((values) => {
  const { x, y, z } = values.rotation

  mesh.rotation.set(x * Math.PI, y * Math.PI, z * Math.PI)
})

// Directional light THREE.js object
const animatedDirectionalLight = new THREE.DirectionalLight('#ff0000')
animatedDirectionalLight.intensity = 30
scene.add(animatedDirectionalLight)

// Directional light Theatre.js object
const animatedDirectionalLightObj = sheet.object('Directional Light', {
  intensity: types.number(
    animatedDirectionalLight.intensity, // initial value
    { range: [0, 30] }, // options for prop number
  ),
})

animatedDirectionalLightObj.onValuesChange((values) => {
  // update THREE.js object based on Theatre.js values
  animatedDirectionalLight.intensity = values.intensity
})
////////////////////////////////////////////////////////////

/*
 * Lights
 */

// Ambient Light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Point light
const directionalLight = new THREE.DirectionalLight('#ff0000', 30 /* , 0, 1 */)
directionalLight.position.y = 20
directionalLight.position.z = 20

directionalLight.castShadow = true

directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.far = 50
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.camera.bottom = -20
directionalLight.shadow.camera.left = -20

scene.add(directionalLight)

// RectAreaLight
const rectAreaLight = new THREE.RectAreaLight('#ff0', 1, 50, 50)

rectAreaLight.position.z = 10
rectAreaLight.position.y = -40
rectAreaLight.position.x = -20
rectAreaLight.lookAt(new THREE.Vector3(0, 0, 0))

scene.add(rectAreaLight)

// Dev helper
const lightHelper = new THREE.DirectionalLightHelper(directionalLight)
const animatedLightHelper = new THREE.DirectionalLightHelper(animatedDirectionalLight)
const gridHelper = new THREE.GridHelper(200, 50)
scene.add(lightHelper, animatedLightHelper, gridHelper)

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({antialias: true})

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

// Mouse cursor control
const controls = new OrbitControls(camera, renderer.domElement)

// MapHelpers and random add geometries
function addStar() {
  const geometry = new THREE.TorusGeometry()
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFEE })
  const star = new THREE.Mesh(geometry, material)

  // float spread goes -100 to +100
  const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100))
  star.position.set(x, y, z)
  scene.add(star)
}
Array(200).fill().forEach(addStar)

document.body.appendChild(renderer.domElement)

/**
 * Update the screen
 */
function tick(): void {
  renderer.render(scene, camera)

  controls.update()
  window.requestAnimationFrame(tick)
}

tick()

/**
 * Handle `resize` events
 */
window.addEventListener(
  'resize',
  function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  },
  false,
)
