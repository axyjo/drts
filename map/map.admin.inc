<?php

function map_admin_settings_form() {
  $form['server'] = array(
    '#type' => 'fieldset',
    '#title' => t('Server'),
    '#description' => t('Modify settings related to the map server, including tile generators.'),
  );
  $form['server']['map_tile_size'] = array(
    '#type' => 'select',
    '#title' => t('Tile size'),
    '#options' => drupal_map_assoc(array(32, 64, 128, 256, 512)),
    '#default_value' => variable_get('map_tile_size', 256),
    '#description' => t('The size in pixels for the tile images created by the module.'),
  );
  $form['server']['map_min_size'] = array(
    '#type' => 'select',
    '#title' => t('Minimum size'),
    '#options' => drupal_map_assoc(map_get_ninesixty_factors()),
    '#default_value' => variable_get('map_min_size', 1),
    '#description' => t('The minimum length of a side of any map of a round.'),
  );
  $form['server']['map_max_size'] = array(
    '#type' => 'select',
    '#title' => t('Maximum size'),
    '#options' => drupal_map_assoc(map_get_ninesixty_factors()),
    '#default_value' => variable_get('map_max_size', 960),
    '#description' => t('The maximum length of a side of any map of a round.'),
  );
  $form['server']['map_min_zoom'] = array(
    '#type' => 'select',
    '#title' => t('Minimum zoom ratio'),
    '#options' => drupal_map_assoc(map_get_ninesixty_factors()),
    '#default_value' => variable_get('map_min_zoom', 960),
    '#description' => t('The number of fields per tile at the minimum zoom level (fully zoomed out) of a map. The minimum size will always take precedence over this.'),
  );
  $form['server']['map_max_zoom'] = array(
    '#type' => 'select',
    '#title' => t('Maximum zoom ratio'),
    '#options' => drupal_map_assoc(map_get_ninesixty_factors()),
    '#default_value' => variable_get('map_max_zoom', 1),
    '#description' => t('The number of fields per tile at the maximum zoom level (fully zoomed in) of a map. The maximum size will always take precedence over this.'),
  );
  
  $form['client'] = array(
    '#type' => 'fieldset',
    '#title' => t('Client'),
    '#description' => t('Modify settings related to the client-side interface.'),
  );
  $form['client']['map_default_x'] = array(
    '#type' => 'select',
    '#title' => t('Default x-centre position'),
    '#options' => drupal_map_assoc(map_get_ninesixty_factors()),
    '#default_value' => variable_get('map_default_x', 480),
    '#description' => t('The default horizontal centre position for the map interface.'),
  );
  $form['client']['map_default_y'] = array(
    '#type' => 'select',
    '#title' => t('Default y-centre position'),
    '#options' => drupal_map_assoc(map_get_ninesixty_factors()),
    '#default_value' => variable_get('map_default_y', 480),
    '#description' => t('The default vertical centre position for the map interface.'),
  );
  $form['client']['map_default_z'] = array(
    '#type' => 'select',
    '#title' => t('Default zoom level'),
    '#options' => drupal_map_assoc(array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)),
    '#default_value' => variable_get('map_default_z', 7),
    '#description' => t('The default zoom level for the map interface.'),
  );

  return system_settings_form($form);
}

