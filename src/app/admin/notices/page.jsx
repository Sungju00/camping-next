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
import axios from "axios";
import useAuthStore from "store/authStore";
import { fetchNoticeList } from "./fetchNoticeList/page";
import { fetchPopupList } from "./fetchPopups/page";
import { NoLuggageOutlined } from "@mui/icons-material";

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
  const [data, setData] = useState(null); // 캠핑장 데이터를 저장
  const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터
  const [filteredPopup, setFilteredPopup] = useState([]);
  const [popup, setPopup] = useState(null);
  // 페이지
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [currentPopupPage, serCurrentPopupPage] = useState(1);
  const itemsPerPage = 5; // 페이지당 아이템 수

  // 검색기능
  const [searchTerm, setSearchTerm] = useState(""); // 캠핑장 이름 검색
  // detail로 가기 위함
  const router = useRouter();
  // 상세 페이지로 이동
  const handleDetailClick = (notice_idx) => {
    router.push(`/admin/notices/detail/${notice_idx}`); // 디테일 페이지로 이동
  };

  // 컴포넌트가 마운트될 때 API 호출
  useEffect(() => {
    const getData = async () => {
      const notices = await fetchNoticeList();
      setData(notices); // 데이터를 상태에 저장
      setFilteredData(notices); // 초기에는 모든 데이터 표시
    };
    getData();
  }, []);
  useEffect(() => {
    const getData = async () => {
      const popups = await fetchPopupList();
      setPopup(popups); // 데이터를 상태에 저장
      setFilteredPopup(popups); // 초기에는 모든 데이터 표시
    };
    getData();
  }, []);

  // 페이징
  // 페이지 변경 시 호출되는 함수
  const handlePageChange = (event, value) => {
    setCurrentPage(value); // 페이지 상태 업데이트
  };

  const handlePopupPageChange = (event, value) => {
    serCurrentPopupPage(value); // 페이지 상태 업데이트
  };

  // 필터링 로직
  const handleSearch = (e) => {
    e.preventDefault();
    const filteredResults = data.filter((notices) => {
      // 검색
      const matchesSearchTerm = searchTerm
        ? notices.notice_subject
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;
      // 반환
      return matchesSearchTerm;
    });

    setFilteredData(filteredResults);
  };
  // 검색
  // 엔터 키로 검색 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // 현재 페이지에 해당하는 데이터 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const startPopupIndex = (currentPopupPage - 1) * itemsPerPage;
  const endPopupIndex = startPopupIndex + itemsPerPage;
  const currentPopup = filteredPopup.slice(startPopupIndex, endPopupIndex);
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalPopupPages = Math.ceil(filteredPopup.length / itemsPerPage);

  // 관리자 이름(아이디)
  // 토큰
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
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

  const handleDelete = async (popupIdx) => {
    const confirmDelete = window.confirm("정말로 이 항목을 삭제하시겠습니까?");
    if (!confirmDelete) {
      return; // 사용자가 취소 버튼을 누른 경우
    }
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/notice/popup/delete/${popupIdx}`
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

  const toggleVisibility = async (popupIdx, currentVisibility) => {
    // 상태 전환: "표시" -> "숨김", "숨김" -> "표시"
    const newVisibility = currentVisibility === "표시" ? "숨김" : "표시";
    console.log("idx값 : " + popupIdx);
    try {
      // 서버 요청
      const response = await axios.post(
        `http://localhost:8080/api/notice/popup/update-visibility/${popupIdx}/${newVisibility}`
      );
      if (response.status === 200) {
        alert(`팝업 상태가 "${newVisibility}"로 변경되었습니다.`);
        // filteredPopup 업데이트
        setFilteredPopup((prev) =>
          prev.map((popup) =>
            popup.popup_idx === popupIdx
              ? { ...popup, is_hidden: newVisibility }
              : popup
          )
        );
      } else {
        alert("상태 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("상태 업데이트 중 오류 발생:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
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
              공지사항
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
            <h3 style={{ color: "black" }}>공지사항 관리</h3>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: 0, borderRadius: 2 }}
            >
              {currentData && currentData.length > 0 ? (
                <Table className="camping-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>IDX</TableCell>
                      <TableCell>제목</TableCell>
                      <TableCell>작성한 관리자</TableCell>
                      <TableCell>작성일자</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentData.map((item, index) => (
                      <TableRow
                        key={index}
                        onClick={() => handleDetailClick(item.notice_idx)}
                      >
                        <TableCell>{item.notice_idx}</TableCell>
                        <TableCell>{item.notice_subject}</TableCell>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.created_at}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>데이터 없음</p>
              )}
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
                width: "100%",
              }}
            >
              <Link href="/admin/notices/write" passHref>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "#333333",
                    color: "white",
                    marginBottom: "20px",
                  }}
                >
                  공지사항 등록하기
                </Button>
              </Link>
            </Box>
            <div
              className="pagination"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Stack spacing={2}>
                <Pagination
                  count={totalPages} // 전체 페이지 수
                  page={currentPage} // 현재 페이지
                  onChange={handlePageChange} // 페이지 변경 처리
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            </div>
          </Box>

          {/* 두 번째 박스 */}
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
            <h3 style={{ color: "black" }}>팝업 관리</h3>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: 0, borderRadius: 2 }}
            >
              {currentPopup && currentPopup.length > 0 ? (
                <Table className="camping-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>IDX</TableCell>
                      <TableCell>팝업 이름</TableCell>
                      <TableCell>작성한 관리자</TableCell>
                      <TableCell>너비</TableCell>
                      <TableCell>높이</TableCell>
                      <TableCell>간격(위)</TableCell>
                      <TableCell>간격(좌)</TableCell>
                      <TableCell>작성일자</TableCell>
                      <TableCell>숨김여부</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPopup.map((popup) => (
                      <TableRow key={popup.popup_idx || `popup-${popup.id}`}>
                        {/* 고유 key 설정 */}
                        <TableCell>{popup.popup_idx}</TableCell>
                        <TableCell>{popup.popup_name}</TableCell>
                        <TableCell>{popup.id}</TableCell>
                        <TableCell>{popup.width}</TableCell>
                        <TableCell>{popup.height}</TableCell>
                        <TableCell>{popup.top_space}</TableCell>
                        <TableCell>{popup.left_space}</TableCell>
                        <TableCell>{popup.created_at}</TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            onClick={() =>
                              toggleVisibility(popup.popup_idx, popup.is_hidden)
                            }
                            sx={{
                              color:
                                popup.is_hidden === "표시" ? "green" : "red",
                              textTransform: "none",
                            }}
                          >
                            {popup.is_hidden === "표시" ? "표시" : "숨김"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="submit"
                            variant="contained"
                            sx={{
                              backgroundColor: "#808d7c",
                              color: "white",
                              "&:hover": { backgroundColor: "grey" },
                              marginLeft: "5px",
                              padding: "2px",
                            }}
                            onClick={() => handleDelete(popup.popup_idx)}
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>데이터 없음</p>
              )}
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
                width: "100%",
              }}
            >
              <Link href="/admin/notices/popup/write" passHref>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "#333333",
                    color: "white",
                    marginBottom: "20px",
                  }}
                >
                  팝업 등록하기
                </Button>
              </Link>
            </Box>
            <div
              className="pagination"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Stack spacing={2}>
                <Pagination
                  count={totalPopupPages} // 전체 페이지 수
                  page={currentPopupPage} // 현재 페이지
                  onChange={handlePopupPageChange} // 페이지 변경 처리
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
