
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function QuestionList(questions){

  return (
    <Box width="500px" sx={{ alignItems: "center" }}>
      {/* data가 null 이 아닐때만 map진행 */}
      {questions.length > 0 ? (
        questions.map((question, index) => (
          <Accordion key={index} style={{ display: "flex", flexDirection: "column" }}>
            <AccordionSummary style={{ display: "flex" }} expandIcon={<ExpandMoreIcon />}>
              {question.answer ? (
                <CheckCircleIcon sx={{ color: "green" }} />
              ) : (
                <RadioButtonUncheckedIcon />
              )}
              <Typography variant="h6" width="100%">
                {question.subject}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">{question.content}</Typography>
              {question.answer ? (
                <Typography variant="body2" color="textSecondary">
                  답변: {question.answer}
                </Typography>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  아직 작성된 답변이 없습니다.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body1" color="textSecondary" textAlign="center">
          표시할 데이터가 없습니다.
        </Typography>
      )}
    </Box>
  );
};

export default QuestionList;