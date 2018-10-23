<?php
ini_set("session.cookie_httponly", 1);

//Tutorial:https://stackoverflow.com/questions/409351/post-vs-serverrequest-method-post

//avoid this annoying notice in error logs
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require_once 'sessions.php';
$reqType;
//make life easier: handle both get and post
if($_SERVER['REQUEST_METHOD']==='GET'){
	$reqType = '_GET';
}elseif($_SERVER['REQUEST_METHOD']==='POST'){
	$reqType = '_POST';
}else{
	//response error
	 http_response_code(405);
	 die();
}
$response = null;
//variable of variable
switch(strtolower($$reqType['request'])){
	case 'status':
				$response = val_session(true,false,false,false,true);
				break;
	case 'login':
				$response = val_session(false,false,true,true);
				break;	
	case 'logout':
				session_unset();
				session_destroy();
				//if the bool above is due to they are never set, the return val does not matter;
				//otherwise, the frontend still has nothing to do with such failure
				$response = jResponse(1,null,'logout');
				break;
	case 'signup':
				//$result = searchUserFromDb($$reqType['username']);
				$response = signup($$reqType['username'],$$reqType['email'],$$reqType['password']);
				//automatically
				startByResponse($response,$$reqType['username']);
				break;
	case 'changepwd':
				writeLog('changepwd');
				$response = signup($$reqType['username'],null,$$reqType['password_new'],true);
				writeLog('changepwd '.$response['message']);
				break;
	case 'exist':
				$result = searchUserFromDb($$reqType['username']);
				$response = jResponse((int)($result>0),$result,$$reqType['username']); 
				break;
	case 'notexist':
				$result = searchUserFromDb($$reqType['username']);
				$result_email = searchUserFromDb($$reqType['email'],false);
				$obj = '';
				if($result>0){
					$obj = $obj.'Username';
				}
				if($result_email>0){
					if($result>0){
						$obj = $obj.' and ';
					}					
					$obj = $obj.'Email';
				}
				if($result>0 || $result_email>0){
					
					$message = $obj.' Already Taken/Verified by others';
				}else{
					
					$message = 'Name/Email are unused';
				}
				$response = jResponse((int)($result<=0) && (int)($result_email<=0),$$reqType['username'],$message);
				break;	
	case 'submit':
				$response = eventSubmit();
				break;
	case 'pull':
				$response = eventPull();
				break;
	case 'edit':
				$response = eventEdit();
				break;
	case 'delete':
				$response = eventDelete();
				break;
	case 'send':
				$response = val_session(true,true,true,false,false);
				if($response['success']!=1){
					$response = jResponse(0,null,$response['message']);
					break;
				}
				//Whether the email is taken or not is checked in sendNotification
				$response  = sendNotification($$reqType['username'],$$reqType['email']);
				break;
	case 'verification':
				writeLog('verification:'.$$reqType['username'].' '.$$reqType['token']);
				$result = verifyEmailToken($$reqType['username'],$$reqType['token']);
				exit($result);
	default:
				$response = jResponse(0,null,'Unknown request');
				break;
}
echoRsp($response);



/**
	Functions
*/


//start new session by response 
function startByResponse($response,$username){
	if (session_status() == PHP_SESSION_NONE) {
		session_start();
	}	
	if($response['success']!=0){
		$_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));
		$_SESSION['user'] = $username;		
	} 
}

function signup($username,$email,$password,$updateMode = false){
	$response=null;
	$exist = searchUserFromDb($username);
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);	
	//FI
	//If not updating password
	//check email is email or not
	$flag = filter_var($email, FILTER_VALIDATE_EMAIL);
	if(!$flag && !$updateMode){
		$response = jResponse(0,null,'Not Valid Email address');
		return $response;		
	}
	$username_sanitize =  filter_var($username, FILTER_SANITIZE_SPECIAL_CHARS , FILTER_FLAG_STRIP_HIGH);
	$username_sanitize =  filter_var($username_sanitize, FILTER_SANITIZE_SPECIAL_CHARS , FILTER_FLAG_STRIP_LOW);
	if(strlen($username_sanitize)>32){
		$response = jResponse(0,null,'Name too long: limit is 32');
		return $response;	
	}elseif(strcmp($username,$username_sanitize)!=0){
		$response = jResponse(0,null,'Username with special character');
		return $response;			
	}	
	//filter_var($url, FILTER_SANITIZE_ENCODED, FILTER_FLAG_STRIP_HIGH)
	// 0-31
	$password_sanitized = filter_var($password, FILTER_SANITIZE_SPECIAL_CHARS , FILTER_FLAG_STRIP_HIGH);
	// 128-255
	$password_sanitized = filter_var($password_sanitized, FILTER_SANITIZE_SPECIAL_CHARS , FILTER_FLAG_STRIP_LOW);
	if(strlen($password_sanitized)>32){
		$response = jResponse(0,null,'Password too long: limit is 32');
		return $response;	
	}elseif(strcmp($password,$password_sanitized)!=0){
		$response = jResponse(0,null,'Password with special character');
		return $response;			
	}

	if($updateMode && $exist>0){
		$response = val_session(true,true,true,false,false);
		if($response['success']!=1){
			return $response;
		}
		$stmt = mysqli_prepare($conn,"UPDATE `users` SET `pwd`=? WHERE (STRCMP(`username`,?)=0)");
		mysqli_stmt_bind_param ($stmt,"ss",$pwd_hash,$username_stmt);	

	}else{
		if($exist>0){
			$response = jResponse(0,null,'user already Taken');
			return $response;
		}
		//search Email entry
		$exist = searchUserFromDb($email,false);
		if($exist>0){
			$response = jResponse(0,null,'Email already Taken');
			return $response;
		}		
		$stmt = mysqli_prepare($conn,"INSERT INTO `users` (`username`,`email`,`pwd`)VALUES(?,?,?)" );
		mysqli_stmt_bind_param ($stmt,"sss",$username_stmt,$email_stmt,$pwd_hash);	
		$email_stmt = $email;
	}	
	//Common pattern for both signup and change password
	$username_stmt = $username;
	$pwd_hash = password_hash($password, PASSWORD_BCRYPT);
		//$sql = "INSERT INTO `users` (`email`,`pwd`)VALUES('$email','$pwd_hash')" ; 
	$result = mysqli_stmt_execute($stmt);
	if($result){
		$response = sendNotification($username,$email);//
		$response = jResponse(1,null,$response['message']);		
	}else{
		$response = jResponse(0,null,'SQL Error: '.mysqli_error($conn));
	}
	return $response;
}







/**
	Verification Tokens

		(1) Check the existence of such token (token String and the user the token issued to)
		(2) Check if expired. (24hrs)
		(3) Check if the email associated to the token is already verified
		(4) Set Verify flag in user database
		(5) To ease the burden of grading. Whether the email is verified or not won`t
		affect basic functionalities.
*/
function verifyEmailToken($userIn,$tokenIn){
	$emailCandidate = searchEmailByUnExpiredToken($userIn,$tokenIn);
	if($emailCandidate==null){
		return 'Token Does Not Exist';
	}
	$emailValidated = searchValidatedEmail($emailCandidate);
	if($emailValidated>0){
		//This email address is taken and verified by others
		return 'Email Address is verified by others';
	}
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);	
	//Can resend every 30 minutes
	$stmt = mysqli_prepare($conn,"UPDATE `users` set `verified` = 1 WHERE (STRCMP(`username`,?)=0) AND STRCMP(`email`,?)=0");
	mysqli_stmt_bind_param ($stmt,"ss",$username,$email);	
	$username = $userIn;
	$email = $emailCandidate;
	/**
		No need to search `users` table: 
		username is the primary key of usertable and Foreign/Primary key of verification token table.
		If verification token table contains certain user entry and the token, there must be such
		user in the users table.
	*/
	
	if(mysqli_stmt_execute($stmt)){
		
		$stmt = mysqli_prepare($conn,"DELETE FROM `verification` WHERE (STRCMP(`username`,?)=0)");	
		mysqli_stmt_bind_param ($stmt,"s",$username);
		$username = $userIn;
		if(mysqli_stmt_execute($stmt)){
			return 'User Verified';
		}	
	}
	return 'Cannot Verify';
	
}

// Get the email address of the token that is not expired and match with records in db.
//use this email to compare with emails in usertable
function searchEmailByUnExpiredToken($userIn,$tokenIn){
		$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);	
		//Can resend every 30 minutes
		$stmt = mysqli_prepare($conn,"SELECT `email` FROM `verification` WHERE (STRCMP(`username`,?)=0) AND TIMESTAMPDIFF(HOUR,`date`,NOW())<=24 AND STRCMP(`verificationtoken`,?)=0");
		mysqli_stmt_bind_param ($stmt,"ss",$username,$token);
		$username = $userIn;
		$token = $tokenIn;
		mysqli_stmt_execute($stmt);
		//mysqli_stmt_store_result($stmt);
		//$num = mysqli_stmt_num_rows($stmt);	
		//return $num;
		
		//Get only the first
		mysqli_stmt_bind_result($stmt,$email);
		mysqli_stmt_fetch($stmt);
		return $email;
}

function sendNotification($username,$email){
	$From = "From: noreply@cielz.info";
	//To Do: generate Token
	$msg = "Verification for calendar service:";
	$token = bin2hex(random_bytes(10)); //20Bytes -> Length of hex str is 20
	/* The essential part of Spring Security 5 verification token
		is a UUID object, which contains a unique String.
		The uniqueid of php does not return a strictly unique string.
		So, username must be applied to ensure the uniqueness.
		The expiration part is achieved by MYSQL.
	*/
	$verified = searchValidatedUser($username);
	if($verified>0){
		//delete
		deleteTokenByUser($username);
		return jResponse(0,null,"Already Verified");
	}
	$flag = filter_var($email, FILTER_VALIDATE_EMAIL);
	if(!$flag){
		return jResponse(0,null,"Invalid Email");
	}elseif(!isFreeFromSpecialChar($username)){
		return jResponse(0,null,"Invalid Username");
	}
	$num = searchValidatedEmail($email);
	//Email is already verified by other users
	if($num>0){
		$response = jResponse(0,null,"Email Address is verified by others");
		return $response;
	}
	$uuid = uniqid($token,true);
	$url = 'https://www.cielz.info/calendar/auth.php?request=verification&username='.urlencode($username).'&token='.urlencode($uuid);
	
	//Cannot rapidly send email notification
	//THe interval is 30 minutes (cooldown)

	//If the most recent one is more than 30min ago 
	// then try insert token to table
	// if fail, try update (if existing)
	// To check whether there is existing entry in table will also take 1 query
	// so try insert than try update is not that bad.
	// If cooldown (30min) is finished and query is successfully executed, then send email
	// Otherwise, the token is useless.
	$sendOrNot = notificationCooldown($username)<=0 &&(addToken($username,$email,$uuid)||OverwriteAllPrevious($username,$uuid,$email));
	if($sendOrNot){
		$resp = mail($email,"Register Notification",$msg.' Verify by: '.$url);
		if($resp){
			$response = jResponse(1,null,"Email Verification Sent");
		}else{
			$response = jResponse(0,null,"Fail to Send Email");
		}		
	}else{
		$response = jResponse(0,null,"Operation too frequent");
	}
	return $response; 
	 
	

}
function isUserVerified($user){
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);		
	$stmt = mysqli_prepare($conn,"SELECT * `verification` (`username`,`verificationtoken`,`email`)
	VALUES(?,?,?)");	
	
}
//Insert new token: helper func for sendNotification
//
function addToken($userIn,$emailIn,$tokenIn){

	//reject if username contains illegal character
	if (!isClean($userIn)){
		return false;
	}
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);		
	$stmt = mysqli_prepare($conn,"INSERT INTO `verification` (`username`,`verificationtoken`,`email`)
	VALUES(?,?,?)");
	mysqli_stmt_bind_param ($stmt,"sss",$username,$token,$email);
	$username = $userIn;
	$email = $emailIn;
	$token = $tokenIn;
	return mysqli_stmt_execute($stmt);
}

//Time constraints
function notificationCooldown($userIn){
		$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);	
		//Can resend every 30 minutes
		$stmt = mysqli_prepare($conn,"SELECT * FROM `verification` WHERE (STRCMP(`username`,?)=0) AND TIMESTAMPDIFF(MINUTE,`date`,NOW())<=30");
		mysqli_stmt_bind_param ($stmt,"s",$username);
		$username = $userIn;
		mysqli_stmt_execute($stmt);
		mysqli_stmt_store_result($stmt);
		$num = mysqli_stmt_num_rows($stmt);
		return $num;
}

//assume email is filtered before the method is invoked
function OverwriteAllPrevious($userIn,$tokenIn,$emailIn){
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);		
	//$stmt = mysqli_prepare($conn,"DELETE * FROM `verification` WHERE (STRCMP(`username`,?)=0)";
	$stmt = mysqli_prepare($conn,"UPDATE `verification` SET `verificationtoken`=?,`email` =? WHERE (STRCMP(`username`,?)=0)");
	
	// AND TIMESTAMPDIFF(HOUR,`date`,NOW()))>24
	mysqli_stmt_bind_param ($stmt,"sss",$token,$email,$username);
	$username = $userIn;
	$token = $tokenIn;
	$email  = $emailIn;
	return mysqli_stmt_execute($stmt);
	//mysqli_stmt_store_result($stmt);
	//Count the result
	//$num = mysqli_stmt_num_rows($stmt); //count(SearchDb_Row($conn,$checkExist));
	
}
//Delete the token record
function deleteTokenByUser($userIn){
	$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);		
	//$stmt = mysqli_prepare($conn,"DELETE * FROM `verification` WHERE (STRCMP(`username`,?)=0)";
	$stmt = mysqli_prepare($conn,"DELETE FROM `verification` WHERE (STRCMP(`username`,?)=0)");
	
	// AND TIMESTAMPDIFF(HOUR,`date`,NOW()))>24
	mysqli_stmt_bind_param ($stmt,"s",$username);
	$username = $userIn;
	return mysqli_stmt_execute($stmt);
	//mysqli_stmt_store_result($stmt);
	//Count the result
	//$num = mysqli_stmt_num_rows($stmt); //count(SearchDb_Row($conn,$checkExist));
	
}


/** 
	------------------------------ Functions for event
*/

//seems like variable of variable does not work with var in the function
//dunno why
function eventSubmit(){
	//Check $_SESSION[user] and compare the token from client to the stored token in SESSION var
	$response = val_session(true,true,false,false,false);	
	if($response['success']!=1){
		return $response; 
	}
	else{
		//Do the query
		$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);	
		$stmt = mysqli_prepare($conn,"INSERT INTO `events` (`username`,`date`,`description`)VALUES(?,?,?)" );		
		mysqli_stmt_bind_param ($stmt,"sss",$username,$date,$description);	
		$username = $_SESSION['user'];

		if($_SERVER['REQUEST_METHOD']==='GET'){
			$date = $_GET['date'];
			$description = $_GET['description'];
		}elseif($_SERVER['REQUEST_METHOD']==='POST'){
			$date = $_POST['date'];
			$description = $_POST['description'];
		}else{
			$date = null;
			$description = null;
		}		

		$result = mysqli_stmt_execute($stmt);
		if($result){
			$response = jResponse(1,null,'Event Submission Succeeds');
		}else{
			$response = jResponse(0,$description,'SQL Error: '.mysqli_error($conn));
		}
		return $response;
	}
}
function eventPull(){
	$response = val_session(true,true,false,false,false);	
	if($response['success']!=1){
		return $response; 
	}else{
		$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);	
		$stmt = mysqli_prepare($conn,"SELECT * FROM `events` WHERE (STRCMP(`username`,?) = 0 
		AND TIMESTAMPDIFF(MONTH,`date`,?)<1 AND TIMESTAMPDIFF(YEAR,`date`,?)<1)" );			
		mysqli_stmt_bind_param ($stmt,"sss",$username,$dateIn,$dateIn);	
		//Pull based on user in session
		$username = $_SESSION['user'];		
		$dateIn = $_POST['date'];
		$execution = mysqli_stmt_execute($stmt);
		/* bind variables to prepared statement */
		if(!$execution){
			return jResponse(0,null,'SQL Fail on pull');
		}
		mysqli_stmt_bind_result($stmt, $eventid, $username,$date,$description);
		$data = array();
		while (mysqli_stmt_fetch($stmt)) {
			//$data is with constraints of type:timestamp
			//eventid is always A_I (int)
			//it will be escaped  at front-end by jquery:text 
			// THe reason is all components are rendered as innerHTML 
			// So the escaping works perfectly
			$data[] = array(htmlentities($eventid), htmlentities($username),($date),addslashes(($description)));
		}
		
		$response =  jResponse(1,$data,'Pulled');
	}
		return $response;
	
}

function eventEdit(){
	//Check $_SESSION[user] and compare the token from client to the stored token in SESSION var
	$response = val_session(true,true,false,false,false);	
	if($response['success']!=1){
		return $response; 
	}
	else{
		//Do the query
		$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);	
		$stmt = mysqli_prepare($conn,"UPDATE `events` SET `date`=?,`description` =?	
				WHERE STRCMP(`username`,?)=0 AND `eventid` = ?" );		
		mysqli_stmt_bind_param ($stmt,"sssi",$date,$description,$username,$eventid);
		//based on user in session		
		$username = $_SESSION['user'];

		if($_SERVER['REQUEST_METHOD']==='GET'){
			$date = $_GET['date'];
			$description = $_GET['description'];
			$eventid = $_GET['eventid'];
		}elseif($_SERVER['REQUEST_METHOD']==='POST'){
			$date = $_POST['date'];
			$description = $_POST['description'];
			$eventid = $_POST['eventid'];
		}else{
			$date = null;
			$description = null;
			$eventid = 0;
		}		

		$result = mysqli_stmt_execute($stmt);
		if($result){
			$response = jResponse(1,null,'Event Update Succeeds');
		}else{
			$response = jResponse(0,$description,'SQL Error: '.mysqli_error($conn));
		}
		return $response;
	}
}
function eventDelete(){
	//Check $_SESSION[user] and compare the token from client to the stored token in SESSION var
	$response = val_session(true,true,false,false,false);	
	if($response['success']!=1){
		return $response; 
	}
	else{
		//Do the query
		$conn = mySqlConnection('localhost', $_SERVER['DB_USER'], $_SERVER['DB_PASSWORD'], $_SERVER['DB_COMMON']);	
		$stmt = mysqli_prepare($conn,"DELETE FROM `events` WHERE STRCMP(`username`,?)=0 AND `eventid` = ?" );		
		mysqli_stmt_bind_param ($stmt,"si",$username,$eventid);	
		$username = $_SESSION['user'];

		if($_SERVER['REQUEST_METHOD']==='GET'){
			$eventid = $_GET['eventid'];
		}elseif($_SERVER['REQUEST_METHOD']==='POST'){
			$eventid = $_POST['eventid'];
		}else{
			//A_I start from 1, and by this nothing will be deleted
			$eventid = 0;
		}		

		$result = mysqli_stmt_execute($stmt);
		if($result){
			$response = jResponse(1,null,'Event Delete Succeeds');
		}else{
			$response = jResponse(0,$description,'SQL Error: '.mysqli_error($conn));
		}
		return $response;
	}
}

function isFreeFromSpecialChar($str){
	$sanitize =  filter_var($str, FILTER_SANITIZE_SPECIAL_CHARS , FILTER_FLAG_STRIP_HIGH);
	$sanitize =  filter_var($sanitize, FILTER_SANITIZE_SPECIAL_CHARS , FILTER_FLAG_STRIP_LOW);	
	return strcmp($str,$sanitize)==0;
}
function isClean($str,$len = -9){
	if($len<0){
		//no limitation of length
		return isFreeFromSpecialChar($str);
	}
	return isFreeFromSpecialChar($str) && strlen($str)<=$len;
}

	
?>