var caminhoApi = "http://104.41.50.175:8080/ProjetoIntegradorAPI/rest";
//var caminhoApi = "http://localhost:8080/ProjetoIntegradorAPI/rest";

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
projetoIntegrador.controller('mainController', function ($scope, $window, $http, toastr) {

    $scope.ValidarLogin = function () {
        if ($scope.usuarioLogado == null ||
            typeof $scope.usuarioLogado == 'undefined' ||
            $scope.usuarioLogado.Id < 0) {
            $window.location.href = $scope.menuLogin;

            return false;
        }

        return true;
    }

    $scope.LimparUsuarioLogado = function (usuario) {
        if (typeof usuario == 'undefined') {
            $scope.usuarioLogado = {
                Id: -1,
                Perfil: '',
                Logado: false
            }
        } else {
            $scope.usuarioLogado = {
                Id: typeof usuario.Id != 'undefined' ? usuario.Id : -1,
                Perfil: typeof usuario.Perfil != 'undefined' ? usuario.Perfil : '',
                Logado: true
            }
        }

        Atualizarpaginas();
    }

    function Atualizarpaginas() {
        // Sad i know, but true.
        $scope.menuLogin = $scope.usuarioLogado.Perfil == '' ? "/" : "";
        $scope.menuGestor = $scope.usuarioLogado.Perfil == 'GESTOR' ? '/#!/gestor/' : '';
        $scope.menuSetor = $scope.usuarioLogado.Perfil == 'ADMINISTRADOR' ? '/#!/setor/' : '';
        $scope.menuUsuario = $scope.usuarioLogado.Perfil == 'ADMINISTRADOR' ? '/#!/usuario/' : '';
        $scope.menuColaborador = $scope.usuarioLogado.Perfil == 'COLABORADOR' ? '/#!/colaborador/' : '';
        $scope.menuSolicitarViagem = $scope.usuarioLogado.Perfil == 'COLABORADOR' ? '/#!/solicitarViagem/' : '';
        $scope.menuSair = $scope.usuarioLogado.Id >= 0 ? "/#!/?sair" : '';
    }

    /* Funções de pesquisa compartilhadas */
    $scope.BuscarSetores = function () {
        $http({
            method: 'POST',
            url: caminhoApi + '/setor/listar',
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            }
        }).then(function (response) {
                var data = response.data;

                if (data.Sucesso) {
                    $scope.Setores = data.Lista;
                } else {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de setores, tente novamente.');
                }
            },
            function (response) {
                toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de setores, tente novamente.');
            });
    }

    $scope.BuscarUsuarios = function () {
        $http({
            method: 'POST',
            url: caminhoApi + '/usuario/listar',
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            }
        }).then(function (response) {
                var data = response.data;

                if (data.Sucesso) {
                    $scope.ListaUsuarios = data.Lista;
                } else {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de usuários, tente novamente.');
                }
            },
            function (response) {
                toastr.error(response.data.Mensagem.length > 0 ? response.data.Mensagem : 'Falha ao atualizar a lista de usuários, tente novamente.');
            });
    }

    $scope.BuscarGestores = function () {
        $http({
            method: 'POST',
            url: caminhoApi + '/usuario/listarGestores',
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            }
        }).then(function (response) {
                var data = response.data;

                if (data.Sucesso) {
                    $scope.ListaGestores = data.Lista;
                } else {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de gestores, tente novamente.');
                }
            },
            function (response) {
                toastr.error(response.data.Mensagem.length > 0 ? response.data.Mensagem : 'Falha ao atualizar a lista de gestores, tente novamente.');
            });
    }

    $scope.BuscarSolicitacoes = function () {

        $scope.Solicitacao = null;

        $http({
            method: 'POST',
            url: caminhoApi + '/solicitacao/listar',
            data: JSON.stringify($scope.usuarioLogado.Id),
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            }
        }).then(function (response) {
                var data = response.data;

                console.log(data);

                if (data.Sucesso) {
                    $scope.ListaSolicitacoes = data.Lista;
                } else {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao atualizar a lista de solicitações, tente novamente.');
                }
            },
            function (response) {
                toastr.error(response.data.Mensagem.length > 0 ? response.data.Mensagem : 'Falha ao atualizar a lista de solicitações, tente novamente.');
            });
    }
    /* FIM Funções de pesquisa compartilhadas */

    /* Outras funções compartilhadas */
    $scope.LimparSolicitacao = function()
    {
        $scope.Solicitacao = {
            Id: -1,
            IdUsuario: $scope.usuarioLogado.Id,
            CidadeOrigem: '',
            UfOrigem: '',
            CidadeDestino: '',
            UfDestino: '',
            DataIda: '',
            DataVolta: '',
            Motivo: 0,
            Observacao: '',
            Status: 0, // Status em aberto
            Justificativa: '',
            Custos: []
        };
    }
    /* FIM Outras funções compartilhadas */

    function Limpar() {
        $scope.LimparUsuarioLogado();

        $scope.ListaUsuarios = [];
        $scope.Setores = [];
        $scope.ListaGestores = [];
        $scope.ListaSolicitacoes = [];

        $scope.ufLista = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
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

    $scope.RealizarLogin = function (login, e) {
        if (event.which == 13 || e == null) {
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
                        } else {
                            window.localStorage.removeItem('cpf');
                            window.localStorage.removeItem('senha');
                        }

                        $scope.LimparUsuarioLogado(data);

                        switch (data.Perfil) {

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

                }, function (response) {
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

projetoIntegrador.controller('colaboradorController', function ($scope, $window, $http, toastr) {

    if ($scope.ValidarLogin()) {

        $scope.AlterarItem = function(model) {
            $scope.Solicitacao = angular.copy(model);

            $window.location.href = $scope.menuSolicitarViagem;
        }

        $scope.AbrirSolicitacao = function (model) {
            $scope.Solicitacao = angular.copy(model);

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

        $scope.removerItem = function (model) {
            $scope.Solicitacao = angular.copy(model);
            $('#modalRemover').modal('show');
        }

        $scope.reprovarItem = function (model) {
            $scope.Solicitacao = angular.copy(model);
            $('#modalReprovar').modal('show');
        }

        $scope.enviarAprovacao = function (model) {
            $scope.Solicitacao = angular.copy(model);
            $('#modalEnviarAprovacao').modal('show');
        }

        $scope.adicionarPrestacaoConta = function (prestacao) {

            if (typeof prestacao == 'undefined' || prestacao == null)
            {
                toastr.error('Favor preencher os campos de pestação de conta.');
            }
            else if (typeof prestacao.Tipo == 'undefined' || prestacao.Tipo == null)
            {
                toastr.error('Categoria informada é inválida.');
            }
            else if (typeof prestacao.Quantidade == 'undefined' || prestacao.Quantidade == null)
            {
                toastr.error('Quantidade informada é inválida.');
            }
            else if (prestacao.Quantidade > 10)
            {
                toastr.error('Quantidade não pode passar de 10.');
            }
            else if (typeof prestacao.ValorSolicitado == 'undefined' || prestacao.ValorSolicitado == null)
            {
                toastr.error('Valor informado é inválido.');
            }
            else
            {
                var obj = angular.copy(prestacao);
                obj.ValorSolicitado = obj.ValorSolicitado.replace(".", "");
                obj.ValorSolicitado = obj.ValorSolicitado.replace(",", ".");
    
                obj.id = $scope.Solicitacao.Custos.length;
    
                $scope.Solicitacao.Custos.push(obj);
    
                recuperarTotalPrestacao();
            }           
        }

        $scope.recupearDescricao = function (value) {
            var obj = $scope.categorias[Object.keys($scope.categorias).find(x => $scope.categorias[x].value === value)];
            return obj.text;
        }

        $scope.recupearDescricaoStatus = function (value) {
            try{
                var obj = $scope.status[Object.keys($scope.status).find(x => $scope.status[x].value === value)];
                return obj.text;
            }
            catch(ex)
            {
                toastr.error('Falha ao recuperar o status da solicitação');
                return "";
            }
        }

        function recuperarTotalPrestacao() {
            var total = 0;

            $scope.Solicitacao.Custos.forEach(function (element) {
                total = total + (parseInt(element.Quantidade) * parseFloat(element.ValorSolicitado));
            }, this);

            $scope.CustoTotal = total.toFixed(2);

            setTimeout(function ()
            {
                $('#txtValorTotal').mask("#.###.###.##0,00", {reverse: true});
            }, 500);
        }

        $scope.removerPrestacao = function (id) {
            for (var i = $scope.Solicitacao.Custos.length - 1; i >= 0; i--) {
                if ($scope.Solicitacao.Custos[i].id == id) {
                    $scope.Solicitacao.Custos.splice(i, 1);
                    break;
                }
            }

            recuperarTotalPrestacao();
        }

        $scope.salvarItem = function(solicitacao, envioAprovacao)
        {
            // Realiza a ação de salvar e enviar para aprovação.
            if (validarSolicitacao(solicitacao, envioAprovacao))
            {
                solicitacao.DataIdaS = solicitacao.DataIda;
                solicitacao.DataIda = null;

                solicitacao.DataVoltaS = solicitacao.DataVolta;
                solicitacao.DataVolta = null;

                // Seta o usuário logado como o dono da solicitação.
                solicitacao.IdUsuario = $scope.usuarioLogado.Id;

                $http({
                    method: 'POST',
                    url: caminhoApi + '/solicitacao/salvar',
                    headers: {
                        'Content-Type': "application/json; charset=utf-"
                    },
                    data: JSON.stringify(solicitacao)
                }).then(function (response) {
                        var data = response.data;
    
                        console.log(data);

                        if (data.Sucesso) {
                            


                            toastr.success('Solicitação de viagem e prestação de custos' + envioAprovacao ? ' enviados para aprovação.' : ' salvos.' , 'Sucesso!');
                        } else {
                            toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao' + (envioAprovacao ? ' enviar para aprovação' : ' salvar') + ', tente novamente.');
                        }
                    },
                    function (response) {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao' + (envioAprovacao ? ' enviar para aprovação' : ' salvar') + ', tente novamente.');
                    });
            }
        }

        function Limpar()
        {
            if (typeof $scope.Solicitacao == 'undefined' || $scope.Solicitacao == null)
            {
                $scope.BuscarSolicitacoes();
            }
        }

        function validarSolicitacao(solicitacao, envioAprovacao)
        {
            if (typeof envioAprovacao == 'undefined' || envioAprovacao == null)
            {
                envioAprovacao = true;
            }

            if (typeof solicitacao == 'undefined' || solicitacao == null)
            {
                toastr.error('Objeto de solicitação de viagem vazio.');
                return false;
            }
            else if (typeof solicitacao.UfOrigem == 'undefined' || solicitacao.UfOrigem == null || solicitacao.UfOrigem.length == 0)
            {
                toastr.error("Campo 'UF Origem' inválido.");
                return false;
            }
            else if (solicitacao.UfOrigem.length > 2)
            {
                toastr.error("Campo 'UF Origem' maior que 2 caracteres.");
                return false;
            }
            else if (typeof solicitacao.CidadeOrigem == 'undefined' || solicitacao.CidadeOrigem == null || solicitacao.CidadeOrigem.length == 0)
            {
                toastr.error("Campo 'Origem' inválido.");
                return false;
            }
            else if (solicitacao.CidadeOrigem.length > 255)
            {
                toastr.error("Campo 'Origem' maior que 255 caracteres.");
                return false;
            }
            else if (typeof solicitacao.UfDestino == 'undefined' || solicitacao.UfDestino == null || solicitacao.UfDestino.length == 0)
            {
                toastr.error("Campo 'UF Destino' inválido.");
                return false;
            }
            else if (solicitacao.UfDestino.length > 2)
            {
                toastr.error("Campo 'UF Destino' maior que 2 caracteres.");
                return false;
            }
            else if (typeof solicitacao.CidadeDestino == 'undefined' || solicitacao.CidadeDestino == null || solicitacao.CidadeDestino.length == 0)
            {
                toastr.error("Campo 'Destino' inválido.");
                return false;
            }
            else if (solicitacao.CidadeDestino.length > 255)
            {
                toastr.error("Campo 'Destino' maior que 255 caracteres.");
                return false;
            }
            else if (typeof solicitacao.DataIda == 'undefined' || solicitacao.DataIda == null || solicitacao.DataIda.length == 0)
            {
                toastr.error("Campo 'Data Ida' inválido.");
                return false;
            }
            else if (typeof solicitacao.DataVolta == 'undefined' || solicitacao.DataVolta == null || solicitacao.DataVolta.length == 0)
            {
                toastr.error("Campo 'Data Volta' inválido.");
                return false;
            }
            else if (typeof solicitacao.Motivo == 'undefined' || solicitacao.Motivo == null || solicitacao.Motivo.length == 0)
            {
                toastr.error("Campo 'Motivo' inválido.");
                return false;
            }
            else if (solicitacao.Motivo.length > 255)
            {
                toastr.error("Campo 'Motivo' maior que 255 caracteres.");
                return false;
            }
            else if (typeof solicitacao.Observacao != 'undefined' && solicitacao.Observacao != null && solicitacao.Observacao.length > 255)
            {
                toastr.error("Campo 'Observação' maior que 255 caracteres.");
                return false;
            }
            else if (envioAprovacao && (typeof solicitacao.Custos == 'undefined' || solicitacao.Custos == null || solicitacao.Custos.length == 0))
            {
                toastr.error("Favor informar prestação de custos da viagem.");
                return false;
            }

            return true;
        }

        Limpar();

        $(document).ready(function () {
            $('#txtValor').mask("#.##0,00", {reverse: true});
            $('#txtQuantidade').mask("00", {reverse: true});
        });
    }
});

projetoIntegrador.controller('gestorController', function ($scope, $http, toastr) {

    if ($scope.ValidarLogin()) {

        $scope.reprovarItem = function (id) {
            $('#modalReprovar').modal('show');
        }
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
                Id: id
            }

            $http({
                method: 'POST',
                url: caminhoApi + '/setor/remover',
                headers: {
                    'Content-Type': "application/json; charset=utf-"
                },
                data: JSON.stringify(model)
            }).then(function (response) {
                    var data = response.data;

                    if (data.Sucesso) {
                        Limpar(true);
                        $('#modalRemover').modal("hide");
                        toastr.success('Setor removido!', 'Sucesso!');
                    } else {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao remover o setor, tente novamente.');
                    }
                },
                function (response) {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao remover o setor, tente novamente.');
                });
        }

        $scope.SalvarSetor = function (model) {
            if (ValidarSetor(model)) {
                $http({
                    method: 'POST',
                    url: caminhoApi + '/setor/manipular',
                    headers: {
                        'Content-Type': "application/json; charset=utf-"
                    },
                    data: JSON.stringify(model)
                }).then(function (response) {
                        var data = response.data;

                        if (data.Sucesso) {
                            Limpar(true);
                            $('#modalNovo').modal("hide");
                            toastr.success('Setor salvo!', 'Sucesso!');
                        } else {
                            toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao salvar o setor, tente novamente.');
                        }
                    },
                    function (response) {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao salvar o setor, tente novamente.');
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
                Id: id
            }

            $http({
                method: 'POST',
                url: caminhoApi + '/usuario/remover',
                headers: {
                    'Content-Type': "application/json; charset=utf-"
                },
                data: JSON.stringify(model)
            }).then(function (response) {
                    var data = response.data;

                    if (data.Sucesso) {
                        Limpar(true);
                        $('#modalRemover').modal("hide");
                        toastr.success('Usuário removido!', 'Sucesso!');
                    } else {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao remover o usuário, tente novamente.');
                    }
                },
                function (response) {
                    toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao remover o usuário, tente novamente.');
                });
        }

        $scope.SalvarUsuario = function (model) {
            if (ValidarUsuario(model)) {
                $http({
                    method: 'POST',
                    url: caminhoApi + '/usuario/manipular',
                    headers: {
                        'Content-Type': "application/json; charset=utf-"
                    },
                    data: JSON.stringify(model)
                }).then(function (response) {
                        var data = response.data;

                        if (data.Sucesso) {
                            Limpar(true);
                            $('#modalNovo').modal("hide");
                            toastr.success('Usuário salvo!', 'Sucesso!');
                        } else {
                            toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao salvar o usuário, tente novamente.');
                        }
                    },
                    function (response) {
                        toastr.error(data.Mensagem.length > 0 ? data.Mensagem : 'Falha ao salvar o usuário, tente novamente.');
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

            if (model.IdSetor == null || (model.Perfil != 'GESTOR' && model.IdSetor < 0)) {
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