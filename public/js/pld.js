$(document).ready(function(){
	$('#galleryForm').transloadit({
	  wait: true,
	  autoSubmit: false,
	  fields: true,
      onResult: function (step, result){
          console.log(step+"\n"+result)
      }
	})

	$('#MyForm').transloadit({
	  wait: true,
	  autoSubmit: false,
	  fields: true,
        onResult: function (step, result){
            ayaya = result;
          console.log(step+"\n"+result)
          $("#uploaded").empty().append("<img src="+result.url+" class=preview />").width(600)
      }
	})
})