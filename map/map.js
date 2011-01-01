(function ($) {
  $(document).ready(function() {
    var tileSize = Drupal.settings.tile_size;
    var mapSize = Drupal.settings.map_size;
    // Resolutions are zoom levels to squares on the edge of a tile.
    var resolutions = {0: 1,1: 2,2: 4, 3:8, 4:16, 5:32, 6:64, 7:128, 8:256, 9:512};
    var dragging = false;
    var top;
    var left;
    var dragStartTop;
    var dragStartLeft;
    var zoom = Drupal.settings.defaultz;
    var totalSize;
    var border_cache = 2;
    // This is the minimum pixel distance for inertial dragging to work.
    var minDistance = tileSize*3;
    // By storing the look-ups in a variable, we may be able to squeeze some
    // extra performance as it saves the browser from having to look up each div
    // every single time we want to perform an action on it.
    var throbber = $("#throbber");
    var viewport = $("#map_viewport");
    var map = $("#map");
    // Store the hover/click request in a variable so that it can be easily
    // aborted.
    var ajax_request;
    
    // Preload and cache tile images by adding them to a hidden element.
    var cache = $('body').append('<div id="cache" style="display:none/>').children('#cache');
    $.each(Drupal.settings.precache, function (i, val) {
      $('<img/>').attr('src', val).appendTo(cache);
    });

    map.bind("click", function(e) {
      var pos = getPosition(e);
      data_request("click", pos);
    });

    map.bind("dblclick", function(e) {
      zoom--;
      setZoom(zoom, e);
    });

    map.bind("mousedown", function(e) {
      map.data("mouseEvents", [e]);
      dragStartLeft = e.clientX;
      dragStartTop = e.clientY;
      viewport.css("cursor" , "move");

      top = viewport.offset().top;
      left = viewport.offset().left;

      dragging = true;
      // The following return statement exists in order to prevent the user's
      // browser from dragging the tile image like a conventional picture.
      return false;
    });

    map.bind("mousemove", function(e) {
      if(dragging) {
        var mouseEvents = map.data("mouseEvents");
        if (e.timeStamp - mouseEvents[mouseEvents.length-1].timeStamp > 40) {
          mouseEvents.push(e);
          if (mouseEvents.length > 2) {
            mouseEvents.shift();
          }
        }

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
    $(document).bind("mouseup", function(e) {
      dragging = false;
      var mouseEvents = map.data("mouseEvents");
      if (e.timeStamp - mouseEvents[mouseEvents.length-1].timeStamp > 40) {
        mouseEvents.push(e);
        if (mouseEvents.length > 2) {
          mouseEvents.shift();
        }
      }

      viewport.stop();
      viewport.css("text-indent", 100);

      var lastE = map.data("mouseEvents").shift();

      var x1 = lastE.pageX;
      var y1 = lastE.pageY;
      var t1 = lastE.timeStamp;
      var x2 = e.pageX;
      var y2 = e.pageY;
      var t2 = e.timeStamp;

      // Deltas
      var dX = x2 - x1,
          dY = y2 - y1,
          dTime = Math.max(t2 - t1, 1);

      // Speeds
      var speedX = Math.max(Math.min(dX/dTime, 1), -1),
          speedY = Math.max(Math.min(dY/dTime, 1), -1);

      // Distance moved (Euclidean distance)
      var distance = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
      
      if (distance > minDistance) {
        // Momentum
        var lastStepTime = new Date();
        viewport.animate({ textIndent: 0 }, {
          duration: Math.max(Math.abs(speedX), Math.abs(speedY)) * 2000,
          step: function(currentStep){
              speedX *= (currentStep / 100);
              speedY *= (currentStep / 100);

              var now = new Date();
              var stepDuration = now.getTime() - lastStepTime.getTime();

              lastStepTime = now;

              var position = viewport.position();

              var newLeft = (position.left + (speedX * stepDuration / 4)),
                  newTop = (position.top + (speedY * stepDuration / 4));

              viewport_safe_move(newLeft, newTop);
          }
        });
      }

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
      var x_val = e.pageX - offset.left + Math.abs(viewport.offset().left);
      var y_val = e.pageY - offset.top + Math.abs(viewport.offset().top);

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
      viewport.width(totalSize);
      viewport.height(totalSize);
      if(typeof e  != 'undefined') {
        updatePosition(e);
      }
      resize();
      window.setTimeout(resize, 100);
    }

    function pan(delta_x, delta_y, e) {
      var x = viewport.offset().left-delta_x;
      var y = viewport.offset().top-delta_y;
      viewport_safe_move(x, y);
      updatePosition(e);
    }

    function viewport_safe_move(left, top) {
      if(left > 0) {
        left = 0;
      } else if(left < (-1*totalSize)+viewport.width()) {
        left = (-1*totalSize)+viewport.width();
      }

      if(top > 0) {
        top = 0;
      } else if(top < (-1*totalSize)+viewport.height()) {
        top = (-1*totalSize)+viewport.height();
      }

      viewport.offset({top: top, left: left});
      // Performance tweak: don't checkAllTiles() here. Instead, check it after
      // the mouse is let go. Downside: less instantaneous loading, but this can
      // be fixed using liberal prefetch options and display gimmics down the
      // road such as caching beyond the borders or just scaling the currently
      // loaded images like Google Maps.
    }

    function getVisibleTiles() {
      // Get the current offset from the 0, 0 position.
      var mapX = viewport.offset().left;
      var mapY = viewport.offset().top;

      // Get the first tile that should be visible. The border_cache variable
      // exists as the script should download border_cache tiles beyond the
      // visible border.
      var startX = Math.abs(Math.floor(mapX / tileSize)) - border_cache;
      var startY = Math.abs(Math.floor(mapY / tileSize)) - border_cache;

      // Get the number of tiles that are completely visible. The border_cache
      // variable exists so that the script downloads partially visible tiles as
      // well. This value does not change unless the viewport size is changed.
      var tilesX = Math.ceil(viewport.width() / tileSize) + border_cache;
      var tilesY = Math.ceil(viewport.height() / tileSize) + border_cache;

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
      var visTilesMap = {};
      for(var i = 0; i < visTiles.length; i++) {
        var tileArr = visTiles[i];
        if(tileArr[0] >= 0 && tileArr[1] >= 0) {
          var tileName = type + '/' + tileArr[0] + '/' + tileArr[1] + '/' + zoom;
          visTilesMap[tileName] = true;
          var divName = "#" + tileName;
          if($(divName).length == 0) {
            var cached = viewport.data(tileName);
            if(cached != undefined) {
              viewport.append(cached.html);
            } else {
              var url = Drupal.settings.basePath + "?q=tiles";
              $.getJSON(url, {x:tileArr[0], y: tileArr[1], z: zoom, type: type}, function(data) {
                if(data != undefined && data.html != undefined) {
                  viewport.append(data.html);
                  viewport.data(tileName, data);
                }
              }, "json");
            }
          }
        }
      }
      
      $("#map_viewport img").each(function(i) {
        if($(this).hasClass(type)) {
          var id = $(this).attr('id');
          if(visTilesMap[id] != true) {
            $(this).remove();
          }
        }
      });
    }
    
    function clearAllTiles(type) {
      $("#map_viewport img").each(function(i) {
        if($(this).hasClass(type)) {
          $(this).remove();
        }
      });
    }

    function resize() {
      viewport.width($(window).width());
      viewport.height($(window).height()-Drupal.toolbar.height());
      checkAllLayers();
    }
    window.setTimeout(resize, 100);
    $(window).resize(resize);
    
    throbber.hide();  
    setZoom(zoom);

  });
})(jQuery);

