(function() {

  define(function() {
    return {
      log: [],
      depended: {},
      load: function(targetModule, req, load, config) {
        var isBuild,
          _this = this;
        isBuild = config.isBuild;
        if (isBuild) {
          this.replaceDefine();
        }
        return req([targetModule], function(value) {
          load(value);
          if (isBuild) {
            return _this.restoreDefine();
          }
        });
      },
      restoreDefine: function() {
        console.log('restoring define() method');
        return define = this.amdDefine;
      },
      replaceDefine: function() {
        var depended, log, wrapper,
          _this = this;
        console.log('replacing define() method');
        this.amdDefine = define;
        log = this.log;
        depended = this.depended;
        wrapper = function(name, deps, callback) {
          var rawCallback;
          console.log('wrapper is called');
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
            console.log('callback is called');
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
            rawCallback.apply(this, args);
            return console.log('depended is ' + depended);
          };
          if (name != null) {
            return _this.amdDefine.apply(require, [name, deps, callback]);
          } else {
            return _this.amdDefine.apply(require, [deps, callback]);
          }
        };
        wrapper.amd = this.amdDefine.amd;
        return define = wrapper;
      },
      buildDependencyGraph: function() {
        var entry, graph, module, value, _i, _len, _ref, _ref1;
        graph = "digraph dependency {";
        _ref = this.log;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entry = _ref[_i];
          graph += "  " + entry;
        }
        _ref1 = this.depended;
        for (module in _ref1) {
          value = _ref1[module];
          graph += "  " + module + " [shape = box]";
        }
        graph += "}";
        return graph;
      },
      writeFile: function(pluginName, moduleName, req, write) {
        var fileName, graph;
        fileName = moduleName + '.dot';
        graph = this.buildDependencyGraph();
        return write(fileName, graph);
      }
    };
  });

}).call(this);
