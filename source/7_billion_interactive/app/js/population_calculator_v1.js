(function() {
    var step = 1;
    var populationRollingTotal;
    //a returning user with a url will have a hash that will help return the same value for their position in the world at birth    
    //{myposition, nationality, gender, randomNumber}
    var userProfile = {};
    
    var today;
    
    var positionUIActive = false;
    
    //ui control/dom elements
    var $nextButton;
    var $previousButton; 
    var $forms;
    var $mypositionContainer;
    var $mainNav;
    var $infoPanels;
    
    var chart; 
    
    //data 
    var annualTotals = population;
    var countryList;
    var countryInFigures;
    var countrydata;
    var populationCounterClock;
    var template;
    var worldGrowthPerSecond;
    /** based on values used by the UN's position calculation */
    var fiveYearlyPopulation = [1650000,1699265,1750000,1804162,1860000,1962193,2070000,2181972,2300000,2413323,2532229,2772882,3038413,3333007,3696186,4076419,4453007,4863290,5306425,5726239,6122770,6506649,6895889,7284296,7656528,8002978];
     
    /**  my position in 7 billion contastants     */
    // number of days since jan 1 1970 to 01/07/1900
    var JULY_ONE_NINETEEN_HUNDRED = 183; //AC1
    var EIGHTEEN_TWENTY_SIX = 1826.25;
    //ms excel has this as 25569  and js gives 25567, (365*70, leap years = 17, total = 25567), http://support.microsoft.com/kb/214326 
    var EPOCH_OFFSET = -25569;
    var MILLISECONDS_PER_DAY = 86400000;
    var radix = 10; 
    
    

   /*
         * set profile random number if set in url hash
         *@return boolean
        */
    function getUrlHash() {
        // var hash = window.location.search.substring(3);
        var hash = window.location.hash;
        
        if(hash) {
            var userData = hash.split('~');
            if (userData.length > 8) {
                return userData;
            } 
        return false;
        }
    }    
        
   /**
        *   based on Crockford's supplant function - http://javascript.crockford.com/remedial.html
        * variable substitution on a string
        */
    if (!String.prototype.interpolate) {
        String.prototype.interpolate = function (o) {
            return this.replace(/{([^{}]*)}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        };
    }
       
    require(['jquery-1.4','gelui-1/overlay','/news/special/uk/11/tax_spend_calculator/js/jquery.validate.min.js'], function($, Overlay){
        //jQuery onDomReady
        $(function($) {
            
            //init app wide variables
            $nextButton = $("#cta_next");
            $previousButton = $("#cta_prev");
            $mypositionContainer = $("div#my_position");
            
            //create line graph
            var appHash = getUrlHash()
            if (appHash) {
                step = 4;
                createSummaryUI($, appHash); 
               
                $nextButton.html('RESET');
                $nextButton.addClass('reset');
            } else {
                createBarGraph();
                createMyPositionUI($);
                init();
            }
            
            //init user interface
            
            
            $nextButton.bind('click', function(ev) {
                ev.preventDefault();
                if ($nextButton.hasClass('disabled')) {return false;}
                if ($nextButton.hasClass('reset')) {
                    resetApp($);
                } else {
                    step++;
                    loadNextStep($);
                }
            }); //bind on next
            
            $previousButton.bind('click', function(ev) {
                ev.preventDefault();
                if ($previousButton.hasClass('disabled')) { return false;}
                step--;
                loadPrevStep($);
            }); //bind on prev
            
            $mainNav = $('li#head_1 a, li#head_2 a, li#head_3 a, li#head_4 a');
            $mainNav.bind('click', function (ev) {
                ev.preventDefault();
                var parent = $(this).parent();
                 if (parent.hasClass('complete')) {
                    var gobackto = parent.attr('id').substring(5);
                    for(var i = parseInt(gobackto, radix) + 1; i < $mainNav.length + 1; i++) {
                        $("#output_" + i).removeClass('selected');
                        $("#head_" + i).removeClass('selected');
                        $("#head_" + i).removeClass('complete');
                    }
                    
                    $("div#summary_gender").removeClass('summary_male').removeClass('summary_female');
                    
                    $("#output_" + gobackto).addClass('selected');
                    $("#head_" + gobackto).removeClass('complete');
                    $("#head_" + gobackto).addClass('selected');
                    step = gobackto;
                    $nextButton.html("NEXT");
                    $nextButton.removeClass("reset");
                    disableNextButton();
                 }
            });
            $("div#my_position span.how_we_calculated").live('click', function() {
                $("div#panel_1_content").show();
            });
            
            
            
            $.ajax({
                url: '/news/special/world/11/7_billion/app/data/country_data.json',
                dataType: "json",
                success: function(data) {
                    countryData = data;
                },
                error: function(err) {
                    //handle this error
                }
            });
            
            $.ajax({
                url: '/news/special/world/11/7_billion/app/data/template.json',
                dataType: "json",
                success: function(data) {
                    template = data.templates;
                    create_autosuggest(
                        $('#origin'),
                        data.autosuggestlist,
						2
                    );

                },
                error: function() {
                    //handle this error
                }
            });
            
            
                
            $birthInputs = $('input#bday, input#bmonth, input#byear');
            $birthInputs.bind('keyup', function () {
                $('input#submit_bday').removeAttr('disabled');
                $('input#submit_bday').removeClass('disabled');
                
                $birthInputs.each(function () {       
                    var el = this.id;
                    var value = this.value;
                    
                    var is_int = (!isNaN(value) && parseFloat(value, radix)) ? true: false;
                    
                    if (value == '' || !is_int) {                                               
                        disableDateSubmit();
                        return false;
                    }
                    
                    switch(el) {
                        case 'bday':
                            if(value < 1 || value > 31){
                                disableDateSubmit();
                            }
                            break;
                        case 'bmonth':
                            if(value < 1 || value > 12){
                                disableDateSubmit();
                            }
                            break;
                       // 2px solid #505050
                        case 'byear':
                            if(value < 1910 || value > today.getFullYear()){
                                disableDateSubmit();
                            }
                            break;
                    }
                   
                });
            });
            
            $birthInputs.bind('focus blur', function (ev) {
                var value = this.value;
                if(value == 'dd' || value == 'mm' || value == 'yyyy') {
                    this.value = '';
                }else if (value == '') {
                    switch(this.id) {
                        case 'bday':
                            this.value = 'dd';
                            break;
                        case 'bmonth':
                            this.value = 'mm';
                            break;
                        case 'byear':
                            this.value = 'yyyy';
                            break;
                    }
                }
            });
            
            $infoPanels = $("div#panel_2_content,div#panel_3_content,div#panel_4_content,div#panel_5_content");
            $infoPanels.hide();
            
            $("span#panel_2,span#panel_3,span#panel_4,span#panel_5").live('click', function() {
                $infoPanels.hide();
                $("div#" + this.id + "_content").show();                
            });
            
            $("div#panel_1_content h2,div#panel_2_content h2,div#panel_3_content h2,div#panel_4_content h2,div#panel_5_content h2").bind('click', function() {
                $(this).parent().parent().hide();
            })
            
            
    
            function create_autosuggest(input, dataSource, length) {
                defaultMenuMarkup = '<div class="gelui-1-autosuggest" role="listbox" style="width: 356px"><div class="gelui-container"><ul class="gelui-suggestionlist"></ul></div></div>';
                overlay = new Overlay($(defaultMenuMarkup).appendTo('body'),{ closeOnScroll: false });
                suggestionList = overlay.$element.find('.gelui-suggestionlist');
                
                input.bind('blur', function(){
                    if(this.value == '') {
                        this.value = 'e.g. United Kingdom';
                    }
                });
            
                input.bind('keyup focus', function(ev) {
					if(this.value == 'e.g. United Kingdom') {
                        this.value = '';
                    }
                    if (ev.which == 13)
						return false;
                    searchStr = $(this).val();
                    suggestionList.empty();
					exactMatch = false;
					
                    if (searchStr.length >= length)
                        $.each(dataSource, function(i) {
                            var regEx = new RegExp('^' + searchStr + '\\w*\\b','i');
                            if (dataSource[i].match(regEx))
                                suggestionList.append('<li role="option"><a href="#">' + dataSource[i] + '</a></li>');
							
							if (dataSource[i].toLowerCase() === searchStr.toLowerCase())
								exactMatch = true;
                        });
						
						//Check if search is exact match
						var submitButton = $('input#submit_origin');
						if (exactMatch)
							$('input#submit_origin').removeClass('disabled').removeAttr('disabled');
						else
							$('input#submit_origin').addClass('disabled').attr('disabled','disabled');

					if (searchStr.length >= length && $('.gelui-suggestionlist li').length)
                        overlay.nextTo(input, 'bottom', 'left').show();
                    else
                        overlay.hide();
                });

				$('body').bind('click', function(event) {
					if ((!$(event.target).closest('div.gelui-1-autosuggest').length) && ($(event.target).attr('id') != 'origin'))
						overlay.hide();
				});
				
                $('ul.gelui-suggestionlist li a').live('click', function(ev) {
                    ev.preventDefault();
                    input.val($(this).text());
                    overlay.hide();

                    var submitButton = $('input#submit_origin');
                    submitButton.removeClass('disabled').removeAttr('disabled');
                });
                
                
                
            };//create_autosuggest
    
        }); //dom  ready
    }); //require js
    
    function resetApp($) {
        step = 1;
        for(var i = 1; i < 4; i++){
            $("#form_" + i).get(0).reset();
            $("#head_" + i).removeClass('complete');
        }
        $("#head_1").addClass('selected');
        $("div#summary_gender").removeClass('summary_male').removeClass('summary_female');
        
        $mypositionContainer.html('');
        //reset my origin//update country graphic
        
        createBarGraph();
        createMyPositionUI($);
        init();
        $nextButton.html("NEXT");
        $nextButton.removeClass("reset");
        
        $('div#myorigin').css('background-image', 'url("/news/special/world/11/7_billion/app/img/map_world.gif")');
        $('div#myorigin div.figures').html(template.defaultCountryInFigures);
        $("div#country_name").html('');
        
        $("input#gender_male, input#gender_female").addClass("gender_disabled");
        $("#gender").css("background-position", "0px 0px");

        $("div.mf-female,div.mf-male").hide();
    }    
            
    function disableDateSubmit() {
                                                  
        $('input#submit_bday').attr('disabled', 'disabled');
        $('input#submit_bday').addClass('disabled');
    }    
    //create chart
    function init() {
        disableNextButton();
        //reset step to 1
        step = 1;
        //init UI output containers
        //disabled for debug purposes only
        $("div#output_4").removeClass('selected');
        $("div#output_1").addClass('selected');
        $("li#head_4").removeClass('selected');
        $("li#head_1").addClass('selected');
        
        /* @TODO - disable reset button */
        
        $nextButton.html('NEXT');
        $nextButton.removeClass('reset');
        today = new Date();
    }
    
    
        
    function loadNextStep($) {
        $infoPanels.hide();
        initialiseInput();
        
        if ($previousButton.hasClass('disabled')) {$previousButton.removeClass('disabled');}
     
        switch(step) {
            case 2:
                createCountryUI($);
                break;
            case 3:
                createGenderUI($);
                break;
            case 4:
                createSummaryUI($);  
                $nextButton.html('RESET');
                $nextButton.addClass('reset'); 
                //enable reset button
                break;
        }
    }
    
    function loadPrevStep($) {
        $("div#summary_gender").removeClass('summary_male').removeClass('summary_female');
        if (step == 1) {
            $previousButton.addClass('disabled');
        } else {
            $previousButton.removeClass('disabled');
        }
        
        $("#output_" + (step + 1)).removeClass('selected');
        $("#head_" + (step + 1)).removeClass('selected');
        //$("#head_" + (step-1)).addClass('complete');
        $("#output_" + step).addClass('selected');
        $("#head_" + step).removeClass('complete');
        $("#head_" + step).addClass('selected');
        
        $nextButton.html('NEXT');
        $nextButton.removeClass('reset');           
        disableNextButton();
    }
    
    function initialiseInput() {
        $("#output_" + (step-1)).removeClass('selected');
        $("#head_" + (step-1)).removeClass('selected');
        $("#head_" + (step-1)).addClass('complete');
        $("#output_" + step).addClass('selected');
        $("#head_" + step).addClass('selected');
    }
    
    function disableNextButton() {
        $nextButton.addClass("disabled");
    }
    
    function enableNextButton() {
        $nextButton.removeClass("disabled");
    }
    
    //hash object retrieves values from the url and populates the form     
    function createMyPositionUI($){
        
        if (positionUIActive) {
            return false;  
        } else {
            positionUIActive = true;
        }
        
        $('input#submit_bday').attr('disabled', 'disabled');
        $('input#submit_bday').addClass('disabled'); 
        
        $("#form_1").validate({
            //debug: true
            errorClass: 'invalid',
            errorContainer: '#error_message',
            invalidHandler: function(form, validator) {
                // @TODO - handle invalid form
            },
            submitHandler: function(form) {
                
                var birthday = getBirthday( $(form).serializeArray() );

                // months starting from 0 for january
                var userDate =  new Date(birthday.y, birthday.m - 1, birthday.d);
                
                var myPosition = calcMyPosition(userDate);
               
                
                //start total position calculation
                var peopleEverLived = {
                    "africa" : 	[12741.3862,12769.85446,12799.42708,12830.161,12862.11622,12895.72662,12931.48096,12969.4978,13009.90149,13056.07793,13108.00841,13165.84045,13230.43231,13302.7042,13383.21975,13473.95769,13576.52357,13691.30379,13817.61044,13953.72898,14100.63407,14260.19032,14432.06921,14616.11277,14811.61533,15015.60021],
                    "asia" : 	[40744.60657,40946.13103,41153.01923,41365.52426,41583.91232,41810.95694,42049.71231,42300.67784,42564.3699,42840.69967,43129.26487,43437.56883,43756.50051,44102.12547,44484.6533,44875.90493,45247.87891,45646.76426,46073.88002,46487.18783,46882.45214,47261.71198,47638.69992,48012.23712,48374.2932,48722.84364],
                    "europe" : 	[12183.51057,12255.5202,12328.76303,12399.02941,12461.8828,12533.28709,12602.98801,12665.84892,12728.71086,12788.65997,12847.89788,12907.94045,12968.94638,13028.023,13081.85301,13133.79709,13184.44727,13234.48378,13283.3672,13324.99456,13362.07663,13399.24312,13438.90402,13478.87111,13518.25655,13555.83024],
                    "latinAm" : [5241.246461,5257.383501,5274.776174,5293.49616,5313.617497,5335.463201,5359.41372,5385.624488,5414.258548,5446.89559,5481.46581,5519.73829,5562.802429,5611.291696,5662.158767,5715.573398,5772.057026,5830.695463,5889.61841,5948.131846,6006.339282,6064.016293,6119.349521,6173.293807,6225.862295,6276.764738],
                    "northAm" : [547.8126598,561.3707179,575.8440517,590.8014857,606.2329455,621.7506103,636.8330554,651.2619328,666.2152737,681.6037692,702.2929335,724.3318275,748.3796304,771.6648196,791.5950357,810.1821735,828.9331968,849.0082946,870.2479598,892.0217082,913.1799262,935.1817196,958.2540335,982.0160222,1006.419298,1031.209628],
                    "oceania" : [406.0963236,407.0904831,408.156214,409.2975398,410.4805142,411.7181886,412.8895777,413.9702822,415.0933689,416.4217244,418.1452618,419.9886147,422.0224395,424.2238985,426.4781659,428.9769092,431.3212538,433.7608534,436.3264526,439.0557368,441.8677441,444.743879,447.8974988,451.1808012,454.5988083,458.1093931]
                };
                
                var days = userDate.getTime() / MILLISECONDS_PER_DAY;
				var userDateOfBirth = parseFloat(days, radix ) - EPOCH_OFFSET;

				userDateOfBirth = userDateOfBirth.toFixed(0);
				var lookupIndex = parseInt(((userDateOfBirth - JULY_ONE_NINETEEN_HUNDRED)/EIGHTEEN_TWENTY_SIX), radix);
				var lookupExponential = ((userDateOfBirth - JULY_ONE_NINETEEN_HUNDRED) / EIGHTEEN_TWENTY_SIX) - lookupIndex;
				var plusone = lookupIndex + 1;
				var leFromOne = 1 - lookupExponential;
                
                var totalRegionBeforeIndex,
                totalRegionAfterIndex,
                regionBefore,
                regionAfter,
                regionTotal,
                worldTotal = new Number(0);

                for (var region in peopleEverLived) {
                    totalRegionBeforeIndex = peopleEverLived[region][lookupIndex];
                    totalRegionAfterIndex = peopleEverLived[region][plusone];
                    regionBefore = Math.pow(totalRegionBeforeIndex, leFromOne);
                    regionAfter = Math.pow(totalRegionAfterIndex, lookupExponential);
                    regionTotal = parseInt((1000000 * regionBefore * regionAfter).toFixed(0));
                    
                    worldTotal = regionTotal + worldTotal;
                }
                
                userProfile.myposition = addCommas(myPosition);
                userProfile.myposionSuffix = getPostNumericString(myPosition);
                userProfile.worldTotal = addCommas(worldTotal);
                userProfile.worldTotalSuffix = getPostNumericString(worldTotal);
                                
                userProfile.userAge = parseInt(today.getFullYear(), radix) - birthday.y;
                if ((parseInt(today.getMonth(), radix) < birthday.m-1) ||
					((parseInt(today.getMonth(), radix) == birthday.m-1) && (parseInt(today.getDate(), radix) < birthday.d)))
						userProfile.userAge--;
                
                var param = {
                    population_on_this_day: userProfile.myposition,
                    post_numeric_string: userProfile.myposionSuffix,
                    world_total: userProfile.worldTotal,
                    post_numeric_string_total: userProfile.worldTotalSuffix
                };
                
                //write my position to dom
                $mypositionContainer.html(template.birthPosition.interpolate(param));
                
                createBarGraph(birthday.y - 1500);
                            
				positionHerePointer(birthday.y - 1500);  
                                
                return false;
                
            } //submit handler
        });
    }
    
    function calcMyPosition(userDate) {
		userDate.setHours(0);
		userDate.setMinutes(0);
		userDate.setSeconds(0);
		userDate.setMilliseconds(0);
	
	
		var days = userDate.getTime() / MILLISECONDS_PER_DAY;

		var userDateOfBirth = parseFloat(days, radix) - EPOCH_OFFSET;

		userDateOfBirth = userDateOfBirth.toFixed(0);
		var lookupIndex = parseInt(((userDateOfBirth - JULY_ONE_NINETEEN_HUNDRED)/EIGHTEEN_TWENTY_SIX), radix);
		var lookupExponential = ((userDateOfBirth - JULY_ONE_NINETEEN_HUNDRED) / EIGHTEEN_TWENTY_SIX) - lookupIndex;
		
		var totalBeforeIndex = fiveYearlyPopulation[lookupIndex];
		var plusone = lookupIndex + 1;

		var totalAfterIndex = fiveYearlyPopulation[plusone];

		var leFromOne = 1 - lookupExponential;

		var before = Math.pow(totalBeforeIndex, leFromOne);
		var after = Math.pow(totalAfterIndex, lookupExponential);   		
		var myPosition = (1000 * before * after ).toFixed(0);

		return myPosition;
	}
    
    function getPostNumericString(number) {
        var postNumeric = 'th';
        var str = number.toString();
        var catchme = str.substring(str.length - 2);
        if(catchme == '11' || catchme == '12' || catchme == '13'){
            return postNumeric;
        }
        switch (str.substring(str.length - 1)) {
            case '1':
                postNumeric = 'st';
                break;
            case '2': 
                postNumeric = 'nd';
                break;
            case '3':
                postNumeric = 'rd';
                break;
        }
        return postNumeric;
    }
        
    //step two
    function createCountryUI($){
    
        var $submitButton = $('#form_2 input#submit_origin');
        
        disableNextButton();
        
        $submitButton.addClass('disabled');
        
        $submitButton.attr('disabled', 'disabled');
                
        countryInFigures = countryData['world'];
        
        var worldAnnualGrowth = countryInFigures.annual_growth / 100;
        
        worldGrowthPerSecond =  (worldAnnualGrowth * countryInFigures.population) / (365 * 24 * 60 * 60);
        
        var countryCounterObject = getPopulationCounter(countryInFigures);
        
        setTimer(countryCounterObject.current, countryCounterObject.growth);
                        
        $("#form_2").validate({
            errorClass: 'invalid',
            errorContainer: '#error_message',
            invalidHandler: function(form, validator) {
            },
            submitHandler: function(form) {
                var country = (function(){
                    var formValues, countryObj;
                    formValues = $(form).serializeArray();
                    countryObj = formValues.shift();
                    return cleanCountryName(countryObj.value);                    
                })();
               
                
                countryInFigures = countryData[country];
                
                if (!countryInFigures) {
                    $('#form_2 input#submit_origin').addClass('disabled');
                    $('#form_2 input#submit_origin').attr('disabled', 'disabled');
                    return false;
                }
                              
                
                userProfile.countrycode = cleanCountryName(countryInFigures.title);
                //update country graphic
                $('div#myorigin').css('background-image', 'url("/news/special/world/11/7_billion/app/img/large_maps/' + userProfile.countrycode +'.gif")');
                
                var preposionedCountries = {'united_kingdom':'','uk':'','england':'','northern_ireland':'','channel_islands':'','czech_republic':'','democratic_republic_of_congo':'','maldives':'','netherlands':'','palestinian_territories':'','philippines':'','solomon_islands':'','ukraine':'','uae':'','united_states_virgin_islands':'','usa':''}
                
                // assign preposition 'the' to countries in object var preposionedCountries
                countryInFigures.preposition = (userProfile.countrycode in preposionedCountries) ? 'the ':'';
                
                // update userProfile
                userProfile.nationality = countryInFigures.title;
                userProfile.nationalPopulation = countryInFigures.population;
                userProfile.nationalityPrefix = countryInFigures.preposition;
                userProfile.nationDevStatus = countryInFigures.dev_status;
                
                
                //update user interface
                $("div#country_name").html(countryInFigures.title);
                
                var infigsBirth = countryInFigures.birth_per_hour.toFixed(0);
                var infigsDeath = countryInFigures.death_per_hour.toFixed(0);
                var infigsMigration = countryInFigures.migration_per_hour.toFixed(0);
                
                
                
                var infiguresParam = {
                    cif_bph_num: (infigsBirth > 0) ? addCommas(infigsBirth): "<1",
                    cif_bph_text: (infigsBirth == 1) ? 'Birth': 'Births',
                    cif_dph_num: (infigsDeath > 0) ? addCommas(infigsDeath): "<1",
                    cif_dph_text: (infigsDeath == 1) ? 'Death': 'Deaths',
                    cif_mph_num: (function () {
                                    if (infigsMigration == 0 || infigsMigration == -0) {
                                        if(countryInFigures.migration_per_hour == 0){
                                            return 0;
                                        }else if (countryInFigures.migration_per_hour > 0) {
                                            return "0 to 1";
                                        }else{
                                            return "0 to -1";
                                        }
                                    } else {
                                        return (infigsMigration > 0) ? '+'+infigsMigration: infigsMigration;
                                    }
                                })(),
                    cif_mph_text: (infigsMigration == 1 || infigsMigration == parseInt(-1, radix)) ? 'Immigrant': 'Immigrants',
                    cif_ayg: (function() {
                                var annualGrowth = countryInFigures.annual_growth.toFixed(1);
                                if ( annualGrowth < 0) { 
                                    return annualGrowth + "%";
                                }else {
                                    if (annualGrowth < 0.01){
                                        return "<0.1%";
                                    }else{
                                        return "+" + annualGrowth + "%";
                                    }
                                }
                            })()
                }; //infiguresParam
                
                $('div#myorigin div.figures').html(template.countryInFigures.interpolate(infiguresParam));
                                
                countryCounterObject = getPopulationCounter(countryInFigures);
                
                //delete current counter and start again
                clearInterval(populationCounterClock);
         
                setTimer(countryCounterObject.current, countryCounterObject.growth);
        
                enableNextButton();
                //disable submit button
                $('#form_2 input#submit_origin').addClass('disabled');
                $('#form_2 input#submit_origin').attr('disabled', 'disabled');
               
                return false;
                
            } //submit handler
        });
    } //createCountryUI
    
    function cleanCountryName(name) {
        var country
        country = name.replace(/[\s]/g, "_");
        country = country.toLowerCase();
        country = country.replace(/-/g, "_");
        return country.replace(/[-[\]{}()*&+?.',\\^$|#]/g, "");
    }
    
   /*
        *
        */
    function createGenderUI($) {
        disableNextButton();
        $female = $("div.mf-female");
        $male = $("div.mf-male");
        
        $("div#mf-life-expectancy").html(template.genderNationalAverage.interpolate({country_name: countryInFigures.title,country_preposition: countryInFigures.preposition,le_average: countryInFigures.life_expectancy_average}));
        $female.hide();
        $male.hide();
        //update male female values
        $("span#mf_female").html(countryInFigures.life_expectancy_female);
        $("span#mf_male").html(countryInFigures.life_expectancy_male);
        
        
        var $genderButtons = $("input#gender_male, input#gender_female");
        $genderButtons.bind('click', function (ev) {
            ev.preventDefault();
            $genderButtons.addClass("gender_disabled");
            $(this).removeClass("gender_disabled");            
            var gender = this.value;
            var $gender = $('div#gender');
            if (gender == 'male') {
                $gender.css('background-position', '-1364px 0px');
                $('span#mf_female').removeClass('selected');
                $('span#mf_male').addClass('selected');
            } else {
                $gender.css('background-position', '-682px 0px');
                $('span#mf_male').removeClass('selected');
                $('span#mf_female').addClass('selected');
            }
            $female.show();
            $male.show();
            enableNextButton();
            
            userProfile.gender = gender;
            userProfile.lifeExpectancy = (gender == 'male') ? countryInFigures.life_expectancy_male: countryInFigures.life_expectancy_female;
        });        
    }
    
    function createSummaryUI($, userdata) {
        if (userdata) {
            $("div#output_4").addClass('selected');
            
            $("li#head_1").removeClass('selected');
            $("li#head_4").addClass('selected');
            
            var usergender = userdata[0],
                userlifeExp = userdata[1],
                userposition = userdata[2],
                usercountrypopulation = userdata[3],
                usercountry = userdata[4],
                usercountryprefix = userdata[5],
                userage = userdata[6],
                userworldtotal = userdata[7],
                userconclusion = userdata[8];
                
                usergender = usergender.substring(1);
                
                usergender = (usergender == '1' || usergender == 1) ? 'male': 'female';
                
                
            $.ajax({
                url: '/news/special/world/11/7_billion/app/data/template.json',
                dataType: "json",
                success: function(data) {
                    var template = data.templates;
                    $("div#summary_id").html(template.friendSummaryId.interpolate({s_age: userage, s_gender: usergender, s_country_pref:usercountryprefix, s_country: usercountry}));
                    $("div#summary_position").html(template.friendSummaryPosition.interpolate({s_position: userposition}));
                    $("div#summary_nation p").html(usercountry);
                    $("div#summary_nation div").html(template.friendSummaryNation.interpolate({s_nation: addCommas(usercountrypopulation)}));
                    $("div#summary_gender").html(template.friendSummaryGender.interpolate({s_gender: userlifeExp}));
                    $("div#summary_gender").addClass('summary_'+usergender);
                    $("div#summary_text").html(template[userconclusion]);

                },
                error: function() {
                    //handle this error
                }
            });
            $('div#summary_nation').css('background-image', 'url("/news/special/world/11/7_billion/app/img/small_maps/' + cleanCountryName(usercountry) + '.gif")');
            
            $("div#summary_pop_increase").hide();
            return false;
        } else {
            var usersegment = (function() {
                var userAge = userProfile.userAge;
                if (userAge < 26) {
                    return 'young';
                } else if (userAge < 65) {
                    return 'mid';
                } else {
                    return 'upper';
                }
            })();
            var profileConclusion = usersegment + '_' + userProfile.gender + '_' + userProfile.nationDevStatus;
            
            $("div#summary_id").html(template.summaryId.interpolate({s_age: userProfile.userAge, s_gender: userProfile.gender, s_country_pref:userProfile.nationalityPrefix, s_country: userProfile.nationality}));
            $("div#summary_position").html(template.summaryPosition.interpolate({s_position: userProfile.myposition, s_position_suffix: userProfile.myposionSuffix}));
            $("div#summary_nation p").html(userProfile.nationality);
            $("div#summary_nation div").html(template.summaryNation.interpolate({s_nation: addCommas(userProfile.nationalPopulation)}));
            $("div#summary_gender").html(template.summaryGender.interpolate({s_gender: userProfile.lifeExpectancy}));
            
            // $("div#summary_gender").addClass('summary_'+userProfile.gender);
            $("div#summary_gender").css('background-image','url("/news/special/world/11/7_billion/app/img/summary_'+userProfile.gender+'.gif")');
            $("div#summary_text").html(template[profileConclusion]);
            
            var now = new Date();
            var totalTime = ((now - today) / 1000) * worldGrowthPerSecond;
            
            $('div#summary_nation').css('background-image', 'url("/news/special/world/11/7_billion/app/img/small_maps/' + userProfile.countrycode + '.gif")');
            $("div#summary_pop_increase").show();
            $("div#summary_pop_increase p.spi_total").html(template.summaryPopIncrease.interpolate({spi: addCommas(totalTime.toFixed(0))}));
            
            
            
            var sgender = (userProfile.gender == 'male') ? '1': '2';
            
            var shareHash = encodeURI(sgender +'~'+userProfile.lifeExpectancy +'~'+ userProfile.myposition+userProfile.myposionSuffix+'~'+ userProfile.nationalPopulation+'~'+userProfile.nationality +'~'+userProfile.nationalityPrefix +'~'+userProfile.userAge +'~'+ userProfile.worldTotal+'~'+profileConclusion);
            
            
            var fullUrl = 'url=http://www.bbc.co.uk/news/world-15391515%23' + shareHash;
            var shareToolsUrl = '/modules/sharetools/share?url=';
            var appId = '&appId=news7billion';
            var shareHtml = "<script src=\"http://static.bbc.co.uk/modules/sharetools/v1/script/sharetools.js\" type=\"text/javascript\"></script><div class=\"bbc-st\"><a href=\"{share_full_url}\">Share this page</a></div>";
                      
            var urlShortenServiceUrl = "http://www.bbc.co.uk/modules/sharetools/v1/shrink.json?" + fullUrl;
            
            
            
            $.ajax({
                url: urlShortenServiceUrl,
                dataType: "json",
                success: function(data) {
                    var shorturl = decodeURI(data.url);
                    //$("div#share_results div.bbc-st a").attr('href', shorturl);
                    var myfullShareUrl = shareToolsUrl + shorturl + appId;
                    console.log('full share url: ', myfullShareUrl);
                    $("div#share_results").html(shareHtml.interpolate({share_full_url:myfullShareUrl}));
                                        
                    sharetools = sharetools || {}; // Use existing object or create a new one if sharetools isn't loaded

                    sharetools.onReady = function() {
                        //Do something when sharetools is loaded
                        $("div#bottom-share-toolbar div.bbc-st-wrapper").each(function(indx){
                        if (indx != 0) {
                            $(this).hide();
                            }
                        });
                        
                        $("div#top-share-toolbar div.bbc-st-wrapper").each(function(indx) {
                            if (indx != 0) {
                                $(this).hide();
                            }
                        });
                    };
                },
                error: function(err) {
                   // handle this error
                }
            });
            
                    // var myfullShareUrl = shareToolsUrl + fullUrl;//shorturl + appId;
                    // $("div#share_results").html(shareHtml.interpolate({share_full_url:myfullShareUrl}));
                                        
                    // sharetools = sharetools || {}; // Use existing object or create a new one if sharetools isn't loaded

                    // sharetools.onReady = function() {
                       //// Do something when sharetools is loaded
                        // $("div#bottom-share-toolbar div.bbc-st-wrapper").each(function(indx){
                        // if (indx != 0) {
                            // $(this).hide();
                            // }
                        // });
                        
                        // $("div#top-share-toolbar div.bbc-st-wrapper").each(function(indx) {
                            // if (indx != 0) {
                                // $(this).hide();
                            // }
                        // });
                    // };
            
                       
            // window.location.hash = shareHash;
            return false;
        }
    }
    
    
    /**
            * @return object
            */
    function getBirthday(values) {
        return {
                    d: parseInt(values[0].value, radix),
                    m: parseInt(values[1].value, radix),
                    y: parseInt(values[2].value, radix)
                };
    } 
    
    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }//addCommas
       
    /**
            * @return object
            */
    function getPopulationCounter(infigures) {
        if (infigures.title == "World") {
			var day = new Date();
			currentPopulation = parseInt(calcMyPosition(day));

			day.setDate(day.getDate()+1);
			tomorrowPopulation = parseInt(calcMyPosition(day));
			growthPerMinute = (tomorrowPopulation - currentPopulation)/(24*60);
			
			day = new Date();
			growthSinceEstimate = (day.getMinutes() + (day.getHours()*60))*growthPerMinute;
			
			return {
				current: currentPopulation + growthSinceEstimate,
				growth: growthPerMinute
			};
		}
        //country population at a given date
        var countryPopulation = infigures.population;
        //date when estimate was made
        var estimateDate = new Date(2011, 6, 1);
        
        //pop growth per minute
        var growthPerMinute = (countryPopulation * (infigures.annual_growth/100)) / 525600;
        
        var timeNow = new Date();//Date.now();
        timeNow = timeNow.getTime();
        
        
        //growth since last estimate
        var growthSinceEstimate = ((timeNow - estimateDate.getTime())/(1000 * 60)) * growthPerMinute;
        return {
            current: countryPopulation + growthSinceEstimate,
            growth: growthPerMinute
        };
    }
    
    function setTimer(population, growthrate){
        
        //update counter with current population
        updateCounter(population);
        
        //update birth, death, growth rate
        $("div#annual_growth").html(growthrate)
        $("span#birth_val").html(countryInFigures.birth_per_minute)
        $("span#death_val").html(countryInFigures.death_per_minute)
        $("span#growth_val").html(countryInFigures.growthrate)
        
        //population in real time
        populationRollingTotal = population;
        
        if (growthrate !== 0) {
            //frequency of updates per minute
            var rate = 60000/Math.abs(growthrate);
            
            populationCounterClock = setInterval(function(){
                (growthrate > 0) ? populationRollingTotal++: populationRollingTotal--;
                updateCounter(populationRollingTotal);
            }, rate);
        }
    }
    var tax = true;
    function updateCounter(data) {
        var val = data.toFixed(0);
        val = val.toString();
        var arr = val.split('');
        
        // var spanned = '';
        // for (var i = 0; i < val.length; i++) {
            // spanned += '<span>'+val[i]+'</span>';
        // }
        $("span#population_meter").html('<span>'+arr.join('</span><span>')+'</span>');
    }
    
    
	function splitAnnualTotals(count) {
		var aTLen = annualTotals.length;
		
		if (!count)
			count = aTLen - 39;
		else
			count += 2;
		
		annualTotalsBefore = annualTotals.slice(0, count);
		annualTotalsAfter = annualTotals.slice(count);
		
		annualTotalsYear = 1500 + count - 1;
	}
	
	function positionHerePointer(pos) {
		$('#population_graph_pointer').css('left', '690px');
		$('#population_graph_pointer').css('top', '185px');
		$('#population_graph_pointer').show();
	}
	
        
	/**
	 * plot user on a bar graph
	 */
    function createBarGraph(population) {
		splitAnnualTotals(population);
		
		var options = {
            chart: {
                height: 424,
                marginBottom: 25,
				spacingLeft: 0,
				marginLeft: 0,
                renderTo: 'population_graph',
                type: 'column',
                width: 976,
                zoomType: 'none'
            },
			labels : {
				items : [{
					html : '<b>1500:</b> the population is estimated at 500 million',
					style: {
						color: '#505050',
						fontFamily: 'Arial, sans-serif',
						fontSize: '15px',
						left: '33px',
						top: '345px'
					}
				}, {
					html : '<b>2011:</b> 7,000,000,000',
					style: {
						color: '#505050',
						fontFamily: 'Arial, sans-serif',
						fontSize: '13px',
						left: '725px',
						top: '90px'
					}
				}]
			},
            xAxis: {
                lineColor: '#ffffff',
                type: 'datetime',
                dateTimeLabelFormats: {
                    year: '%Y'
                },
                endOnTick: true,
                tickColor: '#ffffff',
                tickInterval: 365 * 24 * 3600 * 1000 * 25
            },
            yAxis: {  
                labels: {
                    align: 'right',
                    enabled: true,
                    formatter: function () {
                        if(this.isFirst){
                            return '';
                        } else {
                            return this.value / 1000 + ' billion';
                        }
                    }
                },
                gridLineColor: '#ffffff',
                opposite: true,
                startOnTick: false,
                //tickInterval: 1000000000,
				tickInterval: 1000,
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            title: {
                text: ''
            },
            tooltip: {
                formatter: function() {
					return '<b>'+ new Date(this.x).getFullYear() +' population</b><br/>'+
                        //this.x +': '+ this.y;
						addCommas(Math.round(this.y*1000000));
				},
				style: {
					zIndex: 3
				}
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#ff0000'
            }],
            plotOptions: {
            },
            series: [{    
                name: 'Population',
                data: annualTotalsBefore,
				color: '#D1700E',
				shadow: false,
				borderWidth: 0,
                pointStart: Date.UTC(1500, 1, 1),
                pointInterval: 365 * 24 * 3600 * 1000 // one year   
			}, {
                name: 'Population',
                data: annualTotalsAfter,
				color: '#D8D8D8',
				shadow: false,
				borderWidth: 0,
                pointStart: Date.UTC(annualTotalsYear, 1, 1),
                pointInterval: 365 * 24 * 3600 * 1000 // one year   
            }]
        };
		
		
		if (population) {		
			herePointerX = 680;
			herePointerX += (population - 400)*(49/30);
			herePointerX -= 132; //Take into account text width
			chartPointerX = herePointerX + 132;
			herePointerX = (herePointerX > 722) ? 722:herePointerX;
			
			herePointerY = annualTotals[population];
			herePointerY = (10-(herePointerY/1000))*38;
			herePointerY -= 22;		
			chartPointerY = herePointerY + 31;		
			herePointerY = (herePointerY < 110) ? 110:herePointerY;

			options.labels.items.push({
						html : 'YOU ARE HERE',
						style: {
							color: '#505050',
							fontFamily: 'Arial, sans-serif',
							fontSize: '16px',
							fontWeight: 'bold',
							left: herePointerX+'px',
							top: herePointerY+'px'
						}
					});
		}
        
        
        
		
        var chart = new Highcharts.Chart(options, function(chart) { // on complete
			chart.renderer.path(['M', 30, 356, 'L', 30, 381])
				.attr({
					'stroke-width': 1,
					stroke: 'black',
					zIndex: 1
				})
				.add();
				
			chart.renderer.path(['M', 862, 101, 'L', 862, 122])
				.attr({
					'stroke-width': 1,
					stroke: 'black',
					zIndex: 1
				})
				.add();
			
            if (population)  {
				herePointerY = (herePointerY == 110) ? 127:herePointerY+9;
				herePointerX += (herePointerX == 722) ? 128:132;
				
				//Draw "here you are" pointer line
				chart.renderer.path(['M', herePointerX, herePointerY, 'L', chartPointerX, chartPointerY])
					.attr({
						'stroke-width': 1,
						stroke: 'black',
						zIndex: 1
					})
					.add();
			}
		});
        
		//chart.series[0].data[annualTotalsYear-1500].select(true,true);
        if(population) {
            enableNextButton();
            $('input#submit_bday').attr('disabled', 'disabled');
            $('form#form_1 input#submit_bday').addClass('disabled');
        }
    } //bar chart
    
 
    
})(); //end pop calculator	