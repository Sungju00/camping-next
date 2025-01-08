"use client";

import React, { useState, useEffect, use } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/navigation"; // 라우터 사용
import Link from "next/link";
import { fetchInquiryDetail } from "../../fetchInquiryDetail/page";
import useAuthStore from "store/authStore";
import axios from "axios";

export default function CampingDetail({ params }) {
  const { inquiry_idx } = use(params); // URL에서 전달된 id 값
  const [data, setData] = useState(null); // 캠핑장 데이터
  const [error, setError] = useState(null); // 에러 상태
  const [answer, setAnswer] = useState(""); // 답변 내용
  const router = useRouter();
  const [userIdx, setUserIdx] = useState("");
  const [admin_idx, setAdminIdx] = useState("");
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;

  const maskMiddleName = (name) => {
    if (!name || name.length === 0) return ""; // 빈 문자열 처리
    const length = name.length;
    if (length === 1) {
      return name; // 1글자면 그대로 반환
    } else if (length === 2) {
      return name[0] + "*"; // 2글자면 마지막 글자 마스킹
    } else {
      const firstChar = name[0]; // 첫 글자
      const lastChar = name[length - 1]; // 마지막 글자
      const maskedMiddle = "*".repeat(length - 2); // 가운데 글자수만큼 '*'
      return firstChar + maskedMiddle + lastChar;
    }
  };

  // 화면 크기 체크 (1000px 이하에서 텍스트 숨기기)
  const isSmallScreen = useMediaQuery("(max-width:1000px)");

  useEffect(() => {
    // 데이터를 가져오는 함수
    const fetchData = async () => {
      try {
        const inquiry = await fetchInquiryDetail(inquiry_idx);
        if (!inquiry) {
          throw new Error("데이터를 찾을 수 없습니다.");
        }
        setData(inquiry);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "데이터를 가져오는 데 실패했습니다.");
      }
    };
    if (inquiry_idx) {
      fetchData();
    }
  }, [inquiry_idx]); // id가 변경되면 데이터 다시 가져오기
  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // FormData 객체 생성
    const data = new FormData();
    data.append("answer", answer); // 작성한 답변
    data.append("admin_idx", admin_idx); // 관리자 ID
    data.append("inquiry_idx", inquiry_idx); // 문의 ID
    try {
      // POST 요청
      const response = await fetch(
        "http://localhost:8080/api/inquiry/inquiries/answer/insert",
        {
          method: "POST",
          body: data,
        }
      );
      // 응답 처리
      if (response.ok) {
        alert("답변이 성공적으로 등록되었습니다!");
        router.push("/admin/inquiries"); // 문의 목록 페이지로 이동
      } else {
        const errorData = await response.json();
        alert(`답변 등록 실패: ${errorData.message || "오류가 발생했습니다."}`);
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("답변 등록 중 문제가 발생했습니다.");
    }
  };

  // 토큰
  const getUserIdx = async () => {
    try {
      const API_URL = `${LOCAL_API_BASE_URL}/users/profile`;
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`, // JWT 토큰 사용
        },
      });
      if (response.data.success) {
        const userIdx = response.data.data.user_idx; // `user_idx` 추출
        setUserIdx(userIdx);
      } else {
        console.error("프로필 가져오기 실패:", response.data.message);
      }
    } catch (error) {
      console.error("프로필 요청 오류:", error);
    }
  };
  const checkManagerType = async (userIdx) => {
    try {
      const API_URL = `${LOCAL_API_BASE_URL}/admin/admins/check-type?user_idx=${userIdx}`;
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`, // JWT 토큰 사용
        },
      });
      if (response.data) {
        const admin_idx = response.data.admin_idx; // admin_idx 추출
        setAdminIdx(admin_idx);
      } else {
        console.error("관리자 idx 가져오기 실패");
      }
    } catch (error) {
      console.error("관리자 idx 요청 오류:", error);
    }
  };
  // userIdx가 설정된 이후 관리자 idx 확인
  useEffect(() => {
    if (userIdx) {
      checkManagerType(userIdx); // userIdx를 기반으로 관리자 idx 확인
    }
  }, [userIdx]);
  useEffect(() => {
    if (token) {
      getUserIdx();
    }
  }, [token]);

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
            문의 답변하기
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between", // 좌우로 정렬
                  flexWrap: "wrap", // 화면이 좁아질 경우 테이블이 아래로 내려감
                }}
              >
                {/* 밑에 테이블 */}
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>IDX</TableCell>
                        <TableCell>{data.inquiry_idx}</TableCell>
                      </TableRow>
                      <TableRow className="custom-table-row">
                        <TableCell
                          className="custom-table-cell-title"
                          sx={{ width: "40%" }}
                        >
                          작성자
                        </TableCell>
                        {data.username ? (
                          <TableCell>{maskMiddleName(data.username)}</TableCell>
                        ) : (
                          <TableCell className="custom-table-cell">
                            정보없음
                          </TableCell>
                        )}
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
                {/* 답변 입력란 */}
                <Box mt={3} sx={{ width: "100%", marginBottom: "20px" }}>
                  <hr></hr>
                  <Typography gutterBottom fontSize={"17px"} marginTop={"30px"}>
                    답변 작성
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="답변 내용을 입력하세요."
                  />
                </Box>

                <Box display="flex" justifyContent="flex-end" width={"100%"}>
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
                    답변완료
                  </Button>
                </Box>
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
