const express = require('express');
const router = express.Router();
const passport = require('passport');
const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;

passport.use(new AzureAdOAuth2Strategy({
  clientID: process.env.YOUR_CLIENT_ID,
  clientSecret: process.env.YOUR_CLIENT_SECRET,
  callbackURL: process.env.YOUR_CALLBACKURL,
  // tenant: 'https://cafeactivity.azurewebsites.net/.auth/login/aad/callback'

},
 function (accessToken, refresh_token, params, profile, done) {
    console.log(profile)
  }));


router.get('/auth/azureadoauth2',
  passport.authenticate('azure_ad_oauth2'));

router.get('/azureadoauth2/callback',
  passport.authenticate('azure_ad_oauth2', {
    failureRedirect: '/login-failure',
    successRedirect: '/dashboard'
  }),

);

// ROuter if something went Wrong
router.get('login-failure', (req, res) => {
  res.send('something WEnt Wrong....')

});


// router.post('/auth/azureadoauth2',
//   passport.authenticate('azure_ad_oauth2'));

// router.post('/azureadoauth2/callback', 
//   passport.authenticate('azure_ad_oauth2', { 
//     failureRedirect: '/login-failure',
//     successRedirect: '/dashboard' 
//     }),

//   );

// // ROuter if something went Wrong
// router.post('login-failure', (req, res) => {
//     res.send('something WEnt Wrong....')

//   });




module.exports = router