(function() {

  define(function() {
    return {
      log: [],
      depended: {},
      load: function(targetModule, req, load, config) {
        var _this = this;
        this.replaceDefine();
        return req([targetModule], function(value) {
          load(value);
          _this.restoreDefine();
          return _this.printDependency(targetModule);
        });
      },
      restoreDefine: function() {
        return window.define = this.amdDefine;
      },
      replaceDefine: function() {
        var depended, log,
          _this = this;
        this.amdDefine = window.define;
        log = this.log;
        depended = this.depended;
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
            var args, dep, uri, _fn, _i, _len, _ref;
            if (rawCallback.apply == null) {
              return rawCallback;
            }
            args = Array.prototype.slice.call(arguments);
            args.shift();
            uri = module.uri;
            _ref = deps.slice(1);
            _fn = function(dep) {
              depended["\"" + (requirejs.toUrl(dep)) + ".js\""] = true;
              return log.push("\"" + uri + "\"->\"" + (requirejs.toUrl(dep)) + ".js\";");
            };
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              dep = _ref[_i];
              _fn(dep);
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
      printDependency: function(targetModule) {
        var entry, module, value, _i, _len, _ref, _ref1;
        this.printInit(targetModule);
        this.print("digraph dependency {");
        _ref = this.log;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entry = _ref[_i];
          this.print("  " + entry);
        }
        _ref1 = this.depended;
        for (module in _ref1) {
          value = _ref1[module];
          this.print("  " + module + " [shape = box]");
        }
        return this.print("}");
      },
      printInit: function(targetModule) {
        if (require.nodeRequire != null) {
          this.fs = require.nodeRequire('fs');
          this.fileName = "" + targetModule + ".dot";
          return this.fs.unlinkSync(this.fileName);
        }
      },
      print: function(str) {
        var _ref;
        if (this.fs != null) {
          return this.fs.appendFileSync(this.fileName, str);
        } else {
          return (_ref = window.console) != null ? typeof _ref.log === "function" ? _ref.log(str) : void 0 : void 0;
        }
      }
    };
  });

}).call(this);
