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
import { fetchNoticeDetail } from "../../fetchNoticeDetail/page";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import useAuthStore from "store/authStore";

export default function CampingDetail({ params }) {
  const { notice_idx } = use(params); // URL에서 전달된 id 값
  const [data, setData] = useState(null); // 공지사항 데이터
  const [error, setError] = useState(null); // 에러 상태
  const [formData, setFormData] = useState({
    notice_subject: "",
    notice_content: "",
    admin_idx: "",
  });
  const [selectedFile, setSelectedFile] = useState(null); // 파일 첨부 상태
  const router = useRouter();
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
  const [userIdx, setUserIdx] = useState("");
  const [adminIdx, setAdminIdx] = useState("");

  // 화면 크기 체크 (1000px 이하에서 텍스트 숨기기)
  const isSmallScreen = useMediaQuery("(max-width:1000px)");

  useEffect(() => {
    // 데이터를 가져오는 함수
    const fetchData = async () => {
      try {
        const notices = await fetchNoticeDetail(notice_idx);
        if (!notices) {
          throw new Error("데이터를 찾을 수 없습니다.");
        }
        setData(notices);
        setFormData({
          notice_subject: notices.notice_subject || "",
          notice_content: notices.notice_content || "",
          admin_idx: adminIdx || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "데이터를 가져오는 데 실패했습니다.");
      }
    };
    if (notice_idx && adminIdx) {
      fetchData();
    }
  }, [notice_idx, adminIdx]); // id 또는 adminIdx가 변경되면 데이터 다시 가져오기
  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prevData) => ({
      ...prevData,
      notice_content: content,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!formData.notice_subject || !formData.notice_content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const noticeUrl = `http://localhost:8080/api/notice/notices/update/${notice_idx}`;
    const fileUrl = `http://localhost:8080/api/admin/update-file/${notice_idx}`;

    try {
      // Step 1: 공지사항 업데이트
      console.log("공지사항 업데이트 시작...");
      const formdata = new FormData();

      // 모든 데이터를 FormData로 변환
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          formdata.append(key, value);
        }
      });
      console.log("전송할 FormData:");
      formdata.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      const noticeResponse = await fetch(noticeUrl, {
        method: "POST",
        body: formdata,
      });

      if (!noticeResponse.ok) {
        const error = await noticeResponse.text();
        console.error("공지사항 업데이트 실패:", error);
        alert(`공지사항 업데이트 실패: ${error}`);
        return;
      }

      console.log("공지사항 업데이트 성공");

      // Step 2: 파일 업데이트 (파일이 선택된 경우만)
      if (selectedFile) {
        console.log("파일 업데이트 시작...");
        const fileFormData = new FormData();
        fileFormData.append("file", selectedFile);

        const fileResponse = await fetch(fileUrl, {
          method: "POST",
          body: fileFormData,
        });

        if (!fileResponse.ok) {
          const error = await fileResponse.text();
          console.error("파일 업데이트 실패:", error);
          alert(`파일 업데이트 실패: ${error}`);
          return;
        }

        console.log("파일 업데이트 성공");
      }

      alert(
        "공지사항이 성공적으로 업데이트되었습니다." +
          (selectedFile ? " 파일도 업데이트되었습니다." : "")
      );
      router.push("/admin/notices");
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
            공지사항 수정
          </Typography>
          <Link
            href="/admin/notices"
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
                  justifyContent: "space-between",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>제목</TableCell>
                        <TableCell>
                          <TextField
                            name="notice_subject"
                            value={formData.notice_subject}
                            onChange={handleInputChange}
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
                            value={formData.notice_content}
                            onEditorChange={handleContentChange}
                            init={{
                              height: 300,
                              menubar: false,
                              toolbar:
                                "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | removeformat",
                            }}
                          />
                        </TableCell>
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
                      <TableRow>
                        <TableCell>파일 첨부</TableCell>
                        <TableCell>
                          <input type="file" onChange={handleFileChange} />
                          {selectedFile && (
                            <p>선택된 파일: {selectedFile.name}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" justifyContent="flex-end" width={"100%"}>
                  <Link href="/admin/notices" passHref>
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
