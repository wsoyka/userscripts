// ==UserScript==
// @name         Youtube Upload Date
// @version      0.1
// @description  Youtube stopped providing upload dates in watch next list. This script tries to undo that.
// @author       Wolfram Soyka
// @match        http*://*.youtube.com/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @grant        none
// ==/UserScript==

/* Possible ways:
   => *) each element has an accessibility aria-label, containing rough (relative) upload date (since upload)
   *) query youtube data api https://www.googleapis.com/youtube/v3/videos?id=&key=LE_KEY&part=snippet
   *) fetch data directly from url
*/

(function() {
    'use strict';
    var $ = window.jQuery;

    var reg_upload = /[0-9]* (?:years?|months?|weeks?|days?) ago/;

    function setUpload(){
        $('ytd-watch-next-secondary-results-renderer #items #dismissable').each(function(){
            var $vidtitle = $(this).find('#video-title');
            var upload_date = reg_upload.exec($vidtitle.attr('aria-label'));
            $("<br/><span>"+upload_date+"</span>").appendTo($(this).find('#metadata-line > span'));
        });
    }

    //youtube doesnt use popstate..
    document.getElementsByTagName("body")[0].addEventListener("yt-navigate-finish", function(){
        setTimeout(function(){
            //inital run
            setUpload();
            //observe
            var mutationObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    setUpload();
                });
            });
            const target = document.querySelector('ytd-watch-next-secondary-results-renderer #items');
            mutationObserver.observe(target, {childList: true,});
        }, 3000);
    });
})();
