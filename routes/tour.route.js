import express from 'express'
import {
    createTour,getTourById,getAllTours,updateTourById,deleteTourById,getTourWithIn,uploadTourPhoto,resizeTourImages
} from './../controllers/tour.controller.js' 
import { protect ,restricTo} from '../controllers/auth.controller.js';
import reviewRouter from './review.route.js';
const Tourrouter=express.Router();



Tourrouter.route('/')
.get(protect, getAllTours)
.post(protect,restricTo('admin','lead-guide'),uploadTourPhoto,resizeTourImages,createTour)

Tourrouter.route('/tour-within/:distances/center/:latlng/unit/:unit').get(getTourWithIn) // to get all tours within a certain distance from a certain point

Tourrouter.route('/:id')
.get(getTourById)
.patch(protect,restricTo('admin','lead-guide'),updateTourById)
.delete(protect,restricTo('admin','lead-guide'), deleteTourById)

// nested route for reviews of a tour
Tourrouter.use('/:tourId/reviews', reviewRouter)



export default Tourrouter;
