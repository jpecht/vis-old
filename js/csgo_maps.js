(function() {
	var margin = {top: 20, right: 20, bottom: 40, left: 50};

	var width = 425 - margin.left - margin.right,
		height = 530 - margin.top - margin.bottom;

	var chart = d3.select('.chart')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

	var scale = d3.scale.threshold()
		.domain([0.4, 0.46, 0.49, 0.51, 0.54, 0.6])
		.range(['rgb(33,102,172)','rgb(103,169,207)','rgb(209,229,240)','rgb(247,247,247)','rgb(253,219,199)','rgb(239,138,98)','rgb(178,24,43)']);

	var categories = ['1-6', '7-10', '11-14', '15-18'];
	var data_label_width = 50, data_label_height = 15;
	var data_width = 65, data_width_padding = 15;
	var data_height = 30, data_height_padding = 10;

	for (var k = 0; k < categories.length; k++) {
		chart.append('text')
			.attr('class', 'x-label')
			.attr('x', data_label_width + data_width/2 + k * (data_width + data_width_padding))
			.html('Skill Lvl ' + categories[k]);
	}

	d3.tsv('data/csgo_maps.tsv', function(error, data) {
		var group = chart.selectAll('g')
			.data(data)
			.enter().append('g');

		group.append('text')
			.attr('y', function(d, i) {
				return i * (data_height + data_height_padding) + data_height/2 + data_label_height;
			})
			.html(function(d) { return d.Map; });

		for (var j = 0; j < categories.length; j++) {
			group.append('rect')
				.attr('width', data_width + 'px')
				.attr('height', data_height + 'px')
				.attr('x', j * (data_width + data_width_padding) + data_label_width)
				.attr('y', function(d, i) {
					return i * (data_height + data_height_padding) + data_label_height;
				})
				.attr('fill', function(d) { return scale(+d[categories[j]]); });
			group.append('text')
				.attr('x', j * (data_width + data_width_padding) + data_width / 2 + data_label_width)
				.attr('y', function(d, i) {
					return i * (data_height + data_height_padding) + data_height/2 + data_label_height;
				})
				.attr('fill', function(d) {
					return (scale(+d[categories[j]]) === scale.range()[0] || scale(+d[categories[j]]) === scale.range()[scale.range().length-1]) ? '#E0E0E0' : '#000'; 
				})
				.html(function(d) { return d3.format('.1f')(100 * +d[categories[j]]) + '%'; });
		}

		chart.append('text')
			.attr('class', 'chart-label')
			.attr('x', 200)
			.attr('y', data_label_height + data.length * (data_height + data_height_padding) + 15)
			.html('*percentage that the terrorist side wins in a given round (includes rounds 4-15)');
			
		var legend = chart.append('g')
				.attr('class', 'legend')
				.attr('transform', 'translate(10,' + ((data_height+data_height_padding)*data.length + data_label_height + 55)+ ')');
				
		var legendRectWidth = 45;
		legend.selectAll('.legend-rect')
			.data(scale.range())
			.enter().append('rect')
				.attr('class', 'legend-rect')
				.attr('width', legendRectWidth)
				.attr('height', 12)
				.attr('x', function(d, i) { return i*legendRectWidth; })
				.attr('fill', function(d) { return d; });
		legend.append('text')
			.attr('x', legendRectWidth * .5)
			.attr('y', 24)
			.html('CT-sided');
		legend.append('text')
			.attr('x', legendRectWidth * 6.5)
			.attr('y', 24)
			.html('T-sided');

	});
})();