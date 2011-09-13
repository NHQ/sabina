$(document).ready(function(){
$('a:[href=#build]').click(function(e){
    e.preventDefault();
    $('#content #design').hide();
   $('#content #build').fadeIn(600);
    $('a:[href=#build]').addClass('active');
    $('a:[href=#design]').removeClass('active');
})

$('a:[href=#design]').click(function(e){
    e.preventDefault();
    $('#content #build').hide();
   $('#content #design').fadeIn(600);
    $('a:[href=#design]').addClass('active');
    $('a:[href=#build]').removeClass('active');
})
})

