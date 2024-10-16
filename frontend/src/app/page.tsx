'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import ChatBox from './components/ChatBox'
import axios from 'axios'

function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface Idea {
  name: string,
  id: number
}

export default function Home() {
  const [ideas, setIdeas] = useState<Array<Idea>>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  const loadIdeas = async () => {
    // Add the user's message to the chat
    // Make an API call to interact with the chatbot
    try {
      const { data } = await axios.get('http://127.0.0.1:5545/api/conversations/ideas');
      setIdeas(data.map((e: Idea) => { return { ...e, selected: false } }))
    } catch (error) {
      console.error('Error talking to the chatbot:', error);
    }
  };


  useEffect(() => {
    loadIdeas()
  }, [])

  return (
    <>
      <div>
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                <div className="flex h-16 shrink-0 items-center">
                  <p>Brainstorm Bot</p>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <div className="text-md font-semibold leading-6 text-gray-800">Saved Ideas</div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {ideas.map((idea) => (
                          <li key={idea.id}>
                            <button
                              className={classNames(
                                'bg-red-50 text-red-600 group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full',
                              )}
                            >
                              <span className="truncate">{idea.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col overflow-y-auto border-r border-gray-200  bg-red-100 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <p className='text-amber-700 font-bold text-xl'>Brainstorm Bot</p>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <div className="text-md font-semibold leading-6 text-gray-800">Saved Ideas</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {ideas.map((idea) => (
                      <li key={idea.id}>
                        <button
                          className={classNames(
                            'bg-red-50 text-red-600 group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full',
                          )}
                        >
                          <span>{idea.name}</span>
                        </button>
                      </li>
                    ))}

                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-amber-900">Brainstorm Bot</div>
          <a href="#">
            <span className="sr-only">Your profile</span>
            <img
              alt=""
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="h-8 w-8 rounded-full bg-red-50"
            />
          </a>
        </div>

        <main className="py-5 md:py-10 lg:pl-72 bg-amber-50 h-screen">
          <div className="px-4 sm:px-6 lg:px-8">
            <Suspense>
              <ChatBox onIdeasSaved={() => loadIdeas()} ref={ref} />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  )
}
