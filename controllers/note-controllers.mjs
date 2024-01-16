import mongoose from "mongoose";
import NoteModel from "../models/note-model.mjs";
import { httpError } from "../utils.mjs";

const { ObjectId } = mongoose.Types;

async function cleanupNote(noteId, session) {
  const note = await NoteModel.findById(new ObjectId(noteId)).session(session);

  // Check if the note is found
  if (!note) throw httpError(422, "note_not_found", "Note does not exist");

  // Delete the note from db
  await NoteModel.findByIdAndDelete(new ObjectId(noteId)).session(session);
}

export async function getNotes(req, res, next) {
  try {
    // Get all notes from db
    const notes = await NoteModel.find({}).sort("-createdAt");

    // Respond with notes
    res.json({ notes });
  } catch (err) {
    return next(httpError(500, "internal_error", "", err));
  }
}

export async function getNote(req, res, next) {
  try {
    const { noteId } = req.params;

    // get the note from db
    const note = await NoteModel.findById({
      _id: new ObjectId(noteId),
    });

    // check if the note exists
    if (!note) {
      return next(httpError(422, "note_not_found", "Note does not exist"));
    }

    // send a response
    res.json({ note });
  } catch (err) {
    return next(httpError(500, "internal_error", "", err));
  }
}

export async function createNote(req, res, next) {
  try {
    const { title, textContent, colorHex, tags } = req.body;

    // Create document in db
    const note = new NoteModel({
      title,
      textContent,
      colorHex,
      tags,
    });
    await note.save();

    // Send a response
    res.json({ note });
  } catch (err) {
    return next(httpError(500, "internal_error", "", err));
  }
}

export async function updateNote(req, res, next) {
  try {
    const { title, textContent, colorHex, tags } = req.body;
    const { noteId } = req.params;

    // Find and update the note in db
    const note = await NoteModel.findById(new ObjectId(noteId));

    // Check if there was a note to update
    if (!note)
      return next(httpError(422, "note_not_found", "Note does not exist"));

    // Update the note
    if (title || title === "") note.title = title;
    if (textContent) note.textContent = textContent;
    if (colorHex) note.colorHex = colorHex;
    if (tags) note.tags = tags;

    await note.save();

    // Send a response
    res.json({ note });
  } catch (err) {
    return next(httpError(500, "internal_error", "", err));
  }
}

export async function deleteNote(req, res, next) {
  try {
    const { noteId } = req.params;

    // Delete the note
    await cleanupNote(noteId);

    // Send a response
    res.status(204).send();
  } catch (err) {
    // Check if custom errors were thrown in try block, pass it to Express error handler
    if (err.statusCode && err.statusCode !== 500) return next(err);
    // Otherwise return internal_error, it's not an expected error
    return next(httpError(500, "internal_error", "", err));
  }
}

export async function trashNote(req, res, next) {
  try {
    const { noteId } = req.params;

    // Find and update the note to be trashed
    const note = await NoteModel.findByIdAndUpdate(
      new ObjectId(noteId),
      {
        isTrashed: true,
        trashedAt: Date.now(),
      },
      { new: true }
    );

    if (!note)
      return next(httpError(422, "note_not_found", "Note does not exist"));

    res.json({ note });
  } catch (err) {
    return next(httpError(500, "internal_error", "", err));
  }
}

export async function restoreNote(req, res, next) {
  try {
    const { noteId } = req.params;

    // Find and update the note to restore it
    const note = await NoteModel.findByIdAndUpdate(
      new ObjectId(noteId),
      {
        isTrashed: false,
        trashedAt: null,
      },
      { new: true }
    );

    if (!note)
      return next(httpError(422, "note_not_found", "Note does not exist"));

    res.json({ note });
  } catch (err) {
    return next(httpError(500, "internal_error", "", err));
  }
}

export async function emptyTrash(req, res, next) {
  try {
    await mongoose.connection.transaction(async session => {

      // query for trashed notes
      const queryTrashed = {
        isTrashed: true,
      };

      // cleanup
      const notesToCleanUp = await NoteModel.find(queryTrashed).session(session);
      for (const { id: noteId } of notesToCleanUp) await cleanupNote(noteId, session);

      // send a response
      res.status(204).send();
    });
  } catch (err) {
    // check if custom errors was thrown in try block, pass it to Express error handler
    if (err.statusCode && err.statusCode !== 500) return next(err);
    // otherwise return internal_error, it's not an expected error
    return next(httpError(500, 'internal_error', '', err));
  }
}
