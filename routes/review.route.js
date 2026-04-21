import express from "express";
import { createReview, getAllReviews, getReviewById, updateReviewById, deleteReviewById,getReviewForTour,getReviewForUser } from "../controllers/review.controller.js";
import { protect, restricTo } from "../controllers/auth.controller.js";


const reviewRouter = express.Router({ mergeParams: true }) // to merge the params from the parent router (tourId) with the params from the child router (reviewId)



reviewRouter.route("/")
.get(protect,getReviewForTour) // to get all reviews for a specific tour
.post(protect, restricTo('user'), createReview);


reviewRouter.route('/:id')
    .get(getReviewById)
    .patch(protect, restricTo('user'), updateReviewById)
    .delete(protect,restricTo('user'), deleteReviewById);


export default reviewRouter;