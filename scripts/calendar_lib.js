//Ref: https://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript
/*jshint esversion: 6 */
class Base{
	static isnull(obj){
		return obj===null || typeof obj =='undefined';
	}
}
class Month{
	 static isDate(date){
		return (!Modal.isnull(date) && (date instanceof Date) && (!isNaN(date.valueOf())));
	 }
	 //Count digit. Pad the leading zero
	 //assume they are from getHours/getDate/...
	 static StringWithPadding(num){
		 var str = String(num);
		 if(num>=10){
			 return str;
		 }
		 return '0'+str;
	 }
	 static getStampByDate(date,withTime = false){
		if (!Month.isDate(date)){
			return null;
		}
		var str =  String(date.getFullYear())+'-'+Month.StringWithPadding(date.getMonth()+1)+'-'+Month.StringWithPadding(date.getDate());
		if(withTime){
			str = str + ' '+Month.StringWithPadding(date.getHours())+':'+Month.StringWithPadding(date.getMinutes());
		}
		return str;
	 }	
	 static getTimeString(date){
		if (!Month.isDate(date)){
			return null;
		}	
		var str = Month.StringWithPadding(date.getHours())+':'+Month.StringWithPadding(date.getMinutes());
		return str;
	 }		 
	static monthName(id){
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		if(id>=0 && id<=11){
			return months[id];
		}
			//console.log(id);
			return 'error';
	}
	constructor(){
			//Empty
	}
	/**This is not a real singleton: You can still use new
	 **to instantiate new instances, but getInstance always return the first one.
	 **Assume I don`t modify Month.singleton outside the closure or new
	 **Just to make sure that I don`t need a global var to store this instantiate and
	 **everything is in the closure.
	 So why don`t they have "private" access modifiers????
	 I have those languages without strong types.
	 */
	
	static getInstance(){
		if(Base.isnull(Month.singleton)){ // not assigned or undefined
			Month.singleton = new Month();
			Month.singleton.reset();
			var attr = assignAttr('id','container');
			//border style
			var attr2 = assignAttr('class','w3-border-top  w3-border-bottom');
			var domStr = assignDom('div',attr+' '+attr2);
			//dom node
			Month.singleton.node = $(domStr);
			Month.singleton.node.appendTo($(document.body));
			//Month.singleton.node.fadeIn(800);
			//control bar: buttons and title of month
			Month.singleton.bar = controlBar.getInstance();
			controlBar.install(Month.singleton);
			
			//won`t be changed: title of days (Sunday, Monday,...,Saturday)
			Month.singleton.banner = Banner.getInstance();
			//console.log(Month.singleton.node);
			Banner.install(Month.singleton);
		}
		return Month.singleton;
	}

	/**
		For Month view, Date is optional.
		Date here is the DD in MM/DD/YYYY
		not the weekday. It is more like a current selected day in a month.
	*/
	
	 setDateConventional(Year,Month,Date = 1){ //Month 1-12
		this.Year = Year;
		this.Month = Month-1;
		this.Date = Date;
		this.stamp.setMonth(this.Month);
		this.stamp.setFullYear(this.Year);
		this.stamp.setDate(this.Date);
	}
	
	setDate(date){ //just a renaming with not-null assertion
		if(Base.isnull(date)){
			return;
		}
		reset(date);
	}
	 reset(curr = null){
		//current
		//console.log('reset date');
		if(Base.isnull(curr)){
			curr = new Date();			
		}
		this.Year = curr.getFullYear();
		this.Month = curr.getMonth();
		this.Date = curr.getDate();
		this.WeekDay = curr.getDay();
		this.milisec = curr.getTime();
		this.stamp = curr; // for debug, mostly
		
	}
	//Render the dom nodes
	// UL as a day block; li as each event
	render(date=null){
		if(date!==null){
			//if given new date, then update, otherwise, use the current date record
			this.reset(date);
		}
		//Init the Banner obj
		if(Base.isnull(this.banner)){
			this.initBanner();
		}

		if (Base.isnull(this.Year) || Base.isnull(this.Month)){
			this.reset(); //use current time stamp as default
		}		
		/** Move to CSS, separate most of the appearance except for things like hiding(display none)
		this.node.css('width','70.2vw'); 
		this.node.css('height','60vh');
		this.node.css('margin','5% auto');
		this.node.css('display','table');
		*/
		//this.node.css('border-style','inset');	
		this.loadWeeks();
		controlBar.getInstance().MonthTitle.html(this.Year+' '+Month.monthName(this.Month));
		//controlBar.install(this,false);
		
		//this.node.appendTo($(document.body));
	}
	initBanner(){
		this.banner = Banner.getInstance();
	}
	initWeek(){
		this.weeks = [];
		for(var ii=0;ii<6;ii++){
			this.weeks[ii] = new Week(this,ii);
			/*
			this.weeks[ii].node.css('display','table'); //table: width not affecting
			this.weeks[ii].node.css('float','left'); //left		
			//this.weeks[ii].node.css('background-color','azure');	//border-style: double
			//this.weeks[ii].node.css('border-style','double');	
			//this.weeks[ii].node.css('border-width','2px');		
			this.weeks[ii].node.css('overflow-x','auto');		
			this.weeks[ii].node.css('margin','0 auto');			
			*/
			//debug the appearance				
		}
	}
	initDay(){
		this.days = [];
		/**colors are rendered dynamically, based on which month in which year.
			so it must be put in the js script here.
		*/
		var mouseIn = function(e){
				this.prevColor = $(this).css('background-color');
				$(this).css('background-color','lightgray');
			};
		var mouseOut = function(e){
					$(this).css('background-color',(!Base.isnull(this.prevColor)?this.prevColor:"white"));
				};
		for(var ii=0;ii<42;ii++){
			var weekId = Math.floor(ii/7);
			//console.log('initDay');
			this.days[ii] = new Day(this,ii,this.weeks[weekId]);
			
			/** move to css
			this.days[ii].node.css('display','inline-block');
			this.days[ii].node.css('float','left');		
			//this.days[ii].node.css('background-color','azure');	//border-style: double
			this.days[ii].node.css('border-style','ridge');	
			this.days[ii].node.css('width','10vw');
			this.days[ii].node.css('height','18vh');		
			this.days[ii].node.css('margin','0 auto');
			this.days[ii].node.css('vertical-align','center');
			this.days[ii].node.css('padding','0');
			this.days[ii].node.css('overflow-y','auto');
			this.days[ii].node.css('overflow-x','hidden');	
			*/
			this.days[ii].node.hover(mouseIn,mouseOut);				
			//			white-space
			//this.days[ii].node.css('white-space','nowrap');	
			//debug the appearance				
		}
	}	

	loadWeeks(){
		if(Base.isnull(this.weeks) || !Array.isArray(this.weeks) || this.weeks.length<6){
			this.initWeek();
		}

		/*
			Get Month info of the year
			0 seems to be the last day of prev month
			Refhttps://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript
		*/
		//use zero because there are no info for last day without manual calculation
		//So why don`t they make Date 0~30? and hence -1 will be the last day of prev month??????
		var tool = new Date(this.Year,this.Month+1,0); //given month
		//console.log("Month"+String(this.Month));
		this.numberOfDays = tool.getDate(); //number of days of current month.
		tool.setMonth(this.Month);
		tool.setDate(1);
		//the offset of days in the first week, before the first day of month
		this.offset = tool.getDay();
		var daysPadded = this.offset+this.numberOfDays;
		this.numberOfWeeks = Math.ceil(daysPadded/7);//Math.floor(daysPadded/7)+(daysPadded%7>0?1:0); 
		this.loadDays(this.offset,this.numberOfWeeks,this.numberOfDays);
	}
	//Load days to months
	//setup the flag and ids.
	loadDays(offset,numberOfWeeks,numberOfDays){
		if(Base.isnull(this.days) || !Array.isArray(this.days) || this.days.length<42){
			this.initDay();
		}
		var ii;	
		var jj;
		var dayCount = 0;
		for(ii=0;ii<numberOfWeeks;ii++){
			for(jj=0;jj<7;jj++){
				var dayIndex = ii*7+jj;
				if(dayCount<offset || dayCount>=offset+numberOfDays){
					//not vaalid: before first day
					//console.log('loadDay loop');
					this.days[dayIndex].valid = false; 
					this.days[dayIndex].id = -1*dayIndex;
					this.days[dayIndex].node.addClass('day-disable');
					this.days[dayIndex].node.removeClass('day-enable');
					/**
						Dynamic coloring
					*/
					this.days[dayIndex].node.css('background-color','white');	//border-style: double
			
				}else{
					this.days[dayIndex].valid = true; 
					this.days[dayIndex].id = dayIndex - offset +1; //date number	
					this.days[dayIndex].node.css('background-color','azure');	//border-style: double
					this.days[dayIndex].node.removeClass('day-disable');
					this.days[dayIndex].node.addClass('day-enable');								
				}	
				//debug
				var dayNum = this.days[dayIndex].id>0?this.days[dayIndex].id:'';
				// this.days[dayIndex].node.html(mark);//html is not a good idea for ul
				// use spannode
				if(Base.isnull(this.days[dayIndex].dayLabel)){
					this.days[dayIndex].dayLabel = $(assignDom('li',assignAttr('class','day-label'),dayNum));
					this.days[dayIndex].dayLabel.appendTo(this.days[dayIndex].node);							
				}else{
					this.days[dayIndex].dayLabel.text(dayNum);
				}

				dayCount++;
			}

			
		}
		for(ii=numberOfWeeks;ii<6;ii++){
			//weeks to hide
			this.weeks[ii].node.css('display','none');
		}		
	}	
	
	
	monthChange(delta){
		if(!delta){
			//include nan
			//console.log("monthChange:delta");
			return;
		}else if(delta+this.Month>11 || delta+this.Month<0){
			console.log('Year change');
		}else{
			//console.log('no year-change');
			//this.Month = this.Month+delta;
			//this.stamp.setMonth(this.Month+delta);		
		}
		var newMonth = (delta+this.Month)%12; //
		var newYear = this.Year + Math.floor((delta+this.Month)/12);	
		this.stamp.setMonth(newMonth);
		this.stamp.setFullYear(newYear);
		this.reset(this.stamp);
		this.render();
		
	}
	hide(){
		this.node.css('display','none');
	}
	show(){
		this.node.css('display','table');
	}	

}
class controlBar{
	constructor(){
		
	}
	static getInstance(){
		if(Base.isnull(controlBar.singleton)){ // not assigned or undefined
			controlBar.singleton = new controlBar();
			var attr = assignAttr('class','w3-bar controlBar'); //
			var domStr = assignDom('div',attr);

			controlBar.singleton.node = $(domStr);
			/**move to css Class controlBar
			controlBar.singleton.node.css('display','block');
			controlBar.singleton.node.css('margin','0 auto');
			controlBar.singleton.node.css('width','100%');
			controlBar.singleton.node.css('height','5vh');
			*/
			//controlBar.singleton.node.css('padding-right','20%');
			//Banner.singleton.node.css('border-style','ridge');
			//Banner.singleton.node.appendTo($(document.body));
		}
		return controlBar.singleton;
	}
	static install(parent,load_flag = true){
		//console.log('install-bar');
		var attr_link = assignAttr('href','#');
		//left montth right
		var attr = assignAttr('class','w3-border-right w3-bar-item w3-left w3-button w3-hover-light-blue');
		var domStr = assignDom('a',attr_link+' '+attr,"Prev");
		controlBar.getInstance().left = $(domStr);
		controlBar.getInstance().left.on("click",controlBar.trig_prev);
		/**
			need to override: addClass does not work
		*/
		controlBar.getInstance().left.css('width','20vw');
		
		//controlBar.getInstance().left.css('padding','0');
		//controlBar.getInstance().left.css('border-style','inset');
		//month
		attr = assignAttr('class',' w3-bar-item  w3-hover-light-grey');
		domStr = assignDom('a',attr_link+' '+attr,parent.Year+" "+Month.monthName(parent.Month));
		controlBar.getInstance().MonthTitle = $(domStr);	
		/**
			need to override: addClass does not work
			keep the rest property of navbar
		*/
		
		controlBar.getInstance().MonthTitle.css('width','30vw');
		controlBar.getInstance().MonthTitle.css('text-align','center');
		//right
		attr = assignAttr('class','w3-border-left w3-bar-item  w3-button w3-hover-light-blue');
		domStr = assignDom('a',attr_link+' '+attr,'Next');
		controlBar.getInstance().right = $(domStr);	
		controlBar.getInstance().right.on("click",controlBar.trig_next);
		/** need to override: addClass does not work
		*/
			controlBar.getInstance().right.css('width','20vw');
		if(load_flag){
			controlBar.getInstance().node.appendTo(parent.node);		
			controlBar.getInstance().left.appendTo(controlBar.getInstance().node);
			controlBar.getInstance().MonthTitle.appendTo(controlBar.getInstance().node);				
			controlBar.getInstance().right.appendTo(controlBar.getInstance().node);		
			//controlBar.getInstance().right.appendTo(controlBar.getInstance().node);	//try duplicate: experiment			
		}

		
	}
	hide(){
		this.node.css('display','none');
	}
	show(){
		this.node.css('display','table');
	}
	static trig_prev(){
		//console.log('click prev');
		$('.week').hide();
		Month.getInstance().monthChange(-1);
		$('.week').fadeIn(800).show();
		//Month.getInstance().node.show();		
		initialize();
	}
	static trig_next(){
		//console.log('click next');
		$('.week').hide();
		Month.getInstance().monthChange(1);
		$('.week').fadeIn(800).show();
		initialize();
	}	
}
class Banner{
	constructor(){

	}
	static getInstance(){
		if(Base.isnull(Banner.singleton)){ // not assigned or undefined
			Banner.singleton = new Banner();
			var attr = assignAttr('class','banner');
			var domStr = assignDom('div',attr);
			this.bullets = [];
			Banner.singleton.node = $(domStr);
			/* move to css
			Banner.singleton.node.css('display','table');
			Banner.singleton.node.css('margin','0 auto');
			*/
			//Banner.singleton.node.css('border-style','ridge');
			//Banner.singleton.node.appendTo($(document.body));
		}
		return Banner.singleton;
	}
	static install(parent){
		var domNode = Banner.getInstance().node;
		if(Base.isnull(domNode))return;
		domNode.appendTo(parent.node);
		Banner.loadBullet(parent);
	}
	static loadBullet(parent){
		var dayName = ['Sun','Mon','Tue','Wed','Thur','Fri','Wed'];
		for(var ii=0;ii<7;ii++){
			//dayName
			var attr = assignAttr('class','bannerTitle');
			var domStr = assignDom('span',attr);			
			this.bullets[ii] = $(domStr);
			this.bullets[ii].appendTo(parent.node);
			this.bullets[ii].html(dayName[ii]);
			/** Move to css
			this.bullets[ii].css('display','inline-block');
			this.bullets[ii].css('float','left');		
			this.bullets[ii].css('background-color','lavender');	//border-style: double
			this.bullets[ii].css('width','10vw');
			this.bullets[ii].css('height','5vh');	
			this.bullets[ii].css('text-align','center');	
			this.bullets[ii].css('border-style','ridge');\
			*/
		}
	}
}

/** Not required. But it can be object of a row.

*/
class Week{
	hide(){
		this.node.css('display','none');
	}
	show(){
		this.node.css('display','table');
	}	
	constructor(parent,id){
		this.parent = parent;
		this.id = id;
		this.renderWeek();
	}
	renderWeek(){
		var attr = assignAttr('class','week');
		var domStr = assignDom('div',attr);
		this.node = $(domStr);
		//console.log(this.node);
		this.node.appendTo(this.parent.node);
	}
}
class Day{
	constructor(parent,id,week,valid = false){
		this.id = id;
		this.parent=parent;//month
		this.valid = valid;
		this.week = week;
		this.renderDay();
	}
	renderDay(){
		var attr = assignAttr('class','day');
		var domStr = assignDom('ul',attr);
		this.node = $(domStr);
		this.node.data('ancestor',this);
		//console.log(this.node);				
		this.node.appendTo(this.week.node);
	}	


	 getPool(){
		if(Base.isnull(this.pool)|| !Array.isArray(this.pool)){
			this.pool = [];
		}
		return this.pool;
	}
	 clearPool(){
		var pool = this.getPool(); //init
		for(var key in pool){
			if(key){
				pool[key].node.detach();
			}
		}		
		this.pool = [];
	}
	collect(eventObj){
		this.getPool().push(eventObj);
	}
		
	sift(){
		if(Base.isnull(this.pool)|| !Array.isArray(this.pool)){
				return;
		}
		var pool =  this.getPool();
		pool.sort(Day.compareByTime);
		for(var key in pool){
			if(key){
				pool[key].loadToParent(this);
			}
		}
	} 
	static compareByTime(a,b){
		return a.date.getHours() - b.date.getHours();
	}
	addEventByEvent(eventObj){
		if(Base.isnull(this.events) || !Array.isArray(this.events)){
			this.events = [];
		}
		this.events.push(eventObj);
		eventObj.node.appendTo(this.node);
	
	}
	addEventByInput(title,dateObj,eventId){
		var eventObj = new Event(this,title,dateObj,eventId);
		if(Base.isnull(this.events) || !Array.isArray(this.events)){
			this.events = [];
		}
		this.events.push(eventObj);
	}
}
class Event{
	constructor(parent,title,username,dateObj,eventId){
		this.renderEvent(title,dateObj,username);
		this.loadToParent(parent);
		this.eventId = eventId;
		this.username = username;
	}
	loadToParent(parent){
		if(!Base.isnull(parent)){
			this.node.appendTo(parent.node);
			this.parent = parent;
		}		
	}
	//eventContent('')
	renderEvent(title,dateObj,username){
		var attr = assignAttr('class','event');
		
		var domStr = assignDom('li',attr,'');		
		this.node = $(domStr);
		this.node.data('ancestor',this);
		//paragraph for time
		this.date = dateObj;
		
		this.holder = $(assignDom('div',assignAttr('class','event-holder')));
		this.holder.appendTo(this.node);

		this.time =  $(assignDom('span',assignAttr('class','event-content-time'),'Time: '+Month.StringWithPadding(dateObj.getHours())+':'+Month.StringWithPadding(dateObj.getMinutes())));
		this.time.appendTo(this.holder);

		this.owner = $(assignDom('span',assignAttr('class','event-content-user'),'Owner: '+username));
		this.owner.appendTo(this.holder);
		
		this.title = $(assignDom('span',assignAttr('class','event-content-title'),title));
		this.title.appendTo(this.holder);
		/** move to css
		this.node.css('background-color','lavender');
		this.node.css('list-style-type','none');
		this.node.css('display','flex');
		this.node.css('width','9.4vw');
		this.node.css('margin','4% auto');		
		this.node.css('vertical-align','middle');
		
		this.node.node.hover(function(){
			$(this).css('background-color','teal');
		});		
		*/
	}
}