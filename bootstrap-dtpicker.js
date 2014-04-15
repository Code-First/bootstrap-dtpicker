//
// - events:
//   dateChanged
(function (factory) {

	if (typeof define === "function" && define.amd)
		define(["jquery"], factory);
	else
		factory(jQuery);

}(function ($) {
	"use strict";

	// Checking dependencies

	if (typeof ($) !== "function")
		throw "Bootstrap Datepicker plugin: jQuery not found. Please ensure jQuery is referenced before the bootstrap-dtpicker.js file.";

	if (typeof (moment) !== "function")
		throw "Bootstrap Datepicker plugin: momentjs not found. Please ensure momentjs is referenced before the bootstrap-dtpicker.js file.";

	// Datepicker plugin

	$.fn.dtpicker = function (param) {

		var dataElementName = "jquery-datepicker";

		var options = {};
		if (typeof param == "object")
			options = param;

		var settings = $.extend($.fn.dtpicker.defaults, options);

		function DatepickerBase() {
			var self = this;

			self.notifyDateChanged = function ($root, date) {
				var m = date ? moment(date) : null;
				var value = null;

				if (m && m.isValid())
					value = m.startOf("day").toDate();

				$root.trigger("dateChanged", [value]);
			}

			self.format = function (date) {
				if (!date)
					return settings.emptyText;
				else
				{
					var m = moment(date);
					if (m.isValid())
						return m.format(settings.format);
					else
						return settings.emptyText;
				}
			}
		}

		function DatepickerPopover(element, settings) {

			var self = this;

			var $root = element;
			
			var $datepickerInput, $datepickerButton;

			var $settings = settings;

			var popoverPadding = 10;

			var popover = (function () {

				var popoverContext = { };
				var $popoverElement = null;

				popoverContext.build = function () {
					$popoverElement = $("<div class=\"popover in hide dtpicker-popover\" style=\"display: block; top: 0; left: 0; max-width: 400px;\"><div class=\"arrow\"></div><div class=\"popover-title\"><div class=\"row\"><div class=\"col-xs-3\"><button class=\"btn btn-default btn-xs btn-block\">&laquo;</button></div>				<div class=\"col-xs-6\"><button class=\"btn btn-primary btn-xs btn-block\">April 2014</button></div><div class=\"col-xs-3\"><button class=\"btn btn-default btn-xs btn-block\">&raquo;</button></div>	</div>		</div>		<div class=\"popover-content\" style=\"padding: 0px;\">			<table class=\"table table-bordered table-condensed\" style=\"margin: 0px;\">				<tbody>					<tr>						<td><button class=\"btn btn-link btn-block\">31</button></td>						<td><button class=\"btn btn-link btn-block\">1</button></td>						<td><button class=\"btn btn-link btn-block\">2</button></td>						<td><button class=\"btn btn-link btn-block\">3</button></td>						<td><button class=\"btn btn-link btn-block\">4</button></td>						<td><button class=\"btn btn-link btn-block\">5</button></td>						<td><button class=\"btn btn-link btn-block\">6</button></td>					</tr>					<tr>						<td><button class=\"btn btn-link btn-block\">7</button></td>						<td><button class=\"btn btn-link btn-block\">8</button></td>						<td><button class=\"btn btn-link btn-block\">9</button></td>						<td><button class=\"btn btn-link btn-block\">10</button></td>						<td><button class=\"btn btn-link btn-block\">11</button></td>						<td><button class=\"btn btn-link btn-block\">12</button></td>						<td><button class=\"btn btn-link btn-block\">13</button></td>					</tr>					<tr>						<td><button class=\"btn btn-link btn-block\">14</button></td>						<td><button class=\"btn btn-link btn-block\">15</button></td>						<td><button class=\"btn btn-link btn-block\">16</button></td>						<td><button class=\"btn btn-link btn-block\">17</button></td>						<td><button class=\"btn btn-link btn-block\">18</button></td>						<td><button class=\"btn btn-link btn-block\">19</button></td>						<td><button class=\"btn btn-link btn-block\">20</button></td>					</tr>					<tr>						<td><button class=\"btn btn-link btn-block\">21</button></td>						<td><button class=\"btn btn-link btn-block\">22</button></td><td><button class=\"btn btn-link btn-block\">23</button></td>						<td><button class=\"btn btn-link btn-block\">24</button></td>						<td><button class=\"btn btn-link btn-block\">25</button></td>						<td><button class=\"btn btn-link btn-block\">26</button></td>						<td><button class=\"btn btn-link btn-block\">27</button></td>					</tr>					<tr>						<td><button class=\"btn btn-link btn-block\">28</button></td>						<td><button class=\"btn btn-link btn-block\">29</button></td>						<td><button class=\"btn btn-link btn-block\">30</button></td>						<td><button class=\"btn btn-link btn-block\">1</button></td>						<td><button class=\"btn btn-link btn-block\">2</button></td>						<td><button class=\"btn btn-link btn-block\">3</button></td>						<td><button class=\"btn btn-link btn-block\">4</button></td>					</tr>				</tbody>			</table>		</div>	</div>					");
					$("body").append($popoverElement);
				};

				popoverContext.place = function () {
					if ($popoverElement) {
						var inputElement = $datepickerInput;
						var coords = inputElement.offset();


						var placement = getPopoverPlacement($settings.placement, inputElement, $popoverElement);
						var offset = getPopoverOffset(placement, inputElement, $datepickerButton, $popoverElement);

						$popoverElement.removeClass("top bottom right left");

						if ($settings.displayArrow)
							$popoverElement.addClass(placement);

						$popoverElement.css({
							top: offset.top,
							left: offset.left
						});

						console.log(offset);
					}
				};

				popoverContext.toggle = function () {
					if ($popoverElement && $popoverElement.is(":visible"))
						popoverContext.hide();
					else
						popoverContext.show();
				};

				popoverContext.show = function (avoidInputFocus) {
					if (!$popoverElement)
						popoverContext.build();

					var inputElement = $datepickerInput;

					$popoverElement.removeClass("hide").show();
					popoverContext.place();

					$(document).on("mousedown", $.proxy(onInputBlur, popoverContext));
					$(window).on("resize", $.proxy(popoverContext.place, popoverContext));
					$datepickerInput.on("keydown", $.proxy(onKeyDown, popoverContext));

					if (!avoidInputFocus)
						$datepickerInput.focus();
				};

				popoverContext.hide = function () {
					if ($popoverElement) {

						$(document).off("mousedown", $.proxy(onInputBlur, popoverContext));
						$(window).off("resize", $.proxy(popoverContext.place, popoverContext));
						$datepickerInput.off("keydown", $.proxy(onKeyDown, popoverContext));

						$popoverElement.remove();
						$popoverElement = null;
					}
				};

				return popoverContext;

				function getPopoverPlacement(mode, $inputElement, $popoverElement) {
					switch (mode) {
						case "auto":
							{
								var popoverHeight = $popoverElement.outerHeight(),
									windowHeight = $(window).height(),
									inputTop = $inputElement.offset().top,
									inputHeight = $inputElement.outerHeight();

								if ((inputTop + inputHeight + 1 + popoverHeight + popoverPadding) < windowHeight)
									return "bottom";
								else if (inputTop > (inputHeight + 1 + popoverHeight + popoverPadding))
									return "top";
								else
									return "bottom";
							}
						case "left":
						case "right":
						case "top":
						case "bottom":
							return mode;
						default:
							throw "\"" + mode + "\" placement mode is incorrect.";
					}
				}

				function getPopoverOffset(placement, $inputElement, $buttonElement, $popoverElement) {
					var popoverWidth = $popoverElement.outerWidth(),
									popoverHeight = $popoverElement.outerHeight(),
									windowWidth = $(window).width(),
									windowHeight = $(window).height(),
									inputTop = $inputElement.offset().top,
									inputLeft = $inputElement.offset().left,
									inputHeight = $inputElement.outerHeight(),
									inputWidth = $inputElement.outerWidth(),
									buttonWidth = $buttonElement.outerWidth(),
									scrollTop = $(window).scrollTop(),
									canvasHeight = windowHeight + scrollTop;

					var result = {
						left: 0,
						top: 0
					};

					switch (placement) {
						case "bottom":
							result.top = inputTop + inputHeight + 1;

							if ((inputLeft + popoverWidth + popoverPadding) > windowWidth)
							{
								result.left = windowWidth - (popoverWidth + popoverPadding);

								if (result.left < popoverPadding)
									result.left = popoverPadding;
							}
							else
								result.left = inputLeft;

							break;
						case "top":
							result.top = inputTop - popoverHeight - 1;

							if ((inputLeft + popoverWidth + popoverPadding) > windowWidth) {
								result.left = windowWidth - (popoverWidth + popoverPadding);

								if (result.left < popoverPadding)
									result.left = popoverPadding;
							}
							else
								result.left = inputLeft;

							break;
						case "left":
							result.top = inputTop - popoverHeight / 2 + inputHeight / 2;

							if ((result.top + popoverHeight) > canvasHeight)
								result.top = canvasHeight - popoverHeight - 1;

							if (result.top < popoverPadding)
								result.top = popoverPadding;

							result.left = inputLeft - popoverWidth - 1;

							if (result.left < popoverPadding)
								result.left = popoverPadding;

							break;
						case "right":
							result.top = inputTop - popoverHeight / 2 + inputHeight / 2;

							if ((result.top + popoverHeight) > canvasHeight)
								result.top = canvasHeight - popoverHeight - 1;

							if (result.top < popoverPadding)
								result.top = popoverPadding;

							result.left = inputLeft + inputWidth + buttonWidth + 1;

							console.log((result.left + popoverWidth + popoverPadding) > windowWidth);

							if ((result.left + popoverWidth + popoverPadding) > windowWidth)
								result.left = windowWidth - popoverWidth - popoverPadding;

							break;
						default:
							throw "\"" + placement + "\" placement mode is incorrect.";
					}

					return result;
				}

				function onInputBlur(e) {
					var popoverLeft = $(e.target).closest($popoverElement).length == 0;
					var inputLeft = $(e.target).closest($root).length == 0;

					if (popoverLeft && inputLeft)
						popoverContext.hide();
				}

				function onKeyDown(e) {
					switch (e.keyCode) {
						case 9: // tab
							popoverContext.hide();
							break;
						case 27: // esc
							if ($settings.closeOnEsc) {
								popoverContext.hide();
								$datepickerInput.blur();
							}
							break;
					}
				}

			})();

			init();

			return self;

			// Private methods

			function init() {
				initLayout();
				initEvents();
			}

			function destroy() {
				removeEvents();
			}

			function initLayout() {
				var $inputGroup = $("<div class=\"input-group\"/>");

				if ($root.hasClass("dtpicker-lg"))
					$inputGroup.addClass("input-group-lg");
				else if ($root.hasClass("dtpicker-sm"))
					$inputGroup.addClass("input-group-sm");

				$inputGroup.append($("<input type=\"text\" class=\"form-control\" readonly=\"readonly\" />")
					.attr("placeholder", $settings.placeholder));
				$inputGroup.append($("<span class=\"input-group-btn\"></span>")
						.append($("<button type=\"button\" class=\"btn btn-default datebutton\"></button>").addClass($settings.buttonClass)));

				$root
					.addClass("dtpicker")
					.append($inputGroup);

				$datepickerInput = $root.find(".input-group > input[type = 'text']");
				$datepickerButton = $root.find(".input-group > .input-group-btn > .datebutton");
			}

			function initEvents() {
				$datepickerInput.on("focusin", $.proxy(onDatepickerInputClick, self));
				$datepickerButton.on("click", $.proxy(onDatepickerButtonClick, self));
			}

			function removeEvents() {
				$datepickerInput.off("focusin", $.proxy(onDatepickerInputClick, self));
				$datepickerButton.off("click", $.proxy(onDatepickerButtonClick, self));
			}

			function onDatepickerInputClick() {
				popover.show(true);
			}

			function onDatepickerButtonClick() {
				popover.toggle();
			}
		}

		function DatepickerNative(element, settings) {

			var self = this;

			var $root = element;
			var $datepickerInput, $datepickerButton;
			var $settings = settings;

			var currentValue = null;

			init();

			return self;

			// Private methods

			function init() {
				initLayout();
				initEvents();

				$datepickerButton.trigger("change");
			}

			function initLayout() {
				var $inputGroup = $("<div class=\"input-group\"/>");

				if ($root.hasClass("dtpicker-lg"))
					$inputGroup.addClass("input-group-lg");
				else if ($root.hasClass("dtpicker-sm"))
					$inputGroup.addClass("input-group-sm");

				$inputGroup.append($("<input type=\"text\" class=\"form-control\" readonly=\"readonly\" />")
					.attr("placeholder", $settings.placeholder));
				$inputGroup.append($("<span class=\"input-group-btn\"></span>")
						.append($("<input type=\"date\" class=\"btn btn-default datebutton\" value=\"\" />").addClass($settings.buttonClass)));

				$root
					.addClass("dtpicker")
					.append($inputGroup);

				$datepickerInput = $root.find(".input-group > input[type = 'text']");
				$datepickerButton = $root.find(".input-group > .input-group-btn > .datebutton");
			}

			function initEvents() {
				$datepickerButton.on("change blur keyup click", $.proxy(onDateInputChanged, self));
				$datepickerInput.on("click", $.proxy(onTextInputClicked, self));
			}

			function onDateInputChanged() {
				currentValue = this.valueAsDate;

				if (settings.updateText)
					$datepickerInput.val(self.format(currentValue));

				self.notifyDateChanged($root, currentValue);
			}

			function onTextInputClicked() {
				$datepickerButton.focus();
			}
		}

		DatepickerPopover.prototype = new DatepickerBase();

		DatepickerNative.prototype = new DatepickerBase();

		var capabilitiesChecker = {
			validateTouch: function () {
				var result = false;
				if (("ontouchstart" in window) || (window.DocumentTouch && document instanceof DocumentTouch))
					result = true;
				return result
			},

			validateInputType: function validateInputType(type) {
				var input = document.createElement("input");
				input.setAttribute("type", type);
				return input.type == type;
			}
		};

		// Apply control to each jQuery element
		var params = arguments;
		return this.each(function () {
			var control = $(this).data(dataElementName);

			if (control == undefined) {
				if (capabilitiesChecker.validateTouch() && capabilitiesChecker.validateInputType("date"))
					control = new DatepickerNative($(this), settings);
				else
					control = new DatepickerPopover($(this), settings);

				$(this).data(dataElementName, control);
				return control;
			}
			else if ((control[method] != undefined) && (typeof control[method] == "function"))
				return control[method].apply(control, Array.prototype.slice.call(params, 1)) || $(this);
			else if (method != undefined)
				return $.error("There is no method with " + method + ' name.');
			else
				return undefined;
		});
	};

	// Datepicker plugin defaults

	$.fn.dtpicker.defaults = {
		buttonClass: "btn-default",
		placeholder: "",
		emptyText: "",
		format: "DD/MM/YYYY",
		updateText: true,
		closeOnEsc: true,
		placement: "auto",
		displayArrow: true
	};

	// Memoization API

	Function.prototype.memoized = function (key) {
		this._values = this._values || {};
		return this._values[key] !== undefined ?
			this._values[key] :
			this._values[key] = this.apply(this, arguments);
	};

	Function.prototype.memoize = function () {
		var fn = this;
		return function () {
			return fn.memoized.apply(fn, arguments);
		};
	};

	// Datepicker DATA-API

	$(function () {
		$("*[data-dtpicker]").each(function () {
			var $element = $(this);
			var options = {};
			$element.dtpicker(options);
		});
	});

}));