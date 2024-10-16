// src/controllers/conversationController.ts
import { v4 } from "uuid"
import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BufferMemory, BufferWindowMemory } from "langchain/memory";


dotenv.config();

const prisma = new PrismaClient();

// Define the interface for the route parameters
interface Params {
    id: string; // The id is expected to be a string
}

export const handleNewMessage = async (req: Request, res: Response) => {
    const { message, chatId, convId }: any = req.body;
    let newConversation;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const chat = new OpenAI({ temperature: 0, apiKey: "API+KEY" });

    // const initialPrompt = `
    //     Include important.
    //     Return the output as a JSON object with 'type', 'label', 'id', and 'name' for each field.
    //     Ensure that the options for the select field are in the format:
    //     {
    //         {
    //             "options": [
    //                 {{
    //                     "label": "Option Label",
    //                     "value": "option_value"
    //                 }}
    //             ]
    //         }}
    //         Ensure that the format of json comes in an Fields array like this:
    //         Ensure the form has a unique name in the form_name property
    //         {
    //             {
    //                 "form_name": "Contact Form"
    //             "fields": [
    //                 {{
    //                     "type": "text",
    //                     "label": "Company Name",
    //                     "id": "company_name",
    //                     "name": "company_name"
    //                 }}
    //                 ]
    //         }}
    //     `
    const fullPrompt = `
    you are an AI is an assistant to help brainstorm multiple ideas with the user 
    you respond in json format like this {{"conversation_type":"idea_request","ideas_category": "category name", "ideas" :["first idea", "second idea"]}}
    Generate as many ideas as possible
    Generate ideas related specifically to this topic
    When asked to save an idea or ideas return with this json schema {{"conversation_type":"save_request","ideas_category": "category name", "ideas" :["first idea", "second idea"]}}
    `
    const chatPrompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            fullPrompt,
        ],
        new MessagesPlaceholder("history"),
        ["human", "{input}"],
    ]);

    const chain = new ConversationChain({
        memory: new BufferWindowMemory({ k: 1, memoryKey: "history", returnMessages: true}),
        // memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
        prompt: chatPrompt,
        llm: chat,
    });

    const response = await chain.invoke({
        input: message,
    });
    console.log(response);
    return res.json({ reply: JSON.parse(response.response), conv: {} });


}
// Handle new message
export const handleNewMessageOld = async (req: Request, res: Response) => {
    const { message, chatId, convId }: any = req.body;
    let newConversation;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    let newConvId = convId;

    if (!convId) {
        // create conv id
        newConvId = v4()
        console.log("newConvId: ", newConvId)
    }

    // create new conversation item for each new messages sent by user
    const messagesString = JSON.stringify(message); // Convert array to string
    newConversation = await prisma.conversation.create({
        data: {
            messages: messagesString, // Store as a string
            convId: newConvId
        },
    });

    try {
        // Send the message to the Gemini AI API
        const response = await axios.post(
            process.env.GEMINI_ENDPOINT as string,
            {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": message
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    "key": process.env.GEMINI_API_KEY
                }
            }
        );

        const aiResponse = response.data;
        const finalResponse = aiResponse.candidates[0].content.parts[0].text

        // save new converstion respons from AI to DB
        const conversation = await prisma.conversation.create({
            data: { messages: finalResponse, convId: newConvId, isAI: true }
        });
        newConversation = conversation

        // Send the AI response back to the frontend
        return res.json({ reply: finalResponse, conv: newConversation });
    } catch (error) {
        console.error('Error communicating with Gemini AI:', error);
        return res.status(500).json({ error: 'Something went wrong with the AI request' });
    }
}


// Read all conversations
export const getConversations = async (req: Request, res: Response) => {
    const conversations = await prisma.conversation.findMany();
    res.json(conversations);
};

// Read all conversations with unique conv id
export const getUniqueConversations = async (req: Request, res: Response) => {
    const conversations = await prisma.conversation.findMany({
        distinct: ['convId'], // Ensure distinct convId
        where: {
            isAI: false
        },
        orderBy: {
            createdAt: 'asc' // Optional: Order by creation date if needed
        }
    });
    res.json(conversations);
};

// Read a single conversation by ID
export const getConversationsByConvId = async (req: Request, res: Response) => {
    const { id } = req.params;
    const conversation = await prisma.conversation.findMany({
        where: { convId: id },
    });
    res.json(conversation);
};

// Update a conversation by ID
export const updateConversation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { messages } = req.body; // Expecting messages to be an array
    const messagesString = JSON.stringify(messages); // Convert array to string
    const conversation = await prisma.conversation.update({
        where: { id },
        data: { messages: messagesString }, // Store as a string
    });
    res.json(conversation);
};

// Delete a conversation by ID
export const deleteConversation = async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.conversation.delete({
        where: { id },
    });
    res.status(204).send();
};
