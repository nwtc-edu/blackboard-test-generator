<?php

	ini_set('default_charset', 'utf-8');
	mb_internal_encoding('utf-8');
	mb_detect_order('utf-8');

	$name = "My-Blackboard-Test.txt";

	if (isset($_POST["outputTxt"])) {
	
		$txt = $_POST["outputTxt"];

		$txt = htmlentities($txt, ENT_QUOTES, "utf-8");
		$txt = stripslashes($txt);
	
		// see http://stackoverflow.com/questions/393647/response-content-type-as-csv
		
		// these headers avoid IE problems when using https:
		// see http://support.microsoft.com/kb/812935
		header("Cache-Control: must-revalidate");
		header("Pragma: must-revalidate");

		header("Content-type: text/plain");
		header("Content-disposition: attachment; filename=$name");
		
		// header('Cache-Control: must-revalidate, private, max-age=0');
		// header('Connection: Keep-Alive');
		// header("Content-Type: text/html");
		// header("Date: " . date("D, j M Y G:i:s T"));
		// header('Keep-Alive: timeout=2, max=100');
		// header('Content-Disposition: attachment; filename="' . $name . '"');
		// header('Status: 200');
		// header("Pragma: no-cache"); 
		// header("Expires: 0");
	
		echo "$txt";

	} else {

		echo 'An error occurred.';

	}

?>