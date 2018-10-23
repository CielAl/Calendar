<?php
ini_set("session.cookie_httponly", 1);
require_once 'tools.php';
function val_session($checkUser = true,$checkTokenFromUser = true,$checkPassword = false,$startNew = true,$checkSessionToken = false){
	if (session_status() == PHP_SESSION_NONE) {
		session_start();
	}
	$success = 1;
	$data = null;
	$message = "";
	$password;
	$userIn;
	$token;	
		//Check Request Type: get or post to fetch the proper variable
		if($_SERVER['REQUEST_METHOD']==='GET'){
			$token = $_GET['token'];
			$password = $_GET['password'];
			$userIn  = $_GET['username'];
		}elseif($_SERVER['REQUEST_METHOD']==='POST'){
			$token = $_POST['token'];
			$password = $_POST['password'];
			$userIn  = $_POST['username'];
		}else{
			 http_response_code(405);
			 die();
		}	
	if($checkUser && empty($_SESSION['user'])){
		$success = 0;
		$message = $message.'UserVal Fail';
	}else{
		
		$message = $message.((!$checkUser)?'':'Username Validated.');
	}
	if($checkSessionToken && empty($_SESSION['token'])){
		$success = 0;
		$message = $message.'Token not Set';
	}else{
		
		$message = $message.((!$checkSessionToken)?'':'Token is in Session');
	}	
	if($checkTokenFromUser && $success !=0){
		if(empty($token) || strcmp($token,$_SESSION['token'])!==0  ){
			$success = 0;
			$message = $message.' '.PHP_EOL.'Token Fail';			
		}else{
			$message = $message.' '.PHP_EOL.((!$checkTokenFromUser)?'':'Token Verified'); 				
		}
	}else{
		$message = $message.' '.PHP_EOL.('');
	}
	//password Val by both username and password from dataform
	if($checkPassword && $success !=0){
		if(empty($userIn)){
			$success = 0;
			$message = $message.' '.PHP_EOL.'PWD:nouser';			
		}else{
			$salted = getPwdHashed($userIn);
			if($salted ==null){ //password_verify can take no, but I need more messages to distinguish those errors in dbg mode
				$success = 0;
				$message = $message.' '.PHP_EOL.'user:'.$userIn.PHP_EOL.'Sql Error: '.mysqli_error($conn);					
			}else{
				//Implies that $username is identical to $userIn after escaping
				if(password_helper($userIn,$password,$salted,$startNew)){
					$message = $message.' '.PHP_EOL.'Pwd Pass';	
				}else{
					$success = 0;
					$message = $message.' '.PHP_EOL.'Pwd Fail';	
				}
				
			}
		}

		
	}
	
	if($success!=0){
		$tokenVal = $_SESSION['token'];
		$data = $_SESSION['user'];
	}else{
		$tokenVal = null;
		$data=null;
	}
	$response = jResponse($success,htmlentities($data),$message,$tokenVal);
	return $response;
	//just a helper func.
	//header('Content-type: application/json');
	//echo json_encode($response);	
}

function password_helper($username,$password,$salted,$startSession){
	$val_result = password_verify($password, $salted);
	if($val_result){
		if($startSession){
			if (session_status() == PHP_SESSION_NONE) {
				session_start();
			}			
			$_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));
			$_SESSION['user'] = $username;			
		}
	}else{
		if (session_status() != PHP_SESSION_NONE) {
		//	session_destroy();
		}	
	}
	return $val_result;
}
//Tutorial: https://www.w3schools.com/php/php_mysql_prepared_statements.asp
function getPwdHashed($userIn){
	//this is merely a wrapped function to connect to db
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);
	
	//I prefer procedural style.
	//pwd is actually the salted version: don`t be confused.
	$stmt = mysqli_prepare($conn,"SELECT `pwd` from `users` WHERE (STRCMP(`username`,?) = 0)");
	mysqli_stmt_bind_param ($stmt,"s", $username);	
	$username = mysqli_real_escape_string($conn,$userIn);
	if(strcmp($username,$userIn)!==0){
		//Reject if input username is not clean
		//writeLog('ggg');
		return null;
	}

	//$sql = "SELECT `hashed_password` from `users` WHERE (STRCMP(`username`,'$username') = 0)";		
	//$result = SearchDb_Row($conn,$sql);
	mysqli_stmt_execute($stmt);
	mysqli_stmt_bind_result($stmt, $result);	
	mysqli_stmt_fetch($stmt);
	//there is only one result: defined by SQL structure
	//writeLog('here'); 
	$password = $result;//(!empty($result))? $result:null;
	return $password;
}



?>