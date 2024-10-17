Chat Application Backend:

Overview:

The backend of this chat application is built using Node.js and Express with a real-time communication layer powered by Socket.IO.
It handles authentication, user management, and chat storage using MongoDB. The backend follows the MVC architecture for better code organization.

Features:

Node.js with Express for RESTful APIs.

Socket.IO for real-time messaging.

MongoDB with Mongoose for data storage.

JWT Authentication for securing API routes.

bcrypt for hashing user passwords.

Follows MVC architecture for maintainability.

Deployed on Render

Installation:

1.Clone the repository.

2.Install dependencies:

npm install

3.Create a .env file and add your environment variables:

MONGODB_URI=<your_mongo_uri>
JWT_SECRET=<your_jwt_secret>

4.Start the development server:

npm start

Scripts:

Scripts:

npm start: Start the application.

npm run dev: Start the application in development mode.
