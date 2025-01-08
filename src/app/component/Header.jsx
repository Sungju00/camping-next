"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Link,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ForumIcon from "@mui/icons-material/Forum";
import MenuIcon from "@mui/icons-material/Menu";
import ForestOutlinedIcon from "@mui/icons-material/ForestOutlined";
import FestivalIcon from "@mui/icons-material/Festival";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AddchartIcon from "@mui/icons-material/Addchart";
import LoginIcon from "@mui/icons-material/Login";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import { useMediaQuery } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import useAuthStore from "../../../store/authStore";
import "./styles.css";
import { useRouter } from "next/navigation";
import axios from "axios";

const Header = () => {
  const theme = createTheme(); // 테마 생성
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const {isAuthenticated, removeToken, logout} = useAuthStore();
  // 테마를 사용하여 미디어 쿼리

  const isSmallScreen = useMediaQuery("(max-width: 900px)");

  const toggleDrawer = (open) => () => setIsDrawerOpen(open);



  const goMyPage = () => {
    if(!isAuthenticated){
      alert("로그인이 필요합니다.");
      router.push('/authentication/login?from=myPage/myUserInfo');
      return;
    }
    router.push('/myPage/myUserInfo');
  }

  const logoutEvent = () => {
    removeToken();
    logout();
    router.push('/');
  }
  
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 상태 추가
  const token = useAuthStore((state) => state.token); // Zustand에서 token 가져오기
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
  const checkAdmin = async (userIdx) => {
    try {
      const API_URL = `${LOCAL_API_BASE_URL}/admin/admins/check-id?user_idx=${userIdx}`;
      const response = await axios.get(API_URL, {
        headers: {
          Authorization:` Bearer ${token}`, // JWT 토큰 사용
        },
      });
      setIsAdmin(response.data); // API 응답 값에 따라 관리자 여부 설정
    } catch (error) {
      console.error("관리자 여부 확인 실패:", error);
    }
  };

  useEffect(() => {
    if (token) {
      getUserIdx(); // 토큰이 있으면 사용자 user_idx 가져오기
    }
  }, [token]);

  const getUserIdx = async () => {
    try {
      const API_URL = `${LOCAL_API_BASE_URL}/users/profile`;
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`, // JWT 토큰 사용
        },
      });
      if (response.data.success) {
        const userIdx = response.data.data.user_idx; // user_idx 추출
        checkAdmin(userIdx); // 관리자 여부 확인 호출
      } else {
        console.error("프로필 가져오기 실패:", response.data.message);
      }
    } catch (error) {
      console.error("프로필 요청 오류:", error);
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      {" "}
      {/* ThemeProvider로 감싸기 */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* 상단 툴바 */}
        <AppBar position="static" className="appbar-container">
          <Toolbar className="toolbar-container">
            <Box className="toolbar-left">
              <p style={{ color: "#555555" }}>
                Camplace. Contact us on 03-000-0000
              </p>
            </Box>

            <Box className="toolbar-right">
            {isAdmin && ( // 관리자일 때만 링크 표시
                <Link href="/admin" underline="none">
                  <PersonIcon className="icon" />
                </Link>
              )}
              <Link href="/" underline="none">
                <AssignmentTurnedInIcon className="icon" />
              </Link>
              <Link href="/" underline="none">
                <ForumIcon className="icon" />
              </Link>
            </Box>
          </Toolbar>
        </AppBar>

        {/* 메인 툴바 */}
        <AppBar position="static" className="appbar-main">
          <Toolbar className="appbar-toolbar-main">
            {isSmallScreen ? (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{
                  position: "absolute",
                  left: "30px",
                  color: "#597445",
                }}
              >
                <MenuIcon sx={{ fontSize: "35px" }} />
              </IconButton>
            ) : (
              <Box className="appbar-left-menu">
                  {!isAuthenticated ? <>
                <Link
                  href="/authentication/signUp"
                  className="appbar-link"
                  style={{
                    textDecoration: "none",
                    color: "black",
                    fontSize: "18px",
                  }}
                >
                  Sign up
                </Link>
                <Link
                  href="/authentication/login"
                  className="appbar-link"
                  style={{
                    textDecoration: "none",
                    color: "black",
                    fontSize: "18px",
                  }}
                  >
                  Login
                </Link></> :
                <Typography
                  onClick={logoutEvent}
                  className="appbar-link"
                  style={{
                    textDecoration: "none",
                    color: "black",
                    fontSize: "18px",
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </Typography>
                }
                <Link href="/customer-center/notice" className="appbar-link">
                  Customer Service
                </Link>
              </Box>
            )}

            <Box className="appbar-logo">
              <ForestOutlinedIcon  sx={{ fontSize: "40px", color: "#597445" }} />
            </Box>

            {!isSmallScreen && (
              <Box className="appbar-right-menu">
                <Link href="/campinglist" className="appbar-link">
                  Camping GO
                </Link>
                <Link href="/MeetingGroup/meeting" className="appbar-link">
                  Together
                </Link>
                <Link href="/myPage/myUserInfo" className="appbar-link">
                  My Page
                </Link>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* 드로어 */}
        <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)}>
          <Box
            className="drawer-container"
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <div className="drawer-header">
              <IconButton
                onClick={toggleDrawer(false)}
                className="drawer-close-btn"
              >
                <CloseIcon sx={{ fontSize: "30px" }} />
              </IconButton>
            </div>
            <List>
              <ListItem
                button
                component="a"
                href="/admin/campgrounds/search"
                className="drawer-list-item"
              >
                <FestivalIcon />
                <ListItemText
                  primary="Camping GO"
                  className="drawer-item-text"
                />
              </ListItem>
              <ListItem
                button
                component="a"
                href="/"
                className="drawer-list-item"
              >
                <PeopleOutlineIcon />
                <ListItemText primary="Together" className="drawer-item-text" />
              </ListItem>
              <ListItem
                button
                component="a"
                href="/"
                className="drawer-list-item"
              >
                <SupportAgentIcon />
                <ListItemText
                  primary="Customer Service"
                  className="drawer-item-text"
                />
              </ListItem>
              <ListItem
                button
                component="a"
                href="/"
                className="drawer-list-item"
              >
                <AddchartIcon />
                <ListItemText primary="Sign in" className="drawer-item-text" />
              </ListItem>
              <ListItem
                button
                component="a"
                href="/"
                className="drawer-list-item"
              >
                <LoginIcon />
                <ListItemText primary="Login" className="drawer-item-text" />
              </ListItem>
              <ListItem
                button
                component="a"
                href="/"
                className="drawer-list-item"
              >
                <AccountCircleIcon />
                <ListItemText primary="My Page" className="drawer-item-text" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default Header;
