google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(drawChart);

//const
var DAY_MILLISECONDS = 86400000;

function drawChart() {
	//console.log = function() {}

	//some objs used over
	var startingWeightObj = document.getElementById("startingWeight");
	var startingDateObj = document.getElementById("startingDate");
	var dayRangeStartDateObj = document.getElementById("dayRangeStartDate");
	var dayRangeEndDateObj = document.getElementById("dayRangeEndDate");	
	
	var startingWeight = parseInt(startingWeightObj.value);
	//console.log("startingWeight:" + startingWeight);
	var goalWeight = parseInt(document.getElementById("goalWeight").value);
	//console.log("goalWeight:" + goalWeight);
	var weightLossPerWeek = parseInt(document.querySelector('input[name="weightLossPerWeek"]:checked').value);
	var weightDiff = startingWeight - goalWeight;
	//console.log("weightDiff:" + weightDiff);
	var numberOfWeeks = weightDiff / weightLossPerWeek
	//console.log("numberOfWeeks:" + numberOfWeeks);
	var numberOfDays = numberOfWeeks * 7	
	var timeUnit = document.querySelector('input[name="timeUnit"]');
	var startingDate = startingDateObj.value;
	startingDate += " 00:00:00"
	//console.log("startingDate:" + startingDate.toString());
	var dt = new Date(startingDate);
	//console.log("dt:" + dt);
	if(dt == 'Invalid Date'){	
		//console.log("invalid date entered");
		dt = new Date();
		startingDateObj.value =  formatDate(dt,"/");
		//console.log("fallback date used: " + dt);		
	}
	
	var today = new Date().setHours(0,0,0,0);
	today = new Date(today);
	
	var dayOfProgram = dateDiffInDays(dt,today);
	
	console.log("currentDayOfProgram: "+ dayOfProgram);
	
	if(dayRangeStartDateObj.value == ""){
		dayRangeStartDateObj.value = startingDateObj.value;
	}
	
	var dayRangeStartDateStr =  dayRangeStartDateObj.value + " 00:00:00";
	var rangeStartDate = new Date(dayRangeStartDateStr);
	console.log("rangeStartDate:" + rangeStartDate);
	var dayRangeStart = dateDiffInDays(rangeStartDate,dt);
	if(isNaN(dayRangeStart)){
		dayRangeStart = 0;		
	}
	
	var dayRangeEndDateStr =  dayRangeEndDateObj.value + " 00:00:00";
	var rangeEndDate = new Date(dayRangeEndDateStr);
	var dayRangeEnd = dateDiffInDays(rangeEndDate, dt);
	console.log("dayRangeEnd: "+ dayRangeEnd);
	if(isNaN(dayRangeEnd)){
		dayRangeEnd = numberOfDays;
	}
	
	var weightMeasurements = new Object();
	
	if(localStorage.getItem("weightMeasurements") != null){
		//console.log("wm:" + localStorage.getItem("weightMeasurements"));
		weightMeasurements = JSON.parse(localStorage.getItem("weightMeasurements"));
		//console.log(weightMeasurements);
	}
	
	var data = new google.visualization.DataTable();
	
	data.addColumn('date','Date');
	data.addColumn('number', 'Target Weight @' + weightLossPerWeek + "lb per week");
	data.addColumn({'type': 'string', 'role': 'style'});
	data.addColumn({type: 'string', role:'annotation'});
	data.addColumn({type: 'string', role:'annotationText'});
	data.addColumn('number', 'Recorded Weight');
	data.addColumn({type: 'string', role:'annotation'});
	data.addColumn({type: 'string', role:'annotationText'});
	
	var options = {};
	var ticks = [];
	var recordedWeight = null;
	var pointStyle = null;
	var annotation1 = "";
	var annotationText1 = "";
	var annotation2 = "";
	var annotationText2 = "";
	//var dayRangeStart = 0;
	//var dayRangeEnd = numberOfDays;
	var targetWeight = startingWeight -  ( (weightLossPerWeek/7) * dayRangeStart );
	//console.log("dt:" + dt);
	var chartTime = dt.setTime(dt.getTime() + ( DAY_MILLISECONDS * dayRangeStart) ) ;
	//console.log("chartTime:" + chartTime);
	var chartDate = new Date(chartTime);
			
	for (i=dayRangeStart; i <= dayRangeEnd; i++){
			
		var dateToPlot = new Date(chartDate.getFullYear(), chartDate.getMonth(), chartDate.getDate(), 0, 0, 0, 0);
		var dateForKey = formatDateForKey(dateToPlot);
				
		if(dateToPlot > today){
			//no need to get recordedWeight for future
			pointStyle = null;
			recordedWeight = null;
			annotation1 = null;
			annotationText1 = null;
			annotation2 = null;
			annotationText2 = null;
			
			//console.log("added row for future dates:" + added);
		}else{
												
			//console.log("dateToPlot:" + dateToPlot);
			//recordedWeight = parseFloat(localStorage.getItem("weightMeasurement" + dateForLS));
			recordedWeight = parseFloat(weightMeasurements[dateForKey]);
			if(isNaN(recordedWeight)){
				recordedWeight = null;
			}
			console.log("recordedWeight:" + recordedWeight);
			var dateToPlotComp = new Date(dateToPlot);
					
			if(dateToPlotComp.getTime() == today.getTime()){
				//console.log("today found");
				pointStyle =  "point { size: 12; shape-type: star; }";
				annotation1 = "Today";
				annotationText1 = "Target Weight: " + targetWeight.toFixed(2);
				annotation2 = "Today";
				annotationText2 = "Recorded Weight: " + recordedWeight;
			}else{
				//console.log("today:" + today + " dateToPlot: " + dateToPlot);
				pointStyle = null;
				annotation1 = null;
				annotationText = null;
				annotation2 = null;
				annotationText2 = null;
			}
			//weightMeasurements[dateForKey] = recordedWeight;
		}
		
		var added = data.addRows([
				[dateToPlot, targetWeight, pointStyle, annotation1, annotationText1, recordedWeight, annotation2, annotationText2]
		]);
		
		targetWeight = (targetWeight - (weightLossPerWeek/7));
		ticks.push(dateToPlot);
		chartDate.setTime(chartDate.getTime() + DAY_MILLISECONDS );
		//console.log("next date: " + dt);
	}
	
	function selectHandler() {
		var selectedItem = chart.getSelection()[0];
		console.log(selectedItem);
		if (selectedItem) {
			console.log(data);
		  var value = data.getValue(selectedItem.row, 7);
			console.log('The user selected ' + value);
		}
	  }
	
	options = {
		interpolateNulls: true,
		allowRedraw: true,
		hAxis: {
		  format: 'M/dd/yy',
		  title: 'Date',
		  ticks: ticks
		},
		vAxis: {
		  title: 'Weight'
		},
		
		series: {
        0: {
          // set any applicable options on the first series
		  lineWidth: 1,
          pointSize: 1
        },
        1: {
          // set the options on the second series
          lineWidth: 1,
          pointSize: 2
        }
      }
    
	};
	
	
	var chart = new google.visualization.LineChart(document.getElementById('apr2awChart'));
	//selectHandler impl sometime
	//google.visualization.events.addListener(chart, 'select', selectHandler);
	//don't need this yet
	//data.sort([{column: 0}]);	
	
	if(dayRangeEndDateObj.value == ""){
		var startDate = new Date(dayRangeStartDateObj.value);
		var endTime = startDate.setTime(startDate.getTime() + ( DAY_MILLISECONDS * numberOfDays) ) ;
		var endDate = new Date(endTime);
		var isChrome = window.chrome;
		if(isChrome){
			dayRangeEndDateObj.value = formatDateForInput(endDate);
		}else{
			dayRangeEndDateObj.value = formatDate(endDate,"/");
		}
	};
	if(isNaN(numberOfDays)){
		numberOfDays = " starting";
	}
	var timeRecap = "Today, " + today.toString().substring(0,15) + ", is day "  + dayOfProgram + " of " + numberOfDays;
	document.getElementById('timeRecap').innerHTML = timeRecap;
	document.getElementById('weightMeasurementsInfo').innerHTML = weightMeasurementHtml(weightMeasurements);
	chart.draw(data, options);
	storeLocally();
	
}

function dateDiffInDays(date1,date2){
	try{
		var timeDiff = Math.abs(date1.getTime() - date2.getTime());
		var dayDiff = Math.ceil(timeDiff / DAY_MILLISECONDS); 
		return dayDiff;
	}catch(err){
	
	}
}

function getRangeChart(){
	var dayRangeStartDate =  document.getElementById("dayRangeStartDate").value ;
	var dayRangeEndDate = document.getElementById("dayRangeEndDate").value ;
	
	var startDate = new Date(dayRangeStartDate);
	var endDate = new Date(dayRangeEndDate);	
	
	var isStartDate = !( startDate == 'Invalid Date');
	var isEndDate =   !( endDate == 'Invalid Date');
	var isStartBeforeEnd = startDate < endDate;
	
	if((isStartDate && isEndDate) && (isStartBeforeEnd)){
		drawChart();
	}
	
}

function storeLocally(){
	localStorage.setItem("startingDate", document.getElementById("startingDate").value);
	localStorage.setItem("startingWeight", document.getElementById("startingWeight").value);
	localStorage.setItem("goalWeight",document.getElementById("goalWeight").value);
	localStorage.setItem("weightLossPerWeek", document.querySelector('input[name="weightLossPerWeek"]:checked').value);
	localStorage.setItem("timeUnit", document.querySelector('input[name="timeUnit"]').value);
	localStorage.setItem("dayRangeStartDate",document.getElementById("dayRangeStartDate").value);
	localStorage.setItem("dayRangeEndDate",document.getElementById("dayRangeEndDate").value);
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
	document.getElementById("timeUnit").value = localStorage.timeUnit;
  }
  
  if(localStorage.dayRangeStartDate != null){
	document.getElementById("dayRangeStartDate").value = localStorage.dayRangeStartDate;
  }
  
  if(localStorage.dayRangeEndDate != null){
	document.getElementById("dayRangeEndDate").value = localStorage.dayRangeEndDate;
  }
 
	//Listen for add clicks
	document.querySelector("#addWeightMeasurement").addEventListener("click", addWeightMeasurementLS, false);
	document.getElementById('resetRange').addEventListener('click', resetRange, true);
	document.getElementById('clearData').addEventListener('click', clearData ,false);
	
	document.getElementById('startingDate').addEventListener('input', drawChart, true);
	document.getElementById('startingWeight').addEventListener('input', drawChart, true);
	document.getElementById('goalWeight').addEventListener('input', drawChart, true);
	
	document.getElementById('dayRangeStartDate').addEventListener('input', function(){getRangeChart();}, true);
	document.getElementById('dayRangeEndDate').addEventListener('input', function(){getRangeChart();}, true);
	
	
		
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

function formatDateForKey(date){
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	var theDate = year + month + day;       
	return theDate;
	
}

function formatDateForInput(date){
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	var theDate = year +"-"+ month +"-"+ day;       
	return theDate;
	
}

function resetRange(){
	document.getElementById("dayRangeStartDate").value = "";
	document.getElementById("dayRangeEndDate").value = "";
	localStorage.removeItem("dayRangeEndDate");
	drawChart();
}

function addWeightMeasurementLS() {	

    var weighDate = document.querySelector("#weighDate").value;
	
	weighDate += " 00:00:00"
	//console.log("weighDateLS:" + weighDate);
	//weighDate = weighDate.replace(/-/g,"");
	//constructing the date like this works across browsers
	//vs accepting the date string from any browser
	weighDate = new Date(weighDate);
	
	var weightDateFmtLS = formatDateForKey(weighDate);
	//console.log("weightDateFmtLS:" + weightDateFmtLS);
    var theWeight = document.querySelector("#weightMeasurement").value;
	
	weightMeasurementStorage(weightDateFmtLS,theWeight);
	drawChart();
	return;    
}

function weightMeasurementStorage(dateStr,weight){
	
	var wmsKey = "weightMeasurements";
	
	if(localStorage.getItem(wmsKey) == null){
		var wm = new Object();
		wm['date'] = 'weight';
		var nwm = JSON.stringify(wm);
		localStorage.setItem(wmsKey, nwm);
	}
	
	var weightMeasurements = JSON.parse(localStorage.getItem(wmsKey));
	weightMeasurements[dateStr] = weight;
	wms = JSON.stringify(weightMeasurements);
	localStorage.setItem(wmsKey,wms);
	
}

function weightMeasurementHtml(weightMeasurements){
	var html= "<table><tr><th>Date</th><th>Weight</th></tr>";
	for (var wm in weightMeasurements) {
		//don't show the json data header
	    if(wm != "date"){
			html += "<tr><td>"+ wm.substring(4,6) + "/" + wm.substring(6) + "/" + wm.substring(0,4) +"</td><td>" + weightMeasurements[wm] + "</td></tr>"
		}
	}
	html += "</table>"	
	return html;
}

function clearData(){
	var d = confirm("Clear stored data?");
    if (d == true) {	   
       localStorage.clear();
	   document.getElementById("startingDate").value = "";
	   document.getElementById("startingWeight").value = "";
	   document.getElementById("goalWeight").value = "";
	   location.reload();
    } 
}


//using jQuery here
$(window).resize(function(){
  drawChart();
});
