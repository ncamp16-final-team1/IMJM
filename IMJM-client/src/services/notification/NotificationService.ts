import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

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

type EventListener = (data: any) => void;

class NotificationService {
    private client: Client | null = null;
    private listeners: Record<string, EventListener[]> = {}; // 타입 수정
    private userId: string | null = null;
    private connected: boolean = false;
    private isNotificationEnabled: boolean = false;

    initialize(userId: string) {
        this.userId = userId;
        console.log(`알림 서비스 초기화: 사용자 ID ${userId}`);

        // 알림 설정 확인
        this.checkNotificationSettings()
            .then(() => {
                if (this.isNotificationEnabled) {
                    this.setupWebSocket();
                }
            });
    }

    // 알림 설정 확인
    private async checkNotificationSettings() {
        try {
            const response = await axios.get('/api/user/my-profile');
            this.isNotificationEnabled = response.data.isNotification;
            console.log(`알림 설정 상태: ${this.isNotificationEnabled}`);
        } catch (error) {
            console.error('알림 설정 불러오기 실패', error);
            this.isNotificationEnabled = false;
        }
    }

    // WebSocket 설정
    private setupWebSocket() {
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
            console.log('알림 WebSocket 연결됨:', frame);
            this.connected = true;

            // 연결 상태 변경 이벤트 발행
            this.notifyListeners('connectionChange', { connected: true });

            // 사용자별 알림 큐 구독
            this.client?.subscribe(`/user/${this.userId}/queue/notifications`, (message) => {
                try {
                    console.log('새 알림 수신:', message.body);
                    const notification = JSON.parse(message.body);

                    // 알림 설정 확인 후 리스너에 전달
                    if (this.isNotificationEnabled) {
                        // 수정: 일반 리스너 호출
                        this.notifyListeners('notification', notification);
                    } else {
                        console.log('알림 설정이 비활성화되어 있어 알림을 무시합니다.');
                    }
                } catch (e) {
                    console.error('알림 파싱 오류:', e);
                }
            });
        };

        // 연결 해제 핸들러 추가
        this.client.onDisconnect = () => {
            console.log('알림 WebSocket 연결 해제됨');
            this.connected = false;
            // 연결 상태 변경 이벤트 발행
            this.notifyListeners('connectionChange', { connected: false });
        };

        // 연결 시작
        this.client.activate();
    }

    // 알림 설정 업데이트
    async updateNotificationSettings(enabled: boolean) {
        try {
            await axios.put('/api/user/notification-settings', null, {
                params: { isNotificationEnabled: enabled }
            });

            this.isNotificationEnabled = enabled;

            // 알림 설정에 따라 WebSocket 연결 관리
            if (enabled) {
                this.setupWebSocket();
            } else {
                this.disconnect();
            }
        } catch (error) {
            console.error('알림 설정 변경 실패', error);
        }
    }

    disconnect() {
        if (this.client) {
            console.log('알림 WebSocket 연결 해제');
            this.client.deactivate();
            this.client = null;
            this.connected = false;
        }
    }

    // 이벤트 리스너 추가 메서드 (타입 수정)
    addListener(event: string, listener: EventListener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        console.log(`'${event}' 이벤트 리스너 추가됨 (총 ${this.listeners[event].length}개)`);
    }

    // 이벤트 리스너 제거 메서드 (타입 수정)
    removeListener(event: string, listener: EventListener) {
        if (!this.listeners[event]) return;

        const index = this.listeners[event].indexOf(listener);
        if (index !== -1) {
            this.listeners[event].splice(index, 1);
            console.log(`'${event}' 이벤트 리스너 제거됨 (남은 ${this.listeners[event].length}개)`);
        }
    }

    // 이벤트 발행 메서드 (수정됨)
    private notifyListeners(event: string, data: any) {
        const listeners = this.listeners[event] || [];
        if (listeners.length > 0) {
            console.log(`'${event}' 이벤트 발행: ${listeners.length}개의 리스너에게 알림`);
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (e) {
                    console.error(`'${event}' 리스너 실행 중 오류:`, e);
                }
            });
        } else {
            console.log(`'${event}' 이벤트 발행: 등록된 리스너 없음`);
        }
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
            return 0;
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

            // 읽음 처리 이벤트 발행
            this.notifyListeners('alarmRead', { id });
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

            // 모든 알림 읽음 처리 이벤트 발행
            this.notifyListeners('alarmRead', { all: true });
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
            throw error;
        }
    }

    async deleteNotification(id: number): Promise<boolean> {
        try {
            const response = await axios.delete(`/api/alarms/${id}`);
            // 알림 삭제 이벤트 발행
            this.notifyListeners('alarmDeleted', { id });
            return true;
        } catch (error) {
            console.error('알람 삭제 실패:', error);
            return false;
        }
    }

    async deleteNotifications(ids: number[]): Promise<boolean> {
        try {
            await axios.delete('/api/alarms/batch', { data: ids });
            // 다중 알림 삭제 이벤트 발행
            this.notifyListeners('alarmDeleted', { ids });
            return true;
        } catch (error) {
            console.error('알람 일괄 삭제 실패:', error);
            return false;
        }
    }
}

export default new NotificationService();