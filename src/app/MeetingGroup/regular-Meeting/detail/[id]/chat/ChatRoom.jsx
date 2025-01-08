'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import ChatInput from './ChatInput';

const ChatRoom = ({ params }) => {
    // params에서 room ID 가져오기
    const roomId = params?.id; // 안전하게 접근

    if (!roomId) {
        return <div>Error: Room ID is undefined</div>; // 에러 처리
    }

    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [nickname, setNickname] = useState('');
    const [nicknameSet, setNicknameSet] = useState(false);

    useEffect(() => {
        if (!nicknameSet) return;

        const socket = new SockJS('http://localhost:8080/ws/chat');
        const client = Stomp.over(socket);

        client.connect(
            {},
            () => {
                console.log('Connected to WebSocket');
                setIsConnected(true);
                client.subscribe('/topic/messages', (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, receivedMessage]);
                });
            },
            (error) => {
                console.error('WebSocket connection error:', error);
                setIsConnected(false);
            }
        );

        setStompClient(client);

        return () => {
            if (client) client.disconnect();
        };
    }, [nicknameSet]);

    const handleSetNickname = () => {
        if (nickname.trim()) {
            setNicknameSet(true);
        }
    };

    const sendMessage = (content) => {
        if (isConnected && stompClient && roomId) {
            stompClient.send(
                '/app/message',
                {},
                JSON.stringify({
                    roomIdx: roomId, // roomId는 ChatRoom 컴포넌트에서 전달받는 props
                    sender: nickname,
                    content,
                    messageType: 'text', // 메시지 유형 (text, image, file 등)
                    fileUrl: null, // 파일이 없는 경우 null로 설정
                    timestamp: new Date().toISOString(), // ISO 8601 형식의 타임스탬프
                })
            );
            
        } else {
            console.error('STOMP client is not connected or roomId is invalid.');
        }
    };

    if (!nicknameSet) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                }}
            >
                <Typography variant="h5" sx={{ marginBottom: '20px' }}>
                    Enter your nickname to join the chat
                </Typography>
                <TextField
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your nickname"
                    sx={{ marginBottom: '20px', width: '300px' }}
                />
                <Button
                    variant="contained"
                    onClick={handleSetNickname}
                    sx={{ backgroundColor: '#007BFF', color: '#fff' }}
                >
                    Join Chat
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                maxWidth: '730px',
                margin: '0 auto',
                border: '1px solid #F5F4F6',
                borderRadius: '14px',
                backgroundColor: '#fff',
            }}
        >
            <Box sx={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: '#FAFAFA' }}>
                {messages.map((msg, index) => (
                    <Paper key={index} sx={{ padding: '10px', marginBottom: '10px' }}>
                        <Typography>
                            {msg.sender}: {msg.content}
                        </Typography>
                        <Typography variant="caption" color="gray">
                            {msg.timestamp}
                        </Typography>
                    </Paper>
                ))}
            </Box>
            <ChatInput onSend={sendMessage} />
        </Box>
    );
};

export default ChatRoom;
