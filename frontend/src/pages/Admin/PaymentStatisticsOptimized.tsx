import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  Table,
  DatePicker,
  Select,
  Button,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  message,
  Modal,
  Input,
  Spin,
  Tooltip,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import Chart from "chart.js/auto";
import { paymentService } from "../../service/payment.service";
import type {
  PaymentStatisticsOverview,
  RevenueByPeriod,
  TopCourse,
  Payment,
  UserPaymentStats,
} from "../../service/payment.service";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

const PaymentStatisticsOptimized: React.FC = () => {
  // State
  const [overview, setOverview] = useState<PaymentStatisticsOverview | null>(
    null,
  );
  const [revenueData, setRevenueData] = useState<RevenueByPeriod[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userStats, setUserStats] = useState<UserPaymentStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Chart refs
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const methodChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChartInstance = useRef<Chart | null>(null);
  const methodChartInstance = useRef<Chart | null>(null);

  // Filters
  const [groupBy, setGroupBy] = useState<"day" | "month" | "year">("month");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(6, "months"),
    dayjs(),
  ]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [methodFilter, setMethodFilter] = useState<string | undefined>();

  // Pagination
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

  // Fetch overview data
  const fetchOverview = useCallback(async () => {
    try {
      const data = await paymentService.getStatisticsOverview();
      setOverview(data);
    } catch (error) {
      message.error("Không thể tải thống kê tổng quan");
      console.error(error);
    }
  }, []);

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    try {
      const data = await paymentService.getRevenueByPeriod(
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD"),
        groupBy,
      );
      setRevenueData(data);
    } catch (error) {
      message.error("Không thể tải dữ liệu doanh thu");
      console.error(error);
    }
  }, [dateRange, groupBy]);

  // Fetch top courses
  const fetchTopCourses = useCallback(async () => {
    try {
      const data = await paymentService.getTopSellingCourses(10);
      setTopCourses(data);
    } catch (error) {
      message.error("Không thể tải top khóa học");
      console.error(error);
    }
  }, []);

  // Fetch user payment statistics
  const fetchUserStats = useCallback(async () => {
    try {
      const data = await paymentService.getTopSpenders(10);
      setUserStats(data);
    } catch (error) {
      message.error("Không thể tải thống kê học viên");
      console.error(error);
    }
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setTableLoading(true);
    try {
      const data = await paymentService.getAllPayments({
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter,
        method: methodFilter,
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      });
      setPayments(data.payments);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách giao dịch");
      console.error(error);
    } finally {
      setTableLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.current,
    pagination.pageSize,
    statusFilter,
    methodFilter,
    dateRange,
  ]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOverview(),
        fetchRevenueData(),
        fetchTopCourses(),
        fetchPayments(),
        fetchUserStats(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    fetchOverview,
    fetchRevenueData,
    fetchTopCourses,
    fetchPayments,
    fetchUserStats,
  ]);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch payments when pagination, filters, or dateRange change
  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.current,
    pagination.pageSize,
    statusFilter,
    methodFilter,
    dateRange,
  ]);

  // Update revenue chart
  useEffect(() => {
    if (!revenueChartRef.current || revenueData.length === 0) return;

    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }

    const ctx = revenueChartRef.current.getContext("2d");
    if (!ctx) return;

    revenueChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: revenueData.map((item) => item.period),
        datasets: [
          {
            label: "Tổng doanh thu",
            data: revenueData.map((item) => item.revenue),
            borderColor: "#1890ff",
            backgroundColor: "rgba(24, 144, 255, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "MOMO",
            data: revenueData.map((item) => item.methods.MOMO || 0),
            borderColor: "#eb2f96",
            backgroundColor: "rgba(235, 47, 150, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "VNPAY",
            data: revenueData.map((item) => item.methods.VNPAY || 0),
            borderColor: "#52c41a",
            backgroundColor: "rgba(82, 196, 26, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${new Intl.NumberFormat(
                  "vi-VN",
                  { style: "currency", currency: "VND" },
                ).format(context.parsed.y)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return new Intl.NumberFormat("vi-VN", {
                  notation: "compact",
                }).format(Number(value));
              },
            },
          },
        },
      },
    });

    return () => {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
    };
  }, [revenueData]);

  // Update method chart
  useEffect(() => {
    if (!methodChartRef.current || !overview) return;

    if (methodChartInstance.current) {
      methodChartInstance.current.destroy();
    }

    const ctx = methodChartRef.current.getContext("2d");
    if (!ctx) return;

    methodChartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: overview.revenueByMethod.map((item) => item.method),
        datasets: [
          {
            data: overview.revenueByMethod.map((item) => item.revenue),
            backgroundColor: ["#eb2f96", "#52c41a", "#faad14", "#1890ff"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(context.parsed))}`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (methodChartInstance.current) {
        methodChartInstance.current.destroy();
      }
    };
  }, [overview]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Handle confirm payment
  const handleConfirmPayment = async (paymentId: string) => {
    Modal.confirm({
      title: "Xác nhận thanh toán",
      content: "Bạn có chắc chắn muốn xác nhận thanh toán này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await paymentService.confirmPayment(paymentId);
          message.success("Xác nhận thanh toán thành công!");
          fetchPayments();
          fetchOverview();
        } catch (error) {
          message.error("Không thể xác nhận thanh toán");
          console.error(error);
        }
      },
    });
  };

  // Handle reject payment
  const handleRejectPayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setRejectModalVisible(true);
  };

  const confirmRejectPayment = async () => {
    if (!selectedPaymentId || !rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await paymentService.rejectPayment(selectedPaymentId, rejectReason);
      message.success("Từ chối thanh toán thành công!");
      setRejectModalVisible(false);
      setRejectReason("");
      setSelectedPaymentId(null);
      fetchPayments();
      fetchOverview();
    } catch (error) {
      message.error("Không thể từ chối thanh toán");
      console.error(error);
    }
  };

  // Helper function to remove Vietnamese diacritics for PDF
  const removeVietnameseTones = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Format currency for PDF (without special characters)
  const formatCurrencyForPDF = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  // Export data to PDF
  const handleExportData = async () => {
    try {
      // Dynamic import
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("BAO CAO GIAO DICH", 14, 20);

      // Date range
      doc.setFontSize(11);
      doc.text(
        `Thoi gian: ${dateRange[0].format("DD/MM/YYYY")} - ${dateRange[1].format("DD/MM/YYYY")}`,
        14,
        30,
      );

      let currentY = 45;

      // Overview statistics
      if (overview) {
        doc.setFontSize(14);
        doc.text("TONG QUAN", 14, 40);

        const overviewData = [
          ["Tong doanh thu", formatCurrencyForPDF(overview.totalRevenue)],
          ["Tong giao dich", overview.totalTransactions.toString()],
          ["Giao dich thanh cong", overview.successfulTransactions.toString()],
          ["Giao dich that bai", overview.failedTransactions.toString()],
          ["Giao dich cho xu ly", overview.pendingTransactions.toString()],
        ];

        autoTable(doc, {
          startY: currentY,
          head: [["CHI TIEU", "GIA TRI"]],
          body: overviewData,
          theme: "grid",
          headStyles: { fillColor: [24, 144, 255] },
        });

        currentY =
          (doc as unknown as Record<string, { finalY: number }>).lastAutoTable
            .finalY + 15;
      }

      // Top courses
      if (topCourses.length > 0) {
        doc.setFontSize(14);
        doc.text("TOP 10 KHOA HOC BAN CHAY", 14, currentY);

        const coursesData = topCourses.map((course, index) => [
          (index + 1).toString(),
          removeVietnameseTones(course.courseName),
          removeVietnameseTones(course.instructor),
          formatCurrencyForPDF(course.totalRevenue),
          course.totalSales.toString(),
        ]);

        autoTable(doc, {
          startY: currentY + 5,
          head: [["STT", "KHOA HOC", "GIANG VIEN", "DOANH THU", "LUOT BAN"]],
          body: coursesData,
          theme: "grid",
          headStyles: { fillColor: [24, 144, 255] },
        });
      }

      // Payments table
      if (payments.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("DANH SACH GIAO DICH", 14, 20);

        const paymentsData = payments.map((payment) => [
          payment.transactionId ||
            payment.orderId ||
            payment.paymentId.slice(0, 8),
          removeVietnameseTones(payment.user?.userName || "N/A"),
          removeVietnameseTones(payment.course?.courseName || "N/A"),
          formatCurrencyForPDF(payment.amount),
          payment.paymentMethod,
          payment.paymentStatus === "COMPLETED"
            ? "Thanh cong"
            : payment.paymentStatus === "PENDING"
              ? "Cho xu ly"
              : "That bai",
          dayjs(payment.created_at).format("DD/MM/YYYY"),
        ]);

        autoTable(doc, {
          startY: 25,
          head: [
            [
              "MA GD",
              "NGUOI DUNG",
              "KHOA HOC",
              "SO TIEN",
              "PT",
              "TRANG THAI",
              "NGAY",
            ],
          ],
          body: paymentsData,
          theme: "grid",
          headStyles: { fillColor: [24, 144, 255] },
          styles: { fontSize: 8 },
        });
      }

      // Save PDF
      doc.save(`bao-cao-giao-dich-${dayjs().format("YYYY-MM-DD")}.pdf`);
      message.success("Xuat du lieu thanh cong!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      message.error("Khong the xuat du lieu. Vui long thu lai!");
    }
  };

  // Table columns
  const columns: ColumnsType<Payment> = [
    {
      title: "Mã GD",
      key: "transactionId",
      width: 180,
      ellipsis: true,
      render: (record: Payment) => (
        <Tooltip
          title={record.transactionId || record.orderId || record.paymentId}
        >
          <span style={{ fontFamily: "monospace", fontSize: 13 }}>
            {record.transactionId ||
              record.orderId ||
              record.paymentId.slice(0, 8)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Người dùng",
      dataIndex: ["user", "userName"],
      key: "userName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Khóa học",
      dataIndex: ["course", "courseName"],
      key: "courseName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
      render: (method: string) => (
        <Tag color={method === "MOMO" ? "magenta" : "green"}>{method}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 120,
      render: (status: string) => {
        const statusConfig: Record<
          string,
          { color: string; icon: React.ReactNode; text: string }
        > = {
          COMPLETED: {
            color: "success",
            icon: <CheckCircleOutlined />,
            text: "Thành công",
          },
          PENDING: {
            color: "warning",
            icon: <ClockCircleOutlined />,
            text: "Chờ xử lý",
          },
          FAILED: {
            color: "error",
            icon: <CloseCircleOutlined />,
            text: "Thất bại",
          },
        };
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_: unknown, record: Payment) => {
        if (record.paymentStatus === "PENDING") {
          return (
            <Space size="small">
              <Tooltip title="Xác nhận">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleConfirmPayment(record.paymentId)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleRejectPayment(record.paymentId)}
                />
              </Tooltip>
            </Space>
          );
        }
        return <Tag color="default">Đã xử lý</Tag>;
      },
    },
  ];

  // Top courses columns
  const topCoursesColumns: ColumnsType<TopCourse> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_: unknown, __: TopCourse, index: number) => (
        <span style={{ fontWeight: 500 }}>{index + 1}</span>
      ),
    },
    {
      title: "Khóa học",
      key: "course",
      width: 280,
      render: (record: TopCourse) => (
        <Space size={12}>
          <img
            src={record.avatarURL}
            alt={record.courseName}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 6,
              flexShrink: 0,
            }}
          />
          <span style={{ lineHeight: 1.5 }}>{record.courseName}</span>
        </Space>
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "instructor",
      key: "instructor",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      width: 150,
      align: "right",
      render: (revenue: number) => (
        <span style={{ fontWeight: 600, color: "#52c41a", fontSize: 14 }}>
          {formatCurrency(revenue)}
        </span>
      ),
    },
    {
      title: "Lượt bán",
      dataIndex: "totalSales",
      key: "totalSales",
      width: 110,
      align: "center",
      render: (sales: number) => (
        <Tag
          color="blue"
          icon={<ShoppingCartOutlined />}
          style={{ padding: "4px 12px" }}
        >
          {sales}
        </Tag>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div
        style={{ padding: "24px", background: "#ffffff", minHeight: "100vh" }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
            Quản lý Giao dịch
          </h1>
        </div>

        {/* Overview Cards */}
        {overview && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={true}>
                <Statistic
                  title="Tổng Doanh Thu"
                  value={overview.totalRevenue}
                  prefix={<DollarOutlined />}
                  formatter={(value) =>
                    formatCurrency(Number(value)).replace("₫", "")
                  }
                  suffix="₫"
                  valueStyle={{ color: "#1890ff" }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  <TeamOutlined /> {overview.totalTransactions} giao dịch
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={true}>
                <Statistic
                  title="Giao Dịch Thành Công"
                  value={overview.successfulTransactions}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  <RiseOutlined />{" "}
                  {(
                    (overview.successfulTransactions /
                      overview.totalTransactions) *
                    100
                  ).toFixed(1)}
                  % tỷ lệ thành công
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={true}>
                <Statistic
                  title="Doanh Thu Hôm Nay"
                  value={overview.monthlyRevenue.revenue}
                  prefix={<RiseOutlined />}
                  formatter={(value) =>
                    formatCurrency(Number(value)).replace("₫", "")
                  }
                  suffix="₫"
                  valueStyle={{ color: "#faad14" }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  <ShoppingCartOutlined /> {overview.monthlyRevenue.count} giao
                  dịch
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless">
                <Statistic
                  title="Giao Dịch Thất Bại"
                  value={overview.failedTransactions}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  <ClockCircleOutlined /> {overview.pendingTransactions} đang
                  chờ
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters */}
        <Card
          bordered={true}
          style={{ marginBottom: 24 }}
          title="Bộ lọc"
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAllData}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportData}
                type="primary"
              >
                Xuất dữ liệu
              </Button>
            </Space>
          }
        >
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]!, dates[1]!]);
                }
              }}
              format="DD/MM/YYYY"
            />
            <Select
              value={groupBy}
              onChange={setGroupBy}
              style={{ width: 150 }}
            >
              <Select.Option value="day">Theo ngày</Select.Option>
              <Select.Option value="month">Theo tháng</Select.Option>
              <Select.Option value="year">Theo năm</Select.Option>
            </Select>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value="COMPLETED">Thành công</Select.Option>
              <Select.Option value="PENDING">Chờ xử lý</Select.Option>
              <Select.Option value="FAILED">Thất bại</Select.Option>
            </Select>
            <Select
              placeholder="Phương thức"
              value={methodFilter}
              onChange={setMethodFilter}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value="MOMO">MOMO</Select.Option>
              <Select.Option value="VNPAY">VNPAY</Select.Option>
            </Select>
          </Space>
        </Card>

        {/* Charts */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <Card
              bordered={true}
              title="Biểu đồ doanh thu theo thời gian"
              style={{ height: 400 }}
            >
              <div style={{ height: 320 }}>
                <canvas ref={revenueChartRef} />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              bordered={true}
              title="Phân bố phương thức thanh toán"
              style={{ height: 400 }}
            >
              <div style={{ height: 320 }}>
                <canvas ref={methodChartRef} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Top Courses and User Stats Tables */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card bordered={true} title="Top 10 Khóa Học Bán Chạy">
              <Table
                columns={topCoursesColumns}
                dataSource={topCourses}
                rowKey="courseId"
                pagination={false}
                scroll={{ x: 700 }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card bordered={true} title="👥 Top 10 Học Viên Chi Tiêu Cao">
              <Table
                columns={[
                  {
                    title: "STT",
                    key: "index",
                    width: 70,
                    align: "center",
                    render: (
                      _: unknown,
                      __: UserPaymentStats,
                      index: number,
                    ) => <span style={{ fontWeight: 500 }}>{index + 1}</span>,
                  },
                  {
                    title: "Học viên",
                    key: "user",
                    width: 250,
                    render: (record: UserPaymentStats) => (
                      <Space size={12}>
                        {record.avatarURL && (
                          <img
                            src={record.avatarURL}
                            alt={record.userName}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div style={{ padding: "4px 0" }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            {record.userName}
                          </div>
                          <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                            {record.email}
                          </div>
                        </div>
                      </Space>
                    ),
                  },
                  {
                    title: "Tổng chi tiêu",
                    dataIndex: "totalSpent",
                    key: "totalSpent",
                    width: 150,
                    align: "right",
                    render: (amount: number) => (
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1890ff",
                          fontSize: 14,
                        }}
                      >
                        {formatCurrency(amount)}
                      </span>
                    ),
                    sorter: (a, b) => a.totalSpent - b.totalSpent,
                    defaultSortOrder: "descend",
                  },
                  {
                    title: "Giao dịch",
                    dataIndex: "transactionCount",
                    key: "transactions",
                    width: 110,
                    align: "center",
                    render: (count: number) => (
                      <Tag
                        color="blue"
                        style={{ padding: "4px 12px", margin: 0 }}
                      >
                        {count} giao dịch
                      </Tag>
                    ),
                  },
                ]}
                dataSource={userStats}
                rowKey="userId"
                pagination={false}
                scroll={{ x: 580 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Payments Table */}
        <Card bordered={true} title="Danh Sách Giao Dịch">
          <Table
            columns={columns}
            dataSource={payments}
            rowKey="paymentId"
            loading={tableLoading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} giao dịch`,
            }}
            onChange={(newPagination) => {
              setPagination(newPagination);
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Reject Modal */}
        <Modal
          title="Từ chối thanh toán"
          open={rejectModalVisible}
          onOk={confirmRejectPayment}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectReason("");
            setSelectedPaymentId(null);
          }}
          okText="Xác nhận từ chối"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <div style={{ marginBottom: 16 }}>
            <label>Lý do từ chối:</label>
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối thanh toán..."
            />
          </div>
        </Modal>
      </div>
    </Spin>
  );
};

export default PaymentStatisticsOptimized;
