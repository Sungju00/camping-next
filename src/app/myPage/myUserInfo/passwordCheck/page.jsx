"use client"
import InputForm from '../../../component/InputForm'; 
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../../../../store/authStore';

function page(props) {
  const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
  const {token} = useAuthStore();
  const [password, setPassword] = useState();
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  }
  const router = useRouter();
  const searchParams = useSearchParams();  // 쿼리 파라미터 접근
  const action = searchParams.get('action');  // action 값 가져오기

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // e.preventDefault(); // 기본 Enter 동작 막기 (필요시)
      passwordCheck();
      console.log("keydown");
    }
  };


  //서버에 요청한다.
  const passwordCheck = async () => {
    const API_URL = `${LOCAL_API_BASE_URL}/users/passwordCheck`

    if (password === "") {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(API_URL, password, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // JSON 형식 명시
        }
      });
      console.log(response.data);
      if(response.data.success){
        
        if (action === 'update') {
          router.push('/myPage/myUserInfo/updateUserInfo');  // 수정 페이지로 이동
        } else if (action === 'delete') {
          router.push('/myPage/myUserInfo/deleteAccount');  // 삭제 페이지로 이동
        }
      } else{
        alert("비밀번호가 틀립니다.")
        setPassword("");
      }
    } catch (error) {
    }
  }


  return (
    
  <Box sx={{
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center'
  }}>
    <Typography as="h1" fontSize="28px" fontWeight="700" mb="5px">

      비밀번호 확인
      {/* <Image
        src="/images/favicon.png"
        alt="favicon"
        className={styles.favicon}
        width={30}
        height={30}
     /> */}
    </Typography>

    <Typography fontSize="15px" mb="30px">
      Enter your email and we′ll send you instructions to reset your
      password
    </Typography>

      <Box xs={6} xl={6}
        sx={{
          maxWidth: '500px',
          minWidth: '500px',
          background: "#fff",
          padding: "30px 20px",
          borderRadius: "10px",
          mb: "20px",
        }}
        className="bg-black"
      >
      <InputForm
        label="비밀번호"
        type="password" // 보이는 상태에 따라 입력 타입 변경
        name="password"
        autoFocus = "true"
        value={password}
        onChange={handlePasswordChange}
        onKeyDown={handleKeyDown}
      />
      <Button
        fullWidth
        variant="contained"
        sx={{
          mt: 1,
          textTransform: "capitalize",
          borderRadius: "8px",
          fontWeight: "500",
          fontSize: "16px",
          padding: "12px 10px",
          color: "#fff !important"
        }}
        onClick={passwordCheck}
      >
        Confirm
      </Button>
      <Box as="div" textAlign="center" mt="20px">
        <Link
          href="/myPage/myUserInfo"
          className="primaryColor text-decoration-none"
        >
          <i className="ri-arrow-left-s-line"></i> Back to Sign in
        </Link>
      </Box>
    </Box>
  </Box>
  );
}

export default page;