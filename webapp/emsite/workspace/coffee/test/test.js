// Generated by CoffeeScript 1.4.0
var main,
  __slice = [].slice;

main = function() {
  var args, func2, inherit, makeObj, objarray, someClass, someFunc, useless;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  someFunc = function(func, arg) {
    return func(arg);
  };
  someFunc(function(x) {
    return x * x;
  }, arg);
  func2 = function(input, total) {
    var i;
    input = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = parseInt(total); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(i);
      }
      return _results;
    })();
    return input;
  };
  someClass = (function() {

    function someClass(word) {
      this.dummyprop = word;
    }

    return someClass;

  })();
  (function(path) {
    return {
      init: function(path) {
        var dummyObj;
        dummyObj = {};
        return {
          canvas: dummyObj
        };
      }
    };
  })(path);
  (function(path) {
    return function() {
      return 'f';
    };
  })();
  useless = (function() {

    function useless() {
      this.unit = {};
    }

    return useless;

  })();
  console.log('500');
  'string literal';

  makeObj = function(obj) {
    var f;
    f = function() {};
    f.prototype = obj;
    return new f();
  };
  inherit = function(subClass, superClass) {
    var superCopy;
    superCopy = makeObj(subClass);
    superCopy.constructor = subClass;
    subClass.prototype = superCopy;
    return {};
  };
  return objarray = [
    {
      name: 'head',
      face: true,
      leghand: false
    }, {
      name: 'arm',
      face: false,
      leghand: false
    }, {
      name: 'foot',
      face: false,
      leghand: true
    }
  ];
};
