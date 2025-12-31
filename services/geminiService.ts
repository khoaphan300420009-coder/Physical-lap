import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("CRITICAL: Gemini API Key is not configured in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export const generatePhysicsResponse = async (prompt: string, imageBase64?: string): Promise<string> => {
  try {
    let contents: any = prompt;

    if (imageBase64) {
        // Extract base64 data if it contains the header
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        
        contents = {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg', // Assuming JPEG/PNG from typical inputs
                        data: base64Data
                    }
                },
                {
                    text: prompt || "Hãy phân tích hình ảnh này và giải quyết bài toán vật lý trong đó."
                }
            ]
        };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: "Bạn là một trợ lý ảo chuyên về Vật Lý học (Physical Lab AI) được phát triển bởi Phan Hoàng Đăng Khoa. \n\nNhiệm vụ của bạn bao gồm:\n1. Giải thích các hiện tượng, định luật vật lý.\n2. Giải bài tập vật lý (có thể qua hình ảnh).\n3. Lên kế hoạch học tập chi tiết cho học sinh THPT.\n4. Ra đề bài tập thực hành hoặc trắc nghiệm khi được yêu cầu.\n\nHãy trả lời ngắn gọn, chính xác, khơi gợi trí tò mò. Sử dụng tiếng Việt. Nếu có công thức, hãy dùng định dạng LaTeX đặt trong dấu $.",
      }
    });

    return response.text || "Xin lỗi, tôi không thể tạo câu trả lời lúc này.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Throw a generic error for the UI to handle gracefully.
    throw new Error("An error occurred while communicating with the AI service.");
  }
};
