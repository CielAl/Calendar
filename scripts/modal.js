 /*jshint esversion: 6 */
 class Modal{

	 constructor(boneId = null,contentId = null,headerId = null,closeId = null,bodyId = null,footerId = null){
		this.node = Modal.model_component('modal w3-modal',boneId);
		
		this.node.appendTo($(document.body));
		this.node.css('display','none'); //hide
		
		this.content = Modal.model_component('modal-content w3-modal-content',contentId);
		this.content.appendTo(this.node);
	
		this.header = Modal.model_component('modal-header',headerId);
		this.header.appendTo(this.content);

		this.closeButton = Modal.model_component('modal-close w3-display-topright w3-button',closeId,'span');
		this.closeButton.appendTo(this.header);
		this.closeButton.html('&times');
		this.closeButton.data('ancestor',this.node);
		
		this.body = Modal.model_component('modal-body',bodyId);
		this.body.appendTo(this.content);			
		
		this.footer = Modal.model_component('modal-footer',footerId);
		this.footer.appendTo(this.content);	
		this.respond = this.textNode(this.footer,'span','');
		
		this.closeButton.on("click",this.btn_closeBox);
		
		//defaul: no text content;
	 }
	 btn_closeBox(){
		 console.log($(this));
		 $(this).data('ancestor').css('display','none');
	 }
	 show(){
		 this.node.css('display','table');
	 }
	 hide(){
		 this.node.css('display','none');
	 }	 
	 static getDefaultColorCSS(){
		 return '0,0,0'; //black with opacity works in most of the cases		 
	 }
	 /** 
	 The overlapping of my css setting to the w3-modal is too high,
	 since most of the necessary modal appearance feature are the same, such as
	 the closs botton with '&times', z-index and position.
	 I need to focus on the functionality of the modal box here.
	 //basic css properties
	 cssBasic(background,opacity = 0.1){
		 //this define basic properties that all modals shall have
		 //modal must be on top and not affected by other divs
		 //so make zindex maximum and fixed position, according to tutorials
		 this.node.css('z-index',3)//irrc 3 is the max
		 this.node.css('position','fixed');
		 //scroll vertically only
		 this.node.css('overflow-y','auto');
		 //this anchor the position, otherwise the background will not be cover the entire page
		 //based on W3school tutorial
		 this.node.css('top',0);
		 this.node.css('left',0);
		 //this make sure the modal background cover the entire page
		 this.node.css({
			 'width':'100%';
			 'height':'100%'
		 })
		 
	 }
	 */
	 textNode(parentDiv,tag,text,domClass = null, domId = null){
		 if (Modal.isnull(tag)||Modal.isnull(text)||Modal.isnull(parentDiv)||text===''||tag===''){
			// console.log('textNode:input');
			 if(!parentDiv){
				return;
			 }
		 }
		 var attr = '';
		 if(Modal.isnull(domClass)||domClass===''){
			 attr = attr  +' '+ assignAttr('class',domClass);
		 }
		 if(Modal.isnull(domId)||domId===''){
			 attr = attr  +' '+ assignAttr('id',domId);
		 }		 
		 var domStr = assignDom(tag,attr,text);	
		 var node = $(domStr); 
		 if(parentDiv!==null){
			// console.log(domStr);
			 node.appendTo(parentDiv);
		 }
		 return node;
		 
	 }
	 //Cannot create events earlier

	 static isnull(obj){
		 return obj===null || typeof obj =='undefined';
	 }
	 static model_component(domClass,id = null,tag='div'){
			var attr = assignAttr('class',domClass); //well, this is just to make sure that external css can still apply 												// when I don`t set css property in scripts 
			if(Modal.isnull(tag)){
				tag = 'div';
			}
			if(!(Modal.isnull(id) || id==='')){
				attr = attr+ ' '+assignAttr('id',id);
			}
			var domStr = assignDom(tag,attr);
			//console.log(domStr);
			return $(domStr);
	 }
	 loadNodes(parentDom,domNode){
		 domNode.appendTo(parentDom);
	 }
	 inputField(domClass=null,id = null,holder ='' ,type = 'text',value = '',tag = 'input'){
		 var attr = '';
		 if(!Modal.isnull(domClass) && domClass!==''){
			 attr = attr +' ' +assignAttr('class',domClass);
		 }
		 if(!Modal.isnull(id) &&  id!==''){
			 attr = attr +' ' +assignAttr('id',id);
		 }		
		 if(!Modal.isnull(type)){
			 attr = attr + ' ' +assignAttr('type',type);
		 }
		 if(!Modal.isnull(holder)   && holder!==''){
			 attr = attr +' ' +assignAttr('placeholder',holder);
			  attr = attr +' ' +assignAttr('name',holder);
		 }			 
		 if(!Modal.isnull(value)   && value!==''){
			 attr = attr +' ' +assignAttr('value',value);
		 }
		 if(Modal.isnull(tag)||tag===''){
			 tag = 'input';
		 }
		 var domStr = assignDom(tag,attr,'',false);
		 return $(domStr);
	 }
	 
	 
 }
 
 class loginBox extends Modal{
	 static getInstance(){
		 if(Modal.isnull(loginBox.singleton)){
			 loginBox.singleton = new loginBox();
			 loginBox.singleton.btn_switch.on("click",function(){
				 loginBox.singleton.hide();
				 signBox.getInstance().show();
			 });			 
		 }
		 return loginBox.singleton;
	 }	 
	 constructor(boneId = null,contentId = null,headerId = null,closeId = null,bodyId = null,footerId = null){
		 super(boneId = null,contentId = null,headerId = null,closeId = null,bodyId = null,footerId = null);
		
		 this.loginTitle = this.textNode(this.header,'h2','Log In');
		 this.loginTitle.css('text-align','center');
		 
		 this.username = this.inputField('login-input','logUser','Username');
		 this.username.appendTo(this.body);
		
		 this.pwd = this.inputField('login-input','logPwd','Password','password');
		 this.pwd.appendTo(this.body);	

		// this.respond = this.textNode(this.footer,'span','');		 
		// this.respond.css('width','10%');
		//  this.respond.css('text-align','center');
		 this.btn_submit = this.inputField('login-btn','logBtn','','button','Confirm');
		 this.btn_submit.appendTo(this.footer);			 
		 
		 this.btn_switch = this.inputField('login-btn','logBtn_tosign','','button','Signup');
		 this.btn_switch.appendTo(this.footer);	
		 
		 
		this.btn_submit.on("click",function(){
			console.log('click confirm');
			var inputData = {username:loginBox.getInstance().username.val(),password:loginBox.getInstance().pwd.val()};
			validateLogin(login_action,null,inputData,'login');
			loginBox.getInstance().respond.text('');
			loginBox.getInstance().respond.css('color','green');		
		});	



	 }	 
 }
 
 class signBox extends Modal{
	 btn_closeBox(){
		 super.btn_closeBox();
		 $(this).data('ancestor').respond.text('');
	 }
	 static getInstance(){
		 if(Modal.isnull(signBox.singleton)){
			 signBox.singleton = new signBox();
		 }
		 return signBox.singleton;
	 }
	 constructor(boneId = null,contentId = null,headerId = null,closeId = null,bodyId = null,footerId = null){
		 super(boneId = null,contentId = null,headerId = null,closeId = null,bodyId = null,footerId = null);
		 
		 this.loginTitle = this.textNode(this.header,'h2','Sign Up');
		 this.loginTitle.css('text-align','center');
		 
		 this.username = this.inputField('login-input','signUser','Username');
		 this.username.appendTo(this.body);
		 this.username.data('ancestor',this);
		 
		 this.email = this.inputField('login-input','signEmail','Email','email');
		 this.email.appendTo(this.body);		
		 this.email.data('ancestor',this); 
		 
		 this.pwd = this.inputField('login-input','signPassword','Password','password');
		 this.pwd.appendTo(this.body);	

		 this.confirmPwd = this.inputField('login-input','signPassword-confirm','Confirm Password','password');
		 this.confirmPwd.appendTo(this.body);			 
	    // this.respond = this.textNode(this.footer,'span','');	
		// this.respond.css('text-align','center');
		
         this.btn_submit = this.inputField('login-btn','signBtn','','button','Sign up');
		 this.btn_submit.appendTo(this.footer);	

		 this.pwd.on("input",signBox.compareInputsOnChange);
		 this.confirmPwd.on("input",signBox.compareInputsOnChange);
		 this.btn_submit.on("click",signupAction);
		 this.username.on("input",this.checkOnInput);
		 this.email.on("input",this.checkOnInput);	
	 }
	checkOnInput(){
		var box = $(this).data('ancestor');
		validateLogin(box.checkInputResponse,null,{username:box.username.val(),email:box.email.val()},'notexist');
	}
	checkInputResponse(response){
		var message = response.message;
		if(response.success){
			if(Modal.isnull(message)||message===''){
				message = "Succeed";
			}			
			signBox.getInstance().respond.text(response.message);
			signBox.getInstance().respond.css('color','green');
		}else{
			//var message = response.message;
			if(Modal.isnull(message)||message===''){
				message = "Error";
			}
			signBox.getInstance().respond.text(message);
			signBox.getInstance().respond.css('color','red');			
		}
	}
	static compareInputsOnChange(){
		var pwd = signBox.getInstance().pwd.val();
		var pwd_confirm = signBox.getInstance().confirmPwd.val();
		if(pwd!==pwd_confirm){
			signBox.getInstance().respond.text('Password Not Match');	
			signBox.getInstance().respond.css('color','red');	
		}else{
			signBox.getInstance().respond.text('');	
			signBox.getInstance().respond.css('color','green');				
		}
	} 
 } 
 
class eventBox extends Modal{
	 static getInstance(){
		 if(Modal.isnull(eventBox.singleton)){
			 eventBox.singleton = new eventBox();
		 }
		 return eventBox.singleton;
	 }	

	 static getMin(){
		 return '1980-01-01';
	 }
	 static getMax(){
		 return '2030-12-31';
	 }	 
	 static getMaxTextLength(){
		 return 25;
	 }
	 show(eventId = null,sourceDate = Month.getInstance().stamp,defaultText = ''){
		 this.node.css('display','table');
		 this.date.attr('min',eventBox.getMin());
		 this.date.attr('max',eventBox.getMax());
		 //If input an event id, then switch to editMode
		 this.editMode = eventId!==null;
		 this.currEventId = eventId;
		 if(Modal.isnull(sourceDate)||!Month.isDate(sourceDate)){
			 sourceDate = new Date();
		 }
		 this.date.val(Month.getStampByDate(sourceDate));
		 //var d = new Date();
		 this.time.val(Month.getTimeString(sourceDate));
		 if(Modal.isnull(defaultText)){
			 defaultText = '';
		 }
		 this.title.val(defaultText);
	 } 
	 constructor(){
		 super();
		 this.boxName = this.textNode(this.header,'h3','Create Event');
		 this.date = this.inputField('event-input',null,'' , 'date', '');
		 this.date.appendTo(this.body);
		 this.date.prop('required',true);
		 this.editMode = false;
		 this.time = this.inputField('event-input',null,'' ,'time','');
		 this.time.appendTo(this.body);
		 this.time.prop('required',true);
		 
		 this.title = this.inputField('event-input-area',null,'Title' ,'','','textarea');
		 this.title.appendTo(this.body);
		 this.title.attr('maxlength',eventBox.getMaxTextLength());
		 this.title.prop('required',true);
		 
		 this.btn = this.inputField('event-input-button','eventBtn','','button','Submit');
		 this.btn.appendTo(this.footer);
		// this.respond = this.textNode(this.footer,'span','');	
		  this.btn.data("ancester",this);
		 this.btn.on("click",this.btn_click);
	 }
	 btn_click(e){
		 var box  = $(this).data('ancester');
		 var dateStr = box.date.val();
		 //console.log(dateStr);
		 var timeStr = box.time.val();
		 var timestamp = eventBox.prepareTimeStamp(dateStr+' '+timeStr);
		 var event_description = box.title.val();
		 console.log("click:"+event_description);
		 //timestamp is either null or a valid date string
		 //the others can be anything
		 
		 var bool_DateTime = (timeStr!=='' && dateStr!=='' && (!Modal.isnull(dateStr)) && (!Modal.isnull(timeStr)) &&(!Modal.isnull(timestamp)));
		 var bool_Description = (!Modal.isnull(event_description)) && (event_description!=='');
		 console.log(bool_DateTime);
		 if(bool_DateTime&& bool_Description ){
			  box.respond.text('');
			  box.respond.css('color', 'green');
			  // {event_description|timestamp|token} as dataFrame
			 // eventBox.submitEvent(timestamp,event_description,$('#secret').val(),feedbackOnSubmit);
			 /**
				functionality of validateLogin is expanded to 
				handle multiple types of request in auth.php.
			 */
			if(box.editMode){
				//alert('edit');
				validateLogin(feedbackOnSubmit,null,{eventid:box.currEventId,date:timestamp,description:event_description,token:$('#secret').val()},'edit');
			}else{
				validateLogin(feedbackOnSubmit,null,{date:timestamp,description:event_description,token:$('#secret').val()},'submit');		
			}				
		 }else{
			 //Alert
			 var invalidInput  = ((!bool_DateTime) ?'Date/Time ':'');
			 /** 
			     The message should indicate which part of inputs are not valid.
				 Date/time are considered as a single component.
			  */
			 invalidInput = invalidInput+ ((!bool_DateTime) && (!bool_Description) ?'& ':'') + ((!bool_Description)?'Event Title':'');
			 box.respond.text('Invalid Input:'+ invalidInput+ '(Date must be within 1980~2030. Description length must be within 1~'+String(eventBox.getMaxTextLength())+')');
			 box.respond.css('color', 'red');
		 }
		 
	 }
	 //First round of Sanitize (frontend, merely to avoid invalid input by mistakes)
	 static prepareTimeStamp(dateStr){
		 var date;
		 if(!Modal.isnull(dateStr) && dateStr!=='' && !isNaN(Date.parse(dateStr))){
			 date = new Date(dateStr);
			 if(!Month.isDate(date) || date.getFullYear()<eventBox.getMinYear() || date.getFullYear()>eventBox.getMaxYear() ){
				 return null;
			 }
			return dateStr;
		 }
		 return null;
	 }
	static getMinYear(){
		return 1980;
	}
	static getMaxYear(){
		return 2030;
	}

/**  Replaced by validateLogin(onSuccess,onFailure,data,request) in authentication.js
		
	static submitEvent(timestamp,description,token,callback){
		$.post('auth.php',{date:timestamp,description:description,token:token,request:'submit'},
						function(data){
							var response = fetchResponse(data);
							if(!isnull(response)){
								callback(response);
							}else{
								eventBox.getInstance().respond.text('Error');
								eventBox.getInstance().respond.css('color', 'red');
							}	
					
						});
	}
	*/
} 

class userBox extends Modal{
    changePwd_Response(response){
		console.log('change pwd:rsp');
		console.log(response);
		if(response.success){
			//userBox.getInstance().hide()
			userBox.getInstance().respond.text('Pwd Updated');
			userBox.getInstance().respond.css('color','green');
		}else{
			var msg = response.message;
			if(Modal.isnull(msg)||msg===''){
				msg = 'Error on updating';
			}
			userBox.getInstance().respond.text(msg);
			userBox.getInstance().respond.css('color','red');
		}
		
	}
	changePwd_action(){
		var box = $(this).data('ancestor');
		//console.log(box);
		console.log('change pwd');
		
		var dataFrame = {
							token:$('#secret').val(),
							password:box.pwd.val(),
							username:$('#userinfo').val(),
							password_new:box.pwd_new.val()
						};
		console.log(dataFrame);
		validateLogin(box.changePwd_Response,null,dataFrame,'changepwd');

	}
	show(){
		super.show();
		this.respond.text('');
	}
	constructor(){
		super();
		this.pwd = this.inputField('login-input','changePwd-old','Password Verification','password');
		this.pwd.appendTo(this.body);		
		
		this.title_pwd = this.textNode(this.body,'h4','Change Password');

		this.pwd_new = this.inputField('login-input','changePwd-new','New Password','password');
		this.pwd_new.appendTo(this.body);
		 
		this.pwd_confirm = this.inputField('login-input','changePwd-confirm','Confirm New Password','password');
		this.pwd_confirm.appendTo(this.body);	
		 
		this.btn_pwd = this.inputField('login-btn','btn-change-pwd','','button','Change Password');	
		this.btn_pwd.data('ancestor',this);
		this.btn_pwd.appendTo(this.body);
		this.btn_pwd.on("click",this.changePwd_action);
		
		this.title_email = this.textNode(this.body,'h4','Change Email Address');
	
		this.email = this.inputField('login-input','change-email','email','email');
		this.email.appendTo(this.body);

		this.btn_email = this.inputField('login-btn','btn-change-email','','button','Re-send Notification');
		this.btn_email.appendTo(this.body);	
		this.btn_email.data('ancestor',this);

		this.btn_delete = this.inputField('login-btn','btn-delete','','button','Delete Account');
		this.btn_delete.appendTo(this.footer);		
		//this.btn_delete.css('backgroundColor','lightcoral');
		//this.btn_delete.css('marginTop','3%');
		this.btn_email.data('ancestor',this);
		this.btn_email.on("click",function(){
			var box = $(this).data('ancestor');
			var dataFrame ={
							token:$('#secret').val(),
							password:box.pwd.val(),
							username:$('#userinfo').val(),
							email: box.email.val()
			} ;
			//resend email 
			console.log('resend');
			validateLogin(box.showResponse,null,dataFrame,'send');
		});
		
		
		this.btn_delete.on("click",function(){
			var confirmBoxObj = new confirmBox('Delete Account? The process cannot be reversed.',null,null);
				confirmBoxObj.show();
		});
		this.respond = this.textNode(this.footer,'span','');	
		
	}
	static getInstance(){
		if (Modal.isnull(userBox.singleton) || !(userBox.singleton instanceof userBox)){
			userBox.singleton = new userBox();
		}
		return userBox.singleton;
	}
	showResponse(response){
		var message = response.message;
		console.log(response);
		if(response.success){
			if(Modal.isnull(message)||message===''){
				message = "Succeed";
			}			
			userBox.getInstance().respond.text(response.message);
			userBox.getInstance().respond.css('color','green');
		}else{
			//var message = response.message;
			if(Modal.isnull(message)||message===''){
				message = "Error";
			}
			userBox.getInstance().respond.text(message);
			userBox.getInstance().respond.css('color','red');			
		}
	}
}
class confirmBox extends Modal{
	show(){
		this.node.css('display','table');
	}
	//Override
	btn_closeBox(){
		console.log('destroy');
		$(this).data('ancestor').detach();
	}
	
	constructor(message,callbackPos,callbackNeg = null,hideNeg = false,sourceObj = null){
		super();
		this.title= this.textNode(this.header,'h2','Confirm:');
		this.data('source',sourceObj);
		if(Modal.isnull(message)||(typeof message !=='string')){
			message = "Are you sure?";
		}
		if(Modal.isnull(callbackNeg)||(typeof callbackNeg!=='function')){
			callbackNeg = this.btn_closeBox;
		}
		this.message = this.textNode(this.body,'h4', message);
		this.btn_pos = this.inputField('confirm-btn',null,'','button','Confirm');
		this.btn_pos.css('backgroundColor','lightCoral');
		this.btn_neg = this.inputField('confirm-btn',null,'','button','Cancel');
		this.btn_pos.appendTo(this.footer);
		this.btn_neg.appendTo(this.footer);
		this.btn_neg.data('ancestor',this.node);
		this.btn_pos.on('click',callbackPos);
		this.btn_neg.on('click',callbackNeg);
		if(hideNeg){
			this.hideNeg = hideNeg;
			this.btn_neg.css('display','none');
		}
	}
	
	
}