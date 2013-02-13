<?

  $version = time();

  $scripts = '    
    script/app.js
  ';

  $scripts = explode("\n", $scripts);

  $include = "";

    $temp = "";
    foreach($scripts as $key => $src) {
      $src = trim($src);
      if($src) {
        $temp .= "/* file: $src */\n\n";
        $temp .= file_get_contents($src)."\n\n";      
        $include .= "<script src='$src'></script>\n";      
      }
    }
    
    file_put_contents("script.js", $temp);

  echo "done";  
