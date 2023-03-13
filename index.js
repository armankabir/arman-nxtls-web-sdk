const fs = require('fs');
const noble = require('@abandonware/noble');
const fmw = require('./Firmware/FirmwareHelper');

//Importing required models
const { User } = require('./Models/UserModel');
const { AWSHelper } = require('./Services/AWSHelper');
const { UserDefaultsHelper } = require('./Services/UserDefaultsHelper');
const  { BLEHelper } = require('./Services/BLEHelper');

let awsHelper = new AWSHelper();
let userDefaults = new UserDefaultsHelper();
let bleHelperObj = new BLEHelper();

class NextilesSDK{

    /*=====================
        User Methods
    ======================*/

    /**
     * Logs in the given user
     * @param {User} user - user to be logged in
     * @param {Callback} completionHandler - callback indictating if login 
     *                                       was successful
     */
    loginUser = (user, completionHandler) => {

        //---------------PRIVATE-------------------//
        let apiKey = '************';
        let url = '********************';

        awsHelper.userRequest(
            user, 
            'loginUser', 
            url, 
            apiKey, 
            (success, error, returnedUser) => {
                if(success){
                    //Set registerUser to user from callback
                    let user = returnedUser;
                    if(user){
                        userDefaults.setCurrentUser(user);

                        //Testing if login returns correct user
                        let loggedInUser = userDefaults.getCurrentUser();
                        console.log("THIS USER LOGGED IN: ", loggedInUser);
                    }
                    console.log('Success!')
                    // completionHandler(true)
                }
                else{
                    console.log("FAILED! Error: ", error);
                    // completionHandler(false)
                }
            }//end callback 
        )//end userRequest
    }

    /**
     * Registers user
     * @param  {User} user - User to be registered
     * @param  {Callback} completionHandler - Callback to verify if the user 
     *                                        was created successfully 
     */
    registerUser = (user, completionHandler) => {

        //---------------PRIVATE-------------------//
        let apiKey = '********************'
        let url = '*********************'

        awsHelper.userRequest(
            user,
            'registerUser', 
            url, 
            apiKey, 
            (success, error, returnedUser) => {
                if(success){
                    //TODO: Work on user helper, set current user

                    //Set registerUser to user from callback
                    let registerUser = returnedUser;
                    if(registerUser){
                        userDefaults.setCurrentUser(registerUser);
                        // userDefaults.getCurrentUser();
                    }
                    console.log('Success!')
                    // completionHandler(true)
                }
                else{
                    console.log("FAILED! Error: ", error);
                    // completionHandler(false)
                }
            }//end callback 
        )//end userRequest
    }//end registerUser

    /**
     * @param  {String} username - Username of user to be registered
     * @param  {String} organization -Organization of uesr to be registered
     */
    testUserRegister = (username, organization) => {
        let user = new User(username, organization);
        user.setAll('Saiman', 12, 130, 200, '12/21', 'male', 'USA', 'right', 'left', 'soccer', 'beginner');
        this.registerUser(user);
    }

    testLogin = (username, organization) => {
        let user = new User(username, organization);
        this.loginUser(user);
    }

    /*========================
        Bluetooth Methods
	=========================*/

    /*===========
    * BLE Getters
    ============*/

     /**
	 * Gets all devices discovered
	 * @returns array of all discovered devices 
	 */
    getDiscoveredDevices = () =>
        bleHelperObj.getDiscoveredDevices();
 
    /**
     * Gets all connected devices
     * @returns array of all connected devices
     */
    getConnectedDevices = () =>
        bleHelperObj.getConnectedDevices();

    //TODO: Add getDevice
    
    /**
     * Connects to the given peripheral, returns a promise
     * @param {peripheral} peripheral - peripheral to be connected to 
     * @return Promise indicating if device was connected
     */
    //TODO: add settings as a param?
    async connectDevice(peripheral){
        // if(!userHasTokenPermission()){
        //     console.err('TOKEN ERROR! functionName: connectDevice')
        //     return
        // }
 
        // await bleHelperObj.connectPeripheral(peripheral)
        const connected = await bleHelperObj.connectDevice(peripheral);
        if(connected){
            // bleHelperObj.setConnected(true);
            console.log('CONNECTED TO: ', peripheral.advertisement.localName);
        }
        else{
            console.log('UNABLE TO CONNECT!')
        }
    }
    
    /**
     * Disconnects to the given peripheral, returns a promise
     * @param {peripheral} peripheral - peripheral to be disconnected from
     * @return Promise indicating if device was disconnected
     */
    async disconnectDevice(peripheral){
        // if(!()){
        //     console.err('TOKEN ERROR! functionName: disconnectDevice')
        //     return
        // }
        bleHelperObj.disconnectPeripheral(peripheral);
        console.log('DISCONNECTED FROM: ', peripheral.advertisement.localName);
    }

    /** 
     * Initiates scan of BLE devices
     */
    startScan(){
        // if(!userHasTokenPermission()){
        //     console.err('TOKEN ERROR! functionName: startScan')
        //     return
        // }
        // bleHelperObj.initializeBLE();
        bleHelperObj.scan();
    }


    /** 
     * Stops scan for BLE devices
     */
    stopScan(){
        // if(!userHasTokenPermission()){
        //     console.err('TOKEN ERROR! functionName: stopScan')
        //     return
        // }
        bleHelperObj.stopScan();
    }

    async startSession(){
        //NOTE: WORKS FOR 1 DEVICE CURRENTY
        //TODO: Adjust for multiple devices

        //Check if BLE is connected
        //TODO: FIX BUG WITH CHECKING CONNECTED
        // let connected = bleHelperObj.getConnectedBool();
        // console.log(connected);

        console.log('Starting Session!')
        //GETS ONLY FIRsT CONNECTED DEVICE!
        const device = await bleHelperObj.getConnectedDevices()[0];

        let deviceName = device.advertisement.localName;
        // console.log('START SESSION DEVICE: ', device);

        const services = await bleHelperObj.getServices(device);
        // console.log('SERVICES: ', services);

        //TODO: ADD FIRMWARE AND BATTERY SERVICES
        let dataService = services[services.length - 1];
        // console.log("DATA SERVICE: ", dataService);

        let characteristics = await bleHelperObj.getCharacteristics(dataService);
        // console.log('CHARACTERISTICS: ', characteristics);

        // TODO: add CSVHelper
        let CSV = 'time,data,device\n';

        characteristics.forEach((characteristic, index) => {
            // get time
			let d = new Date()
			let t = d.getTime()
			let n = t

            characteristic.on('data', (data, isNotification) =>{
                const timestamp = fmw.generateTimestamp();
                let row = timestamp + ',';

                data.forEach((value, index) =>{

                    row += value;

                    //Seperating each value by space, new line if at the end of the row 
                    index !== data.length-1 ? row += ' ' : row += ',';
                })//end data forEach

                //last column 
                row += deviceName + '\n';

                CSV += row;
            })//end characteristic.on

            //subscribe to characteristic
            bleHelperObj.subscribe(characteristic);
        })//end characteristics.forEach

        setInterval(() => {
            console.log('CSV: ', CSV);
            console.log('Saving ', bleHelperObj.COUNTER);
            let fileName = `csv${bleHelperObj.COUNTER}`;
            bleHelperObj.saveCSV(CSV, fileName);

        //--------------- TODO: REMOVE HARDCODED/PRIVATE VALUES -----------------//
            let time = fmw.generateTimestamp();
            let timeSub = time.substring(0, time.length - 5);

            let url = '******************';
            let apiKey = '***********';
            
            let username = 'armanTest';
            let organization = 'Nextiles'
            let user = new User(username, organization);

            //test upload
            awsHelper.uploadFile(
                CSV, 
                timeSub, 
                timeSub, 
                url,
                user, 
                apiKey, 
                'csv', 
                (status, data) => {
                    if(status){
                        console.log('UPLOAD SUCCESSFUL!');
                    } else {
                        console.log('Upload failed! :(');
                    }
                }
            )        
        }, 5000)
    }


    // startSession(){
    //     this.startScan();
    //     noble.on('discover', async peripheral => {
	// 		let connected = false;
    //         let name = peripheral.advertisement.localName;
	// 		console.log(name);
	// 		//TODO: Remove hard coded name
    //         let deviceName = 'NX85606cdcbef9';

	// 		//Connect to device 
    //         if (name === deviceName) {
	// 			noble.stopScanning();
    //             console.log("---DISCOVERED---");
	// 			console.log('Device Name: ', name);
	// 			bleHelperObj.setPeripheral(peripheral)
	// 			connected = await bleHelperObj.connectPeripheral(peripheral);
	// 			console.log("---CONNECTED---")
    //         }
    //         // console.log(connected);
	// 		if(connected){
	// 			// get services
	// 			const services = await bleHelperObj.discoverServices(peripheral)
	// 			console.log("---DISCOVERED SERVICES---")
	// 			console.log('services: ', services);

	// 			// get battery service
	// 			const battery_service = services.filter((s) => {
	// 				//UUID for battery service
	// 				if (s.uuid.includes("180f")) {
	// 					return s
	// 				}
	// 			})[0]

	// 			// get battery char info
	// 			const battery_char = (await bleHelperObj.discoverCharacteristics(battery_service))[0]

	// 			// get device info service
	// 			const device_service = services.filter((s) => {
	// 				if (s.uuid.includes("180a")) {
	// 					return s
	// 				}
	// 			})[0]

	// 			// get firmware info
	// 			const device_chars = await bleHelperObj.discoverCharacteristics(device_service)
	// 			const firmware_char = device_chars.filter((c) => {
	// 				if (c.uuid.includes("2a26")) {
	// 					return c
	// 				}
	// 			})[0]

    //             // get appropriate device
    //             let productType = bleHelperObj.getProductType();
	// 			const PRODUCT = fmw.firmware_map[productType];
	// 			// console.log('PRODUCT: ', PRODUCT); 

	// 			// read firmware level
    //             let firmwareLevel = await bleHelperObj.readCharacteristic(firmware_char);
    //             bleHelperObj.setFirmwareVersion(firmwareLevel);

	// 			console.log('FIRMWARE VERSION: ', bleHelperObj.getFirmwareVersion());


	// 			// map firmware level to object handler - note, global variable
    //             let firmwareVersion = bleHelperObj.getFirmwareVersion();
    //             let productHandler = PRODUCT[firmwareVersion];
    //             bleHelperObj.setProductHandler(productHandler);

	// 			// get the last custom characteristic
	// 			const service = services[services.length - 1];
	// 			// console.log(service);
	// 			// console.log('sevice: ', service);
	// 			const characteristics = await bleHelperObj.discoverCharacteristics(service)
	// 			// console.log(characteristics)
	// 			console.log("---DISCOVERED CHARACTERISTICS---")

    //             // subscribe to each characteristic
	// 			characteristics.forEach((characteristic, index) => {
	// 				// get time
	// 				var d = new Date()
	// 				var t = d.getTime()
	// 				var n = t

	// 				// create callback on read            
	// 				characteristic.on('data', (data, isNotification) => {
	// 					// console.log("DATA: ", data);
						
	// 					// get data 
	// 					// const d = PRODUCT_HANDLER(data)
	// 					// console.log('DATA: ', d)

	// 					// console.log(this.PRODUCT_HANDLER);

	// 					// generate timestamp
	// 					const timestamp = fmw.generateTimestamp();
	// 					let row = timestamp + ',';
	// 					data.forEach((value, index) =>{
	// 						row += value;

	// 						//Seperating each value by space, new line if at the end of the row 
	// 						index !== data.length-1 ? row += ' ' : row += ',';
	// 					})
	// 					// console.log(row);

	// 					//Last column. add new line to complete CSV row 
	// 					row += deviceName + '\n';

	// 					// console.log(row);

	// 					// get data from firmware
	// 					// const field = this.PRODUCT_HANDLER.field[index]
	// 					// const types = this.PRODUCT_HANDLER.type[index]
	// 					// const measurements = this.PRODUCT_HANDLER.measurement[index]
	// 					// field.forEach((f, i) => {
	// 					// 	const type = types[i]
	// 					// 	const measurement = measurements[i]
	// 					// 	var row = `${timestamp},${measurement},${d[i]},${f},${type},${NAME}`
	// 					// 	this.CSV += row + "\n"
	// 					// })
	// 					// `
	// 					bleHelperObj.addRowToCSV(row);

	// 					// log
	// 					if (this.VERBOSE) {
	// 						var date = new Date()
	// 						var nn = date.getTime()
	// 						// console.log("time elapsed = " + (nn - n) + "ms, received " + `${data.length.toString().padStart(2, ' ')}` + " bytes, " + `${d}`)
	// 						n = nn
	// 					}
	// 				})
	// 				// subscribes
	// 				characteristic.subscribe()
    //             })	

    //             bleHelperObj.INTERVAL_HANDLER = setInterval( () => {
	// 				console.log('CSV: ', bleHelperObj.CSV)
	// 				console.log(`saving ${bleHelperObj.COUNTER}`);
    //                 let csv = bleHelperObj.CSV;
    //                 let counter = bleHelperObj.COUNTER;
	// 				bleHelperObj.saveCSV(csv, counter);
	// 				// this.CSV = "time,measurement,value,field,type,device\n";
	// 				bleHelperObj.CSV = 'time,data,device\n';
	// 				bleHelperObj.COUNTER++;
	// 			}, 
	// 			bleHelperObj.INTERVAL*1000)  
	// 		}// end if(connected)	
    //     })//end noble.on callback
    // }//end startSession)()

}

module.exports = {
  NextilesSDK
}