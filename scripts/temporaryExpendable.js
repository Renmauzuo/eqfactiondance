$(function () {

	var unraisableFactions = [];

	//Candidate factions are Important or Unimportant factions that can be increased.
	//We'll check what factions they decrease later as that will be done recursively.
	var candidateFactions = factionList.filter(function (faction) {
		//Filter out faction if it's expendable
		if (faction.importance <= importanceOptionalExpendable) {
			return false;
		}

		//If faction cannot be raised then remove it		
		if (!faction.howToRaise) {
			unraisableFactions.push(faction);
			return false;
		}

		return true;
	});

	var factionsToAdd;
	var temporarilyExpendableFactions = [];
	do {
		factionsToAdd = candidateFactions.filter(function (faction) {
			if (faction.factionsLowered) {
				for (var i = 0; i < faction.factionsLowered.length; i++) {
					var factionLowered = factionList[faction.factionsLowered[i]];
					//If lowered faction is neither expendable nor temporarily expendable this faction isn't one to add (yet)
					if (!(factionLowered.importance <= importanceOptionalExpendable || temporarilyExpendableFactions.includes(factionLowered))) {
						return false;
					}
				}
			}

			return true;
		});

		temporarilyExpendableFactions = temporarilyExpendableFactions.concat(factionsToAdd);
		//Remove added factions from candidate list
		candidateFactions = candidateFactions.filter(function (faction) {
			return !factionsToAdd.includes(faction);
		});
		//Continue running until no factions are added, as added factions may open up other candidates
	} while (factionsToAdd.length > 0);

	temporarilyExpendableFactions.sort(function (a, b) {
		return a.name.localeCompare(b.name);
	});

	for (var i = 0; i < temporarilyExpendableFactions.length; i++) {
		var id = factionList.indexOf(temporarilyExpendableFactions[i]);
		$('<a href="faction-details.html?faction='+id+'">'+temporarilyExpendableFactions[i].name+'</a>').appendTo('#temporarily-expendable');
		$('<br/>').appendTo('#temporarily-expendable');
	}

	//Leftover candidate factions plus any unraisable factions are not expendable
	var nonExpendableFactions = candidateFactions.concat(unraisableFactions);

	nonExpendableFactions.sort(function (a, b) {
		return a.name.localeCompare(b.name);
	});

	for (var i = 0; i < nonExpendableFactions.length; i++) {
		var id = factionList.indexOf(nonExpendableFactions[i]);
		$('<a href="faction-details.html?faction='+id+'">'+nonExpendableFactions[i].name+'</a>').appendTo('#not-expendable');
		$('<br/>').appendTo('#not-expendable');
	}

});