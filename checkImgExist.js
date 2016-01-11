var fs = require('fs');
var json = JSON.parse(fs.readFileSync('./staff.json'));
var errArr = [];
new Promise(function(resolve, reject){
	json.forEach(function(v, k){
		fs.exists('./portrait/' + v['姓名'] + '.jpg', function(exists){
			if(!exists){
				errArr.push(v['姓名']+'----入职时间'+v['入职时间']);
			}
			if(k === json.length - 1){
				resolve(errArr);
			}
		})
	});
})
.then(function(errArr){
	console.log(errArr);
	console.log(errArr.length);
});