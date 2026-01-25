import Tour from '../models/tour.model.js';
import catchAysncFunction from '../utils/catchAysnc.js';
// // GET ALL TOURS
// export const getAllTours = async (req, res) => {
//   try {

//     const tours = await Tour.find();
//     res.status(200).json({
//       status: 'Success',
//       results: tours.length,
//       data: tours
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: "Fail",
//       message: error
//     })
//   }
// };



// GET TOUR BY ID
export const getTourById = catchAysncFunction(async (req, res, next) => {

  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return errorControllerHandeler('Tour not found', 404);
  }

  res.status(200).json({
    status: 'Success',
    data: tour
  });

});

// CREATE TOUR
export const createTour = catchAysncFunction(async (req, res, next) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'Success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err.message
    });
  }
});


//update by id
// GET TOUR BY ID
export const updateTourById = catchAysncFunction(async (req, res, next) => {

  console.log('BODY🔰🔰🔰:', req.body);

  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!tour) {
    return errorControllerHandeler('Tour not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});
//delete by id
// GET TOUR BY ID
export const deleteTourById = catchAysncFunction(async (req, res, next) => {

  const tour = await Tour.findByIdAndDelete(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!tour) {
    return errorControllerHandeler('Tour not found', 404);
    // return res.status(404).json({
    //   status: 'fail',
    //   message: 'Tour not found'
    // });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });


});

export const getAllTours = async (req, res, next) => {

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
    debugger;
    debugger; const fields = req.query.fields.split(',').join(' ');
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

};




