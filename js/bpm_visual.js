(function() {
	var minBpm = 55, maxBpm = 200;

	var margin = {top: 20, right: 20, bottom: 40, left: 50};

	var width = 550 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;

	d3.select('.source').style('width', (width + margin.left + margin.right) + 'px');

	var chart = d3.select('.chart')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

	var x = d3.scale.linear().domain([minBpm, maxBpm]).range([0, width]);
	var y = d3.scale.linear().domain([0, 400]).range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient('bottom');
	var yAxis = d3.svg.axis().scale(y).orient('left');

	var x_axis_g = chart.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(xAxis);
	var y_axis_g = chart.append('g')
		.attr('class', 'y axis')
		.call(yAxis);

	var x_label = chart.append('text')
		.attr('class', 'label x-label')
		.attr('x', width / 2)
		.attr('y', height + margin.top + 15)
		.html('bpm');
	var y_label = chart.append('text')
		.attr('class', 'label y-label')
		.attr('x', -height / 2)
		.attr('y', -40)
		.attr('transform', 'rotate(-90)')
		.html('frequency');

	var curve = d3.svg.line()
		.x(function(d, i) { return x(i + minBpm); })
		.y(function(d) { return y(d); })
		.interpolate('basis');


	NProgress.configure({parent: '.progress-container'}).start();
	$.ajax({
		type: 'GET',
		url: 'data/music_collection.xml',
		dataType: 'xml',
		success: function(data) {
			NProgress.done();
			
			var bpmData = [];
			$(data).find('TEMPO').each(function() {
				var bpm = parseInt($(this).attr('BPM'));
				if (bpm >= minBpm && bpm <= maxBpm) bpmData.push(bpm);
			});
			bpmData.sort(function(a, b) { return a - b; });
			var bpmFreq = [];
			var bpmDataIndex = 0;
			for (var i = minBpm; i <= maxBpm; i++) {
				var freq = 0;
				while (bpmData[bpmDataIndex] === i) {
					freq++;
					bpmDataIndex++;
				}
				bpmFreq.push(freq);
			}

			chart.selectAll('.data-line')
				.data(bpmFreq)
				.enter().append('line')
					.attr('class', 'data-line')
					.attr('x1', function(d, i) { return x(i + minBpm); })
					.attr('x2', function(d, i) { return x(i + minBpm); })
					.attr('y1', function(d) { return y(d); })
					.attr('y2', y(0));

			chart.append('path')
				.attr('class', 'curve')
				.attr('d', curve(bpmFreq));
		}
	});
})();