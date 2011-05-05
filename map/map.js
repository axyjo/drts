(function ($) {

Drupal.game.map = Drupal.game.map || {};

Drupal.behaviors.game = {
  attach: function(context, settings) {
    // Set the initial state of the game.
    $('#map', context).once('game', Drupal.game.map.init);
  }
};

Drupal.game.map.init = function() {
  Drupal.game.map.maxTiles = 0;
  Drupal.game.map.tileSize = Drupal.settings.tile_size;
  Drupal.game.map.mapSize = 512;
  Drupal.game.map.borderCache = 1;
  Drupal.game.map.layers.init();
  Drupal.game.map.events.init();
  Drupal.game.map.resetZoom();
  //$(window).triggerHandler('resize');
  // Debug white strip issues later.
  window.setInterval(Drupal.game.map.events.resize, '100');
  window.setInterval(Drupal.game.map.events.resize, '2000');
  Drupal.game.map.checkBounds();
  Drupal.game.map.layers.checkAll();
}

Drupal.game.map.coordinateLength = function() {
  // Resolutions are zoom levels to pixels per coordinate. Zoom level 0 is
  // zoomed all the way in, while zoom level 7 is zoomed all the way out.
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
  Drupal.game.map.maxTiles = totalSize/this.tileSize;
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

Drupal.game.map.checkBounds = function() {
  var viewport = $("#map_viewport");
  var totalSize = this.mapSize* this.coordinateLength();
  var left_offset = 0 + $("#map_bar").width();
  var top_offset = 0;
  if(Drupal.toolbar != undefined) {
    top_offset += Drupal.toolbar.height();
  }

  if(viewport.offset().left - left_offset > 0) {
    viewport.offset({left: left_offset});
  } else if(viewport.offset().left < viewport.width() - totalSize + left_offset) {
    viewport.offset({left: viewport.width() - totalSize + left_offset});
  }
  
  if(viewport.offset().top + top_offset > 0) {
    viewport.offset({top: 0 + top_offset});
  } else if(viewport.offset().top < viewport.height() - totalSize + top_offset) {
    viewport.offset({top: viewport.height() - totalSize + top_offset});
  }
}

})(jQuery);

