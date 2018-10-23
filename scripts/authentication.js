//plz include the comment below while grade with jshint
/*jshint esversion: 6 */
/** 
  Majority of server-client interaction are here.
*/
const RESPONSE_JSON = 1;
const RESPONSE_JSONARRAY = 2;
 function validateJSON( data, type = RESPONSE_JSON){
	if(type === RESPONSE_JSON){
		return !isnull(data) && (!isnull(data.success) && typeof data.data !== "undefined" && typeof data.message !== "undefined" && typeof data.token!== "undefined");
	}else if (type=== RESPONSE_JSONARRAY){
		return Array.isArray(data) && data.length>0 && !isnull(data[0]) &&(!isnull(data[0].success) && typeof data[0].data !== "undefined" && typeof data[0].message !== "undefined" && typeof data[0].token !== "undefined");	
	}
	else{
		console.log("checkResponse: Unknown Type");
		return false;
	}	
	return false;
}
function fetchResponse(data){
	var temp_response = null;
	if(validateJSON(data)===true){
		temp_response = data;
	}else if(validateJSON(data,RESPONSE_JSONARRAY)===true){
		temp_response = data[0];
	}
	if(!isnull(temp_response)){
		return {success:temp_response.success,data:temp_response.data,message:temp_response.message,token:temp_response.token};
	}
	return null;
}

function vl_Action(data){
//common procedure of callbacks


}
//wrap it to a single function (from all those js scripts)\
//deciding: use getLogin.php or auth.php??
 /**
	functionality of validateLogin is expanded to 
	handle multiple types of request in auth.php.
 */
function validateLogin(callback = null,failure = null,inputData = null,requestType = "status"){
	if (isnull(callback)){
		callback = function(data){};
	}
	if (isnull(failure)){
		failure = function(data){
			console.log(data);
		};
	}
	console.log($.extend(inputData,{request:requestType}));
	$.ajax({  
			  type : "post",  
			  url : 'auth.php',     
			  data:$.extend(inputData,{request:requestType}),
			  success : function(data){
					
					var response = fetchResponse(data);
					if(!isnull(response)){
						vl_Action(response);
						callback(response);
					}else{
						failure(response);
					}
			  }
		});  	
				
		
}

/**
---------------------------------------------New Ver-------------
*/

/**
	callback for the action if validated.
*/

function loginOnSuccess(response){
	loginBox.getInstance().hide();
	navBar.getInstance().setLogout();
	navBar.getInstance().setHome(response.data);
	$('#userinfo').val(response.data);
	console.log(response.data);
	navBar.getInstance().removeLogin();
	//try hidden input first. Maybe localStorage also works?
	$('#secret').val(response.token);
	//Pull events
	/**
		Another validateLogin call to pull events but make sure the
		callback function is not in the current stack frames to avoid
		dead loop.
	*/
	var data = {token:$('#secret').val(),date:Month.getStampByDate(Month.getInstance().stamp)};
	validateLogin(pullEvents,null,data,'pull');
}

/**
	The for the Login process alone.
*/
function login_action(response){
	if(response.success && response.token!==null){
		console.log('succeed on login');
		loginOnSuccess(response);
	}else{
		console.log(response);
		loginBox.getInstance().respond.text('No match');
		loginBox.getInstance().respond.css('color','red');
	}
}

/**
	Mainly the entrance for callback onSuccess of the ajax call for login verification and events pulling
*/
function loginValidateOnLoad(response){
	var result = response.success;
	if(result){
		//Login Valid, not NaN not 0
		console.log('login validation 1');
		loginOnSuccess(response);
		
	}else{
		console.log('fail:');
		console.log(response);
		navBar.getInstance().removeLogout();
		navBar.getInstance().removeHome();
		//navBar.getInstance().setLogin();
		navBar.getInstance().setLogin();
		//Month.getInstance().reset();
		Month.getInstance().render();
	}
}


/**
	intialize all singletons and also validate login status
	
	Pull data if validated.
	The re-render (pseudo reload) fully relies on initialize.
*/
function initialize(){
	//topBar = navBar.getInstance();
	
	var month = Month.getInstance();
	forEachDay('clearPool');
	console.log(month);
	month.hide();
	month.node.fadeIn(500).show();
	//month.render();
	//login_box = loginBox.getInstance();
	//signup_box = signBox.getInstance();
	loginBox.getInstance().hide();
    signBox.getInstance().hide();
	validateLogin(loginValidateOnLoad);
	eventBox.getInstance().hide();
}

function signupAction(){
	//Filter input part is implemented at the backend;
	var pwd = signBox.getInstance().pwd.val();

	var dataFrame = {username:signBox.getInstance().username.val(),email:signBox.getInstance().email.val(),password:pwd,request:'signup'};
		$.post('auth.php',dataFrame,function(data){
								
								var response = fetchResponse(data);
								console.log(response);
								if(!isnull(response)){
									if(response.success){
										signBox.getInstance().hide();
										initialize();
									}else{
										var err = response.message;
										if(isnull(err)||err===''){
											err = 'Error';
										}
										signBox.getInstance().respond.text(err);
										signBox.getInstance().respond.css('color','red');
									}
								}	
	});
}
function feedbackOnSubmit(response){
	console.log('feedbackOnSubmit:');
	console.log(response);
	if(response.success){
		eventBox.getInstance().hide();
		eventBox.getInstance().respond.text('');
		eventBox.getInstance().respond.css('color','green');		
		initialize();
	}else{
		var msg = (!isnull(response.message))?response.message:'Error';
		eventBox.getInstance().respond.text(msg);
		eventBox.getInstance().respond.css('color','red');
	}
}
function pullEvents(response){
	console.log(response);
	if(response.success){
		console.log('pull succeeds');
		processEvents(response.data);
	}else{
		var msg = (!isnull(response.message))?response.message:'Error';
		console.log(msg);
	}	
}
/**
	eventId won`t be displayed and it is defined as integer: no need to escape
	date is always a timestamp followed by fixed formats in the database, so the risk is low.
	What should be taken care of is title:
	
	Logic: some title text in the innerHTML of <li><p>innerHTML</p></li> node.
	And hence, to create things unwanted requires '<','/' and '>'. If they are
	replaced/escaped,  the attacker cannot mess the page by creating html tags.
	
	Besides, since the position is inner html, without '< 'or '>', styles cannot be placed.
	A js version of htmlentities is defined in util.js.
	
	'events' is an array, which is the 'data' component in the returned JSON object.

	PS: Though if the events is not null, then the likelihood to be valid is high,
	   there might still be corrupted data due to unexpected conditions with low chances.
	   So there is a check of structure. But if some piece of info is not there, the operation
	   won`t be completely disgarded but simply skip the corrupted part.
	*/
function processEvents(events){
	var date;
	var eventObj;
	if(isnull(events) || !Array.isArray(events)){
		console.log('processEvent: Not array');
		return false;
	}
	for(var key in events){
		//console.log('processEvents:'+key);
		//if longer (e.g.modification of code later), for now just slice the first four
		if(key && !isnull(events[key]) && Array.isArray(events[key]) && events[key].length>=4){
			//[2] for date
			date = new Date(events[key][2]);
			if(!Month.isDate(date)){
				//invalid String
				//console.log('processEvents:Skip - Invalid Date')
				continue;
			}
			// test with dummy Month.getInstance().days[0]events[key][2]
			
			 console.log(events[key]);
			 
			 eventObj = new Event(null,(events[key][3]),(events[key][1]),date,events[key][0]);
			 loadToDay(eventObj);
			
		}else{
			//debug
			//console.log('processEvents:Skip - stale key');
		}
	}
	//$('.day').each(callback_LoadEventsToDay);
	//var dayList = Month.getInstance().days;
	forEachDay('sift');
	/*
	for(var key in dayList){
		if(key && !isnull(dayList[key]) && dayList[key] instanceof Day){
			dayList[key].sift();
		}
	}*/
}
function loadToDay(eventObj){
	var month = Month.getInstance();
	var curr = month.stamp;
	if(isnull(eventObj)||!(eventObj instanceof Event)||!Month.isDate(eventObj.date)){
	//	console.log('skip event');
		return;
	}
	if(curr.getFullYear() !==eventObj.date.getFullYear()||curr.getMonth() !==eventObj.date.getMonth()){
		return;
	}
	var eventDay = eventObj.date.getDate(); //1-31
	// eventDay + offset -1 -> index of day
	
	if(isnull(month.days)|| !Array.isArray(month.days)||month.days.length<36){
	//	console.log('days not prepared');
		return;
	}
	
	var day = month.days[eventDay + month.offset -1];
	if(isnull(day)||!(day instanceof Day)||!day.valid){
		//console.log('Empty Day');
		return;
	}
	day.collect(eventObj);
	
}

function forEachDay(callback,member = true){
	var dayList = Month.getInstance().days;
	
	for(var key in dayList){
		if(key && !isnull(dayList[key]) && dayList[key] instanceof Day){
			//use string to call object methods
		//	console.log('forEachDay:'+ (typeof dayList[key][callback] =="function"));
			if(member && typeof callback =='string' && typeof dayList[key][callback] =="function"  ){
				//console.log('memberMode');
				dayList[key][callback]();
			//arbitary callback functtion
			}else if(typeof callback === "function"){
				callback();
			}
		}
	}
}

