import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';


import {  useMemo, useRef, useState } from 'react';
//MRT Imports
import { MaterialReactTable, MRT_ColumnDef, MRT_GlobalFilterTextField, MRT_ToggleFiltersButton, useMaterialReactTable } from 'material-react-table';
//Material UI Imports
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary,Tooltip, Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,FormControlLabel, DialogActions } from '@mui/material';
//Date Picker Imports - these should just be in your Context Provider
import  {AdapterDayjs}  from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import Switch from '@mui/material/Switch';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { green, red } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from "@mui/icons-material/Delete";
import swal from "sweetalert";

export type Employee = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  contact: any;
  is_active: number;
  is_user: string;
  date_joined: string;
  aadhaar_card: string;
  pan_card: string;
  address: any;
  is_equity_analysis: string;
  is_equity_orders: string;
  is_equity_rms: string;
  is_fo_analysis: string;
  is_fo_orders: string;
  is_fo_rms: string;
  is_monthly_status: string;
};
interface Props {
  Data: any[];
  onApplyChanges: (selectedItems: any[]) => void;

}

const UserDetailPanel = ({ row }) => {
  const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
    const headers = {
      Authorization: "Bearer "+ accessToken,
    };
  const [userData, setUserData] = useState({
    rowid:"",
    full_name: "",
    username: "",
    first_name:"",
    last_name:"",
    email: "",
    contact: "",
    is_active: false,
    date_joined: "", // Assuming this can be empty or invalid
    aadhaar_card: "",
    pan_card: "",
    password:"",
    address: {
      house_num: "",
      street: "",
      city: "",
      pincode: 0,
    },
    blaze_product_permissions: {
      num_of_allowed_watchlist: 0,
      is_equity_analysis: false,
      is_equity_orders: false,
      is_fo_analysis: false,
      is_fo_orders: false,
      is_monthly_status: false,
      is_active: false,
    },
  });
  const [isEdit, setIsEdit] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
const [newPassword, setNewPassword] = useState('');
  useEffect(() => {
    // Initialize userData with row data when the component mounts or row changes
    if (row) {
      setUserData({
        ...userData,
        rowid:row.original.id,
        full_name: row.original.full_name,
        first_name:row.original.first_name,
        last_name:row.original.last_name,
        username: row.original.username,
        email: row.original.email,
        contact: row.original.contact ? row.original.contact.contact : "",
        is_active: row.original.is_active,
        date_joined: row.original.date_joined || "", // Ensuring date_joined is not undefined
        aadhaar_card: row.original.aadhaar_card,
        pan_card: row.original.pan_card,
        address: row.original.address || {},
        blaze_product_permissions: row.original.blaze_product_permissions || {},
      });
    }
  }, [row]);

  const handleInputChange = (field, value) => {
    setUserData((prevData) => {
      // Handling nested updates for address and blaze_product_permissions
      if (field.includes('address.')) {
        const [mainKey, subKey] = field.split('.');
        return {
          ...prevData,
          [mainKey]: {
            ...prevData[mainKey],
            [subKey]: value,
          },
        };
      }

      if (field.includes('blaze_product_permissions.')) {
        const [mainKey, subKey] = field.split('.');
        return {
          ...prevData,
          [mainKey]: {
            ...prevData[mainKey],
            [subKey]: value,
          },
        };
      }

      return {
        ...prevData,
        [field]: value,
      };
    });
  };


  const onEditClick = () => {
    setIsEdit(!isEdit);
  };

  const formSubmit = async (rowId: string) => {
    const formRequest: any = {}; // Initialize as an empty object to dynamically add non-empty fields

    // Contact
    if (userData.contact && userData.contact !== row.original.contact?.contact && userData.contact.trim() !== "") {
      formRequest.contact = { contact: userData.contact };
    }
  
    // Blaze product permissions
    if (
      userData.blaze_product_permissions.num_of_allowed_watchlist !== row.original.blaze_product_permissions?.num_of_allowed_watchlist ||
      userData.blaze_product_permissions.is_equity_analysis !== row.original.blaze_product_permissions?.is_equity_analysis ||
      userData.blaze_product_permissions.is_equity_orders !== row.original.blaze_product_permissions?.is_equity_orders ||
      userData.blaze_product_permissions.is_fo_analysis !== row.original.blaze_product_permissions?.is_fo_analysis ||
      userData.blaze_product_permissions.is_fo_orders !== row.original.blaze_product_permissions?.is_fo_orders ||
      userData.blaze_product_permissions.is_monthly_status !== row.original.blaze_product_permissions?.is_monthly_status ||
      userData.blaze_product_permissions.is_active !== row.original.blaze_product_permissions?.is_active
    ) {
      formRequest.blaze_product_permissions = {
        num_of_allowed_watchlist: userData.blaze_product_permissions.num_of_allowed_watchlist,
        is_equity_analysis: userData.blaze_product_permissions.is_equity_analysis,
        is_equity_orders: userData.blaze_product_permissions.is_equity_orders,
        is_fo_analysis: userData.blaze_product_permissions.is_fo_analysis,
        is_fo_orders: userData.blaze_product_permissions.is_fo_orders,
        is_monthly_status: userData.blaze_product_permissions.is_monthly_status,
        is_active: userData.blaze_product_permissions.is_active,
      };
    }
    // Address fields
    if (userData.address.house_num && userData.address.house_num !== row.original.address?.house_num && userData.address.house_num.trim() !== "") {
      formRequest.address = formRequest.address || {}; // Initialize address if it's not already
      formRequest.address.house_num = userData.address.house_num;
    }
    if (userData.address.street && userData.address.street !== row.original.address?.street && userData.address.street.trim() !== "") {
      formRequest.address = formRequest.address || {}; // Initialize address if it's not already
      formRequest.address.street = userData.address.street;
    }
    if (userData.address.city && userData.address.city !== row.original.address?.city && userData.address.city.trim() !== "") {
      formRequest.address = formRequest.address || {}; // Initialize address if it's not already
      formRequest.address.city = userData.address.city;
    }
    if (userData.address.pincode && userData.address.pincode !== row.original.address?.pincode) {
      formRequest.address = formRequest.address || {}; // Initialize address if it's not already
      formRequest.address.pincode = userData.address.pincode;
    }
  
    // Full name (splitting into first and last name)
    if (userData.first_name && userData.first_name !== row.original.first_name && userData.first_name.trim() !== "") {
      formRequest.first_name = userData.first_name;
    }
    if (userData.last_name && userData.last_name !== row.original.last_name && userData.last_name.trim() !== "") {
      formRequest.last_name = userData.last_name;
    }
  
    // Email
    if (userData.email && userData.email !== row.original.email && userData.email.trim() !== "") {
      formRequest.email = userData.email;
    }
  
    // PAN Card
    if (userData.pan_card && userData.pan_card !== row.original.pan_card && userData.pan_card.trim() !== "") {
      formRequest.pan_card = userData.pan_card;
    }
  
    // Aadhaar Card
    if (userData.aadhaar_card && userData.aadhaar_card !== row.original.aadhaar_card && userData.aadhaar_card.trim() !== "") {
      formRequest.aadhaar_card = userData.aadhaar_card;
    }
  
    // Is Active
    if (userData.is_active !== row.original.is_active) {
      formRequest.is_active = userData.is_active;
    }
  
    // Password
    if (userData.password && userData.password.trim() !== "") {
      formRequest.password = userData.password.trim();
    }
  
    try {
      const response = await axios.patch(`https://api.quantradeai.com/user/profiles/${rowId}/`, formRequest, { headers });
  
      if (response.status >= 200 && response.status < 300) {
        console.log('User updated successfully:', response.data);
        swal("Updated!", "User Details Updated successfully!", "success");
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  const handleResetPasswordClick = async () => {
    try {
      const requestBody = {
        id: userData.rowid,  
        length: 16,           
        uppercase: true,      
        digits: true,         
        symbols: true         
      };
      const response = await axios.post(
        'https://api.quantradeai.com/user/generate/password/',  
        requestBody,  
        { headers }   
      );
  
      if (response.status >= 200 && response.status < 300) {
        const newPassword = response.data.data;  
        setNewPassword(newPassword);  
        setOpenPasswordModal(true); 
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      swal("Error", "Failed to reset password. Please try again.", "error");
    }
  };

  return (
    <>
   <Dialog
  open={openPasswordModal}
  onClose={() => setOpenPasswordModal(false)}
  maxWidth="xs"  // Reduce width by setting maxWidth to "xs"
  fullWidth
  sx={{
    '& .MuiDialogPaper': {
      backgroundColor: '#f5f5f5', // Change background color
      borderRadius: '8px', // Optional: rounded corners
    },
  }}
>
  <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white' }}>New Password</DialogTitle>
  <DialogContent>
    <Typography variant="body1" gutterBottom >* Please save this, it will NOT Reflect again!</Typography>
    <TextField
      value={newPassword}
      fullWidth
      variant="outlined"
      disabled
      InputProps={{
        endAdornment: (
          <IconButton
            onClick={() => {
              navigator.clipboard.writeText(newPassword);
              swal("Copied!", "Password copied to clipboard!", "success");
            }}
          >
            <ContentCopyIcon />
          </IconButton>
        ),
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenPasswordModal(false)} color="primary">Close</Button>
  </DialogActions>
</Dialog>
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
      {/* Card 1: User Information */}
      <Card sx={{ flex: 1, width: '50%', padding: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="div" gutterBottom>
              User Information
            </Typography>
            <IconButton size="small" onClick={onEditClick}>
              {isEdit ? <CloseIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
          </Box>

          <Box sx={{ mt: 2 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                <TableRow>
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>First Name:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.first_name}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.first_name
                        )}
                      </Typography>
                    </TableCell>
                    {/* Aadhaar Card Row */}
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>Last Name:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.last_name}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.last_name
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {/* Username Row */}
                  <TableRow>
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>Username:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.username
                        )}
                      </Typography>
                    </TableCell>
                    {/* Aadhaar Card Row */}
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>Aadhaar Card:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.aadhaar_card}
                            onChange={(e) => handleInputChange('aadhaar_card', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.aadhaar_card
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Email Row */}
                  <TableRow>
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>Email:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.email
                        )}
                      </Typography>
                    </TableCell>
                    {/* PAN Card Row */}
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>PAN Card:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.pan_card}
                            onChange={(e) => handleInputChange('pan_card', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.pan_card
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Contact Row */}
                  <TableRow>
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>Contact:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.contact}
                            onChange={(e) => handleInputChange('contact', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.contact
                        )}
                      </Typography>
                    </TableCell>
                      {/* Watchlist Allowed Row */}
                      <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>WatchList Allowed:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.blaze_product_permissions.num_of_allowed_watchlist}
                            onChange={(e) => handleInputChange('blaze_product_permissions.num_of_allowed_watchlist', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.blaze_product_permissions.num_of_allowed_watchlist
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Active Status Row */}
                  <TableRow>
                    {/* House Number Row */}
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>House Number:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.address.house_num}
                            onChange={(e) => handleInputChange('address.house_num', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.address.house_num
                        )}
                      </Typography>
                    </TableCell>
                    
                    {/* Street Row */}
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>Street:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.address.street}
                            onChange={(e) => handleInputChange('address.street', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.address.street
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Date Joined Row */}
                  <TableRow>
                    {/* City Row */}
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>City:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.address.city}
                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.address.city
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>Pincode:</strong>
                        {isEdit ? (
                          <TextField
                            value={userData.address.pincode}
                            onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          userData.address.pincode
                        )}
                      </Typography>
                      </TableCell>
                  </TableRow>

                  {/* Pincode Row */}
                  <TableRow>
                  <TableCell style={{ width: '50%', padding: '9px' }}>
    <Typography variant="body2">
      <strong>Reset Password:</strong>
      {isEdit ? (
        <Button
          variant="outlined"
          onClick={handleResetPasswordClick}
          fullWidth
        >
          Reset Password
        </Button>
      ) : (
        '******' // Masked password
      )}
    </Typography>
  </TableCell>
                       <TableCell style={{ width: '50%', padding: '9px' }}>
                      <Typography variant="body2">
                        <strong>Active:</strong>
                        {isEdit ? (
                          <Switch
                            checked={userData.is_active}
                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                            color="primary"
                          />
                        ) : (
                          userData.is_active ? 'Yes' : 'No'
                        )}
                      </Typography>
                    
                    </TableCell>
                          </TableRow>
                  {/* Submit Button */}
                  <TableRow>
  <TableCell colSpan={2}>
    {isEdit ? (
      <Button variant="contained" onClick={() => formSubmit(userData.rowid)}>
        Update
      </Button>
    ) : null}
  </TableCell>
</TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>
       
        <Card sx={{ flex: 1, width: '50%', padding: 2 }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              Permissions
            </Typography>
  
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Active:</strong>
                    <Switch checked={userData.blaze_product_permissions.is_active ? true : false}
                    onChange={(e) => handleInputChange('blaze_product_permissions.is_active', e.target.checked)}
                    color="primary"
                  /> 
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Equity Analysis:</strong>
                    <Switch
                            checked={userData.blaze_product_permissions.is_equity_analysis? true : false}
                            onChange={(e) => handleInputChange('blaze_product_permissions.is_equity_analysis', e.target.checked)}
                            color="primary"
                          />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Equity Order:</strong>
                    <Switch 
                    checked={userData.blaze_product_permissions.is_equity_orders ? true : false} 
                    onChange={(e) => handleInputChange('blaze_product_permissions.is_equity_orders', e.target.checked)}
                    color="primary"/>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Future Analysis:</strong>
                    <Switch checked={userData.blaze_product_permissions.is_fo_analysis ? true : false} 
                     onChange={(e) => handleInputChange('blaze_product_permissions.is_fo_analysis', e.target.checked)}
                    color="primary"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Future Order:</strong>
                    <Switch checked={userData.blaze_product_permissions.is_fo_orders ? true : false}
                      onChange={(e) => handleInputChange('blaze_product_permissions.is_fo_orders', e.target.checked)}
                      color="primary"
                      />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Monthly Status:</strong>
                    <Switch checked={userData.blaze_product_permissions.is_monthly_status ? true : false}
                     onChange={(e) => handleInputChange('blaze_product_permissions.is_monthly_status', e.target.checked)}
                     color="primary"
                     />
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
      </>
    );
  };
  
  const Users_is_superuser:React.FC<Props> = ({ Data, onApplyChanges }) => {
    const [isOpen, setIsOpen] = useState(false);
    const data = useMemo(() => Data.filter(x => x.is_superuser && x.is_active), [Data]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
    const headers = {
      Authorization: "Bearer "+ accessToken,
    };
    const handleDeleteRow = async (rowId: string) => {
      try {
        const response = await axios.delete(
          `https://api.quantradeai.com//user/profiles/?id=${rowId}`,
          {
            headers: headers,
          }
        );
        if (response.status === 204) {
          swal("Updated!", "User Deleted Successfully!", "success");
          console.log("User deleted successfully!");
          window.location.reload();
        }
      } catch (error) {
        swal("Error!", "Error deleting User!", "error");
        console.error("Error deleting User:", error);
      }
    };
    const columns = useMemo<MRT_ColumnDef<Employee>[]>(
      () => [
        {
          accessorFn: (row) => `${row.full_name}`, //accessorFn used to join multiple data into a single cell
          id: 'full_name', //id is still required when using accessorFn instead of accessorKey
          header: 'Full Name',
          size: 150,
          Cell: ({ renderedCellValue, row }) => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorKey: 'username', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
          filterVariant: 'autocomplete',
          header: 'User Name',
          size: 150,
        },
        {
          accessorKey: 'email', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
          filterVariant: 'autocomplete',
          header: 'Email',
          size: 250,
        },
        {
          accessorFn: (row) => `${row.contact ? row.contact.contact : ""}`,
          header: 'Contact',
          size: 150,
          //custom conditional format and styling
          Cell: ({ cell }) => (
            <Box
              component="span"
            >
              {cell.getValue<number>()}
            </Box>
          ),
        },
        // {
        //   id: 'is_active', //id is still required when using accessorFn instead of accessorKey
        //   header: 'Active',
  
        //   size: 100,
        //   Cell: ({ renderedCellValue, row }) => (
        //      <Switch checked={row.original.is_active ? true : false} />
           
        //   ),
        // },
        {
          accessorKey: 'is_user', //hey a simple column for once
          header: 'User Type',
          size: 50,
          Cell: ({ renderedCellValue, row }) => (
            <>
              {row.original.is_user ? "User" : ""}
            </>
  
          ),
        },
        {
          accessorKey: 'date_joined',
          id: 'date_joined',
          header: 'Joining Date',
          size: 100,
          Cell: ({ renderedCellValue, row }) => (
            <>
              {dayjs(row.original.date_joined).format('MM-DD-YYYY')}
            </>
  
          ),
        },
        {
          id: "actions", // Define a unique ID for the action column
          header: "Actions",
          enableEditing: false,
          Cell: ({ row }) => (
            <Box
              sx={{
                display: "flex",
                gap: "1rem",
              }}
            >
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() => handleDeleteRow(row.original.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ),
        },
      ],
      [],
    );
    
  
    
    const AdminShowModal = () => {
      const selectedRows = table_is_superuser.getSelectedRowModel()?.rows.map((row) => row.original);
      if (selectedRows?.length > 0) {
        // Initialize the selected users with their current permissions
        const usersWithPermissions = selectedRows.map((row) => ({
          username: row.username,
          is_active:row.is_active,
          permissions: row.blaze_product_permissions || {},  // If no permissions exist, default to an empty object
        }));
        setSelectedUsers(usersWithPermissions);
      }
      setIsOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsOpen(false);
    };
  
    const handlePermissionChange = (userIndex, field, checked) => {
      setSelectedUsers((prevSelectedUsers) => {
        const updatedUsers = [...prevSelectedUsers];
    
        if (field === 'is_active_user') {
          // Ensure is_active is an object before assigning properties to it
          if (typeof updatedUsers[userIndex].is_active !== 'object') {
            updatedUsers[userIndex].is_active = {}; // Convert to an empty object if it's a boolean
          }
          updatedUsers[userIndex].is_active = checked;
        } else {
          updatedUsers[userIndex].permissions[field] = checked;
        }
    
        return updatedUsers;
      });
    };
    const applyChanges = () => {
      const selectedItems = table_is_superuser.getSelectedRowModel()?.rows.map((row) => row.original) || [];
      const itemsToUpdate = selectedItems.length > 0 ? selectedItems : data;
  
      // Pass `selectedUsers` with updated permissions as part of each item's update object
      const updatedItems = itemsToUpdate.map((item) => {
        const updatedPermissions = selectedUsers.find(user => user.username === item.username)?.permissions || {};
        const active_user = selectedUsers.find(user => user.username === item.username)?.is_active ?? false; 
        return {
          ...item,
          is_active:active_user,
          blaze_product_permissions: updatedPermissions,
        };
      });
  
      onApplyChanges(updatedItems);
      handleCloseModal();
    };
    const table_is_superuser = useMaterialReactTable({
      columns,
      data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      // enableColumnFilterModes: true,
      enableColumnOrdering: true,
      enableGrouping: true,
      enableColumnPinning: true,
      enableFacetedValues: true,
      enableRowSelection: true,
      initialState: {
        // showColumnFilters: true,
        showGlobalFilter: true,
        columnPinning: {
          left: ['mrt-row-expand', 'mrt-row-select'],
          right: ['mrt-row-actions'],
        },
      },
      paginationDisplayMode: 'pages',
      positionToolbarAlertBanner: 'bottom',
      muiSearchTextFieldProps: {
        size: 'small',
        variant: 'outlined',
      },
      muiPaginationProps: {
        color: 'secondary',
        rowsPerPageOptions: [10, 20, 30],
        shape: 'rounded',
        variant: 'outlined',
      },
      renderDetailPanel: ({ row }) => {
        return <UserDetailPanel row={row} />;
      },
      renderTopToolbarCustomActions: ({ table }) => (
        <Box>
        {/* Custom Actions */}
        <Box sx={{ display: 'flex', gap: '16px', padding: '8px', flexWrap: 'wrap' }}>
            {/* <IconButton color="primary" disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}>
            <AddIcon />
          </IconButton>
  
          <IconButton color="primary" disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}>
            <FileDownloadIcon />
          </IconButton> */}
        <Button variant="outlined" color="primary" disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={AdminShowModal}>
      <OpenInNewIcon /> &nbsp; Permissions
    </Button>
  </Box>

  {/* Modal for Editing Permissions */}
  <Dialog className="permissions" open={isOpen} onClose={handleCloseModal}>
    <DialogTitle>Manage Permissions
    <IconButton onClick={handleCloseModal} color="primary">
    <CloseIcon  style={{marginLeft: "800px", cursor: "pointer"}} />
     </IconButton>

    </DialogTitle>
    <DialogContent>
    <Box mt={6} >
  {/* Headers for the columns */}
  <Grid container spacing={3} alignItems="center" style={{marginBottom: "15px"}}>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">UserName</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Equity Analysis</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Equity Orders</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Future Analysis</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Future Orders</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Monthly Status</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Active</Typography>
        </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Allowed WatchList</Typography>
  </Grid>
</Grid>

<Box
    style={{
      maxHeight: "400px", // Set max height to enable scrolling
      overflowY: "auto", // Enable vertical scrolling
      paddingBottom: "20px", // Add padding to the bottom for better scrolling experience
    }}
  >
  {/* Data for each user */}
  {selectedUsers.map((user, index) => (
    <Grid container spacing={3} alignItems="center" key={index}>
      {/* UserName */}
      <Grid item xs={12} sm={6} md={2}>
        <Typography variant="body2">{user.username}</Typography>
      </Grid>

      {/* Equity Analysis */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_equity_analysis || false}
          onChange={(e) => handlePermissionChange(index, 'is_equity_analysis', e.target.checked)}
        />
      </Grid>

      {/* Equity Orders */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_equity_orders || false}
          onChange={(e) => handlePermissionChange(index, 'is_equity_orders', e.target.checked)}
        />
      </Grid>

      {/* Future Analysis */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_fo_analysis || false}
          onChange={(e) => handlePermissionChange(index, 'is_fo_analysis', e.target.checked)}
        />
      </Grid>

      {/* Future Orders */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_fo_orders || false}
          onChange={(e) => handlePermissionChange(index, 'is_fo_orders', e.target.checked)}
        />
      </Grid>

      {/* Monthly Status */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_monthly_status || false}
          onChange={(e) => handlePermissionChange(index, 'is_monthly_status', e.target.checked)}
        />
      </Grid>
{/* Monthly Status */}
<Grid item xs={12} sm={6} md={2}>
              <Switch
                checked={user.is_active || false}
                onChange={(e) => handlePermissionChange(index, 'is_active_user', e.target.checked)}
              />
            </Grid>
      {/* Allowed WatchList */}
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          value={user.permissions.num_of_allowed_watchlist || ''}
          onChange={(e) => handlePermissionChange(index, 'num_of_allowed_watchlist', e.target.value)}
          size="small"
          fullWidth
          variant="outlined"
        />
      </Grid>
    </Grid>
  ))}
  </Box>
    </Box>

          </DialogContent>
    <DialogActions>
      <Button onClick={applyChanges} variant="contained">
        Apply Changes
      </Button>
    </DialogActions>
  </Dialog>
</Box>
      ),
      state: {
        isLoading: data && data.length > 0 ? false : true, // Set loading state for MaterialReactTable
       }
    });
    return  <MaterialReactTable table={table_is_superuser} />
  };
  const Users_is_user : React.FC<Props> = ({Data,onApplyChanges }) => {
    const [isOpen, setIsOpen] = useState(false);
    const data = useMemo(() => Data.filter(x => x.is_user && !x.is_superuser && x.is_active), [Data]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    type User = {
      id: string;
      blaze_product_permissions: {
        is_equity_analysis: boolean;
        is_equity_orders: boolean;
        is_fo_analysis: boolean;
        is_equity_rms: boolean;
        is_fo_orders: boolean;
        is_fo_rms: boolean;
        is_monthly_status: boolean;
      };
    };
    
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
    const headers = {
      Authorization: "Bearer "+ accessToken,
    };
    const handleDeleteRow = async (rowId: string) => {
      try {
        const response = await axios.delete(
          `https://api.quantradeai.com//user/profiles/?id=${rowId}`,
          {
            headers: headers,
          }
        );
        if (response.status === 204) {
          swal("Updated!", "User Deleted Successfully!", "success");
          console.log("User deleted successfully!");
          window.location.reload();
        }
      } catch (error) {
        swal("Error!", "Error deleting User!", "error");
        console.error("Error deleting User:", error);
      }
    };
    const AdminShowModal = () => {
      const selectedRows = table_is_superuser.getSelectedRowModel()?.rows.map((row) => row.original);
      if (selectedRows?.length > 0) {
        const usersWithPermissions = selectedRows.map((row) => ({
          username: row.username,
          is_active:row.is_active,
          permissions: row.blaze_product_permissions || {},  // If no permissions exist, default to an empty object
        }));
        setSelectedUsers(usersWithPermissions);
      }
      setIsOpen(true);
    };
    const handleCloseModal = () => {
      setIsOpen(false);
    };
    const handlePermissionChange = (userIndex, field, checked) => {
      setSelectedUsers((prevSelectedUsers) => {
        const updatedUsers = [...prevSelectedUsers];
    
        if (field === 'is_active_user') {
          // Ensure is_active is an object before assigning properties to it
          if (typeof updatedUsers[userIndex].is_active !== 'object') {
            updatedUsers[userIndex].is_active = {}; // Convert to an empty object if it's a boolean
          }
          updatedUsers[userIndex].is_active = checked;
        } else {
          updatedUsers[userIndex].permissions[field] = checked;
        }
    
        return updatedUsers;
      });
    };
    const applyChanges = () => {
      const selectedItems = table_is_superuser.getSelectedRowModel()?.rows.map((row) => row.original) || [];
      const itemsToUpdate = selectedItems.length > 0 ? selectedItems : data;
  
      // Pass `selectedUsers` with updated permissions as part of each item's update object
      const updatedItems = itemsToUpdate.map((item) => {
        const updatedPermissions = selectedUsers.find(user => user.username === item.username)?.permissions || {};
        const active_user = selectedUsers.find(user => user.username === item.username)?.is_active ?? false; 
        return {
          ...item,
          is_active:active_user,
          blaze_product_permissions: updatedPermissions,
        };
      });
  
      onApplyChanges(updatedItems);
      handleCloseModal();
    };
    const columns = useMemo<MRT_ColumnDef<Employee>[]>(
      () => [
        {
          accessorFn: (row) => `${row.full_name}`, //accessorFn used to join multiple data into a single cell
          id: 'full_name', //id is still required when using accessorFn instead of accessorKey
          header: 'Full Name',
          size: 150,
          Cell: ({ renderedCellValue, row }) => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorKey: 'username', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
          filterVariant: 'autocomplete',
          header: 'User Name',
          size: 150,
        },
        {
          accessorKey: 'email', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
          filterVariant: 'autocomplete',
          header: 'Email',
          size: 250,
        },
        {
          accessorFn: (row) => `${row.contact ? row.contact.contact : ""}`,
          header: 'Contact',
          size: 150,
          //custom conditional format and styling
          Cell: ({ cell }) => (
            <Box
              component="span"
            >
              {cell.getValue<number>()}
            </Box>
          ),
        },
        // {
        //   id: 'is_active', //id is still required when using accessorFn instead of accessorKey
        //   header: 'Active',
  
        //   size: 100,
        //   Cell: ({ renderedCellValue, row }) => (
        //     <Switch checked={row.original.is_active ? true : false} />
        //   ),
        // },
        {
          accessorKey: 'is_user', //hey a simple column for once
          header: 'User Type',
          size: 50,
          Cell: ({ renderedCellValue, row }) => (
            <>
              {row.original.is_user ? "User" : ""}
            </>
  
          ),
        },
        {
          accessorKey: 'date_joined',
          id: 'date_joined',
          header: 'Joining Date',
          size: 100,
          Cell: ({ renderedCellValue, row }) => (
            <>
              {dayjs(row.original.date_joined).format('MM-DD-YYYY')}
            </>
  
          ),
        },
        {
          id: "actions", // Define a unique ID for the action column
          header: "Actions",
          enableEditing: false,
          Cell: ({ row }) => (
            <Box
              sx={{
                display: "flex",
                gap: "1rem",
              }}
            >
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() => handleDeleteRow(row.original.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ),
        },
      ],
      [],
    );
    const table_is_superuser = useMaterialReactTable({
      columns,
      data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      enableColumnOrdering: true,
      enableGrouping: true,
      enableColumnPinning: true,
      enableFacetedValues: true,
      enableRowSelection: true,
      initialState: {
        showGlobalFilter: true,
        columnPinning: {
          left: ['mrt-row-expand', 'mrt-row-select'],
          right: ['mrt-row-actions'],
        },
      },
      paginationDisplayMode: 'pages',
      positionToolbarAlertBanner: 'bottom',
      muiSearchTextFieldProps: {
        size: 'small',
        variant: 'outlined',
      },
      muiPaginationProps: {
        color: 'secondary',
        rowsPerPageOptions: [10, 20, 30],
        shape: 'rounded',
        variant: 'outlined',
      },
      renderDetailPanel: ({ row }) => {
        return <UserDetailPanel row={row} />;
      },
      renderTopToolbarCustomActions: ({ table }) => (
        <Box sx={{display: 'flex',gap: '16px',padding: '8px',flexWrap: 'wrap'}}>
  
          {/* <IconButton color="primary" disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}>
            <AddIcon />
          </IconButton>
  
          <IconButton color="primary" disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}>
            <FileDownloadIcon />
          </IconButton> */}

          <Button variant="outlined" color="primary" disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={()=>AdminShowModal()}><OpenInNewIcon/>&nbsp; Permissions</Button>

          <Dialog open={isOpen} onClose={handleCloseModal}>
    <DialogTitle>Manage Permissions
    <IconButton onClick={handleCloseModal} color="primary">
    <CloseIcon  style={{marginLeft: "800px", cursor: "pointer"}} />
     </IconButton>
      
    </DialogTitle>
    <DialogContent>
    <Box mt={6} >
  {/* Headers for the columns */}
  <Grid container spacing={3} alignItems="center" style={{marginBottom: "15px"}}>
  <Grid item xs={12} sm={3} md={2}>
    <Typography variant="subtitle2" color="textSecondary">UserName</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Equity Analysis</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Equity Orders</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Future Analysis</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Future Orders</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Monthly Status</Typography>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Active</Typography>
        </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <Typography variant="subtitle2" color="textSecondary">Allowed WatchList</Typography>
  </Grid>
</Grid>

<Box
    style={{
      maxHeight: "400px", // Set max height to enable scrolling
      overflowY: "auto", // Enable vertical scrolling
      paddingBottom: "20px", // Add padding to the bottom for better scrolling experience
    }}
  >
  {/* Data for each user */}
  {selectedUsers.map((user, index) => (
    <Grid container spacing={3} alignItems="center" key={index}>
      {/* UserName */}
      <Grid item xs={12} sm={6} md={2}>
        <Typography variant="body2">{user.username}</Typography>
      </Grid>

      {/* Equity Analysis */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_equity_analysis || false}
          onChange={(e) => handlePermissionChange(index, 'is_equity_analysis', e.target.checked)}
        />
      </Grid>

      {/* Equity Orders */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_equity_orders || false}
          onChange={(e) => handlePermissionChange(index, 'is_equity_orders', e.target.checked)}
        />
      </Grid>

      {/* Future Analysis */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_fo_analysis || false}
          onChange={(e) => handlePermissionChange(index, 'is_fo_analysis', e.target.checked)}
        />
      </Grid>

      {/* Future Orders */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_fo_orders || false}
          onChange={(e) => handlePermissionChange(index, 'is_fo_orders', e.target.checked)}
        />
      </Grid>

      {/* Monthly Status */}
      <Grid item xs={12} sm={6} md={2}>
        <Switch
          checked={user.permissions.is_monthly_status || false}
          onChange={(e) => handlePermissionChange(index, 'is_monthly_status', e.target.checked)}
        />
      </Grid>
{/* Monthly Status */}
<Grid item xs={12} sm={6} md={2}>
              <Switch
                checked={user.is_active || false}
                onChange={(e) => handlePermissionChange(index, 'is_active_user', e.target.checked)}
              />
            </Grid>
      {/* Allowed WatchList */}
      <Grid item xs={12} sm={6} md={1.5}>
        <TextField
          value={user.permissions.num_of_allowed_watchlist || ''}
          onChange={(e) => handlePermissionChange(index, 'num_of_allowed_watchlist', e.target.value)}
          size="small"
          fullWidth
          variant="outlined"
        />
      </Grid>
    </Grid>
  ))}
</Box>
    </Box>
          </DialogContent>
    <DialogActions>
      <Button onClick={applyChanges} variant="contained">
        Apply Changes
      </Button>
    </DialogActions>
  </Dialog>
</Box>
      ),
      state: {
        isLoading: data && data.length > 0 ? false : true, // Set loading state for MaterialReactTable
       }
    });
    return <MaterialReactTable table={table_is_superuser} />;
  };
  const InActive_Users: React.FC<Props> = ({ Data, onApplyChanges }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const data = useMemo(() => Data.filter(x => !x.is_active), [Data]);

    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
    const headers = {
      Authorization: "Bearer "+ accessToken,
    };
    const handleDeleteRow = async (rowId: string) => {
      try {
        const response = await axios.delete(
          `https://api.quantradeai.com//user/profiles/?id=${rowId}`,
          {
            headers: headers,
          }
        );
        if (response.status === 204) {
          swal("Updated!", "User Deleted Successfully!", "success");
          console.log("User deleted successfully!");
          window.location.reload();
        }
      } catch (error) {
        swal("Error!", "Error deleting User!", "error");
        console.error("Error deleting User:", error);
      }
    };
    const columns = useMemo<MRT_ColumnDef<Employee>[]>(
      () => [
        {
          accessorFn: (row) => `${row.full_name}`, //accessorFn used to join multiple data into a single cell
          id: 'full_name', //id is still required when using accessorFn instead of accessorKey
          header: 'Full Name',
          size: 150,
          Cell: ({ renderedCellValue, row }) => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorKey: 'username', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
          filterVariant: 'autocomplete',
          header: 'User Name',
          size: 150,
        },
        {
          accessorKey: 'email', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
          filterVariant: 'autocomplete',
          header: 'Email',
          size: 250,
        },
        {
          accessorFn: (row) => `${row.contact ? row.contact.contact : ""}`,
          header: 'Contact',
          size: 150,
          //custom conditional format and styling
          Cell: ({ cell }) => (
            <Box
              component="span"
            >
              {cell.getValue<number>()}
            </Box>
          ),
        },
        // {
        //   id: 'is_active', //id is still required when using accessorFn instead of accessorKey
        //   header: 'Active',
  
        //   size: 100,
        //   Cell: ({ renderedCellValue, row }) => (
        //     <Switch checked={row.original.is_active ? true : false} />
        //   ),
        // },
        {
          accessorKey: 'is_user', //hey a simple column for once
          header: 'User Type',
          size: 50,
          Cell: ({ renderedCellValue, row }) => (
            <>
              {row.original.is_user ? "User" : ""}
            </>
  
          ),
        },
        {
          accessorKey: 'date_joined',
          id: 'date_joined',
          header: 'Joining Date',
          size: 100,
          Cell: ({ renderedCellValue, row }) => (
            <>
              {dayjs(row.original.date_joined).format('MM-DD-YYYY')}
            </>
  
          ),
        },
        {
          id: "actions", // Define a unique ID for the action column
          header: "Actions",
          enableEditing: false,
          Cell: ({ row }) => (
            <Box
              sx={{
                display: "flex",
                gap: "1rem",
              }}
            >
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={() => handleDeleteRow(row.original.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ),
        },
      ],
      [],
    );
    
    const AdminShowModal = () => {
      const selectedRows = table_is_superuser.getSelectedRowModel()?.rows.map((row) => row.original);
      if (selectedRows?.length > 0) {
        // Initialize the selected users with their current permissions
        const usersWithPermissions = selectedRows.map((row) => ({
          username: row.username,
          is_active:row.is_active,
          permissions: row.blaze_product_permissions || {},  // If no permissions exist, default to an empty object
        }));
        setSelectedUsers(usersWithPermissions);
      }
      setIsOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsOpen(false);
    };
  
    const handlePermissionChange = (userIndex, field, checked) => {
      setSelectedUsers((prevSelectedUsers) => {
        const updatedUsers = [...prevSelectedUsers];
    
        if (field === 'is_active_user') {
          // Ensure is_active is an object before assigning properties to it
          if (typeof updatedUsers[userIndex].is_active !== 'object') {
            updatedUsers[userIndex].is_active = {}; // Convert to an empty object if it's a boolean
          }
          updatedUsers[userIndex].is_active = checked;
        } else {
          updatedUsers[userIndex].permissions[field] = checked;
        }
    
        return updatedUsers;
      });
    };
    const applyChanges = () => {
      const selectedItems = table_is_superuser.getSelectedRowModel()?.rows.map((row) => row.original) || [];
      const itemsToUpdate = selectedItems.length > 0 ? selectedItems : data;
  
      // Pass `selectedUsers` with updated permissions as part of each item's update object
      const updatedItems = itemsToUpdate.map((item) => {
        const updatedPermissions = selectedUsers.find(user => user.username === item.username)?.permissions || {};
        const active_user = selectedUsers.find(user => user.username === item.username)?.is_active ?? false; 
        return {
          ...item,
          is_active:active_user,
          blaze_product_permissions: updatedPermissions,
        };
      });
  
      onApplyChanges(updatedItems);
      handleCloseModal();
    };
   
    const table_is_superuser = useMaterialReactTable({
      columns,
      data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      enableColumnOrdering: true,
      enableGrouping: true,
      enableColumnPinning: true,
      enableFacetedValues: true,
      enableRowSelection: true,
      initialState: {
        showGlobalFilter: true,
        columnPinning: {
          left: ['mrt-row-expand', 'mrt-row-select'],
          right: ['mrt-row-actions'],
        },
      },
      paginationDisplayMode: 'pages',
      positionToolbarAlertBanner: 'bottom',
      muiSearchTextFieldProps: {
        size: 'small',
        variant: 'outlined',
      },
      muiPaginationProps: {
        color: 'secondary',
        rowsPerPageOptions: [10, 20, 30],
        shape: 'rounded',
        variant: 'outlined',
      },
      renderDetailPanel: ({ row }) => {
        return <UserDetailPanel row={row} />;
      },
      renderTopToolbarCustomActions: ({ table }) => (
        <Box
          sx={{
            display: 'flex',
            gap: '16px',
            padding: '8px',
            flexWrap: 'wrap',
          }}
        >
          <Button variant="outlined" color="primary" disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={()=>AdminShowModal()}><OpenInNewIcon/>&nbsp; Permissions</Button>

          <Dialog open={isOpen} onClose={handleCloseModal}>
    <DialogTitle>Manage Permissions
    <IconButton onClick={handleCloseModal} color="primary">
    <CloseIcon  style={{marginLeft: "800px", cursor: "pointer"}} />
     </IconButton>
    </DialogTitle>
    <DialogContent>
    <Box mt={6} >
        {/* Headers for the columns */}
        <Grid container spacing={3} alignItems="center" style={{marginBottom: "15px"}}>
        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">UserName</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Equity Analysis</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Equity Orders</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Future Analysis</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Future Orders</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Monthly Status</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Active</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="subtitle2" color="textSecondary">Allowed WatchList</Typography>
        </Grid>
      </Grid>

      <Box
    style={{
      maxHeight: "400px", // Set max height to enable scrolling
      overflowY: "auto", // Enable vertical scrolling
      paddingBottom: "20px", // Add padding to the bottom for better scrolling experience
    }}
  >
        {/* Data for each user */}
        {selectedUsers.map((user, index) => (
          <Grid container spacing={3} alignItems="center" key={index}>
            {/* UserName */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="body2">{user.username}</Typography>
            </Grid>

            {/* Equity Analysis */}
            <Grid item xs={12} sm={6} md={2}>
              <Switch
                checked={user.permissions.is_equity_analysis || false}
                onChange={(e) => handlePermissionChange(index, 'is_equity_analysis', e.target.checked)}
              />
            </Grid>

            {/* Equity Orders */}
            <Grid item xs={12} sm={6} md={2}>
              <Switch
                checked={user.permissions.is_equity_orders || false}
                onChange={(e) => handlePermissionChange(index, 'is_equity_orders', e.target.checked)}
              />
            </Grid>

            {/* Future Analysis */}
            <Grid item xs={12} sm={6} md={2}>
              <Switch
                checked={user.permissions.is_fo_analysis || false}
                onChange={(e) => handlePermissionChange(index, 'is_fo_analysis', e.target.checked)}
              />
            </Grid>

            {/* Future Orders */}
            <Grid item xs={12} sm={6} md={2}>
              <Switch
                checked={user.permissions.is_fo_orders || false}
                onChange={(e) => handlePermissionChange(index, 'is_fo_orders', e.target.checked)}
              />
            </Grid>

            {/* Monthly Status */}
            <Grid item xs={12} sm={6} md={2}>
              <Switch
                checked={user.permissions.is_monthly_status || false}
                onChange={(e) => handlePermissionChange(index, 'is_monthly_status', e.target.checked)}
              />
            </Grid>

            {/* Monthly Status */}
            <Grid item xs={12} sm={6} md={2}>
              <Switch
                checked={user.is_active?true :false}
                onChange={(e) => handlePermissionChange(index, 'is_active_user', e.target.checked)}
              />
            </Grid>

            {/* Allowed WatchList */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                value={user.permissions.num_of_allowed_watchlist || ''}
                onChange={(e) => handlePermissionChange(index, 'num_of_allowed_watchlist', e.target.value)}
                size="small"
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>
        ))}
        </Box>
    </Box>
          </DialogContent>
    <DialogActions>
      <Button onClick={applyChanges} variant="contained">
        Apply Changes
      </Button>
    </DialogActions>
  </Dialog>
</Box>
      ),
      state: {
        isLoading: data && data.length > 0 ? false : true, // Set loading state for MaterialReactTable
       }
    });
    return <MaterialReactTable table={table_is_superuser} />
  };
  // Main application component
  const App = () => {
    const [userData, setUserData] = useState([]); // State for storing user data
    const [loading, setLoading] = useState(true); // State to track loading status
    const hasFetchedRef = useRef(false); // Ref to ensure data is fetched once
    // Example token
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
    const headers = {
      Authorization: "Bearer "+ accessToken,
    };
    const headerElement = document.getElementById("headerTextUpdate");
    if (headerElement) {
      headerElement.innerHTML = "All Users";
    }
    useEffect(() => {
      if (!hasFetchedRef.current) {
        setLoading(true);
        hasFetchedRef.current = true;
     
        const fetchAllUsers = async () => {
          try {
            const response = await axios.get('https://api.quantradeai.com/user/profiles/?paginate=false&clear_cache=false', { headers });
            // Assuming the response structure contains `data`
            const _userData = response.data.data.sort((a, b) => {
              const dateA = new Date(a.date_joined);
              const dateB = new Date(b.date_joined);
        
              // Sorting in descending order
              return dateB.getTime() - dateA.getTime();
            });
            setUserData(_userData);
          } catch (error) {
            if (axios.isCancel(error)) {
              console.log('Request canceled:', error.message);
            } else {
              console.error('Error fetching data:', error);
            }
          } finally {
            setLoading(false); // End loading after the request completes
          }
        };
  
        fetchAllUsers();
  
        // Cleanup function to cancel request if the component unmounts
        return () => {
          console.log('Performing cleanup operations...');
        };
      }
    }, []); 
    const onApplyChanges = async (selectedItems) => {
      try {
        const updatedPermissions = selectedItems.map((item?: any) => ({
          id: item.id,
          is_active:item.is_active,
          blaze_product_permissions:item.blaze_product_permissions,
        }));
    
        const res = await axios.patch(`https://api.quantradeai.com/user/profiles/update/multi/`,
          { users: updatedPermissions },
          { headers }
        );
    
        if (res.status === 200) {
          const usersRes = await axios.get(
            `https://api.quantradeai.com/user/profiles/?paginate=false&clear_cache=false`,
            { headers }
          );
    
          if (usersRes.status === 200) {
            const _userData = usersRes.data.data.sort((a, b) => {
              const dateA = new Date(a.date_joined);
              const dateB = new Date(b.date_joined);
        
              // Sorting in descending order
              return dateB.getTime() - dateA.getTime();
            });
            setUserData(_userData);
            //setUserData(usersRes.data.data);
          }
        }
      } catch (error) {
        console.error('Error applying changes:', error);
      }
    };
  
    return (
      <>
        {loading ? (
          <p>Loading...</p> // Show loading text while data is being fetched
        ) : (
          <>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
        <h3>Super Users</h3> 
        </AccordionSummary>
        <AccordionDetails>
        <Users_is_superuser Data={userData} onApplyChanges={onApplyChanges} />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
       <h3>Active Users</h3>  
        </AccordionSummary>
        <AccordionDetails>
        <Users_is_user Data={userData} onApplyChanges={onApplyChanges} />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <h3>In-Active Users</h3> 
        </AccordionSummary>
        <AccordionDetails>
        <InActive_Users Data={userData} onApplyChanges={onApplyChanges}  />
        </AccordionDetails>
      </Accordion>
        </>
         
        )}
      </>
    );
  };
const AllUsers = () => {
  // const { changeBackground } = useContext(ThemeContext);
	// useEffect(() => {
	// 	changeBackground({ value: "dark", label: "Dark" });
	// }, []);
	return(
		<LocalizationProvider dateAdapter={AdapterDayjs}>
      <App />
    </LocalizationProvider>	
		
	)
}
export default AllUsers;