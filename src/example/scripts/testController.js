    angular.module('myApp').controller('testController', ['$scope', 'avLog', '$rootScope', 'avLogin', '$resource', '$http', '$cookieStore', 'avUserService',
        function($scope, avLog, $rootScope, avLogin, $resource, $http, $cookieStore, avUserService) {

            var self = this;
            var logger = avLog.getLogger('testController');

            $scope.formData = {};
            // $scope.loggedIn = false;
            $scope.userInfo = {};

            //create the angular $resource
            //var resource = $resource('/api/userInfo', null, {});

            var getUserInfo = function() {
                logger.debug("get userInfo called");
                $scope.userInfo = avUserService.getUser();
                logger.debug("userinfo: ", $scope.userInfo);
                return $scope.userInfo;
            };

            $scope.isLoggedIn = function() {
                logger.debug("controller isLoggedIn called start");
                var loggedIn = avUserService.isLoggedIn();
                logger.debug('controller isLogged in end', loggedIn);
                return loggedIn;
            };

            this.resetFormData = function() {
                logger.debug("resetFormData called");
                $scope.formData = {};
            };

            $scope.logout = function() {
                logger.debug("logout called");
                avUserService.logout();
                self.resetFormData();
                logger.debug("logout complete", [avUserService.getUser()]);
            };

            $scope.login = function() {
                logger.debug("login called", $scope.formData);
                $scope.userInfo = avUserService.login($scope.formData.name, $scope.formData.password);
            };

            $rootScope.$on('event:auth-loginConfirmed', function(event, user) {
                logger.info("event:auth-loginConfirmed got session login event ", event);
                logger.info("user data", user);
                $scope.userInfo = user;
            });

            $rootScope.$on('event:auth-logoutConfirmed', function(event, user) {
                logger.info("event:auth-logoutConfirmed got session logout event ", event);
                $scope.userInfo = {};
            });


            $scope.makeProtectedCall = function() {
                logger.debug("make protected call, called");
                var protectedCall = $resource('/api/protectedCall', null, {});
                var result = protectedCall.get({}, function(value, responseHeaders) {
                    logger.debug(' protected call success: ' + value);
                }, function(httpResponse) {
                    logger.error('failed protected call', httpResponse);
                    $scope.result = httpResponse;
                });
                $scope.result = result;
            };

        }
    ]);
