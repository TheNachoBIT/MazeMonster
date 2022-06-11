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
var getGlobalExit;
loadOBJ('lvl', 'resources/models/', scene, 

	function(object, texture)
	{
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		object.position.y = -1;
		if(object.name == "enable_monster_trigger_Cube")
		{
			console.log("Monster Trigger Found!");
			object.material.opacity = 0;
		}
	}

	);

let monster;
SpawnMonster(3, 0, 2000, function(object, texture){
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	monster = object; });

// Key: -10, 0, 6
SummonKey(-10, 0, 6, function(keyObject, keyTexture)
{
	keyTexture.minFilter = THREE.NearestFilter;
	keyTexture.magFilter = THREE.NearestFilter;
});


// Door: 34, 0, 12
SummonDoor(34, 0, 12, function(doorObject, doorTexture)
{
	doorTexture.minFilter = THREE.NearestFilter;
	doorTexture.magFilter = THREE.NearestFilter;
	getGlobalExit = doorObject;
});

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

scene.background = new THREE.Color( 0xffffff );
scene.fog = new THREE.Fog( 0xffffff, 0.015, 7 ); 

var screenShake = ScreenShake();
var gameLost = false, winGame = 0;
function update(time) 
{
	requestAnimationFrame( update );
	TWEEN.update();

	//cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;

	if(!gameLost && winGame == 0)
	{
		screenShake.update(camera);
		Game_PlayerUpdate(step);
		step = 0;
	}

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
	else if(value == 'izquierda')
		step = 2;
	else if(value == 'derecha')
		step = -2;
}

var pointer = new THREE.Vector2();

function onPointerMove( event ) {

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

var frontRaycaster = new THREE.Raycaster();
var backRaycaster = new THREE.Raycaster();
var canISeeTheMonsterRaycaster = new THREE.Raycaster();

var anticipatedCamera = new THREE.Object3D();
anticipatedCamera.position = camera.position;
anticipatedCamera.rotation = camera.rotation;
console.log("Anticipated Camera: " + anticipatedCamera);

playerTrigger = new THREE.Raycaster();

var stop_test = 0;
var enable_monster = 0;

function Game_Over()
{
	console.log("Jumpscare! >:D");
	document.querySelector("#game-over").style.display = "block";
	gameLost = true;
}

var display_no_exit_dialogue = 0;
function Player_TriggerUpdate()
{	
	var getCamDirForTrigger = new THREE.Vector3();
	camera.getWorldDirection(getCamDirForTrigger);

	playerTrigger = new THREE.Raycaster();
	var getPlayerPositionForTrigger = new THREE.Vector3(camera.position.x - (getCamDirForTrigger.x / 2), 
		camera.position.y - (getCamDirForTrigger.y / 2), 
		camera.position.z - (getCamDirForTrigger.z / 2));
	playerTrigger.far = 0.5;
	playerTrigger.set(getPlayerPositionForTrigger, getCamDirForTrigger);
	//playerTrigger.backward.set(playerPos, new THREE.Vector3(0, 0, -1));
	//playerTrigger.left.set(playerPos, new THREE.Vector3(1, 0, 0));
	//playerTrigger.right.set(playerPos, new THREE.Vector3(-1, 0, 0));

	const forwardIntersects = playerTrigger.intersectObjects(scene.children);

	var intersectedObjs = [];

	for ( let i = 0; i < forwardIntersects.length; i ++ ) 
		intersectedObjs.push(forwardIntersects[i]);

	for ( let i = 0; i < intersectedObjs.length; i ++ )
	{
		if(intersectedObjs[i].object.visible)
		{
			if(intersectedObjs[i].object.name == "Key")
			{
				console.log("Key Grabbed!");
				intersectedObjs[i].object.visible = false;
				getGlobalExit.material.map = openDoorSprite;
				openDoorSprite.minFilter = THREE.NearestFilter;
				openDoorSprite.magFilter = THREE.NearestFilter;
				getGlobalExit.name = "Door_Open";
			}
			else if(intersectedObjs[i].object.name == "enable_monster_trigger_Cube" && enable_monster == 0)
			{
				enable_monster = 1;
				SpawnDialogue("Rex se ha despertado.", "color: rgb(255, 100, 100)");
			}
			else if(intersectedObjs[i].object.name == "Door_Closed")
			{
				if(display_no_exit_dialogue == 0)
				{
					SpawnDialogue("> Necesitas una llave para abrir esta puerta.", "color: rgb(255, 100, 100)");
					display_no_exit_dialogue = 1;
				}
			}
		}
	}
}

var enable_player_trigger = 0;
var i_can_see_the_monster = 0;
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

	canISeeTheMonsterRaycaster.set(startVec, camDir);

	const frontIntersects = frontRaycaster.intersectObjects(scene.children);
	const backIntersects = backRaycaster.intersectObjects(scene.children);
	const myEyeIntersects = canISeeTheMonsterRaycaster.intersectObjects(scene.children);

	var hitsBack = 0, hitsFront = 0;
	for ( let i = 0; i < frontIntersects.length; i ++ ) 
	{
		if(frontIntersects[i].object)
		{
			if(frontIntersects[i].object.name != "Monster" && frontIntersects[i].object.name != "Key" && frontIntersects[i].object.name != "enable_monster_trigger_Cube" && frontIntersects[i].object.name != "Door_Closed")
				hitsFront = 1;
			if(frontIntersects[i].object.name == "Door_Open")
				winGame = 1;
		}

		//console.log(frontIntersects[i]);
	}
	for ( let i = 0; i < backIntersects.length; i ++ ) 
	{
		if(backIntersects[i].object)
		{
			if(backIntersects[i].object.name != "Monster" && backIntersects[i].object.name != "Key" && backIntersects[i].object.name != "enable_monster_trigger_Cube"&& backIntersects[i].object.name != "Door_Closed")
				hitsBack = 1;
			if(backIntersects[i].object.name == "Door_Open")
				winGame = 1;
		}
	}

	for ( let i = 0; i < myEyeIntersects.length; i ++ ) 
	{
		i_can_see_the_monster = 0;
		if(myEyeIntersects[i].object)
		{
			if(myEyeIntersects[i].object.name == "Monster")
			{
				i_can_see_the_monster = 1;
			}
		}
	}

	if(winGame == 1)
	{
		console.log("You win! :D");
		document.querySelector("#win").style.display = "block";
	}

	if(enable_player_trigger > 20)
		Player_TriggerUpdate();
	else
		enable_player_trigger++;

	MoveMonsterUpdate(monster, camera, 0.03);

	if(step == 1)
	{
		if(hitsFront == 0)
		{
			SpawnDialogue("> Haces un paso hacia adelante...", "color: rgb(255, 255, 0)");
			anticipatedCamera.rotation.x = camera.rotation.x;
			anticipatedCamera.rotation.y = camera.rotation.y;
			anticipatedCamera.rotation.z = camera.rotation.z;

			anticipatedCamera.position.x = start.x + direction.x;
			anticipatedCamera.position.y = start.y + direction.y;
			anticipatedCamera.position.z = start.z + direction.z;

			if(enable_monster == 1 && i_can_see_the_monster == 0)
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
			SpawnDialogue("> Haces un paso hacia atras...", "color: rgb(255, 255, 0)");
			anticipatedCamera.rotation.x = camera.rotation.x;
			anticipatedCamera.rotation.y = camera.rotation.y;
			anticipatedCamera.rotation.z = camera.rotation.z;

			anticipatedCamera.position.x = start.x - direction.x;
			anticipatedCamera.position.y = start.y - direction.y;
			anticipatedCamera.position.z = start.z - direction.z;

			if(enable_monster == 1 && i_can_see_the_monster == 0)
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
		SpawnDialogue("> Giras a la izquierda...", "color: rgb(255, 255, 0)");

		var playerRotation = { x: 0, y: 0 };
		playerRotation.y = camera.rotation.y;		

		anticipatedCamera.rotation.y = camera.rotation.y + (0.5 * Math.PI);

		anticipatedCamera.position.x = start.x;
		anticipatedCamera.position.y = start.y;
		anticipatedCamera.position.z = start.z;

		if(enable_monster == 1 && i_can_see_the_monster == 0)
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
		SpawnDialogue("> Giras a la derecha...", "color: rgb(255, 255, 0)");

		var playerRotation = { x: 0, y: 0 };
		playerRotation.y = camera.rotation.y;

		anticipatedCamera.rotation.y = camera.rotation.y - (0.5 * Math.PI);

		anticipatedCamera.position.x = start.x;
		anticipatedCamera.position.y = start.y;
		anticipatedCamera.position.z = start.z;

		if(enable_monster == 1 && i_can_see_the_monster == 0)
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
