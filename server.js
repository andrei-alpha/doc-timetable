var path = require('path');
var filesys = require('fs');
var express = require('express');
var parser = require('./parser');

var app = express();
app.use(express.bodyParser());
app.use(express.static( __dirname + '\\static'));

var paths = ['/$', '/css/.*$', '/images/.*$', '/js/.*$']

function load_file(my_path, res) {
	_public = false;
	for (i in paths)
		_public |= new RegExp(paths[i]).test(my_path);

	var full_path = path.join(process.cwd(), my_path);
	filesys.exists(full_path,function(exists){
		if(!exists || !_public){
			res.end("Hello there!");
		}
		else {
			res.sendfile(full_path);
		}
	});
}

app.get('/timetable', function(req, res) {
	var _class = req.query.class || 3;
	res.end( JSON.stringify( parser.getCourses(_class)) );
});
app.get('/*', function(req, res) {
	var _class = req.query.class || 3;
	load_file(req.path, res);
});

var port = process.env.PORT || 5000;
parser.update();
app.listen(port);
