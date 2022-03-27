var scene, cube, camera, renderer, clock, holder, intersects, particles = [];
var level = 1;
var totalLevels = 10;
var score = 0;
var totalTargets = 8;
var speed = 0.001;
var complete = false;
var myLevel = document.getElementById("level");
var myScore = document.getElementById("score");

// funkcijas

function init () {
	scene = new THREE.Scene();
	var width = window.innerWidth;
	var height = window.innerHeight;
	var light = new THREE.AmbientLight(0xffffff);
	camera = new THREE.PerspectiveCamera(120, width/height, 0.5, 1000);
	camera.position.z = 18;

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setSize(width, height);
	document.getElementById("canvas").appendChild(renderer.domElement);
	clock = new THREE.Clock();
	
	var spotL = new THREE.SpotLight(0xffffff);
	spotL.position.set( -100, 100, 100 );
	scene.add(spotL);

	var ambL = new THREE.AmbientLight(0xffffff);
	scene.add(ambL);
}

function spinner () {
	var geometry = new THREE.BoxGeometry(5,5,5);
	var material = new THREE.MeshPhongMaterial( {color: "green", ambient: "green" } );

	var cube = new THREE.Mesh(geometry, material);
	cube.position.x = 2;
	var spinner = new THREE.Object3D();
	spinner.rotation.x = 6;

	spinner.add(cube);
	scene.add(spinner);
}

function addHolder () {
	holder = new THREE.Object3D();
	holder.name = "holder"

	for (var i = 0; i < totalTargets; i++) {
		
		var ranCol = new THREE.Color();
		ranCol.setRGB( Math.random(), Math.random(), Math.random() );

		var geometry = new THREE.BoxGeometry(2,2,2);
		var material = new THREE.MeshPhongMaterial( {color: ranCol, ambient: ranCol } );

		var cube = new THREE.Mesh(geometry, material);
		cube.position.x = i * 2;
		cube.name = "cubeName" + i;

		var spinner = new THREE.Object3D();
		spinner.rotation.x = i*1.5;
		spinner.name = "spinnerName" + i;

		spinner.add(cube);
		holder.add(spinner);
	}
	scene.add(holder);
}

function addExplosion (point) {
	var timeNow = clock.getElapsedTime();

	for (var i = 0; i < 4; i++) {
		var geometry = new THREE.BoxGeometry(1,1,1);
		var material = new THREE.MeshBasicMaterial({color: 0x999999});
		var part = new THREE.Mesh(geometry, material);
		part.position.x = point.x;
		part.position.y = point.y;
		part.position.z = point.z;
		part.name = "part" + i;
		part.birthDay = timeNow;
		scene.add(part);
		particles.push(part);
	}
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render () {		

	holder.children.forEach(function (elem, index, array) {
		elem.rotation.y += (speed * (3-index));
		elem.children[0].rotation.x += 0.01;
		elem.children[0].rotation.y += 0.01;
	});

	if (particles.length > 0) {
		particles.forEach(function (elem, index, array) {
			switch (elem.name) {
				case "part0":
					elem.position.x += 1;
					break;
				case "part1":
					elem.position.x -= 1;
					break;
				case "part2":
					elem.position.y += 1;
					break;
				case "part3":
					elem.position.y -= 1;
					break;
				default:
					break;
			}

			if (elem.birthDay - clock.getElapsedTime() < -1 ) {
				scene.remove(elem);
				particles.splice(index, 1);
			}
		})

	}
	renderer.render(scene, camera);
}

function onDocumentMouseDown(event) {
	event.preventDefault();

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	if (complete) {
		complete = false;
		score = 0;
		nextLevel();
		return;
	}

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	
	if (score < totalTargets) {
		holder.children.forEach(function (elem, index, array) {
			intersects = raycaster.intersectObjects( elem.children );
			if (intersects.length > 0 && intersects[0].object.visible) {
				intersects[0].object.visible = false;

				addExplosion(intersects[0].point);
				score += 1;

				if (score == totalTargets) {

					if (level < totalLevels) {
						// myScore.innerHTML = "<strong>Līmenis pabeigts!</strong> Spiediet, lai turpinātu.";
						complete = false;
						score = 0;
						nextLevel();
						return;
					} else {
						myScore.innerHTML = "<strong>Spēle pabeigta!</strong>";
					}
				};
			}
		});
	} else {
		complete = true;
	}
}

function nextLevel () {
	myScore.innerHTML = "";

	if (level < totalLevels) {
		speed += 0.0001;
		totalTargets += 2;
		level += 1;
	} else {
		speed = 0.001;
		totalTargets = 5;
		level = 1;
	}

	myLevel.innerText = " Līmenis: " + level + " / " + totalLevels;
	scene.remove(holder);
	addHolder();
}

document.getElementById("canvas").addEventListener('mousedown', onDocumentMouseDown, false);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();
}

// Inicializācija
window.onload = function() {
	myLevel.innerText = " Līmenis: " + level + " / " + totalLevels;
	init();
	addHolder();
	animate();

	window.addEventListener( 'resize', onWindowResize, false );
};