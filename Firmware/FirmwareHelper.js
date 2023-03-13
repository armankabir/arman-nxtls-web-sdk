const SLEEVE = require("./Sleeve.js")
//TODO: Add SURFACE
// const SURFACE = require("./surface.js")

// custom timestamps
const generateTimestamp = function() {
    let date_ob = new Date();

    // generate date
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    // generate time
    let hours = date_ob.getHours().toString().padStart(2, "0");
    let minutes = date_ob.getMinutes().toString().padStart(2, "0");
    let seconds = date_ob.getSeconds().toString().padStart(2, "0");
    // Changed padStart to padEnd
    let milliseconds = date_ob.getMilliseconds().toString().padEnd(4, "0");

    // string format
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + ":" + milliseconds
}

// firmware mapping
const firmware_map = {
    "SLEEVE"  : SLEEVE,
    "KNEE"    : SLEEVE,
    // "SURFACE" : SURFACE
}

// export module
module.exports = {
    generateTimestamp,
	firmware_map,
}


// firmware_char.read((err, data) => {
//     if (err) {
//         return null
//     }
//     data = data.toString('utf8') // decode
//     data = data.replace(/\uFFFD/g, '') // remove invalid codes
//     FIRMWARE_LEVEL = data


// })    

// // get index
// const field = [
//     "gyro_X",
//     "gyro_Y",
//     "gyro_Z",
//     "accel_X",
//     "accel_Y",
//     "accel_Z",
//     "magneto_X",
//     "magneto_Y",
//     "magneto_Z",
//     "humdity",
//     "temperature",
//     "altitude",
//     "adc_0",
//     "adc_1",
//     "adc_2",
//     "adc_3",
//     "adc_4",
//     "adc_5",
// ]

// // bit operations to pack data
// for (i=0; i < data.length / 2; i++) {
//     var lowbit = 0xffff & data[i*2]
//     var highbit = 0xffff & (data[i*2+1] << 8)
//     var value = lowbit | highbit

//     // SPECIAL CASE FOR ADAFRUIT DATA WHICH SPLITS PACKETS LONGER THAN 20
//     // if (data.length < 20) {
//     //     var index = i + 10
//     // } else {
//     //     var index = i
//     // }
//     console.log(field[i] + ": " + value)
// }