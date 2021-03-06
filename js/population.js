/**
 * @author jpecht
 */

// www.census.gov/population/www/censusdata/pop1790-1990.html

(function() {
	// colors! some from colorbrewer.org
	var blue_colors = ['rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(7,81,156)','rgb(28,53,99)'];
	var choropleth = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)'];
	var PuBu = ['rgb(255,247,251)','rgb(236,231,242)','rgb(208,209,230)','rgb(166,189,219)','rgb(116,169,207)','rgb(54,144,192)','rgb(5,112,176)','rgb(4,90,141)','rgb(2,56,88)'];
	var PuBuGn = ['rgb(255,247,251)','rgb(236,226,240)','rgb(208,209,230)','rgb(166,189,219)','rgb(103,169,207)','rgb(54,144,192)','rgb(2,129,138)','rgb(1,108,89)','rgb(1,70,54)'];
	var na_color = 'rgb(200,200,200)';
	
	// initialization for maps
	var map_width = ($(window).width() < 600) ? $(window).width() - 60 : 600, 
		map_height = ($(window).width() < 600) ? 300 : 450,
		map_scale = ($(window).width() < 600) ? $(window).width() : 800; // a crude calculation of scale
		
	var projection = d3.geo.albersUsa()
		.scale(map_scale)
		.translate([map_width / 2, map_height / 2]);
	var path = d3.geo.path().projection(projection);
	var pop_svg = d3.select('#pop-map').append('svg')
		.attr('width', map_width)
		.attr('height', map_height);
		
	
	var pop_data_ready = function(error, us, pop_data) {
		var current_stat = '', // '' for level, 'c' for growth 
			current_year = 2010;
		
		// drawing the map
	  	var counties = topojson.feature(us, us.objects.counties).features;
	  	var states = topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; });		
		pop_svg.append('g')
			.attr('class', 'counties')
			.selectAll('path')
				.data(counties)
			.enter().append('path')
				.attr('class', 'county')
				.attr('d', path);  	
		pop_svg.append("path").datum(states)
			.attr("class", "states")
			.attr("d", path);
			
		// organize data
		var stats = {};
		for (var i = 0; i < pop_data.length; i++) {
			var fips = +pop_data[i].FIPS;
			stats[fips] = pop_data[i];
		}
		
		// define slider
		$('#pop-slider').noUiSlider({
			start: [2010],
			range: {'min': [1790], 'max': [2010]}
			//connect: 'lower'
			//step: 10
		}).on({
			slide: function() {
				current_year = parseInt($(this).val());
				var year_to_decade = current_year % 10;
				if (year_to_decade !== 0) {
					var low_year = current_year - year_to_decade;
					var high_year = low_year + 10;				
				}
				
				
				$('#pop-slider-text').text('Year: ' + current_year);
				pop_svg.selectAll('.county').style('fill', function(d, i) {
					if (stats.hasOwnProperty(+d.id)) {
						if (year_to_decade === 0) {
							return getColor(stats[+d.id][current_stat+current_year]);
						} else {					
							// if slider is continuous
							var low_rgb = strip_rgb(getColor(stats[+d.id][current_stat+low_year]));
							var high_rgb = strip_rgb(getColor(stats[+d.id][current_stat+high_year]));
							var mid_rgb = [];
							for (var i = 0; i < low_rgb.length; i++) {
								mid_rgb[i] = parseInt(+low_rgb[i] + (+high_rgb[i] - +low_rgb[i]) * year_to_decade / 10);
							}
							var new_color = 'rgb(' + mid_rgb[0] + ',' + mid_rgb[1] + ',' + mid_rgb[2] + ')';
							return new_color;
						}
					} else return na_color;
				});
			}
		});
	
		// defining thresholds
		var l_threshold = d3.scale.threshold()
			.domain([5000, 10000, 15000, 20000, 30000, 50000, 100000, 150000])
			.range(choropleth);
		var g_threshold = d3.scale.threshold()
			.domain([-0.07, -0.03, 0, 0.02, 0.04, 0.07, 0.11, 0.20])
			.range(PuBuGn);
		var threshold = l_threshold; // current threshold being used
		
			
		var getColor = function(val) {
			return (isNaN(val) || val === '') ? na_color : threshold(val);
		};
		var updatePopMap = function() {
			pop_svg.selectAll('.county').transition().duration(750).style('fill', function(d, i) {
				return (stats.hasOwnProperty(+d.id)) ? getColor(stats[+d.id][current_stat+current_year]) : na_color;
			});		
		};
	
	
		// dropdown behavior
		$('#pop-dropdown-container a').click(function(e) {
			e.preventDefault();
			$('#pop-dropdown-title').text($(this).text());
			current_stat = ($(this).attr('stat') === 'level') ? '' : 'c';
			current_year = current_year - (current_year % 10); // round year for simplification
			$('#pop-slider').val(current_year);
			$('#pop-slider-text').text('Year: ' + current_year);
			threshold = (current_stat === '') ? l_threshold : g_threshold; 
			updatePopMap();
		});	
			
		// initialize at levels 2010	
		updatePopMap();
	};
	
	queue()
		.defer(d3.json, "data/us.json")
		.defer(d3.tsv, "data/hist_county_pop.tsv")
		.await(pop_data_ready);
	
	
	/* ------------------- helper functions -------------------- */
	var strip_rgb = function(rgb_str) {
		var bare = rgb_str.replace('rgb(', '').replace(')', '');
		return bare.split(',');
	};
})();