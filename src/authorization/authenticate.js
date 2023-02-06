const { admin } = require('../firebase/config');

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    console.warn('Unauthenticated - authorization header not provided');
    return res.status(401).json({ code: 401, message: 'Authorization header not provided' });
  }
  const idToken = req.headers.authorization.replace(/^Bearer\s/, '');

  if (!idToken) {
    console.warn('Unauthenticated - ID token not provided');
    return res.status(401).json({ code: 401, message: 'ID token not provided' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      next();
    })
    .catch((error) => {
      console.warn('Error while verifying ID token', { error });
      res.status(401).json({
        code: 401,
        message: 'Invalid request',
      });
    });
};
