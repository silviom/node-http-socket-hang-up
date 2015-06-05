"use strict";
var assert = require("assert");

describe("index.js", function () {

    it("can load module", function() {
        var middleware = require("..");
        assert.ok(middleware);
        assert.equal(typeof middleware.create, "function");
    });

    // more test comming soon :)
});