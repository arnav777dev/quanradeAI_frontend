import React, { useContext, useEffect } from 'react';
import {  useMemo, useRef, useState } from 'react';
//MRT Imports
import { MaterialReactTable, MRT_ColumnDef, MRT_GlobalFilterTextField, MRT_Row, MRT_TableOptions, MRT_ToggleFiltersButton, useMaterialReactTable } from 'material-react-table';
//Material UI Imports
import { Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, Table,TableHead, TableBody, TableCell, TableContainer, TableRow, TextField, Tooltip, Typography, DialogActions } from '@mui/material';
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
  id : string;
  name: string;
  symbol: string;
  strike_price:string;
  instrument_token:number;
  lot_size:string;
  direction:string;
  current_status;
  version: string;
  status?: string;
  orders: { option_side: string;
    order_type: string;
    is_triggered: "true" | "false";
    triggered_at: string;
    lot_size:number;
    trigger:number;
  }[];
  LTP: string;
  buy_sell: any;
  strategy_name: string;
  expiry: string;
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

  const UserDetailPanel = ({ row }) => {
    const [userData, setUserData] = useState(row.original);
    const [isEdit, setIsEdit] = useState(false);
  
    const handleInputChange = (field, value) => {
      setUserData((prevData: any) => ({
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
        <Card sx={{ flex: 1, width: '50%' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            F&O Order Details
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order Type</TableCell>
                    <TableCell>Trigger Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Trigger Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userData.orders && userData.orders.length > 0 ?
                    userData.orders.map(x => {
                      return (
                        <TableRow >
                          <TableCell >{x.order_type}</TableCell>
                          <TableCell >{x.trigger}</TableCell>
                          {/* <TableCell >{x.quantity}</TableCell> */}
                          <TableCell >{x.status == "active" ? "Active" : x.status}</TableCell>
                          <TableCell >{x.triggered_at}</TableCell>
                        </TableRow>
                      )
                    })
                    : ""
                  }
                  {userData.targets && userData.targets.length > 0 ?
                    userData.targets.map(x => {
                      return (
                        <TableRow >
                          <TableCell >{x.name}</TableCell>
                          <TableCell >{x.trigger}</TableCell>
                          {/* <TableCell >{x.quantity}</TableCell> */}
                          <TableCell >{x.status == "active" ? "Active" : x.status}</TableCell>
                          <TableCell >{x.triggered_at}</TableCell>
                        </TableRow>
                      )
                    })
                    : ""
                  }
                  {userData.stoplosses && userData.stoplosses.length > 0 ?
                    userData.stoplosses.map(x => {
                      return (
                        <TableRow >
                          <TableCell >{x.name}</TableCell>
                          <TableCell >{x.trigger}</TableCell>
                          {/* <TableCell >{x.quantity}</TableCell> */}
                          <TableCell >{x.status == "active" ? "Active" : x.status}</TableCell>
                          <TableCell >{x.triggered_at}</TableCell>
                        </TableRow>
                      )
                    })
                    : ""
                  }
                  {/* <TableRow>
                                <TableCell>
                                  <Typography variant="body2">
                                  <Button variant="contained">Place Orders</Button>
                                  </Typography>
                                </TableCell>
                              </TableRow> */}
                </TableBody>
              </Table>

            </Grid>
          </Box>
        </CardContent>
      </Card>
      </Box>
    );
  };
   const InActive_Users = (_data) => {
    const Data = useMemo(() => _data.data, [_data])
    const [data, setData] = useState<Fut_Orders[]>([]);
    const watchList = _data.Watchlist;
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [validationErrors, setValidationErrors] = useState< Record<string, string | undefined>>({});
    const [columnVisibility, setColumnVisibility] = useState({id: false,Instrumenttoken:false});
     const [open, setOpen] = useState(false);
     const [customerID, setCustomerID] = useState("");
      const [gtdDate, setGtdDate] = useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValuesWL, setSelectedValuesWL] = useState<string[]>([]);
    // Example token
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";
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
      const handleClickOpen = () => {
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
      };
      const handleConfirm = () => {
          if (customerID > "0" && gtdDate) {
            const rows = table_is_superuser.getSelectedRowModel().rows;
            handleExportRows(rows, customerID, gtdDate);
            setOpen(false); // Close modal after export
          } else {
            alert("Please fill in both Customer ID and GTD Date.");
          }
        };
       const flattenRow = (row: Fut_Orders): Record<string, any> => {
           const flattened: Record<string, any> = {};
         
           Object.keys(row).forEach((key) => {
             if (key !== 'id' && key !== 'instrument_token') {
               const value = row[key];
               if (typeof value === 'object' && value !== null) {
                 // If it's an object or array, convert it to a string using JSON.stringify
                 flattened[key] = value;
               } else {
                 flattened[key] = value;
               }
             }
           });
         
           return flattened;
         };
         
         function roundToNearestFiveCents(amount: number): number {
           return Math.round(amount * 20) / 20;
         }
         
         function addPercentAmount(amount: number): string {
           amount = parseFloat(amount.toString());
           const fivePercent = amount * 0.02;
           const total = amount + fivePercent;
           return roundToNearestFiveCents(total).toFixed(2); // Round to nearest 0.05
         }
         
         function addPercentAmountSell(amount: number): string {
           amount = parseFloat(amount.toString());
           const fivePercent = amount * 0.02;
           const total = amount - fivePercent;
           return roundToNearestFiveCents(total).toFixed(2); // Round to nearest 0.05
         }
         
         const handleExportRows = (rows: MRT_Row<Fut_Orders>[], customerID: string, gtdDate: string) => {
           const formatGTDDate = (dateStr: string): string => {
             const date = new Date(dateStr);
             const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
             const day = String(date.getDate()).padStart(2, '0');
             const year = date.getFullYear();
             return `${month}/${day}/${year}`;
           };
         
           const formattedGTDDate = formatGTDDate(gtdDate);
         
           // Helper function to handle the order creation
           const generateOrderData = (orders: any[]) => {
             return orders.map((order) => {
               if (!order || !order.instruments) {
                 return null;
               }
         
               return {
                 Exchange: "NSE",
                 ScripCode: order.instruments.exchange_token || "",
                 ScripName: order.instruments.trading_symbol || "",
                 OrderPrice: order.order_type === "entry"? addPercentAmount(order.trigger):order.order_type.includes("target_")? "" : addPercentAmountSell(order.trigger),
                 TriggerPrice: order.order_type === "entry"||order.order_type.includes("target_")? parseFloat(order.trigger).toFixed(2) : parseFloat(order.trigger),
                 OrderQty: order.quantity || 0,
                 DisclosedQty: 0,
                 BuySell: order.order_type === "entry" ? "BUY" : "SELL",
                 OrderType: "NEW",
                 RMS: "",
                 PriceType: "LIMIT",
                 CustomerID: customerID,
                 S2KID: customerID,
                 OrderID: 0,
                 ExecQty: 0,
                 ExecPrice: 0,
                 OrderValidity: "MyGTD",
                 GTDDate: formattedGTDDate,
               };
             }).filter((item) => item !== null);
           };
         
           // Split rows based on order type
           const entryRows: any[] = [];
           const targetRows: any[] = [];
           const slRows: any[] = [];
         
           rows.forEach((row) => {
             const flattenedRow = flattenRow(row.original);
         
             if (flattenedRow) {
              // const entries = flattenedRow.orders?.order_type === 'entry' ? [flattenedRow.orders] : [];
              // const stoplosses = flattenedRow.orders?.order_type === 'stop_loss' ? [flattenedRow.orders] : [];
              // const targets = flattenedRow.orders?.order_type?.includes("target_") ? [flattenedRow.orders] : [];
              // const combinedOrders = [...entries, ...stoplosses, ...targets];
         
              flattenedRow.orders.forEach((order) => {
                 if (order) {
                   // Sort orders based on order_type
                   if (order.order_type === "entry") {
                     entryRows.push(order);
                   } else if (order.order_type?.includes("target_")) {
                     targetRows.push(order);
                   } else if (order.order_type === "stop_loss") {
                     slRows.push(order);
                   }
                 }
               });
             }
           });
         
           const entryData = generateOrderData(entryRows);
           const targetData = generateOrderData(targetRows);
           const slData = generateOrderData(slRows);
         
           const generateAndDownloadCSV = (data: any[], fileName: string) => {
             const csvConfig = mkConfig({
               fieldSeparator: ',',
               decimalSeparator: '.',
               useKeysAsHeaders: true,
               filename:fileName,
             });
             const csv = generateCsv(csvConfig)(data);
             download(csvConfig)(csv); // Pass the filename explicitly
           };
           if (entryData.length > 0) {
             generateAndDownloadCSV(entryData, 'entry_orders');
           }
           if (targetData.length > 0) {
             generateAndDownloadCSV(targetData, 'target_orders');
           }
           if (slData.length > 0) {
             generateAndDownloadCSV(slData, 'stoploss_orders');
           }
         };
         const handleCloseModal=()=> {
          setIsOpen(false);
        }
        const handleOpenModal=()=> {
          setIsOpen(true);
        }
        const handleChange = (e: any) => {
          const wl = Array.isArray(watchList) ? watchList : [];  // Ensure watchList is an array
          setSelectedValuesWL(e.target.value);
        };
        const handleSubmit = () => {
          const selectedRows = table_is_superuser.getSelectedRowModel().rows.map((row) => row.original);
          const items = selectedRows.map((row) => {
            // Fix: Make sure entries is properly checked if it exists
            return {
              symbol: row.symbol,  // Assuming 'symbol' is the correct key from your row
              trading_symbol: row.symbol || "", // Assuming 'trading_symbol' exists
              version: row.version || "", // Assuming 'version' exists
              status: row.status || "", // Assuming 'status' exists
              trigger_price: row.orders? +row.orders[0].trigger : 0, // Safe check for 'entries'
              LTP: row.LTP || 0, // Assuming 'LTP' exists
              qty_or_lot_size: row.orders? +row.orders[0].lot_size : 0 // Safe check for 'entries'
            };
          });
      
          const watchlist_request = {
            watchlist_number: selectedValuesWL, // Assuming this is selected from somewhere
            watchlist_name: watchList.filter((x: any) => x.watchlist_number == selectedValuesWL)[0].watchlist_name, // Fetches watchlist name based on the selected number
            items: items
          };
      
          axios.post("https://api.quantradeai.com/main/watchlist/", watchlist_request, {
            headers: headers
          })
            .then((response) => {
              console.log("Response from API: ", response.data);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
           
              handleCloseModal();
            
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
              let tokens = [...new Set(Data.map(x => x.instrument_token))];
              console.log("tokens", tokens);
              
              // const userDetails = localStorage.getItem("userDetails") 
              //   ? JSON.parse(localStorage.getItem("userDetails") || "") 
              //   : {};
                // const { access_token, api_key } = userDetails?.user?.kite || {};
              // Check if user details and tokens are available before making the API call
              // if (tokens.length > 0 && access_token && api_key) {
              //   // Make the API request
              //   try {
              //     const response = await axios.get('http://localhost:3004/api/getLiveData', {
              //       params: {
              //         api_key,
              //         access_token,
              //         tokens: tokens,// Ensure tokens are passed as a comma-separated string
              //       }
              //     });
        
              //     console.log('API Response:', response.data);
              //     // Handle the response here
              //   } catch (error) {
              //     console.error('Error fetching live spread:', error);
              //     // Handle the error here
              //   }
              // } else {
              //   console.error('Missing user details or tokens');
              // }
            }
          };
        
          // Call the async function
          fetchData();
        }, [Data]);
        const columns = useMemo<MRT_ColumnDef<Fut_Orders>[]>(() => [
          {
            accessorKey: 'id',
            header: 'Id',
            enableEditing: false,
            size: 80,
            enableHiding: false,
          },
          {
            accessorFn: (row) => `${row.instrument_token}`,
            id:'Instrumenttoken',
            header: 'Instrument token',
            enableEditing: false,
            size: 80,
            enableHiding: false,
          },
          {
            accessorFn: (row) => `${row.name}`,
            id: 'name',
            header: 'Name',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.symbol}`,
            header: 'Trading Symbol',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.orders?.[0]?.option_side ?? ''}`, // Safely access orders[0] and option_side
            header: 'Option Side',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.strike_price}`,
            header: 'Strike Price',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.expiry}`,
            header: 'Expiry Date',
            size: 50,
            Cell: ({ row }) => (
              <>
                {row.original.expiry
                  ? dayjs(row.original.expiry).format('MM-DD-YYYY')
                  : dayjs(new Date()).format('MM-DD-YYYY')}
              </>
            ),
          },
          {
            accessorFn: (row) => `${row.buy_sell}`,
            header: 'Buy Sell',
            size: 100,
            Cell: ({ row }) => (
              <>
                {row.original.buy_sell === 'BUY' ? 'BUY' : 'SELL'}
              </>
            ),
          },
          {
            accessorFn: (row) => `${row.LTP}`,
            enableClickToCopy: true,
            header: 'LTP',
            size: 100,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.orders?.[0]?.trigger ?? ''}`,
            header: 'Trigger',
            size: 50,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.strategy_name}`,
            header: 'Strategy Name',
            size: 50,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.orders?.[0]?.order_type ?? ''}`, // Safely access orders[0] and order_type
            header: 'Order Type',
            size: 50,
            Cell: ({ renderedCellValue, row }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.orders?.[0]?.is_triggered ?? ''}`, // Safely access orders[0] and is_triggered
            header: 'Modified Date',
            size: 50,
            Cell: ({ row }) => (
              <>
                {row.original.orders?.[0]?.is_triggered === 'true' ? (
                  <CheckCircleIcon />
                ) : (
                  <CancelIcon color='error' />
                )}
              </>
            ),
          },
          {
            accessorFn: (row) => `${row.orders?.[0]?.triggered_at ?? ''}`, // Safely access orders[0] and triggered_at
            header: 'Triggered Date',
            size: 50,
            Cell: ({ row }) => (
              <>
                {row.original.orders?.[0]?.triggered_at
                  ? dayjs(row.original.orders[0].triggered_at).format('MM-DD-YYYY')
                  : dayjs(new Date()).format('MM-DD-YYYY')}
              </>
            ),
          },
        ], []);
        
    const table_is_superuser = useMaterialReactTable({
      columns,
      data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      enableColumnFilterModes: true,
      createDisplayMode: 'row', // ('modal', and 'custom' are also available)
      editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
      getRowId: (row) => row.id,
      enableRowSelection: true,
      enableEditing: true,
      muiToolbarAlertBannerProps: false
  ? {
      color: 'error',
      children: 'Error loading data',
    }
  : undefined,
muiTableContainerProps: {
  sx: {
    minHeight: '500px', // Ensure a minimum height for the table container
    maxHeight: '400px', // Max height for vertical scrolling
    overflowY: 'auto',  // Enable vertical scrolling
    overflowX: 'auto',  // Enable horizontal scrolling
    width: '100%',      // Ensure the container takes up the full available width
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
          Instrumenttoken :false
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
      renderDetailPanel: ({ row }) => {
        return <UserDetailPanel row={row} />;
      },
       renderTopToolbarCustomActions: ({ table }) => (
         <Box sx={{display: 'flex',gap: '16px',padding: '8px',flexWrap: 'wrap'}} >
           <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} variant="outlined" onClick={handleOpenModal}  ><AddIcon />&nbsp; Add to Watchlist </Button>
           <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onClick={handleClickOpen}
           variant="outlined"><FileDownloadIcon /> &nbsp; Export</Button>
         </Box>
       ),
       state: {
        isLoading: data && data.length >= 0 ? false : true,  // Set loading state for MaterialReactTable
         columnVisibility
     },
    });
    return (
      <>
    <MaterialReactTable table={table_is_superuser} />
    <Dialog open={open} onClose={handleClose}>
  <DialogTitle>Enter CustomerID and GTD Date</DialogTitle>
  <DialogContent>
    <TextField
      label="Customer ID"
      type="text"
      value={customerID}
      onChange={(e) => setCustomerID(e.target.value)}
      fullWidth
      required
      InputProps={{
        inputMode: 'numeric', // Helps on mobile devices for numeric input
      }}
      helperText={customerID || customerID <= "0" ? "Please enter a valid Customer ID" : ""}
    />
    <TextField
      label="GTD Date"
      type="date"
      value={gtdDate}
      onChange={(e) => setGtdDate(e.target.value)}
      fullWidth
      required
      error={!gtdDate}
      helperText={!gtdDate ? "Please enter a valid GTD Date" : ""}
      InputLabelProps={{
        shrink: true, // Ensure the label is always visible
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose} color="secondary">Cancel</Button>
    <Button
      onClick={handleConfirm}
      color="primary"
      disabled={customerID <= "0" || !gtdDate} // Disable Export button if invalid inputs
    >
      Export
    </Button>
  </DialogActions>
</Dialog>
      <Dialog
        open={isOpen}
        onClose={handleCloseModal}
        PaperProps={{
          component: "form",
          style: {
            width: '500px',
            maxWidth: '100%',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" gutterBottom>
            Add to Watchlist
            <CancelIcon onClick={handleCloseModal} style={{ margin: "0px 0px 0px 250px", cursor: "pointer" }} />
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box p={3} maxWidth={700} mx="auto" display="flex" flexDirection="column" gap={3}>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Select Watch List</InputLabel>
                <Select
                  labelId="demo-multiple-name-label"
                  label="Select Watch List"
                  value={selectedValuesWL}
                  onChange={handleChange}
                >
                  {(Array.isArray(watchList) ? watchList : []).map((name: any) => (  // Check if watchList is an array
          <MenuItem key={name.watchlist_number} value={name.watchlist_number}>
            {name.watchlist_name}
          </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit} color="success">Add</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
            </>
    )
  };
  // Main application component
  const App = () => {
    const [equity_orders, setEquity_Orders] = useState([]); // State for storing user data
    const [loading, setLoading] = useState(true); // State to track loading status
    const hasFetchedRef = useRef(false); // Ref to ensure data is fetched once
    
    const [watchList, setWatchList] = useState([]); // State for storing user data

    // Example token
    const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
    const accessToken = token ? JSON.parse(token).access : "";;

    const headers = {
      Authorization: "Bearer "+accessToken,
    };
    const headerElement = document.getElementById("headerTextUpdate");
    if (headerElement) {
      headerElement.innerHTML = "F&O";
    }
    
    useEffect(() => {
      if (!hasFetchedRef.current) {
        setLoading(true);
        hasFetchedRef.current = true;
  
        const fetchAllEquity_Orders = async () => {
          try {
            const response = await axios.get('https://api.quantradeai.com/strategy/fno/analysis/orders/?paginate=false&?clear_cache=false',{headers});

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
  
  
    return (
      <>
        {loading ? (
          <p>Loading...</p> // Show loading text while data is being fetched
        ) : (
          <>
          <Box mb={2}>
            <InActive_Users data={equity_orders} Watchlist={watchList} loading={loading} />
          </Box>
            </>
         
        )}
      </>
    );
  };
  const queryClient = new QueryClient();

const FuturesOptions = ({}) => {
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
export default FuturesOptions;

function swal(arg0: string, arg1: string, arg2: string) {
  throw new Error('Function not implemented.');
}
