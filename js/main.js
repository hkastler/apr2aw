google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(drawChart);

//const
var DAY_MILLISECONDS = 86400000;

//global
var today = new Date().setHours(0,0,0,0);
today = new Date(today);

var isChrome = window.chrome;

function drawChart() {
	//console.log = function() {}

	//some objs used over
	var startingWeightObj = document.getElementById("startingWeight");
	var startingDateObj = document.getElementById("startingDate");
	var dayRangeStartDateObj = document.getElementById("dayRangeStartDate");
	var dayRangeEndDateObj = document.getElementById("dayRangeEndDate");	
	
	var startingWeight = parseInt(startingWeightObj.value);
	var goalWeight = parseInt(document.getElementById("goalWeight").value);
	var weightDiff = startingWeight - goalWeight;
	
	var weightLossPerWeekAry = getCheckedCheckboxesFor("weightLossPerWeek");
	//console.log("weightLossPerWeekAry:" + weightLossPerWeekAry);
	var weightLossPerWeek = parseInt(document.querySelector('input[name="weightLossPerWeek"]:checked').value);
	
	var numberOfWeeks = weightDiff / weightLossPerWeek	
	var numberOfDays = numberOfWeeks * 7	
	
	var startingDate = startingDateObj.value;
	startingDate += " 00:00:00"
	
	var strtDt = new Date(startingDate);	
	if(strtDt == 'Invalid Date'){		
		strtDt = new Date();
		startingDateObj.value =  formatDate(strtDt,"/");
	}
	
	var dayOfProgram = dateDiffInDays(strtDt,today);
	
	//console.log("currentDayOfProgram: "+ dayOfProgram);
	
	if(dayRangeStartDateObj.value == ""){
		dayRangeStartDateObj.value = startingDateObj.value;
	}
	
	var dayRangeStartDateStr =  dayRangeStartDateObj.value + " 00:00:00";
	var rangeStartDate = new Date(dayRangeStartDateStr);
	//console.log("rangeStartDate:" + rangeStartDate);
	var dayRangeStart = dateDiffInDays(rangeStartDate,strtDt);
	if(isNaN(dayRangeStart)){
		dayRangeStart = 0;		
	}
	
	var dayRangeEndDateStr =  dayRangeEndDateObj.value + " 00:00:00";
	var rangeEndDate = new Date(dayRangeEndDateStr);
	var dayRangeEnd = dateDiffInDays(rangeEndDate,strtDt);
	//console.log("dayRangeEnd: "+ dayRangeEnd);
	if(isNaN(dayRangeEnd)){
		dayRangeEnd = numberOfDays;
	}
	
	var weightMeasurements = new Object();
	
	if(localStorage.getItem("weightMeasurements") != null){
		weightMeasurements = getWeightMeasurements();	
	}
	
	var data = new google.visualization.DataTable();
	data.addColumn('date','Date');
	//set up the columns that will contain the target weights
	for( i=0; i < weightLossPerWeekAry.length; i++){
		//console.log(weightLossPerWeekAry[i]);
		var weightLossPerWeek = weightLossPerWeekAry[i];
		data.addColumn('number', 'Target Weight @' + weightLossPerWeek + "lb per week");
		data.addColumn({'type': 'string', 'role': 'style'});
	}
	data.addColumn('number', 'Recorded Weight');
	data.addColumn({'type': 'string', 'role': 'style'});
		
	var options = {};
	var ticks = [];
	var recordedWeight = null;
	var pointStyle = null;
	var annotation1 = "";
	
	var chartTime = strtDt.setTime(strtDt.getTime() + ( DAY_MILLISECONDS * dayRangeStart) ) ;
	var chartDate = new Date(chartTime);
	
	var targetWeight = [];
	
	for(h=0; h< weightLossPerWeekAry.length; h++){
		var weightLossPerWeek = weightLossPerWeekAry[h];
		var weightLossMultiple = (weightLossPerWeek/7);
	    targetWeight[weightLossPerWeek] = startingWeight -  ( weightLossMultiple * dayRangeStart );
	}	
		
		
	for (i=dayRangeStart; i <= dayRangeEnd; i++){
				
		var dateToPlot = new Date(chartDate.getFullYear(), chartDate.getMonth(), chartDate.getDate(), 0, 0, 0, 0);
		var dateForKey = formatDateIsoDate(dateToPlot);
				
		if(dateToPlot > today){
			//no need to get recordedWeight for future
			pointStyle = null;
			recordedWeight = null;
		}else{
												
			recordedWeight = parseFloat(weightMeasurements[dateForKey]);
			if(isNaN(recordedWeight)){
				recordedWeight = null;
			}
			
			var dateToPlotComp = new Date(dateToPlot);
			
			if(dateToPlotComp.getTime() == today.getTime()){				
				pointStyle =  "point { size: 12; shape-type: star; }";
				annotation1 = "Today";				
			}else{				
				pointStyle = null;
				annotation1 = null;				
			}
			
		}
				
		var row = data.addRow();
		data.setCell(row, 0, dateToPlot);
		
		var col = 0;
		for(h=0; h< weightLossPerWeekAry.length; h++){
			var weightLossPerWeek = weightLossPerWeekAry[h];
			targetWeight[weightLossPerWeek] = (targetWeight[weightLossPerWeek] - (weightLossPerWeek/7));
			col = col+1;
			
			if(targetWeight[weightLossPerWeek] >= goalWeight){
				data.setCell(row, col, parseFloat(targetWeight[weightLossPerWeek]));	
			}else{
				data.setCell(row, col, null);	
			}		
			col = col + 1;
			data.setCell(row, col, pointStyle);

		}
		col = col+1;
		data.setCell(row, col, recordedWeight);
		data.setCell(row, col+1, pointStyle);
		
		ticks.push(dateToPlot);
		chartDate.setTime(chartDate.getTime() + DAY_MILLISECONDS );
		
	}	
	var colors = ["blue","orange","red"];
	
	if(weightLossPerWeekAry.length > 1){		
		colors = ["blue","red","orange"];
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
		lineWidth: 2,
        pointSize: 3,
		series: {
		//tried to build this as json, didn't quite work
        "0": {
          color: colors[0]
        },
        "1": {
          color:colors[1]
        },
		"2": {
          color:colors[2]
        }
      }    
	};
	
	
	var chart = new google.visualization.LineChart(document.getElementById('apr2awChart'));
		
	if(dayRangeEndDateObj.value == ""){
		var startDate = new Date(dayRangeStartDateObj.value);
		var endTime = startDate.setTime(startDate.getTime() + ( DAY_MILLISECONDS * numberOfDays) ) ;
		var endDate = new Date(endTime);
		setDateFieldValue("dayRangeEndDate",endDate);
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


function selectHandler() {
		var selectedItem = chart.getSelection()[0];
		//console.log(selectedItem);
		if (selectedItem) {
			//console.log(data);
		  var value = data.getValue(selectedItem.row, 7);
			//console.log('The user selected ' + value);
		}
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
	localStorage.setItem("weightLossPerWeek", getCheckedCheckboxesFor("weightLossPerWeek"));
	//localStorage.setItem("timeUnit", document.querySelector('input[name="timeUnit"]').value);
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
		if (localStorage.weightLossPerWeek.indexOf(weightLossPerWeekRdo[i].value ) > -1 ){
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
	document.getElementById('twoWeekView').addEventListener('click',  function(){daySpread(7);}, true);
	document.getElementById('clearData').addEventListener('click', clearData ,false);
	document.getElementById('exportData').addEventListener('click', exportData, false);
	
	document.getElementById('startingDate').addEventListener('input', drawChart, true);
	document.getElementById('startingWeight').addEventListener('input', drawChart, true);
	document.getElementById('goalWeight').addEventListener('input', drawChart, true);
	
	document.getElementById('dayRangeStartDate').addEventListener('input', function(){getRangeChart();}, true);
	document.getElementById('dayRangeEndDate').addEventListener('input', function(){getRangeChart();}, true);
	
	//default value for weightMeasurement date
	var today =  new Date();
	setDateFieldValue("weighDate",today);
		
 
}, false);//end of DOMContentLoaded


//from somewhere on stackoverflow
function getCheckedCheckboxesFor(checkboxName) {
    var checkboxes = document.querySelectorAll('input[name="' + checkboxName + '"]:checked')
	var values = [];
    Array.prototype.forEach.call(checkboxes, function(el) {
        values.push(el.value);
    });
	//console.log(values);
    return values;
}


function formatDate(date,delimiter){
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	var theDate = month + delimiter + day + delimiter + year;       
	return theDate;
	
}

function resetRange(){
	document.getElementById("dayRangeStartDate").value = "";
	document.getElementById("dayRangeEndDate").value = "";
	localStorage.removeItem("dayRangeEndDate");
	drawChart();
}

function weekSpreadRange(numberOfWeeks){
	var numberOfDays = numberOfWeeks * 7;
	daySpread(numberOfDays);
}

function daySpread(numberOfDays){
	
	todayS = new Date(today);
	var todayE = new Date(today);
	
	var startDate = todayS.setTime(today.getTime() - ( DAY_MILLISECONDS * numberOfDays) ) ;
	setDateFieldValue("dayRangeStartDate",startDate);
	var endDate = todayE.setTime(today.getTime() + ( DAY_MILLISECONDS * numberOfDays) ) ;
	console.log("daySpread endDate:" + endDate);
	setDateFieldValue("dayRangeEndDate", endDate);	
	drawChart();
}

function setDateFieldValue(elementId, date){
	var elementObj = document.getElementById(elementId);
	date = new Date(date);
	//console.log("formatDateFieldValues " + date);
	
	if(isChrome){
		elementObj.valueAsDate = date;
	}else{
		elementObj.value = formatDate(date,"/");
	}
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

function exportData(){
	try{
		var htmlData = document.getElementById('weightMeasurementsInfo').innerHTML;
		document.getElementById("downloadLink").href = "data:text/html;charset=utf-8," + escape(htmlData);
		document.getElementById("downloadLink").download = "apr2aw.xls";
		document.getElementById("downloadLink").click();
	}catch(err){
		var apr2awData =  window.open("/export.html","","",false);
		apr2awData.document.body.innerHTML = htmlData;
	}
	
}

//using jQuery here
$(window).resize(function(){
  drawChart();
});
