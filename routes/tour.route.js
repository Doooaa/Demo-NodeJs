import express from 'express'
import {
    createTour,getTourById,getAllTours,updateTourById,deleteTourById
} from './../controllers/tour.controller.js' 


const Tourrouter=express.Router();



Tourrouter.route('/')
.get(getAllTours)
.post(createTour)

Tourrouter.route('/:id')
.get(getTourById)
.patch(updateTourById)
.delete(deleteTourById)


export default Tourrouter;
