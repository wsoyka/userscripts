// ==UserScript==
// @name         HTML5 Video Controls
// @namespace    https://github.com/wsoyka/userscripts/raw/master/html5_video_controls.user.js
// @version      0.43
// @description  add hotkeys and other functionality to html5 video players
// @author       Wolfram Soyka

// @match        http*://*/*

// @require      https://cdnjs.cloudflare.com/ajax/libs/mousetrap/1.6.1/mousetrap.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js

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
 
This is a hobby project. This script is developed for Tampermonkey and Google Chrome.
I cannot guarantee functionality for you, but I invite you to try it out, and experiment around with it.

Main focus of this script is to be able to play HTML5Videos with higher playback rates. Other functionality is purely for convenience.

Works by getting first HTML5 Video Player on page and  modifiying fields of its instance. 
Some sites have specific setups, but as long as a player can be found basic functionality should work. 
Warning: Some UIs are written in a way that ignore the players attributes after initialization, meaning the the UI
will not be updated, but the options will still change (e.g. muting the player will work, but the volume slider will 
be left where it was before the mute).
*/

//JSHint Config
/*globals $:false, console:false, Mousetrap:false, GM_addStyle:false */


'use strict';

const L_ALWAYS = 6, L_ERROR = 5, L_WARN = 4, L_SUCCESS = 3, L_INFO = 2, L_DEBUG = 1;
const LOGLVL = {6: "ALWAYS", 5: "ERROR", 4: "WARN", 3: "SUCCESS", 2: "INFO", 1: "DEBUG"};
/*
site: set by script, used to decide what preconfig to use for known sites
volumeControl: enable shortcuts for volume control
playbackRateCOntrol: enable shortcuts for playbackRate (Speed) control
forceFocusPlayer: repeatedly focus player. many players actually do have many shortcuts implemented but only if the player is focused
forceFocusPlayerInterval: interval that player is given focus in ms
	TODO forceFocus has to not do anything if a text input is selected
maxSpeed: max playbackrate, default is 16. Players will stop playing sound at 4. MIGHT VARY IN DIFFERENT BROWSERS
minSpeed: min playbackrate, values below 0 are ignored by players
showDefaultPbr wether or not to show the default playback rate of 1.00
debug: print messages to console
version: script version
name: name of script, used as console logging prefix
shortctus for controls:
*/
var config = {
    site:'undef',
    hotkeys: { //for help, see https://craig.is/killing/mice#keys
        volumeUp: ["up"],
        volumeDown: ["down"],
        volumeSlowUp: ["shift+up"],
        volumeSlowDown: ["shift+down"],
        playbackRateUp: ["plus", "ä"],
        playbackRateDown: ["-", "ö"],
        playbackRateSlowUp: ["*", "Ä"],
        playbackRateSlowDown: ["_", "Ö"],
        fullscreen: ["f"],
        mute: ["m"],
        playpause: ["space"],
        netflixNext: ["n"],
    },
    playbackRateChange: 0.25,
    playbackRateSlowChange: 0.125,
    getPlayerInitialDelay: 2000,
    getPlayerRefreshDelay: 300,
    getPlayerMaxTries: 3000,
    /*forceFocusPlayer:true,
    forceFocusPlayerInterval:1000,*/
    maxSpeed: 16,
    minSpeed: 0,
    showDefaultPbr: true,
    log:true,
    logLevel: L_ERROR, //minimum log level that gets printed
    name: 'HTML5 Player Controls'
};

var myPlayer = null, pbrPanel;
var currentPbr = 1, currentVol = 1;

/* try to get videoplayers */
function getPlayer(){
    //TODO IDEA instead, check event onplaying for all video elements of a site, control the playing one.
    var selector = "";
    if(config.site==='tvthek'){
        selector = ".video_wrapper video";
    } else {
        selector = "video:first-of-type";
    }
    myPlayer = $(selector); //leave as jquery obj for now
    if (myPlayer.length > 0){ //check if a player has already been added to DOM
        myPlayer = myPlayer[0]; //make vanilla obj
        return true;
    } else {
        myPlayer = null;
        return false;
    }
}

/* sleep via promise */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Wait for player and do other setup tasks*/
async function setUp(){
    //Set current site if known
    var loc = window.location.hostname;
    if(loc.includes("twitch.tv")) {
        config.site="twitch";
    } else if (loc.includes("youtube")){
        config.site="youtube";
    } else if (loc.includes("netflix")){
        config.site="netflix";
    } else if (loc.includes("tvthek.orf")){
        config.site="tvthek"
    }
    log("Site matched: " + config.site);

    log("Starting search for Video Player");

    getPlayer();

    if(myPlayer == null){
        log("No video element was ever found.", L_ERROR);
        throw new Error('No video element was ever found');
    }

    log("Got Videoplayer", L_SUCCESS);
    //re-get player in case of dynamic pages (e.g. netflix) on video element mutation
    //TODO untested
    observePlayer(myPlayer);

    try{showPbr();} catch (e){log("couldnt show pbr", L_ERROR);}
    try{setVolume(1);} catch (e){log("couldnt setVolume", L_ERROR);}
    try{focusPlayer();} catch (e){log("couldnt focus player", L_ERROR);}
}

/*
Change the players playbackRate (pbr). pbr cant go below 0 (0=video paused but technically still playing), softcapped at config.maxSpeed
@param {double} by - the playbackrate delta
*/
function changePbr(by){
    try{
        if(pbrPanel.length < 1) {
            log("cant find pbr panel", L_ERROR);
        }

        var newPbr = myPlayer.playbackRate+by;
        if(newPbr>16){
            newPbr=16;
        } else if (newPbr<0){
            newPbr=0;
        }
        currentPbr = newPbr;
        myPlayer.playbackRate=newPbr;
        pbrPanel.html(formatPbr(myPlayer.playbackRate));
        log("PlaybackRate changed, new rate: "+myPlayer.playbackRate);
    } catch (e) {
        log('Error changing pbr: '+e.meesage);
    }
}

/*
Formats given number to have 2 dec digits. will return empty string if number is 1 and config.showDefaultPbr is set to false
@param {double} numbr - the number to be formated
*/
function formatPbr(numbr){
    if(numbr===1 && !config.showDefaultPbr){
        return "";
    }
    return ""+parseFloat(Math.round(numbr * 100) / 100).toFixed(2);
}
/*
Play or pause the player. Since the twitch player doesnt update ui when triggering play or pause functions on twitch click the button instead
*/
function pp(){
    if(config.site ==='twitch'){
        $(".qa-pause-play-button").click();
    } else if(config.site ==='netflix'){
        return;
    }
    else {
        if(myPlayer.paused){
            myPlayer.play();
        } else {
            myPlayer.pause();
        }
    }
    log("play/pause triggered");
}

/*
Insert the currentplaybackrate panel into the site
*/
function showPbr(){
    if($(myPlayer).parent().find('#pbrPanel').length < 1){
        log("adding pbrPanel to video");
        var txt = config.showDefaultPbr ? "1.00" : "";
        getPlayer();
        $(myPlayer).parent().append(
            $('<div/>')
            .attr("id", "pbrPanel")
            .addClass("pbrPanel")
            .text(txt)
        );
    }
    pbrPanel = $('#pbrPanel');
}

/*
Set the players volume to some value between 0 and 1
@param {double} to - new volume level
*/
function setVolume(to){
    try{
        if(to<0 || to >1){
            log("invalid volume level, must be between 0 and 1", L_ERROR);
            return;
        }
        //update ui to relfect change
        if(config.site==='twitch'){
            $('.player-volume__slider-container>div').attr("aria-valuenow", "0");
            $('.player-volume__slider-container>div>.ui-slider-range').css('width', to*100+'%');
            $('.player-volume__slider-container>div>.ui-slider-handle').css('left', to*100+'%');
        } else if(config.site==='youtube' || config.site === 'netflix'){
            //as long as focused, ytp and netflix handle this on their own
            return;
        }
        myPlayer.volume = to;
        currentVol = to;
        log("new volume: " + myPlayer.volume);
    } catch (ex) {
        log(ex.message, L_ERROR);
    }
}

/*
Focus the player
*/
function focusPlayer(){
    //netflix does not require this
    //twitch only player.parent.parent can be focused, for ytb twitch focus style is okay, myPlayer.focus() would suffice
    if(config.site === 'twitch' || config.site === 'youtube'){
        myPlayer.parentElement.parentElement.focus(); //set focous to player so that as many shortcuts as possible are handled by original code
    } else if (config.site === 'netflix'){
        //do nothing
    } else {
        myPlayer.focus();
    }
    log("gave player focus");
}

function fullscreen(){
    if(config.site === "twitch"){
        $('.qa-fullscreen-button').click();
        focusPlayer();
        log("going/exiting fullscreen");
        return;
    } else {
        myPlayer.requestFullscreen();
    }
    //netflix and youtube seem to have global hotkeys for this
}

/*
Print console messages, if corresponding configs are set.
Console messages will be prefixed with config.name
@param {String} msg - the message to be printed
@param {String} lvl - the log level
*/
function log(msg, lvl=L_INFO){
    var cmsg=config.name+" ["+LOGLVL[lvl]+"]: "+msg;
    if(lvl==L_ALWAYS){
        console.log(cmsg);
    } else if(config.log && lvl>=config.logLevel){
        switch(lvl){
            case L_DEBUG: console.log(cmsg); break;
            case L_INFO: console.info(cmsg); break;
            case L_SUCCESS: console.log(cmsg); break;
            case L_SUCCESS: console.log(cmsg); break;
            case L_WARN: console.warn(cmsg); break;
            case L_ERROR: console.error(cmsg); break;
            default: console.error(config.name+" [INVALID LOG LVL ("+lvl+")]:"+msg);
        }
    }
}

function setHotkeys(){
    Mousetrap.bind(config.hotkeys.netflixNext, function() {
        document.querySelector(".button-nfplayerNextEpisode").click()
        log("netflix next pressed");
    });

    Mousetrap.bind(config.hotkeys.fullscreen, function() {
        fullscreen();
    });

    Mousetrap.bind(config.hotkeys.playpause, function() {
        if(myPlayer.parentNode.parentNode.contains(document.activeElement)){ // player selected
            log("didnt play/pause bc shortcut should work");
            return;
        }
        pp();
    });

    /* Playbackrate Up */
    Mousetrap.bind(config.hotkeys.playbackRateUp, function(){changePbr(config.playbackRateChange); return false;});

    /* Playbackrate Down */
    Mousetrap.bind(config.hotkeys.playbackRateDown, function(){changePbr(-config.playbackRateChange); return false;});

    /* Playbackrate Up slow, shift + */
    Mousetrap.bind(config.hotkeys.playbackRateSlowUp, function(){changePbr(config.playbackRateSlowChange); return false;});

    /* Playbackrate Up slow, shift - */
    Mousetrap.bind(config.hotkeys.playbackRateSlowDown, function(){changePbr(-config.playbackRateSlowChange); return false;});


    /* Mute */
    Mousetrap.bind(config.hotkeys.mute, function() {
        //document.getElementsByClassName("player-button player-button--volume qa-control-volume")[0].click();
        $('.player-button.player-button--volume.qa-control-volume').click();
        log("Muted/Unmuted player");
    });

    /* Volume up */
    Mousetrap.bind(config.hotkeys.volumeUp, function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        var to = myPlayer.volume+0.1;
        if(myPlayer.volume>0.9){
            to=1;
        }
        setVolume(to);
        log("volume up");
    });

    /* Volume down */
    Mousetrap.bind(config.hotkeys.volumeDown, function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        var to = myPlayer.volume-0.1;
        if(myPlayer.volume<0.1){
            to=0;
        }
        setVolume(to);
        log("volume down");
    });

    /* Volume up slow */
    Mousetrap.bind(config.hotkeys.volumeSlowUp, function() {
        var to = myPlayer.volume+0.05;
        if(myPlayer.volume>0.95){
            to=1;
        }
        setVolume(to);
        log("volume up");
    });

    /* Volume down slow */
    Mousetrap.bind(config.hotkeys.volumeSlowDown, function() {
        var to = myPlayer.volume-0.05;
        if(myPlayer.volume<0.05){
            to=0;
        }
        setVolume(to);
        log("volume down");
    });
}

/**
 * Initial wait for video Element
 * https://stackoverflow.com/a/39332340
 */
function waitForVideo(){
    let observer = new MutationObserver(function(mutations) {
        //console.log("wait for video triggered ");
        //console.log(mutations);
        let videoElements = document.getElementsByTagName('video');
        if (videoElements.length>0){
            log("found video", L_ALWAYS);
            setUp();
            observer.disconnect();
            return true;
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/*
 * Observe player element mutation
 * https://stackoverflow.com/a/39332340
 * @param player - the element to watch
 */
function observePlayer(player){
    let observer = new MutationObserver(function(mutations) {
        //console.log("observePlayer triggered:");
        //console.log(mutations);
        let videoElements = player.parentNode.getElementsByTagName('video');
        if (videoElements.length>0){
            if(videoElements.length > 1){
                console.log("found multiple video elements in old players parentNode, see:");
                console.log(videoElements);
            }
            myPlayer = videoElements[0];
            myPlayer.playbackRate = currentPbr;
            myPlayer.volume = currentVol;
        }
    });

    observer.observe(player.parentNode, {
        childList: true,
    });
}

$(function(){
    log("starting up", L_ALWAYS);
    if(waitForVideo()){
        setUp();
    }
    //on dynamic pagechange:
    window.onpopstate = function(){if(waitForVideo()){setUp();}};

    setHotkeys();
});

//--- Style our newly added elements using CSS.
GM_addStyle(multilineCssStr(function () {/*!
    .pbrPanel {
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
    var str = dummyFunc.toString();
    str = str.replace (/^[^\/]+\/\*!?/, '') // Strip function () { /*!
        .replace (/\s*\*\/\s*\}\s*$/, '') // Strip */ }
        .replace (/\/\/.+$/gm, ''); // Double-slash comments wreck CSS. Strip them.
    return str;
}
