import mongoose, { Schema, Document } from 'mongoose';
import { ISession } from "../../types";

export interface ISessionDocument extends ISession, Document { }

const sessionSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
});

//add an index to automatically delete expired sessions
sessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);
