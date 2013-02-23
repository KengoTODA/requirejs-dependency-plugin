requirejs.config({
  shim: {
    'jquery-plugin': 'jquery'
  }
});
require(['dependency!main'],function(){});
