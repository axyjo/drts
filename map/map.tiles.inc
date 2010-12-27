<?php

function map_tile_handler($x, $y, $z, $type) {
  // Set up initial variables.
  $tile_size = variable_get('map_tile_size');
  $min = variable_get('map_min_size');
  $max = variable_get('map_max_size');
  
  // Set the content type of the output.
  drupal_add_http_header('Content-Type', 'image/png');

  // Check to ensure that the requested tile is within bounds. If not, then
  // change the tile to a transparent tile.
  $max_tiles = $max/pow(2, $z);
  if($x < 0 || $y < 0 || $z < 0 || $x > $max_tiles || $y > $max_tiles || $z > 9) {
    $type = 'transparent';
  }

  // Check to see if the tile generator exists. If not, then change the tile to
  // a transparent tile.
  $function = 'map_'.$type.'_tile_generate';
  if(!is_callable($function)) {
    $type = 'transparent';
    $function = 'map_'.$type.'_tile_generate';
  }

  // Determine the unique string identifier for the current tile.
  $cache_string = 'map_'.$type.'_tile_';
  if($type == 'base') {
    $cache_string .= $z;
  } elseif($type == 'transparent') {
    $cache_string .= $tile_size;
  }

  // Check to see if the tile is cached. If it is, print it and stop script. If
  // not, then go ahead and generate it, then cache it.
  if($cache = cache_get($cache_string) && !empty($cache->data)) {
    print(base64_decode($cache->data));
    return;
  }

  $tile = call_user_func($function, $x, $y, $z, $tile_size);
  map_tile_cache($tile, $cache_string);
  imagepng($tile);
  drupal_exit();
}

function map_base_tile_generate($x, $y, $z, $tile_size) {
  $tiles_path = drupal_get_path('module', 'map').'/tiles/';
  $base = imagecreatefrompng($tiles_path.'grass_'.rand(0, 20).'.png');
  $tile = imagecreatetruecolor($tile_size,$tile_size);
  if(imagesx($base) != $tile_size || imagesy($base) != $tile_size) {
    imagecopyresampled($tile, $base, 0, 0, 0, 0, $tile_size, $tile_size, imagesx($base), imagesy($base));
    return $tile;
  }
  return $base;
}

function map_transparent_tile_generate($x, $y, $z, $tile_size) {
  $tile = imagecreatetruecolor($tile_size, $tile_size);
  imagesavealpha($tile, TRUE);
  $trans_colour = imagecolorallocatealpha($tile, 0, 0, 0, 127);
  imagefill($tile, 0, 0, $trans_colour);
  return $tile;
}

function map_tile_click($x, $y) {
  module_invoke_all('click_map', $x, $y);
  // TODO: Fix the following and change it to the "Drupal way."
  echo t('Map click on (:x,:y).', array(':x' => $x, ':y' => $y));
  die();
}

function map_tile_cache($tile_resource, $cache_name) {
  ob_start();
  imagepng($tile_resource);
  $tile_content = ob_get_contents();
  ob_end_clean();
  cache_set($cache_name, chunk_split(base64_encode($tile_content)));
}

