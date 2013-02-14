(function() {

  define("dependency", function() {
    return {
      log: [],
      load: function(targetModule, req, load, config) {
        var _this = this;
        this.replaceDefine();
        return req([targetModule], function(value) {
          load(value);
          _this.restoreDefine();
          return _this.printDependency();
        });
      },
      restoreDefine: function() {
        return window.define = this.amdDefine;
      },
      replaceDefine: function() {
        var log,
          _this = this;
        this.amdDefine = window.define;
        log = this.log;
        return window.define = function(name, deps, callback) {
          var rawCallback;
          if (typeof name !== "string") {
            callback = deps;
            deps = name;
            name = null;
          }
          if (Object.prototype.toString.call(deps) !== "[object Array]") {
            callback = deps;
            deps = [];
          }
          rawCallback = callback;
          deps.unshift("module");
          callback = function(module) {
            var args, dep, uri, _i, _len, _ref;
            if (rawCallback.apply == null) {
              return rawCallback;
            }
            args = Array.prototype.slice.call(arguments);
            args.shift();
            uri = module.uri;
            _ref = deps.slice(1);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              dep = _ref[_i];
              log.push("'" + uri + "'->'" + (requirejs.toUrl(dep)) + "';");
            }
            return rawCallback.apply(this, args);
          };
          if (name != null) {
            return _this.amdDefine(name, deps, callback);
          } else {
            return _this.amdDefine(deps, callback);
          }
        };
      },
      printDependency: function() {
        var entry, _i, _len;
        this.print("digraph dependency {");
        for (_i = 0, _len = log.length; _i < _len; _i++) {
          entry = log[_i];
          this.print("  " + entry);
        }
        return this.print("}");
      },
      print: str(function() {
        var _ref;
        return typeof window !== "undefined" && window !== null ? (_ref = window.console) != null ? _ref.log(str) : void 0 : void 0;
      })
    };
  });

}).call(this);
