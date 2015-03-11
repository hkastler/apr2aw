google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(drawChart);



function drawChart() {

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
		
		for (i=0; i <=numberOfDays; i++){
			//console.log(i +" dt: " + dt);
			//console.log(i + "wt: " + weight);
			var dateToPlot = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
			var dateForLS = formatDateForLS(dateToPlot);
			
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
					//yield;
					//recordedWeight = genReadFromIndex(dateForIndex).next();
					/*recordedWeight = readFromIndex(dateForIndex,function(e){
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
																			});*/
					recordedWeight = parseFloat(localStorage.getItem("weightMeasurement" + dateForLS));
					console.log("recordedWeight:" + recordedWeight);
					var added = data.addRows([
						[dateToPlot, targetWeight, recordedWeight]
					]);

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

function weightMeasurementStorage(dateStr,weight){
	var itemKey = "weightMeasurement"+dateStr;
	localStorage.setItem(itemKey,weight);
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
	document.querySelector("#addWeightMeasurement").addEventListener("click", addWeightMeasurementLS, false);

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

function formatDateForLS(date){
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	var theDate = year + month + day;       
	return theDate;
	
}

function addWeightMeasurementLS() {	
    var weighDate = document.querySelector("#weighDate").value;
	console.log("weighDateLS:" + weighDate);
	weighDate = weighDate.replace(/-/g,"");
	var weightDateFmtLS = weighDate;
    var theWeight = document.querySelector("#weightMeasurement").value;
	
	weightMeasurementStorage(weightDateFmtLS,theWeight);
	
	return;    
}


//using jQuery here
$(window).resize(function(){
  drawChart();
});
