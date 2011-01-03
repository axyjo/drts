(function ($) {

  Drupal.game.map.events = Drupal.game.map.events || {};
  Drupal.game.map.events.map = Drupal.game.map;
  
  Drupal.game.map.events.init = function() {
    // Mouse events.
    $("#map").bind("click", this.click);
    $("#map").bind("dblclick", this.dblclick);
    $("#map").bind("mousedown", this.mousedown);
    $("#map").bind("mousemove", this.mousemove);
    // Instead of binding the mouseup event to the map, bind it to the document
    // so that even if the mouse is let go when the cursor is ourside of the
    // div, the map will not drag again when the cursor is brought in to the
    // div again.
    $(document).bind("mouseup", this.mouseup);
    
    // Keyboard events, using the jQuery Hotkeys plugin.
    $(document).bind('keydown', 'up', function() {this.map.viewport.moveDelta(0, 100);});
    $(document).bind('keydown', 'down', function() {this.map.viewport.moveDelta(0, -100);});
    $(document).bind('keydown', 'left', function() {this.map.viewport.moveDelta(100, 0);});
    $(document).bind('keydown', 'right', function() {this.map.viewport.moveDelta(-100, 0);});

    $(document).bind('keydown', '+', function() {this.map.zoomIn();});
    $(document).bind('keydown', '-', function() {this.map.zoomOut();});
    
    // Window events.
    $(window).resize(this.resize);
  }

  Drupal.game.map.events.click = function(e) {
    var position = this.map.bar.position(e);
    this.map.bar.populate(position);
  }

  Drupal.game.map.events.dblclick = function(e) {
    this.map.setZoom(this.zoom - 1);
    this.map.bar.position(e);
  }

  Drupal.game.map.events.mousedown = function(e) {
    this.map.drag.start(e);
    this.map.viewport.moveCursor();
    // The following return statement exists in order to prevent the user's
    // browser from dragging the tile image like a conventional picture.
    return false;
  }

  Drupal.game.map.events.mousemove = function(e) {
    // First check if we're in the middle of a dragging gesture.
    if(this.map.drag.dragging) {
      this.map.drag.move(e);
      // Move the viewport, based on the current change in positon.
      this.map.viewport.moveDelta(this.map.drag.dragDeltaLeft, this.map.drag.dragDeltaTop);
    }
    this.map.bar.position(e);
  }

  Drupal.game.map.events.mouseup = function(e) {
    if(this.map.drag.dragging) {
      this.map.drag.end();
    }
    this.map.viewport.clearCursor();
  }
  
  Drupal.game.map.events.resize = function() {
    var toolbar = Drupal.toolbar.height();
    $("#map_viewport").width($(window).width()-$("#map_bar").width());
    $("#map_viewport").height($(window).height() - toolbar);
    $("#map").offset({left: $(window).width() - $("#map_viewport").width(), top: toolbar});
    $("#map_bar").offset({top: toolbar});
    $("#map_bar").height($("#map_viewport").height());
    $("#map_bar").width($(window).width() - $("#map_viewport").width());
    $("#map_position").offset({top: $("#map_bar").height()});
  }

})(jQuery);
