/**
 * @author jpecht
 */

(function() {
	// button functionality
	d3.selectAll('.btn').on('click', function() {
		var showType = d3.select(this).attr('name');
		svg.defineScale(showType);
		d3.selectAll('.chart-group').classed('hidden', function() {
			return d3.select(this).attr('name') !== showType;
		});
		d3.selectAll('.btn').classed('active', function() {
			return d3.select(this).attr('name') === showType;
		});
	});

	// chart drawing
	var margin = {top: 20, right: 20, bottom: 20, left: 50};

	var width = 650 - margin.left - margin.right,
		height = 350 - margin.top - margin.bottom;

	var svg = d3.select('.chart')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var parseDate = d3.time.format('%m/%d/%y').parse;

	var x = d3.time.scale()
		.domain([parseDate('3/1/10'), parseDate('10/1/14')])
		.range([0, width]);
	var y = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient('bottom')
		.tickFormat(d3.time.format.multi([
		  ["%b", function(d) { return d.getMonth(); }],
		  ["%Y", function() { return true; }]
		]));
	var yAxis = d3.svg.axis().scale(y).orient('left');

	svg.append('text')
		.attr('class', 'label')
		.attr('transform', 'translate(-30, 205), rotate(-90)')
		.text('millions of viewers');

	var line = d3.svg.line()
		.x(function(d) { return x(parseDate(d.air_date)); })
		.y(function(d) { return y(+d.viewers); });


	d3.tsv('data/tv_shows.tsv', function(error, data) {

		// define axes
		var x_axis_g = svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(xAxis)
			.selectAll('text');
		var y_axis_g = svg.append('g')
			.attr('class', 'y axis')
			.call(yAxis);


		// aggregate data; separate into line data and point data
		var	pointData = {local: [], basic: [], premium: []},
			lineData = {local: [], basic: [], premium: []};
		for (var i = 0; i < data.length; i++) {
			pointData[data[i].network_type].push(data[i]);

			var dataByShow = lineData[data[i].network_type];
			if (dataByShow.length === 0) dataByShow.push([]);
			else {
				// treat as another part of season if air dates more than a month apart
				var days_apart = (parseDate(data[i].air_date) - parseDate(data[i-1].air_date))/86400000;
				if (data[i].show !== data[i-1].show || data[i].season !== data[i-1].season || days_apart > 30) {
					dataByShow.push([]);
				}
			}
			dataByShow[dataByShow.length - 1].push(data[i]);			
		}

		svg.defineScale = function(type) {
			y.domain([0, d3.max(pointData[type], function(d) { return +d.viewers; })]);
			y.nice();
			y_axis_g.call(yAxis);
		};

		for (var type in pointData) {
			var colors = d3.scale.category10();
			
			svg.defineScale(type);
			var chartGroup = svg.append('g')
				.attr('class', 'chart-group')
				.attr('name', type)
				.classed('hidden', function() {
					return d3.select('.btn.active').attr('name') !== type;
				});

			// scatterplot
			chartGroup.selectAll('circle')
				.data(pointData[type])
				.enter().append('circle')
					.attr('class', 'point')
					.attr('r', 3)
					.attr('cx', function(d) { return x(parseDate(d.air_date)); })
					.attr('cy', function(d) { return y(d.viewers); })
					.style('fill', function(d) { return colors(d.show + ', ' + d.network); });

			// lines connecting points
			chartGroup.selectAll('path')
				.data(lineData[type])
				.enter().append('path')
					.attr('class', 'line')
					.attr('d', line)
					.style('stroke', function(d) { return colors(d[0].show + ', ' + d[0].network); });


			// add legend
			var legend = chartGroup.append('g')
				.attr('class', 'legend')
				.attr('transform', 'translate(30, 10)');
			var legendRow = legend.selectAll('g')
				.data(colors.domain())
				.enter().append('g')
					.attr('transform', function(d, i) {
						return 'translate(0,' + 15*i + ')';
					});
			legendRow.append('circle')
				.attr('r', 4)
				.style('fill', function(d) { return colors(d); });
			legendRow.append('text')
				.attr('x', 10)
				.attr('y', 4)
				.text(function(d) { return d; });
		}

		// define scale for active network type
		svg.defineScale(d3.select('.btn.active').attr('name'));
	});

	// list source
	d3.select('.post-content').append('div')
		.attr('class', 'source')
		.text('Source: Wikipedia');
})();