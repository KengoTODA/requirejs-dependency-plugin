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
          return _this.printDependency();
        });
      },
      restoreDefine: function() {
        return define = this.amdDefine;
      },
      replaceDefine: function() {
        var depended, log, wrapper,
          _this = this;
        this.amdDefine = define;
        log = this.log;
        depended = this.depended;
        wrapper = function(name, deps, callback) {
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
        wrapper.amd = define.amd;
        return define = wrapper;
      },
      printDependency: function() {
        var entry, graph, module, value, _i, _len, _ref, _ref1, _ref2;
        graph = "digraph dependency {\n";
        _ref = this.log;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entry = _ref[_i];
          graph += "  " + entry + "\n";
        }
        graph += '  # depended modules\n';
        _ref1 = this.depended;
        for (module in _ref1) {
          value = _ref1[module];
          graph += "  " + module + " [shape = box];\n";
        }
        graph += "}";
        return typeof window !== "undefined" && window !== null ? (_ref2 = window.console) != null ? typeof _ref2.log === "function" ? _ref2.log(graph) : void 0 : void 0 : void 0;
      }
    };
  });

}).call(this);
