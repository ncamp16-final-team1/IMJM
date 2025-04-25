import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessageDto, ChatPhoto } from './ChatService';

interface MessageListener {
    (message: any): void;
}

class RabbitMQService {
    private stompClient: Client | null = null;
    private messageListeners: Map<string, MessageListener[]> = new Map();
    private userId: string | null = null;
    private connected: boolean = false;
    private roomId: number | null = null;

    // 웹소켓 연결 초기화
    initialize(userId: string) {
        console.log("RabbitMQService 초기화:", userId);
        this.userId = userId;

        // 이미 연결되어 있으면 기존 연결 해제
        if (this.stompClient && this.stompClient.connected) {
            this.disconnect();
        }

        // 새로운 STOMP 클라이언트 생성
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // 연결 성공 핸들러
        this.stompClient.onConnect = (frame) => {
            console.log('WebSocket 연결 성공:', frame);
            this.connected = true;

            // 사용자별 메시지 큐 구독
            const subscription = this.stompClient?.subscribe(`/user/${this.userId}/queue/messages`, (message) => {
                console.log('사용자 메시지 수신:', message.body);
                try {
                    const messageData = JSON.parse(message.body);
                    this.notifyListeners('message', messageData);
                } catch (e) {
                    console.error("메시지 파싱 오류:", e);
                }
            });
            console.log("구독 성공:", subscription);

            // 채팅룸 기반 구독도 추가
            if (this.roomId) {
                this.subscribeToRoom(this.roomId);
            }
        };

        // 에러 핸들러
        this.stompClient.onStompError = (frame) => {
            console.error('Broker 오류:', frame.headers['message']);
            console.error('상세 정보:', frame.body);
            this.connected = false;
        };

        // 연결 시작
        this.stompClient.activate();
        console.log("WebSocket 활성화 요청됨");
    }

    // 특정 채팅방 구독
    subscribeToRoom(roomId: number) {
        this.roomId = roomId;
        if (this.stompClient && this.stompClient.connected) {
            console.log(`채팅방 ${roomId} 구독 시도`);
            const subscription = this.stompClient.subscribe(`/user/${roomId}/queue/messages`, (message) => {
                console.log(`채팅방 ${roomId} 메시지 수신:`, message.body);
                try {
                    const messageData = JSON.parse(message.body);
                    this.notifyListeners('message', messageData);
                } catch (e) {
                    console.error("메시지 파싱 오류:", e);
                }
            });
            console.log("채팅방 구독 성공:", subscription);
        } else {
            console.warn(`채팅방 ${roomId} 구독 실패: WebSocket 연결되지 않음`);
        }
    }

    // 웹소켓 연결 종료
    disconnect() {
        if (this.stompClient) {
            console.log("WebSocket 연결 종료");
            this.stompClient.deactivate();
            this.stompClient = null;
            this.connected = false;
        }
    }

    // 메시지 전송 (텍스트만)
    async sendMessage(chatRoomId: number, content: string, senderType: string) {
        return this.sendMessageWithPhotos(chatRoomId, content, senderType, []);
    }

    // 메시지 전송 (사진 포함)
    async sendMessageWithPhotos(chatRoomId: number, content: string, senderType: string, photos: ChatPhoto[] = []) {
        console.log("메시지 전송 시작:", { chatRoomId, content, senderType, photos });

        const messagePayload: ChatMessageDto = {
            chatRoomId,
            message: content || (photos.length > 0 ? '사진을 보냈습니다.' : ''),
            senderType,
            senderId: this.userId || '',
            photos,
            id: Date.now(), // 임시 ID
            isRead: false,
            sentAt: new Date().toISOString(),
            translatedMessage: null,
            translationStatus: 'none'
        };

        try {
            // REST API를 통한 메시지 전송
            console.log("REST API로 메시지 전송 시도");
            const response = await axios.post('/api/chat/message', messagePayload);
            console.log("메시지 전송 성공:", response.data);
            return response.data;
        } catch (error) {
            console.error('REST API 메시지 전송 실패:', error);

            // 폴백: 웹소켓을 통한 메시지 전송 시도
            if (this.stompClient && this.connected) {
                console.log("폴백: WebSocket으로 메시지 전송");
                this.stompClient.publish({
                    destination: '/app/chat.sendMessage',
                    body: JSON.stringify(messagePayload)
                });
                return messagePayload;
            } else {
                console.error("모든 메시지 전송 방법 실패");
                throw error;
            }
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
        return this.connected;
    }

    // 현재 구독 중인 채팅방 ID 반환
    getCurrentRoomId(): number | null {
        return this.roomId;
    }

    // 현재 사용자 ID 반환
    getCurrentUserId(): string | null {
        return this.userId;
    }
}

// 싱글톤으로 내보내기
export default new RabbitMQService();