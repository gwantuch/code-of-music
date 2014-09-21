require.config({
    baseUrl: './',
    paths: {
        "Tone" : "../libs/Tone.js/Tone"
    }
});

require(["Tone/core/Tone", "Tone/instrument/FMSynth", "Tone/core/Transport", "Tone/component/Meter", "js/Widgets", 
	"Tone/instrument/preset/FMSynth.preset", "js/libs/music"], function(Tone, Oscillator, Transport, Meter, Widgets, Preset, Notes){
	var checkboxes = [];
	var indicators = [];
	var steps = [];
	var stepNum = 0;
	var referenceFreq = 49;

	var music = new Music(referenceFreq);
	for(var note = 0; note < 8; note++){
		steps[note] = music.snapToNote( ( Math.random() * 100 ), 0, 400 );
	}

	var synth = new Tone.FMSynth();
	synth.setPreset("Trumpet");
	synth.setVolume(-10);
	synth.toMaster();

	for (var name in synth.preset){
		console.log(name);
	}

	// Tone.Transport.setLoopEnd = '1m';
	Tone.Transport.loop = true;
	//this will start the player on every eigth note
	Tone.Transport.setInterval(function(time){
		$(".Lit").removeClass("Lit");
		//light up the new one
		indicators[stepNum].addClass("Lit");
		stepNum++;
		stepNum = stepNum % 8;
		//get the current column
		for (var i = 0; i < checkboxes.length; i++){
			var box = checkboxes[stepNum];
			if (box.isChecked()){
			    synth.triggerAttackRelease(steps[stepNum], "16n");
			}
		}
	}, "16n");

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

	function makeIndicator(){
		for (var beat = 0; beat < 8; beat++){
			var indicator = $("<div>", {"class" : "Indicator"}).appendTo(sequencer);
			indicators.push(indicator);
		}
		sequencer.append("<br><br>");
	}	

	function makeCheckboxes(){
		// for (var row = 0; row < 4; row++){
		// 	checkboxes[row] = [];
			for (var beat = 0; beat < 8; beat++){
				var checkbox = new GUI.Checkbox(sequencer, function(){}, Math.round(steps[beat]) + "hz", Math.round(steps[beat]) + "hz");
				checkboxes.push(checkbox);
				//randomly set some as checked initially
				if (Math.random() < 0.25){
					checkbox.check(true);
				}
			}
			sequencer.append("<br>");
		// }
	}

	makeIndicator();
	makeCheckboxes();
	// startCheckbox.disable();
});