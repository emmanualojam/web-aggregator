import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Router.configure({
   layoutTemplate: 'ApplicationLayout'
});

Router.route('/meta', function(){
    this.render('meta', {
       to:"main"
    });
});

Router.route('/', function () {
    if (Meteor.userId()){
        this.render('nav', {
            to:"navbar"
        });
        this.render('dashboard', {
            to:"main"
        });
    }
    else {
        this.render('loginpage', {
            to:"main"
        });
    }
});

Router.route('/search', function (){
    if (Meteor.userId()){
        this.render('search', {
            to: "main"
        });
    } else {
        this.render('loginpage');
    }
});

Router.route('/:_id', function (){
    if (Meteor.userId()){
        this.render('nav', {
            to:"navbar"
        });
        this.render('website', {
            data:function () {return Websites.findOne({_id:this.params._id});},
            to:"main"
        });
    } else {
        this.render('loginpage');
    }
});

Template.nav.events({
    'click #logout':function (event) {
        Meteor.logout();
    },
    'click .glyphicon-search': function(event) {
        $('.inp').toggleClass('searchOP');
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
    websites :function(){
        return Websites.find({});
    },
    metadata: function(){
        Meteor.call("httpRequest", this.url, (error, result) => {
              if (error) {
                return error;
              } else {
                htmlRaw = result.content;
                return htmlRaw;
              }
        });
    }
});
Template.dashboard.onRendered(function(template) {
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
              if (result) {

                  if ((result.content).indexOf('<meta property="og') !== -1){
                      var engineDes = (result.content).substring((result.content).lastIndexOf('<meta property="og:description"')+30);
                      var descript = engineDes.slice(0, engineDes.indexOf('>'));
                      descript = descript.replace(/content="/g, '');
                      descript = descript.replace(/"/g, '');
                      descript = descript.replace(/\//g, '');
                      descript = $.trim(descript);

                      var engineTitle = (result.content).substring((result.content).lastIndexOf('<meta property="og:title"')+24);
                      var titleWeb1 = engineTitle.slice(0, engineTitle.indexOf('>'));
                      titleWeb1 = titleWeb1.replace(/content="/g, '');
                      titleWeb1 = titleWeb1.replace(/"/g, '');
                      titleWeb1 = titleWeb1.replace(/\//g, '');
                      titleWeb1 = $.trim(titleWeb1);

                      var engineTitle = (result.content).substring((result.content).lastIndexOf('<meta property="og:site_name"')+29);
                      var titleWeb2 = engineTitle.slice(0, engineTitle.indexOf('>'));
                      titleWeb2 = titleWeb2.replace(/content="/g, '');
                      titleWeb2 = titleWeb2.replace(/"/g, '');
                      titleWeb2 = titleWeb2.replace(/\//g, '');
                      titleWeb2 = $.trim(titleWeb2);
                      var title = titleWeb2+". "+titleWeb1;

                      var engineImage = (result.content).substring((result.content).lastIndexOf('<meta property="og:image"')+24);
                      var imageWeb = engineImage.slice(0, engineImage.indexOf('>'));
                      imageWeb = imageWeb.replace(/content="/g, '');
                      if (imageWeb.charAt((imageWeb.length)-1) === "/"){
                        imageWeb = imageWeb.slice(0, -1);
                      }
                      imageWeb = imageWeb.replace(/"/g, '');
                      imageWeb = $.trim(imageWeb);

                      var webCon={};
                      webCon = {
                        "descript":descript,
                        "title":title,
                        "imageWeb":imageWeb
                      };
                      console.log(webCon);
                  } else if ((result.content).indexOf('<meta name="description"') !== -1){
                      var engineDes = (result.content).substring((result.content).lastIndexOf('<title>')+7);
                      var title = engineDes.slice(0, engineDes.indexOf('</title>'));
                      title = title.replace(/content="/g, '');
                      title = title.replace(/"/g, '');
                      title = $.trim(title);

                      var engineDes = (result.content).substring((result.content).lastIndexOf('<meta name="description"')+24);
                      var descript = engineDes.slice(0, engineDes.indexOf('>'));
                      descript = descript.replace(/content="/g, '');
                      descript = descript.replace(/"/g, '');
                      descript = descript.replace(/\//g, '');
                      descript = $.trim(descript);

                      var webCon={};
                      webCon = {
                        "descript":descript,
                        "title":title
                      };
                      console.log(webCon);
                  }
              } else {
                    console.log(error);
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
                Comments.remove({sort_Id: p});
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
    },

    'click .dropbtn':function(event){
        document.getElementById("myDropdown").classList.toggle("show");
    }
});

Template.website.helpers({
    comments :function(){
        var sorter = this._id; sorter;
        return Comments.find({sort_Id:sorter});
    }
});

Template.search.onCreated(function(){
    this.textd = new ReactiveVar('');
});

Template.search.helpers({
    results: function() {
        let textd = Template.instance().textd.get();
        if(textd!==""){
             return Websites.find({
                $or: [
                    {title: {$regex: textd}},
                    {url: {$regex: textd}},
                    {description: {$regex: textd}},
                    {createdBy: {$regex: textd}}
                ]
            });
        } else {
            return false;
        }
    }
});

Template.search.events({
    'keyup .inp': function(event, template) {
        template.textd.set(document.getElementById("edValue").value);
        console.log(document.getElementById("edValue").value);
    }
});
