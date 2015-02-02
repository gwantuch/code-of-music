var Stock = function(tickerSymbol) {
	this.ticker = tickerSymbol.toUpperCase();
	this.loading = true;
}

Stock.prototype.init = function(stocks, synths, prices, stepCount) {
	var self = this;

	function listPoints (points) {
		// i'm the callback
		for(i = 0; i < 8; i++){
			console.log(points[i].getAttribute('ct:value'));
		}
	}

	var parameters = {
		"Normalized": true,
		"NumberOfDays": 120,
		"DataPeriod": "Day",
		"Elements": [{
			"Symbol": this.ticker,
			"Type": "price",
			"Params": ["c"]
		}]
	};

	parametersURI = encodeURIComponent(JSON.stringify(parameters)).replace(/'/g,"%27").replace(/"/g,"%22");

	var URL = "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp?parameters=" + parametersURI;

	$.ajax({
		url: URL,
		type: 'GET',
		dataType: 'jsonp',
	})
	.done(function(data,pointsList) {
		// console.log("success");

		var dates = data.Dates;
		dates = dates.slice(Math.max(dates.length - stepCount));

		var mPrices = data.Elements[0].DataSeries.close.values;
		mPrices = mPrices.slice(Math.max(mPrices.length - stepCount));

		self.init_Steps(mPrices, stepCount);
		self.init_Synth();

		stocks.push(self);
		synths.push(self.synth);
		prices.push(self.prices);

		updateGraph(prices, dates);
		
		$('#stocklist').append('<li class="list-group-item">'+self.ticker+'</li>');

		if(stocks.length === 1){
			initTone(stocks, synths);					
		}

		// listPoints(points);
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
};

Stock.prototype.init_Steps = function(prices, numSteps) {
	var referenceFreq = 49;

	this.prices = prices;
	this.notes = [];

	for(var p = 0; p < prices.length; p++){
		this.notes[p] = prices[p] + 20;
		this.notes[p] = Math.min(Math.max(this.notes[p],0),40);
	}

	var min = _.min(this.notes);
	var max = _.max(this.notes);

	this.steps = [];
	this.music = new Music(referenceFreq);
	for(var note = 0; note < this.notes.length; note++){
		this.steps[note] = this.music.snapToNote( ( this.notes[note] ), min, max*1.25 );
	}
}

Stock.prototype.init_Synth = function() {
	// var presets = [ "Trumpet", "Koto"]

	this.synth = new Tone.MonoSynth();
	this.synth.setPreset("Pianoetta");
	this.synth.oscillator.setType('sine');
	this.synth.setVolume(-20);
	this.synth.toMaster();
}