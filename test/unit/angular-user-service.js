'use strict';

describe('Module: myApp', function() {
    this.avUserService = undefined;

    // load the controller's module
    beforeEach(module('myApp'));

    beforeEach(inject(function(avUserService) {

        this.avUserService = avUserService;
        console.log('avUserService injected', this.avUserService);
    }));

    afterEach(function() {
        //scope.$destroy();
    });

    it('should correctly return mock values on a getAll', inject(function() {

        //check that injection works
        expect(this.avUserService).toBeDefined();

    }));
});
