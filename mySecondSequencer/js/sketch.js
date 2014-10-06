var width = window.innerWidth;
var height = window.innerHeight;

var numSteps = 8;
var referenceFreq = 49;
var currentStep = 0;

var sequence = [];
var blocks = [];

function setup () {
	createCanvas(window.innerWidth, window.innerHeight);
	background(80,80,80);

	for(var step = 0; step < numSteps; step++){
		blocks.push( new Block(step) );
	}
}

function draw () {
	background(80,80,80);
	for(var b in blocks){
		blocks[b].update();
	}
}

function mousePressed() {
	pressedX = null;
	pressedY = null;
	for (var i in blocks) {
		if(blocks[i].isTouching(mouseX)){
			sequence[i] = music.snapToNote( mouseY / height * 100, 0, 400);
			// console.log(sequence[i]);
			blocks[i].updateHeight(mouseY);
		};
	}
}

var music = new Music(referenceFreq);
for(var note = 0; note < numSteps; note++){
	sequence[note] = music.snapToNote( ( Math.random() * 100 ), 0, 400 );
}

var synth = new Tone.FMSynth();
synth.setPreset("Trumpet");
synth.setVolume(-10);
synth.toMaster();

Tone.Transport.loop = true;
//this will start the player on every eigth note
Tone.Transport.setInterval(function(time){		
	// console.log(sequence[currentStep]);	
	// $(".Lit").removeClass("Lit");
	//light up the new one
	// indicators[currentStep].addClass("Lit");
	currentStep++;
	currentStep = currentStep % numSteps;
	for(var i = 0; i < blocks.length; i++){
		if(i == currentStep){
			blocks[i].color = [255,0,0];
		}
		else{
			blocks[i].color = [50,40,255];
		}
	}
	//get the current column
	// for (var i = 0; i < checkboxes.length; i++){
	// 	var box = checkboxes[currentStep];
	// 	if (box.isChecked()){
	//
	synth.triggerAttackRelease(sequence[currentStep], "16n");
	// 	}
	// }
}, "8n");

Tone.Transport.setBpm( 98 );
Tone.Transport.start();