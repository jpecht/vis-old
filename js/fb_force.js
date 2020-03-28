(function() {	
	var FB_NAME = 'Jeff Mowgli';

	var width = 650, height = 600;
	
	var nodeStrokeColor = '#E0E0E0',
		highNodeStrokeColor = '#333';
	var linkColor = '#AAA',
		highLinkColor = '#000';
	
	var chart = d3.select('.chart')
		.attr('width', width)
		.attr('height', height);

	var force = d3.layout.force()
		.charge(-20)
		.linkDistance(50)
		.linkStrength(0.1)
		.friction(0.8)
		.gravity(0.08)
		.size([width, height]);
		
	var mutualScale = d3.scale.threshold()
		.domain([3, 5, 10, 30, 50])
		.range(['rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,90,50)']);
	
	var defaultInfoText = '&nbsp;';
	var infoText = defaultInfoText;

	// draw legend
	var rect_width = 30, rect_height = 10;
	var legend_data = mutualScale.range();
	legend_data.push('');
	var legend = d3.select('.legend svg')
		.attr('height', rect_height + 25)
		.attr('width', rect_width * 6 + 20);
	var legend_colors = legend.selectAll('g')
		.data(legend_data)
		.enter().append('g')
			.attr('transform', function(d, i) {
				return 'translate(' + (i*rect_width+10) + ', 0)';
			});
	legend_colors.append('rect')
		.attr('width', rect_width)
		.attr('height', rect_height)
		.style('display', function(d, i) { return (i === legend_data.length - 1) ? 'none' : ''; })
		.attr('fill', function(d) { return d; });
	legend_colors.append('text')
		.attr('class', 'legend-text')
		.attr('y', rect_height + 12)
		.html(function(d, i) {
			if (i === 0) return '1';
			else if (i === legend_data.length - 1) return '150';
			else return mutualScale.domain()[i-1];
		});
	
	var dataReady = function(error, nodesData, linksData) {
		nodesData.shift(); // cut out myself

		// attach important info to nodesData (number of mutual friends, name)
		var lookup = {};
		for (var i = 0; i < nodesData.length; i++) {
			nodesData[i].numMutual = 0;
			nodesData[i].name = nodesData[i].uid2;
			
			lookup[nodesData[i].uid2] = i;
		}
		
		// create links using the lookup built
		var links = [];
		for (var j = 0; j < linksData.length; j++) {
			if (linksData[j].uid1 !== FB_NAME && linksData[j].uid2 !== FB_NAME) {
				var sourceInd = lookup[linksData[j].uid1];
				var targetInd = lookup[linksData[j].uid2];
				links.push({source: sourceInd, target: targetInd});
				
				nodesData[sourceInd].numMutual++;
				nodesData[targetInd].numMutual++;
			}
		}

		force.nodes(nodesData).links(links).start();		
				
		var link = chart.selectAll('.link')
			.data(links)
			.enter().append('line')
				.attr('class', 'link')
				.style('stroke', linkColor);

		var node = chart.selectAll('.node')
			.data(nodesData)
			.enter().append('circle')
				.attr('class', 'node')
				.attr('r', 5)
				.style('stroke', nodeStrokeColor)
				.attr('fill', function(d) {
					if (d.name === 'Caitlin Farrell') return 'steelblue';
					else if (d.numMutual === 0) return '#999';
					else return mutualScale(d.numMutual);
				})
				.on('mouseover', function(d) {
					var info = infoTextize(d);
					d3.select('.chart-info').html(info);
				})
				.on('mouseout', function() {
					d3.select('.chart-info').html(infoText);
				})
				.on('click', function(d) {
					d3.event.stopPropagation();
					d3.selectAll('.node').style('stroke', nodeStrokeColor);
					d3.select(this).style('stroke', highNodeStrokeColor);
					
					d3.selectAll('.link').style('stroke', linkColor)
						.filter(function(linkDatum) {
							return linkDatum.source.index === d.index || linkDatum.target.index === d.index;
						}).style('stroke', highLinkColor);
						
					infoText = infoTextize(d);
					d3.select('.chart-info').html(infoText);
				})
				.call(force.drag);
				
		// reset; clear node focus
		chart.on('click', function() {
			d3.selectAll('.node').style('stroke', nodeStrokeColor);
			d3.selectAll('.link').style('stroke', linkColor);
			
			infoText = defaultInfoText;
			d3.select('.chart-info').html(infoText);
		});
				
		// allow dynamic force layout movement
		force.on('tick', function() {
			link.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; });

			node.attr('cx', function(d) { return d.x; })
        		.attr('cy', function(d) { return d.y; });
  		});
	};
	
	var infoTextize = function(d) {
		return d.uid2 + ': ' + d.numMutual + ' mutual friends';
	};
	
	queue()
		.defer(d3.tsv, 'data/fb_friends.tsv')
		.defer(d3.tsv, 'data/fb_mutual_friends.tsv')
		.await(dataReady);
})();
