# ConnectHub Identity Federation

ConnectHub is an Identity Federation project that allows users from different organizations to access the same application using their organization's Identity Provider (IdP).

The project is designed to demonstrate how an application can dynamically discover the appropriate Identity Provider based on the user's email domain and authenticate the user using OAuth 2.0 / OpenID Connect.

## Project Overview

The basic flow is:

```text
User
  |
  | Application + Email
  v
ConnectHub
  |
  | Extract email domain
  v
Database
  |
  | Find organization + Identity Provider
  v
Identity Provider
  |
  | Authenticate user
  v
Authorization Code
  |
  v
ConnectHub
  |
  | Exchange code for tokens
  v
ID Token + Access Token
  |
  | Validate ID Token
  v
Authenticated User
  |
  v
ConnectHub Session
```

## Current Implementation

The following parts have been implemented:

* Database-driven Identity Provider configuration
* Application and organization mapping
* Email-domain based Identity Provider discovery
* Dynamic OAuth authorization URL generation
* Microsoft Entra ID integration
* OAuth 2.0 Authorization Code flow
* Encrypted `state` parameter
* Authorization code to token exchange
* ID token validation
* Microsoft JWKS-based token signature validation

## Architecture

The application is divided into different layers:

```text
Routes
   |
   v
Controllers
   |
   +------> Models ------> MySQL Database
   |
   +------> Services
              |
              +--> State Service
              |
              +--> Token Service
              |
              +--> ID Token Validation Service
```

### Routes

Routes define the API endpoints and forward requests to the appropriate controllers.

### Controllers

Controllers coordinate the authentication flow and call the required models and services.

### Models

Models communicate with the MySQL database and retrieve federation configuration.

### Services

Services contain specific authentication-related functionality such as:

* State encryption/decryption
* Authorization code/token exchange
* ID token validation

## Identity Federation Flow

### 1. User provides application and email

For example:

```text
Application: ConnectHub
Email: user@northwind.com
```

ConnectHub extracts the email domain:

```text
northwind.com
```

### 2. Federation configuration is retrieved

The application queries the database to determine:

```text
Email Domain
     |
     v
Organization
     |
     v
Identity Provider
```

For example:

```text
northwind.com
      |
      v
NorthWind Financial
      |
      v
Microsoft Entra ID
```

### 3. Authorization URL is generated

ConnectHub dynamically creates the authorization URL using the Identity Provider configuration stored in the database.

The URL contains parameters such as:

* `client_id`
* `response_type`
* `redirect_uri`
* `scope`
* `state`

### 4. User authenticates with the Identity Provider

The browser is redirected to Microsoft Entra ID.

Microsoft authenticates the user and returns an authorization code to ConnectHub.

### 5. Authorization code is exchanged for tokens

ConnectHub sends the authorization code to the Identity Provider's token endpoint along with the required client information.

The Identity Provider returns:

```text
ID Token
Access Token
```

### 6. ID Token is validated

ConnectHub validates the ID token, including its:

* Signature
* Issuer
* Audience
* Expiration

The token signature is validated using the Identity Provider's JWKS endpoint.

### 7. Application session

The next stage of the project is to create a ConnectHub application session after successful ID token validation.

## Database Design

The project uses MySQL to store federation configuration.

The main entities are:

```text
Applications
     |
     v
Federation Mapping
     |
     v
Identity Providers
```

This allows the application to support multiple organizations and Identity Providers without hardcoding them in the application code.

## Technologies Used

* Node.js
* Express.js
* MySQL
* OAuth 2.0
* OpenID Connect
* Microsoft Entra ID
* JSON Web Tokens (JWT)
* JWKS
* JavaScript

## Project Status

🚧 **Currently in development**

### Completed

* [x] Database-driven federation configuration
* [x] Email-domain based IdP discovery
* [x] Dynamic authorization URL
* [x] Encrypted OAuth state
* [x] Microsoft Entra ID authentication
* [x] Authorization Code → Token exchange
* [x] ID Token validation

### Upcoming

* [ ] ConnectHub session management
* [ ] Protected application endpoints
* [ ] Logout
* [ ] Support for additional Identity Providers
* [ ] Improved error handling
* [ ] Production-oriented security improvements

## Security Notes

Secrets such as client secrets are stored in environment variables and are not committed to the repository.

The `.env` file is excluded using `.gitignore`.

Example:

```text
AZURE_CLIENT_SECRET=your-secret
```

The actual secret should never be committed to GitHub.

## Purpose

This project is being developed as a practical implementation of Identity Federation concepts, including:

* Trust between applications and Identity Providers
* Identity Provider discovery
* OAuth 2.0 Authorization Code flow
* OpenID Connect authentication
* Token validation
* Application session management
