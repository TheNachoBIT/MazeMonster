function SummonKey(x, y, z, func)
{
	const loader = new THREE.TextureLoader();
	loader.load(
		// resource URL
		'resources/models/key1.png',
	
		// onLoad callback
		function ( texture ) {
			// in this example we create the material when the texture is loaded

			const geometry = new THREE.PlaneGeometry( 1, 1 );
			const material = new THREE.MeshBasicMaterial( {
				side: THREE.DoubleSide,
				map: texture,
				transparent: true
			 } );
			const key = new THREE.Mesh( geometry, material );
			key.position.x = x;
			key.position.y = y;
			key.position.z = z;
			key.rotation.y = -1.5;
			scene.add( key );
			key.name = "Key";
			func(key, material.map);
		},
	
		// onProgress callback currently not supported
		undefined,
	
		// onError callback
		function ( err ) {
			console.error( 'An error happened: ' + err );
		}
	);
}

var openDoorSprite;

function SummonDoor(x, y, z, func)
{
	const loader = new THREE.TextureLoader();
	const openDoorLoader = new THREE.TextureLoader();

	openDoorLoader.load(
		'resources/models/door_open.png',

		function(texture)
		{
			openDoorSprite = texture;
		},

		undefined,
	
		// onError callback
		function ( err ) {
			console.error( 'An error happened: ' + err );
		}
	)

	loader.load(
		// resource URL
		'resources/models/door_close.png',
	
		// onLoad callback
		function ( texture ) {
			// in this example we create the material when the texture is loaded

			const geometry = new THREE.PlaneGeometry( 1, 1 );
			const material = new THREE.MeshBasicMaterial( {
				side: THREE.DoubleSide,
				map: texture,
				transparent: true
			 } );
			const door = new THREE.Mesh( geometry, material );
			door.position.x = x;
			door.position.y = y - 0.2;
			door.position.z = z;
			door.rotation.y = -1.5;
			scene.add( door );

			door.scale.x = 1.5;
			door.scale.y = 2;
			door.scale.z = 1;
			door.name = "Door_Closed";
			func(door, material.map);
		},
	
		// onProgress callback currently not supported
		undefined,
	
		// onError callback
		function ( err ) {
			console.error( 'An error happened: ' + err );
		}
	);

}