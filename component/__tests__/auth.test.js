const AzureAuthentication = require('../AzureAuth');
const msal = require('@azure/msal-node');

jest.mock('@azure/msal-node');

describe('AzureAuthentication', () => {
  let azureAuth;
  beforeAll(() => {
    azureAuth = new AzureAuthentication();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should redirect to the authentication URL', async () => {

      const authInstanceMock = {
        getAuthCodeUrl: jest.fn().mockResolvedValue('https://example.com/auth-url'),
      };
      jest.spyOn(msal, 'ConfidentialClientApplication').mockReturnValue(authInstanceMock);
      const azureAuth = new AzureAuthentication();
      const req = {};
      const res = {
        redirect: jest.fn(),
      };
      const next = jest.fn();

      const loginMiddleware = azureAuth.login();
      await loginMiddleware(req, res, next);
      expect(authInstanceMock.getAuthCodeUrl).toHaveBeenCalledWith({
        scopes: ['openid', 'profile', 'user.read'],
        redirectUri: azureAuth.redirectURI,
      });
      expect(res.redirect).toHaveBeenCalledWith('https://example.com/auth-url');
    
    });
  });

  describe('getAccessToken', () => {
    it('should acquire an access token and redirect to logout', async () => {
      const req = {
        query: {
          code: 'authorization_code',
        },
      };
      const res = {
        redirect: jest.fn(),
      };
      const next = jest.fn();
      const tokenResult = {
        accessToken: 'access_token',
        idTokenClaims: {
          name: '',
          preferred_username: '',
        },
      };
      const authInstanceMock = {
        acquireTokenByCode: jest.fn().mockResolvedValue(tokenResult),
      };
      msal.ConfidentialClientApplication.mockImplementationOnce(() => authInstanceMock);

      await azureAuth.getAccessToken()(req, res, next);

      expect(authInstanceMock.acquireTokenByCode).toHaveBeenCalledWith(expect.objectContaining({
        code: req.query.code,
        redirectUri: azureAuth.redirectURI,
        scopes: expect.arrayContaining(['openid', 'profile', 'user.read']),
      }));
      expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    });   
  });

  describe('logout', () => {
    it('should redirect to the logout URL', () => {
      const req = {};
      const res = {
        redirect: jest.fn(),
      };
      const next = jest.fn();

      azureAuth.logout()(req, res, next);

      expect(res.redirect).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/oauth2/v2.0/logout'));
      expect(msal.ConfidentialClientApplication).not.toHaveBeenCalled();
    });  
  });
});
