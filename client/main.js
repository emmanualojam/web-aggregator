import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';



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
        //$.trim is to remoe empty spaces from the input fields
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

Template.dashboard.rendered = function() {
    $('.invalid').slideUp('fast');
}

Template.dashboard.events({
    
    'click input[type=text]': function () {
        $('.invalid').slideUp('fast');
    },
    
    //submits to database
    'submit #js-submitForm-submit': function () {
        var regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
        
        if (regex.test(event.target.url.value)==true){
            Websites.insert({
                title: event.target.title.value, 
                url: event.target.url.value, 
                description: event.target.description.value, 
                createdOn: new Date()
            });
        } else {
            $('.invalid').slideDown();
            return false;
        }
    },
    
    'click #logout':function () {
        Meteor.logout();
    }
});












































