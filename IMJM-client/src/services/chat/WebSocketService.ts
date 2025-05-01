import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatPhoto } from './ChatService';

interface MessageListener {
    (message: any): void;
}

class WebSocketService {
    private client: Client | null = null;
    private messageListeners: Map<string, MessageListener[]> = new Map();
    private userId: string | null = null;

    // 웹소켓 연결 초기화
    initialize(userId: string) {
        console.log("WebSocketService 초기화:", userId);
        this.userId = userId;

        // 이미 연결되어 있으면 기존 연결 해제
        if (this.client && this.client.connected) {
            this.disconnect();
        }

        // 새로운 STOMP 클라이언트 생성
        this.client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // 연결 성공 핸들러
        this.client.onConnect = (frame) => {
            console.log('WebSocket 연결 성공:', frame);

            // 사용자별 메시지 큐 구독
            const subscription = this.client?.subscribe(`/user/${this.userId}/queue/messages`, (message) => {
                console.log('사용자 메시지 수신:', message.body);
                try {
                    const messageData = JSON.parse(message.body);
                    console.log('파싱된 메시지:', messageData);
                    this.notifyListeners('message', messageData);
                } catch (e) {
                    console.error("메시지 파싱 오류:", e);
                }
            });
            console.log("구독 성공:", subscription);
        };

        // 에러 및 연결 끊김 핸들러 추가
        this.client.onStompError = (frame) => {
            console.error('STOMP 에러:', frame.headers['message'], frame.body);
        };

        this.client.onWebSocketClose = (evt) => {
            console.error('WebSocket 연결 끊김:', evt);
        };

        // 연결 시작
        this.client.activate();
        console.log("WebSocket 활성화 요청됨");
    }

    // 웹소켓 연결 종료
    disconnect() {
        if (this.client) {
            console.log("WebSocket 연결 종료");
            this.client.deactivate();
            this.client = null;
        }
    }

    // 메시지 전송 (텍스트만)
    async sendMessage(chatRoomId: number, content: string, senderType: string) {
        return this.sendMessageWithPhotos(chatRoomId, content, senderType, []);
    }

    // 메시지 전송 (사진 포함)
    async sendMessageWithPhotos(chatRoomId: number, content: string, senderType: string, photos: ChatPhoto[] = []) {

        if (!this.client || !this.client.connected) {
            console.error('WebSocket is not connected');
            throw new Error('WebSocket is not connected');
        }

        try {
            const response = await axios.post('/api/chat/message', {
                chatRoomId,
                message: content || (photos.length > 0 ? '사진을 보냈습니다.' : ''),
                senderType,
                senderId: this.userId,
                photos,
            });

            // WebSocket을 통한 메시지 전송
            this.client.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(response.data)
            });

            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // 채팅방을 찾을 수 없는 경우
                throw new Error(error.response.data.message || '존재하지 않는 채팅방입니다.');
            }
            throw error;
        }
    }

    // 이벤트 리스너 등록
    addListener(event: string, callback: MessageListener) {
        if (!this.messageListeners.has(event)) {
            this.messageListeners.set(event, []);
        }
        this.messageListeners.get(event)?.push(callback);
        console.log(`'${event}' 이벤트 리스너 추가됨`);
    }

    // 이벤트 리스너 제거
    removeListener(event: string, callback: MessageListener) {
        const listeners = this.messageListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
                console.log(`'${event}' 이벤트 리스너 제거됨`);
            }
        }
    }

    // 리스너들에게 이벤트 알림
    private notifyListeners(event: string, data: any) {
        const listeners = this.messageListeners.get(event);
        if (listeners && listeners.length > 0) {
            console.log(`'${event}' 이벤트 리스너 ${listeners.length}개에 알림 전송`);
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (e) {
                    console.error(`리스너 실행 중 오류:`, e);
                }
            });
        } else {
            console.warn(`'${event}' 이벤트에 등록된 리스너 없음`);
        }
    }

    // 연결 상태 확인
    isConnected(): boolean {
        return this.client !== null && this.client.connected;
    }

    // 현재 사용자 ID 반환
    getCurrentUserId(): string | null {
        return this.userId;
    }
}

// 싱글톤으로 내보내기
export default new WebSocketService();