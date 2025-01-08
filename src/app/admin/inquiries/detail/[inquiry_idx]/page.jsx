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
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchInquiryDetail } from "../../fetchInquiryDetail/page";
import axios from "axios";

export default function CampingDetail({ params }) {
  const { inquiry_idx } = use(params); // URL에서 전달된 id 값
  const [data, setData] = useState(null); // 문의 데이터
  const [error, setError] = useState(null); // 에러 상태
  const [answer, setAnswer] = useState(null); // 답변 데이터
  const router = useRouter();

  const handleAnswerClick = (inquiry_idx) => {
    router.push(`/admin/inquiries/write/${inquiry_idx}`); // 답변 페이지로 이동
  };

  const handleUpdateClick = (inquiry_idx) => {
    router.push(`/admin/inquiries/update/${inquiry_idx}`); // 수정 페이지로 이동
  };

  const maskMiddleName = (name) => {
    if (!name || name.length === 0) return "";
    const length = name.length;

    if (length === 1) {
      return name;
    } else if (length === 2) {
      return name[0] + "*";
    } else {
      const firstChar = name[0];
      const lastChar = name[length - 1];
      const maskedMiddle = "*".repeat(length - 2);
      return firstChar + maskedMiddle + lastChar;
    }
  };

  // 화면 크기 체크 (1000px 이하에서 텍스트 숨기기)
  const isSmallScreen = useMediaQuery("(max-width:1000px)");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inquiry = await fetchInquiryDetail(inquiry_idx);
        if (!inquiry) {
          throw new Error("데이터를 찾을 수 없습니다.");
        }
        setData(inquiry);
        // 답변 데이터 가져오기
        const response = await axios.get(
          `http://localhost:8080/api/inquiry/inquiries/answer/${inquiry_idx}`
        );
        setAnswer(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "데이터를 가져오는 데 실패했습니다.");
      }
    };

    if (inquiry_idx) {
      fetchData();
    }
  }, [inquiry_idx]);

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
          <hr></hr>
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
                      <TableCell>{maskMiddleName(data.username)}</TableCell>
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
              {/* 답변 내용 */}
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
                  답변
                </Typography>
                {answer ? (
                  <>
                    <Typography variant="body1" sx={{ color: "#333" }}>
                      {answer.answer}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#007bff",
                        marginTop: "5px",
                        fontStyle: "italic",
                      }}
                    >
                      답변한 관리자 ID : {answer.admin_idx || "정보 없음"}
                      <br></br>
                      답변일자 : {answer.created_at}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1" sx={{ color: "red" }}>
                    답변이 아직 등록되지 않았습니다.
                  </Typography>
                )}
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
                {answer ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdateClick(data.inquiry_idx)}
                  >
                    답변 수정
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={() => handleAnswerClick(data.inquiry_idx)}
                  >
                    답변하기
                  </Button>
                )}
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
