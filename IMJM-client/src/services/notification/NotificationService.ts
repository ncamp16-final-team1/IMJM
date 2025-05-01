import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface AlarmDto {
    id: number;
    userId: string;
    title: string;
    content: string;
    isRead: boolean;
    notificationType: string;
    referenceId: number | null;
    createdAt: string;
}

interface NotificationListener {
    (notification: AlarmDto): void;
}

class NotificationService {
    private client: Client | null = null;
    private listeners: NotificationListener[] = [];
    private userId: string | null = null;
    private connected: boolean = false;

    initialize(userId: string) {
        this.userId = userId;
        console.log(`알림 서비스 초기화: 사용자 ID ${userId}`);

        // 이미 연결되어 있으면 기존 연결 해제
        if (this.client && this.client.connected) {
            this.disconnect();
        }

        // 새로운 STOMP 클라이언트 생성
        this.client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            debug: (str) => console.log('STOMP: ' + str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // 연결 성공 핸들러
        this.client.onConnect = (frame) => {
            console.log('알림 WebSocket 연결됨:', frame);
            this.connected = true;

            // 사용자별 알림 큐 구독
            this.client?.subscribe(`/user/${this.userId}/queue/notifications`, (message) => {
                try {
                    console.log('새 알림 수신:', message.body);
                    const notification = JSON.parse(message.body);
                    this.notifyListeners(notification);
                } catch (e) {
                    console.error('알림 파싱 오류:', e);
                }
            });
        };

        // 오류 핸들러
        this.client.onStompError = (frame) => {
            console.error('STOMP 오류:', frame.headers['message'], frame.body);
        };

        // 연결 해제 핸들러
        this.client.onWebSocketClose = (evt) => {
            console.log('WebSocket 연결 종료:', evt);
            this.connected = false;
        };

        // 연결 시작
        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            console.log('알림 WebSocket 연결 해제');
            this.client.deactivate();
            this.client = null;
            this.connected = false;
        }
    }

    addListener(listener: NotificationListener) {
        this.listeners.push(listener);
        console.log(`알림 리스너 추가됨 (총 ${this.listeners.length}개)`);
    }

    removeListener(listener: NotificationListener) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
            console.log(`알림 리스너 제거됨 (남은 리스너: ${this.listeners.length}개)`);
        }
    }

    private notifyListeners(notification: AlarmDto) {
        console.log(`${this.listeners.length}개의 리스너에게 알림 전달 중`);
        this.listeners.forEach(listener => {
            try {
                listener(notification);
            } catch (e) {
                console.error('리스너 실행 중 오류:', e);
            }
        });
    }

    async getNotifications(): Promise<AlarmDto[]> {
        try {
            const response = await fetch('/api/alarms');
            if (!response.ok) {
                throw new Error('알림을 불러오는데 실패했습니다');
            }
            return await response.json();
        } catch (error) {
            console.error('알림 목록 조회 실패:', error);
            throw error;
        }
    }

    async getUnreadCount(): Promise<number> {
        try {
            const response = await fetch('/api/alarms/unread/count');
            if (!response.ok) {
                throw new Error('읽지 않은 알림 수를 불러오는데 실패했습니다');
            }
            const data = await response.json();
            return data.count;
        } catch (error) {
            console.error('읽지 않은 알림 수 조회 실패:', error);
            return 0; // 에러 발생 시 기본값 0 반환
        }
    }

    async markAsRead(id: number): Promise<void> {
        try {
            const response = await fetch(`/api/alarms/${id}/read`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('알림 읽음 처리에 실패했습니다');
            }
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
            throw error;
        }
    }

    async markAllAsRead(): Promise<void> {
        try {
            const response = await fetch('/api/alarms/read-all', {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('모든 알림 읽음 처리에 실패했습니다');
            }
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
            throw error;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }

    // 테스트용 메서드
    async createTestNotification(title: string, content: string): Promise<AlarmDto> {
        try {
            const response = await fetch('/api/alarms/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content, type: 'TEST' })
            });

            if (!response.ok) {
                throw new Error('테스트 알림 생성 실패');
            }

            return await response.json();
        } catch (error) {
            console.error('테스트 알림 생성 실패:', error);
            throw error;
        }
    }
}

// 싱글톤 인스턴스로 내보내기
export default new NotificationService();