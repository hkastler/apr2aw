
var wmsKey = "weightMeasurements";


function addWeightMeasurementLS() {	

    var weighDate = document.querySelector("#weighDate").value;
	
	weighDate += " 00:00:00"
	//console.log("weighDateLS:" + weighDate);
	//weighDate = weighDate.replace(/-/g,"");
	//constructing the date like this works across browsers
	//vs accepting the date string from any browser
	weighDate = new Date(weighDate);
	
	var weightDateFmtLS = formatDateIsoDate(weighDate);
	//console.log("weightDateFmtLS:" + weightDateFmtLS);
    var theWeight = document.querySelector("#weightMeasurement").value;
	
	weightMeasurementStorage(weightDateFmtLS,theWeight);
	drawChart();
	return;    
}

function weightMeasurementStorage(dateStr,weight){
	
	if(localStorage.getItem(wmsKey) == null){
		var wm = new Object();
		wm[dateStr] = parseFloat(weight);
		var nwm = JSON.stringify(wm);
		localStorage.setItem(wmsKey, nwm);
		return;
	}
	
	var weightMeasurements = getWeightMeasurements();
	weightMeasurements[dateStr] = parseFloat(weight);
	wms = JSON.stringify(weightMeasurements);
	localStorage.setItem(wmsKey,wms);
	return;
}


function getWeightMeasurements(){
	var weightMeasurements = JSON.parse(localStorage.getItem(wmsKey));
	return weightMeasurements;
}

function weightMeasurementHtml(weightMeasurements){
	var html= "<table><thead ><tr><th>Date</th><th>Weight</th></tr></thead>";
	for (var wm in weightMeasurements) {
		//don't show the json data header
	    if(wm.indexOf("date") == -1){
			var dateParts = wm.split("-");
			html += "<tr><td>"+ dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0] +"</td><td>" + weightMeasurements[wm] + "</td></tr>"
		}
	}
	html += "</table>"	
	return html;
}

function formatDateIsoDate(date){
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();

	if (month < 10) month = "0" + month;
	if (day < 10) day = "0" + day;

	var theDate = year +"-"+ month +"-"+ day;       
	return theDate;
	
}