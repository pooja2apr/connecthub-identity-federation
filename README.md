# ConnectHub Identity Federation

ConnectHub is a lightweight B2B Identity Federation platform that allows users from different organizations to access the same SaaS application using their organization's Identity Provider (IdP).

Instead of asking users to select an Identity Provider, ConnectHub dynamically discovers the appropriate IdP based on the user's email domain.

The project demonstrates how a single SaaS application can support multiple organizations and multiple Identity Providers using OAuth 2.0 and OpenID Connect.

## Project Overview

The basic authentication flow is:

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
  |
  v
SaaS Application
