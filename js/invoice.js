app = angular.module('invoice', []);

app.directive('contenteditable', function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attrs, ctrl) {
      elm.bind('blur', function() {
        scope.$apply(function() {
          if(ctrl) ctrl.$setViewValue(elm.html());
        });
      });
 
    }
  };
});

app.directive('preventDefault', function() {
    return function(scope, element, attrs) {
        $(element).click(function(event) {
            event.preventDefault();
        });
    }
})

app.directive('bsHolder', function() {
  return {
    compile: function (scope, element, attrs) {
      Holder.run({images: scope[0]})
    }
  };
})

app.directive('scrollEnd', function() {
  return {
    compile: function (scope, element, attrs) {
    }
  };
})

app.config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:ShowController, templateUrl:'partials/show.html'}).
      otherwise({redirectTo:'/'});
});


app.factory('SharedBroadcast', function($rootScope) {
    var sharedService = {};
    sharedService.message = '';

    sharedService.broadcastItem = function(msg,val) {
        this.message = msg;
    $rootScope.$broadcast(msg, val);
    };

    return sharedService;
});