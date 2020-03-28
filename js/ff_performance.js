/**
 * @author jpecht
 */

(function() {
	var scale = d3.scale.threshold()
		.domain([-50, -20, -5, -2, 2, 5, 10, 20])
		.range(['rgb(178,24,43)','rgb(214,96,77)','rgb(244,165,130)','rgb(253,219,199)','rgb(247,247,247)','rgb(209,229,240)','rgb(146,197,222)','rgb(67,147,195)','rgb(33,102,172)']);
	var tt_scale = d3.scale.threshold()
		.domain([-50, -25, -5, 5, 25, 50])
		.range(['rgb(214,96,77)','rgb(244,165,130)','rgb(253,219,199)','rgb(247,247,247)','rgb(209,229,240)','rgb(146,197,222)','rgb(67,147,195)']);
		
	//scale = d3.scale.quantile()
		//.range(['rgb(178,24,43)','rgb(214,96,77)','rgb(244,165,130)','rgb(253,219,199)','rgb(247,247,247)','rgb(209,229,240)','rgb(146,197,222)','rgb(67,147,195)','rgb(33,102,172)']);
	
	
	d3.tsv('data/ff_performance.tsv', function(error, data) {
		
		var diff_array = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i].pos_rank_diff !== 'N/A') {
				data[i].diff_pct = +data[i].pos_rank_diff/(10*+data[i].draft_pos_rank);
				diff_array.push(data[i].diff_pct);
			}
		}
		//scale.domain(diff_array);
		//console.log(scale.quantiles());
				
	
		// build table headers
		var header_row = d3.select('#ff-table').append('tr');
		for (var j = 0; j < 11; j++) {
			header_row.append('td')
				.attr('class', 'cell')
				.html(function() {
					return (j === 0) ? '#' : 'Team ' + j;
				});
		}		
		
		// build player cells
		for (var i = 0; i < 16; i++) {
			var row = d3.select('#ff-table').append('tr');
			for (var j = 0; j < 10; j++) {
				var player_cell = (i % 2 === 0) ? row.append('td') : row.insert('td', ':first-child');
				player_cell
					.datum(data[10*i + j])
					.attr('class', 'player cell')
					.attr('title', function(d) {
						var diff = (d.pos_rank_diff > 0) ? 'up ' + d.pos_rank_diff : 'down ' + Math.abs(d.pos_rank_diff);
						var playerStr = '<strong>' + d.player + ', ' + d.pos + ' (' + d.team + ')</strong>';
						var rankStr = d.pos + ' Final Rank: <span style="color:' + tt_scale(d.pos_rank_diff) + ';">' + d.final_pos_rank + '</span> (' + diff + ')';
						var draftRankStr = d.pos + ' Draft Rank: ' + d.draft_pos_rank;
						var pointsStr = 'Points Scored: ' + d.points;
						return playerStr + '<br>' + rankStr + '<br>' + draftRankStr + '<br>' + pointsStr;
					})
					.style('cursor', 'default')
					.style('background-color', function(d) {
						return scale(d.pos_rank_diff);
					})
					.html(function(d) {
						return d.player + '<br>' + d.team + ' - ' + d.pos;
					});
			}
			var number_cell = row.insert('td', ':first-child')
				.attr('class', 'cell')
				.html(i+1);
		}
		
		// build legend
		var legend = d3.select('#ff-2-legend svg');
		var legend_bar = legend.selectAll('g')
			.data(scale.range())
			.enter().append('g')
				.attr('transform', function(d, i) { return 'translate('+ 50*i + ',0)'; });
			
		legend_bar.append('rect')
			.attr('height', '15px')
			.attr('width', '50px')
			//.attr('stroke-width', '1px')
			//.attr('stroke', '#AAA')
			.attr('fill', function(d, i) {
				return d;
			});
		
		var domain = scale.domain();
		legend_bar.append('text')
			.attr('class', 'legend-text')
			.attr('x', '50px')
			.attr('y', '29px')
			.style('text-anchor', 'middle')
			.text(function(d, i) {
				return domain[i];
			});
		
		$('.player.cell').tooltipster({
			//theme: 'tooltipster-light',
			offsetX: 0,
			content: $(this).attr('title'),
			contentAsHTML: true
		});
	});
})();