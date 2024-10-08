// ==UserScript==
// @name         HTML5 Video Controls
// @namespace    @@https://github.com/wsoyka/userscripts/raw/master/html5_video_controls.user.js
// @version      1.03
// @description  add hotkeys and other functionality to html5 video players
// @author       Wolfram Soyka

// @match        http*://www.youtube.com/*
// @match        http*://www.netflix.com/*
// @match        http*://*.tiktok.com/*
// @match        http*://*.twitter.com/*
// @match        http*://*.vimeo.com/*
// @match        http*://*.facebook.com/*
// @match        http*://*.reddit.com/*
// @match        http*://*.flickr.com/*
// @match        http*://www.instagram.com/*
// @match        http*://*.dailymotion.com/*
// @match        http*://*.twitch.tv/*
// @match        http*://*.rumble.com/*
// @match        http*://*.nebula.tv/*
// @match        http*://*.primevideo.com/*
// @match        http*://*.hbo.com/*
// @match        http*://*.disneyplus.com/*



// @grant    	 GM_addStyle

// @run-at document-body
// ==/UserScript==

/*
  _    _ _______ __  __ _      _____  __      ___     _             _____            _             _
 | |  | |__   __|  \/  | |    | ____| \ \    / (_)   | |           / ____|          | |           | |
 | |__| |  | |  | \  / | |    | |__    \ \  / / _  __| | ___  ___ | |     ___  _ __ | |_ _ __ ___ | |___
 |  __  |  | |  | |\/| | |    |___ \    \ \/ / | |/ _` |/ _ \/ _ \| |    / _ \| '_ \| __| '__/ _ \| / __|
 | |  | |  | |  | |  | | |____ ___) |    \  /  | | (_| |  __/ (_) | |___| (_) | | | | |_| | | (_) | \__ \
 |_|  |_|  |_|  |_|  |_|______|____/      \/   |_|\__,_|\___|\___/ \_____\___/|_| |_|\__|_|  \___/|_|___/

This script is developed for chromium based browsers using Tampermonkey.

Main focus is to be able to play HTML5Videos with higher playback rates.

Operates by modifying attributes of the first HTML5 Video Player ("video" element) on a page.
Some sites have specific setups, but as long as a player can be found basic functionality should work.
Some UIs ignore the players attributes after initialization, meaning the UI will not be updated (e.g. on pause).
*/

//JSHint Config
/*globals Mousetrap:false */


'use strict';

/* mousetrap v1.6.5 https://craig.is/killing/mice */
(function(q,u,c){function v(a,b,g){a.addEventListener?a.addEventListener(b,g,!1):a.attachEvent("on"+b,g)}function z(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return n[a.which]?n[a.which]:r[a.which]?r[a.which]:String.fromCharCode(a.which).toLowerCase()}function F(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function w(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function A(a,b){var g,d=[];var e=a;"+"===e?e=["+"]:(e=e.replace(/\+{2}/g,"+plus"),e=e.split("+"));for(g=0;g<e.length;++g){var m=e[g];B[m]&&(m=B[m]);b&&"keypress"!=b&&C[m]&&(m=C[m],d.push("shift"));w(m)&&d.push(m)}e=m;g=b;if(!g){if(!p){p={};for(var c in n)95<c&&112>c||n.hasOwnProperty(c)&&(p[n[c]]=c)}g=p[e]?"keydown":"keypress"}"keypress"==g&&d.length&&(g="keydown");return{key:m,modifiers:d,action:g}}function D(a,b){return null===a||a===u?!1:a===b?!0:D(a.parentNode,b)}function d(a){function b(a){a=a||{};var b=!1,l;for(l in p)a[l]?b=!0:p[l]=0;b||(x=!1)}function g(a,b,t,f,g,d){var l,E=[],h=t.type;if(!k._callbacks[a])return[];"keyup"==h&&w(a)&&(b=[a]);for(l=0;l<k._callbacks[a].length;++l){var c=k._callbacks[a][l];if((f||!c.seq||p[c.seq]==c.level)&&h==c.action){var e;(e="keypress"==h&&!t.metaKey&&!t.ctrlKey)||(e=c.modifiers,e=b.sort().join(",")===e.sort().join(","));e&&(e=f&&c.seq==f&&c.level==d,(!f&&c.combo==g||e)&&k._callbacks[a].splice(l,1),E.push(c))}}return E}function c(a,b,c,f){k.stopCallback(b,b.target||b.srcElement,c,f)||!1!==a(b,c)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?b.stopPropagation():b.cancelBubble=!0)}function e(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=z(a);b&&("keyup"==a.type&&y===b?y=!1:k.handleKey(b,F(a),a))}function m(a,g,t,f){function h(c){return function(){x=c;++p[a];clearTimeout(q);q=setTimeout(b,1E3)}}function l(g){c(t,g,a);"keyup"!==f&&(y=z(g));setTimeout(b,10)}for(var d=p[a]=0;d<g.length;++d){var e=d+1===g.length?l:h(f||A(g[d+1]).action);n(g[d],e,f,a,d)}}function n(a,b,c,f,d){k._directMap[a+":"+c]=b;a=a.replace(/\s+/g," ");var e=a.split(" ");1<e.length?m(a,e,b,c):(c=A(a,c),k._callbacks[c.key]=k._callbacks[c.key]||[],g(c.key,c.modifiers,{type:c.action},f,a,d),k._callbacks[c.key][f?"unshift":"push"]({callback:b,modifiers:c.modifiers,action:c.action,seq:f,level:d,combo:a}))}var k=this;a=a||u;if(!(k instanceof d))return new d(a);k.target=a;k._callbacks={};k._directMap={};var p={},q,y=!1,r=!1,x=!1;k._handleKey=function(a,d,e){var f=g(a,d,e),h;d={};var k=0,l=!1;for(h=0;h<f.length;++h)f[h].seq&&(k=Math.max(k,f[h].level));for(h=0;h<f.length;++h)f[h].seq?f[h].level==k&&(l=!0,d[f[h].seq]=1,c(f[h].callback,e,f[h].combo,f[h].seq)):l||c(f[h].callback,e,f[h].combo);f="keypress"==e.type&&r;e.type!=x||w(a)||f||b(d);r=l&&"keydown"==e.type};k._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)n(a[d],b,c)};v(a,"keypress",e);v(a,"keydown",e);v(a,"keyup",e)}if(q){var n={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},r={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},C={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},B={option:"alt",command:"meta","return":"enter",escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},p;for(c=1;20>c;++c)n[111+c]="f"+c;for(c=0;9>=c;++c)n[c+96]=c.toString();d.prototype.bind=function(a,b,c){a=a instanceof Array?a:[a];this._bindMultiple.call(this,a,b,c);return this};d.prototype.unbind=function(a,b){return this.bind.call(this,a,function(){},b)};d.prototype.trigger=function(a,b){if(this._directMap[a+":"+b])this._directMap[a+":"+b]({},a);return this};d.prototype.reset=function(){this._callbacks={};this._directMap={};return this};d.prototype.stopCallback=function(a,b){if(-1<(" "+b.className+" ").indexOf(" mousetrap ")||D(b,this.target))return!1;if("composedPath"in a&&"function"===typeof a.composedPath){var c=a.composedPath()[0];c!==a.target&&(b=c)}return"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable};d.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)};d.addKeycodes=function(a){for(var b in a)a.hasOwnProperty(b)&&(n[b]=a[b]);p=null};d.init=function(){var a=d(u),b;for(b in a)"_"!==b.charAt(0)&&(d[b]=function(b){return function(){return a[b].apply(a,arguments)}}(b))};d.init();q.Mousetrap=d;"undefined"!==typeof module&&module.exports&&(module.exports=d);"function"===typeof define&&define.amd&&define(function(){return d})}})("undefined"!==typeof window?window:null,"undefined"!==typeof window?document:null);

(function() {
    const L_NOTHING = 99, L_ALWAYS = 10, L_ERROR = 5, L_WARN = 4, L_SUCCESS = 3, L_INFO = 2, L_DEBUG = 1;
    const LOGLVLLABELS = {10: "ALWAYS", 5: "ERROR", 4: "WARN", 3: "SUCCESS", 2: "INFO", 1: "DEBUG"};

    let config = {
        hotkeys: { //for help, see https://craig.is/killing/mice#keys
            playbackRateUp: ["plus", "ä"],
            playbackRateDown: ["-", "ö"],
            playbackRateUpSlow: ["*", "Ä"],
            playbackRateDownSlow: ["_", "Ö"],
            fullscreen: ["f"],
            playpause: ["space"],
            netflixNext: ["n"],
        },
        showDefaultPlaybackRate: true, //wether to show the default playback rate of 1.00
        playbackRateChange: 0.25, //standard playbackRate step
        playbackRateSlowChange: 0.125, //slow playbackRate step
        checkForDynamicPageChangeMs: 7000, //how often to check if the page has changed dynamically. 0 to disable
        runOnPopstate: true, //whether to re-run on popstate.
        getPlayerInitialDelay: 2000, //~time to wait for video element to have been added to the page
        getPlayerRefreshDelay: 5000, //interval to re-run setup if it failed
        maxSetupAttempts: 30, //max attempts to setup
        focusPlayerInterval: 10000, //interval the player is given focus in ms. (many players have shortcuts implemented if focused.) 0 to disable
        playbackRateMaximum: 16, //max playbackRate, most browsers seem to hardcap at 16
        playbackRateMinimum: 0, //min playbackRate, values below 0 are ignored by players
        logLevel: L_DEBUG, //minimum log level that gets printed. L_NOTHING to print no logs
        scriptName: 'HTML5 Player Controls', //name of script, used as console logging prefix
        site:'undef' //do not change set by script, used to decide what preconfig to use for known sites
    };

    let videoEl, playbackRatePanel;
    let playbackRateRestore;
    let DOMObserver, myHrefObserver, videoObserver;
    let lastKnownHrefWithoutHash = locationHrefWithoutHash(window.location), setupAttempts = 0;

    HTML5VideoControlsPlayerSetup("initial startup");
    bindHotkeys();

    //catch dynamic pagechanges
    if(config.runOnPopstate){
        window.onpopstate = () => HTML5VideoControlsPlayerSetup("onpopstate");
    }
    if(config.checkForDynamicPageChangeMs>0){
        setInterval(periodical_hrefComparison, config.checkForDynamicPageChangeMs);
    }
    //observer_windowLocationObserver(); //runs too often



    function HTML5VideoControlsPlayerSetup(src="unknown"){
        const matches = /(twitch.tv|youtube|netflix|tvthek.orf)/.exec(window.location.hostname);
        if (matches) {
            config.site = matches[1];
        }
        
        log("HTML5VideoControlsPlayerSetup() running. site: "+config.site+" source: "+src, L_ALWAYS);
        
        if(getDOMVideoNode()){
            try{DOMAppendPlaybackRatePanel();} catch (e){log("error injecting playbackRatePanel "+e.message, L_ERROR);}

            if(playbackRateRestore){
                log(`HTML5VideoControlsPlayerSetup() Restoring previous values.. PlaybackRate:${playbackRateRestore}`);
                changePlaybackRateBy(playbackRateRestore - 1);
            }
            
            if(config.focusPlayerInterval > 0){
                setInterval(focusPlayer, config.focusPlayerInterval);
            }
            log("HTML5VideoControlsPlayerSetup() done", L_DEBUG);
        } else {        
            log("HTML5VideoControlsPlayerSetup() done without finding a video player. will rerun");
            if(setupAttempts++<config.maxSetupAttempts){
                setTimeout(() => HTML5VideoControlsPlayerSetup("attempt "+setupAttempts), setupAttempts*config.getPlayerRefreshDelay)
            }
        }
    }
    
    function periodical_hrefComparison(){
        let newHref = locationHrefWithoutHash(window.location);
        if ( newHref !== lastKnownHrefWithoutHash) {
            lastKnownHrefWithoutHash = newHref;
            //can trigger before elements ready
            setTimeout(() => HTML5VideoControlsPlayerSetup("periodical_hrefComparison"), config.getPlayerInitialDelay);
        }
    }

    //probably not worth the effort?
    function observer_windowLocationObserver(){
        if (myHrefObserver) { //cancel previous observer
            log("[hrefObserver] disconnecting", L_DEBUG);
            myHrefObserver.disconnect();
        }
        myHrefObserver = new MutationObserver(function(mutations) {
            if (locationHrefWithoutHash(window.location) !== lastKnownHrefWithoutHash) {
                log(`[hrefObserver] URL changed from ${lastKnownHrefWithoutHash} to ${window.location.href}`, L_DEBUG);
                lastKnownHrefWithoutHash = locationHrefWithoutHash(window.location);
                //triggers too early, have to delay execution
                setTimeout(() => HTML5VideoControlsPlayerSetup("hrefObserver"), config.getPlayerInitialDelay);
            }
        });
        log("[hrefObserver] observing..", L_DEBUG);
        myHrefObserver.observe(document.body, {subtree: true, childList: true});
    }
    

    /**
     * Initial wait for video Element
     * https://stackoverflow.com/a/39332340
     */
    function observeVideoNodes(){
        if (videoObserver) { //cancel previous observer
            log("[videoObserver] disconnecting", L_DEBUG);
            videoObserver.disconnect();
        }

        videoObserver = new MutationObserver(mutationsList => {
            Array.from(mutationsList)
                .filter(mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0)
                .forEach(mutation => {
                Array.from(mutation.addedNodes)
                    .filter(node => node instanceof HTMLVideoElement)
                    .forEach(node => {
                    node.addEventListener('playing', HTML5VideoControlsPlayerSetup);
                });
            });
        });

        videoObserver.observe(document.body, {
            childList: true, // observe additions/removals of child nodes
            subtree: true, // observe mutations in all descendants of the target node
        });
    }

    /* try to get videoplayers */
    function getDOMVideoNode(){
        log("Starting search for DOM Video Player", L_DEBUG);
        //TODO IDEA instead, check event onplaying for all video elements of a site, control the playing one.
        let selector = "video:first-of-type";
        if(config.site==='tvthek.orf'){
            selector = ".video_wrapper video";
        }

        videoEl = document.querySelectorAll(selector); //leave as jquery obj for now
        if (videoEl.length > 0){
            videoEl = videoEl[0]; //take first player
            log("Got Videoplayer", L_DEBUG);
            return true;
        } else {
            videoEl = null;
            log("No video element was found.", L_DEBUG);
            //throw new Error('No video element was ever found');
            return false;
        }
    }

    /*
    Change the players playbackRate. it cant go below 0 (0=video paused but technically still playing), and seems to be usually hardcappet at 16.
    softcapped at config.playbackRateMinimum and config.playbackRateMaximum
    @param {double} by - the playbackRate delta
    */
    function changePlaybackRateBy(by){
        try{
            if(!playbackRatePanel) {
                log("cant find playbackRate panel", L_ERROR);
                DOMAppendPlaybackRatePanel();
            }
           
            videoEl.playbackRate = Math.min(Math.max(videoEl.playbackRate+by, config.playbackRateMinimum), config.playbackRateMaximum);            
            playbackRateRestore = videoEl.playbackRate;
            playbackRatePanel.innerText = videoEl.playbackRate.toFixed(2); 
            log("PlaybackRate changed, new: "+videoEl.playbackRate.toFixed(2));
        } catch (e) {
            log('Error changing playbackRate: '+e.message, L_ERROR);
        }
    }


    /*
    Insert the playbackRate panel into the site
    */
    function DOMAppendPlaybackRatePanel(){
        if(videoEl){
            if(!videoEl.parentElement.querySelector('#playbackRatePanel')){
                log("adding playbackRatePanel to video", L_DEBUG);
                let txt = config.showDefaultPlaybackRate ? "1.00" : "";
                
                const newDiv = document.createElement('div');
                newDiv.id = 'playbackRatePanel';
                newDiv.classList.add('playbackRatePanel');
                newDiv.textContent = txt;

                videoEl.parentElement.appendChild(newDiv);
            }
            playbackRatePanel = document.querySelector('#playbackRatePanel');
        } else {
            log("cant append playbackratepanel, no video el.", L_ERROR)
        }
    }

    function isInViewport(element, pctInViewport=40) {
        const bRect = element.getBoundingClientRect();     
        const intersectionHeight = Math.min(bRect.bottom, window.innerHeight) - Math.max(bRect.top, 0);
        const percentageInView = (intersectionHeight / element.clientHeight) * 100;
      
        return percentageInView >= pctInViewport;
      }

    /*
    Focus the player
    */
    function focusPlayer(){
        if (config.site === 'netflix'){ //netflix player is always focused
            return; 
        }
        const hasFocusedInput = document.activeElement && document.activeElement.tagName.toLowerCase() === 'input';
        const videoPlaying =   videoEl.currentTime > 0 && !videoEl.paused && !videoEl.ended;


        if(hasFocusedInput || !videoPlaying || !isInViewport(videoEl, 80)){
            log("wont focus player, because an <input> element is currently focused, video isnt playing or in viewport", L_DEBUG)
            return;
        }

        if(config.site === "twitch.tv" || config.site === 'youtube'){
            videoEl.parentElement.parentElement.focus();
        } else {
            videoEl.focus();
        }
        log("focusing video player", L_DEBUG);
    }


    function bindHotkeys(){
        Mousetrap.bind(config.hotkeys.netflixNext, function() {
            log("clicking netflix next button");
            document.querySelector('button[data-uia="next-episode-seamless-button"]').click()
        });

        Mousetrap.bind(config.hotkeys.fullscreen, function() {
            log("going/exiting fullscreen");
            videoEl.requestFullscreen();

            //TODO youtube sometimes shows "Fullscreen not available" message when using this.
            //     Exiting removes the message, doubleclicking the player works and does not show this message.
        });

        Mousetrap.bind(config.hotkeys.playpause, function() {
            if(videoEl.parentNode.parentNode.contains(document.activeElement) || config.site==='netflix'){ // player focused or site that works as it should
                //youtube added this functionality at some point in 2023
                log("didnt play/pause, normal shortcut should work", L_DEBUG);
                return;
            } 
    
            if(videoEl.paused){
                videoEl.play();
            } else {
                videoEl.pause();
            }
        
            log("play/pause triggered");
        });

        Mousetrap.bind(config.hotkeys.playbackRateUp, function(){changePlaybackRateBy(config.playbackRateChange); return false;});
        Mousetrap.bind(config.hotkeys.playbackRateDown, function(){changePlaybackRateBy(-config.playbackRateChange); return false;});
        Mousetrap.bind(config.hotkeys.playbackRateUpSlow, function(){changePlaybackRateBy(config.playbackRateSlowChange); return false;});
        Mousetrap.bind(config.hotkeys.playbackRateDownSlow, function(){changePlaybackRateBy(-config.playbackRateSlowChange); return false;});
    }

    // Add our styles to page
    GM_addStyle(multilineCssStr(function () {/*!
        .playbackRatePanel {
            color: rgb(207, 207, 207);
            font-size: 14px;
            z-index: 999999;
            position: absolute;
            right: 2px;
            top: 2px;
            display: inline;
            width: 35px;
            height: 24px;
            color: #80ff02;
            user-select: none;
        }
        #js-paused-overlay {
            cursor: pointer;
        }
        .player-button-play{
            display:none!important;
        }
    */}));

    /*
    Make GM_addStyle less of a pain with this awesome function (stackoverflow.com/q/27927950/3665531)
    @param {Function} dummyFunc - a function that should only contain a multiline JS comment in which normal css syntax appears. The string has to start with /*!
    */
    function multilineCssStr(dummyFunc) {
        let str = dummyFunc.toString();
        str = str.replace (/^[^\/]+\/\*!?/, '') // Strip function () { /*!
            .replace (/\s*\*\/\s*\}\s*$/, '') // Strip */ }
            .replace (/\/\/.+$/gm, ''); // Double-slash comments wreck CSS. Strip them.
        return str;
    }

     function locationHrefWithoutHash(location){
        return location.href.replace(location.hash, "");
    }

    /*
    Print console messages, if corresponding configs are set.
    Console messages will be prefixed with config.name
    @param {String} msg - the message to be printed
    @param {String} lvl - the log level
    */
    function log(msg, lvl = L_INFO) {
        const cmsg = `[${new Date().toISOString()}] ${config.scriptName} [${LOGLVLLABELS[lvl]}]: ${msg}`;
        if(config.logLevel === L_NOTHING){
            return;
        } else if ((lvl >= config.logLevel)) {
            switch (lvl) {
                case L_ALWAYS:
                case L_DEBUG:
                case L_INFO:
                case L_SUCCESS:
                    console.log(cmsg); break;
                case L_WARN:
                    console.warn(cmsg); break;
                case L_ERROR:
                    console.error(cmsg); break;
                default:
                    console.error(`${cmsg} (INVALID LOG LVL: ${lvl})`);
            }
        }
    }
})();