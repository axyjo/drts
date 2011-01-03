(function ($) {

  Drupal.game.map.drag = Drupal.game.map.drag || {};
  Drupal.game.map.drag.map = Drupal.game.map;

  Drupal.game.map.dragging = false;

  Drupal.game.map.drag.start = function(e) {
    // Get the starting position of the drag gesture.
    this.dragStartLeft = e.clientX;
    this.dragStartTop = e.clientY;
    // The difference between the dragStart position and dragEnd position will be
    // used to change the offset of the viewport.
    this.dragging = true;
  }

  Drupal.game.map.drag.move = function(e) {
    // Update the dragEnd variables with the current mouse position.
    this.dragEndLeft = e.clientX;
    this.dragEndTop = e.clientY;
    // Caculate change in position.
    this.dragDeltaLeft = this.dragEndTop - this.dragStartTop;
    this.dragDeltaTop = this.dragEndTop - this.dragStartTop;
  }

  Drupal.game.map.drag.end = function() {
    this.dragging = false;
  }

})(jQuery);
