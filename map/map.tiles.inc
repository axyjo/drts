<?php

function map_tile_handler() {
  // Set up initial variables.
  $tile_size = variable_get('map_tile_size');
  $max = variable_get('map_max_size');
  $return = array();

  foreach($_GET['tiles'] as $tile) {
    $pieces = explode('-', $tile);
    $data = array(
      'x' => $pieces[1],
      'y' => $pieces[2],
      'z' => $pieces[3],
      'type' => $pieces[0],
    );

    if(!is_numeric($data['x']) || !is_numeric($data['y']) || !is_numeric($data['z'])) {
      $type = 'transparent';
    }
  
    // Check to ensure that the requested tile is within bounds. If not, then
    // change the tile to a transparent tile.
    $max_tiles = $max*pow(2, $data['z'])/$tile_size;
    if($data['x'] < 0 || $data['y'] < 0 || $data['z'] < 0 || $data['x'] >= $max_tiles || $data['y'] >= $max_tiles || $data['z'] > 9) {
      $data['type'] = 'transparent';
    }

    // Check to see if the tile generator exists. If not, then change the tile to
    // a transparent tile.
    $function = 'map_'.$data['type'].'_tile_generate';
    if(!is_callable($function)) {
      $data['type'] = 'transparent';
      $function = 'map_'.$data['type'].'_tile_generate';
    }

    // Determine the unique string identifier for the current tile.
    $data['tileName'] = $data['type'] . '-' . $data['x'] . '-' . $data['y'] . '-'. $data['z'];
    $cache_string = 'map_'.$data['type'].'_tile_'.$data['tileName'];

    // Check to see if the tile is cached. If it is, print it and stop script. If
    // not, then go ahead and generate it, then cache it.
    if($cache = cache_get($cache_string) && !empty($cache->data)) {
      $data = $cache->data;
    } else {
      $data['left'] = $data['x'] * $tile_size;
      $data['top'] = $data['y'] * $tile_size;

      $data['img'] = array(
        'class' => $data['type'] . ' map_tiles',
        'style' => 'position: absolute; left: ' . $data['left'] . 'px; top: ' . $data['top'] . 'px;',
        'id' => $data['tileName'],
      );
      if($src = call_user_func($function, $data, $tile_size)) {
        $data['img']['src'] = $src;
      }
      $data['html'] = '<img ';
      foreach($data['img'] as $attribute => $value) {
        $data['html'] .= $attribute . '="' . $value. '" ';
      }
      $data['html'] .= '/>';
      cache_set($cache_string, $data);
    }
    
    $return[$tile] = $data;
  }
  return drupal_json_output($return);
}

function map_base_tile_generate($data, $tile_size) {
  return drupal_get_path('module', 'map').'/tiles/grass.png';
}

function map_transparent_tile_generate($data, $tile_size) {
  return FALSE;
}

function map_tile_click($x, $y) {
  module_invoke_all('click_map', $x, $y);
  echo('Map click on ('.$x.', '.$y.').');
  drupal_exit();
}
