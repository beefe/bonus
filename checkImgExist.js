var fs = require('fs');
var json = JSON.parse(fs.readFileSync('./staff.json'));
var errArr = [];
var sucArr = [];
new Promise(function(resolve, reject){
	json.forEach(function(v, k){
		fs.exists('./portrait/' + v['姓名'] + '.jpg', function(exists){
			if(!exists){
				errArr.push(v['姓名']+'----a'+v['a']);
			}
			else{
				sucArr.push(v);
			}
			if(k === json.length - 1){
				resolve([errArr, sucArr]);
			}
		})
	});
})
.then(function(arr){
	console.log(arr[0]);
	console.log(arr[0].length);
	console.log(arr[1]);
	console.log(arr[1].length);
});