/**
    @overview The GelUI AutoSuggest adds a dynamic suggestion menu to an input element.
 */

define(
    ['jquery-1', 'gelui-1/core', 'gelui-1/widget', 'gelui-1/overlay', 'gelui-1/js-signals'],

    function($, core, Widget, Overlay, signals) {

        /**
         Store local reference of the the Signal object for brevity
        */
        var Signal = signals.Signal;

        /*
         A handler to close the autosuggest suggestion list when the user clicks away.
         Receives the click event and the context of the Autosuggest
        */
        var bodyClickAction = function(e) {
            if (this.$input[0] !== e.target && 0 === $(e.target).closest('.gelui-1-autosuggest').length) {
                clearTimeout(this.timeoutId);
                this.overlay.hide();
                this.$suggestionList.children().removeClass('gelui-active');
            } else {
                clearTimeout(this.blurTimer);
            }
        };

        /**
         @class AutoSuggest
         @classdesc A menu that displays suggestions based on the value typed into an input element.

         @mixes gelui.Widget

         @fires AutoSuggest.event:inputchanged
         @fires AutoSuggest.event:dataready
         @fires AutoSuggest.event:appenditem
         @fires AutoSuggest.event:itemselected
         @fires AutoSuggest.event:itemhighlighted

         @param {jQueryObject} $input The input element to associate the autosuggest with.
            If the argument refers to more than one DOM element, only the first input will be used.

         @param {string | Array} dataSource The data source to be searched. This can be either an array of string values,
            or a URL to use for the search. E.g. http://search.bbc.co.uk/suggest?&scope=all&format=blq-1&q={input} where 
            {input} will be replaced by the search keyword the user enters.

         @example
             var myAutoSuggest = new AutoSuggest($('#search'), 'http://search.bbc.co.uk/suggest?&scope=all&format=blq-1&q={input}');
         */
        var AutoSuggest = function($input, dataSource) {

            if (!$input || 0 === $input.length || $input[0].tagName != 'INPUT') {
                throw('$input must be defined and cannot be empty.');
            }

            var that = this;
            if(typeof dataSource == 'string'){
                that._getData = that._getFromUrl;
            }
            else if($.isArray(dataSource)){
                that._getData = that._getFromArray;
            }
            else{
                throw('Please provide a data source');
            }
            /**
             @name AutoSuggest#$input
             @type {Object}

             @description A reference to the input field jQuery object.
            */
            that.$input = $input;

            /**
             @name AutoSuggest#dataSource
             @type {string | Array}
             
             @description A reference to the data source property.
            */
            that.dataSource = dataSource;

            /**
             @name AutoSuggest#currentText
             @type {string}

             @description A reference to the currently highlighted text in the menu.
            */
            that.currentText = '';
            
            that.timeoutId = null;
            that._defaultMenuMarkup = '<div class="gelui-1-autosuggest" role="listbox">'+
                                        '<div class="gelui-container">'+
                                            '<ul class="gelui-suggestionlist"></ul>'+
                                        '</div>'+
                                       '</div>';
            /**
             @name AutoSuggest#signals
             @type {Object}
             @description A container for the events (or signals) that AutoSuggest provides. The signals are objects
                that provide an API for adding, removing and dispatching event listeners.
                The full API documentation of the signals object can be found at 
                http://millermedeiros.github.com/js-signals/docs/symbols/signals.Signal.html
            */
            that.signals = {
                /**
                 @event signals.inputchanged
                 @memberof AutoSuggest

                 @description A signal object that dispatches its listeners when the input field changes.
                    Dispatches after a short delay and not on every key stroke. Passes the following parameters
                    to its listeners:
                 @param {Object} e An object passed as parameter to all listeners of this signal.
                 @param {string} e.value The value of the input field.
                */
                inputchanged    : new Signal(),

                /**
                 @event signals.dataready
                 @memberof AutoSuggest

                 @description A signal object that dispatches its listeners when the data is ready. Passes the 
                    following parameters to its listeners:
                 @param {Object} e An object passed as parameter to all listeners of this signal.
                 @param {string} e.value The value of the input field, which is also the keyword used for the filtering.
                 @param {Array} e.data The array of suggestions returned by the data provider. This is expected in the following format:
                    [keyword, [{title : "suggestion-1"}, {title : "suggestion-2"}]]
                */
                dataready       : new Signal(),

                /**
                 @event signals.appenditem
                 @memberof AutoSuggest

                 @description A signal object that dispatches its listeners on every iteration of the loop going
                    through the suggestion results.
                    Passes the following parameters to its listeners:
                 @param {Object} e An object passed as parameter to all listeners of this signal.
                 @param {string} e.item The title of the item to be appended to the suggestion list.
                */
                appenditem     : new Signal(),
                
                /**
                 @event signals.displayitems
                 @memberof AutoSuggest

                 @description A signal object that dispatches its listeners after all results have been appended
                    and the suggestion list is ready to be displayed. This signal passes no parameters to its listeners.
                    Overwrite the default listener of this signal if you would like to position the overlay differently.
                */
                displayitems     : new Signal(),

                /**
                 @event signals.itemhighlighted
                 @memberof AutoSuggest

                 @description A signal object that dispatches its listeners when an item is 
                    highlighted either via a mouse-over or keyboard. Passes the following parameters
                    to its listeners:
                 @param {Object} e An object passed as parameter to all listeners of this signal.
                 @param {Object} e.item The DOM node of the highlighted item.
                */
                itemhighlighted : new Signal(),

                /**
                 @event signals.itemselected
                 @memberof AutoSuggest

                 @description A signal object that dispatches its listeners when an item is clicked or selected via the ENTER key.
                    Passes the following parameters to its listeners:
                 @param {Object} e An object passed as parameter to all listeners of this signal.
                 @param {Object} e.item The DOM node of the highlighted item.
                */
                itemselected    : new Signal()
            };

            that._bindKeyCodeEvents();

            /**
             @name AutoSuggest#overlay
             @type {Object}

             @description A reference to the Overlay widget object that contains the suggestion list.
            */
            that.overlay = new Overlay($(that._defaultMenuMarkup).appendTo('body'),{ closeOnScroll: false });

            /**
             @name AutoSuggest#keycode
             @type {Object}

             @description A reference to the core.keyCode object.
            */
            that.keyCode = core.keyCode;

            /**
             @name AutoSuggest#$suggestionList
             @type {Object}

             @description A reference to the suggestion list jQuery object - (<ul class="gelui-suggestionlist"></ul>).
            */
            that.$suggestionList = that.overlay.$element.find('.gelui-suggestionlist');

            var bodyClickHandler = function(e){
                bodyClickAction.call(that, e);
            };

            /**
             Setup the show/hide behaviour of the overlay
            */
            that.overlay.signals.show.add(function(){
                $('body').bind('click', bodyClickHandler);
            });
            that.overlay.signals.hide.add(function() {
                $('body').unbind('click', bodyClickHandler);
            });

            that.$input.bind('blur', function() {
                that.blurTimer = setTimeout(function() {
                    that.overlay.hide();
                }, 200);
            });
            
            that.$input.bind('focus', function() {
                //if (that.$input.attr('value').length > 1) {
                    var $submitButton = $('#form_2 input#submit_origin'), $nextButton = $("#cta_next");
                    //enable submit button
                    $submitButton.removeClass('disabled');
                    $submitButton.removeAttr('disabled');
                            
                    //disable next button
                    $nextButton.attr('disabled','disabled');
                    $nextButton.addClass("disabled");
               // }
            });

            /**
             Adding the default event listeners to the signal objects. This defines
             the default workflow of the AutoSuggest widget.
            */
            that.signals.inputchanged.add(that._defaultListeners.inputchanged, that);
            that.signals.dataready.add(that._defaultListeners.dataready, that);
            that.signals.appenditem.add(that._defaultListeners.appenditem, that);
            that.signals.displayitems.add(that._defaultListeners.displayitems, that);
            that.signals.itemselected.add(that._defaultListeners.itemselected, that);
            that.signals.itemhighlighted.add(that._defaultListeners.itemhighlighted, that);
        }

        $.extend(AutoSuggest.prototype, Widget);
        /**
         @name AutoSuggest#name
         @type {string}
         @description The name of the widget
         */
        AutoSuggest.prototype.name = 'autosuggest';  //TODO version the name property

        /**
         @private
         @description A container of all default event listeners that are added to the signal objects.
            Those can be removed or disabled by the user via the API provided by the signal objects.
        */
        AutoSuggest.prototype._defaultListeners = {

            inputchanged : function(e){
                var that = this;
                // If the text has been erased, remove the overlay and bail out
                if ('' === e.value && that.overlay) {
                    that.overlay.hide();
                    return false;
                }
                
                if (e.value.length > 1) {
                    // Execute the appropriate function to get the data (either from URL or from an Array)
                    that._getData(e.value, that.dataSource);
                }
            },

            dataready : function(e){
                var that = this,
                    suggestions = e.data;

                that.$suggestionList.empty();

                for(var i = 0; i < suggestions[1].length; i++) {
                    that.signals.appenditem.dispatch({
                        item : suggestions[1][i].title
                    });
                }

                that.$suggestionList.children().bind({
                    mouseenter: function() {
                        that.signals.itemhighlighted.dispatch({
                            item : $(this)[0]
                        });
                    },
                    click: function() {
                        that.signals.itemselected.dispatch({
                            item : $(this)[0]
                        });
                    }
                });
                that.signals.displayitems.dispatch();
            },

            appenditem : function(e){
                this.$suggestionList.append('<li role="option">' + e.item + '</li>');
            },

            displayitems : function(){
                this.overlay.nextTo(this.$input, 'bottom', 'left').show();
            },

            itemhighlighted : function(e){
                this.$suggestionList.children().removeClass('gelui-active');
                $(e.item).addClass('gelui-active');
            },

            itemselected : function(e) {
                var that = this;
                if($(e.item).text() != ''){
                    this.$input.val($(e.item).text());
                }
                that.overlay.hide();
            }
        };

        /**
         @private
         @description Grep the appropriate values from the array based on the term,
            format the result and dispatch the dataready signal passing the values
        */
        AutoSuggest.prototype._getFromArray = function(term, dataSource){
            var that = this;
            
            var matcher = new RegExp(term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i" );
            
            var filtered = $.grep(dataSource, function(value) {
                var lowerValue = value.toLowerCase();
                
                if (lowerValue.indexOf(term.toLowerCase()) == 0) {
                    return matcher.test(value);
                }
                
            });
            var suggestions = [];
            
            for(var i = 0, l = filtered.length; i < l; i++){
                suggestions[i] = {
                    'title' : filtered[i]
                }
            }
            
            that.signals.dataready.dispatch({
                value : term,
                data : [term, suggestions]
            });
            
        };

        /**
         @private
         @description Retreive the results from a URL source
            and on success dispatch the dataready signal passing the values
        */
        AutoSuggest.prototype._getFromUrl = function(term, url){
            var that = this;

            $.ajax({
                url: url.replace(/\{input\}/g,term),
                dataType: "json",
                success: function(suggestions) {
                    that.signals.dataready.dispatch({
                        value : term,
                        data : suggestions
                    });
                },
                error: function() {
                    that.$input.attr('autocomplete', 'on');
                }
            })
        };

        /**
         @private
         @description A method to abstract away all of the keycode complexity and associated event bindings.
            Keys which are listened for include: UPARROW, DOWNARROW, ESCAPE, ENTER
       */
       AutoSuggest.prototype._bindKeyCodeEvents = function() {
               var _repeating,
                   that = this;
            reset_repeating();
            
            function reset_repeating() {
                _repeating = {downs: 0, presses: 0};
            }

            function keyPressHandler(e) {
                _repeating.presses++;
    
                if (_repeating.downs == 1 && _repeating.presses > 1) {
                    return keyDownAction(e);
                }
            }

            function keyDownHandler(e) {
                
                _repeating.downs++;
                return keyDownAction(e);
            }

            function keyUpHandler(e){
                reset_repeating(); // not _repeating anymore
                
                switch(e.keyCode) {
                    case that.keyCode.DOWNARROW:
                    case that.keyCode.UPARROW:
                    case that.keyCode.ESCAPE:
                    case that.keyCode.ENTER:
                    break;
                    default:
                        if (that.$input.val() != that.currentText) {
                            that.currentText = that.$input.val();
                            clearTimeout(that.timeoutId);
                            that.timeoutId = setTimeout(function() {
                                that.signals.inputchanged.dispatch({
                                    value : that.currentText
                                });
                            }, 1000);
                        }
                }

            }
            
            function keyDownAction(e){
                
                var $selectionItems = that.$suggestionList.children(),
                $currentlySelected = that.$suggestionList.find('.gelui-active');
                
                switch(e.keyCode) {
                    case that.keyCode.DOWNARROW:
                        if ($currentlySelected.length === 0) {
                            that.signals.itemhighlighted.dispatch({
                                item : $selectionItems.first()[0],
                                keyPressed: e.keyCode
                            });
                            that.currentText = $selectionItems.first().text();
                        } else {
                            that.signals.itemhighlighted.dispatch({
                                item : $currentlySelected.next()[0],
                                keyPressed: e.keyCode
                            });
                            that.currentText = $currentlySelected.next().text();
                        }
                        clearTimeout(that.timeoutId);
                    break;
                    case that.keyCode.UPARROW:
                        if ( $currentlySelected.length === 0) {
                            that.signals.itemhighlighted.dispatch({
                                item : $selectionItems.last()[0],
                                keyPressed: that.keyCode.UPARROW
                            });
                            that.currentText = $selectionItems.last().text();
                        } else {
                            that.signals.itemhighlighted.dispatch({
                                item : $currentlySelected.prev()[0],
                                keyPressed: that.keyCode.UPARROW
                            });
                            that.currentText = $currentlySelected.prev().text();
                        }
                        clearTimeout(that.timeoutId);
                    break;
                    case that.keyCode.ESCAPE:
                        clearTimeout(that.timeoutId);
                        that.overlay.hide();
                        that.$suggestionList.children().removeClass('gelui-active');
                        /* NOTE: This is commented because this is not what the current (glow) autosuggest does
                         that.$input.val(that.currentText);*/
                    break;
                    case that.keyCode.ENTER:
                        clearTimeout(that.timeoutId);
                        that.signals.itemselected.dispatch({
                            item : $currentlySelected[0]
                        });
                    break;
                    default:

                }
            }

            this.$input.keydown(keyDownHandler);
            this.$input.keyup(keyUpHandler);
            this.$input.keypress(keyPressHandler);
       }


    return AutoSuggest;

});
