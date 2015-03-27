
var wmsKey = "weightMeasurements";

function getWeightMeasurements(){
	var weightMeasurements = JSON.parse(localStorage.getItem(wmsKey));
	return weightMeasurements;
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
	
	if(localStorage.getItem(wmsKey) == null){
		var wm = new Object();
		wm['date'] = 'weight';
		var nwm = JSON.stringify(wm);
		localStorage.setItem(wmsKey, nwm);
	}
	
	var weightMeasurements = getWeightMeasurements();
	weightMeasurements[dateStr] = weight;
	wms = JSON.stringify(weightMeasurements);
	localStorage.setItem(wmsKey,wms);
	
}

function getWeightMeasurements(){
	var weightMeasurements = JSON.parse(localStorage.getItem(wmsKey));
	return weightMeasurements;
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