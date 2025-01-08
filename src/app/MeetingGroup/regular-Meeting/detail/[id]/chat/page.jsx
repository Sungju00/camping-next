import ChatRoom from './ChatRoom';

export default function ChatPage({ params }) {
    const { id } = params || {}; // params가 undefined인 경우 처리

    if (!id) {
        return <h1>Error: Room ID is undefined</h1>;
    }

    return (
        <div>
            <h1>Chat Room for ID: {id}</h1>
            <ChatRoom roomId={id} />
        </div>
    );
}
