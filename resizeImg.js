var fs = require('fs');
var gm = require('gm');

var ii = 0;

new Promise(function(resolve, reject){
	fs.readdir('./moreImg', function(err, list){
		if(err){
			return;
		}
		resolve(list);
	});
})
.then(function(list){
	list.forEach(function(v){
		if(/\.jpg/i.test(v)){
			gm('./moreImg/' + v)
			.resize(50, 50)
			.write('./thumb/' + v, function(err){
				if(!err){
					ii++;
					console.log('done! total:' + ii);
				}
			})
		}
	});
});