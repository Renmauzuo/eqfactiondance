var completedFactions;


$(function () {
	if (!localStorage['completedFactions']) {
		localStorage['completedFactions'] = "[]";
	}

	completedFactions = JSON.parse(localStorage['completedFactions']);
	
	refreshLists();

	$('#safe-factions, #unsafe-factions').on('click', 'button', function () {
		completedFactions.push($(this).data('faction'));
		localStorage['completedFactions'] = JSON.stringify(completedFactions);
		refreshLists();
	});
});

function createFactionListItem(id) {
	$itemContainer = $('<div></div>');
	$('<button data-faction="'+id+'">Hide Faction</button>').appendTo($itemContainer);
	$('<a href="faction-details.html?faction='+id+'">'+factionList[id].name+'</a>').appendTo($itemContainer);
	return $itemContainer;
}

function refreshLists() {
	$('#safe-factions, #unsafe-factions').empty();
	
	var incompleteFactions = factionList.filter(function (faction) {
		//If faction cannot be raised then remove it		
		if (!faction.howToRaise) {
			return false;
		}

		//Filter out faction if it's already completed (or skipped)
		if (completedFactions.includes(factionList.indexOf(faction))) {
			return false;
		}

		return true;
	});

	var safeFactions = [];
	var unsafeFactions = [];
	//For every incomplete faction check it against every other incomplete faction to make sure none will hurt it
	for (var i = 0; i < incompleteFactions.length; i++) {
		var factionId = factionList.indexOf(incompleteFactions[i]);
		var factionSafe = true;
		for (var j = 0; j < incompleteFactions.length; j++) {
			if (incompleteFactions[j].factionsLowered && incompleteFactions[j].factionsLowered.includes(factionId)) {
				factionSafe = false;
				break;
			}
		}
		if (factionSafe) {
			safeFactions.push(factionId);
		} else {
			unsafeFactions.push(factionId);
		}
	}

	for (var i = 0; i < safeFactions.length; i++) {
		$('#safe-factions').append(createFactionListItem(safeFactions[i]));
	}

	for (var i = 0; i < unsafeFactions.length; i++) {
		$('#unsafe-factions').append(createFactionListItem(unsafeFactions[i]));
	}
}