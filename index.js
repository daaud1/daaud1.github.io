// index.js is the main script file of our program. It is the sole file that manipulates our user interface and brings together all our modules

// IMPORT MODULES
import {requestAPI} from "./modules/api.js";
import {barChart} from "./modules/chart.js";

// ELEMENTS

const NATIONS = ["England", "Scotland", "Northern Ireland", "Wales"];
const REGIONS = ["South East", "London", "East of England", "West Midlands", "South West", "Yorkshire and the Humber", "East Midlands", "North East", "North West"];
const UPDATE_BUTTON = document.getElementById("update-location");
const LOCATION_OPTIONS = document.getElementById("location-options");
const VIEW_LOCATION_BUTTON = document.getElementById("location-selector");
const BIG_AREA_LABEL = document.getElementById("current-area-name")
const LAST_UPDATED_LABEL = document.getElementById("last-updated");
const USER_DATE = document.getElementById("user-date");

const NATION_MENU = document.getElementById("area-type-nation")
const REGION_MENU = document.getElementById("area-type-region")
const AREA_TYPE_MENU = document.getElementById("area-type")
const NATION_LABEL = document.getElementById("nation-label");
const REGION_LABEL = document.getElementById("region-label");
const CHART_DATA_LABEL = document.getElementById("current-chart-data");

const DAILY_CASES = document.getElementById("daily-cases");
const TOTAL_CASES = document.getElementById("total-cases");
const DAILY_DEATHS = document.getElementById("daily-deaths");
const TOTAL_DEATHS = document.getElementById("total-deaths");
const DAILY_ADMITS = document.getElementById("daily-admits");
const CURRENT_HOS_CASES = document.getElementById("current-admits");

const CHART_CONTAINER = document.getElementById("chart-container");
const CHART_TIME = document.getElementById("chart-data-range");
const CHART_TYPE = document.getElementById("chart-data-type");
const CHART_SETTINGS_BUTTON = document.getElementById("chart-data-selector");
const CHART_OPTIONS = document.getElementById("chart-options");

// initalise functions

//function to update and hide certain drop down menus depending on options
function toggleOptions(options, button) {
    if (options.style.display ==="block") {
        options.style.display = "none";
        button.style.transform = "rotate(0deg)"
    }
    else {
       options.style.display = "block";
       button.style.transform = "rotate(180deg)"
    }
}

const testData = 
{"cases": {
        "daily":null,
        "total":"500"},
    "deaths": {
        "daily": null,
        "total": "200",
    },
    "hospitalisations": {
        "daily": "200",
        "current": null
    }
}


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

var formatDate = (date) => { return date.toISOString().slice(0,10)}; // convert javastring date object to regular object

// GLOBAL VARIABLES

const TODAY = new Date()
var areaType = "overview"; // current area type of data being viewed
var areaName = null; // current area name of data being viewed
USER_DATE.setAttribute("max", formatDate(TODAY));
USER_DATE.value = formatDate(TODAY) // inital date 


// Event Listeners

UPDATE_BUTTON.addEventListener("click", function () { // EVENT: UPDATE ENTIRE LOCATION SETTINGS
    console.log(USER_DATE.value)
    updateStats(USER_DATE.value);
    drawChart(); // Draw Chart Function
    BIG_AREA_LABEL.innerHTML = (areaType === "overview") ? "United Kingdom" : areaName; // Update Big Label
    UPDATE_BUTTON.style.display = "none"; // Hide Button
});


VIEW_LOCATION_BUTTON.addEventListener("click", function() { // Show or hide location settings
    toggleOptions(LOCATION_OPTIONS, VIEW_LOCATION_BUTTON);
});

CHART_SETTINGS_BUTTON.addEventListener("click", function() {
    toggleOptions(CHART_OPTIONS, CHART_SETTINGS_BUTTON);
})

USER_DATE.addEventListener("change", function() { // if date is changed
    UPDATE_BUTTON.style.display = "inline"; 
})

AREA_TYPE_MENU.addEventListener("change", updateDropDown); 
REGION_MENU.addEventListener("change", updateDropDown);
NATION_MENU.addEventListener("change", updateDropDown);  


CHART_TIME.addEventListener("change", drawChart);
CHART_TYPE.addEventListener("change", () => {
    drawChart();
    CHART_DATA_LABEL.innerHTML = CHART_TYPE.value[0].toUpperCase() + CHART_TYPE.value.slice(1);
})

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


// A function to update the statistics on the page 
function updateStats(date) { 
    let filters = (areaType === "overview") ? {"date":date, "areaType":"overview"} : {"date":date, "areaType":areaType, "areaName":areaName}; // URL Encoding for filter parameter, uses parameter of function 
    
    // URL Encoding for structure for parameter (for labels)
    const STATS_STRUCT = { 
        "cases": {
            "daily":"newCasesByPublishDate",
            "total":"cumCasesByPublishDate"
        },
        "deaths": {
            "daily": "newDeaths28DaysByDeathDate",
            "total": "cumDeathsByDeathDate",
        },
        "hospitalisations": {
            "daily": "newAdmissions",
            "current": "hospitalCases"
        }
    }

    let datareq = requestAPI(filters, STATS_STRUCT) // API Call, returns a promise
    datareq.then(response => { // Callback Function if Promise Fufilled
        let data = testData //response.data["0"]; // JSON of response
        LAST_UPDATED_LABEL.innerHTML = date;
        // If no data available (error handling)
        for (var label in data) {
            for (var stat in data[label]) {
                if (data[label][stat] === null) { // uses the fact that null/empty strings are falsey
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
    .catch(() => { // get yesterday's data
        const YESTERDAY = new Date(TODAY);
        YESTERDAY.setDate(YESTERDAY.getDate() - 1);
        updateStats(formatDate(YESTERDAY));
    });
}

function drawChart () {
    let filters = (areaType === "overview") ? {"areaType":"overview"} : {"areaType":areaType, "areaName":areaName};  // if areatype is united kingdom, = overview, else = RHS
    let value = (CHART_TYPE.value === "cases") ? "newCasesByPublishDate" : "newDeaths28DaysByDeathDate"; //  short hand conditinal statement for structure
    let chartDataReq = requestAPI(filters, {"date":"date","value":value}); // API Call for data graph, returns a promise
    chartDataReq.then(response => { // Callback Function if Promise Fufilled
       barChart(CHART_CONTAINER, response.data, 16, CHART_TIME.value); // draw graph
       //barChart(CHART_CONTAINER, testData, 16, CHART_TIME.value); 
    })
}

// when webpage loads 
updateStats(formatDate(TODAY)); 
drawChart();
