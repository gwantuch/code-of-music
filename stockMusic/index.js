'use strict';

var comparisonChart = require('comparisonChart');
var $ = require('jquery');
var d3 = require('d3');
var ge = require('ge');
var aapl = require('aapl');
var nflx = require('nflx');
var Music = require('music');
var _ = require('underscore');

var Stock = function(tickerSymbol) {
	this.ticker = tickerSymbol.toUpperCase();
	this.loading = true;
}

Stock.prototype.init = function(stock_array, chart_data, step_array_ref) {
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

		for (var i = 0; i < dates.length; i++){
			var d = dates[i].replace('T','-');
				d = d.split('-');

			var date_price = {
				date: new Date( parseInt(d[0]), parseInt(d[1]-1), parseInt(d[2]) ),
				close: prices[i]
			};

			stock_data.push(date_price);
		}

		var stock_object = {
				name: stock_name,
				data: stock_data
			};

		self.data = stock_object;

		chart_data.push(stock_object);

		stock_array.push(self);

		comparisonChart("Geometric", chart_data, Tone.Transport, stock_array, step_array_ref);

		self.init_Steps(prices, natural_minor);
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

Stock.prototype.init_Steps = function(prices, interval) {
	var referenceFreq = 49;

	var min = _.min(prices);
	var max = _.max(prices);

	this.prices = prices;

	this.steps_major = [];
	this.steps_minor = [];
	this.major = new Music(referenceFreq);
	this.minor = new Music(referenceFreq);

	this.minor.setSeptScale(interval, 'minor');
	
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
var d3_data = [];
var natural_minor = [0, 0, -1, 0, 0, -1, -1, 0];

// initialize the step_array and transport to pass to D3
var step_num = 0;
var rhythm_step = 0;
var step_array = [0,1,2,3,4,5,6,7];
Tone.Transport.loop = true;
Tone.Transport.setBpm( 144 );

$(document).ready(function () {
	$('#addStock').on('click', function(event) {
		var mStock = new Stock($('#Stock1').val());
		mStock.init(stocks, d3_data, step_array);
	});
});

var rhythm = new Rhythm();

Tone.Transport.setInterval(function(time){
	rhythm_step++;
	rhythm_step = rhythm_step % 16;
	
	if(stocks && rhythm_step % 2){
		step_num++;
		step_num = step_num % 8;
		for(var s = 0; s < stocks.length; s++){
			if(stocks[s].play){
				// if(stocks[s].prices[step_array[step_num]] < stocks[s].prices[[step_array[0]]]){
					// stocks[s].synth.triggerAttackRelease(stocks[s].steps_minor[step_array[step_num]], "8n", time);
				// } else {
					stocks[s].synth.triggerAttackRelease(stocks[s].steps_major[step_array[step_num]], "8n", time);				
				// }				
			}
		}
	}

	rhythm.synth.triggerAttackRelease("G2","16n", time);

}, "8n");

Tone.Transport.start();


////////////////////////////////////////////////////////////////////////////////
//																			  //
//							  TEST DATA 									  //
//																			  //
////////////////////////////////////////////////////////////////////////////////

// function clean(d){
// 	var cleaned = [];

// 	var dates = d.Dates;
// 		dates = dates.slice(Math.max(dates.length - 90));

// 	var prices = d.Elements[0].DataSeries.close.values;
// 	prices = prices.slice(Math.max(prices.length - 90));

// 	for (var i = 0; i < dates.length; i++){
// 		var d = dates[i].replace('T','-');
// 			d = d.split('-');

// 		var datePrice = {
// 			date: new Date( parseInt(d[0]), parseInt(d[1]-1), parseInt(d[2]) ),
// 			close: prices[i]
// 		};

// 		cleaned.push(datePrice);
// 	}

// 	return cleaned;
// }

// ge = clean(ge);
// aapl = clean(aapl);
// nflx = clean(nflx);

// var stocknames = [ 'ge', 'aapl', 'nflx' ];

// var stockdata = [];

// stockdata.push(ge, aapl, nflx);

// var data = [];
// var stocks = [];

// for (var i = 0; i < stocknames.length; i++){
// 	var stockobject = {
// 		name: stocknames[i],
// 		data: stockdata[i]
// 	}

// 	data.push(stockobject);

// 	var prices = [];
// 	var percentage_change = [];

// 	for(var s = 0; s < stockdata[i].length; s++){
// 		prices.push(stockdata[i][s].close);

// 		// percentage_change.push(stockdata[i][s] / stockdata[i][0]);
// 	}

// 	var stock = new Stock(stocknames[i]);

// 	stock.data = stockobject;

// 	stock.init_Steps(prices);
// 	stock.init_Synth();
	
// 	stocks.push(stock);
// }