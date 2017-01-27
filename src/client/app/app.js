(function() {
    'use strict';

    var app = angular.module('trek-avenue', ['ngRoute', 'ui.router', 'angular-loading-bar']);

    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('base', {
                abstract: true,
                template: '<ui-view />'
            })
            .state('base.home', {
                url: '/',
                template: '<ta-home welcome-message="res.welcomeMessage"></ta-home>',
                controller: resolvingController(['welcomeMessage']),
                resolve: {
                    welcomeMessage: ['baseService', function(baseService) {
                        return baseService.getWelcomeMessage();
                    }]
                }
            });
    }]);

    app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.latencyThreshold = 0;
        cfpLoadingBarProvider.includeSpinner = false;
    }]);

    app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push(['$q', '$injector', '$window', '$timeout', function($q, $injector, $window, $timeout) {
            function showAlert(message) {
                $window
                    .alert(message)
                    .then(function() {
                        $window.location.reload();
                    });
            }

            return {
                request: function(config) {
                    var timeout = config.timeout,
                        deferred = $q.defer();

                    // only for api request
                    if(!isApiRequest(config.url)) {
                        return config;
                    }

                    if(Number.isFinite(timeout) && timeout >= 0) {
                        $timeout(function() {
                            deferred.resolve();
                        }, timeout);
                    } else if(angular.isObject(timeout) && angular.isFunction(timeout.then)) {
                        config.timeout.then(function() {
                            deferred.resolve();
                        });
                    }

                    config.timeout = deferred.promise;
                    config._ta = config._ta || {};
                    config._ta.canceller = deferred;

                    return config;
                },

                response: function(response) {
                    if(!response) {
                        console.error('Empty Response for http request.');
                        return response;
                    }

                    var config = response.config,
                        data = response.data,
                        status, errMsg;

                    if(!angular.isObject(config)) {
                        console.error('No config object found with response ' + JSON.stringify(response));
                        return response;
                    }

                    if(!isApiRequest(config.url)) {
                        return $q.resolve(response);
                    }

                    // TODO: add some standard response processing
                    return response;
                },

                responseError: function(rejection) {
                    var config = rejection.config;

                    console.log(rejection);

                    if(config && config._ta && config._ta.selfCancelled) {
                        console.log('hello');
                        return $q.reject(rejection);
                    }

                    console.log(rejection);

                    if(rejection.status === 0) {
                        $window.location.reload();
                        return $q.reject(rejection);
                    }

                    if(!angular.isObject(config)) {
                        console.error('No config object found with rejection ' + JSON.stringify(rejection));
                    }

                    if(!isApiRequest(config.url)) {
                        return $q.reject(rejection);
                    }

                    console.log(rejection);

                    showAlertErrors('There was some error. Reloading...');
                    return $q.reject(rejection);
                }
            };
        }]);
    }])

    function resolvingController(depArr) {
        if(!R.is(Array, depArr)) {
            return function() {};
        }

        return R.concat(depArr, ['$scope', function() {
            var scope = arguments[arguments.length - 1],
                args = arguments;

            scope.res = {};
            R.addIndex(R.forEach)(function(item, index) {
                scope.res[item] = args[index];
            }, depArr);
        }]);
    }

    function isApiRequest(url) {
        return R.is(String, url) && url.indexOf('/api/') === 0;
    }

    // TODO: not used for now
    function cancelAllHttpRequest($http) {
        var pendingRequests = $http.pendingRequests || [];

        pendingRequests.forEach(function(item) {
            if(isApiRequest(item.url) && item._ta && item._ta.canceller) {
                item._ta.selfCancelled = true;
                item._ta.canceller.resolve();
            }
        });
    }

})();
