asyncTest "dependency module has load method", 1, () ->
  require ["dependency"], (dependency) ->
    ok dependency.load?
    start()

asyncTest "log should be empty at 1st", 2, () ->
  require ["dependency"], (dependency) ->
    ok $.isArray(dependency.log)
    deepEqual dependency.log.length, 0
    start()

asyncTest "dependency plugin replaces define method", 2, () ->
  before = define
  deferred = $.Deferred()
  define "dummy", () ->
  require ["dependency!dummy"], () ->
    notDeepEqual define, before, "define method should be replaced"
    start()
    deferred.resolve()
  after = define
  deferred.done ->
    deepEqual before, after, "define method is same to before"

asyncTest "dependency plugin creates log", 2, () ->
  require ["dependency!callar", "dependency"], (callar, dependency) ->
    deepEqual dependency.log, ["\"./callar.js\"->\"./callee.js\";"]
    start()
