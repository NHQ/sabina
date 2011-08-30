/**
 * NOTES
	* Possible idea for other Sabina website: property picks a la blog
*/

var express = require('express')
	,	_ = require('underscore')
	, request = require('request')
	, fs = require('fs')
	, sys = require('sys')
	, formidable = require('formidable');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

function picload(id, valu){
	// keys is an obj
	var doc = JSON.parse(fs.readFileSync('public/json/'+req.params.code+'.json'))
	fs.writeFile('public/bldgs/'+id+'.json', JSON.stringify(req.body), function(err){
		if (!err) console.log('saved!');
		res.redirect('/'+req.params.code)
	})
}

app.post('/picload', function(req, res){
	var form = new formidable.IncomingForm();
	res.writeHead(200, {'content-type': 'text/plain'});
	form.uploadDir = 'public/bldgs/';
	form.keepExtensions = true;
	form.on('progress', function(bytesReceived, bytesExpected){
		var buff = new Buffer(bytesReceived.toString(),encoding='utf8')
		res.write(buff);
		console.log(bytesReceived +'\n'+ bytesExpected)
	})
	form.on('end', function(){
		res.end();
	})
	form.parse(req, function(err, fields, files){
		console.log(fields+'\n'+files)
	});
});

app.post('/uploads', function (req, res){
	res.writeHead('200');
	var info = req.body;
	console.log(info);
		var _id = info.fields._id || null;
	
// get the image files

	request.get(info.uploads.url).pipe(fs.createWriteStream('public/images/'+info.uploads.name));
	request.get(info.thumb.url).pipe(fs.createWriteStream('public/images/'+info.encode.name));
	request.get(info.medium.url).pipe(fs.createWriteStream('public/images/'+info.encode.name));

// write to gallery.json
	if (info.fields.section)
		{
				var gallery = JSON.parse(fs.readFileSync('public/json/gallery.json'));
				gallery[info.fields.section].push({'large': 'images/'+info.uploads.url, 'medium': 'images/'+info.medium.url, 'thumb':'images/'+info.thumb.url})
				fs.writeFile("public/json/gallery.json", JSON.stringify(gallery), function(e,r){
					console.log(e || "no error")
				});
		}

// for Bldg pictures	

	if(_id){
		var portfolio = JSON.parse(fs.readFileSync('public/json/portfolio.json'));
		porfolio[_id] = _.extend(portfolio[_id], {'img':{'large': 'images/'+info.uploads.url, 'medium': 'images/'+info.medium.url, 'thumb':'images/'+info.thumb.url}})
		fs.writeFile("public/json/porfolio.json", JSON.stringify(porfolio), function(e,r){
			console.log(e || "no error")
		});
	}
	res.end();		
})


app.get('/portfolio', function(req,res){
	fs.readFile('public/json/portfolio.json', function(e,r){
		console.log(e+"\n"+r);
		res.render('portfolio', {layout: false, title: 'PLD Custom Home Builders', locals: {
			bldgs: JSON.parse(r)
			}})
	})
})

app.get('/about', function(req,res){
	fs.readFile('public/json/about.json',encoding='utf8', function(e,r){
		console.log(e+"\n"+r)
		res.render('about', {layout: false, title: 'PLD Custom Home Builders', locals: {
			about: JSON.parse(r)
			}})
	})
})

app.get('/services', function(req,res){
	fs.readFile('public/json/services.json', function(e,r){
		console.log(e+"\n"+r)
		res.render('services', {layout: false, title: 'PLD Custom Home Builders', locals: {
			services: JSON.parse(r)
			}})
	})
})

app.get('/gallery', function(req,res){
	var d = fs.readFileSync('public/json/gallery.json');
	fs.readFile('public/json/gallery.json', encoding='utf8', function(e,r){
		var content = JSON.parse(r);
		console.log(e+"\n"+r);
		var section = req.query.section || Object.keys(content)[0];
		console.log(section);
		res.render('gallery', {layout: false, title: 'PLD Custom Home Builders', locals: {
			section: section,
			sections: Object.keys(content),
			gallery: section
			}})
	})
})

app.post('/new/bldg', function(req,res){
	console.log(req.body);
	var _id = req.body._id;
	var portfolio = JSON.parse(fs.readFileSync('public/json/portfolio.json'));
	console.log(portfolio[_id]);
	_.extend(portfolio[_id], req.body);
		console.log(portfolio[_id]);
	fs.writeFile("public/json/portfolio.json", JSON.stringify(portfolio), function(e,r){
		console.log(e || "no error")
	});
})

app.get('/new/bldg', function(req, res){
	var bldg = {
		address: "",
		description: "",
		status: ""
	};
	var portfolio = JSON.parse(fs.readFileSync('public/json/portfolio.json'));
	var _id = portfolio.length;
	portfolio[_id] = {};
	fs.writeFile('public/json/portfolio.json', JSON.stringify(portfolio), function(e,r){
				console.log(e+"\n"+r);
	})
	res.render('bldg', {layout: false, title: 'New Building', locals: {
		bldg: bldg,
		id: _id, // index
		tranny: {
  			"auth": 
			{
    			"key": "08f81b65f9c4433796ca6f17861f57bf"
  			},
 			"template_id": "b01e9ea666c741a4bc428d8b783b161d",
			"notify_url": "http://74.207.237.52:3000/uploads?_id="+_id
		}
		}})
})


app.listen(3000);
console.log("Express server listening on port %d", app.address().port);