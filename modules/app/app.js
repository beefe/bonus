'use strict';

var $ = require('jquery');
var mo = require('mo');
var $box = $('.js-box');
var userArr = [];
var hitArr = [];
var $lis = null;
var bouncyEasing = mo.easing.path('M0,100 C6.50461245,96.8525391 12.6278439,88.3497543 16.6678547,0 C16.6678547,-1.79459817 31.6478577,115.871587 44.1008572,0 C44.1008572,-0.762447191 54.8688736,57.613472 63.0182497,0 C63.0182497,-0.96434046 70.1500549,29.0348701 76.4643231,0 C76.4643231,0 81.9085007,16.5050125 85.8902733,0 C85.8902733,-0.762447191 89.4362183,8.93311024 92.132216,0 C92.132216,-0.156767385 95.0157166,4.59766248 96.918051,0 C96.918051,-0.156767385 98.7040751,1.93815588 100,0');

var height = Math.min($('body').height()-20, 800);
if(!(height%20)){
	height = height + 1 + 20 - (height%20);
}
var base = (height-1)/20;
var cellWidth = base-1;

$box.css({
	width: height+'px',
	height: height+'px',
	transform: 'translate3D(-50%, -50%, '+(-height/2)+'px)'
});
$('.cube-left').css({
	width: height+'px',
	height: height+'px',
	transform: 'rotateY(-90deg) translateZ('+height/2+'px)'
});
$('.cube-right').css({
	width: height+'px',
	height: height+'px',
	transform: 'rotateY(90deg) translateZ('+height/2+'px)'
});
$('.front').css({
	transform: 'translateZ('+height/2+'px)'
});
$('.back').css({
	transform: 'translateZ(-'+height/2+'px) rotateY(180deg)'
});
$('.top').css({
	transform: 'rotateX(90deg) translateZ('+height/2+'px)'
});
$('.bottom').css({
	transform: 'rotateX(-90deg) translateZ('+height/2+'px)'
});


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
		userArr = users;
		resolve(users);
	});
})
.then(function(users){
	var len = users.length;
	var tpl = '<ul>';
	users.forEach(function(v){
		tpl += '<li><span style="background-image: url('+v['thumb']+')"></span></li>'
	});
	tpl += '</ul>'
	$box.find('.front').append(tpl);
	$lis = $box.find('li');
	$lis.each(function(k, v){
		var y = Math.floor(k/20)*base;
		var x = (k%20)*base;
		$(v).css({
			width: cellWidth+'px',
			height: cellWidth+'px',
			left: (x+1)+'px',
			top: (y+1)+'px'
		});
	});

	var $start = $('.start');
	var $stop = $('.stop');
	var $upset = $('.upset');
	var timer = null;
	var level = null;
	$start.click(function(){
		if(timer){
			return;
		}
		timer = setInterval(function(){
			var rand = Math.floor(len*Math.random());
			var offsetX = $lis.eq(rand).offset().left + cellWidth/2;
			var offsetY = $lis.eq(rand).offset().top + cellWidth/2;
			scale($lis, rand);
			burst({
				x: offsetX,
				y: offsetY,
				count: 10
			});
		}, 100);
		level = $(this).attr('data-level');
	});
	$stop.click(function(){
		if(!timer){
			return;
		}
		var rand = Math.floor(len*Math.random());
		while(hitArr.some(function(x){
			return x === rand;
		})){
			rand = Math.floor(len*Math.random());
		};

		var offsetX = $lis.eq(rand).offset().left + cellWidth/2;
		var offsetY = $lis.eq(rand).offset().top + cellWidth/2;
		scale($lis, rand);
		hit($lis, rand, level);
		clearInterval(timer);
		timer = null;
		burst({
			x: offsetX,
			y: offsetY,
			count: 10
		});
	});
	$upset.click(function(){
		upset($lis);
	});
});

function scale($lis, index){
	$lis.eq(index).css({
		zIndex: 1
	}).find('span').css({
		transition: 'all 0.1s linear',
		width: cellWidth*2+'px',
		height: cellWidth*2+'px',
		left: -cellWidth/2+'px',
		top: -cellWidth/2+'px'
	}).parent().siblings().css({
		zIndex: 0
	}).find('span').css({
		zIndex: 0,
		width: cellWidth+'px',
		height: cellWidth+'px',
		left: 0,
		top: 0
	});
};

function hit($lis, index, level){
	var $li = $lis.eq(index);
	var offset = {
		x: parseInt($li.css('left')),
		y: parseInt($li.css('top'))
	};
	$li.find('span').css({
		'background-image': 'url('+userArr[index].src+')'
	});
	new Promise(function(resolve, reject){
		//放大
		new mo.Tween({
			repeat: 0,
			delay: 100,
			duration: 1000,
			onUpdate: function(progress){
				var bounceProgress = bouncyEasing(progress);
				$li.css({
					left: offset.x*(1-bounceProgress)+'px',
					top: offset.y*(1-bounceProgress)+'px'
				}).find('span').css({
					left: 0,
					top: 0,
					width: height*bounceProgress+'px',
					height: height*bounceProgress+'px'
				});
			},
			onComplete: function(){
				resolve();
			}
		}).run();

	}).then(function(){
		
		new mo.Tween({
			repeat: 0,
			delay: 2000,
			duration: 1000,
			onUpdate: function(progress){
				$li.css({
					transform: 'rotateX(1000deg)'
				});
			}
		}).run();

	});
};

function burst(options){
	var _default = {
		x: 0,
		y: 0,
		count: 5,
		radius: {
			0: 80
		},
		duration: 600,
		shape: 'circle',
		fill: ['deeppink', 'cyan', 'orange']
	};
	var opt = $.extend({}, _default, options);

	new mo.Burst(opt);
};

function upset($lis){
	var $scene1 = $('.scene1');
	var $scene2 = $('.scene2');
	new mo.Tween({
		repeat: 0,
		delay: 1000,
		duration: 1000,
		onStart: function(){
			$box.css({
				'transform': 'translate3D(-50%, -50%, -300.5px)'
			});
		},
		onUpdate: function(progress){
			var bounceProgress = bouncyEasing(progress);
			$box.css({
				'transform': 'translate3D(-50%, -50%, '+ -bounceProgress*1000.5 +'px)'
			});
		}
	}).run();
};

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



