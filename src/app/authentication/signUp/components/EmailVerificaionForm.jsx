import { Box, Button, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material"
import InputForm from "../../../component/InputForm"

function EmailVerificationForm({
    email,
    verificationCode,
    verificationSent,
    emailVerified,
    countdown,
    handleEmailChange,
    handleVerificationCodeChange,
    sendVerificationCode,
    verifyCode,
}){

    return(
        <Box
            sx={{
                background: "#fff",
                padding: "30px 20px",
                borderRadius: "10px",
                maxWidth: "510px",
            }}
            className="bg-black"
        >
            <Grid container alignItems="center" spacing={2}>
                <InputForm
                    label="이메일"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={emailVerified}
                    endAdornment="인증번호 발송"
                    onClick={sendVerificationCode}
                />
                {/* <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        mt: 2,
                        mb: 2,
                        textTransform: "capitalize",
                        borderRadius: "8px",
                        fontWeight: "500",
                        fontSize: "16px",
                        ml:"20px",
                        mr:"2px",
                        padding: "10px 10px",
                        color: "#fff !important",
                    }}
                    onClick={sendVerificationCode}
                    disabled={emailVerified}
                >
                인증번호 보내기
                </Button> */}
                <InputForm
                    label="인증 코드"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                    endAdornment="인증하기"
                    onClick={verifyCode}
                    disabled={emailVerified}
                />
                <Typography color="textSecondary" sx={{ mt: 3, ml: 3 }}>
                    {emailVerified
                        ? '인증 완료되었습니다.'
                        : verificationSent
                        ? `인증 코드가 이메일로 발송되었습니다. 남은 시간: ${Math.floor(countdown / 60)}:${countdown % 60}`
                        : null}
                </Typography>
            </Grid>
        </Box>
    )
}


export default EmailVerificationForm;