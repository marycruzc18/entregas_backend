import { Router } from 'express';
import { generateUser } from '../utils.js';

const expressRouter = Router();

expressRouter.get('/mockingproducts', async (req, res) => {
  let users = [];
  for (let i = 0; i <= 100; i++) {
    users.push(generateUser());
  }

  res.send({ status: 'success', payload: users });
});

export default expressRouter;


