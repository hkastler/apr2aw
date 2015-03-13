//indexedDB
//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 
//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
 
if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.");
}
var dbName = "apr2aw";
var dbVersion = 1;

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

function genReadFromIndex (key) {
	yield;
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
			return request.result.weight ;			
	  } else {
			console.log("key:" + key + " not found"); 
			return null;
	  }
	};
		
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