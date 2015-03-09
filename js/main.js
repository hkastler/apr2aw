google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(drawChart);

//indexedDB
var db;
const dbName = "apr2aw";

function drawChart() {

	//console.log = function() {}
	var startingWeight = parseInt(document.getElementById("startingWeight").value);
	//console.log("startingWeight: " +startingWeight);

	var goalWeight = parseInt(document.getElementById("goalWeight").value);
	//console.log("goalWeight: " +goalWeight);
	
	var weightLossPerWeek = parseInt(document.querySelector('input[name="weightLossPerWeek"]:checked').value);
	//console.log("weightLossPerWeek: " +weightLossPerWeek);
	
	var numberOfWeeks = (startingWeight-goalWeight)/ weightLossPerWeek
	var numberOfDays = numberOfWeeks * 7
	
	var timeUnit = document.querySelector('input[name="timeUnit"]:checked');
	//console.log("timeUnit: " + timeUnit.value);
	
	var startingDate = document.getElementById("startingDate").value;
	//console.log("Starting date: " + startingDate);
	var dt = new Date(startingDate.toString());
	//console.log("starting dt:" + dt);
	if(dt == 'Invalid Date'){	
		//console.log("invalid date entered");
		dt = new Date();
		document.getElementById("startingDate").value =  (dt.getMonth() +1) + "/" + dt.getDate() + "/" + dt.getFullYear();
		//console.log("fallback date used: " + dt);		
	}
	
	var data = new google.visualization.DataTable();
	
	if(timeUnit.value != "dt"){
		data.addColumn('number', 'X');
	}else{
		data.addColumn('date','Date');
	}
	data.addColumn('number', 'Target Weight');

	var weight = startingWeight;
	
	var options = {};
	var ticks = [];
	var hAxisTitle = "";
	
	if(timeUnit.value == "w"){
		hAxisTitle = "Week";
		for (i=0; i <=numberOfWeeks; i++){
				data.addRows([
					[i, weight]
				]);
			weight = (weight - (weightLossPerWeek));
			ticks.push(i);
		  }
	
	//show days
	}else if(timeUnit.value == "d"){
		hAxisTitle = "Day";
		for (i=0; i <=numberOfDays; i++){
				data.addRows([
					[i, weight]
				]);
			weight = (weight - (weightLossPerWeek/7));
			ticks.push(i)
		}
	//show date
	}else {
		hAxisTitle = "Date";
		console.log("date: " + dt);
		
		for (i=0; i <=numberOfDays; i++){
				//console.log(i +" dt: " + dt);
				//console.log(i + "wt: " + weight);
				data.addRows([
					[new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0), weight]
				]);
		
			weight = (weight - (weightLossPerWeek/7));
			ticks.push(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0));
			dt.setTime(dt.getTime() + 86400000 );
			//console.log("next date: " + dt);
			
		}
	}
	
	/*
	var oWidth = window.screen.availWidth;
	oWidth = oWidth - (.2 * oWidth);
	var oHeight = window.screen.availHeight;
	oHeight = oHeight - (.2 * oHeight);
	*/
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
	if(typeof(Storage) !== "undefined") {
		localStorage.setItem("startingDate", document.getElementById("startingDate").value);
		localStorage.setItem("startingWeight", document.getElementById("startingWeight").value);
		localStorage.setItem("goalWeight",document.getElementById("goalWeight").value);
		localStorage.setItem("weightLossPerWeek", document.querySelector('input[name="weightLossPerWeek"]:checked').value);
		localStorage.setItem("timeUnit", document.querySelector('input[name="timeUnit"]:checked').value);
		//console.log("data stored locally");
} else {
    alert("Apologies, your browser does not support local storage of data.");
}
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
 
//make sure indexedDB exists
if(!indexedDBOk){
	console.log("indexedDB is not ok");
}else{
	console.log("indexedDB is in the house");
}
//request seems to be a standard name for this operation
var request = indexedDB.open(dbName,1);
 
request.onupgradeneeded = function(e) {
	var thisDB = e.target.result;

	if(!thisDB.objectStoreNames.contains("weightMeasurement")) {
		console.log("creating weightMeasurement store");
		thisDB.createObjectStore("weightMeasurement",{ autoIncrement: true });
	}else{
		console.log("weightMeasurement in the db");
	}
}
	

request.onsuccess = function(e) {
	console.log("request onsuccess");
	
	db = e.target.result;	
	get_records(db);
}

request.onerror = function(e) {
	//Do something for the error
}


 
}, false);//end of DOMContentLoaded

 
function indexedDBOk() {
    return "indexedDB" in window;
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
	
	var addMeasurement = store.add(weightMeasurementItem,{id:autoIncrement});
 
    addMeasurement.onerror = function(e) {
        console.log("Error",e.target.error.name);
        //some type of error handler
    }
 
    addMeasurement.onsuccess = function(e) {
        console.log("weight measurement added");
		get_records(db);
    }
}

//http://www.html5labs.com/IndexedDBTest/CodeSnippets/samples.html
//http://www.ibm.com/developerworks/library/wa-indexeddb/
function get_records(db) {
	var objStoreName = "weightMeasurement";
		try{
				
				if (db){
					console.log("db getting records");
					var objStore = db.transaction("weightMeasurement").objectStore("weightMeasurement");
					
					if (objStore){
						var cursor = objStore.openCursor();
						cursor.onsuccess = function(evt) {
						var cursor = evt.target.result;
							 if (cursor) {
								var weightMeasurement = cursor.value;
								var jsonStr = JSON.stringify(weightMeasurement);
								console.log(jsonStr);
								cursor.continue();
							 }
						};
						
					}else {
						console.log("Failed to open objectStore.");
					}
					
					db.close();
				}
			}catch (e) {
				console.log("Error: " + e.message);
			}
}

//using jQuery here
$(window).resize(function(){
  drawChart();
});
