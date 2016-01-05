'use strict';

var $ = require('jquery');
var scrollPage = require('scrollPageCube');
scrollPage({
	par: $('.js-container').find('.scroll-page-cube-perspective')
});

var $box = $('.js-box');


// var $box = $('.box');
// var tpl = '';
// for(var i=0;i<300;i++){
// 	tpl += '<li><span></span></li>'
// }
// $box.append(tpl);
// var $spans = $box.find('span');
//先打散，to do