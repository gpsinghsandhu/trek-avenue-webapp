(function() {
    'use strict';

    angular.module('trek-avenue')
        .component('taHome', {
            controller: [TaHome],
            controllerAs: 'vm',
            templateUrl: '/app/components/taHome/taHome.html',
            bindings: {
                welcomeMessage: '<'
            }
        });

    function TaHome() {
        var vm = this;

        vm.$onInit = function() {
            console.log(vm.welcomeMessage);
        };
    }
})();
