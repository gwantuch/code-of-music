'use strict';

var comparisonChart = require('comparisonChart');
var $ = require('jquery');
var d3 = require('d3');
var ge = require('ge');
var aapl = require('aapl');
var nflx = require('nflx');
var Music = require('music');
var _ = require('underscore');

function clean(d){
	var cleaned = [];

	var dates = d.Dates;
		dates = dates.slice(Math.max(dates.length - 90));

	var prices = d.Elements[0].DataSeries.close.values;
	prices = prices.slice(Math.max(prices.length - 90));

	for (var i = 0; i < dates.length; i++){
		var d = dates[i].replace('T','-');
			d = d.split('-');

		var datePrice = {
			date: new Date( parseInt(d[0]), parseInt(d[1]-1), parseInt(d[2]) ),
			close: prices[i]
		};

		cleaned.push(datePrice);
	}

	return cleaned;
}

var Stock = function(tickerSymbol) {
	this.ticker = tickerSymbol.toUpperCase();
	this.loading = true;
}

Stock.prototype.init = function() {
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

		console.log(JSON.stringify(d));

		var dates = d.Dates;
		dates = dates.slice(Math.max(dates.length - 90));

		var prices = d.Elements[0].DataSeries.close.values;
		prices = prices.slice(Math.max(prices.length - 90));

		var stockData = [];

		var stockNames = [ self.ticker ];

		for (var i = 0; i < dates.length; i++){
			var d = dates[i].replace('T','-');
				d = d.split('-');

			var datePrice = {
				date: new Date( parseInt(d[0]), parseInt(d[1]-1), parseInt(d[2]) ),
				close: prices[i]
			};

			stockData.push(datePrice);
		}

		var data = stockNames.map(	function(name){
			return {
				name: name,
				data: stockData
			}
		});

		// comparisonChart("Geometric", data);

	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
};

Stock.prototype.init_Steps = function(prices, deltas) {
	var referenceFreq = 49;

	var min = _.min(prices);
	var max = _.max(prices);

	this.steps = [];
	this.music = new Music(referenceFreq);
	this.music 
	
	for(var note = 0; note < prices.length; note++){
		this.steps[note] = this.music.snapToNote( ( prices[note] ), min, max );
	}

	// console.log(this.steps);
}

Stock.prototype.init_Synth = function() {
	var presets = [ "Trumpet", "Koto", "Barky", "Pianoetta", "LaserStep"];

	this.synth = new Tone.MonoSynth();
	this.synth.setPreset("Koto");
	this.synth.oscillator.setType('sine');
	this.synth.setVolume(-20);
	this.synth.toMaster();

	// this.synth = new Tone.MonoSynth();
	// this.synth.setPreset(presets[Math.round(Math.random()*5)]);
	// this.synth.oscillator.setType();
	// this.synth.setVolume(-20);
	// this.synth.toMaster();
}

////////////////////////////////////////////////////////////////////////////////
//																			  //
//							  THE APP 										  //
//																			  //
////////////////////////////////////////////////////////////////////////////////

ge = clean(ge);
aapl = clean(aapl);
nflx = clean(nflx);

var stocknames = [ 'ge', 'aapl', 'nflx' ];

var stockdata = [];

stockdata.push(ge, aapl, nflx);

var data = [];
var stocks = [];

for (var i = 0; i < stocknames.length; i++){
	var stockobject = {
		name: stocknames[i],
		data: stockdata[i]
	}

	data.push(stockobject);

	var prices = [];
	var percentage_change = [];

	for(var s = 0; s < stockdata[i].length; s++){
		prices.push(stockdata[i][s].close);

		percentage_change.push(stockdata[i][s] / stockdata[i][0]);
	}

	var stock = new Stock(stocknames[i]);

	stock.data = stockobject;

	stock.init_Steps(prices, percentage_change);
	stock.init_Synth();
	
	stocks.push(stock);
}

var stepNum = 0;
var stepArray = [0,1,2,3,4,5,6,7];

Tone.Transport.loop = true;
Tone.Transport.setBpm( 144 );

console.log(data);

var chart = comparisonChart("Geometric", data, Tone.Transport, stocks, stepArray);

Tone.Transport.setInterval(function(time){
	stepNum++;
	stepNum = stepNum % 8;
	
	for(var s = 0; s < stocks.length; s++){
		stocks[s].synth.triggerAttackRelease(stocks[s].steps[stepArray[stepNum]], '8n');
	}

}, "8n");

Tone.Transport.start();