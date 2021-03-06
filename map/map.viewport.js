(function ($) {

  Drupal.game.map.viewport = Drupal.game.map.viewport || {};

  Drupal.game.map.viewport.top = function() {
    return $("#map_viewport").offset().top;
  }

  Drupal.game.map.viewport.left = function() {
    return $("#map_viewport").offset().left;
  }

  Drupal.game.map.viewport.moveCursor = function() {
    return $("#map_viewport").css("cursor", "move");
  }

  Drupal.game.map.viewport.clearCursor = function() {
    return $("#map_viewport").css("cursor", "");
  }

  Drupal.game.map.viewport.moveDelta = function(dLeft, dTop) {
    var left = this.left(), top = this.top();
    left += dLeft;
    top += dTop;
    $("#map_viewport").offset({left: left, top: top});
    
    // Check for map viewport bounding box.
    Drupal.game.map.checkBounds();
    // Check layers for newly loaded tiles.
    Drupal.game.map.layers.checkAll();
  }

})(jQuery);