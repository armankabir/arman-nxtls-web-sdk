class User {
    //Parameterized constuctor setting username and organization
    constructor(username, organization){
        this.username = username;
        this.organization = organization;

        //Remaining members set to default values
        this.name = '';
        this.age = 0;
        this.weight = 0;
        this.height = 0;
        this.dob = '';
        this.gender = '';
        this.country = '';
        this.hand = '';
        this.foot = '';
        this.sport = {
            'sport': '',
            'skillLevel': ''
        };
    }

    /*=================================
        Setter Methods
    ===================================*/
    setName = name => this.name = name;

    setAge = age => this.age = age;

    setWeight = weight => this.weight = weight;

    setHeight = height => this.height = height;

    setDob = dob => this.dob = dob;

    setGender = gender => this.gender = gender;
    
    setCountry = country => this.country = country;
    
    setHand = hand => this.hand = hand;
    
    setFoot = foot => this.foot = foot;

    setSportAndSkillLevel = (sport, skillLevel) => {
        this.sport['sport'] = sport;
        this.sport['skillLevel'] = skillLevel;
    }

    setAll = (
        name, 
        age, 
        weight, 
        height, 
        dob, 
        gender, 
        country, 
        hand, 
        foot, 
        sport, 
        skillLevel
    ) => {
        this.name = name;
        this.age = age;
        this.weight = weight;
        this.height = height;
        this.dob = dob;
        this.gender = gender;
        this.country = country;
        this.hand = hand;
        this.foot = foot;
        this.sport = {
            'sport': sport,
            'skillLevel': skillLevel
        };
    }

    //Getter method for all members in class, returned as an object
    getUserAsDictionary(){ 
        //get all members
        let username = this.username;
        let name = this.name;
        let organization = this.organization;
        let age = this.age;
        let weight = this.weight;
        let height = this.height;
        let dob = this.dob;
        let gender = this.gender;
        let country = this.country;
        let hand = this.hand;
        let foot = this.foot;
        let sport = this.sport;

        //Dictionary holding values
        let userObject = {
            'username': username,
            'name':name,
            'organization': organization,
            'age': age,
            'weight': weight,
            'height': height,
            'dob': dob,
            'gender': gender,
            'country': country,
            'hand': hand,
            'foot': foot,
            'sport': sport  
        }

        return userObject;
    }
}

module.exports = {
    User
}