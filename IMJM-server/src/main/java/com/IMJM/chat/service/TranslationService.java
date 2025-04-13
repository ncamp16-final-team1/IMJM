package com.IMJM.chat.service;

public interface TranslationService {
    /**
     * 텍스트를 소스 언어에서 타겟 언어로 번역합니다.
     */
    String translate(String text, String sourceLanguage, String targetLanguage);
}
