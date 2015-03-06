# angular-user-service

angular lib for create typical user service (interacts with login/auth to fetch from remote if needed)

make sure to read angular-login docs (this module relies on it being configured for your use case)

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/aronvaughan/angular-login/master/dist/angular-user-service.min.js
[max]: https://raw.github.com/aronvaughan/angular-login/master/dist/angular-user-service.js

1. Include the `angular-login.js` script provided by this component into your app's webpage.  as well as the necessary dependant libraries

In your web page:

```html
   <script src="../../bower_components/angular/angular.js"></script>
   <script src="../../bower_components/angular-cookies/angular-cookies.js"></script>
   <script src="../../bower_components/angular-logging/dist/angular-logging.min.js"></script>
   <script src="../../bower_components/lodash/dist/lodash.compat.js"></script>
   <script src="../../bower_components/angular-resource/angular-resource.js"></script>
   <script src="../../bower_components/angular-http-auth/src/http-auth-interceptor.js"></script>
   <script src="../../bower_components/angular-login/dist/angular-login.min.js"></script>
   <script src="../../bower_components/angular-rest-service/dist/angular-rest-service.min.js"></script>
   <!-- endbower -->
   <!-- endbuild -->

   <!-- build:js scripts/app.min.js -->

   <!-- to use the minified version (the auth managers have been concatenated with the main file -->
   <script src="../<path>/angular-user-service.min.js"></script>
```
this project depends on above libraries

1.  In your apps dependencies, add this module as a dependency

var myApp = angular.module('myApp', ['avaughan.logging', 'avaughan.login', 'avaughan.user']);

1. In the config block of your application, set up where user info is fetched from and the name of the property
that holds the usernmae

```js
myApp.config(['avLogProvider', 'avLevel', 'avLoginProvider', 'avUserServiceProvider',
    function(avLogProvider, avLevel, avLoginProvider, avUserServiceProvider) {

          //setup user service with our user url...
           var userServiceConfig = {
                      userResourceUrl: '/api/userInfo',
                      userNameVariable: 'userName'

          };
          avUserServiceProvider.paramInitialize(userServiceConfig);    //initialize is now deprecated in favor of an object based initialize

}
```

3. Login: In your controller where you handle login, use the new login functionality - here is a complete working example

```js
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

        //if you have set loginEventDoesNotContainFullUserInfo to true, then you should instead bind to
        // SERVICE.AVUSERSERVICE.GET.SUCCESS vs. this lower level object
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
```
4. See the example app to full logic of how to configure the avLogin module and this service (they are closely intertwined
and the example app w/in this module is the reference implementation)

## Documentation

## Examples
See getting started
See also tests in this github project
See example in source code

## Changelog

### v 0.0.1

* initial release

### v 0.0.2

* fix username handling

### v 0.0.3

* updates needed to work with login service 0.0.5

### v 0.0.4

* fix npe on $cookieStore and specify correct version

### v 0.0.5

* add toLogin($location) - function that will force the user to the configured redirectIfTokenNotFoundUrl

### v 0.0.6

* add param based initialization method - this.paramInitialize(config)
* deprecated this.initialize method
* added flag, loginEventDoesNotContainFullUserInfo to config that specifies that the lower level avLogin event is NOT the user (the default) and this service should load the user on the login event from avLogin

### v 0.0.7

* add user roles
* add directive to show content only to users with specific roles (see index.html for example usage)

## TODO

* figure out integration tests (angular only allows unit or functional)
* write tests

## Resources

the provided token manager

* http://alvarosanchez.github.io/grails-spring-security-rest/docs/guide/introduction.html

the angular-http-auth library that this code is built upon

* https://github.com/witoldsz/angular-http-auth

initial grunt workspace generated by angular-component

* http://stackoverflow.com/questions/19614545/how-can-i-add-some-small-utility-functions-to-my-angularjs-application
* http://stackoverflow.com/questions/15666048/angular-js-service-vs-provider-vs-factory
* http://briantford.com/blog/angular-bower

## Contributing

download the full source....

1. install npm and grunt
2. cd to root of project checkout

to test

1. grunt test

to see the example app

1. grunt serve
2. make sure you have developer tools/firebug, etc.. open so you can see console logs

to create another version

1. grunt test
2. grunt build
3. check in files
3. grunt release

