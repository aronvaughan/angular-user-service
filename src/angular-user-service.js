'use strict';

/*global angular:true, ServiceContainerConfig: true*/
angular.module('avaughan.user', ['avaughan.logging', 'avaughan.login']);

angular.module('avaughan.user').provider('avUserService',
    function() {
        //var avaughanLogin = _.extend(AVaughanLogin, {});

        this.mockData = [{
            'class': 'security.User',
            'id': 1,
            'accountExpired': false,
            'accountLocked': false,
            'email': 'aronvaughan@hotmail.com',
            'enabled': true,
            'password': '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
            'passwordExpired': false,
            'username': 'mock admin'
        }];

        this.urlAfterLogin = '/';

        this.userResourceUrl = 'api/userInfo/current';

        this.userNameVariable = 'username';

        var userService = this;

        this.initialize = function(userResourceUrl, userNameVariable, urlAfterLogin, mockData) {
            console.log('avaughan.user initialize called', [userResourceUrl, urlAfterLogin, mockData]);
            if (mockData) {
                this.mockData = mockData;
            }
            if (urlAfterLogin) {
                this.urlAfterLogin = urlAfterLogin;
            }
            if (userResourceUrl) {
                this.userResourceUrl = userResourceUrl;
            }
            if (userNameVariable) {
                this.userNameVariable = userNameVariable;
            }
        };

        this.$get = ['$rootScope', '$resource', 'avLog', '$location', 'avLogin', '$cookieStore', '$http',
            function($rootScope, $resource, avLog, $location, avLogin, $cookieStore, $http) {

                var resourceUrl = this.userResourceUrl;
                var serviceContainerConfig = new ServiceContainerConfig('avUserService', resourceUrl, this.mockData, $rootScope, $resource, avLog);
                serviceContainerConfig.urlAfterLogin = this.urlAfterLogin;
                serviceContainerConfig.$location = $location;
                serviceContainerConfig.avLogin = avLogin;

                serviceContainerConfig.mockExtend = {


                    fetchUser: function() {

                        this.logger.debug('mock user service, fetch user');
                        return this.mockData[0];
                    },

                    login: function(username, password) {
                        this.logger.debug('in mock mode, login', [username, password]);

                        if (username === this.mockData[0].username) {
                            this.logger.info('redirecting to ' + this.urlAfterLogin);
                            this.$location.path(this.urlAfterLogin);
                            return this.mockData[0];
                        } else {
                            return undefined;
                        }
                    },

                    logout: function() {
                        // do nothing!!!!
                    }
                };

                serviceContainerConfig.realExtend = {

                    fetchUser: function() {
                        this.logger.debug('user service, fetch user');

                        //fetch user!!!!! and update logged in
                        this.logger.debug('getting user data from remote');

                        var self = this;
                        var valueOfUserBeforeCall = this.user;
                        this.user = this.resource.get({}, function(value, responseHeaders) {
                            self.logger.debug('userData, fetchUser success callback: ', [value, userService.userNameVariable,
                                value[userService.userNameVariable], responseHeaders,
                                valueOfUserBeforeCall, avLogin.isTokenAvailable($rootScope, $cookieStore)
                            ]);
                            if (value !== undefined && value[userService.userNameVariable] !== undefined &&
                                valueOfUserBeforeCall === undefined && avLogin.isTokenAvailable($rootScope, $cookieStore)) {
                                self.logger.info('detected inital load with user token available');
                                avLogin.loginConfirmed(value);
                            }
                        });

                        this.logger.debug('got user', this.user);
                        return this.user;
                    },

                    login: function(username, password) {
                        this.logger.debug('login called', username);
                        return this.avLogin.login(username, password, $http, $rootScope, $cookieStore, $location);
                    },

                    logout: function() {
                        this.avLogin.logout($http, $cookieStore, $rootScope);
                    }
                };

                serviceContainerConfig.serviceExtend = {
                    /**
                     * have we check the server state for this user?
                     */
                    checkedServer: false,
                    user: undefined,
                    defaultUsername: 'Guest',
                    userNameVariable: this.userNameVariable,

                    isLoggedIn: function() {
                        this.logger.debug('userService isLoggedIn ', this.getUser());
                        return (this.getUser() !== undefined && this.getUser()[this.userNameVariable] !== undefined);
                    },

                    getUser: function() {
                        this.logger.debug('user service, getUser', this.user);
                        if (this.user === undefined) {
                            this.logger.debug('user service, getUser needs to fetch');
                            this.fetchUser();
                        }
                        return this.user;
                    },

                    getUsername: function() {
                        this.logger.debug('getUsername ', [this.user, this.userNameVariable]);
                        this.getUser();
                        if (this.user && this.user[this.userNameVariable]) {
                            return this.user[this.userNameVariable];
                        } else {
                            return this.defaultUsername;
                        }
                    },

                    logout: function() {
                        this.logger.debug('userService logout');
                        this.serviceRemote.logout();
                        this.resetAfterLogout();
                    },

                    login: function(username, password) {
                        return this.serviceRemote.login(username, password);
                    },


                    reset: function() {
                        this.logger.debug('reset called');
                        this.checkedServer = false;
                        this.user = undefined;
                    },

                    resetAfterLogout: function() {
                        this.reset();
                        this.checkedServer = true;
                    },

                    setUser: function(user) {
                        this.logger.debug('set user', this.user);
                        this.user = user;
                        this.checkedServer = true;
                        this.logger.debug('set user exit', this.user);
                    },

                    fetchUser: function() {

                        this.logger.debug('user service, fetch user');

                        //only fetch the data if we haven't checked the server....
                        if (!this.checkedServer) {
                            //fetch user!!!!! and update logged in
                            this.logger.debug('getting user data from user data impl');
                            this.user = this.serviceRemote.fetchUser();
                            this.setUser(this.user);
                        } else {
                            this.logger.debug('already checked, not checking again...');
                        }

                        //return the user data
                        return this.user;
                    },

                    customInitialize: function(dependencies, requirements) {

                        var self = this;

                        this.logger.info('custom initialize hooking up auth events', [dependencies, requirements]);
                        this.$rootScope.$on('event:auth-loginConfirmed', function(event, user) {
                            self.logger.info('event:auth-loginConfirmed user service got session login event ', event);
                            self.logger.info('user data', user);
                            self.setUser(user);
                        });

                        $rootScope.$on('event:auth-logoutConfirmed', function(event, data) {
                            self.logger.info('event:auth-logoutConfirmed', event);
                            self.logger.info('data', data);
                            self.resetAfterLogout();
                        });

                        $rootScope.$on('event:auth-loginRequired', function(event, rejection) {
                            self.logger.info('event:auth-loginRequired! user service got session login event ', event);
                            self.logger.info('data', rejection);
                        });

                        $rootScope.$on('event:auth-loginCancelled', function(event, data) {
                            self.logger.info('event:auth-auth-loginCancelled user service got session login event ', event);
                            self.logger.info(' data', data);
                        });
                    }
                };

                return serviceContainerConfig.createService();
            }
        ];
    }
);
