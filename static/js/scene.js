// if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var camera, scene, renderer, controls, viewport;

init();

function init(arr) {

	viewport = document.getElementById("viewport");
	

	camera = new THREE.PerspectiveCamera( 70, viewport.clientWidth / viewport.clientHeight, 1, 1000 );
	camera.position.z = 50;
	camera.lookAt(new THREE.Vector3());

	controls = new THREE.OrbitControls( camera, viewport);
	controls.addEventListener( 'change', render );

	scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight( 0x111111 ) );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.125 );

	directionalLight.position.x = 1.0;
	directionalLight.position.y = 1.0;
	directionalLight.position.z = 1.0;

	directionalLight.position.normalize();

	scene.add( directionalLight );

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( viewport.clientWidth, viewport.clientHeight);
	renderer.setClearColor( 0x202020, 1);

	viewport.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
	render();
}


var wireframe;
var mesh;

function reset(){
	scene.remove(mesh); 
	scene.remove(wireframe); 
	viewport.removeChild(viewport.childNodes[0]); 
	init();
}

function toMesh(arr){
	var geometry = new THREE.Geometry();
	var vcount = 0;

	for (var i = 0; i < arr.length-1; i=i+16) {

		geometry.vertices.push( 
			new THREE.Vector3( 
				parseFloat(arr[i]), 
				parseFloat(arr[i+1]), 
				parseFloat(arr[i+2])
				)
		 );
		geometry.vertices.push( 
			new THREE.Vector3( 
				parseFloat(arr[i+3]), 
				parseFloat(arr[i+4]), 
				parseFloat(arr[i+5])
				)
		 );
		geometry.vertices.push( 
			new THREE.Vector3( 
				parseFloat(arr[i+6]), 
				parseFloat(arr[i+7]), 
				parseFloat(arr[i+8])
				)
		);
		vcount += 3;

		geometry.faces.push( new THREE.Face3( vcount-3, vcount-2, vcount-1) );

	}


	var material = new THREE.MeshLambertMaterial( { color: 0xffffff, emissive:0xffffff, side:THREE.DoubleSide  } );

	geometry.mergeVertices();
	geometry.computeFaceNormals();
	geometry.computeBoundingSphere();

	mesh = new THREE.Mesh( geometry, material );

	mesh.scale.x = 10;
	mesh.scale.y = 10;
	mesh.scale.z = 10;

	wireframe = new THREE.EdgesHelper( mesh, 0x000000, 1E-5);

	scene.add( mesh );
	scene.add( wireframe );

	controls.target.copy( mesh.position );
	render();
}

function onWindowResize() {

	camera.aspect = viewport.innerWidth / viewport.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( viewport.innerWidth, viewport.innerHeight );

	render();
}


function animate() {
	requestAnimationFrame( animate );
	controls.update();
}

function render() { 
	renderer.render( scene, camera );
}