import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import  DatePicker  from "react-datepicker";
import { Avatar } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import { Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import swal from 'sweetalert';
// import PageTitle from '../../layouts/PageTitle';
import { IMAGES } from '../../constant/theme';
import axios from 'axios';
export type User = {
    id: string;
    contact: {
        country_code: number;
        contact: number;
        is_active: boolean;
        is_permanent: boolean;
        is_verified: boolean;
    } | null;
    address: {
        city: string;
        house_num: string;
        is_active: boolean;
        is_permanent: boolean;
        is_verified: boolean;
        pincode: number;
        street: string;
    }| null;
    blaze_product_permissions: {
        is_equity_analysis: boolean;
        is_equity_orders: boolean;
        is_equity_rms: boolean;
        is_fo_analysis: boolean;
        is_fo_orders: boolean;
        is_fo_rms: boolean;
        is_monthly_status: boolean;
        num_of_allowed_watchlist: number;
    };
    first_name: string;
    last_name: string;
    is_active: boolean;
    full_name: string;
    email: string;
    pan_card: string;
    aadhaar_card: number;
    bio: string;
    date_joined:string;
    username:string;
}

let userName = JSON.parse(localStorage.getItem("userDetails") || "{}");
userName = userName.user ? userName.user : userName;
const accessToken = userName ? userName.access : "";;

const headers = {
  Authorization: "Bearer "+accessToken,
};
const EditProfile = () => {   
    const [startDate, setStartDate] = useState(new Date());
    const [userData, setUserData] = useState<User>(userName.user ? userName.user : userName);
    const [userPassword, setPassword] = useState<User>(userName.user ? userName.user : userName);


    const handleInputChange = (field, value) => {
        setUserData((prevData) => {
            const updatedData = { ...prevData };
    
            // Split the field path into an array of keys
            const fieldParts = field.split(".");

            // If the first part is 'address', ensure the address object exists
            if (fieldParts[0] === "address" && !updatedData.address) {
                updatedData.address =  {
                    city: "",
                    house_num: "",
                    is_active: false,
                    is_permanent: false,
                    is_verified: false,
                    pincode: 0,
                    street: "",
                }; // Initialize address if it doesn't exist
            }
            if (fieldParts[0] === "contact" && !updatedData.contact) {
                updatedData.contact =  {
                    country_code: 0,
                    contact: 0,
                    is_active: false,
                    is_permanent: false,
                    is_verified: false
                }; // Initialize address if it doesn't exist
            }
            // Traverse the nested structure and update the nested field
            let current = updatedData;
            for (let i = 0; i < fieldParts.length - 1; i++) {
                current = current[fieldParts[i]] = current[fieldParts[i]] || {}; // Ensure the path exists
            }
            
            // Set the final field value
            current[fieldParts[fieldParts.length - 1]] = value;
    
            return updatedData;
        });
    };
    const handlePasswordChange = (e)=>{
        setPassword(e.target.value);
    }
    const formSubmit = async () => {

        const body = {
            contact: {
                country_code: userData.contact ? userData.contact?.country_code : 0,
                contact: userData.contact ? userData.contact?.contact : 0
            },
            address: {
                house_num: userData.address ? userData.address?.house_num : "",
                street: userData.address ? userData.address?.street : "",
                city: userData.address ? userData.address?.city : "",
                pincode: userData.address ? userData.address?.pincode : ""
            },
            first_name: userData.first_name ? userData.first_name : "",
            last_name: userData.last_name ? userData.last_name : "",
            email: userData.email ? userData.email : "",
            pan_card: userData.pan_card ? userData.pan_card : "",
            aadhaar_card: userData.aadhaar_card ? userData.aadhaar_card : "",
            is_active: userData.is_active
        }


        try {
            const response = await axios.patch("https://api.quantradeai.com/user/profiles/" + userData.id + "/", body, { headers });
            if (response.status === 200) {
                const res = await response.data.data;
					localStorage.setItem('userDetails', JSON.stringify(res));
					localStorage.setItem('login', "true");
                swal("Profile!", "Profile Update Successfully", "success");
            } else {
                swal('Unable to Update Profile', "error");
            }

        } catch (error) {
            swal('Unable to Update Profile. Please check and try again', "error");
        }
    }
    const formPasswordUpdate = async () => {
        try {
            const response = await axios.post("https://api.quantradeai.com/user/profiles/password/reset/", { identifier: userName.email, new_password: userPassword });
            if (response.data.status === 200) {
                swal("Updated!","Password Update SuccessFully", "success");
            }
        } catch (error) {
            swal(error?.response?.data?.data, "error");
        }
    }
    return(
        <>            
            <div className="row">
                <div className="col-xl-3 col-lg-4" style={{ margin: "10px 0px 0px 15px"}}>
                    <div className="clearfix">
                        <div className="card card-bx profile-card author-profile mb-3">
                            <div className="card-body">
                                <div className="p-5">
                                    <div className="author-profile">
                                        <div className="author-media">
                                        <Avatar className='img' style={{height: "6.125rem", width: "6.125rem"}} sx={{ bgcolor: deepOrange[500] }}>{userName?.first_name.charAt(0).toUpperCase() +" "+userName?.last_name.charAt(0).toUpperCase()}</Avatar>
                                            <div className="upload-link" title="" data-toggle="tooltip" data-placement="right" data-original-title="update">
                                                <input type="file" className="update-flie" />
                                                <i className="fa fa-camera"></i>
                                            </div>
                                        </div>
                                        <div className="author-info">
                                            <h6 className="title">{userName?.first_name.toUpperCase() +" "+userName?.last_name.toUpperCase()}</h6>
                                            <span>{userName?.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-list">
                                    <form className="profile-form">
                                        <div className="card-body">
                                            <div className="column">
                                                {/* <div className="col-sm-12 mb-3" >
                                                    <label className="form-label">Email</label>
                                                    <input type="text" disabled={true} className="form-control" value={userData?.email} />
                                                </div> */}
                                                <div className="col-sm-12 mb-3" >
                                                    <label className="form-label">Change Password</label>
                                                    <input type="password" className="form-control" onChange={(e) => handlePasswordChange(e)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer align-items-center d-flex">
                                            <input type="hidden" id="userID" className="form-control" value={userData.id} />
                                            <Button variant="contained" onClick={() => formPasswordUpdate()} >Reset Password</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="input-group mb-3">
                                    <div className="form-control rounded text-center">Portfolio</div>
                                </div>
                                <div className="input-group">
                                    {/* <Link to="https://www.dexignlab.com/" target="_blank" className="form-control text-primary rounded text-center">https://www.dexignlab.com/</Link> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="clearfix">
                    <div className="card profile-card card-bx ">
                        <div className="card-header">
                            <h6 className="card-title">Blaze Product Permissions</h6>
                        </div>
                        <form className="profile-form">
                            <div className="card-body">
                                <div className="row">
                                        <div className="col-sm-6 mb-3" >
                                        <FormControlLabel  disabled={true} className="form-label" 
                                                control={<Switch onChange={(e) => handleInputChange('blaze_product_permissions.is_equity_analysis', e.target.value)} 
                                                checked={userData?.blaze_product_permissions?.is_equity_analysis ? true : false} />} label="Equity Analysis" />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                        <FormControlLabel  disabled={true} className="form-label" 
                                                control={<Switch onChange={(e) => handleInputChange('blaze_product_permissions.is_equity_orders', e.target.value)} 
                                                checked={userData?.blaze_product_permissions?.is_equity_orders ? true : false} />} label="Equity Orders" />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                        <FormControlLabel  disabled={true} className="form-label" 
                                                control={<Switch onChange={(e) => handleInputChange('blaze_product_permissions.is_equity_rms', e.target.value)} 
                                                checked={userData?.blaze_product_permissions?.is_equity_rms ? true : false} />} label="Equity RMS" />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                        <FormControlLabel  disabled={true} className="form-label" 
                                                control={<Switch onChange={(e) => handleInputChange('blaze_product_permissions.is_fo_analysis', e.target.value)} 
                                                checked={userData?.blaze_product_permissions?.is_fo_analysis ? true : false} />} label="FO Analysis" />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                        <FormControlLabel  disabled={true} className="form-label" 
                                                control={<Switch onChange={(e) => handleInputChange('blaze_product_permissions.is_fo_orders', e.target.value)} 
                                                checked={userData?.blaze_product_permissions?.is_fo_orders ? true : false} />} label="FO Orders" />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                        <FormControlLabel  disabled={true} className="form-label" 
                                                control={<Switch onChange={(e) => handleInputChange('blaze_product_permissions.is_fo_rms', e.target.value)} 
                                                checked={userData?.blaze_product_permissions?.is_fo_rms ? true : false} />} label="FO RMS" />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                        <FormControlLabel  disabled={true} className="form-label" 
                                                control={<Switch onChange={(e) => handleInputChange('blaze_product_permissions.is_monthly_status', e.target.value)} 
                                                checked={userData?.blaze_product_permissions?.is_monthly_status ? true : false} />} label="Monthly Status" />
                                        </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
                <div className="col-xl-9 col-lg-8" style={{ margin: "10px 0px 0px 0px"}}>
                    <div className="card profile-card card-bx ">
                        <div className="card-header">
                            <h6 className="card-title">Account setup</h6>
                        </div>
                        <form className="profile-form">
                            <div className="card-body">
                                <div className="row">
                                    
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">User Name</label>
                                            <input type="text" disabled={true} className="form-control" value={userData?.username}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">First Name</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('first_name', e.target.value)} value={userData?.first_name}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">Last Name</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('last_name', e.target.value)} value={userData?.last_name}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">Aadhaar Card</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('aadhaar_card', e.target.value)} value={userData?.aadhaar_card}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">Email</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('email', e.target.value)} value={userData?.email}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">PAN Card</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('pan_card', e.target.value)} value={userData?.pan_card}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">Contact</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('contact.contact', e.target.value)} value={userData?.contact ? userData?.contact?.contact : ""}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">House Number</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('address.house_num', e.target.value)} value={userData?.address ? userData?.address?.house_num : ""}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                        <FormControlLabel style={{margin: "30px 0px 0px 0px"}} disabled={userData?.is_active ? false : true} className="form-label" control={<Switch onChange={(e) => handleInputChange('is_active', e.target.value)} checked={userData?.is_active ? true : false} />} label="Active" />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">Street</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('address.street', e.target.value)} value={userData?.address ? userData?.address?.street : ""}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">Date Joined</label>
                                            <input type="date" className="form-control" disabled={true} onChange={(e) => handleInputChange('date_joined', e.target.value)} value={new Date(userData?.date_joined).toISOString().split('T')[0]}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">City</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('address.city', e.target.value)} value={userData?.address ? userData?.address?.city : ""}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">Pincode</label>
                                            <input type="text" className="form-control" onChange={(e) => handleInputChange('address.pincode', e.target.value)} value={userData?.address ? userData?.address?.pincode : ""}  />
                                        </div>
                                        <div className="col-sm-6 mb-3" >
                                            <label className="form-label">WatchList Allowed</label>
                                            <input type="text" disabled={true} className="form-control" 
                                            onChange={(e) => handleInputChange('blaze_product_permissions.num_of_allowed_watchlist', e.target.value)} 
                                            value={userData?.blaze_product_permissions ? userData?.blaze_product_permissions?.num_of_allowed_watchlist : ""}  />
                                        </div>
                                </div>
                            </div>
                            <div className="card-footer align-items-center d-flex">
                            <input type="hidden" id="userID" className="form-control" value={userData.id}  />

                            <Button variant="contained" onClick={() => formSubmit()} >Update</Button>
                            </div>
                        </form>
                    </div>
                </div>
                
            </div>
        </>
    )
}
export default EditProfile;
