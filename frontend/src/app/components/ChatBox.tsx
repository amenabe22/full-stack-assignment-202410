"use client"

import { v4 as uuidv4 } from 'uuid';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import axios from 'axios';
import SendForm from './SendForm';
import { useRouter, useSearchParams } from 'next/navigation';

interface ChatMessage {
    message: string
    chatId: string
    convId?: string | null,
    isAI: boolean
}

interface ChatBoxParams {
    onIdeasSaved: () => void; // Assuming it's a function that gets an array of saved ideas
}
// eslint-disable-next-line react/display-name
export const ChatBox = forwardRef(({ onIdeasSaved }: ChatBoxParams, ref) => {
    // const ChatBox = (ref) => {
    const router = useRouter();
    const searchParams = useSearchParams()
    const [convId, setConvId] = useState<string | null>(null)
    const [chat, setChat] = useState<ChatMessage[]>([]);

    const chatBoxRef = useRef<HTMLDivElement>(null); // Reference to the chat container
    // Function to format the AI response
    const formatResponse = (response: string) => {
        return response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Replace **text** with <strong>text</strong>
            .replace(/\n/g, '<br />'); // Replace new lines with <br />
    };


    // expose method to parent component to set conversation from url param
    useImperativeHandle(ref, () => ({
        setConversationFromParam: (convId: string) => {
            // check if conv id param is set or not
            setConvId(convId)
            router.replace('?convId=' + convId)
        }
    }))

    const handleSendMessage = async (message: string) => {
        // Add the user's message to the chat
        let memId = searchParams.get('memId')
        if (!memId) {
            memId = uuidv4();
            router.replace('?memId=' + memId)
        }

        const messageObj = { message: `${message}`, chatId: memId, convId: convId, isAI: false, memoryId: memId }
        setChat([...chat, messageObj]);

        // Make an API call to interact with the chatbot
        try {
            const res = await axios.post('http://127.0.0.1:5545/api/conversations/chat', { message: `${message}`, chatId: "newUuid", convId: convId, isAI: false, mem_id: memId });
            const responseData = res.data
            const botReply = responseData.reply;

            const botIdeas = botReply.ideas.join("\n")
            if (botReply.conversation_type == "save_request") {
                alert("Saved Ideas")
                onIdeasSaved()
            }
            setChat((prevChat) => [...prevChat, { message: `${botIdeas}`, chatId: "serverMessageId", isAI: true }]);

        } catch (error) {
            console.error('Error talking to the chatbot:', error);
        }
    };


    // reset message bod and clear current message when called
    const handleReset = () => {
        router.replace('/')
        setConvId(null)
        setChat([]);
    };
    useEffect(() => {
        handleReset()
    }, [])
    return (<div className='md:p-5'>
        <h1 className='text-xl text-red-700 font-semibold'>🤖 Brainstorm with a Chatbot</h1>

        <div style={{ marginBottom: '20px' }} className='pt-5'>
            <div className='flex md:flex-row flex-col justify-between pt-1 pb-5'>

                <h3 className='pb-3'>Chat History</h3>
                <div className='flex items-center gap-3'
                >
                    <button className='bg-amber-100 px-2 py-1 border-[#d87708] border rounded-3xl' onClick={handleReset}>Reset Conversation</button>

                </div>
            </div>
            <div className='border-[#d87708] border rounded-xl' style={{ height: '600px', overflowY: 'scroll', padding: '10px' }} ref={chatBoxRef}
            >
                {/* render chat messagea from the loaded history */}
                {chat.map(({ message, chatId, isAI }, index) => (
                    <div id={chatId}
                        key={index}
                        className={`mb-2 p-3 rounded-lg max-w-md ${isAI
                            ? 'text-gray-800 self-start'
                            : 'bg-red-50 text-gray-800 self-end'
                            }`}
                    >
                        {/* TODO: dangerouslySetInnerHTML will be cleaned before it's passed to frontend so won't cause any security issue */}
                        <div
                            className="message"
                            dangerouslySetInnerHTML={{ __html: formatResponse(message) }}
                        />
                    </div>
                ))}
            </div>
        </div>
        <SendForm onSendMessage={handleSendMessage} />
    </div>
    );
});

export default ChatBox;
