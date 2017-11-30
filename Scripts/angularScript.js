//var caminhoApi = "http://104.41.50.175:8080/ProjetoIntegradorAPI/rest";
var caminhoApi = "http://localhost:8080/ProjetoIntegradorAPI/rest";

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
            templateUrl: '../Views/colaborador/index.html',
            controller: 'colaboradorController'
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
            controller: 'solicitacaoController'
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
projetoIntegrador.controller('mainController', function ($scope, $window, $http, toastr, $timeout) {

    $scope.Redirecionar = function (url) {
        $('html, body').animate({ scrollTop: 0 }, 'swing');
        $window.location.href = url;
    }

    $scope.ValidarMsgErro = function(response, mensagemPadrao){

        if (response != null && typeof response != 'undefined' &&
            response.data != null && typeof response.data != 'undefined' &&
            response.data.Mensagem != null && typeof response.data.Mensagem != 'undefined' &&
            response.data.Mensagem.length > 0)
        {
            toastr.error(response.data.Mensagem);
        }
        else
        {
            if (typeof mensagemPadrao === 'undefined' || mensagemPadrao == null)
            {
                mensagemPadrao = "Falha ao realizar a ação, Tente novamente.";
            }

            toastr.error(mensagemPadrao);
        }
    }

    $scope.CoresStatus = function (status, solicitacaoStatus) {
        if ((status == 1 && solicitacaoStatus == 2) || (status == 4 && solicitacaoStatus == 5)) {
            // reprovado solicitação viagem / custos
            return "#c7383c";
        }
        else if (status < solicitacaoStatus || (status == 6 && solicitacaoStatus == 6)) {
            return "#0c7cd5";
        }
        else if (status === solicitacaoStatus) {
            return "#585858";
        }
        else {
            return "#8ec6f3";
        }
    }

    $scope.IconeStatus = function (status, solicitacaoStatus, padrao) {
        if ((status == 1 && solicitacaoStatus == 2) || (status == 4 && solicitacaoStatus == 5)) {
            // reprovado solicitação viagem / custos
            return "fa-times";
        }
        else if (status < solicitacaoStatus || (status == 6 && solicitacaoStatus == 6)) {
            return "fa-check";
        }
        else {
            return padrao;
        }
    }

    $scope.ValidarAcesso = function (response) {

        var data = response.data;

        // Realiza a validação do sresponse do $http para verificar se o acesso do usuário é válido.
        var acessoValido = false;

        if (data == null || typeof data == 'undefined') {
            toastr.error('Objeto de resposta nulo.', 'Validação de acesso');
        }
        else if (data.AcessoValido == null || typeof data.AcessoValido == 'undefined') {
            toastr.error('Objeto de acesso inválido.', 'Validação de acesso');
        }
        else if (!data.AcessoValido) {
            toastr.error('Redirecionando para a tela de login.', 'Acesso inválido');
        }
        else {
            acessoValido = true;
        }

        if (acessoValido) {
            return true;
        }
        else {
            // Se acesso não é válido redireciona para o login
            $timeout(function (){
                $scope.Redirecionar($scope.menuSair);
            }, 500);            
            return false;
        }
    }

    $scope.ValidarLogin = function () {
        if (typeof $scope.usuarioLogado == 'undefined' ||
            $scope.usuarioLogado == null ||
            $scope.usuarioLogado.Id < 0) {
            $scope.Redirecionar($scope.menuLogin);
            return false;
        }

        $scope.UsuarioNome = window.localStorage.getItem('usuarioNome');
        $scope.PerfilGestor = window.localStorage.getItem('PerfilGestor') == 1;

        return true;
    }

    $scope.LimparUsuarioLogado = function (usuario) {

        $scope.UsuarioNome = '';

        // Verifica se está carregando o site (acabou de entrar)
        if (window.localStorage.getItem('carregandoMain') == '1') {
            window.localStorage.setItem('carregandoMain', '0');

            var objUsuario = LoginGet();
            if (typeof objUsuario != 'undefined' && objUsuario != null) {
                usuario = angular.copy(objUsuario);

                if (usuario.Perfil === 'GESTOR') {
                    window.localStorage.setItem('PerfilGestor', 1);
                }
                else {
                    window.localStorage.setItem('PerfilGestor', 0);
                }
            }
        }

        if (typeof usuario == 'undefined') {
            $scope.usuarioLogado = {
                Id: -1,
                Perfil: '',
                Logado: false,
                AcessoId: -1
            }

            LoginSet(null);
        } else {
            $scope.usuarioLogado = {
                Id: typeof usuario.Id != 'undefined' ? usuario.Id : -1,
                Perfil: typeof usuario.Perfil != 'undefined' ? usuario.Perfil : '',
                Logado: true,
                AcessoId: usuario.AcessoId
            }

            LoginSet(angular.copy($scope.usuarioLogado));
        }

        // Limpar listas
        $scope.ListaSolicitacoes = [];
        $scope.ListaUsuarios = [];
        $scope.Setores = [];

        Atualizarpaginas();
    }

    function Atualizarpaginas() {
        // Sad i know, but true.
        $scope.menuLogin = $scope.usuarioLogado.Perfil == '' ? "/" : "";
        $scope.menuGestor = $scope.usuarioLogado.Perfil == 'GESTOR' ? '/#!/gestor/' : '';
        $scope.menuSetor = $scope.usuarioLogado.Perfil == 'ADMINISTRADOR' ? '/#!/setor/' : '';
        $scope.menuUsuario = $scope.usuarioLogado.Perfil == 'ADMINISTRADOR' ? '/#!/usuario/' : '';
        $scope.menuColaborador = $scope.usuarioLogado.Perfil == 'COLABORADOR' || $scope.usuarioLogado.Perfil == 'GESTOR' ? '/#!/colaborador/' : '';
        $scope.menuSolicitarViagem = $scope.usuarioLogado.Perfil == 'COLABORADOR' || $scope.usuarioLogado.Perfil == 'GESTOR' ? '/#!/solicitarViagem/' : '';
        $scope.menuSair = $scope.usuarioLogado.Id >= 0 ? "/#!/?sair" : '';
    }

    /* Funções de pesquisa compartilhadas */
    $scope.BuscarSetores = function () {
        var acesso = {
            IdAcesso: $scope.usuarioLogado.AcessoId,
            UsuarioId: $scope.usuarioLogado.Id
        };

        $http({
            method: 'POST',
            url: caminhoApi + '/setor/listar',
            data: JSON.stringify(acesso),
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            }
        }).then(function (response) {
            if ($scope.ValidarAcesso(response)) {

                var data = response.data;

                if (data.Sucesso) {
                    $scope.Setores = data.Lista;
                } else {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de setores, tente novamente.');
                }
            }
        },
            function (response) {
                $scope.ValidarMsgErro(response,"Falha ao atualizar a lista de setores, tente novamente.");
            });
    }

    $scope.BuscarUsuarios = function () {

        var acesso = {
            IdAcesso: $scope.usuarioLogado.AcessoId,
            UsuarioId: $scope.usuarioLogado.Id
        };

        $http({
            method: 'POST',
            url: caminhoApi + '/usuario/listar',
            data: JSON.stringify(acesso),
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            }
        }).then(function (response) {
            if ($scope.ValidarAcesso(response)) {
                var data = response.data;

                if (data.Sucesso) {

                    for (var x = 0; x < data.Lista.length; x++) {
                        // usuário logado não pode ser removido.
                        if (data.Lista[x].CPF === window.localStorage.getItem('cpf')) {
                            data.Lista[x].PodeRemover = false;
                            break;
                        }
                    }

                    $scope.ListaUsuarios = data.Lista;
                } else {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de usuários, tente novamente.');
                }
            }
        },
            function (response) {
                $scope.ValidarMsgErro(response,"Falha ao atualizar a lista de usuários, tente novamente.");
            });
    }

    $scope.BuscarGestores = function () {

        var acesso = {
            IdAcesso: $scope.usuarioLogado.AcessoId,
            UsuarioId: $scope.usuarioLogado.Id
        };

        $http({
            method: 'POST',
            url: caminhoApi + '/usuario/listarGestores',
            data: JSON.stringify(acesso),
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            }
        }).then(function (response) {
            if ($scope.ValidarAcesso(response)) {
                var data = response.data;

                if (data.Sucesso) {
                    $scope.ListaGestores = data.Lista;
                } else {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de gestores, tente novamente.');
                }
            }
        },
            function (response) {
                $scope.ValidarMsgErro(response,"Falha ao atualizar a lista de gestores, tente novamente.");
            });
    }

    $scope.BuscarSolicitacoes = function () {

        SolicitacaoSet(null);

        var acesso = {
            IdAcesso: $scope.usuarioLogado.AcessoId,
            UsuarioId: $scope.usuarioLogado.Id
        };

        $http({
            method: 'POST',
            url: caminhoApi + '/solicitacao/listar',
            data: JSON.stringify(acesso),
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            }
        }).then(function (response) {
            if ($scope.ValidarAcesso(response)) {
                var data = response.data;

                if (data.Sucesso) {
                    for (var i = 0; i < data.Lista.length; i++) {
                        if (typeof data.Lista[i].Custos != 'undefined' && data.Lista[i].Custos != null) {
                            for (var x = 0; x < data.Lista[i].Custos.length; x++) {
                                data.Lista[i].Custos[x].Ordem = x;
                                data.Lista[i].Custos[x].NovaPrestacao = false;
                            }
                        }
                    }

                    $scope.ListaSolicitacoes = data.Lista;

                    if ($('.modal-backdrop.in').length > 0) {
                        $('.modal-backdrop.in').hide();
                        $('.modal-open').css('overflow', 'auto');
                    }
                } else {
                    $scope.ListaSolicitacoes = [];
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de solicitações, tente novamente.');

                    if ($('.modal-backdrop.in').length > 0) {
                        $('.modal-backdrop.in').hide();
                        $('.modal-open').css('overflow', 'auto');
                    }
                }
            }
        },
            function (response) {

                $scope.ValidarMsgErro(response,"Falha ao atualizar a lista de solicitações, tente novamente.");

                if ($('.modal-backdrop.in').length > 0) {
                    $('.modal-backdrop.in').hide();
                    $('.modal-open').css('overflow', 'auto');
                }
            });
    }
    /* FIM Funções de pesquisa compartilhadas */

    $scope.SalvarSolicitacao = function (solicitacao, status) {

        /* status define o status a ser setado para a solicitação de viagem
            0 = EmAberto,
            1 = AGUARDANDO_APROVACAO_VIAGEM,
            2 = (Aprovar)EM_ABERTO_CONTAS - FINALIZADO,
            3 = (Reprovar)RECUSADO_VIAGEM - RECUSADO_CONTAS,
            4 = AGUARDANDO_APROVACAO_CONTAS*/

        // Realiza a ação de salvar e enviar para aprovação.
        if (validarSolicitacao(solicitacao, status > 0)) {
            var solViagem = angular.copy(solicitacao);

            solViagem.DataIdaS = solViagem.DataIda;
            solViagem.DataIda = null;

            solViagem.DataVoltaS = solViagem.DataVolta;
            solViagem.DataVolta = null;

            for (var i = 0; i < solViagem.Custos.length; i++) {

                if (solViagem.Status === 3 && typeof solViagem.Custos[i].ValorPrestado != "number") {
                    var valor = solViagem.Custos[i].ValorPrestado.replace(",", ".");

                    solViagem.Custos[i].ValorPrestado = parseFloat(valor);
                }

                if (typeof solViagem.Custos[i].Id == 'undefined' || solViagem.Custos[i].Id < 0) {
                    solViagem.Custos[i].TipoI = solViagem.Custos[i].Tipo;
                }
            }


            solViagem.EnviarAprovacao = false;
            solViagem.Aprovado = false;
            solViagem.AprovadoCustos = false;
            solViagem.Reprovado = false;
            solViagem.ReprovadoCustos = false;
            solViagem.EnviarAprovacaoCustos = false;

            if (solViagem.Status == 0 && status == 2) {
                // Não salvou solicitação, mandou direto para aprovação.
                status = 1;
            }

            if (solViagem.Status == 3 && status == 2) {
                // Enviado para aprovação de custos
                status = 4;
            }

            switch (status) {
                case 0:
                    // Seta o usuário logado como o dono da solicitação.
                    solViagem.IdUsuario = $scope.usuarioLogado.Id;
                    break;
                case 1:
                    solViagem.EnviarAprovacao = true;
                    break;
                case 2:
                    if (solViagem.Status == 1) {
                        // EM_ABERTO_CONTAS
                        solViagem.Aprovado = true;
                    }
                    else {
                        // FINALIZADO
                        solViagem.AprovadoCustos = true;
                    }
                    break;
                case 3:
                    if (solViagem.Status == 1) {
                        // RECUSADO_VIAGEM
                        solViagem.Reprovado = true;
                    }
                    else {
                        // RECUSADO_CONTAS
                        solViagem.ReprovadoCustos = true;
                    }
                    break;
                case 4:
                    solViagem.EnviarAprovacaoCustos = true;
                    break;
            }

            solViagem.IdAcesso = $scope.usuarioLogado.AcessoId;
            solViagem.UsuarioId = $scope.usuarioLogado.Id;

            $http({
                method: 'POST',
                url: caminhoApi + '/solicitacao/salvar',
                headers: {
                    'Content-Type': "application/json; charset=utf-"
                },
                data: JSON.stringify(solViagem)
            }).then(function (response) {
                if ($scope.ValidarAcesso(response)) {
                    var data = response.data;

                    if (data.Sucesso) {

                        var msg = '';
                        switch (status) {
                            case 0:
                                msg = 'Solicitação de viagem e prestação de custos salvos com sucesso!';
                                break;
                            case 1:
                                msg = 'Solicitação de viagem enviada para aprovação!';
                                break;
                            case 2:
                                if (solViagem.Status == 1) {
                                    msg = 'Solicitação de viagem aprovada com sucesso!';
                                }
                                else {
                                    msg = 'Prestação de custos aprovados com sucesso!';
                                }
                                break;
                            case 3:
                                if (solViagem.Status == 1) {
                                    msg = 'Solicitação de viagem recusada com sucesso!';
                                }
                                else {
                                    msg = 'Prestação de custos recusados com sucesso!';
                                }
                                break;
                            case 4:
                                msg = 'Prestação de custos enviados para aprovação!';
                                break;
                        }

                        toastr.success(msg);
                        $scope.Redirecionar($scope.menuColaborador);
                    } else {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao realizar a ação, tente novamente.');
                    }
                }
            },
                function (response) {
                    $scope.ValidarMsgErro(response,"Falha ao salvar a solicitação, tente novamente.");
                });
        }
    }

    function validarSolicitacao(solicitacao, envioAprovacao) {
        if (typeof envioAprovacao == 'undefined' || envioAprovacao == null) {
            envioAprovacao = true;
        }

        var dataAtual = new Date();

        if (typeof solicitacao == 'undefined' || solicitacao == null) {
            toastr.error('Objeto de solicitação de viagem vazio.');
            return false;
        } else if (typeof solicitacao.UfOrigem == 'undefined' || solicitacao.UfOrigem == null || solicitacao.UfOrigem.length == 0) {
            toastr.error("Campo 'UF Origem' inválido.");
            return false;
        } else if (solicitacao.UfOrigem.length > 2) {
            toastr.error("Campo 'UF Origem' maior que 2 caracteres.");
            return false;
        } else if (typeof solicitacao.CidadeOrigem == 'undefined' || solicitacao.CidadeOrigem == null || solicitacao.CidadeOrigem.length == 0) {
            toastr.error("Campo 'Origem' inválido.");
            return false;
        } else if (solicitacao.CidadeOrigem.length > 255) {
            toastr.error("Campo 'Origem' maior que 255 caracteres.");
            return false;
        } else if (typeof solicitacao.UfDestino == 'undefined' || solicitacao.UfDestino == null || solicitacao.UfDestino.length == 0) {
            toastr.error("Campo 'UF Destino' inválido.");
            return false;
        } else if (solicitacao.UfDestino.length > 2) {
            toastr.error("Campo 'UF Destino' maior que 2 caracteres.");
            return false;
        } else if (typeof solicitacao.CidadeDestino == 'undefined' || solicitacao.CidadeDestino == null || solicitacao.CidadeDestino.length == 0) {
            toastr.error("Campo 'Destino' inválido.");
            return false;
        } else if (solicitacao.CidadeDestino.length > 255) {
            toastr.error("Campo 'Destino' maior que 255 caracteres.");
            return false;
        } else if (typeof solicitacao.DataIda == 'undefined' || solicitacao.DataIda == null || solicitacao.DataIda.length == 0) {
            toastr.error("Campo 'Data Ida' inválido.");
            return false;
        }
        else if (solicitacao.Status == 0 && solicitacao.DataIda.getTime() < dataAtual.setHours(0, 0, 0, 0)) {
            toastr.error("Campo 'Data Ida' deve ser maior ou igual a data de hoje.");
            return false;
        } else if (typeof solicitacao.DataVolta == 'undefined' || solicitacao.DataVolta == null || solicitacao.DataVolta.length == 0) {
            toastr.error("Campo 'Data Volta' inválido.");
            return false;
        } else if (typeof solicitacao.Motivo == 'undefined' || solicitacao.Motivo == null || solicitacao.Motivo.length == 0 || solicitacao.Motivo == "0") {
            toastr.error("Campo 'Motivo' inválido.");
            return false;
        } else if (solicitacao.Motivo.length > 255) {
            toastr.error("Campo 'Motivo' maior que 255 caracteres.");
            return false;
        } else if (typeof solicitacao.Observacao != 'undefined' && solicitacao.Observacao != null && solicitacao.Observacao.length > 255) {
            toastr.error("Campo 'Observação' maior que 255 caracteres.");
            return false;
        } else if (envioAprovacao) {
            if (typeof solicitacao.Custos == 'undefined' || solicitacao.Custos == null || solicitacao.Custos.length == 0) {
                toastr.error("Favor informar prestação de custos da viagem.");
                return false;
            }

            for (var x = 0; x < solicitacao.Custos.length; x++) {
                if (
                    (solicitacao.Custos[x].ValorSolicitado < 1 && solicitacao.Status == 0) ||
                    (solicitacao.Status === 3 &&
                        (typeof solicitacao.Custos[x].ValorPrestado == 'undefined' ||
                            solicitacao.Custos[x].ValorPrestado == null ||
                            solicitacao.Custos[x].ValorPrestado.length == 0))
                ) {
                    toastr.error("Um ou mais valores de prestação de custos está(ão) com o valor abaixo de R$ 1,00 verifique.");
                    return false;
                }
            }

        }

        return true;
    }

    function Limpar() {

        // Salva variável global que indica que está carregando a página de primeiro acesso e não navegação de páginas.
        window.localStorage.setItem('carregandoMain', '1');

        $scope.LimparUsuarioLogado();

        $scope.ListaUsuarios = [];
        $scope.Setores = [];
        $scope.ListaGestores = [];
        $scope.ListaSolicitacoes = [];

        //window.localStorage.setItem('PerfilGestor', 0);
        $scope.ufLista = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];
        window.localStorage.setItem('Solicitacao', null);
    }

    Limpar();
});

projetoIntegrador.controller('loginController', function ($scope, $window, $routeParams, toastr, $http) {

    $scope.LimparLogin = function (limpar) {

        // Valida login salvo com a opção 'lembrar selecionada'.
        var cpf = window.localStorage.getItem('cpf');
        var senha = window.localStorage.getItem('senha');

        if (cpf != null && typeof cpf != 'undefined' && (limpar == null || limpar == false)) {
            $scope.login = {
                cpf: cpf,
                senha: senha,
                lembrar: true
            }
        } else {
            $scope.login = {
                cpf: '',
                senha: '',
                lembrar: false
            }
        }
    }

    $scope.RealizarLogin = function (login) {

        $scope.UsuarioNome = '';

        if (ValidarLogin(login)) {
            var model = {
                CPF: login.cpf,
                Senha: login.senha
            };

            $http({
                method: 'POST',
                url: caminhoApi + '/usuario/logar',
                headers: {
                    'Content-Type': "application/json; charset=utf-"
                },
                data: JSON.stringify(model)
            }).then(function (response) {
                    var data = response.data;

                    if (data.Sucesso) {

                        if (login.lembrar) {
                            window.localStorage.setItem('cpf', login.cpf);
                            window.localStorage.setItem('senha', login.senha);
                            window.localStorage.setItem('usuarioNome', data.Nome);
                        } else {
                            window.localStorage.removeItem('cpf');
                            window.localStorage.removeItem('senha');
                        }

                        $scope.LimparUsuarioLogado(data);
                        window.localStorage.setItem('PerfilGestor', 0);

                        switch (data.Perfil) {

                            // Colaborador
                            case 'COLABORADOR':
                                $scope.Redirecionar($scope.menuColaborador);
                                break;

                            // Gestor
                            case 'GESTOR':
                                window.localStorage.setItem('PerfilGestor', 1);
                                $scope.Redirecionar($scope.menuGestor);
                                break;

                            // Admin
                            default:
                            case 'ADMINISTRADOR':
                                $scope.Redirecionar($scope.menuUsuario);
                                break;
                        }

                        toastr.success('Login efetuado', 'Sucesso!');

                    } else {
                        toastr.error(data.Mensagem);
                    }
            }, function (response) {
                $scope.ValidarMsgErro(response,"Falha ao realizar o login, tente novamente.");
            });
        }
    }

    function ValidarLogin(login) {
        if (typeof login == 'undefined' || login == null) {
            toastr.error('Objeto de login inválido');
            return false;
        }

        if (typeof login.cpf == 'undefined' || login.cpf == null || login.cpf.length == 0) {
            toastr.error('CPF informado inválido');
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
    if ($scope.login.cpf != '' && typeof $routeParams.sair == 'undefined' && $scope.usuarioLogado.Logado) {
        $scope.RealizarLogin($scope.login, null);
    } else if ($routeParams.sair != 'undefined') {
        $scope.LimparUsuarioLogado();
    }

    $(document).ready(function () {
        $('.cpf').mask('000.000.000-00', {
            reverse: true
        });
    });
});

projetoIntegrador.controller('solicitacaoController', function ($scope, $window, $http, toastr, $timeout, $rootScope) {
    if ($scope.ValidarLogin()) {

        /* Variáveis */
        $scope.categorias = [{
            text: 'Passagem',
            value: 0
        }, {
            text: 'Hospedagem',
            value: 1
        }, {
            text: 'Alimentação',
            value: 2
        }, {
            text: 'Transporte',
            value: 3
        }, {
            text: 'Outro',
            value: 4
        }];

        /* Métodos */
        $scope.reprovarSolicitacao = function (model) {
            $('#modalReprovar').modal('show');
        }

        $scope.removerSolicitacao = function (model) {
            $('#modalRemover').modal('show');
        }

        $scope.enviarAprovacao = function (model) {
            $('#modalEnviarAprovacao').modal('show');
        }

        $scope.confirmarReprovarSolicitacaoViagem = function () {

            if (typeof $scope.Solicitacao.Justificativa == 'undefined' || $scope.Solicitacao.Justificativa == null || $scope.Solicitacao.Justificativa.length <= 0) {
                toastr.error('Favor informar uma justificativa.');
            }
            else {
                $('#modalReprovar').modal('hide');
                $scope.enviarSalvar(3);
            }
        }

        $scope.enviarSalvar = function (status) {
            $scope.SalvarSolicitacao($scope.Solicitacao, status);
        }


        $scope.adicionarPrestacaoConta = function (prestacao) {

            if (typeof prestacao == 'undefined' || prestacao == null) {
                toastr.error('Favor preencher os campos de pestação de conta.');
            } else if (typeof prestacao.Tipo == 'undefined' || prestacao.Tipo == null) {
                toastr.error('Categoria informada é inválida.');
            } else if (typeof prestacao.Quantidade == 'undefined' || prestacao.Quantidade == null) {
                toastr.error('Quantidade informada é inválida.');
            } else if (prestacao.Quantidade > 10) {
                toastr.error('Quantidade não pode passar de 10.');
            } else if (typeof prestacao.Valor == 'undefined' || prestacao.Valor == null) {
                toastr.error('Valor informado é inválido.');
            } else {
                var obj = angular.copy(prestacao);

                var valor = obj.Valor.replace(".", "");
                valor = valor.replace(",", ".");

                if ($scope.Solicitacao.Status == 0) {
                    obj.ValorSolicitado = valor;

                    // Não é nova prestação pois ainda está provendo os custos que serão realizados.
                    obj.NovaPrestacao = false;
                }
                else {
                    obj.ValorSolicitado = 0;
                    obj.ValorPrestado = valor;

                    // Como é prestação de custos e está adicionando novos custos.
                    obj.NovaPrestacao = true;
                }

                obj.Id = -1;
                obj.TipoI = obj.Tipo;

                if ($scope.Solicitacao.Custos.length > 0) {
                    obj.Ordem = $scope.Solicitacao.Custos[$scope.Solicitacao.Custos.length - 1].Ordem + 1;
                } else {
                    obj.Ordem = $scope.Solicitacao.Custos.length;
                }

                $scope.Solicitacao.Custos.push(obj);

                $scope.recuperarTotalPrestacaoContas();
            }
        }

        $scope.recupearDescricaoCategoria = function (value) {
            var obj = $scope.categorias[Object.keys($scope.categorias).find(x => $scope.categorias[x].value === value)];
            return obj.text;
        }

        $scope.recuperarTotalPrestacaoContas = function () {
            var totalS = 0;
            var totalP = 0;

            $scope.Solicitacao.Custos.forEach(function (element) {
                totalS = totalS + (parseInt(element.Quantidade) * parseFloat(element.ValorSolicitado));

                try {
                    var valorPrestado = angular.copy(element.ValorPrestado);

                    if (typeof (valorPrestado) === 'string') {
                        if (valorPrestado.indexOf(".") > 0 && valorPrestado.indexOf(",") > 0) {
                            valorPrestado = valorPrestado.replace(".", "");
                        }

                        valorPrestado = valorPrestado.replace(",", ".");
                    }

                    totalP = totalP + (parseInt(element.Quantidade) * parseFloat(valorPrestado));
                }
                catch (ex) {
                    totalP = totalP + 0;
                }
            }, this);

            // Custo total Solicitado
            $scope.CustoTotalS = totalS.toFixed(2);

            // Custo total Prestado
            $scope.CustoTotalP = totalP.toFixed(2);

            // Custo total resultado solicitado - prestado
            $scope.CustoResultado = (totalS - totalP);

            if ($scope.CustoResultado === 0) {
                $scope.ResultadoCor = "#000";
            }
            else {
                $scope.ResultadoCor = $scope.CustoResultado < 0 ? "#e80000" : "#00c33e";
            }

            $scope.CustoResultado = $scope.CustoResultado.toFixed(2);

            $timeout(function () {
                // Solicitado / Prestado / Resultado
                $('#txtValorTotalS, #txtValorTotalP, #txtValorResultado').mask("#.###.###.##0,00", {
                    reverse: true
                });
            }, 1);
        }

        $scope.confirmarRemoverPrestacaoConta = function () {

            $('#modalRemoverConta').modal('hide');

            for (var i = $scope.Solicitacao.Custos.length - 1; i >= 0; i--) {
                if ($scope.Solicitacao.Custos[i].Ordem == $scope.ordemPrestacaoContaRemover) {
                    $scope.Solicitacao.Custos.splice(i, 1);
                    break;
                }
            }

            $scope.recuperarTotalPrestacaoContas();
        }

        $scope.removerPrestacaoConta = function (ordem) {
            $scope.ordemPrestacaoContaRemover = ordem;
            $('#modalRemoverConta').modal('show');
        }

        $scope.confirmarRemoverSolicitacao = function () {

            var parametros = {
                IdAcesso: $scope.usuarioLogado.AcessoId,
                UsuarioId: $scope.usuarioLogado.Id,
                id: $scope.Solicitacao.Id.toString()
            };

            $http({
                method: 'POST',
                url: caminhoApi + '/solicitacao/remover',
                data: JSON.stringify(parametros),
                headers: {
                    'Content-Type': "application/json; charset=utf-8"
                }
            }).then(function (response) {
                if ($scope.ValidarAcesso(response)) {
                    var data = response.data;

                    if (data.Sucesso) {
                        toastr.success('Solicitação de viagem removida com sucesso', 'Sucesso!');

                        $('#modalRemover').modal('hide');
                        $scope.Redirecionar($scope.menuColaborador);
                    } else {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao remover a solicitação de viagem, tente novamente.');
                    }
                }
            },
                function (response) {
                    $scope.ValidarMsgErro(response,"Falha ao remover a solicitação de viagem, tente novamente.");
                });
        }

        $(document).ready(function () {
            $('#txtValor, .valorPrestado').mask("#.##0,00", {
                reverse: true
            });
            $('#txtQuantidade').mask("00", {
                reverse: true
            });
        });

        function Limpar() {
            $scope.Solicitacao = angular.copy(SolicitacaoGet());
            $scope.recuperarTotalPrestacaoContas();

            $scope.EditarViagem = false;
            $scope.EditarContas = false;
            $scope.PerfilGestor = window.localStorage.getItem('PerfilGestor') == 1;

            switch ($scope.Solicitacao.Status) {
                case 3:
                    if (!$scope.PerfilGestor) {
                        // Somente colaborador
                        $scope.EditarContas = true;
                    }

                    // Move o scrol para baixo para a parte de prestação de contas
                    $('html, body').animate({ scrollTop: $('#tituloPrestacaoContas').offset().top - 50 }, 'swing');

                    break;
                default:
                case 0:
                    if (typeof $scope.Solicitacao.Status == 'undefined' || $scope.Solicitacao.Status == null || $scope.Solicitacao.Status == 0) {
                        $scope.EditarViagem = true;
                        $scope.EditarContas = true;
                    }
                    break;
            }
        }

        Limpar();
    }
});

projetoIntegrador.controller('colaboradorController', function ($scope, $window, $http, toastr, $rootScope) {

    if ($scope.ValidarLogin()) {

        /* Variáveis */
        $scope.status = [{
            text: 'Em Aberto',
            value: 0
        }, {
            text: 'Aguardando Aprovação de Viagem',
            value: 1
        }, {
            text: 'Solicitação Recusada',
            value: 2
        }, {
            text: 'Em Aberto Prestação de Contas',
            value: 3
        }, {
            text: 'Aguardando Aprovação de Contas',
            value: 4
        }, {
            text: 'Prestação Recusada',
            value: 5
        }, {
            text: 'Finalizado',
            value: 6
        }];

        /* Métodos */
        $scope.AbrirSolicitacao = function (model) {
            SolicitacaoSet(angular.copy(model));
            $scope.Redirecionar($scope.menuSolicitarViagem);
        }

        $scope.removerSolicitacao = function (model) {
            SolicitacaoSet(angular.copy(model));
            $('#modalRemover').modal('show');
        }

        $scope.recupearDescricaoStatus = function (value) {
            try {
                var obj = $scope.status[Object.keys($scope.status).find(x => $scope.status[x].value === value)];
                return obj.text;
            } catch (ex) {
                toastr.error('Falha ao recuperar o status da solicitação');
                return "";
            }
        }

        $scope.confirmarRemoverSolicitacao = function () {
            var solicitacaoObj = SolicitacaoGet();

            var parametros = {
                IdAcesso: $scope.usuarioLogado.AcessoId,
                UsuarioId: $scope.usuarioLogado.Id,
                id: solicitacaoObj.Id.toString()
            };

            $http({
                method: 'POST',
                url: caminhoApi + '/solicitacao/remover',
                data: JSON.stringify(parametros),
                headers: {
                    'Content-Type': "application/json; charset=utf-8"
                }
            }).then(function (response) {
                if ($scope.ValidarAcesso(response)) {
                    var data = response.data;

                    if (data.Sucesso) {
                        toastr.success('Solicitação de viagem removida com sucesso', 'Sucesso!');

                        $('#modalRemover').modal('hide');
                        $scope.BuscarSolicitacoes();
                    } else {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao remover a solicitação de viagem, tente novamente.');
                    }
                }
            },
                function (response) {
                    $scope.ValidarMsgErro(response,"Falha ao remover a solicitação de viagem, tente novamente.");
                });
        }

        $scope.LimparSolicitacao = function (model) {
            if (model == null) {
                SolicitacaoSet({
                    Id: -1,
                    IdUsuario: $scope.usuarioLogado.Id,
                    CidadeOrigem: '',
                    UfOrigem: '',
                    CidadeDestino: '',
                    UfDestino: '',
                    DataIda: new Date(),
                    DataVolta: new Date(),
                    Motivo: 0,
                    Observacao: '',
                    Status: 0, // Status em aberto
                    Justificativa: '',
                    Custos: []
                });
            } else {
                var solicitacao = angular.copy(model);
                solicitacao.DataIda = new Date(parseInt(solicitacao.DataIda));
                solicitacao.DataVolta = new Date(parseInt(solicitacao.DataVolta));
                SolicitacaoSet(solicitacao);
            }
        }

        $scope.reprovarSolicitacaoViagem = function () {
            $scope.Solicitacao = angular.copy(SolicitacaoGet());
            $('#modalReprovar').modal('show');
        }

        $scope.confirmarReprovarSolicitacaoViagem = function () {

            if (typeof $scope.Solicitacao.Justificativa == 'undefined' || $scope.Solicitacao.Justificativa == null || $scope.Solicitacao.Justificativa.length <= 0) {
                toastr.error('Favor informar uma justificativa.');
            }
            else {
                $('#modalReprovar').modal('hide');
                $scope.SalvarSolicitacao($scope.Solicitacao, 3);
            }
        }

        $scope.aprovarSolicitacaoViagem = function () {
            $('#modalAprovar').modal('show');
        }

        $scope.confirmarAprovarSolicitacaoViagem = function () {
            $scope.Solicitacao = angular.copy(SolicitacaoGet());
            $('#modalAprovar').modal('hide');

            $scope.SalvarSolicitacao($scope.Solicitacao, 2);
        }

        function Limpar() {
            $scope.PerfilGestor = window.localStorage.getItem('PerfilGestor') == 1;
            $scope.BuscarSolicitacoes();
        }

        Limpar();
    }
});

projetoIntegrador.controller('setorController', function ($scope, $http, toastr) {

    if ($scope.ValidarLogin()) {

        $scope.AlterarItem = function (model) {
            $scope.Setor = angular.copy(model);

            if ($scope.ListaGestores.length == 0) {
                $scope.BuscarGestores();
            }

            $('#modalNovo').modal('show');
        }

        $scope.RemoverItem = function (model) {
            $scope.Setor = angular.copy(model);
            $('#modalRemover').modal('show');
        }

        $scope.ConfirmarRemover = function (id) {
            var model = {
                Id: id,
                IdAcesso: $scope.usuarioLogado.AcessoId,
                UsuarioId: $scope.usuarioLogado.Id
            }

            $http({
                method: 'POST',
                url: caminhoApi + '/setor/remover',
                headers: {
                    'Content-Type': "application/json; charset=utf-"
                },
                data: JSON.stringify(model)
            }).then(function (response) {
                if ($scope.ValidarAcesso(response)) {
                    var data = response.data;

                    if (data.Sucesso) {
                        Limpar(true);
                        $('#modalRemover').modal("hide");
                        toastr.success('Setor removido!', 'Sucesso!');
                    } else {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao remover o setor, tente novamente.');
                    }
                }
            },
                function (response) {
                    $scope.ValidarMsgErro(response,"Falha ao remover o setor, tente novamente.");
                });
        }

        $scope.SalvarSetor = function (model) {
            if (ValidarSetor(model)) {

                model.IdAcesso = $scope.usuarioLogado.AcessoId;
                model.UsuarioId = $scope.usuarioLogado.Id;

                $http({
                    method: 'POST',
                    url: caminhoApi + '/setor/manipular',
                    headers: {
                        'Content-Type': "application/json; charset=utf-"
                    },
                    data: JSON.stringify(model)
                }).then(function (response) {
                    if ($scope.ValidarAcesso(response)) {
                        var data = response.data;

                        if (data.Sucesso) {
                            Limpar(true);
                            $('#modalNovo').modal("hide");
                            toastr.success('Setor salvo!', 'Sucesso!');
                        } else {
                            toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao salvar o setor, tente novamente.');
                        }
                    }
                },
                    function (response) {
                        $scope.ValidarMsgErro(response,"Falha ao salvar o setor, tente novamente.");
                    });
            }
        }

        function ValidarSetor(model) {
            if (model.Nome == null || model.Nome.length < 3) {
                toastr.error("O nome deve conter no mínimo 3 caracteres", "Nome inválido");
                return false;
            }

            if (model.Nome != null && model.Nome.length > 50) {
                toastr.error("O nome deve conter no máximo 50 caracteres", "Nome inválido");
                return false;
            }

            if (model.IdGestor == null || typeof model.IdGestor == 'undefined' || model.IdGestor < 0) {
                toastr.error("O gestor selecionado é inválido", "Gestor inválido");
                return false;
            }


            return true;
        }

        function Limpar(atualizar) {
            // Carrega a lista de setores cadastrados no sistema.
            if ($scope.Setores.length == 0 || atualizar) {
                $scope.BuscarSetores();
            }
        }

        $scope.LimparSetor = function () {
            $scope.Setor = {
                Nome: '',
                Gestor: '',
                IdGestor: -1,
                Id: -1
            };
        }

        Limpar();
    }
});

projetoIntegrador.controller('usuarioController', function ($scope, $http, toastr) {

    if ($scope.ValidarLogin()) {

        $scope.AlterarItem = function (model) {
            $scope.Usuario = angular.copy(model);

            if ($scope.Setores.length == 0) {
                $scope.BuscarSetores();
            }

            $('#modalNovo').modal('show');
        }

        $scope.RemoverItem = function (model) {
            $scope.Usuario = angular.copy(model);
            $('#modalRemover').modal('show');
        }

        $scope.ConfirmarRemover = function (id) {

            var model = {
                Id: id,
                IdAcesso: $scope.usuarioLogado.AcessoId,
                UsuarioId: $scope.usuarioLogado.Id
            }

            $http({
                method: 'POST',
                url: caminhoApi + '/usuario/remover',
                headers: {
                    'Content-Type': "application/json; charset=utf-"
                },
                data: JSON.stringify(model)
            }).then(function (response) {
                if ($scope.ValidarAcesso(response)) {
                    var data = response.data;

                    if (data.Sucesso) {
                        Limpar(true);
                        $('#modalRemover').modal("hide");
                        toastr.success('Usuário removido!', 'Sucesso!');
                    } else {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao remover o usuário, tente novamente.');
                    }
                }
            },
                function (response) {
                    $scope.ValidarMsgErro(response,"Falha ao remover o usuário, tente novamente.");
                });
        }

        $scope.SalvarUsuario = function (model) {
            if (ValidarUsuario(model)) {

                if (model.Perfil === 'GESTOR' || model.Perfil === 'ADMINISTRADOR') {
                    model.IdSetor = -1;
                }

                model.IdAcesso = $scope.usuarioLogado.AcessoId;
                model.UsuarioId = $scope.usuarioLogado.Id;

                $http({
                    method: 'POST',
                    url: caminhoApi + '/usuario/manipular',
                    headers: {
                        'Content-Type': "application/json; charset=utf-"
                    },
                    data: JSON.stringify(model)
                }).then(function (response) {
                    if ($scope.ValidarAcesso(response)) {
                        var data = response.data;

                        if (data.Sucesso) {
                            Limpar(true);
                            $('#modalNovo').modal("hide");
                            toastr.success('Usuário salvo!', 'Sucesso!');
                        } else {
                            toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao salvar o usuário, tente novamente.');
                        }
                    }
                },
                    function (response) {
                        $scope.ValidarMsgErro(response,"Falha ao salvar o usuário, tente novamente.");
                    });
            }
        }

        function ValidarUsuario(model) {
            if (model.Nome == null || model.Nome.length < 3) {
                toastr.error("O nome deve conter no mínimo 3 caracteres", "Nome inválido");
                return false;
            }

            if (model.Nome != null && model.Nome.length > 50) {
                toastr.error("O nome deve conter no máximo 50 caracteres", "Nome inválido");
                return false;
            }

            if (model.Email == null || model.Email.length < 5) {
                toastr.error("O email deve conter no mínimo 5 caracteres", "Email inválido");
                return false;
            }

            if (model.Email != null && model.Email.length > 50) {
                toastr.error("O email deve conter no máximo 50 caracteres", "Email inválido");
                return false;
            }

            var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!regex.test(model.Email)) {
                toastr.error("O email informado está fora dos padrões.", "Email inválido");
                return false;
            }

            if (model.Senha == null || model.Senha.length < 5) {
                toastr.error("A senha deve conter no mínimo 5 caracteres", "Senha inválida");
                return false;
            }

            if (model.Senha != null && model.Senha.length > 50) {
                toastr.error("A senha deve conter no máximo 50 caracteres", "Senha inválida");
                return false;
            }

            if (model.Perfil == null || typeof model.Perfil == 'undefined') {
                toastr.error("O perfil selecionado é inválido", "Perfil inválido");
                return false;
            }

            if (model.Perfil === 'COLABORADOR' && (model.IdSetor == null || model.IdSetor < 0)) {
                toastr.error("O setor selecionado é inválido", "Setor inválido");
                return false;
            }

            var cpfRegex = /^(\d{3}\.\d{3}\.\d{3}-\d{2})|(^\d{3}\d{3}\d{3}\d{2})$/;
            if (model.CPF == null || model.CPF.length != 14) {
                toastr.error("O CPF deve conter 14 caracteres", "CPF inválida");
                return false;
            } else if (!cpfRegex.test(model.CPF)) {
                toastr.error("O CPF informado é inválido", "CPF inválida");
                return false;
            }

            return true;
        }

        $scope.LimparUsuario = function () {
            $scope.Usuario = {
                Nome: '',
                Email: '',
                Perfil: 'COLABORADOR',
                Senha: '',
                IdSetor: -1,
                Id: -1,
                CPF: ''
            };
        }

        function Limpar(atualizar) {
            $scope.LimparUsuario();

            // Carrega a lista de usuários cadastrados no sistema.
            if ($scope.ListaUsuarios.length == 0 || atualizar) {
                $scope.BuscarUsuarios();
            }
        }

        // Inicializa os dados do controller.
        Limpar();

        $(document).ready(function () {
            $('.cpf').mask('000.000.000-00', {
                reverse: true
            });
        });
    }
});

projetoIntegrador.controller('errorController', function ($scope, toastr) {



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