import { Schema, model } from 'mongoose';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensure uniqueness of the title
    },
    textContent: {
      type: String,
      required: true,
      trim: true,
    },
    colorHex: {
      type: String,
      trim: true,
      default: '#ffffff',
      validate: {
        validator: value => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value),
        message: 'Invalid color hex format',
      },
    },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Number, default: null },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Number, default: null },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const NoteModel = model('NoteModel', noteSchema, 'notes');

export default NoteModel;
