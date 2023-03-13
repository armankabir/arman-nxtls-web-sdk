/*=====================================
AWSHelper Class File
Class dealing with calls to AWS API
=======================================*/
const fetch = require('node-fetch');
const { User } = require('../Models/UserModel');

class AWSHelper {
    //Network functions that can be used in the API
    supportedNetworkFunctions = {
        checkToken: 'checkToken',
        registerUser: 'registerUser',
        loginUser: 'loginUser',
        editUser: 'editUser',
        getSessions: 'getSessions',
        getAnalytics: 'getAnalytics'
    }

    //Errors that can occur while fetching the API
    NetworkErrors = {
        invalidUrl: 'Invalid URL',
        serverError: 'Server Error',
        parseReplyError: 'Parse Reply Error'
    }

    //Types of files that can be uploaded
    uploadFileType = {
        csv: 'csv',
        json: 'json',
        survey: 'survey'

    }

    /**
     * Method to upload CSV or JSON file to the database
     * @param {Data} file - file being uploaded
     * @param {String} sessionTimeStamp - time stamp of the start of the session
     * @param {String} currentSessionTimeStamp - time stamp of the current session
     * @param {String} url - API URL 
     * @param {User} currentUser - the current user; the user the data is being uploaded for 
     * @param {String} apiKey - API key
     * @param {uploadFileType} typeOfFile - type of file being uploaded
     * @param {Callback} completionHandler - Callback sending data
     */
    uploadFile = async (
        file,
        sessionTimeStamp,
        currentSessionTimeStamp,
        url,
        currentUser,
        apiKey,
        typeOfFile,
        completionHandler
    ) => {
        let endpoint = this.#getTruePath(typeOfFile, url);
        
        //Check if endpoint is null before continuing
        if(!endpoint){
            console.log('Endpoint empty when trying to upload file!')
            completionHandler(false, null);
            return;
        }

        //TODO: add check to make sure a date is being passed
        let correctFormatUpdateSession = this.#convertSessionString(sessionTimeStamp, currentSessionTimeStamp);

        //Check if null before continuing 
        if(!correctFormatUpdateSession){
            console.log('Formatted session time empty when trying to upload file!')
            completionHandler(false, null);
            return;
        }

        //Creating API enpoint with query params
        let newEndpoint = this.#setFileQueryParameters(
                            endpoint,
                            currentUser.username,
                            currentUser.organization,
                            sessionTimeStamp,
                            correctFormatUpdateSession,
                            typeOfFile
                        );
        
        //Options for request 
        let requestOptions = this.#getFileUploadRequest(newEndpoint, apiKey, file);

        //Exit if request options are empty
        if(!requestOptions){
            completionHandler(false, null);
            return
        }

        let response = await fetch(newEndpoint, requestOptions);


        //Error checking
        if(response.ok !== true){
            console.log('Error!')
            completionHandler(false, response.status)
            return;
        }
        switch(typeOfFile){
            case this.uploadFileType.csv:
            case this.uploadFileType.survey:
                if(response.status === 200){
                    completionHandler(true, null)
                } else {
                    completionHandler(false, null);
                    return;
                }
                break;

            case this.uploadFileType.json:
                if(response.status === 203){
                    completionHandler(true, null);
                } else {
                    completionHandler(false, null);
                    return;
                }
        }
    }//end uploadFile method

    /**
     * Handles user related networking requests.
     * Currently supports login and register
     * @param  {User} user - The user making the request
     * @param  {supportedNetworkFunctions} requestType - network function
     * @param  {String} url - API url 
     * @param  {String} apiKey - API key 
     * @param  {Callback} completionHandler - Callback sending data thorugh parameters
     */
    userRequest = async (
        user, 
        requestType, 
        url, 
        apiKey, 
        completionHandler
    ) => {
        //Adding endpoint to API url 
        let endpointUrl = url + '/user';


        // let requestParams = this.#createNetworkRequestParams(
        //     endpointUrl, apiKey, requestType, user
        // )
        // return requestParams
        // console.log(this.#setUserTokenQueryParameters(endpointUrl, 'arman', 'coolkidsclub'));
     
        //Url will add query parameters if requestType is not registerUser
        let newUrl = endpointUrl;

        //Register user is the only network function without query params
        if(requestType !== this.supportedNetworkFunctions.registerUser){
            //add query params if the request type is not registerUser
            newUrl = this.#setUserTokenQueryParameters(
                        endpointUrl, 
                        user.username, 
                        user.organization
                    );
        }//end if

        //Oprions required for request
        let requestOptions = this.#createNetworkRequestOptions(
                                apiKey, 
                                requestType, 
                                user
                            );
       
        // console.log("REQUEST OPTIONS", requestOptions)
        if(requestOptions){
            //fetching data using link and added headers
            let response =  await fetch(newUrl, requestOptions);
            // console.log("RESPONSE: ", response);
            // console.log("RESPONSE JSON: ", responseJson);
            
            //Retrun Error if response status is not 200-299
            if(response.ok !== true){
                console.log("Network Error! Status: ", response.status);
                
                //Send server error to callback 
                completionHandler(false, this.NetworkErrors.serverError, null);
                return
            }//end if
            else{
                //Get json if response is ok
                let responseJson = await response.json();
                //check if the response contained a json
                if(responseJson){
                    // console.log('RESPONSE JSON: ', responseJson);
                    let userData = this.#parseReplyToUser(responseJson);
                    // console.log("THIS IS USER DATA: ", userData )
                    //check if userData was parsed
                    if(userData){
                        completionHandler(true, null, userData);
                        return;
                    }
                    //Else there was an error parsing data
                    else{
                        completionHandler(false, this.NetworkErrors.parseReplyError, null)
                    }
                }//end if 
                else{
                    completionHandler(false, this.NetworkErrors.serverError, null);
                }
            }//end else
        }//end if requestOptions
        else{
            completionHandler(false, this.NetworkErrors.invalidUrl)
            return
        }
    }//end userRequest

    /*===================================
    Private Methods
    =================================== */
    /**
     * Creates options for API request 
     * @param  {String} url - URL where request is made
     * @param  {String} apiKey - apiKey to access API
     * @param  {String} typeOfRequest - Type of request being made to API
     * @param  {User} user - User request is being made for 
     * @return requestOptions - Options required for API request 
     */
    #createNetworkRequestOptions = (
        apiKey,
        typeOfRequest, 
        user
    ) =>{
        //Stores parameters for request
        let requestOptions = {
            method: '',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: {}
        }

        //Checking type of request for correct header 
        switch(typeOfRequest){
            case this.supportedNetworkFunctions.checkToken:
            case this.supportedNetworkFunctions.loginUser:
            case this.supportedNetworkFunctions.getSessions:
            case this.supportedNetworkFunctions.getAnalytics:
                requestOptions.method = 'GET';
                requestOptions.body = null;
                break;

            case this.supportedNetworkFunctions.registerUser:
            case this.supportedNetworkFunctions.editUser:
                //registering user is a POST request
                if(typeOfRequest === this.supportedNetworkFunctions.registerUser){
                    requestOptions.method = 'POST'
                }
                else if(typeOfRequest === this.supportedNetworkFunctions.editUser){
                    requestOptions.method = 'PUT'
                }
                //calling private method to convert user data to JSON
                let body = this.#convertUserToJSONBody(user) 
                // console.log("HERE IS BODY: ", body)
                requestOptions.body = body; //adds user data as body 
                break;
        }//end switch 
        return requestOptions;
    }//end createNetworkRequestParams

    /**
     * Converts user data to JSON
     * @param  {User} user -  User being converted to JSON 
     * @return userJSON - JSON of the user data
     */
    #convertUserToJSONBody = user => {
        let userDictionary = user.getUserAsDictionary();
        try {
            //Converts userDictionary to a JSON object
            let userJSON = JSON.stringify(userDictionary);
            return userJSON;
        } catch (error) {
            console.error(error, "error converting user to JSON")
            return null;
        }
        console.log(
            "In convertUserToJSONBody(), nothing returned. ",
            "Check if user passed properly."
        );
        return null;
    }//end convertUserToJSONBody

    /**
     * Adds query parameters to URL 
     * @param  {String} url - API url where query parameters are being added
     * @param  {String} username - username for query parameter
     * @param  {String} organization - organization for query parameter
     * @return searchUrl.href - The url with endpoints added
     */
    #setUserTokenQueryParameters = (url, username, organization) => {
        let searchUrl = new URL(url);
        searchUrl.searchParams.set('username', username);
        searchUrl.searchParams.set('organization', organization);
        return searchUrl.href;
    }//end setUserTokenQueryParameters

    /**
     * Takes response data parses it, then creates a user from the data
     * @param  {JSON} data - data to be parsed 
     */
    #parseReplyToUser = data => {
        // console.log('DATA: ', data);
        if(data){
           //get user data as an object 
            let userObject = data;

            let username = '';
            let organization = '';

            //Check if username is in the user object
            if(userObject.username)
                username = userObject.username;
            else 
                return null;

            //Check if organization is in the user object
            if(userObject.organization)
                organization = userObject.organization;
            else    
                return null;
            
            //constucting user from username and organization data
            let returnUser = new User(username, organization);

            //Check if name is in user object 
            if(userObject.name)
                returnUser.setName(userObject.name);
            
            //Check for metadata
            if(userObject.metadata){
                if(userObject.metadata.height){
                    returnUser.setHeight(userObject.metadata.height);
                }

                if(userObject.metadata.weight){
                    returnUser.setWeight(userObject.metadata.weight);
                }

                if(userObject.metadata.sport){
                    returnUser.setSportAndSkillLevel(
                        userObject.metadata.sport.sport,
                        userObject.metadata.sport.skillLevel
                    );
                }

                if(userObject.metadata.country){
                    returnUser.setCountry(userObject.metadata.country);
                }

                if(userObject.metadata.hand){
                    returnUser.setHand(userObject.metadata.hand);
                }

                if(userObject.metadata.foot){
                    returnUser.setFoot(userObject.metadata.foot);
                }

                if(userObject.metadata.gender){
                    returnUser.setGender(userObject.metadata.gender);
                }

                if(userObject.metadata.dob){
                    returnUser.setDob(userObject.metadata.dob);
                }
            }//end if userObject.metadata

            //Return complete user object 
            return returnUser;
        }//end if
        else {
            return null
        }
    }//end parseReplyToUser

    /*===========================
        Upload File Helpers
    ===========================*/

    /**
     * Configures URL based on file type
     * @param {uploadFileType} file - file type (csv, json or survey)
     * @param {String} url - url where endpoint is being appended to 
     */
    #getTruePath = (file, url) => {
        switch(file){
            case this.uploadFileType.csv:
                return url + '/raw-data';
            case this.uploadFileType.json:
                return url + '/meta-device-data';
            case this.uploadFileType.survey:
                return url + '/meta-session-data';
            default:
                console.log('In getTruePath, wrong file type! Check if right file type being passed');
                return null;
        }//end switch
    }//end getTruePath

    /**
     * Converts timestamp from yyyy-MM-dd HH:mm:ss to yyyy-MM-dd HHmmss
     * @param {String} sessionTimeStamp - timestamp of start of session
     * @param {String} latestTimeStamp - timestamp of latest session
     */
    #convertSessionString = (sessionTimeStamp, latestTimeStamp) => {
        let dateObject = '';

        //Check latestTimeStamp is null
        //If null, the session just began 
        //and has not been over a minute to have an updated time stamp
        //so if latest timestamp is nil using the session timestamp
        if(latestTimeStamp){
            dateObject = latestTimeStamp;
        } else {
            dateObject = sessionTimeStamp;
        }

        //Replace colons with empty strings
        let returnDate = dateObject.replaceAll(':', '');

        return returnDate;
    }//end convertSessionString

    /**
     * Sets query params to URL for uploading a file to API
     * @param  {String} url - URL request is being made to
     * @param  {String} username - usename to be added as a query parameter
     * @param  {String} organization - organization to be added as a query parameter
     * @param  {String} sessionTimeStamp - timestamp of start of session
     * @param  {String} currentSessionTimeStamp - timestamp of current session
     * @param  {uploadFileType} typeOfFile - type of file to be uploaded (CSV, JSON or survey)
     */
    #setFileQueryParameters = (
        url,
        username,
        organization,
        sessionTimeStamp,
        currentSessionTimeStamp,
        typeOfFile
    ) => {
        let returnUrl = url;

        const and = '&';

        //prepare query params
        let usernameQuery = `username=${username}`;
        let organizationQuery = `organization=${organization}`;
        let sessionTimeQuery = `sessionTime=${sessionTimeStamp}`;
        let filenameQuery = `filename=${currentSessionTimeStamp}`;

        //Adding query parameter to URL
        returnUrl += '?' + usernameQuery + and + organizationQuery +
                    and + sessionTimeQuery + and + filenameQuery;

        //Add metadata query if file type is json
        if(typeOfFile === this.uploadFileType.json){
            var metadataQuery = 'metadata=true';
            returnUrl += and + metadataQuery;
        }

        return returnUrl;
    }//end setFileQueryParameters

    #getFileUploadRequest = (url, key, fileData) =>{
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': key
            },
            body: fileData
        }

        return requestOptions;
    }//end getFileUploadRequest
}

module.exports = {
    AWSHelper
}