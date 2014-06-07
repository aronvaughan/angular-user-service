'use strict';

describe('Module: myApp', function() {
    this.avLogin = undefined;

    // load the controller's module
    beforeEach(module('myApp'));

    beforeEach(inject(function(avLogin) {

        this.avLogin = avLogin;
        console.log('avLogin injected', this.avLogin);
    }));

    afterEach(function() {
        //scope.$destroy();
    });

    it('should correctly return mock values on a getAll', inject(function() {

        //check that injection works
        expect(this.avLogin).toBeDefined();

    }));
});
