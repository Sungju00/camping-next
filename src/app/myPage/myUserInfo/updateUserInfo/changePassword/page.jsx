"use client"
import { Box, Button, Grid, Typography } from '@mui/material';
import useSignup from '../../../../authentication/signUp/hooks/useSignUP'
import React from 'react'
import InputForm from '../../../../component/InputForm';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../../../../store/authStore';

export default function ChangePassword() {
    const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
    const {token} = useAuthStore((state) => state);
    const router = useRouter();


    const {
        password,
        passwordCheck,
        passwordConfirm,
        handlePasswordChange,
        handlePasswordConfirmChange,
    } = useSignup(LOCAL_API_BASE_URL);

    // 비밀번호 변경 요청
    const submitEvent = async () => {
        const API_URL = `${LOCAL_API_BASE_URL}/users/updatePassword`
        try {
            const response = await axios.post(API_URL, password, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json', // JSON 형식 명시
                }
            })
            if(response.data.success){
                alert("비밀번호가 성공적으로 변경되었습니다.");
                router.back();
            } else {
                alert("error");
            }
        } catch (error) {
            alert("error : " + error);
        }
    }

    return (
        <Box sx={{
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            alignContent: 'center'
        }}>
            <Box
                sx={{padding: "30px 20px", borderRadius: "10px", mb: "20px", display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}
                className="bg-black"
            >
                <Typography as="h1" fontSize="28px" fontWeight="700" mb="30px">
                    비밀번호 변경
                </Typography>
                <Grid container alignItems="center" spacing={2} sx={{
                    width:"500px",alignItems:'center', justifyContent:'center'
                }}>

                    <InputForm
                        label="새 비밀번호"
                        type="password"
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <InputForm
                        label="비밀번호 확인"
                        type="password"
                        name="passwordChk"
                        value={passwordConfirm}
                        onChange={handlePasswordConfirmChange}
                    />

                    {/* 비밀번호 일치 확인 */}
                    {/* InputForm(label, type, name, value, onChange) */}
                    <Box sx={{textAlign:'left', display:'flex', flexDirection:'column'}}>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2, ml: 3, width: 'auto'}}>
                            {passwordConfirm == "" ?  "" : (passwordCheck ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다.")}
                        </Typography>
                    <Button variant='contained' 
                        sx={{
                            mt:'20px',
                            ml:'16px',
                            width: '500px',
                            justifyContent: 'center'
                        }}
                        onClick={submitEvent}
                    >
                        비밀번호 변경
                    </Button>
                        </Box>
                </Grid>
            </Box>
        </Box>
    )
}