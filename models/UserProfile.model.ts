import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Interface for the document (TypeScript type)
export interface IUserProfile extends Document {
  userId: string;       // This is the Clerk User ID (e.g., "user_...")
  email: string;
  imageUrl?: string;
  role: 'DRIVER' | 'RTO';
  vehicleNumber?: string; // Specific to DRIVER
  rtoLocation: string;    // Used to match drivers to RTOs
}

// Mongoose Schema
const UserProfileSchema: Schema<IUserProfile> = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
  },
  role: {
    type: String,
    enum: ['DRIVER', 'RTO'],
    required: true,
  },
  vehicleNumber: {
    type: String,
  },
  rtoLocation: {
    type: String,
    required: true,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Check if the model already exists before defining it
const UserProfile: Model<IUserProfile> = models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

export default UserProfile;
