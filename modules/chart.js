// Module for drawing interactive graph for application

// WE EXPECT DATA GIVEN TO BE IN ORDER OF MOST RECENT

function roundUp(num) {
    let sigNum = Number(num.toPrecision(1)) // cast string to number
    let firstDigit = Number ((sigNum).toString()[0]);
    if (num < 10) {
        return 12
    }
    else {
        let rounded = (sigNum >= num) ? sigNum : (sigNum + (sigNum / firstDigit))
        return (rounded % 4 == 0) ? rounded : (rounded + 10);
    }
}

function formatDate(date, long) { // date expected as "YYYY-MM-DD"
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let newDate = new Date(date);
    let month = months[newDate.getMonth()]
    let year = newDate.getFullYear()
    let day = newDate.getDate();
    if (long == false) {
        return `${day} ${month}`
    }
    else {
        return `${month} ${year}`
    }
}


function drawLine(x1, x2, y1, y2, container) {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('x2', x2);
    line.setAttribute('y1', y1);
    line.setAttribute('y2', y2);
    line.setAttribute('strokeWidth', '2.6')
    line.setAttribute('stroke', '#cecece');
    container.appendChild(line);
    return line;
}

function drawRectangle(height, width, x, y, container) {
    let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    rect.setAttributeNS(null, 'height', height)
    rect.setAttributeNS(null, 'width', width)
    rect.setAttributeNS(null, 'x', x)
    rect.setAttributeNS(null, 'y', y)
    container.appendChild(rect);
    return rect
}

function drawText(x, y, contents, fill, container) {
    let text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttributeNS(null, 'x', x)
    text.setAttributeNS(null, 'y', y);
    text.innerHTML = contents;
    text.setAttributeNS(null, 'fill', fill);
    container.appendChild(text);
    return text;
}

function barChart(container, data, labelFontSize, time) {
    //Phase 0: Clear chart container if not empty
    // empty chart 
    while (container.lastElementChild) {
        container.removeChild(container.lastElementChild);
    }

    // Phase 1: Parse Data using User Settings
    // getting rid of data earlier than 2020-02-01 (YYYY-MM-DD)
    var parsedData= []
    switch (Number (time)) {
        case 0:
            for (let point in data) {
                if ((data[point]["date"] == "2020-02-29") || (data[point]["date"] =="2020-02-28")) {
                    break
                }
                else {
                    parsedData.push(data[point]);
                }
            }
            break;
        case 1:
            for (let i=0; i<7; i++) {
                parsedData.push(data[i]);
            }
            break;
    }

    // Initalise Constants
    const SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const WIDTH = container.offsetWidth;
    const HEIGHT = window.innerHeight*0.5;
    SVG.setAttribute('height', `${HEIGHT}px`);
    SVG.setAttribute('width', `${WIDTH}px`);
    SVG.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    container.appendChild(SVG); // add SVG element into container

    const MAX_Y = Math.max.apply(Math, parsedData.map(function(datapoint) { return datapoint["value"]; })); // find maximum y value of chart, assuming data in the form [{x1:y1},{x2:y2}..]
    const MIN_Y = Math.min.apply(Math, parsedData.map(function(datapoint) { return datapoint["value"]; })); // find maximum y value of chart, assuming data in the form [{x1:y1},{x2:y2}..]
    const PADDING = (MAX_Y.toString().length + 1 )*labelFontSize; // Space around chart
    const ROUNDED = roundUp(MAX_Y)
    const CHART_WIDTH = WIDTH - (2*PADDING); // calculates room left for actual chart
    const CHART_HEIGHT = HEIGHT - (2*PADDING);
    const BAR_WIDTH = CHART_WIDTH / parsedData.length; 
    const UNIT = CHART_HEIGHT / ROUNDED;

    if (ROUNDED >= MAX_Y) {
        console.log("test passed");
    }

    // Phase 3: Draw Axes and Guides
    // Draw Horizontal Guides and Y Labels
    let labels = document.createElementNS('http://www.w3.org/2000/svg', 'g'); // creates semantic SVG 'group' element
    labels.classList.add('chart-guide'); // for styling purposes, see CSS
    let increment = ROUNDED / 4;
        for (let i=0; i<5; i++) { // 4 Guides
            let ratio = i/4
            let yGuide = CHART_HEIGHT-(CHART_HEIGHT*ratio)+PADDING;
            drawLine(PADDING, WIDTH - PADDING, yGuide, yGuide, SVG);
        
            let ylabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            ylabel.setAttribute('x', labelFontSize);
            ylabel.setAttribute('y', yGuide+labelFontSize/4);
            ylabel.innerHTML = (i*increment); 
            labels.appendChild(ylabel);
        }
    SVG.appendChild(labels);

    // Phase 4: Draw Bars
    // for-loop: draws bars and x axis
    let bars = document.createElementNS('http://www.w3.org/2000/svg', 'g'); // creates semantic SVG 'group' element
    bars.classList.add('bars'); // for styling purposes, see CSS

    // x-axis labels label
    let latestDate = new Date(parsedData[0]["date"])
    let beginningDate = new Date(parsedData[parsedData.length - 1]["date"]);
    let monthsBetween = latestDate.getMonth() - beginningDate.getMonth() + (12 * (latestDate.getFullYear() - beginningDate.getFullYear()));
    let labelIncrement = Math.floor(monthsBetween/6); // how many months should label repeat
    let monthCounter = monthsBetween%labelIncrement; 

    for (let coord in parsedData) {
        let barHeight = parsedData[coord]["value"] * UNIT;
        let barStartY= (CHART_HEIGHT + PADDING) - barHeight;
        let barStartX = WIDTH-PADDING-(BAR_WIDTH*((Number (coord) + 1)));
        drawRectangle(barHeight, BAR_WIDTH, barStartX, barStartY, bars);
       
        let date = parsedData[coord]["date"];

        if (time ==="0") {
            if (date.substring(8,10) == "01") {
                if (monthCounter == labelIncrement) { 
                    monthCounter = 0; 
                    drawText(barStartX-40, CHART_HEIGHT+PADDING+30, formatDate(date, true),'#cecece', labels);
                }
                monthCounter +=1 // this looks like it'll cause issues
            }
        }
        else { // if 7 days data drawn
            drawText(barStartX+(BAR_WIDTH/3), CHART_HEIGHT+PADDING+30, formatDate(date, false),'#cecece', labels)
        }
        
    }
    SVG.appendChild(bars);

    //Phase lost count: Draw cover and chart indicator
    const COVER = drawRectangle(CHART_HEIGHT+PADDING, CHART_WIDTH, PADDING, 0, SVG);
    COVER.setAttributeNS(null, 'id', 'chart-psuedo-bg')
    let chartDimensions = SVG.getBoundingClientRect();


    let chartIndicationGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    chartIndicationGroup.setAttributeNS(null, 'id', 'chart-indication')
    SVG.appendChild(chartIndicationGroup);

    COVER.addEventListener('mouseleave', function() {
        chartIndicationGroup.style.display = 'none';
    })

    COVER.addEventListener('mousemove', function(cursor) { // mouse over 
        chartIndicationGroup.style.display = 'block';

        while (chartIndicationGroup.lastElementChild) { // remove on mouse move
            chartIndicationGroup.lastElementChild.remove();
        }

        let x = cursor.clientX - chartDimensions.left; // get relative position of users mouse

        let line = drawLine(x, x, CHART_HEIGHT+PADDING, PADDING, chartIndicationGroup, chartIndicationGroup)
        line.setAttributeNS(null, 'id', 'dataIndicator')

        let barPos = CHART_WIDTH+PADDING -x;
        let bar = parsedData[Math.ceil(barPos / BAR_WIDTH)-1];

        
        let chartTip = drawRectangle(75, 200, x, PADDING, chartIndicationGroup)
        chartTip.setAttributeNS(null, 'id', 'chart-tip');

        let dateLabel = drawText(x+20, PADDING+20, "Date: " + formatDate(bar["date"], false), '#cecece', chartIndicationGroup);
        let valueLabel = drawText(x+20, PADDING+50, "Value: " +bar["value"], '#cecece', chartIndicationGroup);

        if (time === "1") {
            chartTip.setAttributeNS(null, 'y', MIN_Y*UNIT )
            dateLabel.setAttributeNS(null, 'y', MIN_Y*UNIT + 20)
            valueLabel.setAttributeNS(null, 'y', MIN_Y*UNIT + 50) //this is gonna cause a problem if MIN_Y = 0 :(
        }

        // ensures rectangle never drawn outside of chart
        if (x +200 >= (PADDING+ CHART_WIDTH)) {
            chartTip.setAttributeNS(null, 'x', x-200);
            dateLabel.setAttributeNS(null, 'x', x-180)
            valueLabel.setAttributeNS(null, 'x', x-180)
        }
    })

    
} 


export {barChart} // to give index.js access
