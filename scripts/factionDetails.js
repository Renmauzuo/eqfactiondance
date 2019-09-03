$(function () {
	var queries = {};
	$.each(document.location.search.substr(1).split('&'),function(c,q){
		var i = q.split('=');
		queries[i[0].toString()] = i[1].toString();
	});

	var factionId = parseInt(queries['faction']);
	var factionInfo = factionList[factionId];
	$('<h1></h1>').html(factionInfo.name).appendTo('#info-wrapper');

	var importanceString;

	switch(factionInfo.importance) {
		case 0:
			importanceString = "Expendable";
			break;
		case 1:
			importanceString = "Unimportant"
			break;
		case 2: 
			importanceString = "Important";
			break;
	}  

	$('<p>'+importanceString+" Faction</p>").appendTo('#info-wrapper');

	$('<p><strong>Description:</strong></p>').appendTo('#info-wrapper');
	var description = factionInfo.description || "No description available.";
	$('<p></p>').html(description).appendTo('#info-wrapper');

	$('<p><strong>How to increase:</strong></p>').appendTo('#info-wrapper');
	var howToRaise = factionInfo.howToRaise || "There are no known ways to raise this faction.";
	$('<p></p>').html(howToRaise).appendTo('#info-wrapper');

	if (factionInfo.factionsLowered) {
		$('<p>Raising this faction is likely to damage standing with:</p>').appendTo('#info-wrapper');
		var factionsLowered = factionInfo.factionsLowered;
		for (var i = 0; i < factionsLowered.length; i++) {
			$('<a href="faction-details.html?faction='+factionsLowered[i]+'">'+factionList[factionsLowered[i]].name+'</a>').appendTo('#info-wrapper');
			$('<br/>').appendTo('#info-wrapper');
		}
	}

	$('<p><strong>Allies:</strong></p>').appendTo('#info-wrapper');
	if (factionInfo.allies) {
		for (var i = 0; i < factionInfo.allies.length; i++) {
			$('<a href="faction-details.html?faction='+factionInfo.allies[i]+'">'+factionList[factionInfo.allies[i]].name+'</a>').appendTo('#info-wrapper');
			$('<br/>').appendTo('#info-wrapper');
		}
	} else {
		$('<p>None</p>').appendTo('#info-wrapper');
	}

	$('<p><strong>Enemies:</strong></p>').appendTo('#info-wrapper');
	if (factionInfo.enemies) {
		for (var i = 0; i < factionInfo.enemies.length; i++) {
			$('<a href="faction-details.html?faction='+factionInfo.enemies[i]+'">'+factionList[factionInfo.enemies[i]].name+'</a>').appendTo('#info-wrapper');
			$('<br/>').appendTo('#info-wrapper');
		}
	} else {
		$('<p>None</p>').appendTo('#info-wrapper');
	}

	$('<p><strong>Ally of:</strong></p>').appendTo('#info-wrapper');
	var allyList = [];
	for (var i = 0; i < factionList.length; i++) {
		if (factionList[i].allies && factionList[i].allies.includes(factionId)) {
			allyList.push(i);
		}
	}
	if (allyList.length) {
		for (var i = 0; i < allyList.length; i++) {
			$('<a href="faction-details.html?faction='+allyList[i]+'">'+factionList[allyList[i]].name+'</a>').appendTo('#info-wrapper');
			$('<br/>').appendTo('#info-wrapper');
		}
	} else {
		$('<p>None</p>').appendTo('#info-wrapper');
	}


	$('<p><strong>Enemy of:</strong></p>').appendTo('#info-wrapper');
	var enemyList = [];
	for (var i = 0; i < factionList.length; i++) {
		if (factionList[i].enemies && factionList[i].enemies.includes(factionId)) {
			enemyList.push(i);
		}
	}
	if (enemyList.length) {
		for (var i = 0; i < enemyList.length; i++) {
			$('<a href="faction-details.html?faction='+enemyList[i]+'">'+factionList[enemyList[i]].name+'</a>').appendTo('#info-wrapper');
			$('<br/>').appendTo('#info-wrapper');
		}
	} else {
		$('<p>None</p>').appendTo('#info-wrapper');
	}

});