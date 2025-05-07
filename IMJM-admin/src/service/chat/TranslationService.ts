import axios from 'axios';

class TranslationService {
    async translate(text: string, source: string, target: string): Promise<string> {
        try {
            console.log("번역 API 요청:", { text, source, target });

            const response = await axios.get('/api/test/translate', {
                params: { text, source, target }
            });

            console.log("번역 API 응답:", response.data);

            // response.data가 있고 translated 필드가 있는지 확인
            if (response.data && response.data.translated) {
                return response.data.translated;
            } else {
                console.warn("번역 API 응답에 translated 필드가 없습니다:", response.data);
                return "";
            }
        } catch (error) {
            console.error('번역 요청 실패:', error);
            throw error;
        }
    }
}

export default new TranslationService();