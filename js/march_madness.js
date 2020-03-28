// No team is expected to win the National Championship (6)
// No team is expected to get to the National Championship (5)
// 1 seed (-4) is expected to get to the Final Four (4)
// 2 seed (-3) is expected to get to the Elite Eight (3)
// 3-4 seed (-2) is expected to get to the Sweet Sixteen (2)
// 5-8 seed (-1) is expected to get to the Round of 32 (1)
// 9-16 seed (-0) is expected to get to the First Round (0)

(function() {
	var scale = d3.scale.threshold()
		.domain([-20, -10, -6, -3, 3, 6, 10, 20])
		.range(['rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(171,217,233)','rgb(116,173,209)','rgb(69,117,180)']);

	d3.tsv('data/march_madness.tsv', function(error, data) {
		var resultsByTeam = {};
		data.forEach(function(d) {
			for (var j = 1; j <= 2; j++) {
				var team = d['TEAM' + j];
				var seed = +d['SEED' + j];
				var round = d['ROUND'];
				var won = d['SCORE' + j] > d['SCORE' + (3-j)];
				if (!won || round === 'National Championship') {
					if (!resultsByTeam.hasOwnProperty(team)) resultsByTeam[team] = [];
					var gameResult = {
						round: round,
						won: won,
						seed: seed,
						points: +d['SCORE' + j]
					};
					var resultScore = -1;
					if (round === 'First Round') resultScore = 0;
					else if (round === 'Second Round') resultScore = 1;
					else if (round === 'Sweet 16') resultScore = 2;
					else if (round === 'Elite Eight') resultScore = 3;
					else if (round === 'Final Four') resultScore = 4;
					else if (round === 'National Championship') resultScore = won ? 6 : 5;
					
					var seedBonus = Math.ceil(Math.log(seed)/Math.log(2)) - 4;
					gameResult.score = resultScore + seedBonus;
					resultsByTeam[team].push(gameResult);
				}
			}
		});

		var teamRanks = [];
		for (var team in resultsByTeam) {
			var totalScore = 0;
			resultsByTeam[team].forEach(function(d) { totalScore += d.score; })
			teamRanks.push({team: team, totalScore: totalScore});
			if (team.indexOf('aryland') !== -1) console.log(totalScore);
		}
		teamRanks.sort(function(a, b) { return b.totalScore - a.totalScore; });
		teamRanks = teamRanks.slice(0, 10).concat(teamRanks.slice(teamRanks.length-10));

		var rows = d3.select('.results').selectAll('tr')
			.data(teamRanks)
			.enter().append('tr');
		rows.append('td').html(function(d) { return d.team; });
		rows.append('td').html(function(d) { return d.totalScore; });
		rows.selectAll('td').style('background-color', function(d) {
			return scale(d.totalScore);
		});
	});
})();