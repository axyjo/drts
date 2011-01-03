(function ($) {

  Drupal.game.map.layers = Drupal.game.map.layers || {};
  // Lock for the checkAll() function so that we don't check too many times on
  // a particular event trigger.

  Drupal.game.map.layers.init = function() {
    Drupal.game.map.layers.checkLock = true;
    Drupal.game.map.layers.tilesets = Drupal.settings.tilesets;
  }

  Drupal.game.map.layers.checkAll = function() {
    if(!Drupal.game.map.layers.checkLock) {
      for(var i = 0; i < this.tilesets.length; i++) {
        Drupal.game.map.layers.check(Drupal.game.map.layers.tilesets[i]);
      }
    }
  }
  
  Drupal.game.map.layers.check = function(type) {
    var visTiles = Drupal.game.map.layers.getVisibleTiles();
    var visTilesMap = {};
    var fetchTiles = new Array();
    for(var i = 0; i < visTiles.length; i++) {
      var tileArr = visTiles[i];
      var tileName = type + '-' + tileArr.x + '-' + tileArr.y + '-' + Drupal.game.map.zoom;
      visTilesMap[tileName] = true;
      if($("#" + tileName).length == 0) {
        var cached = $("#map_viewport").data(tileName);
        if(cached != undefined && cached.html != undefined) {
          $("#map_viewport").append(cached.html);
        } else {
          fetchTiles.push(tileName);
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
  
  Drupal.game.map.layers.convertNegativeTile = function(tile) {
    var maxTiles = Drupal.game.map.maxTiles;
    tile = tile[0];
    if(tile.x >= maxTiles) {
      tile.x = tile.x % maxTiles;
    } else if(tile.x < 0) {
      tile.x = tile.x % maxTiles + maxTiles;
    }
    if(tile.y >= maxTiles) {
      tile.y = tile.y % maxTiles;
    } else if(tile.y < 0) {
      tile.y = tile.y % maxTiles + maxTiles;
    }
    return tile;
  }
  
  Drupal.game.map.layers.validateTiles = function(tiles) {
    var maxTiles = Drupal.game.map.maxTiles;
    for(var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];
      if(tile.x < 0 || tile.y < 0 || tile.x >= maxTiles || tile.y >= maxTiles) {
        var tile = tiles.splice(i, 1);
        tiles.push(this.convertNegativeTile(tile));
        // Keep the index where it was so that it can check the new element at
        // the same index.
        i--;
      }
    }
    return tiles;
  }
  
  Drupal.game.map.layers.getVisibleTiles = function() {
    // Get the current offset from the 0, 0 position.
    var mapX = Drupal.game.map.viewport.left();
    var mapY = Drupal.game.map.viewport.top();

    // Get the first tile that should be visible. The border_cache variable
    // exists as the script should download border_cache tiles beyond the
    // visible border.
    var startX = Math.abs(Math.floor(mapX / Drupal.game.map.tileSize)) - Drupal.game.map.borderCache;
    var startY = Math.abs(Math.floor(mapY / Drupal.game.map.tileSize)) - Drupal.game.map.borderCache;

    // Get the number of tiles that are completely visible. The border_cache
    // variable exists so that the script downloads partially visible tiles as
    // well. This value does not change unless the viewport size is changed.
    var tilesX = Math.ceil($("#map_viewport").width() / Drupal.game.map.tileSize) + Drupal.game.map.borderCache;
    var tilesY = Math.ceil($("#map_viewport").height() / Drupal.game.map.tileSize) + Drupal.game.map.borderCache;

    // Generate the list of visible tiles based on the above variables.
    var visibleTiles = [];
    var counter = 0;
    for (var x = startX; x <= (tilesX + startX); x++) {
      for (var y = startY; y <= (tilesY + startY); y++) {
        visibleTiles[counter++] = {x: x, y: y};
      }
    }
    return this.validateTiles(visibleTiles);
  }
  
  
})(jQuery);  