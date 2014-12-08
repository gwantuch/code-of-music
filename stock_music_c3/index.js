'use strict';

var $ = require('jquery');
var d3 = require('d3');
var c3 = require('c3');
var Chart = require('chart');
var Music = require('music');
var _ = require('underscore');

var Stock = function(tickerSymbol) {
	this.ticker = tickerSymbol.toUpperCase();
	this.loading = true;
}

Stock.prototype.init = function(stock_array) {
	var self = this;

	var parameters = {
		"Normalized": false,
		"NumberOfDays": 365,
		"DataPeriod": "Day",
		"Elements": [{
			"Symbol": this.ticker,
			"Type": "price",
			"Params": ["c"]
		}]
	};

	var	parametersURI = encodeURIComponent(JSON.stringify(parameters)).replace(/'/g,"%27").replace(/"/g,"%22");

	var URL = "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp?parameters=" + parametersURI;

	$.ajax({
		url: URL,
		type: 'GET',
		dataType: 'jsonp',
	})
	.done(function(d) {
		// console.log("success");

		// console.log(JSON.stringify(d));

		var dates = d.Dates;
			dates = dates.slice(Math.max(dates.length - 90));

		var prices = d.Elements[0].DataSeries.close.values;
			prices = prices.slice(Math.max(prices.length - 90));

		var stock_data = [];

		var stock_name = self.ticker;

		self.dates = [ 'x' ]
		self.deltas = [stock_name]

		for (var i = 0; i < dates.length; i++){
			var d = dates[i].replace('T','-');
				d = d.split('-');

			var the_date = new Date( parseInt(d[0]), parseInt(d[1]-1), parseInt(d[2]) );
			var percentage_change = prices[i] / prices[0];

			self.dates.push(the_date);
			self.deltas.push(percentage_change);

			// var date_price = {
			// 	date: new Date( parseInt(d[0]), parseInt(d[1]-1), parseInt(d[2]) ),
			// 	close: prices[i]
			// };

			// stock_data.push(date_price);
		}

		if(chart){
			// chart.regions.add([{start: '2014-08-14', end: '2014-10-10'}]);
			chart.load({
				columns: [
					self.deltas
				]
			});
		} else{
			region = [{
				start: self.dates[1],
				end: self.dates[90]
				// index_start: 1,
				// index_end: 90
			}]
			
			chart = new Chart(self, region);
			
			window.addEventListener('resize', function() {
				chart.resize({height: window.innerHeight, width:window.innerWidth});
			}, true);

			// chart.regions.add([{ start: region.start, end: region.end }]);
		}

		// var stock_object = {
		// 		name: stock_name,
		// 		data: stock_data
		// 	};

		// self.data = stock_object;

		stock_array.push(self);
		self.init_Steps(prices);
		self.init_Synth();
		self.play = true;

		$('#Stock1').val('');
		$('#stocklist').append('<button id='+self.ticker+' type="button" class="btn btn-default active">'+ self.ticker + '</button>');
		var button = document.getElementById(self.ticker);
			button.onclick = function(e){
				e.preventDefault();
				e.stopPropagation();

				if (this.className == 'btn btn-default active') {
					self.play = false;
					this.className = 'btn btn-default';
					// chart.regions.remove();
				} else {
					this.className = 'btn btn-default active';
					self.play = true;
				}
			}

	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
};

Stock.prototype.init_Steps = function(prices) {
	var referenceFreq = 49;

	var min = _.min(prices);
	var max = _.max(prices);

	this.prices = prices;

	this.steps_major = [];
	this.steps_minor = [];
	this.major = new Music(referenceFreq);
	this.minor = new Music(referenceFreq);

	this.minor.setSeptScale(natural_minor, 'minor');
	
	for(var note = 0; note < prices.length; note++){
		this.steps_major[note] = this.major.snapToNote( ( prices[note] ), min, max );
		this.steps_minor[note] = this.minor.snapToNote( ( prices[note] ), min, max );
	}

	// console.log(this.steps);
}

Stock.prototype.init_Synth = function() {
	var presets = [ "Trumpet", "Koto", "Barky", "Pianoetta", "LaserStep"];

	this.synth = new Tone.FMSynth();
	this.synth.setPreset("DistGit");
	// this.synth.carrier.oscillator.setType('pulse');
	this.synth.setVolume(-20);
	this.synth.toMaster();
}

var Rhythm = function(){
	this.synth = new Tone.FMSynth();
	this.synth.setPreset("Koto");
	// this.synth.carrier.oscillator.setType('pulse');
	this.synth.setVolume(-30);
	this.synth.toMaster();
}

////////////////////////////////////////////////////////////////////////////////
//																			  //
//							  THE APP 										  //
//																			  //
////////////////////////////////////////////////////////////////////////////////


var stocks = [];
var chart;
var d3_data = [];
var natural_minor = [0, 0, -1, 0, 0, -1, -1, 0];

// initialize the step_array and transport to pass to D3
var step_num = 0;
var rhythm_step = 0;
var region;
var step_array = [0,1,2,3,4,5,6,7];
Tone.Transport.loop = true;
Tone.Transport.setBpm( 144 );

$(document).ready(function () {
	var aapl = new Stock('aapl');
		aapl.init(stocks);

	$('#addStock').on('click', function(event) {
		var mStock = new Stock($('#Stock1').val());
		mStock.init(stocks, chart);
	});
});

var rhythm = new Rhythm();

Tone.Transport.setInterval(function(time){
	rhythm_step++;
	rhythm_step = rhythm_step % 16;
	
	if(stocks && rhythm_step % 2){
		step_num++;
		for(var s = 0; s < stocks.length; s++){
			step_num = step_num % stocks[s].steps_major.length;

			if(stocks[s].play){
				// if(stocks[s].prices[step_array[step_num]] < stocks[s].prices[[step_array[0]]]){
					// stocks[s].synth.triggerAttackRelease(stocks[s].steps_minor[step_array[step_num]], "8n", time);
				// } else {
					stocks[s].synth.triggerAttackRelease(stocks[s].steps_major[step_num], "8n", time);				
				// }				
			}
		}
	}

	rhythm.synth.triggerAttackRelease("G2","16n", time);

}, "8n");

// Tone.Transport.start();

