import axios from 'axios';

class TranslationService {
    async translate(text: string, source: string, target: string): Promise<string> {
        try {
            // admin 경로를 추가한 버전으로 시도
            const response = await axios.get('/api/admin/test/translate', {
                params: { text, source, target }
            });

            console.log("번역 API 응답:", response.data);

            if (response.data && response.data.translated) {
                return response.data.translated;
            } else {
                console.warn("번역 API 응답에 translated 필드가 없습니다:", response.data);
                return "";
            }
        } catch (error) {
            console.error('번역 요청 실패:', error);

            // API 경로 문제인 경우 원래 경로로 다시 시도
            try {
                console.log("기존 API 경로로 재시도합니다");
                const fallbackResponse = await axios.get('/api/test/translate', {
                    params: { text, source, target }
                });

                if (fallbackResponse.data && fallbackResponse.data.translated) {
                    return fallbackResponse.data.translated;
                }
            } catch (fallbackError) {
                console.error('재시도 번역 요청도 실패:', fallbackError);
            }

            throw error;
        }
    }
}

export default new TranslationService();