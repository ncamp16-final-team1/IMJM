import axios from 'axios';

// 채팅방 정보 타입
export interface ChatRoom {
    id: number;
    userId: string;
    salonId: string;
    userName: string;
    salonName: string;
    createdAt: string;
    lastMessageTime: string;
    lastMessage: string;
    hasUnreadMessages: boolean;
    unreadCount: number;
}

// 메시지 타입
export interface ChatMessage {
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

// 어드민 채팅 서비스 클래스
class AdminChatService {
    private baseUrl = '/api/admin/chat';

    // 미용실 기준 채팅방 목록 조회
    async getSalonChatRooms(): Promise<ChatRoom[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/rooms`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch salon chat rooms:', error);
            throw error;
        }
    }

    // 채팅방 메시지 목록 조회
    async getChatMessages(chatRoomId: number): Promise<ChatMessage[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/messages/${chatRoomId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch chat messages:', error);
            throw error;
        }
    }

    // 메시지 읽음 처리
    async markMessagesAsRead(chatRoomId: number): Promise<boolean> {
        try {
            const response = await axios.put(`${this.baseUrl}/messages/read/${chatRoomId}`);
            return response.data.success;
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
            throw error;
        }
    }

    // 이미지 업로드
    async uploadImage(file: File, chatRoomId: number): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chatRoomId', chatRoomId.toString());

            const response = await axios.post(`${this.baseUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data.fileUrl;
        } catch (error) {
            console.error('Failed to upload image:', error);
            throw error;
        }
    }
}

// 싱글톤으로 내보내기
export default new AdminChatService();