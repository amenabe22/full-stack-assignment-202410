"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/conversationRoutes.ts
const express_1 = __importDefault(require("express"));
const conversationController_1 = require("./conversationController");
// Initialize  express router and register all important API routes for the application
const router = express_1.default.Router();
// @ts-ignore
router.post('/chat', conversationController_1.handleNewMessage);
router.get('/', conversationController_1.getConversations);
router.get('/unique', conversationController_1.getUniqueConversations);
// @ts-ignore
router.get('/:id', conversationController_1.getConversationsByConvId);
router.put('/:id', conversationController_1.updateConversation);
router.delete('/:id', conversationController_1.deleteConversation);
exports.default = router;
