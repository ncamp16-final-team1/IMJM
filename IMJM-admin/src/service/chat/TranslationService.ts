import axios from 'axios';

class TranslationService {
    async translate(text: string, source: string, target: string): Promise<string> {
        try {
            const response = await axios.get('/api/test/translate', {
                params: { text, source, target }
            });
            return response.data.translated;
        } catch (error) {
            console.error('Failed to translate text:', error);
            throw error;
        }
    }
}

export default new TranslationService();