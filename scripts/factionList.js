$(function () {
	//TODO: Faction list sorting and filtering
	for (var i = 0; i < factionList.length; i++) {
		$factionContainer = $('<div class="faction-list-container"></div>');
		$factionContainer.appendTo('#list-wrapper');
		$('<a class="faction-info-link" href="#" data-faction="'+i+'">'+factionList[i].name+'</a>').appendTo($factionContainer);
	}

	$('body').on('click', '.faction-list-container a.faction-info-link', function (e) {
		e.preventDefault();

		$factionInfo = $(this).data('info-block');

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

});