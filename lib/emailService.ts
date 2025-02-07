import axios from "axios";

interface EmailDetails {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (emailDetails: EmailDetails) => {
  console.log("Sending email with details:", emailDetails); // Debugging line
  const response = await axios.post("/api/send-email", emailDetails);
  return response.data;
};
