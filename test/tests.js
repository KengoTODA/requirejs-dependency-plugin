(function() {

  asyncTest("dependency module has load method", 1, function() {
    return require(["dependency"], function(dependency) {
      ok(dependency.load != null);
      return start();
    });
  });

  asyncTest("log should be empty at 1st", 2, function() {
    return require(["dependency"], function(dependency) {
      ok($.isArray(dependency.log));
      deepEqual(dependency.log.length, 0);
      return start();
    });
  });

  asyncTest("dependency plugin replaces define method", 2, function() {
    var after, before, deferred;
    before = define;
    deferred = $.Deferred();
    define("dummy", function() {});
    require.config({
      isBuild: true
    });
    require(["dependency!dummy"], function() {
      notDeepEqual(define, before, "define method should be replaced");
      start();
      return deferred.resolve();
    });
    after = define;
    return deferred.done(function() {
      return deepEqual(before, after, "define method is same to before");
    });
  });

  asyncTest("dependency plugin creates log", 2, function() {
    require.config({
      isBuild: true
    });
    return require(["dependency!callar", "dependency"], function(callar, dependency) {
      deepEqual(dependency.log, ["\"./callar.js\"->\"./callee.js\";"]);
      return start();
    });
  });

}).call(this);
