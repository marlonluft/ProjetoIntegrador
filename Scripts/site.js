$(window).on('load', function () {
    $("body").tooltip({ selector: '[data-toggle=tooltip]', placement: 'bottom' });
});

$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});