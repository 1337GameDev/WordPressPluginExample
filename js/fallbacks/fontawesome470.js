var $span = $('<span class="fa" style="display:none">-</span>').appendTo('body');
if ($span.css('fontFamily') !== 'FontAwesome' ) {
    $('head').append('<link href="'+variables["cssRootURL"]+'/css/local/fontawesome/css/font-awesome.min.css\" rel="stylesheet">');
}
$span.remove();