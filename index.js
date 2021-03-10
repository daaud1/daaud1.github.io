// IMPORT MODULES
import {requestAPI} from "./modules/api.js";
import {barChart} from "./modules/chart.js";


// Location Selecttion

const NATIONS = ["England", "Scotland", "Northern Ireland", "Wales"];
const REGIONS = ["South East", "London", "East of England", "West Midlands", "South West", "Yorkshire and the Humber", "East Midlands", "North East", "North West"];
const UPDATE_BUTTON = document.getElementById("update-location");
const LOCATION_OPTIONS = document.getElementById("location-options");
const VIEW_LOCATION_BUTTON = document.getElementById("location-selector");
const TODAY = new Date().toISOString().slice(0, 10)
const BIG_AREA_LABEL = document.getElementById("current-area-name")
var areaType = "overview"; // current area type of data being viewed
var areaName = null; // current area name of data being viewed

// adding  event listeners to button
UPDATE_BUTTON.addEventListener("click", function () { // EVENT: UPDATE ENTIRE LOCATION SETTINGS
    updateStats(TODAY);
    drawChart(); // Draw Chart Function
    BIG_AREA_LABEL.innerHTML = (areaType === "overview") ? "United Kingdom" : areaName; // Update Big Label
    UPDATE_BUTTON.style.display = "none"; // Hide Button
});

// Show or hide location settings
VIEW_LOCATION_BUTTON.addEventListener("click", function() { 
    if (LOCATION_OPTIONS.style.display ==="block") {
        LOCATION_OPTIONS.style.display = "none";
        VIEW_LOCATION_BUTTON.style.transform = "rotate(0deg)"
    }
    else {
       LOCATION_OPTIONS.style.display = "block";
       VIEW_LOCATION_BUTTON.style.transform = "rotate(180deg)"
    }
});


// initalises stats labels 
const DAILY_CASES = document.getElementById("daily-cases");
const TOTAL_CASES = document.getElementById("total-cases")
const DAILY_DEATHS = document.getElementById("daily-deaths");
const TOTAL_DEATHS = document.getElementById("total-deaths");
const DAILY_ADMITS = document.getElementById("daily-admits");
const CURRENT_HOS_CASES = document.getElementById("current-admits");

const STATS_STRUCT = { // URL Encoding for structure for parameter (for labels)
    "cases": {
        "daily":"newCasesByPublishDate",
        "total":"cumCasesByPublishDate"
    },
    "deaths": {
        "daily": "newDeathsByDeathDate",
        "total": "cumDeathsByDeathDate",
    },
    "hospitalisations": {
        "daily": "newAdmissions",
        "current": "hospitalCases"
    }
}

// initalises Menus

const NATION_MENU = document.getElementById("area-type-nation")
const REGION_MENU = document.getElementById("area-type-region")
const AREA_TYPE_MENU = document.getElementById("area-type")
const NATION_LABEL = document.getElementById("nation-label");
const REGION_LABEL = document.getElementById("region-label");
const CHART_DATA_LABEL = document.getElementById("current-chart-data");

for (let nation in NATIONS) {
    let option = document.createElement("option")
    option.innerHTML = NATIONS[nation];
    option.value = NATIONS[nation];
    NATION_MENU.appendChild(option);
}

for (let region in REGIONS) {
    let option = document.createElement("option")
    option.innerHTML = REGIONS[region];
    option.value = REGIONS[region];
    REGION_MENU.appendChild(option);
}


//  adding event listeners to drop down menu for location

AREA_TYPE_MENU.addEventListener("change", updateDropDown); 
REGION_MENU.addEventListener("change", updateDropDown);
NATION_MENU.addEventListener("change", updateDropDown);  


//function to update and hide certain drop down menus depending on options
function updateDropDown() {
    UPDATE_BUTTON.style.display = "inline";
    if (AREA_TYPE_MENU.value == "overview") {
        REGION_MENU.style.display = NATION_MENU.style.display=REGION_LABEL.style.display=NATION_LABEL.style.display="none"; // hides all    
        areaType = "overview";
    }
    else if (AREA_TYPE_MENU.value =="nation") {
        REGION_MENU.style.display = REGION_LABEL.style.display="none"; // hide element
        NATION_MENU.style.display = NATION_LABEL.style.display ="inline"; // show element
        areaType = "nation";
        areaName = NATION_MENU.value;
    }
    else if (AREA_TYPE_MENU.value == "region") {
        REGION_MENU.style.display=REGION_LABEL.style.display="inline"; // show element
        NATION_MENU.style.display=NATION_LABEL.style.display="none"; // hide element
        areaType = "region";
        areaName = REGION_MENU.value;
    }
}


// Chart and Data Selection

const CHART_CONTAINER = document.getElementById("chart-container");
const CHART_TIME = document.getElementById("chart-data-range");
const CHART_TYPE = document.getElementById("chart-data-type");
const CHART_SETTINGS_BUTTON = document.getElementById("chart-data-selector");
const CHART_OPTIONS = document.getElementById("chart-options");

// adding  event listeners to buttons

CHART_SETTINGS_BUTTON.addEventListener("click", function() {
    if (CHART_OPTIONS.style.display ==="block") {
        CHART_OPTIONS.style.display = "none";
        CHART_SETTINGS_BUTTON.style.transform = "rotate(0deg)"
    }
    else {
       CHART_OPTIONS.style.display = "block";
       CHART_SETTINGS_BUTTON.style.transform = "rotate(180deg)"
    }
})


//  adding event listeners to drop down menu for chart settings

CHART_TIME.addEventListener("change", drawChart);

CHART_TYPE.addEventListener("change", () => {
    drawChart();
    CHART_DATA_LABEL.innerHTML = CHART_TYPE.value[0].toUpperCase() + CHART_TYPE.value.slice(1);
})

// A function to update the statistics on the page 
function updateStats(date) { 
    let filters = (areaType === "overview") ? {"date":date, "areaType":"overview"} : {"date":date, "areaType":areaType, "areaName":areaName}; // URL Encoding for filter parameter, uses parameter of function 
    let datareq = requestAPI(filters, STATS_STRUCT) // API Call, returns a promise
    datareq.then(response => { // Callback Function if Promise Fufilled
        let data = response.data["0"]; // JSON of response

        // If no data available (error handling)
        for (var label in data) {
            for (var stat in data[label]) {
                if (data[label][stat] == null || data[label][stat] == "") {
                    data[label][stat] = "No Data Available"; // Replaces empty string
                }
            }
        }
        // Updates Labels
        DAILY_CASES.innerHTML = data["cases"]["daily"]; 
        TOTAL_CASES.innerHTML = data["cases"]["total"];
        DAILY_DEATHS.innerHTML = data["deaths"]["daily"];
        TOTAL_DEATHS.innerHTML = data["deaths"]["total"];
        DAILY_ADMITS.innerHTML = data["hospitalisations"]["daily"];
        CURRENT_HOS_CASES.innerHTML = data["hospitalisations"]["current"];
    })
    
}

function drawChart () {
    let filters = (areaType === "overview") ? {"areaType":"overview"} : {"areaType":areaType, "areaName":areaName};  // if areatype is united kingdom, = overview, else = RHS
    let value = (CHART_TYPE.value === "cases") ? "newCasesByPublishDate" : "newDeaths28DaysByDeathDate"; //  short hand conditinal statement for structure
    let chartDataReq = requestAPI(filters, {"date":"date","value":value}); // API Call for data graph, returns a promise
    chartDataReq.then(response => { // Callback Function if Promise Fufilled
        barChart(CHART_CONTAINER, response.data, 16, CHART_TIME.value); // draw graph
    })
}

updateStats("2021-02-08"); // fires on webpage load
drawChart();
