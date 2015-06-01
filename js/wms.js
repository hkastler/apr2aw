
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
	//this will clean up old data
	//Object.keys(weightMeasurements).forEach(function (d){ if (d.indexOf("date")!= -1){ delete weightMeasurements[d]; console.log("deleting " + d);}});
	return weightMeasurements;
}

function weightMeasurementHtml(weightMeasurements){
	var html= "<table class='table table-striped'><thead ><tr id='header-row' ><th>Date</th><th>Weight</th></tr></thead><tbody id='weightMeasurementsInfoTbody'>";			
	Object.keys(weightMeasurements)
		.sort(function (a, b) {
				var dateA = new Date(a);
				var dateB = new Date(b);
				if (dateA > dateB ) return -1;
				if (dateA < dateB ) return 1;
				return 0;
      }).forEach(function (wm) {
						var dateParts = wm.split("-");
						html += "<tr class=\"wmtr\" onclick=\" fillWMForm('" + wm + "'," + weightMeasurements[wm] + ")\"><td>"+ dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0] +"</td><td>" + weightMeasurements[wm] + "</td></tr>"
					});
	html += "</tbody></table>"	
	return html;
}

function fillWMForm(dateStr,weight){
	
	dateStr += "T00:00:00";
	//console.log(dateStr);
	setDateFieldValue('weighDate',dateStr);
	document.getElementById('weightMeasurement').value = weight;
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