require(["jquery-1", "gelui-1", "istats-1"], function ($, gelui, istats) {
	$(document).ready(function () {
		$("ul#nav_content_2 li a").bind("mouseover", function (ev) {
			$(this).children("div").removeClass("nav_caption_2");
			$(this).children("div").addClass("nav_caption_highlight");
		});
		$("ul#nav_content_2 li a").bind("mouseout", function (ev) {
			$(this).children("div").removeClass("nav_caption_highlight");
			$(this).children("div").addClass("nav_caption_2");
		});
		$("ul#nav_content_2 li a").bind("click", function (ev) {
			istats.log(
				"click",
				"7billion-nav-interaction",
				{
					"interaction_type" : ev.currentTarget.id,
					"interaction_target" : $(this).children("div").text()
				}
			);
		});
	});
});