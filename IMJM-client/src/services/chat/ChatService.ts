import axios from 'axios';

// 채팅방 정보 타입
export interface ChatRoom {
    id: number;
    userId: string;
    salonId: string;
    salonName: string;
    userName: string;
    createdAt: string;
    lastMessageTime: string;
    lastMessage: string;
    hasUnreadMessages: boolean;
    unreadCount: number;
}

// 메시지 타입
export interface ChatMessageDto {
    id: number;
    chatRoomId: number;
    senderType: string;
    senderId: string;
    message: string;
    isRead: boolean;
    sentAt: string;
    translatedMessage: string | null;
    translationStatus: string;
    photos: ChatPhoto[];
}

// 사진 타입
export interface ChatPhoto {
    photoId: number;
    photoUrl: string;
}

// 채팅 서비스 클래스
class ChatService {
    private baseUrl = '/api/chat';

    // 사용자 기준 채팅방 목록 조회
    async getUserChatRooms(): Promise<ChatRoom[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/rooms/user`, {
                withCredentials: true  // 쿠키 포함
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user chat rooms:', error);
            throw error;
        }
    }

    // 미용실 기준 채팅방 목록 조회
    async getSalonChatRooms(salonId: string): Promise<ChatRoom[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/rooms/salon/${salonId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch salon chat rooms:', error);
            throw error;
        }
    }

    // 채팅방 생성 또는 조회
    async getChatRoom(userId: string, salonId: string): Promise<ChatRoom> {
        try {
            const response = await axios.post(`${this.baseUrl}/room`, null, {
                params: { userId, salonId }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to get chat room:', error);
            throw error;
        }
    }

    // 채팅방 메시지 목록 조회
    async getChatMessages(chatRoomId: number): Promise<ChatMessageDto[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/messages/${chatRoomId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch chat messages:', error);
            throw error;
        }
    }

    // 메시지 읽음 처리
    async markMessagesAsRead(chatRoomId: number, senderType: string): Promise<boolean> {
        try {
            const response = await axios.put(`${this.baseUrl}/messages/read/${chatRoomId}`, null, {
                params: { senderType }
            });
            return response.data.success;
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
            throw error;
        }
    }

    // 읽지 않은 메시지 수 조회
    async getUnreadCount(chatRoomId: number, senderType: string): Promise<number> {
        try {
            const response = await axios.get(`${this.baseUrl}/messages/unread/count/${chatRoomId}`, {
                params: { senderType }
            });
            return response.data.count;
        } catch (error) {
            console.error('Failed to get unread count:', error);
            throw error;
        }
    }
}

// 싱글톤으로 내보내기
export default new ChatService();