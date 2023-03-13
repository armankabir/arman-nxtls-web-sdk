/*=============================
    CSV Helper Class
=============================*/
const { UserDefaultsHelper } = require('./UserDefaultsHelper');
let userHelper = new UserDefaultsHelper();

class CSVHelper {
    
    //Default Constructor - Initializes CSV and adds headers
    constructor(){
        this.#csvTable = '';
        this.#sessionTimeStamp = '';
        this.createTableHeader();
    }

    /**
     * CSV Helper should always have a session time stamp
     * Clear contents of the file, and add just the header
     * Set the sessionTimeStamp variable
     * 
     * @param {String} timeStamp - Initializes CSV with initial time stamp
     */
    constructor(timeStamp){
        this.#csvTable = '';
        this.#sessionTimeStamp = timeStamp;
        this.createTableHeader();
        this.#updateSessionTimeStamp = null;
    }

    /**
     * Takes instance of a CSVHelper and creates a copy
     * @param {CSVHelper} helper - CSVHelper instance being copied 
     */
    constructor(helper){
        this.#csvTable = helper.getCSVTable();
        this.#sessionTimeStamp = helper.getTimeStamp();
        this.#updateSessionTimeStamp = helper.getUpdatedSession();
    }


    //Private Variables
    //CSV Table
    #csvTable;
    #comma = ',';
    #newLine = '\n';

    /* When initializing the CSV helper you have to provide the time stamp
    nly will be updated unless you are starting a new session through the constructor
    Or indicating true when resetting the table */
    #sessionTimeStamp;


    /* Will only be populated if resetting the table
    but still using the orginal session time stamp
    Meaning same session but new minute */
    #updateSessionTimeStamp;

    #timeStampKey = 'timeStamp';
    #updateSessionKey = 'updateSessionTimeStamp';
    #tableKey = 'table';

    //==========Getter Methods==========//

    //Returns session timestamp, not the current timestamp
    getTimeStamp(){
        return this.#sessionTimeStamp;
    }

    getUpdatedSession(){
        return this.#updateSessionTimeStamp;
    }

    getCSVTable(){
        return this.#csvTable;
    }

    getCopy(){
        let csvHelperCopy = {
            timeStampKey: this.getTimeStamp(),
            updateSessionkey: this.getUpdatedSession(),
            tableKey: this.getCSVTable()
        }

        return csvHelperCopy;
    }

     //==========Setter Methods==========//
    setTable(tableData){
        this.#csvTable = tableData;
    }

    setTimeStamp(timeStampData){
        this.#sessionTimeStamp = timeStampData;
    }

    setUpdatedTimestamp(updateStamp){
        this.#updateSessionTimeStamp = updateStamp;
    }

    //Adds properly formatted row to the CSV
    addRow(row){
        this.#csvTable += row;
    }


     /**
      * addRow method - formats and adds row to the CSV
      * @param {String} time - time stamp for row
      * @param {String} measurement - sensor measurement is being taken from
      * @param {String} value - value of measurement 
      * @param {String} field - field for measurement 
      * @param {String} type -  type of measurement
      * @param {String} device - device measurements are taken from 
      */
    addRow(
        time,
        measurement,
        value,
        field,
        type,
        device
    ){
        this.#csvTable += this.createRow(
                                time, 
                                measurement, 
                                value, 
                                field, 
                                type, 
                                device
                            );
    }

    
    /**
     * User wants to reset the table
     * Need to indicate if you are still using the same session time stamp
     * If you are will not update sessionTimeStamp need this variable to keep
     * the path Documents/username/dateOfSession/sessionStartTimeStamp/
     * New time stamp will be used to save the new file under the current session:
     * path: Documents/username/dateOfSession/sessionStartTimeStamp/newTimeStampProvided.csv
     * @param  {String} timeStamp - timestamp of reset
     * @param  {Bool} startNewSession - Bool to indicate if user wants to start a new session
     */
    resetTable(timeStamp, startNewSession){
        if(startNewSession){
            this.createTableHeader();
            this.#sessionTimeStamp = timeStamp;
            this.#updateSessionTimeStamp = null;
        }
        else{
            this.createTableHeader();
            this.#updateSessionTimeStamp = timeStamp;
        }
    }

    /**
     * saveCSVFiles method - Check if default path exists,
     * Get the path where the file will be written to,
     * Attempt to write to the path
     * 
     * @return - Bool indicating if csv file was saved
     */
    saveCSVFiles(){

    }






    checkDefaultsPath(folderName){
        
    }
}