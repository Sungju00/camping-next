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
import { useRouter } from "next/navigation"; // 라우터 사용
import Link from "next/link";
import { fetchOperatorDetail } from "../../fetchOperatorDetail/page";
import axios from "axios";

export default function CampingDetail({ params }) {
  const { business_idx } = use(params); // URL에서 전달된 id 값
  const [data, setData] = useState(null); // 캠핑장 데이터
  const [error, setError] = useState(null); // 에러 상태
  const router = useRouter();

  // 수정 페이지로 이동
  const handleDetailClick = (business_idx) => {
    router.push(`/admin/members/operator/update/${business_idx}`);
  };

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
  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return ""; // 잘못된 이메일 처리
    const [localPart, domain] = email.split("@"); // 이메일을 '@' 기준으로 나눔
    if (localPart.length <= 2) {
      return "**@" + domain; // 앞부분이 2글자 이하라면 전부 마스킹
    }
    const maskedLocalPart = localPart.slice(0, -2) + "**"; // 마지막 2글자를 '**'로 교체
    return maskedLocalPart + "@" + domain;
  };

  const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 2) return ""; // 빈 값 또는 너무 짧은 값 처리
    const visiblePart = phone.slice(0, -2); // 뒤의 두 자리를 제외한 부분
    return visiblePart + "**"; // 마지막 두 자리 마스킹
  };

  const handleDelete = async (business_idx) => {
    const confirmDelete = window.confirm(
      "정말로 이 사업자를 삭제하시겠습니까?"
    );
    if (!confirmDelete) {
      return; // 사용자가 취소 버튼을 누른 경우
    }
    // 숫자를 문자열로 변환
    const businessIdxAsString = business_idx.toString();
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/member/operators/delete/${businessIdxAsString}`
      );
      if (response.status === 200) {
        alert("사업자가 성공적으로 삭제되었습니다.");
        router.push("/admin/members/view");
      } else {
        alert(`사업자 삭제에 실패했습니다: ${response.data}`);
      }
    } catch (error) {
      console.error("사업자 삭제 요청 중 오류 발생:", error);
      alert(`오류 발생: ${error.response?.data || error.message}`);
    }
  };

  // 화면 크기 체크 (1000px 이하에서 텍스트 숨기기)
  const isSmallScreen = useMediaQuery("(max-width:1000px)");

  useEffect(() => {
    // 데이터를 가져오는 함수
    const fetchData = async () => {
      try {
        const operators = await fetchOperatorDetail(business_idx);
        if (!operators) {
          throw new Error("데이터를 찾을 수 없습니다.");
        }
        setData(operators);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "데이터를 가져오는 데 실패했습니다.");
      }
    };
    if (business_idx) {
      fetchData();
    }
  }, [business_idx]); // id가 변경되면 데이터 다시 가져오기

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

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
            사업자 상세 정보
          </Typography>
          <Link href="/admin/members/view" passHref>
            <p>[목록으로 돌아가기]</p>
          </Link>
          <hr></hr>
          {data ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between", // 좌우로 정렬
                  gap: "10px", // 두 테이블 간 간격
                  flexWrap: "wrap", // 화면이 좁아질 경우 테이블이 아래로 내려감
                }}
              >
                {/* 밑에 테이블 */}
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>사업자 IDX</TableCell>
                        <TableCell>{data.business_idx}</TableCell>
                      </TableRow>
                      <TableRow className="custom-table-row">
                        <TableCell
                          className="custom-table-cell-title"
                          sx={{ width: "40%" }}
                        >
                          회원 ID
                        </TableCell>
                        {data.id ? (
                          <TableCell>{data.id}</TableCell>
                        ) : (
                          <TableCell className="custom-table-cell">
                            정보없음
                          </TableCell>
                        )}
                      </TableRow>
                      <TableRow className="custom-table-row">
                        <TableCell
                          className="custom-table-cell-title"
                          sx={{ width: "30%" }}
                        >
                          이름
                        </TableCell>
                        {data.username ? (
                          <TableCell>{maskMiddleName(data.username)}</TableCell>
                        ) : (
                          <TableCell className="custom-table-cell">
                            정보없음
                          </TableCell>
                        )}
                      </TableRow>
                      <TableRow className="custom-table-row">
                        <TableCell
                          className="custom-table-cell-title"
                          sx={{ width: "30%" }}
                        >
                          이메일
                        </TableCell>
                        {data.email ? (
                          <TableCell className="custom-table-cell">
                            {maskEmail(data.email)}
                          </TableCell>
                        ) : (
                          <TableCell className="custom-table-cell">
                            정보없음
                          </TableCell>
                        )}
                      </TableRow>
                      <TableRow className="custom-table-row">
                        <TableCell
                          className="custom-table-cell-title"
                          sx={{ width: "30%" }}
                        >
                          전화번호
                        </TableCell>
                        {data.phone ? (
                          <TableCell>{maskPhoneNumber(data.phone)}</TableCell>
                        ) : (
                          <TableCell className="custom-table-cell">
                            정보없음
                          </TableCell>
                        )}
                      </TableRow>
                      <TableRow className="custom-table-row">
                        <TableCell className="custom-table-cell-title">
                          사업자번호
                        </TableCell>
                        {data.join_date ? (
                          <TableCell>{data.business_number}</TableCell>
                        ) : (
                          <TableCell className="custom-table-cell">
                            정보없음
                          </TableCell>
                        )}
                      </TableRow>
                      <TableRow className="custom-table-row">
                        <TableCell className="custom-table-cell-title">
                          담당 캠핑장 ID
                        </TableCell>
                        {data.join_date ? (
                          <TableCell>{data.contentId}</TableCell>
                        ) : (
                          <TableCell className="custom-table-cell">
                            정보없음
                          </TableCell>
                        )}
                      </TableRow>
                      <TableRow className="custom-table-row">
                        <TableCell className="custom-table-cell-title">
                          사업체 등록일자
                        </TableCell>
                        {data.started_date ? (
                          <TableCell>{data.started_date}</TableCell>
                        ) : (
                          <TableCell className="custom-table-cell">
                            정보없음
                          </TableCell>
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" justifyContent="flex-end" width={"100%"}>
                  <Link href="/admin/members/view" passHref>
                    <Button variant="outlined" sx={{ mr: 2 }}>
                      취소
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={() => handleDetailClick(data.user_idx)}
                  >
                    수정
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: "grey",
                      color: "white",
                      "&:hover": { backgroundColor: "#9A0007" },
                      marginLeft: "15px",
                    }}
                    onClick={() => handleDelete(data.business_idx)} // business_idx 전달
                  >
                    사업자에서 제거
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
