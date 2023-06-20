const msal = require('@azure/msal-node');
const axios = require('axios');

const { msalConfig } = require('./authConfig');

class AuthProvider {
  msalConfig;

  constructor(msalConfig) {
    this.msalConfig = msalConfig;
  }
  //this is a method for logging in
  login(options = {}) {
    return async (req, res, next) => {
      const state = JSON.stringify({
        successRedirect: options.successRedirect || '/',
      });

      const authCodeUrlRequestParams = {
        state: state,
        scopes: options.scopes || [],
        redirectUri: options.redirectUri,
      };

      const authCodeRequestParams = {
        state: state,
        scopes: options.scopes || [],
        redirectUri: options.redirectUri,
      };

      const msalInstance = this.getMsalInstance(this.msalConfig);

      return this.redirectToAuthCodeUrl(
        authCodeUrlRequestParams,
        authCodeRequestParams,
        msalInstance
      )(req, res, next);
    };
  }

  acquireToken(options = {}) {
    return async (req, res, next) => {
      try {
        const msalInstance = this.getMsalInstance(this.msalConfig);

        if (req.session.tokenCache) {
          msalInstance.getTokenCache().deserialize(req.session.tokenCache);
        }

        const tokenResponse = await msalInstance.acquireTokenSilent({
          account: req.session.account,
          scopes: options.scopes || [],
        });

        req.session.tokenCache = msalInstance.getTokenCache().serialize();
        req.session.accessToken = tokenResponse.accessToken;
        req.session.idToken = tokenResponse.idToken;
        req.session.account = tokenResponse.account;

        res.redirect(options.successRedirect);
      } catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
          return this.login({
            scopes: options.scopes || [],
            redirectUri: options.redirectUri,
            successRedirect: options.successRedirect || '/',
          })(req, res, next);
        }

        next(error);
      }
    };
  }

  handleRedirect(options = {}) {
    return async (req, res, next) => {
      if (!req.body || !req.body.state) {
        return next(new Error('Error: response not found'));
      }

      const authCodeRequest = {
        ...req.session.authCodeRequest,
        code: req.body.code,
      };

      try {
        const msalInstance = this.getMsalInstance(this.msalConfig);

        if (req.session.tokenCache) {
          msalInstance.getTokenCache().deserialize(req.session.tokenCache);
        }

        const tokenResponse = await msalInstance.acquireTokenByCode(
          authCodeRequest,
          req.body
        );

        req.session.tokenCache = msalInstance.getTokenCache().serialize();
        req.session.idToken = tokenResponse.idToken;
        req.session.account = tokenResponse.account;
        req.session.isAuthenticated = true;

        const state = JSON.parse(req.body.state);
        res.redirect(state.successRedirect);
      } catch (error) {
        next(error);
      }
    };
  }

  logout(options = {}) {
    return (req, res, next) => {
      let logoutUri = `${this.msalConfig.auth.authority}/oauth2/v2.0/logout`;

      if (options.postLogoutRedirectUri) {
        logoutUri += `?post_logout_redirect_uri=${options.postLogoutRedirectUri}`;
      }

      req.session.destroy(() => {
        res.redirect(logoutUri);
      });
    };
  }

  getMsalInstance(msalConfig) {
    return new msal.ConfidentialClientApplication(msalConfig);
  }

  redirectToAuthCodeUrl(authCodeUrlRequestParams, authCodeRequestParams, msalInstance) {
    return async (req, res, next) => {
      req.session.authCodeUrlRequest = {
        ...authCodeUrlRequestParams,
        responseMode: msal.ResponseMode.FORM_POST,
      };

      req.session.authCodeRequest = {
        ...authCodeRequestParams,
        code: '',
      };

      try {
        const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
          req.session.authCodeUrlRequest
        );
        res.redirect(authCodeUrlResponse);
      } catch (error) {
        next(error);
      }
    };
  }
}

const authProvider = new AuthProvider(msalConfig);

module.exports = authProvider;
