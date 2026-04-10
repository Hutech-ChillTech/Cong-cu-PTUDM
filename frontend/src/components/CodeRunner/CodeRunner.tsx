import React, { useState } from "react";
import { Button, message, Tag } from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  codeExecutionService,
  type CodeSubmissionRequest,
} from "../../service/codeExecution.service";
import type { TestCase } from "../../types/database.types";

interface CodeRunResult {
  passed?: number;
  total?: number;
  results?: TestResult[];
  stdout?: string | null;
  status?: { id: number; description: string };
  time?: string | null;
  memory?: number | null;
  stderr?: string | null;
  compile_output?: string | null;
}

interface TestResult {
  testCaseIndex?: number;
  description?: string | null;
  input?: string | null;
  expectedOutput?: string | null;
  actualOutput: string | null;
  isPassed?: boolean;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
  stderr: string | null;
  compile_output: string | null;
}

interface CodeRunnerProps {
  code: string;
  languageId: number;
  testCases?: TestCase[];
  onResult?: (result: CodeRunResult) => void;
}

/**
 * Component helper để chạy code với Judge0
 * Sử dụng trong CompilerComponent hoặc bất kỳ nơi nào cần chạy code
 */
const CodeRunner: React.FC<CodeRunnerProps> = ({
  code,
  languageId,
  testCases,
  onResult,
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runCode = async () => {
    if (!code.trim()) {
      message.warning("Vui lòng nhập code trước khi chạy!");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // Nếu có test cases, chạy từng test case
      if (testCases && testCases.length > 0) {
        const testResults = [];

        for (let i = 0; i < testCases.length; i++) {
          const testCase = testCases[i];

          const payload: CodeSubmissionRequest = {
            source_code: code,
            language_id: languageId,
            stdin: testCase.input || "",
            expected_output: testCase.expectedOutput || "",
            testCaseId: testCase.testCaseId,
          };

          const result = await codeExecutionService.runCode(payload);

          // Kiểm tra kết quả
          const isPassed =
            result.status.id === 3 && // Accepted
            result.stdout?.trim() === testCase.expectedOutput?.trim();

          testResults.push({
            testCaseIndex: i + 1,
            description: testCase.description,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: result.stdout,
            isPassed,
            status: result.status,
            time: result.time,
            memory: result.memory,
            stderr: result.stderr,
            compile_output: result.compile_output,
          });
        }

        setResults(testResults);

        // Tính tổng kết
        const passedCount = testResults.filter((r) => r.isPassed).length;
        const totalCount = testResults.length;

        if (passedCount === totalCount) {
          message.success(`✅ Tất cả ${totalCount} test case đều PASS!`);
        } else {
          message.warning(`⚠️ ${passedCount}/${totalCount} test case PASS`);
        }

        if (onResult) {
          onResult({
            passed: passedCount,
            total: totalCount,
            results: testResults,
          });
        }
      } else {
        // Không có test case, chỉ chạy code thông thường
        const payload: CodeSubmissionRequest = {
          source_code: code,
          language_id: languageId,
        };

        const result = await codeExecutionService.runCode(payload);

        setResults([
          {
            actualOutput: result.stdout,
            status: result.status,
            time: result.time,
            memory: result.memory,
            stderr: result.stderr,
            compile_output: result.compile_output,
          },
        ]);

        if (result.status.id === 3) {
          message.success("✅ Code chạy thành công!");
        } else {
          message.error(`❌ ${result.status.description}`);
        }

        if (onResult) {
          onResult(result as unknown as CodeRunResult);
        }
      }
    } catch (error: unknown) {
      console.error("Error running code:", error);
      message.error(
        error instanceof Error ? error.message : "Lỗi khi chạy code",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        onClick={runCode}
        loading={loading}
        size="large"
      >
        {loading ? "Đang chạy..." : "Chạy Code"}
      </Button>

      {/* Hiển thị kết quả */}
      {results.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: 16,
                marginBottom: 12,
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                backgroundColor: result.isPassed ? "#f6ffed" : "#fff2e8",
              }}
            >
              {result.testCaseIndex && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Test Case #{result.testCaseIndex}</strong>
                  {result.isPassed ? (
                    <Tag
                      color="success"
                      icon={<CheckCircleOutlined />}
                      style={{ marginLeft: 8 }}
                    >
                      PASS
                    </Tag>
                  ) : (
                    <Tag
                      color="error"
                      icon={<CloseCircleOutlined />}
                      style={{ marginLeft: 8 }}
                    >
                      FAIL
                    </Tag>
                  )}
                </div>
              )}

              {result.description && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Mô tả:</strong> {result.description}
                </div>
              )}

              {result.input && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Input:</strong>
                  <pre
                    style={{
                      background: "#f5f5f5",
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    {result.input}
                  </pre>
                </div>
              )}

              {result.expectedOutput && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Expected Output:</strong>
                  <pre
                    style={{
                      background: "#f5f5f5",
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    {result.expectedOutput}
                  </pre>
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <strong>Actual Output:</strong>
                <pre
                  style={{ background: "#f5f5f5", padding: 8, borderRadius: 4 }}
                >
                  {result.actualOutput || "(empty)"}
                </pre>
              </div>

              {result.stderr && (
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "red" }}>Error:</strong>
                  <pre
                    style={{
                      background: "#fff1f0",
                      padding: 8,
                      borderRadius: 4,
                      color: "red",
                    }}
                  >
                    {result.stderr}
                  </pre>
                </div>
              )}

              {result.compile_output && (
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: "orange" }}>Compile Output:</strong>
                  <pre
                    style={{
                      background: "#fffbe6",
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    {result.compile_output}
                  </pre>
                </div>
              )}

              <div style={{ fontSize: 12, color: "#666" }}>
                <Tag>Status: {result.status.description}</Tag>
                {result.time && <Tag>Time: {result.time}s</Tag>}
                {result.memory && <Tag>Memory: {result.memory} KB</Tag>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeRunner;

/**
 * CÁCH SỬ DỤNG:
 *
 * 1. Import component:
 * import CodeRunner from '../../components/CodeRunner/CodeRunner';
 *
 * 2. Sử dụng trong component:
 * <CodeRunner
 *   code={code}
 *   languageId={LANGUAGE_IDS.JAVASCRIPT}
 *   testCases={lessonTestCases}
 *   onResult={(result) => {
 *     console.log('Result:', result);
 *     // Xử lý kết quả, ví dụ: lưu vào database, cập nhật progress, etc.
 *   }}
 * />
 *
 * 3. Hoặc tích hợp vào CompilerComponent hiện có
 */
