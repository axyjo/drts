(function ($) {

  Drupal.game.map.events = Drupal.game.map.events || {};
  
  Drupal.game.map.events.init = function() {
    // Mouse events.
    $("#map").bind("click", Drupal.game.map.events.click);
    $("#map").bind("dblclick", Drupal.game.map.events.dblclick);
    $("#map").bind("mousedown", Drupal.game.map.events.mousedown);
    $("#map").bind("mousemove", Drupal.game.map.events.mousemove);
    // Instead of binding the mouseup event to the map, bind it to the document
    // so that even if the mouse is let go when the cursor is ourside of the
    // div, the map will not drag again when the cursor is brought in to the
    // div again.
    $(document).bind("mouseup", this.mouseup);
    
    // Keyboard events, using the jQuery Hotkeys plugin.
    $(document).bind('keydown', 'up', function() {Drupal.game.map.viewport.moveDelta(0, 100);});
    $(document).bind('keydown', 'down', function() {Drupal.game.map.viewport.moveDelta(0, -100);});
    $(document).bind('keydown', 'left', function() {Drupal.game.map.viewport.moveDelta(100, 0);});
    $(document).bind('keydown', 'right', function() {Drupal.game.map.viewport.moveDelta(-100, 0);});

    $(document).bind('keydown', '+', function() {Drupal.game.map.zoomIn();});
    $(document).bind('keydown', '-', function() {Drupal.game.map.zoomOut();});
    
    // Window events.
    $(window).resize(Drupal.game.map.events.resize);
  }

  Drupal.game.map.events.click = function(e) {
    var position = Drupal.game.map.bar.position(e);
    Drupal.game.map.bar.populate(position);
  }

  Drupal.game.map.events.dblclick = function(e) {
    Drupal.game.map.zoomIn();
    Drupal.game.map.bar.position(e);
  }

  Drupal.game.map.events.mousedown = function(e) {
    Drupal.game.map.drag.start(e);
    Drupal.game.map.viewport.moveCursor();
    // The following return statement exists in order to prevent the user's
    // browser from dragging the tile image like a conventional picture.
    return false;
  }

  Drupal.game.map.events.mousemove = function(e) {
    // First check if we're in the middle of a dragging gesture.
    if(Drupal.game.map.drag.dragging) {
      Drupal.game.map.drag.move(e);
      // Move the viewport, based on the current change in positon.
      Drupal.game.map.viewport.moveDelta(Drupal.game.map.drag.dragDeltaLeft, Drupal.game.map.drag.dragDeltaTop);
    }
    Drupal.game.map.bar.position(e);
  }

  Drupal.game.map.events.mouseup = function(e) {
    if(Drupal.game.map.drag.dragging) {
      Drupal.game.map.drag.end();
    }
    Drupal.game.map.viewport.clearCursor();
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
