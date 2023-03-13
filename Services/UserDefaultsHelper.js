/*=====================================
UserDefaultsHelper Class File
Class dealing with user data
=======================================*/
const { User } = require('../Models/UserModel');

var jwt = require('jsonwebtoken');

class UserDefaultsHelper {
    //Private keys
    #username = "NEXTILESUSERNAME";
    #organization = "NEXTILESORGANIZATION";
    #name = "NEXTILESFULLNAME";
    #weight = "NEXTILESWEIGHT";
    #height = "NEXTILESHEIGHT";
    #dob = "NEXTILESDOB";
    #gender = "NEXTILESGENDER";
    #country = "NEXTILESCOUNTRY";
    #hand = "NEXTILESHAND";
    #foot = "NEXTILESFOOT";
    #sport = "NEXTILESSPORT";

//IMPORTANT TODO: Research making this more secure, ADD expiration to tokens
    #token;
    #secretKey = 'secret'

    /*===========================
        Class methods
    ============================*/
    
    /**
     * setCurrentUser method - Sets user information to a JWT
     * @param  {User} currentUser - User who will have their data stored
     *                              in the token
     */
    setCurrentUser = currentUser => {
        let user = JSON.stringify(currentUser);
        this.#token = jwt.sign(user, this.#secretKey);
        console.log('TOKEN: ', this.#token);
    }//end setCurrentUser()

     //Clears token
     unSetCurrentUser = () => {
        this.#token = null;
     }//end unSetCurrentUser()

    /**
     * Edits the given user
     * @param  {User} currentUser - user whom's data will be edited 
     */
    editCurrentUser = currentUser => {
        if(this.credentialsEqual(currentUser)){

        }
    }//end editCurrentUser
   
    /**
     * Getter method for current user
     * @return - current user decoded from token
     */
    getCurrentUser = () => {
        if(this.#token){ 
            // const decodedTokenJson = atob(this.#token.split('.')[1]);
            const decodedTokenJson = Buffer.from(this.#token.split('.')[1], 'base64')
            const decodedTokenObject = JSON.parse(decodedTokenJson);
            // console.log("IN GET CURRENT USER: ", decodedTokenObject)
            return decodedTokenObject;
        }
        else 
            return null;
    }


     /*===========================
        Helper Methods
     ============================*/
     /**
      * Checks if user passed is the same as
      * the user stored locally 
      * @param  {User} checkUser - User being checked
      * @return Bool indicating if the user exists
      */
     credentialsEqual = checkUser => {
        let currentUser;

        //Checks if current user exists, else return false
        if(getCurrentUser())
            currentUser = getCurrentUser();
        else return false;

        //Check if passed user's username and password match the local user's
        if(
            currentUser.username === checkUser.username 
            && currentUser.organization === checkUser.organization
        ){
          return true;
        }
        else{
            return false;
        }
     }//end credentialEqual()

}

module.exports = {
    UserDefaultsHelper
}