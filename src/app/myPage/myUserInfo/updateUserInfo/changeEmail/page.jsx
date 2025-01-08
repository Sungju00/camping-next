"use client"
import { Box, Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import EmailVerificationForm from '../../../../authentication/signUp/components/EmailVerificaionForm'
import useEmailVerification from '../../../../authentication/signUp/hooks/useEmailVerification'
import useApi from '../../../../component/useApi'
import { useRouter } from 'next/navigation'
import useAuthStore from '../../../../../../store/authStore'
import axios from 'axios'

export default function ChangeEmail() {
    const token = useAuthStore((state) => state.token);  // zustand에서 token 값 가져오기
    const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
    const emailVerificaion = useEmailVerification();
    const [data, setData] = useState();
    const { getData, postData } = useApi(token, setData);
    const router = useRouter();
    const emailVerified = emailVerificaion.emailVerified;


    // 이메일 변경 요청
    const ChangeEmail = async () => {
        const API_URL = `${LOCAL_API_BASE_URL}/users/updateEmail`;
        const email = emailVerificaion.email;

        console.log(email);
        
        
        try {
            const response = await axios.post(API_URL, {"email": email}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json', // JSON 형식 명시
                }
            })
            if(response.data.success){
                alert("이메일이 성공적으로 변경되었습니다.");
                router.back();
            } else {
                alert("error");
            }
        } catch (error) {
            alert("error : " + error);
        }
    }

    return (
        <Box 
            sx={{
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                alignContent: 'center'
            }}
        >
            <Typography variant='h4' sx={{mt:"40px"}}>
                이메일 변경
            </Typography>

            <EmailVerificationForm {...emailVerificaion}/>

            <Button
                onClick={ChangeEmail}
                variant='contained'
                disabled={!emailVerified}
                sx={{
                    width:'510px',
                    padding: '8px 0px'
                }}
            >
                변경하기
            </Button>
        </Box>
    )
}