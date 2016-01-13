'use strict';

var $ = require('jquery');
var mo = require('mo');
var $box = $('.js-box');
var bouncyEasing = mo.easing.path('M0,100 C6.50461245,96.8525391 12.6278439,88.3497543 16.6678547,0 C16.6678547,-1.79459817 31.6478577,115.871587 44.1008572,0 C44.1008572,-0.762447191 54.8688736,57.613472 63.0182497,0 C63.0182497,-0.96434046 70.1500549,29.0348701 76.4643231,0 C76.4643231,0 81.9085007,16.5050125 85.8902733,0 C85.8902733,-0.762447191 89.4362183,8.93311024 92.132216,0 C92.132216,-0.156767385 95.0157166,4.59766248 96.918051,0 C96.918051,-0.156767385 98.7040751,1.93815588 100,0');

var promise = new Promise(function(resolve, reject){
	$.getJSON('./staff.json', function(json){
		resolve(json);
	});
});
promise.then(function(json){
	var users = json.map(function(v){
		var tag = v['a'];
		var arr = tag.split('/');
		((arr[0] < 8 && arr[2] < Math.pow(4, 2)) || (arr[0] >= 8 && arr[2] < Math.pow(4, 2)-1)) && (v['b'] = Math.random());
		return {
			name: v['姓名'],
			thumb: './portrait/thumb/' + v['姓名'] + '.jpg',
			src: './portrait/' + v['姓名'] + '.jpg',
			ord: v['序号'],
			a: v['a'],
			b: v['b']
		};
	});
	return new Promise(function(resolve, reject){
		resolve(users);
	});
})
.then(function(users){
	(users.length) > 400 && (users.length = 400);

	var len = users.length;
	var tpl = '<ul>';
	users.length = 400;
	users.forEach(function(v){
		tpl += '<li><span style=""></span></li>' //background-image: url('+v['thumb']+')
	});
	tpl += '</ul>'
	$box.find('.front').append(tpl);


	var $lis = $box.find('li');
	var $start = $('.start');
	var $stop = $('.stop');
	var timer = null;
	$start.click(function(){
		timer = setInterval(function(){
			var rand = Math.floor(len*Math.random());
			$lis.eq(rand).css({
				'zIndex': 1
			}).find('span').css({
				width: '100px',
				height: '100px',
				left: '-35px',
				top: '-35px'
			}).parent().siblings().css({
				'zIndex': 0
			}).find('span').css({
				width: '29px',
				height: '29px',
				left: '1px',
				top: '1px'
			});
		}, 100);
	});
	$stop.click(function(){
		var rand = Math.floor(len*Math.random());
		console.log(timer);
		if(!timer){
			return false;
		}
		clearInterval(timer);
	});
});







// new mo.Tween({

// 	repeat: 0,
// 	delay: 2000,
// 	duration: 1500,
// 	onStart: function(){
// 		$box.css({
// 			'transform': 'translate3D(-50%, -50%, -3000.5px)'
// 		});
// 	},
// 	onUpdate: function(progress){
// 		var bounceProgress = bouncyEasing(progress);
// 		$box.css({
// 			'transform': 'translate3D(-50%, -50%, '+(-300.5-(1-bounceProgress)*3000.5)+'px)'
// 		});
// 	},
// 	onComplete: function(){
// 		new mo.Tween({
// 			repeat: 0,
// 			delay: 1000,
// 			duration: 1500,
// 			onUpdate: function(progress){
// 				var bounceProgress = bouncyEasing(progress);
// 				$box.css({
// 					'transform': 'translate3D(-50%, -50%, -300.5px) rotateY('+(90*bounceProgress)+'deg) scaleZ('+bounceProgress+')'
// 				});
// 			}
// 		}).run();
// 	}

// }).run();

new mo.Burst({
	shape: 'circle',
	fill: ['deeppink', 'cyan', 'orange'],
	x: '10%',
	y: '10%'
})

new mo.Burst({
	shape: 'circle',
	fill: ['deeppink', 'cyan', 'orange'],
	x: '20%',
	y: '30%'
})

//

