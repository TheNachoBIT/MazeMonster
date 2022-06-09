const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.querySelector("#game-screen-div").appendChild( renderer.domElement );

renderer.setPixelRatio( 0.3 );

//let world;
//
//world = new CANNON.World();

var level;
loadOBJ('lvl', 'resources/models/', scene, 

	function(object, texture)
	{
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		object.position.y = -1;
	}

	);

let monster;
SpawnMonster(3, 0, 2000, function(object, texture){
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	monster = object; });

//camera.position.z = 6;

camera.rotation.y = 1.5 * Math.PI;

// Update loop

var step = 0;

console.log(scene.children);

window.addEventListener( 'resize', onWindowResize, false );
document.addEventListener( 'mousemove', onPointerMove );

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function update(time) {
	requestAnimationFrame( update );
	TWEEN.update();

	scene.background = new THREE.Color( 0xffffff );
	scene.fog = new THREE.Fog( 0xffffff, 0.015, 7 ); 

	//cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;

	Game_PlayerUpdate(step);
	step = 0;

	renderer.render( scene, camera );
}
requestAnimationFrame(update);

function Console_KeyEvent(e, input)
{
	var code = (e.keyCode ? e.keyCode : e.which);
	if(code == 13) { //Enter keycode
	    Game_MovePlayer(input.value);
	    input.value = '';
	}
}

function Game_MovePlayer(value)
{
	if(value == 'ir')
		step = 1;
	else if(value == 'atras')
		step = -1;
	else if(value == 'girar izquierda')
		step = 2;
	else if(value == 'girar derecha')
		step = -2;
}

var pointer = new THREE.Vector2();

function onPointerMove( event ) {

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

var frontRaycaster = new THREE.Raycaster();
var backRaycaster = new THREE.Raycaster();

var anticipatedCamera = new THREE.Object3D();
anticipatedCamera.position = camera.position;
anticipatedCamera.rotation = camera.rotation;
console.log("Anticipated Camera: " + anticipatedCamera);

var playerTrigger = { forward: new THREE.Raycaster(), backward: new THREE.Raycaster(), left: new THREE.Raycaster(), right: new THREE.Raycaster() }

var stop_test = 0;
function Player_TriggerUpdate()
{
	var playerPos = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	playerTrigger.forward.set(playerPos, new THREE.Vector3(0, 0, 1));
	//playerTrigger.backward.set(playerPos, new THREE.Vector3(0, 0, -1));
	//playerTrigger.left.set(playerPos, new THREE.Vector3(1, 0, 0));
	//playerTrigger.right.set(playerPos, new THREE.Vector3(-1, 0, 0));

	playerTrigger.forward.far /*= playerTrigger.backward.far = playerTrigger.left.far = playerTrigger.right.far*/ = 0.5;

	const forwardIntersects = playerTrigger.forward.intersectObjects(scene.children);
	//const backwardIntersects = playerTrigger.backward.intersectObjects(scene.children);
	//const leftIntersects = playerTrigger.left.intersectObjects(scene.children);
	//const rightIntersects = playerTrigger.right.intersectObjects(scene.children);

	var intersectedObjs = [];

	for ( let i = 0; i < forwardIntersects.length; i ++ ) 
		intersectedObjs.push(forwardIntersects[i]);

	//for ( let i = 0; i < backwardIntersects.length; i ++ ) 
	//	intersectedObjs.push(backwardIntersects[i]);
//
	//for ( let i = 0; i < leftIntersects.length; i ++ ) 
	//	intersectedObjs.push(leftIntersects[i]);
//
	//for ( let i = 0; i < rightIntersects.length; i ++ ) 
	//	intersectedObjs.push(rightIntersects[i]);

	for ( let i = 0; i < intersectedObjs.length; i ++ )
	{
		if(intersectedObjs[i].object.name == "Monster")
		{
			console.log("Jumpscare! >:D");
		}
	}
}
var enable_monster = 0;
function Game_PlayerUpdate(step)
{

	var direction = new THREE.Vector3();
	camera.getWorldDirection( direction );

	direction.x *= 2;
	direction.y *= 2;
	direction.z *= 2;

	var start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
	var playerPosition = start;

	var startVec = new THREE.Vector3(start.x, start.y, start.z);

	//console.log(raycaster.ray);
	var camDir = new THREE.Vector3();
	camera.getWorldDirection(camDir);

	var backCamDir = new THREE.Vector3(-camDir.x, -camDir.y, -camDir.z);
	frontRaycaster.set(startVec, camDir);
	frontRaycaster.far = 1.2;

	backRaycaster.set(startVec, backCamDir);
	backRaycaster.far = 1.2;

	const frontIntersects = frontRaycaster.intersectObjects(scene.children);
	const backIntersects = backRaycaster.intersectObjects(scene.children);

	var hitsBack = 0, hitsFront = 0;
	for ( let i = 0; i < frontIntersects.length; i ++ ) 
	{
		if(frontIntersects[i].name != "Monster")
			hitsFront = 1;
	}
	for ( let i = 0; i < backIntersects.length; i ++ ) 
	{
		if(backIntersects[i].name != "Monster")
			hitsBack = 1;
	}

	Player_TriggerUpdate();

	if(step == 1)
	{
		if(hitsFront == 0)
		{
			anticipatedCamera.rotation.x = camera.rotation.x;
			anticipatedCamera.rotation.y = camera.rotation.y;
			anticipatedCamera.rotation.z = camera.rotation.z;

			anticipatedCamera.position.x = start.x + direction.x;
			anticipatedCamera.position.y = start.y + direction.y;
			anticipatedCamera.position.z = start.z + direction.z;

			if(enable_monster == 1)
				SetMonsterPos(monster, anticipatedCamera, camera);

			var playerTween = new TWEEN.Tween(playerPosition)
				.to({ x: start.x + direction.x, y: start.y + direction.y, z: start.z + direction.z }, 200)
				.easing(TWEEN.Easing.Quadratic.Out)
				.onUpdate(() => {
					camera.position.x = playerPosition.x;
					camera.position.y = playerPosition.y;
					camera.position.z = playerPosition.z;
				})
				.start();
		}
	}
	else if(step == -1)
	{
		if(hitsBack == 0)
		{
			anticipatedCamera.rotation.x = camera.rotation.x;
			anticipatedCamera.rotation.y = camera.rotation.y;
			anticipatedCamera.rotation.z = camera.rotation.z;

			anticipatedCamera.position.x = start.x - direction.x;
			anticipatedCamera.position.y = start.y - direction.y;
			anticipatedCamera.position.z = start.z - direction.z;

			if(enable_monster == 1)
				SetMonsterPos(monster, anticipatedCamera, camera);

			var playerTween = new TWEEN.Tween(playerPosition)
				.to({ x: start.x - direction.x, y: start.y - direction.y, z: start.z - direction.z }, 200)
				.easing(TWEEN.Easing.Quadratic.Out)
				.onUpdate(() => {
					camera.position.x = playerPosition.x;
					camera.position.y = playerPosition.y;
					camera.position.z = playerPosition.z;
				})
				.start();
		}
	}
	else if(step == 2)
	{
		var playerRotation = { x: 0, y: 0 };
		playerRotation.y = camera.rotation.y;

		anticipatedCamera.rotation.y = camera.rotation.y + (0.5 * Math.PI);

		if(enable_monster == 1)
			SetMonsterPos(monster, anticipatedCamera, camera);

		var playerTween = new TWEEN.Tween(playerRotation)
			.to({ x: playerRotation.x, y: playerRotation.y + (0.5 * Math.PI) }, 200)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				camera.rotation.y = playerRotation.y;
			})
			.start();
	}
	else if(step == -2)
	{
		var playerRotation = { x: 0, y: 0 };
		playerRotation.y = camera.rotation.y;

		anticipatedCamera.rotation.y = camera.rotation.y - (0.5 * Math.PI);

		if(enable_monster == 1)
			SetMonsterPos(monster, anticipatedCamera, camera);

		var playerTween = new TWEEN.Tween(playerRotation)
			.to({ x: playerRotation.x, y: playerRotation.y - (0.5 * Math.PI) }, 200)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				camera.rotation.y = playerRotation.y;
			})
			.start();
	}
}
