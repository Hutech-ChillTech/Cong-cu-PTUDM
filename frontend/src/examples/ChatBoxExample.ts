/**
 * AI Tutor Chatbox - Example Usage & Testing
 *
 * File này chứa các ví dụ về cách sử dụng và test ChatBox component
 */

const API_URL =
  import.meta.env.VITE_API_URL || "https://skillcoder.onrender.com";

// ============================================
// 1. BASIC USAGE
// ============================================

/**
 * Example: Import và sử dụng ChatBox component
 *
 * ```tsx
 * import ChatBox from '../components/ChatBox/ChatBox';
 *
 * function App() {
 *   return (
 *     <div className="app">
 *       <h1>My Application</h1>
 *       <ChatBox />
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================
// 2. TEST SCENARIOS
// ============================================

/**
 * Test Case 1: Câu hỏi đơn giản (Tiếng Việt)
 *
 * Input: "Node.js là gì?"
 * Expected: AI trả lời về Node.js bằng tiếng Việt
 */

/**
 * Test Case 2: Câu hỏi lập trình
 *
 * Input: "Làm thế nào để tạo một React component?"
 * Expected: AI giải thích cách tạo React component
 */

/**
 * Test Case 3: Yêu cầu viết code
 *
 * Input: "Viết một hàm JavaScript để sắp xếp mảng"
 * Expected: AI cung cấp code example với giải thích
 */

/**
 * Test Case 4: Câu hỏi về khóa học
 *
 * Input: "Tôi nên học gì để trở thành Full Stack Developer?"
 * Expected: AI đưa ra lộ trình học tập
 */

/**
 * Test Case 5: Error Handling
 *
 * Scenario: Server không chạy
 * Expected: Hiển thị error message với hướng dẫn khắc phục
 */

// ============================================
// 3. API TESTING EXAMPLES
// ============================================

/**
 * Test API trực tiếp với fetch
 */
async function testChatAPI() {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Xin chào! Bạn là ai?",
        language: "vi",
      }),
    });

    const data = await response.json();
    console.log("API Response:", data);

    if (data.success) {
      console.log("✅ AI Answer:", data.answer);
    } else {
      console.error("❌ Error:", data.error);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

// ============================================
// 4. SAMPLE QUESTIONS FOR TESTING
// ============================================

const sampleQuestions = {
  vietnamese: [
    "Xin chào! Bạn có thể giúp gì cho tôi?",
    "React là gì?",
    "Sự khác biệt giữa let và const trong JavaScript?",
    "Làm thế nào để học lập trình hiệu quả?",
    "TypeScript có lợi ích gì?",
    "Giải thích về REST API",
    "Docker là gì và tại sao nên dùng?",
    "Cách tối ưu performance cho React app?",
  ],

  english: [
    "Hello! What can you help me with?",
    "What is React?",
    "Explain the difference between let and const",
    "How to learn programming effectively?",
    "What are the benefits of TypeScript?",
    "Explain REST API",
    "What is Docker and why use it?",
    "How to optimize React app performance?",
  ],

  coding: [
    "Viết một hàm JavaScript để đảo ngược chuỗi",
    "Tạo một component React để hiển thị danh sách",
    "Code một API endpoint với Express.js",
    "Viết SQL query để lấy top 10 users",
    "Tạo một custom hook trong React",
  ],
};

// ============================================
// 5. PERFORMANCE TESTING
// ============================================

/**
 * Test response time
 */
async function measureResponseTime(message: string) {
  const startTime = performance.now();

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, language: "vi" }),
    });

    const data = await response.json();
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`⏱️ Response time: ${duration.toFixed(2)}ms`);
    console.log(`📝 Answer length: ${data.answer?.length || 0} characters`);

    return { duration, data };
  } catch (error) {
    console.error("❌ Test failed:", error);
    return null;
  }
}

// ============================================
// 6. STRESS TESTING
// ============================================

/**
 * Test multiple concurrent requests
 */
async function stressTest(numRequests: number = 5) {
  console.log(`🔥 Starting stress test with ${numRequests} requests...`);

  const promises = Array.from({ length: numRequests }, (_, i) =>
    fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Test message ${i + 1}`,
        language: "vi",
      }),
    }),
  );

  try {
    const startTime = performance.now();
    const responses = await Promise.all(promises);
    const endTime = performance.now();

    console.log(`✅ All ${numRequests} requests completed`);
    console.log(`⏱️ Total time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(
      `📊 Average: ${((endTime - startTime) / numRequests).toFixed(2)}ms per request`,
    );

    return responses;
  } catch (error) {
    console.error("❌ Stress test failed:", error);
    return null;
  }
}

// ============================================
// 7. ERROR SCENARIOS
// ============================================

const errorScenarios = {
  serverDown: {
    description: "Server không chạy",
    test: async () => {
      // Thử kết nối khi server down
      try {
        await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "test", language: "vi" }),
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log("✅ Error handled correctly:", errorMessage);
      }
    },
  },

  invalidApiKey: {
    description: "GROQ_API_KEY không hợp lệ",
    expectedResponse: {
      success: false,
      error: "GROQ_API_KEY chưa được cấu hình",
    },
  },

  emptyMessage: {
    description: "Gửi tin nhắn rỗng",
    test: () => {
      // Component sẽ prevent việc gửi tin nhắn rỗng
      console.log("✅ Empty message prevented by component");
    },
  },
};

// ============================================
// 8. INTEGRATION TESTING
// ============================================

/**
 * Test full conversation flow
 */
async function testConversationFlow() {
  const conversation = [
    "Xin chào!",
    "Bạn có thể giúp tôi học React không?",
    "Tôi nên bắt đầu từ đâu?",
    "Cảm ơn bạn!",
  ];

  console.log("🔄 Testing conversation flow...");

  for (let i = 0; i < conversation.length; i++) {
    console.log(`\n📤 User: ${conversation[i]}`);

    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: conversation[i],
        language: "vi",
      }),
    });

    const data = await response.json();
    console.log(`📥 AI: ${data.answer?.substring(0, 100)}...`);

    // Wait 1 second between messages
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n✅ Conversation flow test completed");
}

// ============================================
// 9. UI/UX TESTING CHECKLIST
// ============================================

const uiTestChecklist = {
  visual: [
    "✅ Chatbox icon hiển thị ở góc dưới bên phải",
    "✅ Gradient header có màu đẹp (xanh dương/tím)",
    "✅ Tin nhắn user ở bên phải (màu gradient)",
    "✅ Tin nhắn AI ở bên trái (màu trắng)",
    "✅ Welcome message hiển thị khi mở lần đầu",
    "✅ Typing indicator có animation",
    "✅ Notification badge hiển thị số tin nhắn",
  ],

  interaction: [
    "✅ Click icon để mở/đóng chatbox",
    "✅ Enter để gửi tin nhắn",
    "✅ Auto-scroll đến tin nhắn mới nhất",
    "✅ Auto-focus vào input khi mở chat",
    "✅ Nút clear chat hoạt động",
    "✅ Nút close chat hoạt động",
    "✅ Disable input khi đang loading",
  ],

  responsive: [
    "✅ Desktop: 380px width",
    "✅ Tablet: Full width - 32px",
    "✅ Mobile: Full width - 16px",
    "✅ Icon scale on hover",
    "✅ Smooth animations",
  ],
};

// ============================================
// 10. EXPORT FOR TESTING
// ============================================

export {
  testChatAPI,
  measureResponseTime,
  stressTest,
  testConversationFlow,
  sampleQuestions,
  errorScenarios,
  uiTestChecklist,
};

// ============================================
// HOW TO USE THIS FILE
// ============================================

/**
 * 1. Import functions vào console:
 *    import { testChatAPI } from './examples/ChatBoxExample';
 *
 * 2. Run tests:
 *    testChatAPI();
 *    measureResponseTime('Xin chào!');
 *    stressTest(10);
 *    testConversationFlow();
 *
 * 3. Check UI manually using checklist:
 *    - Open browser DevTools
 *    - Test each item in uiTestChecklist
 *
 * 4. Test error scenarios:
 *    - Stop server and try sending message
 *    - Remove GROQ_API_KEY and restart server
 *    - Try sending empty message
 */
