const SLEEVE = {
    //-------------------------------------------
    // firmware version 0.0.0 - Gen 1.0
    //-------------------------------------------
    "0.0.0" : function() {
        console.log("0.0.0")
    },

    //-------------------------------------------
    // firmware version 0.0.0 - Gen 1.5
    //-------------------------------------------
    "0.0.1" : {
        type : [
            ["acceleration", "acceleration", "acceleration"],
            ["gyration", "gyration", "gyration"],
            ["magnet", "magnet", "magnet"],
            ["adc"],
            ["environment", "environment", "environment"]
        ],

        field : [
            ["ax", "ay", "az"],
            ["gx", "gy", "gz"],
            ["mx", "my", "mz"],
            ["a0"],
            ["temp", "hum", "baro"]
        ],

        measurement : [
            ["IMU", "IMU", "IMU"],
            ["IMU", "IMU", "IMU"],
            ["IMU", "IMU", "IMU"],
            ["sensor"],
            ["environment", "environment", "environment"]
        ],
        
        functions : [
            // acceleration
            function(d) { 
                d = d.toString('utf8') // decode
                d = d.replace(/\uFFFD/g, '')
                d = d.split(",")
                return d
            }, 
            // gyration
            function(d) { 
                d = d.toString('utf8') // decode
                d = d.replace(/\uFFFD/g, '')
                d = d.split(",")
                return d
            }, 
            // magnetometer
            function(d) {
                d = d.toString('utf8') // decode
                d = d.replace(/\uFFFD/g, '')
                d = d.split(",")
                return d
            }, 
            // adc
            function(d) {
                d = d.toString('utf8') // decode
                d = d.replace(/\uFFFD/g, '')
                d = d.split(",")
                return d
            }, 
            // environment
            function(d) { 
                d = d.toString('utf8') // decode
                d = d.replace(/\uFFFD/g, '')
                d = d.split(",")
                return d
            }, 
        ],
        
        battery : function(d) { 
            d = d.toString('utf8') // decode
            d = d.replace(/\uFFFD/g, '')
            d = d.charCodeAt(0) // convert to decimal
            d = parseInt(d)
            return d
        }
    },    

    //-------------------------------------------
    // firmware version 1.0.0 - Gen 1.5, updated with byte stream
    //-------------------------------------------
    "1.0.0" : {
        type : [
            [
                'acceleration' ,'acceleration', 'acceleration',
                'gyration' ,'gyration', 'gyration',
                'magnet' ,'magnet', 'magnet',
                'adc'
            ],
            [
                'environment', 'environment', 'environment'
            ],
        ],

        field : [
            [
                'ax' ,'ay', 'az',
                'gx' ,'gy', 'gz',
                'mx' ,'my', 'mz',
                'a0'
            ],
            [
                'temp', 'humd', 'baro'
            ]
        ],

        measurement : [
            [
                "IMU", "IMU", "IMU",
                "IMU", "IMU", "IMU",
                "IMU", "IMU", "IMU",
                "sensor"
            ],
            [
                "environment"
            ]
        ],

        functions : [
            // primary characteristic
            function(data) {
                data_convert = []
                for (i=0; i < Math.floor(data.length / 2); i++) {
                    // combine high and low register bits
                    var lowbit = 0xffff & data[i*2]
                    var highbit = 0xffff & (data[i*2+1] << 8)
                    var value = lowbit | highbit

                    // 2's complemennt for negative values
                    if (((value >> 15 & 0x01)) == 1) {
                        value = -1 * (65536 - value)
                    }

                    // push to data
                    data_convert.push(value)
                }
                return data_convert
            },

            // secondary characteristic
            function(data) {
                data_convert = []
                for (i=0; i < Math.floor(data.length / 2); i++) {
                    // combine high and low register bits
                    var lowbit = 0xffff & data[i*2]
                    var highbit = 0xffff & (data[i*2+1] << 8)
                    var value = lowbit | highbit

                    // 2's complemennt for negative values
                    if (((value >> 15 & 0x01)) == 1) {
                        value = -1 * (65536 - value)
                    }

                    // push to data
                    data_convert.push(value)
                }
                return data_convert
            }
        ],

        battery : function(d) { 
            d = d.toString('utf8') // decode
            d = d.replace(/\uFFFD/g, '')
            d = d.charCodeAt(0) // convert to decimal
            return d
        },
    },

    //-------------------------------------------
    // firmware version 2.0.0 - Gen 2.5
    //-------------------------------------------
    "2.0.0" : function() {
        console.log("2.0.0")
    }
}

module.exports = SLEEVE