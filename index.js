"use strict";

var fakeLogger = require("./lib/fakeLogger");
var consoleLogger = require("./lib/consoleLogger");

module.exports.create = function (opts) {

    opts = opts || {};
    if (Array.isArray(opts) || typeof opts !== "object") throw new Error("Invalid options argument, it must be an object instance.");

    // clone options
    var options = {
        logger: opts.logger || fakeLogger,
        header: opts.header || "x-timeout",
        level: opts.level   || "verbose"
    };

    // validate logger
    if (options.logger === true) {
        options.logger = consoleLogger;
    } else if (typeof options !== "object") {
        throw new Error("Invalid options.logger property. [true/false/logger instance like winston]");
    }

    // valdate log level
    if (typeof options.header !== "string") throw new Error("Invalid 'options.header' property, it must be a string. Default is 'x-timeout'");

    // valdate header name
    if (typeof options.level !== "string") throw new Error("Invalid 'options.level' property, it must be a string. Default is 'verbose'");

    // create instance
    options.logger.info("http-socket-hang-up options were validated.");

    var instance = new TimeoutMiddleware(options);
    return instance.callback;
};

function TimeoutMiddleware(options) {

    options.logger.info("http-socket-hang-up middleware initialized", { header: options.header });

    var log = options.logger[options.level];

    this.callback = function callback(req, res, next) {

        var headers = req.headers || {};

        var context = {
            timeout: parseInt(headers[options.header]) || 0,
            keepAlive: req.connection._idleTimeout || 120000
        };

        if (context.timeout < context.keepAlive) {
            // nothing to do because TCP Keep alive is long enough
            log("TCP Keep Alive was not updated", context);

        } else {

            // timeout is longer than TCP keep alive.
            // we must change TCP keep alive value to a new value greater than the timeout
            context.newKeepAlive = context.timeout + context.keepAlive;
            log("TCP Keep Alive was updated with a new value:", context);
            req.connection.setTimeout(context.newKeepAlive);

            // subscribe to response's 'finish' event in order to reset TCP keep alive to its previous value.
            res.on("finish", function () {
                log("TCP keep alive was reseted to its original value.", context);
                req.connection.setTimeout(context.keepAlive);
            });
        };

        if (typeof next === "function") next();  // it is an express's middleware
    };
};