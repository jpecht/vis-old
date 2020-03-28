(function() {
	NProgress.start();
	
	// object to store data
	var dataById = {};
	
	// define map attributes
	var width = 600,
		height = 420;		
	var projection = d3.geo.mercator()
		.center([-77.03, 38.9])
		.scale(1200 * 70)
		.translate([width / 2, height / 2]);	
	var path = d3.geo.path()
		.projection(projection);		
	var svg = d3.select('.map')
		.attr('width', width)
		.attr('height', height);
		
	// define the color scale
	var blue3 = ['rgb(236,231,242)','rgb(166,189,219)','rgb(43,140,190)'];
	var blue5 = ['rgb(241,238,246)','rgb(189,201,225)','rgb(116,169,207)','rgb(43,140,190)','rgb(4,90,141)'];
	var colorScale = d3.scale.quantile();
		
	// define number formatting
	var dec1 = d3.format('.1%');
	var dec2 = d3.format('.2%');
	var money = function(num) { return d3.format('$f')(num/1000) + 'k'; };

	// define the legend
	var legend = d3.select('.legend').attr('height', '50px');

	// define button behavior
	$('.btn-group .btn').click(function() {
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
	});
		
	$('.char-btn-group .btn').click(function() {
		goToIndicator($(this).attr('ref'));
	});
	$('.race-btn-group .btn, .education-btn-group .btn').click(function() {
		color($(this).attr('ref'));
	});

	var ready = function(error, dc, data) {			
		// draw topojson paths on map
		svg.selectAll('path')
			.data(topojson.feature(dc, dc.objects.bgs).features)
			.enter().append('path')
				.attr('class', 'block-group')
				.attr('d', path);
		
		// collect data into object by id
		for (var i = 0; i < data.length; i++) dataById[data[i].geoid] = data[i];
		
		// color with default attribute
		goToIndicator($('.char-btn-group .btn.active').attr('ref'));
		
		NProgress.done();		
	};
	
	var color = function(attr) {
		// set domain of coloring scale
		var domain = [];
		svg.selectAll('path').each(function(d) {
			domain.push(getValue(dataById[d.id], attr, d));
		});
		colorScale.domain(domain).range(blue5);
		
		// check if more than one quantile is 0, then change to less colors
		var quantiles = colorScale.quantiles();
		if (quantiles[0] === 0) {
			colorScale.range(blue3);
			updateLegend(blue3);
		} else {
			updateLegend(blue5);
		}
		
		// color block groups
		svg.selectAll('path').transition()
			.style('fill', function(d) {
				return colorScale(getValue(dataById[d.id], attr, d)); 
			});

		// adjust legend
		quantiles = colorScale.quantiles();
		legend.selectAll('text')
			.html(function(d, i) {
				if (i < quantiles.length) {
					if (attr === 'income') return money(quantiles[i]);
					else if (attr === 'asian' || attr === 'associates' || attr === 'prof' || attr === 'phd') return dec2(quantiles[i]);
					else return dec1(quantiles[i]);
				}
			});
	};
	
	var updateLegend = function(range) {
		var legend = d3.select('.legend')
			.attr('width', (50 * range.length) + 'px');
		var legendBars = legend.selectAll('g')
			.data(range);
		var newBars = legendBars.enter().append('g')
			.attr('transform', function(d, i) { return 'translate('+ 50*i + ',0)'; });
		newBars.append('rect')
			.attr('height', '15px')
			.attr('width', '50px');
		newBars.append('text')
			.attr('class', 'legend-text')
			.attr('x', '50px')
			.attr('y', '29px')
			.style('text-anchor', 'middle');
		legendBars.each(function(d) {
			d3.select(this).select('rect').attr('fill', d);
		});
		legendBars.exit().remove();
	};
	
	var goToIndicator = function(ref) {
		if (ref === 'race') {
			$('.race-btn-group').css('display', 'inline-block');
			color($('.race-btn-group .btn.active').attr('ref'));			
		} else $('.race-btn-group').hide();
		
		if (ref === 'education') {
			$('.education-btn-group').css('display', 'inline-block');
			color($('.education-btn-group .btn.active').attr('ref'));			
		} else $('.education-btn-group').hide();
		
		if (ref !== 'race' && ref !== 'education') color(ref);		
	};
	
	var getValue = function(d, attr, ele) {
		if (attr === 'white' || attr === 'black' || attr === 'asian' || attr === 'hispanic') return d[attr] / d.pop;
		else return d[attr];
	};

	queue()
		.defer(d3.json, 'data/dc.json')
		.defer(d3.tsv, 'data/dc_indicators.tsv')
		.await(ready);
})();