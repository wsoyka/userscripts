// ==UserScript==
// @name         Willhaben
// @version      0.3
// @description  Automatically adds Sorting, Area and Rows params to Willhaben.at search queries
// @author       Wolfram Soyka
// @namespace    https://github.com/wsoyka/userscripts/raw/master/willhaben.user.js
// @match        http*://*.willhaben.at/iad/kaufen-und-verkaufen/martkplatz/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /*****************************/
    /* Edit params to your liking*/
    /*****************************/
    var area = "900"; //900 = Wien
    var rows = "100";
    var sort = "3"; //3 = preis aufsteigend

    //check if there even are GET params in the url
    if (window.location.search.length > 0) {
        //if theres no keyword in url, we probably havent changed the url for that keyword
        if(!/[?&]keyword=/.test(window.location.search)){
            sessionStorage.removeItem('changedAreaIdOnceThisSearch', true);
        } else {
            //if there is a keyword, make sure its not a new one. if it is, reset allowance
            var url = new URL(window.location.href);
            var currKw = url.searchParams.get("keyword");
            if(currKw !== sessionStorage.getItem('lastKnownKeyword')){
                sessionStorage.removeItem('changedUrlOnceThisSearch', true);
            }
            sessionStorage.setItem('lastKnownKeyword', currKw);
        }
        if(!sessionStorage.getItem('changedUrlOnceThisSearch')){
            var append = "";
            //add sorting, area and rows params if not set
            if(!/[?&]sort=/.test(window.location.search)){
                append+="&sort="+sort;
            }
            if(!/[?&]areaId=/.test(window.location.search)){
                append+="&areaId="+area;
            }
            if(!/[?&]rows=/.test(window.location.search)){
                append+="&rows="+rows;
            }
            window.location.search+=append;
            sessionStorage.setItem('changedUrlOnceThisSearch', true);
        }
    } else { //no GET params, set everything once
        window.location.search+="?areaId="+area+"&rows="+rows+"&sort="+sort;
        sessionStorage.setItem('changedUrlOnceThisSearch', true);
    }

})();
