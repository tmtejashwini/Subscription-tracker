import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js'
import {
  createSubscription,
  getUserSubscriptions,
  getUserAllSubscriptions,
  getUserSubscriptionsDetails,
  deleteUserSubscription,
  cancelUserSubscription,
  updateUserSubscription,
  getUpcomingRenewals
} from '../controllers/subscription.controller.js'

const subscriptionRouter = Router();

subscriptionRouter.get('/', authorize,getUserAllSubscriptions);

subscriptionRouter.get('/:id', authorize,getUserSubscriptionsDetails);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', authorize,updateUserSubscription);

subscriptionRouter.delete('/:id',authorize, deleteUserSubscription);

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.put('/:id/cancel', authorize,cancelUserSubscription);

subscriptionRouter.get('/upcoming-renewals', authorize,getUpcomingRenewals);

export default subscriptionRouter;