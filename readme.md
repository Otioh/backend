

## API Documentation

### Authentication

#### Authentication Method


## Response Object
{
      "message": "",
  "success": false,
  "data": []
}



#### Authentication
- **Endpoint**: `/auth/{user_email}`
- **Method**: GET
- **Description**: Verify the user email, if the user email is not verified it sends a verification code to the user's email.







#### Authentication
- **Endpoint**: `/auth`
- **Method**: POST
- **Body**: {
    email, password
}

- **Description**: Try a login request, if successful it returns a reponse with user profile data.




#### Authentication
- **Endpoint**: `/reset/{user_email}`
- **Method**: GET
- **Description**: Verify the user email anf sends a reset code to the user's email.






#### Authentication
- **Endpoint**: `/reset`
- **Method**: POST
- **Body**: {
 email, currentPassword, code, newPassword
}

- **Description**: Try a request to change password



#### Authentication
- **Endpoint**: `/auth/{user_email}`
- **Method**: POST
- **Body**: {
    code
}
- **Description**: Request for email to be verified










#### Create Account

- **Endpoint**: `/user`
- **Method**: POST
- **Body**: {
email, password, first_name, surname, phone, matric 
}
- **Description**: Create a new user account.






### User Profile Endpoints

#### Get User Profile

- **Endpoint**: `/user/{user_email}`
- **Method**: GET
- **Description**: Retrieve user profile information.




#### Update User Profile

- **Endpoint**: `/user/{user_email}`
- **Method**: POST
- **Description**: Update user profile information.

