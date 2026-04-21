import mongoose from "mongoose";
import reviewModel from "../models/reviews.model.js";
import catchAysncFunction from "../utils/catchAysnc.js";
import appError from "../utils/AppError.js";
import { CreateOne, FindAll, FindOneById, UpdateOneById, getByReference, deleteOneById } from "../utils/handlerFactory.js";
export const createReview = catchAysncFunction(async (req, res, next) => {

    if (!req.body || !req.body.review || !req.body.rating) {
        return next(new appError('Review and rating are required', 400));
    }

    if (!req.params.tourId) {
        return next(new appError('Tour id is required', 400));
    }

    if (!req.user) {
        return next(new appError('User must be logged in', 401));
    }
    req.body.tour = req.params.tourId;
    req.body.user = req.user.id;

    return CreateOne(reviewModel)(req, res, next);

})


export const getAllReviews = FindAll(reviewModel, 'tour', 'user');

export const getReviewForTour = getByReference(reviewModel,'tour');

export const getReviewForUser = getByReference(reviewModel,'user');


export const getReviewById = FindOneById(reviewModel, 'tour', 'user');


export const deleteReviewById = deleteOneById(reviewModel);

export const updateReviewById = UpdateOneById(reviewModel);