"use client"
import { useRouter } from "next/navigation";
import useAuthStore from "../../../../../../store/authStore";

import { Box, Button, Typography } from "@mui/material";
import PhoneVerificationForm from "../../../../authentication/signUp/components/PhoneVerificationForm";
import usePhoneVerification from "../../../../authentication/signUp/hooks/usePhoneVerification";
import axios from "axios";

export default function ChangePhone(){
    const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
    const token = useAuthStore((state) => state.token);  // zustand에서 token 값 가져오기
    const router = useRouter();
    const phoneVerification = usePhoneVerification();
    const phoneVerified = phoneVerification.phoneVerified;

    const changePhone = async () => {
        const API_URL = `${LOCAL_API_BASE_URL}/users/updatePhone`;
        const phone = phoneVerification.phone;
        try {
            const response = await axios.post(API_URL, {"phone": phone}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json', // JSON 형식 명시
                }
            })
            if(response.data.success){
                alert("휴대폰 번호가 성공적으로 변경되었습니다.");
                router.back();
            } else {
                alert("error");
            }
        } catch (error) {
            alert("error : " + error);
        }
    }


    return(
        <Box
        sx={{
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            alignContent: 'center'
        }}
    >
        <Typography variant='h4' sx={{mt:"40px"}}>
            핸드폰 번호 변경
        </Typography>

        <PhoneVerificationForm {...phoneVerification}/> 

        <Button
            onClick={changePhone}
            variant='contained'
            // disabled={!phoneVerified}
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