// ==UserScript==
// @name         HTML5 Video Controls
// @namespace    none
// @version      0.30
// @description  add hotkeys and other functionality to html5 video players
// @author       Wolfram Soyka

// @match        http*://*.twitch.tv/*
// @match        http*://*.netflix.com/*
// @match        http*://*.youtube.com/*
// @match        http*://*.golem.de/*
// @match 		 http*://*.ltcc.tuwien.ac.at/*

// @require      https://cdnjs.cloudflare.com/ajax/libs/mousetrap/1.6.1/mousetrap.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require		 https://cdnjs.cloudflare.com/ajax/libs/izitoast/1.1.5/js/iziToast.min.js

// @require      file:///Users/Wolfram/Dropbox/Wolfram/dev/html5_video_controls.js
// @require      file://C:\Users\Mesh\Dropbox\Wolfram\dev\html5_video_controls.js
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
                                                                                                         

This is a hobby project. This project is under development and any part might and probably will change in future versions.
I am developing this for personal use and to hone some programming skills. This script is developed using Tampermonkey and Google Chrome.
I cannot guarantee functionality for you, but I invite you to try it out, and experiment around with it.
Main focus of this script is to be able to play as many HTML5Videos with higher playback rates. 
Other functionality is purely for convenience.

Works by getting first HTML5 Video Player on page and  modifiying fields of its instance. Any Sites you want to add feel free to add to 
the @match section above, as long as a player can be found basic functionality should work. Warning: Some UIs are written in a way that 
ignore the players attributes after initialization, meaning the the UI will not be updated, but the options will still change. E.g. muting
the player will work, but the volume slider will be left where it was before the mute.
*/

//JSHint Config
/*globals $:false, iziToast:false, console:false, Mousetrap:false, GM_addStyle:false */

/* TODO 
netflix compatibility broken
add quality up/down options shortcuts cmd up/down, windows?? --> cant find quality options for twitch
give player focus regularly (??)
netflix enable subtitles (iterate through) --> netflix controls seem to be in the shadow dom, no access
netflix switch audio language (iterate)

twitch player has a play button centered, increase click area to whole player? otherwise the button cancels out the fullscreenpp

per site config: netflix, twitch, youtube
use config
*/

'use strict';

/*
site: set by script, used to decide what preconfig to use for known sites
volumeControl: enable shortcuts for volume control
playbackRateCOntrol: enable shortcuts for playbackRate (Speed) control
playPauseOnClick: clicking anywhere on player plays/pauses
forceFocusPlayer: repeatedly focus player. many players actually do have many shortcuts implemented but only if the player is focused
forceFocusPlayerInterval: interval that player is given focus in ms
	TODO forceFocus has to not do anything if a text input is selected
maxSpeed: max playbackrate, default is 16. Players will stop playing sound at 4. MIGHT VARY IN DIFFERENT BROWSERS
minSpeed: min playbackrate, values below 0 are ignored by players
showDefaultPbr wether or not to show the default playback rate of 1.00
debug: print messages to console
notifications: show notifications
notiOptions: 	position: iziToast position where notifications are to be displayed
				timeout:  how long notifications are shown in ms
				timeBetween: delay between each notification in ms. advised to be either 0 or >300
version: script version
name: name of script, used as console logging prefix

shortctus for controls:

*/
var config = {
	site:'undef',
	hotkeys: {
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
		netflixSkipIntro: ["s"],
	},
	playPauseOnClick:true,
	forceFocusPlayer:true,
	forceFocusPlayerInterval:1000,
	maxSpeed: 16, 
	minSpeed: 0,
	showDefaultPbr: true,
	debug:true,
	notifications:true,
	notiOptions:  {
		position: 'topLeft',
		timeout: 2500,
		timeBetween: 300 
	},
	version:0.30,
	name: 'HTML5 Player Controls'
};

// iziToast Notification Defaults (izitoast.marcelodolce.com/#Options)
var notifDefaults = {
	timeout: config.notiOptions.timeout , // default timeout
	animateInside: true,
	close: false,
	progressBar: false,
	position: config.notiOptions.position // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
};

var myPlayer, pbrPanel, lastNotif;
var notifQ = [];
const LOG_ERROR = 1; const LOG_WARN = 2; const LOG_SUCCESS = 3; const LOG_INFO = 4; const LOG_DEBUG = 5;


/* Wait for player and do other setup tasks*/
function setUp(){
	$("head").append ('<link href="//cdnjs.cloudflare.com/ajax/libs/izitoast/1.1.5/css/iziToast.min.css" rel="stylesheet" type="text/css">');
	iziToast.settings(notifDefaults);
	if(config.notiOptions.timeBetween > 0){workNotifQ();}

	var timeWaitedForPlayer = 0;
	var checkForPlayerDelay = 300;

	var waitForPlayer = setInterval(function() {
	    myPlayer = $("video:first-of-type");//leave as jquery obj for now
	    if (myPlayer.length > 0){ //check if player has already been added to DOM
	    	//TODO if multiple players, show user select which one
	        if (myPlayer[0].readyState === 4) { //check if its ready (in plain js)
	            clearInterval(waitForPlayer);
	            myPlayer = $("video:first-of-type")[0]; //make vanilla obj
	            log("Got Videoplayer", LOG_SUCCESS);
	            apply_fixes();
	            //log("Applied fixes", LOG_SUCCESS);
	        }
	    } else { //stop waiting for player after some time
	    	if(timeWaitedForPlayer > checkForPlayerDelay*15){
	            clearInterval(waitForPlayer);
			}
            timeWaitedForPlayer +=checkForPlayerDelay;
	    }
	}, checkForPlayerDelay);
}

function apply_fixes(){
	//Set current site if known
	var loc = window.location.hostname;
	if(loc.includes("twitch.tv")) {
		config.site="twitch";
	} else if (loc.includes("youtube")){
		config.site="youtube";
	} else if (loc.includes("netflix")){
		config.site="netflix";
	} 
	log("Site matched: " + config.site);

	//re-get player in case of dynamic pages (e.g. netflix) 
    //TODO observe this?
    setInterval(function(){
    	myPlayer = $("video:first-of-type")[0];
    	//log("regot player");
    	showPbr();
    }, 5000);

    //setInterval(function(){log("test", LOG_SUCCESS);}, 300);
	
	try{showPbr();} catch (e){log("show pbr", LOG_ERROR);}
	try{allPlayerClickPlayPause();} catch (e){log("clickpp", LOG_ERROR);}
	try{setVolume(1);} catch (e){log("setVolume", LOG_ERROR);}
	try{focusPlayer();} catch (e){log("focus player", LOG_ERROR);}
}

/*
Change the players playbackRate (pbr). pbr cant go below 0 (0=video paused but technically still playing), softcapped at config.maxSpeed 
@param {double} by - the playbackrate delta
*/
function changePbr(by){
	try{
		if(pbrPanel.length < 1) {
			log("cant find pbr panel", LOG_ERROR);
		}
		
	    var newPbr = myPlayer.playbackRate+by;
	    if(newPbr>16){
	        newPbr=16;
	    } else if (newPbr<0){
	        newPbr=0;
	    }
	    myPlayer.playbackRate=newPbr;
	    pbrPanel.html(formatPbr(myPlayer.playbackRate));
	    log("PlaybackRate changed, new rate: "+myPlayer.playbackRate);
    } catch (e) {
    	log('Error changing pbr: '+e.meesage);
    }
}

/*
Formats given number to have 2 dec digits. will return empty string if number is 1 and config.showDefaultPbr is true
@param {double} numbr - the number to be formated
*/
function formatPbr(numbr){
    if(numbr===1&&!config.showDefaultPbr){
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
	} else {
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
	if($('video').parent().find('#pbrPanel').length < 1){
		var txt = config.showDefaultPbr ? "1.00" : "";
		$('video').parent().append(
  			$('<div/>')
    		.attr("id", "pbrPanel")
    		.addClass("pbrPanel")
      		.text(txt)
		);
	}
	pbrPanel = $('#pbrPanel');
}

var clickCount = 0;
var singleClickTimer;
/*
Make the full player a play/pause button. Additionally check for doubleclicks to enter fullscreen.
*/
function allPlayerClickPlayPause(){
	//twitch
    var elems = [document.querySelectorAll('.player-overlay.player-fullscreen-overlay.js-control-fullscreen-overlay')[0], document.getElementById('js-paused-overlay')];
    //youtube already has this feature
    //couldnt find working panels on netflix

    elems.forEach(function(elem) {
        elem.addEventListener('click', function() {
            clickCount++;
            if (clickCount === 1) {
                singleClickTimer = setTimeout(function() {
                    log("single click");
                    clickCount = 0;
                    pp();
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(singleClickTimer);
                clickCount = 0;
                log("double click");
                fullscreen();
            }
        }, false);
    });
}

/*
Set the players volume to some value between 0 and 1
@param {double} to - new volume level
*/
function setVolume(to){
	try{
	    if(to<0 || to >1){
	        log("invalid volume level, must be between 0 and 1", LOG_ERROR);
	        return;
	    }
	    //update ui to relfect change
	    if(config.site==='twitch'){
		    $('.player-volume__slider-container>div').attr("aria-valuenow", "0");
		    $('.player-volume__slider-container>div>.ui-slider-range').css('width', to*100+'%');
		    $('.player-volume__slider-container>div>.ui-slider-handle').css('left', to*100+'%');
	    } else if(config.site==='youtube'){
	    	//as long as focused, ytp handles this with up/down

	    	//$('.ytp-volume-panel').attr("aria-valuenow", round(to*100));
	    	//$('.ytp-volume-panel').attr("aria-valuetext", round(to*100)+"% volume");
	    	//$('.ytp-volume-slider-handle').css("left", to*0.4);

	    	//$('.ytp-mute-button')
	    	return;
	    }

	    myPlayer.volume = to;
	    log("new volume: " + myPlayer.volume);
    } catch (ex) {
    	log(ex.message, LOG_ERROR);
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
	    log("gave player focus");
	    return;
    }
}

function fullscreen(){
	if(config.site === "twitch"){
	    $('.qa-fullscreen-button').click();
	    focusPlayer();
        log("going/exiting fullscreen");
        return;
	}
    //netflix and youtube seem to have global hotkeys for this
}

/*
Print console messages and shof notifications, if corresponding configs are set.
Console messages will be prefixed with config.name
@param {String} msg - the message to be printed
@param {String} lvl - the log level
*/
function log(msg, lvl=LOG_INFO){
	if(config.debug){
		var cmsg=config.name+": "+msg;
		switch(lvl){
			case LOG_ERROR: console.error(cmsg); break;
			case LOG_INFO:
			case LOG_SUCCESS: console.log(cmsg); break;
			case LOG_WARN: console.warn(cmsg); break;
			default: console.error(config.name+" [INVALID LOG LVL ("+lvl+")]:"+msg);
		}
	}
	if(config.notifications){    		
		//decideNotif(msg, lvl);
		if(config.notiOptions.timeBetween > 0){
			notifQ.push([msg, lvl]);
		} else {
			showNotif(msg, lvl);
		}
	}
}

/* 
Delay between notifications. can and will destroy order of notifications.
*/
function decideNotif(msg, lvl){
	var now = new Date().getTime();
	if(typeof lastNotif != 'undefined' && now-config.notiOptions.timeBetween < lastNotif){
		console.log("delaying notif");
		setTimeout(function(){decideNotif(msg,lvl);}, now-lastNotif);
		return;
	}
	lastNotif = new Date().getTime();
	showNotif(msg,lvl);
}

//TODO stop worker or make timeout longer when no notifications for some time
/*
Work away the notification queue with given delay between.
*/
function workNotifQ(){
	log("working notif q");
	setInterval(function(){
		if(notifQ.length > 0){
			var n = notifQ.shift();
			if(typeof n != 'undefined'){
				showNotif(n[0], n[1]);
			}
		}
	}, config.notiOptions.timeBetween);
}

/*
Show a Notification
@param {String} msg - the notifications message
@param {String} lvl - the type of notification
*/
function showNotif(msg, lvl){
	//onOpening makes sure notifications dissapear if the site is not focused, izitoast doesnt hide toasts in this case appearently (seems to only happen with progress bar enabled)
		//  , onOpening: function(instance, toast){setTimeout(function(){$(toast).slideUp();}, config.notiOptions.timeout);}
		//dont notify for log and info
		var tst = {title: msg};
		switch(lvl){
			case LOG_INFO: break; //iziToast.info(tst); break;
			case LOG_ERROR: iziToast.error(tst); break;
			case LOG_SUCCESS: iziToast.success(tst); break;
			case LOG_WARN: iziToast.warning(tst); break;
			default: iziToast.info(tst); break;
		}
}

(function() {
	setUp();

    Mousetrap.bind(config.hotkeys.netflixSkipIntro, function() {
        $(".skip-credits>a>span").click();
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
    Mousetrap.bind(config.hotkeys.playbackRateUp, function(){changePbr(0.25); return false;});

    /* Playbackrate Down */
    Mousetrap.bind(config.hotkeys.playbackRateDown, function(){changePbr(-0.25); return false;});

    /* Playbackrate Up slow, shift + */
    Mousetrap.bind(config.hotkeys.playbackRateSlowUp, function(){changePbr(0.1); return false;});

    /* Playbackrate Up slow, shift - */
    Mousetrap.bind(config.hotkeys.playbackRateSlowDown, function(){changePbr(-0.1); return false;});


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
})();

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
        //color: rgba(134, 132, 132, 0.77)!important;
        color: #80ff02;
        //"color: rgba(255,0, 0, 1)!important;
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
    str     = str.replace (/^[^\/]+\/\*!?/, '') // Strip function () { /*!
    .replace (/\s*\*\/\s*\}\s*$/, '')   // Strip */ }
    .replace (/\/\/.+$/gm, ''); // Double-slash comments wreck CSS. Strip them.
    return str;
}
