"use client";
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Pagination,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import { Image as ImageIcon } from "@mui/icons-material";
import CampgroundIcon from "@mui/icons-material/NaturePeople";
import EventIcon from "@mui/icons-material/Event";
import MailIcon from "@mui/icons-material/Mail";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import Link from "next/link";
import { useMediaQuery } from "@mui/material"; // useMediaQuery import 추가
import CameraAltIcon from "@mui/icons-material/CameraAlt"; // 기본 카메라 아이콘
import HomeIcon from "@mui/icons-material/Home"; // 홈페이지 아이콘
import ExpandLessIcon from "@mui/icons-material/ExpandLess"; // < 아이콘
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // > 아이콘
import LogoutIcon from "@mui/icons-material/ExitToApp";
import { useRouter } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./styles.css";
import { fetchInquiries } from "./fetchInquiryList/page";
import useAuthStore from "store/authStore";
import axios from "axios";

const menuItems = [
  {
    label: "회원 관리",
    icon: <PeopleIcon />,
    path: "/members",
    subItems: [
      { label: "권한 관리", path: "/admin" },
      { label: "회원 정보 보기", path: "/admin/members/view" },
      { label: "회원 제재", path: "/admin/members/restrictions" },
    ],
  },
  {
    label: "캠핑장 관리",
    icon: <CampgroundIcon />,
    path: "/admin/campgrounds",
    subItems: [
      { label: "캠핑장 정보 보기", path: "/admin/campgrounds/view" },
      { label: "예약 내역", path: "/admin/campgrounds/reservations" },
    ],
  },
  {
    label: "모임 관리",
    icon: <EventIcon />,
    path: "/admin/events",
    subItems: [
      { label: "정규 모임", path: "/admin/events/regular/view" },
      { label: "번개 모임", path: "/admin/events/lightning/view" },
    ],
  },
  {
    label: "1:1 문의",
    icon: <MailIcon />,
    path: "/admin/inquiries",
    subItems: [
      { label: "1:1 문의", path: "/admin/inquiries" },
      { label: "캠핑장 등록/수정", path: "/admin/inquiries/campground/view" },
    ],
  },
  {
    label: "공지사항",
    icon: <AnnouncementIcon />,
    path: "/admin/notices",
    subItems: null,
  },
];

export default function Page() {
  const [activeSubMenu, setActiveSubMenu] = React.useState(null);
  const [activeProfile, setActiveProfile] = React.useState(true);
  // 데이터
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터
  // 페이지
  const [currentMemberPage, setCurrentMemberPage] = useState(1); // 회원 페이지
  const itemsPerPage = 10; // 페이지당 아이템 수
  // 검색기능
  const [searchTerm, setSearchTerm] = useState("");
  // detail로 가기 위함
  const router = useRouter();
  // 상세 페이지로 이동
  const handleDetailClick = (inquiry_idx) => {
    router.push(`/admin/inquiries/detail/${inquiry_idx}`); // 디테일 페이지로 이동
  };

  // 컴포넌트가 마운트될 때 API 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inquiries = await fetchInquiries();
        if (Array.isArray(inquiries)) {
          setData(inquiries);
          setFilteredData(inquiries);
        }
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    if (data.length > 0) {
      updateStatusMap();
    }
  }, [data]); // data가 변경될 때 updateStatusMap 호출

  // 페이징
  // 페이지 변경 시 호출되는 함수
  const handleMemberPageChange = (event, value) => {
    setCurrentMemberPage(value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // 데이터 필터링 - 검색
    const filteredMemberResults = data.filter((inquiries) =>
      searchTerm
        ? inquiries.subject?.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );
    setFilteredData(filteredMemberResults);
    setCurrentMemberPage(1); // 페이지 초기화
  };
  // 검색
  // 엔터 키로 검색 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // 현재 페이지에 해당하는 데이터 계산
  const startMemberIndex = (currentMemberPage - 1) * itemsPerPage;
  const endMemberIndex = startMemberIndex + itemsPerPage;
  const pagedMembers = filteredData.slice(startMemberIndex, endMemberIndex);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // 관리자 이름(아이디)
  // 토큰
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
  const [statusMap, setStatusMap] = useState({}); // 문의 상태 맵
  const [adminName, setAdminName] = useState(""); // 관리자 이름 상태
  const [userIdx, setUserIdx] = useState("");
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
        const adminName = response.data.data.username;
        setAdminName(adminName);
        setUserIdx(userIdx);
      } else {
        console.error("프로필 가져오기 실패:", response.data.message);
      }
    } catch (error) {
      console.error("프로필 요청 오류:", error);
    }
  };
  useEffect(() => {
    if (token) {
      getUserIdx(); // 토큰이 있으면 사용자 `user_idx` 가져오기
    }
  }, [token]);

  // 화면 크기 체크 (1000px 이하에서 텍스트 숨기기)
  const isSmallScreen = useMediaQuery("(max-width:1000px)");
  // 로그아웃
  const handleLogout = () => {
    console.log("로그아웃");
  };
  // 메뉴 토글
  const handleSubMenuToggle = (index) => {
    setActiveSubMenu(activeSubMenu === index ? null : index);
  };
  // 프로필 토글
  const handleProfileToggle = () => {
    setActiveProfile(!activeProfile);
  };

  // 문의 상태 확인 API 호출
  const checkAnswerStatus = async (inquiry_idx) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/inquiry/inquiries/check-answer`,
        { params: { inquiry_idx } }
      );
      return response.data; // true(답변 완료) 또는 false(답변 없음)
    } catch (error) {
      console.error(`Error checking status for inquiry ${inquiry_idx}:`, error);
      return false; // 기본값으로 false 설정
    }
  };
  const updateStatusMap = async () => {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No data available to update status map");
      return;
    }
    const newStatusMap = {};
    for (const item of data) {
      try {
        const status = await checkAnswerStatus(item.inquiry_idx);
        newStatusMap[item.inquiry_idx] = status ? "답변 완료" : "답변 전";
      } catch (error) {
        console.error(
          `Error updating status for inquiry ${item.inquiry_idx}:`,
          error
        );
      }
    }
    setStatusMap(newStatusMap);
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        {/* Sidebar - 메뉴 목록 */}
        <Box
          sx={{
            width: isSmallScreen ? "60px" : "200px",
            bgcolor: "#E7F0DC",
            paddingTop: "20px",
            paddingBottom: "20px",
            transition: "width 0.3s",
          }}
        >
          {/* 관리자 프로필 */}
          <List>
            {/* 토글 버튼 */}
            <ListItem button onClick={handleProfileToggle}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {activeProfile ? (
                  <ExpandLessIcon sx={{ color: "#808D7C" }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: "#808D7C" }} />
                )}
              </Box>
            </ListItem>

            {/* 프로필 내용 토글 */}
            <Collapse in={activeProfile} timeout="auto" unmountOnExit>
              <List sx={{ pl: 4, backgroundColor: "#f1f8e9" }}>
                {/* 카메라 아이콘 및 관리자 이름 (화면 크기가 클 때만 표시) */}
                {!isSmallScreen && (
                  <ListItem>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          bgcolor: "#808D7C",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CameraAltIcon sx={{ color: "white" }} />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "black", mt: 1 }}
                      >
                        관리자 {adminName}님
                      </Typography>
                    </Box>
                  </ListItem>
                )}
                {/* 아이콘 두 개 가로 배치 (화면 크기가 클 때만 표시) */}
                {!isSmallScreen && (
                  <ListItem
                    sx={{ display: "flex", justifyContent: "space-evenly" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        cursor: "pointer",
                      }}
                      component={Link}
                      href="/"
                    >
                      <HomeIcon sx={{ color: "#808D7C" }} />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        cursor: "pointer",
                        marginRight: "30px",
                      }}
                      onClick={handleLogout}
                    >
                      <LogoutIcon sx={{ color: "#808D7C" }} />
                    </Box>
                  </ListItem>
                )}
              </List>
            </Collapse>
          </List>

          <List>
            {menuItems.map((item, index) => (
              <div key={index}>
                <ListItem
                  button
                  onClick={() =>
                    item.subItems ? handleSubMenuToggle(index) : null
                  }
                  component={item.subItems ? "div" : Link}
                  href={item.subItems ? "#" : item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {/* 화면이 작을 때 텍스트 숨기기 */}
                  {!isSmallScreen && (
                    <ListItemText
                      primary={item.label}
                      sx={{ color: "black" }}
                    />
                  )}
                </ListItem>

                {/* 하위 메뉴 (토글) */}
                {item.subItems && (
                  <Collapse
                    in={activeSubMenu === index}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List sx={{ pl: 4, backgroundColor: "#f1f8e9" }}>
                      {item.subItems.map((subItem, subIndex) => (
                        <ListItem
                          button
                          component={Link}
                          href={subItem.path}
                          key={subIndex}
                        >
                          <ListItemText
                            primary={subItem.label}
                            sx={{ color: "black" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </div>
            ))}
          </List>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#f9f9f5",
            p: 3,
            paddingBottom: "24px",
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              display: "flex",
              alignItems: "center", // 텍스트와 아이콘 수직 정렬
              padding: "8px", // 적절한 여백 추가
            }}
          >
            <Typography variant="body1" sx={{ color: "#808D7C" }}>
              관리자페이지
            </Typography>
            <ChevronRightIcon sx={{ mx: 1, color: "#808D7C" }} />{" "}
            {/* 아이콘 삽입 */}
            <Typography variant="body1" sx={{ color: "#808D7C" }}>
              1:1문의
            </Typography>
          </Box>
          {/* 검색 바 */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="검색어를 입력하세요"
              value={searchTerm} // value 속성 추가
              onChange={(e) => setSearchTerm(e.target.value)} // onChange 이벤트 추가
              onKeyPress={handleKeyPress} // onKeyPress 이벤트 추가
              sx={{
                width: isSmallScreen ? "300px" : "600px",
                bgcolor: "white",
                borderRadius: 2,
                transition: "all 0.3s ease-in-out",
                marginBottom: "20px",
                marginTop: "20px",
                "&:hover": {
                  borderColor: "#8ca18c",
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {/* 첫 번째 박스 */}
          <Box
            sx={{
              backgroundColor: "#f9f9f9",
              borderRadius: 2,
              boxShadow: 1,
              p: 2,
              mb: 3,
              marginTop: "10px",
              paddingLeft: "30px",
              paddingRight: "30px",
              display: "flex", // Flexbox 사용
              alignItems: "center", // 세로 방향 가운데 정렬
              flexDirection: "column", // 세로 방향 정렬
            }}
          >
            <h3 style={{ color: "black" }}>1:1문의 관리</h3>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: 0, borderRadius: 2 }}
            >
              {pagedMembers && pagedMembers.length > 0 ? (
                <Table className="camping-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>문의 번호</TableCell>
                      <TableCell>문의 작성자 ID</TableCell>
                      <TableCell>문의 제목</TableCell>
                      <TableCell>문의 작성일자</TableCell>
                      <TableCell>답변 여부</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedMembers.map((item, index) => (
                      <TableRow
                        key={index}
                        onClick={() => handleDetailClick(item.inquiry_idx)}
                      >
                        <TableCell>{item.inquiry_idx}</TableCell>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.subject}</TableCell>
                        <TableCell>{item.created_at}</TableCell>
                        <TableCell
                          sx={{
                            color:
                              statusMap[item.inquiry_idx] === "답변 완료"
                                ? "black"
                                : "blue",
                          }}
                        >
                          {statusMap[item.inquiry_idx] || "확인 중..."}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>데이터 없음</p>
              )}
            </TableContainer>

            <div
              className="pagination"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(filteredData.length / itemsPerPage)}
                  page={currentMemberPage}
                  onChange={handleMemberPageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            </div>
          </Box>
        </Box>
      </Box>
    </>
  );
}
