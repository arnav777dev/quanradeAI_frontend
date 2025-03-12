import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { useMemo, useRef, useState } from 'react';
//MRT Imports
import { MaterialReactTable, MRT_ColumnDef, MRT_GlobalFilterTextField, MRT_TableOptions, MRT_Row, MRT_ToggleFiltersButton, useMaterialReactTable } from 'material-react-table';
//Material UI Imports
import { Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
//Date Picker Imports - these should just be in your Context Provider
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
import swal from 'sweetalert';
import { mkConfig, generateCsv, download } from 'export-to-csv'; //or use your library of choice here
const label = { inputProps: { 'aria-label': 'Switch demo' } };
interface Equity {
  id: string;
  symbol: string;
  ltp: number; // Correct the name to lowercase ltp
  instrument_token:number;
  version: string;
  trade_status: string;
  ath: number;
  ath_date: string;
  cc_date: string;
  entry_date: string;
  is_changed: boolean;
  entries: { trigger: number, quantity: number }[];
  status?: string; // If 'status' is optional
  trigger_price?: number; // If 'trigger_price' is optional
  qty_or_lot_size?: number; // If 'qty_or_lot_size' is optional
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
interface Order {
  instrument?: {
    exchange_token: string;
    trading_symbol: string;
  };
  order_type: string;
  trigger: string;
  quantity: number;
}

interface FlattenedRow {
  entries: Order[];
  stoplosses: Order[];
  targets: Order[];
}

type AcceptedData = Record<string, any>;
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
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2, margin: "0px 0px 0px 112px" }}>
      <Card sx={{ flex: 1, width: '50%' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Order Details
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
                  {userData.entries && userData.entries.length > 0 ?
                    userData.entries.map(x => {
                      return (
                        <TableRow >
                          <TableCell >{x.name}</TableCell>
                          <TableCell >{x.trigger}</TableCell>
                          <TableCell >{x.status == "active" ? "Active" : x.status}</TableCell>
                          <TableCell >{x.triggered_at ? dayjs(x.triggered_at).format('MM-DD-YYYY') : ""}</TableCell>
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
                          <TableCell >{x.status == "active" ? "Active" : x.status}</TableCell>
                          <TableCell >{x.triggered_at ? dayjs(x.triggered_at).format('MM-DD-YYYY') : ""}</TableCell>
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
                          <TableCell >{x.status == "active" ? "Active" : x.status}</TableCell>
                          <TableCell >{x.triggered_at ? dayjs(x.triggered_at).format('MM-DD-YYYY') : ""}</TableCell>
                        </TableRow>
                      )
                    })
                    : ""
                  }
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
  const Data = useMemo(() => _data.data.filter(x => !x.is_active), [_data])
  const [data, setData] = useState<Equity[]>([]);
  const watchList = _data.Watchlist;
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [validationErrors, setValidationErrors] = useState< Record<string, string | undefined>>({});
  const [columnVisibility, setColumnVisibility] = useState({id: false,Instrumenttoken:false});
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValuesWL, setSelectedValuesWL] = useState<string[]>([]);
  const token = localStorage.getItem("userDetails") || '';
  const accessToken = token ? JSON.parse(token).access : "";
  const SuperUser = token && JSON.parse(token).user.is_superuser === true ? true : false;
    const Staff = token && JSON.parse(token).user.is_staff === true ? true : false;
  const [open, setOpen] = useState(false);
  const [customerID, setCustomerID] = useState("");
  const [gtdDate, setGtdDate] = useState("");
  const headers = {
    Authorization: "Bearer "+ accessToken,
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
    setEditingRowId(null);
    setEditedRow({});
  };


  const handleSaveUser: MRT_TableOptions<Equity>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const requestBody = [{
      symbol:values.symbol,
      LTP: +values.LTP,
      version:values["version"],
      trade_status:values["trade_status"],
      ath:values["ath"],
      ath_date:values["ath_date"],
      cc_date:values["cc_date"],
      entry_date:values["entry_date"],
      is_changed:values["Is Changed"] ? true : false,
    }]
    try {
      await axios.patch('http://localhost/:4001/api/equity/details',requestBody,{headers})  
      .then(response => {
        console.log('Response:', response.data);
        swal("Inserted!", "Equity details inserted successfully!", "success");
       })
      .catch(error => {
          console.error('Error:', error.response ? error.response.data : error.message);
      });
    } catch (error) {
      console.error("Error patching data:", error);
    }
    setValidationErrors({});
    table.setEditingRow(null); 
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
                        return { ...row, ltp: tick.last_price };
                      }
                      return row;
                    });
                    return updatedData;
                  });
                }
              }
             
              ws.onclose = () => {
               console.log('Disconnected from WebSocket server');
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
                tokens = [...new Set(tokens)];
                
                console.log("tokens", tokens);
                
                const userDetails = localStorage.getItem("userDetails") 
                ? JSON.parse(localStorage.getItem("userDetails") || "") 
                : {};
                const { access_token, api_key } = userDetails?.user?.kite || {};
                if (tokens.length > 0 && access_token && api_key) {
                  const chunkSize = 500;
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
  const columns = useMemo<MRT_ColumnDef<Equity>[]>(() => [
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
        enableHiding: false
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
            <span>{renderedCellValue}</span>
          </Box>
        ),
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
        enableClickToCopy: true,
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
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorFn: (row) => `${row.trade_status}`,
        header: 'Trade Status',
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
        accessorFn: (row) => `${row.ath}`, //hey a simple column for once
        header: 'ATH',
        size: 50,
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
        accessorFn: (row) => `${row.ath_date}`,
        header: 'ATH Date',
        size: 50,
        Cell: ({ row }) => (
          <>
           {row.original.ath_date ? dayjs(row.original.ath_date).format('MM-DD-YYYY') :""}
          </>

        ),
      },
      {
        accessorFn: (row) => `${row.cc_date}`, //id is still required when using accessorFn instead of accessorKey
        header: 'CC Date',  
        size: 50,
        Cell: ({ row }) => (
          <>
           {row.original.cc_date ? dayjs(row.original.cc_date).format('MM-DD-YYYY') :""}
          </>

        ),
      },
      {
          accessorFn: (row) => `${row.entry_date}`, //id is still required when using accessorFn instead of accessorKey
          header: 'Entry Date',  
          size: 50,
          Cell: ({ row }) => (
            <>
             {row.original.entry_date ?  dayjs(row.original.entry_date).format('MM-DD-YYYY') :""}
            </>
  
          ),
        },
    ],
    [],
  );
  const flattenRow = (row: Equity): Record<string, any> => {
    const flattened: Record<string, any> = {};
  
    Object.keys(row).forEach((key) => {
      if (key !== 'id' && key !== 'instruments') {
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
  
  const handleExportRows = (rows: MRT_Row<Equity>[], customerID: string, gtdDate: string) => {
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
        if (!order || !order.instrument) {
          return null;
        }
  
        return {
          Exchange: "NSE",
          ScripCode: order.instrument.exchange_token || "",
          ScripName: order.instrument.trading_symbol || "",
          OrderPrice: order.order_type === "entry"? addPercentAmount(order.trigger):order.order_type === "target"? "" : addPercentAmountSell(order.trigger),
          TriggerPrice: order.order_type === "entry"||order.order_type === "target" ? parseFloat(order.trigger).toFixed(2) : parseFloat(order.trigger),
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
        const entries = flattenedRow.entries || [];
        const stoplosses = flattenedRow.stoplosses || [];
        const targets = flattenedRow.targets || [];
  
        const combinedOrders = [...entries, ...stoplosses, ...targets];
  
        combinedOrders.forEach((order) => {
          if (order) {
            // Sort orders based on order_type
            if (order.order_type === "entry") {
              entryRows.push(order);
            } else if (order.order_type === "target") {
              targetRows.push(order);
            } else if (order.order_type === "sl") {
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
        equity_orders:row.id,
        instrument_token:row.instrument_token?row.instrument_token:null,
        symbol: row.symbol,  // Assuming 'symbol' is the correct key from your row
        trading_symbol: row.symbol || "", // Assuming 'trading_symbol' exists
        version: row.version || "", // Assuming 'version' exists
        status: row.status || "", // Assuming 'status' exists
        trigger_price: row.entries && row.entries.length > 0 ? +row.entries[0].trigger : 0, // Safe check for 'entries'
        LTP: row.ltp || 0, // Assuming 'LTP' exists
        qty_or_lot_size: row.entries && row.entries.length > 0 ? +row.entries[0].quantity : 0 // Safe check for 'entries'
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
        swal("Success", "Order Added Successfully in WatchList!", "success");
      })
      .catch((error) => {
        console.error("Error:", error);
        swal("Error", "There was an error while adding the orders in watchList.", "error");
      });
     
        handleCloseModal();
      
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    if (customerID  && gtdDate) {
      const rows = table_is_superuser.getSelectedRowModel().rows;
      handleExportRows(rows, customerID, gtdDate);
      setOpen(false); // Close modal after export
    } else {
      alert("Please fill in both Customer ID and GTD Date.");
    }
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
        <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} variant="outlined" onClick={handleOpenModal}  ><AddIcon />&nbsp; Add to Watchlist </Button>
        <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
         onClick={handleClickOpen}
        variant="outlined"><FileDownloadIcon /> &nbsp; Export</Button>
      </Box>
    ),
    state: {
      isLoading: data && data.length > 0 ? false : true , // Set loading state for MaterialReactTable
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
  );
};
const App = () => {
  const [equity, setEquity] = useState([]); // State for storing user data
  const [loading, setLoading] = useState(true); // State to track loading status
  const hasFetchedRef = useRef(false); // Ref to ensure data is fetched once
  const [watchList, setWatchList] = useState([]);
  // Example token
  const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
  const accessToken = token ? JSON.parse(token).access : "";;

  const headers = {
    Authorization: "Bearer "+ accessToken,
  };
  const headerElement = document.getElementById("headerTextUpdate");
  if (headerElement) {
    headerElement.innerHTML = "Equity Analysis";
  }

  useEffect(() => {
    if (!hasFetchedRef.current) {
      setLoading(true);
      hasFetchedRef.current = true;

      const fetchAllUsers = async () => {
        try {
          const response = await axios.get('https://api.quantradeai.com/strategy/bt/equity/search/?paginate=false&clear_cache=false',{headers});

          const sortedData = response.data.data.sort((a, b) => {
            const dateA = new Date(a.cc_date);
            const dateB = new Date(b.cc_date);
      
            // Sorting in descending order
            return dateB.getTime() - dateA.getTime();
          });
          const latestDate = sortedData.reduce((maxDate, user) => {
            const currentDate = new Date(user.last_run_dt);
            return currentDate > maxDate ? currentDate : maxDate;
          }, new Date(0));
          document.getElementsByClassName("text-warning ms-2")[0].innerHTML = "Last Update : "+latestDate.toString().split('GMT')[0].trim();
          // Assuming the response structure contains `data`
          setEquity(sortedData);
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

      fetchAllUsers();
      fetchAllWatchlist();
      // Cleanup function to cancel request if the component unmounts
      return () => {
        console.log('Performing cleanup operations...');
      };
    }
  }, []); 
  return (
    <>
      {loading ? (
        <p>Loading...</p> // Show loading text while data is being fetched
      ) : (
        <>
        <Box mb={2}>
          <InActive_Users data={equity} Watchlist={watchList} loading={loading} />
        </Box>
       
          </>
       
      )}
    </>
  );
};
const queryClient = new QueryClient();

const Equity = () => {
  // const { changeBackground } = useContext(ThemeContext);
  // useEffect(() => {
  // 	changeBackground({ value: "dark", label: "Dark" });
  // }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>

  )
}
export default Equity;
