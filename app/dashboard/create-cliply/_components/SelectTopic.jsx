"use client"
import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function SelectTopic({onUserSelect}) {
    const [selectedPrompt, setSelectedPrompt] = useState('');

    const samplePrompts = [
        {
            category: "Travel",
            prompts: [
                "Top 5 hidden gems to visit in Paris",
                "Must-try street foods in Tokyo",
            ]
        },
        {
            category: "Lifestyle",
            prompts: [
                "5 morning habits of successful people",
                "Easy meal prep ideas for busy professionals",
            ]
        },
        {
            category: "Tech Tips",
            prompts: [
                "Hidden iPhone features you didn't know about",
                "Must-have productivity apps in 2024",
            ]
        },
        {
            category: "Educational",
            prompts: [
                "Interesting facts about space exploration",
                "Understanding basic economics in 60 seconds",
            ]
        }
    ];

    const handlePromptSelect = (prompt) => {
        setSelectedPrompt(prompt);
        onUserSelect('topic', prompt);
    };

    return (
        <div className="space-y-6">
            {/* <p className='text-white'>What is the topic of your video?</p> */}
            
            {/* Custom Prompt Input */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400">Custom Prompt</h3>
                <Textarea 
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    value={selectedPrompt}
                    onChange={(e) => {
                        setSelectedPrompt(e.target.value);
                        onUserSelect('topic', e.target.value);
                    }}
                    placeholder="Top 5 places to visit in Colorado Denver during winters"
                    rows={3}
                />
            </div>

            {/* Sample Prompts Section */}
            <div className="space-y-4">
                {samplePrompts.map((category, index) => (
                    <div key={index} className="space-y-2">
                        <h3 className="text-sm font-medium text-white">{category.category}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {category.prompts.map((prompt, promptIndex) => (
                                <Button
                                    key={promptIndex}
                                    variant="outline"
                                    className={`p-2 text-sm text-left h-auto whitespace-normal
                                        ${selectedPrompt === prompt 
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                                            : 'border-gray-700 hover:border-gray-600 text-white'
                                        }`}
                                    onClick={() => handlePromptSelect(prompt)}
                                >
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default SelectTopic