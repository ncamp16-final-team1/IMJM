import axios from 'axios';

// 파일 업로드 결과 인터페이스
export interface UploadResult {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
}

class FileUploadService {
    private baseUrl = '/api/files';

    /**
     * 이미지 파일을 서버에 업로드하는 함수
     * @param file 업로드할 파일
     * @returns 업로드된 파일의 정보
     */
    async uploadImage(file: File): Promise<UploadResult> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${this.baseUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            throw error;
        }
    }

    /**
     * 여러 이미지 파일을 서버에 업로드하는 함수
     * @param files 업로드할 파일 배열
     * @returns 업로드된 파일들의 정보 배열
     */
    async uploadMultipleImages(files: File[]): Promise<UploadResult[]> {
        try {
            const formData = new FormData();
            files.forEach((file, index) => {
                formData.append('files', file);
            });

            const response = await axios.post(`${this.baseUrl}/upload/multiple`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('다중 이미지 업로드 실패:', error);
            throw error;
        }
    }
}

// 싱글톤으로 내보내기
export default new FileUploadService();