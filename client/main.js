import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';


Router.route('/', function () {
    if (Meteor.userId()){
        this.render('dashboard');
    } 
    else {
        this.render('loginpage');
    }
});

Router.route('/:_id', function (){
    if (Meteor.userId()){
        this.render('website', {
            data:function () {return Websites.findOne({_id:this.params._id});}
        });
    } else {
        this.render('loginpage');
    }
});

Template.loginpage.events({
    'click .js-change-tab': function(event){
        
        event.preventDefault();
        var href = $(event.target).attr('href');

        $('.active').removeClass('active');
        $(event.target).addClass('active');

        $('.show').removeClass('show').addClass('hide').hide();
        $(href).removeClass('hide').addClass('show').hide().fadeIn(550);
    },
    'submit #js-loginForm-submit': function(event){
        
        event.preventDefault();
        
        var getEmail = $.trim(event.target.Username.value),
        getPassword = event.target.password.value;
        
        isValidPassword();
        
        function isValidPassword() {
            
            $("#failPassword").remove();
            $("#failUsername").remove();
            
            var failPassword = "<p id='fail'>password must contain more than 6 characters</p>",
                failUsername = "<p id='fail'>Username cannot  be empty</p>",
                login$passwordErr = "<p id='fail'>Login failed, Your Username and password do not match</p>";
            
            if (getEmail == null || getEmail == ""){
                $("#fail").remove();
                $("#login").append(failUsername);
                return false;
            }
            if (getPassword.length >= 6){
                
                Meteor.loginWithPassword(getEmail, getPassword, function(err){
                    if (Meteor.user()){
                         console.log(Meteor.userId());
                        return false;
                    } else {
                        $("#fail").remove();
                        $("#login").append(login$passwordErr);
                    }
                });
                
            } else {
                $("#fail").remove();
                $("#login").append(failPassword);
                return false; 
            } 
        }
        
    },
    'submit #js-regForm-register':function(event){
        
        //stop browser from reloading the page so leaves all resposibility to meteor
        //$.trim is to remove empty spaces from the input fields
        event.preventDefault();
        var getfirstName = $.trim(event.target.firstName.value),
        getlastName = $.trim(event.target.lastName.value),
        getUsername = $.trim(event.target.Username.value),
        getEmail = $.trim(event.target.Email.value),
        getdateOfBirth = event.target.dateOfBirth.value,
        getpassword = $.trim(event.target.password.value),
        getconfirmPass = $.trim(event.target.passwordc.value);
        
        //text to show if form fail
        var emptyField = "<p id='fail'>Pls check the form and ensure no field is empty</p>",
        initials = "<p id='fail'>Pls ensure your first and last you entered are not just initials</p>",
        lessThan5 = "<p id='fail'>Username cannot be less than 5 characters</p>",
        emailError = "<p id='fail'>Your email seems wrong pls review</p>",
        passwordLenghtErr = "<p id='fail'>password must contain more than 6 characters</p>",
        notMatch = "<p id='fail'>Passwords do not match</p>",
        regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        
        //validate the form
        if (getfirstName==""||getlastName==""||getUsername==""||getEmail==""||getdateOfBirth==""||getpassword==""||getconfirmPass=="") {
            $("#fail").remove();
            $("#register").append(emptyField);
            return false;
        }
        if (getfirstName.length==1||getlastName.length==1) {
            $("#fail").remove();
            $("#register").append(initials);
            return false;
        }
        if (getUsername.length<=4) {
            $("#fail").remove();
            $("#register").append(lessThan5);
            return false;
        }
        if (regex.test(getEmail) == false) {
            $("#fail").remove();
            $("#register").append(emailError);
            return false;
        }
        if (getpassword.length<=5) {
            $("#fail").remove();
            $("#register").append(passwordLenghtErr);
            return false;
        } 
        if (getpassword!==getconfirmPass){
            $("#fail").remove();
            $("#register").append(notMatch);
            return false;
        }
        
        //create the form db
        Accounts.createUser({
            username: getUsername,
            email: getEmail,
            password: getpassword,
            FirstName: getfirstName,
            LastName: getlastName,
            DateOfBirth: getdateOfBirth
        }); 
    }
});

Template.dashboard.helpers({
    
    //imports from database
    websites :function(){
        return Websites.find({});
    }
});
Template.dashboard.onRendered(function() {
    $('.invalid').slideUp('fast');
    this.$('[data-toggle="tooltip"]').tooltip();
});

Template.dashboard.events({
    
    'click input[type=text]': function (event) {
        $('.invalid').slideUp('fast');
    },
    
    //submits to database
    'submit #js-submitForm-submit': function (event) {
        
        event.preventDefault();
        
        var regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
        if (regex.test(event.target.url.value)==true){
            Websites.insert({
                title: event.target.title.value, 
                url: event.target.url.value, 
                description: event.target.description.value, 
                createdOn: new Date(),
                createdBy: Meteor.user().username,
                thumbsUp: 0,
                thumbsUpBy: "",
                thumbsDown: 0,
                thumbsDownBy: ""
            });
            
        } else {
            $('.invalid').slideDown();
            return false;
        }
    },
    
    'click #logout':function (event) {
        Meteor.logout();
    },
    
    'click .js-change-tab': function(event){
        
        event.preventDefault();
        $('.js-change-tab.active.'+this._id).removeClass('active');
        $(event.target).addClass('active');
        
        var href = $(event.target).attr('href'); 
        $('.show.'+this._id).removeClass('show').addClass('hide').fadeOut(550).hide();
        $(href).removeClass('hide').addClass('show').fadeIn(550).hide();
        
    },
    
    'click .js-web': function(event){
        
        event.preventDefault();
        var url = Websites.findOne({_id:this._id}).url;
        Meteor.call("httpRequest", url, (error, result) => {
              if (error) {
                // do something with the error
              } else {
               console.log(result);
              }
        });
    },
    
    'click .js-thumbs-up': function(event){
        
        var i = Websites.findOne({_id:this._id}).thumbsUp; 
        var p = Websites.findOne({_id:this._id}).thumbsUpBy;
        var z = Meteor.user().username;
        
        if (p.indexOf(z)==-1){
            i++;
            p+=Meteor.user().username;
            Websites.update({_id: this._id}, {$set: {thumbsUp: i}});
            Websites.update({_id: this._id}, {$set: {thumbsUpBy: p+"&#13;&#10;"}});
            return false;
        } 
        if (p.indexOf(z)>=0){
            i--;
            p = p.replace((z+"&#13;&#10;"), "");
            Websites.update({_id: this._id}, {$set: {thumbsUp: i}});
            Websites.update({_id: this._id}, {$set: {thumbsUpBy: p}});
            return false;
        }
    },
    
    'click .js-thumbs-down': function(event){
        
        var i = Websites.findOne({_id:this._id}).thumbsDown, 
            p = Websites.findOne({_id:this._id}).thumbsDownBy,
            z = Meteor.user().username;
        
        if (p.indexOf(z)==-1){
            i++;
            p+=Meteor.user().username;
            Websites.update({_id: this._id}, {$set: {thumbsDown: i}});
            Websites.update({_id: this._id}, {$set: {thumbsDownBy: p+"&#13;&#10;"}});
            return false;
        } 
        if (p.indexOf(z)>=0){
            i--;
            p = p.replace((z+"&#13;&#10;"), "");
            Websites.update({_id: this._id}, {$set: {thumbsDown: i}});
            Websites.update({_id: this._id}, {$set: {thumbsDownBy: p}});
            return false;
        }
    }, 
    
    'click .js-comments': function(event){
        console.log("saw click");
        window.location.pathname='/'+this._id;
    },
    
    'click .js-delete': function(event){
        if((Websites.findOne({_id:this._id}).createdBy)==(Meteor.user().username)){
            var p=this._id; p;
            $('#'+this._id).hide("slow", function(){
                Websites.remove(p);
            });
        } else {
            console.log("delete not permitted on website not uploaded by user");
        }
    }
});

Template.website.events({
    
    'submit #js-submit-comments': function(event){
        var sorter = this._id; sorter;
        event.preventDefault();
        if ((event.target.comment.value)!==""){
            console.log(event.target.comment.value);
            
            Comments.insert({
                comment: event.target.comment.value,
                createdOn: new Date(),
                createdBy: Meteor.user().username,
                sort_Id: sorter
            });
        } else {
            
        }
    }
});

Template.website.helpers({
    comments :function(){
        var sorter = this._id; sorter;
        return Comments.find({sort_Id:sorter});
    }
});







