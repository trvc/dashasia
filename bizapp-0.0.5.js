var BizApp = (function(window) {
    
    var Utils = {
        isString: function(x) { return typeof x === "string"; },
        isObject: function(x) { return x === Object(x); },
        noop: function() { }
    };

    var parent = window.parent;
    var allRequests = {};
    var pageLoaded = false;
    var backHandler = function() {
        window.history.back();
    };

    // Listen to parent
    window.addEventListener("message", _onParentMessage);

    // Some action from parent will be ignored until page loaded (For instance, on back pressed)
    _setOnReady(function() {
        pageLoaded = true;
    });

    // Force no margin and padding on html and body
    _injectCSS();
    
    function _onParentMessage(ev) {
        var json;

        // Not much checks are done, error are ignored
        try {
            json = JSON.parse(ev.data);
        } catch (e) {
            return;
        }

        switch (json.type) {
            case "CALLBACK":
                _handleCallback(allRequests[json.timestamp], json.data.result, json.data.error);
                break;

            case "ON_BACK_PRESSED":
                if (!pageLoaded) break;
                backHandler();
                break;

            default:
                break;
        }
    }

    function _handleCallback(req, res, err) {
        if (req === undefined) return;

        switch (req.type) {
            case "PAY_TO_WALLET":
            case "LOGIN":
            case "OPEN_EXTERNAL_LINK":
            case "GET_SDK_VERSION":
            case "IS_METHOD_AVAILABLE":
            case "SHOW_ALERT":
            case "EXIT_APP":
                req.callback(err, res);
                break;

            default:
                break;
        }
    }

    function _injectCSS() {
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = "html, body { margin: 0 !important; padding: 0 !important; width: 100%; height: 100%; } ";
        css.innerHTML += "bizapp-root { width: 100%; height: 100%; overflow-y: scroll; -webkit-overflow-scrolling: touch; display: block; }"
        document.head.appendChild(css);
    }

    function _setOnReady(onReady) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            onReady();
        } else {
            document.addEventListener("DOMContentLoaded", onReady);
        }
    }




    /**
     * Request to login
     * @param opts.url The URL that handle login request
     */
    function login(opts, cb) {
        // Input check
        if (!cb) cb = Utils.noop;
        if (!Utils.isObject(opts)) {
            return cb("Invalid opts");
        }

        // Prepare request
        var timestamp = Date.now();
        var request = {
            type: "LOGIN",
            data: {
                url: opts.url
            },
            timestamp: timestamp,
            callback: cb
        };
        allRequests[timestamp] = request;

        // Pass to parent
        parent.postMessage(JSON.stringify(request), "*");
    }

    /**
     * Pay to a wallet address
     * @param opts.address    Address to pay to
     * @param opts.amount     Amount to pay to
     * @param opts.message    Message to include
     * @param opts.identifier Transaction identifier (Max 8 chars)
     * @param opts.coin       Coin type to accept
     */
    function payToWallet(opts, cb) {
        // Input check
        if (!cb) cb = Utils.noop;
        if (!Utils.isObject(opts)) {
            return cb("Invalid opts");
        }

        // Prepare request
        var timestamp = Date.now();
        var request = {
            type: "PAY_TO_WALLET",
            data: {
                address: opts.address,
                amount: opts.amount,
                message: opts.message,
                identifier: opts.identifier,
                coin: opts.coin
            },
            timestamp: timestamp,
            callback: cb
        };
        allRequests[timestamp] = request;

        // Pass to parent
        parent.postMessage(JSON.stringify(request), "*");
    }

    /**
     * Set a custom handler when back button is pressed
     * @param opts.backHandler  Custom handler
     */
    function setBackHandler(opts, cb) {
        // Input check
        if (!cb) cb = Utils.noop;
        if (!Utils.isObject(opts)) {
            return cb("Invalid opts");
        }
        if (!opts.backHandler) {
            return cb("Missing back handler");
        }

        backHandler = opts.backHandler;
    }

    /**
     * Open external link
     * @param opts.url The URL to open in browser or new tab
     */
    function openExternalLink(opts, cb) {
        // Input check
        if (!cb) cb = Utils.noop;
        if (!Utils.isObject(opts)) {
            return cb("Invalid opts");
        }
        if (!opts.url) {
            return cb("Missing URL");
        }

        // Prepare request
        var timestamp = Date.now();
        var request = {
            type: "OPEN_EXTERNAL_LINK",
            data: {
                url: opts.url
            },
            timestamp: timestamp,
            callback: cb
        };
        allRequests[timestamp] = request;

        // Pass to parent
        parent.postMessage(JSON.stringify(request), "*");
    }

    /**
     * Get SDK Version
     */
    function getSDKVersion(cb) {
        // Input check
        if (!cb) cb = Utils.noop;

        // Prepare request
        var timestamp = Date.now();
        var request = {
            type: "GET_SDK_VERSION",
            data: {},
            timestamp: timestamp,
            callback: cb
        };
        allRequests[timestamp] = request;

        // Pass to parent
        parent.postMessage(JSON.stringify(request), "*");
    }

    /**
     * Check if a method is available
     * @param methodName of the method to check
     */
    function isMethodAvailable(methodName, cb) {
        // Input check
        if (!cb) cb = Utils.noop;
        if (methodName === undefined) return cb("Invalid parameter");

        // Prepare request
        var timestamp = Date.now();
        var request = {
            type: "IS_METHOD_AVAILABLE",
            data: {
                method: methodName
            },
            timestamp: timestamp,
            callback: cb
        };
        allRequests[timestamp] = request;

        // Pass to parent
        parent.postMessage(JSON.stringify(request), "*");
    }

    /**
     * Show an alert box
     * @param opts.title of the alert box
     * @param opts.body of the alert box
     */
    function alert(opts, cb) {
        // Input check
        if (!cb) cb = Utils.noop;
        if (!opts.title) opts.title = "";
        if (!opts.body) opts.body = "";

        // Prepare request
        var timestamp = Date.now();
        var request = {
            type: "SHOW_ALERT",
            data: {
                title: opts.title,
                body: opts.body
            },
            timestamp: timestamp,
            callback: cb
        };
        allRequests[timestamp] = request;

        // Pass to parent
        parent.postMessage(JSON.stringify(request), "*");
    }

    /**
     * Exit a BizApp
     */
    function exit() {
        parent.postMessage(JSON.stringify({ type: "EXIT_APP" }), "*");
    }
    
    return {
        login: login,
        payToWallet: payToWallet,
        setBackHandler: setBackHandler,
        openExternalLink: openExternalLink,
        getSDKVersion: getSDKVersion,
        isMethodAvailable: isMethodAvailable,
        alert: alert,
        exit: exit
    };
})(window);