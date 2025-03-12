import paisa from "../../../assets/images/5paisa.jpeg";
import IIFL from "../../../assets/images/IIFL.png";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Modal,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Button,
  DialogContentText,
  TextField,
  Dialog,
  IconButton,
  FormControlLabel,
  Checkbox,
  SnackbarOrigin,
} from "@mui/material";
import { JSX } from "react/jsx-runtime";
import DialogActions from "@mui/material/DialogActions";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Snackbar from '@mui/joy/Snackbar';
import ModalDialog, { ModalDialogProps } from '@mui/joy/ModalDialog';
import { ModalClose } from "@mui/joy";
import axios from "axios";
import swal from 'sweetalert';

import CancelIcon from '@mui/icons-material/Cancel';


interface State extends SnackbarOrigin {
  open: boolean;
}
export type BrokerLogin = {
  id: string;
  access_token: string;
  api_key: string;
  api_secret: string;
  user_id: string;
  user_password: string;

  totp_key: string;
  request_token: string;
  consent_to_use: boolean;
};
export default function LoginWithBroker(props: any) {

  const [isOpen, setIsOpen] = React.useState(false);
  const [isOpenGenerateModal, setIsOpenGenerateModal] = React.useState(false);

  const [generateModalformData, setGenerateModalFormData] = useState({
    TOTP: "",
    login_url: ""
  });
  const headerElement = document.getElementById("headerTextUpdate");
  if (headerElement) {
    headerElement.innerHTML = "Broker Login";
  }

  const [formData, setFormData] = useState({
    apiKey: "",
    apiSecret: "",
    userId: "",
    userPassword: "",
    totp: "",
    accessToken: "",
    requestToken: "",
    consent: false,
  });
  const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });
  const [brokerLogin, setBrokerLogin] = useState<BrokerLogin>(); // Replace 'any' with the specific type if you know the structure of your data
  const hasFetchedRef = useRef(false); // Initialize a ref
 // Example token
 const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
 const accessToken = token ? JSON.parse(token).access : "";;

const headers = {
   Authorization: "Bearer "+accessToken,
 };

  const brokerData = [
    {
      name: "Zerodha",
      icon: (
        <svg
          fill="currentColor"
          preserveAspectRatio="xMidYMid meet"
          height="60px"
          width="80px"
          viewBox="0 0 24 16"
          style={{ verticalAlign: "middle" }}
        >
          <g fill-rule="nonzero" fill="none">
            <path fill="#F6461A" d="M8 0L0 8l8 8 8-8 8-8z"></path>
            <path fill="#DB342C" d="M8 16l8-8 8 8z"></path>
          </g>
        </svg>
      ),
    },
    {
      name: "Angel one",
      icon: (
        <svg
          fill="currentColor"
          preserveAspectRatio="xMidYMid meet"
          height="60px"
          width="80px"
          viewBox="0 0 220.5 204.5"
          style={{ verticalAlign: "middle" }}
        >
          <g transform="translate(0,-847.86216)" id="layer1">
            <g
              id="g12"
              transform="matrix(1.047602,0,0,-1.047602,-377.49768,1523.1486)"
            >
              <g clip-path="url(#clipPath16)" id="g14">
                <g transform="translate(437.0133,614.6019)" id="g20">
                  <path
                    id="path22"
                    fill="#11af4b"
                    d="m 0,0 c -0.558,-0.935 -0.558,-2.101 0.001,-3.035 l 95.906,-160.434 c 0.534,-0.893 1.498,-1.441 2.539,-1.441 l 32.164,0 c 2.298,0 3.718,2.505 2.54,4.477 L 19.95,28.949 c -0.6,1.005 -2.056,1.005 -2.657,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(435.9081,580.3452)" id="g24">
                  <path
                    id="path26"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.216 l -8.1,-14.03 -8.1,-14.03 c -0.569,-0.985 -1.991,-0.985 -2.56,0 l -8.1,14.03 -8.1,14.03 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(416.5652,547.808)" id="g28">
                  <path
                    id="path30"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.985 -1.991,-0.985 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(397.0941,514.7584)" id="g32">
                  <path
                    id="path34"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.986 -1.991,-0.986 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(378.2635,480.8307)" id="g36">
                  <path
                    id="path38"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.985 -1.991,-0.985 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(416.6932,480.8307)" id="g40">
                  <path
                    id="path42"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.985 -1.991,-0.985 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(455.6355,480.8307)" id="g44">
                  <path
                    id="path46"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.985 -1.991,-0.985 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(494.5778,480.8307)" id="g48">
                  <path
                    id="path50"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.985 -1.991,-0.985 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(436.4207,514.7584)" id="g52">
                  <path
                    id="path54"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.986 -1.991,-0.986 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(474.338,514.7584)" id="g56">
                  <path
                    id="path58"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.986 -1.991,-0.986 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
                <g transform="translate(456.1479,547.808)" id="g60">
                  <path
                    id="path62"
                    fill="#ff7300"
                    d="m 0,0 16.2,0 c 1.138,0 1.849,-1.231 1.28,-2.217 l -8.1,-14.029 -8.1,-14.03 c -0.569,-0.985 -1.991,-0.985 -2.56,0 l -8.1,14.03 -8.1,14.029 C -18.049,-1.231 -17.338,0 -16.2,0 L 0,0 Z"
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      ),
    },
    {
      name: "Upstox",
      icon: (
        <svg
          fill="currentColor"
          preserveAspectRatio="xMidYMid meet"
          height="60px"
          width="80px"
          viewBox="0 0 25 24"
          style={{ verticalAlign: "middle" }}
        >
          <rect x="0.5" width="24" height="24" rx="4" fill="#5A298B"></rect>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.0113 8C15.8083 8 15.0188 8.45113 14.5301 9.09023V8.15038H13.1015V18H14.5301V14.1654C15.0564 14.8421 15.8459 15.2556 17.0113 15.2556C19.0038 15.2556 20.5451 13.7895 20.5451 11.6842C20.5451 9.54135 19.0038 8 17.0113 8V8ZM16.8609 13.9774C15.5075 13.9774 14.5301 12.9624 14.5301 11.6842C14.5301 10.406 15.5075 9.31579 16.8609 9.31579C18.2143 9.31579 19.1165 10.406 19.1165 11.6842C19.1165 12.9624 18.2143 13.9774 16.8609 13.9774ZM5.65789 11.8722C5.88346 11.7218 6.07143 11.5714 6.2594 11.3835C6.59774 11.0451 6.89849 10.6316 7.12406 10.218V12.0602C7.12406 13.2256 7.76316 13.8647 8.81579 13.8647C9.90601 13.8647 10.7707 13.188 10.7707 12.0602V8.15038H12.1992V15.1053H10.7707V14.2406C10.5451 14.5789 9.86842 15.2556 8.59022 15.2556C6.67293 15.2556 5.65789 14.0526 5.65789 12.3609V11.8722V11.8722ZM2.5 12.6617V11.2707C3.32707 11.2707 4.15413 10.9323 4.75564 10.3684C5.05639 10.0677 5.28195 9.72932 5.43233 9.35338C5.58271 8.97744 5.65789 8.56391 5.65789 8.15038H7.08646C7.08646 8.75188 6.97368 9.35338 6.74812 9.8797C6.52255 10.4436 6.18421 10.9323 5.77068 11.3459C4.86842 12.2105 3.70301 12.6617 2.5 12.6617V12.6617Z"
            fill="white"
          ></path>
        </svg>
      ),
    },
    {
      name: "ICICI Direct",
      icon: (
        <svg
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1388 1505"
          height="60px"
          width="80px"
          style={{ verticalAlign: "middle" }}
        >
          <title>ICICI_Bank_Logo-svg</title>
          <style>
            {`.s0 { fill: #f06321 } 
          .s1 { fill: #ae282e } 
          .s2 { fill: #ffffff }`}
          </style>
          <g id="layer1">
            <g id="g651">
              <path
                id="path160"
                className="s0"
                d="m393.4 327.4c343-340.8 759.2-429.2 925.7-197 166.6 232.3 20.2 701.7-322.8 1042.4-343.1 343.2-759.2 431.5-928.3 196.8-163.9-234.7-17.5-701.7 325.4-1042.2z"
              />
              <path
                id="path162"
                className="s1"
                d="m1319.1 130.4c58 85.8 75.7 199.5 63.1 328.1-45.4 174.1-156.4 361-322.9 522.4-307.7 300.4-676 376.1-829.8 171.7-148.9-204.5-22.7-613.3 277.5-911 37.8-35.5 75.6-68.3 113.5-96 285-181.8 567.5-196.8 698.6-15.2z"
              />
              <path
                id="path164"
                className="s2"
                d="m1054.3 183.4v7.6c-2.6 42.9-27.8 95.9-73.2 141.3-68 65.6-158.8 90.8-196.8 53.1-42.8-40.4-17.5-128.8 50.6-199.5 70.6-68.1 161.4-90.8 199.2-50.4 12.6 12.6 20.2 27.7 20.2 47.9zm-262.3 1158.4c-161.5 121.1-327.9 181.8-489.4 156.6 68.1 2.5 123.7-73.3 169.1-174.2 45.4-103.5 70.6-199.3 93.3-290.3 32.8-143.8 35.3-244.7 17.6-267.4-27.7-35.5-88.2-27.8-158.9 12.6-35.3 20.2-80.7 7.6-27.6-58 55.4-65.6 269.7-222.2 345.4-247.4 85.8-22.7 181.6 10.1 148.9 103.4-22.9 68.1-320.4 845.5-98.4 764.7z"
              />
            </g>
          </g>
        </svg>
      ),
    },
    {
      name: "5PAISA",
      icon: (
        <img
          height={60}
          width={80}
          src={paisa}
          style={{ objectFit: "contain" }}
        />
      ),
    },
    {
      name: "IIFL",
      icon: (
        <img
          height={60}
          width={80}
          src={IIFL}
          style={{ objectFit: "contain" }}
        />
      ),
    },
  ];

  const HandleClick = (
    broker: { name: string; icon: JSX.Element },
    index: number
  ) => {
    setIsOpen((open) => !open);
  };
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCopy = (value: any) => {
    navigator.clipboard.writeText(value);
  };
  const handleCloseModal=()=> {
    setIsOpen(false);
  }
  const handleCloseGenerateModal=()=> {
    setIsOpenGenerateModal(false);
  }
  const handleClick = (newState: SnackbarOrigin) => () => {
    setState({ ...newState, open: true });
  };

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  useEffect(() => {
    if (!hasFetchedRef.current) {
      const source = axios.CancelToken.source(); // Create a cancel token for the request
      hasFetchedRef.current = true;
      const fetchAllUsers = async () => {
        try {
          const response = await axios.get('https://api.quantradeai.com/main/kite/ebd6b6ca-1c52-4632-bb22-f77d3238b4ee/', { headers });
          setBrokerLogin(response.data.data);
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
          } else {
            console.error('Error fetching data:', error);
          }
        }
      };
      fetchAllUsers();
      // Cleanup function
      return () => {
        source.cancel('Operation canceled by the user.'); // Cancel the request if the component unmounts
        console.log('Performing cleanup operations...');
      };
    }
  }, []);


  const HandleUpdate = async (e) => {
    const body = {
      api_key: brokerLogin?.api_key,
      api_secret: brokerLogin?.api_secret,
      user_id: brokerLogin?.user_id,
      user_password: brokerLogin?.user_password,
      totp_key: brokerLogin?.totp_key,
      consent_to_use: brokerLogin?.consent_to_use,
    };

    try {
      const res = await axios.post(`https://api.quantradeai.com/main/kite/`, body, { headers });
      console.log("resres", res.data.data);
      if (res.status === 200) {
        setIsOpen(false);
        setFormData(res.data.data);
        swal("Updated!","User details are updated successfully!","success");
      } else {
        console.error('Unexpected status code:', res.status);
      }
    } catch (error) {
      console.error('Error fetching Kite data:', error);
    }
  };
  const AutoLogin = async (e) => {
    const body = {
      request_token: brokerLogin?.request_token
    };
    try {
      const res = await axios.post(`https://api.quantradeai.com/main/login/kite/auto/`, body, { headers });
      console.log("dddd", res.data.data);
      if (res.status === 200) {
        swal("Logged!","Successfully Logged In!","success");
      } else {
        console.error('Unexpected status code:', res.status);
      }
    } catch (error) {
      console.error('Error fetching Kite data:', error);
    }
  };

  const GenerateModalClick = async () =>{
    const body = {
      request_token: brokerLogin?.request_token
    };
    try {
      const res = await axios.post(`https://api.quantradeai.com/main/login/kite/`, body, { headers });
      console.log("resres", res.data.data);
      if (res.status === 200) {
        setIsOpenGenerateModal(true);
        setGenerateModalFormData(res.data.data);
        swal("Updated!","User details are updated successfully!","success");
      } else {
        console.error('Unexpected status code:', res.status);
      }
    } catch (error) {
      console.error('Error fetching Kite data:', error);
    }
  }
  const RedirectLink = async (e) => {
    window.open(generateModalformData?.login_url, '_blank');
  };
  const LoginToKite = async (e) => {
    const body = {
      request_token: headers.Authorization
    };

    try {
      const res = await axios.post(`https://api.quantradeai.com/main/login/kite/`, body, { headers });
      console.log("dddd", res.data.data);
      if (res.status === 200) {
      
        swal("Logged In!","Successfully Logged In!","success");
       
      } else {
   
        swal("Failed!","Failed to log in!","error");
        console.error('Unexpected status code:', res.status);
      }
    } catch (error) {
   
      swal("Failed!","Failed to log in!","error");
      console.error('Error fetching Kite data:', error);
    }
  };

  return (
    <>
      <Grid container spacing={1}>
        {brokerData.map((broker, index) => (
          <Grid item xs={2} sm={2} md={2} key={index} style={{background: 'white',paddingTop: '0px',marginLeft: '8px',paddingLeft:'0px',borderRadius: '10px',flexBasis: '15.666667%'}}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              border={1}
              borderColor="grey.300"
              borderRadius={2}
              p={2}
              boxShadow={2}
              onClick={() => broker.name=="Zerodha"? HandleClick(broker, index):""} // Add onClick here
              style={{ cursor: "pointer" }} // Optional: Add pointer cursor on hover
            >
              <Box mb={2}>{broker.icon}</Box>
              <Typography variant="h6" component="div">
                {broker.name}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Dialog
        open={isOpen}
        onClose={handleCloseModal}
        PaperProps={{
          component: "form",
          style: {
            width: '820px', // Set the width you want here
            maxWidth: '100%', // Ensures the width does not exceed the viewport width
          },
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const email = formJson.email;
            console.log(email);
            // handleClose();
          },
        }}
      >
        <DialogTitle>
          {" "}
          <Typography variant="h5" gutterBottom>
            API Credentials
            <CancelIcon   onClick={handleCloseModal}  style={{margin: "0px 0px 0px 580px",cursor:"pointer"}}/>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box p={3} maxWidth={700} mx="auto">
            <Grid container spacing={2}>
              {/* First Row of Fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API KEY"
                  name="apiKey"
                  value={brokerLogin?.api_key}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => handleCopy(formData.apiKey)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    // Adjust height by setting padding
                    '& .MuiInputBase-root': {
                      height: 55, // Customize height as needed
                    },
                    // Adjust font size
                    '& .MuiInputBase-input': {
                      fontSize: '14px', // Customize font size as needed
                    },
                  }}
                 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API SECRET"
                  name="apiSecret"
                  value={brokerLogin?.api_secret}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => handleCopy(formData.apiSecret)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    // Adjust height by setting padding
                    '& .MuiInputBase-root': {
                      height: 55, // Customize height as needed
                    },
                    // Adjust font size
                    '& .MuiInputBase-input': {
                      fontSize: '14px', // Customize font size as needed
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="USER ID"
                  name="userId"
                  value={brokerLogin?.user_id}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => handleCopy(formData.userId)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    // Adjust height by setting padding
                    '& .MuiInputBase-root': {
                      height: 55, // Customize height as needed
                    },
                    // Adjust font size
                    '& .MuiInputBase-input': {
                      fontSize: '14px', // Customize font size as needed
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="USER PASSWORD"
                  name="userPassword"
                  type="password"
                  value={brokerLogin?.user_password}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => handleCopy(formData.userPassword)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    // Adjust height by setting padding
                    '& .MuiInputBase-root': {
                      height: 55, // Customize height as needed
                    },
                    // Adjust font size
                    '& .MuiInputBase-input': {
                      fontSize: '14px', // Customize font size as needed
                    },
                  }}
                />
              </Grid>

              {/* Second Row of Fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="TOTP"
                  name="totp"
                  value={brokerLogin?.totp_key}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => handleCopy(formData.totp)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    // Adjust height by setting padding
                    '& .MuiInputBase-root': {
                      height: 55, // Customize height as needed
                    },
                    // Adjust font size
                    '& .MuiInputBase-input': {
                      fontSize: '14px', // Customize font size as needed
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ACCESS TOKEN"
                  name="accessToken"
                  value={brokerLogin?.access_token}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => handleCopy(formData.accessToken)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    // Adjust height by setting padding
                    '& .MuiInputBase-root': {
                      height: 55, // Customize height as needed
                    },
                    // Adjust font size
                    '& .MuiInputBase-input': {
                      fontSize: '14px', // Customize font size as needed
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="REQUEST TOKEN"
                  name="requestToken"
                  value={brokerLogin?.request_token}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => handleCopy(formData.requestToken)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    // Adjust height by setting padding
                    '& .MuiInputBase-root': {
                      height: 55, // Customize height as needed
                    },
                    // Adjust font size
                    '& .MuiInputBase-input': {
                      fontSize: '14px', // Customize font size as needed
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={brokerLogin?.consent_to_use ? true : false}
                      onChange={handleChange}
                      name="consent"
                    />
                  }
                  label="Consent to Use"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={8} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={GenerateModalClick}>
                  Generate Link
                </Button>
                <Button variant="outlined" onClick={HandleUpdate} >
                  Update Details
                </Button>
                <Button variant="outlined" onClick={AutoLogin}>Auto Login</Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
      <Dialog
        open={isOpenGenerateModal}
        onClose={handleCloseGenerateModal}
        PaperProps={{
          component: "form",
          style: {
            width: '500px', // Set the width you want here
            maxWidth: '100%', // Ensures the width does not exceed the viewport width
          },
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const email = formJson.email;
            console.log(email);
            // handleClose();
          },
        }}
      >
        <DialogTitle>
          {" "}
          <Typography variant="h5" gutterBottom>
          Generate Link
          <CancelIcon   onClick={handleCloseGenerateModal}  style={{margin: "0px 0px 0px 280px",cursor:"pointer"}}/>
          </Typography>
        </DialogTitle>
        <DialogContent>
        <Box p={3} maxWidth={700} mx="auto">
        <Grid 
          container 
          spacing={2} 
          display="flex" 
          flexDirection="column" 
          alignItems="stretch" // Ensures full-width alignment
        >
          {/* Login URL Field */}
          <Grid item>
            <TextField
              fullWidth
              label="Login Url"
              name="login_url"
              value={generateModalformData?.login_url}
              onChange={handleChange}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => handleCopy(formData.apiKey)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  height: 55,
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                },
              }}
            />
          </Grid>

          {/* TOTP Field */}
          <Grid item>
            <TextField
              fullWidth
              label="TOTP"
              name="TOTP"
              value={generateModalformData?.TOTP}
              onChange={handleChange}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => handleCopy(formData.apiSecret)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  height: 55,
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                },
              }}
            />
          </Grid>

          {/* Visit Site Button */}
          <Grid item>
            <Button
              variant="outlined"
              style={{ padding: '10px 130px 10px 130px', width: '100%' }}
              onClick={(e) => { RedirectLink(e); }}
            >
              Visit Site
            </Button>
          </Grid>

          {/* Request URL Field */}
          <Grid item>
            <TextField
              fullWidth
              label="Request URL"
              name="RequestURL"
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  height: 55,
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                },
              }}
            />
          </Grid>

          {/* Login to Kite Button */}
          <Grid item>
            <Button
              variant="outlined"
              style={{ padding: '10px 130px 10px 130px', width: '100%' }}
              onClick={(e) => { LoginToKite(e); }}
            >
              Login to Kite
            </Button>
          </Grid>
        </Grid>
        </Box>


        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  );
}
