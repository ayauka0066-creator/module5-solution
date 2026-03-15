(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.filter('keepIf', keepIfFilter)
.directive('foundItems', FoundItemsDirective);


/* =========================================================
   HomeController  –  TODO STEP 0 through STEP 4
   ========================================================= */

// TODO: STEP 0
// Inject $dc (the menu data service / DataService) into HomeController
// so we can use it to load menu items when the Specials tile is clicked.
angular.module('NarrowItDownApp')
  .controller('HomeController', HomeController);

HomeController.$inject = ['$scope', '$http', 'DataService'];

function HomeController($scope, $http, DataService) {

  var homeCtrl = this;

  // TODO: STEP 1
  // Using $http, retrieve the home-snippet.html from the server
  // (it lives at snippets/home-snippet.html).
  $http.get('snippets/home-snippet.html')
    .then(function (response) {

      // TODO: STEP 2
      // Call DataService.getCategories() to retrieve all menu categories.
      // (DataService handles the Ajax call to the menu API.)
      DataService.getCategories()
        .then(function (categories) {

          // TODO: STEP 3
          // Pick a *random* category from the returned array.
          var randomIdx = Math.floor(Math.random() * categories.length);
          var randomCategory = categories[randomIdx];

          // TODO: STEP 4
          // Replace the {{randomCategoryShortName}} placeholder in the
          // home-snippet HTML with the randomly chosen category's short_name,
          // wrapped in single quotes so the resulting onclick becomes valid JS:
          //   onclick="$dc.loadMenuItems('L');"
          //
          // Then assign the finished HTML to homeCtrl.snippetHtml so Angular
          // can bind it into the page with ng-bind-html.
          var snippet = response.data;
          snippet = snippet.replace(
            '{{randomCategoryShortName}}',
            "'" + randomCategory.short_name + "'"
          );

          homeCtrl.snippetHtml = snippet;
        });
    });
}


/* =========================================================
   DataService  –  wraps all server / API calls
   ========================================================= */

DataService.$inject = ['$http', 'ApiPath'];

function DataService($http, ApiPath) {

  var service = this;

  // Returns a promise that resolves to an array of category objects.
  // Each object has at least { short_name, name }.
  service.getCategories = function () {
    return $http({
      method: 'GET',
      url: (ApiPath + '/categories.json')
    }).then(function (response) {
      return response.data;
    });
  };

  // Loads menu items for a given category short_name.
  service.getMenuItems = function (shortName) {
    return $http({
      method: 'GET',
      url: (ApiPath + '/menu_items/' + shortName + '.json')
    }).then(function (response) {
      return response.data;
    });
  };
}


/* =========================================================
   Remaining app code (unchanged from Module 4 solution)
   ========================================================= */

function keepIfFilter() {
  return function (items, property, value) {
    var result = [];

    if (!value) {
      return items;
    }

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item[property].toLowerCase().indexOf(value.toLowerCase()) !== -1) {
        result.push(item);
      }
    }

    return result;
  };
}


NarrowItDownController.$inject = ['MenuSearchService'];

function NarrowItDownController(MenuSearchService) {
  var ctrl = this;
  ctrl.searchTerm = '';
  ctrl.found = [];

  ctrl.search = function () {
    if (!ctrl.searchTerm) {
      ctrl.found = [];
      return;
    }
    MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
      .then(function (items) {
        ctrl.found = items;
      });
  };
}


MenuSearchService.$inject = ['$http', 'ApiPath'];

function MenuSearchService($http, ApiPath) {
  var service = this;

  service.getMatchedMenuItems = function (searchTerm) {
    return $http({
      method: 'GET',
      url: (ApiPath + '/menu_items/all_items.json')
    }).then(function (response) {
      var allItems = response.data.menu_items;
      var result = [];
      for (var i = 0; i < allItems.length; i++) {
        if (allItems[i].description.toLowerCase()
              .indexOf(searchTerm.toLowerCase()) !== -1) {
          result.push(allItems[i]);
        }
      }
      return result;
    });
  };
}


function FoundItemsDirective() {
  var ddo = {
    templateUrl: 'found-items.html',
    scope: {
      items: '<',
      onRemove: '&'
    },
    controller: FoundItemsDirectiveController,
    controllerAs: 'ctrl',
    bindToController: true
  };
  return ddo;
}


FoundItemsDirectiveController.$inject = [];

function FoundItemsDirectiveController() {
  // nothing extra needed
}

})();
