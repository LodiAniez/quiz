### Endpoints Created

## Auth Endpoint

**Endpoint: http://localhost:${PORT}/auth/${endpoint}**
**Description: This route will authenticate and will provide the user a token credentials to be used to access protected routes**

**Endpoints Created**

-  POST /register

   -  payload type:
      ```typescript
      	interface {
      		email: string;
      		password: string;
      	}
      ```
   -  description: Registration process will happen, confirmation link will be generated and will be sent to the user's email, sign in will not work unless email is confirmed

-  POST /login

   -  payload type:
      ```typescript
      	interface {
      		email: string;
      		password: string;
      	}
      ```
   -  description: Login process will happen, if credentials are valid AND IF the email is confirmed, an access and refresh token will be generated and will be sent back to frontend, that will serve as creds.

-  GET /confirmation/:token

   -  description: When link from email is clicked, confirmation status is updated from database, that will allow the user to login.

-  POST /token

   -  payload type:
      ```typescript
      	interface {
      		token: string;
      	}
      ```
   -  description: When access token is expired, pass the VALIDA refresh token to the request's body to generate a new access token

-  POST /logout

   -  payload type:
      ```typescript
      	interface {
      		token: string;
      	}
      ```
   -  description: Will revoke the refresh token's access

## Quiz Endpoint

**Endpoint: http://localhost:${PORT}/quiz/${endpoint}**
**Description: This is a protected route, only user's that has valid token creds can access this route, this route allows the user to view, create and edit a quiz**

**Endpoints Created**

-  GET /list

   -  description: will return the list of quizzes of type:

   ```typescript
   interface {
   	edited: boolean;
   	editable: boolean;
   	id: number;
   	title: string;
   	status: string;
   	questions: {
   		id: number;
   		type: string;
   		question: string;
   		edited: boolean;
   		editable: boolean;
   		choices: {
   			id: number;
   			label: string;
   			checkanswer: boolean;
   			edited: boolean;
   			editable: boolean;
   		}[];
   	}[];
   	linkcode: string;
   	permalink: string | null;
   }[];
   ```
