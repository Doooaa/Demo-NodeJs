import catchAysnc from "./catchAysnc.js";
import appError from "./AppError.js";

export const deleteOneById = (Model) => catchAysnc(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new appError('No document found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

export const CreateOne = (Model) => catchAysnc(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: newDoc
        }
    });
})


export const FindOneById = (Model, populateOptions) => catchAysnc(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
        return next(new appError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { 
        data: doc   
        }
    });
});

export const FindAll = (Model,populateOptions) => catchAysnc(async (req, res, next) => {
    let query = Model.find();
    if (populateOptions) query = query.populate(populateOptions);
    const docs = await query;
    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
            data: docs
        }
    });
});


export const UpdateOneById = (Model) => catchAysnc(async (req, res, next) => {
    const model = await Model.findByIdAndUpdate(req.params.id, req.body,  {
        new: true,
        runValidators: true
    });
    if (!model) {
        return next(new appError('Model not found', 404));
    }
    res.status(200).json({
        status: 'success',
        message: "Model updated successfully",
        model
    });
});



export const getByReference = (model, entity) => catchAysnc(async (req, res, next) => {
    const object = {};
    //tour: req.params.tourId
    object[entity] = req.params[`${entity}Id`];
    const docs = await model.find(object);
    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
            data: docs
        }
    });
});