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