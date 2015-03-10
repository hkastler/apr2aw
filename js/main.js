google.load('visualization', '1', {packages: ['corechart']});
//google.setOnLoadCallback(drawChart);

//indexedDB
//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 
//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
 
if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}
const dbName = "apr2aw";
const dbVersion = 1;

//request seems to be a standard name for this operation
var request = window.indexedDB.open(dbName);	

request.onsuccess = function(e) {
	console.log("openDB onsuccess");		
	db = e.target.result;	
	drawChart(db);
}

request.onupgradeneeded = function(e) {
	var db = e.target.result;

	if(!db.objectStoreNames.contains("weightMeasurement")) {
		console.log("creating weightMeasurement store");
		var objectStore = db.createObjectStore("weightMeasurement",{autoIncrement:true});
		console.log("creating weighDateIndex");
		objectStore.createIndex("weighDateIndex", "weighDate", {unique:true});
		objectStore.onsuccess = function(e){
			console.log("weighDateIndex created");
		}
	}
}

request.onerror = function(e) {
	console.log("error opening DB:" + dbName);
}

function readFromIndex(key,callback) {
	var transaction = db.transaction(["weightMeasurement"]);
	var objectStore = transaction.objectStore("weightMeasurement");
	var index = objectStore.index("weighDateIndex");
	var request = index.get(key);
	var weightRecord = null;
	request.onerror = function(event) {
	  alert("indexeddb read error!");
	};
	request.onsuccess = function(event) {
	  //getWeightFromRecord(request.result);
	  
	  // Do something with the request.result!
	  if(request.result && request.result != null) {
			console.log("weight: " + request.result.weight + ", weighDate: " + request.result.weighDate);
			callback(request);			
	  } else {
			console.log("key:" + key + " not found"); 
			callback(null);
	  }
	};
		
}

function drawChart(db) {

	//console.log = function() {}
	var startingWeight = parseInt(document.getElementById("startingWeight").value);
	var goalWeight = parseInt(document.getElementById("goalWeight").value);
	var weightLossPerWeek = parseInt(document.querySelector('input[name="weightLossPerWeek"]:checked').value);
	var numberOfWeeks = (startingWeight-goalWeight)/ weightLossPerWeek
	var numberOfDays = numberOfWeeks * 7	
	var timeUnit = document.querySelector('input[name="timeUnit"]:checked');
	var startingDate = document.getElementById("startingDate").value;
	var dt = new Date(startingDate.toString());
	var today = new Date();
	
	if(dt == 'Invalid Date'){	
		//console.log("invalid date entered");
		dt = new Date();
		document.getElementById("startingDate").value =  formatDate(dt,"/");
		//console.log("fallback date used: " + dt);		
	}
	
	var data = new google.visualization.DataTable();
	
	if(timeUnit.value != "dt"){
		data.addColumn('number', 'X');
		
	}else{
		data.addColumn('date','Date');
			
	}
	data.addColumn('number', 'Target Weight');
	data.addColumn('number', 'Recorded Weight');
	
	var targetWeight = startingWeight;
	
	var options = {};
	var ticks = [];
	var hAxisTitle = "";
	var recordedWeight = null;
	
	
	if(timeUnit.value == "w"){
		hAxisTitle = "Week";
		for (i=0; i <=numberOfWeeks; i++){
				data.addRows([
					[i, targetWeight, recordedWeight]
				]);
			targetWeight = (targetWeight - (weightLossPerWeek));
			ticks.push(i);
		  }
	
	//show days
	}else if(timeUnit.value == "d"){
		hAxisTitle = "Day";
		for (i=0; i <=numberOfDays; i++){
				data.addRows([
					[i, targetWeight, recordedWeight]
				]);
			targetWeight = (targetWeight - (weightLossPerWeek/7));
			ticks.push(i)
		}
	//show date
	}else {
		hAxisTitle = "Date";
		
		if(db)console.log("db here in drawchart");
		
		
		for (i=0; i <=numberOfDays; i++){
			//console.log(i +" dt: " + dt);
			//console.log(i + "wt: " + weight);
			var dateToPlot = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
			var dateForIndex = formatDateForIndex(dateToPlot);
			
			if(today <= dateToPlot){
			    //no need to get recordedWeight for future
				recordedWeight = null;
				var added = data.addRows([
					[dateToPlot, targetWeight, recordedWeight]
				]);
				console.log("added row for future dates:" + added);
			}else{
				if(i=0){
					recordedWeight = startingWeight;
					var added = data.addRows([
						[dateToPlot, targetWeight, recordedWeight]
					]);
					console.log("added row in loop0:" + added);
				}else{
					
					recordedWeight = readFromIndex(dateForIndex,function(e){
																			if(e != null){
																				recordedWeight = parseFloat(e.result.weight);
																				console.log("recordedWeight:" + recordedWeight);
																				console.log("dateToPlot:" + dateToPlot);
																				console.log("targetWeight:" + targetWeight);
																				var added = data.addRows([
																					[dateToPlot, targetWeight, recordedWeight]
																				]);
																				console.log("added row in callback:" + added);
																				chart.draw(data, options);
																			}
																			});
					
				}
			}
			
			targetWeight = (targetWeight - (weightLossPerWeek/7));
			ticks.push(dateToPlot);
			dt.setTime(dt.getTime() + 86400000 );
			//console.log("next date: " + dt);
		}
	}
	
	options = {
		allowRedraw: true,
		hAxis: {
		  title: hAxisTitle,
		  ticks: ticks
		},
		vAxis: {
		  title: 'Weight'
		}
	};
	if(timeUnit.value == 'dt'){
		options.hAxis.format = 'M/dd/yy';
	}
	
	var chart = new google.visualization.LineChart(document.getElementById('apr2awChart'));
	
	chart.draw(data, options);
	storeLocally();
	
}

function storeLocally(){
	localStorage.setItem("startingDate", document.getElementById("startingDate").value);
	localStorage.setItem("startingWeight", document.getElementById("startingWeight").value);
	localStorage.setItem("goalWeight",document.getElementById("goalWeight").value);
	localStorage.setItem("weightLossPerWeek", document.querySelector('input[name="weightLossPerWeek"]:checked').value);
	localStorage.setItem("timeUnit", document.querySelector('input[name="timeUnit"]:checked').value);
	//console.log("data stored locally");
}

document.addEventListener("DOMContentLoaded", function(event) { 
  if(localStorage.startingDate != null){
	document.getElementById("startingDate").value = localStorage.startingDate;
  }
  if(localStorage.startingWeight != null){
	document.getElementById("startingWeight").value = localStorage.startingWeight;
  }
  if(localStorage.goalWeight != null){
	document.getElementById("goalWeight").value = localStorage.goalWeight;
  }
  if(localStorage.weightLossPerWeek != null){
	//document.getElementById("weightLossPerWeek").value = localStorage.weightLossPerWeek;
	var weightLossPerWeekRdo = document.apr2awFrm.weightLossPerWeek;
	for (var i=0; i<weightLossPerWeekRdo.length; i++)  {
		if (weightLossPerWeekRdo[i].value == localStorage.weightLossPerWeek){
			weightLossPerWeekRdo[i].checked = true;
		}
	}
  }
  
  if(localStorage.timeUnit != null){
	//document.getElementById("timeUnit").value = localStorage.timeUnit;
	//console.log("localStoragetimeUnit:" + localStorage.timeUnit);
	var timeUnitRdo = document.apr2awFrm.timeUnit;
	//console.log("timeUnitRdo:" + timeUnitRdo);
	//console.log("timeUnitRdo.length:" + timeUnitRdo.length);
	for (var i=0; i<timeUnitRdo.length; i++){
		//console.log("rdotimeUnit:" + timeUnitRdo[i]);
		if (timeUnitRdo[i].value == localStorage.timeUnit){
			timeUnitRdo[i].checked = true;
		}
	}
  }
 
	//Listen for add clicks
	document.querySelector("#addWeightMeasurement").addEventListener("click", addWeightMeasurement, false);

	//default value for weightMeasurement date
	var today =  new Date();
	document.getElementById("weighDate").valueAsDate = today;
	//for non-chrome browsers
	if(document.getElementById("weighDate").value == ""){
		document.getElementById("weighDate").value = formatDate(today,"/");
	}
	
 
}, false);//end of DOMContentLoaded


function formatDate(date,delimiter){
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	var theDate = month + delimiter + day + delimiter + year;       
	return theDate;
	
}

function formatDateForIndex(date){
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	var theDate = year + "-" + month + "-" + day;       
	return theDate;
	
}

function addWeightMeasurement(e) {
	
    var weighDate = document.querySelector("#weighDate").value;
    var theWeight = document.querySelector("#weightMeasurement").value;
	var createDate = new Date();
	
	 //weightMeasurement obj
    var weightMeasurementItem = {
        weighDate:weighDate,
        weight:theWeight,
		measureUnit: 'lb',
        created:createDate
    }
 
    console.log("About to add "+weighDate+":"+theWeight);
	 
	//open the db for transaction
    var transaction = db.transaction(["weightMeasurement"],"readwrite");
	//the objectStore within the db
    var store = transaction.objectStore("weightMeasurement");
	
	var addMeasurement = store.add(weightMeasurementItem);
 
    addMeasurement.onerror = function(e) {
        console.log("Error",e.target.error.name);
        //some type of error handler
    }
 
    addMeasurement.onsuccess = function(e) {
        console.log("weight measurement added");
	}
}

//using jQuery here
$(window).resize(function(){
  drawChart();
});
