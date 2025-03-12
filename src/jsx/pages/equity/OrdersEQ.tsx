import React, { useEffect } from 'react';
import {  useMemo, useRef, useState } from 'react';
//MRT Imports
import { MaterialReactTable, MRT_ColumnDef, MRT_TableOptions, useMaterialReactTable } from 'material-react-table';
//Material UI Imports
import { Box, Button, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
//Date Picker Imports - these should just be in your Context Provider
import axios from 'axios';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const label = { inputProps: { 'aria-label': 'Switch demo' } };
export type Equity_Orders = {
  id : string;
  bt_equity_analysis: {
    symbol : string;
  instrument_token: number;
  };
  version: string;
  trigger: string;
  ltp: number;
  name: any;
  triggered_at: number;
  created_at: string;
  modified_at: string;
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

  const InActive_Users = (_data) => {
    const Data = useMemo(() => _data.data.filter(x => !x.is_active), [_data]);
    const [data, setData] = useState<Equity_Orders[]>([]);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [validationErrors, setValidationErrors] = useState< Record<string, string | undefined>>({});
    const [columnVisibility, setColumnVisibility] = useState({id: false,Instrumenttoken:false});
    const token = localStorage.getItem("userDetails") || '';
    const SuperUser = token && JSON.parse(token).user.is_superuser === true ? true : false;
    const Staff = token && JSON.parse(token).user.is_staff === true ? true : false;

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


    const handleSaveUser: MRT_TableOptions<Equity_Orders>['onEditingRowSave'] = async ({
      values,
      table,
    }) => {
      // const newValidationErrors = validateUser(values);
      // if (Object.values(newValidationErrors).some((error) => error)) {
      //   setValidationErrors(newValidationErrors);
      //   return;
      // }
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
                          const tick = tickMap.get(String(row.bt_equity_analysis.instrument_token));
                          if (tick) {
                            return { ...row, ltp: tick.last_price };  // Update LTP field
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
                    let tokens = Data.map(x => x.bt_equity_analysis.instrument_token);
                    tokens = [...new Set(tokens)];
                    
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
    const columns = useMemo<MRT_ColumnDef<Equity_Orders>[]>(
      () => [
        {
          accessorKey: 'id',
          header: 'Id',
          enableEditing: false,
          size: 80,
          enableHiding: false
        },
        {
          accessorFn: (row) => `${row.bt_equity_analysis ? row.bt_equity_analysis.symbol : ""}`, //accessorFn used to join multiple data into a single cell
          id: 'name', //id is still required when using accessorFn instead of accessorKey
          header: 'Name',
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
                accessorFn: (row) => `${row.bt_equity_analysis ? row.bt_equity_analysis.instrument_token:""}`,
                id:'Instrumenttoken',
                header: 'Instrumenttoken',
                enableEditing: false,
                size: 80,
                enableHiding: false
              },
              {
                accessorFn: (row) => `${row.ltp}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
             
                header: 'LTP',
                size: 100,
                Cell: ({ renderedCellValue, row }) => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <span>{renderedCellValue}</span>
                  </Box>
                ),
              },
        {
          accessorFn: (row) => `${row.version}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          header: 'Version',
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
          accessorFn: (row) => `${row.trigger}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
          header: 'Trigger',
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
          accessorFn: (row) => `${row.name}`,
          header: 'Order Types',
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
          accessorFn: (row) => `${row.triggered_at}`,
          header: 'Triggered Date',
          size: 50,
          Cell: ({ row }) => (
            <>
             {row.original.triggered_at ? dayjs(row.original.triggered_at).format('MM-DD-YYYY') :""}
            </>
          ),
        },
        {
          accessorFn: (row) => `${row.created_at}`, //id is still required when using accessorFn instead of accessorKey
          header: 'Created Date',  
          size: 50,
          Cell: ({ row }) => (
            <>
             {row.original.created_at ? dayjs(row.original.created_at).format('MM-DD-YYYY') :""}
            </>
  
          ),
        },
        {
            accessorFn: (row) => `${row.modified_at}`, //id is still required when using accessorFn instead of accessorKey
            header: 'Modified Date',  
            size: 50,
            Cell: ({ row }) => (
              <>
               {row.original.modified_at ?  dayjs(row.original.modified_at).format('MM-DD-YYYY') :""}
              </>
    
            ),
          },
      ],
      [],
    );
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
    //   renderDetailPanel: ({ row }) => {
    //    return <UserDetailPanel row={row} />;
    //  },
      renderTopToolbarCustomActions: ({ table }) => (
        <Box sx={{display: 'flex',gap: '16px',padding: '8px',flexWrap: 'wrap'}} >
          {/* <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} variant="outlined" onClick={_data.handleOpenModal} ><AddIcon />&nbsp; Add to Watchlist </Button> */}
          <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} variant="outlined"><FileDownloadIcon /> &nbsp; Export</Button>
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
    const [equity_orders, setEquity_Orders] = useState([]); // State for storing user data
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
    const [watchList, setWatchList] = useState([]); // State for storing user data
    const [selectedValuesWL, setSelectedValuesWL] = useState<string[]>([]);
    // Example token
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";

    const headers = {
      Authorization: "Bearer "+accessToken,
    };

    const headerElement = document.getElementById("headerTextUpdate");
    if (headerElement) {
      headerElement.innerHTML = "Equity Orders";
    }
    useEffect(() => {
      if (!hasFetchedRef.current) {
        setLoading(true);
        hasFetchedRef.current = true;
  
        const fetchAllEquity_Orders = async () => {
          try {
            const response = await axios.get('https://api.quantradeai.com/strategy/bt/orders/search/?paginate=false&?clear_cache=true',{headers});

            const sortedData = response.data.data.sort((a, b) => {
              const dateA = new Date(a.triggered_at);
              const dateB = new Date(b.triggered_at);
        
              // Sorting in descending order
              return dateB.getTime() - dateA.getTime();
            });
            document.getElementsByClassName("text-warning ms-2")[0].innerHTML = "";
            // Assuming the response structure contains `data`
            setEquity_Orders(sortedData);
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
        const fetchAllWatchlist = async () => {
          try {
            const response = await axios.get('https://api.quantradeai.com/main/watchlist',{headers});
            // Assuming the response structure contains `data`
            setWatchList(response.data.data);
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
  
        fetchAllEquity_Orders();
        fetchAllWatchlist();
        // Cleanup function to cancel request if the component unmounts
        return () => {
          console.log('Performing cleanup operations...');
        };
      }
    }, []); // Empty dependency array means this effect runs once (componentDidMount)
  const handleCloseModal=()=> {
    setIsOpen(false);
  }
  const handleOpenModal=()=> {
    setIsOpen(true);
  }
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
    return (
      <>
        {loading ? (
          <p>Loading...</p> // Show loading text while data is being fetched
        ) : (
          <>
          <Box mb={2}>
            <InActive_Users data={equity_orders} loading={loading} handleOpenModal={handleOpenModal} />
          </Box>
          <Dialog
            open={isOpen}
            onClose={handleCloseModal}
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
            {/* <DialogTitle>
              {" "}
              <Typography variant="h5" gutterBottom>
                Add to Watchlist
              </Typography>
            </DialogTitle>
            <DialogContent>
            <Box p={3} maxWidth={700} mx="auto" display="flex" flexDirection="column" gap={3}>
              {/* Watch List Selector */}
              {/* <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Select Watch List</InputLabel>
                  <Select
                    labelId="demo-multiple-name-label"
                    label="Select Watch List"
                    id="demo-multiple-name"
                    value={selectedValuesWL}
                    onChange={handleChange}
                  >
                    {watchList.map((name: any) => (
                      <MenuItem key={name.watchlist_number} value={name.watchlist_number}>
                        {name.watchlist_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Action Buttons */}
              {/* <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined">Cancel</Button>
                <Button variant="contained" color="success">Add</Button>
              </Box>
            </Box>
            </DialogContent>*/}
            </Dialog> 
            </>
        )}
      </>
    );
  };
  const queryClient = new QueryClient();

const OrdersEQ = () => {
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
export default OrdersEQ;