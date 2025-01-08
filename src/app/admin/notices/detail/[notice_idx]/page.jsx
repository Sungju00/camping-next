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
} from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";

export default function NoticeDetail({ params }) {
  const { notice_idx } = use(params); // URL에서 전달된 id 값
  const [data, setData] = useState(null); // 공지사항 데이터
  const [error, setError] = useState(null); // 에러 상태
  const [noticeContent, setNoticeContent] = useState(""); // 수정된 내용
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말로 이 항목을 삭제하시겠습니까?");
    if (!confirmDelete) {
      return; // 사용자가 취소 버튼을 누른 경우
    }
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/notice/notices/delete/${notice_idx}`
      );
      if (response.status === 200) {
        alert("삭제가 성공적으로 완료되었습니다.");
        router.push("/admin/notices");
      } else {
        alert(`삭제에 실패했습니다: ${response.data}`);
      }
    } catch (error) {
      console.error("삭제 요청 중 오류 발생:", error);
      alert(`오류 발생: ${error.response?.data || error.message}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/notice/notices/${notice_idx}`
        );
        if (!response.ok) {
          throw new Error("데이터를 찾을 수 없습니다.");
        }
        const detail = await response.json();
        setData(detail);
        setNoticeContent(detail.notice_content); // 초기값 설정
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "데이터를 가져오는 데 실패했습니다.");
      }
    };
    if (notice_idx) {
      fetchData();
    }
  }, [notice_idx]);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  const handleSave = (notice_idx) => {
    router.push(`/admin/notices/update/${notice_idx}`); // 디테일 페이지로 이동
  };

  return (
    <div>
      <Box
        sx={{
          padding: "80px 40px",
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
            공지사항 상세 정보
          </Typography>
          <Link
            href="/admin/notices"
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
                      <TableCell sx={{ width: "30%" }}>IDX</TableCell>
                      <TableCell>{data.notice_idx}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>작성한 관리자</TableCell>
                      <TableCell>{data.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>제목</TableCell>
                      <TableCell>{data.notice_subject}</TableCell>
                    </TableRow>
                    {data.file_name && (
                      <TableRow>
                        <TableCell>첨부 파일</TableCell>
                        <TableCell>
                          {data.file_path.endsWith(".jpg") ||
                          data.file_path.endsWith(".png") ||
                          data.file_path.endsWith(".jpeg") ||
                          data.file_path.endsWith(".gif") ? (
                            // 이미지 파일인 경우 렌더링
                            <img
                              src={`http://localhost:8080/uploads/${data.file_name}`}
                              alt={data.file_name}
                              style={{ width: "300px", maxHeight: "300px" }}
                            />
                          ) : (
                            // 이미지가 아닌 경우 다운로드 링크 제공
                            <a
                              href={`http://localhost:8080/uploads/${data.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {data.file_name}
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ marginTop: 3, textAlign: "left" }}>
                <Editor
                  apiKey="7wi8djvoio93nw2l8ojf98dntqt7i9zkx2h6xyq6giyksnwt" // TinyMCE API Key
                  value={noticeContent}
                  init={{
                    height: 300,
                    menubar: false,
                    readonly: true, // 읽기 전용 상태로 설정
                    toolbar:
                      "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | removeformat",
                  }}
                />
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Link href="/admin/notices" passHref>
                  <Button variant="outlined" sx={{ mr: 2 }}>
                    취소
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={() => handleSave(data.notice_idx)}
                >
                  수정
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: "lightblue",
                    color: "white",
                    "&:hover": { backgroundColor: "grey" },
                    marginLeft: "15px",
                  }}
                  onClick={handleDelete}
                >
                  삭제
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
