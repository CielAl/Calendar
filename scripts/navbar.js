 /*jshint esversion: 6 */
class navBar{
	constructor(){
		this.node = navBar.topNavHolder();
		console.log(this.node);
		this.login =  navBar.w3topBar(navBar.getLoginItemParam());
		this.logout = navBar.w3topBar(navBar.getLoginItemParam('Logout','bar-logout'));	
		
		this.userhome = navBar.w3topBar(navBar.getLoginItemParam('','bar-home'));	
		this.userhome.on("click",function(){
			userBox.getInstance().show();
		});
		this.login.on("click",function(){
			loginBox.getInstance().show();
		});
		this.logout.on("click",function(){
			console.log('logout');
			$.post( "auth.php",{request:'logout'}, function(data){
					var response = fetchResponse(data);
					if(!isnull(response)){
						if(response.success){
							//re-initialize everything, 
							// including the validation of login and in this case it will return false
							initialize();
						}
					}		  
			});
		});		
	}
	static getInstance(){
		if(isnull(navBar.singleton)){
			navBar.singleton = new navBar();
		}
		return navBar.singleton;
	}
	static getLoginItemParam(html = 'Login',id = 'bar-login'){
		var domParam = {
						'link': '#',
						'cssClass': 'w3-bar-item w3-button w3-right w3-hover-teal',
						'id': id,
						'tag': html
					};
					return domParam;
	}
	setHome(username = ''){
		this.userhome.html('User: '+username); //escaped before echo-ed by php 
		//this.userhome.css('text-decoration', 'underline');
		this.userhome.appendTo(this.node);
	}
	setLogin(){
		this.login.appendTo(this.node);
	}
	setLogout(){
		this.logout.appendTo(this.node);
	}
	removeLogin(){
		this.login.detach();
	}
	removeSignup(){
		this.login.detach();
	}
	removeLogout(){
		this.logout.detach();
	}
	removeHome(){
		this.userhome.html('');		
		this.userhome.detach();
	}
/**
domParam
{
	link: xxx
	cssClass: xxx
	id: xxx
	tag = xxx
}
**/

static topNavHolder(){
	var domNode = document.createElement('div');
	var attributes = {"class":"w3-top","id":"nav-div"};
	if(!isnull(domNode)){
		setAttributes(domNode,attributes);
		document.getElementsByTagName("body")[0].appendChild(domNode);
	}else{
		return null;
	}
	domNode = document.createElement('div');
	attributes = {
			"class":"w3-row w3-bar w3-border w3-lavender",
			"id":"barHolder"
			};
	if(!isnull(domNode)){
		setAttributes(domNode,attributes);
		document.getElementById('nav-div').appendChild(domNode);
		return domNode;
	}
	return null;
	
}
// container deside the parent
//domParam is a json object
//tag is the inner html
//basically it is just a <a class= some-fancy-w3-nav href = link>ttag</a> in navigation bar
static w3topBar(domParam){
	domParam = domParam || {};
	var dom_id = "";
	var dom_link = "" ;
	var dom_class = "";
	var dom_tag = "";
	//if(isnull(container)) return;
	
	//Retrieve Parameter
	if(!isnull(domParam.id) && domParam.id !== ""){// null or undefined
		dom_id = ' id = "'+domParam.id+'" ';
	}
	if(!isnull(domParam.cssClass) && domParam.cssClass !== ""){
		dom_class = assignAttr("class",domParam.cssClass);//' class = "'+domParam.cssClass+'" ';
	}else{
		dom_class = assignAttr("class","w3-bar-item w3-button");
	}
	if(!isnull(domParam.link)){
		dom_link = assignAttr("href",domParam.link);
	}else{
		dom_link =assignAttr("href","#");
	}
	if(!isnull(domParam.tag)){
		dom_tag = domParam.tag;
	}
	console.log('tag:'+dom_tag);
	//var barItem  = '<a '+dom_id+ dom_link+ dom_class + '>'+htmlentities(dom_tag) + '/a>';
	var barItem = assignDom('a',dom_id+ dom_link+ dom_class,dom_tag);
	//$(barItem).appendTo(container);
	return $(barItem);
}
	
		
}