(function() {
	var redirectTo = function(url_str) {
		ga('send', 'event', 'post click', url_str, 'from homepage');
		window.location = url_str + '.html';
	};


	// homepage post snippet behavior
	if (Modernizr.touch) {
		// for touch screen devices, no hover so display post info
		/*$('.post-snippet').on('tap', function() {
			if ($(this).hasClass('info-showing')) {
				window.location = $(this).attr('url_str') + '.html';			
			} else {
				$(this).children('.post-info').show();			
			}
			$(this).toggleClass('info-showing');
		});*/
		$('.post-info').show();
		$('.post-snippet').click(function() {
			redirectTo($(this).attr('url_str'));
		});
	} else {
		$('.post-snippet')
			.mouseover(function() {
				$(this).children('.post-info').show();
			})
			.mouseout(function() {
				$(this).children('.post-info').hide();
			})
			.click(function() {
				redirectTo($(this).attr('url_str'));
			});
	}
})();
