import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { message } from "antd";
import {
  PlayCircleFilled,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
  CodeOutlined,
  DesktopOutlined,
  ConsoleSqlOutlined,
} from "@ant-design/icons";
import { useHtmlGrader } from "../../hooks/useHtmlGrader";
import {
  codeExecutionService,
  LANGUAGE_IDS,
} from "../../service/codeExecution.service";
import { type TestCase } from "../../types/database.types";
import "./CompilerComponent.css";

interface CompilerProps {
  code: string;
  setCode: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  testCases?: TestCase[];
}

interface CompilerTestResult {
  testCaseIndex: number;
  description: string | null;
  input: string | null;
  expectedOutput: string | null;
  actualOutput: string | null;
  isPassed: boolean;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
  stderr: string | null;
  compile_output: string | null;
}

const CompilerComponent: React.FC<CompilerProps> = ({
  code,
  setCode,
  output,
  setOutput,
  testCases = [],
}) => {
  const [language, setLanguage] = useState("html");
  const [activeTab, setActiveTab] = useState<"html" | "css">("html");
  const [cssCode, setCssCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<CompilerTestResult[]>([]);
  const [showPreview, setShowPreview] = useState(true);

  const { results, isAllPassed, runCodeCheck, resetGrader } = useHtmlGrader();

  useEffect(() => {
    resetGrader();
    setTestResults([]);
    setOutput("Nhấn ▶ Run để chạy code của bạn");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Map language to Judge0 language ID
  const getLanguageId = (lang: string): number => {
    switch (lang) {
      case "javascript":
        return LANGUAGE_IDS.JAVASCRIPT;
      case "python":
        return LANGUAGE_IDS.PYTHON;
      case "cpp":
        return LANGUAGE_IDS.CPP;
      default:
        return LANGUAGE_IDS.JAVASCRIPT;
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      message.warning("Vui lòng nhập code trước khi chạy!");
      return;
    }

    if (language === "html") {
      // HTML/CSS: Dùng grader hiện tại
      runCodeCheck(code, cssCode, testCases);
      setOutput("⏳ Đang kiểm tra code HTML của bạn...");
    } else {
      // JavaScript, Python, C++: Dùng Judge0
      setIsRunning(true);
      setTestResults([]);
      setOutput("⏳ Đang chạy code trên server...");

      try {
        if (testCases && testCases.length > 0) {
          // Có test cases: Chạy từng test case
          const results = [];

          for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            const payload = {
              source_code: code,
              language_id: getLanguageId(language),
              stdin: testCase.input || "",
              expected_output: testCase.expectedOutput || "",
              testCaseId: testCase.testCaseId,
            };

            const result = await codeExecutionService.runCode(payload);

            // Kiểm tra kết quả
            const isPassed =
              result.status.id === 3 && // Accepted
              result.stdout?.trim() === testCase.expectedOutput?.trim();

            results.push({
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

          setTestResults(results);

          // Tính tổng kết
          const passedCount = results.filter((r) => r.isPassed).length;
          const totalCount = results.length;

          if (passedCount === totalCount) {
            setOutput(`✅ Tất cả ${totalCount} test case đều PASS!`);
            message.success(
              `Chúc mừng! ${passedCount}/${totalCount} test cases passed`,
            );
          } else {
            setOutput(`⚠️ ${passedCount}/${totalCount} test case PASS`);
            message.warning(`${passedCount}/${totalCount} test cases passed`);
          }
        } else {
          // Không có test case: Chạy code thông thường
          const payload = {
            source_code: code,
            language_id: getLanguageId(language),
          };

          const result = await codeExecutionService.runCode(payload);

          if (result.status.id === 3) {
            setOutput(result.stdout || "(no output)");
            message.success("Code chạy thành công!");
          } else if (result.stderr) {
            setOutput(`Error:\n${result.stderr}`);
            message.error(result.status.description);
          } else if (result.compile_output) {
            setOutput(`Compile Error:\n${result.compile_output}`);
            message.error("Compile error");
          } else {
            setOutput(
              `Status: ${result.status.description}\n${result.message || ""}`,
            );
            message.error(result.status.description);
          }
        }
      } catch (error: unknown) {
        console.error("Error running code:", error);
        setOutput(
          `Error: ${error instanceof Error ? error.message : "Không thể chạy code"}`,
        );
        message.error("Lỗi khi chạy code");
      } finally {
        setIsRunning(false);
      }
    }
  };

  const resetCode = () => {
    setCode("");
    setCssCode("");
    resetGrader();
    setTestResults([]);
    setOutput("Đã reset code");
    message.info("Code đã được reset");
  };

  // Calculate progress
  const totalTests = language === "html" ? results.length : testResults.length;
  const passedTests =
    language === "html"
      ? results.filter((r) => r.pass).length
      : testResults.filter((r) => r.isPassed).length;
  const progressPercent = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="compiler-container">
      {/* Header with Controls */}
      <div className="compiler-header">
        <div className="compiler-controls">
          <div className="language-selector">
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRunning}
            >
              <option value="html">🌐 HTML/CSS</option>
              <option value="javascript">📜 JavaScript</option>
              <option value="python">🐍 Python</option>
              <option value="cpp">⚙️ C++</option>
            </select>
          </div>

          <button
            className="btn-run"
            onClick={runCode}
            disabled={isRunning}
            title="Run code (Ctrl+Enter)"
          >
            {isRunning ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Running...
              </>
            ) : (
              <>
                <PlayCircleFilled />
                Run
              </>
            )}
          </button>

          <button
            className="btn-reset"
            onClick={resetCode}
            disabled={isRunning}
            title="Reset code"
          >
            <ReloadOutlined />
          </button>

          {language === "html" && (
            <button
              className="btn-toggle-preview"
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          )}
        </div>

        {/* Test Progress Bar */}
        {testCases.length > 0 && (
          <div className="test-progress">
            <div className="progress-info">
              <span className="progress-label">
                Test Cases: {passedTests}/{totalTests}
              </span>
              <span className="progress-percent">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className={`progress-bar-fill ${progressPercent === 100 ? "complete" : ""}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Section */}
      <div className="compiler-body">
        <div className="editor-section">
          {/* Tabs for HTML/CSS */}
          {language === "html" && (
            <div className="editor-tabs">
              <button
                className={`tab ${activeTab === "html" ? "active" : ""}`}
                onClick={() => setActiveTab("html")}
              >
                <FileTextOutlined />
                HTML
              </button>
              <button
                className={`tab ${activeTab === "css" ? "active" : ""}`}
                onClick={() => setActiveTab("css")}
              >
                <CodeOutlined />
                CSS
              </button>
            </div>
          )}

          {/* Monaco Editor */}
          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={
                language === "html"
                  ? activeTab === "html"
                    ? "html"
                    : "css"
                  : language
              }
              theme="vs-dark"
              value={
                language === "html"
                  ? activeTab === "html"
                    ? code
                    : cssCode
                  : code
              }
              onChange={(value) => {
                if (language === "html") {
                  if (activeTab === "html") setCode(value || "");
                  else setCssCode(value || "");
                } else {
                  setCode(value || "");
                }
              }}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollbar: {
                  vertical: "auto",
                  horizontal: "auto",
                },
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="output-section">
          {/* HTML Preview */}
          {language === "html" && showPreview && (
            <div className="preview-panel">
              <div className="panel-header">
                <DesktopOutlined />
                Preview
              </div>
              <div className="preview-content">
                <iframe
                  title="preview"
                  srcDoc={`${code}<style>${cssCode}</style>`}
                  className="preview-iframe"
                />
              </div>
            </div>
          )}

          {/* Console / Test Results */}
          <div className="console-panel">
            <div className="panel-header">
              <ConsoleSqlOutlined />
              {testCases.length > 0 ? "Test Results" : "Console"}
            </div>
            <div className="console-content">
              {/* HTML Test Results */}
              {language === "html" && results.length > 0 ? (
                <div className="test-results">
                  {results.map((res, idx) => (
                    <div
                      key={idx}
                      className={`test-case ${res.pass ? "passed" : "failed"}`}
                    >
                      <div className="test-case-header">
                        <span className="test-icon">
                          {res.pass ? "✅" : "❌"}
                        </span>
                        <span className="test-number">
                          Test Case #{idx + 1}
                        </span>
                      </div>
                      <div className="test-message">{res.message}</div>
                    </div>
                  ))}
                  {isAllPassed && (
                    <div className="success-message">
                      🎉 Chúc mừng! Bạn đã hoàn thành tất cả test cases!
                    </div>
                  )}
                </div>
              ) : testResults.length > 0 ? (
                /* Other Languages Test Results */
                <div className="test-results">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`test-case ${result.isPassed ? "passed" : "failed"}`}
                    >
                      <div className="test-case-header">
                        <span className="test-icon">
                          {result.isPassed ? "✅" : "❌"}
                        </span>
                        <span className="test-number">
                          Test Case #{result.testCaseIndex}
                        </span>
                        <span className="test-meta">
                          {result.time && `⏱️ ${result.time}s`}
                          {result.memory && ` | 💾 ${result.memory}KB`}
                        </span>
                      </div>

                      {result.description && (
                        <div className="test-description">
                          {result.description}
                        </div>
                      )}

                      <div className="test-details">
                        {result.input && (
                          <div className="test-detail">
                            <span className="detail-label">Input:</span>
                            <span className="detail-value">{result.input}</span>
                          </div>
                        )}
                        <div className="test-detail">
                          <span className="detail-label">Expected:</span>
                          <span className="detail-value">
                            {result.expectedOutput}
                          </span>
                        </div>
                        <div className="test-detail">
                          <span className="detail-label">Got:</span>
                          <span
                            className={`detail-value ${result.isPassed ? "success" : "error"}`}
                          >
                            {result.actualOutput || "(empty)"}
                          </span>
                        </div>
                      </div>

                      {result.stderr && (
                        <div className="test-error">
                          ❌ Error: {result.stderr}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Default Output */
                <pre className="console-output">{output}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompilerComponent;
