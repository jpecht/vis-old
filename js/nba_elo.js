/*
 * author: @jpecht
 */

(function() {
	var COLORS = ['rgba(215,25,28,0.4)','rgba(253,174,97,0.4)','rgba(255,255,191,0.4)','rgba(171,217,233,0.4)','rgba(44,123,182,0.4)'];
	COLORS.reverse();
	
	d3.tsv('data/nba_scores_2014.tsv', function(error, data) {
		
		// initialize rating for each team
		var teams = {};
		var teamNames = getUnique(data, 'Team1');
		for (var i = 0; i < teamNames.length; i++) {
			teams[teamNames[i]] = {rating32: 1200, rating16: 1200, wins: 0, losses: 0};
		}
		
		// go through each game to adjust elo rating and count wins and losses
		for (var i = 0; i < data.length; i++) {
			var teamOne = data[i]['Team1'];
			var teamTwo = data[i]['Team2'];
			var teamOneWin = (data[i]['Score1'] > data[i]['Score2']) ? 1 : 0;
			var teamTwoWin = (teamOneWin === 1) ? 0 : 1;

			// record win or loss
			teams[teamOne].wins += teamOneWin;
			teams[teamTwo].wins += teamTwoWin;
			teams[teamOne].losses += teamOneWin ? 0 : 1;			
			teams[teamTwo].losses += teamTwoWin ? 0 : 1;			
			
			// adjust elo rating
			var expected32 = calcOutcome(teams[teamOne].rating32, teams[teamTwo].rating32);
			teams[teamOne].rating32 = teams[teamOne].rating32 + 32*(teamOneWin - expected32);
			teams[teamTwo].rating32 = teams[teamTwo].rating32 + 32*(teamTwoWin - expected32);

			var expected16 = calcOutcome(teams[teamOne].rating16, teams[teamTwo].rating16);
			teams[teamOne].rating16 = teams[teamOne].rating16 + 16*(teamOneWin - expected16);
			teams[teamTwo].rating16 = teams[teamTwo].rating16 + 16*(teamTwoWin - expected16);
		}
		
		// reduce object to array and sort by rating in descending order		
		var teamArray = [];
		for (var t in teams) {
			teamArray.push({
				name: t,
				rating32: +teams[t].rating32,
				rating16: +teams[t].rating16,
				winpct: teams[t].wins / (teams[t].wins + teams[t].losses)
			});
		}		
		teamArray.sort(function(a, b) { return b.winpct - a.winpct; });
		
		// calculate rank order for K-32 elo and K-16 elo
		var ranks32 = [], ranks16 = [];
		for (var i = 0; i < teamArray.length; i++) {
			ranks32.push({index: i, rank: teamArray[i].rating32});
			ranks16.push({index: i, rank: teamArray[i].rating16});
		}
		ranks32.sort(function(a, b) { return b.rank - a.rank; });
		ranks16.sort(function(a, b) { return b.rank - a.rank; });
		
		// create title row
		var tbody = d3.select('.results').append('tbody');
		var titleRow = tbody.append('tr').attr('class', 'title-row');
		titleRow.append('td').html('#');
		titleRow.append('td').html('Team');
		titleRow.append('td').attr('class', 'winpct-cell').html('Win %');
		titleRow.append('td').attr('class', 'rating-cell').html('K-32 Rating');
		titleRow.append('td').attr('class', 'rating-cell').html('K-32 Rank');
		titleRow.append('td').attr('class', 'rating-cell').html('K-16 Rating');
		titleRow.append('td').attr('class', 'rating-cell').html('K-16 Rank');
		
		// write data to table
		var rows = tbody.selectAll('team-row')
			.data(teamArray)
			.enter().append('tr')
				.attr('class', 'team-row');
		rows.append('td').attr('class', 'num-cell').html(function(d, i) { return i+1; });
		rows.append('td').attr('class', 'name-cell').html(function(d) { return d.name; });
		rows.append('td').attr('class', 'winpct-cell').html(function(d) {
			return d3.format('.2f')(d.winpct);
		});
		rows.append('td').attr('class', 'rating-cell rating32-cell').html(function(d) {
			return d3.format('.2f')(d.rating32);
		});
		rows.append('td').attr('class', 'rating-cell rating32-cell').html(function(d, i) {
			d.rank32 = ranks32[i].index;
			return d.rank32 + 1;
		});
		rows.append('td').attr('class', 'rating-cell rating16-cell').html(function(d) {
			return d3.format('.2f')(d.rating16);
		});
		rows.append('td').attr('class', 'rating-cell rating16-cell').html(function(d, i) {
			d.rank16 = ranks16[i].index;
			return d.rank16 + 1;
		});
		

		// set background colors according to rank
		tbody.selectAll('tr:not(.title-row)').style('background-color', function(d, i) {
			return COLORS[Math.floor(i/6)];
		});
		rows.selectAll('.rating32-cell').style('background-color', function(d, i) {
			return COLORS[Math.floor(d.rank32/6)];
		});
		rows.selectAll('.rating16-cell').style('background-color', function(d, i) {
			return COLORS[Math.floor(d.rank16/6)];
		});

	});
	
	var getUnique = function(array, key) {
		var newArray = [];
		for (var i = 0; i < array.length; i++) {
			var match = false;
			for (var j = 0; j < newArray.length; j++) {
				if (array[i][key] === newArray[j]) {
					match = true;
					break;
				}
			}
			if (!match) newArray.push(array[i][key]);
		}
		return newArray;
	};
	
	// function for calculating the resulting rating change given two elo ratings
	var calcOutcome = function(rating1, rating2) {
		return 1 / (1 + Math.pow(10, (rating1 - rating2)/400));		
	};
})();
