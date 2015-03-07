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

        this.userRolesVariable = 'roles';

        //sometimes the login event is different (and uncustomizalbe) from the user that is loaded via this server
        // if true, do NOT cache the login event user as the use and instead hit the
        //userresource url to load the user after a successfull event
        // if false, DO CACHE the login event data as the user
        // and call the user resource url to load the user
        // in this case you will want to bind to 'SERVICE.AVUSERSERVICE.GET.SUCCESS' vs. the raw (and data returned from
        // the lower level 'event:auth-loginConfirmed' whose user return is NOT the user that we expect
        this.loginEventDoesNotContainFullUserInfo = false;

        var userService = this;

        this.paramInitialize = function(config) {
            console.log('avaughan.user param initialize called', [config]);
            if (config.mockData) {
                this.mockData = config.mockData;
            }
            if (config.urlAfterLogin) {
                this.urlAfterLogin = config.urlAfterLogin;
            }
            if (config.userResourceUrl) {
                this.userResourceUrl = config.userResourceUrl;
            }
            if (config.userNameVariable) {
                this.userNameVariable = config.userNameVariable;
            }
            if (config.loginEventDoesNotContainFullUserInfo) {
                this.loginEventDoesNotContainFullUserInfo = config.loginEventDoesNotContainFullUserInfo;
            }

            if (config.userRolesVariable) {
                this.userRolesVariable = config.userRolesVariable;
            }
        };

        //DEPRECATED - used param based instead!!!!
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
                serviceContainerConfig.eventChannel = 'AVUSERSERVICE';

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

                            //send out a success user fetch event
                            if (value !== undefined && value[userService.userNameVariable] !== undefined) {
                                self.logger.debug('sending event: get success SERVICE.' + self.eventChannel + '.GET.SUCESS', [value, responseHeaders]);
                                self.$rootScope.$broadcast('SERVICE.' + self.eventChannel + '.GET.SUCCESS', value);
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

                    toLogin: function($location) {
                        this.avLogin.toLogin($location);
                    },

                    isLoggedIn: function() {
                        this.logger.debug('userService isLoggedIn ', this.getUser());
                        return (this.getUser() !== undefined && this.getUser()[userService.userNameVariable] !== undefined);
                    },

                    getUser: function() {
                        this.logger.debug('user service, getUser', this.user);
                        if (this.user === undefined) {
                            this.logger.debug('user service, getUser needs to fetch');
                            this.fetchUser();
                        }
                        return this.user;
                    },

                    getSecurityRoles: function() {
                        this.logger.debug('user service, get security roles called');
                        if (this.isLoggedIn()) {
                            var user = this.getUser();
                            this.logger.debug('user service, get security roles, returning ', [user, userService.userRolesVariable, user[userService.userRolesVariable]]);
                            return user[userService.userRolesVariable];
                        } else {
                            this.logger.debug('not logged in, return blank roles');
                            return [];
                        }
                    },

                    hasSecurityRoles: function(requiredRoles) {
                        var hasRole = false,
                            roleCheckPassed = false,
                            loweredRoles;
                        if (!this.isLoggedIn()) {
                            hasRole = false;
                        } else if (this.isLoggedIn() && requiredRoles === undefined) {
                            hasRole = true;
                        } else if (this.isLoggedIn() && requiredRoles !== undefined) {
                            if (requiredRoles.length === 0) {
                                hasRole = true;
                            } else {
                                loweredRoles = [];
                                angular.forEach(this.getSecurityRoles(), function(role) {
                                    loweredRoles.push(role.toLowerCase());
                                });

                                // check user has at least one role in given required roles
                                angular.forEach(requiredRoles, function(role) {
                                    roleCheckPassed = roleCheckPassed || _.contains(loweredRoles, role.toLowerCase());
                                });
                                hasRole = roleCheckPassed;
                            }
                        }

                        return hasRole;
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
                            self.logger.info('user data, does not contain full info', [user, userService.loginEventDoesNotContainFullUserInfo]);
                            if (userService.loginEventDoesNotContainFullUserInfo === true) {
                                self.logger.info('login does not contain full user info, fetching user');
                                //force a refetch
                                self.checkedServer = false;
                                self.fetchUser();
                            } else {
                                self.logger.info('login does contain full user info, caching', user);
                                self.setUser(user);
                            }

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

angular.module('avaughan.user').directive('visibleToRoles', [
    'avUserService', 'avLog', '$rootScope',
    function(avUserService, avLog, $rootScope) {

        var logger = avLog.getLogger('visibleToRoles');

        return {
            link: function(scope, element, attrs) {
                logger.debug('link called', attrs);
                var makeVisible = function() {
                        logger.debug('make visible', element);
                        //element.removeClass('hidden');
                        element.removeClass('ng-hide');
                        //element.show();
                    },
                    makeHidden = function() {
                        logger.debug('make hidden', element);
                        //element.addClass('hidden');
                        element.addClass('ng-hide');
                        //element.hide();
                    },
                    determineVisibility = function(resetFirst) {
                        logger.debug('determine visibility');
                        if (resetFirst) {
                            makeVisible();
                        }

                        if (avUserService.hasSecurityRoles(roles)) {
                            logger.debug('has roles', [avUserService.getSecurityRoles(), roles]);
                            makeVisible();
                        } else {
                            logger.debug('does not have roles', [avUserService.getSecurityRoles(), roles, element]);
                            makeHidden();
                        }
                    },
                    roles = attrs.visibleToRoles.split(',');
                logger.debug('roles ', roles);

                $rootScope.$on('SERVICE.' + avUserService.eventChannel + '.GET.SUCCESS', function(event, user) {
                    logger.info('SERVICE.' + avUserService.eventChannel + '.GET.SUCCESS user service got session login event ', [event, user]);
                    determineVisibility(true);
                });

                $rootScope.$on('event:auth-logoutConfirmed', function(event, user) {
                    logger.info('event:auth-logoutConfirmed user service got session login event ', [event, user]);
                    determineVisibility(true);
                });

                if (roles.length > 0) {
                    determineVisibility(true);
                }
            }
        };
    }
]);
