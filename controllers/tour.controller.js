import Tour from '../models/tour.model.js';
import catchAysncFunction from '../utils/catchAysnc.js';
import appError from '../utils/AppError.js';
import {CreateOne,FindAll,FindOneById , UpdateOneById,getByReference,deleteOneById} from "../utils/handlerFactory.js";
import multer from "multer";


const multerStorge = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/tours');
    }
    , filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `tour-${req.user.id}-${Date.now()}.${ext}`); // to save the photo with a unique name using the user id and the current timestamp to avoid overwriting existing photos
    }
});

const multerFilter = (req, file, cb) => {
  console.log(req.files)
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new appError('Not an image! Please upload only images.', 400), false);
    }
}

const upload=multer({
    storage: multerStorge,      
    fileFilter: multerFilter
})

export const uploadTourPhoto = upload.fields(
[
  {
  name: 'imageCover', maxCount: 1
}, 
{
  name: 'images', maxCount: 3
}
])


//after the multer 
// req.files = {
//   imageCover: [file],
//   images: [file, file, file]
// } 
export const resizeTourImages = (req, res, next) => {

  // 1️⃣ imageCover
  if (req.files.imageCover) {
    req.body.imageCover = req.files.imageCover[0].filename;
  }

  // 2️⃣ images
  if (req.files.images) {
    req.body.images = req.files.images.map(file => file.filename);
  }

  next();
};

// GET TOUR BY ID
export const getTourById = FindOneById(Tour,"guides","reviews");

// CREATE TOUR
export const createTour = CreateOne(Tour);

//update by id
// GET TOUR BY ID
export const updateTourById = UpdateOneById(Tour);

//delete by id
// GET TOUR BY ID
export const deleteTourById = deleteOneById(Tour);

// GET ALL TOURS

export const getAllTours = catchAysncFunction(async (req, res, next) => {

  // 1️⃣ Copy query object
  const queryObj = { ...req.query };

  // 2️⃣ Remove non-filter fields
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // 3️⃣ Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte)\b/g,
    match => `$${match}`
  );

  // 3 Execute query
  let query = Tour.find(JSON.parse(queryStr)); // 1️⃣ Filtering

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy); // 2️⃣ Sorting 
  }


  // 3️⃣ Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    // "name,price" → "name price"
    query = query.select(fields);
  } else {
    query = query.select('-__v'); // default: hide __v
  }

  const tours = await query; // 3️⃣ Execute query
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });

});


//url=/tours/tour-within/233/center/39.4634167209729,22.704318967349995/unit/mi
//url =/tours/tour-within/233/center/39.4634167209729,22.704318967349995/unit/km
export const getTourWithIn = catchAysncFunction(async (req, res, next) => {
  const {distances,latlng ,unit}=req.params;
  const[lat,lang]=latlng.split(',');
  const radius=unit==='mi' ? distances/3963.2 : distances/6378.1; // radius of the earth in miles and kilometers
  if(!lat || !lang){
    return next(new appError('Please provide lat and lang in the format lat,lang',400));
  }
  const tours=await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lang, lat], radius] } }
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
}
)



