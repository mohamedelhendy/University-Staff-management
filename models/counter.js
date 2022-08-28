var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CounterSchema = new Schema(
  {
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
  }
);

CounterSchema.index({ _id: 1, seq: 1 }, { unique: true })

const counter = mongoose.model('counter', CounterSchema);

const autoIncrementID = function (model_name, doc, next) {
  counter.findByIdAndUpdate(        // ** Method call begins **
    model_name,                           // The ID to find for in counters model
    { $inc: { seq: 1 } },                // The update
    { new: true, upsert: true },         // The options
    function(error, counter) {           // The callback
      if(error) return next(error);

      doc.staff_id = model_name + '-' + counter.seq;
      next();
    }
  );                                     // ** Method call ends **
}

module.exports = autoIncrementID;
