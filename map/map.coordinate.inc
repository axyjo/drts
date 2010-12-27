<?php

class Coordinate {
  private $x, $y;
  
  function __construct() {
    $a = func_get_args(); 
    $i = func_num_args(); 
    if (method_exists($this,$f='__construct'.$i)) { 
      call_user_func_array(array($this,$f),$a); 
    }
  }
  
  function __construct1(array $array) {
    $this->x = $array['x'];
    $this->y = $array['y'];
  }
  
  function __construct2($x, $y) {
    $this->x = $x;
    $this->y = $y;
  }
  
  public function getCoordinates() {
    return array('x' => $this->x, 'y' => $this->y);
  }
}