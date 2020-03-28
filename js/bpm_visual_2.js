(function() {
	var margin = {top: 20, right: 20, bottom: 40, left: 50};

	var width = 550 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;

	d3.select('.source').style('width', (width + margin.left + margin.right) + 'px');

	var chart = d3.select('.chart')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

	var x = d3.scale.linear().domain([77, 156]).range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient('bottom');
	var yAxis = d3.svg.axis().orient('left');

	var x_axis_g = chart.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(xAxis);
	var y_axis_g = chart.append('g')
		.attr('class', 'y axis');

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
		.x(function(d) { return x(d.bpm); })
		.y(function(d) { return y(d.frequency); })
		.interpolate('cardinal');


	NProgress.configure({parent: '.progress-container'}).start();
	queue()
		.defer(d3.tsv, 'data/bpm_frequency.tsv')
		.defer(d3.tsv, 'data/bpm_frequency_091416.tsv')
		.await(function(error, oldData, data) {
			// collate diff data
			var diffData = [];
			for (var i = 0; i < data.length; i++) {
				var freqDiff = data[i].frequency - oldData[i].frequency;
				if (freqDiff < 0) freqDiff = 0;
				diffData.push({
					bpm: data[i].bpm,
					frequency: freqDiff,
				});
			}

			// add the lines and the curve
			var dataLines = chart.selectAll('.data-line')
				.data(data)
				.enter().append('line')
					.attr('class', 'data-line')
					.style('stroke-width', 2);
			var dataCurve = chart.append('path')
				.attr('class', 'curve');

			// functions for showing the various data
			var show2014Data = function() {
				useFrequencyRange();
				dataLines
					.data(oldData)
					.transition()
					.attr('x1', function(d) { return x(d.bpm); })
					.attr('x2', function(d) { return x(d.bpm); })
					.attr('y1', function(d) { return y(d.frequency); })
					.attr('y2', y(0))
					.style('fill', 'steelblue');
				dataCurve.transition()
					.style('stroke', 'rgba(119,119,119,1)')
					.attr('d', curve(oldData));
			};
			var show2016Data = function() {
				useFrequencyRange();
				dataLines
					.data(data)
					.transition()
					.attr('x1', function(d) { return x(d.bpm); })
					.attr('x2', function(d) { return x(d.bpm); })
					.attr('y1', function(d) { return y(d.frequency); })
					.attr('y2', y(0))
					.style('fill', 'steelblue');
				dataCurve.transition()
					.style('stroke', 'rgba(119,119,119,1)')
					.attr('d', curve(data));
			};
			var showDiffData = function() {
				usePercentageRange();
				dataLines
					.data(diffData)
					.transition()
					.attr('x1', function(d) { return x(d.bpm); })
					.attr('x2', function(d) { return x(d.bpm); })
					.attr('y1', function(d) { return y(d.frequency); })
					.attr('y2', y(0))
					.style('fill', '#ff7f0e');
				dataCurve.transition().style('stroke', 'rgba(119,119,119,0)');
			};

			// adjusting the range
			var useFrequencyRange = function() {
				y.domain([0, 700]);
				yAxis
					.scale(y)
					.tickFormat(d3.format(','));
				y_axis_g.call(yAxis);
			};
			var usePercentageRange = function() {
				y.domain([0, 160]);
				yAxis
					.scale(y)
					.tickFormat(d3.format('+'));
				y_axis_g.call(yAxis);
			};

			// clicking the buttons shows the corresponding data
			$('.year-btn-group .btn').click(function() {
				$(this).addClass('active')
					.siblings().removeClass('active');
			});
			$('.2014-button').click(function() { show2014Data(); });
			$('.2016-button').click(function() { show2016Data(); });
			$('.diff-button').click(function() { showDiffData(); });

			// start by showing the 2016 data
			$('.2016-button').addClass('active');
			show2016Data();

			NProgress.done();
		});
})();
