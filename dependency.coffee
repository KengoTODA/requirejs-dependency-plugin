define () ->
  log: []
  depended: {}
  load: (targetModule, req, load, config) ->
    @replaceDefine()
    req [targetModule], (value) =>
      load value
      @restoreDefine()
      @printDependency()
  restoreDefine: ->
    `define = this.amdDefine`
  replaceDefine: ->
    @amdDefine = define
    log = @log
    depended = @depended
    wrapper = (name, deps, callback) =>
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
      if name?
        @amdDefine name, deps, callback
      else
        @amdDefine deps, callback
    wrapper.amd = define.amd
    `define = wrapper`
  printDependency: ->
    # see DOT language
    # http://www.graphviz.org/doc/info/lang.html
    graph  = "digraph dependency {\n"
    graph += "  #{entry}\n" for entry in @log
    graph += "  // depended modules\n"
    graph += "  #{module} [shape = box];\n" for module, value of @depended
    graph += "}"
    window?.console?.log? graph
