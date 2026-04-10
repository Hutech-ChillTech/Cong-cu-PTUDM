import React, { useEffect, useState } from "react";
import {
  Card,
  Statistic,
  Table,
  DatePicker,
  Select,
  Spin,
  Row,
  Col,
  Progress,
  Tag,
  Space,
  Empty,
  Button,
  message,
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  RiseOutlined,
  FireOutlined,
  CrownOutlined,
  BookOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { gamificationService } from "../../service/gamification.service";
import {
  xpStatisticsService,
  type XPOverview,
  type XPPeriodData,
  type TopUserXP,
  type CourseXPStats,
  type InstructorXPStats,
} from "../../service/xpStatistics.service";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const XPStatisticsPage: React.FC = () => {
  // Tổng quan XP
  const [overview, setOverview] = useState<XPOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // XP theo thời gian
  const [periodData, setPeriodData] = useState<XPPeriodData[]>([]);
  const [loadingPeriod, setLoadingPeriod] = useState(false);
  const [periodFilter, setPeriodFilter] = useState({
    startDate: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
    groupBy: "day" as "day" | "month" | "year",
  });

  // Top user XP
  const [topUsers, setTopUsers] = useState<TopUserXP[]>([]);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);

  // XP theo khóa học
  const [courseId, setCourseId] = useState<string>("");
  const [courseXP, setCourseXP] = useState<CourseXPStats | null>(null);
  const [loadingCourseXP, setLoadingCourseXP] = useState(false);

  // XP theo instructor
  const [instructorId, setInstructorId] = useState<string>("");
  const [instructorXP, setInstructorXP] = useState<InstructorXPStats | null>(
    null,
  );
  const [loadingInstructorXP, setLoadingInstructorXP] = useState(false);

  // Fetch tổng quan XP - Using real API
  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const data = await xpStatisticsService.getOverviewXP();
      setOverview(data);
    } catch (error) {
      message.error("Không thể tải thống kê tổng quan");
      console.error(error);
      // Fallback to gamification service if statistics API fails
      try {
        const [leaderboard, achievements] = await Promise.all([
          gamificationService.getLeaderboard(100),
          gamificationService.getAllAchievements(),
        ]);
        const totalXP = leaderboard.reduce(
          (sum, user) => sum + user.totalXP,
          0,
        );
        const avgXP =
          leaderboard.length > 0 ? Math.round(totalXP / leaderboard.length) : 0;
        setOverview({
          totalXP,
          totalUsers: leaderboard.length,
          totalAchievements: achievements.length,
          avgXP,
        });
      } catch (fallbackError) {
        console.error(fallbackError);
        setOverview(null);
      }
    } finally {
      setLoadingOverview(false);
    }
  };

  // Fetch XP theo thời gian - Using real API
  const fetchPeriodData = async () => {
    setLoadingPeriod(true);
    try {
      const data = await xpStatisticsService.getXPByPeriod(periodFilter);
      setPeriodData(data);
    } catch (error) {
      message.error("Không thể tải dữ liệu XP theo thời gian");
      console.error(error);
      setPeriodData([]);
    } finally {
      setLoadingPeriod(false);
    }
  };

  // Fetch top user XP - Using real API
  const fetchTopUsers = async () => {
    setLoadingTopUsers(true);
    try {
      const data = await xpStatisticsService.getTopUsers(10);
      setTopUsers(data);
    } catch (error) {
      message.error("Không thể tải bảng xếp hạng");
      console.error(error);
      try {
        const leaderboard = await gamificationService.getLeaderboard(10);
        setTopUsers(leaderboard);
      } catch (fallbackError) {
        message.error("Không thể tải bảng xếp hạng");
        console.error(fallbackError);
        setTopUsers([]);
      }
    } finally {
      setLoadingTopUsers(false);
    }
  };

  // Fetch all data
  const fetchAllData = () => {
    fetchOverview();
    fetchPeriodData();
    fetchTopUsers();
  };

  useEffect(() => {
    fetchOverview();
    fetchTopUsers();
  }, []);

  useEffect(() => {
    fetchPeriodData();
  }, [periodFilter]);

  // Fetch XP theo khóa học - Using real API
  useEffect(() => {
    if (!courseId) return;

    const fetchCourseXP = async () => {
      setLoadingCourseXP(true);
      try {
        const data = await xpStatisticsService.getCourseXP(courseId);
        setCourseXP(data);
      } catch (error) {
        message.error("Không thể tải thống kê XP khóa học");
        console.error(error);
        setCourseXP(null);
      } finally {
        setLoadingCourseXP(false);
      }
    };

    fetchCourseXP();
  }, [courseId]);

  // Fetch XP theo instructor - Using real API
  useEffect(() => {
    if (!instructorId) return;

    const fetchInstructorXP = async () => {
      setLoadingInstructorXP(true);
      try {
        const data = await xpStatisticsService.getInstructorXP(instructorId);
        setInstructorXP(data);
      } catch (error) {
        message.error("Không thể tải thống kê XP giảng viên");
        console.error(error);
        setInstructorXP(null);
      } finally {
        setLoadingInstructorXP(false);
      }
    };

    fetchInstructorXP();
  }, [instructorId]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    if (rank === 1) return "#FFD700"; // Gold
    if (rank === 2) return "#C0C0C0"; // Silver
    if (rank === 3) return "#CD7F32"; // Bronze
    return "#8c8c8c";
  };

  // Get level color
  const getLevelColor = (level: number) => {
    if (level >= 50) return "red";
    if (level >= 30) return "orange";
    if (level >= 15) return "blue";
    if (level >= 5) return "green";
    return "default";
  };

  // Table columns with enhanced styling
  const topUserColumns = [
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      align: "center" as const,
      render: (rank: number) => (
        <Space>
          {rank <= 3 ? (
            <CrownOutlined
              style={{ color: getMedalColor(rank), fontSize: 20 }}
            />
          ) : (
            <span
              style={{ fontSize: 16, fontWeight: "bold", color: "#8c8c8c" }}
            >
              #{rank}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Người dùng",
      dataIndex: "userName",
      key: "userName",
      render: (name: string) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 120,
      align: "center" as const,
      render: (level: number) => (
        <Tag color={getLevelColor(level)} icon={<ThunderboltOutlined />}>
          Level {level}
        </Tag>
      ),
    },
    {
      title: "Tổng XP",
      dataIndex: "totalXP",
      key: "totalXP",
      width: 150,
      align: "right" as const,
      render: (xp: number) => (
        <span style={{ fontWeight: 600, color: "#52c41a", fontSize: 14 }}>
          {formatNumber(xp)} XP
        </span>
      ),
    },
    {
      title: "Tiến độ",
      key: "progress",
      width: 200,
      render: (record: TopUserXP) => {
        const maxXP = topUsers[0]?.totalXP || 1;
        const percent = (record.totalXP / maxXP) * 100;
        return (
          <Progress
            percent={Math.round(percent)}
            size="small"
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
          />
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#ffffff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Quản lý học tập
        </h1>
      </div>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={true} loading={loadingOverview}>
            <Statistic
              title="Tổng XP hệ thống"
              value={overview?.totalXP || 0}
              formatter={(value) => formatNumber(Number(value))}
              prefix={<FireOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              <TeamOutlined /> Toàn hệ thống
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={true} loading={loadingOverview}>
            <Statistic
              title="Tổng người dùng"
              value={overview?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              <RiseOutlined /> Đang hoạt động
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={true} loading={loadingOverview}>
            <Statistic
              title="Thành tựu"
              value={overview?.totalAchievements || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              <TrophyOutlined /> Achievements
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={true} loading={loadingOverview}>
            <Statistic
              title="XP Trung bình/Người dùng"
              value={overview?.avgXP || 0}
              formatter={(value) => formatNumber(Number(value))}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#eb2f96" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              <FireOutlined /> Trung bình
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card
        bordered={true}
        style={{ marginBottom: 24 }}
        title="Bộ lọc"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAllData}
            loading={loadingOverview || loadingPeriod || loadingTopUsers}
          >
            Làm mới
          </Button>
        }
      >
        <Space wrap>
          <RangePicker
            value={[dayjs(periodFilter.startDate), dayjs(periodFilter.endDate)]}
            onChange={(dates) => {
              if (dates) {
                setPeriodFilter((f) => ({
                  ...f,
                  startDate: dates[0]?.format("YYYY-MM-DD") || f.startDate,
                  endDate: dates[1]?.format("YYYY-MM-DD") || f.endDate,
                }));
              }
            }}
            format="DD/MM/YYYY"
          />
          <Select
            value={periodFilter.groupBy}
            onChange={(groupBy) => setPeriodFilter((f) => ({ ...f, groupBy }))}
            style={{ width: 150 }}
          >
            <Select.Option value="day">Theo ngày</Select.Option>
            <Select.Option value="month">Theo tháng</Select.Option>
            <Select.Option value="year">Theo năm</Select.Option>
          </Select>
        </Space>
      </Card>

      {/* XP Trend Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={16}>
          <Card
            bordered={true}
            title="Xu hướng XP theo thời gian"
            style={{ height: 400 }}
          >
            <Spin spinning={loadingPeriod}>
              {periodData.length > 0 ? (
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={periodData}>
                      <defs>
                        <linearGradient
                          id="colorXP"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#1890ff"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#1890ff"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="period"
                        stroke="#666"
                        style={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#666" style={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.95)",
                          border: "1px solid #d9d9d9",
                          borderRadius: 4,
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="totalXP"
                        stroke="#1890ff"
                        fillOpacity={1}
                        fill="url(#colorXP)"
                        name="Tổng XP"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty
                  description="Không có dữ liệu"
                  style={{ paddingTop: 100 }}
                />
              )}
            </Spin>
          </Card>
        </Col>

        {/* Course & Instructor Stats */}
        <Col xs={24} xl={8}>
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            <Card
              bordered={true}
              title={
                <Space>
                  <BookOutlined />
                  XP theo Khóa học
                </Space>
              }
            >
              <Select
                placeholder="Chọn khóa học"
                value={courseId}
                onChange={setCourseId}
                options={[]}
                style={{ width: "100%", marginBottom: 16 }}
                size="large"
              />
              <Spin spinning={loadingCourseXP}>
                {courseXP ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Statistic
                      title="Tổng XP"
                      value={courseXP.totalXP}
                      formatter={(value) => formatNumber(Number(value))}
                      prefix={<FireOutlined style={{ color: "#1890ff" }} />}
                    />
                    <Statistic
                      title="Số user hoàn thành"
                      value={courseXP.count}
                      prefix={<UserOutlined style={{ color: "#52c41a" }} />}
                    />
                  </Space>
                ) : (
                  <Empty
                    description="Chọn khóa học để xem thống kê"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Spin>
            </Card>

            <Card
              bordered={true}
              title={
                <Space>
                  <TeamOutlined />
                  XP theo Giảng viên
                </Space>
              }
            >
              <Select
                placeholder="Chọn giảng viên"
                value={instructorId}
                onChange={setInstructorId}
                options={[]}
                style={{ width: "100%", marginBottom: 16 }}
                size="large"
              />
              <Spin spinning={loadingInstructorXP}>
                {instructorXP ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Statistic
                      title="Tổng XP"
                      value={instructorXP.totalXP}
                      formatter={(value) => formatNumber(Number(value))}
                      prefix={<FireOutlined style={{ color: "#1890ff" }} />}
                    />
                    <Statistic
                      title="Số học viên"
                      value={instructorXP.count}
                      prefix={<UserOutlined style={{ color: "#52c41a" }} />}
                    />
                  </Space>
                ) : (
                  <Empty
                    description="Chọn giảng viên để xem thống kê"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Spin>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Top Users Leaderboard */}
      <Card bordered={true} title="👑 Bảng Xếp hạng Top User">
        <Spin spinning={loadingTopUsers}>
          <Table
            dataSource={topUsers}
            columns={topUserColumns}
            rowKey="userId"
            pagination={false}
            scroll={{ x: 800 }}
            rowClassName={(_record, index) => (index < 3 ? "top-user-row" : "")}
          />
        </Spin>
      </Card>

      <style>{`
        .top-user-row {
          background: #fafafa;
        }
        .top-user-row:hover {
          background: #f0f0f0 !important;
        }
      `}</style>
    </div>
  );
};

export default XPStatisticsPage;
