"use client"
import React, { useState } from 'react';
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./styles.css"; 
import { Button, TextField } from '@mui/material';
import dynamic from 'next/dynamic';
const SimpleMDE = dynamic(() => import('react-simplemde-editor'),{
    ssr: false});
import "easymde/dist/easymde.min.css";
import { useRouter } from 'next/navigation';

function page(props) {
    const LOCAL_API_BASE_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
    const router = useRouter();
    const [formData, setFormData] = useState({
        gb_name : '',
        gb_subject : '',
        gb_content : '',
        gb_email : '',
        gb_pw : '',
        file : null,
    }); 
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev, [name]:value
        }));
    }
    return (
        <div className='review-write'>
            <h2 className="review-title">
                    <ChevronRightIcon className="rightIcon" /> 캠핑/여행후기
            </h2>
            <TextField
            label="이름"
            name='gb_name'
            // value={formData.gb_name}
            onChange={handleChange}
            fullWidth
            margin='normal' />
            <TextField
            label="제목"
            name='gb_subject'
            // value={formData.gb_subject}
            onChange={handleChange}
            fullWidth
            margin='normal' />
            <SimpleMDE theme="snow" onChange={handleChange} />
            <TextField
            label="패스워드"
            name='gb_pw'
            // value={formData.gb_pw}
            onChange={handleChange}
            fullWidth
            margin='normal' />
            <TextField
            label="이메일"
            name='gb_email'
            // value={formData.gb_email}
            onChange={handleChange}
            fullWidth
            margin='normal' />
            {/* <input type='file' onChange={handleFileChange} /> */}
            <Button
                variant='contained'
                color='primary'
                style={{ marginTop:"20px"}}
                // onClick={handleSubmit}
                // disabled={!isFormValid} // 로그인 상태와 폼 입력 상태 체크
            >저장</Button>
        </div>
    );
}

export default page;