## Setup

1. **run `npm install` to install the project dependencies**
2. **run `npm run build` to build the project**
3. **run `npm run start:dev` to start the server in development env**
4. **run `npm run db:migrate` to start database migration process, make sure xampp server is running**

## Endpoints Created

### Auth Endpoint

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
   -  **Description**: Registration process will happen, confirmation link will be generated and will be sent to the user's email, sign in will not work unless email is confirmed

-  POST /login

   -  payload type:
      ```typescript
      	interface {
      		email: string;
      		password: string;
      	}
      ```
   -  **Description**: Login process will happen, if credentials are valid AND IF the email is confirmed, an access and refresh token will be generated and will be sent back to frontend, that will serve as creds.

-  GET /confirmation/:token

   -  **Description**: When link from email is clicked, confirmation status is updated from database, that will allow the user to login.

-  POST /token

   -  payload type:
      ```typescript
      	interface {
      		token: string;
      	}
      ```
   -  **Description**: When access token is expired, pass the VALIDA refresh token to the request's body to generate a new access token

-  POST /logout

   -  payload type:
      ```typescript
      	interface {
      		token: string;
      	}
      ```
   -  **Description**: Will revoke the refresh token's access

### Quiz Endpoint

**Endpoint: http://localhost:${PORT}/quiz/${endpoint}**
**Description: This is a protected route, only user's that has valid token creds can access this route, this route allows the user to view, create and edit a quiz**

**Endpoints Created**

-  GET /list

   -  **Description**: will return the list of quizzes of type:

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

-  POST /create

   -  payload type:
      ```typescript
      	interface {
      	 title: string;
      	 status: "saved" | "published";
      	 questions: {
      	  type: "single" | "multiple";
      	  question: string;
      		choices: {
      		 label: string;
      		 checkanswer: boolean;
      		}[];
      	 }[];
      	}
      ```
   -  **Description**: will allow the authenticated user to create a new quiz, `Note: this endpoint is only for the creation of each individual quiz`, if quiz status is published, this endpoint will generate a permalink so it can be accessible by the visitors. Published quizzes cannot be edited anymore.

-  POST /edit

   -  payload type:
      ```typescript
      	interface {
      		quiz: {
      			id: number;
      			title: string;
      			status: "saved" | "published";
      		};
      		questions: {
      			id: number;
      			type: "single" | "multiple";
      			question: string;
      		}[];
      		choices: {
      			id: number;
      			label: string;
      			checkanswer: boolean;
      		}[]
      	}
      ```
   -  **Description**: Will allow the user to update an item individually, when quiz list is fetched, a field called `edited` is included, from frontend, when a quiz, or a question or a choice is updated, update the `edited` flag to keep track which data is updated, then create a variable for the payload with a type that's specified above, I structured this payload this way so it would be easy to update the update data from the database. This would be easy and more organized both in frontend and backend perspective.
