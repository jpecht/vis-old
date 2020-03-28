/**
 * @author jpecht
 */

// filling out the footer
(function() {
	$('footer').html('<a id="about-link">About</a> | <a href="https://github.com/jpecht/vis" target="_blank">Github</a> | <a href="mailto:me.jefferson@gmail.com">Contact</a>');
	$('#about-popup').html("Hey I'm Jefferson. I keep this blog because I think data visualization is cool...and sometimes I like to make things =P.<br><span style='font-size:0.8em;font-weight:300;'>Data is subject to your own interpretation ;)</span>");

	var aboutIsShowing = false;
	$('#about-link').click(function(e) {
		e.preventDefault();
		toggleAbout();
	});
		
	var toggleAbout = function() {
		$('#about-popup-wrapper').stop();
		if (aboutIsShowing) {
			$('#about-popup-wrapper').animate({opacity: 0}, 400, function() {
				$(this).hide().css('opacity', 1).css('bottom', '0px');
			});
		} else {
			$('#about-popup-wrapper').show()
				.animate({bottom: '50px'}, {
					duration: 1500, 
					specialEasing: {bottom: 'easeOutElastic'}
				});
		}
		aboutIsShowing = !aboutIsShowing;
	};
})();