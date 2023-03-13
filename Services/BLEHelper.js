/*==============================================
    BLEHelper Class File
    Class holding methods to connect to 
    and receive characteristics from peripheral
================================================*/
const noble = require('@abandonware/noble');
const fs = require('fs');
const fmw = require('../Firmware/FirmwareHelper');

class BLEHelper{
	
	//======== HARD CODED ============//
	VERBOSE = true; 
	INTERVAL = 5;
	PRODUCT_TYPE = 'SLEEVE'
	
	//save parameters
	PERIPHERAL = null;
	// CSV = "time,measurement,value,field,type,device\n";
	CSV = 'time,data,device\n';
	MASTER_FOLDER = '';
	PRODUCT_HANDLER = null;
	INTERVAL_HANDLER = null
	COUNTER = 0;
	CONNECTED = false;
	
	//data
	DISCOVERED_DEVICES = [];
	CONNECTED_DEVICES = [];
	SERVICES = [];

	//metadata
	FIRMWARE_VERSION = '';
    CONNECTED = false;
    SUBSCRIBED = true;
	 




	//TODO: Make this follow George's master folder scheme 
	//TODO: Add check to make sure the device is a nextiles device 

	//Creates folder to hold csv for bluetooth data,
	constructor(){
		let date = new Date();
		let year = String(date.getUTCFullYear());
		console.log('YEAR: ', year);
		let month = String(date.getUTCMonth()+1).padStart(2,0);
		let day = String(date.getUTCDate()).padStart(2,0);
		let save_folder = `data/${year}-${month}-${day}`;
		// console.log("SAVE FOLDER: ", save_folder)
		//Create parent folder
		// fs.mkdirSync(save_folder, { recursive: true });

		//Create master folder, folder holding all data
		var hours = String(date.getHours()).padStart(2,0);
    	var minutes = String(date.getMinutes()).padStart(2,0);
    	var sec = String(date.getSeconds()).padStart(2,0);
   		var child_folder = `${save_folder}/${hours}:${minutes}:${sec}`;
    	fs.mkdirSync(child_folder, { recursive: true });
		// console.log('CHILD FOLDER: ', child_folder)
		this.MASTER_FOLDER = child_folder;

        // create your scan socket here
        noble.on('discover', async peripheral =>{
			let name = peripheral.advertisement.localName;
            
            // if(name) 
            // console.log(name);
            if(name && !this.DISCOVERED_DEVICES.includes(peripheral)){
                this.DISCOVERED_DEVICES.push(peripheral);
            }
			// if(name === deviceName){
			// 	noble.stopScanning();
			// 	return peripheral;
			// }
		})

		// this.initializeBLE();
	}	

    /*****************************************************************
     * NEW CODE HERE - PLEASE REORGANIZE  
     *****************************************************************/
	//TODO: Add csv helper here

	/**
	 * Gets all connected devices
	 * @returns Array of connected devices
	 */
	getConnectedDevices = () => this.CONNECTED_DEVICES;

	/**
	 * Gets all devices discovered
	 * @returns Array of all discovered devices 
	 */
	getDiscoveredDevices = () => this.DISCOVERED_DEVICES;

	/**
	 * Helper promise to connect to a peripheral
	 * @param {peripheral} peripheral - BLE device being connected to 
	 * @returns Promise to connect to peripheral 
	 */
	connectPeripheral = async peripheral =>  {
		return new Promise( (resolve, reject) => {
			peripheral.connect( (error) => {
				if (error) {
					reject(false)
				} else {
					resolve(true)
				}
			})
		})
	}

	/**
	 * Connects to a device and adds device to CONNECTED_DEVICES
	 * @param {peripheral} peripheral - device being connected to 
	 * @returns Boolean indicating if device was connected successfully
	 */
	async connectDevice(peripheral){
		const returnPeripheral = this.connectPeripheral(peripheral)
		if(returnPeripheral){
			// this.CONNECTED = true;
			this.CONNECTED_DEVICES.push(peripheral);
			// console.log(this.CONNECTED_DEVICES);
			return returnPeripheral;
		}
		else{
			console.log("ERROR! Device not connected, connectDevice method");
			return false; 
		}
	}	
	
	/**
	 * Initiates scanning of BLE devices
	 */
    scan(){
        noble.on('stateChange', state => {
			if (state === 'poweredOn') {
				noble.startScanning()
				console.log('---SCANNING---');
			} else {
				noble.stopScanning();
				console.log('---STOP SCANNING---')
			}
		});    
    }

	/**
	 * Stops scanning of BLE Devices 
	 */
    stopScan = () => {
		noble.stopScanning();
        console.log('Stopped scanning in SDK');
	}

	/**
	 * Subscibes to characteristic
	 * @param {Characteric} characteristic - characteristic being subscribed to 
	 */
	subscribe(characteristic){
        characteristic.subscribe(err => {
			if(err){
				console.log('Error Subscribing!')
			}
			else{
				console.log('Subscribed!')
			}
		});

    }

	/**
	 * Unubscibes to characteristic
	 * @param {Characteric} characteristic - characteristic being unsubscribed from
	 */
	unsubscirbe(characteristic){
		characteristic.unsubscirbe();
	}


    /**
	 * Helper promise to get services
	 * @param {Peripheral} peripheral - peripheral services are being received from
	 * @returns the services if the services are found
	 * @returns false if the services are not found
	 */
    discoverServices = async peripheral => {
		return new Promise( (resolve, reject) => {
			peripheral.discoverServices([], (error, services) => {
				if (error) {
					reject(false)
				} else {
					resolve(services)
				}
			})
		})
	}
    
    /**
	 * Gets services from BLE device after they are discovered
     * @param  {peripheral} peripheral - peripheral services are being received from
	 * @retrun the services found, if the services were found
	 * @return null if services are not found
     */
    async getServices(peripheral){
		return new Promise((resolve, reject) => {
			peripheral.once('connect', async () =>{
				let services = await this.discoverServices(peripheral); 
				// console.log('SERVICES in connect: ', services);
				if(services){
					console.log('---SERVICES FOUND!---')
					resolve(services)
				}
				else reject(false);
			})
		})

		// peripheral.once('connect', async () =>{
		// 	let services = await this.discoverServices(peripheral);
		// 	console.log('SERVICES in connect: ', services);
		// 	return services
		// })

        // let services = this.discoverServices(peripheral)

		// console.log('----Services Found!----')
		// console.log('helper services: ', this.SERVICES);
		// return services;

        // if(services){
        // }
        // else{
        //     console.log("Error! Services not found.\nCheck if peripheral was passed correctly");
        //     return null;
        // }
    }

    /**
	 * Helper promise to discover characteristics 
	 * @param {service} service - service characteristics are being received from
	 * @returns the characteristics if they are found
	 * @returns false if the characteristics are not found
	 */
    discoverCharacteristics = async service => {
		return new Promise( (resolve, reject) => {
			service.discoverCharacteristics([], (error, characteristics) => {
				if (error) {
					reject(false)
				} else {
					resolve(characteristics)
				}
			})
		})
	}

	/**
	 * Gets characteristics after they are discouvered
	 * @param {service} service - service characteristics are being received from
	 * @returns the characteristics if they are found
	 * @returns null if the characteristics are not found
	 */
    async getCharacteristics(service){
        let characteristics = await this.discoverCharacteristics(service);
        if(characteristics){
            console.log('----Characteristics Found----'); 
            return characteristics;
        }
        else{
            console.log("Error! Characteristics not found.\nCheck if service was passed correctly");
			return null;
        }
    }

	//TODO: Use CSV Helper
	saveCSV = (csv, name) => {
		//TODO: Add master folder 
		var save_loc = `${this.MASTER_FOLDER}/${name}.csv`
		fs.writeFileSync(save_loc, 
			csv, 
			'utf8', 
			(err) => {
				if (err) {
					console.log('Some error occured - file either not saved or corrupted file saved.');
				} else {
					console.log(`Data saved at ${save_loc}`);
				}
		})
  	}


// 	/*==================
// 		Setters
// 	===================*/
// 	setPeripheral(peripheral){
// 		this.PERIPHERAL = peripheral;
// 	}

// 	setFirmwareVersion(firmwareVersion){
// 		this.FIRMWARE_VERSION = firmwareVersion;
// 	}

// 	setProductHandler(productHandler){
// 		this.PRODUCT_HANDLER = productHandler;
// 	}

// 	setIntervalHandler(intervalHandler){
// 		this.INTERVAL_HANDLER = intervalHandler
// 	}

// 	addRowToCSV(row){
// 		this.CSV += row;
// 	}

// 	/*==================
// 		Getters
// 	===================*/

// 	getFirmwareVersion = () => this.FIRMWARE_VERSION;
// 	getConnectedDevices = () => this.CONNECTED_DEVICES;
// 	getProductType = () => this.PRODUCT_TYPE;

// 	/**
// 	 * getDevice() - returns peripheral with given device name 
// 	 * @param {Sting} deviceName - name of peripheral being returned
// 	 * @return peripheral that is found  
// 	 */
// 	getDevice(deviceName){
// 		noble.on('discover', async peripheral =>{
// 			let name = peripheral.advertisement.localName;

// 			if(name === deviceName){
// 				noble.stopScanning();
// 				return peripheral;
// 			}
// 		})
// 	}

// 	//TODO: IMPLEMENT GETTERS
// 	getBatteryCharge = () => {};
// 	getForce = () => {};
// 	getAcceleration = () => {};
// 	getMagnet = () => {};
// 	getGyration = () => {};
// 	getEnvironment = () => {};
// 	getDeviceListener = () => {};
	
	
// 	startSession = () => {

		
// 		noble.on('discover', async peripheral => {
// 			let connected = false;
//             let name = peripheral.advertisement.localName;
// 			console.log(name);
// 			//TODO: Remove hard coded name
//             let deviceName = 'NX85606cdcbef9';

// 			//Connect to device 
//             if (name === deviceName) {
// 				noble.stopScanning();
//                 console.log("---DISCOVERED---");
// 				console.log('Device Name: ', name);
// 				this.PERIPHERAL = peripheral;
// 				connected = await this.connectPeripheral(peripheral);
// 				console.log("---CONNECTED---")
//             }

// 			if(connected){

// 				// get services
// 				const services = await this.discoverServices(peripheral)
// 				console.log("---DISCOVERED SERVICES---")
// 				// console.log('services: ', services);
// 				// get battery service
// 				const battery_service = services.filter((s) => {
// 					//UUID for battery service
// 					if (s.uuid.includes("180f")) {
// 						return s
// 					}
// 				})[0]

// 				// get battery char info
// 				const battery_char = (await this.discoverCharacteristics(battery_service))[0]

// 				// get device info service
// 				const device_service = services.filter((s) => {
// 					if (s.uuid.includes("180a")) {
// 						return s
// 					}
// 				})[0]

// 				// get firmware info
// 				const device_chars = await this.discoverCharacteristics(device_service)
// 				const firmware_char = device_chars.filter((c) => {
// 					if (c.uuid.includes("2a26")) {
// 						return c
// 					}
// 				})[0]
				

// 				// get appropriate device
// 				const PRODUCT = fmw.firmware_map[this.PRODUCT_TYPE]
// 				// console.log('PRODUCT: ', PRODUCT); 

// 				// read firmware level
// 				this.FIRMWARE_VERSION = await this.readCharacteristic(firmware_char)
// 				console.log('FIRMWARE VERSION: ', this.FIRMWARE_VERSION)

// 				// map firmware level to object handler - note, global variable
// 				this.PRODUCT_HANDLER = PRODUCT[this.FIRMWARE_VERSION]
// 				console.log(this.PRODUCT_HANDLER);

// 				// get the last custom characteristic
// 				const service = services[services.length - 1];
// 				// console.log(service);
// 				// console.log('sevice: ', service);
// 				const characteristics = await this.discoverCharacteristics(service)
// 				// console.log(characteristics)
// 				console.log("---DISCOVERED CHARACTERISTICS---")
				
// 				// subscribe to each characteristic
// 				characteristics.forEach((characteristic, index) => {
// 					// get time
// 					var d = new Date()
// 					var t = d.getTime()
// 					var n = t

// 					// create callback on read            
// 					characteristic.on('data', (data, isNotification) => {
// 						// console.log("DATA: ", data);
						
// 						// get data 
// 						// const d = PRODUCT_HANDLER(data)
// 						// console.log('DATA: ', d)

// 						// console.log(this.PRODUCT_HANDLER);

// 						// generate timestamp
// 						const timestamp = fmw.generateTimestamp();
// 						let row = timestamp + ',';
// 						data.forEach((value, index) =>{

// 							row += value;

// 							//Seperating each value by space, new line if at the end of the row 
// 							index !== data.length-1 ? row += ' ' : row += ',';
// 						})
// 						// console.log(row);

// 						//Last column
// 						row += deviceName + '\n';

// 						// console.log(row);

// 						// get data from firmware
// 						// const field = this.PRODUCT_HANDLER.field[index]
// 						// const types = this.PRODUCT_HANDLER.type[index]
// 						// const measurements = this.PRODUCT_HANDLER.measurement[index]
// 						// field.forEach((f, i) => {
// 						// 	const type = types[i]
// 						// 	const measurement = measurements[i]
// 						// 	var row = `${timestamp},${measurement},${d[i]},${f},${type},${NAME}`
// 						// 	this.CSV += row + "\n"
// 						// })
// 						// `
// 						this.CSV += row;
// 						// log
// 						if (this.VERBOSE) {
// 							var date = new Date()
// 							var nn = date.getTime()
// 							// console.log("time elapsed = " + (nn - n) + "ms, received " + `${data.length.toString().padStart(2, ' ')}` + " bytes, " + `${d}`)
// 							n = nn
// 						}
// 					})
// 					// subscribes
// 					characteristic.subscribe()
// 				})	

// 				// // subscribe to battery characteristic
// 				// battery_char.on("data", (data, isNotification) => {
// 				// 	const d = this.PRODUCT_HANDLER.battery(data)
// 				// 	const timestamp = fmw.generateTimestamp()
// 				// 	const type = "battery"
// 				// 	const field = "bat"
// 				// 	const measurement = "battery"
// 				// 	var row = `${timestamp},${measurement},${d[i]},${field},${type},${NAME}`
// 				// 	this.CSV += row + "\n"

// 				// 	// log
// 				// 	if (this.VERBOSE) {
// 				// 		// console.log(`battery life: ${d}`)
// 				// 	}
// 				// })
// 				// battery_char.subscribe()

// 				// set timeout handler to save data every interval, reset CSV
// 				this.INTERVAL_HANDLER = setInterval( () => {
// 					console.log('CSV: ', this.CSV)
// 					console.log(`saving ${this.COUNTER}`);
// 					this.saveCSV(this.CSV, this.COUNTER);
// 					// this.CSV = "time,measurement,value,field,type,device\n";
// 					this.CSV = 'time,data,device\n';
// 					this.COUNTER++;
// 				}, 
// 				this.INTERVAL*1000)  
// 			}// end if(connected)
// 		})//end noble.on callback 
// 	}



// 	// noble.on('stateChange', async (state) => {
// 	// 	if (state === 'poweredOn') {
// 	// 	await noble.startScanningAsync([], true);
// 	// 	}
// 	// });

// 	// // deviceName;

// 	// noble.on('discover', async (peripheral) => {
// 	// //   await noble.stopScanningAsync();
// 	// //   await peripheral.connectAsync();
// 	// 	// const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync(['180f'], ['2a19']);
// 	// 	// const batteryLevel = (await characteristics[0].readAsync())[0];
		
// 	// 	let name = peripheral.advertisement.localName
// 	// 	deviceName = 'NX85606cdcbef9';
// 	// 	if (name === deviceName) {
// 	// 		console.log(`I have found this device: ${name}`)
// 	// 	}
// 	// 	// console.log(`${peripheral.address} (${peripheral.advertisement.localName}): ${batteryLevel}%`);

// 	// //   await peripheral.disconnectAsync();
// 	// 	// process.exit(0);
// 	// });
	

// 	/*=====================
// 		Helper Methods
// 	======================*/
// 	// SCANNING CALLBACK
// 	initializeBLE = () => {
// 		noble.on('stateChange', state => {
// 			if (state === 'poweredOn') {
// 				noble.startScanning()
// 				console.log('---SCANNING---');
// 			} else {
// 				noble.stopScanning();
// 				console.log('---STOP SCANNING---')
// 			}
// 		});
// 	}

// 	disconnectPeripheral = async peripheral => {
// 		return new Promise( (resolve, reject) => {
// 			peripheral.disconnect( error => {
// 				if(error){
// 					reject(false);
// 				}
// 				else{
// 					resolve(true);
// 				}
// 			})
// 		})
// 	}


// 	discoverServices = async peripheral => {
// 		return new Promise( (resolve, reject) => {
// 			peripheral.discoverServices([], (error, services) => {
// 				if (error) {
// 					reject(false)
// 				} else {
// 					resolve(services)
// 				}
// 			})
// 		})
// 	}

// 	discoverCharacteristics = async service => {
// 		return new Promise( (resolve, reject) => {
// 			service.discoverCharacteristics([], (error, characteristics) => {
// 				if (error) {
// 					reject(false)
// 				} else {
// 					resolve(characteristics)
// 				}
// 			})
// 		})
// 	}

// 	readCharacteristic = async characteristic => {
// 		return new Promise( (resolve, reject) => {
// 			characteristic.read((error, data) => {
// 				if (error) {
// 					reject(false)
// 				} else {
// 					data = data.toString('utf8') // decode
// 					data = data.replace(/\uFFFD/g, '') // remove invalid codes
// 					resolve(data)
// 				}
// 			})
// 		})
// 	}

//   	/**
// 	 * saveCSV method - Saves csv in file directory 
// 	 * @param {CSV} csv - csv to be saved
// 	 * @param {String} name - name csv file will be saved under 
// 	 */
// 	saveCSV = (csv, name) => {
// 		//TODO: Add master folder 
// 		var save_loc = `${this.MASTER_FOLDER}/${name}.csv`
// 		fs.writeFileSync(save_loc, 
// 			csv, 
// 			'utf8', 
// 			(err) => {
// 				if (err) {
// 					console.log('Some error occured - file either not saved or corrupted file saved.');
// 				} else {
// 					console.log(`Data saved at ${save_loc}`);
// 				}
// 		})
//   	}

// 	/**
// 	 * saveMeta method - saves metadata for session
// 	 * @param {String} name - name file will be saved under
// 	 */
// 	saveMeta = name => {
// 		var save_loc = `${this.MASTER_FOLDER}/${name}.json`;

// 		//TODO: Remove hard coded values
// 		var obj = {
// 			firmware : 'HARDCODED FIRMWARE',
// 			devices  : 'NX85606cdcbef9',
// 			product  : 'Sleeve',
// 			data     : "1.0.0", // hard-coded for now
// 			username : 'Test',
// 			platform : 'HARDCODED PLATFORM'
// 		}

// 		//Create file
// 		fs.writeFileSync(
// 			save_loc, 
// 			JSON.stringify(obj, null, 2), 
// 			'utf8', 
// 			(err) => {
// 				if (err) {
// 					console.log('Some error occured - file either not saved or corrupted file saved.');
// 				} else {
// 					console.log(`meta data saved`);
// 				}
// 		})
// 	}

// }
}

module.exports = {
    BLEHelper
}