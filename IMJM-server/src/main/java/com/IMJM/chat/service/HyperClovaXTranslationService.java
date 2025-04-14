package com.IMJM.chat.service;

import com.IMJM.chat.client.HyperClovaTranslationClient;
import com.IMJM.chat.exception.TranslationException;
import com.IMJM.chat.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class HyperClovaXTranslationService implements TranslationService {

    private final HyperClovaTranslationClient hyperClovaClient;

    @Override
    public String translate(String text, String sourceLanguage, String targetLanguage) throws TranslationException {
        // 언어 코드 변환 (필요한 경우)
        String sourceLang = convertLanguageCode(sourceLanguage);
        String targetLang = convertLanguageCode(targetLanguage);

        try {
            // 클라이언트를 사용하여 번역 수행
            String translatedText = hyperClovaClient.translate(text, sourceLang, targetLang);

            if (translatedText == null || translatedText.isEmpty()) {
                throw new TranslationException(
                        "Empty translation result",
                        sourceLanguage,
                        targetLanguage,
                        text,
                        new IllegalStateException("Translation result is empty")
                );
            }

            return translatedText;
        } catch (Exception e) {
            throw new TranslationException(
                    "Failed to translate text: " + e.getMessage(),
                    sourceLanguage,
                    targetLanguage,
                    text,
                    e
            );
        }
    }

    // 언어 코드 변환 (예: "ko" -> "한국어")
    private String convertLanguageCode(String code) {
        switch (code.toLowerCase()) {
            case "ko": return "ko";
            case "en": return "en";
            case "ja": return "ja";
            case "zh-cn": return "zh-CN";
            case "zh-tw": return "zh-TW";
            case "vi": return "vi";
            case "th": return "th";
            case "id": return "id";
            case "fr": return "fr";
            case "es": return "es";
            case "ru": return "ru";
            case "de": return "de";
            case "it": return "it";
            default: return code;
        }
    }
}