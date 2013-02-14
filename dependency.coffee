define () ->
  log: []
  load: (targetModule, req, load, config) ->
    @replaceDefine()
    req [targetModule], (value) =>
      load value
      @restoreDefine()
      @printDependency()
  restoreDefine: ->
    window.define = @amdDefine
  replaceDefine: ->
    @amdDefine = window.define
    log = @log
    window.define = (name, deps, callback) =>
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
        log.push "'#{uri}'->'#{requirejs.toUrl(dep)}';" for dep in deps[1..] # skip 'module' in deps
        rawCallback.apply this, args
      if name?
        @amdDefine name, deps, callback
      else
        @amdDefine deps, callback
  printDependency: ->
    # see DOT language
    # http://www.graphviz.org/doc/info/lang.html
    @print "digraph dependency {"
    @print "  #{entry}" for entry in log
    @print "}"
  print: str ->
    window?.console?.log str
