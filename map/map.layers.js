(function ($) {

  Drupal.game.map.layers = Drupal.game.map.layers || {};
  

  Drupal.game.map.layers.init = function() {
    // Lock for the checkAll() function so that we don't check too many times
    // on a particular event trigger.
    Drupal.game.map.layers.checkLock = false;
    Drupal.game.map.layers.tilesets = Drupal.settings.tilesets;
  }

  Drupal.game.map.layers.checkAll = function() {
    while(Drupal.game.map.layers.checkLock) {}
    if(!Drupal.game.map.layers.checkLock) {
      Drupal.game.map.layers.checkLock = true;
      for(var i = 0; i < this.tilesets.length; i++) {
        Drupal.game.map.layers.check(Drupal.game.map.layers.tilesets[i]);
      }
    }
    Drupal.game.map.layers.checkLock = false;
  }
  
  Drupal.game.map.layers.check = function(type) {
    var visTiles = Drupal.game.map.layers.getVisibleTiles();
    var visTilesMap = new Array();
    var fetchTiles = new Array();
    for(var i = 0; i < visTiles.length; i++) {
      var tileArr = visTiles[i];
      var tileName = type + '-' + tileArr.xPos + '-' + tileArr.yPos + '-' + Drupal.game.map.zoom;
      visTilesMap[tileName] = tileArr;
      $("#" + tileName).remove();
      var cached = $("#map_viewport").data(tileName);
      if(cached != undefined && cached.html != undefined) {
        $("#map_viewport").append(cached.html);
      } else {
        fetchTiles.push(tileName);
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
    $(window).triggerHandler('resize');
  }

  Drupal.game.map.layers.clear = function(type) {
    $("#map_viewport img").each(function(i) {
      if($(this).hasClass(type)) {
        $(this).remove();
      }
    });
  }
  
  Drupal.game.map.layers.clearAll = function() {
    for(var i = 0; i < Drupal.game.map.layers.tilesets.length; i++) {
      Drupal.game.map.layers.clear(Drupal.game.map.layers.tilesets[i]);
    }
  }
  
  Drupal.game.map.layers.getVisibleTiles = function() {
    var maxTiles = Drupal.game.map.maxTiles;
  
    // Get the current offset from the 0, 0 position.
    var mapX = Drupal.game.map.viewport.left();
    var mapY = Drupal.game.map.viewport.top();

    // Get the first tile that should be visible. The border_cache variable
    // exists as the script should download border_cache tiles beyond the
    // visible border.
    var startX = Math.abs(Math.floor(mapX / Drupal.game.map.tileSize)) - Drupal.game.map.borderCache;
    var startY = Math.abs(Math.floor(mapY / Drupal.game.map.tileSize)) - Drupal.game.map.borderCache;
    startX = Math.max(0, startX);
    startY = Math.max(0, startY);
    
    // Get the number of tiles that are completely visible. The border_cache
    // variable exists so that the script downloads partially visible tiles as
    // well. This value does not change unless the viewport size is changed.
    var tilesX = Math.ceil($("#map_viewport").width() / Drupal.game.map.tileSize) + Drupal.game.map.borderCache;
    var tilesY = Math.ceil($("#map_viewport").height() / Drupal.game.map.tileSize) + Drupal.game.map.borderCache;
    
    var endX = startX + tilesX;
    var endY = startY + tilesY;
    endX = Math.min(maxTiles - 1, endX);
    endY = Math.min(maxTiles - 1, endY);

    // Generate the list of visible tiles based on the above variables.
    var visibleTiles = [];
    var counter = 0;
    for (var x = startX; x <= endX; x++) {
      for (var y = startY; y <= endY; y++) {
        var tile = {xPos: x, yPos: y};
        visibleTiles[counter++] = tile;
      }
    }
    return visibleTiles;
  }
})(jQuery);
