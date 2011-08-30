// example bldg json file

var bldg = {
	name: "Name",
	address: "1234 Street Way",
	description: "A brick shitter",
	year_built: "2011",
	Designer: "Fancy Haus",
	zoning: "q4",
	neighborhood: "Uptowny", 
	cover_picture: {url:'src', description:'a lovely stoop'},
	sections: [{'name':'stoop', 'pics':['src','src', ...]}],
	floor_plans: ['img src', 'img src', ...],
	published: Boolean
};

/* Steps for creating a bldg
	1. Create File, describe bldg, etc
	2. Upload bldg images
	3. Sort images by section, and give option description to images
	
	form(action="/picload", id="MyForm", enctype="multipart/form-data", method="POST")
      input(type="hidden", name="params", value=JSON.stringify(tranny))
      input(type="hidden", name="_id", value=id)
      input(type="file", name="my_file", id="file")
      input(type="submit", value="Upload")
      div#progress

script(type='text/javascript')
  $(document).ready(function(){
  $('#MyForm').transloadit({
      wait: true,
      autoSubmit: false,
      fields: '#_id'
    });
  });