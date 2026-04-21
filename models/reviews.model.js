
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty'],

    }
    ,
    rating: {
        type: Number,
        min: 1,
        max: 5,
    }
    ,
    createdAt: {
        type: Date,
        default: Date.now(),
    }
    ,
    // parent referencing to the tour and user models to create a relationship between the review and the tour and user models
    tour: {
        type: 
        mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
    }
    ,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, 'Review must belong to a user'],
    },

},
//
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        {
            $group: {   
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }  

            }
        }
    ]);
    if (stats.length > 0) { // if there are reviews for the tour
        await mongoose.model('Tour').findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await mongoose.model('Tour').findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.post('save', function () {// when use save() or create method the post middleware will be executed and we will calculate the average ratings for the tour after saving the review
    this.constructor.calcAverageRatings(this.tour);
});
 
reviewSchema.pre(/^findOneAnd/, async function () {
    this.review = await this.findOne().clone();//clone for mongoose 6 and above to avoid the error "Query was already executed: findOne()" be
   
});

reviewSchema.post(/^findOneAnd/, async function () { // when use findByIdAndUpdate or findByIdAndDelete method the post middleware will be executed and we will calculate the average ratings for the tour after updating or deleting the review
    if (this.review) {
        await this.review.constructor.calcAverageRatings(this.review.tour);
    }
});
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // to prevent the same user from writing multiple reviews for the same tour

const reviewModel = mongoose.model('Review', reviewSchema);
export default reviewModel;


/*
this             = the QUERY (not the document!)
this.review      = the document we saved in pre
this.review.constructor = the Model (Review Model)
*/