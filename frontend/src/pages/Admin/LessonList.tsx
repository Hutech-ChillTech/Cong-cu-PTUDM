import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Form,
  Space,
  Card,
  message,
  Typography,
  Tabs,
  Switch,
  Upload,
  Checkbox,
  Popconfirm,
  Radio,
  Tooltip,
} from "antd";
import type { TabsProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  CodeOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  ArrowRightOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// Khai báo các service
import { lessonService } from "../../service/lesson.service";
import { testCaseService } from "../../service/testCase.service";
import { quizService } from "../../service/quiz.service";
import { uploadService } from "../../service/upload.service";
import { type Lesson, type TestCase } from "../../types/database.types";

// Interface cho payload
interface CreateTestCasePayload {
  lessonId: string;
  description?: string;
  input?: string;
  expectedOutput?: string;
  testCodes?: string;
}

const { Title } = Typography;

type LessonType = "normal" | "testcode" | "quiz";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | null;
  required: boolean;
}

// interface ExtendedLesson extends Lesson {
//   lessonType?: LessonType;
//   quiz?: QuizQuestion[];
// }

const normFile = (e: { fileList?: unknown[] } | unknown[]) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

interface LessonFormValues {
  lessonName?: string;
  isPreview?: boolean;
  content?: string;
  duration?: number | string;
  description?: string;
  input?: string;
  expectedOutput?: string;
  testCodes?: string;
  question?: string;
  options?: string | string[];
  answer?: string;
  videoFile?: unknown;
  hasTestCase?: boolean;
}

const TAB_ITEMS: TabsProps["items"] = [
  {
    key: "normal",
    label: (
      <span>
        <FileTextOutlined /> Bài học
      </span>
    ),
  },
  {
    key: "testcode",
    label: (
      <span>
        <CodeOutlined /> Test Code
      </span>
    ),
  },
  {
    key: "quiz",
    label: (
      <span>
        <QuestionCircleOutlined /> Trắc nghiệm
      </span>
    ),
  },
] as const;

const LessonList: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<
    {
      chapterQuizId: string;
      quizTitle?: string;
      description?: string;
      chapterId?: string;
      totalQuestions?: number;
      created_at?: string;
    }[]
  >([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<LessonType>("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<LessonType | null>(null);

  const [hasTestCase, setHasTestCase] = useState(false);
  const [tempLessonId, setTempLessonId] = useState<string | null>(null);

  // State cho bài quiz
  const [quizData, setQuizData] = useState<{
    title: string;
    description: string;
    questions: QuizQuestion[];
  }>({
    title: "Mẫu không có tiêu đề",
    description: "Mô tả biểu mẫu",
    questions: [
      {
        id: Date.now().toString(),
        question: "Câu hỏi không có tiêu đề",
        options: ["Tùy chọn 1"],
        correctAnswer: null,
        required: false,
      },
    ],
  });

  const chapterName = location.state?.chapterName || "Chương học";

  const beforeUpload = (file: File) => {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      message.error("Chỉ được tải lên file video!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  // Fetch lessons
  const fetchLessons = useCallback(async () => {
    if (!chapterId) return;
    try {
      setIsTableLoading(true);
      const data = await lessonService.getLessonByChapterId(chapterId);
      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setIsTableLoading(false);
    }
  }, [chapterId]);

  // Fetch quizzes
  const fetchQuizzes = useCallback(async () => {
    if (!chapterId) return;
    try {
      const data = await quizService.getQuizzesByChapter(chapterId);
      setQuizzes(data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }, [chapterId]);

  useEffect(() => {
    if (chapterId) {
      fetchLessons();
      fetchQuizzes();
    }
  }, [chapterId, fetchLessons, fetchQuizzes]);

  // Quiz functions
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "Câu hỏi không có tiêu đề",
      options: ["Tùy chọn 1"],
      correctAnswer: null,
      required: false,
    };
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
    });
  };

  const updateQuestion = (
    questionId: string,
    field: keyof QuizQuestion,
    value: string | number | boolean | string[] | null,
  ) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q,
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (quizData.questions.length > 1) {
      setQuizData({
        ...quizData,
        questions: quizData.questions.filter((q) => q.id !== questionId),
      });
    }
  };

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = quizData.questions.find(
      (q) => q.id === questionId,
    );
    if (questionToDuplicate) {
      const newQuestion = {
        ...questionToDuplicate,
        id: Date.now().toString(),
      };
      const index = quizData.questions.findIndex((q) => q.id === questionId);
      const newQuestions = [...quizData.questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuizData({
        ...quizData,
        questions: newQuestions,
      });
    }
  };

  const addOption = (questionId: string) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, `Tùy chọn ${q.options.length + 1}`],
          };
        }
        return q;
      }),
    });
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string,
  ) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    });
  };

  const deleteOption = (questionId: string, optionIndex: number) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) => {
        if (q.id === questionId && q.options.length > 1) {
          return {
            ...q,
            options: q.options.filter((_, i) => i !== optionIndex),
            correctAnswer:
              q.correctAnswer === optionIndex ? null : q.correctAnswer,
          };
        }
        return q;
      }),
    });
  };

  const handleEdit = async (
    record:
      | Lesson
      | {
          chapterQuizId: string;
          quizTitle?: string;
          description?: string;
          totalQuestions?: number;
        },
    type: LessonType,
  ) => {
    setEditingId(
      type === "quiz"
        ? (record as { chapterQuizId: string }).chapterQuizId
        : (record as Lesson).lessonId,
    );
    setEditingType(type);
    setActiveTab(type);

    if (type === "quiz") {
      // Load quiz data
      try {
        // Lấy chi tiết questions của quiz
        const questions = await quizService.getQuestionsByQuiz(
          (record as { chapterQuizId: string }).chapterQuizId,
        );

        let formattedQuestions: QuizQuestion[] = [];

        if (Array.isArray(questions) && questions.length > 0) {
          // Với mỗi question, lấy options
          const questionsWithOpts = await Promise.all(
            questions.map(
              async (q: {
                quizQuestionId: string;
                questionText: string;
                required?: boolean;
              }) => {
                const options = await quizService.getOptionsByQuestion(
                  q.quizQuestionId,
                );
                const optsText = options.map(
                  (o: { optionText: string }) => o.optionText,
                );
                const correctIndex = options.findIndex(
                  (o: { isCorrect: boolean }) => o.isCorrect,
                );

                return {
                  id: q.quizQuestionId,
                  question: q.questionText,
                  options: optsText.length > 0 ? optsText : ["Tùy chọn 1"],
                  correctAnswer: correctIndex !== -1 ? correctIndex : null,
                  required: q.required || false,
                };
              },
            ),
          );
          formattedQuestions = questionsWithOpts;
        } else {
          formattedQuestions = [
            {
              id: Date.now().toString(),
              question: "Câu hỏi mẫu",
              options: ["Tùy chọn 1"],
              correctAnswer: null,
              required: false,
            },
          ];
        }

        setQuizData({
          title: (record as { quizTitle?: string }).quizTitle || "",
          description: (record as { description?: string }).description || "",
          questions: formattedQuestions,
        });
      } catch (error) {
        console.error("Error loading quiz details:", error);
        message.error("Không thể tải chi tiết câu hỏi");
      }
    } else {
      form.setFieldsValue(record);
    }

    setShowForm(true);
  };

  const handleDelete = async (id: string, type: LessonType) => {
    try {
      if (type === "quiz") {
        await quizService.deleteQuiz(id);
        message.success("Xóa thành công!");
        fetchQuizzes();
      } else {
        await lessonService.deleteLesson(id);
        message.success("Xóa thành công!");
        fetchLessons();
      }
    } catch {
      message.error("Xóa thất bại");
    }
  };

  // Combine lessons and quizzes for display
  const combinedData = useMemo(() => {
    const lessonsWithType = lessons.map((lesson) => ({
      ...lesson,
      type: "lesson" as const,
      key: `lesson-${lesson.lessonId}`,
    }));

    const quizzesWithType = quizzes.map((quiz) => ({
      ...quiz,
      type: "quiz" as const,
      key: `quiz-${quiz.chapterQuizId}`,
      lessonName: quiz.quizTitle,
    }));

    return [...lessonsWithType, ...quizzesWithType];
  }, [lessons, quizzes]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: "#", render: (_record, _row, i) => i + 1, width: 50 },
      { title: "Tên bài học", dataIndex: "lessonName" },
      {
        title: "Loại bài",
        dataIndex: "type",
        width: 150,
        render: (type: string) => {
          if (type === "quiz") return "❓ Trắc nghiệm";
          return "📘 Bài học";
        },
      },
      {
        title: "Hành động",
        key: "action",
        align: "center",
        width: 120,
        render: (_, record) => (
          <Space size="middle">
            <Tooltip title="Sửa">
              <Button
                type="primary"
                ghost
                icon={<EditOutlined />}
                onClick={() =>
                  handleEdit(record, record.type === "quiz" ? "quiz" : "normal")
                }
              />
            </Tooltip>

            <Popconfirm
              title={`Xóa ${
                record.type === "quiz" ? "bài trắc nghiệm" : "bài học"
              } này?`}
              description="Hành động này không thể hoàn tác."
              onConfirm={() =>
                handleDelete(
                  record.type === "quiz"
                    ? record.chapterQuizId
                    : record.lessonId,
                  record.type === "quiz" ? "quiz" : "normal",
                )
              }
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa">
                <Button type="primary" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  );

  const renderFormFields = useCallback(() => {
    if (activeTab === "normal") {
      return (
        <>
          <Form.Item name="hasTestCase" valuePropName="checked">
            <Checkbox
              onChange={(e) => setHasTestCase(e.target.checked)}
              style={{ fontWeight: 500 }}
            >
              Bài học này có bài tập thực hành code (Thêm Test Case)
            </Checkbox>
          </Form.Item>

          <Form.Item
            label="Tên bài học"
            name="lessonName"
            rules={[{ required: true, message: "Nhập tên bài học" }]}
          >
            <Input placeholder="Nhập tiêu đề bài học..." />
          </Form.Item>
          <Form.Item label="Nội dung" name="content">
            <Input.TextArea rows={4} placeholder="Nhập nội dung bài học" />
          </Form.Item>

          {!hasTestCase && (
            <Form.Item
              label="Upload video"
              name="videoFile"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                beforeUpload={beforeUpload}
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Chọn file video</Button>
              </Upload>
            </Form.Item>
          )}
        </>
      );
    }

    if (activeTab === "testcode") {
      return (
        <>
          <Form.Item
            label="Tên test code / Bài học"
            name="lessonName"
            rules={[{ required: !tempLessonId, message: "Nhập tên test code" }]}
          >
            <Input
              placeholder="Tên bài kiểm tra code..."
              disabled={!!tempLessonId}
            />
          </Form.Item>

          <Form.Item
            label="Đề bài"
            name="description"
            rules={[{ required: true, message: "Nhập đề bài" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập đề bài code..." />
          </Form.Item>
          <Form.Item
            label="Input"
            name="input"
            rules={[{ required: true, message: "Nhập dữ liệu vào" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập đầu vào..." />
          </Form.Item>
          <Form.Item label="Đáp án mẫu" name="expectedOutput">
            <Input.TextArea rows={3} placeholder="Kết quả mong đợi..." />
          </Form.Item>

          <Form.Item
            label="Đoạn mã kiểm tra (Chỉ dành cho dạng bài HTML/CSS)"
            name="testCodes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Đoạn mã kiểm tra HTML/CSS.."
            />
          </Form.Item>
        </>
      );
    }

    // Quiz tab
    if (activeTab === "quiz") {
      return (
        <div style={{ marginTop: 20 }}>
          {/* Header Form */}
          <Card
            style={{
              borderLeft: "6px solid #3a49b7ff",
              marginBottom: 16,
              borderRadius: 8,
            }}
          >
            <Input
              value={quizData.title}
              onChange={(e) =>
                setQuizData({ ...quizData, title: e.target.value })
              }
              placeholder="Tiêu đề bài trắc nghiệm"
              style={{
                fontSize: 24,
                fontWeight: 500,
                border: "none",
                borderBottom: "1px solid #e0e0e0",
                marginBottom: 12,
              }}
            />
            <Input
              value={quizData.description}
              onChange={(e) =>
                setQuizData({ ...quizData, description: e.target.value })
              }
              placeholder="Mô tả biểu mẫu"
              style={{
                fontSize: 14,
                color: "#666",
                border: "none",
                borderBottom: "1px solid #e0e0e0",
              }}
            />
          </Card>

          {/* Questions */}
          {quizData.questions.map((question, qIndex) => (
            <Card
              key={question.id}
              style={{
                borderLeft: "6px solid #3a49b7ff",
                marginBottom: 16,
                borderRadius: 8,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <Input
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(question.id, "question", e.target.value)
                  }
                  placeholder={`Câu hỏi ${qIndex + 1}`}
                  style={{
                    fontSize: 16,
                    border: "none",
                    borderBottom: "1px solid #e0e0e0",
                    marginBottom: 12,
                  }}
                />
              </div>

              {/* Options */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{ marginBottom: 8, fontWeight: 500, color: "#1890ff" }}
                >
                  Chọn đáp án đúng:
                </div>
                <Radio.Group
                  value={question.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(question.id, "correctAnswer", e.target.value)
                  }
                  style={{ width: "100%" }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px",
                          borderRadius: "4px",
                          backgroundColor:
                            question.correctAnswer === optIndex
                              ? "#e6f7ff"
                              : "transparent",
                          border:
                            question.correctAnswer === optIndex
                              ? "1px solid #91d5ff"
                              : "1px solid transparent",
                        }}
                      >
                        <Radio value={optIndex} />
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, optIndex, e.target.value)
                          }
                          placeholder={`Tùy chọn ${optIndex + 1}`}
                          style={{ flex: 1 }}
                        />
                        {question.options.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => deleteOption(question.id, optIndex)}
                          />
                        )}
                        {question.correctAnswer === optIndex && (
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        )}
                      </div>
                    ))}
                  </Space>
                </Radio.Group>

                <Button
                  type="dashed"
                  onClick={() => addOption(question.id)}
                  style={{ marginTop: 12 }}
                >
                  Thêm tùy chọn
                </Button>
              </div>

              {/* Question Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <Space>
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => duplicateQuestion(question.id)}
                  >
                    Sao chép
                  </Button>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteQuestion(question.id)}
                    disabled={quizData.questions.length === 1}
                  >
                    Xóa
                  </Button>
                </Space>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14, color: "#666" }}>Bắt buộc</span>
                  <Switch
                    checked={question.required}
                    onChange={(checked) =>
                      updateQuestion(question.id, "required", checked)
                    }
                  />
                </div>
              </div>
            </Card>
          ))}

          {/* Add Question Button */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addQuestion}
              size="large"
            >
              Thêm câu hỏi
            </Button>
          </div>
        </div>
      );
    }

    return null;
  }, [activeTab, tempLessonId, hasTestCase, quizData]);

  const handleFinish = async (values: LessonFormValues) => {
    try {
      if (!chapterId || chapterId === "undefined") {
        message.error(
          "Lỗi: Không tìm thấy ID chương! Vui lòng quay lại và chọn chương đúng.",
        );
        return;
      }
      setIsSubmitting(true);

      // ========== QUIZ TAB ==========
      if (activeTab === "quiz") {
        if (!quizData.title || quizData.title === "Mẫu không có tiêu đề") {
          message.error("Vui lòng nhập tiêu đề bài trắc nghiệm!");
          setIsSubmitting(false);
          return;
        }

        // Validate questions
        const hasInvalidQuestion = quizData.questions.some(
          (q) => !q.question || q.question === "Câu hỏi không có tiêu đề",
        );
        if (hasInvalidQuestion) {
          message.error("Vui lòng nhập nội dung cho tất cả câu hỏi!");
          setIsSubmitting(false);
          return;
        }

        // Validate correct answers
        const hasNoCorrectAnswer = quizData.questions.some(
          (q) => q.correctAnswer === null,
        );
        if (hasNoCorrectAnswer) {
          message.error("Vui lòng chọn đáp án đúng cho tất cả câu hỏi!");
          setIsSubmitting(false);
          return;
        }

        if (editingId && editingType === "quiz") {
          // 1. Update thông tin cơ bản của Quiz
          await quizService.updateQuiz(editingId, {
            title: quizData.title,
            description: quizData.description,
          });

          // 2. Xóa tất cả câu hỏi cũ để tạo lại
          try {
            const oldQuestions =
              await quizService.getQuestionsByQuiz(editingId);
            if (Array.isArray(oldQuestions)) {
              for (const q of oldQuestions) {
                await quizService.deleteQuestion(q.quizQuestionId);
              }
            }
          } catch (e) {
            console.warn(
              "Không thể xóa câu hỏi cũ hoặc không có câu hỏi cũ",
              e,
            );
          }

          // 3. Tạo lại câu hỏi và đáp án từ Form
          for (const question of quizData.questions) {
            const createdQuestion = await quizService.createQuestion({
              chapterQuizId: editingId,
              questionText: question.question,
              questionType: "multiple_choice",
              required: question.required,
            });

            const questionId =
              (createdQuestion as Record<string, string>).quizQuestionId ||
              (createdQuestion as Record<string, string>).id;

            // Create options
            for (let i = 0; i < question.options.length; i++) {
              await quizService.createOption({
                quizQuestionId: questionId,
                optionText: question.options[i],
                isCorrect: question.correctAnswer === i,
              });
            }
          }

          message.success("Cập nhật bài trắc nghiệm thành công!");
        } else {
          // Create new quiz
          const createdQuiz = await quizService.createQuiz({
            title: quizData.title,
            chapterId: chapterId!,
            description: quizData.description,
          });

          const quizId =
            (createdQuiz as Record<string, string>).chapterQuizId ||
            (createdQuiz as Record<string, string>).id;

          // Create questions
          for (const question of quizData.questions) {
            const createdQuestion = await quizService.createQuestion({
              chapterQuizId: quizId,
              questionText: question.question,
              questionType: "multiple_choice",
              required: question.required,
            });

            const questionId =
              (createdQuestion as Record<string, string>).quizQuestionId ||
              (createdQuestion as Record<string, string>).id;

            // Create options
            for (let i = 0; i < question.options.length; i++) {
              await quizService.createOption({
                quizQuestionId: questionId,
                optionText: question.options[i],
                isCorrect: question.correctAnswer === i,
              });
            }
          }

          message.success("Thêm bài trắc nghiệm thành công!");
        }

        // Reset form
        form.resetFields();
        setQuizData({
          title: "Mẫu không có tiêu đề",
          description: "Mô tả biểu mẫu",
          questions: [
            {
              id: Date.now().toString(),
              question: "Câu hỏi không có tiêu đề",
              options: ["Tùy chọn 1"],
              correctAnswer: null,
              required: false,
            },
          ],
        });
        setEditingId(null);
        setEditingType(null);
        setActiveTab("normal");
        setShowForm(false);
        fetchQuizzes();
        return;
      }

      // ========== NORMAL & TESTCODE TABS ==========
      let newLessonId = tempLessonId;

      if (!newLessonId) {
        // ✅ Chuyển sang JSON object thay vì FormData
        const lessonData: Record<string, string | boolean> = {
          lessonName: values.lessonName?.trim() || "",
          chapterId: chapterId || "",
          isPreview: values.isPreview || false,
          lessonType: activeTab,
        };

        if (activeTab === "normal") {
          if (values.content) {
            lessonData.content = values.content;
          }

          if (!hasTestCase) {
            const fileList = values.videoFile as { originFileObj?: File }[];

            // ✅ Kiểm tra bắt buộc có video
            if (!fileList || fileList.length === 0) {
              message.error("Vui lòng chọn video để upload!");
              setIsSubmitting(false);
              return;
            }

            const fileObj = fileList[0];
            if (!fileObj.originFileObj) {
              message.error("File video không hợp lệ!");
              setIsSubmitting(false);
              return;
            }

            try {
              message.loading({
                content: "Đang upload video lên Cloud... Vui lòng đợi!",
                key: "uplo",
                duration: 0,
              });

              const cloudData = await uploadService.uploadVideo(
                fileObj.originFileObj,
              );

              // ✅ Sử dụng đúng tên field từ uploadService (url, publicId)
              const { url, publicId } = cloudData;

              lessonData.videoUrl = url;
              lessonData.publicId = publicId;

              message.success({
                content: "Upload video thành công!",
                key: "uplo",
              });
            } catch (uErr) {
              console.error(uErr);
              message.error({
                content: "Upload video thất bại! Vui lòng thử lại.",
                key: "uplo",
              });
              setIsSubmitting(false);
              return;
            }
          }
        }

        const createdLesson = await lessonService.createLesson(lessonData);
        if (!createdLesson) throw new Error("Không tạo được bài học");

        newLessonId =
          (createdLesson as Record<string, string>).lessonId ||
          (createdLesson as Record<string, string>).id;

        // Nếu có Test Case, chuyển tab để nhập tiếp
        if (activeTab === "normal" && hasTestCase) {
          message.success(
            "Đã lưu bài học video. Vui lòng nhập thông tin Test Case.",
          );
          setTempLessonId(newLessonId);
          setActiveTab("testcode");
          form.setFieldsValue({ lessonName: values.lessonName });
          setIsSubmitting(false);
          return;
        }
      }

      // Kiểm tra lại ID lần nữa cho chắc
      if (!newLessonId) {
        message.warning("Lỗi ID bài học.");
        return;
      }

      if (activeTab === "testcode") {
        const testCasePayload: Partial<TestCase> = {
          lessonId: newLessonId,
          description: values.description,
          input: values.input,
          expectedOutput: values.expectedOutput,
          testCodes: values.testCodes,
        };

        await testCaseService.createTestCase(
          testCasePayload as CreateTestCasePayload,
        );
        message.success("Thêm Test Case thành công!");

        form.resetFields();
        setHasTestCase(false);
        setTempLessonId(null);
        setActiveTab("normal");
        fetchLessons();
        return;
      }

      message.success("Lưu bài học thành công!");
      setShowForm(false);
      form.resetFields();
      setTempLessonId(null);
      setEditingId(null);
      setEditingType(null);
      fetchLessons();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi lưu bài học");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmitButtonText = () => {
    if (activeTab === "normal") {
      return hasTestCase
        ? "Lưu video & Tiếp tục thêm Test Code"
        : "Lưu bài học";
    }
    if (activeTab === "testcode") return "Lưu Test Code";
    return "Lưu Quiz";
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <Button
              icon={
                <ArrowRightOutlined style={{ transform: "rotate(180deg)" }} />
              }
              onClick={() => navigate(-1)}
            />
            <Title level={4} style={{ margin: 0 }}>
              Quản lý bài học - {chapterName}
            </Title>
          </Space>
        }
        extra={
          !showForm && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setShowForm(true);
                setTempLessonId(null);
                setEditingId(null);
                setEditingType(null);
                form.resetFields();
                setActiveTab("normal");
              }}
            >
              Thêm bài học mới
            </Button>
          )
        }
      >
        {showForm ? (
          <div>
            <Tabs
              activeKey={activeTab}
              items={TAB_ITEMS}
              onChange={(key) => setActiveTab(key as LessonType)}
              type="card"
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{ isPreview: false }}
            >
              {renderFormFields()}

              {activeTab !== "quiz" && (
                <Form.Item name="isPreview" valuePropName="checked">
                  <Switch
                    checkedChildren="Xem trước"
                    unCheckedChildren="Khóa"
                  />
                </Form.Item>
              )}

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    {getSubmitButtonText()}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setTempLessonId(null);
                      setEditingId(null);
                      setEditingType(null);
                    }}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <Table
            rowKey="key"
            columns={columns}
            dataSource={combinedData}
            loading={isTableLoading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
};

export default LessonList;
