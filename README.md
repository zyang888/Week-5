# Week 5

This week is an exercise in authentication, authorization, and middleware. 

## Learning Objectives

At the end of this week, a student should:
- have implemented an authenticated API with signup, login, and change password routes using JWT for tokens
- have implemented authorization for controlling access to data
- have used middleware for authentication, authoriation, and error handling

## The assignment

The assignment this week is designed to get you to build an authenticated API using JWTs. You will build the common routes for signup, login, and changing passwords. Your API will model a simple store, with items and orders. But normal users should not be able to create or update store items. You will be using simple authorization to give more privileges to admin users, while a normal user will have a smaller set of abilities.

### Getting started

1. Make sure you have a recent version of [Node.js](https://nodejs.org/en/download/) installed on your computer. I am using Node v12.16, but anything above 12 will be fine.
2. Ensure you have git and github set up on your computer. If you do not, please follow this guide: https://help.github.com/en/github/getting-started-with-github.
3. Fork this repository and clone it locally. 
4. In your terminal, from inside this project directory, run `npm install` to install the project dependencies.
5. Download and install [MongoDB](https://www.mongodb.com/try/download/community). This project uses the default MongoDB configuration. If you run Mongo in a non-standard way you may need to update the configuration in `index.js` to match. If you have issues, reference the [Mongoose Connection Guide](https://mongoosejs.com/docs/connections.html).
6. Run `npm start` to start your local server. You should see a logged statement telling you `Server is listening on http://localhost:5000`.
7. Download [Postman](https://www.postman.com/) or an API client of your choice. Browse the various endpoints contained in this project. Practice calling all of them and getting 200 HTTP responses.
8. Run the unit tests of this project: `npm test`. Your test output should end in something like this:
```
Test Suites: 1 failed, 1 passed, 2 total
Tests:       8 failed, 52 passed, 60 total
```

### Your Task

We are working on an API for a store. We will handle login and authentication with JWTs. A user with an "admin" role should be able to create and update items, but any user can get an item. Any user should be able to create an order, but only an admin should be able to retrieve orders that are not their own.

We will need routes for a user to sign up, login, and change password. This will use a `User` model. Then we will need routes for items and orders, along with `Item` and `Order` models. The models are provided, but you may want to modify them. Since you are using JWT, you should not create a new `Token` model.

There is a complete set of tests already provided for these routes. However, there are no routes defined. You will need to write the following routes:

- Login
  - Signup: `POST /login/signup`
  - Login: `POST /login`
  - Change Password `POST /login/password`
- Items (requires authentication)
  - Create: `POST /items` - restricted to users with the "admin" role
  - Update a note: `PUT /items/:id` - restricted to users with the "admin" role
  - Get all items: `GET /items` - open to all users
- Orders (requires authentication)
  - Create: `POST /orders` - open to all users
    - Takes an array of item _id values (repeat values can appear). Order should be created with a `total` field with the total cost of all the items from the time the order is placed (as the item prices could change). The order should also have the `userId` of the user placing the order. 
  - Get my orders: `GET /orders` - return all the orders made by the user making the request
  - Get an order: `GET /order/:id` - return an order with the `items` array containing the full item objects rather than just their _id. If the user is a normal user return a 404 if they did not place the order. An admin user should be able to get any order.

Tests for these routes are in place but mostly failing. Your task is to write the additional route, DAO, and model code that will get these tests passing. Doing so will require the use of the [bcrypt](https://www.npmjs.com/package/bcrypt) library for securely storing passwords. Additionally, you will need to generate JWTs, and I suggest using the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) library. Please use middleware to enforce authentication and authorization.

Once all the provided tests are passing then you should know your code is correct. You should not make any changes to the test files.


### Grading

Component | Points
--------- | --------
All tests, as originally given, are passing | 80
Clear, organized project structure | 20

### Submission

- Create a pull request (PR) from your repository to the master branch of this repository. Make your name the title of the PR. 
- Continuous Integration is handled using Github Actions. This will automatically run your tests and show the results on your PR. If you see a red X and a message saying `All checks have failed` then you will not receive full credit. Ensure all tests are passing in order to receive full marks.

## Hints

- You'll want to write an `isAuthorized` middleware function that can be reused. It should verify the JWT provided in `req.headers.authorization` and put the decoded value on the `req` object.
- You'll want to write an `isAdmin` middleware function that can be reused. If the user making the request is not an admin it should respond with a 403 Forbidden error.
- Be careful creating the `items` array on the `order` object. You'll need to verify that the items exist and handle repeat values correctly.