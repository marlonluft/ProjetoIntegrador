var projetoIntegrador = angular.module('projetoIntegrador', ['ngRoute']);

// ROTAS
projetoIntegrador.config(function ($routeProvider, $windowProvider, $locationProvider) {
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
projetoIntegrador.controller('mainController', function ($scope, $window) {

    $scope.menuLogin = "/";
    $scope.menuGestor = '/#!/gestor/';
    $scope.menuSetor = '/#!/setor/';
    $scope.menuUsuario = '/#!/usuario/';
    $scope.menuColaborador = '/#!/colaborador/';
    $scope.menuSolicitarViagem = '/#!/solicitarViagem/';

});

projetoIntegrador.controller('loginController', function ($scope, $window) {

    $scope.RealizarLogin = function (login) {
        //login.email
        //login.senha
        //login.lembrar

    }

});

projetoIntegrador.controller('colaboradorController', function ($scope) {

    $scope.prestacoesConta = [];

    $scope.categorias = [{
            text: 'Passagem',
            value: 0
        },
        {
            text: 'Hospedagem',
            value: 1
        },
        {
            text: 'Alimentação',
            value: 2
        },
        {
            text: 'Transporte',
            value: 3
        },
        {
            text: 'Outro',
            value: 4
        }
    ];

    $scope.removerItem = function (id) {
        $('#modalRemover').modal('show');
    }

    $scope.reprovarItem = function (id) {
        $('#modalReprovar').modal('show');
    }

    $scope.enviarAprovacao = function (id) {
        $('#modalEnviarAprovacao').modal('show');
    }

    $scope.SolicitarViagem = function () {

    }

    $scope.adicionarPrestacaoConta = function (prestacao) {
        var obj = angular.copy(prestacao);
        obj.id = $scope.prestacoesConta.length;

        $scope.prestacoesConta.push(obj);
    }

    $scope.recupearDescricao = function (value) {
        var obj = $scope.categorias[Object.keys($scope.categorias).find(x => $scope.categorias[x].value === value)];
        return obj.text;
    }

    $scope.recuperarTotalPrestacao = function () {
        var total = 0;

        $scope.prestacoesConta.forEach(function (element) {
            total = total + (parseInt(element.quantidade) * parseFloat(element.valor));
        }, this);

        return total.toFixed(2);
    }

    $scope.removerPrestacao = function (id) {
        for (var i = $scope.prestacoesConta.length - 1; i >= 0; i--) {
            if ($scope.prestacoesConta[i].id == id) {
                $scope.prestacoesConta.splice(i, 1);
                break;
            }
        }
    }

});

projetoIntegrador.controller('gestorController', function ($scope) {

    $scope.reprovarItem = function (id) {
        $('#modalReprovar').modal('show');
    }

});

projetoIntegrador.controller('setorController', function ($scope) {

    $scope.NovoSetor = function () {
        $('#modalNovo').modal('show');
    }

    $scope.RemoverSetor = function (id) {
        $('#modalRemover').modal('show');
    }

});

projetoIntegrador.controller('usuarioController', function ($scope) {

    $scope.NovoUsuario = function () {
        $('#modalNovo').modal('show');
    }

    $scope.removerItem = function (id) {
        $('#modalRemover').modal('show');
    }

});

projetoIntegrador.controller('errorController', function ($scope) {



});

/* DIRETIVAS */
(function () {

    projetoIntegrador.directive('ifLoading', ifLoading);
    ifLoading.$injector = ['$http'];

    function ifLoading($http) {

        return {
            restrict: 'A',
            link: function (scope, elem) {
                scope.isLoading = isLoading;

                scope.$watch(scope.isLoading, toggleElement);

                function toggleElement(loading) {

                    if (loading) 
                    {
                        elem[0].style.display = "block";
                    } 
                    else 
                    {
                        elem[0].style.display = "none";
                    }
                }

                function isLoading() {
                    return $http.pendingRequests.length > 0;
                }
            }
        }
    };
})();