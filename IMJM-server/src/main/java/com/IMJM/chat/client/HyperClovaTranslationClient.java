package com.IMJM.chat.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class HyperClovaTranslationClient {

    private final RestTemplate restTemplate;

    @Value("${hyperclovax.api.url}")
    private String apiUrl;

    @Value("${hyperclovax.api.key}")
    private String apiKey;

    /**
     * 하이퍼클로바X API를 이용한 텍스트 번역
     */
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("X-NCP-CLOVASTUDIO-REQUEST-ID", UUID.randomUUID().toString().replace("-", ""));
            headers.set("Accept", "text/event-stream");

            Map<String, Object> systemPrompt = new HashMap<>();
            systemPrompt.put("role", "system");
            systemPrompt.put("content", "당신은 헤어스타일과 미용 분야에 특화된 전문 번역가입니다. 미용실과 다국적 고객 간의 원활한 소통을 돕는 양방향 번역 서비스를 제공합니다. \n\n"
                    + "[번역 방향] " + sourceLanguage + "에서 " + targetLanguage + "로 번역해주세요.\n\n"
                    + "[번역 임무] \n"
                    + "1. 한국어 미용실 메시지를 다양한 외국어로 번역 (한국어 → 외국어) \n"
                    + "2. 외국인 고객의 메시지를 한국어로 번역 (외국어 → 한국어) \n\n"
                    + "[번역 가이드라인] \n"
                    + "◆ 미용실 메시지 번역 (한국어 → 외국어): \n"
                    + "- 한국 미용 용어와 표현을 외국인 고객이 이해하기 쉬운 표현으로 변환 \n"
                    + "- 시술 과정, 가격, 예약 시간 등 중요 정보를 명확하게 전달 \n"
                    + "- 한국적 서비스 문화(친절함, 존중)의 뉘앙스를 유지하여 번역 \n"
                    + "- 외국인이 생소할 수 있는 한국 특유의 미용 개념은 간략한 설명 추가 \n\n"
                    + "◆ 고객 메시지 번역 (외국어 → 한국어): \n"
                    + "- 외국인 고객의 헤어스타일 요청을 한국 미용실이 이해하기 쉬운 전문 용어로 변환 \n"
                    + "- 외국 헤어스타일 트렌드나 용어를 한국 미용업계에서 통용되는 표현으로 적절히 변환 \n"
                    + "- 문화적 차이로 인한 오해가 생길 수 있는 표현을 자연스럽게 조정 \n"
                    + "- 외국인 특유의 표현 방식을 한국 미용실 맥락에 맞게 조정하되 원래 의도 유지 \n\n"
                    + "◆ 미용 전문 용어 정확한 변환: \n"
                    + "1. 헤어스타일 용어: \n"
                    + "- 한국어: 레이어드컷, 머쉬룸컷, 허쉬컷, 울프컷, 태슬컷, 히메컷 등 \n"
                    + "- 영어: layered cut, mushroom cut, hush cut, wolf cut, tassel cut, hime cut 등 \n"
                    + "2. 염색 용어: \n"
                    + "- 한국어: 발레아쥬, 옴브레, 하이라이트, 로우라이트, 베이스, 탈색, 톤다운 등 \n"
                    + "- 영어: balayage, ombre, highlights, lowlights, base color, bleaching, tone-down 등 \n"
                    + "3. 펌 용어: \n"
                    + "- 한국어: 볼륨펌, C컬, S컬, 디지털펌, 에어펌, 매직스트레이트, 셋팅펌 등 \n"
                    + "- 영어: volume perm, C-curl, S-curl, digital perm, air perm, magic straight, setting perm 등 \n"
                    + "4. 트리트먼트 용어: \n"
                    + "- 한국어: 두피케어, 단백질 트리트먼트, 케라틴 트리트먼트, 모발 영양 공급 등 \n"
                    + "- 영어: scalp care, protein treatment, keratin treatment, hair nourishment 등 \n\n"
                    + "◆ 특수 상황 처리: \n"
                    + "- 고객의 불만 사항은 부드럽게 유지하되 내용은 정확히 전달 \n"
                    + "- 알레르기나 긴급 상황 관련 내용은 최우선으로 명확하게 번역 \n"
                    + "- 애매한 표현은 가능한 옵션을 함께 제시하는 방식으로 번역 \n"
                    + "- 이모티콘과 줄임말은 각 문화권에 맞게 자연스럽게 변환 \n\n"
                    + "번역할 텍스트: \"" + text + "\"\n\n"
                    + "위 텍스트를 " + sourceLanguage + "에서 " + targetLanguage + "로 번역하되, 미용실과 고객 간의 원활한 소통이 이루어질 수 있도록 전문성과 문화적 맥락을 모두 고려해 번역해주세요. 번역 결과만 제공해주세요.");

            Map<String, Object> userPrompt = new HashMap<>();
            userPrompt.put("role", "user");
            userPrompt.put("content", text);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("messages", new Object[]{systemPrompt, userPrompt});

            // 추가 파라미터
            requestBody.put("topP", 0.8);
            requestBody.put("topK", 0);
            requestBody.put("temperature", 0.5);  // 번역에는 낮은 온도가 적합
            requestBody.put("maxTokens", 2048);
            requestBody.put("repeatPenalty", 1.1);
            requestBody.put("stopBefore", new String[]{});
            requestBody.put("includeAiFilters", false);
            requestBody.put("seed", 0);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // String으로 응답 받기
            String response = restTemplate.postForObject(apiUrl, entity, String.class);

            // SSE 형식의 응답 파싱
            String translatedText = parseSSEResponse(response);
            return translatedText;

        } catch (Exception e) {
            throw new RuntimeException("Translation error: " + e.getMessage(), e);
        }
    }

    // SSE 응답 파싱 메소드 추가
    private String parseSSEResponse(String sseResponse) {
        if (sseResponse == null || sseResponse.isEmpty()) {
            return "";
        }

        String[] lines = sseResponse.split("\n");
        String finalMessage = "";
        Set<String> uniqueContents = new HashSet<>();

        for (String line : lines) {
            if (line.startsWith("data:") && !line.contains("[DONE]")) {
                try {
                    String jsonData = line.substring(5).trim();
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(jsonData);

                    if (root.has("message") && root.get("message").has("content")) {
                        String content = root.get("message").get("content").asText();
                        if (content != null && !content.isEmpty() && !uniqueContents.contains(content)) {
                            finalMessage = content;
                            uniqueContents.add(content);
                        }
                    }
                } catch (Exception e) {
                    log.error("Error parsing SSE response", e);
                }
            }
        }

        return finalMessage;
    }
}
