//var topBar;
//var month;
//var login_box;
//var signup_box;
$(document).ready(function(){
	Month.getInstance().render(); //always render a default month view
	//initialize other instances
	initialize();

	
	
	
	//var modal = new signBox();
	//modal.node.css('display','block');
//modal.textNode(modal.header,'h2','this is title');
	//$('#container').each(function(){
		$(function(){
			$("#container").contextMenu({
				selector: '.day-enable', 
				callback: function(key, options) {
				},
				items: {
					"add": {
								name: "Create Event", 
								icon: "fa-calendar-plus",
								callback:
								function(key,options){
									//get Day object from Dom Node
									var day = $(this).data('ancestor');
									var currStamp = Month.getInstance().stamp;
									var currTime = new Date();
									var dayNum = (day.id >0 && day.id <32)? day.id: 1;
									var date = new Date(currStamp.getFullYear(),currStamp.getMonth(),dayNum,currTime.getHours(),currTime.getMinutes());
									eventBox.getInstance().show(null,date,'');
								}					
					},
					"reload": {
								name: "Re-render", 
								icon: "fa-sync",
								callback:
								function(key,options){
									initialize();
								}
					},				
				}
			});
		});
		$(function(){
			$("#container").contextMenu({
				selector: '.event', 
				callback: function(key, options) {
				},
				items: {
					"edit": {
								name: "Edit", 
								icon: "fa-edit",
								callback:
								function(key,element,event){
									
									var eventObj = $(this).data('ancestor');
									//console.log(eventObj.date);
									eventBox.getInstance().show(eventObj.eventId,eventObj.date,eventObj.title.text());
					}},
					"delete": 
						{
							name: "Delete", 
							icon:"delete",
							callback: 
							function(key,element,event){
								var eventObj = $(this).data('ancestor');
								console.log(eventObj.eventId);
								validateLogin(initialize,null,{eventid:eventObj.eventId,token:$('#secret').val()},'delete');
						}},
						"reload": {
									name: "Re-render", 
									icon: "fa-sync",
									callback:
									function(key,element,event){
										initialize();
									}
						},						
					}
			});
		});
//fa-calendar-plus
	
	
	
	
	
	
	
	
	
	
	
	
	
});





