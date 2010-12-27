(function ($) {
  $(document).ready(function() {
    var tileSize = Drupal.settings.tile_size;
    var mapSize = Drupal.settings.map_size;
    // Resolutions are zoom levels to squares on the edge of a tile.
    var resolutions = {0: 1,1: 2,2: 4, 3:8, 4:16, 5:32, 6:64, 7:128, 8:256, 9:512};
    var viewportWidth = 768;
    var viewportHeight = 576;
    var dragging = false;
    var top;
    var left;
    var dragStartTop;
    var dragStartLeft;
    var zoom = Drupal.settings.defaultz;
    var totalSize;
    var border_cache = 2;
    // By storing the look-ups in a variable, we may be able to squeeze some
    // extra performance as it saves the browser from having to look up each div
    // every single time we want to perform an action on it.
    var throbber = $("#throbber");
    var viewport = $("#map_viewport");
    var map = $("#map");
    // Store the hover/click request in a variable so that it can be easily
    // aborted.
    var ajax_request;

    throbber.hide();  
    setZoom(zoom);

    map.bind("click", function(e) {
      var pos = getPosition(e);
      data_request("click", pos);
    });

    map.bind("dblclick", function(e) {
      zoom--;
      setZoom(zoom, e);
    });

    map.bind("mousedown", function(e) {
      dragStartLeft = e.clientX;
      dragStartTop = e.clientY;
      viewport.css("cursor" , "move");

      top = stripPx(viewport.css("top"));
      left = stripPx(viewport.css("left"));

      dragging = true;
      // The following return statement exists in order to prevent the user's
      // browser from dragging the tile image like a conventional picture.
      return false;
    });

    map.bind("mousemove", function(e) {
      if(dragging) {
        var new_left = left + (e.clientX - dragStartLeft);
        var new_top = top + (e.clientY - dragStartTop);
        viewport_safe_move(new_left, new_top);
      } else {
        var pos = updatePosition(e);
      }
    });

    // Instead of binding the mouseup event to the map, bind it to the document
    // so that even if the mouse is let go when the cursor is ourside of the
    // div, the map will not drag again when the cursor is brought in to the
    // div again.
    $(document).bind("mouseup", function() {
      dragging = false;
      viewport.css("cursor", "");
      checkAllLayers();
    });

    function data_request(type, pos) {
      throbber.show();
      if(pos.x > 0 && pos.y > 0 && pos.x <= mapSize && pos.y <= mapSize) {
        if(typeof ajax_request != 'undefined') ajax_request.abort();
        ajax_request = $.ajax({
          type: "GET",
          url: "?q=map_" + type + "/" + Math.floor(pos.x) + '/' + Math.floor(pos.y),
          success: function(data){
            $('#map_data').html(data);
          },
        });
      }
      throbber.hide();
    }

    function updatePosition(e) {
      var pos = getPosition(e);
      $("#map_position").html(pos.x + ", " + pos.y);
      return pos;
    }

    function getPosition(e) {
      // The offset function returns the distance from the edge of the page to
      // the edge of the map div.
      var offset = map.offset();

      // Set x_val and y_val equal to the distance from the top-left of the
      // image layer.
      var x_val = e.pageX - offset.left + Math.abs(stripPx(viewport.css("left")));
      var y_val = e.pageY - offset.top + Math.abs(stripPx(viewport.css("top")));

      // Change x_val and y_val such that the script takes into consideration
      // the current zoom level and the tile size. First, divide by tile size to
      // convert from pixels from the top-left corner to the number of tiles
      // from the top-left corner. Then, multiply it by the corresponding
      // resolution for the current zoom level. Finally, get the ceiling value
      // because the possible values range from 1 to mapSize.
      x_val = Math.ceil(x_val/tileSize*resolutions[zoom]);
      y_val = Math.ceil(y_val/tileSize*resolutions[zoom]);

      return {x: x_val, y: y_val};
    }

    function setPosition(x, y, z) {
      setZoom(z);
      setCenter(x, y);
    }

    function setCenter(x,y) {
      // TODO: Implement this function.
    }

    function setZoom(z, e) {
      if(z < 0) {
        z = 0;
      } else if(z > 9) {
        z = 9;
      }
      zoom = z;
      totalSize = tileSize*mapSize/resolutions[zoom];
      viewport.width(totalSize + "px");
      viewport.height(totalSize + "px");
      if(typeof e  != 'undefined') {
        updatePosition(e);
      }
      checkAllLayers();
    }

    function pan(delta_x, delta_y, e) {
      var x = stripPx(viewport.css("left"))-delta_x;
      var y = stripPx(viewport.css("top"))-delta_y;
      viewport_safe_move(x, y);
      updatePosition(e);
    }

    function viewport_safe_move(left, top) {
      if(left > 0) {
        left = 0;
      } else if(left < (-1*totalSize)+viewportWidth) {
        left = (-1*totalSize)+viewportWidth;
      }

      if(top > 0) {
        top = 0;
      } else if(top < (-1*totalSize)+viewportHeight) {
        top = (-1*totalSize)+viewportHeight;
      }

      viewport.css("top", top+"px");
      viewport.css("left", left+"px");
      // Performance tweak: don't checkAllTiles() here. Instead, check it after
      // the mouse is let go. Downside: less instantaneous loading, but this can
      // be fixed using liberal prefetch options and display gimmics down the
      // road such as caching beyond the borders or just scaling the currently
      // loaded images like Google Maps.
    }

    function stripPx(value) {
      if(value == "0" || value == "") return 0;
      return parseFloat(value.substring(0, value.length - 2));
    }

    function getVisibleTiles() {
      // Get the current offset from the 0, 0 position.
      var mapX = stripPx(viewport.css("left"));
      var mapY = stripPx(viewport.css("top"));

      // Get the first tile that should be visible. The border_cache variable
      // exists as the script should download border_cache tiles beyond the
      // visible border.
      var startX = Math.abs(Math.floor(mapX / tileSize)) - border_cache;
      var startY = Math.abs(Math.floor(mapY / tileSize)) - border_cache;

      // Get the number of tiles that are completely visible. The border_cache
      // variable exists so that the script downloads partially visible tiles as
      // well. This value does not change unless the viewport size is changed.
      var tilesX = Math.ceil(viewportWidth / tileSize) + border_cache;
      var tilesY = Math.ceil(viewportHeight / tileSize) + border_cache;

      // Generate the list of visible tiles based on the above variables.
      var visibleTiles = [];
      var counter = 0;
      for (var x = startX; x <= (tilesX + startX); x++) {
        for (var y = startY; y <= (tilesY + startY); y++) {
          visibleTiles[counter++] = [x, y];
        }
      }

      return visibleTiles;
    }

    function checkAllLayers() {
      checkLayers("base");
    }

    function checkLayers(type) {
      var visTiles = getVisibleTiles();
      clearTiles(type);
      var visTilesMap = {};
      for(var i = 0; i < visTiles.length; i++) {
        var tileArr = visTiles[i];
        if(tileArr[0] >= 0 && tileArr[1] >= 0) {
          var loc = tileArr[0] + '/' + tileArr[1] + '/' + zoom
          var tileName = type + '/' + loc;
          visTilesMap[loc] = true;
          var divName = "#" + tileName;
          if($(divName).length == 0) {
            var url = Drupal.settings.basePath + "?q=" + tileName;
            var left = (tileArr[0] * tileSize) + "px";
            var top = (tileArr[1] * tileSize) + "px";
            var element = $(document.createElement("img")).attr("id", tileName).attr("src", url).attr("class", type);
            element.css({"position" : "absolute", "left" : left, "top" : top});
            if(type == "overlay") {
              element.css("z-index", 5);
            }
            element.appendTo("#map_viewport");
          }
        }
      }
    }

    function clearTiles(type) {
      $("#map_viewport img").each(function(i) {
        if($(this).hasClass(type)) {
          $(this).remove();
        }
      });
    }
  });
})(jQuery);

