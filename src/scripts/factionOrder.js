var completedFactions;

$(function () {
	if (!localStorage['completedFactions']) {
		localStorage['completedFactions'] = "[]";
	}

	completedFactions = JSON.parse(localStorage['completedFactions']);
	
	$('.order-list').on('click', 'button', function () {
		completedFactions.push($(this).data('faction'));
		localStorage['completedFactions'] = JSON.stringify(completedFactions);
		refreshLists();
	});


    if (localStorage['minimum-importance']) {
        $('#minimum-importance').val(localStorage['minimum-importance']);
    }
    $('#minimum-importance').on('change', function () {
        localStorage['minimum-importance'] = $(this).val();
        refreshLists();
    });

	refreshLists();
});

function createFactionListItem(id) {
	let $itemContainer = $('<div></div>');
	$('<button data-faction="'+id+'">Hide Faction</button>').appendTo($itemContainer);
	$('<a href="faction-details.html?faction='+id+'">'+factionList[id].name+'</a>').appendTo($itemContainer);
	return $itemContainer;
}

function refreshLists() {
	$('.order-list').empty();
    var minimumImportance = parseInt($('#minimum-importance').val());

	var incompleteFactions = factionList.filter(function (faction) {
		//If faction cannot be raised then remove it		
		if (!faction.howToRaise) {
			return false;
		}

		//Filter out faction if it's already completed (or skipped)
		if (completedFactions.includes(factionList.indexOf(faction))) {
			return false;
		}

        //Filter out faction if it falls below our minimum threshold
        if (faction.importance < minimumImportance) {
            return false;
        }

		return true;
	});

	var safeFactions = [];
	var unsafeFactions = [];
    var opposedFactions = [];
	//For every incomplete faction check it against every other incomplete faction to make sure none will hurt it
	for (var i = 0; i < incompleteFactions.length; i++) {
		var factionId = factionList.indexOf(incompleteFactions[i]);
		var factionSafe = true;
		for (var j = 0; j < incompleteFactions.length; j++) {
			if (incompleteFactions[j].factionsLowered && incompleteFactions[j].factionsLowered.includes(factionId)) {
				factionSafe = false;

                //Check if this is bidirectional
                let opposedFactionId = factionList.indexOf(incompleteFactions[j]);
                if (incompleteFactions[i].factionsLowered && incompleteFactions[i].factionsLowered.includes(opposedFactionId)) {
                    //To prevent duplicates only add it if j is higher than i
                    if (j > i) {
                        opposedFactions.push([factionId, opposedFactionId]);
                    }
                }

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

    for (var i = 0; i < opposedFactions.length; i++) {
        let $factionRow = $('<div></div>');
		$factionRow.append(createFactionListItem(opposedFactions[i][0]));
		$factionRow.append(createFactionListItem(opposedFactions[i][1]));
        $factionRow.appendTo('#opposed-factions');
	}
}