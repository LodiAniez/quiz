### Endpoints Created

## Auth Endpoint

**Endpoint: http://localhost:PORT/auth/${endpoint}**
**Description: This route will authenticate and will provide the user a token credentials to be used to access protected routes**

**Endpoints Created**

-  POST /register

   -  payload type:
      {
      email: string;
      password: string;
      }
   -  description: Registration process will happen, confirmation link will be generated and will be sent to the user's email, sign in will not work unless email is confirmed

-  POST /login

   -  payload type:
      {
      email: string;
      password: string;
      }
   -  description: Login process will happen, if credentials are valid AND IF the email is confirmed, an access and refresh token will be generated and will be sent back to frontend, that will serve as creds.

-  GET /confirmation/:token

   -  description: When link from email is clicked, confirmation status is updated from database, that will allow the user to login.

-  POST /token

   -  payload type:
      {
      token: string;
      }
   -  description: When access token is expired, pass the VALIDA refresh token to the request's body to generate a new access token

-  POST /logout

   -  payload type:
      {
      token: string;
      }
   -  description: Will revoke the refresh token's access
