import Subscription from '../models/subscription.model.js'
import { workflowClient } from '../config/upstash.js'
import { SERVER_URL } from '../config/env.js'
import dayjs from "dayjs";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 0,
    })

    res.status(201).json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
}

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if(req.user.id !== req.params.id) {
      const error = new Error('You are not the owner of this account');
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
}


export const getUserAllSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if(req.user.id !== req.params.id) {
      const error = new Error('You are not the owner of this account');
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.user.id });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
}

export const getUserSubscriptionsDetails = async (req, res, next) => {
  try {
    // Fetch all subscriptions for the logged-in user and populate user details
    const subscriptions = await Subscription.find({ user: req.user.id })
      .populate("user", "name email") // only return name + email of user
      .lean(); // return plain JS objects instead of Mongoose docs

    res.status(200).json({ 
      success: true, 
      count: subscriptions.length,
      data: subscriptions 
    });
  } catch (e) {
    next(e);
  }
};

export const deleteUserSubscription = async (req, res, next) => {
  try {
    const { id } = req.params; // subscription ID from URL

    // Find subscription by ID and make sure it belongs to the logged-in user
    const subscription = await Subscription.findOne({ _id: id, user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or not authorized",
      });
    }

    // Delete the subscription
    await Subscription.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

export const cancelUserSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({ _id: id, user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or not authorized",
      });
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (e) {
    next(e);
  }
};

export const updateUserSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the subscription belonging to the logged-in user
    let subscription = await Subscription.findOne({ _id: id, user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or not authorized",
      });
    }

    // Update only provided fields
    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      subscription[key] = updates[key];
    });

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription,
    });
  } catch (e) {
    next(e);
  }
};


export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id });

    const upcoming = subscriptions.filter((sub) => {
      if (!sub.startDate || !sub.frequency) return false;

      let nextRenewal;

      switch (sub.frequency) {
        case "daily":
          nextRenewal = dayjs(sub.startDate).add(1, "day");
          break;
        case "weekly":
          nextRenewal = dayjs(sub.startDate).add(1, "week");
          break;
        case "monthly":
          nextRenewal = dayjs(sub.startDate).add(1, "month");
          break;
        case "yearly":
          nextRenewal = dayjs(sub.startDate).add(1, "year");
          break;
        default:
          return false;
      }

      const today = dayjs();
      return nextRenewal.isAfter(today) && nextRenewal.isBefore(today.add(7, "day"));
    });

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming,
    });
  } catch (e) {
    next(e);
  }
};
