define () ->
  log: []
  depended: {}
  load: (targetModule, req, load, config) ->
    isBuild = config.isBuild
    @replaceDefine() if isBuild
    req [targetModule], (value) =>
      load value
      @restoreDefine() if isBuild
  restoreDefine: ->
    console.log 'restoring define() method'
    `define = this.amdDefine`
  replaceDefine: ->
    console.log 'replacing define() method'
    @amdDefine = define
    log = @log
    depended = @depended
    wrapper = (name, deps, callback) =>
      console.log 'wrapper is called'
      if (typeof name != "string")
        callback = deps
        deps = name
        name = null
      if (Object.prototype.toString.call(deps) != "[object Array]")
        callback = deps
        deps = []
      rawCallback = callback
      deps.unshift "module"
      callback = (module) ->
        console.log 'callback is called'
        return rawCallback unless rawCallback.apply?
        args = Array.prototype.slice.call(arguments)
        args.shift() # remove 'module' from args
        uri = module.uri
        for dep in deps[1..] # skip 'module' in deps
          do (dep) ->
            # only `.js` is supported
            depended["\"#{requirejs.toUrl(dep)}.js\""] = true
            log.push "\"#{uri}\"->\"#{requirejs.toUrl(dep)}.js\";"
        rawCallback.apply this, args
        console.log 'depended is ' + depended
      if name?
        @amdDefine.apply require, [name, deps, callback]
      else
        @amdDefine.apply require, [deps, callback]
    wrapper.amd = @amdDefine.amd
    `define = wrapper`
  buildDependencyGraph: ->
    # see DOT language
    # http://www.graphviz.org/doc/info/lang.html
    graph  = "digraph dependency {"
    graph += "  #{entry}" for entry in @log
    graph += "  #{module} [shape = box]" for module, value of @depended
    graph += "}"
    return graph
  writeFile: (pluginName, moduleName, req, write) ->
    fileName = moduleName + '.dot'
    graph = @buildDependencyGraph()
    write fileName, graph
