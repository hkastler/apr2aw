
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
		wm['date'] = 'weight';
		var nwm = JSON.stringify(wm);
		localStorage.setItem(wmsKey, nwm);
	}
	
	var weightMeasurements = getWeightMeasurements();
	weightMeasurements[dateStr] = weight;
	wms = JSON.stringify(weightMeasurements);
	localStorage.setItem(wmsKey,wms);
	
}

//function getWeightMeasurements(){
//	var weightMeasurements = JSON.parse(localStorage.getItem(wmsKey));
//	return weightMeasurements;
//}


function getWeightMeasurements(){
	var weightMeasurements = JSON.parse(localStorage.getItem(wmsKey));
	
	/*
	var newFormatWeightMeasurements = new Object();
	
	for (var wm in weightMeasurements){
		console.log("wm:" + wm);
		
		if(wm.indexOf("-") == -1){
			var newFormatWmKey = wm.substring(0,4) + "-" + wm.substring(4,6) + "-" + wm.substring(6);
			console.log("newFormatWm: " + newFormatWmKey);
			newFormatWeightMeasurements[newFormatWmKey] = parseFloat(weightMeasurements[wm]);
		}
	}
	console.log("newWms" + newFormatWeightMeasurements);
	
	var wmsStr = JSON.stringify(newFormatWeightMeasurements);
	console.log("wmsStr: " + wmsStr);
	
	//localStorage.setItem(wmsKey, wmsStr);
	
	localStorage.setItem("wmsBak", localStorage.getItem(wmsKey));
	*/
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