"use client";

import React, { useState, useEffect, use } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchInquiryDetail } from "../../fetchInquiryDetail/page";
import axios from "axios";
import useAuthStore from "store/authStore";

export default function CampingDetail({ params }) {
  const { inquiry_idx } = use(params); // URL에서 전달된 id 값
  const [data, setData] = useState(null); // 문의 데이터
  const [error, setError] = useState(null); // 에러 상태
  const [formData, setFormData] = useState({
    answer: "",
    admin_idx: "",
  }); // 답변 수정 폼 데이터
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
  const router = useRouter();

  const isSmallScreen = useMediaQuery("(max-width:1000px)");

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inquiry = await fetchInquiryDetail(inquiry_idx);
        if (!inquiry) {
          throw new Error("데이터를 찾을 수 없습니다.");
        }
        setData(inquiry);

        // 기존 답변 데이터 가져오기
        const response = await axios.get(
          `http://localhost:8080/api/inquiry/inquiries/answer/${inquiry_idx}`
        );
        if (response.data) {
          setFormData({
            answer: response.data.answer || "",
            admin_idx: response.data.admin_idx || "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "데이터를 가져오는 데 실패했습니다.");
      }
    };

    if (inquiry_idx) {
      fetchData();
    }
  }, [inquiry_idx]);

  const handleSubmit = async () => {
    if (!formData.answer) {
      alert("답변 내용을 입력해주세요.");
      return;
    }
    if (!formData.admin_idx) {
      alert("관리자 ID가 설정되지 않았습니다.");
      return;
    }

    const url = `http://localhost:8080/api/inquiry/inquiries/answer/update/${inquiry_idx}`;
    const formdata = new FormData();

    // 모든 데이터를 FormData로 변환
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        formdata.append(key, value);
      }
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formdata,
      });
      if (response.ok) {
        alert("답변 수정이 완료되었습니다.");
        router.push("/admin/inquiries");
      } else {
        const error = await response.text();
        alert(`업데이트 실패: ${error}`);
      }
    } catch (err) {
      console.error("업데이트 중 오류 발생:", err);
      alert("업데이트 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <Box
        sx={{
          padding: "80px 40px 40px 40px",
          backgroundColor: "grey",
          color: "black",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
            width: "600px",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              marginTop: "20px",
              marginBottom: "20px",
              fontWeight: "bold",
              fontSize: "28px",
              color: "#333",
            }}
          >
            문의 상세보기
          </Typography>
          <Link
            href="/admin/inquiries"
            passHref
            style={{ textDecoration: "none", color: "black" }}
          >
            <p>[목록으로 돌아가기]</p>
          </Link>
          <hr />
          {data ? (
            <>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>IDX</TableCell>
                      <TableCell>{data.inquiry_idx}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>작성자</TableCell>
                      <TableCell>{data.username}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>제목</TableCell>
                      <TableCell>{data.subject}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>내용</TableCell>
                      <TableCell>{data.content}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>작성일자</TableCell>
                      <TableCell>{data.created_at}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* 답변 수정 */}
              <Box
                sx={{
                  marginTop: "20px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  답변 수정
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={formData.answer} // 기존 답변 내용을 value에 설정
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  } // 입력값이 반영되도록 업데이트
                  placeholder="답변 내용을 입력하세요."
                />
              </Box>

              <Box
                display="flex"
                justifyContent="flex-end"
                width="100%"
                marginTop="20px"
              >
                <Link href="/admin/inquiries" passHref>
                  <Button variant="outlined" sx={{ mr: 2 }}>
                    취소
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  수정완료
                </Button>
              </Box>
            </>
          ) : (
            <p>데이터 없음</p>
          )}
        </Box>
      </Box>
    </div>
  );
}
