'use client';
import { useState } from 'react';

export default function ChatInput({ onSend }) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ddd' }}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your message"
                style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '10px',
                    marginRight: '10px',
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
                onClick={handleSend}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                }}
            >
                Send
            </button>
        </div>
    );
}
