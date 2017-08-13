var scotchApp = angular.module('scotchApp', ['ngRoute']);

// ROTAS
scotchApp.config(function ($routeProvider, $windowProvider, $locationProvider) 
{
    $routeProvider
        .when('/', {
            templateUrl: '../Views/Login/index.html',
            controller: 'loginController'
        })
        .when('/colaborador', {
            templateUrl: '../Views/colaborador/index.html',
            controller: 'colaboradorController'
        })
        .when('/gestor', {
            templateUrl: '../Views/gestor/index.html',
            controller: 'gestorController'
        })
        .when('/setor', {
            templateUrl: '../Views/setor/index.html',
            controller: 'setorController'
        })
        .when('/usuario', {
            templateUrl: '../Views/usuario/index.html',
            controller: 'usuarioController'
        })
        .when('/solicitarViagem', {
            templateUrl: '../Views/solicitarViagem/index.html',
            controller: 'colaboradorController'
        })
        .when('/naoEncontrado', {
            templateUrl: '../Views/Error/naoEncontrado.html',
            controller: 'errorController'
        })
        .otherwise({
            redirectTo: '/naoEncontrado'
        });

    //$locationProvider.html5Mode(true);

    var $window = $windowProvider.$get();
});

// CONTROLLERs
scotchApp.controller('mainController', function ($scope, $window) {

    $scope.menuLogin = "/";
    $scope.menuGestor = '/#!/gestor/';
    $scope.menuSetor = '/#!/setor/';
    $scope.menuUsuario = '/#!/usuario/';
    $scope.menuColaborador = '/#!/colaborador/';
    $scope.menuSolicitarViagem = '/#!/solicitarViagem/';

});

scotchApp.controller('loginController', function ($scope, $window) {

    $scope.RealizarLogin = function (login) {
        //login.email
        //login.senha
        //login.lembrar

    }

});

scotchApp.controller('colaboradorController', function ($scope) {

    $scope.prestacoesConta = [];

    $scope.categorias = [
        {text:'Passagem', value: 0},
        {text:'Hospedagem', value: 1},
        {text:'Alimentação', value: 2},
        {text:'Transporte', value: 3},
        {text:'Outro', value: 4}
    ];

    $scope.SolicitarViagem = function () {
        $('#myModal').modal('show');
    }

    $scope.adicionarPrestacaoConta = function (prestacao)
    {
        var obj = angular.copy(prestacao);
        obj.id = $scope.prestacoesConta.length;

        $scope.prestacoesConta.push(obj);
    }

    $scope.recupearDescricao = function(value)
    {
        var obj = $scope.categorias[Object.keys($scope.categorias).find(x => $scope.categorias[x].value === value)];
        return obj.text;
    }

    $scope.recuperarTotalPrestacao = function()
    {
        var total = 0;

        $scope.prestacoesConta.forEach(function(element) {
            total = total + (parseInt(element.quantidade) * parseFloat(element.valor));
        }, this);

        return total.toFixed(2);
    }

    $scope.removerPrestacao = function(id)
    {
        for(var i = $scope.prestacoesConta.length -1; i >= 0; i--)
        {
            if ($scope.prestacoesConta[i].id == id)
            {
                $scope.prestacoesConta.splice(i, 1);
                break;
            }
        }
    }

});

scotchApp.controller('gestorController', function ($scope) {



});

scotchApp.controller('setorController', function ($scope) {

    $scope.NovoSetor = function () {
        $('#modalNovo').modal('show');
    }

});

scotchApp.controller('usuarioController', function ($scope) {

    $scope.NovoUsuario = function () {
        $('#modalNovo').modal('show');
    }

});

scotchApp.controller('errorController', function ($scope) {



});
