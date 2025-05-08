import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, ChatPhoto } from './AdminChatService';

interface MessageListener {
    (message: any): void;
}

class AdminWebSocketService {
    private client: Client | null = null;
    private messageListeners: Map<string, MessageListener[]> = new Map();
    private salonId: string | null = null;

    // 웹소켓 연결 초기화
    initialize(salonId: string) {
        this.salonId = salonId;

        if (this.client && this.client.connected) {
            this.disconnect();
        }

        this.client = new Client({
            brokerURL: undefined,
            webSocketFactory: () => new SockJS('/ws'),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            // 메시지 구독
            this.client?.subscribe(`/user/${this.salonId}/queue/messages`, (message) => {
                const messageData = JSON.parse(message.body);
                this.notifyListeners('message', messageData);
            });

            // 메시지 읽음 이벤트 구독 추가
            this.client?.subscribe(`/user/${this.salonId}/queue/message-read`, (message) => {
                const roomId = JSON.parse(message.body);
                this.notifyListeners('message-read', roomId);
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
    }

    sendMessage(chatRoomId: number, content: string, senderType: string) {
        this.sendMessageWithPhotos(chatRoomId, content, senderType, []);
    }

    sendMessageWithPhotos(
        chatRoomId: number,
        message: string,
        senderType: string,
        photos: ChatPhoto[] = []
    ) {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket is not connected');
            return;
        }

        const messagePayload = {
            chatRoomId,
            message,
            senderType,
            senderId: this.salonId,
            photos
        };

        this.client.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(messagePayload)
        });
    }

    // 메시지 읽음 이벤트 발생 메서드 추가
    emitMessageRead(roomId: number) {
        if (!this.client || !this.client.connected) {
            console.error('WebSocket is not connected');
            return;
        }

        this.client.publish({
            destination: `/app/chat/message-read/${roomId}`,
            body: JSON.stringify({ roomId })
        });
    }

    addListener(event: string, callback: MessageListener) {
        if (!this.messageListeners.has(event)) {
            this.messageListeners.set(event, []);
        }
        this.messageListeners.get(event)?.push(callback);
    }

    removeListener(event: string, callback: MessageListener) {
        const listeners = this.messageListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    private notifyListeners(event: string, data: any) {
        const listeners = this.messageListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }
}

export default new AdminWebSocketService();