var assert = require("assert");

describe("Array", function() {
	describe("#index", function() {
	    it('should return -1 when the value is not present', function() {
	      assert.equal(-1, [1,2,3].indexOf(4));
	    });
	});
});