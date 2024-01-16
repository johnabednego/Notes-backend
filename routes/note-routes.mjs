import { Router } from 'express';
import * as noteControllers from '../controllers/note-controllers.mjs';

const router = Router();

// Note routes
router
  .get('/',  noteControllers.getNotes)
  .get('/:noteId',  noteControllers.getNote)
  .post('/', noteControllers.createNote)
  .patch('/:noteId',  noteControllers.updateNote)
  .delete('/:noteId',  noteControllers.deleteNote)
  .patch('/:noteId/restore', noteControllers.restoreNote)
  .patch('/:noteId/trash',  noteControllers.trashNote)
  .patch('/:noteId/archive',noteControllers.archiveNote)
  .patch('/:noteId/unarchive',noteControllers.unarchiveNote)

export default router;
