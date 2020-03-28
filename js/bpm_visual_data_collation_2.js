const minBpm = 87.5, maxBpm = 175;
$.ajax({
	type: 'GET',
	url: 'data/music_collection_070917.xml',
	dataType: 'xml',
	success: (data) => {
		const tsvData = [];
		console.log(data);

		$(data).find('COLLECTION').find('ENTRY').each(function() {
			const $song = $(this);

			const title = $song.attr('TITLE');
			const artist = $song.attr('ARTIST');

			const info = $song.find('INFO');
			const key = info.attr('KEY');
			const importDate = info.attr('IMPORT_DATE');

			let bpm = parseFloat($song.find('TEMPO').attr('BPM'));
			while (bpm < minBpm) bpm *= 2;
			while (bpm > maxBpm) bpm /= 2;

			tsvData.push([
				title,
				artist,
				bpm,
				key,
				importDate,
			]);
		});
		
		console.log(d3.tsv.formatRows(tsvData));
	}
});
