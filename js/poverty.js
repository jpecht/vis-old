/**
 * @author jpecht
 */

(function() {
	// initialization for maps
	var map_width = ($(window).width() < 600) ? $(window).width() - 60 : 600, 
		map_height = ($(window).width() < 600) ? 300 : 450,
		map_scale = ($(window).width() < 600) ? $(window).width() : 800; // a crude calculation of scale
		
	var projection = d3.geo.albersUsa()
		.scale(map_scale)
		.translate([map_width / 2, map_height / 2]);
	var path = d3.geo.path().projection(projection);
	
	
	// colors! some from colorbrewer.org
	var blue_colors = ['rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(7,81,156)','rgb(28,53,99)'];
	var choropleth = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)'];
	var PuBu = ['rgb(255,247,251)','rgb(236,231,242)','rgb(208,209,230)','rgb(166,189,219)','rgb(116,169,207)','rgb(54,144,192)','rgb(5,112,176)','rgb(4,90,141)','rgb(2,56,88)'];
	var PuBuGn = ['rgb(255,247,251)','rgb(236,226,240)','rgb(208,209,230)','rgb(166,189,219)','rgb(103,169,207)','rgb(54,144,192)','rgb(2,129,138)','rgb(1,108,89)','rgb(1,70,54)'];
	var YlOrBr = ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"];
	var OrRd = ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"];
	var na_color = 'rgb(200,200,200)';
	
	
	/* --------------------------------- poverty post --------------------------- */
	// American Fact Finder: S1701
	
	
	var poverty_svg = d3.select('#poverty-map').append('svg')
		.attr('width', map_width)
		.attr('height', map_height);
		
	
	var pov_data_ready = function(error, us, pov_data, pa_data) {
		// drawing the map
	  	var counties = topojson.feature(us, us.objects.counties).features;
	  	var states = topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; });		
		poverty_svg.append('g')
			.attr('class', 'counties')
			.selectAll('path')
				.data(counties)
			.enter().append('path')
				.attr('class', 'county')
				.attr('d', path);  	
		poverty_svg.append("path").datum(states)
			.attr("class", "states")
			.attr("d", path);
			
		// organizing data
		var county_stats = {};
		for (var i = 0; i < pov_data.length; i++) {
			var year = +pov_data[i].year;
			var fips = +pov_data[i].fips;
			if (!county_stats.hasOwnProperty(year)) county_stats[year] = {};
			county_stats[year][fips] = pov_data[i];
		}	
		
		var state_stats = {};
		for (var i = 0; i < pa_data.length; i++) {
			var year = +pa_data[i].year;
			var fips = +pa_data[i].fips;
			if (!state_stats.hasOwnProperty(year)) state_stats[year] = {};
			state_stats[year][fips] = pa_data[i];
		}
		
	
		// custom thresholds for each race
		var t_domains = {
			'total': [10, 15, 20, 30],
			'white': [10, 15, 20, 30],
			'black': [10, 15, 25, 35],
			'aian': [10, 15, 20, 30],
			'asian': [10, 15, 20, 30],
			'hawaiian_pi': [10, 15, 20, 30],
			'hispanic': [10, 15, 25, 35],
			'other': [10, 15, 20, 30],
			'one_race': [10, 15, 20, 30],
			'two_races': [10, 15, 20, 30]
		};
			
		var curr_stat = 'total',
			avg_text = '';
		
		var updateMap = function(stat) {	
			curr_stat = stat;
			
			// defining quantile scale; really only use quantiles internally to define thresholds
			/*var quantile_domain = [];
			for (var ind in county_stats[2012]) quantile_domain.push(+county_stats[2012][ind][stat]);
			var quantile = d3.scale.quantile()
				.domain(quantile_domain)
				.range(blue_colors);
			var threshs = quantile.quantiles();*/
	
			// defining threshold scale
			var threshs = t_domains[stat];
			var threshold = d3.scale.threshold()
				.domain(threshs)
				.range(blue_colors);
			d3.selectAll('#poverty-legend rect').style('fill', function(d, i) {
				return blue_colors[i];
			});
				
			// change legend text
			for (var i = 0; i < threshs.length; i++) {
				$('#poverty-legend-text-'+(i+2)).text(threshs[i].toFixed() + '%');	
			}
			
			// color map
			poverty_svg.selectAll('.county').transition().duration(750).style('fill', function(d, i) {
				if (county_stats[2012].hasOwnProperty(+d.id)) {
					var value = +county_stats[2012][+d.id][stat];
					return (isNaN(value) || value === "") ? na_color : threshold(value);
				} else return na_color;
			});
			
			// update average text
			var avg_value = +state_stats[2012][0][stat];
			avg_text = 'National Average: ' + avg_value.toFixed(1) + '%';
			$('#poverty-average-text').html(avg_text);
		};
		
		
		updateMap('total');
	
	
		// hover behavior
		$('.county').on('mouseover', function() {
			var state_fips = Math.floor(d3.select(this).datum().id / 1000);
			var val = +state_stats[2012][state_fips][curr_stat];
			$('#poverty-average-text').html(state_stats[2012][state_fips].name + ' State Average: ' + val.toFixed(1) + '%');
		});
		$('.county').on('mouseout', function() {
			$('#poverty-average-text').html(avg_text);
		});
	
		// dropdown behavior
		$('#poverty-dropdown-container a').click(function(e) {
			e.preventDefault();
			$('#poverty-dropdown-title').text($(this).text());
			updateMap($(this).attr('stat'));
		});	
	};
	
	queue()
		.defer(d3.json, "data/us.json")
		.defer(d3.tsv, "data/poverty.tsv")
		.defer(d3.tsv, "data/poverty_average.tsv")
		.await(pov_data_ready);
})();