"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConversation = exports.updateConversation = exports.getConversationsByConvId = exports.getUniqueConversations = exports.getConversations = exports.handleNewMessage = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
// Handle new message
const handleNewMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, chatId, convId } = req.body;
    let newConversation;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    let newConvId = convId;
    if (!convId) {
        // create conv id
        newConvId = (0, uuid_1.v4)();
        console.log("newConvId: ", newConvId);
    }
    // create new conversation item for each new messages sent by user
    const messagesString = JSON.stringify(message); // Convert array to string
    newConversation = yield prisma.conversation.create({
        data: {
            messages: messagesString, // Store as a string
            convId: newConvId
        },
    });
    try {
        // Send the message to the Gemini AI API
        const response = yield axios_1.default.post(process.env.GEMINI_ENDPOINT, {
            "contents": [
                {
                    "parts": [
                        {
                            "text": message
                        }
                    ]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                "key": process.env.GEMINI_API_KEY
            }
        });
        const aiResponse = response.data;
        const finalResponse = aiResponse.candidates[0].content.parts[0].text;
        // save new converstion respons from AI to DB
        const conversation = yield prisma.conversation.create({
            data: { messages: finalResponse, convId: newConvId, isAI: true }
        });
        newConversation = conversation;
        // Send the AI response back to the frontend
        return res.json({ reply: finalResponse, conv: newConversation });
    }
    catch (error) {
        console.error('Error communicating with Gemini AI:', error);
        return res.status(500).json({ error: 'Something went wrong with the AI request' });
    }
});
exports.handleNewMessage = handleNewMessage;
// Read all conversations
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield prisma.conversation.findMany();
    res.json(conversations);
});
exports.getConversations = getConversations;
// Read all conversations with unique conv id
const getUniqueConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield prisma.conversation.findMany({
        distinct: ['convId'], // Ensure distinct convId
        where: {
            isAI: false
        },
        orderBy: {
            createdAt: 'asc' // Optional: Order by creation date if needed
        }
    });
    res.json(conversations);
});
exports.getUniqueConversations = getUniqueConversations;
// Read a single conversation by ID
const getConversationsByConvId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const conversation = yield prisma.conversation.findMany({
        where: { convId: id },
    });
    res.json(conversation);
});
exports.getConversationsByConvId = getConversationsByConvId;
// Update a conversation by ID
const updateConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { messages } = req.body; // Expecting messages to be an array
    const messagesString = JSON.stringify(messages); // Convert array to string
    const conversation = yield prisma.conversation.update({
        where: { id },
        data: { messages: messagesString }, // Store as a string
    });
    res.json(conversation);
});
exports.updateConversation = updateConversation;
// Delete a conversation by ID
const deleteConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield prisma.conversation.delete({
        where: { id },
    });
    res.status(204).send();
});
exports.deleteConversation = deleteConversation;
