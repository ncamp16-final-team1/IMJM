package com.IMJM.chat.controller;

import com.IMJM.chat.service.TranslationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminTranslationController {

    private final TranslationService translationService;

    public AdminTranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @GetMapping("/translate")
    public Map<String, String> adminTranslate(
            @RequestParam String text,
            @RequestParam String source,
            @RequestParam String target) {

        String translated = translationService.translate(text, source, target);

        Map<String, String> result = new HashMap<>();
        result.put("original", text);
        result.put("translated", translated);

        return result;
    }
}
