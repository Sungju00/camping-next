"use client";

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import useAuthStore from "store/authStore";
import axios from "axios";

function Page() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
  const [userIdx, setUserIdx] = useState("");
  const [adminIdx, setAdminIdx] = useState("");
  const [noticeSubject, setNoticeSubject] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // 파일 상태 추가

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileIdx = null;
      // 1. 파일 업로드 (선택된 파일이 있는 경우)
      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", selectedFile);
        const fileResponse = await axios.post(
          `http://localhost:8080/api/files/admin/upload`,
          fileFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (fileResponse.status === 200) {
          fileIdx = fileResponse.data.file_idx; // 서버에서 반환된 file_idx
          console.log("파일 업로드 성공: file_idx =", fileIdx); // 확인용 로그
        } else {
          throw new Error("파일 업로드 실패");
        }
      }

      // 2. 공지사항 등록
      const formData = new FormData();
      formData.append("notice_subject", noticeSubject);
      formData.append("notice_content", noticeContent);
      formData.append("admin_idx", adminIdx); // 관리자 ID
      if (fileIdx) {
        formData.append("image_idx", fileIdx); // 업로드된 파일 ID 추가
      }
      const response = await axios.post(
        `http://localhost:8080/api/notice/notices/insert`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert("공지사항 등록 성공!");
        router.push("/admin/notices");
      } else {
        alert("공지사항 등록 실패");
      }
    } catch (error) {
      console.error("등록 중 문제가 발생했습니다:", error);
      alert("등록 중 문제가 발생했습니다.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file); // 선택된 파일 저장
  };

  const handleNoticeSubjectChange = (e) => {
    setNoticeSubject(e.target.value);
  };

  const handleContentChange = (content) => {
    setNoticeContent(content);
  };

  // 유저 ID 가져오기
  const getUserIdx = async () => {
    try {
      const response = await axios.get(`${LOCAL_API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setUserIdx(response.data.data.user_idx);
      } else {
        console.error("프로필 가져오기 실패:", response.data.message);
      }
    } catch (error) {
      console.error("프로필 요청 오류:", error);
      alert("로그인이 만료되었습니다. 로그인 후 이용해주세요.");
      router.push("/");
    }
  };

  // 관리자 ID 가져오기
  const getAdminIdx = async () => {
    try {
      const response = await axios.get(
        `${LOCAL_API_BASE_URL}/admin/admins/check-type?user_idx=${userIdx}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setAdminIdx(response.data.admin_idx);
      } else {
        console.error("관리자 idx 가져오기 실패");
      }
    } catch (error) {
      console.error("관리자 idx 요청 오류:", error);
    }
  };

  useEffect(() => {
    if (userIdx) {
      getAdminIdx();
    }
  }, [userIdx]);

  useEffect(() => {
    if (token) {
      getUserIdx();
    }
  }, [token]);

  return (
    <Box
      sx={{
        backgroundColor: "grey",
        minHeight: "100vh",
        padding: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          boxShadow: 1,
          width: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>공지사항 등록하기</h2>
        <Link
          href="/admin/notices"
          passHref
          style={{ textDecoration: "none", color: "black" }}
        >
          <p>[목록으로 돌아가기]</p>
        </Link>
        <hr />
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>제목</TableCell>
                <TableCell>
                  <TextField
                    name="notice_subject"
                    value={noticeSubject}
                    onChange={handleNoticeSubjectChange}
                    fullWidth
                    required
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>내용</TableCell>
                <TableCell>
                  <Editor
                    apiKey="7wi8djvoio93nw2l8ojf98dntqt7i9zkx2h6xyq6giyksnwt"
                    value={noticeContent}
                    onEditorChange={handleContentChange}
                    init={{
                      height: 500,
                      menubar: false,
                      toolbar:
                        "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | removeformat",
                    }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>파일 첨부</TableCell>
                <TableCell>
                  <input type="file" onChange={handleFileChange} />
                  {selectedFile && <p>선택된 파일: {selectedFile.name}</p>}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Link href="/admin/notices" passHref>
            <Button variant="outlined" sx={{ mr: 2 }}>
              취소
            </Button>
          </Link>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            등록하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Page;
