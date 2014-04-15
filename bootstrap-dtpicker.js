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

		var settings = $.extend({}, $.fn.dtpicker.defaults, options);

		// Datepicker base
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

		// Datepicker popover
		function DatepickerPopover(element, settings) {

			var self = this;

			var $root = element;
			
			var $datepickerInput, $datepickerButton;

			var viewValue = moment().toDate();

			var selectedValue = null;

			var $settings = settings;

			var popoverPadding = 10;

			var popover = (function () {

				var popoverContext = { };
				var $popoverElement = null;

				var layout = {

					_daysCalendarBody: null,

					_daysCalendarTitle: null,

					invalidate: function () {
						this.invalidateTitle();
						this.invalidateContent();
					},

					invalidateTitle: function () {
						this._daysCalendarTitle.text(moment(viewValue).format($settings.daysTitleFormat));
					},

					invalidateContent: function () {
						this._daysCalendarBody
							.empty()
							.append(this.buildDaysTableContent(viewValue, $settings.startDay, $settings.displayToday));
					},

					changeDate: function (value) {
						viewValue = value ? value : moment().startOf("day").toDate();
						selectedValue = value;

						if ($settings.updateText)
							$datepickerInput.val(self.format(selectedValue));

						this.invalidate();

						self.notifyDateChanged($root, selectedValue);
					},

					buildPopover: function () {
						var $result = $("<div class=\"popover in hide dtpicker-popover\" style=\"display: none;\"><div class=\"arrow\"></div></div>");
						
						$result.append(this.buildPopoverTitle());
						$result.append(this.buildPopoverContent());

						return $result;
					},

					buildPopoverTitle: function () {
						var $result = $("<div class=\"popover-title\"></div>");

						var toolbar = $("<div class=\"toolbar\"></div>");

						var btnPrev = $("<button class=\"btn-prev\">&laquo;</button>");
						var btnMode = this._daysCalendarTitle = $("<button class=\"btn-mode\">" + moment(viewValue).format($settings.daysTitleFormat) + "</button>");
						var btnNext = $("<button class=\"btn-next\">&raquo;</button>");

						toolbar.append($("<div class=\"col-xs-2\"></div>").append(btnPrev));
						toolbar.append($("<div class=\"col-xs-8\"></div>").append(btnMode));
						toolbar.append($("<div class=\"col-xs-2\"></div>").append(btnNext));

						$result.append(toolbar);

						btnPrev.on("click", $.proxy(function () {
							viewValue = moment(viewValue).add("M", -1).toDate();
							this.invalidate();
						}, this));

						btnNext.on("click", $.proxy(function () {
							viewValue = moment(viewValue).add("M", 1).toDate();
							this.invalidate();
						}, this));

						return $result;
					},

					buildPopoverContent: function () {
						var $result = $("<div class=\"popover-content\"></div>");

						$result.append(this.buildDaysTable());

						return $result;
					},

					buildDaysTable: function () {
						var $result = $("<table class=\"days\"></table>");

						$result.append(buildHeader($settings.startDay));

						$result.append(this._daysCalendarBody = $("<tbody></tbody>").append(this.buildDaysTableContent(viewValue, $settings.startDay, $settings.displayToday)));

						var footer = buildFooter.call(this, $settings.todayButtonVisible, $settings.clearButtonVisible);
						if (footer)
							$result.append(footer);

						return $result;

						function buildHeader(startDay) {
							return $("<thead></thead>").append($("<tr></tr>").append(buildWeekdays(startDay)))
						}

						function buildWeekdays(startDay) {
							if (startDay > 6)
								throw "Start day can't be more than 6.";

							var result = [];

							var date = moment().day(startDay);
							for (var i = 0; i < 7; i++) {
								var $day = $("<th></th>").text(date.format("ddd"));
								result.push($day);
								date.add("day", 1);
							}

							return result;
						}

						function buildFooter(todayButtonVisible, clearButtonVisible) {
							var btnToday = null,
								btnClear = null;

							if (todayButtonVisible) {
								btnToday = $("<button class=\"btn-today\">Today</button>");
								btnToday.on("click", $.proxy(function () {
									this.changeDate(moment().startOf("day").toDate());
								}, this));
							}

							if (clearButtonVisible) {
								btnClear = $("<button class=\"btn-clear\">Clear</button>");
								btnClear.on("click", $.proxy(function () {
									this.changeDate(null);
								}, this));
							}

							var container = $("<td colspan=\"7\"></td>");

							if (btnToday && btnClear) {
								container.append($("<div class=\"col-xs-6\"></div>").append(btnToday));
								container.append($("<div class=\"col-xs-6\"></div>").append(btnClear));
							}
							else if (btnToday)
								container.append(btnToday);
							else if (btnClear)
								container.append(btnClear);

							if (btnToday || btnClear) {
								return $("<tfoot></tfoot>")
									.append($("<tr></tr>")
										.append(container));
							}
							else
								return null;

						}
					},

					buildDaysTableContent: function (date, startDay, displayToday) {
						if (startDay > 6)
							throw "Start day can't be more than 6.";

						var day = moment(date).startOf("month");
						while (day.day() != startDay)
							day.add("d", -1);

						var today = moment();
						var selectedDate = moment(selectedValue);
						var currentDate = moment(date);
						var currentMonth = currentDate.month();
						var daysInMonth = currentDate.daysInMonth();
						var weeksCount = Math.ceil((moment(date).endOf("month").diff(day, "days") + 1) / 7);

						var weeks = [];

						for (var weekNo = 0; weekNo < weeksCount; weekNo++) {
							var days = [];

							for (var dayNo = 0; dayNo < 7; dayNo++) {
								var isPrevMonth = (currentMonth != day.month()) && currentDate.isAfter(day);
								var isNextMonth = (currentMonth != day.month()) && currentDate.isBefore(day);

								var dayButton = $("<button class=\"btn-date\"></button>")
									.text(day.format("D"))
									.attr("data-dtvalue", day.toISOString());

								if (isPrevMonth)
									dayButton.addClass("prev");

								if (isNextMonth)
									dayButton.addClass("next");

								if (displayToday && today.isSame(day, "day"))
									dayButton.addClass("today");

								if (selectedDate && selectedDate.isSame(day, "day"))
									dayButton.addClass("selected");

								dayButton.on("click", { layout: this }, function (e) {
									var m = moment($(this).attr("data-dtvalue"));
									e.data.layout.changeDate(m.isValid() ? m.toDate() : null);
								});

								days.push($("<td></td>").append(dayButton));
								day.add("d", 1);
							}

							weeks.push($("<tr></tr>").append(days));
						}

						return weeks;
					}

				};

				popoverContext.build = function () {
					$popoverElement = layout.buildPopover();
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

		// Datepicker native
		function DatepickerNative(element, settings) {

			var self = this;

			var $root = element;
			var $datepickerInput, $datepickerButton;
			var $settings = settings;

			var selectedValue = null;

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
				$datepickerButton.on("change blur keyup click", onDateInputChanged);
				$datepickerInput.on("click", $.proxy(onTextInputClicked, self));
			}

			function removeEvents() {
				$datepickerButton.off("change blur keyup click", onDateInputChanged);
				$datepickerInput.off("click", $.proxy(onTextInputClicked, self));
			}

			function onDateInputChanged() {
				selectedValue = this.valueAsDate;

				if (settings.updateText)
					$datepickerInput.val(self.format(selectedValue));

				self.notifyDateChanged($root, selectedValue);
			}

			function onTextInputClicked() {
				$datepickerButton.focus();
			}
		}

		DatepickerPopover.prototype = new DatepickerBase();

		DatepickerNative.prototype = new DatepickerBase();

		// Capabilities check
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
		displayArrow: true,
		startDay: 1,
		todayButtonVisible: true,
		clearButtonVisible: true,
		daysTitleFormat: "MMMM YYYY",
		displayToday: true
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