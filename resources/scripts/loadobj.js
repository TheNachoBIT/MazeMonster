function loadOBJ(name, dir, scene, func)
{
	var mtlLoader = new THREE.MTLLoader();
	//mtlLoader.setBaseUrl( mtlDir );
	mtlLoader.setPath( dir );

	mtlLoader.load( name + '.mtl', function( materials ) {

    	materials.preload();

    	const loader = new THREE.OBJLoader();
    	loader.setMaterials(materials);
    	loader.setPath(dir);

		// load a resource
		loader.load(
			// resource URL
			name + '.obj',
			// called when resource is loaded
	
			function ( object ) {
				scene.add( object );
				
				for(var i in object.children)
				{
					console.log(object.children[i]);
					var newMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });

					if(object.children[i].material.map)
					{
						newMaterial.map = object.children[i].material.map;
					}

					object.children[i].material = newMaterial;
					func(object.children[i], newMaterial.map);
				}
			},
			// called when loading is in progresses
			function ( xhr ) {
		
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		
			},
			// called when loading has errors
			function ( error ) {
		
				console.log( 'An error happened: ' + error );
		
			}
		);

	});
}