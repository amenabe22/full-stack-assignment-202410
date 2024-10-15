'use client'

import { useState } from 'react'

interface SendFormProps {
    onSendMessage: (message: string) => void;
}

export default function SendForm({ onSendMessage }: SendFormProps) {
    const [message, setMessage] = useState('');

    // call parent onSendMessage method when form is submitted 
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage(''); // Clear the input after sending
        }
    };

    // Message Send form
    return (
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                <img
                    alt=""
                    src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="inline-block h-10 w-10 rounded-full"
                />
            </div>
            <div className="min-w-0 flex-1">
                <form action="#" onSubmit={handleSubmit}>  {/* call handleSubmit to trigger submission of user message */}
                    <div className="border border-[#d87708] bg-amber-50 p-2 rounded-xl">
                        <label htmlFor="comment" className="sr-only">
                            Write your brainstorm ideas to start chatting with brain storm bot
                        </label>
                        <div className='flex'>

                            <input
                                id="comment"
                                name="comment"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Add your idea brainstorm..."
                                className="block w-full h-9 rounded-xl resize-none outline-none bg-amber-50 text-gray-900 placeholder:text-gray-400  sm:text-sm sm:leading-6"
                            />
                            <div className="flex-shrink-0">
                                <button
                                    type="submit"
                                    className="inline-flex items-center rounded-full bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                                >
                                    Send
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    )
}
