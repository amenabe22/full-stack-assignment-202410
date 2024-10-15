// src/routes/conversationRoutes.ts
import express from 'express';
import {
    // createConversation,
    getConversations,
    getUniqueConversations,
    getConversationsByConvId,
    updateConversation,
    deleteConversation,
    handleNewMessage,
} from './conversationController';

// Initialize  express router and register all important API routes for the application
const router = express.Router();

// @ts-ignore
router.post('/chat', handleNewMessage)
router.get('/', getConversations);
router.get('/unique', getUniqueConversations)
// @ts-ignore
router.get('/:id', getConversationsByConvId);
router.put('/:id', updateConversation);
router.delete('/:id', deleteConversation);

export default router;
