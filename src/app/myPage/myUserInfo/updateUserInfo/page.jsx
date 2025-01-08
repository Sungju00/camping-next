"use client"
import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Collapse, FormControlLabel, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useRouter } from 'next/navigation';



function updateUserInfoPage() {
  const router = useRouter();

  const changePassword = () => {
    router.push(`updateUserInfo/changePassword`);
  }

  return (
    
    <Box
      component="main"
      sx={{
        maxWidth: "510px",
        ml: "auto",
        mr: "auto",
        padding: "50px 0 100px",
      }}
    >
    <Grid item xs={12} md={12} lg={12} xl={12}>
      <Typography variant='h5' sx={{fontWeight:"bold"}} mb="20px">
        회원정보 수정
      </Typography>
      <Box>
        {/* (아이콘, 이름, URL) */}
        {updateUserInfoForm(<LockIcon sx={{fontSize: '20px', mr:'10px'}}/>, '비밀번호 변경', 'updateUserInfo/changePassword')}
        {updateUserInfoForm(<EmailIcon sx={{fontSize: '20px', mr:'10px'}}/>, '이메일 변경', 'updateUserInfo/changeEmail')}
        {updateUserInfoForm(<PhoneIphoneIcon sx={{fontSize: '20px', mr:'10px'}}/>, '전화번호 변경', 'updateUserInfo/changePhone')}
      </Box>
    </Grid>
  </Box>
  );
}

// 버튼 폼 return하는 메서드
function updateUserInfoForm(icon, name, routerURL){
  const router = useRouter();
  const onClickEvent = () => {
    router.push(`${routerURL}`);
  }

  return(
    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      <Typography
        variant="button"
        sx={{ 
          margin: '0 10px', 
          border: '1px solid skyblue',
          borderRadius: '10px',
          padding: '20px',
          minWidth: '500px'
        }}
      >
        <Box 
          sx={{
            display:'flex',
            justifyContent: "space-between",
            alignItems: 'center'
          }}
          onClick={onClickEvent}
        >
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 'bold'
            }}
          >
            {icon}
            {name}
          </Typography>
          <KeyboardArrowRightIcon
            sx={{
              fontSize: '20px'
            }}
          />
        </Box>
      </Typography>
    </Box>
  )
}


export default updateUserInfoPage;