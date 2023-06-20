# Azure AD authentication with node 16

This is a reusable component for Azure AD authentication developed using nodeJS that can be integrated to web application to implement authentication features.


## Documentation

[Documentation](https://docs.google.com/document/d/12k7xoe7LORIl7HmC9j2hIc9f4CzzIcvQ/edit?usp=sharing&ouid=115379737777691626063&rtpof=true&sd=true) can find the Documentation here


## Instructions to use

Step 1 : Before using the component, Should install the msal library using the ‘npm install msal’ command  and them import the AuthProvider class to use the authentication functions.      
bash
  npm install msal


Step 2 : Should create a .env file that contains CLOUD_INSTANCE, TENANT_ID, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI, and GRAPH_API_ENDPOINT parameters.

    - CLOUD_INSTANCE is the Azure cloud instance in which your application is registered.For the main (or global) Azure cloud, enter ‘https://login.microsoftonline.com/’
    - TENANT_ID is a unique identifier or alias for the tenant, If your application supports accounts in this organizational directory, this value will be the ‘Tenant ID or Tenant name’, If your application supports accounts in any organizational directory, this value will be ‘organizations’, If your application supports accounts in any organizational directory and personal Microsoft accounts, this value will be ‘common’.
    - CLIENT_ID is the Application (client) ID of the application you registered.
    - CLIENT_SECRET is the client secret created during the app registrations, To generate a new key, use Certificates & secrets in the app registration settings in the Azure portal.
    - GRAPH_API_ENDPOINT is the Microsoft Graph API cloud instance that your app will call. For the main (global) Microsoft Graph API service, enter ‘https://graph.microsoft.com/’
    - REDIRECT_URI is the location where the authorization server sends the user once the app has been successfully authorized and granted an authorization code or access token. the same URI should be added in the Azure portal under app registrations.
    - POST_LOGOUT_REDIRECT_URI is the location where the server sends the user after logging out the user.

Step 3 : Should import the AzureAuthcomp folder and authConfig.js and authProvider.js files in it 

Step 4 : Then by importing the authProvider file, login, logout and getAccessToken functions can be implemented in the application

Step 5 : By assigning msal instance to a variable , the developer using this component should be able to get user data
