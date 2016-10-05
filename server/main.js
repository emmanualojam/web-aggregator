import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.startup(() => {
  if (!Websites.findOne()){
    	console.log("No websites yet. Creating starter data.");
    	  Websites.insert({
    		title:"Goldsmiths Computing Department", 
    		url:"http://www.gold.ac.uk/computing/", 
    		description:"This is where this course was developed.", 
    		createdOn:new Date(),
            thumbsUp: 0,
            thumbsUpBy: "",
            thumbsDown: 0,
            thumbsDownBy: ""
    	});
    	 Websites.insert({
    		title:"University of London", 
    		url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route", 
    		description:"University of London International Programme.", 
    		createdOn:new Date(),
            thumbsUp: 0,
            thumbsUpBy: "",
            thumbsDown: 0,
            thumbsDownBy: ""
    	});
    	 Websites.insert({
    		title:"Coursera", 
    		url:"http://www.coursera.org", 
    		description:"Universal access to the world’s best education.", 
    		createdOn:new Date(),
            thumbsUp: 0,
            thumbsUpBy: "",
            thumbsDown: 0,
            thumbsDownBy: ""
    	});
    	Websites.insert({
    		title:"Google", 
    		url:"http://www.google.com", 
    		description:"Popular search engine.", 
    		createdOn:new Date(),
            thumbsUp: 0,
            thumbsUpBy: "",
            thumbsDown: 0,
            thumbsDownBy: ""
    	});
    }
});

Accounts.onCreateUser(function(options, user) {
  user.profile = {
    FirstName: options.FirstName,
    LastName: options.LastName,
    DateOfBirth: options.DateOfBirth
  };
  return user;
});


Meteor.methods({
    httpRequest: function(url) {
        try {
          return HTTP.call('GET', url, {}); // or you could use HTTP.get(url, {});
        } catch (error) {
          throw new Meteor.error('error', 'something bad happened')
        }
    }
});
