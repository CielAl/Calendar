<?php
ini_set("session.cookie_httponly", 1);
//require_once 'dbutil.php';
Define('lib_log_logDest',  'debug.log');

//http://php.net/manual/en/function.file-put-contents.php
function writeLog($local_text,$local_destination=null,$newFile = false,$testMode = true){
	//merely a debug function
	$curr = basename(__FILE__, '.php');
	if(!$testMode){
		return;
	}
	if(empty($local_destination)){
		$local_destination  = lib_log_logDest; 
	} 
	//define time tag
	$local_date = date('Y.m.d H:i:s');
      
	if($newFile==true){
		file_put_contents($local_destination, $local_date.' - file:'.$curr.': ' . $local_text.PHP_EOL);	 		
	}
	else{
		file_put_contents($local_destination, $local_date. ': ' . $local_text.PHP_EOL, FILE_APPEND);		
	}
}

function jarrResponse($success,$data,$message,$token = null){
		$jsResponse = array(
							array(
								  "success"=>$success,
								  "data"=>$data,
								  "message"=>$message,
								  "token"=>$token
								)
					);
		return $jsResponse;
}
function jResponse($success,$data,$message,$token = null){
		$jsResponse = 	array(
								"success"=>$success,
								"data"=>$data,
								"message"=>$message,
								"token"=>$token
						);
		return $jsResponse;
}

function sanitize_command($name){
	$name = str_replace("\r",'',$name);
	$name = str_replace(PHP_EOL,'',$name);
	$name = str_replace("\n",'',$name);
	$name = str_replace("\t",'',$name);
	$name = str_replace('/','',$name);
	$name = str_replace('\\','',$name);
	$name = str_replace(':','',$name);
	$name = str_replace('*','',$name);
	$name = str_replace('?','',$name);
	$name = str_replace('<','',$name);
	$name = str_replace('>','',$name);
	$name = str_replace('|','',$name);
	$name = str_replace('"','',$name);
	$name = str_replace('\'','',$name);
	$name = str_replace('..','',$name);
	if(strlen($name)<=0){
		return '';
	}
	if($name[strlen($name)-1]=='.'){
		$name[strlen($name)-1] = null;
	}
	$name = str_replace("\0",'',$name);
	return $name;
}









function validateName($checkPost=true,$mode_signup = true,$regex = "/^[A-Za-z]+([_|A-Za-z0-9]+)*$/"){
	$success = 0;
	$data = null;
	$message = '';	
	//procedural style
	$username = $_POST['username'];
	if($checkPost && (empty($username) || strlen($username)<=0)){
		$success = 0;
		$data = null;
		$message = 'Empty';
	}
	elseif(!preg_match($regex,$username)){
		$success = 0;
		$data = null;
		$message = 'Illegal Format';	
	}elseif( strlen($username)>10){
		$success = 0;
		$data = null;
		$message = 'Too Long: limit 9';	
	}
	else{
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], 'task_db');
		//Read form $_POST and escape
		$username = mysqli_real_escape_string($conn,$username);
		//Define the query
		$checkExist = "SELECT `username` FROM `users` 
		WHERE `username` = '$username'
		"; 
		//Count the result
		$num = count(SearchDb_Row($conn,$checkExist));
		
		if($mode_signup){
			
			$success = (int)$num<=0;
			$data=$num;
			$message = 'Signup num:'.$num;
		}else{
			$success = (int)$num>0; 
			$data=$success;
			$message = 'Login num:'.$num;;			
		} 
	}
	$response = jResponse($success,$data,$message);	
	return $response;
}	
function echoRsp($response,$type = 'json'){
	if(strcmp($type,'json')===0){
		header('Content-type: application/json');
		$response = json_encode($response);
	}
	echo $response;
}

function searchUserFromDb($userIn,$isUser = true){
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);

	//Define the query
	//$checkExist = "SELECT `username` FROM `users` 	WHERE `username` = '$username'"; 
	if($isUser){
		$stmt = mysqli_prepare($conn, "SELECT `username` FROM `users` WHERE (STRCMP(`username`,?) = 0)");
	}else{
		$stmt = mysqli_prepare($conn, "SELECT `email` FROM `users` WHERE (STRCMP(`email`,?) = 0 AND (`verified`=1) )");
	}

	mysqli_stmt_bind_param ($stmt,"s", $username);	
	//First round of sanitization
	$username = mysqli_real_escape_string($conn,$userIn);	
	if(strcmp($username,$userIn)!==0){
		//Reject if input username is not clean
		return 0;
	}	
	mysqli_stmt_execute($stmt);
	mysqli_stmt_store_result($stmt);
	//Count the result
	$num = mysqli_stmt_num_rows($stmt); //count(SearchDb_Row($conn,$checkExist));
	mysqli_close($conn);
	return $num;
}



function searchValidatedEmail($emailIn){
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);

	//Define the query
	//$checkExist = "SELECT `username` FROM `users` 	WHERE `username` = '$username'"; 
	$stmt = mysqli_prepare($conn, "SELECT `email` FROM `users` WHERE ((STRCMP(`email`,?)=0) AND (verified = 1))");

	mysqli_stmt_bind_param ($stmt,"s", $email);	
	$email = $emailIn;
	mysqli_stmt_execute($stmt);
	mysqli_stmt_store_result($stmt);
	//Count the result
	$num = mysqli_stmt_num_rows($stmt); //count(SearchDb_Row($conn,$checkExist));
	mysqli_close($conn);
	return $num;
}
function searchValidatedUser($userIn){
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);

	//Define the query
	//$checkExist = "SELECT `username` FROM `users` 	WHERE `username` = '$username'"; 
	$stmt = mysqli_prepare($conn, "SELECT `username` FROM `users` WHERE ((STRCMP(`username`,?)=0) AND (`verified` = 1))");

	mysqli_stmt_bind_param ($stmt,"s", $username);	
	$username = $userIn;
	mysqli_stmt_execute($stmt);
	mysqli_stmt_store_result($stmt);
	//Count the result
	$num = mysqli_stmt_num_rows($stmt); //count(SearchDb_Row($conn,$checkExist));
	mysqli_close($conn);
	writeLog('searchValid:'.$num.' name:'.$username); 
	return $num;
}

function mySqlConnection($host, $user, $pass, $db){
	$conn = mysqli_connect($host, $user, $pass, $db);
	if (!$conn) {
		
		exit("Error- cannot connect" . mysqli_connect_error());
	}
	else{
	}
	return $conn;
}
?>