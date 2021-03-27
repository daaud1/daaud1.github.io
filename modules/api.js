// Module for requesting data from COVID API

async function requestAPI (filters, structure) {
    var filter_parameter = 'filters=';
    for (let key in filters) {
        if (filters[key]) { // if key has value (error handling by not appending undefined)
                filter_parameter += key +'='+ filters[key] + ';';
        }       
    }
    filter_parameter = filter_parameter.slice(0,filter_parameter.length-1); // Removes last semi colon
    let parameter= filter_parameter + '&structure=' + JSON.stringify(structure); // Concatenation of string
    const response = await fetch("https://api.coronavirus.data.gov.uk/v1/data?" + parameter); // API Request
    
    return response.json(); // Return response, parsed as JSON

}

export {requestAPI} // to give index.js access
