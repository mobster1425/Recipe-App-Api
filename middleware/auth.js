const User = require('../model/User');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    console.log('authentication failed invalid authorization header');
    throw new UnauthenticatedError('Authentication invalid');
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Authorization sucessful : userid=',payload.userId);
    // attach the user to the job routes
    //const testUser = payload.userId === '62f801d0510a7c1ed2312d52';
    req.user = { userId: payload.userId,name:payload.name };
    next();
  } catch (error) {
    console.log('authentication failed: ',error.message);
    throw new UnauthenticatedError('Authentication invalid');
  }
};

module.exports = auth;