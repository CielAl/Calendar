//make sure it is ref before other scripts
/*jshint esversion: 6 */

function isnull(obj){ //it will allow empty string
	return obj===null || typeof obj =='undefined';
}
//Only validate the structure but not values


//Val is raw string, without escaped quote 
//the output is sopposed to be something like "attributeName = value"
function assignAttr(name,val){
	name = name || "";
	val = val || "";
	return val === "" ? "" :  name + '="' + val + '" ';
}
// so it will be a string like <node attribute = val > innerhtml </node>
function assignDom(domType, attr,innerVal='',stray = true){
	domType = domType || "";
	
	if(domType === ""){
		return null;
	}
	attr= attr || "";
	innerVal = innerVal|| "";
	var endTag = '';
	if(stray){
		endTag = '</'+domType+'>';
	}
	return '<'+domType+' '+attr+'>'+htmlentities(innerVal)+endTag;
	
}

function htmlentities(str){
	//Tolerate null
	
	//why the heck there is not a native one in javascript??
	if(isnull(str)){
		return "";
	}
	//Cast, in case it is number.
	var result = String(str);
	//Per https://www.w3schools.com/html/html_entities.asp 
	//I escape  <>&[whitespace] and quotes (single and double)
	result =  result.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
	result = result.replace(/\s/g,'&nbsp').replace(/"/g, '&quot;').replace(/'/g,'&apos');
	// The other html entities seems to be special characters and I don`t want then ruin the encoding here.
	// And since they are rarely encountered in this scenario, I decide to neglect them.
	return result;
}


//create dom nodes refer to the given css stylesheet or js script
function loadExternal(path, type){
	if(path==="" || isnull(path) ||type ==="" || isnull(type)){
		return false;
	}
	type = type.toLowerCase(type);
	var domNode;
	var ele_type ="";
	var attributes = "";
	//type:text/javscript for js might not be necessary based on css validator, but I`ll just put it here.
	switch(type){
		case "js":
			ele_type = 'script';
			attributes = {
				type: "text/javascript",		
				src: path
			};
			break;
		case "css":
			ele_type = 'link';
			attributes = {
				type: "text/css",		
				href: path,
				rel: 'stylesheet'
			};			
			break;
		default:
			return false;
	}
	domNode = document.createElement(ele_type);
	//setAttributes define multiple (list) attr
	setAttributes(domNode,attributes);
    if (!isnull(domNode)){
		//Not sure if it can work after the document is ready. 
		// But it may be useful so I put it here.
        document.getElementsByTagName("head")[0].appendChild(domNode);
		return true;
	}
	return false;

}
//attributes is a list/array. simply numerate the list and do the setAttribute
function setAttributes(element, attributes) {
  for(var key in attributes) {
	if(key){
		element.setAttribute(key, attributes[key]);		
	}
  }
}


