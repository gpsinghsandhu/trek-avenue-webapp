(function() {
    'use strict';

    angular.module('trek-avenue')
        .factory('baseService', ['$http', '$log', '$q', baseService]);

    function baseService($http, $log, $q) {
        var getWelcomeMessage = function() {
        	return $q.resolve('Welcome to Trek avenue');
        }

        return {
            getWelcomeMessage: getWelcomeMessage
        };
    };

}());
