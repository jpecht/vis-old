/**
 * @author jpecht
 */

// Data Source: http://droughtmonitor.unl.edu/MapsAndData/DataTables.aspx


// using d3.layout.stack: http://bl.ocks.org/mbostock/3885211

/*var date_format = d3.time.format('%U, %Y');
var color = d3.scale.category20();

var margin = {top: 20, right: 10, bottom: 20, left: 10};
var width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
	
var svg = d3.select('#drought-chart').append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
var x_axis = d3.svg.axis().scale(x).orient('bottom');
var y_axis = d3.svg.axis().scale(y).orient('left');
var area = d3.svg.area()
	.x(function(d) { return x(d.date); })
	.y0(function(d) { return y(d.y0); })
	.y1(function(d) { return y(d.y0 + d.y); });

var stack = d3.layout.stack().values(function(d) { return d.values; });

d3.tsv('data/cali_drought.tsv', function(error, data) {
	color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'timestamp'; }));
	
	data.forEach(function(d) {
		//d.date = date_format(new Date(d.timestamp));
	});
	
	var categories = stack(color.domain().map(function(name) {
		return {
			name: name,
			values: data.map(function(d) {
				return {date: d.timestamp, y: d[name] / 100};
			})
		};
	}));
	
	x.domain(d3.extent(data, function(d) { return d.timestamp; }));
	
	var category = svg.selectAll('.category')
		.data(categories)
		.enter().append('g')
			.attr('class', 'category');
	
	category.append('path')
		.attr('class', 'area')
		.attr('d', function(d) { return area(d.values); })
		.style('fill', function(d) { return color(d.name); });
		
	category.append('text')
		.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
		.attr('transform', function(d) { return 'translate(' + x(d.value.date) + ',' + y(d.value.y0 + d.value.y / 2) + ')'; })
		.attr('x', -6)
		.attr('dy', '.35em')
		.text(function(d) { return d.name; });	
	
	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(x_axis);
	svg.append('g')
		.attr('class', 'y axis')
		.call(y_axis);
});
*/

// using chart js; problem is inability to customize x-axis labels and gridlines
Chart.defaults.global.showTooltips = false;
Chart.defaults.global.scaleLabel = '<%=value%>%';
Chart.defaults.global.animation = false;
Chart.defaults.global.responsive = true;

(function() {
	var OrRd = ['rgb(254,240,217)','rgb(253,212,158)','rgb(253,187,132)','rgb(252,141,89)','rgb(227,74,51)','rgb(179,0,0)'];
	
	var chart_width = ($(window).width() < 600) ? $(window).width() - 60 : 600,
		chart_height = 200;
		
	$('#drought-chart')
		.attr('width', chart_width)
		.attr('height', chart_height);
	
	d3.tsv('data/cali_drought.tsv', function(error, unf_data) {	
		// initialize datasets
		var data_coll = {labels: [], datasets: []};
		for (var i = 0; i <= 5; i++) {
	 		var dataset = {
	 			label: i,
	 			data: [],
	 			fillColor: OrRd[i]
	 		};
	 		
	 		data_coll.datasets.push(dataset);
		}
		
		
		// adding data
		var date_format = d3.time.format('%Y');
		var curr_year = -1;
		for (var i = 220; i < unf_data.length; i++) {
			var year = date_format(new Date(+unf_data[i].timestamp * 1000));
			(year === curr_year) ? data_coll.labels.push('') : data_coll.labels.push(year);
			curr_year = year;
			
			data_coll.datasets[0].data.push(100);
			for (var j = 0; j <= 4; j++) {
				data_coll.datasets[j+1].data.push(unf_data[i][j]);
			}
		}
		
		// making slider
		/*$('#drought-slider').noUiSlider({
			start: [2000, 2014],
			connect: true,
			step: 1,
			range: {'min': 2000, 'max': 2014},
			orientation: 'horizontal'
		}).on({
			slide: function() {
				var years = $(this).val();
				$('#drought-slider-text').html('Range: ' + parseInt(years[0]) + '-' + parseInt(years[1]));
				
				// duplicate full data, crop and set
				var cropped_data = {labels: [], datasets: []};
				for (var i = 0; i < data_coll.datasets.length; i++) {
					cropped_data.datasets.push({
						label: data_coll.datasets[i].label,
						fillColor: data_coll.datasets[i].fillColor,
						data: []
					});
				}
				
				var on_switch = false;
				for (var i = 0; i < data_coll.labels.length; i++) {
					var year = data_coll.labels[i];
					if (year !== '') {
						if (year == parseInt(years[0])) on_switch = true;
						else if (year == parseInt(years[1])) on_switch = false;
					}
					
					if (on_switch) {
						cropped_data.labels.push(data_coll.labels[i]);
						for (var j = 0; j < data_coll.datasets.length; j++) {
							cropped_data.datasets[j].data.push(data_coll.datasets[j].data[i]);
						}
					}
				}
				incomeChart.datasets = cropped_data.datasets;
				incomeChart.labels = cropped_data.labels;
				incomeChart.update();
			}
		});*/
		
		// drawing chart
	 	var ctx = document.getElementById('drought-chart').getContext('2d');
	 	var incomeChart = new Chart(ctx).Line(data_coll, {
	 		scaleGridLineColor: 'rgba(0,0,0,0.05)',
	 		datasetStroke: false,
	 		pointDot: false
	 	});
	});
})();