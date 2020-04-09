// ==UserScript==
// @name         Asana Search
// @namespace    https://github.com/wsoyka/userscripts/raw/master/asana_search.user.js
// @version      0.1
// @description  Add a simple searchbar to Asanas Project view
// @author       Wolfram Soyka
// @match        https://app.asana.com/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';

    var correctPageIndicator = ".ProjectPage",
        eachItemSelector = ".SpreadsheetRow",
        searchbarParentSelector = ".ProjectSpreadsheetGridPageToolbar>.PageToolbarStructure-leftChildren",
        searchbarId = "xx_my_unique_search",
        searchbarPlaceholder = "Search project list..",
        searchItemDisplayType = "flex",
        searchItemTextTag = "textarea";



    var searchbarParent, eachItem;
    $(document).ready(function() {
        run();

        //TODO rerun when page changes - find asanas state change - onpopstate isnt fired
    });

    function run(){
        searchbarParent = document.querySelector(searchbarParentSelector);
        eachItem = document.querySelectorAll(eachItemSelector);

        //check if we are on project page
        if ($(correctPageIndicator).length > 0) {
            //check searchbar doesnt already exist
            if($(searchbarId).length == 0){
                addElements();
                searchFunction();
            }
        }
    }


    function createBar() {

        var mySearch = document.createElement("div");
        var input = document.createElement("input");
        var searchButton = document.createElement("button");

        input.type = "text";
        input.setAttribute("id", searchbarId);

        var txtNode = document.createTextNode("Search");
        if (typeof txtNode == "object") { //TODO required?
            searchButton.appendChild(txtNode);
        }

        mySearch.appendChild(input);
        mySearch.appendChild(searchButton);

        input.placeholder = searchbarPlaceholder;

        return mySearch;
    }

    var searchFunction = function searchFeature() {

        var inputString = document.getElementById(searchbarId);
        var stringValue = inputString.value;

        inputString.onkeyup = function() {
            //toUpperCase to make it case insensitive
            var filter = $(this).val().toUpperCase()
            //loop through all the lis
            for (var i = 0; i < eachItem.length; i++) {
                var result = $(eachItem[i]).find(searchItemTextTag).text() //TODO search more than just the textarea

                if (result.toUpperCase().indexOf(filter) != -1)
                    eachItem[i].style.display = searchItemDisplayType;
                else
                    eachItem[i].style.display = 'none';
            }
        }
    }

    function addElements() {
        console.log('Adding searchbar')
        searchbarParent.appendChild(createBar());
    }
})();
