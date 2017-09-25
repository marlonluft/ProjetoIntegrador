$(window).on('load', function () {
    $("body").tooltip({ selector: '[data-toggle=tooltip]', placement: 'bottom' });
});

$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});

function SolicitacaoSet(model)
{
    if (typeof model !== 'undefined')
    {
        var obj = JSON.stringify(model);
        window.localStorage.setItem('solicitacaoViagem', obj);
    }    
}

function SolicitacaoGet()
{
    var obj = window.localStorage.getItem('solicitacaoViagem');
    obj = JSON.parse(obj);

    if (typeof (obj) != 'undefined' && obj != null)
    {
            if (typeof obj.DataIda != 'undefined' && obj.DataIda != null)
            {
                obj.DataIda = new Date(obj.DataIda);
            }
            else
            {
                obj.DataIda = '';//new Date();
            }

            if (typeof obj.DataVolta != 'undefined' && obj.DataVolta != null)
            {
                obj.DataVolta = new Date(obj.DataVolta);
            }
            else
            {
                obj.DataVolta = '';// new Date();
            }
    }

    return obj;
}