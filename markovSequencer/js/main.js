require.config({
    baseUrl: './',
    paths: {
        "Tone" : "../libs/Tone.js/Tone"
    }
});

require(["Tone/core/Tone", "Tone/instrument/FMSynth", "Tone/core/Transport", "Tone/component/Meter", "js/Widgets", 
	"Tone/instrument/preset/FMSynth.preset", "js/libs/music"], function(Tone, Oscillator, Transport, Meter, Widgets, Preset, Notes){
	var referenceFreq = 49;
	var lydian = [0, 0, 0, 1, 0, 0, 0, 0];
	var melodicMinor = [0, 0, -1, 0, 0, 0, 0, 0];

	// for (var name in synth.preset){
	// 	console.log(name);
	// }

	synths = [];

	var Synth = function(preset, baseFreq){
		this.synth = new Tone.FMSynth();
		this.synth.setPreset("Trumpet");
		this.synth.setVolume(-20);
		this.synth.toMaster();

		this.previousNote = 0;

		this.music = new Music(baseFreq);
		this.music.setMode(lydian, "lydian");
	}

	for (var i = 0; i < 4; i++) {
		var octave = Math.round(Math.random()*4);

		synths.push(new Synth("Trumpet", octave*referenceFreq));
	}

	// music.setMode(lydian, "lydian");
	// music.setSeptScale(melodicMinor, "melodicMinor");

	var possibilities = {
		0: [ 3, 4, 'rest' ],
		1: [ 3, 'rest' ],
		2: [ 5, 'rest' ],
		3: [ 2, 4, 7, 1 ],
		4: [ 5, 1, 'rest', 6 ],
		5: [ 4, 'rest' ],
		6: [ 7 ],
		7: [ 0, 6, 4 ],
		'rest': [ 0, 3, 'rest' ]
	};

	var probabilities = {
		0: [ .2, .6, .2 ],
		1: [ .5, .5 ],
		2: [ .5, .5 ],
		3: [ .2, .3, .3, .2 ],
		4: [ .1, .2, .2, .5 ],
		5: [ .25, .75 ],
		6: [ 1 ],
		7: [ .3, .3, .4 ],
		'rest': [ .3, .3, .4 ]
	}

	function generate(step){
		var rand = Math.random();
		var noteIndex;
		var lastProb = 1;

		for(var i = 0; i < possibilities[step].length; i++){
			if(rand < probabilities[step][i] && probabilities[step][i] < lastProb){
				noteIndex = i;
				lastProb = probabilities[step][i];
			} 
		}

		if(noteIndex === undefined) noteIndex = Math.round(Math.random()*(possibilities[step].length - 1));

		return possibilities[step][noteIndex];

	}

	Tone.Transport.setBpm(110);

	Tone.Transport.setInterval(function(time){

		for (var i = 0; i < synths.length; i++ ){
			var currentNote = generate(synths[i].previousNote);

			if (currentNote != 'rest') synths[i].synth.triggerAttackRelease(synths[i].music.scale[currentNote], "16n");

			synths[i].previousNote = currentNote;
		}

	}, "8n");

	//start the Transport for the events to start
	var startButton = $("#StartButton");
	var startCheckbox = new GUI.Checkbox(startButton, function(on){
		if (on){
			Tone.Transport.start();
		} else {
			Tone.Transport.stop();
		}
	}, "start", "stop");

});