(function ($) {

  Drupal.game.map.bar = Drupal.game.map.bar || {};
  Drupal.game.map.bar.map = Drupal.game.map;

  Drupal.game.map.bar.init = function() {

  }

  Drupal.game.map.bar.populate = function(position) {
    if(position.x > 0 && pos.y > 0 && pos.x <= mapSize && pos.y <= mapSize) {
      if(typeof this.ajax_request != 'undefined') {
        ajax_request.abort();
      }
      // Store the hover/click request in a variable so that it can be easily
      // aborted.
      this.ajax_request = $.ajax({
        type: "GET",
        url: "?q=map_click/" + Math.floor(position.x) + '/' + Math.floor(position.y),
        success: function(data){
          $('#map_data').html(data);
        },
      });
    }
  }

  Drupal.game.map.bar.position = function(e) {
    // The offset function returns the distance from the edge of the page to
    // the edge of the map div.
    var offset = $("#map").offset();

    // Set x_val and y_val equal to the distance from the top-left of the
    // image layer.
    var x_val = e.pageX - offset.left + Math.abs(this.map.viewport.left());
    var y_val = e.pageY - offset.top + Math.abs(this.map.viewport.top());

    // Change x_val and y_val such that the script takes into consideration
    // the current zoom level and the tile size. First, divide by tile size to
    // convert from pixels from the top-left corner to the number of tiles
    // from the top-left corner. Then, multiply it by the corresponding
    // resolution for the current zoom level. Finally, get the ceiling value
    // because the possible values range from 1 to mapSize.
    x_val = Math.ceil(x_val/this.coordinateLength());
    y_val = Math.ceil(y_val/this.coordinateLength());

    position =  {x: x_val, y: y_val};
    $("#map_position").html(position.x + ", " + position.y);
    return position;
  }

})(jQuery);