"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchNoticeList } from "@/app/admin/notices/fetchNoticeList/page";

export default function NoticePage() {
  const [notices, setNotices] = useState([]); // 공지사항 상태 관리
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchNoticeList(); // API에서 데이터 가져오기
        const formattedData = data.map((notice) => ({
          id: notice.notice_idx,
          title: notice.notice_subject,
          writer: notice.id,
          date: new Date(notice.created_at).toLocaleDateString("ko-KR"),
          content: notice.notice_content,
          image: notice.file_path
            ? `http://localhost:8080/uploads/${notice.file_name}`
            : null,
        }));
        setNotices(formattedData); // 데이터를 상태에 저장
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError("공지사항을 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false); // 로딩 상태 해제
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6">로딩 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 5, color: "red" }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "900px", margin: "auto" }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ textAlign: "center", color: "#333" }}
      >
        공지사항
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {notices.map((notice) => (
        <Accordion
          key={notice.id}
          sx={{
            mb: 2,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: "#f5f5f5" }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {notice.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                작성자: {notice.writer} / 날짜: {notice.date}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {notice.image && (
              <Box
                component="img"
                src={notice.image}
                alt="공지 이미지"
                sx={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  mb: 2,
                }}
              />
            )}
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: notice.content }} // HTML 콘텐츠 렌더링
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
