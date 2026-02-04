const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function ask(prompt) {
    // 가장 안정적인 모델로 고정하여 혼선을 줄입니다.
    const modelName = "gemini-flash-latest";
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text || text.trim() === "") {
            throw new Error("Empty response from Gemini");
        }
        
        // 성공하면 텍스트만 깔끔하게 반환합니다.
        return text;
    } catch (error) {
        console.error("Gemini API Error Detail:", error);
        
        if (error.status === 429) {
            return "지금 사용자가 너무 많아 제미나이가 잠시 쉬고 있어요. 1분만 기다렸다가 다시 말해 주세요! (할당량 초과)";
        }

        // 404 에러 시 pro-latest로 한 번만 더 시도 (재귀 대신 명시적 시도)
        if (error.status === 404 || error.message.includes("not found")) {
            try {
                console.log("Retrying with gemini-pro-latest...");
                const backupModel = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
                const backupResult = await backupModel.generateContent(prompt);
                return backupResult.response.text();
            } catch (retryError) {
                console.error("Retry failed:", retryError);
            }
        }
        
        return "죄송해요, 대화 중에 오류가 발생했어요. ㅠㅠ 잠시 후 다시 시도해 주시겠어요?";
    }
}

module.exports = {
    ask,
};
