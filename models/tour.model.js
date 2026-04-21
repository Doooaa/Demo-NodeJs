import mongoose from "mongoose";
// import user from "./user.model.js";
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },

  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },

  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },

  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium, difficult'
    }
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: val => Math.round(val * 10) / 10 // 4.666 → 4.7
  },

  ratingsQuantity: {
    type: Number,
    default: 0
  },

  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },

  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price'
    }
  },

  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary']
  },

  description: {
    type: String,
    trim: true
  },

  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },

  images: {
    type: [String]
  },

  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  },

  startDates: {
    type: [Date]
  },
  locations:{
    type:[
      {
        type: { String,
        enum: ['Point'] 
         },
        coordinates: [Number],
        address: String,
        description: String
      }
    ],
    default:[]
  },
  // GeoJSON format for startLocation
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    address: String,
    description: String
  },
  guides:[
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'  // comes from mongoose.model('User', userSchema) in user.model.js
    }
  ],

},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);
 

 /*📍get reviews for a tour using virtual populate => we will use virtual populate because we don't want to store the reviews in the tour document because it will be a lot of reviews and it will make the tour document 
very big and it will also make the tour document very 
slow to query because we will have to populate the reviews every
 time we query the tour document and if we store the reviews in the tour
 document then we will have to update the tour document every time we create
 a new review and that will also make the tour document very slow to update because
 we will have to update the tour document every time we create a new review and that will also make the tour document very slow to delete because we will have to 
 delete the tour document every time we delete a review and that will also make the tour document very slow to query because we will have to populate the reviews every time we query the tour document */
 
tourSchema.virtual("reviews", {
  ref: 'Review', // review is the name of the model that we want to reference
  foreignField: 'tour', // tour is foreign field in review model
  localField: '_id' //tour id here is _id
}

)

tourSchema.index({ price: 1, ratingsAverage: -1 }); // to improve the performance of the queries that sort by price and ratingsAverage

const TourModel = mongoose.model('Tour', tourSchema);
export default TourModel;
