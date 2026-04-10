import React, { useState } from 'react';
import {
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    SendOutlined,
    GithubOutlined,
    LinkedinOutlined,
    FacebookOutlined
} from '@ant-design/icons';
import { message } from 'antd';
import styles from '../../styles/ContactPage.module.css';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            message.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            message.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className={styles.contactPage}>
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Liên hệ với chúng tôi</h1>
                    <p className={styles.pageSubtitle}>
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                    </p>
                </div>

                <div className={styles.contentWrapper}>
                    {/* Contact Info Cards */}
                    <div className={styles.infoSection}>
                        <h2 className={styles.sectionTitle}>Thông tin liên hệ</h2>

                        <div className={styles.infoCards}>
                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}>
                                    <MailOutlined className={styles.icon} />
                                </div>
                                <h3>Email</h3>
                                <p>support@skillcoder.vn</p>
                                <p>contact@skillcoder.vn</p>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}>
                                    <PhoneOutlined className={styles.icon} />
                                </div>
                                <h3>Điện thoại</h3>
                                <p>+84 123 456 789</p>
                                <p>+84 987 654 321</p>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.iconWrapper}>
                                    <EnvironmentOutlined className={styles.icon} />
                                </div>
                                <h3>Địa chỉ</h3>
                                <p>Đại học Công nghệ TP.HCM</p>
                                <p>475A Điện Biên Phủ, Q.Bình Thạnh</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Gửi tin nhắn cho chúng tôi</h2>

                        <form className={styles.contactForm} onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Họ và tên *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject">Tiêu đề</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Chủ đề tin nhắn"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">Nội dung *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Nhập nội dung tin nhắn của bạn..."
                                    rows={6}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>Đang gửi...</>
                                ) : (
                                    <>
                                        <SendOutlined /> Gửi tin nhắn
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Team Section */}
                <div className={styles.teamSection}>
                    <h2 className={styles.sectionTitle}>Đội ngũ phát triển</h2>
                    <p className={styles.teamDescription}>
                        SkillCoder - Hệ thống học lập trình thông minh được xây dựng bởi đội ngũ sinh viên HUTECH với niềm đam mê công nghệ và giáo dục
                    </p>

                    <div className={styles.teamGrid}>
                        <div className={styles.teamCard}>
                            <div className={styles.avatar}>
                                <img src="https://ui-avatars.com/api/?name=Le+Hai+Dang&background=a8c0ff&color=fff&size=120" alt="Lê Hải Đăng" />
                            </div>
                            <h3>Lê Hải Đăng</h3>
                            <p className={styles.role}>Backend Developer</p>
                            <p className={styles.bio}>
                                Chuyên phát triển API và xử lý logic phía server, đảm bảo hệ thống hoạt động ổn định
                            </p>
                            <div className={styles.socialLinks}>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                    <GithubOutlined />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                                    <LinkedinOutlined />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <FacebookOutlined />
                                </a>
                            </div>
                        </div>

                        <div className={styles.teamCard}>
                            <div className={styles.avatar}>
                                <img src="https://ui-avatars.com/api/?name=Tran+Khanh+Linh&background=c2e9fb&color=333&size=120" alt="Trần Khánh Linh" />
                            </div>
                            <h3>Trần Khánh Linh</h3>
                            <p className={styles.role}>Frontend Developer</p>
                            <p className={styles.bio}>
                                Xây dựng giao diện người dùng đẹp mắt và trải nghiệm tương tác mượt mà
                            </p>
                            <div className={styles.socialLinks}>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                    <GithubOutlined />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                                    <LinkedinOutlined />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <FacebookOutlined />
                                </a>
                            </div>
                        </div>

                        <div className={styles.teamCard}>
                            <div className={styles.avatar}>
                                <img src="https://ui-avatars.com/api/?name=Ho+Truong+Duc+Khai&background=a8c0ff&color=fff&size=120" alt="Hồ Trường Đức Khải" />
                            </div>
                            <h3>Hồ Trường Đức Khải</h3>
                            <p className={styles.role}>Backend Developer</p>
                            <p className={styles.bio}>
                                Phát triển và tối ưu hóa cơ sở dữ liệu, xây dựng API hiệu quả
                            </p>
                            <div className={styles.socialLinks}>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                    <GithubOutlined />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                                    <LinkedinOutlined />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <FacebookOutlined />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
