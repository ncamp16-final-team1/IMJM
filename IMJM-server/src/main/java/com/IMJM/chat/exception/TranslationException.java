package com.IMJM.chat.exception;

public class TranslationException extends RuntimeException {

    private final String sourceLanguage;
    private final String targetLanguage;
    private final String originalMessage;

    public TranslationException(String message, String sourceLanguage, String targetLanguage,
                                String originalMessage, Throwable cause) {
        super(message, cause);
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
        this.originalMessage = originalMessage;
    }

    public String getSourceLanguage() {
        return sourceLanguage;
    }

    public String getTargetLanguage() {
        return targetLanguage;
    }

    public String getOriginalMessage() {
        return originalMessage;
    }
}
