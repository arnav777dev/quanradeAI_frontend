import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import {  useMemo, useRef, useState } from 'react';
//MRT Imports
import { MaterialReactTable, MRT_ColumnDef, MRT_GlobalFilterTextField, MRT_Row, MRT_TableOptions, MRT_ToggleFiltersButton, useMaterialReactTable } from 'material-react-table';
//Material UI Imports
import { Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Tooltip, Typography } from '@mui/material';
//Date Picker Imports - these should just be in your Context Provider
import  {AdapterDayjs}  from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
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
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAsIcon from '@mui/icons-material/SaveAs';

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { download, generateCsv, mkConfig } from 'export-to-csv';

const label = { inputProps: { 'aria-label': 'Switch demo' } };

export type Fut_Orders = {
  analysis_order: {
    instrument_token: number;
  };
  id : string;
  name: string;
  symbol: string;
  LTP: string;
  buy_sell: any;
  strike_price:string;
  option_side: string;
  trigger: number;
  strategy_name: string;
  orders: Order[];
  order_type: string;
  is_triggered: string;
  triggered_at: string;
  expiry: string;
  created_at:string;
  modified_at: string;
};
interface Order {
  lot_size: any;
  order_type: string;
  trigger: number;
  status: string;
  triggered_at: string;
  is_triggered: "true" | "false";
}
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
    const [userData, setUserData] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
  
    const handleInputChange = (field, value) => {
      setUserData((prevData:any) => ({
        ...prevData,
        [field]: value,
      }));
    };
  
    const onEditClick = () => {
      setIsEdit((prevIsEdit) => !prevIsEdit);
    };
  
    return (
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
        {/* Card 1: User Information */}
        {/* <Card sx={{ flex: 1, width: '50%', padding: 2 }}>
          <CardContent>
            <Box sx={{ mt: 2 }}>
        
            <TableContainer component={Paper} >
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell style={{ padding: '9px',width: '12.5%' }}>
                    <Typography variant="body2">
                    <strong>Symbol : </strong>{' '}
                      {isEdit ? (
                        <TextField
                          value={row.original.symbol}
                          onChange={(e) => handleInputChange('symbol', e.target.value)}
                          size="small"
                          variant="outlined"
                          fullWidth
                        />
                      ) : (
                        row.original.symbol
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell style={{ padding: '9px',width: '12.5%' }}>
                    <Typography variant="body2">
                      <strong>LTP : </strong>{' '}
                      {isEdit ? (
                        <TextField
                          value={row.original.LTP}
                          onChange={(e) => handleInputChange('LTP', e.target.value)}
                          size="small"
                          variant="outlined"
                          fullWidth
                        />
                      ) : (
                        row.original.LTP
                      )}
                    </Typography>
                  </TableCell>
               
                  <TableCell style={{padding: '9px',width: '12.5%' }}>
                    <Typography variant="body2">
                      <strong>Current Status : </strong>{' '}
                      {isEdit ? (
                        <TextField
                          value={row.original.current_status}
                          onChange={(e) => handleInputChange('current_status', e.target.value)}
                          size="small"
                          variant="outlined"
                          fullWidth
                        />
                      ) : (
                        row.original.current_status
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell style={{ padding: '9px',width: '12.5%' }}>
                    <Typography variant="body2">
                      <strong>Previous Status : </strong>{' '}
                      {isEdit ? (
                        <TextField
                          value={row.original.previous_status}
                          onChange={(e) => handleInputChange('previous_status', e.target.value)}
                          size="small"
                          variant="outlined"
                          fullWidth
                        />
                      ) : (
                        row.original.previous_status
                      )}
                    </Typography>
                  </TableCell>
               
                <TableCell style={{ padding: '9px',width: '12.5%' }}>
                    <Typography variant="body2">
                      <strong>Current Status Start Date : </strong>{' '}
                      {isEdit ? (
                        <TextField
                          type="date"
                          value={new Date(row.original.current_status_start_dt).toISOString().split('T')[0]}
                          onChange={(e) => handleInputChange('current_status_start_dt', e.target.value)}
                          size="small"
                          variant="outlined"
                          fullWidth
                        />
                      ) : (
                        new Date(row.original.current_status_start_dt).toLocaleDateString()
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell style={{ padding: '9px',width: '12.5%' }}>
                    <Typography variant="body2">
                      <strong>Previous Status Start Date : </strong>{' '}
                      {isEdit ? (
                        <TextField
                          type="date"
                          value={new Date(row.original.previous_status_start_dt).toISOString().split('T')[0]}
                          onChange={(e) => handleInputChange('previous_status_start_dt', e.target.value)}
                          size="small"
                          variant="outlined"
                          fullWidth
                        />
                      ) : (
                        new Date(row.original.previous_status_start_dt).toLocaleDateString()
                      )}
                    </Typography>
                  </TableCell>
               
                  <TableCell style={{ padding: '9px',width: '12.5%' }}>
                    <Typography variant="body2">
                      <strong>Is Changed : </strong>{' '}
                      {isEdit ? (
                        <Switch {...label} checked={row.original.is_changed ? true : false} />
                      ) : (

                        row.original.is_changed ? <CheckCircleIcon color='primary' /> : <CancelIcon  color='error' />
                      )}
                    </Typography>
                  </TableCell>
              
                  <TableCell>
                    <Typography variant="body2">
                    {isEdit ? <><Button onClick={onEditClick} variant="outlined">Cancel</Button> <Button variant="contained">Update</Button></>:
                        <IconButton size="small" onClick={onEditClick}><EditIcon fontSize="small" /></IconButton>}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </TableContainer>
  
  
            </Box>
          </CardContent>
        </Card> */}
      </Box>
    );
  };
  interface InActiveUsersProps {
    _data: any; // Replace `any` with the specific type if you know the structure of `_data`.
    handleOpenModal: (data: any,rows :any[]) => void; // Replace `any` with the specific type the callback expects.
  }
  const InActive_Users: React.FC<InActiveUsersProps> = ({ _data, handleOpenModal }) => {
    const filtereddata = useMemo(() => {
      if (_data && _data.length > 0) {
        return _data.filter(x => !x.is_active);
      }
      return [];
    }, [_data]);
    const Data = filtereddata;
    const [data, setData] = useState<Fut_Orders[]>([]);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [validationErrors, setValidationErrors] = useState< Record<string, string | undefined>>({});
    const [columnVisibility, setColumnVisibility] = useState({id: false,Instrumenttoken:false});
    const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
    const [selectedExpiry, setSelectedExpiry] = useState<any>(null);
    const [filteredData, setFilteredData] = useState<Fut_Orders[]>([]);
    // Example token
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
    const SuperUser = token && JSON.parse(token).user.is_superuser === true ? true : false;
    const Staff = token && JSON.parse(token).user.is_staff === true ? true : false;

    const headers = {
      Authorization: "Bearer "+accessToken,
    };
const availableStrategies = useMemo(() => {
              return [...new Set(Data.map((row) => row.strategy_name as string))]; // Ensure string type
            }, [Data]);
            
            const availableExpiries = useMemo(() => {
              if (!selectedStrategy) return [];
              return [...new Set(
                Data.filter((row) => row.strategy_name === selectedStrategy)
                    .map((row) => dayjs(row.expiry).format('MM-DD-YYYY') as string)
              )];
            }, [Data, selectedStrategy]);
            
            useEffect(() => {
              if (availableStrategies.length > 0 && !selectedStrategy) {
                setSelectedStrategy(availableStrategies[0]); // Set first strategy as default
              }
            }, [availableStrategies]);
            
            useEffect(() => {
              if (selectedStrategy && availableExpiries.length > 0) {
                setSelectedExpiry(availableExpiries[0]); // Set first strategy as default
              }
          }, [availableExpiries]);

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


    const handleSaveUser: MRT_TableOptions<Fut_Orders>['onEditingRowSave'] = async ({
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

    const handleDelete = async (row) => {
        const ids = row.original.id;
        try {
            const response = await axios.delete(`https://api.quantradeai.com/user/futOrders_delete`, {  data: { strategy_ids: ids },headers});
          if (response.status === 200) {
            await swal("Deleted!", "Order Deleted successfully!", "success");
          } else {
            await swal("Failed!", "Failed to delete orders!", "error");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          await swal("Failed!", "Failed to delete orders!", "error");
        }
      };
      const handleExportRows = (rows: MRT_Row<any>[]) => {
        // const rowData = rows.map((row) => {
        //   const flattenedRow = flattenRow(row.original);
        //   return flattenedRow;
        // });
        // const csv = generateCsv(csvConfig)(rowData);
        // download(csvConfig)(csv);
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
                  const tick = tickMap.get(String(row.analysis_order.instrument_token));
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
    const handleStrategyChange = (e) => {
      setSelectedStrategy(e.target.value as string); // Type cast to string
    };
    
    const handleExpiryChange = (e) => {
      setSelectedExpiry(e.target.value as string); // Type cast to string
    }
      useEffect(() => {
        const fetchData = async () => {
          if (Data && Data.length > 0) {
            setData(Data);
            let tokens = Data.map(x => x.analysis_order.instrument_token);
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
                             
                             for (const tokens of tokenChunks) {
                               try {
                                 const response = await axios.get('http://localhost:3004/api/getLiveData', {
                                   params: {
                                     api_key,
                                     access_token,
                                     tokens: tokens,
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
      const filtered = Data.filter((row) => {
                  const matchesStrategy = selectedStrategy ? row.strategy_name === selectedStrategy : true;
                 const matchesExpiry = selectedExpiry ? dayjs(row.expiry).format('MM-DD-YYYY') === selectedExpiry : true;
                  return matchesStrategy && matchesExpiry ;
                });
                setFilteredData(filtered);
                // Call the async function
                fetchData();
              }, [selectedStrategy, selectedExpiry]);
    const columns = useMemo<MRT_ColumnDef<Fut_Orders>[]>(
      () => [
        {
          accessorKey: 'id',
          header: 'Id',
          enableEditing: false,
          size: 80,
          enableHiding: false
        },
        {
          accessorFn: (row) => `${row?.analysis_order?.instrument_token}`,
          id:'Instrumenttoken',
          header: 'Instrument token',
          enableEditing: false,
          size: 80,
          enableHiding: false,
        },
        {
          accessorFn: (row) => `${row.name}`, //accessorFn used to join multiple data into a single cell
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
          accessorFn: (row) => `${row.symbol}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          header: 'Trading Symbol',
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
          accessorFn: (row) => `${row.option_side ?? ''}`, // Safely access orders[0] and option_side
          header: 'Option Side',
          size: 100,
          Cell: ({ renderedCellValue, row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => `${row.strike_price??"0"}`,
          header: 'Strike Price',
          size: 100,
          Cell: ({ renderedCellValue, row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => `${row.LTP}`, //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
          enableClickToCopy: true,
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
              {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
              <span>{renderedCellValue}</span>
            </Box>
          ),
        },
        {
          accessorFn: (row) => `${row.trigger}`,
          header: 'Trigger',
          size: 50,
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
          accessorFn: (row) => `${row.buy_sell}`,
          header: 'Buy Sell',
          size: 100,
          Cell: ({ row }) => (
            <>
             {row.original.buy_sell == "BUY" ? "BUY" : "SELL"}
            </>
          ),
        },

        // {
        //   accessorFn: (row) => `${row.strategy_name}`, //id is still required when using accessorFn instead of accessorKey
        //   header: 'Strategy Name',  
        //   size: 50,
        //   Cell: ({ renderedCellValue, row }) => (
        //     <Box
        //       sx={{
        //         display: 'flex',
        //         alignItems: 'center',
        //         gap: '1rem',
        //       }}
        //     >
        //       {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
        //       <span>{renderedCellValue}</span>
        //     </Box>
        //   ),
        // },
        {
            accessorFn: (row) => `${row.order_type}`, //id is still required when using accessorFn instead of accessorKey
            header: 'Order Type',  
            size: 50,
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
            accessorFn: (row) => `${row.expiry}`, //id is still required when using accessorFn instead of accessorKey
            header: 'Expiry Date',  
            size: 50,
            Cell: ({ row }) => (
              <>
               {row.original.expiry ? dayjs(row.original.expiry).format('MM-DD-YYYY') :""}
              </>
    
            ),
          },
          
          {
            accessorFn: (row) => `${row.triggered_at}`, //id is still required when using accessorFn instead of accessorKey
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
               {row.original.modified_at ? dayjs(row.original.modified_at).format('MM-DD-YYYY') :""}
              </>
    
            ),
          },
          
      ],
      [],
    );
    const table_is_superuser = useMaterialReactTable({
      columns,
      data:filteredData, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
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
        columnVisibility:{
          instrument_token:false
        }
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
          <IconButton color="error" onClick={() => handleDelete(row)} style={{padding: '0.30rem 0.3rem'}}>
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
          <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} variant="outlined"
            onClick={() => handleOpenModal(true,table.getSelectedRowModel().rows)}
          ><FileDownloadIcon /> &nbsp; Export</Button>
          <FormControl variant="outlined" style={{ marginRight: '16px', minWidth: 120 }}>
            <InputLabel>Strategy</InputLabel>
            <Select
              value={selectedStrategy || ''}
              onChange={(e) => handleStrategyChange(e)}
              label="Strategy"
            >
              {availableStrategies.map((strategy:any) => (
                <MenuItem key={strategy} value={strategy}>
                  {strategy}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" style={{ minWidth: 120 }}>
            <InputLabel>Expiry Date</InputLabel>
            <Select
              value={selectedExpiry || ''}
              onChange={(e) => handleExpiryChange(e)}
              label="Expiry Date"
            >
              {availableExpiries.map((expiry:any) => (
                <MenuItem key={expiry} value={expiry}>
                  {expiry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ),
      state: {
        isLoading: _data && _data.length > 0 ? false : true, // Set loading state for MaterialReactTable
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

    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [customerID, setCustomerID] = useState();
    const [selectDate, setSelectDate] = useState();
    // Example token
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";;

    const headers = {
      Authorization: "Bearer "+accessToken,
    };
    const headerElement = document.getElementById("headerTextUpdate");
    if (headerElement) {
      headerElement.innerHTML = "Future Orders";
    }
    useEffect(() => {
      if (!hasFetchedRef.current) {
        setLoading(true);
        hasFetchedRef.current = true;
  
        const fetchAllEquity_Orders = async () => {
          try {
            const response = await axios.get('https://api.quantradeai.com/strategy/orders/search/?paginate=false&?clear_cache=true',{headers});

            const sortedData = response.data.data.sort((a, b) => {
              const dateA = new Date(a.triggered_at);
              const dateB = new Date(b.triggered_at);
        
              // Sorting in descending order
              return dateB.getTime() - dateA.getTime();
            });
            document.getElementsByClassName("text-warning ms-2")[0].innerHTML = "";
            // Assuming the response structure contains `data`
            setEquity_Orders(response.data.data);
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
  const handleOpenModal=(data: any,rows :any[])=> {
    setSelectedRows(rows);
    setIsOpen(true);
  }
  const handleExportSubmit = () => {
   // e.preventDefault();
    handleCloseModal();
    handleExportRows();
  };
  const handleExportRows = () => {
    const rowData = selectedRows.map((row) => {
      row.original.customerID = customerID;
      row.original.selectDate = selectDate;
      const flattenedRow = flattenRow(row.original);
      return flattenedRow;
    });
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };
  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });
  const flattenRow = (row: Fut_Orders): Record<string, any> => {
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
  const handleInputChange = (event) => {
    setCustomerID(event.target.value); // Update state with the input value
  };
  const handleInputDateChange = (event) => {
    setSelectDate(event.target.value); // Update state with the input value
  };
    return (
      <>
        {loading ? (
          <p>Loading...</p> // Show loading text while data is being fetched
        ) : (
          <>
          <Box mb={2}>
            <InActive_Users _data={equity_orders} handleOpenModal={handleOpenModal} />
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
            <DialogTitle>
              {" "}
              <Typography variant="h5" gutterBottom>
              Export Data In CSV Format
              </Typography>
            </DialogTitle>
            <DialogContent>
            <Box p={3} maxWidth={700} mx="auto" display="flex" flexDirection="column" gap={3}>
              {/* Watch List Selector */}
            <Box sx={{ minWidth: 120 }}>
              {/* <InputLabel id="demo-simple-select-label">Customer Id</InputLabel> */}
                <FormControl fullWidth>
                 
                  <TextField id="outlined-basic" value={customerID} onChange={handleInputChange} fullWidth  label="Customer ID" variant="outlined" />

                </FormControl>
            </Box>
            <Box sx={{ minWidth: 120 }}>
                <FormControl style={{width: "100%"}}>
                  {/* <InputLabel id="demo-simple-select-label">Customer Id</InputLabel> */}
                  <TextField id="outlined-basic" type='date' 
                  value={selectDate} onChange={handleInputDateChange}
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
                  fullWidth  label="Select Date" />
                </FormControl>
              </Box>

              {/* Action Buttons */}
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => handleCloseModal()}>Cancel</Button>
                <Button variant="contained" onClick={()=>handleExportSubmit()}  style={{ padding: "10px 25px 10px 25px"}} color="success">Save</Button>
              </Box>
            </Box>
            </DialogContent>
            </Dialog>
            </>
         
        )}
      </>
    );
  };
  const queryClient = new QueryClient();

const OrdersFUT = () => {
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
export default OrdersFUT;

function swal(arg0: string, arg1: string, arg2: string) {
  throw new Error('Function not implemented.');
}
