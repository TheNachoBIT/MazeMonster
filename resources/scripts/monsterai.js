function SpawnMonster(x, y, z, func)
{
	const loader = new THREE.TextureLoader();
	var monsterObj;
	loader.load(
		// resource URL
		'resources/models/monster1.png',
	
		// onLoad callback
		function ( texture ) {
			// in this example we create the material when the texture is loaded

			const geometry = new THREE.PlaneGeometry( 1, 1 );
			const material = new THREE.MeshBasicMaterial( {
				side: THREE.DoubleSide,
				map: texture,
				transparent: true
			 } );
			const monster = new THREE.Mesh( geometry, material );
			monster.position.x = x;
			monster.position.y = y;
			monster.position.z = z;
			monster.rotation.y = -1.5;
			monster.scale.x = monster.scale.y = 2;
			scene.add( monster );
			monster.name = "Monster";
			func(monster, material.map);
		},
	
		// onProgress callback currently not supported
		undefined,
	
		// onError callback
		function ( err ) {
			console.error( 'An error happened: ' + err );
		}
	);
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

var is_monster_going_front = true, make_fair_move_for_player = false, wait_for_unleash_tick = 0;
function SetMonsterPos(monster, getAnticipatedCamera, currentCamera)
{
	var canMakeMove = false;
	const rndInt = randomIntFromInterval(1, 20);
	if(rndInt > 15)
		canMakeMove = true;
	else if(rndInt < 15 && rndInt > 12)
	{
		SpawnDialogue("Rex ha pasado muy cerca...", "color: rgb(255, 100, 100)");
	}

	if(canMakeMove)
	{
		SpawnDialogue("Rex te ha visto!", "color: rgb(255, 100, 100)");
		var camDir = new THREE.Vector3();
		getAnticipatedCamera.getWorldDirection(camDir);
	
		var backCamDir = new THREE.Vector3(-camDir.x, -camDir.y, -camDir.z);
	
		var raycastFrontPos = new THREE.Vector3(getAnticipatedCamera.position.x, getAnticipatedCamera.position.y, getAnticipatedCamera.position.z);
		var raycastBackPos = new THREE.Vector3(getAnticipatedCamera.position.x, getAnticipatedCamera.position.y, getAnticipatedCamera.position.z);
	
		var frontHit = 0, backHit = 0;
		var recursionFC = 0, recursionBC = 0;
		while(frontHit == 0 && recursionFC < 20)
		{
			var PMFrontRay = new THREE.Raycaster()
			PMFrontRay.set(raycastFrontPos, camDir);
			PMFrontRay.far = 1.2;
			const frontIntersects = PMFrontRay.intersectObjects(scene.children);
	
			for ( let i = 0; i < frontIntersects.length; i ++ ) 
			{
				if(frontIntersects[i].name != "Monster")
				{
					frontHit = 1;
					console.log("Monster Front Hit!");
				}
			}
	
			if(frontHit == 0)
			{
				raycastFrontPos = new THREE.Vector3(raycastFrontPos.x + (camDir.x * 2), raycastFrontPos.y + (camDir.y * 2), raycastFrontPos.z + (camDir.z * 2));
				//console.log(raycastFrontPos);
				recursionFC++;
			}
		}
	
		while(backHit == 0 && recursionBC < 20)
		{
			var PMBackRay = new THREE.Raycaster();
			PMBackRay.set(raycastBackPos, backCamDir);
			PMBackRay.far = 1.2;
			const backIntersects = PMBackRay.intersectObjects(scene.children);
	
			for ( let i = 0; i < backIntersects.length; i ++ ) 
			{
				if(backIntersects[i].name != "Monster")
				{
					backHit = 1;
					console.log("Monster Back Hit!");
				}
			}
	
			if(backHit == 0)
			{
				raycastBackPos = new THREE.Vector3(raycastBackPos.x + (backCamDir.x * 2), raycastBackPos.y + (backCamDir.y * 2), raycastBackPos.z + (backCamDir.z * 2));
				recursionBC++;
			}
		}
	
		if(frontHit != 0 || backHit != 0)
		{
			wait_for_unleash_tick = 0;
			make_fair_move_for_player = false;
			var monsterNextPos = monster.position;
			if(recursionFC > recursionBC && recursionFC != 0)
			{
				monster.position.x = raycastFrontPos.x;
				monster.position.y = raycastFrontPos.y;
				monster.position.z = raycastFrontPos.z;
				is_monster_going_front = false;

				if(recursionFC < 3)
					make_fair_move_for_player = true;
			}
			else if(recursionFC <= recursionBC && recursionBC != 0)
			{
				monster.position.x = raycastBackPos.x;
				monster.position.y = raycastBackPos.y;
				monster.position.z = raycastBackPos.z;
				is_monster_going_front = true;

				if(recursionBC < 3)
					make_fair_move_for_player = true;
			}
		
			monster.rotation.y = getAnticipatedCamera.rotation.y;
	
			//if(monster.position.x == getAnticipatedCamera.position.x && 
			//	monster.position.y == getAnticipatedCamera.position.y &&
			//	monster.position.z == getAnticipatedCamera.position.z)
			//{
			//	monster.position.y += 2000;
			//}
	
			//console.log(monster.position);
			//console.log(getAnticipatedCamera.position);
			//console.log(getAnticipatedCamera.rotation);
			//console.log(currentCamera);
		}
	}
}


var monster_tick = 0;

function BGTween(lvl, getMonster)
{
	var bgColor = { r: scene.background.r, g: scene.background.g, b:scene.background.b, fogSize: scene.fog.far };
	var colorlvl5 = { r: 1, g: 1, b: 1, fogSize: 7 };
	var colorlvl4 = { r: 1, g: 0.75, b: 0.75, fogSize: 6.5 };
	var colorlvl3 = { r: 1, g: 0.50, b: 0.50, fogSize: 6 };
	var colorlvl2 = { r: 1, g: 0.25, b: 0.25, fogSize: 5.5 };
	var colorlvl1 = { r: 1, g: 0, b: 0, fogSize: 5 };

	var endColor;
	if(lvl == 5)
		endColor = colorlvl5;
	else if(lvl == 4)
		endColor = colorlvl4;
	else if(lvl == 3)
		endColor = colorlvl3;
	else if(lvl == 2)
		endColor = colorlvl2;
	else if(lvl == 1)
		endColor = colorlvl1

	var colorTween = new TWEEN.Tween(bgColor)
			.to(endColor, 200)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				scene.background.r = bgColor.r;
				scene.background.g = bgColor.g;
				scene.background.b = bgColor.b;

				scene.fog.color.r = bgColor.r;
				scene.fog.color.b = bgColor.b;
				scene.fog.color.g = bgColor.g;

				scene.fog.far = bgColor.fogSize;

				monster.material.color.r = bgColor.r;
				monster.material.color.g = bgColor.g;
				monster.material.color.b = bgColor.b;
			})
			.start();
}

function MoveMonsterUpdate(monster, getPlayerCamera, speed)
{
	if(wait_for_unleash_tick > 600)
	{
		make_fair_move_for_player = false;
		wait_for_unleash_tick = 0;
	}
	else
		wait_for_unleash_tick++;

	if(make_fair_move_for_player == false && monster)
	{
		if(is_monster_going_front == true)
			monster.translateZ(speed);
		else
			monster.translateZ(-speed);

		monster.position.y = 0;
	
		if(monster_tick == 10)
		{
			monster.material.map.wrapS = THREE.RepeatWrapping;
	
			if(monster.material.map.repeat.x == 1)
				monster.material.map.repeat.x = -1;
			else
				monster.material.map.repeat.x = 1;
	
			monster_tick = 0;
	
			var distanceBetween = getPlayerCamera.position.distanceTo(monster.position);
			console.log(distanceBetween);
			
			if(distanceBetween > 10)
			{
				BGTween(5, monster);
			}
			else if(distanceBetween < 10 && distanceBetween > 7)
			{
				screenShake.shake( camera, new THREE.Vector3(0, 0.01, 0), 50 );
				BGTween(4, monster);
			}
			else if(distanceBetween < 7 && distanceBetween > 5)
			{
				screenShake.shake( camera, new THREE.Vector3(0, 0.05, 0), 50 );
				BGTween(3, monster);
			}
			else if(distanceBetween < 5 && distanceBetween > 2)
			{
				screenShake.shake( camera, new THREE.Vector3(0, 0.1, 0), 50 );
				BGTween(2, monster);
			}
			else if(distanceBetween < 2)
			{
				screenShake.shake( camera, new THREE.Vector3(0, 0.5, 0), 50 );
				BGTween(1, monster);
			}

			if(distanceBetween < 0.15)
				Game_Over();
		}

		if(monster_tick == 5)
		{
			camera.position.y = 0;
		}

		monster_tick++;
	}
}

let game_screen_div = document.querySelector("#game-screen-div");
function Monster_EffectController()
{

}