'use strict';

var $ = require('jquery');
var $box = $('.box');
var tpl = '';
for(var i=0;i<300;i++){
	tpl += '<li><span></span></li>'
}
$box.append(tpl);
var $spans = $box.find('span');
//先打散，to do

setTimeout(function(){
	$spans.each(function(key, span){
		var $span = $(span);
		$span.css({
			left: '1px',
			top: '1px'
		});
	});
});