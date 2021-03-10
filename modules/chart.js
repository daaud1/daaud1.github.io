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
                if (data[point]["date"] == "2020-03-01") {
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

    // Phase 2: Initalise Constants
    const SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const WIDTH = container.offsetWidth;
    const HEIGHT = window.innerHeight*0.5;
    SVG.setAttribute('height', `${HEIGHT}px`);
    SVG.setAttribute('width', `${WIDTH}px`);
    SVG.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    container.appendChild(SVG); // add SVG element into container

    const MAX_Y = Math.max.apply(Math, parsedData.map(function(datapoint) { return datapoint["value"]; })); // find maximum y value of chart, assuming data in the form [{x1:y1},{x2:y2}..]
    const PADDING = (MAX_Y.toString().length + 1 )*labelFontSize; // Space around chart
    const ROUNDED = roundUp(MAX_Y)
    const CHART_WIDTH = WIDTH - (2*PADDING); // calculates room left for actual chart
    const CHART_HEIGHT = HEIGHT - (2*PADDING);
    const BAR_WIDTH = CHART_WIDTH / parsedData.length; 
    const UNIT = CHART_HEIGHT / ROUNDED;

    // Phase 3: Draw Axes and Guides
    // Draw Horizontal Guides and Labels
    let labels = document.createElementNS('http://www.w3.org/2000/svg', 'g'); // creates semantic SVG 'group' element
    labels.classList.add('chart-guide'); // for styling purposes, see CSS
    let increment = ROUNDED / 4;
    for (let i=0; i<5; i++) { // 4 Guides
        let ratio = i/4
        let horizontalGuide = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        let yGuide = CHART_HEIGHT-(CHART_HEIGHT*ratio)+PADDING;
        horizontalGuide.setAttribute('x1', `${PADDING}px`);
        horizontalGuide.setAttribute('x2', `${WIDTH-PADDING}px`);
        horizontalGuide.setAttribute('y1', `${yGuide}px`);
        horizontalGuide.setAttribute('y2', `${yGuide}px`);
        horizontalGuide.setAttribute('stroke', '#cecece');
        horizontalGuide.setAttribute('strokeWidth', '2')
        SVG.appendChild(horizontalGuide);
        let ylabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ylabel.setAttribute('x', labelFontSize);
        ylabel.setAttribute('y', yGuide+labelFontSize/4);
        ylabel.innerHTML = (i*increment); // arithmetic series ?!?!?!?
        labels.appendChild(ylabel);
    }

    SVG.appendChild(labels);

    // Phase 4: Draw Bars
    // for-loop: draws bars
    for (let coord in parsedData) {
        let bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        let barHeight = parsedData[coord]["value"] * UNIT;
        bar.setAttribute('y', (CHART_HEIGHT + PADDING) - barHeight); // where chart starts from, inverted, as svg coordinates start at top left
        bar.setAttribute('x', WIDTH-PADDING-(BAR_WIDTH*((Number (coord) + 1))));
        bar.setAttribute('width', `${BAR_WIDTH}px`);
        bar.setAttribute('height', `${barHeight}px`)
        bar.setAttribute('value', parsedData[coord]["value"]);  
        bar.setAttribute('date', parsedData[coord]["date"]);
        SVG.appendChild(bar);

        bar.addEventListener("click", function() {
            alert("Date: "+  bar.getAttribute("date") + "\nValue: " + bar.getAttribute("value"));
        });
    }
} 

export {barChart} // to give index.js access
