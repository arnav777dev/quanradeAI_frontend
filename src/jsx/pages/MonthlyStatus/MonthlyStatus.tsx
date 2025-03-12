import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import {  useMemo, useRef, useState } from 'react';
//MRT Imports
import { MaterialReactTable, MRT_ColumnDef, MRT_GlobalFilterTextField, MRT_Row, MRT_TableOptions, MRT_ToggleFiltersButton, useMaterialReactTable } from 'material-react-table';
//Material UI Imports
import { Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogContent, DialogTitle, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';
//Date Picker Imports - these should just be in your Context Provider
import axios from 'axios';
import Switch from '@mui/material/Switch';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { green, red } from '@mui/material/colors';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Row,
  Col,
  Badge,
  Dropdown,
  ProgressBar,
  Tooltip,
} from "react-bootstrap";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { mkConfig, generateCsv, download } from 'export-to-csv'; //or use your library of choice here
import Autocomplete from '@mui/material/Autocomplete';

const label = { inputProps: { 'aria-label': 'Switch demo' } };
export type MonthlyStatusINT = {
  status_history: any;
  id : string;
  symbol: string;
  instrument_token:number;
  LTP: string;
  current_status: string;
  previous_status: any;
  bull_bear_value: number;
  current_status_start_dt: string;
  previous_status_start_dt: string;
  aadhaar_card: string;
  is_changed: string;
};

interface WebSocketData {
  ticks: Array<{
    instrument_token: number;
    name: string;
    last_price: number;
    volume_traded: number,
    ohlc: {
      close: any;
      open: number;
      high: any,
      low: any,
    };
  }>;
}

let ws: WebSocket | null = null;

const UserDetailPanel = ({ row }) => {
  const [userData, setUserData] = useState<MonthlyStatusINT[]>(row.original.status_history); // Updated type to an array of MonthlyStatusINTs

  // Table Columns Setup
  const columns = useMemo<MRT_ColumnDef<MonthlyStatusINT>[]>(() => [
    {
      accessorKey: 'current_status',
      enableClickToCopy: true,
      filterVariant: 'autocomplete',
      header: 'Current Status',
      size: 100,
      Cell: ({ row }) => {
        const status = row.original.current_status; // Accessing data from the row
        let badgeClass = '';
        switch (status) {
          case 'bull':
            badgeClass = 'badge-success light badge';
            break;
          case 'bull_cf':
            badgeClass = 'badge bg-success';
            break;
          case 'bear':
            badgeClass = 'badge-danger light badge';
            break;
          case 'bear_cf':
            badgeClass = 'badge bg-danger';
            break;
          default:
            badgeClass = 'badge-primary light badge';
        }
        return <Badge bg="" className={badgeClass}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'previous_status',
      header: 'Previous Status',
      size: 100,
      Cell: ({ row }) => {
        const status = row.original.previous_status; // Accessing data from the row
        let badgeClass = '';
        switch (status) {
          case 'bull':
            badgeClass = 'badge-success light badge';
            break;
          case 'bull_cf':
            badgeClass = 'badge bg-success';
            break;
          case 'bear':
            badgeClass = 'badge-danger light badge';
            break;
          case 'bear_cf':
            badgeClass = 'badge bg-danger';
            break;
          default:
            badgeClass = 'badge-primary light badge';
        }
        return <Badge bg="" className={badgeClass}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'bull_bear_value',
      header: 'Bull Bear Value',
      size: 50,
      Cell: ({ row }) => row.original.bull_bear_value, // Accessing data from the row
    },
    {
      accessorKey: 'current_status_start_dt',
      header: 'CS Start Date',
      size: 100,
      sortable: true,
      enableSorting: true,
      Cell: ({ row }) => dayjs(row.original.current_status_start_dt).format('MM-DD-YYYY'), // Accessing data from the row
    },
    {
      accessorKey: 'previous_status_start_dt',
      header: 'PS Start Date',
      size: 50,
      Cell: ({ row }) => dayjs(row.original.previous_status_start_dt).format('MM-DD-YYYY'), // Accessing data from the row
    },
  ], []);

  const data = useMemo(() => userData, [userData]); // Data is the full userData array

  const table_is_superuser = useMaterialReactTable({
    columns,
    data,
     muiPaginationProps: {
       color: 'secondary',
       rowsPerPageOptions: [5,10,20,50],
       shape: 'rounded',
       variant: 'outlined',
     },
     state: {
      isLoading: data && data.length >= 0 ? false : true,
      sorting: [
        {
          id: 'current_status_start_dt', // The column ID to sort by
          desc: true, // Default sorting order
        },
      ],
    },
    initialState: {
      sorting: [
        {
          id: 'current_status_start_dt', // Sorting by this column initially
          desc: true, // Set to true for descending, false for ascending
        },
      ],
    }
  });
  return (
      <Card sx={{ flex: 1, width: '90%', padding: 2 }}>
        <CardContent>
          <TableContainer component={Paper}
            sx={{
              maxHeight: 500,  // Set a fixed height for the table container
              overflowY: 'auto', // Enable scrolling if content overflows
            }}>
            <MaterialReactTable table={table_is_superuser} />
          </TableContainer>
        </CardContent>
      </Card>
  );
};
  
  
  const InActive_Users = (_data) => {
    const Data = useMemo(() => _data.data.filter(x => !x.is_active), [_data]);
    const [data, setData] = useState<MonthlyStatusINT[]>([]);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [validationErrors, setValidationErrors] = useState< Record<string, string | undefined>>({});
    const [columnVisibility, setColumnVisibility] = useState({id: false,Instrumenttoken:false});
    // Example token
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
    const SuperUser = token && JSON.parse(token).user.is_superuser === true ? true : false;
    const Staff = token && JSON.parse(token).user.is_staff === true ? true : false;

    const headers = {
      Authorization: "Bearer "+accessToken,
    };

    const handleEditRow = (row,table) => {
      setEditingRowId(row.id);
      setEditedRow(row.original);
      table.setEditingRow(row);
      
    };
    const handleCancelEdit = () => {
      setEditingRowId(null);
      setEditedRow({});
    };
  
    const handleUpdateRow = () => {
      // setTableData((prevData) =>
      //   prevData.map((row) =>
      //     row.id === editingRowId ? { ...row, ...editedRow } : row
      //   )
      // );
      setEditingRowId(null);
      setEditedRow({});
    };


    const handleSaveUser: MRT_TableOptions<MonthlyStatusINT>['onEditingRowSave'] = async ({
      values,
      table,
    }) => {
      const requestBody = [{
        symbol:values.symbol,
        LTP: +values.LTP,
        current_status:values["Current Status"],
        previous_status:values["Previous Status"],
        bull_bear_value:+values["Bull Bear Value"],
        current_status_start_dt:values["CS Start Date"],
        previous_status_start_dt:values["PS Start Date"],
        is_changed:values["Is Changed"] ? true : false,
      }]
      try {
        await axios.patch('https://api.quantradeai.com/status/current/update/insert/',requestBody,{headers})  
        .then(response => {
          console.log('Response:', response.data);
          swal("Inserted!", "Monthly status inserted successfully!", "success");
         })
        .catch(error => {
            console.error('Error:', error.response ? error.response.data : error.message);
        });
      } catch (error) {
        console.error("Error patching data:", error);
      }
      setValidationErrors({});
     // await updateUser(values);
      table.setEditingRow(null); //exit editing mode
    };
        const fetchIndexData = async () => {
          try {
    
            ws = new WebSocket('ws://localhost:7789');
    
            ws.onopen = () => {
              console.log('Connected to WebSocket server');
            };
          
            ws.onmessage = (event) => {
              const dataWS: WebSocketData = JSON.parse(event.data);
              if (dataWS && dataWS.ticks && dataWS.ticks.length > 0) {
                console.log('Received ticks index:', dataWS.ticks);
            
                // Create a map of instrument tokens to ticks for faster lookup
                const tickMap = new Map(dataWS.ticks.map((tick: any) => [String(tick.instrument_token), tick]));
                setData((prevData) => {
                  const updatedData = prevData.map((row) => {
                    const tick = tickMap.get(String(row.instrument_token));
                    if (tick) {
                      return { ...row, LTP: tick.last_price };  // Update LTP field
                    }
                    return row;
                  });
                  return updatedData;
                });
              }
            }
           
            ws.onclose = () => {
             // console.log('Disconnected from WebSocket server');
            };
    
            ws.onerror = (error) => {
              console.log('WebSocket error:', error);
            };
          } catch (error) {
            console.log(error);
          }
      };
      useEffect(() => {
        fetchIndexData();
      },[]);
        useEffect(() => {
          const fetchData = async () => {
            if (Data && Data.length > 0) {
              setData(Data);
              let tokens = Data.map(x => x.instrument_token);
              console.log("tokens", tokens);
              
               const userDetails = localStorage.getItem("userDetails") 
                              ? JSON.parse(localStorage.getItem("userDetails") || "") 
                              : {};
                              const { access_token, api_key } = userDetails?.user?.kite || {};
                              // Check if user details and tokens are available before making the API call
                              if (tokens.length > 0 && access_token && api_key) {
                                // Make the API request
                                const chunkSize = 500; // You can adjust this value
                                const tokenChunks: string[][] = [];
                                for (let i = 0; i < tokens.length; i += chunkSize) {
                                  tokenChunks.push(tokens.slice(i, i + chunkSize));
                                }
                                
                                for (const chunk of tokenChunks) {
                                  try {
                                    const response = await axios.get('http://localhost:3004/api/getLiveData', {
                                      params: {
                                        api_key,
                                        access_token,
                                        tokens: chunk,
                                      }
                                    });
                                    console.log('API Response for chunk:', response.data);
                                    // Handle the response here
                                  } catch (error) {
                                    console.error('Error fetching live spread:', error);
                                    // Handle the error here
                                  }
                                }
                              } else {
                console.error('Missing user details or tokens');
              }
            }
          };
        
          // Call the async function
          fetchData();
        }, [Data]);

    const columns = useMemo<MRT_ColumnDef<MonthlyStatusINT>[]>(
      () => [
        {
          accessorKey: 'id',
          header: 'Id',
          enableEditing: false,
          size: 80,
          enableHiding: false
        },
        {
          accessorFn: (row) => `${row.instrument_token}`,
          id:'Instrumenttoken',
          header: 'Instrumenttoken',
          enableEditing: false,
          size: 80,
          enableHiding: false,
        },
        {
          accessorFn: (row) => `${row.symbol}`, //accessorFn used to join multiple data into a single cell
          id: 'symbol', //id is still required when using accessorFn instead of accessorKey
          header: 'Symbol',
          size: 100,
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
          accessorFn: (row) => `${row.LTP}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
       
      
          header: 'LTP',
          size: 100,
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.firstName,
            helperText: validationErrors?.firstName,
            //remove any previous validation errors when user focuses on the input
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                firstName: undefined,
              }),
            //optionally add validation checking for onBlur or onChange
          },
        },
        {
          accessorFn: (row) => `${row.current_status}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
          filterVariant: 'autocomplete',
          header: 'Current Status',
          size: 100,
          Cell: ({ row }) => (
            <>
            {
              <Badge bg="" className={row.original.current_status == "bull" ? 'badge-success light badge' : 
                row.original.current_status == "bull_cf" ? 'badge bg-success' : 
                row.original.current_status == "bear" ? 'badge-danger light badge' : 
                row.original.current_status == "bear_cf" ? 'badge bg-danger': 'badge-primary light badge'} >{row.original.current_status}
               </Badge>
             }
            </>
          ),
        },
        {
          accessorFn: (row) => `${row.previous_status}`,
          header: 'Previous Status',
          size: 100,
          //custom conditional format and styling
          Cell: ({ row }) => (
            <>
            {
             <Badge bg="" className={row.original.previous_status == "bull" ? 'badge-success light badge' : 
              row.original.previous_status == "bull_cf" ? 'badge bg-success' : 
              row.original.previous_status == "bear" ? 'badge-danger light badge' : 
              row.original.previous_status == "bear_cf" ? 'badge bg-danger': 'badge-primary light badge'} >{row.original.previous_status}
             </Badge>
            }
            </>
          ),
        },
        {
          accessorFn: (row) => `${row.bull_bear_value}`,
          header: 'Bull Bear Value',
          size: 50,
        },
        {
          accessorFn: (row) => `${row.current_status_start_dt}`, //hey a simple column for once
          header: 'CS Start Date',
          size: 100,
          Cell: ({ row }) => (
            <>
             {dayjs(row.original.current_status_start_dt).format('MM-DD-YYYY')}
            </>
  
          ),
        },
        {
          accessorFn: (row) => `${row.previous_status_start_dt}`,
          header: 'PS Start Date',
          size: 50,
          Cell: ({ row }) => (
            <>
              {dayjs(row.original.previous_status_start_dt).format('MM-DD-YYYY')}
            </>
  
          ),
        },
        {
          accessorFn: (row) => `${row.is_changed}`, //id is still required when using accessorFn instead of accessorKey
          header: 'Is Changed',  
          size: 50,
          Cell: ({ row }) => (
            <>
             
            {row.original.is_changed ? <Badge bg="" className="light badge-success" ><CheckCircleIcon /></Badge> : <Badge bg="" className="light badge-danger" ><CancelIcon  /></Badge>}
            </>
          ),
        },
      ],
      [],
    );
    const csvConfig = mkConfig({
      fieldSeparator: ',',
      decimalSeparator: '.',
      useKeysAsHeaders: true,
    });
    const flattenRow = (row: MonthlyStatusINT): Record<string, any> => {
      const flattened: Record<string, any> = {};
    
      Object.keys(row).forEach((key) => {
        if (key !== 'id' && key !== 'instruments') {  // Exclude 'ID' from export
          const value = row[key];
          if (typeof value === 'object' && value !== null) {
            // If the value is an object, convert it to a JSON string
            flattened[key] = JSON.stringify(value);
          } else {
            // If it's a supported type, keep it as it is
            flattened[key] = value;
          }
        }
      });
    
      return flattened;
    };
    const handleExportRows = (rows: MRT_Row<MonthlyStatusINT>[]) => {
      const rowData = rows.map((row) => {
        const flattenedRow = flattenRow(row.original);
        return flattenedRow;
      });
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    };
    const table_is_superuser = useMaterialReactTable({
      columns,
      data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      // enableColumnFilterModes: true,
      createDisplayMode: 'row', // ('modal', and 'custom' are also available)
      editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
      getRowId: (row) => row.id,
      enableRowSelection: true,
      enableEditing: SuperUser||Staff,
      muiToolbarAlertBannerProps: false
        ? {
            color: 'error',
            children: 'Error loading data',
          }
        : undefined,
      muiTableContainerProps: {
        sx: {
          minHeight: '500px',
        },
      },
      enableColumnOrdering: true,
      enableGrouping: true,
      enableColumnPinning: true,
      enableFacetedValues: true,
      initialState: {
       //  showColumnFilters: true,
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
        rowsPerPageOptions: [10,50, 100,150],
        shape: 'rounded',
        variant: 'outlined',
      },
      onEditingRowSave: handleSaveUser,
      renderRowActions: ({ row, table }) => (
        <Box sx={{ display: 'flex' }}>
        <Tooltip title="Edit" style={{opacity:1}}>
          <IconButton style={{padding: '0.30rem 0.3rem'}} onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" style={{opacity:1}}>
          <IconButton color="error" style={{padding: '0.30rem 0.3rem'}}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
      ),
      renderDetailPanel: ({ row }) => {
       return <UserDetailPanel row={row} />;
     },
      renderTopToolbarCustomActions: ({ table }) => (
        <Box sx={{display: 'flex',gap: '16px',padding: '8px',flexWrap: 'wrap'}} >
          <Button variant="outlined" onClick={_data.handleOpenModal} ><AddIcon />&nbsp; Insert Status</Button>    
          <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          variant="outlined"><FileDownloadIcon /> &nbsp; Export</Button>
        </Box>
      ), 
      state: {
        isLoading: data && data.length > 0 ? false : true, // Set loading state for MaterialReactTable
        columnVisibility
    }
    });
    return <MaterialReactTable table={table_is_superuser} />
  };
  // Main application component
  const App = () => {
    const [monthlyStatus, setMonthlyStatus] = useState([]); // State for storing user data
    const [loading, setLoading] = useState(true); // State to track loading status
    const hasFetchedRef = useRef(false); // Ref to ensure data is fetched once
    const [isOpen, setIsOpen] = React.useState(false);
    const [formData, setFormData] = useState({
      symbol: "",
      LTP: "",
      current_status: "",
      previous_status: "",
      bull_bear_value: "",
      current_status_start_dt: "",
      previous_status_start_dt: "",
      aadhaar_card: "",
      is_changed: ""
    });
    const [nfoArrayData, setNFOArrayData] = useState<string[]>([]);
     // Example token
     const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
     const accessToken = token ? JSON.parse(token).access : "";;
  
     const headers = {
       Authorization: "Bearer "+accessToken,
     };

     const headerElement = document.getElementById("headerTextUpdate");
    if (headerElement) {
      headerElement.innerHTML = "Monthly Status";
    }
    useEffect(() => {
      if (!hasFetchedRef.current) {
        setLoading(true);
        hasFetchedRef.current = true;
  
        const fetchAllUsers = async () => {
          try {
            const response = await axios.get('https://api.quantradeai.com/status/current/?paginate=false&clear_cache=false',{headers});
           
            const sortedData = response.data.data.sort((a, b) => {
              const dateA = new Date(a.current_status_start_dt);
              const dateB = new Date(b.current_status_start_dt);
        
              // Sorting in descending order
              return dateB.getTime() - dateA.getTime();
            });

            setMonthlyStatus(sortedData);
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
    }, []); // Empty dependency array means this effect runs once (componentDidMount)

    useEffect(() => {

      const fetchInstruments = async () => {
        try {
          const response = await axios.get('https://api.quantradeai.com/main/instrument/?paginate=false&?clear_cache=true&segment=NFO-FUT',{headers});   
          const nfoData = response.data.data.map(x=>x.name);
          setNFOArrayData(nfoData);
          } catch (err) {
          }
      };
    
      fetchInstruments();
    }, []); // 
  const handleCloseModal=()=> {
    setIsOpen(false);
  }
  const handleOpenModal=()=> {
    setIsOpen(true);
  }
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({...formData, [name]: type === "checkbox" ? checked : value });
  };

  const InsertMonthlyStatus = async () =>{
    const requestBody = [{
      symbol:formData.symbol,
      LTP:formData.LTP,
      current_status:formData.current_status,
      previous_status:formData.previous_status,
      bull_bear_value: +formData.bull_bear_value,
      current_status_start_dt:formData.current_status_start_dt,
      previous_status_start_dt:formData.previous_status_start_dt,
      is_changed: formData.is_changed ? true : false,
    }]

    try {
      await axios.patch('http://localhost/:4001/api/monthlyStatusUpdate',requestBody,{headers})  
      .then(response => {
        console.log('Response:', response.data);
        swal("Inserted!", "Monthly status inserted successfully!", "success");
        setIsOpen(false);
       })
      .catch(error => {
          console.error('Error:', error.response ? error.response.data : error.message);
      });
    } catch (error) {
      console.error("Error patching data:", error);
    }
  }
    return (
      <>
        {loading ? (
          <p>Loading...</p> // Show loading text while data is being fetched
        ) : (
          <>
          <Box mb={2}>
            <InActive_Users data={monthlyStatus} loading={loading} handleOpenModal={handleOpenModal} />
          </Box>
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
                Add New Monthly Status
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box p={3} maxWidth={700} mx="auto">
                <Grid container spacing={2}>
                  {/* First Row of Fields */}
                  <Grid item xs={12} sm={6}>
                    {/* <TextField
                      fullWidth
                      label="Symbol"
                      name="symbol"
                      value={formData?.symbol}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
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
                    /> */}
                    <Autocomplete
                      disablePortal
                      options={nfoArrayData}
                      value={formData?.symbol}
                      sx={{ width: 316 }}
                      onChange={handleChange}
                      renderInput={(params) => <TextField {...params} label="Symbol" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type='number'
                      label="LTP"
                      name="LTP"
                      value={formData?.LTP}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
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
                      label="Current Status"
                      name="current_status"
                      value={formData?.current_status}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
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
                      label="Previous Status"
                      name="previous_status"
                      value={formData?.previous_status}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
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
                      label="Current Status Start Date"
                      name="current_status_start_dt"
                      value={formData?.current_status_start_dt}
                      onChange={handleChange}
                      variant="outlined"
                      type='date'
                      size="small"
                      InputProps={formData?.current_status_start_dt ? { inputProps: { style: { color: ''}}} : { inputProps: { style: { color: 'transparent'}}}}
                      sx={ formData?.current_status_start_dt ? {
                        '& input[type="date"]::-webkit-datetime-edit': {color: ''},
                        '& input[type="date"]::-webkit-datetime-edit-fields-wrapper': {display: ''},
                        '& .MuiInputBase-root': {
                          height: 55, // Customize height as needed
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '14px', // Customize font size as needed
                        },
                      } : {
                        '& input[type="date"]::-webkit-datetime-edit': {color: 'inherit'},
                        '& input[type="date"]::-webkit-datetime-edit-fields-wrapper': {display: 'none'},
                        '& .MuiInputBase-root': {
                          height: 55, // Customize height as needed
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '14px', // Customize font size as needed
                        },
                      }}
                     
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Previous Status Start Date"
                      name="previous_status_start_dt"
                      value={formData?.previous_status_start_dt}
                      onChange={handleChange}
                      variant="outlined"
                      type='date'
                      size="small"
                      InputProps={formData?.previous_status_start_dt ? { inputProps: { style: { color: ''}}} : { inputProps: { style: { color: 'transparent'}}}}
                      sx={ formData?.previous_status_start_dt ? {
                        '& input[type="date"]::-webkit-datetime-edit': {color: ''},
                        '& input[type="date"]::-webkit-datetime-edit-fields-wrapper': {display: ''},
                        '& .MuiInputBase-root': {
                          height: 55, // Customize height as needed
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '14px', // Customize font size as needed
                        },
                      } : {
                        '& input[type="date"]::-webkit-datetime-edit': {color: 'inherit'},
                        '& input[type="date"]::-webkit-datetime-edit-fields-wrapper': {display: 'none'},
                        '& .MuiInputBase-root': {
                          height: 55, // Customize height as needed
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '14px', // Customize font size as needed
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bull Bear Value"
                      name="bull_bear_value"
                      value={formData?.bull_bear_value}
                      onChange={handleChange}
                      type='number'
                      variant="outlined"
                      size="small"
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
                     Is Changed :<Switch {...label}    onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     
                  </Grid>
                  {/* Action Buttons */}
                  <Grid item xs={12} sm={6} display="flex" justifyContent="flex-end">
                    <Button variant="outlined" onClick={handleCloseModal}> Cancel </Button>&nbsp;&nbsp;
                    <Button variant="contained" color="success" onClick={InsertMonthlyStatus}> Add </Button>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            </Dialog>
            </>
         
        )}
      </>
    );
  };
  const queryClient = new QueryClient();

const MonthlyStatus = () => {
  // const { changeBackground } = useContext(ThemeContext);
	// useEffect(() => {
	// 	changeBackground({ value: "dark", label: "Dark" });
	// }, []);
	return(
		<QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>	
		
	)
}
export default MonthlyStatus;

function swal(arg0: string, arg1: string, arg2: string) {
  throw new Error('Function not implemented.');
}
