var scotchApp = angular.module('scotchApp', ['ngRoute']);

// ROTAS
scotchApp.config(function ($routeProvider, $windowProvider) {
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
        });

    var $window = $windowProvider.$get();
});

// CONTROLLERs
scotchApp.controller('mainController', function ($scope, $window) {

    var caminho = "http://" + $window.location.host + "/" + "Layout.html#!/";
    
    $scope.menuLogin = caminho;
    $scope.menuGestor = caminho + 'gestor/';
    $scope.menuSetor = caminho + 'setor/';
    $scope.menuUsuario = caminho + 'usuario/';
    $scope.menuColaborador = caminho + 'colaborador/';
    $scope.menuSolicitarViagem = caminho + 'solicitarViagem/';

});

scotchApp.controller('loginController', function ($scope, $window) {

    $scope.RealizarLogin = function (login) {
        //login.email
        //login.senha
        //login.lembrar

        $scope.Redirect(login.email || "");

        $scope.Redirect = function (modulo) {
            switch (modulo) {

                case "gestor":
                    $window.location.href = $window.location.href + 'gestor/';
                    break;

                case "admin":
                    $window.location.href = $window.location.href + 'usuario/';
                    break;

                case "colaborador":
                default:
                    $window.location.href = $window.location.href + 'colaborador/';
                    break;
            }
        }
    }

});

scotchApp.controller('colaboradorController', function ($scope) {

    $scope.SolicitarViagem = function () {
        $('#myModal').modal('show');
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