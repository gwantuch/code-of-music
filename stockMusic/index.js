'use strict';

var comparisonChart = require('comparisonChart');
var $ = require('jquery');
var d3 = require('d3');

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
				date: new Date( parseInt(d[0]), parseInt(d[1]), parseInt(d[2]) ),
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

		console.log(data);

		comparisonChart("Geometric", data);
		
		// $('#stocklist').append('<li class="list-group-item">'+self.ticker+'</li>');

		// if(stocks.length === 1){
		// 	callback(stocks, synths);					
		// }

	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
};

var ge = new Stock('ge');
	
	ge.init();