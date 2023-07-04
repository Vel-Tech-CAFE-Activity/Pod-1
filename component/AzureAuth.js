const msal = require('@azure/msal-node');
const e = require('express');
require('dotenv').config({ path: './.env' });
const fs = require('fs');

function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logPath = `logs.txt`;
    
    const logEntry = `${timestamp}: ${message}\n`;
  
    fs.appendFile(logPath, logEntry, (err) => {
      if (err) {
        console.error('Error appending to log file:', err);
      }
    });
}

class AzureAuthentication{

    clientID = process.env.CLIENT_ID;
    tenatID = process.env.TENANT_ID;
    authority = 'https://login.microsoftonline.com/common';
    redirectURI = process.env.REDIRECT_URI;
    clientsecret = process.env.CLIENT_SECRET;
    logoutredirecturl = process.env.POST_LOGOUT_REDIRECT_URI;

    login(){
        console.log("login button clicked");
        return async (req, res, next) => {
            
            try{
                console.log("entered try block");
                logToFile("entered try block")
                const authConfigs = {
                    auth : {
                        clientId : this.clientID,
                        authority :  'https://login.microsoftonline.com/common',                        
                        clientSecret :  this.clientsecret,
                    },
                    system: {
                        loggerOptions: {
                            loggerCallback(loglevel, message, containsPii) {
                                console.log(message);
                                logToFile(message);
                            },
                            piiLoggingEnabled: false,
                            logLevel: 3,
                        }
                    }
                }
                const authInstance = new msal.ConfidentialClientApplication(authConfigs);

                console.log("auth instance created", authInstance);
                logToFile(`auth instance created : ${authInstance}`);
                const response = await authInstance.getAuthCodeUrl({
                    scopes : ['openid', 'profile', 'user.read'],
                    redirectUri : this.redirectURI, 
                })
                console.log("response recieved", response);
                logToFile(`response recieved : ${response}`)

                res.redirect(response );


            }catch(error){
                console.log(error);
                logToFile(error);
                next(error);
            }

        }
    }

    async getAccessTokenFromCache(req) {
        try {
          // Check if accessToken exists in the session cache
          const accessToken = req.session.accessToken;
          if (accessToken) {
            console.log('Existing accessToken found in cache:', accessToken);
            logToFile(`Existing accessToken found in cache: ${accessToken}`);
            return accessToken;
          }
    
          // If accessToken doesn't exist in cache, return null or handle the case accordingly
          console.log('No accessToken found in cache');
          logToFile('No accessToken found in cache');
          return null;
        } catch (error) {
          console.log(error);
          logToFile(error);
          throw error;
        }
    }
    
    getAccessToken(){

        return async (req, res, next)=> {

            try {
                
                const authInstance = new msal.ConfidentialClientApplication({
                    auth : {
                        clientId : this.clientID,
                        authority : 'https://login.microsoftonline.com/common',
                        clientSecret : this.clientsecret,
                    },
                    system: {
                        loggerOptions: {
                            loggerCallback(loglevel, message, containsPii) {
                                console.log(message);
                                logToFile(message);
                            },
                            piiLoggingEnabled: false,
                            logLevel: 3,
                        }
                    },
                });
                let accessToken = "" ;
                let name = "";
                let email = "";
                console.log("this is req.query object: ", req.query);
                logToFile(`this is req.query object: ${req.query}`)
                logToFile(`this is req.query object:  ${req.query}`)

                const tokenData = authInstance.acquireTokenByCode({
                    code : req.query.code,
                    redirectUri : this.redirectURI, 
                    scopes: ['openid', 'profile', 'user.read'], 
                }).then(async function(result){
                    console.log("response recieved:", result);
                    logToFile(` response recieved : ${result}`);
                    accessToken = result.accessToken;

                    name = result.idTokenClaims.name;
                    email = result.idTokenClaims.preferred_username;
                    console.log("name:", name );
                    logToFile(`name: ${name}`)
                    console.log("emailID : ", email);

                    logToFile(`email ID : ${email}`);
                    if(accessToken != null){
                        console.log("accessToken is aquired successfully :", accessToken);
                        logToFile(`accessToken is aquired successfully : ${accessToken}`)
                        req.session.accessToken = accessToken;
                        req.session.name = name;
                        req.session.email = email;
                        console.log( "access token stored in session",req.session.accessToken);
                    }
                    


                    res.redirect('/dashboard');
                    
                });
                
 

            }catch(error){
                console.log(error);
                logToFile(error);
                next(error);
            }
        }
    }
    
    logout(){
        console.log('logout button started with logoutredirect');
        logToFile('logout button started with logoutredirect');
        return (req, res, next)=> {
            console.log('logout function started ');
            logToFile('logout function started ')
            try{
                let logouturi = `${this.authority}/oauth2/v2.0/logout`;
                console.log('logout try started logoutURI:',logouturi);
                logToFile(` logout try started logoutURI : ${logouturi}`);
                
                if(this.logoutredirecturl){
                    logouturi += `?post_logout_redirect_uri=${this.logoutredirecturl}`;
                }
                console.log('logout added with logoutredirect',logouturi);
                logToFile(` logout added with logoutredirect : ${logouturi}`)

                    res.redirect(logouturi);

            }catch(error){
                next(error);
                console.log(error);
                logToFile(error);

            }
        }
    }

}

module.exports = AzureAuthentication;
