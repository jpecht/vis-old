/**
 * @author jpecht
 * @source http://www.census.gov/govs/school/
 */

(function() {
	var natl_avg = {total: 10608, salaries: 6337, benefits: 2363, instruction: 6430, instruction_salaries: 4287,
		instruction_benefits: 1573, support: 3730, pupil_support: 605, staff_support: 491, general_admin: 202, school_admin: 577};
	
	// colors! some from colorbrewer.org
	var na_color = 'rgb(200,200,200)';
	var rb_7 = ['rgb(178,24,43)','rgb(239,138,98)','rgb(253,219,199)','rgb(247,247,247)','rgb(209,229,240)','rgb(103,169,207)','rgb(33,102,172)'];
	
	
	// initialization for maps
	var map_width = ($(window).width() < 600) ? $(window).width() - 60 : 600, 
		map_height = ($(window).width() < 600) ? 300 : 450,
		map_scale = ($(window).width() < 600) ? $(window).width() : 800; // a crude calculation of scale
		
	var projection = d3.geo.albersUsa()
		.scale(map_scale)
		.translate([map_width / 2, map_height / 2]);
	var path = d3.geo.path().projection(projection);
	
	var svg = d3.select('#education-map').append('svg')
		.attr('width', map_width)
		.attr('height', map_height);
		
	var scale = d3.scale.threshold()
		.domain([0.75, 0.85, 0.95, 1.05, 1.15, 1.25])
		.range(rb_7);
	var money_format = d3.format('$,0f');
	
	var data_ready = function(error, us, data) {
		// drawing the map
	  	var counties = topojson.feature(us, us.objects.counties).features;
	  	var states = topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; });		
		svg.append('g')
			.attr('class', 'counties')
			.selectAll('path')
				.data(counties)
			.enter().append('path')
				.attr('class', 'county')
				.attr('d', path)
				.attr('fill', na_color)
				.on('mouseover', function(d) {
					$('#county-stat').html('County Average: ' + money_format(dataById[d.id][currentStat]) + ' per student');
				})
				.on('mouseout', function(d) {
					$('#county-stat').html('');
				});
		svg.append("path").datum(states)
			.attr("class", "states")
			.attr("d", path);
	
		// making legend
		var legend_text = ['-25%', '-15%', '-5%', '+5%', '+15%', '+25%'];
		var legend = d3.select("#education-legend").selectAll('g')
			.data(rb_7)
			.enter().append('g')
				.attr('transform', function(d, i) { return 'translate('+ 50*i + ',0)'; });
		legend.append('rect')
			.attr('height', '15px')
			.attr('width', '50px')
			.attr('fill', function(d) { return d; });
		legend.append('text')
			.attr('class', 'legend-text')
			.attr('x', '50px')
			.attr('y', '29px')
			.style('text-anchor', 'middle')
			.text(function(d, i) { return legend_text[i]; });
				
		
		// dropdown behavior
		$('#education-dropdown-container a').click(function(e) {
			e.preventDefault();
			$('#education-dropdown-title').text($(this).text());
			updateMap($(this).attr('stat'), 750);
		});
	
		var updateMap = function(stat, transition_time) {
			currentStat = stat;
			svg.selectAll('.county').transition().duration(transition_time).style('fill', function(d) {
				return (dataById.hasOwnProperty(d.id)) ? scale(dataById[d.id][stat] / natl_avg[stat]) : na_color;
			});
			$('#national-stat').html('National Average: ' + money_format(natl_avg[stat]) + ' per student');
		};
	
		var currentStat = 'total';
		updateMap(currentStat, 1500);
	};
	
	
	var dataById = {};
	queue()
		.defer(d3.json, "data/us.json")
		.defer(d3.tsv, "data/education_county.tsv", function(d) {
			dataById[d.fips] = {};
			for (var ind in d) {
				if (ind !== 'fips') dataById[+d.fips][ind] = d[ind];
			}
		})
		.await(data_ready);
})();