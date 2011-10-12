$(document).ready(function(){
        $('#MyForm').transloadit({
      wait: true,
      autoSubmit: false,
      fields: true,
     onResult: function (step, result){
         //window.location = window.location;
         //console.log(step+"\n"+result)
         $("#uploaded").empty().append('<div class="thumb" style="float:left;margin:5px"><img src='+result.url+' class=preview /></div>');
     }
    })   
})
