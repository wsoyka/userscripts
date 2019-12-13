// ==UserScript==
// @name        Amazon Price Variation (Fork) - 2018
// @namespace   dsr-price-variation-camel
// @description Embeds CamelCamelCamel price chart in Amazon
// @include     http://www.amazon.*/*
// @include     https://www.amazon.*/*
// @include     http://smile.amazon.*/*
// @include     https://smile.amazon.*/*
// @version     20180312
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// ==/UserScript==

var width = 500;
var height = 200;
var duration = "1y";

//Possible other values are "amazon", "new", "used", "new-used", & "amazon-new-used" 
var chart = "amazon-new";

$(document).ready(function () {
	var element = $(':input[name="ASIN"]');
	var arr = document.domain.split(".");
	var country = arr[arr.length - 1];
	if (country == "com") { 
		country = "us"; 
	}

	if (element) {
		var prot = window.location.protocol;
		var asin = $.trim(element.attr("value"));
		var link = "<a target='blank' href='" + prot + "//" + country + ".camelcamelcamel.com/product/" + asin + "'>"  +
						"<img src='" + prot + "//charts.camelcamelcamel.com/" + country + "/" + asin + "/" + chart + ".png?force=1&zero=0&w=" + width + "&h=" + height + "&desired=false&legend=1&ilt=1&tp=" + duration + "&fo=0'/>" +
					"</a>";

		$("#availability").append("<div id='camelcamelcamel' style='margin-top: 0px; margin-left: 0px'>" + link + "</div>");
	}
});
