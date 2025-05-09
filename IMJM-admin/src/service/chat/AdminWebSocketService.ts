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

    // AdminWebSocketService.ts에 추가
    isConnected(): boolean {
        return this.client !== null && this.client.connected;
    }

// initialize 메소드를 수정하여 Promise를 반환하도록 변경
    initialize(salonId: string): Promise<void> {
        return new Promise((resolve, reject) => {
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

                // 연결 성공 시 Promise 해결
                resolve();
            };

            this.client.onStompError = (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                // 에러 시 Promise 거부
                reject(new Error(`WebSocket error: ${frame.headers['message']}`));
            };

            // 연결 시간 초과 처리
            const timeoutId = setTimeout(() => {
                reject(new Error('WebSocket connection timeout'));
            }, 10000);

            this.client.onWebSocketClose = (event) => {
                clearTimeout(timeoutId);
                console.error('WebSocket closed:', event);
                reject(new Error('WebSocket closed'));
            };

            try {
                this.client.activate();
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
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