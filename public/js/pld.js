$(document).ready(function(){
    if($('#galleryForm input:[name=section]').val() == ''){
       $('#galleryForm input:[type=submit]').click(function(e){
       e.preventDefault();
        alert('You must create a section first')
       }) 
      }
    if($('#galleryForm input:[name=section]').val() != ''){
        $('#galleryForm').transloadit({
	  wait: true,
	  autoSubmit: false,
	  fields: true,
      onResult: function (step, result){
        window.location = window.location;
        //  if (result=="thumb"){
        //  $("#content").append('<div class="thumb" style="float:left;margin:5px"><img src='+result.url+' class=preview /></div>').width(167);
         // this.onResult = null;}
      }
	})   
    }
 if($('#galleryForm input:[name=section]').val() != ''){
        $('#galleryForm').transloadit({
      wait: true,
      autoSubmit: false,
      fields: true,
      onResult: function (step, result){
            window.location = window.location;
    //      console.log(step+"\n"+result)
     //     $("#content").append('<div class="thumb" style="float:left;margin:5px"><img src='+result.url+' class=preview /></div>').width(167);
      //    this.onResult = null;
      }
    })   
    }
})
