(function() {
	var table = d3.select('.table-wrapper').append('table')
		.attr('class', 'table table-striped table-bordered table-condensed table-hover');
	
	// table header
	var columns = ['#', 'Player', 'Score', 'FG%', 'FT%', '3PM', 'PTS', 'REB', 'AST', 'ST', 'BLK', 'TO'];
	var header_row = table.append('tr')
		.attr('class', 'header-row')
		.selectAll('td')
			.data(columns)
			.enter().append('td')
				.attr('class', 'header-cell')
				.classed('player-cell', function(d, i) { return (i === 1); })
				.html(function(d) { return d; });
			
	// define thresholds and coloring system
	var thresholds = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
	var color_classes = ['color-red-3', 'color-red-2', 'color-red-1', 'color-neutral', 'color-blue-1', 'color-blue-2', 'color-blue-3'];
	var color_by_threshold = function(stat) {
		for (var i = 0; i < thresholds.length; i++) {
			if (stat < thresholds[i]) return color_classes[i];
		}
		return color_classes[thresholds.length];
	};
	
	// define number formatting
	var dec2format = d3.format('.2f');
	
	// grab data and draw!
	d3.tsv('data/bball_ranks.tsv', function(error, data) {
		data = data.slice(0, 100);
				
		var rows = table.selectAll('tr:not(.header-row)')
			.data(data)
			.enter().append('tr');
		rows.append('td').html(function(d, i) { return i + 1; });
		rows.append('td').html(function(d) { return d.Player; })
			.attr('class', 'player-cell');
		
		for (var j = 2; j < columns.length; j++) {
			rows.append('td')
				.html(function(d) {
					return dec2format(d[columns[j] + '_Q']);
				})
				.attr('class', function(d) {
					if (j !== 2) return color_by_threshold(d[columns[j] + '_Q']);
				})
				.classed('score-cell', function() { return (j === 2); });
		}
	});
	
})();
