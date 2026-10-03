var completedFactions;
var factionFileReader;

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

	factionFileReader = new FileReader();
	factionFileReader.onload = onFactionFileLoad;

	$('#faction-file').on('change', function () {
		let file = $(this).prop('files')[0];
		if (file) {
			factionFileReader.readAsText(file);
		}
	});


    if (localStorage['minimum-importance']) {
        $('#minimum-importance').val(localStorage['minimum-importance']);
    }
    $('#minimum-importance').on('change', function () {
        localStorage['minimum-importance'] = $(this).val();
        refreshLists();
    });

    if (localStorage['maximum-era']) {
        $('#maximum-era').val(localStorage['maximum-era']);
    }
    $('#maximum-era').on('change', function () {
        localStorage['maximum-era'] = $(this).val();
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
    var maximumEra = parseInt($('#maximum-era').val());

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

        //Filter out faction if it's from a later era than selected
        if (faction.era > maximumEra) {
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

/* ------------------------------------------------------------------ *
 * Faction output file import
 *
 * EverQuest's faction output file is a tab-delimited table with these
 * columns:
 *   ID            - the in-game faction ID (NOT our array index)
 *   Name          - the faction name
 *   StandingValue - the player's current standing
 *   PointsToMax   - points still needed to reach max standing
 *
 * We match rows to our own factions by name (our IDs are array indices
 * and do not line up with the game IDs). A faction counts as "maxed"
 * when PointsToMax is 0 (nothing left to gain).
 *
 * NOTE: If name matching proves too brittle we could instead store each
 * faction's in-game ID in data.js and match on that, or rework our own
 * IDs to match the game IDs outright.
 * ------------------------------------------------------------------ */

const FACTION_FILE_NAME_COLUMN = "Name";
const FACTION_FILE_POINTS_TO_MAX_COLUMN = "PointsToMax";

function onFactionFileLoad() {
	try {
		let maxedNames = parseFactionFile(factionFileReader.result);
		let fullReset = $('#import-full-reset:checked').length > 0;
		applyFactionStandings(maxedNames, fullReset);
	} catch (e) {
		console.error(e);
		setImportStatus("Could not read that file. Please make sure it's a faction output file.");
	}
}

/**
 * Parse the raw faction output file and return the set of maxed faction
 * names. A faction is maxed when its PointsToMax column is 0.
 *
 * Mirrors the inventory helper's approach of treating the dump as a
 * tab-delimited table and converting it to CSV for $.csv.toObjects.
 *
 * @param {string} raw Raw text contents of the uploaded file.
 * @returns {Object} Set keyed by normalized faction name -> true.
 */
function parseFactionFile(raw) {
	// Convert the tab-delimited dump to CSV, matching the inventory helper.
	let csv = raw.replace(/\t/g, ",");
	let rows = $.csv.toObjects(csv);

	let maxedNames = {};
	for (let i = 0; i < rows.length; i++) {
		let row = rows[i];
		let name = row[FACTION_FILE_NAME_COLUMN];
		if (!name) {
			continue;
		}
		let pointsToMax = parseInt(row[FACTION_FILE_POINTS_TO_MAX_COLUMN], 10);
		if (pointsToMax === 0) {
			maxedNames[normalizeFactionName(name)] = true;
		}
	}
	return maxedNames;
}

/**
 * Normalize a faction name for matching between the file and our data set.
 * Lower-cases, trims, and collapses the apostrophe variants EQ uses
 * (e.g. "Ak`Anon" vs "Ak'Anon"). Expand this if other mismatches surface.
 */
function normalizeFactionName(name) {
	return String(name)
		.trim()
		.toLowerCase()
		.replace(/[`'’]/g, "'");
}

/**
 * From the set of maxed faction names in the file, return the set of our
 * faction IDs (array indices) that are maxed, matched by normalized name.
 */
function matchMaxedToFactions(maxedNames) {
	let maxedIds = {};
	for (let id = 0; id < factionList.length; id++) {
		let key = normalizeFactionName(factionList[id].name);
		if (maxedNames[key]) {
			maxedIds[id] = true;
		}
	}
	return maxedIds;
}

/**
 * Apply the parsed maxed factions to the hidden (completed) faction list.
 *
 * Only "safe" maxed factions are hidden. After each round of hiding we
 * recompute which factions are now safe (because their only threats were
 * just hidden) and hide any newly-safe maxed factions, repeating until no
 * further changes occur.
 *
 * @param {Object} maxedNames Set of normalized faction name -> true.
 * @param {boolean} fullReset When true, replace the saved hidden list
 *        entirely; otherwise only add to it.
 */
function applyFactionStandings(maxedNames, fullReset) {
	// Set of our faction IDs that are maxed in the file.
	let maxedIds = matchMaxedToFactions(maxedNames);

	// Start from either an empty list (full reset) or the current list.
	let hidden = fullReset ? [] : completedFactions.slice();
	let hiddenSet = {};
	for (let i = 0; i < hidden.length; i++) {
		hiddenSet[hidden[i]] = true;
	}

	// Repeatedly hide maxed factions that are currently safe. Hiding a
	// faction can make its (now-removed) threats irrelevant, which may make
	// other maxed factions safe, so we loop until nothing new is hidden.
	let changed = true;
	while (changed) {
		changed = false;

		let safeIds = computeSafeFactionIds(hiddenSet);

		for (let id in maxedIds) {
			let numericId = parseInt(id, 10);
			if (!hiddenSet[numericId] && safeIds[numericId]) {
				hiddenSet[numericId] = true;
				hidden.push(numericId);
				changed = true;
			}
		}
	}

	completedFactions = hidden;
	localStorage['completedFactions'] = JSON.stringify(completedFactions);
	refreshLists();

	setImportStatus("Imported faction standings. Hidden factions updated.");
}

/**
 * Compute the set of faction IDs that are currently "safe" given a set of
 * already-hidden factions. A faction is safe if no other non-hidden,
 * raiseable, in-scope faction lowers it.
 *
 * This mirrors the safe/unsafe logic in refreshLists() but operates on an
 * arbitrary hidden set so we can test hypothetical rounds of hiding. It
 * applies the same minimum-importance and maximum-era preferences, so
 * factions the user doesn't care about (below their importance threshold
 * or from a later era) are not treated as threats.
 *
 * @param {Object} hiddenSet Map of faction ID -> true for hidden factions.
 * @returns {Object} Map of faction ID -> true for safe factions.
 */
function computeSafeFactionIds(hiddenSet) {
	let minimumImportance = parseInt($('#minimum-importance').val());
	let maximumEra = parseInt($('#maximum-era').val());

	// Factions still in play: raiseable, not hidden, and within the user's
	// importance and era preferences.
	let active = [];
	for (let id = 0; id < factionList.length; id++) {
		let faction = factionList[id];
		if (!faction.howToRaise) {
			continue;
		}
		if (hiddenSet[id]) {
			continue;
		}
		if (faction.importance < minimumImportance) {
			continue;
		}
		if (faction.era > maximumEra) {
			continue;
		}
		active.push(id);
	}

	let safe = {};
	for (let i = 0; i < active.length; i++) {
		let factionId = active[i];
		let isSafe = true;
		for (let j = 0; j < active.length; j++) {
			let other = factionList[active[j]];
			if (other.factionsLowered && other.factionsLowered.includes(factionId)) {
				isSafe = false;
				break;
			}
		}
		if (isSafe) {
			safe[factionId] = true;
		}
	}
	return safe;
}

function setImportStatus(message) {
	$('#import-status').text(message);
}
