const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.querySelector("#game-screen-div").appendChild( renderer.domElement );

renderer.setPixelRatio( 0.4 );

var level;
loadOBJ('lvl', 'resources/models/', scene, 

	function(object, texture)
	{
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		object.position.y = -1;
	}

	);

//camera.position.z = 6;

camera.rotation.y = 1.5 * Math.PI;

// Update loop

var step = 0;

window.addEventListener( 'resize', onWindowResize, false );

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

	if(step == 1)
	{
		Game_PlayerUpdate(step);
		step = 0;
	}
	else if(step == -1)
	{
		Game_PlayerUpdate(step);
		step = 0;
	}
	else if(step == 2)
	{
		//camera.rotation.y -= 1.5 * Math.PI;
		Game_PlayerUpdate(step);
		step = 0;
	}

	else if(step == -2)
	{
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
	else if(value == 'girar a la izquierda')
		step = 2;
	else if(value == 'girar a la derecha')
		step = -2;
}

function Game_PlayerUpdate(step)
{
	var direction = new THREE.Vector3();
	camera.getWorldDirection( direction );

	direction.x *= 2;
	direction.y *= 2;
	direction.z *= 2;

	var start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
	var playerPosition = start;

	if(step == 1)
	{
		var playerTween = new TWEEN.Tween(playerPosition)
			.to({ x: start.x + direction.x, y: start.y + direction.y, z: start.z + direction.z }, 200)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				camera.position.x = playerPosition.x;
				camera.position.y = playerPosition.y;
				camera.position.z = playerPosition.z;
				console.log(camera.position);
			})
			.start();
	}
	else if(step == -1)
	{
		var playerTween = new TWEEN.Tween(playerPosition)
			.to({ x: start.x - direction.x, y: start.y - direction.y, z: start.z - direction.z }, 200)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				camera.position.x = playerPosition.x;
				camera.position.y = playerPosition.y;
				camera.position.z = playerPosition.z;
				console.log(camera.position);
			})
			.start();
	}
	else if(step == 2)
	{
		var playerRotation = { x: 0, y: 0 };
		playerRotation.y = camera.rotation.y;

		var playerTween = new TWEEN.Tween(playerRotation)
			.to({ x: playerRotation.x, y: playerRotation.y + (0.5 * Math.PI) }, 200)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				camera.rotation.y = playerRotation.y;
				console.log(camera.rotation);
			})
			.start();
	}
	else if(step == -2)
	{
		var playerRotation = { x: 0, y: 0 };
		playerRotation.y = camera.rotation.y;

		var playerTween = new TWEEN.Tween(playerRotation)
			.to({ x: playerRotation.x, y: playerRotation.y - (0.5 * Math.PI) }, 200)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				camera.rotation.y = playerRotation.y;
				console.log(camera.rotation);
			})
			.start();
	}
}
