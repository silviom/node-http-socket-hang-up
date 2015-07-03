"use strict";
var assert = require("assert");
var sinon = require("sinon");
var rewire = require("rewire");

describe("index.js", function () {

    it("can load module", function() {
        var middleware = require("..");
        assert.ok(middleware);
        assert.equal(typeof middleware.create, "function");
    });

    describe("create method:", function() {

        it("should fails when options are invalid", function () {
            var middleware = require("..");

            var invalidOptions = [
                100,
                true,
                "foo",
                []
            ];

            invalidOptions.forEach(function (options) {
                try {
                    middleware.create(options);
                    assert.fail("Did not fail!");
                } catch (e) {
                    assert.ok(e instanceof Error);
                    assert.equal(e.message, "Invalid options argument, it must be an object instance.");
                }
            });
        });

        describe("logger option.", function () {

            it("It should set fakeLogger by default", function() {
                var middleware = rewire("..");
                var fakeLogger = {
                    info: sinon.stub()
                };

                middleware.__set__("fakeLogger", fakeLogger);
                middleware.create();

                assert.ok(fakeLogger.info.called);
            });

            it("It should set the console as logger when the option was set to true", function() {
                var middleware = require("..");
                var consoleStub = sinon.spy(console, "log");

                middleware.create();

                assert.ok(consoleStub);

            });
        });
    });
});