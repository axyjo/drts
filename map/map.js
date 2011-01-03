(function ($) {
  
Drupal.game.map = Drupal.game.map || {};

Drupal.behaviors.game = {
  attach: function(context, settings) {
    // Set the initial state of the game.
    $('#map', context).once('game', Drupal.game.map.init);
  }
};

Drupal.game.map.zoom = undefined;

Drupal.game.map.init = function() {
  Drupal.game.map.tileSize = Drupal.settings.tile_size;
  Drupal.game.map.mapSize = Drupal.settings.map_size;
  Drupal.game.map.borderCache = Drupal.settings.border_cache;
  Drupal.game.map.layers.tilesets = Drupal.settings.tilesets;
  $(document).ready(function() {
    Drupal.game.map.events.init();
    Drupal.game.map.resetZoom();
    $(window).triggerHandler('resize');
    window.setTimeout(Drupal.game.map.events.resize, '1');
  });
}

Drupal.game.map.coordinateLength = function() {
  // Resolutions are zoom levels to pixels per coordinate. Zoom level 0 is
  // zoomed all the way in, while zoom level 9 is zoomed all the way out.
  // Answers the question: How long is one side of the square allocated to a
  // coordinate (in pixels)? Response is equivalent to the following code:
  // var resolutions = {0: 1,1: 2,2: 4, 3:8, 4:16, 5:32, 6:64, 7:128};
  return Math.pow(2, this.zoom);
}

Drupal.game.map.resetZoom = function() {
  var zoom;
  zoom = Drupal.settings.defaultz;
  this.setZoom(zoom);
}

Drupal.game.map.setZoom = function(z) {
  if(z < 0) {
    z = 0;
  } else if(z > 7) {
    z = 7;
  }
  this.zoom = z;
  var totalSize = this.mapSize* this.coordinateLength();
  $("#map_viewport").width(totalSize);
  $("#map_viewport").height(totalSize);
  this.layers.checkAll();
}

Drupal.game.map.zoomIn = function() {
  this.setZoom(this.zoom--);
}

Drupal.game.map.zoomOut = function() {
  this.setZoom(this.zoom--);
}

})(jQuery);

