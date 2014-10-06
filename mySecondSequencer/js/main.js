require.config({
    baseUrl: './',
    paths: {
        "Tone" : "../libs/Tone.js/Tone"
    }
});

require(["Tone/core/Tone", "Tone/instrument/FMSynth", "Tone/core/Transport", "Tone/component/Meter", "js/Widgets", 
	"Tone/instrument/preset/FMSynth.preset", "js/libs/music", "js/libs/three"], function(Tone, Oscillator, Transport, Meter, Widgets, Preset, Notes){
		var camera, scene, renderer; 
		var width = window.innerWidth;
		var height = window.innerHeight;

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		scene.add(camera);
		camera.position.set(0, 0, 100);

		renderer = new THREE.WebGLRenderer();
  		renderer.setSize( window.innerWidth, window.innerHeight );

		$('#Container').append(renderer.domElement);

		var steps = [];
		var cubeStep = [];
		var stepNum = 0;
		var referenceFreq = 49;
  		var numSteps = 8;

  		function makeCubeSteps () {
			for (var step = 0; step < numSteps; step++){
				var cubeGeometry = new THREE.CubeGeometry(10,10,10);
				var cubeMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x777777 } );
				cubeStep.push(new THREE.Mesh(cubeGeometry, cubeMaterial));
				cubeStep[step].position.x = 40 + step * -10;
				scene.add(cubeStep[step]);
			}
  		}

		// function makeCheckboxes(){
		// 	// for (var row = 0; row < 4; row++){
		// 	// 	checkboxes[row] = [];
		// 		for (var beat = 0; beat < 8; beat++){
		// 			var checkbox = new GUI.Checkbox(sequencer, function(){}, Math.round(steps[beat]) + "hz", Math.round(steps[beat]) + "hz");
		// 			checkboxes.push(checkbox);
		// 			//randomly set some as checked initially
		// 			if (Math.random() < 0.25){
		// 				checkbox.check(true);
		// 			}
		// 		}
		// 		sequencer.append("<br>");
		// 	// }
		// }


		var music = new Music(referenceFreq);
		for(var note = 0; note < 8; note++){
			steps[note] = music.snapToNote( ( Math.random() * 100 ), 0, 400 );
		}

		var synth = new Tone.FMSynth();
		synth.setPreset("Trumpet");
		synth.setVolume(-10);
		synth.toMaster();

		// for (var name in synth.preset){
		// 	console.log(name);
		// }

		// Tone.Transport.setLoopEnd = '1m';
		Tone.Transport.loop = true;
		//this will start the player on every eigth note
		Tone.Transport.setInterval(function(time){			
			// $(".Lit").removeClass("Lit");
			//light up the new one
			// indicators[stepNum].addClass("Lit");
			stepNum++;
			stepNum = stepNum % 8;
			for(var i = 0; i < cubeStep.length; i++){
				if(i == stepNum){
					cubeStep[i].position.y = 20;
					cubeStep[i].material.color.setHex(0x00ff00);
				}
				else{
					cubeStep[i].position.y = 0;
					cubeStep[i].material.color.setHex(0x777777);
				}
			}
			//get the current column
			// for (var i = 0; i < checkboxes.length; i++){
			// 	var box = checkboxes[stepNum];
			// 	if (box.isChecked()){
			synth.triggerAttackRelease(steps[stepNum], "16n");
			// 	}
			// }
		}, "16n");

		Tone.Transport.setBpm( 90 );

		//start the Transport for the events to start
		var startButton = $("#StartButton");
		var startCheckbox = new GUI.Checkbox(startButton, function(on){
			if (on){
				Tone.Transport.start();
			} else {
				Tone.Transport.stop();
			}
		}, "start", "stop");

		var sequencer = $("#Sequencer"); 

		// function makeIndicator(){
		// 	for (var beat = 0; beat < 8; beat++){
		// 		var indicator = $("<div>", {"class" : "Indicator"}).appendTo(sequencer);
		// 		indicators.push(indicator);
		// 	}
		// 	sequencer.append("<br><br>");
		// }	

		// makeIndicator();
		// startCheckbox.disable();
		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		function animate () {
			requestAnimationFrame( animate );
			renderer.render(scene,camera);
			// console.log('rendering');
			console.log(Tone.Transport.toSeconds());
		}
		
		window.addEventListener( 'resize', onWindowResize, false );


		makeCubeSteps();
		animate();

});