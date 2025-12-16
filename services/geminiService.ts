
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const generatePhysicsResponse = async (prompt: string, imageBase64?: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Missing API Key");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

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
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: "Bạn là một trợ lý ảo chuyên về Vật Lý học (Physical Lab AI) được phát triển bởi Phan Hoàng Đăng Khoa. \n\nNhiệm vụ của bạn bao gồm:\n1. Giải thích các hiện tượng, định luật vật lý.\n2. Giải bài tập vật lý (có thể qua hình ảnh).\n3. Lên kế hoạch học tập chi tiết cho học sinh THPT.\n4. Ra đề bài tập thực hành hoặc trắc nghiệm khi được yêu cầu.\n\nHãy trả lời ngắn gọn, chính xác, khơi gợi trí tò mò. Sử dụng tiếng Việt. Nếu có công thức, hãy dùng định dạng LaTeX đặt trong dấu $.",
      }
    });

    return response.text || "Xin lỗi, tôi không thể tạo câu trả lời lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
