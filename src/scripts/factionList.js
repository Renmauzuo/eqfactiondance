$(function () {
	$('body').on('click', '.faction-list-container a.faction-info-link', function (e) {
		e.preventDefault();

		let $factionInfo = $(this).data('info-block');

		if (!$factionInfo) {
			var factionId = $(this).data('faction');
			$factionInfo = $('<div class="faction-list-info"></div>');
			$factionInfo.insertAfter($(this));
			$('<a href="faction-details.html?faction='+factionId+'">View Details</a>').appendTo($factionInfo);
			var howToRaise = factionList[factionId].howToRaise || "There are no known ways to raise this faction.";
			$('<p></p>').html(howToRaise).appendTo($factionInfo);

			if (factionList[factionId].factionsLowered) {
				$('<p>Raising this faction is likely to damage standing with:</p>').appendTo($factionInfo);
				var factionsLowered = factionList[factionId].factionsLowered;
				for (var i = 0; i < factionsLowered.length; i++) {
					$('<a class="faction-info-link" href="#" data-faction="'+factionsLowered[i]+'">'+factionList[factionsLowered[i]].name+'</a>').appendTo($factionInfo);
				}
			}
			$(this).data('info-block', $factionInfo);
		}

		

		$factionInfo.slideToggle();
	});

    if (localStorage['preferred-sort']) {
        $('#sort-by').val(localStorage['preferred-sort']);
    }
    $('#sort-by').on('change', updateFactionList);

    updateFactionList();

});

function updateFactionList() {
    $('#list-wrapper').empty();
    let sortType = $('#sort-by').val();
    localStorage['preferred-sort'] = sortType;

    let factionListCopy = factionList.slice();
    factionListCopy.sort(function(a,b) {
        if (sortType == "Era" && a.era != b.era) {
            return a.era - b.era;
        }

        if (sortType == "Importance" && a.importance != b.importance) {
            return b.importance - a.importance;
        }

        return a.name.localeCompare(b.name);
    });

    if (sortType == "Era") {
        for (let i = 0; i < eraStrings.length; i++) {
            $('<h3 data-era='+i+'>'+eraStrings[i]+'</h3>').appendTo('#list-wrapper');
        }
    } else if (sortType == "Importance") {
        for (let i = 0; i < importanceStrings.length; i++) {
            $('<h3 data-era='+i+'>'+importanceStrings[i]+'</h3>').prependTo('#list-wrapper');
        }
    }

	for (var i = 0; i < factionListCopy.length; i++) {
        let currentFaction = factionListCopy[i];
		let $factionContainer = $('<div class="faction-list-container"></div>');
        let factionId = factionList.indexOf(currentFaction);
		$('<a class="faction-info-link" href="#" data-faction="'+factionId+'">'+currentFaction.name+'</a>').appendTo($factionContainer);

        if (sortType == "Era") {
            let nextLabel = $('h3[data-era='+(currentFaction.era+1)+']');
            if (nextLabel.length) {
                $factionContainer.insertBefore(nextLabel);
            } else {
                $factionContainer.appendTo('#list-wrapper');
            }
        } else if (sortType == "Importance") {
            let nextLabel = $('h3[data-era='+(currentFaction.importance-1)+']');
            if (nextLabel.length) {
                $factionContainer.insertBefore(nextLabel);
            } else {
                $factionContainer.appendTo('#list-wrapper');
            }
        } else {
            $factionContainer.appendTo('#list-wrapper');
        }
	}

}