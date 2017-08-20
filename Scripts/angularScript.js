var caminhoApi = "http://104.41.50.175:8080/ProjetoIntegradorAPI/rest";

var projetoIntegrador = angular.module('projetoIntegrador', ['ngRoute', 'ngAnimate', 'toastr']);

// Toastr config
projetoIntegrador.config(function (toastrConfig) {
    angular.extend(toastrConfig, {
        autoDismiss: false,
        maxOpened: 0,
        newestOnTop: true,
        positionClass: 'toast-bottom-right',
        preventDuplicates: false,
        preventOpenDuplicates: true,
        target: 'body',
        progressBar: true,
        timeOut: 3500
    });
});

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

    $scope.LimparUsuarioLogado = function (usuario) {
        if (typeof usuario == 'undefined') {
            $scope.usuarioLogado = {
                Id: -1,
                Cargo: ''
            }
        } else {
            $scope.usuarioLogado = {
                Id: typeof usuario.Id != 'undefined' ? usuario.Id : -1,
                Cargo: typeof usuario.Cargo != 'undefined' ? usuario.Cargo : ''
            }
        }

        Atualizarpaginas();
    }

    function Atualizarpaginas()
    {
        // Sad i know, but true.
        $scope.menuLogin = $scope.usuarioLogado.Cargo == '' ? "/" : "";
        $scope.menuGestor = $scope.usuarioLogado.Cargo == 'Gestor' ? '/#!/gestor/' : '';
        $scope.menuSetor = $scope.usuarioLogado.Cargo == 'ADMINISTRADOR' ? '/#!/setor/' : '';
        $scope.menuUsuario = $scope.usuarioLogado.Cargo == 'ADMINISTRADOR' ? '/#!/usuario/' : '';
        $scope.menuColaborador = $scope.usuarioLogado.Cargo == 'COLABORADOR' ? '/#!/colaborador/' : '';
        $scope.menuSolicitarViagem = $scope.usuarioLogado.Cargo == 'COLABORADOR' ? '/#!/solicitarViagem/' : '';
        $scope.menuSair = $scope.usuarioLogado.Id >= 0 ? "/#!/?sair" : '';
    }

    $scope.LimparUsuarioLogado();
});

projetoIntegrador.controller('loginController', function ($scope, $window, $routeParams, toastr) {

    $scope.LimparLogin = function (limpar) {

        // Valida login salvo com a opção 'lembrar selecionada'.
        var email = window.localStorage.getItem('email');
        var senha = window.localStorage.getItem('senha');

        if (email != null && typeof email != 'undefined' && (limpar == null || limpar == false)) {
            $scope.login = {
                email: email,
                senha: senha,
                lembrar: true
            }
        } else {
            $scope.login = {
                email: '',
                senha: '',
                lembrar: false
            }
        }
    }

    $scope.RealizarLogin = function (login, e) {
        if (event.which == 13 || e == null) {
            if (ValidarLogin(login)) {
                var model = {
                    Email: login.email,
                    Senha: login.senha
                };

                $.ajax({
                        url: caminhoApi + '/usuario/logar',
                        type: 'post',
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(model)
                    })
                    .done(function (data) {
                        if (data.Sucesso) {

                            if (login.lembrar) {
                                window.localStorage.setItem('email', login.email);
                                window.localStorage.setItem('senha', login.senha);
                            } else {
                                window.localStorage.removeItem('email');
                                window.localStorage.removeItem('senha');
                            }

                            $scope.LimparUsuarioLogado(data);
                            console.log(data.Id);

                            switch (data.Cargo) {

                                // Colaborador
                                case 'COLABORADOR':
                                    $window.location.href = $scope.menuColaborador;
                                    break;

                                    // Gestor
                                case 'GESTOR':
                                    $window.location.href = $scope.menuGestor;
                                    break;

                                    // Admin
                                default:
                                case 'ADMINISTRADOR':
                                    $window.location.href = $scope.menuUsuario;
                                    break;
                            }
                            toastr.success('Login efetuado', 'Sucesso!');

                        } else {
                            toastr.error(data.Mensagem);
                        }
                    })
                    .fail(function () {
                        toastr.error('Falha ao realizar a ação, tente novamente.');
                    });
            }

            if (e != null) {
                e.preventDefault();
            }
        }
    }

    function ValidarLogin(login) {
        if (typeof login == 'undefined' || login == null) {
            toastr.error('Objeto de login inválido');
            return false;
        }

        if (typeof login.email == 'undefined' || login.email == null || login.email.length == 0) {
            toastr.error('E-mail informado inválido');
            return false;
        }

        if (typeof login.senha == 'undefined' || login.senha == null || login.senha.length == 0) {
            toastr.error('Senha informada inválida');
            return false;
        }

        return true;
    }

    // Inicializa os campos de login.
    $scope.LimparLogin();

    // Verifica se tem um objeto de login salvo e realiza o login.
    // Caso contenha o parametro sair, somente matem os dados em tela mas não realiza o login.
    if ($scope.login.email != '' && typeof $routeParams.sair == 'undefined') {
        $scope.RealizarLogin($scope.login, null);
    }
    else if ($routeParams.sair != 'undefined')
    {
        $scope.LimparUsuarioLogado();
    }

});

projetoIntegrador.controller('colaboradorController', function ($scope, $window) {

    $scope.visualizarViagem = false;
    $scope.visualizarCustos = false;

    $scope.solicitacoesViagem = [];
    $scope.prestacoesConta = [];

    $scope.objViagem = {
        id: -1,
        origem: '',
        destino: '',
        dataIda: '',
        dataVolta: '',
        status: 0,
        justificativa: '',
        motivo: 'Outro',
        observacao: ''
    };

    $scope.abrirSolicitacao = function (id) {
        $scope.objViagem = $scope.solicitacoesViagem[Object.keys($scope.solicitacoesViagem).find(x => $scope.solicitacoesViagem[x].id === id)];
        $window.location.href = $scope.menuSolicitarViagem;
    }

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

    $scope.status = [{
            text: 'Em Aberto',
            value: 0
        },
        {
            text: 'Aguardando Aprovação de Viagem',
            value: 1
        },
        {
            text: 'Solicitação Recusada',
            value: 2
        },
        {
            text: 'Em Aberto Prestação de Contas',
            value: 3
        },
        {
            text: 'Aguardando Aprovação de Contas',
            value: 4
        },
        {
            text: 'Prestação Recusada',
            value: 5
        },
        {
            text: 'Finalizado',
            value: 6
        }
    ];

    $scope.solicitacoesViagem = [{
            id: 1,
            origem: 'Blumenau - BR',
            destino: 'New York - USA',
            dataIda: '11/10/2017',
            dataVolta: '25/11/2017',
            status: 0,
            justificativa: '',
            motivo: 'Outro',
            observacao: ''
        },
        {
            id: 2,
            origem: 'Gaspar - BR',
            destino: 'São Paulo - BR',
            dataIda: '08/12/2017',
            dataVolta: '20/01/2018',
            status: 1,
            justificativa: '',
            motivo: 'Outro',
            observacao: ''
        },
        {
            id: 3,
            origem: 'Gaspar - BR',
            destino: 'São Paulo - BR',
            dataIda: '08/12/2017',
            dataVolta: '20/01/2018',
            status: 2,
            justificativa: 'Justificativa do gesto imediato referente a solicitação de viagem enviada.',
            motivo: 'Outro',
            observacao: ''
        },
        {
            id: 4,
            origem: 'Gaspar - BR',
            destino: 'São Paulo - BR',
            dataIda: '08/12/2017',
            dataVolta: '20/01/2018',
            status: 5,
            justificativa: 'Justificativa do gesto imediato referente a recusa da prestação de custo enviada.',
            motivo: 'Outro',
            observacao: ''
        },
        {
            id: 5,
            origem: 'Gaspar - BR',
            destino: 'São Paulo - BR',
            dataIda: '08/12/2017',
            dataVolta: '20/01/2018',
            status: 6,
            justificativa: '',
            motivo: 'Outro',
            observacao: ''
        },
        {
            id: 7,
            origem: 'Blumenau - BR',
            destino: 'Tocantins - BR',
            dataIda: '11/10/2017',
            dataVolta: '25/11/2017',
            status: 4,
            justificativa: '',
            motivo: 'Outro',
            observacao: ''
        },
        {
            id: 6,
            origem: 'Blumenau - BR',
            destino: 'Acre - BR',
            dataIda: '11/10/2017',
            dataVolta: '25/11/2017',
            status: 3,
            justificativa: '',
            motivo: 'Outro',
            observacao: ''
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

    $scope.adicionarPrestacaoConta = function (prestacao) {
        var obj = angular.copy(prestacao);
        obj.id = $scope.prestacoesConta.length;

        $scope.prestacoesConta.push(obj);
    }

    $scope.recupearDescricao = function (value) {
        var obj = $scope.categorias[Object.keys($scope.categorias).find(x => $scope.categorias[x].value === value)];
        return obj.text;
    }

    $scope.recupearDescricaoStatus = function (value) {
        var obj = $scope.status[Object.keys($scope.status).find(x => $scope.status[x].value === value)];
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

                    if (loading) {
                        elem[0].style.display = "block";
                    } else {
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