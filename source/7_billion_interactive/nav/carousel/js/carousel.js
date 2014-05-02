require(['jquery-1', 'gelui-1', 'istats-1'], function($, gelui, istats)  {
	$(document).ready(function() {
		var nav_carousel = new gelui.Carousel('#nav_content_2');
		nav_carousel.items = $('#nav_content_2 li');
		
		//Get item width
		var item_width = $('#nav_content_2 li').outerWidth()+1;
		//var right_extreme = 411;
		var right_extreme = (item_width*$("#nav_content_2 li").length)-$('.gelui-carousel-viewport').width()-1;
		
		nav_carousel.signals.move.add(function(e) {
			e.preventDefault();
		});

		$(".gelui-carousel ul").css("width", (($("#nav_content_2 li").length+1) * item_width));

		/* Handle end button interaction states */
		$('.gelui-carousel-button').bind('mousedown mouseup mouseleave', function() {
			$(this).toggleClass('active_but');
		});
		$('.active_but').live('mouseleave', function() {
			$(this).toggleClass('active_but');
		});
		$('.gelui-carousel-button').bind('click', function(e) {
			moveToEnd($(e.currentTarget).hasClass('gelui-carousel-button-next'));
		});
		
		
		function moveTo(x) {
			//Make sure there are always 2 items visible to the left, if there is enough items right
			/*x = -((x * item_width) - (2 * item_width));
			if (x <= - right_extreme)
				moveToEnd(true);
			else if (x < 0) {
				$('#nav_content_2').animate({left: x+'px'}, 500);
				updateButtons(true, true);
			} else
				moveToEnd(false);*/
				
			//Quick hack
			if (x < 3)
				moveToEnd(false);
			else 
				moveToEnd(true);
		}

		function moveToEnd(end) {
			if (end) {
				$('#nav_content_2').animate({left: '-'+right_extreme+'px'}, 500);
				updateButtons(true, false);
			} else {
				$('#nav_content_2').animate({left: '0px'}, 500);
				updateButtons(false, true);
			}
		}

		function updateButtons(left, right) {
			if (left)
				$('.gelui-carousel-button-prev').prop("disabled", false).removeClass('gelui-carousel-button-disabled');
			else
				$('.gelui-carousel-button-prev').prop("disabled", true).addClass('gelui-carousel-button-disabled');
			if (right)
				$('.gelui-carousel-button-next').prop("disabled", false).removeClass('gelui-carousel-button-disabled');
			else
				$('.gelui-carousel-button-next').prop("disabled", true).addClass('gelui-carousel-button-disabled');
		}
		
		//Move carousel to current page
		moveTo(nav_current_page);
	});
});