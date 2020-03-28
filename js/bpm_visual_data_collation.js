var minBpm = 78, maxBpm = 155;
$.ajax({
	type: 'GET',
	url: 'data/music_collection_091416.xml',
	dataType: 'xml',
	success: function(data) {
		var bpmFreq = {};
		for (var i = minBpm; i <= maxBpm; i++) bpmFreq[i] = 0;
		
		$(data).find('TEMPO').each(function() {
			var bpm = parseFloat($(this).attr('BPM'));
			while (bpm < minBpm) bpm *= 2;
			while (bpm > maxBpm) bpm /= 2;
			bpmFreq[Math.round(bpm)]++;
		});
		//console.log(bpmFreq);
		
		var tsvData = [];
		for (var bpm in bpmFreq) {
			tsvData.push([bpm, bpmFreq[bpm]]);
		}
		console.log(d3.tsv.formatRows(tsvData));
	}
});
