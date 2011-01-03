(function ($) {
  
Drupal.game.map = Drupal.game.map || {};

Drupal.game.map.zoom = undefined;
Drupal.game.map.tileSize = Drupal.settings.tile_size;
Drupal.game.map.mapSize = Drupal.settings.map_size;
Drupal.game.map.borderCache = Drupal.settings.border_cache;

Drupal.game.map.init = function() {
  this.resetZoom();
}

Drupal.game.map.coordinateLength = function() {
  // Resolutions are zoom levels to squares on the edge of a tile.
  var resolutions = {0: 1,1: 2,2: 4, 3:8, 4:16, 5:32, 6:64, 7:128, 8:256, 9:512};
  return this.tileSize * resolutions[this.zoom];
}

Drupal.game.map.resetZoom = function() {
  var zoom;
  zoom = Drupal.settings.defaultz;
  this.setZoom(zoom);
}

Drupal.game.map.setZoom = function(z) {
  if(z < 0) {
    z = 0;
  } else if(z > 9) {
    z = 9;
  }
  this.zoom = z;
  var totalSize = tileSize*mapSize/resolutions[zoom];
  $("#map_viewport").width(totalSize);
  $("#map_viewport").height(totalSize);
}

Drupal.game.map.zoomIn = function() {
  this.setZoom(this.zoom--);
}

Drupal.game.map.zoomOut = function() {
  this.setZoom(this.zoom--);
}

})(jQuery);

