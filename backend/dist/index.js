"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const conversationRoutes_1 = __importDefault(require("./controllers/conversationRoutes"));
// basic express setup
const app = (0, express_1.default)();
const PORT = 5000;
app.use(express_1.default.json());
// added cors to allow Cross Site Requests from frontend app
app.use((0, cors_1.default)());
// Route to handle AI brainstorming requests
app.use('/api/conversations', conversationRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
