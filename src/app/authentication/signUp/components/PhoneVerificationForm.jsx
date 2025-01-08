import { Box, Button, Grid } from "@mui/material";
import InputForm from "../../../component/InputForm";

function PhoneVerificationForm({
    phone,
    otp,
    phoneVerified,
    otpSended,
    handlePhoneChange,
    handleOtpChange,
    sendOtp,
    verifyOtp,
}){
    return(
        <Box
            sx={{
                background: "#fff",
                padding: "30px 20px",
                borderRadius: "10px",
                maxWidth: "510px",
                mb: "20px",
            }}
            className="bg-black"
        >
            <Grid container alignItems="center" spacing={2}>
                <InputForm
                    label="휴대폰번호"
                    name="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    xs={12}
                    disabled={phoneVerified}
                    endAdornment={otpSended ? "인증번호 재발송" : "인증번호 발송"}
                    onClick={sendOtp}
                />
                <InputForm
                    label="인증번호"
                    name="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    //otp 발송 전과 인증 후에 disabled
                    disabled={!otpSended || phoneVerified}
                    xs={12}
                    endAdornment="인증하기"
                    onClick={verifyOtp}
                />
            </Grid>
        </Box>
    )
}

export default PhoneVerificationForm;