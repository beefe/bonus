var readExcel = require('xls-to-json');
readExcel({
	input: 'staff.xls',
	output: 'staff.json'
}, function(err, result){
	console.log(result);
});