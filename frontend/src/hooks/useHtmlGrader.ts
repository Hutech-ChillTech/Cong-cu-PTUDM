import { useState, useCallback } from "react";
import { type TestCase } from "../types/database.types";

export interface CheckResult {
  testCaseId: string;
  pass: boolean;
  message: string;
}

export const useHtmlGrader = () => {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [isAllPassed, setIsAllPassed] = useState(false);

  // Update signature to accept html and css
  const runCodeCheck = useCallback(
    (html: string, css: string, testCases: TestCase[]) => {
      // Check if both are empty
      if (!html.trim() && !css.trim()) {
        setResults([]);
        setIsAllPassed(false);
        return;
      }

      // 1. Tạo iframe sandbox
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      // Sandbox attributes: allow-scripts để chạy JS (nếu cần), allow-same-origin để truy cập contentDocument
      // iframe.sandbox.add('allow-scripts', 'allow-same-origin');
      document.body.appendChild(iframe);

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          throw new Error(
            "Không thể khởi tạo môi trường kiểm tra (Sandbox Error)",
          );
        }

        // 2. Inject code vào iframe
        doc.open();
        doc.write(html);
        if (css) {
          doc.write(`<style>${css}</style>`);
        }
        doc.close();

        // 3. Chạy vòng lặp qua từng Test Case
        const checkResults: CheckResult[] = testCases.map((tc) => {
          // Lấy script kiểm tra từ trường 'input' (do đã map ở LessonList)
          // Fallback sang 'testCodes' nếu có (cho dữ liệu cũ)
          const validationScript =
            tc.input || (tc as TestCase & { testCodes?: string }).testCodes;

          if (!validationScript) {
            return {
              testCaseId: tc.testCaseId,
              pass: true,
              message: "Không có bài kiểm tra",
            };
          }

          try {
            // Tạo hàm kiểm tra, truyền vào 'iframe' để script có thể truy cập contentDocument
            // Script ví dụ: "const el = iframe.contentDocument.querySelector('h1'); return el ? true : 'Thiếu thẻ h1';"
            const checkFunc = new Function("iframe", validationScript);

            // Chạy hàm kiểm tra
            const result = checkFunc(iframe);

            // Logic: Nếu return true -> Pass. Nếu return string -> Fail + Message
            if (result === true || result === "Pass") {
              return {
                testCaseId: tc.testCaseId,
                pass: true,
                message: "Chính xác!",
              };
            } else {
              return {
                testCaseId: tc.testCaseId,
                pass: false,
                message:
                  typeof result === "string" && result !== "Fail"
                    ? result
                    : "Chưa thỏa mãn yêu cầu",
              };
            }
          } catch (err: unknown) {
            console.error("Lỗi kịch bản test:", err);
            return {
              testCaseId: tc.testCaseId,
              pass: false,
              message: `Lỗi cú pháp trong bài kiểm tra: ${err instanceof Error ? err.message : "Unknown error"}`,
            };
          }
        });

        // 4. Cập nhật State
        setResults(checkResults);

        // Kiểm tra xem đã pass hết chưa
        const allPassed =
          checkResults.length > 0 && checkResults.every((r) => r.pass);
        setIsAllPassed(allPassed);
      } catch (error) {
        console.error("Lỗi hệ thống chấm điểm:", error);
      } finally {
        // 5. Cleanup: Xóa iframe sau khi kiểm tra xong
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }
    },
    [],
  );

  // Trả về những gì Component cần
  return {
    results, // Mảng kết quả chi tiết
    isAllPassed, // Biến boolean tổng (True/False)
    runCodeCheck, // Hàm để kích hoạt việc chấm
    resetGrader: () => {
      setResults([]);
      setIsAllPassed(false);
    }, // Hàm reset khi chuyển bài
  };
};
