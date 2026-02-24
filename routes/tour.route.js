import express from 'express'
import {
    createTour,getTourById,getAllTours,updateTourById,deleteTourById
} from './../controllers/tour.controller.js' 
import { protect ,restricTo} from '../controllers/auth.controller.js';

const Tourrouter=express.Router();



Tourrouter.route('/')
.get(protect, getAllTours)
.post(createTour)

Tourrouter.route('/:id')
.get(getTourById)
.patch(updateTourById)
.delete(protect,restricTo('admin'), deleteTourById)


export default Tourrouter;
