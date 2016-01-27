'use strict';

var $ = require('jquery');
var mo = require('mo');
var $box = $('.js-box');
var $scene1 = $('.scene1');
var $scene2 = $('.scene2');
var userArr = [];
var bouncyEasing = mo.easing.path('M0,100 C6.50461245,96.8525391 12.6278439,88.3497543 16.6678547,0 C16.6678547,-1.79459817 31.6478577,115.871587 44.1008572,0 C44.1008572,-0.762447191 54.8688736,57.613472 63.0182497,0 C63.0182497,-0.96434046 70.1500549,29.0348701 76.4643231,0 C76.4643231,0 81.9085007,16.5050125 85.8902733,0 C85.8902733,-0.762447191 89.4362183,8.93311024 92.132216,0 C92.132216,-0.156767385 95.0157166,4.59766248 96.918051,0 C96.918051,-0.156767385 98.7040751,1.93815588 100,0');
var translateCurve = mo.easing.path('M0,100 L25,99.9999983 C34.6815219,20.073713 40.852195,-3.12132897e-09 100,0');
var squashCurve = mo.easing.path('M0,100.004963 C0,100.004963 25,147.596355 25,100.004961 C25,70.7741867 32.2461944,85.3230873 58.484375,94.8579105 C68.9280825,98.6531013 83.2611815,99.9999999 100,100');
var localData = JSON.parse(localStorage.getItem('hitted'));
var hittedUser = localData || {
	'a': [],
	'b': [],
	'c': [],
	'd': [],
	'x': []
};
//当正在打乱的时候，不允许任何点击
var clickable = true;

function getRotate(level, progress){
	var progress = progress === undefined ? 1 : progress;
	var translateProgress = translateCurve(progress);
	var rotateConf = {
		a: {
			forward: 'rotateX('+(-translateProgress*90)+'deg)',
			backward: 'rotateX('+(translateProgress-1)*90+'deg)',
			$parent: $box.find('.top>ul'),
			total: 1,
			row: 1
		},
		b: {
			forward: 'rotateX('+translateProgress*90+'deg)',
			backward: 'rotateX('+(1-translateProgress)*90+'deg)',
			$parent: $box.find('.bottom>ul'),
			total: 2,
			row: 2
		},
		c: {
			forward: 'rotateY('+(-translateProgress*90)+'deg)',
			backward: 'rotateY('+(translateProgress-1)*90+'deg)',
			$parent: $box.find('.right>ul'),
			total: 5,
			row: 3
		},
		d: {
			forward: 'rotateY('+translateProgress*90+'deg)',
			backward: 'rotateY('+(1-translateProgress)*90+'deg)',
			$parent: $box.find('.left>ul'),
			total: 10,
			row: 4
		},
		//特等奖
		x: {
			forward: 'rotateY('+translateProgress*180+'deg)',
			backward: 'rotateY('+(1-translateProgress)*180+'deg)',
			$parent: $box.find('.back>ul'),
			total: 1,
			row: 1
		}
	};
	return rotateConf[level];
};

//盒子初始化
var $lis = null;
var windowWidth = $('body').width();
var windowHeight = $('body').height();
// height is box height
var height = Math.min(windowHeight-20, 800);
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

//本地存储数据初始化
//用户过滤额中奖者的对象
var filterUserArr = {};
(function(){
	if(localData){
		for(var i in localData){
			var $par = getRotate(i).$parent;
			var len = localData[i].length;
			var row = getRotate(i).row;
			var maxWid = (height - 1)/row - 1;
			$.each(localData[i], function(key, val){
				var $li = $('<li data-name="'+val['name']+'"><span style="background-image: url('+val['src']+')"></span><div class="username">'+val['name']+'</div></li>');
				$li.css({
					width: maxWid+'px',
					height: maxWid+'px',
					left: 1+key%row*maxWid+'px',
					top: 1+Math.floor(key/row)*maxWid+'px'
				});
				$li.find('.username').css({
					width: '20px',
					fontSize: '20px',
					opacity: 1
				});
				$par.append($li);
				filterUserArr[val['name']] = 1;
			});
		}
	}
})();

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
	return users;
})
.then(function(users){
	var len = users.length;
	var tpl = '';
	var filter = [];
	users.forEach(function(v, k){
		//过滤中奖者
		if(!(v['name'] in filterUserArr)){
			filter.push(v);
			tpl += '<li data-name="'+v['name']+'"><span style="background-image: url('+v['thumb']+')"></span></li>'
		}
	});
	userArr = filter;
	$box.find('.front>ul').append(tpl);
	$lis = $box.find('.front>ul>li');
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
})
.then(function(){
	var $start = $('.start');
	var $stop = $('.stop');
	var $upset = $('.upset');
	var timer = null;
	var level = null;
	var interval = null;
	$start.click(function(){
		if(!clickable){
			return false;
		}
		if(interval && Date.now() - interval < 8*1000){
			return;
		}
		var len = $lis.length;
		if(timer){
			return;
		}
		timer = setInterval(function(){
			var rand = Math.floor(len*Math.random());
			var offsetX = $lis.eq(rand).offset().left + cellWidth/2;
			var offsetY = $lis.eq(rand).offset().top + cellWidth/2;
			scale(rand);
			burst({
				x: offsetX,
				y: offsetY,
				count: 10
			});
		}, 100);
		level = $(this).attr('data-level');
	});
	$stop.click(function(){
		if(!clickable){
			return false;
		}
		interval = Date.now();
		var len = $lis.length;
		if(!timer){
			return;
		}
		var rand = Math.floor(len*Math.random());
		while(!userArr[rand]['b'] && /a|b|x/.test(level)){
			rand = Math.floor(len*Math.random());
		}
		//console.log(rand, userArr[rand]['b']);
		var offsetX = $lis.eq(rand).offset().left + cellWidth/2;
		var offsetY = $lis.eq(rand).offset().top + cellWidth/2;
		scale(rand);
		hit(rand, level);
		clearInterval(timer);
		timer = null;
		burst({
			x: offsetX,
			y: offsetY,
			count: 10
		});
	});
	$upset.click(function(){
		if(!clickable){
			return false;
		}
		upset();
	});
});




function scale(index){
	$lis.eq(index).css({
		zIndex: 1
	}).find('span').css({
		transition: 'all 0.1s linear',
		width: cellWidth*3+'px',
		height: cellWidth*3+'px',
		left: -cellWidth+'px',
		top: -cellWidth+'px'
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
//抽中后，把这个人按照中奖等级放到相应的分组，然后从userArr和$lis中移除
function hit(index, level){
	var $li = $lis.eq(index);
	var rotateData = getRotate(level);
	var offset = {
		x: parseInt($li.css('left')),
		y: parseInt($li.css('top'))
	};
	$li.append('<div class="username">'+userArr[index]['name']+'</div>');
	$li.find('span').css({
		'background-image': 'url('+userArr[index].src+')'
	});

	hittedUser[level].push(userArr[index]);
	//中奖名单本地存储, a/b/c/d
	localStorage.setItem('hitted', JSON.stringify(hittedUser));

	new Promise(function(resolve, reject){
		//放大
		new mo.Tween({
			repeat: 0,
			delay: 500,
			duration: 1000,
			onStart: function(){
				$li.find('span').css({
					width: '100%',
					height: '100%',
					left: 0,
					top: 0
				});
			},
			onUpdate: function(progress){
				var bounceProgress = bouncyEasing(progress);
				$li.css({
					left: offset.x*(1-bounceProgress)+'px',
					top: offset.y*(1-bounceProgress)+'px',
					width: height*bounceProgress+'px',
					height: height*bounceProgress+'px'
				});
			},
			onComplete: function(){
				//显示姓名
				$li.find('.username').animate({'opacity': 1}, 300);
				//放花
				burst({
					x: windowWidth/2,
					y: windowHeight/2,
					count: 50,
					repeat: 0,
					radius: {
						0: height
					},
					duration: 1000
				});
				resolve();
			}
		}).run();

	}).then(function(){
		var curPos = {
			x: (windowWidth-height)/2,
			y: (windowHeight-height)/2
		};
		//移到一旁
		new mo.Tween({
			repeat: 0,
			delay: 2000,
			duration: 1000,
			onStart: function(){
				//console.log($lis.length);
				//暂存区
				$scene2.find('>ul').append($li);
				//更新lis和userArr，使得他们不会再中奖
				$lis = $box.find('.front>ul>li');
				userArr.splice(index, 1);
				//console.log($lis.length, userArr.length);
				$li.css({
					width: height+'px',
					height: height+'px',
					left: curPos.x+'px',
					top: curPos.y+'px'
				});
				$li.find('.username').css({
					width: '20px',
					fontSize: '20px'
				});
			},
			onUpdate: function(progress){
				var translateProgress = translateCurve(progress);
				var squashProgress = squashCurve(progress);
				var scaleX = 1 - 2*squashProgress;
				var scaleY = 1 + 2*squashProgress;
				//保证图片挪到旁边后不会比整个盒子还大
				var maxWid = Math.min((windowWidth-height-100)/2, height/2);
				var targetWidth = maxWid+(height-maxWid)*(1-translateProgress);
				var targetX = curPos.x*(1-translateProgress);
				//上下居中
				var targetY = curPos.y+((windowHeight-targetWidth)/2-curPos.y)*translateProgress;

				$li.css({
					width: targetWidth + 'px',
					height: targetWidth + 'px',
					left: targetX + 'px',
					top: targetY + 'px',
					transform: 'scaleX('+scaleX+') '+
								'scaleY('+scaleY+') '
				});
			}
		}).run();

		return new Promise(function(resolve, reject){
			//按照中奖等级旋转盒子
			new mo.Tween({
				repeat: 0,
				delay: 2500,
				duration: 1000,
				onUpdate: function(progress){
					var translateProgress = getRotate(level, progress);
					$box.css({
						transform: 'translate3D(-50%, -50%, '+(-height/2)+'px) '+translateProgress['forward']
					});
				},
				onComplete: function(){
					//将中奖的人贴到相应的面，同时需要调整left/top，因为定位的参照物发生了改变
					var $parent = rotateData['$parent'];
					var curHeight = parseInt($li.css('width'));
					var targetX = (windowWidth-height)/2;
					var targetY = (windowHeight-curHeight)/2;
					$li.css({
						left: (-targetX)+'px',
						top: targetY+'px'
					});
					$parent.append($li);
					resolve({
						curX: -targetX,
						curY: targetY
					});
				}
			}).run();
		});

	}).then(function(pos){
		//将中奖的人挪到盒子相应的位置
		var row = rotateData['row'];
		var maxWid = (height - 1)/row;
		var trueWid = maxWid - 1;
		var curSize = parseInt($li.css('width'));
		//此面上已经有几个
		var len = rotateData['$parent'].find('>li').length - 1;
		return new Promise(function(resolve, reject){
			new mo.Tween({
				repeat: 0,
				delay: 0,
				duration: 1000,
				onUpdate: function(progress){
					var translateProgress = translateCurve(progress);
					var squashProgress = squashCurve(progress);
					var scaleX = 1 - 2*squashProgress;
					var scaleY = 1 + 2*squashProgress;
					var targetW = curSize >= trueWid ? trueWid+(curSize-trueWid)*(1-translateProgress) : curSize+(trueWid-curSize)*translateProgress;
					//debugger;
					var targetX = (len%row)*maxWid;
					var targetY = Math.floor(len/row)*maxWid;
					var movX = pos.curX + (1+targetX-pos.curX)*translateProgress;
					var movY = pos.curY + (1+targetY-pos.curY)*translateProgress;
					$li.css({
						width: targetW+'px',
						height: targetW+'px',
						left: movX+'px',
						top: movY+'px',
						transform: 'scaleX('+scaleX+') '+
									'scaleY('+scaleY+') '
					});
				},
				onComplete: function(){
					resolve();
				}
			}).run();
		});
	}).then(function(){
		//将盒子转回来
		new mo.Tween({
			repeat: 0,
			delay: 100,
			duration: 1000,
			onUpdate: function(progress){
				var translateProgress = getRotate(level, progress);
				$box.css({
					transform: 'translate3D(-50%, -50%, '+(-height/2)+'px) '+translateProgress['backward']
				});
			},
			onComplete: function(){
				console.timeEnd('looptime');
				if(level === 'a'){
					$('.js-ji').animate({
						bottom: '260px',
						opacity: 1
					}, 1000);
				}
			}
		}).run();
	})
};

//打乱
function upset(){
	if(!confirm('确定打乱吗？')){
		return false;
	}
	clickable = false;
	new mo.Tween({
		repeat: 0,
		delay: 0,
		duration: 500,
		onStart: function(){
			$box.css({
				'transform': 'translate3D(-50%, -50%, -300.5px)'
			});
		},
		onUpdate: function(progress){
			var bounceProgress = mojs.easing.bounce.out(progress);
			$box.css({
				'transform': 'translate3D(-50%, -50%, '+ -bounceProgress*1000.5 +'px)'
			});
		}
	}).run();
	//更新数据
	$lis = $box.find('.front>ul>li');
	//打乱数组
	userArr.sort(function(){
		return Math.random() > 0.5 ? 1 : -1;
	});

	var randPos = createPos($lis);
	var moveToIndex;
	$lis.each(function(key, li){
		var $li = $(li);
		var curPos = {
			x: parseFloat($li.css('left')),
			y: parseFloat($li.css('top'))
		};
		var offset = $li.offset();
		//相对位置
		var oppose = {
			x: curPos.x - offset.left,
			y: curPos.y - offset.top
		};

		new mo.Tween({
			repeat: 0,
			delay: 500+5*key,
			duration: 500,
			onStart: function(){
				$li.css({
					transform: 'translate3D(0, 0, 0)'
				});
			},
			onUpdate: function(progress){
				var bounceProgress = mojs.easing.bounce.out(progress);
				$li.css({
					transform: 'translate3D(0, 0, '+ bounceProgress*60 +'px)',
					opacity: 0.8,
					left: curPos.x+(oppose.x+randPos[key].x-curPos.x)*bounceProgress+'px',
					top: curPos.y+(oppose.y+randPos[key].y-curPos.y)*bounceProgress+'px'
				});
			}
		}).run();
		//计算每个人应该回到的位置
		userArr.forEach(function(user, index){
			if($li.attr('data-name') === user['name']){
				moveToIndex = index;
				return false;
			}
		});
		var backPos = {
			x: moveToIndex%20*base+1,
			y: Math.floor(moveToIndex/20)*base+1
		};
		//复位
		new mo.Tween({
			repeat: 0,
			delay: 3000+5*key,
			duration: 500,
			onUpdate: function(progress){
				var bounceProgress = mojs.easing.bounce.out(progress);
				$li.css({
					transform: 'translate3D(0, 0, '+ (1-bounceProgress)*60 +'px)',
					opacity: 1,
					left: (oppose.x+randPos[key].x)+(backPos.x-oppose.x-randPos[key].x)*bounceProgress+'px',
					top: (oppose.y+randPos[key].y)+(backPos.y-oppose.y-randPos[key].y)*bounceProgress+'px'
				});
			}
		}).run();
	});
	//恢复盒子
	new mo.Tween({
		repeat: 0,
		delay: 5500,
		duration: 500,
		onStart: function(){
			$box.css({
				'transform': 'translate3D(-50%, -50%, -1000.5px)'
			});
		},
		onUpdate: function(progress){
			var bounceProgress = mojs.easing.bounce.out(progress);
			$box.css({
				'transform': 'translate3D(-50%, -50%, '+ (-1000.5+(1000.5-300.5)*bounceProgress) +'px)'
			});
		},
		onComplete: function(){
			clickable = true;
		}
	}).run();

};
//创建随机位置
function createPos($lis){
	var len = $lis.length;
	var row = Math.ceil(Math.sqrt(len));
	var cellW = windowWidth/row;
	var cellH = windowHeight/row;
	//一般都是宽大于高
	//允许的误差
	var miasH = 10;
	var miasW = cellW - (cellH+miasH);
	var arr = [];
	for(var i=0;i<len;i++){
		var randW = Math.random()*miasW;
		var randH = Math.random()*miasH;
		arr.push({
			x: i%row*cellW + randW,
			y: Math.floor(i/row)*cellH + randH
		});
	}
	return arr;
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
//绕x轴旋转后，如果还想让box看起来像是绕y轴旋转，则旋转规则要根据x轴旋转角度来定（坐标轴也旋转了）
// function getRotateConf(x, y, anglex, angley){
// 	//绕x旋转
// 	var yzConf = {
// 		'0': 'rotateX('+anglex+') rotateY('+ angley +'deg)',
// 		'90': 'rotateX('+anglex+') rotateZ(' + -angley + 'deg)',
// 		'180': 'rotateX('+anglex+') rotateY(' + -angley + 'deg)',
// 		'270': 'rotateX('+anglex+') rotateZ(' + angley + 'deg)'
// 	};
// 	//绕y旋转
// 	var xzConf = {
// 		'0': 'rotateY('+anglex+') rotateX('+ angley +'deg)',
// 		'90': 'rotateY('+anglex+') rotateZ('+ -angley +'deg)',
// 		'180': 'rotateY('+anglex+') rotateX('+ -angley +'deg)',
// 		'270': 'rotateY('+anglex+') rotateZ('+ angley +'deg)'
// 	};
// 	if(x){
// 		return yzConf[x];
// 	}
// 	if(y){
// 		return xzConf[y];
// 	}
// };

var moveStart = {};
var moving = {};
var movTrangle = {};
var curRotated = {
	x: 0,
	y: 0
};
var dragTimer = null;
var drag = false;
var clicked = false;
//旋转盒子
$('body').on('mousedown', function(e){
	if(!clickable){
		return false;
	}
	clicked = true;
	moveStart = {
		x: e.pageX,
		y: e.pageY
	};
}).on('mousemove', function(e){
	if(!clicked){
		return false;
	}
	drag = true;
	moving = {
		x: e.pageX - moveStart.x,
		y: e.pageY - moveStart.y
	};
	movTrangle = {
		x: -(moving.y/height)*90,
		y: moving.x/height*90
	};
	$box.css('transform', 'translate3D(-50%, -50%, '+(-height/2)+'px) rotateX('+movTrangle.x+'deg) rotateY('+movTrangle.y+'deg)');
	e.preventDefault();
	return false;
}).on('mouseup', function(e){
	clicked = false;
	if(!drag){
		return false;
	}
	drag = false;
	//阈值
	var bonus = 1500000;
	//未达阈值
	if(Math.max(Math.abs(moving.x), Math.abs(moving.y)) < bonus){
		new mo.Tween({
			repeat: 0,
			delay: 0,
			duration: 500,
			onUpdate: function(progress){
				var bounceProgress = mojs.easing.bounce.out(progress);
				$box.css({
					transform: 'translate3D(-50%, -50%, '+(-height/2)+'px) rotateX('+movTrangle.x*(1-bounceProgress)+'deg) rotateY('+movTrangle.y*(1-bounceProgress)+'deg)'
				});
			}
		}).run();
	}
	//超过阈值
	// else{
	// 	//绕y轴旋转
	// 	if(Math.abs(moving.x) < Math.abs(moving.y)){
	// 		var target = movTrangle.x > 0 ? movTrangle.x + 90 : movTrangle.x - 90;
	// 		curRotated.x = target;
	// 		new mo.Tween({
	// 			repeat: 0,
	// 			delay: 0,
	// 			duration: 500,
	// 			onUpdate: function(progress){
	// 				var bounceProgress = bouncyEasing(progress);
	// 				$box.css({
	// 					transform: 'translate3D(-50%, -50%, '+(-height/2)+'px) rotateX('+(movTrangle.x+(target-movTrangle.x)*bounceProgress)+'deg) rotateY('+movTrangle.y*(1-bounceProgress)+'deg)'
	// 				});
	// 			}
	// 		}).run();
	// 	}
	// 	//绕x轴旋转
	// 	else{
	// 		var target = movTrangle.y > 0 ? movTrangle.y + 90 : movTrangle.y  - 90;
	// 		curRotated.y = target;
	// 		new mo.Tween({
	// 			repeat: 0,
	// 			delay: 0,
	// 			duration: 500,
	// 			onUpdate: function(progress){
	// 				var bounceProgress = bouncyEasing(progress);
	// 				$box.css({
	// 					transform: 'translate3D(-50%, -50%, '+(-height/2)+'px) rotateX('+movTrangle.x*(1-bounceProgress)+'deg) rotateY('+(movTrangle.y+(target-movTrangle.y)*bounceProgress)+'deg)'
	// 				});
	// 			}
	// 		}).run();
	// 	}
	// }
});

$('.clear').click(function(){
	if(confirm('将会清除历史记录，确定操作？')){
		localStorage.clear();
		location.reload();
	}
});

$(document).on('mouseleave', function(){
	$('body').trigger('mouseup');
});

