(function ($) {

  Drupal.game.map.layers = Drupal.game.map.layers || {};
  Drupal.game.map.layers.map = Drupal.game.map;

  Drupal.game.map.layers.tilesets = Drupal.settings.tilesets;
  // Lock for the checkAll() function so that we don't check too many times on
  // a particular event trigger.
  Drupal.game.map.layers.checkLock = false;

  Drupal.game.map.layers.checkAll = function() {
    if(!this.checkLock) {
      for(var i = 0; i < this.tilesets.length; i++) {
        this.check(this.tilesets[i]);
      }
    }
  }
  
  Drupal.game.map.layers.check = function(type) {
    var visTiles = this.getVisibleTiles();
    var visTilesMap = {};
    var fetchTiles = new Array();
    for(var i = 0; i < visTiles.length; i++) {
      var tileArr = visTiles[i];
      if(tileArr[0] >= 0 && tileArr[1] >= 0) {
        var tileName = type + '-' + tileArr[0] + '-' + tileArr[1] + '-' + zoom;
        visTilesMap[tileName] = true;
        var divName = "#" + tileName;
        if($(divName).length == 0) {
          var cached = $("#map_viewport").data(tileName);
          if(cached != undefined && cached.html != undefined) {
            $("#map_viewport").append(cached.html);
          } else {
            fetchTiles.push(tileName);
          }
        }
      }
    }

    var url = Drupal.settings.basePath + "?q=tiles";
    var fetch = false;
    for(var tile in fetchTiles) {
      url = url + "&tiles[]=" + encodeURIComponent(fetchTiles[tile]);
      fetch = true;
    }
    if(fetch) {
      $.getJSON(url, function(data) {
        if(data != undefined) {
          $.each(data, function(index, value) {
            if(value != undefined && value.html != undefined) {
              $("#map_viewport").append(value.html);
              $("#map_viewport").data(index, value);
            }
          });
        }
      }, "json");
    }
    
    $("#map_viewport img").each(function(i) {
      if($(this).hasClass(type)) {
        var id = $(this).attr('id');
        if(visTilesMap[id] != true) {
          $(this).remove();
        }
      }
    });
  }
  
  Drupal.game.map.layers.clear = function(type) {
    $("#map_viewport img").each(function(i) {
      if($(this).hasClass(type)) {
        $(this).remove();
      }
    });
  }
  
  Drupal.game.map.layers.checkAll = function() {
    for(var i = 0; i < this.tilesets.length; i++) {
      this.clear(this.tilesets[i]);
    }
  }
  
  Drupal.game.map.layers.getVisibleTiles = function() {
    // Get the current offset from the 0, 0 position.
    var mapX = this.map.viewport.left();
    var mapY = this.map.viewport.top();

    // Get the first tile that should be visible. The border_cache variable
    // exists as the script should download border_cache tiles beyond the
    // visible border.
    var startX = Math.abs(Math.floor(mapX / this.map.tileSize)) - this.map.border_cache;
    var startY = Math.abs(Math.floor(mapY / this.map.tileSize)) - this.map.border_cache;

    // Get the number of tiles that are completely visible. The border_cache
    // variable exists so that the script downloads partially visible tiles as
    // well. This value does not change unless the viewport size is changed.
    var tilesX = Math.ceil($("#map_viewport").width() / this.map.tileSize) + this.map.border_cache;
    var tilesY = Math.ceil($("#map_viewport").height() / this.map.tileSize) + this.map.border_cache;

    // Generate the list of visible tiles based on the above variables.
    var visibleTiles = [];
    var counter = 0;
    for (var x = startX; x <= (tilesX + startX); x++) {
      for (var y = startY; y <= (tilesY + startY); y++) {
        visibleTiles[counter++] = [x, y];
      }
    }

    return visibleTiles;
  }
  
  
})(jQuery);  