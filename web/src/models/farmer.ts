import { Schema, model, models, type Document, type Model } from "mongoose";

export interface FarmerDocument extends Document {
  fullName: string;
  cpf: string;
  birthDate?: Date;
  phone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema<FarmerDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
    birthDate: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export type FarmerModel = Model<FarmerDocument>;

export const Farmer: FarmerModel =
  models.Farmer ?? model<FarmerDocument>("Farmer", FarmerSchema);
