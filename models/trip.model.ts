import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Interface for the document (TypeScript type)
export interface ITrip extends Document {
  driverId: Schema.Types.ObjectId; // Reference to our UserProfile model
  rtoLocation: string; // The RTO location this request is for
  startLocation: string;
  endLocation: string;
  criticalLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  createdAt: Date;
}

// Mongoose Schema
const TripSchema: Schema<ITrip> = new Schema({
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'UserProfile', // This creates a link to the UserProfile model
    required: true,
  },
  rtoLocation: {
    type: String,
    required: true,
  },
  startLocation: {
    type: String,
    required: true,
  },
  endLocation: {
    type: String,
    required: true,
  },
  criticalLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed'],
    default: 'pending',
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Check if the model already exists before defining it
const Trip: Model<ITrip> = models.Trip || mongoose.model<ITrip>('Trip', TripSchema);

export default Trip