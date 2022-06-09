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

function SetMonsterPos(monster, getAnticipatedCamera, currentCamera)
{
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
		var monsterNextPos = monster.position;
		if(recursionFC < recursionBC && recursionFC != 0)
		{
			monster.position.x = raycastFrontPos.x;
			monster.position.y = raycastFrontPos.y;
			monster.position.z = raycastFrontPos.z;
		}
		else if(recursionFC >= recursionBC && recursionBC != 0)
		{
			monster.position.x = raycastBackPos.x;
			monster.position.y = raycastBackPos.y;
			monster.position.z = raycastBackPos.z;
		}
	
		monster.rotation.y = -getAnticipatedCamera.rotation.y;

		//if(monster.position.x == getAnticipatedCamera.position.x && 
		//	monster.position.y == getAnticipatedCamera.position.y &&
		//	monster.position.z == getAnticipatedCamera.position.z)
		//{
		//	monster.position.y += 2000;
		//}

		monster.rotation.y = camera.rotation.y;

		console.log(monster.position);
		console.log(getAnticipatedCamera.position);
		console.log(getAnticipatedCamera.rotation);
		console.log(currentCamera);
	}

}