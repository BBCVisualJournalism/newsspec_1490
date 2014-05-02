<link rel="stylesheet" href="/news/special/world/11/7_billion/app/css/7_billion.css?cachebuster=cb0000000006" type="text/css"/>
<link rel="stylesheet" href="/news/special/world/11/7_billion/app/css/input_el.css?cachebuster=cb0000000006" type="text/css"/>
<link rel="stylesheet" href="/news/special/world/11/7_billion/app/css/origin.css?cachebuster=cb0000000006" type="text/css"/>
<link rel="stylesheet" href="/news/special/world/11/7_billion/app/css/gender.css?cachebuster=cb0000000006" type="text/css"/>
<link rel="stylesheet" href="/news/special/world/11/7_billion/app/css/panel.css?cachebuster=cb0000000006" type="text/css"/>
<!--[if IE]>
    <link rel="stylesheet" href="/news/special/world/11/7_billion/app/css/ie.css?cachebuster=cb0000000004" type="text/css"/>
<![endif]-->
        
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js" type="text/javascript"></script>
<script src="/news/special/world/11/7_billion/app/js/highcharts.js" type="text/javascript"></script>
<script src="/news/special/world/11/7_billion/app/data/population.js?cachebuster=cb0000000006" type="text/javascript"></script>
<script src="/news/special/world/11/7_billion/app/js/population_calculator_v3.js?cachebuster=cb00000000127" type="text/javascript"></script>

<div id="wrapper_7_billion">
    <p><!--#include virtual="/news/special/world/11/7_billion/app/inc/intro.inc"--></p>
    
    <ul class="main_nav">
        <li id="head_1" class="selected"><a href="#output_1">1. DATE OF BIRTH</a></li>
        <li id="head_2"><a href="#output_2">2. COUNTRY</a></li>
        <li id="head_3"><a href="#output_3">3. GENDER</a></li>
        <li id="head_4"><a href="#output_4">4. RESULTS</a></li>
    </ul>
    
    <div class="navigation"><span id="cta_prev" class="disabled"></span><span id="cta_next">NEXT</span></div>
    
    <div id="output_1">
        <div class="input_cta">Where do you fit into 7 billion? <span>Enter your date of birth to find out:</span></div>
        <div class="pop_input">
            <form name="birthday" id="form_1" method="get" autocomplete="off">        
                <input name="bday" type="text" size="2" maxlength="2" id="bday" value="dd" class="required"/>
                <input name="bmonth" type="text" size="2" maxlength="2"  id="bmonth" value="mm" class="required"/>
                <input name="byear" type="text" size="4" maxlength="4"  id="byear" value="yyyy" class="required"/>
                <input type="submit" value="GO" id="submit_bday"/>
            </form>
        </div>
        <div id="population_graph"><div class="seven-billion-loader"><img src="/news/special/world/11/7_billion/app/img/spinner.gif" /></div></div>
        <div id="my_position"></div>
        
        <div id="panel_1_content" style="display: none;">
            <div>
                <h2><span>close</span></h2>
                <p>
                    Both numbers have been calculated using UN Population Division figures. The first is an estimate of how many people were alive on your date of birth. It is one possible value based on global population figures and estimates of growth rates over time. Data before 1950 is less accurate than figures after that date. The second number includes calculations based on the methodology of <a href="http://www.prb.org/Articles/2002/HowManyPeopleHaveEverLivedonEarth.aspx">scholar Carl Haub</a>, who estimated how many people had been alive since 50,000 B.C. His calculation has been amended by the UN to include additional points in time.
                    

                </p>
            </div>
        </div>
    </div>
    
    <div id="output_2">
        <div class="input_cta">How big is your country's population? <span>To find out, tell us where you live:</span></div>
        <div class="pop_input">
            <form name="country" id="form_2" method="get" autocomplete="off">        
                <input name="origin" type="text" size="20" id="origin" value="e.g. United Kingdom" class="required"/>
                <input type="submit" value="GO" id="submit_origin" disabled="disabled" />
            </form>
        </div>
        <div id="myorigin">
            <div id="country_name"></div>
            <div class="pop_count">
                <span>POPULATION </span><span id="population_meter">10002587</span>
            </div>
            
            <div class="figures">
                <div class="avg_hourly">
                    <h4>Every hour, there are:</h4>
                    <span id="pop_bph">15,347</span>
                    <span class="pop_head">Births</span>
                    <span id="pop_dph">6,418</span>
                    <span class="pop_head">Deaths</span>
                </div>
                <div class="avg_annual">
                    <h4>Average yearly growth</h4>
                    <span id="pop_ayg">+1.162%</span>
                </div>                     
            </div>
            
            <div id="panel_2_content">
                <div>
                    <h2><span>close</span></h2>
                    <p>
                        In developing nations, where improvements in health care and sanitation are seeing death rates fall, birth rates still remain relatively high. This is leading to rapidly rising populations. In fact, 97 out of every 100 new people on the planet are currently born in developing countries. Qatar - which has a large immigrant workforce - has seen its population rise rapidly in recent years.
                    </p>
                </div>
            </div>
            <div id="panel_3_content">
                <div>
                    <h2><span>close</span></h2>
                    <p>
                        In richer economies, although death rates are also low, widely-available birth control and a desire for smaller families keep birth rates subdued. Fewer babies ensures populations level off or even decline. Moldova, although poor by European standards, has seen its population drop mainly because of emigration.
                    </p>
                </div>
            </div> 
            
        </div>
        <div id="inpespective">
            <div class="highest_pop_growth">
                <h3>Fastest-growing country</h3>
                <h4>Qatar</h4>
                <div class="figures">
                    <div class="section-value">
                        +514 people per day
                    </div>
                    <div class="section-labels">
                        <span class="lab1">Average 2005-2010</span>
                        <span class="pop_panel" id="panel_2">Why?</span>
                    </div>
                </div>
            </div>
            <div class="lowest_pop_growth">
                <h3>Fastest-shrinking country</h3>
                <h4>Moldova</h4>
                <div class="figures">
                    <div class="section-value">
                        -106 people per day
                    </div>
                    <div class="section-labels">
                        <span class="lab1">Average 2005-2010</span>
                        <span class="pop_panel" id="panel_3">Why?</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="clear_7_billion"></div>
    </div>
    
    <div id="output_3">
        <div class="input_cta">Life expectancy varies across the world. <span>Are you:</span></div>
        <div class="pop_input">
            <form name="gender" id="form_3" method="get" autocomplete="off"> 
                <input type="submit" value="female" id="gender_female"  class="gender_disabled" />
                <input type="submit" value="male" id="gender_male" class="gender_disabled" />
            </form>
        </div>
        <div id="gender">
            <div class="mf-comparison">
                <div class="mf-female">
                    <span id="mf_female">81.6</span>
                    <span>Female average</span>
                </div>
                <div class="mf-male">
                    <span id="mf_male">77.2</span>
                    <span>Male average</span>
                </div>
            </div>
            <div id="mf-life-expectancy">
                The average life expectancy in <strong>the UK</strong> is <strong>81.6 years</strong>
            </div>
            
            
            <div id="panel_4_content">
                <div>
                    <h2><span>close</span></h2>
                    <p>
                        Japan's high life expectancy has been put down to a combination of a healthy diet and good public health provision, which includes regular check-ups.
                    </p>
                </div>
            </div>
            <div id="panel_5_content">
                <div>
                    <h2><span>close</span></h2>
                    <p>
                        The low life expectancy of those born in poorer countries, such as the Central African Republic, is explained by a number of factors, including poverty, conflict, poor access to health care and the high prevalence of Aids.
                    </p>
                </div>
            </div> 
            
        </div>
        <div id="gender_pespective">
            <div class="highest_life_exp">
                <h3>Highest life expectancy</h3>
                <h4>Japan</h4>
                <div class="figures">
                    <div class="section-value">
                        82.7 years
                    </div>
                    <div class="section-labels">
                        <span class="lab1">Average 2005-2010</span>
                        <span class="lab2" id="panel_4">Why?</span>
                    </div>
                </div>
            </div>
            <div class="lowest_life_exp">
                <h3>Lowest life expectancy</h3>
                <h4>Central African Republic</h4>
                <div class="figures">
                    <div class="section-value">
                        45.9 years
                    </div>
                    <div class="section-labels">
                        <span class="lab1">Average 2005-2010</span>
                        <span class="lab2" id="panel_5">Why?</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="clear_7_billion"></div>
    </div>
    <div id="output_4">
        <div id="summary_id"></div>
        <div class="summary_left">
            <div id="summary_position"></div>
            <div id="summary_nation">
                <p></p>
                <div></div>
            </div>
            <div id="summary_gender"></div>
        </div>
        <div class="summary_right">
            <div id="summary_text">
                this is the text
            </div>
            <div id="summary_pop_increase">
                <p class="spi_total"></p>
                <p>the amount the population has grown while you've been on this site</p>
            </div>
            <div id="share_results"></div>
        </div>
        
        <div class="clear_7_billion"></div>
    </div>
    <div class="clear_7_billion"></div>
    
</div>

