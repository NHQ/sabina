/**
 * NOTES
	* Possible idea for other Sabina website: property picks a la blog
*/

var express = require('express')
	,	_ = require('underscore')
	, request = require('request')
	, fs = require('fs')
	, sys = require('util')
	, formidable = require('formidable')
    ,cluster = require('cluster')
    , connect = require('connect')
    ,http = require('http');

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

app.get('/sitemap', function(req, res) {
    var xml = fs.readFileSync('public/json/sitemap.xml')
    res.send(xml);
});

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
//		console.log(bytesReceived +'\n'+ bytesExpected)
	})
	form.on('end', function(){
		res.end();
	})
	form.parse(req, function(err, fields, files){
 	console.log(fields+'\n'+files)
	});
});

function pickles(x,size){
    _.each(x, function(e){
        request.get(e.url).pipe(fs.createWriteStream('public/images/'+size+e.name))    
    })
}

app.get('/', function(req, res){
        	res.render('index', {layout: false, locals: {title: "PLD Custom Homes Developmenet"}});
})

app.post('/uploads', function (req, res){
	var info = JSON.parse(req.body.transloadit);
    var ids = JSON.parse(fs.readFileSync('public/json/ids.json'));
    if (_.include(ids, info.assembly_id)){return};
    ids.push(info.assembly_id);
    fs.writeFileSync('public/json/ids.json', JSON.stringify(ids))
//    console.log(info);
 //   console.log(info.results);
  //  console.log(info.assebly_id);
	var _id = info.fields._id || null;
	
// get the image files

_.each(info.uploads, function (e){
    request.get(e.url).pipe(fs.createWriteStream('public/images/large_'+e.name))})
	
if (info.results.thumb){
	_.each(info.results.thumb, function (e) {
        request.get(e.url).pipe(fs.createWriteStream('public/images/thumb_'+e.name))})}

if (info.results.medium){
	_.each(info.results.medium, function (e) {
        request.get(e.url).pipe(fs.createWriteStream('public/images/medium_'+e.name))})}
// write to gallery.json
	if (info.fields.section)
		{
				var gallery = JSON.parse(fs.readFileSync('public/json/gallery.json'));
                var added = {};
                added.large = 'images/large_'+info.uploads[0].name;
                if (info.results.thumb) added.thumb =  'images/thumb_'+info.results.thumb[0].name;
                if (info.results.medium) added.medium = 'images/medium_'+info.results.medium[0].name;
				gallery[info.fields.section].push(added)
				
                fs.writeFile("public/json/gallery.json", JSON.stringify(gallery), function(e,r){
					console.log(e || "no error")
				});
		}
        
// for client imgs

    if(info.fields.index && info.fields.name){
        var client = JSON.parse(fs.readFileSync('public/json/client/'+info.fields.name+'.json'))
        var added = {};
        added.large = 'images/large_'+info.uploads[0].name;
        if (info.results.thumb) added.thumb =  'images/thumb_'+info.results.thumb[0].name;
        if (info.results.medium) added.medium = 'images/medium_'+info.results.medium[0].name;
    	client.updates[info.fields.index].img = added;
        fs.writeFile('public/json/client/'+info.fields.name+'.json', JSON.stringify(client), function(e,r){
    		console.log(e || "no error")
		});
        
    }

// for Bldg pictures	

	if(_id){
		var portfolio = JSON.parse(fs.readFileSync('public/json/portfolio.json'));
        var tadded = {img:{}};
        tadded.img.large = 'images/large_'+info.uploads[0].name;
        if (info.results.thumb) tadded.img.thumb = 'images/thumb_'+info.results.thumb[0].name;
        if (info.results.medium) tadded.img.medium = 'images/medium_'+info.results.medium[0].name;
		portfolio[_id] = _.extend(portfolio[_id], tadded)
		fs.writeFile("public/json/portfolio.json", JSON.stringify(portfolio), function(e,r){
			console.log(e || "no error")
		});
	}
})
app.get('/admin', function(req, res){
    fs.readFile('public/json/about.json', function(e,r){
//		console.log(e+"\n"+JSON.parse(r));
		res.render('admin', {layout: false, title: 'PLD Custom Home Builders', locals: {
			about: JSON.parse(r)
			}})
	})
})
app.post('/admin', function(req, res){
    var about = JSON.parse(fs.readFileSync('public/json/about.json'));
    var b = req.body;
    about.contact = {street: b.street, suite: b.suite, city: b.city, phone: b.phone, fax: b.fax, email: b.email };
    about.about = b.about;
    about.services = {design: b.design, build: b.build}
    fs.writeFile('public/json/about.json', JSON.stringify(about), function(e,r){
//        console.log(e+"\n"+r);
        res.redirect('/admin')
    })
})
app.get('/contact', function(req,res){
    fs.readFile('public/json/about.json', function(e,r){
 //   	console.log(e+"\n"+JSON.parse(r));
		res.render('contact', {layout: false, title: 'PLD Custom Home Builders', locals: {
			about: JSON.parse(r).contact
			}})
	})
})
app.get('/portfolio', function(req,res){
	fs.readFile('public/json/portfolio.json', function(e,r){
//		console.log(e+"\n"+r);
		res.render('portfolio', {layout: false, title: 'PLD Custom Home Builders', locals: {
			bldgs: JSON.parse(r)
			}})
	})
})
app.post('/edit/bldg', function(req,res){
 //   console.log(req.body);
    var _id = req.body._id;
	var portfolio = JSON.parse(fs.readFileSync('public/json/portfolio.json'));
	console.log(portfolio[_id]);
	_.extend(portfolio[_id], req.body);
//		console.log(portfolio[_id]);
	fs.writeFile("public/json/portfolio.json", JSON.stringify(portfolio), function(e,r){
//		console.log(e || "no error")
        res.redirect('/edit/bldg?id='+_id);
	});
})

app.post('/new/bldg', function(req,res){
 //   console.log(req.body);
	var _id = req.body._id;
	var portfolio = JSON.parse(fs.readFileSync('public/json/portfolio.json'));
	console.log(portfolio[_id]);
	_.extend(portfolio[_id], req.body);
//		console.log(portfolio[_id]);
	fs.writeFile("public/json/portfolio.json", JSON.stringify(portfolio), function(e,r){
//		console.log(e || "no error")
        res.redirect('/edit/bldg?id='+_id);
	});
})
app.get('/edit/portfolio', function(req,res){
    fs.readFile('public/json/portfolio.json', function(e,r){
//		console.log(e+"\n"+r);
		res.render('editPortfolio', {layout: false, title: 'PLD Custom Home Builders', locals: {
			bldgs: JSON.parse(r)
			}})
	})
})
app.get('/del/bldg', function(req,res){
    var b = JSON.parse(fs.readFileSync('public/json/portfolio.json'));
    b.splice(req.query.id,1)
    fs.writeFile('public/json/portfolio.json', JSON.stringify(b), function(e,r){
 //   	console.log(e+"\n"+r);
    })
    res.redirect('/edit/portfolio')
})

app.get('/edit/bldg', function(req, res){
        var protobldg = {
		address: "",
		description: "",
		status: ""
	};
    var _id = req.query.id;
//	console.log(_id);
    var bldg = JSON.parse(fs.readFileSync('public/json/portfolio.json'))[_id];
	res.render('editBldg', {layout: false, title: 'New Building', locals: {
		bldg: bldg,
        proto: protobldg,
        id: _id,
		tranny: {
  			"auth": 
			{
    			"key": "08f81b65f9c4433796ca6f17861f57bf"
  			},
 			"template_id": "b01e9ea666c741a4bc428d8b783b161d",
			"notify_url": "http://pldhomes.com/uploads?_id="+_id
		}
		}})
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
	res.render('newBldg', {layout: false, title: 'New Building', locals: {
		bldg: bldg,
		id: _id, // index
		tranny: {
  			"auth": 
			{
    			"key": "08f81b65f9c4433796ca6f17861f57bf"
  			},
 			"template_id": "b01e9ea666c741a4bc428d8b783b161d",
			"notify_url": "http://pldhomes.com/uploads?_id="+_id
		}
		}})
})


app.get('/about', function(req,res){
	fs.readFile('public/json/about.json',encoding='utf8', function(e,r){
//		console.log(e+"\n"+r)
		res.render('about', {layout: false, title: 'PLD Custom Home Builders', locals: {
			about: JSON.parse(r)
			}})
	})
})

app.get('/services', function(req,res){
	fs.readFile('public/json/about.json', function(e,r){
//		console.log(e+"\n"+r)
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
		res.render('gallery', {layout: false, title: 'PLD Custom Home Builders', locals: {
			section: section,
			sections: Object.keys(content),
			gallery: content[section]
		}})
	})
})
app.post('/edit/gallery', function(req, res){
	res.redirect('/edit/gallery?section='+req.query.section)
})
app.post('/index/image', function(req,res){
 //   console.log(req.body);
    res.redirect('back')
    var index = req.body.index, section = req.body.gallery, position = req.body.position;
    var gallery = JSON.parse(fs.readFileSync('public/json/gallery.json'));
    gallery[section].splice(index, 0, gallery[section].splice(position, 1)[0]);
    fs.writeFile('public/json/gallery.json', JSON.stringify(gallery), function(e,r){
   //     console.log(e+"\n"+r);
    })
})

app.get('/edit/gallery', function(req,res){
	// var d = fs.readFileSync('public/json/gallery.json');
	fs.readFile('public/json/gallery.json', encoding='utf8', function(e,r){
		var content = JSON.parse(r);
		var section = req.query.section || Object.keys(content)[0];
	//			console.log(e);
		res.render('editGallery', {layout: false, title: 'PLD Custom Home Builders', locals: {
			section: section,
			sections: Object.keys(content),
			gallery: content[section],
			tranny: {
	  			"auth": 
				{
	    			"key": "08f81b65f9c4433796ca6f17861f57bf"
	  			},
	 			"template_id": "b01e9ea666c741a4bc428d8b783b161d",
				"notify_url": "http://pldhomes.com/uploads"
			}
			}})
	})
})

app.post('/add/section', function(req,res){
	var d = JSON.parse(fs.readFileSync('public/json/gallery.json'));
	d[req.body.section] = [];
	fs.writeFile('public/json/gallery.json', JSON.stringify(d));
	res.redirect('/edit/gallery?section='+req.body.section)
})
app.post('/del/section', function(req,res){
	var d = JSON.parse(fs.readFileSync('public/json/gallery.json'));
	delete d[req.body.section];
//    console.log(d);
	fs.writeFile('public/json/gallery.json', JSON.stringify(d));
	res.redirect('/edit/gallery')
})
app.post('/del/image', function(req,res){
 //   console.log(req.body);
	var d = JSON.parse(fs.readFileSync('public/json/gallery.json'));
    d[req.body.section].splice([req.body.index],1)
 //   console.log(d);
    fs.writeFile('public/json/gallery.json', JSON.stringify(d));
	res.redirect('/edit/gallery?section='+req.body.section)
})
app.get('/images', function(req,res){
	fs.readdir('public/images', function(e,r){
		res.send(r);
	})
})
app.get('/all-cli', function(req,res){
    var clients = fs.readdirSync('public/json/client');
   res.render('all-cli', {title:'All Clients', layout:false, locals:{list: clients}})
   //res.send(clients)
})
app.get('/add-cli', function(req, res){
    res.render('addClient', {title:'Add New Client', layout:false})
})

app.post('/new/cli', function(req,res){
    var name = req.body.name.replace(/\s/g,'_');
    var blog = {};
    blog.name = name;
    blog.updates = [];
    fs.writeFile('public/json/client/'+name+'.json', JSON.stringify(blog), function(e,r){
 //       console.log(e+"\n"+r);
        res.redirect('/update/'+name)
    })
})
app.get('/update/:name', function(req,res){
    var client = JSON.parse(fs.readFileSync('public/json/client/'+req.params.name+'.json'));
    if (req.query.index){
        var update = client.updates[req.query.index];
 //       console.log(req.query)
    }
    else {
        var update = {header:"",completed:"",scheduled:"", notes:"", date:""};
        client.updates.unshift(update);
        fs.writeFile('public/json/client/'+req.params.name+'.json', JSON.stringify(client), function(e,r){
 //           console.log(e+"\n"+r);
        })   
    }
//    console.log(update);
    res.render('updateClient', {title:'Client Updates', layout: false, locals:{index: req.query.index || 0, name: req.params.name.replace(/_/g, ' '), update: update, tranny: {
	  			"auth": 
				{
	    			"key": "08f81b65f9c4433796ca6f17861f57bf"
	  			},
	 			"template_id": "b01e9ea666c741a4bc428d8b783b161d",
				"notify_url": "http://pldhomes.com/uploads"
			}}})
})

app.post('/update/:name', function(req, res){
    var client = JSON.parse(fs.readFileSync('public/json/client/'+req.params.name+'.json'));
    var update = {};
    //update.img = {};
    var target = client.updates[req.body.index];
    target.header = req.body.header;
    target.completed = req.body.completed;
    target.scheduled = req.body.scheduled;
    target.notes = req.body.notes;
    target.date = req.body.date;
    fs.writeFile('public/json/client/'+req.params.name+'.json', JSON.stringify(client), function(e,r){
  //      console.log(e+"\n"+r);
        res.redirect('/edit/client/'+req.params.name)
    })
})
app.get('/client/:name', function(req, res){
    var client = JSON.parse(fs.readFileSync('public/json/client/'+req.params.name+'.json'));
    res.render('client', {title: req.params.name.replace(/_/g, ' '), layout: false, locals: {name: req.params.name.replace(/_/g, ' '), blog: client}})
})
 app.get('/edit/client/:name', function(req,res){
    var client = JSON.parse(fs.readFileSync('public/json/client/'+req.params.name+'.json'));
    res.render('edit-client', {title: req.params.name.replace(/_/g, ' '), layout: false, locals: {name: req.params.name.replace(/_/g, ' '), blog: client}})      
 })
 app.post('/del/update', function(req, res){
    var client = JSON.parse(fs.readFileSync('public/json/client/'+req.body.name+'.json'));
    client.updates.splice(req.body.index,1)
    fs.writeFile('public/json/client/'+req.body.name+'.json', JSON.stringify(client), function(e,r){
//        console.log(e+"\n"+r);
        res.redirect('/edit/client/'+req.body.name)
    })
 })
app.post('/del/client', function(req,res){
    fs.unlink('public/json/client/'+req.body.name, function(e,r){
//    console.log(e+"\n"+r);
    res.redirect('/all-cli')
    })
    
})
var server = connect.createServer();

server.use(connect.vhost('pldhomes.com', app));

cluster(server)
  .set('workers', 2)
  .use(cluster.debug())
  .listen(80);


//app.listen(3003);
//console.log("Express server listening on port %d", app.address().port);
